import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { db } = await connectMongoDB();
  const { _id, ...updateData } = body;

  await db.collection("global-settings").updateOne(
    {
      name: "global-settings",
    },
    { $set: updateData },
    { upsert: true }
  );

  return NextResponse.json({
    message: "Settings saved successfully",
  });
}

export async function GET() {
  const { db } = await connectMongoDB();
  const settings = await db.collection("global-settings").findOne({});

  return NextResponse.json(settings);
}
