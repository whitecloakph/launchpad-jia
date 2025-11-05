import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  const { db } = await connectMongoDB();
  const { user } = await req.json();

  const orgs = await db
    .collection("members")
    .aggregate([
      { $match: { email: user.email } },
      {
        $lookup: {
          from: "organizations",
          let: { orgIdStr: "$orgID" },
          pipeline: [
            {
              $addFields: {
                _idStr: { $toString: "$_id" },
              },
            },
            {
              $match: {
                $expr: { 
                  $and: [
                    { $eq: ["$_idStr", "$$orgIdStr"] },
                    { $eq: ["$status", "active"] }
                  ]
                },
              },
            },
          ],
          as: "organizationDetails",
        },
      },
      { $unwind: "$organizationDetails" },
      {
        $addFields: {
          "organizationDetails.role": "$role",
          "organizationDetails.careers": "$careers",
        },
      },
    ])
    .toArray();

  const orgList = orgs.map((org) => org.organizationDetails);

  await db.collection("members").updateMany(
    { email: user.email },
    {
      $set: {
        name: user.name,
        image: user.picture || user.image,
        lastLogin: new Date(),
        status: "joined",
      },
    }
  );
  return NextResponse.json(orgList);
}

export async function GET() {
  const { db } = await connectMongoDB();

  const orgs = await db.collection("organizations").find({ status: "active" }).toArray();

  return NextResponse.json(orgs);
}
