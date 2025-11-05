import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: NextRequest) {
  const { rating, feedback, interviewID, orgID, id } = await req.json();
  const { db } = await connectMongoDB();

  await db.collection("feedback").insertOne({
    rating,
    feedback,
    interviewID,
    createdAt: new Date(),
    orgID,
    id,
  });
  return NextResponse.json({ message: "Feedback submitted" });
}
