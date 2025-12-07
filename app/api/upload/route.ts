import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY || "{}"),
});

const bucketName = process.env.GCS_BUCKET_NAME || "";
const bucket = storage.bucket(bucketName);

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_MIME_TYPES = new Set(ALLOWED_TYPES);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate all files first
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }
    }

    // Upload files to GCS
    const uploadPromises = files.map(async (file) => {
      const fileId = randomUUID();
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `${fileId}.${extension}`;
      
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to GCS
      const blob = bucket.file(fileName);
      await blob.save(buffer, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Make the file publicly accessible (optional - remove if you want private files)
      await blob.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

      return {
        id: fileId,
        fileName: fileName,
        originalName: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    // Send image IDs to backend server
    const backendUrl = process.env.BACKEND_API_URL;
    if (backendUrl) {
      try {
        const imageIds = uploadedFiles.map((f) => f.id);
        await fetch(`${backendUrl}/api/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authentication header if needed
            // "Authorization": `Bearer ${process.env.BACKEND_API_KEY}`,
          },
          body: JSON.stringify({
            imageIds: imageIds,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to notify backend:", error);
        // Continue anyway - images are already uploaded
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      urls: uploadedFiles.map((f) => f.url),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
