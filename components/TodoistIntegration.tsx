"use client";

import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function TodoistIntegration() {
  const { data: session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTodoistConnected, setIsTodoistConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(
            `/api/user/integrations?email=${session.user.email}`
          );
          const data = await res.json();
          if (data.integrations?.todoist?.accessToken) {
            setIsTodoistConnected(true);
          }
        } catch (error) {
          console.error("Error checking Todoist connection:", error);
        }
      }
    };

    checkConnection();
  }, [session]);

  const connectTodoist = async () => {
    setIsConnecting(true);
    await signIn("todoist", { callbackUrl: "/dashboard/settings" });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">Todoist Integration</h3>
      <p className="text-sm text-gray-600 mb-4">
        Connect your Todoist account to send tasks directly from summaries.
      </p>

      {isTodoistConnected ? (
        <div className="flex items-center text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Connected to Todoist
        </div>
      ) : (
        <Button
          onClick={connectTodoist}
          disabled={isConnecting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isConnecting ? "Connecting..." : "Connect Todoist"}
        </Button>
      )}
    </div>
  );
}
