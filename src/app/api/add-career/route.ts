import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import { validateCareerData } from "@/lib/validation/inputValidation";

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    
    // Validate and sanitize all input data
    let validatedData;
    try {
      validatedData = validateCareerData(rawData);
    } catch (validationError: any) {
      console.error('Validation error:', validationError.message);
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: validationError.message 
        },
        { status: 400 }
      );
    }
    
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
      preScreeningQuestions,
    } = validatedData;

    // Validate required fields (already sanitized)
    if (!jobTitle || !description || !questions || !location || !workSetup) {
      return NextResponse.json(
        {
          error:
            "Job title, description, questions, location and work setup are required",
        },
        { status: 400 }
      );
    }
    
    // Validate salary range
    if (minimumSalary !== null && maximumSalary !== null) {
      if (minimumSalary > maximumSalary) {
        return NextResponse.json(
          { error: "Minimum salary cannot be greater than maximum salary" },
          { status: 400 }
        );
      }
    }
    
    // Validate at least one question exists
    const hasQuestions = questions.some((q: any) => q.questions && q.questions.length > 0);
    if (!hasQuestions) {
      return NextResponse.json(
        { error: "At least one interview question is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Validate organization exists and check limits
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
        $unwind: "$plan"
      },
    ]).toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const totalActiveCareers = await db.collection("careers").countDocuments({ 
      orgID, 
      status: "active" 
    });

    if (totalActiveCareers >= (orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0))) {
      return NextResponse.json({ 
        error: "You have reached the maximum number of jobs for your plan" 
      }, { status: 400 });
    }

    // Create career object with sanitized data
    const career = {
      id: guid(),
      jobTitle,
      description,
      questions,
      location,
      workSetup,
      workSetupRemarks: workSetupRemarks || null,
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
      preScreeningQuestions,
    };

    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career: {
        id: career.id,
        jobTitle: career.jobTitle,
        status: career.status,
      },
    });
  } catch (error: any) {
    console.error("Error adding career:", error);
    
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to add career. Please try again." },
      { status: 500 }
    );
  }
}