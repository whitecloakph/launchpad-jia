import { NextResponse } from "next/server";
import { S3Client, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
    const { name, type } = await request.json();
    try {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });

        const command = new CreateMultipartUploadCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: name,
            ContentType: type,
        });

        const response = await s3Client.send(command);

        return NextResponse.json({
            uploadId: response.UploadId,
        });

    } catch (error) {
        console.error("Error", error);
        return NextResponse.json(
            { error: "File upload error" },
            { status: 500 }
        );
    }
}