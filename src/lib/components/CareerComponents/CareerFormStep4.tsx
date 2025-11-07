"use client";

import { COLOR_BORDER_LIGHT } from "@/lib/styles/variables";

interface CareerFormStep4Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Define pipeline stages data
const pipelineStages = [
  {
    name: "CV Screening",
    icon: "la-user-check",
    isCore: true,
    substages: [
      { name: "Waiting Submission", hasAutomation: true },
      { name: "For Review", hasAutomation: true },
    ],
  },
  {
    name: "AI Interview",
    icon: "la-microphone",
    isCore: true,
    substages: [
      { name: "Waiting Interview", hasAutomation: true },
      { name: "For Review", hasAutomation: true },
    ],
  },
  {
    name: "Final Human Interview",
    icon: "la-users",
    isCore: true,
    substages: [
      { name: "Waiting Schedule", hasAutomation: true },
      { name: "Waiting Interview", hasAutomation: true },
      { name: "For Review", hasAutomation: true },
    ],
  },
  {
    name: "Job Offer",
    icon: "la-file-contract",
    isCore: true,
    substages: [
      { name: "For Final Review", hasAutomation: true },
      { name: "Waiting Offer Acceptance", hasAutomation: true },
      { name: "For Contract Signing", hasAutomation: true },
      { name: "Hired", hasAutomation: true },
    ],
  },
];

export default function CareerFormStep4({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: CareerFormStep4Props) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: 32,
        borderTop: `1px solid ${COLOR_BORDER_LIGHT}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#181D27",
              margin: "0 0 8px 0",
            }}
          >
            Customize pipeline stages
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              margin: 0,
              maxWidth: "600px",
            }}
          >
            Create, modify, reorder, and delete stages and sub-stages. Core
            stages are fixed and can't be moved or edited as they are essential
            to Jia's system logic.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#FFFFFF",
              color: "#6B7280",
              border: "1px solid #D1D5DB",
              borderRadius: "2em",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="la la-redo"></i>
            Restore to default
          </button>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#FFFFFF",
              color: "#181D27",
              border: "1px solid #D1D5DB",
              borderRadius: "2em",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Copy pipeline from existing job
            <i className="la la-angle-down"></i>
          </button>
        </div>
      </div>

      {/* Pipeline Stages Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr) 40px repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {pipelineStages.slice(0, 2).map((stage, stageIndex) => (
          <div key={stageIndex}>
            {/* Core stage notice */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderTop: `2px dashed ${COLOR_BORDER_LIGHT}`,
                borderLeft: `2px dashed ${COLOR_BORDER_LIGHT}`,
                borderRight: `2px dashed ${COLOR_BORDER_LIGHT}`,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: "16px 16px 32px 16px",
                fontSize: 16,
                color: "#D1D5DB",
                fontWeight: 500,
              }}
            >
              <i className="la la-lock" style={{ fontSize: 16 }}></i>
              Core stage, cannot move
            </div>

            {/* Stage Card */}
            <div
              style={{
                position: "relative",
                bottom: 13,
                backgroundColor: "#F3F4F6",
                borderRadius: "12px",
                padding: "20px",
                border: "none",
                boxShadow: "0px 0px 2px 0px rgba(0, 16, 53, 0.16) inset",
              }}
            >
              {/* Stage Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <i
                    className={`la ${stage.icon}`}
                    style={{
                      fontSize: 16,
                      color: "#6B7280",
                    }}
                  ></i>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#181D27",
                    }}
                  >
                    {stage.name}
                  </span>
                  <i
                    className="la la-question-circle"
                    style={{
                      fontSize: 14,
                      color: "#D1D5DB",
                    }}
                  ></i>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <i
                    className="la la-ellipsis-v"
                    style={{
                      fontSize: 16,
                      color: "#9CA3AF",
                      cursor: "pointer",
                    }}
                  ></i>
                  <i
                    className="la la-lock"
                    style={{
                      fontSize: 14,
                      color: "#D1D5DB",
                    }}
                  ></i>
                </div>
              </div>

              {/* Substages Label */}
              <div
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  fontWeight: 500,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Substages
              </div>

              {/* Substages List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {stage.substages.map((substage, substageIndex) => (
                  <div
                    key={substageIndex}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: "#181D27",
                        fontWeight: 400,
                      }}
                    >
                      {substage.name}
                    </span>
                    {substage.hasAutomation && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i
                          className="la la-bolt"
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                          }}
                        ></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add Stage Button - positioned in 3rd column */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <button
            style={{
              width: 40,
              height: "100%",
              borderRadius: "50px",
              backgroundColor: "#FFFFFF",
              border: "2px dashed #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 24,
              color: "#9CA3AF",
            }}
          >
            +
          </button>
        </div>

        {pipelineStages.slice(2, 4).map((stage, stageIndex) => (
          <div key={stageIndex + 2}>
            {/* Core stage notice */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderTop: `2px dashed ${COLOR_BORDER_LIGHT}`,
                borderLeft: `2px dashed ${COLOR_BORDER_LIGHT}`,
                borderRight: `2px dashed ${COLOR_BORDER_LIGHT}`,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: "16px 16px 32px 16px",
                fontSize: 16,
                color: "#D1D5DB",
                fontWeight: 500,
              }}
            >
              <i className="la la-lock" style={{ fontSize: 16 }}></i>
              Core stage, cannot move
            </div>

            {/* Stage Card */}
            <div
              style={{
                position: "relative",
                bottom: 13,
                backgroundColor: "#F3F4F6",
                borderRadius: "12px",
                padding: "20px",
                border: "none",
                boxShadow: "0px 0px 2px 0px rgba(0, 16, 53, 0.16) inset",
              }}
            >
              {/* Stage Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <i
                    className={`la ${stage.icon}`}
                    style={{
                      fontSize: 16,
                      color: "#6B7280",
                    }}
                  ></i>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#181D27",
                    }}
                  >
                    {stage.name}
                  </span>
                  <i
                    className="la la-question-circle"
                    style={{
                      fontSize: 14,
                      color: "#D1D5DB",
                    }}
                  ></i>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <i
                    className="la la-ellipsis-v"
                    style={{
                      fontSize: 16,
                      color: "#9CA3AF",
                      cursor: "pointer",
                    }}
                  ></i>
                  <i
                    className="la la-lock"
                    style={{
                      fontSize: 14,
                      color: "#D1D5DB",
                    }}
                  ></i>
                </div>
              </div>

              {/* Substages Label */}
              <div
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  fontWeight: 500,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Substages
              </div>

              {/* Substages List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {stage.substages.map((substage, substageIndex) => (
                  <div
                    key={substageIndex}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: "#181D27",
                        fontWeight: 400,
                      }}
                    >
                      {substage.name}
                    </span>
                    {substage.hasAutomation && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i
                          className="la la-bolt"
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                          }}
                        ></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
