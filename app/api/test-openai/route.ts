import openai from "@/lib/openai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Try a simple completion to verify API key works
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Hello, are you working?",
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      status: "ok",
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("OpenAI API test error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to OpenAI API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
