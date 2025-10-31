import fs from "fs";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

/**
 * Process and index a PDF file into Qdrant
 * @param {string} filePath - Path to the uploaded PDF file
 * @param {string} fileName - Name of the file for collection naming
 * @param {string} userId - User ID for collection isolation
 */
export async function indexPDFDocument(filePath, fileName, userId) {
  try {
    // 1. Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    const rawText = data.text;

    if (!rawText || rawText.trim().length < 50) {
      throw new Error("No meaningful text found in the PDF.");
    }

    // 2. Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([rawText]);

    // Add metadata to each chunk
    chunks.forEach((chunk, index) => {
      chunk.metadata = {
        fileName,
        userId,
        chunkIndex: index,
        source: "pdf",
        uploadedAt: new Date().toISOString(),
      };
    });

    // 3. Generate embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 4. Store in Qdrant with user-specific collection
    const collectionName = `user-${userId}-${fileName.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}`;

    await QdrantVectorStore.fromDocuments(chunks, embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName,
    });

    // 5. Clean up uploaded file
    fs.unlinkSync(filePath);

    return {
      success: true,
      message: "PDF indexed successfully",
      collectionName,
      chunks: chunks.length,
    };
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

/**
 * Index raw text context
 */
export async function indexTextContext(text, textName, userId) {
  if (!text || !textName) {
    throw new Error("Both text and textName are required.");
  }

  // 1. Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.createDocuments([text]);

  // Add metadata
  chunks.forEach((chunk, index) => {
    chunk.metadata = {
      textName,
      userId,
      chunkIndex: index,
      source: "text",
      uploadedAt: new Date().toISOString(),
    };
  });

  // 2. Generate embeddings
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 3. Store in Qdrant
  const collectionName = `user-${userId}-${textName.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  )}`;

  await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName,
  });

  return {
    success: true,
    message: "Text indexed successfully",
    collectionName,
    chunks: chunks.length,
  };
}
