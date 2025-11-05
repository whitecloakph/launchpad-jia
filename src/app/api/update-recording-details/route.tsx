import { NextResponse } from "next/server";
import connectMongoDB from "../../../lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    const { uid, partNumber, etag, uploadId, filename, filetype } = await request.json();
    try {
        const { db } = await connectMongoDB();
        await db.collection("interviews").updateOne(
            {
                _id: new ObjectId(uid),
            },
            {
                $addToSet: {
                    interviewParts: {
                        partNumber: partNumber,
                        etag: etag,
                    }
                },
                $set: {
                    interviewUpload: {
                        uploadId: uploadId,
                        key: filename,
                        filetype: filetype,
                    }
                }
            }
        );

        return NextResponse.json({
            message: "Interview part uploaded successfully",
        });
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json(
            { error: "File upload error" },
            { status: 500 }
        );
    }
}