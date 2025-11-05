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

    // Check if user already has a refresh token
    const existingToken = await db
      .collection("gmail-refresh-tokens")
      .findOne({ email: email.toLowerCase() });

    if (existingToken) {
      return NextResponse.json({
        success: true,
        data: {
          refreshToken: existingToken.refreshToken,
        },
        message: "Gmail integration already enabled",
      });
    }

    // Generate OAuth2 authorization URL
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/email-module/gm-oauth-callback`;
    const scope = ["openid", "email", "profile", "https://mail.google.com/"];

    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth client ID not configured" },
        { status: 500 }
      );
    }

    // Create state parameter for security
    const state = Buffer.from(JSON.stringify({ email })).toString("base64");

    // Generate authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scope.join(" "));
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    authUrl.searchParams.append("state", state);

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl.toString(),
        state: state,
      },
      message: "OAuth authorization URL generated",
    });
  } catch (error) {
    console.error("Error in gm-enable-extension route:", error);

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
