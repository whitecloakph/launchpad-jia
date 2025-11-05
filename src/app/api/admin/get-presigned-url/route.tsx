import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(request: Request) {
    const { fileName, fileType } = await request.json();
    try {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
        })

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 60 * 24, // 1 day
        });

        return NextResponse.json({
            presignedUrl,
        });
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json(
            { error: "File upload error" },
            { status: 500 }
        );
    }
}
