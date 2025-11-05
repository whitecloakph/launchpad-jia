import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  try {
    const { db } = await connectMongoDB();
    const { orgID } = await req.json();
    const careers = await db
      .collection("careers")
      .find(
        { orgID },
        {
          projection: {
            questions: 0,
          },
        }
      )
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(careers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch careers" },
      { status: 500 }
    );
  }
}
