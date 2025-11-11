import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
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
  validateEnum,
  validateStringLength,
  validateSalaryRange,
  validateInterviewQuestions,
  validatePrescreeningQuestions,
} from "@/lib/CareerValidationUtils";

export async function POST(request: Request) {
  try {
    let requestData = await request.json();
    const { _id, status } = requestData;

    // ========================================================================
    // Step 1: Validate Career ID
    // ========================================================================

    if (!_id) {
      return NextResponse.json(
        { error: "Job Object ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "Invalid Job Object ID format" },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 2: Determine Career Status
    // ========================================================================

    const careerStatus = status || "active";
    const isPublishing = careerStatus === "active";

    // ========================================================================
    // Step 3: Validate Minimum Required Fields (Always)
    // ========================================================================

    // Job title is required even for drafts (if updating jobTitle)
    if (
      requestData.jobTitle !== undefined &&
      (!requestData.jobTitle || requestData.jobTitle.trim().length === 0)
    ) {
      return NextResponse.json(
        {
          error: "Job title cannot be empty",
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 4: Validate Status-based Required Fields (for publishing)
    // ========================================================================

    if (isPublishing) {
      const {
        jobTitle,
        description,
        questions,
        location,
        workSetup,
        country,
        province,
        employmentType,
      } = requestData;

      if (!jobTitle || !description || !questions || !location || !workSetup) {
        return NextResponse.json(
          {
            error:
              "Job title, description, questions, location and work setup are required for published careers",
          },
          { status: 400 }
        );
      }

      if (!country || !province || !employmentType) {
        return NextResponse.json(
          {
            error:
              "Country, province and employment type are required for published careers",
          },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // Step 5: Validate Email Addresses (if provided)
    // ========================================================================

    if (
      requestData.lastEditedBy &&
      requestData.lastEditedBy.email &&
      !validateEmail(requestData.lastEditedBy.email)
    ) {
      return NextResponse.json(
        { error: "Invalid lastEditedBy email address" },
        { status: 400 }
      );
    }

    // ========================================================================
    // Step 6: Validate Enums (if provided)
    // ========================================================================

    if (
      requestData.workSetup &&
      !validateEnum(requestData.workSetup, ALLOWED_WORK_SETUPS)
    ) {
      return NextResponse.json(
        {
          error: `Invalid work setup. Must be one of: ${ALLOWED_WORK_SETUPS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      requestData.employmentType &&
      !validateEnum(requestData.employmentType, ALLOWED_EMPLOYMENT_TYPES)
    ) {
      return NextResponse.json(
        {
          error: `Invalid employment type. Must be one of: ${ALLOWED_EMPLOYMENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      requestData.screeningSetting &&
      !validateEnum(requestData.screeningSetting, ALLOWED_SCREENING_SETTINGS)
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
    // Step 7: Validate String Lengths (if provided)
    // ========================================================================

    const lengthValidations = [
      {
        value: requestData.jobTitle,
        max: MAX_LENGTHS.jobTitle,
        field: "Job title",
      },
      {
        value: requestData.description,
        max: MAX_LENGTHS.description,
        field: "Description",
      },
      {
        value: requestData.location,
        max: MAX_LENGTHS.location,
        field: "Location",
      },
      {
        value: requestData.workSetupRemarks,
        max: MAX_LENGTHS.workSetupRemarks,
        field: "Work setup remarks",
      },
      {
        value: requestData.country,
        max: MAX_LENGTHS.country,
        field: "Country",
      },
      {
        value: requestData.province,
        max: MAX_LENGTHS.province,
        field: "Province",
      },
    ];

    for (const validation of lengthValidations) {
      if (validation.value) {
        const result = validateStringLength(
          validation.value,
          validation.max,
          validation.field
        );
        if (!result.valid) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
      }
    }

    // ========================================================================
    // Step 8: Validate Salary Range (if provided)
    // ========================================================================

    if (
      requestData.minimumSalary !== undefined ||
      requestData.maximumSalary !== undefined
    ) {
      const salaryValidation = validateSalaryRange(
        requestData.minimumSalary,
        requestData.maximumSalary
      );
      if (!salaryValidation.valid) {
        return NextResponse.json(
          { error: salaryValidation.error },
          { status: 400 }
        );
      }
    }

    const { db } = await connectMongoDB();

    let dataUpdates = { ...requestData };
    delete dataUpdates._id;

    // ========================================================================
    // Step 9: Sanitize All Text Fields
    // ========================================================================

    if (dataUpdates.jobTitle) {
      dataUpdates.jobTitle = sanitizeText(dataUpdates.jobTitle);
    }

    if (dataUpdates.description) {
      dataUpdates.description = sanitizeHTML(dataUpdates.description);
    }

    if (dataUpdates.location) {
      dataUpdates.location = sanitizeText(dataUpdates.location);
    }

    if (dataUpdates.workSetupRemarks) {
      dataUpdates.workSetupRemarks = sanitizeText(dataUpdates.workSetupRemarks);
    }

    if (dataUpdates.country) {
      dataUpdates.country = sanitizeText(dataUpdates.country);
    }

    if (dataUpdates.province) {
      dataUpdates.province = sanitizeText(dataUpdates.province);
    }

    if (dataUpdates.city) {
      dataUpdates.city = sanitizeText(dataUpdates.city);
    }

    if (dataUpdates.lastEditedBy) {
      dataUpdates.lastEditedBy = sanitizeUserInfo(dataUpdates.lastEditedBy);
    }

    // ========================================================================
    // Step 10: Validate and Sanitize Team Access
    // ========================================================================

    if (dataUpdates.teamAccess !== undefined) {
      // Validate teamAccess array
      if (!Array.isArray(dataUpdates.teamAccess)) {
        return NextResponse.json(
          { error: "Team access must be an array" },
          { status: 400 }
        );
      }

      // Validate and sanitize team access members
      const sanitizedTeamAccess = dataUpdates.teamAccess.map((member: any) => {
        if (!member.email || !validateEmail(member.email)) {
          throw new Error("Invalid team member email address");
        }
        return {
          name: sanitizeText(member.name || ""),
          email: member.email.toLowerCase().trim(),
          image: sanitizeText(member.image || ""),
          role: sanitizeText(member.role || "Contributor"),
        };
      });

      // Validate at least one Job Owner for published careers
      if (isPublishing) {
        const hasJobOwner = sanitizedTeamAccess.some(
          (member: any) => member.role === "Job Owner"
        );
        if (!hasJobOwner && sanitizedTeamAccess.length > 0) {
          return NextResponse.json(
            { error: "At least one member must have the Job Owner role" },
            { status: 400 }
          );
        }
      }

      dataUpdates.teamAccess = sanitizedTeamAccess;
    }

    // ========================================================================
    // Step 11: Sanitize and Validate Interview Questions
    // ========================================================================

    if (dataUpdates.questions) {
      const sanitizedQuestions = sanitizeInterviewQuestions(
        dataUpdates.questions
      );
      dataUpdates.questions = sanitizedQuestions;

      // Only validate minimum question count for published careers
      if (isPublishing) {
        const questionsValidation =
          validateInterviewQuestions(sanitizedQuestions);
        if (!questionsValidation.valid) {
          return NextResponse.json(
            { error: questionsValidation.error },
            { status: 400 }
          );
        }
      }
    }

    // ========================================================================
    // Step 12: Sanitize and Validate Prescreening Questions
    // ========================================================================

    if (dataUpdates.prescreeningQuestions) {
      const sanitizedPrescreeningQuestions = sanitizePrescreeningQuestions(
        dataUpdates.prescreeningQuestions
      );
      dataUpdates.prescreeningQuestions = sanitizedPrescreeningQuestions;

      // Validate prescreening questions structure for published careers
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
    }

    // ========================================================================
    // Step 13: Type Coercion for Specific Fields
    // ========================================================================

    if (dataUpdates.requireVideo !== undefined) {
      dataUpdates.requireVideo = Boolean(dataUpdates.requireVideo);
    }

    if (dataUpdates.salaryNegotiable !== undefined) {
      dataUpdates.salaryNegotiable = Boolean(dataUpdates.salaryNegotiable);
    }

    if (dataUpdates.isUnpublished !== undefined) {
      dataUpdates.isUnpublished = Boolean(dataUpdates.isUnpublished);
    }

    if (dataUpdates.minimumSalary !== undefined && dataUpdates.minimumSalary !== null) {
      dataUpdates.minimumSalary = Number(dataUpdates.minimumSalary);
    }

    if (dataUpdates.maximumSalary !== undefined && dataUpdates.maximumSalary !== null) {
      dataUpdates.maximumSalary = Number(dataUpdates.maximumSalary);
    }

    if (dataUpdates.currentStep !== undefined) {
      dataUpdates.currentStep = Number(dataUpdates.currentStep);
    }

    // ========================================================================
    // Step 14: Update Career Document
    // ========================================================================

    dataUpdates.updatedAt = new Date();

    const career = {
      ...dataUpdates,
    };

    await db
      .collection("careers")
      .updateOne({ _id: new ObjectId(_id) }, { $set: career });

    return NextResponse.json({
      message: "Career updated successfully",
      career,
    });
  } catch (error) {
    console.error("Error updating career:", error);
    return NextResponse.json(
      { error: "Failed to update career" },
      { status: 500 }
    );
  }
}
