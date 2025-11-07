"use client";

import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import { Tooltip } from "react-tooltip";
import {
  COLOR_PRIMARY_DARK,
  COLOR_PRIMARY_DARK_ALT,
  COLOR_WHITE,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_TIPS,
  COLOR_TEXT_PRIMARY,
  COLOR_BORDER_LIGHT,
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

interface CareerFormStep3Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  showValidation?: boolean;
}

export default function CareerFormStep3({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  showValidation = false,
}: CareerFormStep3Props) {
  const isStepValid = () => {
    const totalQuestions = formData.questions?.reduce(
      (acc: number, group: any) => acc + group.questions.length,
      0
    ) || 0;
    return totalQuestions >= 5;
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
        {/* AI Interview Settings Section */}
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
                AI Interview Settings
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
                  AI Interview Screening
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
              <div style={{ marginBottom: 8 }}>
                <label
                  style={{
                    fontWeight: 500,
                    color: COLOR_PRIMARY_DARK_ALT,
                    marginBottom: 0,
                    display: "block",
                  }}
                >
                  Require Video On Interview
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: 13,
                      color: COLOR_TEXT_SECONDARY,
                    }}
                  >
                    When enabled, applicants must complete a video interview as
                    part of the application process.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.requireVideo !== false}
                        onChange={() =>
                          updateFormData({
                            requireVideo: !formData.requireVideo,
                          })
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        minWidth: "35px",
                      }}
                    >
                      {formData.requireVideo !== false ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
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
                    alt="AI Interview Secret Prompt Icon"
                  />
                  AI Interview Secret Prompt (optional)
                  <img
                    src="/career-form/help-circle.svg"
                    alt="Help Tooltip"
                    data-tooltip-id="ai-secret-prompt-tooltip"
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
                  value={formData.aiInterviewSecretPrompt || ""}
                  onChange={(e) =>
                    updateFormData({ aiInterviewSecretPrompt: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Interview Questions Section */}
        <div className="layered-card-outer" style={{ marginTop: 16 }}>
          <div className="layered-card-middle">
            <InterviewQuestionGeneratorV2
              questions={formData.questions || []}
              setQuestions={(questions: any) => updateFormData({ questions })}
              jobTitle={formData.jobTitle || ""}
              description={formData.description || ""}
              hideHeader={false}
              showHeaderControls={true}
              showValidation={showValidation}
            />
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
                    Add a Secret Prompt
                  </strong>{" "}
                  to fine-tune how Jia scores and evaluates the interview
                  responses.
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
                    Use “Generate Questions”
                  </strong>{" "}
                  to quickly create tailored interview questions, then refine or
                  mix them with your own for balanced results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tooltip className="career-fit-tooltip" id="ai-secret-prompt-tooltip" />
    </div>
  );
}
