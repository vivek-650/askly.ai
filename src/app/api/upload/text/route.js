import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { indexTextContext } from "@/lib/services/indexingService";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, textName } = body;

    if (!text || !textName) {
      return NextResponse.json(
        { error: "Both text and textName are required" },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters long" },
        { status: 400 }
      );
    }

    const result = await indexTextContext(text, textName, userId);

    return NextResponse.json({
      success: true,
      message: "Text indexed successfully",
      data: {
        textName,
        collectionName: result.collectionName,
        chunks: result.chunks,
        indexedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Text indexing error:", error);
    return NextResponse.json(
      {
        error: "Failed to index text",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
