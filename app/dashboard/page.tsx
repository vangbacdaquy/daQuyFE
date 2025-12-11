"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { UploadCloud, FileText, User } from "lucide-react";

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
      <div className="min-h-screen p-4 space-y-6 max-w-4xl mx-auto pt-10">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Extract username from email
  const username = user.email ? user.email.split('@')[0] : 'User';

  return (
    <div className="space-y-6">
      {/* User Info Section */}
      <div className="bg-gradient-to-r from-sea-sub-blue to-sea-blue rounded-2xl p-6 border border-white/10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-sea-gold flex items-center justify-center text-sea-blue font-bold text-2xl shadow-md ring-4 ring-sea-gold/20">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Xin chào, <span className="text-sea-gold">{username}</span></h2>
            <p className="text-sea-light-gray text-sm flex items-center gap-1 mt-1">
                <User size={14} /> Nhân viên
            </p>
          </div>
        </div>
        {/* Decor */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-sea-gold/10 rounded-full blur-3xl -mr-10 -mt-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Upload Photo Card */}
        <Link href="/dashboard/upload" className="group block">
          <div className="bg-sea-sub-blue/50 rounded-2xl shadow-xl p-6 border border-white/5 hover:border-sea-gold/50 hover:bg-sea-sub-blue transition-all duration-300 h-full flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-6 active:scale-95">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sea-blue rounded-2xl flex items-center justify-center group-hover:bg-sea-gold transition-colors duration-300 shadow-inner shrink-0">
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-sea-gold group-hover:text-sea-blue transition-colors duration-300" />
            </div>
            <div className="flex-1 text-left sm:text-center">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-sea-gold transition-colors">Upload Photo</h2>
                <p className="text-sea-light-gray text-sm">Tải ảnh lên để AI xử lý</p>
            </div>
          </div>
        </Link>

        {/* View Report Card */}
        <Link href="/dashboard/report" className="group block">
          <div className="bg-sea-sub-blue/50 rounded-2xl shadow-xl p-6 border border-white/5 hover:border-sea-gold/50 hover:bg-sea-sub-blue transition-all duration-300 h-full flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-6 active:scale-95">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sea-blue rounded-2xl flex items-center justify-center group-hover:bg-sea-gold transition-colors duration-300 shadow-inner shrink-0">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-sea-gold group-hover:text-sea-blue transition-colors duration-300" />
            </div>
            <div className="flex-1 text-left sm:text-center">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-sea-gold transition-colors">View Reports</h2>
                <p className="text-sea-light-gray text-sm">Xem báo cáo thống kê</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
