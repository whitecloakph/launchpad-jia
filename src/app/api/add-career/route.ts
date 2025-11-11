import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const {
      jobTitle,
      description,
      questions,
      lastEditedBy,
      createdBy,
      screeningSetting,
      orgID,
      requireVideo,
      location,
      workSetup,
      workSetupRemarks,
      status,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      teamMembers,
    } = await request.json();
    // Validate required fields
    if (!jobTitle || !description || !questions || !location || !workSetup) {
      return NextResponse.json(
        {
          error:
            "Job title, description, questions, location and work setup are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const orgDetails = await db.collection("organizations").aggregate([
      {
        $match: {
          _id: new ObjectId(orgID)
        }
      },
      {
        $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
                {
                    $addFields: {
                        _idStr: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$$planId", null] },
                                { $ne: ["$$planId", ""] },
                                { $eq: ["$_idStr", "$$planId"] }
                            ]
                        }
                    }
                }
            ],
            as: "plan"
        }
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          plan: {
            $ifNull: [
              "$plan",
              {
                _id: "default",
                name: "Default Plan",
                jobLimit: 100, // High default limit for development
                createdAt: new Date()
              }
            ]
          }
        }
      }
    ]).toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const totalActiveCareers = await db.collection("careers").countDocuments({ orgID, status: "active" });
    const jobLimit = orgDetails[0].plan?.jobLimit || 100; // Default to 100 if no plan
    const extraJobSlots = orgDetails[0].extraJobSlots || 0;
    const maxJobs = jobLimit + extraJobSlots;

    // Allow bypassing in development via environment variable or skip check if limit is very high
    const bypassLimit = process.env.BYPASS_JOB_LIMIT === "true" || jobLimit >= 1000;
    
    if (!bypassLimit && totalActiveCareers >= maxJobs) {
      return NextResponse.json({ error: "You have reached the maximum number of jobs for your plan" }, { status: 400 });
    }

    const career = {
      id: guid(),
      jobTitle,
      description,
      questions,
      location,
      workSetup,
      workSetupRemarks,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy,
      createdBy,
      status: status || "active",
      screeningSetting,
      orgID,
      requireVideo,
      lastActivityAt: new Date(),
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    };

    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
