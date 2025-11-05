import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const filterStatus = searchParams.get("filterStatus");
    const sortBy = searchParams.get("sortBy");

    let defaultSort: any = {
        updatedAt: -1
    };

    if (sortBy === "Oldest Activity") {
        defaultSort = {
            updatedAt: 1
        };
    } 
    if (sortBy === "Alphabetical (A-Z)") {
        defaultSort = {
            nameLower: 1
        };
    }
    if (sortBy === "Alphabetical (Z-A)") {
        defaultSort = {
            nameLower: -1
        };
    }

    let filter: any = {
        status: { $in: ["active", "inactive"] }
    };
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }
    if (filterStatus && filterStatus !== "All Statuses") {
        filter.status = filterStatus.toLowerCase();
    }

    try {
        const { db } = await connectMongoDB();
        const organizations = await db.collection("organizations").aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "careers",
                    let: { orgID: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ["$orgID", "$$orgID"] }, 
                                  { $eq: ["$status", "active"] } 
                                ]
                              }
                            }
                        } 
                    ],
                    as: "careers"
                }
            },
            {
                $lookup: {
                    from: "members",
                    let: { orgID: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$orgID", "$$orgID"] }
                            }
                        }
                    ],
                    as: "members"
                }
            },
            {
                $lookup: {
                    from: "organization-plans",
                    let: { planId: "$planId" },
                    pipeline: [
                        {
                            $addFields: {
                                _id: { $toString: "$_id" }
                            }
                        },
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$planId"] }
                            }
                        }
                    ],
                    as: "plan"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    status: 1,
                    updatedAt: 1,
                    activeJobs: { $size: "$careers" },
                    members: { $size: "$members" },
                    nameLower: { 
                        $toLower: "$name"
                    },
                    extraJobSlots: 1,
                    plan: 1,
                }
            },
            {
                $sort: defaultSort,
            }
        ]).toArray();
        const formattedOrganizations = organizations.map((organization: any) => {
            return {
                ...organization,
                jobLimit: (organization.plan?.[0]?.jobLimit || 3) + (organization.extraJobSlots || 0),
            }
        });
        return NextResponse.json(formattedOrganizations);
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json({ error: "Error fetching organizations" }, { status: 500 });
    }
}