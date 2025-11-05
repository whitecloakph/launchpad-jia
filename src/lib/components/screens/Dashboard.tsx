// TODO (Job Portal) - Check API

"use client";

import Loader from "@/lib/components/commonV2/Loader";
import styles from "@/lib/styles/screens/dashboard.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { processDisplayDate } from "@/lib/utils/helpersV2";
import axios from "axios";
import Fuse from "fuse.js";
import { useEffect, useState } from "react";

export default function () {
  const [activeInterviewIndex, setActiveInterviewIndex] = useState(null);
  const [activeInterviews, setActiveInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [archivedInterviews, setArchivedInterviews] = useState([]);
  const [filteredActiveInterview, setFilteredActiveInterview] = useState([]);
  const [filteredArchiveInterview, setFilteredArchiveInterview] = useState([]);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [filterValue, setFilterValue] = useState(null);
  const [search, setSearch] = useState("");
  const [viewDropdown, setViewDropdown] = useState(null);
  const { user, setModalType } = useAppContext();
  const applicationPhase = [
    "For CV Screening",
    "For AI Interview",
    "For AI Interview Review",
    "For Human Interview",
    "For Human Interview Review",
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
      handleClick: function (interview) {
        setModalType("loading");
        sessionStorage.setItem("selectedCareer", JSON.stringify(interview));
        window.location.href = pathConstants.uploadCV;
      },
    },
    {
      buttonText: "Start AI Interview",
      disabled: true,
      spanText: "Required",
      status: applicationPhase[0],
      handleClick: function () {
        return true;
      },
    },
    {
      buttonText: "Start AI Interview",
      disabled: false,
      spanText: "Required",
      status: applicationPhase[1],
      handleClick: function (interview) {
        setModalType("loading");
        sessionStorage.setItem("interviewRedirection", pathConstants.dashboard);
        window.location.href = `/interview/${interview.interviewID}`;
      },
    },
    {
      buttonText: "Request to Retake",
      spanText: "Optional",
      status: applicationPhase[2],
      handleClick: function (interview) {
        if (interview.interviewDuration < 5) {
          retakeInterview(interview);
        } else {
          sessionStorage.setItem("selectedCareer", JSON.stringify(interview));
          setModalType("retake");
        }
      },
    },
  ];
  const dropdownItems = [
    {
      text: "Cancel Application",
      handleClick: function (interview) {
        sessionStorage.setItem("selectedCareer", JSON.stringify(interview));
        setModalType("cancel");
        setViewDropdown(null);
      },
    },
  ];
  const droppedStatus = {
    [applicationStep[0]]: {
      description:
        "Thanks for applying! However, after reviewing your CV, we found that your current experience isn’t the best match for this role. We encourage you to reapply in the future once you've gained more relevant experience.",
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
    Applied: {
      description:
        "Thanks for applying! After an initial review, we’ve decided not to move forward with your application at this time. We truly appreciate your interest and encourage you to apply again in the future.",
      tips: [
        "Consider applying to roles that more closely match your background",
        "Tailor your CV and application materials to highlight relevant strengths",
        "Continue building experience aligned with your target roles",
      ],
    },
    generic: {
      description:
        "Thanks for applying! While we won’t be moving forward with your application, we appreciate your interest and encourage you to reapply in the future as you continue to grow your experience.",
      tips: [
        "Highlight measurable achievements and outcomes in your application",
        "Tailor your experiences and responses to align with the role",
        "Continue building relevant skills and gaining practical experience",
      ],
    },
  };
  const filters = [
    "All Application Stages",
    ...applicationStep,
    "Application Closed",
  ];
  const interviewStatus = ["Ongoing", "Dropped", "Hired", "Cancelled"];
  const stepNote = [
    "Your CV is being reviewed by the hiring team.",
    "Your interview is being reviewed by the hiring team.",
  ];
  const stepStatus = ["Completed", "Pending", "In Progress"];
  const tabs = [
    {
      image: assetConstants.briefcaseV2,
      name: "Active",
      value: filteredActiveInterview.length,
    },
    {
      image: assetConstants.archive,
      name: "Archived",
      value: filteredArchiveInterview.length,
    },
  ];

  function handleActiveTab(tab) {
    setActiveTab(tab);
    setViewDropdown(null);
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

  function handleApplication(interview, index) {
    if (interview.applicationStatus == interviewStatus[0]) {
      setActiveInterviewIndex((prev) => (prev != index ? index : null));
    }
  }

  function handleBrowseJob() {
    window.location.href = pathConstants.dashboardJobOpenings;
  }

  function handleDropdown(e, index) {
    e.stopPropagation();
    setViewDropdown((prev) => (prev == index ? null : index));
  }

  function handleViewScreeningResult(interview) {
    sessionStorage.setItem("selectedCareer", JSON.stringify(interview));
    setModalType("screening");
  }

  function processButtonState(interview): any {
    if (interview.currentStep == "Applied") {
      return buttonStatus[0];
    }

    if (interview.applicationStatus) {
      return buttonStatus.find((btn) => btn.status === interview.status);
    }
  }

  function processCurrentStep(interview) {
    if (interview.currentStep == "Applied") {
      return applicationStep[0];
    }

    if (applicationStep.includes(interview.currentStep)) {
      if (interview.currentStep == applicationStep[0]) {
        return interview.status == applicationPhase[1]
          ? applicationStep[1]
          : applicationStep[0];
      }

      if (interview.currentStep == applicationStep[1]) {
        return interview.status.toLowerCase().includes("review")
          ? `${applicationStep[1]} Review`
          : applicationStep[2];
      }

      if (interview.currentStep == applicationStep[2]) {
        return interview.status.toLowerCase().includes("review")
          ? `${applicationStep[2]} Review`
          : `Pending ${applicationStep[3]}`;
      }
    }

    if (
      interview.currentStep &&
      !applicationStep.includes(interview.currentStep)
    ) {
      return `Final ${applicationStep[3]}`;
    }

    if (!interview.currentStep) {
      if (interview.summary) {
        return applicationStep[1];
      }

      return applicationStep[0];
    }

    return interview.currentStep;
  }

  // function processDate(date) {
  //   const newDate = new Date(date);
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   };

  //   return newDate.toLocaleDateString("en-US", options);
  // }

  function processNoteState(interview, index) {
    if (interview.status == applicationPhase[0] && index == 0) {
      return stepNote[0];
    }

    if (interview.status == applicationPhase[2] && index == 1) {
      return stepNote[1];
    }

    if (interview.status == applicationPhase[4] && index == 2) {
      return stepNote[1];
    }
  }

  function processState(interview, step, isAdvance: boolean = false) {
    const stepIndex = applicationStep.indexOf(step);
    let currentStepIndex = applicationStep.indexOf(interview.currentStep);

    if (interview.currentStep == "Applied") {
      if (stepIndex == 0) {
        return isAdvance ? stepStatus[2] : stepStatus[1];
      }
    }

    if (currentStepIndex != -1) {
      if (stepIndex == currentStepIndex) {
        return [
          applicationPhase[0],
          applicationPhase[2],
          applicationPhase[4],
        ].includes(interview.status)
          ? stepStatus[2]
          : stepStatus[0];
      }

      if (stepIndex > currentStepIndex) {
        return stepIndex == currentStepIndex + 1 &&
          isAdvance &&
          ![
            applicationPhase[0],
            applicationPhase[2],
            applicationPhase[4],
          ].includes(interview.status)
          ? stepStatus[2]
          : stepStatus[1];
      }

      if (currentStepIndex > stepIndex) {
        return stepStatus[0];
      }
    }

    if (
      interview.currentStep &&
      currentStepIndex == -1 &&
      interview.currentStep != "Applied"
    ) {
      return stepStatus[0];
    }

    return stepStatus[1];
  }

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (activeTab) {
      let filteredInterviews;

      if (activeTab.name == tabs[0].name) {
        filteredInterviews = [...activeInterviews];
      } else {
        filteredInterviews = [...archivedInterviews];
      }

      if (search.trim()) {
        const fuse = new Fuse(filteredInterviews, {
          threshold: 0.3,
          keys: ["jobTitle"],
        });
        const searchResults = fuse.search(search.trim());

        filteredInterviews = searchResults.map((res) => res.item);
      }

      if (activeTab.name == tabs[0].name) {
        setFilteredActiveInterview(filteredInterviews);
      } else {
        setFilteredArchiveInterview(filteredInterviews);
      }
    }
  }, [activeTab, search]);

  function fetchInterviews() {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-interviews",
      data: { email: user.email, interviewID: "all" },
    })
      .then((res) => {
        const result = res.data;
        const activeInterviews = result.filter(
          (interview) => interview.archived !== true
        );
        const archivedInterviews = result.filter(
          (interview) => interview.archived === true
        );

        setActiveInterviews(activeInterviews);
        setArchivedInterviews(archivedInterviews);
        setFilterValue(filters[0]);
        setFilteredActiveInterview(activeInterviews);
        setFilteredArchiveInterview(archivedInterviews);
      })
      .catch((err) => {
        alert("Error fetching interviews.");
        console.log(err);
      })
      .finally(() => {
        setActiveTab(tabs[0]);
      });
  }

  function manageInterview(data) {
    setModalType("loading");

    axios({
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

  function retakeInterview(interview) {
    setModalType("loading");

    axios({
      method: "POST",
      url: "/api/reset-interview-data",
      data: {
        id: interview._id,
      },
    })
      .then((res) => {
        const result = res.data;

        if (result.success) {
          window.location.href = `/interview/${interview.interviewID}`;
        } else {
          alert("Failed to submit retake interview.");
        }
      })
      .catch((err) => {
        alert("Failed to submit retake interview.");
        console.log(err);
      })
      .finally(() => {
        setModalType(null);
      });
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.infoFilter}>
        <div className={styles.textContainer}>
          <span className={styles.name}>
            Welcome, {user.name.split(" ")[0]}!
          </span>
          <span className={styles.description}>
            Track all of your job applications in one place
          </span>
        </div>

        <div className={styles.buttonContainer}>
          <button
            className="secondaryBtn"
            onClick={() => setFilterDropdown(!filterDropdown)}
            style={{ display: "none" }}
          >
            <img alt="" src={assetConstants.filter} />
            {filterValue ? filterValue : "Filters"}
          </button>

          {filterDropdown && (
            <div className={styles.filterDropdownContainer}>
              {filters.map((item, index) => (
                <span
                  key={index}
                  className={`${item == filterValue ? styles.active : ""}`}
                  onClick={() => {
                    setFilterDropdown(false);
                    setFilterValue(item);
                  }}
                >
                  {item}
                  {item == filterValue && (
                    <img alt="" src={assetConstants.checkV5} />
                  )}
                </span>
              ))}
            </div>
          )}

          <img alt="" className={styles.search} src={assetConstants.search} />
          <input
            placeholder="Search"
            value={search}
            onBlur={(e) => {
              e.target.placeholder = "Search";
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).placeholder = "";
            }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tabContainer}>
        {activeTab ? (
          tabs.map((tab, index) => (
            <div key={index} onClick={() => handleActiveTab(tab)}>
              <span className={styles.tab}>
                <img alt="" src={tab.image} />
                {tab.name}
                <span>{tab.value}</span>
              </span>
              {activeTab.name == tab.name && <hr />}
            </div>
          ))
        ) : (
          <>
            <div className={styles.loadingContainer}>
              <div className={styles.loading} />
            </div>
            <div className={styles.loadingContainer}>
              <div className={styles.loading} />
            </div>
          </>
        )}
      </div>

      {activeTab ? (
        ((filteredActiveInterview.length == 0 &&
          activeTab.name == tabs[0].name) ||
          (filteredArchiveInterview.length == 0 &&
            activeTab.name == tabs[1].name)) && (
          <div className={styles.gradientContainer}>
            <div className={styles.emptyContainer}>
              <span className={styles.emptyTitle}>
                {activeTab.name == tabs[0].name
                  ? "No Applications Yet"
                  : "Nothing Yet"}
              </span>
              <span className={styles.emptyDescription}>
                {activeTab.name == tabs[0].name
                  ? "You haven’t applied to any roles yet."
                  : "You haven’t archived any roles yet."}
              </span>
              <span className={styles.emptyDescription}>
                Once you do, they’ll appear here.
              </span>
              <button onClick={handleBrowseJob}>
                Browse Job Openings
                <img alt="arrow" src={assetConstants.arrow} />
              </button>
            </div>
          </div>
        )
      ) : (
        <Loader loaderType={"application"} loaderData={{ length: 10 }} />
      )}

      {activeTab && (
        <>
          {filteredActiveInterview.length > 0 &&
            activeTab.name == tabs[0].name && (
              <div className={styles.applicationContainer}>
                {filteredActiveInterview.map((interview, index) => (
                  <div
                    className={styles.applicationDetailsContainer}
                    key={index}
                  >
                    <div
                      className={`${styles.titleContainer} ${
                        interview.applicationStatus != interviewStatus[0]
                          ? styles.disabled
                          : activeInterviewIndex == index
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => handleApplication(interview, index)}
                    >
                      {interview.organization &&
                        interview.organization.image && (
                          <img
                            alt=""
                            className={styles.companyLogo}
                            src={interview.organization.image}
                          />
                        )}

                      <div className={styles.companyDetailsContainer}>
                        <span className={styles.jobTitle}>
                          {interview.jobTitle}
                        </span>
                        {interview.organization &&
                          interview.organization.name && (
                            <span className={styles.companyName}>
                              {interview.organization.name}
                            </span>
                          )}
                      </div>

                      <div
                        className={`webView ${styles.applicationStatusContainer}`}
                      >
                        <span className={styles.statusTitle}>Stage</span>
                        <span className={styles.statusValue}>
                          {processCurrentStep(interview)}
                        </span>
                      </div>

                      <div
                        className={`webView ${styles.applicationStatusContainer}`}
                      >
                        <span className={styles.statusTitle}>
                          Stage Updated
                        </span>
                        <span className={styles.statusValue}>
                          {[interviewStatus[1], interviewStatus[3]].includes(
                            interview.applicationStatus
                          )
                            ? processDisplayDate(
                                interview.completedAt || interview.updatedAt
                              )
                            : processDisplayDate(interview.updatedAt)}
                        </span>
                      </div>

                      {interview.applicationStatus == interviewStatus[0] && (
                        <img
                          alt="ellipsis"
                          className={styles.menu}
                          src={assetConstants.ellipsis}
                          onClick={(e) => handleDropdown(e, index)}
                        />
                      )}
                    </div>

                    {viewDropdown == index && (
                      <div className={styles.dropDownContainer}>
                        {dropdownItems.map((item, index) => (
                          <span
                            key={index}
                            onClick={() => item.handleClick(interview)}
                          >
                            {item.text}
                          </span>
                        ))}
                      </div>
                    )}

                    {interview.applicationStatus == interviewStatus[0] &&
                      activeInterviewIndex == index && (
                        <div className={styles.bottomContainer}>
                          <div className={styles.applicationStepContainer}>
                            {applicationStep.map((step, index) => (
                              <div className={styles.stepContainer} key={index}>
                                <div className={styles.indicator}>
                                  <img
                                    alt=""
                                    src={
                                      assetConstants[
                                        processState(interview, step, true)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }
                                  />

                                  <div className={styles.stepDetails}>
                                    <span
                                      className={`mobileView ${
                                        styles.stepNumber
                                      } ${
                                        styles[
                                          processState(interview, step, true)
                                            .toLowerCase()
                                            .replace(" ", "_")
                                        ]
                                      }`}
                                    >
                                      STEP {index + 1}
                                    </span>
                                    <span
                                      className={`mobileView ${
                                        styles.stepDescription
                                      } ${
                                        styles[
                                          processState(interview, step, true)
                                            .toLowerCase()
                                            .replace(" ", "_")
                                        ]
                                      }`}
                                    >
                                      {step}
                                    </span>

                                    <span
                                      className={`mobileView ${styles.stepNote}`}
                                    >
                                      {processNoteState(interview, index)}
                                    </span>
                                  </div>

                                  {index < applicationStep.length - 1 && (
                                    <hr
                                      className={`webView ${
                                        styles[
                                          processState(interview, step)
                                            .toLowerCase()
                                            .replace(" ", "_")
                                        ]
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className={styles.stepDetails}>
                                  <span
                                    className={`webView ${styles.stepNumber} ${
                                      styles[
                                        processState(interview, step, true)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }`}
                                  >
                                    STEP {index + 1}
                                  </span>
                                  <span
                                    className={`webView ${
                                      styles.stepDescription
                                    } ${
                                      styles[
                                        processState(interview, step, true)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }`}
                                  >
                                    {step}
                                  </span>
                                  <span
                                    className={`${styles.stepStatus} ${
                                      styles[
                                        processState(interview, step)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }`}
                                  >
                                    {processState(interview, step)}
                                  </span>

                                  <span
                                    className={`webView ${styles.stepNote}`}
                                  >
                                    {processNoteState(interview, index)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {processButtonState(interview) && (
                            <div className={styles.buttonContainer}>
                              {interview.retakeRequest &&
                                interview.retakeRequest.reason && (
                                  <div className={styles.hoverContainer}>
                                    <span>
                                      You’ve already submitted a retake request
                                      for this application.
                                    </span>
                                  </div>
                                )}
                              <span>
                                {processButtonState(interview).spanText}:
                              </span>
                              <button
                                className={`${
                                  processButtonState(interview).disabled ||
                                  (interview.retakeRequest &&
                                    interview.retakeRequest.reason)
                                    ? "disabled"
                                    : ""
                                }`}
                                disabled={
                                  (interview.retakeRequest &&
                                    interview.retakeRequest.reason) ||
                                  processButtonState(interview).disabled
                                }
                                onClick={() =>
                                  processButtonState(interview).handleClick(
                                    interview
                                  )
                                }
                              >
                                {processButtonState(interview).buttonText}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    {interview.applicationStatus == interviewStatus[1] && (
                      <div className={styles.updateContainer}>
                        <div className={styles.applicationUpdate}>
                          <img alt="" src={assetConstants.userRejected} />
                          <div className={styles.textContainer}>
                            <span className={styles.title}>
                              Application Update
                            </span>
                            <span className={styles.description}>
                              {interview.currentStep &&
                              interviewStatus.includes(interview.currentStep)
                                ? droppedStatus[interview.currentStep]
                                    .description
                                : droppedStatus.generic.description}
                            </span>
                          </div>
                        </div>

                        <div className={styles.tipsUpdate}>
                          <div className={styles.leftContainer}>
                            <img alt="" src={assetConstants.hilight} />
                            <div className={styles.textContainer}>
                              <span className={styles.title}>
                                Jia’s tips for your next application:
                              </span>
                              <ul>
                                {(interview.currentStep &&
                                interviewStatus.includes(interview.currentStep)
                                  ? droppedStatus[interview.currentStep].tips
                                  : droppedStatus.generic.tips
                                ).map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}

                                {(interview.summary ||
                                  interview.cvScreeningReason) &&
                                  [
                                    applicationStep[0],
                                    applicationStep[1],
                                  ].includes(processCurrentStep(interview)) && (
                                    <li
                                      className={styles.screeningLink}
                                      onClick={() =>
                                        handleViewScreeningResult(interview)
                                      }
                                    >
                                      View the AI Screening Result
                                    </li>
                                  )}
                              </ul>
                            </div>
                          </div>
                          <div className={styles.rightContainer}></div>
                        </div>
                        <button onClick={() => handleArchive(interview)}>
                          <img alt="" src={assetConstants.archiveV2} />
                          Archive Application
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          {filteredArchiveInterview.length > 0 &&
            activeTab.name == tabs[1].name && (
              <div className={styles.applicationContainer}>
                {filteredArchiveInterview.map((interview, index) => (
                  <div
                    className={styles.applicationDetailsContainer}
                    key={index}
                  >
                    <div
                      className={`${styles.titleContainer} ${
                        interview.applicationStatus != interviewStatus[0]
                          ? styles.disabled
                          : activeInterviewIndex == index
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => handleApplication(interview, index)}
                    >
                      {interview.organization &&
                        interview.organization.image && (
                          <img
                            alt=""
                            className={styles.companyLogo}
                            src={interview.organization.image}
                          />
                        )}

                      <div className={styles.companyDetailsContainer}>
                        <span className={styles.jobTitle}>
                          {interview.jobTitle}
                        </span>
                        {interview.organization &&
                          interview.organization.name && (
                            <span className={styles.companyName}>
                              {interview.organization.name}
                            </span>
                          )}
                      </div>

                      <div
                        className={`webView ${styles.applicationStatusContainer}`}
                      >
                        <span className={styles.statusTitle}>Stage</span>
                        <span className={styles.statusValue}>
                          {processCurrentStep(interview)}
                        </span>
                      </div>

                      <div
                        className={`webView ${styles.applicationStatusContainer}`}
                      >
                        <span className={styles.statusTitle}>
                          Stage Updated
                        </span>
                        <span className={styles.statusValue}>
                          {[interviewStatus[1], interviewStatus[3]].includes(
                            interview.applicationStatus
                          )
                            ? processDisplayDate(
                                interview.completedAt || interview.updatedAt
                              )
                            : processDisplayDate(interview.updatedAt)}
                        </span>
                      </div>

                      {interview.applicationStatus == interviewStatus[0] && (
                        <img
                          alt="ellipsis"
                          className={styles.menu}
                          src={assetConstants.ellipsis}
                          onClick={(e) => handleDropdown(e, index)}
                        />
                      )}
                    </div>

                    {viewDropdown == index && (
                      <div className={styles.dropDownContainer}>
                        {dropdownItems.map((item, index) => (
                          <span
                            key={index}
                            onClick={() => item.handleClick(interview)}
                          >
                            {item.text}
                          </span>
                        ))}
                      </div>
                    )}

                    {interview.applicationStatus == interviewStatus[0] &&
                      activeInterviewIndex == index && (
                        <div className={styles.bottomContainer}>
                          <div className={styles.applicationStepContainer}>
                            {applicationStep.map((step, index) => (
                              <div className={styles.stepContainer} key={index}>
                                <div className={styles.indicator}>
                                  <img
                                    alt=""
                                    src={
                                      assetConstants[
                                        processState(interview, step, true)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }
                                  />

                                  <div className={styles.stepDetails}>
                                    <span
                                      className={`mobileView ${
                                        styles.stepNumber
                                      } ${
                                        styles[
                                          processState(interview, step, true)
                                            .toLowerCase()
                                            .replace(" ", "_")
                                        ]
                                      }`}
                                    >
                                      STEP {index + 1}
                                    </span>
                                    <span
                                      className={`mobileView ${
                                        styles.stepDescription
                                      } ${
                                        styles[
                                          processState(interview, step, true)
                                            .toLowerCase()
                                            .replace(" ", "_")
                                        ]
                                      }`}
                                    >
                                      {step}
                                    </span>

                                    <span
                                      className={`mobileView ${styles.stepNote}`}
                                    >
                                      {processNoteState(interview, index)}
                                    </span>
                                  </div>

                                  {index < applicationStep.length - 1 && (
                                    <hr
                                      className={`webView ${
                                        styles[
                                          processState(interview, step)
                                            .toLowerCase()
                                            .replace(" ", "_")
                                        ]
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className={styles.stepDetails}>
                                  <span
                                    className={`webView ${styles.stepNumber} ${
                                      styles[
                                        processState(interview, step, true)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }`}
                                  >
                                    STEP {index + 1}
                                  </span>
                                  <span
                                    className={`webView ${
                                      styles.stepDescription
                                    } ${
                                      styles[
                                        processState(interview, step, true)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }`}
                                  >
                                    {step}
                                  </span>
                                  <span
                                    className={`${styles.stepStatus} ${
                                      styles[
                                        processState(interview, step)
                                          .toLowerCase()
                                          .replace(" ", "_")
                                      ]
                                    }`}
                                  >
                                    {processState(interview, step)}
                                  </span>

                                  <span
                                    className={`webView ${styles.stepNote}`}
                                  >
                                    {processNoteState(interview, index)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {processButtonState(interview) && (
                            <div className={styles.buttonContainer}>
                              {interview.retakeRequest &&
                                interview.retakeRequest.reason && (
                                  <div className={styles.hoverContainer}>
                                    <span>
                                      You’ve already submitted a retake request
                                      for this application.
                                    </span>
                                  </div>
                                )}
                              <span>
                                {processButtonState(interview).spanText}:
                              </span>
                              <button
                                className={`${
                                  processButtonState(interview).disabled ||
                                  (interview.retakeRequest &&
                                    interview.retakeRequest.reason)
                                    ? "disabled"
                                    : ""
                                }`}
                                disabled={
                                  (interview.retakeRequest &&
                                    interview.retakeRequest.reason) ||
                                  processButtonState(interview).disabled
                                }
                                onClick={() =>
                                  processButtonState(interview).handleClick(
                                    interview
                                  )
                                }
                              >
                                {processButtonState(interview).buttonText}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    {interview.applicationStatus == interviewStatus[1] && (
                      <div className={styles.updateContainer}>
                        <div className={styles.applicationUpdate}>
                          <img alt="" src={assetConstants.userRejected} />
                          <div className={styles.textContainer}>
                            <span className={styles.title}>
                              Application Update
                            </span>
                            <span className={styles.description}>
                              {interview.currentStep &&
                              interviewStatus.includes(interview.currentStep)
                                ? droppedStatus[interview.currentStep]
                                    .description
                                : droppedStatus.generic.description}
                            </span>
                          </div>
                        </div>

                        <div className={styles.tipsUpdate}>
                          <div className={styles.leftContainer}>
                            <img alt="" src={assetConstants.hilight} />
                            <div className={styles.textContainer}>
                              <span className={styles.title}>
                                Jia’s tips for your next application:
                              </span>
                              <ul>
                                {(interview.currentStep &&
                                interviewStatus.includes(interview.currentStep)
                                  ? droppedStatus[interview.currentStep].tips
                                  : droppedStatus.generic.tips
                                ).map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                                {[
                                  applicationStep[0],
                                  applicationStep[1],
                                ].includes(processCurrentStep(interview)) && (
                                  <li
                                    className={styles.screeningLink}
                                    onClick={() =>
                                      handleViewScreeningResult(interview)
                                    }
                                  >
                                    View the AI Screening Result
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div className={styles.rightContainer}></div>
                        </div>
                      </div>
                    )}

                    {interview.applicationStatus == interviewStatus[3] && (
                      <div
                        className={`${styles.updateContainer} ${styles.cancelled}`}
                      >
                        <div className={styles.applicationUpdate}>
                          <img alt="" src={assetConstants.trash} />
                          <div className={styles.textContainer}>
                            <span className={styles.title}>
                              Application Update
                            </span>
                            <span className={styles.description}>
                              This application is no longer active.
                            </span>
                          </div>
                        </div>

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
                              {processDisplayDate(
                                interview.completedAt || interview.updatedAt
                              )}
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
                    )}
                  </div>
                ))}
              </div>
            )}
        </>
      )}
    </div>
  );
}
