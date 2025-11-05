import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { db } = await connectMongoDB();
    const { orgID } = await request.json();
    const results = await db
      .collection("interviews")
      .find({ orgID })
      .sort({ completedAt: -1 })
      .toArray();

    return NextResponse.json(results);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
