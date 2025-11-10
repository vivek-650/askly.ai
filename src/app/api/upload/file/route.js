import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { indexPDFDocument } from "@/lib/services/indexingService";

export async function POST(request) {
  try {
    const user = await currentUser();
    const userId = user?.id;
    const start = Date.now();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      console.warn("[upload:file] No file provided");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      console.warn("[upload:file] Invalid type", { type: file.type });
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.warn("[upload:file] File too large", { size: file.size });
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = join(uploadsDir, uniqueFileName);

    console.log("[upload:file] begin", {
      userId,
      email: user?.emailAddresses?.[0]?.emailAddress,
      fileName: file.name,
      mime: file.type,
      size: file.size,
    });

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log("[upload:file] saved", { filePath });

    // Index the PDF
    const result = await indexPDFDocument(filePath, file.name, userId);
    console.log("[upload:file] indexed", {
      documentId: result.documentId,
      chunks: result.chunks,
      collection: result.collectionName,
      ms: Date.now() - start,
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded and indexed successfully",
      data: {
        documentId: result.documentId,
        fileName: file.name,
        fileSize: file.size,
        collectionName: result.collectionName,
        chunks: result.chunks,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[upload:file] error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to upload and index file",
        details: error?.message || "",
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
