import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { validateCareerData } from "@/lib/validation/inputValidation";

export async function POST(request: Request) {
  try {
    const rawData = await request.json();

    // Extract _id before validation
    const { _id, ...dataToValidate } = rawData;

    if (!_id) {
      return NextResponse.json(
        { error: "Career ID is required" },
        { status: 400 }
      );
    }

    // Validate and sanitize all input data
    let validatedData;
    try {
      validatedData = validateCareerData(dataToValidate);
    } catch (validationError: any) {
      console.error("Validation error:", validationError.message);
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationError.message,
        },
        { status: 400 }
      );
    }

    const {
      jobTitle,
      description,
      questions,
      lastEditedBy,
      screeningSetting,
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
    const hasQuestions = questions.some(
      (q: any) => q.questions && q.questions.length > 0
    );
    if (!hasQuestions) {
      return NextResponse.json(
        { error: "At least one interview question is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Verify career exists
    const existingCareer = await db.collection("careers").findOne({
      _id: new ObjectId(_id),
    });

    if (!existingCareer) {
      return NextResponse.json({ error: "Career not found" }, { status: 404 });
    }

    // Create update object with sanitized data
    const updateData = {
      jobTitle,
      description,
      questions,
      location,
      workSetup,
      workSetupRemarks: workSetupRemarks || null,
      updatedAt: new Date(),
      lastEditedBy,
      status: status || existingCareer.status,
      screeningSetting,
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

    const result = await db
      .collection("careers")
      .updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update career" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Career updated successfully",
      career: {
        _id: _id,
        jobTitle: updateData.jobTitle,
        status: updateData.status,
      },
    });
  } catch (error: any) {
    console.error("Error updating career:", error);

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to update career. Please try again." },
      { status: 500 }
    );
  }
}
