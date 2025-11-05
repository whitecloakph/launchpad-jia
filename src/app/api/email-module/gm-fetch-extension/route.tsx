import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoDB/mongoDB";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the email
    const { email } = await request.json();

    // Validate email input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Query the "gmail-refresh-tokens" collection for the matching email
    const gmailTokenEntry = await db
      .collection("gmail-refresh-tokens")
      .findOne({ email: email.toLowerCase() });

    // If no matching entry found
    if (!gmailTokenEntry) {
      return NextResponse.json(
        { error: "No Gmail refresh token found for this email" },
        { status: 404 }
      );
    }

    // Return the matching entry (excluding sensitive fields if needed)
    return NextResponse.json({
      success: true,
      data: {
        refreshToken: gmailTokenEntry.refreshToken,
      },
    });
  } catch (error) {
    console.error("Error in gm-fetch-extension route:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
