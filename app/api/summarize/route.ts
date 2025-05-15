import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import openai from "@/lib/openai";
import Summary from "@/models/Summary";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

    // 4. Parse request body
    const body = await req.json();
    const { text, source, metadata } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Limit text length for cost control
    const MAX_TEXT_LENGTH = 4000;
    const trimmedText = text.slice(0, MAX_TEXT_LENGTH);

    // Call OpenAI API
    console.log("Calling OpenAI API with text length:", trimmedText.length);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that summarizes text and extracts actionable tasks.
                    You MUST follow this exact format in your response:

                    SUMMARY: Write a concise 2-3 sentence summary of the text here.

                    TASKS:
                    - Task 1
                    - Task 2
                    - etc.

                    Do not deviate from this format or add any additional text. Start with SUMMARY: followed by your summary, then TASKS: followed by the list of tasks.`,
          },
          {
            role: "user",
            content: trimmedText,
          },
        ],
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      console.log("OpenAI response:", response);

      // Parse the response to extract summary and tasks
      let summary = "";
      let tasks: string[] = [];

      if (response) {
        // Try to extract summary using regex
        const summaryMatch = response.match(/SUMMARY:(.*?)(?=TASKS:|$)/);
        console.log("Summary match:", summaryMatch);

        if (summaryMatch && summaryMatch[1]) {
          summary = summaryMatch[1].trim();
        } else {
          // Fallback: if format doesn't match, use the whole response as summary
          summary = response.trim();
        }

        // Try to extract tasks
        const tasksMatch = response.match(/TASKS:(.*?)$/);
        console.log("Tasks match:", tasksMatch);

        if (tasksMatch && tasksMatch[1]) {
          tasks = tasksMatch[1]
            .split("\n")
            .map((task) => task.replace(/^-\s*/, "").trim())
            .filter((task) => task.length > 0);
        }
      }

      console.log("Parsed summary:", summary);
      console.log("Parsed tasks:", tasks);

      // 5. Save to database
      const summaryDoc = await Summary.create({
        userId: user._id,
        originalText: text,
        summary,
        tasks,
        source: source === "custom" ? "other" : source || "other",
        metadata: {
          ...metadata,
          timestamp: new Date(),
        },
      });

      // 6. Update user usage
      user.usage.summariesThisMonth += 1;
      user.usage.lastSummaryDate = new Date();
      await user.save();

      // 7. Return response
      return NextResponse.json({
        summary,
        tasks,
        id: summaryDoc._id,
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      return NextResponse.json(
        {
          error: "Error connecting to OpenAI API",
          details:
            openaiError instanceof Error
              ? openaiError.message
              : String(openaiError),
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Summarization error:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Mongoose validation errors
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { error: `Validation failed: ${error.message}` },
          { status: 400 }
        );
      }

      // OpenAI API errors
      if (error.message.includes("OpenAI")) {
        return NextResponse.json(
          { error: `OpenAI API error: ${error.message}` },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get URL parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch summaries for the user with pagination
    const summaries = await Summary.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Summary.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      summaries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}
