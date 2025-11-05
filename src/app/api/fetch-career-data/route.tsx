import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { careerID } = await request.json();

    if (!careerID) {
      return NextResponse.json(
        { error: "careerID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const career = await db
      .collection("careers")
      .findOne({ _id: new ObjectId(careerID) });

    if (!career) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    if (career.status === "inactive") {
      return NextResponse.json(
        { error: "Career is inactive" },
        { status: 403 }
      );
    }

    return NextResponse.json(career);
  } catch (error) {
    console.error("Error fetching career:", error);
    return NextResponse.json(
      { error: "Failed to fetch career data" },
      { status: 500 }
    );
  }
}
