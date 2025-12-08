import { NextRequest, NextResponse } from "next/server";
// You might need firebase-admin to verify the token if you want extra security
// import { auth } from 'firebase-admin';
 
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const authorization = request.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authorization.split("Bearer ")[1];
 
    // Optional but recommended: Verify the token with firebase-admin
    // const decodedToken = await auth().verifyIdToken(token);
    // const uid = decodedToken.uid;
 
    // 2. Get data from request body
    const { file_uris, prompt } = await request.json();
    if (!file_uris || !Array.isArray(file_uris) || file_uris.length === 0) {
      return NextResponse.json({ error: "No file URIs provided" }, { status: 400 });
    }
 
    // 3. Call your external AI backend
    const backendUrl = process.env.BACKEND_API_URL;
    if (backendUrl) {
        const response = await fetch(`${backendUrl}/process-ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass the original token or a service account key
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            file_uris,
            prompt,
            timestamp: new Date().toISOString(),
          }),
        });
 
        if (!response.ok) {
          console.error("External AI Backend Error:", response.status, await response.text());
          return NextResponse.json({ error: "AI processing failed" }, { status: 502 });
        }
         const aiResult = await response.json();
         return NextResponse.json(aiResult);
    }
 
    return NextResponse.json({ success: true, message: "Processing triggered (no backend URL)." });
 
  } catch (error) {
    console.error("Process AI Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
 
 