import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const body = await request.json();
  const reportJobModel = db.collection("report-job");

  await reportJobModel.insertOne(body);

  return NextResponse.json({ success: true });
}
