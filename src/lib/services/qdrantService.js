import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "@langchain/openai";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "pdf_documents";

class QdrantService {
  constructor() {
    this.client = new QdrantClient({ url: QDRANT_URL });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });
  }

  async initCollection() {
    try {
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === COLLECTION_NAME
      );

      if (!collectionExists) {
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: 1536, // OpenAI embedding dimension
            distance: "Cosine",
          },
        });
        console.log(`Collection ${COLLECTION_NAME} created successfully`);
      }
      return true;
    } catch (error) {
      console.error("Error initializing collection:", error);
      throw error;
    }
  }

  async addDocuments(documents, metadata = {}) {
    try {
      await this.initCollection();

      const points = await Promise.all(
        documents.map(async (doc, index) => {
          const embedding = await this.embeddings.embedQuery(doc.content);
          return {
            id: `${metadata.documentId}_${index}`,
            vector: embedding,
            payload: {
              content: doc.content,
              pageNumber: doc.pageNumber || index + 1,
              documentId: metadata.documentId,
              documentName: metadata.documentName,
              uploadedAt: new Date().toISOString(),
              ...doc.metadata,
            },
          };
        })
      );

      await this.client.upsert(COLLECTION_NAME, {
        wait: true,
        points,
      });

      console.log(`Added ${points.length} documents to collection`);
      return { success: true, count: points.length };
    } catch (error) {
      console.error("Error adding documents:", error);
      throw error;
    }
  }

  async searchSimilar(query, documentId = null, limit = 5) {
    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);

      const filter = documentId
        ? {
            must: [
              {
                key: "documentId",
                match: { value: documentId },
              },
            ],
          }
        : undefined;

      const searchResult = await this.client.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit,
        filter,
        with_payload: true,
      });

      return searchResult.map((result) => ({
        content: result.payload.content,
        score: result.score,
        pageNumber: result.payload.pageNumber,
        documentName: result.payload.documentName,
        metadata: result.payload,
      }));
    } catch (error) {
      console.error("Error searching documents:", error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      await this.client.delete(COLLECTION_NAME, {
        filter: {
          must: [
            {
              key: "documentId",
              match: { value: documentId },
            },
          ],
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  async getDocumentsByUser(userId) {
    try {
      const result = await this.client.scroll(COLLECTION_NAME, {
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
      });

      // Group by documentId to get unique documents
      const documentsMap = new Map();
      result.points.forEach((point) => {
        const docId = point.payload.documentId;
        if (!documentsMap.has(docId)) {
          documentsMap.set(docId, {
            documentId: docId,
            documentName: point.payload.documentName,
            uploadedAt: point.payload.uploadedAt,
          });
        }
      });

      return Array.from(documentsMap.values());
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  }
}

const qdrantService = new QdrantService();
export default qdrantService;
