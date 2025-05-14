export async function createTodoistTask(
  accessToken: string,
  content: string,
  dueString?: string
) {
  const response = await fetch("https://api.todoist.com/rest/v2/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      due_string: dueString || "today",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Todoist task: ${error}`);
  }

  return response.json();
}
