"use client";

import {
  COLOR_BORDER_LIGHT,
  COLOR_BORDER_PRIMARY,
  COLOR_GENERAL_ICONS,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_TERTIARY,
  COLOR_WHITE,
} from "@/lib/styles/variables";
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
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Step 1: Career Details & Team Access */}
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(1)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={
                  expandedSection === 1 ? "la la-angle-up" : "la la-angle-down"
                }
                style={{ fontSize: 20, color: COLOR_GENERAL_ICONS }}
              ></i>
              <span
                style={{
                  color: COLOR_TEXT_PRIMARY,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Career Details & Team Access
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(1);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 1 && (
            <div
              style={{
                backgroundColor: "#fff",
                padding: "2em",
                borderRadius: "20px",
                boxShadow: "0px 0px 2px 0px rgba(0, 16, 53, 0.16) inset",
              }}
            >
              <div>
                {/* Job Title */}
                <div
                  style={{
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLOR_TEXT_PRIMARY,
                      margin: 0,
                    }}
                  >
                    Job Title
                  </p>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: COLOR_TEXT_SECONDARY,
                      margin: 0,
                    }}
                  >
                    {formData.jobTitle || "—"}
                  </p>
                </div>

                {/* Employment Type & Work Arrangement */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Employment Type
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.employmentType || "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Work Arrangement
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.workSetup || "—"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Country
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.country || "Philippines"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      State / Province
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.province || "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      City
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.city || "—"}
                    </p>
                  </div>
                </div>

                {/* Salary */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Minimum Salary
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.minimumSalary
                        ? `₱${Number(formData.minimumSalary).toLocaleString()}`
                        : formData.salaryNegotiable !== false
                        ? "Negotiable"
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Maximum Salary
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: COLOR_TEXT_SECONDARY,
                        margin: 0,
                      }}
                    >
                      {formData.maximumSalary
                        ? `₱${Number(formData.maximumSalary).toLocaleString()}`
                        : formData.salaryNegotiable !== false
                        ? "Negotiable"
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div
                  style={{
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLOR_TEXT_PRIMARY,
                      margin: "0 0 8px 0",
                    }}
                  >
                    Job Description
                  </p>
                  <div
                    style={{
                      fontSize: 18,
                      lineHeight: "1.6",
                      color: COLOR_TEXT_SECONDARY,
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formData.description || "—",
                    }}
                  />
                </div>

                {/* Team Access */}
                <div>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLOR_TEXT_PRIMARY,
                      margin: "0 0 8px 0",
                    }}
                  >
                    Team Access
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src={
                        formData.createdByImage || "/profile-placeholder.png"
                      }
                      alt="Job Owner"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: 14,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
                        {formData.createdByName || "Job Owner"}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "#71767f",
                        }}
                      >
                        {formData.createdBy || "—"}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        fontSize: 13,
                        color: COLOR_TEXT_PRIMARY,
                      }}
                    >
                      Job Owner
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: CV Review & Pre-screening */}
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(2)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={
                  expandedSection === 2 ? "la la-angle-up" : "la la-angle-down"
                }
                style={{ fontSize: 20, color: COLOR_GENERAL_ICONS }}
              ></i>
              <span
                style={{
                  color: COLOR_TEXT_PRIMARY,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                CV Review & Pre-Screening Questions
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(2);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 2 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                {/* CV Screening */}
                <div
                  style={{
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLOR_TEXT_PRIMARY,
                      margin: "0 0 8px 0",
                    }}
                  >
                    CV Screening
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      margin: 0,
                      color: COLOR_TEXT_SECONDARY,
                    }}
                  >
                    Automatically endorse candidates who are{" "}
                    <span
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#f0f8ff",
                        border: "1px solid #b5dcfd",
                        borderRadius: 16,
                        fontWeight: 500,
                        color: "#2858ce",
                      }}
                    >
                      {formData.screeningSetting || "Good Fit"}
                    </span>{" "}
                    and above
                  </p>
                </div>

                {/* CV Secret Prompt */}
                {formData.cvSecretPrompt && (
                  <div
                    style={{
                      paddingBottom: 20,
                      marginBottom: 20,
                      borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: "0 0 8px 0",
                      }}
                    >
                      CV Secret Prompt
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: COLOR_TEXT_SECONDARY,
                        fontSize: 15,
                        lineHeight: "1.6",
                      }}
                    >
                      {formData.cvSecretPrompt
                        .split("\n")
                        .filter((line: string) => line.trim())
                        .map((line: string, index: number) => (
                          <li key={index} style={{ marginBottom: 4 }}>
                            {line.trim().replace(/^[•\-]\s*/, "")}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Pre-Screening Questions */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Pre-Screening Questions
                    </p>
                    {formData.prescreeningQuestions?.length > 0 && (
                      <span
                        style={{
                          padding: "2px 8px",
                          backgroundColor: COLOR_WHITE,
                          borderRadius: "12px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
                        {formData.prescreeningQuestions.length}
                      </span>
                    )}
                  </div>
                  {formData.prescreeningQuestions &&
                  formData.prescreeningQuestions.length > 0 ? (
                    <div style={{ marginTop: 12 }}>
                      {formData.prescreeningQuestions.map(
                        (q: any, index: number) => (
                          <div
                            key={q.id}
                            style={{
                              marginBottom: 16,
                              paddingBottom: 16,
                              borderBottom:
                                index <
                                formData.prescreeningQuestions.length - 1
                                  ? `1px solid ${COLOR_BORDER_LIGHT}`
                                  : "none",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 500,
                                margin: "0 0 10px 0",
                                color: COLOR_TEXT_PRIMARY,
                              }}
                            >
                              {index + 1}. {q.question}
                            </p>
                            {/* Range type: Display min-max with currency */}
                            {q.type === "range" ? (
                              <p
                                style={{
                                  fontSize: 14,
                                  color: COLOR_TEXT_SECONDARY,
                                  margin: 0,
                                  paddingLeft: "20px",
                                }}
                              >
                                Range: {q.currency || "PHP"}{" "}
                                {q.rangeMin?.toLocaleString()} -{" "}
                                {q.currency || "PHP"}{" "}
                                {q.rangeMax?.toLocaleString()}
                              </p>
                            ) : /* Short answer type: Single-line text input */ q.type ===
                              "short-answer" ? (
                              <p
                                style={{
                                  fontSize: 14,
                                  color: COLOR_TEXT_SECONDARY,
                                  margin: 0,
                                  paddingLeft: "20px",
                                  fontStyle: "italic",
                                }}
                              >
                                Short answer text
                              </p>
                            ) : /* Long answer type: Multi-line text input */ q.type ===
                              "long-answer" ? (
                              <span
                                style={{
                                  fontSize: 14,
                                  color: COLOR_TEXT_SECONDARY,
                                  margin: 0,
                                  paddingLeft: "20px",
                                  fontStyle: "italic",
                                }}
                              >
                                Long answer text
                              </span>
                            ) : /* Dropdown/Checkboxes type: Display list of options */ q.options &&
                              q.options.length > 0 ? (
                              <ul
                                style={{
                                  margin: 0,
                                  paddingLeft: "20px",
                                  listStyleType: "disc",
                                }}
                              >
                                {q.options.map(
                                  (opt: string, optIndex: number) => (
                                    <li
                                      key={optIndex}
                                      style={{
                                        fontSize: 14,
                                        color: COLOR_TEXT_SECONDARY,
                                        marginBottom: 4,
                                      }}
                                    >
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
                    <p
                      style={{
                        fontSize: 14,
                        color: COLOR_TEXT_TERTIARY,
                        margin: "8px 0 0 0",
                        fontStyle: "italic",
                      }}
                    >
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
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(3)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={
                  expandedSection === 3 ? "la la-angle-up" : "la la-angle-down"
                }
                style={{ fontSize: 20, color: COLOR_GENERAL_ICONS }}
              ></i>
              <span
                style={{
                  color: COLOR_TEXT_PRIMARY,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                AI Interview Setup
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(3);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 3 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                {/* AI Interview Screening */}
                <div
                  style={{
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLOR_TEXT_PRIMARY,
                      margin: "0 0 8px 0",
                    }}
                  >
                    AI Interview Screening
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      margin: 0,
                      color: COLOR_TEXT_SECONDARY,
                    }}
                  >
                    Automatically endorse candidates who are{" "}
                    <span
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#f0f8ff",
                        border: "1px solid #b5dcfd",
                        borderRadius: 16,
                        fontWeight: 500,
                        color: "#2858ce",
                      }}
                    >
                      {formData.screeningSetting || "Good Fit"}
                    </span>{" "}
                    and above
                  </p>
                </div>

                {/* Require Video on Interview */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 20,
                    marginBottom: 20,
                    borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: COLOR_TEXT_PRIMARY,
                      margin: "0 0 8px 0",
                    }}
                  >
                    Require Video on Interview
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      margin: 0,
                      color: COLOR_TEXT_SECONDARY,
                    }}
                  >
                    {formData.requireVideo !== false ? "Yes" : "No"}{" "}
                    {formData.requireVideo !== false && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: "2px solid #abf5c7",
                          backgroundColor: "#edfdf3",
                          color: "#2eb86f",
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginLeft: "4px",
                          paddingBottom: 2,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </p>
                </div>

                {/* AI Interview Secret Prompt */}
                {formData.aiInterviewSecretPrompt && (
                  <div
                    style={{
                      paddingBottom: 20,
                      marginBottom: 20,
                      borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: "0 0 8px 0",
                      }}
                    >
                      AI Interview Secret Prompt
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: COLOR_TEXT_SECONDARY,
                        fontSize: 15,
                        lineHeight: "1.6",
                      }}
                    >
                      {formData.aiInterviewSecretPrompt
                        .split("\n")
                        .filter((line: string) => line.trim())
                        .map((line: string, index: number) => (
                          <li key={index} style={{ marginBottom: 4 }}>
                            {line.trim().replace(/^[•\-]\s*/, "")}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Interview Questions */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLOR_TEXT_PRIMARY,
                        margin: 0,
                      }}
                    >
                      Interview Questions
                    </p>
                    {getTotalQuestions() > 0 && (
                      <span
                        style={{
                          padding: "2px 8px",
                          backgroundColor: COLOR_WHITE,
                          borderRadius: "12px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
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
                            style={{
                              marginTop: 16,
                              paddingBottom: 16,
                              borderBottom:
                                catIndex < formData.questions.length - 1
                                  ? `1px solid ${COLOR_BORDER_LIGHT}`
                                  : "none",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 600,
                                margin: "0 0 12px 0",
                                color: COLOR_TEXT_PRIMARY,
                              }}
                            >
                              {category.category}
                            </p>
                            <ol
                              style={{
                                margin: 0,
                                paddingLeft: "20px",
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
                                    style={{
                                      fontSize: 14,
                                      color: COLOR_TEXT_SECONDARY,
                                      marginBottom: 8,
                                      lineHeight: "1.5",
                                    }}
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
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(4)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={
                  expandedSection === 4 ? "la la-angle-up" : "la la-angle-down"
                }
                style={{ fontSize: 20, color: COLOR_GENERAL_ICONS }}
              ></i>
              <span
                style={{
                  color: COLOR_TEXT_PRIMARY,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Pipeline Stages
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(4);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 4 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                {/* Pipeline Stages Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 16,
                    height: 300,
                  }}
                >
                  {/* CV Screening */}
                  <div
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                      padding: 16,
                      border: `1px solid ${COLOR_BORDER_LIGHT}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <i
                        className="la la-user-check"
                        style={{
                          fontSize: 18,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      ></i>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
                        CV Screening
                      </p>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLOR_TEXT_SECONDARY,
                          marginBottom: 6,
                        }}
                      >
                        Substages
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          Waiting Submission
                        </p>
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Interview */}
                  <div
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                      padding: 16,
                      border: `1px solid ${COLOR_BORDER_LIGHT}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <i
                        className="la la-microphone"
                        style={{
                          fontSize: 18,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      ></i>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
                        AI Interview
                      </p>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLOR_TEXT_SECONDARY,
                          marginBottom: 6,
                        }}
                      >
                        Substages
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          Waiting Interview
                        </p>
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personality Test */}
                  <div
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                      padding: 16,
                      border: `1px solid ${COLOR_BORDER_LIGHT}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <i
                        className="la la-brain"
                        style={{
                          fontSize: 18,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      ></i>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
                        Personality Test
                      </p>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLOR_TEXT_SECONDARY,
                          marginBottom: 6,
                        }}
                      >
                        Substages
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          Waiting Submission
                        </p>
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          For Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Coding Test */}
                  <div
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                      padding: 16,
                      border: `1px solid ${COLOR_BORDER_LIGHT}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <i
                        className="la la-code"
                        style={{
                          fontSize: 18,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      ></i>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          color: COLOR_TEXT_PRIMARY,
                        }}
                      >
                        Coding Test
                      </p>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLOR_TEXT_SECONDARY,
                          marginBottom: 6,
                        }}
                      >
                        Substages
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          Waiting Submission
                        </p>
                        <p
                          style={{
                            border: `1px solid ${COLOR_BORDER_PRIMARY}`,
                            backgroundColor: "#fff",
                            margin: 0,
                            padding: "0.75em",
                            color: COLOR_TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
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
