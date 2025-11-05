import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  const { data, interviewID } = await request.json();

  let interviewData: any = [...data];

  interviewData.forEach((x: any) => {
    x.interviewID = interviewID;
  });

  const { db } = await connectMongoDB();

  await Promise.all(
    interviewData.map((transcript: any) =>
      db.collection("transcripts").updateOne(
        {
          interviewID: interviewID,
          uid: transcript.uid,
        },
        { $set: transcript },
        { upsert: true }
      )
    )
  );

  // Query transcripts for this interview and calculate duration
  const transcripts = await db
    .collection("transcripts")
    .find({ interviewID: interviewID })
    .sort({ time: 1 })
    .toArray();

  if (transcripts.length > 0) {
    const firstTranscript = transcripts[0];
    const lastTranscript = transcripts[transcripts.length - 1];

    // Calculate duration in minutes
    const deltaDuration =
      (lastTranscript.time - firstTranscript.time) / (1000 * 60);

    console.log(`Interview Duration: ${deltaDuration} minutes`);

    // Update the interview document with the calculated duration
    await db
      .collection("interviews")
      .updateOne(
        { interviewID: interviewID },
        { $set: { interviewDuration: deltaDuration } }
      );
  }

  return NextResponse.json({
    message: "Successfully saved Transcript",
  });
}
