import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST() {
  try {
    const { db } = await connectMongoDB();

    const careers = await db
      .collection("careers")
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
        {
          $match: {
            $and: [
              { status: "active" },
              { "organization.tier": { $in: ["corporate", "enterprise"] } },
            ],
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(careers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch careers" },
      { status: 500 }
    );
  }
}
