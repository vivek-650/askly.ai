import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteUserDocument } from "@/lib/services/queryService";

/**
 * DELETE /api/documents/:documentId
 * Deletes a specific document for the authenticated user
 */
export async function DELETE(request, { params }) {
  try {
    // Get authenticated user
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Delete document from Qdrant (only if it belongs to this user)
    await deleteUserDocument(userId, documentId);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
      documentId,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      {
        error: "Failed to delete document",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
