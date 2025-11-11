"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import PreScreeningQuestionGenerator from "../../PreScreeningQuestionGenerator";

const screeningSettingList = [
  { name: "Good Fit and above", icon: "la la-check" },
  { name: "Only Strong Fit", icon: "la la-check-double" },
  { name: "No Automatic Promotion", icon: "la la-times" },
];

interface PreScreeningQuestion {
  id: string;
  question: string;
  answerType:
    | "short_answer"
    | "long_answer"
    | "dropdown"
    | "checkboxes"
    | "range";
  options?: string[];
  rangeConfig?: {
    min: number;
    max: number;
    step: number;
    minLabel?: string;
    maxLabel?: string;
  };
  required: boolean;
}

export default function SegmentSettings({
  screeningSetting,
  setScreeningSetting,
  preScreeningQuestions,
  setPreScreeningQuestions,
}: {
  screeningSetting: string;
  setScreeningSetting: (value: string) => void;
  preScreeningQuestions: PreScreeningQuestion[];
  setPreScreeningQuestions: (questions: PreScreeningQuestion[]) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 20,
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 0.72,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
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

          {/* Content */}
          <div className="layered-card-content">
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <span className="sub-career-label">
                CV Screening <span style={{ color: "#EF4444" }}>*</span>
              </span>
            </div>

            <span
              style={{
                fontSize: "16px",
                marginBottom: "8px",
                color: "#414651",
              }}
            >
              Jia automatically endorses candidates who meet the chosen
              criteria.
            </span>

            <div
              style={{ borderBottom: "1px solid #D1D5DB", paddingBottom: 25 }}
            >
              <div style={{ width: "40%" }}>
                <CustomDropdown
                  onSelectSetting={(setting) => setScreeningSetting(setting)}
                  screeningSetting={screeningSetting}
                  settingList={screeningSettingList}
                />
              </div>
            </div>

            {/* Secret prompt section */}
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
                <span className="sub-career-label">CV Secret Prompt</span>
                <span>(optional)</span>
              </div>

              <span
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  color: "#414651",
                }}
              >
                Secret Prompts give you extra control over Jia's evaluation
                style.
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

        {/* Pre-Screening Questions Card */}

        <PreScreeningQuestionGenerator
          questions={preScreeningQuestions}
          setQuestions={setPreScreeningQuestions}
        />
      </div>

      <div
        style={{
          flex: 0.28,
          position: "sticky",
          top: 16,
          height: "fit-content",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <span
              className="career-label"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <i
                className="la la-lightbulb"
                style={{
                  color: "#414651",
                  fontSize: 24,
                  textShadow: "0 0 1px #414651",
                }}
              ></i>
              Tips
            </span>
          </div>

          <div className="layered-card-content">
            <p style={{ marginTop: 8, color: "#414651" }}>
              <span style={{ fontWeight: 700 }}>Add a Secret Prompt</span> to
              fine-tune how Jia scores and evaluates submitted CVs.
            </p>
            <p style={{ marginTop: 4, color: "#414651" }}>
              <span style={{ fontWeight: 700 }}>
                Add Pre-Screening questions
              </span>{" "}
              to collect key details such as notice period, work setup, or
              salary expectations to guide your review and candidate
              discussions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
