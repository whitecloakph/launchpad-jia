"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import axios from "axios";
import { errorToast, loadingToast, successToast } from "@/lib/Utils";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Markdown from "react-markdown";
import RVRadialCharts from "@/lib/components/RVRadialCharts";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import ScoreMetricsAccordion from "@/lib/components/AnalysisComponents/ScoreMetricsAccordion";
import JobFitBadge from "@/lib/components/AnalysisComponents/JobFitBadge";
import CardTypingLoader from "@/lib/components/AnalysisComponents/CardTypingLoader";
import moment from "moment";
import FeedbackSection from "@/lib/PageComponent/FeedbackSection";
import RetakeInterviewRequest from "@/lib/components/AnalysisComponents/RetakeInterviewRequest";

// Add window interface extension
declare global {
  interface Window {
    interviewObjID: string;
  }
}

export default function Dashboard() {
  // Get user data from AppContext
  const { user, orgID } = useAppContext();
  const [status, setStatus] = useState("");
  const [overallScore, setOverAllScore] = useState(0);
  const [transcripts, setTranscripts] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [summary, setSummary] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [interviewRecording, setInterviewRecording] = useState(null);

  const { slug } = useParams();

  const statusSet = [
    {
      name: "For Interview",
      iconClass: "text-primary",
    },
    {
      name: "For Review",
      iconClass: "text-warning",
    },
    {
      name: "Accepted",
      iconClass: "text-success",
    },
    {
      name: "Rejected",
      iconClass: "text-danger",
    },
  ];

  function updateInterview(id, data) {
    loadingToast("Updating Interview, please wait...");
    axios
      .post("/api/update-interview", {
        uid: id,
        data: data,
      })
      .then((res) => {
        successToast("Interview updated successfully", 1300);

        setTimeout(() => {
          toast.dismiss();
        }, 800);
      })
      .catch((err) => {
        console.log(err);
        errorToast("Failed to update interview", 1300);

        setTimeout(() => {
          toast.dismiss();
        }, 800);
      });
  }

  function updateStatus(status) {
    updateInterview(interviewDetails._id, {
      status: status,
    });
    setStatus(status);
  }

  async function generateAnalysis(trData, details) {
    setAnalysis(null);

    let intSummary = "";

    trData.forEach((msg) => {
      intSummary += `${msg.type === user ? "interviewer" : "applicant"}: ${
        msg.content
      }\n`;
    });

    let llmPrompt = `
    You are a helpful assistant that can answer questions and help with tasks.
    Take the Job details and interview transcript and create an analysis based on the processing instructions.

    Job Details:
      Applicant Name: ${details.name}
      Job Title: ${details.jobTitle}
      Job Description: 
      ${details.jobDescription}

    Interview Transcript:
    ${intSummary}

    ${analysisPrompt}
    `;

    const response = await axios
      .post("/api/llm-reasoner", {
        corePrompt: llmPrompt,
      })
      .then((res) => {
        return res.data.result;
      });

    let codeOuput: any = {};

    try {
      codeOuput = JSON.parse(
        response.replace("```json", "").replace("```", "")
      );
      console.log(codeOuput);

      // save analysis
      updateInterview(details._id, {
        analysis: codeOuput,
        score: codeOuput.overall_score,
        jobFit: codeOuput.final_assessment,
      });

      setTimeout(() => {
        setOverAllScore(codeOuput.overall_score);
      }, 500);
    } catch (err) {
      console.log(err);
      errorToast("Failed to generate analysis, please try again later", 1300);
    }

    setAnalysis(codeOuput);
  }

  async function createSummary(trData, details) {
    setSummary("");
    let intSummary = "";

    trData.forEach((msg) => {
      intSummary += `${msg.type === user ? "interviewer" : "applicant"}: ${
        msg.content
      }`;
    });

    let llmPrompt = `
    You are a helpful assistant that can answer questions and help with tasks.
    Take the Job details and interview transcript and create a summary of the interview.
  
    Job Details:
      Applicant Name: ${details.name}
      Job Title: ${details.jobTitle}
      Job Description: ${details.jobDescription}

    Interview Transcript:
    ${intSummary}

    ${summaryPrompt}
    `;

    const response = await axios
      .post("/api/llm-reasoner", {
        corePrompt: llmPrompt,
      })
      .then((res) => {
        return res.data.result;
      });

    let formattedSummary = response
      .replace("```markdown", "")
      .replace("```", "");

    // save summary
    updateInterview(details._id, {
      summary: formattedSummary,
    });

    setSummary(formattedSummary);
  }

  async function fetchTranscripts(interviewID, details) {
    axios
      .post("/api/fetch-transcript", {
        id: interviewID,
      })
      .then((res) => {
        console.log(res.data);

        if (!details.analysis) {
          generateAnalysis(res.data, details);
        }

        if (!details.summary) {
          createSummary(res.data, details);
        }

        setTranscripts(res.data);
      });
  }

  async function finishUpload(interviewData: any) {
    axios.post("/api/finish-upload", {
      uploadId: interviewData.interviewUpload.uploadId,
      parts: interviewData.interviewParts,
      fileName: interviewData.interviewUpload.key,
      filetype: interviewData.interviewUpload.filetype,
      uid: interviewData._id,
    }).then((res) => {
      // Update state
      setInterviewRecording({
        filename: interviewData.interviewUpload.key,
        filetype: interviewData.interviewUpload.filetype,
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  async function fetchData(id: string) {
    loadingToast("Loading, please wait...");

    const configData = await axios
      .post("/api/fetch-global-settings", {
        fields: { summary_prompt: 1, analysis_prompt: 1 },
      })
      .then((res) => {
        return res.data;
      });

    setSummaryPrompt(configData.summary_prompt.prompt);
    setAnalysisPrompt(configData.analysis_prompt.prompt);

    try {
      const response = await axios.post("/api/interview-details", {
        id: id,
        orgID,
      });
      window.interviewObjID = response.data._id;

      if (!response.data?.interviewRecording && response.data?.interviewUpload && response.data?.interviewParts?.length > 0) {
        finishUpload(response.data);
      }

      setInterviewDetails(response.data);
      if (response.data.interviewRecording) {
        setInterviewRecording(response.data.interviewRecording);
      }

      if (response.data.analysis) {
        setAnalysis(response.data.analysis);

        setTimeout(() => {
          setOverAllScore(response.data.analysis.overall_score);
        }, 500);
      }

      if (response.data.summary) {
        setSummary(response.data.summary);
      }

      setStatus(response.data.status);

      toast.dismiss();
    } catch (err) {
      errorToast("Interview not found", 1500);
      setTimeout(() => {
        window.location.href = "/dashboard/interviews";
      }, 1500);
    }
  }

  // Fetch feedback for this interview
  useEffect(() => {
    async function fetchFeedback() {
      if (!interviewDetails?.interviewID) return;
      try {
        const res = await axios.post("/api/fetch-feedback", {
          orgID,
        });
        // Find feedback for this interviewID
        const fb = res.data.find(
          (item) => item.interviewID === interviewDetails.interviewID
        );
        setFeedback(fb || null);
      } catch (err) {
        setFeedback(null);
      }
    }
    if (interviewDetails) {
      fetchFeedback();
    }
  }, [interviewDetails]);

  useEffect(() => {
    if (slug && orgID) {
      // Handle slug if it's an array or string
      const slugValue = Array.isArray(slug) ? slug[0] : slug;

      fetchData(slugValue);
    }
  }, [slug, orgID]);

  useEffect(() => {
    if (interviewDetails) {
      fetchTranscripts(interviewDetails.interviewID, interviewDetails);
    }
  }, [interviewDetails]);

  async function deleteInterview() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleting Interview...",
          text: "Please wait while we delete the Interview...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await axios.post("/api/delete-interview", {
            id: interviewDetails._id,
          });

          if (response.data.success) {
            Swal.fire({
              title: "Deleted!",
              text: "The interview has been deleted.",
              icon: "success",
              allowOutsideClick: false,
            }).then(() => {
              window.location.href = "/dashboard/interviews";
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.error || "Failed to delete the Interview",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error deleting Interview:", error);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the Interview",
            icon: "error",
          });
        }
      }
    });
  }

  async function resetInterviewData() {
    Swal.fire({
      title: "Are you sure?",
      text: "Resetting all interview data, this action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reset Interview Data",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Resetting Interview Data...",
          text: "Please wait while we reset the Interview Data...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await axios.post("/api/reset-interview-data", {
            id: interviewDetails._id,
          });

          if (response.data.success) {
            Swal.fire({
              title: "Reset!",
              text: "The interview data has been reset.",
              icon: "success",
              allowOutsideClick: false,
            }).then(() => {
              Swal.close();
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.error || "Failed to reset the Interview",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error deleting Interview:", error);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the Interview",
            icon: "error",
          });
        }
      }
    });
  }

  function regenInsights() {
    let btnAnalysis = document.getElementById("regen-analysis");
    let btnSummary = document.getElementById("regen-summary");

    if (btnAnalysis) {
      btnAnalysis.click();
    }

    if (btnSummary) {
      btnSummary.click();
    }
  }

  return (
    <>
      <AuthGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Manage Interview | Jia - WhiteCloak Technologies</title>
        <Sidebar activeLink="Interviews" />

        {/* Main content */}
        <div className="main-content" id="panel">
          {/* Topnav */}
          <NavBar />
          {/* Header */}
          <div className="header gradient-1 pb-7">
            <div className="container-fluid">
              <div className="header-body">
                <div className="row align-items-center py-4">
                  <div className="col-lg-6 col-7">
                    <h6 className="h2 text-white d-inline-block mb-0">
                      Manage Interview
                    </h6>
                    <nav
                      aria-label="breadcrumb"
                      className="d-none d-md-inline-block ml-md-4"
                    >
                      <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <i className="fas fa-home"></i>
                          </a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="/dashboard">Dashboard</a>
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Page content */}
          <div className="container-fluid mt--6">
            <div className="thread-set">
              <div className="left-thread">
                {interviewDetails?.retakeRequest && (
                  <RetakeInterviewRequest data={interviewDetails} />
                )}

                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-list text-primary mr-2" /> Interview
                      Analysis
                    </h3>

                    <button
                      className="btn btn-default"
                      onClick={() => {
                        generateAnalysis(transcripts, interviewDetails);
                      }}
                      id="regen-analysis"
                    >
                      <span>
                        <i className="la la-refresh text-info mr-2"></i>{" "}
                        Regenerate Analysis
                      </span>
                    </button>
                  </div>

                  <div className="card-body">
                    {!analysis && (
                      <CardTypingLoader
                        title="Generating Analysis..."
                        notesArray={[
                          "Loading: JIA is Generating AI Analysis...",
                          400,
                          "Loading: Creating Score Charts....",
                          400,
                          "Loading: Reviewing Interview Transcripts....",
                          400,
                          "Working: Checking Metrics... Technical.. Behavioral..",
                          400,
                          "Working: Checking Metrics... Communication... Analytical...",
                          400,
                        ]}
                      />
                    )}

                    {analysis && (
                      <>
                        <h1 className="fade-in-bottom dl-2">
                          <i className="la la-angle-right text-primary" />{" "}
                          {interviewDetails.jobTitle}
                        </h1>
                        <div className="progress-block">
                          <div className="section-header mt-2">
                            <strong>
                              <i className="la la-square text-primary" />{" "}
                              Overall Score:
                              <span className="ml-2">
                                {analysis.overall_score}%
                              </span>
                            </strong>

                            <div
                              className="score-progress progress"
                              style={{ height: "12px" }}
                            >
                              <div
                                className="bar bg-gradient-info"
                                style={{
                                  width: `${overallScore}%`,
                                  transition: "1.2s",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <JobFitBadge data={analysis} />
                        <div className="section-header mt-2">
                          <strong>
                            <i className="la la-cubes text-primary" /> Applicant
                            Qualities Breakdown
                          </strong>
                          <i className="la la-bars" />
                        </div>
                        <div className="mx-auto">
                          <RVRadialCharts data={analysis.breakdown} />
                        </div>
                        <ScoreMetricsAccordion data={analysis.breakdown} />
                      </>
                    )}
                  </div>
                </div>

                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-cubes text-primary mr-2" /> Interview
                      Summary
                    </h3>

                    <button
                      className="btn btn-default"
                      onClick={() => {
                        createSummary(transcripts, interviewDetails);
                      }}
                      id="regen-summary"
                    >
                      <span>
                        <i className="la la-refresh text-info mr-2"></i>{" "}
                        Regenerate Summary
                      </span>
                    </button>
                  </div>

                  <div className="card-body interview-summary">
                    {!summary && (
                      <CardTypingLoader
                        title="Generating Summary..."
                        notesArray={[
                          "Working on Generating the Interview Summary...",
                          400,
                          "Reading Applicant Transcript line by line...",
                          400,
                          ".....Analyzing Answers for interview Questions..",
                          400,
                          "Working: Understanding Conversation Flow....",
                          400,
                          "Working: Checking Metrics... Communication... Analytical...",
                          400,
                        ]}
                      />
                    )}
                    {summary && <Markdown>{summary}</Markdown>}
                  </div>
                </div>

                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-file-text text-primary mr-2" />{" "}
                      Interview Transcript
                    </h3>

                    {transcripts && transcripts.length > 0 && (
                      <span>
                        <i className="la la-clock text-primary" /> Interview
                        Duration:{" "}
                        <strong>
                          {(() => {
                            const startTime = new Date(transcripts[0].time);
                            const endTime = new Date(
                              transcripts[transcripts.length - 1].time
                            );
                            const durationMs =
                              endTime.getTime() - startTime.getTime();
                            const minutes = Math.floor(durationMs / 60000);
                            const seconds = Math.floor(
                              (durationMs % 60000) / 1000
                            );
                            return `${minutes}m ${seconds}s`;
                          })()}
                        </strong>
                      </span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="live-transcript">
                      {!transcripts && (
                        <>
                          <CardTypingLoader
                            title="Loading Transcript..."
                            notesArray={[
                              "Checking database for interview transcript...",
                              400,
                              "Please wait...",
                              400,
                            ]}
                          />
                        </>
                      )}

                      {transcripts && transcripts.length === 0 && (
                        <>
                          <h2>
                            <i className="la la-list text-muted" /> No
                            Transcript Available.
                          </h2>
                        </>
                      )}

                      <ul>
                        {transcripts &&
                          transcripts.length > 0 &&
                          transcripts.map((msg, idx) => {
                            return (
                              <React.Fragment key={idx}>
                                <li
                                  key={idx}
                                  className={`fade-in-bottom ${
                                    msg.type === "user" ? "user" : "bot"
                                  }`}
                                >
                                  <strong>
                                    {msg.type === "user"
                                      ? `${
                                          interviewDetails
                                            ? interviewDetails.name
                                            : "Applicant"
                                        }`
                                      : "Jia"}
                                    :
                                  </strong>{" "}
                                  {msg.content}
                                </li>
                                <div className="tr-time mt--2 mb-3 fade-in-bottom">
                                  <small>
                                    <i className="la la-square text-primary" />{" "}
                                    <i className="la la-clock" />{" "}
                                    {moment(msg.time).format("hh:mm A")}
                                  </small>

                                  <div className="line-div"></div>
                                  <small
                                    title={
                                      "Amout of time from the last message"
                                    }
                                  >
                                    <i className="la la-square text-primary" />{" "}
                                    <i className="la la-clock" />{" "}
                                    {idx > 0
                                      ? (() => {
                                          const duration = moment.duration(
                                            moment(msg.time).diff(
                                              moment(transcripts[idx - 1].time)
                                            )
                                          );
                                          const seconds = duration.asSeconds();
                                          const minutes = Math.floor(
                                            seconds / 60
                                          );
                                          return seconds >= 60
                                            ? `${minutes}m ${(
                                                seconds -
                                                minutes * 60
                                              ).toFixed(1)}s`
                                            : `${seconds.toFixed(1)}s`;
                                        })()
                                      : "0.0s"}
                                  </small>
                                </div>
                              </React.Fragment>
                            );
                          })}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Interview Recording */}
                {interviewRecording && (
                  <div className="card shadow-1">
                    <div className="card-header">
                      <h3 className="mb-0 mr-auto">
                        <i className="la la-file-text text-primary mr-2" />{" "}
                        {interviewRecording.filetype.includes(
                          "audio"
                        )
                          ? "Audio Recording"
                          : "Video Recording"}
                      </h3>
                    </div>

                    {/* Audio/Video Player */}
                    <div className="card-body">
                      {interviewRecording.filetype.includes(
                        "audio"
                      ) ? (
                        <audio
                          style={{ width: "100%" }}
                          className="shadow-sm"
                          preload="auto"
                          controls
                          onError={(e) => {
                            console.error("Audio playback error:", e);
                          }}
                        >
                          <source
                            src={`https://cdn.hellojia.ai/${interviewRecording.filename}`}
                            type={interviewRecording.filetype}
                          />
                        </audio>
                      ) : (
                        <video
                          preload="metadata"
                          controls
                          src={`https://cdn.hellojia.ai/${interviewRecording.filename}`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="right-thread">
                <div className="top-card">
                  <div className="card shadow-1 ">
                    <div className="card-header">
                      <h3 className="mb-0 mr-auto">
                        <i className="la la-edit text-primary mr-2" />{" "}
                        Application Information
                      </h3>

                      <i className="la la-bars text-primary mr-2" />
                    </div>

                    <div className="card-body">
                      {interviewDetails && (
                        <div className="profile-info">
                          <AvatarImage
                            className="avatar"
                            alt="Avatar"
                            src={interviewDetails.image}
                          />

                          <div className="app-info">
                            <strong>{interviewDetails.name}</strong>
                            <small>
                              <i className="la la-square text-primary"> </i>{" "}
                              Applicant | {interviewDetails.email}
                            </small>
                          </div>
                        </div>
                      )}

                      <div className="section-header">
                        <strong>
                          <i className="la la-cube text-primary" /> Set
                          Interview Status:
                        </strong>

                        <i className=" la la-bars" />
                      </div>

                      <button
                        className={`btn ${
                          status === "Rejected" ? " btn-danger" : ""
                        }

                        ${status === "Accepted" ? " btn-success" : ""}
                        `}
                      >
                        <i className="la la-square text-info"></i> Current
                        Status: {status}
                      </button>

                      <div className="form-group">
                        <select
                          className="form-control"
                          value={status}
                          onChange={(e) => {
                            updateStatus(e.target.value);
                          }}
                        >
                          {interviewDetails &&
                            statusSet.map((x: any, idx: number) => {
                              return (
                                <option key={idx} value={x.name}>
                                  {x.name}
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      <button
                        className="btn btn-muted mb-3 btn-action"
                        onClick={() => {
                          regenInsights();
                        }}
                      >
                        <i className="la la-first-order la-2x text-primary"></i>{" "}
                        <span> Regenerate AI Insights</span>
                      </button>
                    </div>
                  </div>
                  {/* Feedback Section */}
                  {feedback && <FeedbackSection feedback={feedback} />}
                  {/* Feedback Section */}
                  <div className="card shadow-1 mt-4">
                    <div className="card-header">
                      <h3 className="mb-0 mr-auto">
                        <i className="la la-edit text-primary mr-2" /> Advanced
                        Settings
                      </h3>

                      <i className="la la-bars text-primary mr-2" />
                    </div>

                    <div className="card-body">
                      <small className="text-black">
                        <i className="la la-exclamation-triangle text-danger"></i>{" "}
                        Be Careful, This Action cannot be undone. Trigger the
                        button below to delete the interview transcript and set
                        the status to "For Interview".
                      </small>
                      <button
                        className="btn btn-default"
                        onClick={() => {
                          resetInterviewData();
                        }}
                      >
                        <i className="la la-refresh text-warning"></i> Reset
                        Interview Data
                      </button>

                      <small className="text-black">
                        <i className="la la-exclamation-triangle text-danger"></i>{" "}
                        Be Careful, This Action cannot be undone.
                      </small>
                      <button
                        className="btn btn-default"
                        onClick={() => {
                          deleteInterview();
                        }}
                      >
                        <i className="la la-trash text-danger"></i> Delete this
                        Interview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="footer pt-0 mt-7">
              <div className="row align-items-center justify-content-lg-between">
                <div className="col-lg-6">
                  <div className="copyright text-center text-lg-left text-muted">
                    © {new Date().getFullYear()}{" "}
                    <a
                      href="https://www.whitecloak.com"
                      className="font-weight-bold ml-1"
                      target="_blank"
                    >
                      WhiteCloak Technologies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
