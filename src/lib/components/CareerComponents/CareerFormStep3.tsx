"use client";

import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import { Tooltip } from "react-tooltip";
import styles from "@/lib/styles/screens/careerFormStep3.module.scss";

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
  showValidation?: boolean;
}

export default function CareerFormStep3({
  formData,
  updateFormData,
  onNext,
  showValidation = false,
}: CareerFormStep3Props) {
  const isStepValid = () => {
    // Count only non-empty questions
    const totalQuestions =
      formData.questions?.reduce((acc: number, group: any) => {
        // Filter out empty questions before counting
        const nonEmptyQuestions = group.questions.filter(
          (q: any) => q.question && q.question.trim().length > 0
        );
        return acc + nonEmptyQuestions.length;
      }, 0) || 0;
    return totalQuestions >= 5;
  };

  const handleNext = () => {
    if (isStepValid()) {
      onNext();
    }
  };

  return (
    <div className={styles.mainWrapper}>
      {/* Form Content */}
      <div className={styles.formContent}>
        {/* AI Interview Settings Section */}
        <div className="layered-card-middle">
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>1. AI Interview Settings</h1>
          </div>

          <div className="layered-card-content">
            <div className={styles.settingGroup}>
              <label className={styles.formLabel}>
                AI Interview Screening
              </label>
              <p className={styles.descriptionText}>
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
            <hr className={styles.divider} />
            <div className={styles.settingGroup}>
              <label className={styles.formLabel}>
                Require Video On Interview
              </label>
              <div className={styles.videoToggleWrapper}>
                <p className={styles.videoToggleDescription}>
                  When enabled, applicants must complete a video interview as
                  part of the application process.
                </p>
                <div className={styles.toggleControls}>
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
                  <span className={styles.toggleLabel}>
                    {formData.requireVideo !== false ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            <hr className={styles.divider} />
            <div>
              <label className={styles.formLabelFlex}>
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
                  className={styles.helpIconCursor}
                />
              </label>
              <p className={styles.descriptionText}>
                Secret Prompts give you extra control over Jia's evaluation
                style, complementing her accurate assessment of requirements
                from the job description.
              </p>
              <textarea
                className={styles.textarea}
                placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                value={formData.aiInterviewSecretPrompt || ""}
                onChange={(e) =>
                  updateFormData({ aiInterviewSecretPrompt: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* AI Interview Questions Section */}
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

      {/* Tips Section */}
      <div className={styles.tipsSidebar}>
        <div className="layered-card-middle">
          <div className={styles.tipsHeader}>
            <img src="/career-form/tips.svg" alt="Tips Icon" />
            <h3 className={styles.tipsTitle}>Tips</h3>
          </div>

          <div className="layered-card-content">
            <div className={styles.tipsContainer}>
              <p className={styles.tipsParagraph}>
                <strong className={styles.tipsStrong}>
                  Add a Secret Prompt
                </strong>{" "}
                to fine-tune how Jia scores and evaluates the interview
                responses.
              </p>
              <p className={styles.tipsParagraph}>
                <strong className={styles.tipsStrong}>
                  Use "Generate Questions"
                </strong>{" "}
                to quickly create tailored interview questions, then refine or
                mix them with your own for balanced results.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tooltip className="career-fit-tooltip" id="ai-secret-prompt-tooltip" />
    </div>
  );
}
