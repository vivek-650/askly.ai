import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserDocuments } from "@/lib/services/queryService";

/**
 * GET /api/documents
 * Fetches all documents for the authenticated user
 */
export async function GET(request) {
  try {
    // Get authenticated user using currentUser() (works with Next.js 16)
    const user = await currentUser();
    const userId = user?.id;
    const cookieHeader = request.headers.get("cookie");
    console.log("[api:documents] begin", {
      userId,
      email: user?.emailAddresses?.[0]?.emailAddress,
      cookiePresent: !!cookieHeader,
    });

    if (!userId) {
      console.warn("[api:documents] unauthorized - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's documents from Qdrant
    const result = await getUserDocuments(userId);
    console.log("[api:documents] fetched", {
      success: result.success,
      count: result.count,
    });
    return NextResponse.json({
      success: result.success,
      documents: result.documents,
      count: result.count,
    });
  } catch (error) {
    console.error("[api:documents] error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to fetch documents",
        details: error?.message || "",
        documents: [],
        count: 0,
      },
      { status: 200 } // Return 200 with empty array instead of 500
    );
  }
}
