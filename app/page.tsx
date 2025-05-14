"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Summarize AI</h1>
      <p className="mb-8 text-center max-w-md">
        Summarize your emails and chats, extract action items, and manage tasks
        all in one place.
      </p>

      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "authenticated" ? (
        <p>Redirecting to dashboard...</p>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Learn More
          </Link>
        </div>
      )}
    </main>
  );
}
