import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Explicitly type the result as IUser to fix the TypeScript errors
    const user = (await User.findOne({
      email: session.user.email,
    }).lean()) as unknown as IUser;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only return necessary user data (avoid exposing sensitive information)
    return NextResponse.json({
      email: user.email,
      name: user.name,
      image: user.image,
      subscription: user.subscription,
      usage: user.usage,
      integrations: {
        todoist: !!user.integrations?.todoist?.accessToken,
        asana: !!user.integrations?.asana?.accessToken,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
