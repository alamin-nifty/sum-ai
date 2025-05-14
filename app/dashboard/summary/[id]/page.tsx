"use client";

import AddToTodoist from "@/components/AddToTodoist";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Summary {
  _id: string;
  summary: string;
  tasks: string[];
  originalText: string;
  createdAt: string;
  source: string;
}

export default function SummaryDetail() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchSummaryDetail(params.id as string);
    }
  }, [status, params.id, router]);

  async function fetchSummaryDetail(id: string) {
    try {
      const res = await fetch(`/api/summarize/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch summary");
      }

      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
        <div className="mt-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Summary</h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Summary</h2>
          <p className="text-gray-700">{summary?.summary}</p>
        </div>

        {summary?.tasks && summary.tasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Tasks</h2>
            <ul className="list-disc pl-5 space-y-2">
              {summary?.tasks?.map((task, index) => (
                <li key={index}>
                  <div className="text-gray-700">{task}</div>
                  <AddToTodoist task={task} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Original Text</h2>
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {summary?.originalText}
            </pre>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Created on:{" "}
          {summary?.createdAt && new Date(summary.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
