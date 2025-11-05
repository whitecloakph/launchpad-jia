import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";

export async function POST(request: NextRequest) {
  const { name, tier, image, user } = await request.json();

  const { db } = await connectMongoDB();

  const org = await db.collection("organizations").insertOne({
    name,
    tier,
    image,
    creator: user.email,
    orgID: guid(),
    createdAt: new Date(),
  });

  await db.collection("members").insertOne({
    image: user.image,
    name: user.name,
    email: user.email,
    orgID: org.insertedId.toString(),
    role: "admin",
    addedAt: new Date(),
    lastLogin: new Date(),
    status: "joined",
  });

  return NextResponse.json(org);
}
