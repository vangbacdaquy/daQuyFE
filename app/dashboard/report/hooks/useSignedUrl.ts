import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
 
// Cache for signed URLs with expiration
const urlCache = new Map<string, { url: string; expiresAt: number }>();
 
export function useSignedUrl(gsUri: string | null | undefined): string {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const { getJwt } = useAuth();
 
  useEffect(() => {
    if (!gsUri || !gsUri.startsWith("gs://")) {
      // If it's already an HTTP(S) URL or empty, use it as-is
      setSignedUrl(gsUri || "");
      return;
    }
 
    // Check cache first
    const cached = urlCache.get(gsUri);
    const now = Date.now();
   
    if (cached && cached.expiresAt > now) {
      setSignedUrl(cached.url);
      return;
    }
 
    // Fetch new signed URL
    const fetchSignedUrl = async () => {
      try {
        const token = await getJwt();
        if (!token) return;
 
        const response = await fetch("/api/storage/signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gsUri }),
        });
 
        if (!response.ok) {
          console.error("Failed to get signed URL:", await response.text());
          return;
        }
 
        const data = await response.json();
        if (data.signedUrl) {
          setSignedUrl(data.signedUrl);
         
          // Cache for 50 minutes (10 minutes before expiration)
          urlCache.set(gsUri, {
            url: data.signedUrl,
            expiresAt: now + 50 * 60 * 1000,
          });
        }
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };
 
    fetchSignedUrl();
  }, [gsUri, getJwt]);
 
  return signedUrl;
}