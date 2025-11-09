"use client";
import React from "react";

/**
 * Props:
 * - segments: { id: number; title: string }[]
 * - currentSegment: number
 * - completedSegments: number[]
 * - onSegmentClick: (id: number) => void
 */
export default function ProgressSteps({
  segments,
  currentSegment,
  completedSegments,
  onSegmentClick,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        marginBottom: "25px",
        background: "transparent",
        position: "relative",
        borderBottom: "1px solid #EAECF5",
        padding: "0 10px",
      }}
    >
      {segments.map((segment: any, index: number) => {
        const isCompleted = completedSegments.includes(segment.id);
        const isCurrent = currentSegment === segment.id;
        const isClickable =
          segment.id <= currentSegment ||
          completedSegments.includes(segment.id);

        // The line is active if the step it originates from is completed.
        const isLineActive = isCompleted;

        return (
          <React.Fragment key={segment.id}>
            {/* Step Container */}
            <div
              onClick={() => isClickable && onSegmentClick(segment.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                cursor: isClickable ? "pointer" : "not-allowed",
                position: "relative",
                zIndex: 1,
                width: "80px",
              }}
            >
              {/* Step Circle */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  marginBottom: "12px",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {isCompleted ? (
                  <i
                    className="la la-check"
                    style={{
                      width: "20px",
                      height: "20px",
                      fontSize: "14px",
                      color: "#ffffff",
                      backgroundColor: "#000000",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                    }}
                  />
                ) : isCurrent ? (
                  <div
                    className="la la-dot-circle"
                    style={{
                      width: "20px",
                      height: "20px",
                      fontSize: 24,
                      color: "#181D27",
                    }}
                  />
                ) : (
                  <i
                    className="la la-dot-circle"
                    style={{
                      width: "20px",
                      height: "20px",
                      fontSize: 24,
                      color: "#D1D5DB",
                    }}
                  />
                )}
              </div>

              {/* Step Title */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1F2937",
                  lineHeight: "1.5",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  marginBottom: "25px",
                }}
              >
                {segment.title}
              </div>
            </div>

            {/* Connector Line */}
            {index < segments.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: isLineActive
                    ? "linear-gradient(90deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)"
                    : "#D1D5DB",
                  marginTop: "10px", // Aligns with center of icon
                  marginLeft: "-50px",
                  marginRight: "10px",
                  borderRadius: "2px",
                  transition: "background 0.3s ease",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
