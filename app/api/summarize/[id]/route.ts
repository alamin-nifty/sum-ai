import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Summary from "@/models/Summary";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid summary ID" },
        { status: 400 }
      );
    }

    // Find the summary
    const summary: any = await Summary.findById(params.id).lean();

    // Check if summary exists and belongs to the user
    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    if (summary.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
