import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Career ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Delete the career with the specified ID
    const result = await db
      .collection("careers")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Career deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting career:", error);
    return NextResponse.json(
      { error: "Failed to delete career" },
      { status: 500 }
    );
  }
}
