import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET() {
  try {
    const { db } = await connectMongoDB();

    // Define date range: June 1, 2025 to July 1, 2025
    const startDate = new Date("2025-06-01T00:00:00.000Z");
    const endDate = new Date("2025-07-01T00:00:00.000Z");

    // Convert to timestamp for numeric comparison
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    console.log(
      `Querying interviews from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );
    console.log(`Timestamp range: ${startTimestamp} to ${endTimestamp}`);

    // Query interviews within the date range using createdAt field
    // Handle both ISO date string format and numeric timestamp format
    const interviews = await db
      .collection("interviews")
      .find({
        $or: [
          // Format 1: ISO date string (e.g., "2025-06-27T07:08:31.401Z")
          {
            createdAt: {
              $gte: startDate.toISOString(),
              $lt: endDate.toISOString(),
            },
          },
          // Format 2: Numeric timestamp (e.g., 1751008936459)
          {
            createdAt: {
              $gte: startTimestamp,
              $lt: endTimestamp,
            },
          },
        ],
      })
      .toArray();

    console.log(
      `Found ${interviews.length} interviews in the specified date range`
    );

    // Calculate total interview time from interviewDuration field
    let totalInterviewTime = 0;
    let interviewsWithDuration = 0;

    for (const interview of interviews) {
      if (
        interview.interviewDuration &&
        typeof interview.interviewDuration === "number"
      ) {
        totalInterviewTime += interview.interviewDuration;
        interviewsWithDuration++;
      }
    }

    console.log(`Total interview time: ${totalInterviewTime} minutes`);
    console.log(
      `Interviews with duration data: ${interviewsWithDuration} out of ${interviews.length}`
    );

    return Response.json({
      message: "Success",
      totalInterviews: interviews.length,
      interviewsWithDuration: interviewsWithDuration,
      totalInterviewTimeMinutes: totalInterviewTime,
      totalInterviewTimeHours: totalInterviewTime / 60,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
      },
    });
  } catch (error) {
    console.error("Error in data-worker endpoint:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// import connectMongoDB from "@/lib/mongoDB/mongoDB";

// import { ObjectId } from "mongodb";

// export async function GET() {
//   try {
//     const { db } = await connectMongoDB();

//     // Define the orgID to match
//     const orgID = "682d3fc222462d03263b0881";

//     // Update all careers with matching orgID, set location if not present
//     const updateResult = await db.collection("careers").updateMany(
//       {
//         orgID: orgID,
//       },
//       {
//         $set: {
//           location: "Ortigas, Pasig City",
//           workSetup: "Hybrid with 1 Onsite Per Week",
//         },
//       }
//     );

//     return Response.json({
//       message: "Careers updated successfully",
//       matchedCount: updateResult.matchedCount,
//       modifiedCount: updateResult.modifiedCount,
//       orgID: orgID,
//       locationSet: "Ortigas, Pasig City",
//     });
//   } catch (error) {
//     console.error("Error updating careers location:", error);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
