import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserDocuments } from "@/lib/services/queryService";

/**
 * GET /api/documents
 * Fetches all documents for the authenticated user
 */
export async function GET(request) {
  try {
    // Get authenticated user
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's documents from Qdrant
    const documents = await getUserDocuments(userId);

    return NextResponse.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch documents",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
