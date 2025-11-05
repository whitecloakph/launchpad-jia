import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { getStage } from "@/lib/Utils";

export async function GET(request: Request) {
  const { db } = await connectMongoDB();
  const { searchParams } = new URL(request.url);
  const candidateEmail = searchParams.get("candidateEmail");
  const orgID = searchParams.get("orgID");
  try {
    const interviews = await db.collection("interviews").find({
        email: candidateEmail,
        orgID: orgID,
    }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(interviews.map((interview) => ({
        ...interview,
        stage: getStage(interview),
    })));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}