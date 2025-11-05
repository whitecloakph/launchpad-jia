import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  try {
    const { email, orgID, role, careers } = await req.json();

    // Validate required fields
    if (!email || !orgID || !role) {
      return NextResponse.json(
        { error: "Email, organization ID, and role are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Check if member exists
    const member = await db.collection("members").findOne({ email, orgID });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      role,
      updatedAt: new Date(),
    };

    // Only include careers if role is hiring_manager
    if (role === "hiring_manager" && careers) {
      updateData.careers = careers;
    } else {
      updateData.careers = [];
    }

    // Update member
    await db
      .collection("members")
      .updateOne({ email, orgID }, { $set: updateData });

    return NextResponse.json(
      { message: "Member updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
