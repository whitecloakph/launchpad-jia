import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(req: Request) {
  try {
    const { db } = await connectMongoDB();
    const { orgID } = await req.json();

    // Get counts from each collection
    const careersCount = await db.collection("careers").find({ orgID, status: "active" }).count();
    const interviewsCount = await db
      .collection("interviews")
      .find({ orgID })
      .count();
    const interviewIDs = await db
      .collection("interviews")
      .find({ orgID })
      .project({ interviewID: 1, _id: 0 })
      .toArray();
    const interviewIDList = interviewIDs.map((doc) => doc.interviewID);
    const transcriptsCount = await db
      .collection("transcripts")
      .countDocuments({ interviewID: { $in: interviewIDList } });
    const applicantsCount = await db
      .collection("affiliations")
      .find({ orgID })
      .count();

    // Prepare response in the required format
    const metricsData = [
      {
        icon: "la la-briefcase",
        name: "Total Careers / Job Openings",
        value: careersCount,
      },
      {
        icon: "la la-comments",
        name: "Total Interviews",
        value: interviewsCount,
      },
      {
        icon: "la la-file-text",
        name: "Total Transcripts",
        value: transcriptsCount,
      },
      {
        icon: "la la-users",
        name: "Total Applicants",
        value: applicantsCount,
      },
    ];

    return NextResponse.json(metricsData);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
