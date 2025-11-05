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

    // delete interview instance
    const result = await db
      .collection("interviews")
      .deleteOne({ _id: new ObjectId(id) });

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

    // delete interview history
    await db.collection("interview-history").deleteMany({
      interviewUID: interviewInstance._id.toString(),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
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
