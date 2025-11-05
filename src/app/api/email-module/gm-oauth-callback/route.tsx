import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoDB/mongoDB";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=oauth_denied`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=invalid_params`
      );
    }

    // Decode state parameter to get email
    let email: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      email = stateData.email;
    } catch (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=invalid_state`
      );
    }

    // Exchange authorization code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/email-module/gm-oauth-callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=oauth_config`
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    // Validate token response
    if (!tokenData.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=no_refresh_token`
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Save tokens to database
    const tokenDocument = {
      email: email.toLowerCase(),
      refreshToken: tokenData.refresh_token,
      accessToken: tokenData.access_token,
      tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert the token document
    await db
      .collection("gmail-refresh-tokens")
      .updateOne(
        { email: email.toLowerCase() },
        { $set: tokenDocument },
        { upsert: true }
      );

    // Redirect back to email module with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?success=gmail_integrated`
    );
  } catch (error) {
    console.error("Error in gm-oauth-callback route:", error);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/recruiter-dashboard/inbox?error=callback_failed`
    );
  }
}
