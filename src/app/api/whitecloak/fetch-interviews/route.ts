// TODO (Vince) - For Merging

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const { email } = await request.json();
  const interviews = await db
    .collection("interviews")
    .find({ email })
    .sort({ updatedAt: -1 })
    .toArray();

  return NextResponse.json(interviews);
}
