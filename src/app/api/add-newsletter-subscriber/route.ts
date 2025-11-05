import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    try {
        const { db } = await connectMongoDB();

        const newsletterSubscriber = {
            id: guid(),
            email,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await db.collection("newsletter-subscribers").insertOne(newsletterSubscriber);
        return NextResponse.json({ message: "Newsletter subscriber added" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to add newsletter subscriber" }, { status: 500 });
    }
}