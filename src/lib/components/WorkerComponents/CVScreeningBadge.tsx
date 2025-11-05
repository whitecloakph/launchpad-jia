import { useEffect, useState } from "react";
import axios from "axios";
import { Tooltip } from "react-tooltip";

export default function CVScreeningBadge(props) {
  const [interviewData, setInterviewData] = useState(props.interviewData);
  const [processing, setProcessing] = useState(false);

  function screenCV() {
    if (processing) {
      return false;
    }

    setProcessing(true);

    setInterviewData((prev) => ({
      ...prev,
      cvStatus: null,
    }));

    if (!interviewData.applicationStatus) {
      axios
        .post("/api/screen-cv", {
          interviewID: interviewData.interviewID,
          userEmail: interviewData.email,
        })
        .then((res) => {
          setInterviewData((prev) => ({
            ...prev,
            ...res.data,
          }));
        })
        .catch((err) => {
          console.log(err);
          setProcessing(false);
        });
    } else {
      setInterviewData((prev) => ({
        ...prev,
        cvStatus: "No CV",
      }));
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (interviewData) {
      if (!interviewData.cvStatus) {
        screenCV();
      }
    }
  }, [interviewData]);

  return (
    <>
      {interviewData && (
        <>
          <button
            className="redo-cv-screening d-none"
            onClick={screenCV}
          ></button>

          <Tooltip
            className="cv-screening-tooltip fade-in"
            id="cv-screening-tooltip"
          />

          <a
            data-tooltip-id="cv-screening-tooltip"
            data-tooltip-html={interviewData.cvScreeningReason}
            className="d-flex align-items-center"
          >
            {interviewData.cvStatus && (
              <>
                <div className={`worker-badge ${interviewData.stateClass}`}>
                  <button className="btn btn-sm btn-default" onClick={screenCV}>
                    <i className="la la-refresh" />
                  </button>
                  <span>{interviewData.cvStatus}</span>
                </div>
              </>
            )}

            {!interviewData.cvStatus && processing && (
              <div className={`worker-badge state-processing`}>
                <span>
                  <i className="la la-circle-notch spin text-primary" />{" "}
                  Screening In Progress...
                </span>
              </div>
            )}
          </a>
        </>
      )}
    </>
  );
}
