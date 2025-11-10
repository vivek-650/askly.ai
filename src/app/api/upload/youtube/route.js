import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  indexYouTubeVideo,
  indexMultipleYouTubeVideos,
} from "@/lib/services/youtubeIndexingService";

/**
 * POST /api/upload/youtube
 * Index YouTube video(s) from URL(s)
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    // Get authenticated user
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      console.log("[upload:youtube] unauthorized - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, urls } = body;

    console.log("[upload:youtube] begin", {
      userId,
      email: user?.emailAddresses?.[0]?.emailAddress,
      isBatch: !!urls,
      count: urls ? urls.length : 1,
    });

    // Validate input
    if (!url && !urls) {
      console.warn("[upload:youtube] validation failed - no url provided");
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // Handle batch upload
    if (urls && Array.isArray(urls)) {
      if (urls.length === 0) {
        console.warn("[upload:youtube] validation failed - empty urls array");
        return NextResponse.json(
          { error: "At least one URL is required" },
          { status: 400 }
        );
      }

      if (urls.length > 10) {
        console.warn("[upload:youtube] validation failed - too many urls", {
          count: urls.length,
        });
        return NextResponse.json(
          { error: "Maximum 10 videos can be indexed at once" },
          { status: 400 }
        );
      }

      const result = await indexMultipleYouTubeVideos(urls, userId);

      const elapsed = Date.now() - startTime;
      console.log("[upload:youtube] batch indexed", {
        indexed: result.indexed,
        failed: result.failed,
        ms: elapsed,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully indexed ${result.indexed} of ${urls.length} videos`,
        data: result,
      });
    }

    // Handle single video upload
    if (!url || typeof url !== "string") {
      console.warn("[upload:youtube] validation failed - invalid url");
      return NextResponse.json(
        { error: "Valid YouTube URL is required" },
        { status: 400 }
      );
    }

    const result = await indexYouTubeVideo(url, userId);

    const elapsed = Date.now() - startTime;
    console.log("[upload:youtube] single indexed", {
      documentId: result.documentId,
      videoId: result.videoId,
      chunks: result.chunks,
      ms: elapsed,
    });

    return NextResponse.json({
      success: true,
      message: "YouTube video indexed successfully",
      data: {
        documentId: result.documentId,
        videoId: result.videoId,
        videoTitle: result.videoTitle,
        url: result.url,
        collectionName: result.collectionName,
        chunks: result.chunks,
        indexedAt: result.indexedAt,
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error("[upload:youtube] error:", {
      error: error.message,
      ms: elapsed,
    });

    return NextResponse.json(
      {
        error: "Failed to index YouTube video",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
