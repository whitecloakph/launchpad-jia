import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orgID = searchParams.get("orgID");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    try {
        const { db } = await connectMongoDB();
        const filter: any = { orgID };
        if (search) {
            filter.email = { $regex: search, $options: "i" };
        }

        const members = await db.collection("members").find(filter).skip((page - 1) * limit).limit(limit).toArray();
        const total = await db.collection("members").countDocuments(filter);

        return NextResponse.json({
            members,
            totalMembers: total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to search members" }, { status: 500 });
    }
}