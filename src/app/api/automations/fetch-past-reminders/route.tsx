import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { orgID } = await request.json();
    const { db } = await connectMongoDB();

    // Fetch all interviews that have had reminders sent
    const interviews = await db
      .collection("interviews")
      .find({
        orgID: orgID || "682d3fc222462d03263b0881",
        lastAutoReminder: { $exists: true, $ne: null },
        email: { $not: /@whitecloak\.com$/i },
        jobTitle: {
          $nin: ["HR Employer Branding", "10x Developer"],
        },
      })
      .sort({ lastAutoReminder: -1 }) // Sort by most recent reminder first
      .toArray();

    // Add calculated fields to each interview
    const results = interviews.map((interview) => {
      const lastReminderDate = new Date(interview.lastAutoReminder);
      const now = new Date();
      const timeSinceReminder = now.getTime() - lastReminderDate.getTime();
      const daysSinceReminder = Math.floor(
        timeSinceReminder / (1000 * 60 * 60 * 24)
      );
      const hoursSinceReminder = Math.floor(
        timeSinceReminder / (1000 * 60 * 60)
      );
      const minutesSinceReminder = Math.floor(timeSinceReminder / (1000 * 60));

      let timeSinceText = "";
      if (daysSinceReminder > 0) {
        timeSinceText = `${daysSinceReminder} day${
          daysSinceReminder > 1 ? "s" : ""
        } ago`;
      } else if (hoursSinceReminder > 0) {
        timeSinceText = `${hoursSinceReminder} hour${
          hoursSinceReminder > 1 ? "s" : ""
        } ago`;
      } else if (minutesSinceReminder > 0) {
        timeSinceText = `${minutesSinceReminder} minute${
          minutesSinceReminder > 1 ? "s" : ""
        } ago`;
      } else {
        timeSinceText = "Just now";
      }

      return {
        ...interview,
        timeSinceReminder: timeSinceText,
        daysSinceReminder,
      };
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching past reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch past reminders",
      },
      { status: 500 }
    );
  }
}
