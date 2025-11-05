import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const { email, interviewID } = await request.json();
  const interviewModel = db.collection("interviews");
  const matchConditions: any = [{ email }];

  if (interviewID != "all") {
    matchConditions.push({ id: interviewID });
  }

  matchConditions.push({
    applicationStatus: {
      $in: ["Ongoing", "Dropped", "Cancelled"],
    },
  });

  const interviews = await interviewModel
    .aggregate([
      {
        $lookup: {
          from: "organizations",
          let: { orgID: "$orgID" },
          pipeline: [
            {
              $addFields: {
                _id: { $toString: "$_id" },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$orgID"],
                },
              },
            },
          ],
          as: "organization",
        },
      },
      {
        $unwind: {
          path: "$organization",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: { $and: matchConditions } },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    .toArray();

  if (interviewID != "all" && interviews.length == 0) {
    return NextResponse.json({
      error: "No application found for the given ID.",
    });
  }

  return NextResponse.json(interviews);
}
