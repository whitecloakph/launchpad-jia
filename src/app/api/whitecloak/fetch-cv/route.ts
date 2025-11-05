// TODO (Vince) - For Merging

import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const { db } = await connectMongoDB();
  const cv = await db.collection("applicant-cv").findOne({ email });

  return NextResponse.json(cv);
}
