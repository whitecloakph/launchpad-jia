"use client";

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
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Career Information Review */}
      <div className="layered-card-outer">
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
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-suitcase"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Career Information
              </span>
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
      <div className="layered-card-outer">
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
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-ellipsis-h"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Additional Information
              </span>
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
      <div className="layered-card-outer">
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
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-cog"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Settings
              </span>
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

      {/* Interview Questions Review */}
      <div className="layered-card-outer">
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
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-comments"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Interview Questions
              </span>
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
