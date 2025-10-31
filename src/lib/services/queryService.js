import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

const SHARED_COLLECTION_NAME = "askly-documents";

/**
 * Query documents for a specific user with isolation
 * @param {string} query - User's question
 * @param {string} userId - User ID for filtering
 * @param {string} documentId - Optional specific document ID to query
 * @param {number} k - Number of chunks to retrieve (default: 4)
 */
export async function queryUserDocuments(
  query,
  userId,
  documentId = null,
  k = 4
) {
  try {
    // Generate embeddings for the query
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Connect to Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL || "http://localhost:6333",
        collectionName: SHARED_COLLECTION_NAME,
      }
    );

    // Build filter for user isolation
    const filter = {
      must: [
        {
          key: "userId",
          match: { value: userId },
        },
      ],
    };

    // Add document filter if specific document requested
    if (documentId) {
      filter.must.push({
        key: "documentId",
        match: { value: documentId },
      });
    }

    // Search with user filter
    const results = await vectorStore.similaritySearch(query, k, filter);

    return {
      success: true,
      results,
      count: results.length,
    };
  } catch (error) {
    console.error("Query error:", error);
    throw new Error(`Failed to query documents: ${error.message}`);
  }
}

/**
 * Get all documents for a specific user
 * @param {string} userId - User ID
 */
export async function getUserDocuments(userId) {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    // Scroll through all points with user filter
    const scrollResult = await client.scroll(SHARED_COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      },
      limit: 100,
      with_payload: true,
      with_vector: false,
    });

    // Extract unique documents
    const documentsMap = new Map();

    scrollResult.points.forEach((point) => {
      const metadata = point.payload;
      if (metadata.documentId && !documentsMap.has(metadata.documentId)) {
        documentsMap.set(metadata.documentId, {
          id: metadata.documentId,
          name: metadata.fileName || metadata.urlName || metadata.textName,
          type: metadata.source,
          uploadedAt: metadata.uploadedAt,
          url: metadata.url || null,
        });
      }
    });

    return {
      success: true,
      documents: Array.from(documentsMap.values()),
      count: documentsMap.size,
    };
  } catch (error) {
    console.error("Get documents error:", error);
    throw new Error(`Failed to get user documents: ${error.message}`);
  }
}

/**
 * Delete a specific document for a user
 * @param {string} userId - User ID
 * @param {string} documentId - Document ID to delete
 */
export async function deleteUserDocument(userId, documentId) {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    // Delete all points matching user and document
    await client.delete(SHARED_COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
          {
            key: "documentId",
            match: { value: documentId },
          },
        ],
      },
    });

    return {
      success: true,
      message: "Document deleted successfully",
    };
  } catch (error) {
    console.error("Delete document error:", error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Initialize the shared collection if it doesn't exist
 */
export async function initializeSharedCollection() {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    // Check if collection exists
    const collections = await client.getCollections();
    const exists = collections.collections.some(
      (col) => col.name === SHARED_COLLECTION_NAME
    );

    if (!exists) {
      // Create collection with proper settings
      await client.createCollection(SHARED_COLLECTION_NAME, {
        vectors: {
          size: 3072, // text-embedding-3-large dimension
          distance: "Cosine",
        },
      });

      // Create payload index for faster filtering
      await client.createPayloadIndex(SHARED_COLLECTION_NAME, {
        field_name: "userId",
        field_schema: "keyword",
      });

      await client.createPayloadIndex(SHARED_COLLECTION_NAME, {
        field_name: "documentId",
        field_schema: "keyword",
      });

      console.log(`✅ Created shared collection: ${SHARED_COLLECTION_NAME}`);
    }

    return { success: true, collectionName: SHARED_COLLECTION_NAME };
  } catch (error) {
    console.error("Initialize collection error:", error);
    throw error;
  }
}
