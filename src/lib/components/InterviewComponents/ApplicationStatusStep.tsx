import { useEffect, useState } from "react";

export default function ApplicationStatusStep(props) {
  const { job } = props;
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(null);
  const [applicationStages, setApplicationStages] = useState([
    {
      name: "Applied",
      status: "Passed",
      isCurrent: false,
    },
    {
      name: "CV Screening",
      status: "Not Started",
      isCurrent: false,
      toolTip: {
        Reviewed: "Your CV is being reviewed by our recruiters.",
        Passed: "You passed the CV Screen.",
        Failed: "You did not pass the CV Screening.",
      },
    },
    {
      name: "AI Interview",
      status: "Not Started",
      isCurrent: false,
      toolTip: {
        Pending: "Please start the interview at your earliest convenience.",
        "For Review":
          "Your interview record is being reviewed by our recruiters.",
        Passed: "You passed the AI Interview.",
        Rejected: "You did not pass the AI Interview.",
      },
    },
    {
      name: "Human Interview",
      status: "Not Started",
      isCurrent: false,
      toolTip: {
        Pending:
          "Recruiter will contact you regarding your interview schedule.",
        Scheduled: "You are schedule to have interview on [Date]",
        "For Review": "Your interview record being reviewed.",
        Passed: "You passed the human interview.",
      },
    },
    {
      name: "Job Offer",
      status: "Not Started",
      isCurrent: false,
      toolTip: {
        "For Review": "Your job application is undergoing a final review.",
        Passed: "Your job offer was sent.",
        Rejected: "You did not pass the job offer review.",
      },
    },
  ]);

  const setApplicationStatus = (job) => {
    const newStages = [...applicationStages];

    if (["For Interview", "Rejected", "For Review"].includes(job.status)) {
      const completedStages = ["CV Screening"];
      newStages.forEach((stage) => {
        if (completedStages.includes(stage.name)) {
          stage.status = "Passed";
        }
        if (stage.name === "AI Interview") {
          stage.status =
            job.status === "For Interview" ? "Pending" : job.status;
          stage.isCurrent = true;
        }
      });
    }

    // Currently the Accepted status is for AI Interview
    if (job.status === "Accepted") {
      const completedStages = ["CV Screening", "AI Interview"];
      newStages.forEach((stage) => {
        if (completedStages.includes(stage.name)) {
          stage.status = "Passed";
        }
        if (stage.name === "Human Interview") {
          stage.status = "Pending";
          stage.isCurrent = true;
        }
      });
    }

    if (job.status === "Failed CV Screening") {
      const completedStages = ["CV Screening"];
      newStages.forEach((stage: any) => {
        if (completedStages.includes(stage.name)) {
          stage.status = "Failed";
          stage.toolTip = {
            Failed:
              "Sorry, you did not pass the CV Screening for this role, click to learn more.",
          };
          stage.isCurrent = true;
        }
      });
    }
    // TODO: Add the rest of the stages: Human Interview, Job Offer
    setApplicationStages(newStages);
  };

  useEffect(() => {
    setApplicationStatus(job);
  }, [job]);

  return (
    <div className="step-line">
      {/* Add a background shimmer line that spans the entire width */}
      <div className="shimmer-line-container">
        <div
          className={`shimmer-line ${
            applicationStages.find((stage) => stage?.isCurrent)?.status ===
            "Pending"
              ? "fast"
              : "slow"
          }`}
        ></div>
      </div>
      {applicationStages.map((stage, index) => (
        <div className="step" key={index}>
          <div className="progress-line">
            <div
              className={`line ${
                stage.status === "Passed" || stage.name === "Applied"
                  ? "completed"
                  : ""
              }`}
              style={{
                width: index < applicationStages.length - 1 ? "100%" : "0%",
              }}
            ></div>
            {/* Pulse dot */}
            {stage.isCurrent && (
              <div className="pulse-dot-container">
                <div
                  className={`ringring ${
                    stage.status === "Pending" ? "fast" : "slow"
                  }`}
                ></div>
                <div className="circle"></div>
              </div>
            )}
          </div>
          <div
            className="step-tooltip-container"
            style={{
              cursor:
                stage.toolTip && stage.status !== "Not Started"
                  ? "pointer"
                  : "default",
            }}
            onMouseEnter={() => {
              if (stage.toolTip && stage.status !== "Not Started") {
                setShowTooltip(true);
                setActiveStageIndex(index);
              }
            }}
            onMouseLeave={() => {
              if (stage.toolTip && stage.status !== "Not Started") {
                setShowTooltip(false);
                setActiveStageIndex(null);
              }
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {stage.name}
            </span>
            {stage.status === "Passed" && <i className="la la-check"></i>}
            {stage.status === "Failed" && (
              <small className="text-salmon">
                <i className="la la-times"></i> You failed this stage.
              </small>
            )}
            {stage.status === "Pending" && stage.isCurrent && (
              <small>waiting for applicant to start</small>
            )}
            {stage.status === "Rejected" && <i className="la la-times"></i>}
            {stage.status === "For Review" && stage.isCurrent && (
              <small>being reviewed</small>
            )}
            {showTooltip && activeStageIndex === index && (
              <div className="step-tooltip">
                <div>{stage.toolTip[stage.status]}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
