import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
export async function POST(request: Request) {
  const body = await request.json();

  let { userID } = body;

  if (!userID) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const { db } = await connectMongoDB();

  let userCVData = null;

  let userData = await db.collection("affiliations").findOne({
    _id: new ObjectId(userID),
  });

  if (!userData) {
    return NextResponse.json({ error: "User not found" });
  }

  let userCV = await db.collection("applicant-cv").findOne({
    email: userData.applicantInfo.email,
  });

  if (!userCV) {
    return NextResponse.json({
      error: "CV not found, user has not uploaded a CV",
    });
  }

  userCVData = {
    userData: userData.applicantInfo,
    userCV: userCV,
  };

  return NextResponse.json(userCVData);
}
