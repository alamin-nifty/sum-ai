import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Todoist API credentials
const TODOIST_CLIENT_ID = process.env.TODOIST_CLIENT_ID;
const TODOIST_CLIENT_SECRET = process.env.TODOIST_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/integrations/todoist/callback`;

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Generate OAuth authorization URL
    const authUrl = `https://todoist.com/oauth/authorize?client_id=${TODOIST_CLIENT_ID}&scope=data:read_write&state=${session.user.id}&redirect_uri=${REDIRECT_URI}`;

    // Return the auth URL
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Todoist auth error:", error);
    return NextResponse.json(
      { error: "Failed to create Todoist auth URL" },
      { status: 500 }
    );
  }
}
