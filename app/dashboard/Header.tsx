"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { LogOut } from "lucide-react";

export default function DashboardHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-sea-blue/90 backdrop-blur-md border-b border-sea-sub-blue sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-sea-gold rounded-lg shadow-sm px-4 py-1">
                <div className="relative h-8 w-36">
                  <Image 
                      src="https://vietjewelers.com/cdn/shop/files/Logo_Ch.png?v=1718962467&width=400"
                      alt="Viet Jewelers"
                      fill
                      sizes="144px"
                      className="object-contain"
                      priority
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-4">
            {user && user.email && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.email.split('@')[0]}</span>
                <span className="text-xs text-sea-gray">Staff</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-sea-light-gray hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
