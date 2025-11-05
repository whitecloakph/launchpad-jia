import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgID = searchParams.get("orgID");
    const filterStatus = searchParams.get("filterStatus");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy");
    console.log("orgID", orgID);
    
    if (!orgID) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      };
    }
    const stages: any[] = [
      {
        $match: {
          orgID: orgID,
          email: { $ne: null },
          ...searchFilter,
        },
      },
      {
        $sort: {
            updatedAt: -1,
        }
      },
      {
        $group: {
          _id: {
            email: "$email",
            name: "$name",
          },
          interviews: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          candidateStatus: {
            $cond: {
              if: {
                $anyElementTrue: {
                  $map: {
                    input: "$interviews",
                    as: "interview",
                    in: {
                      $cond: {
                        if: {
                          $or: [
                            { $eq: ["$$interview.applicationStatus", "Ongoing"] },
                            { $eq: ["$$interview.applicationStatus", null] },
                            {$eq:[{$type:'$$interview.applicationStatus'},"missing"]}
                          ],
                        }, 
                        then: true,
                        else: false
                      },
                    },
                  },
                },
              },
              then: "Ongoing",
              else: { $arrayElemAt: [ "$interviews.applicationStatus", 0 ] }
            },
          }, 
          activeAt: { $toDate: { $arrayElemAt: [ "$interviews.updatedAt", 0 ] } }
        }
      },
    ];

    if (filterStatus !== "All Application Statuses") {
      stages.push({
        $match: {
          candidateStatus: filterStatus,
        },
      });
    }
    
    let sort: any = { activeAt: -1 };
    if (sortBy === "Oldest Activity") {
      sort = { activeAt: 1 };
    } else if (sortBy === "Alphabetical (A-Z)") {
      sort = { name: 1 };
    } else if (sortBy === "Alphabetical (Z-A)") {
      sort = { name: -1 };
    }

    // Find all interviews and group by email and put them in an array
    const candidates = await db.collection("interviews").aggregate([
      ...stages,
      { $project: { _id: 0, email: "$_id.email", name: "$_id.name", interviews: 1, candidateStatus: 1, activeAt: 1 } },
      { $sort: sort }
    ]).toArray();

    return NextResponse.json(candidates);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}