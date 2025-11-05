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
        const topOrganizations = await db.collection("organizations").aggregate([
            {
                $match: {
                    status: "active",
                }
            },
            {
                $lookup: {
                    from: "interviews",
                    let: { orgID: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ["$orgID", "$$orgID"] }, 
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
                    name: 1,
                    image: 1,
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
        return NextResponse.json(topOrganizations);
    } catch (error) {
        console.error("Error fetching top organizations:", error);
        return NextResponse.json({ error: "Error fetching top organizations" }, { status: 500 });
    }
}