import { NextResponse } from "next/server";
import connectMongoDB from "../../../lib/mongoDB/mongoDB";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const orgID = searchParams.get("orgID");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userEmail = searchParams.get("userEmail");
    const search = searchParams.get("search");
    const sortConfig = searchParams.get("sortConfig");
    const status = searchParams.get("status");

    try {
        const { db } = await connectMongoDB();

        const authUserRole = await db.collection("members").findOne({ email: userEmail, orgID });
        // Filter careers based on the user's role
        const filter: any = { orgID };
        if (authUserRole?.role === "hiring_manager" && authUserRole?.careers?.length > 0) {
            filter.id = { $in: authUserRole?.careers };
        }

        if (search) {
            filter.jobTitle = { $regex: search, $options: "i" };
        }

        let defaultSort: any = { status: 1, lastActivityAt: -1, _id: -1 };

        if (sortConfig) {
            const config = JSON.parse(sortConfig);
            const key = config.key;
            defaultSort = { [key]: config.direction === "ascending" ? 1 : -1, _id: -1 };
        }

        if (status && status !== "All Statuses") {
            filter.status = status === "Published" ? "active" : "inactive";
        }

        const careers = await db
        .collection("careers")
        .aggregate([
            { $match: filter },
            { 
                $lookup: {
                    from: "interviews",
                    localField: "id",
                    foreignField: "id",
                    as: "interviews"
                }
            },
            { $unwind: { path: "$interviews", preserveNullAndEmptyArrays: true } },
            { 
                $match: {
                    "interviews.currentStep": { $ne: "Applied" }
                },
            },
            { 
                $group: {
                    _id: "$_id",
                    jobTitle: { $first: "$jobTitle" },
                    status: { $first: "$status" },
                    createdAt: { $first: "$createdAt" },
                    lastActivityAt: { $first: "$lastActivityAt" },
                    orgID: { $first: "$orgID" },
                    interviewsInProgress: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                    {
                                        $or: [
                                            { $eq: ["$interviews.applicationStatus", "Ongoing"] },
                                            { $eq: ["$interviews.applicationStatus", null] },
                                            { $eq: [{ $type: "$interviews.applicationStatus" }, "missing"] }
                                        ],
                                    },
                                    { $and: [
                                        { $ne: ["$interviews.createdAt", null] },
                                        { $ne: [{ $type: "$interviews.createdAt" }, "missing"] }
                                    ] }
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    dropped: {
                        $sum: {
                            $cond: {
                                if: {
                                    $or: [
                                        { $eq: ["$interviews.applicationStatus", "Dropped"] },
                                        { $eq: ["$interviews.applicationStatus", "Cancelled"] }
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    hired: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$interviews.applicationStatus", "Hired"] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            { $sort: defaultSort },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { 
                $project: {
                    questions: 0,
                }
            },
        ]).toArray();

        // TODO: Improve this query by moving to Redis or a count table
        const total = await db.collection("careers").countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        const totalActiveCareers = await db.collection("careers").countDocuments({ orgID, status: "active" });

        return NextResponse.json({
            careers,
            totalCareers: total,
            totalPages,
            currentPage: page,
            totalActiveCareers,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch careers" }, { status: 500 });
    }
}