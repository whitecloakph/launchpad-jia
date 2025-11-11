"use client";

import { useState } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import PrescreeningQuestions from "@/lib/components/CareerComponents/PrescreeningQuestions";
import { Tooltip } from "react-tooltip";
import styles from "@/lib/styles/screens/careerFormStep2.module.scss";

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
}

export default function CareerFormStep2({
  formData,
  updateFormData,
  onNext,
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
    <div className={styles.mainWrapper}>
      {/* Form Content */}
      <div className={styles.formContent}>
        {/* 1. CV Screen Settings */}
        <div className="layered-card-middle">
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>1. CV Review Settings</h1>
          </div>

          <div className="layered-card-content">
            <div className={styles.marginBottomSmall}>
              <label className={styles.formLabel}>CV Setting</label>
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
            <div>
              <label className={styles.formLabelFlex}>
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
                placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
              />
            </div>
          </div>
        </div>
        
        {/* 2. Pre-screening Questions */}
        <div className="layered-card-middle">
          <div className={styles.sectionHeaderSpaced}>
            <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>2. Pre-Screening Questions</h1>
              <span className={styles.optionalText}>(optional)</span>
              {(formData.prescreeningQuestions || []).length > 0 && (
                <span className={styles.countBadge}>
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
              className={styles.addCustomButton}
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

      {/* Tips Section */}
      <div className={styles.tipsSidebar}>
        <div className="layered-card-middle">
          <div className={styles.tipsHeader}>
            <img src="/career-form/tips.svg" alt="Tips Icon" />
            <h3 className={styles.tipsHeaderTitle}>Tips</h3>
          </div>

          <div className="layered-card-content">
            <div className={styles.tipsContainer}>
              <p className={styles.tipsParagraph}>
                <strong className={styles.tipsStrong}>
                  Add a Secret Prompt
                </strong>{" "}
                to fine-tune how Jia scores and evaluates submitted CVs.
              </p>
              <p className={styles.tipsParagraph}>
                <strong className={styles.tipsStrong}>
                  Add Pre-Screening questions
                </strong>{" "}
                to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <Tooltip className="career-fit-tooltip" id="secret-prompt-tooltip" />
    </div>
  );
}
