import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/Email";

export async function POST(request: Request) {
  const { data } = await request.json();

  let interviewData = { ...data };

  const { db } = await connectMongoDB();

  await db.collection("interviews").updateOne(
    {
      _id: new ObjectId(interviewData._id),
    },
    {
      $set: {
        tabSwitchCount: interviewData.tabSwitchCount,
        completedAt: Date.now(),
        updatedAt: Date.now(),
        status: "For AI Interview Review",
        currentStep: "AI Interview",
      },
    }
  );

  await sendEmail({
    recipient: interviewData.email,
    html: `
      <div>
        <p>Dear ${interviewData.name},</p>
        <p>Your interview has been successfully completed.</p>
        <p>Please wait for the result of your interview as it will be screened and graded.</p>
      </div>
    `,
  });

  // Update career lastActivityAt to current date
  if (interviewData.id) {
    await db.collection("careers").updateOne(
      { id: interviewData.id },
      { $set: { lastActivityAt: new Date() } }
    );
  }

  const interviewTransaction = {
    interviewUID: interviewData._id.toString(),
    fromStage: "Pending AI Interview",
    toStage: "AI Interview Review",
    action: "Auto-Promoted",
    updatedBy: {
        name: "Jia",
    },
  }

  await db.collection("interview-history").insertOne({
    ...interviewTransaction,
    createdAt: Date.now(),
  });

  return NextResponse.json({
    message: "Successfully Completed Interview",
  });
}
