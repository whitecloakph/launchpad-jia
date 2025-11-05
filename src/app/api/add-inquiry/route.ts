import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";

export async function POST(request: NextRequest) {
    const { email, message } = await request.json();

    try {
        const { db } = await connectMongoDB();

        const inquiry = {
            id: guid(),
            email,
            message,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.collection("inquiries").insertOne(inquiry);
        return NextResponse.json({ message: "Inquiry added" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to add inquiry" }, { status: 500 });
    }
}