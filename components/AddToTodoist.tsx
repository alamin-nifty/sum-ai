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
        throw new Error(data.error || "Failed to add task to Todoist");
      }

      setMessage("Task added to Todoist successfully");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex gap-2 items-center">
        <Input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          placeholder="Due date (e.g., today, tomorrow)"
          className="max-w-xs"
        />
        <Button
          onClick={addToTodoist}
          disabled={isAdding}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isAdding ? "Adding..." : "Add to Todoist"}
        </Button>
      </div>

      {message && <p className="text-green-600 text-sm mt-1">{message}</p>}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
