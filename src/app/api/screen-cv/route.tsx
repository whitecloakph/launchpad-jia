import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import OpenAI from "openai";
import { sendEmail } from "@/lib/Email";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { interviewID, userEmail, testMode, testInterviewData, testCVData } =
    await request.json();

  const { db } = await connectMongoDB();

  let interviewData;

  // set interview data with test mode case
  if (!testMode) {
    interviewData = await db.collection("interviews").findOne({
      interviewID: interviewID,
    });
  } else {
    interviewData = testInterviewData;
  }

  let cvData;

  if (!testMode) {
    cvData = await db.collection("applicant-cv").findOne({
      email: userEmail,
    });
  } else {
    cvData = testCVData;
  }

  let cvScreeningPromptData = await db.collection("global-settings").findOne(
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

  if (!interviewData) {
    return NextResponse.json({
      message: "[CV Screening Error] Interview not found - Operation Aborted",
    });
  }

  if (!cvData) {
    let noCVError = {
      cvStatus: "No CV",
      stateClass: "state-muted",
      cvSettingResult: null,
      cvScreeningReason: "Applicant has no CV uploaded.",
    };

    await db.collection("interviews").updateOne(
      { interviewID: interviewID },
      {
        $set: noCVError,
      }
    );

    return NextResponse.json(noCVError);
  }

  let parsedCV = "";

  cvData.digitalCV.forEach((section) => {
    parsedCV += `${section.name}\n${section.content}\n`;
  });

  function generateScreeningPrompt(
    interviewInstance: any,
    cvData: any,
    globalSettings: any
  ) {
    if (!interviewInstance) {
      console.error("Error: interviewInstance parameter is missing");
      return "";
    }

    if (!cvData) {
      console.error("Error: cvData parameter is missing");
      return "";
    }

    if (!globalSettings) {
      console.error("Error: globalSettings parameter is missing");
      return "";
    }

    let promptText = `
    You are a helpful AI assistant. 
  You are given a candidate's CV and a job description.
  You need to screen the candidate's CV and determine if they are a good fit for the job.

  Job Details:
  Job Title: 
  ${interviewInstance.jobTitle}
  Job Description: 
  ${interviewInstance.description}

  Applicant CV information:
  Applicant Name: ${interviewInstance.name}

  Applicant CV:
  ${parsedCV}

  Processing Steps: 
  ${cvScreeningPromptText}
  - format your response as json: 
  {
    "result": <Result (No Fit / Bad Fit / Good Fit / Strong Fit / Ineligible CV / Insufficient Data)>,
    "reason": <Reason>,
    "confidence": <AI Assessment Confidence (0-100)>
    "jobFitScore": <Overall Score (0-100)>
  } 
  - return only the code JSON, nothing else.
  - carefully analyze the applicant's CV and job description
  - be as accurate as possible
  - give a detailed reason for the result, be clear, concise, and specific.
  - set result to Ineligible CV if the applicant's CV is not in the correct format.
  - set result to Insufficient Data if the applicant's CV is missing important information.
  - do not include any other text or comments.
  `;

    return promptText;
  }

  let screeningPrompt = generateScreeningPrompt(
    interviewData,
    parsedCV,
    cvScreeningPromptText
  );

  // console.log(screeningPrompt);

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

  let screeningData: any = {
    cvStatus: result.result,
    stateClass: "state-accepted",
    cvSettingResult: null,
    cvScreeningReason: result.reason,
    currentStep: "CV Screening",
    confidence: result.confidence,
    jobFitScore: result.jobFitScore,
  };

  if (result.result === "No Fit" || result.result === "Bad Fit") {
    screeningData.stateClass = "state-rejected";
    screeningData.cvSettingResult = "Failed";
  }

  // manage state class
  if (result.result === "Good Fit") {
    screeningData.stateClass = "state-good";
    screeningData.cvSettingResult = "Passed";
  }

  if (result.result === "Strong Fit") {
    screeningData.stateClass = "state-accepted";
    screeningData.cvSettingResult = "Passed";
  }

  if (
    result.result === "Ineligible CV" ||
    result.result === "Insufficient Data"
  ) {
    screeningData.stateClass = "state-rejected";
    screeningData.cvSettingResult = "Failed";
  }

  // check screening setting
  if (interviewData.screeningSetting) {
    if (interviewData.screeningSetting === "Only Strong Fit") {
      if (result.result === "Strong Fit") {
        screeningData.stateClass = "state-accepted";
        screeningData.cvSettingResult = "Passed";
        screeningData.currentStep = "AI Interview";
        screeningData.status = "For Interview";
      } else {
        screeningData.stateClass = "state-rejected";
        screeningData.cvSettingResult = "Failed";
        screeningData.status = "Failed CV Screening";
      }
    }

    if (interviewData.screeningSetting === "Good Fit and above") {
      if (result.result === "Good Fit" || result.result === "Strong Fit") {
        screeningData.stateClass = "state-accepted";
        screeningData.cvSettingResult = "Passed";
        screeningData.currentStep = "AI Interview";
        screeningData.status = "For Interview";
      } else {
        screeningData.stateClass = "state-rejected";
        screeningData.cvSettingResult = "Failed";
        screeningData.status = "Failed CV Screening";
      }
    }
  }

  if (!testMode) {
    await db
      .collection("interviews")
      .updateOne({ interviewID: interviewID }, { $set: screeningData });
  }

  if (testMode) {
    screeningData.testMode = true;
  }

  // await sendEmail({
  //   recipient: userEmail,
  //   html: `
  //     <div>
  //       <p>Dear ${interviewData.name},</p>
  //       <p>Your CV has been successfully screened.</p>
  //     </div>
  //   `,
  // });

  return NextResponse.json(screeningData);
}
