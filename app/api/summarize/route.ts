import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Summary from "@/models/Summary";
import User from "@/models/User";
import { SummarizeRequestSchema } from "@/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Free tier limits
const FREE_TIER_MONTHLY_LIMIT = 10;

export async function POST(req: Request) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Get user and check limits
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check free tier limits
    if (
      user.subscription.status === "free" &&
      user.usage.summariesThisMonth >= FREE_TIER_MONTHLY_LIMIT
    ) {
      return NextResponse.json(
        { error: "Monthly limit reached. Please upgrade to Pro." },
        { status: 403 }
      );
    }

    // 4. Validate request body
    const body = await req.json();
    const validation = SummarizeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error },
        { status: 400 }
      );
    }

    const { text, source, metadata } = validation.data;

    // 5. Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes text and extracts actionable tasks. Provide a concise summary (2-3 sentences) and a list of tasks.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // 6. Parse the response
    const [summary, ...tasks] = response.split("\n").filter(Boolean);
    const taskList = tasks.map((task) => task.replace(/^[-*]\s*/, ""));

    // 7. Save to database
    const summaryDoc = await Summary.create({
      userId: user._id,
      originalText: text,
      summary,
      tasks: taskList,
      source,
      metadata: {
        ...metadata,
        timestamp: new Date(),
      },
    });

    // 8. Update user usage
    user.usage.summariesThisMonth += 1;
    user.usage.lastSummaryDate = new Date();
    await user.save();

    // 9. Return response
    return NextResponse.json({
      summary,
      tasks: taskList,
      id: summaryDoc._id,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
