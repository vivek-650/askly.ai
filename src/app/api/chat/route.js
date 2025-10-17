import { NextResponse } from "next/server";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const { query, documentId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log("🔍 Searching for relevant information...");
    console.log("📄 Document ID:", documentId || "All documents");
    console.log("❓ Query:", query);

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    // Connect to Qdrant vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName: "pdf_documents",
      }
    );

    // Create retriever with filter if documentId is provided
    const retrieverConfig = {
      k: 6, // Increased from 4 to get more context
      // Add filter to search only in specific document(s)
      ...(documentId && {
        filter: {
          must: [
            {
              key: "metadata.documentId", // Fixed: metadata is nested
              match: { value: documentId },
            },
          ],
        },
      }),
    };

    console.log(
      "🔧 Retriever config:",
      JSON.stringify(retrieverConfig, null, 2)
    );

    const vectorRetriever = vectorStore.asRetriever(retrieverConfig);

    // Retrieve relevant chunks (filtered by documentId if provided)
    const relevantChunks = await vectorRetriever.invoke(query);

    console.log(`📊 Found ${relevantChunks.length} relevant chunks`);

    if (!relevantChunks || relevantChunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          "I couldn't find any relevant information in the uploaded documents to answer your question.",
        sources: [],
      });
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create system prompt with retrieved context
    const SYSTEM_PROMPT = `You are an AI assistant whose only source of truth is the content of a given PDF file. You must always base your answers strictly on the information available inside the PDF and its corresponding page numbers. If a query cannot be answered from the PDF, you must clearly state that the answer is not available in the provided content.

Core Rules:
- Always ground answers in the PDF (quote, paraphrase, or summarize from the document).
- Always include the page number(s) where the answer is found.
- If the information is not present in the PDF, respond with: "The requested information is not available in the provided PDF."
- Do not invent or assume details.
- Be concise, clear, and accurate and provide evidence from the PDF and suitable generated example.
- Never hallucinate beyond the PDF's content.

User Query: ${query}

Relevant Content: ${JSON.stringify(
      relevantChunks.map((doc) => ({
        content: doc.pageContent,
        page:
          doc.metadata.loc?.pageNumber || doc.metadata.pageNumber || "unknown",
      }))
    )}`;

    console.log("🤖 Generating response...");

    // Generate response using OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content;

    // Extract source information
    const sources = relevantChunks.map((doc) => ({
      content: doc.pageContent.substring(0, 200) + "...",
      pageNumber:
        doc.metadata.loc?.pageNumber || doc.metadata.pageNumber || "unknown",
      documentName: doc.metadata.documentName || "Unknown document",
    }));

    console.log("✅ Response generated successfully");

    return NextResponse.json({
      success: true,
      answer,
      sources,
      query,
    });
  } catch (error) {
    console.error("❌ Error processing chat:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat query",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
