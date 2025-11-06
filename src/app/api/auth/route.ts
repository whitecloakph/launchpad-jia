import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { name, email, image } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();
    const admin = await db.collection("admins").findOne({ email: email });

    console.log("Admin found:", admin);

    if (admin) {
      await db.collection("admins").updateOne(
        { email: email },
        {
          $set: {
            name: name,
            image: image,
            lastSeen: new Date(),
          },
        }
      );

      console.log("Admin found:", admin);

      return NextResponse.json(admin);
    } else {
      const applicant = await db
        .collection("applicants")
        .findOne({ email: email });

      const employer = await db
        .collection("members")
        .findOne({ email: email });

      if (employer) {
        console.log("Employer found:", employer);
        return NextResponse.json(employer);
      }

      if (applicant) {
        console.log("Applicant found:", applicant);
        return NextResponse.json(applicant);
      }

      if (!applicant) {
        await db.collection("applicants").insertOne({
          email: email,
          name: name,
          image: image,
          createdAt: new Date(),
          lastSeen: new Date(),
          role: "applicant",
        });
      }
    }

    return NextResponse.json({
      message: "Default Fallback",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}
