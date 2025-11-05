import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import OpenAI from "openai";

/** 
 * This API is used to only analyze the CV of a candidate without auto-promoting the candidate stage.
*/
export async function POST(request: Request) {
  const { interviewID, userEmail } = await request.json();
  const { db } = await connectMongoDB();
  const interviewData = await db.collection("interviews").findOne({
    interviewID,
  });

  if (!interviewData) {
    return NextResponse.json({
      error: "CV Screening Failed",
      message: "No application found for the selected job.",
    });
  }

  const cvData = await db.collection("applicant-cv").findOne({
    email: userEmail,
  });

  if (!cvData) {
    return NextResponse.json({
      error: "CV Screening Failed",
      message: "You have not uploaded a CV for this application.",
    });
  }

  const cvScreeningPromptData = await db.collection("global-settings").findOne(
    {
      name: "global-settings",
    },
    {
      projection: {
        cv_screening_prompt: 1,
      },
    }
  );
  const cvScreeningPromptText =
    cvScreeningPromptData?.cv_screening_prompt?.prompt;

  let parsedCV = "";

  cvData.digitalCV.forEach((section) => {
    parsedCV += `${section.name}\n${section.content}\n`;
  });

  const screeningPrompt = `
    You are a helpful AI assistant.
    You are given a candidate's CV and a job description.
    You need to screen the candidate's CV and determine if they are a good fit for the job.

    Job Details:
      Job Title:
      ${interviewData.jobTitle}
      Job Description:
      ${interviewData.description}

    Applicant CV Information:
      Applicant Name: ${interviewData.name}

    Applicant CV:
      ${parsedCV}

    Processing Steps:
      ${cvScreeningPromptText}
      - format your response as JSON:
      {
        "result": <Result (No Fit / Bad Fit / Good Fit / Strong Fit / Ineligible CV / Insufficient Data)>,
        "reason": <Reason>,
        "confidence": <AI Assessment Confidence (0-100)>,
        "jobFitScore": <Overall Score (0-100)>
      }
      - return only the code JSON, nothing else.
      - carefully analyze the applicant's CV and job description.
      - be as accurate as possible.
      - give a detailed reason for the result — be clear, concise, and specific.
      - set result to "Ineligible CV" if the applicant's CV is not in the correct format.
      - set result to "Insufficient Data" if the applicant's CV is missing important information.
      - do not include any other text or comments.
      - DO NOT include \`\`\`json or \`\`\` around the response.
  `;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await openai.responses.create({
    model: "o4-mini",
    reasoning: { effort: "high" },
    input: [
      {
        role: "user",
        content: screeningPrompt,
      },
    ],
  });

  let result: any = completion.output_text;

  try {
    result = result.replace("```json", "").replace("```", "");
    result = JSON.parse(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "[Error] Invalid JSON",
    });
  }

  const update = {
    cvStatus: result.result,
    stateClass: "state-accepted",
    cvSettingResult: null,
    cvScreeningReason: result.reason,
    confidence: result.confidence,
    jobFitScore: result.jobFitScore,
  }

  if (result.result === "Good Fit") {
    update.stateClass = "state-good";
    update.cvSettingResult = "Passed";
  }

  if (result.result === "Strong Fit") {
    update.stateClass = "state-accepted";
    update.cvSettingResult = "Passed";
  }

  if (result.result === "No Fit" || result.result === "Bad Fit" || result.result === "Ineligible CV" || result.result === "Insufficient Data") {
    update.stateClass = "state-rejected";
    update.cvSettingResult = "Failed";
  }
  
  if (interviewData.screeningSetting === "Only Strong Fit") {
    if (result.result === "Strong Fit") {
      update.stateClass = "state-accepted";
      update.cvSettingResult = "Passed";
    } else {
      update.stateClass = "state-rejected";
      update.cvSettingResult = "Failed";
    }
  }

  if (interviewData.screeningSetting === "Good Fit and above") {
    if (result.result === "Good Fit" || result.result === "Strong Fit") {
      update.stateClass = "state-accepted";
      update.cvSettingResult = "Passed";
    } else {
      update.stateClass = "state-rejected";
      update.cvSettingResult = "Failed";
    }
  }

  await db
  .collection("interviews")
  .updateOne({ interviewID: interviewID }, { $set: update });

  return NextResponse.json({
    message: "CV Analysis Completed",
    update: update,
  });
}