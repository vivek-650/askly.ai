import fs from "fs";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

// Single shared collection name for all users
const SHARED_COLLECTION_NAME = "askly-documents";

/**
 * Process and index a PDF file into Qdrant with user isolation
 * @param {string} filePath - Path to the uploaded PDF file
 * @param {string} fileName - Name of the file for collection naming
 * @param {string} userId - User ID for document isolation
 */
export async function indexPDFDocument(filePath, fileName, userId) {
  try {
    // 1. Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    const rawText = data.text;

    if (!rawText || rawText.trim().length < 50) {
      throw new Error("No meaningful text found in the PDF.");
    }

    // 2. Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([rawText]);

    // Generate unique document ID
    const documentId = `${userId}-${Date.now()}-${fileName.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}`;

    // Add metadata to each chunk with user isolation
    chunks.forEach((chunk, index) => {
      chunk.metadata = {
        userId, // For filtering by user
        documentId, // Unique document identifier
        fileName,
        chunkIndex: index,
        source: "pdf",
        uploadedAt: new Date().toISOString(),
      };
    });

    // 3. Generate embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 4. Store in shared Qdrant collection with user metadata
    await QdrantVectorStore.fromDocuments(chunks, embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName: SHARED_COLLECTION_NAME,
    });

    // 5. Clean up uploaded file
    fs.unlinkSync(filePath);

    return {
      success: true,
      message: "PDF indexed successfully",
      documentId,
      collectionName: SHARED_COLLECTION_NAME,
      chunks: chunks.length,
    };
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

/**
 * Index raw text context with user isolation
 */
export async function indexTextContext(text, textName, userId) {
  if (!text || !textName) {
    throw new Error("Both text and textName are required.");
  }

  // 1. Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.createDocuments([text]);

  // Generate unique document ID
  const documentId = `${userId}-${Date.now()}-${textName.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  )}`;

  // Add metadata with user isolation
  chunks.forEach((chunk, index) => {
    chunk.metadata = {
      userId, // For filtering by user
      documentId, // Unique document identifier
      textName,
      chunkIndex: index,
      source: "text",
      uploadedAt: new Date().toISOString(),
    };
  });

  // 2. Generate embeddings
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 3. Store in shared Qdrant collection
  await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: SHARED_COLLECTION_NAME,
  });

  return {
    success: true,
    message: "Text indexed successfully",
    documentId,
    collectionName: SHARED_COLLECTION_NAME,
    chunks: chunks.length,
  };
}
