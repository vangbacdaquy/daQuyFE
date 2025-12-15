import { NextRequest, NextResponse } from "next/server";
 
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authorization.split("Bearer ")[1];
 
    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: "Backend service is not configured." }, { status: 500 });
    }
 
    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams();
    
    // Whitelist parameters to forward
    const paramsToForward = [
      "user_email", 
      "start_date", 
      "end_date", 
      "last_created_at", 
      "last_image_url"
    ];

    paramsToForward.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        query.set(key, value);
      }
    });
 
    const queryString = query.toString();
    const url = queryString ? `${backendUrl}/reports?${queryString}` : `${backendUrl}/reports`;
 
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
 
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();
 
    if (!response.ok) {
      const errorMessage = typeof payload === "string" ? payload : payload?.error || "Failed to fetch reports";
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }
 
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Reports API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
