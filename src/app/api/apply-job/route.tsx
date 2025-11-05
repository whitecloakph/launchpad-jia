import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { sendEmail } from "@/lib/Email";

export async function POST(request: Request) {
  try {
    let jobApplicationData = await request.json();

    const { jobTitle, description, questions, name, email, status, origin } =
      jobApplicationData;

    // Validate required fields
    if (!jobTitle || !description || !questions || !name || !email) {
      return NextResponse.json(
        { error: "Job title, description and questions are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const interviewData = {
      ...jobApplicationData,
      reviewers: [],
    };
    // Remove origin from interviewData
    if (interviewData.origin) {
      delete interviewData.origin;
    }

    let interviewInstance = await db
      .collection("interviews")
      .findOne({ id: interviewData.id, email: interviewData.email });

    if (interviewInstance) {
      return NextResponse.json({
        error: "Job Application Failed.",
        message: "You have a pending application for this role.",
      });
    }

    await db.collection("interviews").insertOne(interviewData);

    const existingAffiliation = await db.collection("affiliations").findOne({
      "applicantInfo.email": interviewData.email,
      orgID: interviewData.orgID,
    });

    if (!existingAffiliation) {
      await db.collection("affiliations").insertOne({
        type: "applicant",
        applicantInfo: {
          name: interviewData.name,
          email: interviewData.email,
          image: interviewData.image,
        },
        createdAt: new Date(),
        orgID: interviewData.orgID,
      });
    }

    await sendEmail({
      recipient: interviewData.email,
      html: `
      <div>
        <p>Dear ${interviewData.name},</p>
        <p>Your job application has been successfully submitted for the role of ${interviewData.jobTitle}.</p>
        <p>You can access your interview here: <a href="https://www.hellojia.ai/interview/${interviewData.interviewID}">Interview Link</a></p>
      </div>
    `,
    });

    if (status === "For Interview" && origin === "direct-interview") {
      const interviewDetails = await db.collection("interviews").findOne({ id: interviewData.id, email: interviewData.email });
      if (interviewDetails) {
        await db.collection("interview-history").insertOne({
          interviewUID: interviewDetails._id.toString(),
          toStage: "Pending AI Interview",
          action: "Direct Link Promotion",
          createdAt: Date.now(),
        });

        // Update career lastActivityAt to current date
        await db.collection("careers").updateOne(
          { id: interviewDetails.id },
          { $set: { lastActivityAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      message: "Interview added successfully",
      interviewData,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
