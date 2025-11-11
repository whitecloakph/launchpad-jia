// TODO (Job Portal) - Check API

"use client";

import Loader from "@/lib/components/commonV2/Loader";
import styles from "@/lib/styles/screens/uploadCV.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { checkFile } from "@/lib/utils/helpersV2";
import { CORE_API_URL } from "@/lib/Utils";
import axios from "axios";
import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";

export default function () {
  const fileInputRef = useRef(null);
  const { user, setModalType } = useAppContext();
  const [buildingCV, setBuildingCV] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [digitalCV, setDigitalCV] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [file, setFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [userCV, setUserCV] = useState(null);
  const [preScreeningAnswers, setPreScreeningAnswers] = useState({});
  const cvSections = [
    "Introduction",
    "Current Position",
    "Contact Info",
    "Skills",
    "Experience",
    "Education",
    "Projects",
    "Certifications",
    "Awards",
  ];
  const step = ["Submit CV", "Pre-screening Questions", "Review"];
  const stepStatus = ["Completed", "Pending", "In Progress"];

  // Helper function to flatten pre-screening questions from interview object
  function getFlattenedQuestions() {
    if (!interview?.prescreeningQuestions) return [];
    return interview.prescreeningQuestions;
  }

  // Helper function to check if all pre-screening questions are answered
  function arePreScreeningQuestionsValid() {
    const questions = getFlattenedQuestions();
    if (questions.length === 0) return false;

    for (const question of questions) {
      const answer = preScreeningAnswers[question.id];

      if (question.type === "checkboxes") {
        if (!answer || answer.length === 0) return false;
      } else if (question.type === "range") {
        if (!answer || !answer.min || !answer.max) return false;
      } else {
        if (!answer || (typeof answer === "string" && !answer.trim())) {
          return false;
        }
      }
    }
    return true;
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files);
  }

  function handleEditCV(section) {
    setEditingCV(section);

    if (section != null) {
      setTimeout(() => {
        const sectionDetails = document.getElementById(section);

        if (sectionDetails) {
          sectionDetails.focus();
        }
      }, 100);
    }
  }

  function handleFile(files) {
    const file = checkFile(files);

    if (file) {
      setFile(file);
      handleFileSubmit(file);
    }
  }

  function handleFileChange(e) {
    const files = e.target.files;

    if (files.length > 0) {
      handleFile(files);
    }
  }

  function handleModal() {
    setModalType("jobDescription");
  }

  function handlePreScreeningContinue() {
    const questions = getFlattenedQuestions();

    // Validate all questions are answered
    for (const question of questions) {
      const answer = preScreeningAnswers[question.id];

      if (question.type === "checkboxes") {
        if (!answer || answer.length === 0) {
          alert("Please answer all pre-screening questions.");
          return;
        }
      } else if (question.type === "range") {
        if (!answer || !answer.min || !answer.max) {
          alert("Please answer all pre-screening questions.");
          return;
        }
      } else {
        if (!answer || (typeof answer === "string" && !answer.trim())) {
          alert("Please answer all pre-screening questions.");
          return;
        }
      }
    }

    // Auto-proceed to CV screening
    handleCVScreen();
  }

  function handleRedirection(type) {
    if (type == "dashboard") {
      window.location.href = pathConstants.dashboard;
    }

    if (type == "interview") {
      sessionStorage.setItem("interviewRedirection", pathConstants.dashboard);
      window.location.href = `/interview/${interview.interviewID}`;
    }
  }

  function handleRemoveFile(e) {
    e.stopPropagation();
    e.target.value = "";

    setFile(null);
    setHasChanges(false);
    setUserCV(null);

    const storedCV = localStorage.getItem("userCV");

    if (storedCV != "null") {
      setDigitalCV(storedCV);
    } else {
      setDigitalCV(null);
    }
  }

  function handleReviewCV() {
    const parsedUserCV = JSON.parse(digitalCV);
    const formattedCV = {};

    cvSections.forEach((section, index) => {
      formattedCV[section] = parsedUserCV.digitalCV[index].content.trim() || "";
    });

    setFile(parsedUserCV.fileInfo);
    setUserCV(formattedCV);
  }

  function handleUploadCV() {
    fileInputRef.current.click();
  }

  function processState(index, forSeparator = false) {
    const currentStepIndex = step.indexOf(currentStep);

    // For completed steps
    if (currentStepIndex > index) {
      return stepStatus[0]; // "Completed"
    }

    // For current step
    if (currentStepIndex == index) {
      // For separators (progress bars between steps)
      if (forSeparator) {
        // Separator 1 (Submit CV → Pre-screening)
        if (index === 0) {
          // 50% when CV is being shown/edited, 0% otherwise
          return userCV || buildingCV ? "In Progress Half" : stepStatus[1];
        }

        // Separator 2 (Pre-screening → Review)
        if (index === 1) {
          // 50% if questions are validated, 0% otherwise
          return arePreScreeningQuestionsValid() ? "In Progress Half" : stepStatus[1];
        }

        // Default for other separators
        return stepStatus[1]; // "Pending"
      }

      // For step icons - always show in progress
      return stepStatus[2]; // "In Progress"
    }

    // For future steps
    return stepStatus[1]; // "Pending"
  }

  useEffect(() => {
    const storedSelectedCareer = sessionStorage.getItem("selectedCareer");
    const storedCV = localStorage.getItem("userCV");

    if (storedCV && storedCV != "null") {
      setDigitalCV(storedCV);
    }

    if (storedSelectedCareer) {
      const parseStoredSelectedCareer = JSON.parse(storedSelectedCareer);
      fetchInterview(parseStoredSelectedCareer.id);
    } else {
      alert("No application is currently being managed.");
      window.location.href = pathConstants.dashboard;
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("hasChanges", JSON.stringify(hasChanges));
  }, [hasChanges]);

  // Update interview status when CV screening passes
  useEffect(() => {
    if (screeningResult && screeningResult.status === "For AI Interview") {
      setInterview({
        ...interview,
        status: "For AI Interview",
      });
    }
  }, [screeningResult]);

  function fetchInterview(interviewID) {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-interviews",
      data: { email: user.email, interviewID },
    })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.error);
          window.location.href = pathConstants.dashboard;
        } else {
          if (result[0].cvStatus) {
            alert("This application has already been processed.");
            window.location.href = pathConstants.dashboard;
          } else {
            setCurrentStep(step[0]);
            setInterview(result[0]);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        alert("Error fetching existing applied jobs.");
        window.location.href = pathConstants.dashboard;
        console.log(err);
      });
  }

  function handleCVScreen() {
    if (editingCV != null) {
      alert("Please save the changes first.");
      return false;
    }

    const allEmpty = Object.values(userCV).every(
      (value: any) => value.trim() == ""
    );

    if (allEmpty) {
      alert("No details to be save.");
      return false;
    }

    let parsedDigitalCV = {
      errorRemarks: null,
      digitalCV: null,
    };

    if (digitalCV) {
      parsedDigitalCV = JSON.parse(digitalCV);

      if (parsedDigitalCV.errorRemarks) {
        alert(
          "Please fix the errors in the CV first.\n\n" +
            parsedDigitalCV.errorRemarks
        );
        return false;
      }
    }

    setCurrentStep(step[2]);

    if (hasChanges) {
      const formattedUserCV = cvSections.map((section) => ({
        name: section,
        content: userCV[section]?.trim() || "",
      }));

      parsedDigitalCV.digitalCV = formattedUserCV;

      const data = {
        name: user.name,
        cvData: parsedDigitalCV,
        email: user.email,
        fileInfo: null,
      };

      if (file) {
        data.fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
        };
      }

      axios({
        method: "POST",
        url: `/api/whitecloak/save-cv`,
        data,
      })
        .then(() => {
          localStorage.setItem(
            "userCV",
            JSON.stringify({ ...data, ...data.cvData })
          );
        })
        .catch((err) => {
          alert("Error saving CV. Please try again.");
          setCurrentStep(step[0]);
          console.log(err);
        });
    }

    setHasChanges(true);

    // Mock CV screening with simulated API delay
    // setTimeout(() => {
    //   const mockScreeningResult = {
    //     status: "For AI Interview",
    //     applicationStatus: "In Review",
    //     // Alternative outcomes for testing:
    //     // applicationStatus: "Dropped", // For rejection
    //     // status: "For Manual Review", // For manual review
    //   };

    //   setScreeningResult(mockScreeningResult);
    //   setHasChanges(false);
    // }, 3000); // 3 second delay to simulate processing

    // Original API call (commented out for testing)
    axios({
      url: "/api/whitecloak/screen-cv",
      method: "POST",
      data: {
        interviewID: interview.interviewID,
        userEmail: user.email,
      },
    })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.message);
          setCurrentStep(step[0]);
        } else {
          setCurrentStep(step[2]);
          setScreeningResult(result);
        }
      })
      .catch((err) => {
        alert("Error screening CV. Please try again.");
        setCurrentStep(step[0]);
        console.log(err);
      })
      .finally(() => {
        setHasChanges(false);
      });
    
  }

  function handleFileSubmit(file) {
    setBuildingCV(true);
    setHasChanges(true);

    // Mock data for testing
    // const mockDigitalCV = {
    //   errorRemarks: null,
    //   digitalCV: [
    //     { name: "Introduction", content: "Michelle Cruz is a seasoned administrative and operations professional with over 8 years of experience supporting senior executives, coordinating complex projects, and delivering training across diverse industries. She combines strong interpersonal communication skills with a proactive approach to problem-solving and a keen attention to detail." },
    //     { name: "Current Position", content: "**Chief of Staff, White Cloak Technologies, Inc.** (Oct 2023 - Present)\n- Serves as the CEO's trusted advisor, managing calendar, finances, and key client relationships.\n- Drives execution of strategic initiatives, overseeing project timelines, stakeholder communications, and deliverables.\n- Designs executive presentations and leads the company's graphic designer for the Information Security team.\n- Researches and recommends industry events and conferences for the executive team.\n- Takes on special projects as required." },
    //     { name: "Contact Info", content: "- **Name:** Michelle Cruz\n- **Email:** m*********3@gmail.com\n- **Phone:** *********98\n- **Address:** Tanza, Cavite\n- **LinkedIn:** Michelle Cruz\n- **GitHub:** N/A\n- **Twitter:** N/A" },
    //     { name: "Skills", content: "- Microsoft Office (Outlook, Word, Excel, PowerPoint)\n- Google Workspace (Gmail, Docs, Sheets, Forms)\n- Adobe Creative Suite (Photoshop, InDesign, Illustrator)\n- Canva\n- Graphic design\n- Project coordination\n- Interpersonal communication\n- Attention to detail\n- Proactive problem identification\n- Independent decision-making" },
    //     { name: "Experience", content: "**Chief of Staff, White Cloak Technologies, Inc. (Oct 2023 - Present)**\n- Serves as the CEO's trusted advisor, managing calendar, finances, and key client relationships.\n- Drives execution of strategic initiatives, overseeing project timelines, stakeholder communications, and\n- deliverables.\n- Designs executive presentations and leads the company's graphic designer for the Information Security team.\n- Researches and recommends industry events and conferences for the executive team.\n- Takes on special projects as required.\n\n**Executive Assistant, Ernst & Young Global Services Philippines, Inc.** (Apr 2020 - Oct 2023)\n- Provided comprehensive administrative support to senior executives (Partners and Directors) in Australia,\n- including calendar management, expense processing, travel booking, and client relationship management.\n- Acted as the point of contact for the Training Core Team, improving training materials and presentations.\n- Facilitated technical and soft-skill training sessions and one-on-one coaching for new hires.\n- Served as a subject matter resource for calendar and email management and as team POC in the absence of team leads.\n- Received multiple Extra Miler (SPOT) Awards; nominated for Rising Star (2021) and GDS EA of the Year (2023).\n\n**Client and Concierge Analyst, White & Case Global Operations Center Manila LLP** (Nov 2018 - Apr 2020)\n- Operated as the global firm switchboard operator, providing exceptional call handling.\n- Processed room booking requests for the UK, US, and Germany within the Room Reservation System (RRS) team.\n- Collaborated with London Room Bookings and Reception teams as the sole Manila analyst.\n- Assisted with mailbox management and reservation coverage for other locations as needed.\n- Trained new hires on RRS processes, with a focus on the London procedure.\n\n **Technical Assistant, Department of Education - Central Office** (Oct 2015 - Nov 2018)\n- Processed Senior High School (SHS) applications for educational institutions nationwide.\n- Coordinated the online inspection process for Philippine Schools Overseas offering the SHS Program.\n- Organized and executed national trainings, conferences, and competitions hosted by the Department." },
    //     { name: "Education", content: "Bachelor of Arts in Political Science, University of the Philippines Manila" },
    //     { name: "Projects", content: "**E-Commerce Platform** (2022)\n- Built full-stack e-commerce application with React and Node.js\n- Integrated payment processing with Stripe API\n- Deployed on AWS with auto-scaling capabilities\n\n**Task Management App** (2021)\n- Developed real-time collaboration features using Socket.io\n- Implemented authentication and authorization with JWT" },
    //     { name: "Certifications", content: "- EY Business - Basics of Business (Learning Badge), Ernst & Young (Jul 2022)\n- EY Innovation - Design Thinking (Learning Badge), Ernst & Young (Jun 2021)\n- Certified Six Sigma White Belt, AIGPE (Oct 2022)\n- Data Privacy Essentials for All Industries, AmCham Philippines (Sep 2024)" },
    //     { name: "Awards", content: "- Extra Miler (SPOT) Award (multiple times), Ernst & Young Global Services Philippines, Inc.\n- Nominated for Rising Star Award (2021), Ernst & Young Global Services Philippines, Inc.\n- Nominated for GDS EA of the Year Award (2023), Ernst & Young Global Services Philippines, Inc.\n- Finalist, Best Seminar Paper in Political Science, University of the Philippines Manila (A.Y. 2014 - 2015)" }
    //   ],
    //   fileInfo: {
    //     name: file.name,
    //     size: file.size,
    //     type: file.type
    //   }
    // };

    // Simulate API delay
    // setTimeout(() => {
    //   const result = JSON.stringify(mockDigitalCV);
    //   const parsedUserCV = JSON.parse(result);
    //   const formattedCV = {};

    //   cvSections.forEach((section, index) => {
    //     formattedCV[section] = parsedUserCV.digitalCV[index].content.trim();
    //   });

    //   setDigitalCV(result);
    //   setUserCV(formattedCV);
    //   setBuildingCV(false);
    // }, 2000);

    // Original API call (commented out for testing)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fName", file.name);
    formData.append("userEmail", user.email);

    axios({
      method: "POST",
      url: `${CORE_API_URL}/upload-cv`,
      data: formData,
    })
      .then((res) => {
        axios({
          method: "POST",
          url: `/api/whitecloak/digitalize-cv`,
          data: { chunks: res.data.cvChunks },
        })
          .then((res) => {
            const result = res.data.result;
            const parsedUserCV = JSON.parse(result);
            const formattedCV = {};

            cvSections.forEach((section, index) => {
              formattedCV[section] =
                parsedUserCV.digitalCV[index].content.trim();
            });

            setDigitalCV(result);
            setUserCV(formattedCV);
          })
          .catch((err) => {
            alert("Error building CV. Please try again.");
            console.log(err);
          })
          .finally(() => {
            setBuildingCV(false);
          });
      })
      .catch((err) => {
        alert("Error building CV. Please try again.");
        setBuildingCV(false);
        console.log(err);
      });
  }

  return (
    <>
      {loading && <Loader loaderData={""} loaderType={""} />}

      {interview && (
        <div className={styles.uploadCVContainer}>
          <div className={styles.uploadCVHeader}>
            {interview.organization && interview.organization.image && (
              <img alt="" src={interview.organization.image} />
            )}
            <div className={styles.textContainer}>
              <span className={styles.tag}>You're applying for</span>
              <span className={styles.title}>{interview.jobTitle}</span>
              {interview.organization && interview.organization.name && (
                <span className={styles.name}>
                  {interview.organization.name}
                </span>
              )}
              <span className={styles.description} onClick={handleModal}>
                View job description
              </span>
            </div>
          </div>

          <div className={styles.stepContainer}>
            <div className={styles.step}>
              {step.map((_, index) => (
                <div className={styles.stepBar} key={index}>
                  <img
                    alt=""
                    src={
                      assetConstants[
                        processState(index, false)
                          .toLowerCase()
                          .replace(" ", "_")
                      ]
                    }
                  />
                  {index < step.length - 1 && (
                    <hr
                      className={
                        styles[
                          processState(index, true)
                            .toLowerCase()
                            .replace(/ /g, "_")
                        ]
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.step}>
              {step.map((item, index) => (
                <span
                  className={`${styles.stepDetails} ${
                    styles[
                      processState(index, false)
                        .toLowerCase()
                        .replace(" ", "_")
                    ]
                  }`}
                  key={index}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {currentStep == step[0] && (
            <>
              {!buildingCV && !userCV && !file && (
                <div className={styles.cvManageContainer}>
                  <div
                    className={styles.cvContainer}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <img alt="" src={assetConstants.uploadV2} />
                    <button onClick={handleUploadCV}>Upload CV</button>
                    <span>
                      Choose or drag and drop a file here. Our AI tools will
                      automatically pre-fill your CV and also check how well it
                      matches the role.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  <div className={styles.cvContainer}>
                    <img alt="" src={assetConstants.review} />
                    <button
                      className={`${digitalCV ? "" : "disabled"}`}
                      disabled={!digitalCV}
                      onClick={handleReviewCV}
                    >
                      Review Current CV
                    </button>
                    <span>
                      Already uploaded a CV? Take a moment to review your
                      details before we proceed.
                    </span>
                  </div>
                </div>
              )}

              {buildingCV && file && (
                <div className={styles.cvDetailsContainer}>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Submit CV
                      </span>
                      <div className={styles.detailsContainer}>
                        <span className={styles.fileTitle}>
                          <img alt="" src={assetConstants.completed} />
                          {file.name}
                        </span>
                        <div className={styles.loadingContainer}>
                          <img alt="" src={assetConstants.loading} />
                          <div className={styles.textContainer}>
                            <span className={styles.title}>
                              Extracting information from your CV...
                            </span>
                            <span className={styles.description}>
                              Jia is building your profile...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!buildingCV && userCV && (
                <div className={styles.cvDetailsContainer}>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Submit CV
                        <div className={styles.editIcon}>
                          <img
                            alt=""
                            src={
                              file ? assetConstants.xV2 : assetConstants.save
                            }
                            onClick={file ? handleRemoveFile : handleUploadCV}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: "none" }}
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </span>

                      <div className={styles.detailsContainer}>
                        {file ? (
                          <span className={styles.fileTitle}>
                            <img alt="" src={assetConstants.completed} />
                            {file.name}
                          </span>
                        ) : (
                          <span className={styles.fileTitle}>
                            <img alt="" src={assetConstants.fileV2} />
                            You can also upload your CV and let our AI
                            automatically fill in your profile information.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {cvSections.map((section, index) => (
                    <div key={index} className={styles.gradient}>
                      <div className={styles.cvDetailsCard}>
                        <span className={styles.sectionTitle}>
                          {section}

                          <div className={styles.editIcon}>
                            <img
                              alt=""
                              src={
                                editingCV == section
                                  ? assetConstants.save
                                  : assetConstants.edit
                              }
                              onClick={() =>
                                handleEditCV(
                                  editingCV == section ? null : section
                                )
                              }
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        </span>

                        <div className={styles.detailsContainer}>
                          {editingCV == section ? (
                            <textarea
                              id={section}
                              placeholder="Upload your CV to auto-fill this section."
                              value={
                                userCV && userCV[section] ? userCV[section] : ""
                              }
                              onBlur={(e) => {
                                e.target.placeholder =
                                  "Upload your CV to auto-fill this section.";
                              }}
                              onChange={(e) => {
                                setUserCV({
                                  ...userCV,
                                  [section]: e.target.value,
                                });
                                setHasChanges(true);
                              }}
                              onFocus={(e) => {
                                e.target.placeholder = "";
                              }}
                            />
                          ) : (
                            <span
                              className={`${styles.sectionDetails} ${
                                userCV &&
                                userCV[section] &&
                                userCV[section].trim()
                                  ? styles.withDetails
                                  : ""
                              }`}
                            >
                              <Markdown>
                                {userCV &&
                                userCV[section] &&
                                userCV[section].trim()
                                  ? userCV[section].trim()
                                  : "Upload your CV to auto-fill this section."}
                              </Markdown>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setCurrentStep(step[1])}>Continue</button>
                </div>
              )}
            </>
          )}

          {currentStep == step[1] && (
            <div className={styles.preScreeningContainer}>
              <div className={styles.preScreeningHeader}>
                <h2>Quick Pre-screening</h2>
                <p>
                  Just a few short questions to help your recruiters assess you
                  faster. Takes less than a minute.
                </p>
              </div>

              <div className={styles.questionsWrapper}>
                {getFlattenedQuestions().map((question, index) => (
                  <div key={question.id} className="prescreening-question-card">
                    <div className="prescreening-question-middle">
                      <h3 className={styles.prescreeningQuestion}>{question.question}</h3>
                      <div className="prescreening-question-inner">

                        {/* Dropdown */}
                        {question.type === "dropdown" && (
                          <select
                            value={preScreeningAnswers[question.id] || ""}
                            onChange={(e) =>
                              setPreScreeningAnswers({
                                ...preScreeningAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                          >
                            <option value="">Select an option</option>
                            {question.options?.map((option, i) => (
                              <option key={i} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Checkboxes */}
                        {question.type === "checkboxes" && (
                          <div className="checkbox-group">
                            {question.options?.map((option, i) => (
                              <label key={i}>
                                <input
                                  type="checkbox"
                                  checked={
                                    preScreeningAnswers[question.id]?.includes(
                                      option
                                    ) || false
                                  }
                                  onChange={(e) => {
                                    const current =
                                      preScreeningAnswers[question.id] || [];
                                    const updated = e.target.checked
                                      ? [...current, option]
                                      : current.filter((item) => item !== option);
                                    setPreScreeningAnswers({
                                      ...preScreeningAnswers,
                                      [question.id]: updated,
                                    });
                                  }}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Range (Salary) */}
                        {question.type === "range" && (
                          <div className="range-input-group">
                            <div className="range-input-field">
                              <label>Minimum Salary</label>
                              <div className="salary-input-wrapper">
                                <span className="currency-symbol">
                                  {question.currency === "USD" ? "$" : "₱"}
                                </span>
                                <input
                                  type="number"
                                  placeholder={
                                    question.rangeMin?.toLocaleString() || "40,000"
                                  }
                                  value={
                                    preScreeningAnswers[question.id]?.min || ""
                                  }
                                  onChange={(e) =>
                                    setPreScreeningAnswers({
                                      ...preScreeningAnswers,
                                      [question.id]: {
                                        ...(preScreeningAnswers[question.id] || {}),
                                        min: e.target.value,
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="range-input-field">
                              <label>Maximum Salary</label>
                              <div className="salary-input-wrapper">
                                <span className="currency-symbol">
                                  {question.currency === "USD" ? "$" : "₱"}
                                </span>
                                <input
                                  type="number"
                                  placeholder={
                                    question.rangeMax?.toLocaleString() || "55,000"
                                  }
                                  value={
                                    preScreeningAnswers[question.id]?.max || ""
                                  }
                                  onChange={(e) =>
                                    setPreScreeningAnswers({
                                      ...preScreeningAnswers,
                                      [question.id]: {
                                        ...(preScreeningAnswers[question.id] || {}),
                                        max: e.target.value,
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Short Answer */}
                        {question.type === "short-answer" && (
                          <input
                            type="text"
                            placeholder="Your answer"
                            value={preScreeningAnswers[question.id] || ""}
                            onChange={(e) =>
                              setPreScreeningAnswers({
                                ...preScreeningAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                          />
                        )}

                        {/* Long Answer */}
                        {question.type === "long-answer" && (
                          <textarea
                            placeholder="Your answer"
                            rows={4}
                            value={preScreeningAnswers[question.id] || ""}
                            onChange={(e) =>
                              setPreScreeningAnswers({
                                ...preScreeningAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={styles.continueButton}
                onClick={handlePreScreeningContinue}
              >
                Continue
                <i className="la la-arrow-right"></i>
              </button>
            </div>
          )}

          {currentStep == step[2] && !screeningResult && (
            <div className={styles.cvScreeningContainer}>
              <img alt="" src={assetConstants.loading} />
              <span className={styles.title}>Sit tight!</span>
              <span className={styles.description}>
                Our smart reviewer is checking your qualifications.
              </span>
              <span className={styles.description}>
                We'll let you know what's next in just a moment.
              </span>
            </div>
          )}

          {currentStep == step[2] && screeningResult && (
            <div className={styles.cvResultContainer}>
              {screeningResult.applicationStatus == "Dropped" ? (
                <>
                  <img alt="" src={assetConstants.userRejected} />
                  <span className={styles.title}>
                    This role may not be the best match.
                  </span>
                  <span className={styles.description}>
                    Based on your CV, it looks like this position might not be
                    the right fit at the moment.
                  </span>
                  <br />
                  <span className={styles.description}>
                    Review your screening results and see recommended next
                    steps.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : screeningResult.status == "For AI Interview" ? (
                <>
                  <img alt="" src={assetConstants.checkV3} />
                  <span className={styles.title}>
                    Hooray! You’re a strong fit for this role.
                  </span>
                  <span className={styles.description}>
                    Jia thinks you might be a great match.
                  </span>
                  <br />
                  <span className={`${styles.description} ${styles.bold}`}>
                    Ready to take the next step?
                  </span>
                  <span className={styles.description}>
                    You may start your AI interview now.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("interview")}>
                      Start AI Interview
                    </button>
                    <button
                      className="secondaryBtn"
                      onClick={() => handleRedirection("dashboard")}
                    >
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img alt="" src={assetConstants.userCheck} />
                  <span className={styles.title}>
                    Your CV is now being reviewed by the hiring team.
                  </span>
                  <span className={styles.description}>
                    We’ll be in touch soon with updates about your application.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
