// TODO (Vince) - For Merging

import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function GET() {
  const { db } = await connectMongoDB();
  const orgID = "682d3fc222462d03263b0881";
  const careers = await db
    .collection("careers")
    .find({ orgID })
    .sort({ createdAt: -1 })
    .toArray();
  const activeCareers = careers.filter((career) => career.status === "active");

  return NextResponse.json(activeCareers);
}
