"use client";

import DashboardNav from "@/components/DashboardNav";
import { useSession } from "next-auth/react";
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
      console.log(
        "Submitting text for summarization:",
        text.length,
        "characters"
      );
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
      console.log("Summarization API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize text");
      }

      setSummary(data.summary);
      setTasks(data.tasks || []);

      // Refresh summaries list after creating a new one
      fetchSummaries();
    } catch (err) {
      console.error("Summarization error in dashboard:", err);
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
      <DashboardNav />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Usage Statistics */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Usage Statistics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Plan</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                      {user?.subscription?.status || "Free"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Summaries This Month
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {user?.usage?.summariesThisMonth || 0} / {10}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Last Summary
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {user?.usage?.lastSummaryDate
                        ? new Date(
                            user.usage.lastSummaryDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Usage</span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.min(
                    ((user?.usage?.summariesThisMonth || 0) / 10) * 100,
                    100
                  ).toFixed(0)}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((user?.usage?.summariesThisMonth || 0) / 10) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Summarization Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Create Summary
            </h2>
          </div>
          <div className="p-6">
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
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Summarize"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        {(summary || tasks.length > 0 || error) && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Results</h2>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 p-4 rounded-md mb-4">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Summary
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">{summary}</p>
                  </div>
                </div>
              )}

              {tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tasks
                  </h3>
                  <ul className="divide-y divide-gray-200">
                    {tasks.map((task, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-700">{task}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary History */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Summary History</h2>

            {/* Search and filter options */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search summaries..."
                className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                // We'll implement search in a future update
              />
              <select
                className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                // We'll implement filtering in a future update
              >
                <option value="all">All sources</option>
                <option value="custom">Custom</option>
                <option value="gmail">Gmail</option>
                <option value="slack">Slack</option>
              </select>
            </div>
          </div>

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
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/summary/${summary._id}`)
                  }
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{summary.summary}</p>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {summary.source === "custom" ? "Manual" : summary.source}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {new Date(summary.createdAt).toLocaleDateString()} at{" "}
                      {new Date(summary.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                            <li className="text-blue-500">
                              +{summary.tasks.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500 mb-4">
                No summaries yet. Create your first summary!
              </p>
              <div className="animate-bounce mx-auto w-16 h-16 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Pagination will be added in a future update */}
        </div>
      </main>
    </div>
  );
}
