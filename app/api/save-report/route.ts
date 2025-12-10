import { NextRequest, NextResponse } from "next/server";
 
export async function POST(request: NextRequest) {
  try {
 
    const authorization = request.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ results: [{ status: "error", message: "Unauthorized" }] }, { status: 401 });
    }
    const token = authorization.split("Bearer ")[1];
 
 
    // 2. Get the report data from the request body.
    const reportData = await request.json();
    if (!Array.isArray(reportData) || reportData.length === 0) {
        return NextResponse.json({ results: [{ status: "error", message: "No report data provided" }] }, { status: 400 });
    }
 
    // 3. Call your external AI backend to save the report.
    const backendUrl = process.env.BACKEND_API_URL;
    if (backendUrl) {
        const response = await fetch(`${backendUrl}/save-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass the original token for the backend to use if needed
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(reportData),
        });
 
        // Forward the response from the external backend to the client
        const backendResult = await response.json();
        return NextResponse.json(backendResult, { status: response.status });
    }
 
    // Fallback if no backend URL is configured
    return NextResponse.json({ results: [{ status: "error", message: "Backend service is not configured." }] }, { status: 500 });
 
  } catch (error) {
    console.error("Save Report Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ results: [{ status: "error", message: `API route error: ${errorMessage}` }] }, { status: 500 });
  }
}
 
 