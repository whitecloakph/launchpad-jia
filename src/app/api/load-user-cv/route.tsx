import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
export async function POST(request: Request) {
  const body = await request.json();
  const { db } = await connectMongoDB();

  let { email, uid } = body;

  let userCV = null;

  if (email && !uid) {
    userCV = await db.collection("applicant-cv").findOne({
      email: email,
    });

    if (uid && !email) {
      userCV = await db.collection("applicant-cv").findOne({
        _id: new ObjectId(uid),
      });
    }
  }
  return NextResponse.json(userCV);
}
