import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { applicationStatusMap, getStage } from "@/lib/Utils";
import { sendEmail } from "@/lib/Email";

export async function POST(request: NextRequest) {
    const { uid, user } = await request.json();

    if (!uid || !user) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const { db } = await connectMongoDB();

        const interview = await db.collection("interviews").findOne({ _id: new ObjectId(uid) });

        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        const nextStage = applicationStatusMap[getStage(interview)].nextStage;

        const update = {
            currentStep: nextStage.step,
            status: nextStage.status,
            updatedAt: Date.now(),
            applicationMetadata: {
              updatedAt: Date.now(),
              updatedBy: {
                  image: user?.image,
                  name: user?.name,
                  email: user?.email,
              },
              action: "Endorsed",
            }
        }

        const interviewTransaction = {
            interviewUID: interview._id.toString(),
            fromStage: getStage(interview),
            toStage: nextStage.name,
            action: "Endorsed",
            updatedBy: {
                image: user?.image,
                name: user?.name,
                email: user?.email,
            },
        };

        await db.collection("interviews").updateOne({ _id: new ObjectId(uid) }, { $set: { ...update } });
        await db.collection("interview-history").insertOne({
            ...interviewTransaction,
            createdAt: Date.now(),
        });

        // Update career lastActivityAt to current date
        await db.collection("careers").updateOne(
            { id: interview.id },
            { $set: { lastActivityAt: new Date() } }
        );

        await sendEmail({
            recipient: interview.email,
            html: `
              <div>
                <p>Dear ${interview.name},</p>
                <p>Your interview has been successfully updated.</p>
              </div>
            `,
        });

        return NextResponse.json({ message: "Candidate endorsed", updatedInterview: {...interview, ...update} });
    } catch (error) {
        return NextResponse.json({ error: "Failed to endorse candidate" }, { status: 500 });
    }
}