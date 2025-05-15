"use client";

import DashboardNav from "@/components/DashboardNav";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectingTodoist, setConnectingTodoist] = useState(false);
  const [connectingAsana, setConnectingAsana] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  async function fetchUserData() {
    setLoading(true);
    try {
      const response = await fetch("/api/user");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user data");
      }

      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function connectTodoist() {
    setConnectingTodoist(true);
    try {
      const response = await fetch("/api/integrations/todoist");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect to Todoist");
      }

      // Redirect to Todoist auth URL
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setConnectingTodoist(false);
    }
  }

  async function disconnectTodoist() {
    try {
      const response = await fetch("/api/integrations/todoist/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to disconnect Todoist");
      }

      fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  if (loading) {
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
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Task Management</h2>
          <p className="text-gray-600 mb-6">
            Connect your task management tools to export tasks directly from
            summaries.
          </p>

          <div className="space-y-6">
            {/* Todoist Integration */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Todoist</h3>
                  <p className="text-sm text-gray-500">
                    Manage your tasks and projects in Todoist.
                  </p>
                </div>
                <div>
                  {user?.integrations?.todoist?.accessToken ? (
                    <button
                      onClick={disconnectTodoist}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectTodoist}
                      disabled={connectingTodoist}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400"
                    >
                      {connectingTodoist ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>
              </div>
              {user?.integrations?.todoist?.accessToken && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Connected to Todoist
                </div>
              )}
            </div>

            {/* Asana Integration (placeholder for future implementation) */}
            <div className="border rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Asana</h3>
                  <p className="text-sm text-gray-500">
                    Manage your tasks and projects in Asana.
                  </p>
                </div>
                <div>
                  <button
                    disabled
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
