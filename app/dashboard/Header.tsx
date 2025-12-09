"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <Link href="/dashboard" className="text-sea-gold text-xl font-bold tracking-wider">
                Jewelry AI
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {/* Dropdown for Jewelry AI */}
              <div className="relative group">
                <button 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                    isActive('/dashboard/upload') || isActive('/dashboard/camera') 
                      ? 'border-sea-gold text-sea-gold' 
                      : 'border-transparent text-sea-light-gray hover:text-white hover:border-sea-sub-blue'
                  }`}
                >
                  Jewelry AI
                  <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-0 w-48 rounded-md shadow-lg bg-sea-sub-blue ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <Link href="/dashboard/camera" className="block px-4 py-2 text-sm text-sea-light-gray hover:bg-sea-blue hover:text-sea-gold" role="menuitem">
                      Take Photo
                    </Link>
                    <Link href="/dashboard/upload" className="block px-4 py-2 text-sm text-sea-light-gray hover:bg-sea-blue hover:text-sea-gold" role="menuitem">
                      Upload Photo
                    </Link>
                  </div>
                </div>
              </div>

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
            <button
              onClick={handleLogout}
              className="hidden md:block ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-sea-blue bg-sea-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sea-gold transition-colors"
            >
              Log Out
            </button>
            
            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center md:hidden">
              <button
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
        className={`md:hidden absolute top-16 left-0 w-full bg-sea-sub-blue shadow-lg z-50 transition-all duration-300 ease-in-out origin-top ${
          isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className="block px-3 py-2 text-base font-medium text-sea-gold hover:bg-sea-blue"
            onClick={() => setIsMenuOpen(false)}
          >
            Jewelry AI
          </Link>
          <Link
            href="/dashboard/camera"
            className="block pl-6 pr-4 py-2 text-base font-medium text-sea-light-gray hover:text-white hover:bg-sea-blue"
            onClick={() => setIsMenuOpen(false)}
          >
            Take Photo
          </Link>
          <Link
            href="/dashboard/upload"
            className="block pl-6 pr-4 py-2 text-base font-medium text-sea-light-gray hover:text-white hover:bg-sea-blue"
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
