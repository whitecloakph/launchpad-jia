import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import moment from "moment";

export async function GET(request: NextRequest) {
    try {
        const { db } = await connectMongoDB();
        const activeOrganizations = await db.collection("organizations").countDocuments({ status: "active" });
        const jobs = await db.collection("careers").countDocuments({ status: "active" });
        const newApplicants = await db.collection("interviews").find({ createdAt: { $gte: moment().subtract(3, "months").toDate() } }).toArray();
        
        return NextResponse.json({
            activeOrganizations,
            jobs,
            newApplicants,
        });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching admin stats" }, { status: 500 });
    }
}