"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sea-blue px-4">
      <div className="w-full max-w-md">
        <div className="bg-sea-sub-blue rounded-lg shadow-2xl p-8 border border-sea-gold/20">
          <h2 className="text-3xl font-bold text-center mb-2 text-sea-gold">
            Welcome Back
          </h2>
          <p className="text-center text-sea-light-gray mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-sea-light-gray mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-sea-blue bg-sea-blue text-white focus:ring-2 focus:ring-sea-gold focus:border-transparent outline-none transition placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-sea-light-gray mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-sea-blue bg-sea-blue text-white focus:ring-2 focus:ring-sea-gold focus:border-transparent outline-none transition placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            {/* <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Forgot password?
              </Link>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sea-gold hover:bg-yellow-500 disabled:bg-gray-500 text-sea-blue font-bold rounded-lg transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sea-gold focus:ring-offset-2 focus:ring-offset-sea-sub-blue"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
