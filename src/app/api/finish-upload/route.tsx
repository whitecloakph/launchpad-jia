import { CompleteMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    const { uploadId, parts, fileName, filetype, uid } = await request.json();
    try {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });

        const command = new CompleteMultipartUploadCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts.map((part: { etag: string; partNumber: number }) => ({
                    ETag: part.etag,
                    PartNumber: part.partNumber,
                })),
            },
        });

        const response = await s3Client.send(command);

        // Update interview with recording details
        const { db } = await connectMongoDB();
        await db.collection("interviews").updateOne(
            {
                _id: new ObjectId(uid),
            },
            {
                $set: {
                    interviewRecording: {
                        filename: fileName,
                        filetype: filetype,
                    },
                },
            }
        );

        return NextResponse.json({
            response,
        });
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json(
            { error: "File upload error" },
            { status: 500 }
        );
    }
}