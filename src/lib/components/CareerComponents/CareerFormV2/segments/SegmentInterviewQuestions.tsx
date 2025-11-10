"use client";

import InterviewQuestionGeneratorV2 from "../../InterviewQuestionGeneratorV2";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

const screeningSettingList = [
  {
    name: "Good Fit and above",
    icon: "la la-check",
  },
  {
    name: "Only Strong Fit",
    icon: "la la-check-double",
  },
  {
    name: "No Automatic Promotion",
    icon: "la la-times",
  },
];

export default function SegmentInterviewQuestions({
  questions,
  setQuestions,
  jobTitle,
  description,
  screeningSetting,
  setScreeningSetting,
  requireVideo,
  setRequireVideo,
}: {
  questions: any[];
  setQuestions: (questions: any[]) => void;
  jobTitle: string;
  description: string;
  screeningSetting: string;
  setScreeningSetting: (value: string) => void;
  requireVideo: boolean;
  setRequireVideo: (value: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="layered-card-middle">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="career-label">1. CV Review Settings</span>
        </div>
        <div className="layered-card-content">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <span className="sub-career-label">
              CV Screening <span style={{ color: "#EF4444" }}>*</span>
            </span>
          </div>
          <span style={{ marginBottom: "8px" }}>
            Jia automatically endorses candidates who meet the chosen criteria.
          </span>
          <div
            style={{
              width: "30%",
              borderBottom: "1px solid #E5E7EB",
              paddingBottom: 30,
            }}
          >
            <CustomDropdown
              onSelectSetting={(setting) => setScreeningSetting(setting)}
              screeningSetting={screeningSetting}
              settingList={screeningSettingList}
            />
          </div>
          <div style={{ borderBottom: "1px solid #D1D5DB", paddingBottom: 25 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
              }}
            >
              <span className="sub-career-label">
                Require Video on Interview
              </span>
              <span style={{ marginBottom: "8px" }}>
                Require candidates to keep their camera on. Recordings will
                appear on their analysis page.
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <i
                  className="la la-video"
                  style={{
                    color: "#414651",
                    fontSize: 24,
                    textShadow: "0 0 1px #414651",
                  }}
                ></i>

                <span>Require Video Interview</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={requireVideo}
                    onChange={() => setRequireVideo(!requireVideo)}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{requireVideo ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <span className="sub-career-label">
                AI Interview Secret Prompt{" "}
              </span>
              <span>(optional)</span>
            </div>
            <span
              style={{
                fontSize: "16px",
                marginBottom: "8px",
                color: "#414651",
              }}
            >
              Secret Prompts give you extra control over Jia’s evaluation style,
              complementing her accurate assessment of requirements from the job
              description.
            </span>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div className="layered-card-content">
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InterviewQuestionGeneratorV2
        questions={questions}
        setQuestions={setQuestions}
        jobTitle={jobTitle}
        description={description}
      />
    </div>
  );
}
