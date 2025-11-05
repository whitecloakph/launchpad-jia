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
    const errorText = await response.text();
    console.error("Token refresh error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(
      `Failed to refresh access token: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log("Token refresh successful:", {
    access_token_length: data.access_token?.length || 0,
    expires_in: data.expires_in,
    token_type: data.token_type,
  });

  if (!data.access_token) {
    throw new Error("No access token received from refresh");
  }

  return data.access_token;
}

// Function to get valid access token
async function getValidAccessToken(email: string) {
  const { db } = await connectToDatabase();

  const tokenDoc = await db
    .collection("gmail-refresh-tokens")
    .findOne({ email: email.toLowerCase() });

  if (!tokenDoc) {
    console.error("No Gmail token found for email:", email);
    throw new Error("No Gmail token found for user");
  }

  console.log("Token document found:", {
    email: tokenDoc.email,
    hasRefreshToken: !!tokenDoc.refreshToken,
    hasAccessToken: !!tokenDoc.accessToken,
    tokenExpiry: tokenDoc.tokenExpiry,
  });

  // Check if access token is expired
  const now = new Date();
  const tokenExpiry = new Date(tokenDoc.tokenExpiry);

  console.log("Token expiry check:", {
    now: now.toISOString(),
    tokenExpiry: tokenExpiry.toISOString(),
    isExpired: now >= tokenExpiry,
  });

  if (now >= tokenExpiry) {
    console.log("Token expired, refreshing...");
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
    const { email, maxResults = 20 } = await request.json();

    console.log("Fetch emails request:", { email, maxResults });

    // Validate email input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Get valid access token
    console.log("Getting valid access token for:", email);
    const accessToken = await getValidAccessToken(email);
    console.log("Access token obtained, length:", accessToken.length);

    // First, test the Gmail API with a simple profile request
    console.log("Testing Gmail API access...");
    const profileResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Gmail Profile API Error:", {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        error: errorText,
      });
      throw new Error(
        `Gmail Profile API Error: ${profileResponse.status} - ${errorText}`
      );
    }

    const profileData = await profileResponse.json();
    console.log("Gmail profile access successful:", profileData);

    // Fetch emails from Gmail API
    const gmailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      console.error("Gmail API Error Response:", {
        status: gmailResponse.status,
        statusText: gmailResponse.statusText,
        error: errorText,
        accessToken: accessToken.substring(0, 20) + "...",
      });
      throw new Error(
        `Gmail API Error: ${gmailResponse.status} - ${errorText}`
      );
    }

    const gmailData = await gmailResponse.json();
    const messages = gmailData.messages || [];

    // Fetch detailed information for each message
    const emailDetails = await Promise.all(
      messages.map(async (message: any) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!detailResponse.ok) {
          return null;
        }

        const detail = await detailResponse.json();

        // Extract email headers
        const headers = detail.payload?.headers || [];
        const subject =
          headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
        const from = headers.find((h: any) => h.name === "From")?.value || "";
        const to = headers.find((h: any) => h.name === "To")?.value || "";
        const date = headers.find((h: any) => h.name === "Date")?.value || "";

        // Extract email body
        let body = "";
        if (detail.payload?.body?.data) {
          body = Buffer.from(detail.payload.body.data, "base64").toString();
        } else if (detail.payload?.parts) {
          const textPart = detail.payload.parts.find(
            (part: any) => part.mimeType === "text/plain"
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString();
          }
        }

        // Parse sender information
        const fromMatch = from.match(/([^<]+)<([^>]+)>/) || [null, from, from];
        const senderName = fromMatch[1]?.trim() || from;
        const senderEmail = fromMatch[2]?.trim() || from;

        // Generate avatar URL
        const avatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(
          senderEmail
        )}`;

        // Determine if email is automated or direct
        const isAutomated =
          subject.toLowerCase().includes("automated") ||
          subject.toLowerCase().includes("notification") ||
          from.toLowerCase().includes("noreply") ||
          from.toLowerCase().includes("no-reply");

        return {
          id: message.id,
          threadId: detail.threadId, // Include the actual thread ID
          name: senderName,
          avatar: avatarUrl,
          role: "Email Sender", // You can enhance this with role detection
          subject: subject,
          snippet: body.substring(0, 100) + (body.length > 100 ? "..." : ""),
          timeAgo: formatTimeAgo(new Date(date)),
          isNew: !detail.labelIds?.includes("READ"),
          unreadCount: detail.labelIds?.includes("UNREAD") ? 1 : 0,
          messageCount: 1,
          hasAttachment:
            detail.payload?.parts?.some(
              (part: any) => part.filename && part.filename.length > 0
            ) || false,
          stage: isAutomated ? "Automated" : "Direct",
          emailContent: {
            subject: subject,
            messages: [
              {
                id: message.id,
                sender: {
                  name: senderName,
                  email: senderEmail,
                  avatar: avatarUrl,
                },
                recipient: {
                  name: email,
                  email: email,
                },
                timestamp: formatDate(new Date(date)),
                type: isAutomated ? "automated" : "direct",
                content: body,
                signature: {
                  name: senderName,
                  title: "",
                  contact: senderEmail,
                },
              },
            ],
          },
        };
      })
    );

    // Filter out null results and return
    const validEmails = emailDetails.filter((email) => email !== null);

    return NextResponse.json({
      success: true,
      data: {
        emails: validEmails,
        total: validEmails.length,
        nextPageToken: gmailData.nextPageToken,
      },
    });
  } catch (error) {
    console.error("Error in gm-fetch-emails route:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch emails",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
