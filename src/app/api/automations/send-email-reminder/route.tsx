import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/Email";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message, _id } = body;

    // Validate required parameters
    if (!to || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters: to, subject, and message are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Send email using the sendEmail function
    const result = await sendEmail({
      recipient: to,
      subject: subject,
      html: message,
    });

    if (result.success) {
      // Update lastAutoReminder in database if _id is provided
      if (_id) {
        try {
          const { db } = await connectMongoDB();
          await db
            .collection("interviews")
            .updateOne(
              { _id: new ObjectId(_id) },
              { $set: { lastAutoReminder: new Date() } }
            );
        } catch (dbError) {
          console.error("Error updating lastAutoReminder:", dbError);
          // Don't fail the email sending if DB update fails
        }
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      console.error("Email sending failed:", result.message);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-email-reminder endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
