"use client";
import { handleCareerFitColor } from "@/lib/Utils";
import moment from "moment";
import EmailCandidateComponent from "./EmailCandidateComponent";

export default function CandidateActionModal({
  candidate,
  onAction,
  action,
}: {
  candidate: any;
  onAction: (action: string) => void;
  action: string;
}) {
  const getAssesment = () => {
    let assesment = "N/A";

    if (
      candidate?.currentStep === "CV Screening" ||
      candidate?.stage === "Pending AI Interview"
    ) {
      assesment = candidate?.cvStatus;
    } else {
      assesment = candidate?.jobFit;
    }
    return assesment || "N/A";
  };

  const actions = {
    endorse: {
      title: "Endorse Candidate",
      subtext: `Are you sure you want to endorse this candidate? <br /> <br /> You are about to endorse <span style="font-weight:700; color:#181D27;">${
        candidate?.name
      }</span>, who is assessed by Jia as a <span style="font-weight:700; color:${
        handleCareerFitColor(getAssesment())?.color
      };">${getAssesment()}</span> for the role.`,
      icon: "la-user-check",
      color: "#039855",
      buttonText: "Endorse",
    },
    drop: {
      title: "Drop Candidate",
      subtext: `Are you sure you want to drop this candidate? <br /> <br /> You are about to drop <span style="font-weight:700; color:#181D27;">${
        candidate?.name
      }</span>, who is assessed by Jia as a <span style="font-weight:700; color:${
        handleCareerFitColor(getAssesment())?.color
      };">${getAssesment()}</span> for the role.`,
      icon: "la-user-times",
      color: "#D92D20",
      buttonText: "Drop",
    },
    reset: {
      title: "Reset Interview",
      subtext: "Are you sure you want to reset this interview?",
      icon: "la-exclamation-circle",
      color: "#D92D20",
      buttonText: "Reset",
    },
    delete: {
      title: "Delete Interview",
      subtext: "Are you sure you want to delete this interview?",
      icon: "la-trash",
      color: "#D92D20",
      buttonText: "Delete",
    },
    retake: {
      title: "Retake Interview Request",
      color: "#181D27",
      buttonText: "Approve",
    },
    reconsider: {
      title: "Reconsider Candidate",
      subtext: `Are you sure you want to reconsider this candidate? <br /> <br /> You are about to reconsider <span style="font-weight:700; color:#181D27;">${
        candidate?.name
      }</span>, who is assessed by Jia as a <span style="font-weight:700; color:${
        handleCareerFitColor(getAssesment())?.color
      };">${getAssesment()}</span> for the role.`,
      icon: "la-user-check",
      color: "#039855",
      buttonText: "Reconsider",
    },
  };

  return (
    <div
      className="modal show fade-in-bottom"
      style={{
        display: "block",
        background: "rgba(0,0,0,0.45)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1050,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          padding: "20px",
        }}
      >
        <div
          className="modal-content"
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 40px)",
            maxWidth: "640px",
            width: "100%",
            background: "#fff",
            border: `1.5px solid #E9EAEB`,
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {action === "retake" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <h3 className="modal-title">{actions[action]?.title}</h3>
                {/* Close Button */}
                <button
                  onClick={() => onAction("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="la la-times"
                    style={{ fontSize: 24, color: "#717680" }}
                  ></i>
                </button>
              </div>
              <span
                style={{ fontSize: 14, color: "#717680", maxWidth: "540px" }}
              >
                {" "}
                <strong>Reason:</strong>{" "}
                {candidate?.retakeRequest?.reason ||
                  candidate?.retakeRequest ||
                  "No reason provided"}
              </span>
              <span
                style={{ fontSize: 14, color: "#717680", maxWidth: "540px" }}
              >
                {" "}
                <strong>Request submitted on:</strong>{" "}
                {moment(candidate?.retakeRequest?.createdAt).format(
                  "MMM D, YYYY | hh:mm:ss A"
                )}
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 16,
                  width: "100%",
                }}
              >
                <button
                  style={{
                    width: "fit-content",
                    color: "#B42318",
                    background: "#fff",
                    border: "1px solid #B42318",
                    padding: "8px 16px",
                    borderRadius: "60px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    minWidth: "163px",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    onAction("reject");
                  }}
                >
                  Reject
                </button>
                <button
                  style={{
                    width: "fit-content",
                    background: "black",
                    color: "#fff",
                    border: "1px solid #E9EAEB",
                    padding: "8px 16px",
                    borderRadius: "60px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    minWidth: "163px",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    onAction("approve");
                  }}
                >
                  <i
                    className="la la-check-circle"
                    style={{ color: "#fff", fontSize: 20, marginRight: 8 }}
                  ></i>
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                textAlign: "center",
                flex: 1,
                minHeight: 0,
                paddingTop: "16px",
                paddingBottom: "16px",
              }}
            >
              {/* Header with Icon */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className={`la ${actions[action]?.icon}`}
                    style={{ fontSize: 32, color: actions[action]?.color }}
                  ></i>
                </div>
                <h3
                  className="modal-title"
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#333",
                    margin: 0,
                  }}
                >
                  {actions[action]?.title}
                </h3>
                <span
                  style={{
                    fontSize: 16,
                    color: "#666",
                    maxWidth: "400px",
                    lineHeight: "1.5",
                  }}
                  dangerouslySetInnerHTML={{ __html: actions[action]?.subtext }}
                ></span>
              </div>

              {/* Email Component */}
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                }}
              >
                <EmailCandidateComponent
                  candidateName={candidate?.name}
                  candidateEmail={candidate?.email}
                  jobTitle={candidate?.jobTitle}
                  interviewDate={new Date().toLocaleDateString()}
                  endorseFrom={candidate.status}
                  endorseTo={candidate.toStage}
                  action={action}
                  onActionChange={onAction}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 16,
                  width: "100%",
                  marginTop: "16px",
                  flexShrink: 0,
                  paddingTop: "16px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onAction("");
                  }}
                  style={{
                    display: "flex",
                    width: "50%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 8,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    cursor: "pointer",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onAction(action);

                    let candidateEmailBtn = document.getElementById(
                      "candidate-email-send-button"
                    );
                    if (candidateEmailBtn) {
                      candidateEmailBtn.click();
                    }
                  }}
                  style={{
                    display: "flex",
                    width: "50%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 8,
                    backgroundColor: actions[action]?.color,
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {actions[action]?.buttonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
