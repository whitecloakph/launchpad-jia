// TODO (Job Portal) - Check API
// Upload CV Component with Pre-Screening Questions and AI Screening
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

export default function UploadCVWithPreScreening() {
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
  const [aiScreeningResult, setAiScreeningResult] = useState(null);
  
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
  
  const step = [
    "Submit CV",
    "CV Screening",
    "Pre-Screening Questions",
    "AI Screening",
    "Review Next Steps"
  ];
  const stepStatus = ["Completed", "Pending", "In Progress"];

  // ============================================
  // HANDLERS - File Management
  // ============================================
  
  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files);
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

  function handleUploadCV() {
    fileInputRef.current.click();
  }

  function handleFileSubmit(file) {
    setBuildingCV(true);
    setHasChanges(true);

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
              formattedCV[section] = parsedUserCV.digitalCV[index].content.trim();
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

  // ============================================
  // HANDLERS - CV Management
  // ============================================

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

  function handleReviewCV() {
    const parsedUserCV = JSON.parse(digitalCV);
    const formattedCV = {};

    cvSections.forEach((section, index) => {
      formattedCV[section] = parsedUserCV.digitalCV[index].content.trim() || "";
    });

    setFile(parsedUserCV.fileInfo);
    setUserCV(formattedCV);
  }

  // ============================================
  // HANDLERS - Pre-Screening Questions
  // ============================================

  function handlePreScreeningAnswer(questionId, value) {
    setPreScreeningAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  }

  function handleMultipleChoiceToggle(questionId, answerId) {
    const current = preScreeningAnswers[questionId] || [];
    const newValue = current.includes(answerId)
      ? current.filter(id => id !== answerId)
      : [...current, answerId];
    
    setPreScreeningAnswers(prev => ({
      ...prev,
      [questionId]: newValue
    }));
  }

  // ============================================
  // HANDLERS - Navigation & UI
  // ============================================

  function handleModal() {
    setModalType("jobDescription");
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

  // ============================================
  // API CALLS - Screening & Submission
  // ============================================

  async function handleCVScreen() {
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

    setCurrentStep(step[1]);

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

      await axios({
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

    await axios({
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
          setScreeningResult(result);
          
          // Check if there are pre-screening questions
          if (interview.preScreeningQuestions && interview.preScreeningQuestions.length > 0) {
            setCurrentStep(step[2]); // Move to Pre-Screening Questions
          } else {
            setCurrentStep(step[4]); // Skip to Review Next Steps
          }
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

  async function handleSubmitPreScreening() {
    // Validate all questions are answered
    const unanswered = interview.preScreeningQuestions.filter(q => {
      const answer = preScreeningAnswers[q.id];
      return !answer || (Array.isArray(answer) && answer.length === 0) || answer === "";
    });

    if (unanswered.length > 0) {
      alert("Please answer all questions before proceeding.");
      return;
    }

    setCurrentStep(step[3]); // Move to AI Screening

    // Call AI screening API
    try {
      const response = await axios({
        method: "POST",
        url: "/api/whitecloak/ai-screening",
        data: {
          interviewID: interview.interviewID,
          userEmail: user.email,
          preScreeningAnswers: preScreeningAnswers
        }
      });

      const result = response.data;
      
      if (result.error) {
        alert(result.message);
        setCurrentStep(step[2]);
        return;
      }

      setAiScreeningResult(result);
      setCurrentStep(step[4]); // Move to Review Next Steps
    } catch (error) {
      console.error("AI Screening error:", error);
      alert("Error during AI screening. Please try again.");
      setCurrentStep(step[2]);
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function processState(index, isAdvance = false) {
    const currentStepIndex = step.indexOf(currentStep);

    if (currentStepIndex == index) {
      if (index == stepStatus.length - 1) {
        return stepStatus[0];
      }
      return isAdvance || userCV || buildingCV ? stepStatus[2] : stepStatus[1];
    }

    if (currentStepIndex > index) {
      return stepStatus[0];
    }

    return stepStatus[1];
  }

  function renderPreScreeningQuestion(question) {
    const answer = preScreeningAnswers[question.id];

    switch (question.questionFormat) {
      case "Dropdown":
        return (
          <select
            value={answer || ""}
            onChange={(e) => handlePreScreeningAnswer(question.id, e.target.value)}
            className="form-control"
            style={{ width: "100%", padding: "12px", borderRadius: "8px" }}
          >
            <option value="">Select an option</option>
            {question.answers?.map(ans => (
              <option key={ans.id} value={ans.value}>{ans.value}</option>
            ))}
          </select>
        );

      case "Range":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="range"
              min={question.minValue}
              max={question.maxValue}
              value={answer || question.minValue}
              onChange={(e) => handlePreScreeningAnswer(question.id, e.target.value)}
              style={{ width: "100%" }}
            />
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 600, color: "#5E72E4" }}>
              {answer || question.minValue} {question.rangeUnit}
            </div>
          </div>
        );

      case "Yes/No":
        return (
          <div style={{ display: "flex", gap: 12 }}>
            {["Yes", "No"].map(option => (
              <button
                key={option}
                onClick={() => handlePreScreeningAnswer(question.id, option)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: answer === option ? "2px solid #5E72E4" : "2px solid #E9EAEB",
                  backgroundColor: answer === option ? "#5E72E4" : "#fff",
                  color: answer === option ? "#fff" : "#181D27",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case "Multiple Choice":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {question.answers?.map(ans => {
              const isSelected = (answer || []).includes(ans.id);
              return (
                <button
                  key={ans.id}
                  onClick={() => handleMultipleChoiceToggle(question.id, ans.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: isSelected ? "2px solid #5E72E4" : "2px solid #E9EAEB",
                    backgroundColor: isSelected ? "#F0F3FF" : "#fff",
                    color: "#181D27",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: isSelected ? "2px solid #5E72E4" : "2px solid #D5D7DA",
                    backgroundColor: isSelected ? "#5E72E4" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="white">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontWeight: 500 }}>{ans.value}</span>
                </button>
              );
            })}
          </div>
        );

      case "Text":
        return (
          <textarea
            value={answer || ""}
            onChange={(e) => handlePreScreeningAnswer(question.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="form-control"
            style={{ resize: "vertical", width: "100%", padding: "12px", borderRadius: "8px" }}
          />
        );

      default:
        return null;
    }
  }

  // ============================================
  // EFFECTS
  // ============================================

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

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {loading && <Loader loaderData={""} loaderType={""} />}

      {interview && (
        <div className={styles.uploadCVContainer}>
          {/* Header */}
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

          {/* Step Progress Indicator */}
          <div className={styles.stepContainer}>
            <div className={styles.step}>
              {step.map((_, index) => (
                <div className={styles.stepBar} key={index}>
                  <img
                    alt=""
                    src={
                      assetConstants[
                        processState(index, true)
                          .toLowerCase()
                          .replace(" ", "_")
                      ]
                    }
                  />
                  {index < step.length - 1 && (
                    <hr
                      className={
                        styles[
                          processState(index).toLowerCase().replace(" ", "_")
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
                      processState(index, true).toLowerCase().replace(" ", "_")
                    ]
                  }`}
                  key={index}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* STEP 1: Submit CV */}
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
                  <button onClick={handleCVScreen}>Submit CV</button>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CV Screening */}
          {currentStep == step[1] && (
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

          {/* STEP 3: Pre-Screening Questions */}
          {currentStep == step[2] && interview.preScreeningQuestions && (
            <div className={styles.cvDetailsContainer}>
              <div className={styles.gradient}>
                <div className={styles.cvDetailsCard}>
                  <span className={styles.sectionTitle}>
                    <img alt="" src={assetConstants.account} />
                    Pre-Screening Questions
                  </span>
                  <div className={styles.detailsContainer}>
                    <span className={styles.description} style={{ marginBottom: 16 }}>
                      Please answer the following questions to help us better understand your qualifications.
                    </span>
                  </div>
                </div>
              </div>

              {interview.preScreeningQuestions.map((question, index) => (
                <div key={question.id} className={styles.gradient}>
                  <div className={styles.cvDetailsCard}>
                    <span className={styles.sectionTitle}>
                      {index + 1}. {question.question}
                      <span style={{ color: "#dc3545", marginLeft: 4 }}>*</span>
                    </span>
                    <div className={styles.detailsContainer}>
                      {renderPreScreeningQuestion(question)}
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={handleSubmitPreScreening}>
                Submit Answers
              </button>
            </div>
          )}

          {/* STEP 4: AI Screening */}
          {currentStep == step[3] && (
            <div className={styles.cvScreeningContainer}>
              <img alt="" src={assetConstants.loading} />
              <span className={styles.title}>Analyzing your responses!</span>
              <span className={styles.description}>
                Our AI is evaluating your answers to determine the best fit.
              </span>
              <span className={styles.description}>
                This will only take a moment.
              </span>
            </div>
          )}

          {/* STEP 5: Review Next Steps */}
          {currentStep == step[4] && (
            <div className={styles.cvResultContainer}>
  

              {aiScreeningResult?.status === "For Human Interview" && 
               aiScreeningResult?.aiSettingResult === "Passed" ? (
                <>
                  <img alt="" src={assetConstants.checkV3} />
                  <span className={styles.title}>
                    Congratulations! You're a strong match for this role.
                  </span>
                  <span className={styles.description}>
                    Based on your CV and responses, you're an excellent fit for this position.
                  </span>
                  <br />
                  <span className={`${styles.description} ${styles.bold}`}>
                    Ready to take the next step?
                  </span>
                  <span className={styles.description}>
                    Proceed to the AI interview to continue your application.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button
                      className="secondaryBtn"
                      onClick={() => handleRedirection("dashboard")}
                    >
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : 
              
              aiScreeningResult?.aiSettingResult === "Failed" ? (
                <>
                  <img alt="" src={assetConstants.userRejected} />
                  <span className={styles.title}>
                    This role may not be the best match.
                  </span>
                  <span className={styles.description}>
                    Based on your CV and responses, it looks like this position might not be
                    the right fit at the moment.
                  </span>
                  <br />
                  <span className={styles.description}>
                    Review your screening results and see recommended next steps.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : 
              
              (
                <>
                  <img alt="" src={assetConstants.userCheck} />
                  <span className={styles.title}>
                    Your application is now being reviewed by the hiring team.
                  </span>
                  <span className={styles.description}>
                    We'll be in touch soon with updates about your application.
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
