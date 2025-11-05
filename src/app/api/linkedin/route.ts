import { NextResponse } from "next/server";

export async function GET() {
  const redirectUri = "https://jia-alpha.vercel.app/api/linkedin/callback";
  const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid%20profile%20email`;

  return NextResponse.redirect(redirectUrl);
}
