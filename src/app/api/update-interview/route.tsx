import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/Email";

export async function POST(request: Request) {
  const { data, uid, interviewTransaction } = await request.json();

  let dataToUpdate = { ...data };

  const { db } = await connectMongoDB();

  await db.collection("interviews").updateOne(
    {
      _id: new ObjectId(uid),
    },
    {
      $set: {
        ...dataToUpdate,
      },
    }
  );

  const interviewData = await db.collection("interviews").findOne({
    _id: new ObjectId(uid),
  });

  // For logging history
  if (interviewTransaction) {
    await db.collection("interview-history").insertOne({
      ...interviewTransaction,
      createdAt: Date.now(),
    });

    // Update career lastActivityAt to current date
    await db
      .collection("careers")
      .updateOne(
        { id: interviewData.id },
        { $set: { lastActivityAt: new Date() } }
      );
  }

  // await sendEmail({
  //   recipient: interviewData.email,
  //   html: `
  //     <div>
  //       <p>Dear ${interviewData.name},</p>
  //       <p>Your interview has been successfully updated.</p>
  //     </div>
  //   `,
  // });

  return NextResponse.json({
    message: "Successfully Completed Interview",
  });
}
