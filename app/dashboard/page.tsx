"use client";
 
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
 
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
 
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
 
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sea-blue">
        <div className="w-16 h-16 border-4 border-t-transparent border-sea-gold rounded-full animate-spin"></div>
      </div>
    );
  }
 
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
        {/* Upload Photo Card */}
        <Link href="/dashboard/upload" className="group">
          <div className="bg-sea-sub-blue rounded-xl shadow-xl p-8 border-2 border-transparent hover:border-sea-gold transition-all duration-300 h-full flex flex-col items-center justify-center text-center transform hover:-translate-y-1">
            <div className="w-24 h-24 bg-sea-blue rounded-full flex items-center justify-center mb-6 group-hover:bg-sea-gold transition-colors duration-300">
              <svg className="w-12 h-12 text-sea-gold group-hover:text-sea-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-sea-gold transition-colors">Upload Photo</h2>
            <p className="text-sea-light-gray">Select an image from your device</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

 
 