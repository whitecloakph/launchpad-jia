import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoDB/mongoDB";

// Function to refresh access token
async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Function to get valid access token
async function getValidAccessToken(email: string) {
  const { db } = await connectToDatabase();

  const tokenDoc = await db
    .collection("gmail-refresh-tokens")
    .findOne({ email: email.toLowerCase() });

  if (!tokenDoc) {
    throw new Error("No Gmail token found for user");
  }

  // Check if access token is expired
  const now = new Date();
  const tokenExpiry = new Date(tokenDoc.tokenExpiry);

  if (now >= tokenExpiry) {
    // Refresh the access token
    const newAccessToken = await refreshAccessToken(tokenDoc.refreshToken);

    // Update the token in database
    await db.collection("gmail-refresh-tokens").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          accessToken: newAccessToken,
          tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour
          updatedAt: new Date(),
        },
      }
    );

    return newAccessToken;
  }

  return tokenDoc.accessToken;
}

export async function POST(request: NextRequest) {
  try {
    const { fromEmail, toEmail, subject, message, threadId, isReply } =
      await request.json();

    // Validate required fields
    if (!fromEmail || !toEmail || !subject || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["fromEmail", "toEmail", "subject", "message"],
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail) || !emailRegex.test(toEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(fromEmail);

    // Create email message
    const emailContent = [
      `From: ${fromEmail}`,
      `To: ${toEmail}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\r\n");

    // Encode the email content
    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Prepare the request body
    const requestBody: any = {
      raw: encodedEmail,
    };

    // If this is a reply, include the thread ID
    if (isReply && threadId) {
      // Validate thread ID format (should be a valid Gmail message/thread ID)
      if (typeof threadId === "string" && threadId.length > 0) {
        requestBody.threadId = threadId;
        console.log("Including thread ID for reply:", threadId);
      } else {
        console.warn("Invalid thread ID provided:", threadId);
        // Continue without thread ID - Gmail will create a new thread
      }
    } else if (isReply) {
      console.warn(
        "Reply requested but no thread ID provided - will create new thread"
      );
    }

    console.log("Sending email with request body:", {
      hasThreadId: !!requestBody.threadId,
      isReply,
      subject,
    });

    // Send email via Gmail API
    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!gmailResponse.ok) {
      const errorData = await gmailResponse.text();
      console.error("Gmail API error:", {
        status: gmailResponse.status,
        statusText: gmailResponse.statusText,
        error: errorData,
        requestBody: requestBody,
      });

      // Handle specific error cases
      if (gmailResponse.status === 404) {
        throw new Error(
          "Thread not found. The original email may have been deleted or moved."
        );
      } else if (gmailResponse.status === 400) {
        throw new Error(
          "Invalid request. Please check the email format and try again."
        );
      } else {
        throw new Error(
          `Gmail API Error: ${gmailResponse.status} - ${errorData}`
        );
      }
    }

    const result = await gmailResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.id,
        threadId: result.threadId,
        sentAt: new Date().toISOString(),
      },
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error in gm-send-email route:", error);

    return NextResponse.json(
      {
        error: "Failed to send email",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
