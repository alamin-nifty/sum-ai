import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import { createTodoistTask } from "@/lib/todoist";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, dueString } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Connect to DB and get user
    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user?.integrations?.todoist?.accessToken) {
      return NextResponse.json(
        { error: "Todoist not connected" },
        { status: 400 }
      );
    }

    const task = await createTodoistTask(
      user.integrations.todoist.accessToken,
      content,
      dueString
    );

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
