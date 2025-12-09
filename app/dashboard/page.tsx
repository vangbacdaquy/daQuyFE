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

  // Extract username from email
  const username = user.email ? user.email.split('@')[0] : 'User';
 
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* User Info Section */}
      <div className="max-w-4xl mx-auto mb-8 bg-sea-sub-blue rounded-xl p-6 border border-sea-gold/20 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-sea-gold flex items-center justify-center text-sea-blue font-bold text-xl shadow-md">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Xin chào, <span className="text-sea-gold">{username}</span></h2>
            <p className="text-sea-light-gray text-sm">Role: <span className="text-white font-medium">Nhân viên</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Upload Photo Card */}
        <Link href="/dashboard/upload" className="group">
          <div className="bg-sea-sub-blue rounded-xl shadow-xl p-8 border-2 border-transparent hover:border-sea-gold transition-all duration-300 h-full flex flex-col items-center justify-center text-center transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-sea-blue rounded-full flex items-center justify-center mb-6 group-hover:bg-sea-gold transition-colors duration-300 shadow-inner">
              <svg className="w-10 h-10 text-sea-gold group-hover:text-sea-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-sea-gold transition-colors">Upload Photo</h2>
            <p className="text-sea-light-gray text-sm">Tải ảnh lên để AI xử lý</p>
          </div>
        </Link>

        {/* View Report Card */}
        <Link href="/dashboard/report" className="group">
          <div className="bg-sea-sub-blue rounded-xl shadow-xl p-8 border-2 border-transparent hover:border-sea-gold transition-all duration-300 h-full flex flex-col items-center justify-center text-center transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-sea-blue rounded-full flex items-center justify-center mb-6 group-hover:bg-sea-gold transition-colors duration-300 shadow-inner">
              <svg className="w-10 h-10 text-sea-gold group-hover:text-sea-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-sea-gold transition-colors">View Reports</h2>
            <p className="text-sea-light-gray text-sm">Xem báo cáo thống kê hàng ngày</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

 
 