import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const { db } = await connectMongoDB();
    const user = await db.collection("admins").findOne({ email });

    return NextResponse.json({ isSuperAdmin: !!user });
  } catch (error) {
    console.error("Error checking super admin:", error);
    return NextResponse.json({ isSuperAdmin: false }, { status: 500 });
  }
}