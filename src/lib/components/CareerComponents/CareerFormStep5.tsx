"use client";

import styles from "@/lib/styles/screens/careerFormStep5.module.scss";
import { useState } from "react";

interface CareerFormStep5Props {
  formData: any;
  onEditStep: (step: number) => void;
}

export default function CareerFormStep5({
  formData,
  onEditStep,
}: CareerFormStep5Props) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (section: number) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getTotalQuestions = () => {
    return (
      formData.questions?.reduce((total: number, category: any) => {
        return total + (category.questions?.length || 0);
      }, 0) || 0
    );
  };

  return (
    <div className={styles.mainContainer}>
      {/* Step 1: Career Details & Team Access */}
      <div className={`layered-card-outer ${styles.sectionCard}`}>
        <div
          className={`layered-card-middle ${styles.sectionCardClickable}`}
          onClick={() => toggleSection(1)}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <i
                className={
                  expandedSection === 1
                    ? `la la-angle-up ${styles.toggleIcon}`
                    : `la la-angle-down ${styles.toggleIcon}`
                }
              ></i>
              <span className={styles.sectionTitle}>
                Career Details & Team Access
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(1);
              }}
              className={styles.editButton}
            >
              <i className={`la la-pen ${styles.editIcon}`}></i>
            </button>
          </div>

          {expandedSection === 1 && (
            <div className={styles.expandedContent}>
              <div>
                {/* Job Title */}
                <div className={styles.fieldSection}>
                  <p className={styles.fieldLabel}>Job Title</p>
                  <p className={styles.fieldValue}>
                    {formData.jobTitle || "—"}
                  </p>
                </div>

                {/* Employment Type & Work Arrangement */}
                <div className={styles.fieldGrid}>
                  <div>
                    <p className={styles.fieldLabel}>Employment Type</p>
                    <p className={styles.fieldValue}>
                      {formData.employmentType || "—"}
                    </p>
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Work Arrangement</p>
                    <p className={styles.fieldValue}>
                      {formData.workSetup || "—"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className={styles.fieldGrid}>
                  <div>
                    <p className={styles.fieldLabel}>Country</p>
                    <p className={styles.fieldValue}>
                      {formData.country || "Philippines"}
                    </p>
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>State / Province</p>
                    <p className={styles.fieldValue}>
                      {formData.province || "—"}
                    </p>
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>City</p>
                    <p className={styles.fieldValue}>
                      {formData.city || "—"}
                    </p>
                  </div>
                </div>

                {/* Salary */}
                <div className={styles.fieldGrid}>
                  <div>
                    <p className={styles.fieldLabel}>Minimum Salary</p>
                    <p className={styles.fieldValue}>
                      {formData.minimumSalary
                        ? `₱${Number(formData.minimumSalary).toLocaleString()}`
                        : formData.salaryNegotiable !== false
                        ? "Negotiable"
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className={styles.fieldLabel}>Maximum Salary</p>
                    <p className={styles.fieldValue}>
                      {formData.maximumSalary
                        ? `₱${Number(formData.maximumSalary).toLocaleString()}`
                        : formData.salaryNegotiable !== false
                        ? "Negotiable"
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div className={styles.fieldSection}>
                  <p className={styles.fieldLabel}>Job Description</p>
                  <div
                    className={styles.descriptionContainer}
                    dangerouslySetInnerHTML={{
                      __html: formData.description || "—",
                    }}
                  />
                </div>

                {/* Team Access */}
                <div>
                  <p className={styles.fieldLabel}>Team Access</p>
                  <div className={styles.teamAccessItem}>
                    <img
                      src={
                        formData.createdByImage || "/profile-placeholder.png"
                      }
                      alt="Job Owner"
                      className={styles.teamAvatar}
                    />
                    <div className={styles.teamInfo}>
                      <p className={styles.teamName}>
                        {formData.createdByName || "Job Owner"}
                      </p>
                      <p className={styles.teamEmail}>
                        {formData.createdBy || "—"}
                      </p>
                    </div>
                    <div className={styles.teamRole}>Job Owner</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: CV Review & Pre-screening */}
      <div className={`layered-card-outer ${styles.sectionCard}`}>
        <div
          className={`layered-card-middle ${styles.sectionCardClickable}`}
          onClick={() => toggleSection(2)}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <i
                className={
                  expandedSection === 2
                    ? `la la-angle-up ${styles.toggleIcon}`
                    : `la la-angle-down ${styles.toggleIcon}`
                }
              ></i>
              <span className={styles.sectionTitle}>
                CV Review & Pre-Screening Questions
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(2);
              }}
              className={styles.editButton}
            >
              <i className={`la la-pen ${styles.editIcon}`}></i>
            </button>
          </div>

          {expandedSection === 2 && (
            <div className={styles.expandedContentAlt}>
              <div className={styles.innerPadding}>
                {/* CV Screening */}
                <div
                  className={styles.fieldSection}
                >
                  <p
                    className={styles.fieldLabel}
                  >
                    CV Screening
                  </p>
                  <p
                    className={styles.videoValue}
                  >
                    Automatically endorse candidates who are{" "}
                    <span
                      className={styles.screeningBadge}
                    >
                      {formData.screeningSetting || "Good Fit"}
                    </span>{" "}
                    and above
                  </p>
                </div>

                {/* CV Secret Prompt */}
                {formData.cvSecretPrompt && (
                  <div className={styles.fieldSection}>
                    <p className={styles.fieldLabel}>CV Secret Prompt</p>
                    <ul
                      className={styles.secretPromptList}
                    >
                      {formData.cvSecretPrompt
                        .split("\n")
                        .filter((line: string) => line.trim())
                        .map((line: string, index: number) => (
                          <li key={index} className={styles.secretPromptItem}>
                            {line.trim().replace(/^[•\-]\s*/, "")}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Pre-Screening Questions */}
                <div>
                  <div className={styles.questionsSectionHeader}>
                    <p className={styles.questionsTitle}>
                      Pre-Screening Questions
                    </p>
                    {formData.prescreeningQuestions?.length > 0 && (
                      <span className={styles.questionsCount}>
                        {formData.prescreeningQuestions.length}
                      </span>
                    )}
                  </div>
                  {formData.prescreeningQuestions &&
                  formData.prescreeningQuestions.length > 0 ? (
                    <div className={styles.questionsContainer}>
                      {formData.prescreeningQuestions.map(
                        (q: any, index: number) => (
                          <div key={q.id} className={styles.questionItem}>
                            <p className={styles.questionText}>
                              {index + 1}. {q.question}
                            </p>
                            {/* Range type: Display min-max with currency */}
                            {q.type === "range" ? (
                              <p className={styles.questionMeta}>
                                Range: {q.currency || "PHP"}{" "}
                                {q.rangeMin?.toLocaleString()} -{" "}
                                {q.currency || "PHP"}{" "}
                                {q.rangeMax?.toLocaleString()}
                              </p>
                            ) : /* Short answer type: Single-line text input */ q.type ===
                              "short-answer" ? (
                              <p className={styles.questionMetaItalic}>
                                Short answer text
                              </p>
                            ) : /* Long answer type: Multi-line text input */ q.type ===
                              "long-answer" ? (
                              <span className={styles.questionMetaItalic}>
                                Long answer text
                              </span>
                            ) : /* Dropdown/Checkboxes type: Display list of options */ q.options &&
                              q.options.length > 0 ? (
                              <ul className={styles.optionsList}>
                                {q.options.map(
                                  (opt: string, optIndex: number) => (
                                    <li key={optIndex} className={styles.optionItem}>
                                      {opt}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : null}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className={styles.noQuestionsText}>
                      No pre-screening questions added
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: AI Interview Setup */}
      <div className={`layered-card-outer ${styles.sectionCard}`}>
        <div
          className={`layered-card-middle ${styles.sectionCardClickable}`}
          onClick={() => toggleSection(3)}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <i
                className={
                  expandedSection === 3
                    ? `la la-angle-up ${styles.toggleIcon}`
                    : `la la-angle-down ${styles.toggleIcon}`
                }
              ></i>
              <span className={styles.sectionTitle}>AI Interview Setup</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(3);
              }}
              className={styles.editButton}
            >
              <i className={`la la-pen ${styles.editIcon}`}></i>
            </button>
          </div>

          {expandedSection === 3 && (
            <div className={styles.expandedContentAlt}>
              <div className={styles.innerPadding}>
                {/* AI Interview Screening */}
                <div
                  className={styles.fieldSection}
                >
                  <p
                    className={styles.fieldLabel}
                  >
                    AI Interview Screening
                  </p>
                  <p
                    className={styles.videoValue}
                  >
                    Automatically endorse candidates who are{" "}
                    <span
                      className={styles.screeningBadge}
                    >
                      {formData.screeningSetting || "Good Fit"}
                    </span>{" "}
                    and above
                  </p>
                </div>

                {/* Require Video on Interview */}
                <div className={styles.videoRequirement}>
                  <p className={styles.videoLabel}>
                    Require Video on Interview
                  </p>
                  <p className={styles.videoValue}>
                    {formData.requireVideo !== false ? "Yes" : "No"}{" "}
                    {formData.requireVideo !== false && (
                      <span className={styles.videoCheckmark}>✓</span>
                    )}
                  </p>
                </div>

                {/* AI Interview Secret Prompt */}
                {formData.aiInterviewSecretPrompt && (
                  <div className={styles.fieldSection}>
                    <p className={styles.fieldLabel}>
                      AI Interview Secret Prompt
                    </p>
                    <ul
                      className={styles.secretPromptList}
                    >
                      {formData.aiInterviewSecretPrompt
                        .split("\n")
                        .filter((line: string) => line.trim())
                        .map((line: string, index: number) => (
                          <li key={index} className={styles.secretPromptItem}>
                            {line.trim().replace(/^[•\-]\s*/, "")}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Interview Questions */}
                <div>
                  <div className={styles.questionsSectionHeader}>
                    <p className={styles.questionsTitle}>
                      Interview Questions
                    </p>
                    {getTotalQuestions() > 0 && (
                      <span className={styles.questionsCount}>
                        {getTotalQuestions()}
                      </span>
                    )}
                  </div>

                  {formData.questions?.map(
                    (category: any, catIndex: number) => {
                      if (category.questions?.length > 0) {
                        return (
                          <div
                            key={category.id}
                            className={styles.interviewQuestionsContainer}
                          >
                            <p className={styles.categoryTitle}>
                              {category.category}
                            </p>
                            <ol
                              className={styles.questionsList}
                              style={{
                                counterReset: `item ${formData.questions
                                  .slice(0, catIndex)
                                  .reduce(
                                    (acc: number, cat: any) =>
                                      acc + (cat.questions?.length || 0),
                                    0
                                  )}`,
                              }}
                            >
                              {category.questions.map(
                                (q: any, index: number) => (
                                  <li
                                    key={q.id || index}
                                    className={styles.interviewQuestionItem}
                                  >
                                    {typeof q === "string" ? q : q.question}
                                  </li>
                                )
                              )}
                            </ol>
                          </div>
                        );
                      }
                      return null;
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Pipeline Stages */}
      <div className={`layered-card-outer ${styles.sectionCard}`}>
        <div
          className={`layered-card-middle ${styles.sectionCardClickable}`}
          onClick={() => toggleSection(4)}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <i
                className={
                  expandedSection === 4
                    ? `la la-angle-up ${styles.toggleIcon}`
                    : `la la-angle-down ${styles.toggleIcon}`
                }
              ></i>
              <span className={styles.sectionTitle}>Pipeline Stages</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(4);
              }}
              className={styles.editButton}
            >
              <i className={`la la-pen ${styles.editIcon}`}></i>
            </button>
          </div>

          {expandedSection === 4 && (
            <div className={styles.expandedContentAlt}>
              <div className={styles.innerPadding}>
                {/* Pipeline Stages Grid */}
                <div className={styles.pipelineGrid}>
                  {/* CV Screening */}
                  <div
                    className={styles.pipelineStage}
                  >
                    <div
                      className={styles.stageHeader}
                    >
                      <i
                        className={`la la-user-check ${styles.stageIcon}`}
                      ></i>
                      <p
                        className={styles.stageName}
                      >
                        CV Screening
                      </p>
                    </div>
                    <div className={styles.substagesSection}>
                      <p className={styles.substagesLabel}>Substages</p>
                      <div className={styles.substagesList}>
                        <p
                          className={styles.substageItem}
                        >
                          Waiting Submission
                        </p>
                        <p
                          className={styles.substageItem}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Interview */}
                  <div
                    className={styles.pipelineStage}
                  >
                    <div
                      className={styles.stageHeader}
                    >
                      <i
                        className={`la la-microphone ${styles.stageIcon}`}
                      ></i>
                      <p
                        className={styles.stageName}
                      >
                        AI Interview
                      </p>
                    </div>
                    <div className={styles.substagesSection}>
                      <p className={styles.substagesLabel}>Substages</p>
                      <div className={styles.substagesList}>
                        <p
                          className={styles.substageItem}
                        >
                          Waiting Interview
                        </p>
                        <p
                          className={styles.substageItem}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personality Test */}
                  <div
                    className={styles.pipelineStage}
                  >
                    <div
                      className={styles.stageHeader}
                    >
                      <i
                        className={`la la-brain ${styles.stageIcon}`}
                      ></i>
                      <p
                        className={styles.stageName}
                      >
                        Personality Test
                      </p>
                    </div>
                    <div className={styles.substagesSection}>
                      <p className={styles.substagesLabel}>Substages</p>
                      <div className={styles.substagesList}>
                        <p
                          className={styles.substageItem}
                        >
                          Waiting Submission
                        </p>
                        <p
                          className={styles.substageItem}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Coding Test */}
                  <div
                    className={styles.pipelineStage}
                  >
                    <div
                      className={styles.stageHeader}
                    >
                      <i
                        className={`la la-code ${styles.stageIcon}`}
                      ></i>
                      <p
                        className={styles.stageName}
                      >
                        Coding Test
                      </p>
                    </div>
                    <div className={styles.substagesSection}>
                      <p className={styles.substagesLabel}>Substages</p>
                      <div className={styles.substagesList}>
                        <p
                          className={styles.substageItem}
                        >
                          Waiting Submission
                        </p>
                        <p
                          className={styles.substageItem}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
