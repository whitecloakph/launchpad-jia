import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: NextRequest) {
  const { db } = await connectMongoDB();
  const { orgID } = await req.json();

  const feedback = await db
    .collection("feedback")
    .aggregate([
      { $match: { orgID } },
      {
        $lookup: {
          from: "interviews",
          localField: "interviewID",
          foreignField: "interviewID",
          as: "interviewDetails",
        },
      },
      {
        $unwind: {
          path: "$interviewDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
    ])
    .toArray();

  return NextResponse.json(feedback);
}
