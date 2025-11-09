import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import {
  ALLOWED_WORK_SETUPS,
  ALLOWED_EMPLOYMENT_TYPES,
  ALLOWED_SCREENING_SETTINGS,
  ALLOWED_STATUSES,
  MAX_LENGTHS,
  sanitizeHTML,
  sanitizeText,
  sanitizeInterviewQuestions,
  sanitizePrescreeningQuestions,
  sanitizeUserInfo,
  validateEmail,
  validateObjectId,
  validateEnum,
  validateStringLength,
  validateSalaryRange,
  validateInterviewQuestions,
  validatePrescreeningQuestions,
} from "@/lib/CareerValidationUtils";

// ============================================================================
// Main POST Handler
// ============================================================================

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
      prescreeningQuestions,
      isUnpublished,
      currentStep,
    } = await request.json();

    // ========================================================================
    // Step 1: Determine Career Status
    // ========================================================================

    const careerStatus = status || "active";
    const isPublishing = careerStatus === "active";

    // ========================================================================
    // Step 2: Validate Minimum Required Fields (Always)
    // ========================================================================

    // Job title is required even for drafts
    if (!jobTitle || jobTitle.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Job title is required",
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 3: Validate Required Fields (only for published careers)
    // ========================================================================

    if (isPublishing) {
      if (!description || !questions || !location || !workSetup) {
        return NextResponse.json(
          {
            error:
              "Description, questions, location and work setup are required for published careers",
          },
          { status: 400 }
        );
      }

      if (!country || !province || !employmentType) {
        return NextResponse.json(
          {
            error: "Country, province and employment type are required for published careers",
          },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // Step 4: Validate ObjectId (Always required)
    // ========================================================================

    if (orgID && !validateObjectId(orgID)) {
      return NextResponse.json(
        { error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 5: Validate Email Addresses (Always validate if provided)
    // ========================================================================

    if (lastEditedBy && !validateEmail(lastEditedBy.email)) {
      return NextResponse.json(
        { error: "Invalid lastEditedBy email address" },
        { status: 400 }
      );
    }

    if (createdBy && !validateEmail(createdBy.email)) {
      return NextResponse.json(
        { error: "Invalid createdBy email address" },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 6: Validate Enums (Validate if provided)
    // ========================================================================

    if (workSetup && !validateEnum(workSetup, ALLOWED_WORK_SETUPS)) {
      return NextResponse.json(
        {
          error: `Invalid work setup. Must be one of: ${ALLOWED_WORK_SETUPS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (employmentType && !validateEnum(employmentType, ALLOWED_EMPLOYMENT_TYPES)) {
      return NextResponse.json(
        {
          error: `Invalid employment type. Must be one of: ${ALLOWED_EMPLOYMENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      screeningSetting &&
      !validateEnum(screeningSetting, ALLOWED_SCREENING_SETTINGS)
    ) {
      return NextResponse.json(
        {
          error: `Invalid screening setting. Must be one of: ${ALLOWED_SCREENING_SETTINGS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!validateEnum(careerStatus, ALLOWED_STATUSES)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 7: Validate String Lengths
    // ========================================================================

    const lengthValidations = [
      { value: jobTitle, max: MAX_LENGTHS.jobTitle, field: "Job title" },
      { value: description, max: MAX_LENGTHS.description, field: "Description" },
      { value: location, max: MAX_LENGTHS.location, field: "Location" },
      {
        value: workSetupRemarks,
        max: MAX_LENGTHS.workSetupRemarks,
        field: "Work setup remarks",
      },
      { value: country, max: MAX_LENGTHS.country, field: "Country" },
      { value: province, max: MAX_LENGTHS.province, field: "Province" },
    ];

    for (const validation of lengthValidations) {
      const result = validateStringLength(
        validation.value,
        validation.max,
        validation.field
      );
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    // ========================================================================
    // Step 8: Validate Salary Range
    // ========================================================================

    const salaryValidation = validateSalaryRange(minimumSalary, maximumSalary);
    if (!salaryValidation.valid) {
      return NextResponse.json(
        { error: salaryValidation.error },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 9: Sanitize and Validate Interview Questions
    // ========================================================================

    const sanitizedQuestions = sanitizeInterviewQuestions(questions || []);

    // Only validate minimum question count for published careers
    if (isPublishing) {
      const questionsValidation = validateInterviewQuestions(sanitizedQuestions);
      if (!questionsValidation.valid) {
        return NextResponse.json(
          { error: questionsValidation.error },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // Step 10: Sanitize and Validate Prescreening Questions
    // ========================================================================

    const sanitizedPrescreeningQuestions = sanitizePrescreeningQuestions(
      prescreeningQuestions || []
    );

    // Validate prescreening questions structure (both drafts and published)
    if (isPublishing && sanitizedPrescreeningQuestions.length > 0) {
      const prescreeningValidation = validatePrescreeningQuestions(
        sanitizedPrescreeningQuestions
      );
      if (!prescreeningValidation.valid) {
        return NextResponse.json(
          { error: prescreeningValidation.error },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // Step 11: Connect to Database and Check Organization
    // ========================================================================

    const { db } = await connectMongoDB();

    const orgDetails = await db
      .collection("organizations")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(orgID),
          },
        },
        {
          $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
              {
                $addFields: {
                  _id: { $toString: "$_id" },
                },
              },
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$planId"] },
                },
              },
            ],
            as: "plan",
          },
        },
        {
          $unwind: {
            path: "$plan",
            preserveNullAndEmptyArrays: true, // Keep org even if no plan found
          },
        },
      ])
      .toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // ========================================================================
    // Step 12: Check Job Posting Limits
    // ========================================================================

    // Only check job limits if organization has a plan
    if (orgDetails[0].plan) {
      const totalActiveCareers = await db
        .collection("careers")
        .countDocuments({ orgID, status: "active" });

      const jobLimit =
        orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0);

      if (totalActiveCareers >= jobLimit) {
        return NextResponse.json(
          {
            error: "You have reached the maximum number of jobs for your plan",
          },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // Step 13: Sanitize All Text Fields
    // ========================================================================

    const sanitizedJobTitle = sanitizeText(jobTitle);
    const sanitizedDescription = sanitizeHTML(description);
    const sanitizedLocation = sanitizeText(location);
    const sanitizedWorkSetupRemarks = sanitizeText(workSetupRemarks || "");
    const sanitizedCountry = sanitizeText(country);
    const sanitizedProvince = sanitizeText(province);
    const sanitizedLastEditedBy = sanitizeUserInfo(lastEditedBy);
    const sanitizedCreatedBy = sanitizeUserInfo(createdBy);

    // ========================================================================
    // Step 14: Create Career Document with Sanitized Data
    // ========================================================================

    const career = {
      id: guid(),
      jobTitle: sanitizedJobTitle,
      description: sanitizedDescription,
      questions: sanitizedQuestions, // Already sanitized in Step 7
      location: sanitizedLocation,
      workSetup,
      workSetupRemarks: sanitizedWorkSetupRemarks,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: sanitizedLastEditedBy,
      createdBy: sanitizedCreatedBy,
      status: careerStatus,
      screeningSetting,
      orgID,
      requireVideo: Boolean(requireVideo ?? true),
      lastActivityAt: new Date(),
      salaryNegotiable: Boolean(salaryNegotiable ?? true),
      minimumSalary:
        minimumSalary !== undefined && minimumSalary !== null
          ? Number(minimumSalary)
          : undefined,
      maximumSalary:
        maximumSalary !== undefined && maximumSalary !== null
          ? Number(maximumSalary)
          : undefined,
      country: sanitizedCountry,
      province: sanitizedProvince,
      employmentType,
      prescreeningQuestions: sanitizedPrescreeningQuestions,
      isUnpublished: Boolean(isUnpublished ?? false),
      currentStep: Number(currentStep) || 5,
    };

    // ========================================================================
    // Step 15: Insert Career into Database
    // ========================================================================

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
