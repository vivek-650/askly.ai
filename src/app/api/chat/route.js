import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { queryUserDocuments } from "@/lib/services/queryService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/chat
 * Processes chat messages with RAG (Retrieval Augmented Generation)
 */
export async function POST(request) {
  try {
    // Get authenticated user
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, documentId, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Query relevant documents from user's collection
    const relevantDocs = await queryUserDocuments(
      message,
      userId,
      documentId, // Optional: filter by specific document
      4 // Number of relevant chunks to retrieve
    );

    // Build context from retrieved documents
    const context = relevantDocs
      .map((doc, idx) => {
        const metadata = doc.metadata || {};
        const source =
          metadata.fileName || metadata.url || metadata.textName || "Unknown";
        return `[Document ${idx + 1}: ${source}]\n${doc.pageContent}`;
      })
      .join("\n\n---\n\n");

    // Build messages for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant that answers questions based on the provided context. 
        
Context from user's documents:
${context}

Instructions:
- Answer questions using ONLY the information from the provided context
- If the context doesn't contain enough information to answer, say so clearly
- Cite the document number when referencing specific information
- Be concise and accurate
- If asked about something not in the context, politely explain you can only answer based on the uploaded documents`,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse =
      completion.choices[0]?.message?.content || "No response generated";

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sources: relevantDocs.map((doc) => ({
        fileName: doc.metadata?.fileName,
        url: doc.metadata?.url,
        textName: doc.metadata?.textName,
        chunkIndex: doc.metadata?.chunkIndex,
      })),
      documentCount: relevantDocs.length,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
