import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { indexTextContext } from "@/lib/services/indexingService";

export async function POST(request) {
  try {
    const user = await currentUser();
    const userId = user?.id;
    const start = Date.now();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, textName } = body;

    if (!text || !textName) {
      console.warn("[upload:text] missing fields", {
        hasText: !!text,
        textName,
      });
      return NextResponse.json(
        { error: "Both text and textName are required" },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      console.warn("[upload:text] text too short", { length: text.length });
      return NextResponse.json(
        { error: "Text must be at least 50 characters long" },
        { status: 400 }
      );
    }

    console.log("[upload:text] begin", {
      userId,
      email: user?.emailAddresses?.[0]?.emailAddress,
      textName,
      length: text.length,
    });

    const result = await indexTextContext(text, textName, userId);
    console.log("[upload:text] indexed", {
      documentId: result.documentId,
      chunks: result.chunks,
      collection: result.collectionName,
      ms: Date.now() - start,
    });

    return NextResponse.json({
      success: true,
      message: "Text indexed successfully",
      data: {
        documentId: result.documentId,
        textName,
        collectionName: result.collectionName,
        chunks: result.chunks,
        indexedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[upload:text] error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to index text",
        details: error?.message || "",
      },
      { status: 500 }
    );
  }
}
