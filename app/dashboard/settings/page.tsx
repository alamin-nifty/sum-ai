"use client";

import TodoistIntegration from "@/components/TodoistIntegration";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Integrations</h2>
          <TodoistIntegration />
        </div>
      </div>
    </div>
  );
}
