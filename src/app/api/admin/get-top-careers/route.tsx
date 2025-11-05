import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import moment from "moment";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter");

    let defaultFilter: any = { $gte: ["$createdAt", moment().subtract(7, "days").toDate()] };

    if (filter === "last_30_days") {
        defaultFilter = { $gte: ["$createdAt", moment().subtract(30, "days").toDate()] };
    }
    if (filter === "last_3_months") {
        defaultFilter = { $gte: ["$createdAt", moment().subtract(3, "months").toDate()] };
    }
    try {
        const { db } = await connectMongoDB();
        const topCareers = await db.collection("careers").aggregate([
            {
                $match: {
                    status: "active",
                }
            },
            {
                $lookup: {
                    from: "organizations",
                    let: { orgIDStr: { $toString: "$orgID" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        { $toString: "$_id" },
                                        "$$orgIDStr"
                                    ]
                                }
                            }
                        }
                    ],
                    as: "organization"
                }
            },
            {
                $lookup: {
                    from: "interviews",
                    let: { careerID: "$id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$id", "$$careerID"] },
                                        defaultFilter
                                    ]
                                }
                            }
                        }
                    ],
                    as: "interviews"
                },
            },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    jobTitle: 1,
                    organization: {
                        $arrayElemAt: ["$organization", 0]
                    },
                    newApplications: {
                        $size: "$interviews"
                    },
                }
            },
            {
                $sort: {
                    newApplications: -1,
                    _id: -1,
                }
            },
            {
                $limit: 5
            }
        ]).toArray();
        return NextResponse.json(topCareers);
    } catch (error) {
        console.error("Error fetching top careers:", error);
        return NextResponse.json({ error: "Error fetching top careers" }, { status: 500 });
    }
}