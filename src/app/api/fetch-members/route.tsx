import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  try {
    const { db } = await connectMongoDB();
    const { orgID } = await req.json();

    const members = await db.collection("members").find({ orgID }).toArray();

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
