import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const { jobID } = await request.json();
  const careerModel = db.collection("careers");
  const matchConditions: any = [
    { status: "active" },
    { "organization.tier": { $in: ["corporate", "enterprise"] } },
  ];

  if (jobID != "all") {
    if (!ObjectId.isValid(jobID)) {
      return NextResponse.json({ error: "No job found for the given ID." });
    }

    matchConditions.push({ _id: new ObjectId(jobID) });
  }

  const careers = await careerModel
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

  if (jobID != "all" && careers.length == 0) {
    return NextResponse.json({ error: "No job found for the given ID." });
  }

  return NextResponse.json(careers);
}
