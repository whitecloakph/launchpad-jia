import { S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { uploadId, partNumber, filename } = await request.json();

    try {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });
        const command = new UploadPartCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
            UploadId: uploadId,
            PartNumber: partNumber,
        })
        const presignedUrl = await getSignedUrl(s3Client, command);

        return NextResponse.json({
            presignedUrl: presignedUrl,
        });
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json(
            { error: "Error getting presigned url" },
            { status: 500 }
        );
    }
}