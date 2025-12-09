"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-sea-blue border-b border-sea-sub-blue shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-sea-gold text-xl font-medium tracking-wider">
                Viet Jewelers AI
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">            
              <Link 
                href="/dashboard/upload" 
                className="block px-4 py-2 text-sm text-sea-light-gray hover:bg-sea-blue hover:text-sea-gold" role="menuitem">
                Upload Photo
              </Link>    
              <Link
                href="/dashboard/report"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                  isActive('/dashboard/report')
                    ? 'border-sea-gold text-sea-gold'
                    : 'border-transparent text-sea-light-gray hover:text-white hover:border-sea-sub-blue'
                }`}
              >
                Report
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {user && user.email && (
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-sm text-sea-light-gray">
                  User: <span className="text-white">{user.email.split('@')[0]}</span>
                </span>
                <span className="text-xs text-sea-gray">Role: Nhân viên</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="hidden md:block ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-sea-blue bg-sea-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sea-gold transition-colors"
            >
              Log Out
            </button>
            
            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center md:hidden">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-sea-light-gray hover:text-white hover:bg-sea-sub-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        ref={menuRef}
        className={`md:hidden absolute top-16 left-0 w-full bg-sea-sub-blue shadow-lg z-50 transition-all duration-300 ease-in-out origin-top ${
          isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard/upload"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/dashboard/upload')
                ? 'text-sea-gold bg-sea-blue'
                : 'text-sea-light-gray hover:text-white hover:bg-sea-blue'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Upload Photo
          </Link>
          <Link
            href="/dashboard/report"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/dashboard/report')
                ? 'text-sea-gold bg-sea-blue'
                : 'text-sea-light-gray hover:text-white hover:bg-sea-blue'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Report
          </Link>
        </div>
        <div className="pt-4 pb-4 border-t border-sea-blue">
          <div className="flex items-center px-5">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-sea-blue bg-sea-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sea-gold transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
