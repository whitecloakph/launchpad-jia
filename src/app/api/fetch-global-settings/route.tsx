import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { db } = await connectMongoDB();

  const { fields } = body;

  let globalSettings = {};

  if (!fields || Object.keys(fields).length === 0) {
    globalSettings = await db
      .collection("global-settings")
      .findOne({ name: "global-settings" });
  }

  if (Object.keys(fields).length > 0) {
    globalSettings = await db
      .collection("global-settings")
      .findOne({ name: "global-settings" }, { projection: fields });
  }

  return NextResponse.json(globalSettings);
}
