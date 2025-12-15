import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase-admin";
 
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authorization = request.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const { gsUri } = await request.json();
   
    if (!gsUri || typeof gsUri !== "string" || !gsUri.startsWith("gs://")) {
      return NextResponse.json({ error: "Invalid gs:// URI provided" }, { status: 400 });
    }
 
    // Parse gs:// URI to extract bucket and path
    // Format: gs://bucket-name/path/to/file.jpg
    const gsUriMatch = gsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
    if (!gsUriMatch) {
      return NextResponse.json({ error: "Malformed gs:// URI" }, { status: 400 });
    }
 
    const [, bucketName, filePath] = gsUriMatch;
 
    // Get storage bucket and file reference
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
 
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
 
    // Generate signed URL (expires in 1 hour)
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour from now
    });
 
    // Cache signed URLs for 50 minutes (less than expiration time)
    return NextResponse.json({ signedUrl }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=3000, immutable',
      }
    });
  } catch (error) {
    console.error("Signed URL generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate signed URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
 
 