// TODO (Vince) - Replace alert and windows.confirm
// TODO (Vince) - Merge API

"use client";

import styles from "@/lib/styles/screen/dashboard.module.scss";
import { contextProvider } from "@/lib/context/Context";
import axios from "axios";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function () {
  const pathname = usePathname();
  const [activeInterviews, setActiveInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [archivedInterviews, setArchivedInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDropdown, setViewDropdown] = useState(null);
  const { user, setModalType } = contextProvider();
  const applicationPhase = [
    "For CV Upload",
    "For CV Screening",
    "For AI Interview",
    "For AI Interview Review",
    "For Human Interview",
    "For Human Interview Review",
    "Job Offer",
    "For Interview", // old data
  ];
  const applicationStep = [
    "CV Screening",
    "AI Interview",
    "Human Interview",
    "Job Offer",
  ];
  const buttonStatus = [
    {
      buttonText: "Submit CV",
      disabled: false,
      spanText: "Required",
      status: applicationPhase[0],
      handleClick: function (interview) {
        setLoading(true);
        localStorage.setItem("interviewData", JSON.stringify(interview));
        window.location.href = "/whitecloak/applicant/upload-cv";
      },
    },
    {
      buttonText: "Start AI Interview",
      disabled: true,
      spanText: "Required",
      status: applicationPhase[1],
      handleClick: function () {
        return true;
      },
    },
    {
      buttonText: "Start AI Interview",
      disabled: false,
      spanText: "Required",
      status: applicationPhase[2],
      handleClick: function (interview) {
        setLoading(true);
        sessionStorage.setItem("interviewRedirection", pathname);
        window.location.href = `/interview/${interview.interviewID}`;
      },
    },
    // old data
    {
      buttonText: "Start AI Interview",
      disabled: false,
      spanText: "Required",
      status: applicationPhase[7],
      handleClick: function (interview) {
        setLoading(true);
        sessionStorage.setItem("interviewRedirection", pathname);
        window.location.href = `/interview/${interview.interviewID}`;
      },
    },
    // old data
    {
      buttonText: "Request to Retake",
      disabled: false,
      spanText: "Optional",
      status: applicationPhase[3],
      handleClick: function (interview) {
        localStorage.setItem("interviewData", JSON.stringify(interview));
        if (interview.interviewDuration < 5) {
          // Auto approve retake request
          handleRetake(interview);
        } else {
          setModalType("retake");
        }
      },
    },
  ];

  const dropdownStatus = [
    {
      text: "Cancel Application",
      handleClick: function (interview) {
        localStorage.setItem("interviewData", JSON.stringify(interview));
        setModalType("cancelApplication");
        setViewDropdown(null);
      },
    },
    {
      text: "View Job",
      handleClick: function (interview) {
        setLoading(true);
        sessionStorage.setItem("selectedCareer", JSON.stringify(interview));
        window.location.href = "/whitecloak/applicant/job-openings";
      },
    },
    {
      text: "Remove Job",
      handleClick: function (interview) {
        const data = {
          email: user.email,
          interviewData: interview,
          body: {
            forDeletion: true,
          },
        };
        manageInterview(data);
      },
    },
  ];
  const droppedStatus = {
    [applicationStep[0]]: {
      description:
        "Thanks for applying! After reviewing your CV, we found that your current experience isn’t the best match for this role. We encourage you to reapply in the future once you've gained more relevant experience.",
      tips: [
        "Try highlighting more results-driven achievements in your CV",
        "Align your experience more closely with the job requirements",
        "Consider adding relevant certifications or skills",
      ],
    },
    [applicationStep[1]]: {
      description:
        "Thanks for applying! After reviewing your AI interview responses, we found that your current experience and answers aren’t the best fit for this role. We encourage you to reapply in the future after refining your responses and gaining more relevant experience.",
      tips: [
        "Be more specific with examples that show impact",
        "Practice structuring your answers (e.g., using STAR: Situation, Task, Action, Result)",
        "Demonstrate deeper familiarity with the role’s key skills",
      ],
    },
    [applicationStep[2]]: {
      description:
        "Thank you for the time and effort you put into this process. While we were impressed by aspects of your background, we’ve decided to move forward with another candidate. We hope you’ll consider applying again in the future.",
      tips: [
        "Reflect on common interview questions and prepare tailored responses",
        "Continue building your experience in areas related to the role",
        "Keep showcasing your strengths — you were close!",
      ],
    },
    [applicationStep[3]]: {
      description:
        "Thank you for the time and effort you put into this process. While we were impressed by aspects of your background, we’ve decided to move forward with another candidate. We hope you’ll consider applying again in the future.",
      tips: [
        "Reflect on common interview questions and prepare tailored responses",
        "Continue building your experience in areas related to the role",
        "Keep showcasing your strengths — you were close!",
      ],
    },
    generic: {
      description:
        "Thank you for applying and for the time you invested. While this application isn't moving forward, we truly appreciate your interest and encourage you to stay connected for future opportunities.",
      tips: [
        "Highlight measurable achievements that align with role expectations",
        "Use structured, focused responses or bullet‑points to convey impact",
        "Continue growing skills relevant to the type of roles you’re targeting",
      ],
    },
  };

  const interviewStatus = ["Ongoing", "Dropped", "Hired", "Cancelled"];
  // const stepNote = [
  //   "Your CV is being reviewed by the hiring team.",
  //   "Your interview is being reviewed by the hiring team.",
  //   "Your interview is being reviewed by the hiring team.",
  // ];
  const stepStatus = ["Completed", "Pending", "In Progress"];
  const tab = ["Active", "Archived"];

  function handleActiveTab(tab) {
    setViewDropdown(null);
    setActiveTab(tab);
  }

  function handleArchive(interview) {
    const data = {
      email: user.email,
      interviewData: interview,
      body: {
        archived: true,
      },
    };
    manageInterview(data);
  }

  function handleDropdown(index) {
    setViewDropdown((prev) => (prev == index ? null : index));
  }

  function handleBrowseJob() {
    setLoading(true);
    window.location.href = "/whitecloak/applicant/job-openings";
  }

  async function handleRetake(interview) {
    setModalType("loading");
    try {
      const response = await axios.post("/api/reset-interview-data", {
        id: interview._id,
      });

      if (response.data.success) {
        window.location.href = `/interview/${interview.interviewID}`;
      }
    } catch (error) {
      console.log(error);
      alert(error.response.data.message || "Failed to retake interview.");
    } finally {
      setModalType(null);
    }
  }

  async function manageInterview(data) {
    setLoading(true);

    await axios({
      url: "/api/whitecloak/manage-application",
      method: "POST",
      data,
    })
      .then(() => {
        location.reload();
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message || "Job management failed.");
        setModalType(null);
      });
  }

  function processButtonState(interview): any {
    //old data
    if (!interviewStatus.includes(interview.applicationStatus)) {
      return buttonStatus[0];
    }
    //old data

    return buttonStatus.find((btn) => btn.status === interview.status);
  }

  function processDate(date) {
    const newDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return newDate.toLocaleDateString("en-US", options);
  }

  function processDateNoteState() {
    return false;
  }

  function processState(interview, step, isImage: boolean = false) {
    let currentStepIndex = applicationStep.indexOf(interview.currentStep);
    const stepIndex = applicationStep.indexOf(step);

    if (interview.currentStep == "Applied") {
      return isImage && step == applicationStep[0]
        ? stepStatus[2]
        : stepStatus[1];
    }

    // old data
    if (interview.status == applicationPhase[7]) {
      currentStepIndex = 0;
    }

    if (!interviewStatus.includes(interview.applicationStatus)) {
      return isImage && step == applicationStep[0]
        ? stepStatus[2]
        : stepStatus[1];
    }
    // old data

    if (currentStepIndex == stepIndex) {
      if (
        [
          applicationPhase[1],
          applicationPhase[3],
          applicationPhase[5],
        ].includes(interview.status)
      ) {
        return stepStatus[2];
      }
      return stepStatus[0];
    }

    if (currentStepIndex > stepIndex) return stepStatus[0];

    if (
      currentStepIndex + 1 == stepIndex &&
      isImage &&
      ![applicationPhase[1], applicationPhase[3], applicationPhase[5]].includes(
        interview.status
      )
    )
      return stepStatus[2];

    return stepStatus[1];
  }

  useEffect(() => {
    // const navType = (
    //   performance.getEntriesByType(
    //     "navigation"
    //   )[0] as PerformanceNavigationTiming
    // ).type;
    const interviews = localStorage.getItem("interviews");

    // if (!interviews || navType == "reload") {
    fetchInterviews();
    // } else {
    //   const result = JSON.parse(interviews);
    //   const activeInterviews = result.filter(
    //     (interview) =>
    //       interview.archived !== true &&
    //       interviewStatus.includes(interview.applicationStatus)
    //   );
    //   const archivedInterviews = result.filter(
    //     (interview) =>
    //       interview.archived === true ||
    //       !interviewStatus.includes(interview.applicationStatus)
    //   );

    //   setActiveInterviews(activeInterviews);
    //   setArchivedInterviews(archivedInterviews);
    //   setLoading(false);
    // }

    setActiveTab(tab[0]);

    async function fetchInterviews() {
      await axios({
        method: "POST",
        url: "/api/whitecloak/fetch-interviews",
        data: { email: user.email },
      })
        .then(async (res) => {
          const result = await res.data;
          const activeInterviews = result.filter(
            (interview) => interview.archived !== true
          );
          const archivedInterviews = result.filter(
            (interview) => interview.archived === true
          );

          setActiveInterviews(activeInterviews);
          setArchivedInterviews(archivedInterviews);
          setActiveTab(tab[0]);
          localStorage.setItem("interviews", JSON.stringify(result));
        })
        .catch((err) => {
          alert("Error fetching interviews");
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (loading) {
      setModalType("loading");
    } else {
      setModalType(null);
    }
  }, [loading]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.infoFilter}>
        <div className={styles.textContainer}>
          <span className={styles.name}>
            Welcome, {user.name ? user.name.split(" ")[0] : "User"}!
          </span>
          <span className={styles.description}>
            Track all of your job applications in one place
          </span>
        </div>

        <div className={styles.buttonContainer}>
          <img alt="search" className={styles.search} src="/icons/search.svg" />
          <input
            placeholder="Search"
            onBlur={(e) => {
              e.target.placeholder = "Search";
            }}
            onClick={(e) => {
              (e.target as HTMLInputElement).placeholder = "";
            }}
          />
          <button>
            <img alt="funnel" src="/icons/funnel.svg" />
            Filters
          </button>
        </div>
      </div>

      <div className={styles.tabContainer}>
        {tab.map((tab, index) => (
          <span
            className={tab == activeTab ? styles.active : ""}
            key={index}
            onClick={() => {
              handleActiveTab(tab);
            }}
          >
            {tab}
            <hr />
          </span>
        ))}
      </div>

      {activeInterviews.length > 0 && !loading && activeTab == tab[0] && (
        <div className={styles.applicationContainer}>
          {activeInterviews.map((interview, index) => (
            <div className={styles.applicationDetailsContainer} key={index}>
              <span className={styles.title}>
                {interview.jobTitle}
                {interview.applicationStatus == interviewStatus[0] && (
                  <img
                    alt="ellipsis"
                    src="/icons/ellipsis-vertical.svg"
                    onClick={() => handleDropdown(index)}
                  />
                )}
              </span>

              {viewDropdown == index && (
                <div className={styles.dropDownContainer}>
                  {dropdownStatus.slice(0, 1).map((item, index) => (
                    <span
                      key={index}
                      onClick={() => item.handleClick(interview)}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              )}

              <hr />

              {(interview.applicationStatus == interviewStatus[0] ||
                !interviewStatus.includes(interview.applicationStatus)) && ( // old data
                <>
                  <div className={styles.applicationStepContainer}>
                    {applicationStep.map((step, index) => (
                      <div className={styles.stepContainer} key={index}>
                        <div className={`webView ${styles.indicator}`}>
                          <img
                            alt="step"
                            src={`/icons/${processState(interview, step, true)
                              .toLowerCase()
                              .replace(" ", "-")}.svg`}
                          />
                          {index < applicationStep.length - 1 && (
                            <hr
                              className={
                                styles[
                                  processState(interview, step)
                                    .toLowerCase()
                                    .replace(" ", "-")
                                ]
                              }
                            />
                          )}
                        </div>

                        <div className={styles.stepDetails}>
                          <img
                            alt="step"
                            className="mobileView"
                            src={`/icons/${processState(interview, step, true)
                              .toLowerCase()
                              .replace(" ", "-")}.svg`}
                          />

                          <div className={styles.textContainer}>
                            <span className={styles.stepNumber}>
                              STEP {index + 1}
                            </span>
                            <span
                              className={`${styles.stepDescription} ${
                                styles[
                                  processState(interview, step, true)
                                    .toLowerCase()
                                    .replace(" ", "-")
                                ]
                              }`}
                            >
                              {step}
                            </span>
                            <span
                              className={`webView ${styles.stepStatus} ${
                                styles[
                                  processState(interview, step)
                                    .toLowerCase()
                                    .replace(" ", "-")
                                ]
                              }`}
                            >
                              {processState(interview, step)}
                            </span>

                            {processDateNoteState() && (
                              <>
                                <span className={styles.stepDate}>
                                  {/* {interview.statusDate["Applied"]} */}
                                </span>
                                <span className={styles.stepNote}>
                                  {/* {stepNote[index]} */}
                                </span>
                              </>
                            )}
                          </div>

                          <span
                            className={`mobileView ${styles.stepStatus} ${
                              styles[
                                processState(interview, step)
                                  .toLowerCase()
                                  .replace(" ", "-")
                              ]
                            }`}
                          >
                            {processState(interview, step)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {processButtonState(interview) && (
                    <div className={styles.buttonContainer}>
                      <span>{processButtonState(interview).spanText}:</span>
                      <button
                        className={`${
                          processButtonState(interview).disabled
                            ? styles.disabled
                            : ""
                        }`}
                        disabled={processButtonState(interview).disabled}
                        onClick={() => {
                          processButtonState(interview).handleClick(interview);
                        }}
                      >
                        {processButtonState(interview).buttonText}
                      </button>
                    </div>
                  )}
                </>
              )}

              {interview.applicationStatus == interviewStatus[1] && (
                <>
                  <div
                    className={`${styles.updateContainer} ${styles.dropped}`}
                  >
                    <img
                      alt="circle-x"
                      className="webView"
                      src="/icons/circle-x.svg"
                    />
                    <div className={styles.textContainer}>
                      <span className={styles.statusTitle}>
                        <img
                          alt="circle-x"
                          className="mobileView"
                          src="/icons/circle-x.svg"
                        />
                        Application Update
                      </span>
                      <span className={styles.statusDescription}>
                        {
                          droppedStatus[interview?.currentStep || "generic"]
                            .description
                        }
                      </span>

                      <div className={styles.bottomTextContainer}>
                        <img
                          alt="lightbulb"
                          className="webView"
                          src="/icons/lightbulb.svg"
                        />
                        <div className={styles.tipsContainer}>
                          <span className={styles.tipsTitle}>
                            <img
                              alt="lightbulb"
                              className="mobileView"
                              src="/icons/lightbulb.svg"
                            />
                            Tips for your next application:
                          </span>
                          <ul>
                            {droppedStatus[
                              interview?.currentStep || "generic"
                            ]?.tips.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        {/* <div className={styles.reminderContainer}>
                          <div className={styles.dateContainer}>
                            <img
                              alt="calendar-check"
                              src="/icons/calendar-check.svg"
                            />
                            <div className={styles.dateTextContainer}>
                              <span className={styles.dateTitle}>
                                Date of last application:
                              </span>
                              <span className={styles.date}>
                                September 17, 2025
                                <img
                                  alt="help-icon"
                                  src="/icons/help-icon.svg"
                                />
                              </span>
                            </div>
                          </div>

                          <div className={styles.dateContainer}>
                            <img
                              alt="timer-reset"
                              src="/icons/timer-reset.svg"
                            />
                            <div className={styles.dateTextContainer}>
                              <span className={styles.dateTitle}>
                                You may reapply after:
                              </span>
                              <span className={styles.date}>
                                September 17, 2025
                              </span>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.buttonContainer} ${styles.dropped}`}
                  >
                    <button onClick={() => handleArchive(interview)}>
                      <img alt="archive" src="/icons/archive.svg" />
                      Archive Application
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {activeInterviews.length == 0 && !loading && activeTab == tab[0] && (
        <div className={styles.emptyContainer}>
          <img alt="folder-closed" src="/icons/folder-closed.svg" />
          <span className={styles.emptyTitle}>No Applications Yet</span>
          <span className={styles.emptyDescription}>
            You haven’t applied to any roles yet.
          </span>
          <span className={styles.emptyDescription}>
            Once you do, they’ll appear here.
          </span>
          <button onClick={handleBrowseJob}>Browse Job Openings</button>
        </div>
      )}

      {archivedInterviews.length > 0 && !loading && activeTab == tab[1] && (
        <div className={styles.applicationContainer}>
          {archivedInterviews.map((interview, index) => (
            <div className={styles.applicationDetailsContainer} key={index}>
              <span className={styles.title}>
                {interview.jobTitle}
                <img
                  alt="ellipsis"
                  src="/icons/ellipsis-vertical.svg"
                  onClick={() => handleDropdown(index)}
                />
              </span>

              {viewDropdown == index && (
                <div className={styles.dropDownContainer}>
                  {dropdownStatus.slice(1, 3).map((item, index) => (
                    <span
                      key={index}
                      onClick={() => item.handleClick(interview)}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              )}

              <hr />

              {interview.applicationStatus == interviewStatus[1] && (
                <>
                  <div
                    className={`${styles.updateContainer} ${styles.dropped}`}
                  >
                    <img
                      alt="circle-x"
                      className="webView"
                      src="/icons/circle-x.svg"
                    />
                    <div className={styles.textContainer}>
                      <span className={styles.statusTitle}>
                        <img
                          alt="circle-x"
                          className="mobileView"
                          src="/icons/circle-x.svg"
                        />
                        Application Update
                      </span>
                      <span className={styles.statusDescription}>
                        {
                          droppedStatus[interview?.currentStep || "generic"]
                            ?.description
                        }
                      </span>

                      <div className={styles.bottomTextContainer}>
                        <img
                          alt="lightbulb"
                          className="webView"
                          src="/icons/lightbulb.svg"
                        />
                        <div className={styles.tipsContainer}>
                          <span className={styles.tipsTitle}>
                            <img
                              alt="lightbulb"
                              className="mobileView"
                              src="/icons/lightbulb.svg"
                            />
                            Tips for your next application:
                          </span>
                          <ul>
                            {droppedStatus[
                              interview?.currentStep || "generic"
                            ]?.tips.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        {/* <div className={styles.reminderContainer}>
                          <div className={styles.dateContainer}>
                            <img
                              alt="calendar-check"
                              src="/icons/calendar-check.svg"
                            />
                            <div className={styles.dateTextContainer}>
                              <span className={styles.dateTitle}>
                                Date of last application:
                              </span>
                              <span className={styles.date}>
                                September 17, 2025
                                <img
                                  alt="help-icon"
                                  src="/icons/help-icon.svg"
                                />
                              </span>
                            </div>
                          </div>

                          <div className={styles.dateContainer}>
                            <img
                              alt="timer-reset"
                              src="/icons/timer-reset.svg"
                            />
                            <div className={styles.dateTextContainer}>
                              <span className={styles.dateTitle}>
                                You may reapply after:
                              </span>
                              <span className={styles.date}>
                                September 17, 2025
                              </span>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {interview.applicationStatus == interviewStatus[3] && (
                <div className={styles.updateContainer}>
                  <img
                    alt="circle-x"
                    className="webView"
                    src="/icons/circle-x.svg"
                  />
                  <div className={styles.textContainer}>
                    <span className={styles.statusTitle}>
                      <img
                        alt="circle-x"
                        className="mobileView"
                        src="/icons/circle-x.svg"
                      />
                      Application Update
                    </span>
                    <span
                      className={`${styles.statusDescription} ${styles.cancelled}`}
                    >
                      This application is no longer active.
                    </span>
                    <div className={styles.statusDetails}>
                      <div className={styles.detailsContainer}>
                        <span className={styles.detailsTitle}>Status:</span>
                        <span className={styles.detailsStatus}>
                          {interview.applicationStatus}
                        </span>
                      </div>
                      <div className={styles.detailsContainer}>
                        <span className={styles.detailsTitle}>
                          Cancelled on:
                        </span>
                        <span className={styles.detailsDate}>
                          {processDate(interview.completedAt)}
                        </span>
                      </div>
                      <div className={styles.detailsContainer}>
                        <span className={styles.detailsTitle}>
                          Reason for cancelling:
                        </span>
                        <span className={styles.detailsReason}>
                          {interview.selectedReason != "Others" ? (
                            interview.selectedReason
                          ) : (
                            <>
                              {interview.selectedReason}:{" "}
                              <span>{interview.cancelReason}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {archivedInterviews.length == 0 && !loading && activeTab == tab[1] && (
        <div className={styles.emptyContainer}>
          <img alt="archive-restore" src="/icons/archive-restore.svg" />
          <span className={styles.emptyTitle}>Nothing Yet</span>
          <span className={styles.emptyDescription}>
            Applications you archive appear here.
          </span>
          <button onClick={handleBrowseJob}>Browse Job Openings</button>
        </div>
      )}
    </div>
  );
}
