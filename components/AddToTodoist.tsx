"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type AddToTodoistProps = {
  task: string;
};

export default function AddToTodoist({ task }: AddToTodoistProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [dueDate, setDueDate] = useState("today");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkTodoistConnection = async () => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      setIsConnected(!!data.integrations?.todoist);
    } catch (error) {
      console.error("Error checking Todoist connection:", error);
      setIsConnected(false);
    }
  };

  // Check connection status when component mounts
  useState(() => {
    checkTodoistConnection();
  });

  const addToTodoist = async () => {
    setIsAdding(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/todoist/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: task,
          dueString: dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error?.includes("Todoist not connected")
        ) {
          setIsConnected(false);
          throw new Error(
            "Todoist account not connected. Please connect in Integrations."
          );
        }
        throw new Error(data.error || "Failed to add task to Todoist");
      }

      setMessage("Task added to Todoist successfully");

      // Reset form after success
      setDueDate("today");
      setIsExpanded(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="mt-2 p-2 bg-yellow-50 rounded">
        <p className="text-sm text-yellow-800">
          To add tasks to Todoist, please{" "}
          <a
            href="/dashboard/integrations"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            connect your Todoist account
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          variant="outline"
          className="text-sm"
        >
          Add to Todoist
        </Button>
      ) : (
        <>
          <div className="flex gap-2 items-center flex-col sm:flex-row">
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Due date (e.g., today, tomorrow)"
              className="max-w-xs text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={addToTodoist}
                disabled={isAdding}
                size="sm"
                variant="default"
                className="flex items-center gap-1"
              >
                {isAdding ? "Adding..." : "Add"}
              </Button>
              <Button
                onClick={() => {
                  setIsExpanded(false);
                  setError("");
                  setMessage("");
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>

          {message && <p className="text-green-600 text-sm mt-1">{message}</p>}
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </>
      )}
    </div>
  );
}
