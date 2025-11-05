// TODO (Vince) - For Merging

import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { cvData, email, fileInfo, name } = await request.json();
  const { db } = await connectMongoDB();

  await db.collection("applicant-cv").updateOne(
    {
      email,
    },
    {
      $set: {
        digitalCV: cvData.digitalCV,
        errorRemarks: cvData.errorRemarks,
        fileInfo,
        name,
        updatedAt: Date.now(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({
    message: "CV saved successfully",
  });
}
