import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { db } = await connectMongoDB();

    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Fetch all interviews with the specified filter criteria
    const interviews = await db
      .collection("interviews")
      .find({
        orgID: "682d3fc222462d03263b0881",
        status: "For CV Upload",
        email: { $not: /@whitecloak\.com$/i },
        jobTitle: {
          $nin: ["HR Employer Branding", "10x Developer"],
        },
        currentStep: "Applied",
        applicationStatus: { $ne: "Dropped" },
        // $or: [
        //   { lastAutoReminder: { $exists: false } },
        //   { lastAutoReminder: { $lt: twoDaysAgo } },
        // ],
      })
      .toArray();

    // Add reminderType field to each interview
    const results = interviews.map((interview) => ({
      ...interview,
      reminderType: "Remind to Submit CV",
    }));

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching interviews for CV reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch interviews for CV reminders",
      },
      { status: 500 }
    );
  }
}
