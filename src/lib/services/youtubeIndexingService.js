import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { initializeSharedCollection } from "@/lib/services/queryService";

// Use the same shared collection as file/website so listing/query works uniformly
const SHARED_COLLECTION_NAME = "askly-documents";

/**
 * Process and index a YouTube video into Qdrant with user isolation
 * Handles long videos gracefully using transcript chunking
 *
 * @param {string} videoUrl - The YouTube video URL
 * @param {string} userId - User ID for document isolation
 */
export async function indexYouTubeVideo(videoUrl, userId) {
  try {
    console.log("[indexing:youtube] start", { videoUrl, userId });

    // Ensure shared collection exists (same as file/website)
    await initializeSharedCollection();

    // 1️⃣ Load video transcript using LangChain’s YoutubeLoader
    // This automatically fetches available captions (auto-generated if needed)
    const loader = YoutubeLoader.createFromUrl(videoUrl, {
      language: "en",
      addVideoInfo: true, // Adds metadata like title, description, etc.
    });

    const docs = await loader.load();
    console.log("[indexing:youtube] transcript loaded", {
      chunks: docs.length,
    });

    if (!docs || docs.length === 0 || !docs[0].pageContent?.trim()) {
      throw new Error("No transcript or captions found for this video.");
    }

    // 2️⃣ Combine all transcripts into one large text
    const fullTranscript = docs.map((d) => d.pageContent).join("\n");

    // 3️⃣ Split text into manageable chunks (handles long 1-hour videos)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([fullTranscript]);

    // 4️⃣ Add metadata for user isolation
    const videoId = extractYouTubeId(videoUrl);
    const indexedAt = new Date().toISOString();
    const documentId = `${userId}-${Date.now()}-${videoId}`;

    chunks.forEach((chunk, index) => {
      chunk.metadata = {
        userId,
        documentId,
        source: "youtube",
        videoUrl,
        videoId,
        videoTitle: docs[0]?.metadata?.title || "Untitled Video",
        // Populate a field that documents listing understands as a name
        textName: docs[0]?.metadata?.title || "YouTube Video",
        channelName: docs[0]?.metadata?.author || "Unknown Channel",
        chunkIndex: index,
        uploadedAt: indexedAt,
      };
    });

    // 5️⃣ Generate embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 6️⃣ Store in Qdrant (shared collection)
    await QdrantVectorStore.fromDocuments(chunks, embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName: SHARED_COLLECTION_NAME,
    });

    console.log("[indexing:youtube] completed", {
      documentId,
      videoId,
      chunks: chunks.length,
    });

    return {
      success: true,
      message: "YouTube video indexed successfully",
      documentId,
      videoId,
      url: videoUrl,
      collectionName: SHARED_COLLECTION_NAME,
      chunks: chunks.length,
      videoTitle: chunks[0]?.metadata?.videoTitle || "Untitled Video",
      indexedAt,
    };
  } catch (error) {
    console.error("[indexing:youtube] error", error);
    throw error;
  }
}

/**
 * Index multiple YouTube videos sequentially to avoid rate limits
 * @param {string[]} urls
 * @param {string} userId
 */
export async function indexMultipleYouTubeVideos(urls, userId) {
  const results = [];
  const errors = [];

  for (const url of urls) {
    try {
      const res = await indexYouTubeVideo(url, userId);
      results.push(res);
    } catch (e) {
      errors.push({ url, error: e?.message || String(e) });
    }
  }

  return {
    success: true,
    indexed: results.length,
    failed: errors.length,
    results,
    errors,
  };
}

/**
 * Utility: Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url) {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "unknown";
}
