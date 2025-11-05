import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { id, orgID } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    let query: any = { interviewID: id };

    if (orgID) {
      query.orgID = orgID;
    }

    let interview = await db
      .collection("interviews")
      .findOne(query);

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const settings = await db.collection("global-settings").findOne(
      { name: "global-settings" },
      {
        analysis_prompt: 0,
        summary_prompt: 0,
        question_gen_prompt: 0,
        name: 0,
        _id: 0,
      }
    );

    const career = await db.collection("careers").findOne({ id: interview.id });

    if (career) {
      interview.careerID = career._id;
    }

    interview.config = settings;

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch career data" },
      { status: 500 }
    );
  }
}
