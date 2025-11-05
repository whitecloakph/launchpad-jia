import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(request: Request) {
  const { db } = await connectMongoDB();
  const { searchParams } = new URL(request.url);
  const careerID = searchParams.get("careerID");
  try {
    const interviews = await db.collection("interviews").find({ 
      id: careerID, 
      currentStep: { $ne: "Applied" } 
    }).toArray();
    return NextResponse.json(interviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}