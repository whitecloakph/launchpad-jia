// app/api/whitecloak/ai-screening/route.ts
// THREE FLOWS: Strong Fit → Human Interview | Good Fit → AI Interview | Others → Review/Fail
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import OpenAI from "openai";

export async function POST(request: Request) {
  const { interviewID, userEmail, preScreeningAnswers } = await request.json();
  const { db } = await connectMongoDB();
  
  const interviewData = await db.collection("interviews").findOne({
    interviewID,
    email: userEmail,
  });

  if (!interviewData) {
    return NextResponse.json({
      error: "AI Screening Failed",
      message: "No application found for the selected job.",
    });
  }

  // Get CV data
  const cvData = await db.collection("applicant-cv").findOne({
    email: userEmail,
  });

  if (!cvData) {
    return NextResponse.json({
      error: "AI Screening Failed",
      message: "You have not uploaded a CV for this application.",
    });
  }

  // Format CV
  let parsedCV = "";
  cvData.digitalCV.forEach((section) => {
    parsedCV += `${section.name}\n${section.content}\n\n`;
  });

  // Format pre-screening answers
  let formattedAnswers = "";
  interviewData.preScreeningQuestions.forEach((question) => {
    const answer = preScreeningAnswers[question.id];
    let answerText = "";

    if (question.questionFormat === "Multiple Choice" && Array.isArray(answer)) {
      const selectedOptions = question.answers
        .filter(a => answer.includes(a.id))
        .map(a => a.value);
      answerText = selectedOptions.join(", ");
    } else if (question.questionFormat === "Dropdown") {
      answerText = answer;
    } else if (question.questionFormat === "Range") {
      answerText = `${answer} ${question.rangeUnit || ""}`;
    } else {
      answerText = answer;
    }

    formattedAnswers += `Q: ${question.question}\nA: ${answerText}\n\n`;
  });

  // Get AI screening prompt from settings
  const aiScreeningPromptData = await db.collection("global-settings").findOne(
    {
      name: "global-settings",
    },
    {
      projection: {
        ai_screening_prompt: 1,
      },
    }
  );
  const aiScreeningPromptText =
    aiScreeningPromptData?.ai_screening_prompt?.prompt || 
    `Analyze the candidate's responses to determine if they are a good fit for the role. 
     Consider their answers in the context of the job requirements.
     Evaluate their alignment with role expectations, work preferences, and qualifications.`;

  const screeningPrompt = `
    You are a helpful AI assistant conducting pre-screening assessment.
    You are given a candidate's CV, their pre-screening question responses, and a job description.
    You need to evaluate if they are a good fit for the job based on both their CV and their answers.

    Job Details:
      Job Title: ${interviewData.jobTitle}
      Job Description: ${interviewData.description}
      Work Setup: ${interviewData.workSetup}
      Location: ${interviewData.location}
      Employment Type: ${interviewData.employmentType}
      Salary Range: ${interviewData.minimumSalary} - ${interviewData.maximumSalary} PHP

    Applicant Information:
      Name: ${interviewData.name}
      Email: ${userEmail}

    Applicant CV:
      ${parsedCV}

    Pre-Screening Questions & Answers:
      ${formattedAnswers}

    ${interviewData.secretPrompt ? `Additional Evaluation Criteria:\n${interviewData.secretPrompt}\n` : ''}

    Processing Instructions:
      ${aiScreeningPromptText}

    - Carefully analyze both the CV and the pre-screening answers
    - Consider how their answers align with job requirements
    - Evaluate work setup preferences, availability, and expectations
    - Assess technical skills and experience from CV
    - Check for any deal-breakers or misalignments

    - Format your response as JSON:
      {
        "result": <Result (No Fit / Bad Fit / Good Fit / Strong Fit / Insufficient Data)>,
        "reason": <Detailed reason for the assessment>,
        "confidence": <AI Assessment Confidence (0-100)>,
        "jobFitScore": <Overall Score (0-100)>,
        "keyStrengths": [<Array of key strengths>],
        "concerns": [<Array of concerns or gaps>]
      }

    Processing Instructions:
      - Return only the JSON, nothing else
      - Be thorough and specific in your reasoning
      - Set result to "Strong Fit" only for candidates who excel in both CV and answers
      - Set result to "Good Fit" for candidates who meet requirements well
      - Set result to "Bad Fit" or "No Fit" for clear mismatches
      - Set result to "Insufficient Data" if critical information is missing
      - DO NOT include \`\`\`json or \`\`\` around the response
  `;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: screeningPrompt,
      },
    ],
  });

  let result: any = completion.choices[0].message.content;

  try {
    result = result.replace(/```json/g, "").replace(/```/g, "").trim();
    result = JSON.parse(result);
  } catch (error) {
    console.log("JSON Parse Error:", error);
    return NextResponse.json({
      error: "AI Screening Failed",
      message: "Invalid response from AI screening.",
    });
  }

  // Prepare screening data
  let screeningData: any = {
    aiStatus: result.result,
    aiScreeningReason: result.reason,
    aiConfidence: result.confidence,
    aiJobFitScore: result.jobFitScore,
    aiKeyStrengths: result.keyStrengths || [],
    aiConcerns: result.concerns || [],
    preScreeningAnswers: preScreeningAnswers,
    updatedAt: Date.now(),
  };

  const newDate = new Date();
  let interviewTransaction: any = null;

  // THREE DISTINCT FLOWS BASED ON AI SCREENING RESULT
  
  // FLOW 1: STRONG FIT → Skip AI Interview → Go to Human Interview
  if (result.result === "Strong Fit") {
    screeningData.currentStep = "Human Interview";
    screeningData.status = "For Human Interview";
    screeningData.statusDate = {
      ...interviewData.statusDate,
      "Human Interview": newDate,
    };
    screeningData.stateClass = "state-accepted";
    screeningData.aiSettingResult = "Passed";

    interviewTransaction = {
      interviewUID: interviewData._id.toString(),
      fromStage: "AI Screening",
      toStage: "For Human Interview",
      action: "Auto-Promoted (Strong Fit - Skipped AI Interview)",
      updatedBy: {
        name: "Jia",
      },
    };

    screeningData.applicationMetadata = {
      updatedAt: Date.now(),
      updatedBy: {
        name: "Jia",
      },
      action: "Proceed to Human Interview",
    };
  }
  // FLOW 2: GOOD FIT → Must do AI Interview
  else if (result.result === "Good Fit") {
    screeningData.currentStep = "CV Screening";
    screeningData.status = "For AI Interview";
    screeningData.statusDate = {
      ...interviewData.statusDate,
      "AI Interview": newDate,
    };
    screeningData.stateClass = "state-accepted";
    screeningData.aiSettingResult = "Passed";

    interviewTransaction = {
      interviewUID: interviewData._id.toString(),
      fromStage: "AI Screening",
      toStage: "Pending AI Interview",
      action: "Proceed to AI Interview (Good Fit)",
      updatedBy: {
        name: "Jia",
      },
    };

    screeningData.applicationMetadata = {
      updatedAt: Date.now(),
      updatedBy: {
        name: "Jia",
      },
      action: "Proceed to AI Interview",
    };
  }
  // FLOW 3: BELOW GOOD FIT → Failed or For Review
  else {
    screeningData.currentStep = "CV Screening";
    screeningData.status = "For AI Screening Review";
    screeningData.stateClass = result.result === "No Fit" || result.result === "Bad Fit" 
      ? "state-rejected" 
      : "state-pending";
    screeningData.aiSettingResult = result.result === "No Fit" || result.result === "Bad Fit"
      ? "Failed"
      : "For Review";

    interviewTransaction = {
      interviewUID: interviewData._id.toString(),
      fromStage: "AI Screening",
      action: `Screening Result: ${result.result}`,
      updatedBy: {
        name: "Jia",
      },
    };

    screeningData.applicationMetadata = {
      updatedAt: Date.now(),
      updatedBy: {
        name: "Jia",
      },
      action: "Pending Review",
    };
  }

  // Update interview document
  await db
    .collection("interviews")
    .updateOne({ interviewID: interviewID }, { $set: screeningData });

  // Save transaction history
  if (interviewTransaction) {
    await db.collection("interview-history").insertOne({
      ...interviewTransaction,
      createdAt: Date.now(),
    });
  }

  // Update career lastActivityAt
  await db
    .collection("careers")
    .updateOne(
      { id: interviewData.id },
      { $set: { lastActivityAt: new Date() } }
    );

  return NextResponse.json({
    ...screeningData,
    aiStatus: result.result,
  });
}

/*
  THREE DISTINCT FLOWS:

  ===== FLOW 1: STRONG FIT =====
  Result: "Strong Fit"
  → currentStep: "Human Interview"
  → status: "For Human Interview"
  → aiSettingResult: "Passed"
  → Skips AI Interview entirely
  → Goes directly to Human Interview stage
  → Recruiter sees them in "For Human Interview" column
  → Applicant sees: "Waiting for human interview to be scheduled"

  ===== FLOW 2: GOOD FIT =====
  Result: "Good Fit"
  → currentStep: "CV Screening"
  → status: "For AI Interview"
  → aiSettingResult: "Passed"
  → Must complete AI Interview
  → Goes to "Pending AI Interview" stage
  → Recruiter sees them in "Pending AI Interview" column
  → Applicant sees: "Start AI Interview" button

  ===== FLOW 3: BELOW GOOD FIT =====
  Result: "Bad Fit", "No Fit", "Insufficient Data", "Maybe Fit"
  → currentStep: "CV Screening"
  → status: "For AI Screening Review"
  → aiSettingResult: "Failed" (if Bad/No Fit) or "For Review" (others)
  → Needs human reviewer decision
  → Recruiter sees them in "CV Review" column with pending status
  → Applicant sees: "Under review by hiring team"

  TEST CASES:
  1. Strong Fit candidate → Should appear in "For Human Interview" in recruiter dashboard
  2. Good Fit candidate → Should see "Start AI Interview" button in applicant dashboard
  3. Bad Fit candidate → Should be marked as failed/review
*/