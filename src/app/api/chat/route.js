import { currentUser } from "@clerk/nextjs/server";
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
  const startTime = Date.now();
  try {
    // Get authenticated user using currentUser() (works with Next.js 16)
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      console.log("[api:chat] unauthorized - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, documentId, conversationHistory = [] } = body;

    console.log("[api:chat] begin", {
      userId,
      email: user?.emailAddresses?.[0]?.emailAddress,
      messageLength: message?.length,
      documentId,
      hasHistory: conversationHistory.length > 0,
    });

    if (!message) {
      console.log("[api:chat] validation failed - no message");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Query relevant documents from user's collection - fetch more chunks for comprehensive answers
    const queryResult = await queryUserDocuments(
      message,
      userId,
      documentId, // Optional: filter by specific document
      8 // Increased from 4 to 8 to capture more context including code examples
    );

    const relevantDocs = queryResult.results || [];

    console.log("[api:chat] retrieved chunks", {
      count: relevantDocs.length,
      sources: relevantDocs.map(
        (d) => d.metadata?.fileName || d.metadata?.url || d.metadata?.textName
      ),
    });

    // Build context from retrieved documents with better formatting
    const context = relevantDocs
      .map((doc, idx) => {
        const metadata = doc.metadata || {};
        const source =
          metadata.fileName || metadata.url || metadata.textName || "Unknown";
        const chunkInfo =
          metadata.chunkIndex !== undefined
            ? ` (Chunk ${metadata.chunkIndex})`
            : "";
        return `[Document ${idx + 1}: ${source}${chunkInfo}]\n${
          doc.pageContent
        }`;
      })
      .join("\n\n---\n\n");

    // Build messages for OpenAI with enhanced instructions
    const messages = [
      {
        role: "system",
        content: `You are a highly knowledgeable AI assistant that provides comprehensive, detailed answers based on the provided context from user documents.

Context from user's documents:
${context}

Instructions:
- Provide thorough, comprehensive answers using the information from the context above
- If code examples, snippets, or technical implementations are present in the context, include them in your response with proper formatting
- When showing code, use markdown code blocks with the appropriate language identifier
- Structure your responses well with clear explanations, examples, and step-by-step guidance when applicable
- Cite document numbers [Document X] when referencing specific information
- If the context contains multiple related pieces of information, synthesize them into a complete answer
- For technical questions, provide detailed explanations with examples from the context
- If the context doesn't contain enough information to fully answer, clearly state what information is available and what is missing
- Do NOT use HTML tags or escape sequences like \\n or <br> for formatting - use natural paragraph breaks and markdown instead
- Do NOT hallucinate or add information not present in the provided context
- Be thorough but also clear and well-organized in your explanations
- Match the depth and detail of your response to the complexity of the question asked
`,
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

    // Get response from OpenAI with better model and more tokens
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Upgraded from gpt-3.5-turbo for better comprehension and code handling
      messages,
      temperature: 0.7,
      max_tokens: 2500, // Increased from 1000 to allow comprehensive responses with code examples
    });

    const aiResponse =
      completion.choices[0]?.message?.content || "No response generated";

    const elapsed = Date.now() - startTime;
    console.log("[api:chat] response generated", {
      userId,
      elapsed: `${elapsed}ms`,
      responseLength: aiResponse.length,
      sourcesCount: relevantDocs.length,
    });

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
    console.error("[api:chat] error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error?.message || "",
      },
      { status: 500 }
    );
  }
}
