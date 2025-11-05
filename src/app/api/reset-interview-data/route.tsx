import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Delete the Interview with the specified ID

    const interviewInstance = await db.collection("interviews").findOne({
      _id: new ObjectId(id),
    });

    // update interview instance
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          score: 0,
          analysis: null,
          completedAt: null,
          updatedAt: Date.now(),
          summary: null,
          status: "For AI Interview",
          currentStep: "CV Screening",
          jobFit: null,
          interviewRecording: null,
          retakeRequest: null,
          interviewParts: [],
          interviewUpload: null,
        },
      }
    );

    // delete transcripts

    await db.collection("transcripts").deleteMany({
      interviewID: interviewInstance.interviewID,
    });

    await db.collection("feedback").deleteMany({
      interviewID: interviewInstance.interviewID,
    });


    // delete cloudflare recording if exists
    if (interviewInstance.interviewRecording?.filename) {
      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });

      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: interviewInstance.interviewRecording.filename,
      });

      await s3Client.send(command);
    }

    return NextResponse.json({
      message: "Interview deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting Interview:", error);
    return NextResponse.json(
      { error: "Failed to delete Interview" },
      { status: 500 }
    );
  }
}
