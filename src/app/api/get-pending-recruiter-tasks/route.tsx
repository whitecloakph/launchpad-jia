import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orgID = searchParams.get("orgID");

    if (!orgID) {
        return NextResponse.json({ error: "Org ID is required" }, { status: 400 });
    }

    try {
        const { db } = await connectMongoDB();
        const activeCareers = await db.collection("careers").find({ orgID, status: "active" }).toArray();
        const pendingTasks = await db.collection("interviews").find({ 
            orgID,
            id: { $in: activeCareers.map((career) => career.id) },
            applicationStatus: { $in: ["Ongoing", null] },
                $or: [
                    // CV Review
                    {
                        currentStep: "CV Screening",
                        status: { $ne: "For AI Interview" }
                    },
                    // AI Interview Review
                    {
                        status: { $ne: "For Interview" },
                        currentStep: { $in: ["AI Interview", null] }
                    },
                    // Retake Request
                    {
                        "retakeRequest.status": "Pending"
                    }
                ]
    }).toArray();

    return NextResponse.json({
        cvReview: pendingTasks.filter((x) => x.currentStep === "CV Screening" && x.status !== "For AI Interview"),
        aiInterviewReview: pendingTasks.filter((x) => x.status !== "For Interview" && (x.currentStep === "AI Interview" || !x.currentStep)),
        retakeRequest: pendingTasks.filter((x) => x["retakeRequest"] && !["Approved", "Rejected"].includes(x["retakeRequest"].status))
    });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch pending tasks" }, { status: 500 });
    }
}