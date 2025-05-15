"use client";

import DashboardNav from "@/components/DashboardNav";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    try {
      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Profile Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">Subscription</h2>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium capitalize">
                    {user?.subscription?.status || "Free"} Plan
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.subscription?.status === "free"
                      ? "Limited to 10 summaries per month"
                      : "Unlimited summaries"}
                  </p>
                </div>
                {user?.subscription?.status === "free" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">Connected Accounts</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Todoist</p>
                    <p className="text-sm text-gray-500">
                      {user?.integrations?.todoist
                        ? "Connected"
                        : "Not connected"}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/integrations"
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                  >
                    {user?.integrations?.todoist ? "Manage" : "Connect"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
