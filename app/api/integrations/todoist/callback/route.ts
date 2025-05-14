import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Todoist API credentials
const TODOIST_CLIENT_ID = process.env.TODOIST_CLIENT_ID;
const TODOIST_CLIENT_SECRET = process.env.TODOIST_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/integrations/todoist/callback`;

export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Check for errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=${error}`
      );
    }

    // Check if code and state exist
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=invalid_callback`
      );
    }

    // Exchange code for token
    const tokenResponse = await fetch(
      "https://todoist.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: TODOIST_CLIENT_ID!,
          client_secret: TODOIST_CLIENT_SECRET!,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Todoist token error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Connect to database
    await connectDB();

    // Store token in user's profile
    await User.findByIdAndUpdate(state, {
      "integrations.todoist": {
        accessToken: access_token,
        // Todoist tokens don't expire, so we don't need refreshToken or expiresAt
      },
    });

    // Redirect back to dashboard
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?integration=todoist&success=true`
    );
  } catch (error) {
    console.error("Todoist callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?error=integration_failed`
    );
  }
}
