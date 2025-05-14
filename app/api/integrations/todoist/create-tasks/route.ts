import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Summary from "@/models/Summary";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { summaryId } = body;

    if (!summaryId) {
      return NextResponse.json(
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user data
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has Todoist integration
    if (!user.integrations?.todoist?.accessToken) {
      return NextResponse.json(
        { error: "Todoist integration not found" },
        { status: 400 }
      );
    }

    // Get summary
    const summary = await Summary.findById(summaryId);
    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    // Check if summary belongs to user
    if (summary.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create project in Todoist
    const createProjectResponse = await fetch(
      "https://api.todoist.com/rest/v2/projects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.integrations.todoist.accessToken}`,
        },
        body: JSON.stringify({
          name: `Summary: ${summary.summary.substring(0, 30)}...`,
        }),
      }
    );

    if (!createProjectResponse.ok) {
      const error = await createProjectResponse.text();
      console.error("Todoist project creation error:", error);
      return NextResponse.json(
        { error: "Failed to create Todoist project" },
        { status: 500 }
      );
    }

    const projectData = await createProjectResponse.json();
    const projectId = projectData.id;

    // Create tasks in Todoist
    const createdTasks = [];
    for (const task of summary.tasks) {
      const createTaskResponse = await fetch(
        "https://api.todoist.com/rest/v2/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.integrations.todoist.accessToken}`,
          },
          body: JSON.stringify({
            content: task,
            project_id: projectId,
          }),
        }
      );

      if (createTaskResponse.ok) {
        const taskData = await createTaskResponse.json();
        createdTasks.push(taskData);
      }
    }

    return NextResponse.json({
      success: true,
      project: projectData,
      tasks: createdTasks,
    });
  } catch (error) {
    console.error("Todoist create tasks error:", error);
    return NextResponse.json(
      { error: "Failed to create Todoist tasks" },
      { status: 500 }
    );
  }
}
