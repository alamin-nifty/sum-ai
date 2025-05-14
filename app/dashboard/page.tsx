"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summaries, setSummaries] = useState([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  async function fetchSummaries() {
    if (status !== "authenticated") return;

    setIsLoadingSummaries(true);
    setSummaryError("");

    try {
      const response = await fetch("/api/summaries");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch summaries");
      }

      setSummaries(data.summaries);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoadingSummaries(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchSummaries();
    }
  }, [status]);

  async function fetchUserData() {
    try {
      const response = await fetch("/api/user");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Set minimal user data to allow the dashboard to function
      setUser({
        email: session?.user?.email || "",
        name: session?.user?.name || "",
        subscription: { status: "free" },
        usage: { summariesThisMonth: 0 },
      });
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError("");
    setSummary("");
    setTasks([]);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          source: "custom",
        }),
      });

      const data = await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Signed in as:{" "}
              <span className="font-semibold">{session?.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/integrations"
              className="text-gray-500 hover:text-gray-700"
            >
              Integrations
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Usage Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>

          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Plan:</span>
            <span className="font-medium capitalize">
              {user?.subscription?.status || "Free"}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">Summaries this month:</span>
            <span className="font-medium">
              {user?.usage?.summariesThisMonth || 0} / {10}
            </span>
          </div>

          {user?.usage?.lastSummaryDate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Last summary:</span>
              <span className="font-medium">
                {new Date(user.usage.lastSummaryDate).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="mt-4 bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${Math.min(
                  ((user?.usage?.summariesThisMonth || 0) / 10) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Summarization Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Summary</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Paste email or chat thread
              </label>
              <textarea
                id="text"
                rows={6}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Paste your email or chat content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? "Processing..." : "Summarize"}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {(summary || tasks.length > 0 || error) && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            {error && (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {summary && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-gray-700">{summary}</p>
              </div>
            )}

            {tasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Tasks</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {tasks.map((task, index) => (
                    <li key={index} className="text-gray-700">
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Summary History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Summary History</h2>

          {summaryError && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-700">{summaryError}</p>
            </div>
          )}

          {isLoadingSummaries ? (
            <div className="text-center py-4">
              <p>Loading summaries...</p>
            </div>
          ) : summaries.length > 0 ? (
            <div className="space-y-4">
              {summaries.map((summary: any) => (
                <div
                  key={summary._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/summary/${summary._id}`)
                  }
                >
                  <p className="font-medium">{summary.summary}</p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {new Date(summary.createdAt).toLocaleDateString()}
                    </p>
                    {summary.tasks.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Tasks:</p>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {summary.tasks
                            .slice(0, 2)
                            .map((task: string, i: number) => (
                              <li key={i}>{task}</li>
                            ))}
                          {summary.tasks.length > 2 && (
                            <li>+{summary.tasks.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">
                No summaries yet. Create your first summary!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
