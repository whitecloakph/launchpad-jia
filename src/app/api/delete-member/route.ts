import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  const { orgID, email } = await req.json();

  const { db } = await connectMongoDB();

  const member = await db.collection("members").findOne({ email, orgID });

  if (!member) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  await db.collection("members").deleteOne({ email, orgID });

  return NextResponse.json(
    { message: "Member deleted successfully" },
    { status: 200 }
  );
}
