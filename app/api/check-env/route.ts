import { NextResponse } from "next/server";

export async function GET() {
  // Check for required environment variables without exposing actual values
  const envCheck = {
    mongodbUri: !!process.env.MONGODB_URI,
    googleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    todoistClientId: !!process.env.TODOIST_CLIENT_ID,
    todoistClientSecret: !!process.env.TODOIST_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || "not set",
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV || "not set",
    openaiApiKey: !!process.env.OPENAI_API_KEY,
  };

  return NextResponse.json({
    status: "ok",
    environmentCheck: envCheck,
  });
}
