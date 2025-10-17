import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

class PDFService {
  /**
   * Extract text from a PDF file using LangChain's PDFLoader
   * This handles page-wise chunking automatically
   * @param {Buffer} pdfBuffer - The PDF file buffer
   * @param {string} fileName - Original file name
   * @returns {Promise<Array>} Array of document objects with pageContent and metadata
   */
  async extractText(pdfBuffer, fileName = "temp.pdf") {
    let tempFilePath = null;

    try {
      // Create temporary file path
      const tempDir = join(process.cwd(), "uploads", "temp");
      const { mkdir } = await import("fs/promises");
      const { existsSync } = await import("fs");

      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }

      tempFilePath = join(tempDir, `temp_${Date.now()}_${fileName}`);

      // Write buffer to temporary file
      await writeFile(tempFilePath, pdfBuffer);

      // Use PDFLoader to extract text page by page
      const loader = new PDFLoader(tempFilePath);
      const docs = await loader.load();

      console.log(`✅ Extracted ${docs.length} pages from PDF`);

      return docs;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error(`PDF text extraction failed: ${error.message}`);
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (cleanupError) {
          console.warn("Failed to cleanup temp file:", cleanupError.message);
        }
      }
    }
  }
}

const pdfService = new PDFService();
export default pdfService;
