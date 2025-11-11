"use client";
import { PreScreeningQuestion } from "@/lib/types";

export default function SegmentReview({
  jobTitle,
  description,
  employmentType,
  workSetup,
  salaryNegotiable,
  minimumSalary,
  maximumSalary,
  city,
  province,
  country,
  screeningSetting,
  requireVideo,
  questions,
  setCurrentSegment,
  preScreeningQuestions,
}: {
  jobTitle: string;
  description: string;
  employmentType: string;
  workSetup: string;
  salaryNegotiable: boolean;
  minimumSalary: string;
  maximumSalary: string;
  city: string;
  province: string;
  country: string;
  screeningSetting: string;
  requireVideo: boolean;
  questions: any[];
  setCurrentSegment: (segment: number) => void;
  preScreeningQuestions: PreScreeningQuestion[];
}) {
  const getAnswerTypeLabel = (
    answerType: PreScreeningQuestion["answerType"]
  ) => {
    const labels: { [key in PreScreeningQuestion["answerType"]]: string } = {
      short_answer: "Short Answer",
      long_answer: "Long Answer",
      dropdown: "Dropdown",
      checkboxes: "Checkboxes",
      range: "Range",
    };
    return labels[answerType] || answerType;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Career Information Review */}
      <div>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="career-label">Career Information</span>
            </div>
            <button
              onClick={() => setCurrentSegment(0)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Job Title
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {jobTitle || "Not provided"}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Description
                </span>
                <div
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    margin: "4px 0",
                    maxHeight: "200px",
                    overflowY: "auto",
                    padding: "8px",
                    background: "#F9FAFB",
                    borderRadius: "8px",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: description || "Not provided",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Review */}
      <div>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="career-label">Additional Information</span>
            </div>
            <button
              onClick={() => setCurrentSegment(0)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Employment Type
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {employmentType}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Work Setup
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {workSetup || "Not provided"}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Salary
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {salaryNegotiable ? "Negotiable" : "Fixed"}
                  {minimumSalary &&
                    ` (₱${minimumSalary} - ₱${maximumSalary || "N/A"})`}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Location
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {city}, {province}, {country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Review */}
      <div>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="career-label">Settings</span>
            </div>
            <button
              onClick={() => setCurrentSegment(1)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Screening Setting
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {screeningSetting}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Video Interview
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {requireVideo ? "Required" : "Optional"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="layered-card-middle">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="career-label">Pre-Screening Questions</span>
          <button
            style={{
              background: "#fff",
              border: "1px solid #E9EAEB",
              borderRadius: "60px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
            onClick={() => setCurrentSegment(1)}
          >
            <i className="la la-pencil-alt"></i> Edit
          </button>
        </div>
        <div className="layered-card-content">
          {preScreeningQuestions.length === 0 ? (
            <div style={{ color: "#6B7280", fontStyle: "italic" }}>
              No pre-screening questions added
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {preScreeningQuestions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        Question {index + 1}:
                      </span>
                      {question.required && (
                        <span
                          style={{
                            color: "#EF4444",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Required
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        backgroundColor: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      {getAnswerTypeLabel(question.answerType)}
                    </span>
                  </div>
                  <div style={{ marginBottom: "8px", color: "#111827" }}>
                    {question.question}
                  </div>
                  {(question.answerType === "dropdown" ||
                    question.answerType === "checkboxes") &&
                    question.options && (
                      <div style={{ marginTop: "12px" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6B7280",
                            marginBottom: "8px",
                          }}
                        >
                          Options:
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#fff",
                                borderRadius: "6px",
                                border: "1px solid #E5E7EB",
                                fontSize: 14,
                              }}
                            >
                              • {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interview Questions Review */}
      <div>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="career-label">Interview Questions</span>
              <div
                style={{
                  borderRadius: "50%",
                  width: 30,
                  height: 22,
                  border: "1px solid #D5D9EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  backgroundColor: "#F8F9FC",
                  color: "#181D27",
                  fontWeight: 700,
                }}
              >
                {questions.reduce(
                  (acc, group) => acc + group.questions.length,
                  0
                )}
              </div>
            </div>
            <button
              onClick={() => setCurrentSegment(2)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            {questions.map(
              (group, index) =>
                group.questions.length > 0 && (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <h4
                      style={{
                        fontSize: 14,
                        color: "#181D27",
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {group.category} ({group.questions.length} questions)
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {group.questions.map((question, qIndex) => (
                        <li
                          key={qIndex}
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                            marginBottom: 4,
                          }}
                        >
                          {question.question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
