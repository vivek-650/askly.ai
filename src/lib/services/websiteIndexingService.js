import axios from "axios";
import * as cheerio from "cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

/**
 * Fetch and index website content
 * @param {string} url - Website URL
 * @param {string} urlName - Identifier for the URL
 * @param {string} userId - User ID for collection isolation
 */
export async function indexWebsiteContent(url, urlName, userId) {
  if (!url || !urlName) {
    throw new Error("Both url and urlName are required.");
  }

  try {
    // 1. Fetch HTML
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

    // 2. Extract visible text
    $("script, style, noscript, iframe").remove();
    const rawText = $("body").text().replace(/\s+/g, " ").trim();

    if (!rawText || rawText.length < 50) {
      throw new Error("No meaningful text found at the provided URL.");
    }

    // 3. Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([rawText]);

    // Add metadata
    chunks.forEach((chunk, index) => {
      chunk.metadata = {
        url,
        urlName,
        userId,
        chunkIndex: index,
        source: "website",
        uploadedAt: new Date().toISOString(),
      };
    });

    // 4. Generate embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 5. Store in Qdrant
    const collectionName = `user-${userId}-${urlName.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}`;

    await QdrantVectorStore.fromDocuments(chunks, embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName,
    });

    return {
      success: true,
      message: "Website indexed successfully",
      collectionName,
      chunks: chunks.length,
      url,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Website request timed out. Please try a different URL.");
    }
    throw error;
  }
}

/**
 * Index multiple website URLs
 * @param {string[]} urls - Array of URLs
 * @param {string} userId - User ID
 */
export async function indexMultipleWebsites(urls, userId) {
  const results = [];
  const errors = [];

  for (const url of urls) {
    try {
      const urlName = new URL(url).hostname.replace(/\./g, "-");
      const result = await indexWebsiteContent(url, urlName, userId);
      results.push(result);
    } catch (error) {
      errors.push({ url, error: error.message });
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
