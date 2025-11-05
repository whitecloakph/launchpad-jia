import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orgID = searchParams.get("orgID");
    const search = searchParams.get("search");
    const filterAssessment = searchParams.get("filterAssessment");
    const sortBy = searchParams.get("sortBy");
    const taskType = searchParams.get("taskType") || "cv-review";
    const filterPosition = searchParams.get("filterPosition");

    if (!orgID) {
        return NextResponse.json({ error: "Org ID is required" }, { status: 400 });
    }

    let match: any = {
        orgID,
        applicationStatus: { $in: ["Ongoing", null] },
        ...getTasksByType(taskType)
    };

    if (search) {
        match.name = { $regex: search, $options: "i" };
    }

    if (filterAssessment && filterAssessment !== "All Assessments") {
        if (taskType === "cv-review") {
            match.cvStatus = filterAssessment;
        }

        if (taskType === "interview-review") {
            match.jobFit = filterAssessment;
        }
    }

    if (filterPosition && filterPosition !== "All Careers") {
        match.jobTitle = filterPosition;
    }

    let defaultSort: any = { updatedAt: 1, _id: 1 };
    
    if (sortBy === "Latest First") {
        defaultSort = { updatedAt: -1, _id: -1 };
    }
    
    if (sortBy === "Date Applied (Newest)") {
        defaultSort = { createdAt: -1, _id: -1 };
    }

    if (sortBy === "Date Applied (Oldest)") {
        defaultSort = { createdAt: 1, _id: 1 };
    }

    if (sortBy === "Alphabetical (A-Z)") {
        defaultSort = { name: 1, _id: 1 };
    }

    if (sortBy === "Alphabetical (Z-A)") {
        defaultSort = { name: -1, _id: -1 };
    }

    try {
        const { db } = await connectMongoDB();
        const activeCareers = await db.collection("careers").find({ orgID, status: "active" }).toArray();
        const pendingTasks = await db.collection("interviews").aggregate([
        { 
            $match: {
                ...match,
                id: { $in: activeCareers.map((career) => career.id) },
            }
        },
        {
            $project: {
                _id: 1,
                id: 1,
                interviewID: 1,
                name: 1,
                image: 1,
                cvStatus: 1,
                jobTitle: 1,
                jobFit: 1,
                completedAt: 1,
                cvScreeningReason: 1,
                analysis: 1,
                summary: 1,
                nameLower: {
                  $toLower: "$name"
                },
                email: 1,
                applicationStatus: 1,
                currentStep: 1,
                status: 1,
                updatedAt: {
                  $toDate: "$updatedAt"
                },
                createdAt: {
                  $toDate: "$createdAt"
                },
              }
        },
        { $sort: defaultSort },
        ]).toArray();

        return NextResponse.json(pendingTasks);
    } catch (error) {
        console.log("Error fetching pending CV reviews:", error);
        return NextResponse.json({ error: "Error fetching pending CV reviews" }, { status: 500 });
    }
}

const getTasksByType = (taskType: string) => {
    if (taskType === "cv-review") {
        return {
            currentStep: "CV Screening",
            status: { $ne: "For AI Interview" }
        }
    }

    if (taskType === "interview-review") {
        return {
            status: { $ne: "For Interview" },
            currentStep: { $in: ["AI Interview", null] }
        };
    }

    if (taskType === "retake-interview-requests") {
        return {
            "retakeRequest.status": "Pending"
        }
    }
}