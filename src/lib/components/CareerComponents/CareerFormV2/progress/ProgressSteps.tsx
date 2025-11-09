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
  const progressPercent = (currentSegment / (segments.length - 1)) * 100;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        background: "transparent",
        position: "relative",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      {/* Progress Line Background */}
      <div
        style={{
          position: "absolute",
          width: "210px",
          top: "10px",
          left: "30px",
          right: "auto",
          height: "4px",
          borderRadius: "2px",
          background: "#D1D5DB",
          zIndex: 0,
        }}
      >
        {/* Progress Line Fill */}
        <div
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)",
            width: `${progressPercent}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {segments.map((segment: any) => {
        const isCompleted = completedSegments.includes(segment.id);
        const isCurrent = currentSegment === segment.id;
        const isClickable =
          segment.id <= currentSegment ||
          completedSegments.includes(segment.id);

        return (
          <div
            key={segment.id}
            onClick={() => isClickable && onSegmentClick(segment.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              cursor: isClickable ? "pointer" : "not-allowed",
              position: "relative",
              zIndex: 1,
              flex: 1,
            }}
          >
            {/* Step Circle */}
            <div
              style={{
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                transition: "all 0.2s ease",
              }}
            >
              {isCompleted ? (
                <i
                  className="la la-check"
                  style={{
                    width: "20px",
                    height: "20px",
                    fontSize: "14px", // smaller than container
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
                maxWidth: "180px",
                whiteSpace: "nowrap", // prevents line breaks
                paddingBottom: "20px",
              }}
            >
              {segment.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}
