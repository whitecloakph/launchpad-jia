"use client";

import { useState } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import PrescreeningQuestions from "@/lib/components/CareerComponents/PrescreeningQuestions";
import { Tooltip } from "react-tooltip";
import {
  COLOR_PRIMARY_DARK,
  COLOR_PRIMARY_DARK_ALT,
  COLOR_WHITE,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_TIPS,
  COLOR_TEXT_PRIMARY,
  COLOR_BORDER_LIGHT,
  COLOR_BORDER_MEDIUM,
} from "@/lib/styles/variables";

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

interface CareerFormStep2Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function CareerFormStep2({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: CareerFormStep2Props) {
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);

  const isStepValid = () => {
    return formData.screeningSetting?.trim().length > 0;
  };

  const handleNext = () => {
    if (isStepValid()) {
      onNext();
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        gap: 24,
      }}
    >
      {/* Form Content */}
      <div style={{ flex: 1 }}>
        <div className="layered-card-outer">
          <div className="layered-card-middle">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
                padding: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: COLOR_PRIMARY_DARK,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ color: COLOR_WHITE, fontSize: 18, fontWeight: 600 }}
                >
                  1.
                </span>
              </div>
              <span
                style={{
                  fontSize: 16,
                  color: COLOR_PRIMARY_DARK_ALT,
                  fontWeight: 700,
                }}
              >
                CV Review Settings
              </span>
            </div>

            <div className="layered-card-content">
              <div style={{ marginBottom: 8 }}>
                <label
                  style={{
                    fontWeight: 500,
                    color: COLOR_PRIMARY_DARK_ALT,
                    marginBottom: 0,
                    display: "block",
                  }}
                >
                  CV Setting
                </label>
                <p
                  style={{
                    color: COLOR_TEXT_SECONDARY,
                  }}
                >
                  Jia automatically endorses candidates who meet the chosen
                  criteria.
                </p>
                <CustomDropdown
                  onSelectSetting={(setting: string) => {
                    updateFormData({ screeningSetting: setting });
                  }}
                  screeningSetting={
                    formData.screeningSetting || "Good Fit and above"
                  }
                  settingList={screeningSettingList}
                />
              </div>
              <hr
                style={{
                  margin: "0 0 8px 0",
                  borderTop: `1px solid ${COLOR_BORDER_LIGHT}`,
                }}
              />
              <div>
                <label
                  style={{
                    fontWeight: 500,
                    color: COLOR_PRIMARY_DARK_ALT,
                    marginBottom: 0,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <img
                    src="/career-form/sparkles.svg"
                    alt="CV Secret Prompt Icon"
                  />
                  CV Secret Prompt
                  <img
                    src="/career-form/help-circle.svg"
                    alt="Help Tooltip"
                    data-tooltip-id="secret-prompt-tooltip"
                    data-tooltip-html="These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt."
                    style={{ cursor: "pointer" }}
                  />
                </label>
                <p
                  style={{
                    color: COLOR_TEXT_SECONDARY,
                  }}
                >
                  Secret Prompts give you extra control over Jia's evaluation
                  style, complementing her accurate assessment of requirements
                  from the job description.
                </p>
                <textarea
                  style={{
                    width: "100%",
                    border: `1px solid ${COLOR_BORDER_LIGHT}`,
                    borderRadius: 5,
                    padding: "0.625rem 0.75rem",
                    lineHeight: 1.5,
                    resize: "none",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                  }}
                  placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="layered-card-outer" style={{ marginTop: 16 }}>
          <div className="layered-card-middle">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginLeft: 8,
                padding: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: COLOR_PRIMARY_DARK,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: COLOR_WHITE,
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    2
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 16,
                    color: COLOR_PRIMARY_DARK,
                    fontWeight: 700,
                  }}
                >
                  Pre-Screening Questions
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: COLOR_TEXT_PRIMARY,
                  }}
                >
                  (optional)
                </span>
                {(formData.prescreeningQuestions || []).length > 0 && (
                  <span
                    style={{
                      padding: "2px 10px",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6B7280",
                    }}
                  >
                    {(formData.prescreeningQuestions || []).length}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  // Add a blank custom question directly
                  const newQuestion = {
                    id: Date.now().toString(),
                    question: "",
                    type: "dropdown" as const,
                    options: [""],
                  };
                  updateFormData({
                    prescreeningQuestions: [
                      ...(formData.prescreeningQuestions || []),
                      newQuestion,
                    ],
                  });
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: COLOR_PRIMARY_DARK,
                  color: COLOR_WHITE,
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="la la-plus"></i>
                Add custom
              </button>
            </div>

            <div className="layered-card-content">
              <PrescreeningQuestions
                questions={formData.prescreeningQuestions || []}
                setQuestions={(questions: any) =>
                  updateFormData({ prescreeningQuestions: questions })
                }
                showHeaderControls={false}
                externalShowAddForm={showAddQuestionForm}
                setExternalShowAddForm={setShowAddQuestionForm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div style={{ width: "300px", flexShrink: 0 }}>
        <div className="layered-card-outer">
          <div className="layered-card-middle">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginLeft: 8,
                padding: 4,
              }}
            >
              <img src="/career-form/tips.svg" alt="Tips Icon" />
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: COLOR_PRIMARY_DARK,
                }}
              >
                Tips
              </h3>
            </div>

            <div className="layered-card-content">
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: COLOR_TEXT_TIPS,
                }}
              >
                <p
                  style={{
                    fontWeight: 410,
                    marginBottom: "12px",
                  }}
                >
                  <strong
                    style={{ color: COLOR_TEXT_PRIMARY, fontWeight: 550 }}
                  >
                    Good Fit and above
                  </strong>{" "}
                  automatically promotes candidates who meet or exceed the role
                  requirements based on their CV analysis.
                </p>
                <p
                  style={{
                    fontWeight: 410,
                    marginBottom: "12px",
                  }}
                >
                  <strong
                    style={{ color: COLOR_TEXT_PRIMARY, fontWeight: 550 }}
                  >
                    Only Strong Fit
                  </strong>{" "}
                  sets a higher bar, promoting only candidates with exceptional
                  matches to your requirements.
                </p>
                <p
                  style={{
                    fontWeight: 410,
                    marginBottom: "12px",
                  }}
                >
                  <strong
                    style={{ color: COLOR_TEXT_PRIMARY, fontWeight: 550 }}
                  >
                    No Automatic Promotion
                  </strong>{" "}
                  requires manual review of all candidates before they proceed
                  to the next stage.
                </p>
                <p
                  style={{
                    fontWeight: 410,
                    marginBottom: "0",
                  }}
                >
                  <strong
                    style={{ color: COLOR_TEXT_PRIMARY, fontWeight: 550 }}
                  >
                    Pre-screening questions
                  </strong>{" "}
                  help filter candidates early by asking specific questions
                  before the AI interview stage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <Tooltip className="career-fit-tooltip" id="secret-prompt-tooltip" />
    </div>
  );
}
