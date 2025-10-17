import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync, readdir } from "fs";
import pdfService from "@/lib/services/pdfService";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const documentId = `doc_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const documentName = file.name;

    // Save PDF to uploads folder
    const uploadsDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    const filePath = join(uploadsDir, `${documentId}.pdf`);
    await writeFile(filePath, buffer);

    console.log("🔄 Extracting text from PDF...");
    const docs = await pdfService.extractText(buffer, documentName);

    // Add metadata to each document at the top level for Qdrant
    const docsWithMetadata = docs.map((doc, index) => ({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        // Add at metadata level for proper filtering
        documentId,
        documentName,
        userId: "default",
        uploadedAt: new Date().toISOString(),
        chunkIndex: index,
      },
    }));

    console.log(
      `🔄 Indexing ${docsWithMetadata.length} pages to vector database...`
    );
    console.log(
      "📝 Sample metadata:",
      JSON.stringify(docsWithMetadata[0].metadata, null, 2)
    );

    // Initialize embeddings (using text-embedding-3-large = 3072 dimensions)
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    // Check if collection exists, if not, create it with first document batch
    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    let collectionExists = false;
    try {
      await qdrantClient.getCollection("pdf_documents");
      collectionExists = true;
    } catch (error) {
      console.log("📝 Collection doesn't exist, will be created automatically");
    }

    if (collectionExists) {
      // Collection exists, use fromExistingCollection and add documents
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          collectionName: "pdf_documents",
        }
      );

      // Add documents to existing collection
      await vectorStore.addDocuments(docsWithMetadata);
    } else {
      // Collection doesn't exist, create it with fromDocuments
      await QdrantVectorStore.fromDocuments(docsWithMetadata, embeddings, {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName: "pdf_documents",
      });
    }

    console.log("✅ Indexing of document completed");

    return NextResponse.json({
      success: true,
      documentId,
      documentName,
      numPages: docs.length,
      message: "PDF processed and indexed successfully",
    });
  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";

    // Query Qdrant to get unique documents by their metadata
    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    try {
      // Scroll through all points to get unique documents
      const scrollResult = await qdrantClient.scroll("pdf_documents", {
        limit: 100,
        with_payload: true,
        with_vector: false,
      });

      // Extract unique documents from points
      const documentsMap = new Map();

      if (scrollResult.points) {
        scrollResult.points.forEach((point) => {
          const payload = point.payload;

          // LangChain stores metadata in payload.metadata
          const metadata = payload.metadata || payload;

          // Try to get documentId from either location
          const docId = metadata.documentId || payload.documentId;
          const docName = metadata.documentName || payload.documentName;
          const uploadDate = metadata.uploadedAt || payload.uploadedAt;

          if (docId && !documentsMap.has(docId)) {
            // Count total pages for this document
            const docPages = scrollResult.points.filter(
              (p) =>
                (p.payload.metadata?.documentId || p.payload.documentId) ===
                docId
            ).length;

            documentsMap.set(docId, {
              documentId: docId,
              documentName: docName || "Unknown Document",
              uploadedAt: uploadDate || new Date().toISOString(),
              numPages: docPages,
            });
          }
        });

        // Debug: Log first point structure
        if (scrollResult.points.length > 0) {
          console.log(
            "🔍 Sample point structure:",
            JSON.stringify(scrollResult.points[0].payload, null, 2)
          );
        }
      }

      const documents = Array.from(documentsMap.values());

      console.log(`📚 Found ${documents.length} unique documents in Qdrant`);

      return NextResponse.json({
        success: true,
        documents,
      });
    } catch (qdrantError) {
      // Collection might not exist yet
      console.log("Collection not found or empty:", qdrantError.message);
      return NextResponse.json({
        success: true,
        documents: [],
      });
    }
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Delete file from uploads directory
    const uploadsDir = join(process.cwd(), "uploads");
    const filePath = join(uploadsDir, `${documentId}.pdf`);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete from Qdrant (optional - vectors will remain but won't match any file)
    try {
      const client = new QdrantClient({
        url: process.env.QDRANT_URL || "http://localhost:6333",
      });

      await client.delete("pdf_documents", {
        filter: {
          must: [
            {
              key: "documentId",
              match: { value: documentId },
            },
          ],
        },
      });
    } catch (qdrantError) {
      console.warn("Could not delete from Qdrant:", qdrantError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
