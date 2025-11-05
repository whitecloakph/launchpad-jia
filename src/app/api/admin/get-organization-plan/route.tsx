import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(request: NextRequest) {
    try {
        const { db } = await connectMongoDB();
        const organizationPlans = await db.collection("organization-plans").find({}).toArray();
        return NextResponse.json(organizationPlans);
    } catch (error) {
        console.error("Error fetching organization plans:", error);
        return NextResponse.json({ error: "Error fetching organization plans" }, { status: 500 });
    }
}