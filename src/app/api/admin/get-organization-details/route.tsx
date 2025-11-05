import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }
   try {
    const { db } = await connectMongoDB();
    const organization = await db.collection("organizations").findOne({ _id: new ObjectId(id) });
    const members = await db.collection("members").find({ orgID: id }).toArray();
    if (!organization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    organization.members = members;
    return NextResponse.json(organization);
   } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Error fetching organization" }, { status: 500 });
   }
}