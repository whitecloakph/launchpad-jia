// app/api/auth/linkedin/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code)
    return NextResponse.json({ error: "No code in query" }, { status: 400 });

  const redirectUri = "https://jia-alpha.vercel.app/api/linkedin/callback";
  const tokenRes = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const tokenData = tokenRes.data;
  const accessToken = tokenData.access_token;

  // 🔑 Get user info from OIDC endpoint
  const userInfoRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const userInfo = userInfoRes.data;

  return NextResponse.json({ userInfo });
}
