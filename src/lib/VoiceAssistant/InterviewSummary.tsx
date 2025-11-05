"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardLoader from "../components/AnalysisComponents/CardTypingLoader";
import axios from "axios";
import Markdown from "react-markdown";

interface InterviewSummaryProps {
  interviewData?: {
    candidateName?: string;
    jobTitle?: string;
    transcript?: any;
  };
  currentScreen?: string;
  onFinishInterview?: () => void;
}

export default function InterviewSummary({
  interviewData = {
    candidateName: "Christopher Jones",
    jobTitle: "Software Engineer",
    transcript: [],
  },
  currentScreen,
  onFinishInterview,
}: InterviewSummaryProps) {
  const router = useRouter();
  const [isFinishing, setIsFinishing] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleFinishInterview = () => {
    setIsFinishing(true);
    if (onFinishInterview) {
      onFinishInterview();
    } else {
      // Default behavior - redirect to applicant page
      setTimeout(() => {
        router.push("/applicant");
      }, 1000);
    }
  };

  const generateSummary = async (trData) => {
    setSummary("");
    let intSummary = "";

    trData.forEach((msg) => {
      intSummary += `${msg.type === "jia" ? "interviewer" : "applicant"}: ${
        msg.content
      }\n`;
    });

    let llmPrompt = `
    You are a helpful assistant that can answer questions and help with tasks.
    Take the Job details and interview transcript and create a summary of the interview.
  

    Interview Transcript:
    ${intSummary}

    Your task is to create a short an concise summary of the interview

    - Address summary to the applicant the applicant will be reading this summary
    - provide 3 paragrams, 3 sentences maximum for the overall summary
    - followed by "Among your proudest accomplishments:" section
      - provide 5 maximum points of the best accomplishments of the applicant
    - provide only the markdown output without any other text
    `;

    const response = await axios
      .post("/api/llm-reasoner", {
        corePrompt: llmPrompt,
      })
      .then((res) => {
        return res.data.result;
      });

    let formattedSummary = response
      .replace("```markdown`", "")
      .replace("```", "")
      .replace("markdown", "");

    setSummary(formattedSummary);
  };

  useEffect(() => {
    if (currentScreen === "summary") {
      generateSummary(interviewData.transcript);
    }
  }, [currentScreen]);

  return (
    <div
      className={`meeting-interface ${
        currentScreen === "summary" ? "d-flex" : "d-none"
      }`}
      id="interview-summary-container"
      style={{
        overflowY: "scroll",
      }}
    >
      <div className="meeting-container ismc">
        {/* Header Bar */}
        <div className="interview-top-bar" id="istb">
          <div className="interview-info">
            <span className="interview-title">Interview Summary</span>
            <span className="muted-text">|</span>
            <span className="interview-title">
              {interviewData.jobTitle} Interview: {interviewData.candidateName}
            </span>
          </div>
          <div className="interview-status">
            {/* <button
              className="end-interview-btn"
              onClick={() => {
                generateSummary(interviewData.transcript);
              }}
            >
              <i className="la la-arrow-left"></i>
              Regenerate Summary
            </button> */}

            <button
              className="end-interview-btn"
              onClick={handleFinishInterview}
              disabled={!summary}
              style={{
                opacity: !summary ? 0.3 : 1,
                cursor: !summary ? "not-allowed" : "pointer",
                background: "#000",
              }}
            >
              {isFinishing ? "Finishing..." : "Finish Interview"}{" "}
              <i className="la la-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="meeting-block interview-summary-container">
          <div className="interview-summary-card">
            {/* Gradient Border at Top */}
            <div className="interview-summary-gradient-border"></div>

            {/* Summary Header */}
            <div className="interview-summary-header-wrapper">
              <div className="summary-header-content">
                <div className="interview-summary-icon">
                  <i className="la la-file-text"></i>
                </div>
                <h3 className="interview-summary-title">Interview Summary</h3>
              </div>

              {!summary && (
                <div className="interview-summary-content pt-4">
                  <CardLoader
                    title="Generating Summary..."
                    notesArray={[
                      "This may take couple few minutes...",
                      "Please wait...",
                      "Generating summary for your interview...",
                    ]}
                  />
                </div>
              )}

              {summary && (
                <div className="interview-summary-content">
                  {/* Summary Content */}
                  <Markdown>{summary}</Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
