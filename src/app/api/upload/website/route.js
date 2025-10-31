import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  indexMultipleWebsites,
  indexWebsiteContent,
} from "@/lib/services/websiteIndexingService";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { urls, url, urlName } = body;

    // Handle single URL
    if (url && urlName) {
      const result = await indexWebsiteContent(url, urlName, userId);

      return NextResponse.json({
        success: true,
        message: "Website indexed successfully",
        data: {
          documentId: result.documentId,
          url,
          collectionName: result.collectionName,
          chunks: result.chunks,
          indexedAt: new Date().toISOString(),
        },
      });
    }

    // Handle multiple URLs
    if (urls && Array.isArray(urls)) {
      if (urls.length === 0) {
        return NextResponse.json(
          { error: "No URLs provided" },
          { status: 400 }
        );
      }

      if (urls.length > 50) {
        return NextResponse.json(
          { error: "Maximum 50 URLs allowed at once" },
          { status: 400 }
        );
      }

      const result = await indexMultipleWebsites(urls, userId);

      return NextResponse.json({
        success: true,
        message: `Indexed ${result.indexed} of ${urls.length} websites`,
        data: {
          indexed: result.indexed,
          failed: result.failed,
          results: result.results,
          errors: result.errors,
          indexedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Either 'url' or 'urls' must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Website indexing error:", error);
    return NextResponse.json(
      {
        error: "Failed to index website",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
