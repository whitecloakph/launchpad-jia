"use client"
import axios from "axios";
import { useParams } from "next/navigation";
import React,{ useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import Swal from "sweetalert2";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";
import CareerFit from "@/lib/components/CareerComponents/CareerFit";
import CircularProgress from "@/lib/components/CandidateComponents/CircularProgress";
import moment from "moment";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import { candidateActionToast, errorToast, extractInterviewAssessment, getStage, loadingToast, successToast } from "@/lib/Utils";
import { toast } from "react-toastify";
import CandidateModal from "@/lib/components/CandidateComponents/CandidateModal";
import CandidateActionModal from "@/lib/components/CandidateComponents/CandidateActionModal";
import LoadingAnimation from "@/lib/components/Loaders/LoadingAnimation";
import RetakeInterviewRequestV2 from "@/lib/components/CandidateComponents/RetakeInterviewRequestV2";
import { Tooltip } from "react-tooltip";

const breakdownColorScheme = ["#9FCAED", "#CEB6DA", "#EBACC9", "#FCCEC0"];

export default function InterviewAnalysis() {
    const { user, orgID } = useAppContext();
    const { interviewSlug } = useParams();
    const [interview, setInterview] = useState<any>(null);
    const [interviewRecording, setInterviewRecording] = useState<any>(null);
    const [isLoadingRecording, setIsLoadingRecording] = useState<boolean>(false);
    const [transcripts, setTranscripts] = useState<any>([]);
    const [feedback, setFeedback] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [overAllScore, setOverAllScore] = useState<number>(0);
    const [summaryPrompt, setSummaryPrompt] = useState<string>("");
    const [analysisPrompt, setAnalysisPrompt] = useState<string>("");
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState<boolean>(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
    const [isLoadingTranscripts, setIsLoadingTranscripts] = useState<boolean>(false);
    const [showCandidateModal, setShowCandidateModal] = useState<boolean>(false);
    const [showCandidateActionModal, setShowCandidateActionModal] = useState<string>("");
    const isLoadingSettingsRef = useRef(false);

    async function finishUpload(interviewData: any) {
        setIsLoadingRecording(true);
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
        }).finally(() => {
          setIsLoadingRecording(false);
        });
    }
  
      useEffect(() => {
          const fetchInterview = async () => {
              try {
                loadingToast("Loading, please wait...");
                if (!isLoadingSettingsRef.current) {
                  isLoadingSettingsRef.current = true;
                  const configData = await axios
                    .post("/api/fetch-global-settings", {
                      fields: { summary_prompt: 1, analysis_prompt: 1 },
                    });
              
                  setSummaryPrompt(configData.data.summary_prompt.prompt);
                  setAnalysisPrompt(configData.data.analysis_prompt.prompt);
                  
                  const response = await axios.post("/api/interview-details", {
                    id: interviewSlug,
                    orgID,
                  });
                  if (!response.data?.interviewRecording && response.data?.interviewUpload && response.data?.interviewParts?.length > 0) {
                    finishUpload(response.data);
                  }

                  const stage = getStage(response.data);
                  setInterview({...response.data, stage});
                  if (response.data.interviewRecording) {
                    setInterviewRecording(response.data.interviewRecording);
                  }

                  if (response.data.analysis) {
                    setAnalysis(response.data.analysis);
                    setOverAllScore(response.data.analysis.overall_score);
                  }
            
                  if (response.data.summary) {
                    setSummary(response.data.summary);
                  }

                  isLoadingSettingsRef.current = false;
               }

                toast.dismiss();
              } catch (error) {
                console.log(error);
                Swal.fire({
                  icon: "error",
                  title: "Failed to load interview",
                  text: "Redirecting back to careers page...",
                  allowOutsideClick: false,
                  showConfirmButton: false,
                  timer: 1500,
                  willOpen: () => {
                    window.location.href = "/recruiter-dashboard/careers";
                  },
                });
              }
          }
          if (interviewSlug && orgID) {
            fetchInterview();
          }
      }, [interviewSlug, orgID]);

      useEffect(() => {
        const fetchTranscripts = async () => {
            try {
              setIsLoadingTranscripts(true);
              const response = await axios.post("/api/fetch-transcript", {
                id: interviewSlug,
              });
              console.log("Fetching transcripts", response.data);
              if (response.data?.length > 0) {
                if (!interview.analysis) {
                  generateAnalysis(response.data, interview);
                }

                if (!interview.summary) {
                  createSummary(response.data, interview);
                }
              }
              setTranscripts(response.data);
              setIsLoadingTranscripts(false);
            } catch (error) {
              console.log(error);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
              });
            }
        }
        if (interview) {
          fetchTranscripts();
        }
    }, [interview]);

    useEffect(() => {
      async function fetchFeedback() {
        if (!interview?.interviewID) return;
        try {
          const res = await axios.post("/api/fetch-feedback", {
            orgID,
          });
          // Find feedback for this interviewID
          const fb = res.data.find(
            (item) => item.interviewID === interview.interviewID
          );
          setFeedback(fb || null);
        } catch (err) {
          setFeedback(null);
        }
      }
      if (interview) {
        fetchFeedback();
      }
    }, [interview]);

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

    async function generateAnalysis(trData, details) {
      setIsGeneratingAnalysis(true);
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
          setIsGeneratingAnalysis(false);
        }, 500);
      } catch (err) {
        console.log(err);
        errorToast("Failed to generate analysis, please try again later", 1300);
      }
  
      setAnalysis(codeOuput);
    }
  
    async function createSummary(trData, details) {
      setIsGeneratingSummary(true);
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
      setIsGeneratingSummary(false);
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

    async function deleteInterview() {
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
          id: interview._id,
        });

        if (response.data.success) {
          Swal.fire({
            title: "Deleted!",
            text: "The interview has been deleted.",
            icon: "success",
            allowOutsideClick: false,
          }).then(() => {
            window.location.href = "/recruiter-dashboard/careers";
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

    async function resetInterviewData() {
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
          id: interview._id,
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

    function onAction(action: string) {
      setShowCandidateActionModal("");
      if (action === "delete") {
        deleteInterview();
      }
      if (action === "reset") {
        resetInterviewData();
      }
      if (action === "drop") {
        dropCandidate();
      }
      if (action === "endorse") {
        endorseCandidate();
      }
    }

    async function dropCandidate() {
      Swal.showLoading();
      try {
        const response = await axios.post("/api/drop-candidate", {
          uid: interview._id,
          user: user,
        });

        if (response.data.updatedInterview) {
          const stage = getStage(response.data.updatedInterview);
          setInterview({...response.data.updatedInterview, stage});
        }

        candidateActionToast(
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Candidate dropped</span>
              <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have dropped the candidate from the application process. </span>
            </div>
          </div>,
          1300, 
        <i className="la la-user-minus" style={{ color: "#DC6803", fontSize: 32 }}></i>)
      } catch (error) {
        console.error("Error dropping candidate:", error);
        errorToast("Failed to drop candidate", 1300);
      } finally {
        Swal.close();
      }
    }

    async function endorseCandidate() {
      Swal.showLoading();
      try {
        const response = await axios.post("/api/endorse-candidate", {
          uid: interview._id,
          user: user,
        });

        if (response.data.updatedInterview) {
          const stage = getStage(response.data.updatedInterview);
          setInterview({...response.data.updatedInterview, stage});
        }

        candidateActionToast(
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Candidate endorsed</span>
                <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have endorsed the candidate to the next stage.</span>
              </div>
            </div>,
            1300, 
          <i className="la la-user-check" style={{ color: "#039855", fontSize: 32 }}></i>)
      } catch (error) {
        console.error("Error endorsing candidate:", error);
        errorToast("Failed to endorse candidate", 1300);
      } finally {
        Swal.close();
      }
    }

    return (
      <>
      <HeaderBar activeLink="Careers" currentPage="Interview Analysis" icon="la la-suitcase" />
        <div style={{padding: "16px 20px"}}>
             <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                {interview && <div style={{ display: "flex", flexDirection: "column", marginBottom: "35px" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                      <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>{interview?.name}</h1>
                      {interview?.stage && <StageTag stage={interview?.stage} />}
                    </div>
                    <div
                    onClick={() => {
                      window.location.href = `/recruiter-dashboard/careers/manage/${interview?.careerID}`;
                    }} 
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <span>for <span style={{ color: "#6172F3", fontWeight: 500, fontSize: 16, borderBottom: "1px solid #6172F3" }}>{interview?.jobTitle}</span></span>
                      <i className="la la-external-link-alt" style={{ fontSize: 16, color: "#6172F3", marginLeft: 4 }}></i>
                    </div>
                </div>}
                {interview?.applicationStatus !== "Dropped" && <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                  <button style={{ width: "fit-content", color: "#B42318", background: "#fff", border: "1px solid #B42318", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                      setShowCandidateActionModal("drop");
                      }}>
                          Drop Candidate
                  </button>
                  <button style={{ width: "fit-content", background: "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    setShowCandidateActionModal("endorse");
                  }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Endorse Candidate
                  </button>
                </div>}
            </div>
            {interview?.retakeRequest  && !["Approved", "Rejected"].includes(interview?.retakeRequest?.status) && <RetakeInterviewRequestV2 interviewDetails={interview} />}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
              <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-chart-area" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Interview Analysis</span>
                        </div>
                        <button
                        disabled={isGeneratingAnalysis || transcripts.length === 0}
                        id="regen-analysis"
                        onClick={() => {
                          generateAnalysis(transcripts, interview);
                        }}
                        style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", padding: "5px 10px", cursor: "pointer", border: "1px solid #E9EAEB" }}>
                            <i className="la la-sync-alt" style={{ color: "#414651", fontSize: 16 }}></i>
                            <span>Regenerate</span>
                        </button>
                    </div>
                    <div className="layered-card-content">
                      {isGeneratingAnalysis ? (
                        <LoadingAnimation text="Generating Analysis..." subtext="Jia is generating AI Analysis..." />
                      ) : analysis ? 
                      (<>
                      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%"}}>
                          {overAllScore !== undefined ? (
                              <CircularProgress 
                                percentage={overAllScore}
                                size={160}
                                strokeWidth={15}
                                showLabel={true}
                                label="Overall Score"
                                fontSize={20}
                                labelFontSize={10}
                              />
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px" }}>
                              <span>No score available</span>
                            </div>
                          )}
                          <div style={{ display:"flex", flexDirection: "column", gap: 8, width: "70%"}}>
                            {analysis?.final_assessment && <CareerFit fit={analysis?.final_assessment} assessment={extractInterviewAssessment(summary)} />}
                            <Tooltip className="career-fit-tooltip fade-in" id="career-fit-tooltip"/>
                            {analysis?.assessment_reason && <span>{analysis?.assessment_reason}</span>}
                          </div>
                      </div>
                      <div>
                              <h3>Applicant Qualities</h3>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, borderRadius: 8, border: "1px solid #E9EAEB", padding: "16px 24px" }}>
                                  {analysis?.breakdown?.length && analysis?.breakdown?.map((item: any, idx: number) => (
                                      <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
                                          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                              <i className="la la-asterisk" style={{ fontSize: 16, marginRight: "5px", color: "#6941C6" }}></i>
                                              <span style={{ fontSize: 14, minWidth: "30%" }}>{item?.key}</span>
                                              {/* Progress bar */}
                                              <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#E9EAEB", marginRight: "16px" }}>
                                                  <div style={{ width: `${item?.data}%`, height: "100%", borderRadius: 4, background: breakdownColorScheme[idx] }} />
                                              </div>
                                              <span style={{ fontSize: 14 }}>{item?.data}%</span>
                                          </div>
                                          <div style={{ width: "100%" }}>
                                              <span style={{ fontSize: 14 }}>{item?.rationale}</span>
                                          </div>                               
                                      </div>
                                  ))}
                              </div>
                          </div>
                          </>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px" }}>
                              <span>No analysis available</span>
                            </div>
                          )}
                    </div>
                  </div>
                </div>

                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-file-alt" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Interview Summary</span>
                        </div>
                        <button 
                        disabled={isGeneratingSummary || transcripts.length === 0}
                        id="regen-summary"
                        onClick={() => {
                          createSummary(transcripts, interview);
                        }}
                        style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", padding: "5px 10px", cursor: "pointer", border: "1px solid #E9EAEB" }}>
                            <i className="la la-sync-alt" style={{ color: "#414651", fontSize: 16 }}></i>
                            <span>Regenerate</span>
                        </button>
                    </div>
                    <div className="layered-card-content">
                      {isGeneratingSummary ? (
                        <LoadingAnimation text="Generating Summary..." subtext="Working on generating the interview summary..." />
                      ) : summary ? (<Markdown>{summary}</Markdown>) : 
                      (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px" }}>
                        <span>No summary available</span>
                      </div>)}
                    </div>
                  </div>
                </div>

                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-microphone" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Interview Transcript</span>
                            {transcripts.length > 0 && (
                              <div style={{ fontSize: 12,display: "flex", flexDirection: "row", alignItems: "center", gap: 8, borderRadius: "60px", padding: "5px", border: "1px solid #D5D7DA" }}>
                              Duration: 
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
                              </div>
                            )}
                        </div>
                        
                    </div>
                    <div className="layered-card-content">
                      {isLoadingTranscripts ? (
                        <LoadingAnimation text="Loading Transcripts..." subtext="Fetching the interview transcript..." />
                      ) : transcripts.length > 0 ? (
                        <>
                        {transcripts.map((msg, idx) => {
                            return (
                              <React.Fragment key={idx}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <strong>
                                    {msg.type === "user"
                                      ? `${
                                          interview
                                            ? interview.name
                                            : "Applicant"
                                        }`
                                      : "Jia"}
                                  </strong>{" "}
                                  <small>
                                    {moment(msg.time).format("hh:mm A")}
                                  </small>

                                  <div style={{ width: "1px", height: "20px", backgroundColor: "#E9EAEB", margin: "0 5px" }}></div>
                                  <small
                                    title={
                                      "Amount of time from the last message"
                                    }
                                  >
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
                                <div 
                                style={{ 
                                  backgroundColor: msg.type === "user" ? "#F8F9FC" : "#EFF8FF",
                                  borderRadius: "8px 20px 20px 20px", 
                                  border: "1px solid #E9EAEB", 
                                  padding: "8px 16px", 
                                  width: "fit-content",
                                  }}
                                  >
                                {msg.content}
                                </div>
                              </React.Fragment>
                            );
                          })}
                          </>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px" }}>
                              <span>No transcript available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                    <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`la la-${interviewRecording?.filetype.includes("audio") ? "microphone" : "video"}`} style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                      </div>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>{interviewRecording?.filetype.includes("audio") ? "Audio Recording" : "Video Recording"}</span>
                    </div>
                    <div className="layered-card-content">
                    {isLoadingRecording ? (
                      <LoadingAnimation text="Loading Recording..." subtext="Fetching the interview recording..." />
                    ) : interviewRecording ? (interviewRecording?.filetype.includes(
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
                          style={{ width: "70%", margin: "0 auto" }}
                          preload="metadata"
                          controls
                          src={`https://cdn.hellojia.ai/${interviewRecording.filename}`}
                          />
                      )) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px" }}>
                              <span>No recording available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Candidate Information</span>

                    <div className="layered-card-content">
                      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                      <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                            {interview?.image && <AvatarImage src={interview.image} alt="Candidate" />}
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                <span style={{ fontSize: "14px", fontWeight: 550 }}>{interview?.name || ""}</span>
                                <span style={{ fontSize: "12px", color: "#6B7280" }}>{interview?.email}</span>
                            </div>
                      </div>
                      <button style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer"  }} onClick={() => {
                        setShowCandidateModal(true);
                      }}>
                            <i className="la la-user" style={{ color: "#414651", fontSize: 16 }}></i>
                            <span>View Candidate Details</span>
                      </button>
                      <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", width: "100%", gap: 48}}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8}}>
                          <span style={{ fontSize: "14px", fontWeight: 550 }}>Interview taken on</span>
                          <span style={{ fontSize: "12px", color: "#6B7280" }}>{transcripts?.[0]?.time ? new Date(transcripts?.[0]?.time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8}}>
                        <span style={{ fontSize: "14px", fontWeight: 550 }}>Joined on</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}>{interview?.createdAt ? new Date(interview?.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Settings</span>

                    <div className="layered-card-content">
                    <button 
                    disabled={isGeneratingAnalysis || isGeneratingSummary || transcripts.length === 0}
                    onClick={() => {
                      regenInsights();
                    }}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer"  }}>
                            <i className="la la-sync-alt" style={{ color: "#414651", fontSize: 16 }}></i>
                            <span>Regenerate All Insights</span>
                    </button>
                    <span style={{ fontSize: "14px", color: "#717680", textAlign: "center" }}>Trigger the button below to delete the interview transcript and set the status to "For Interview".</span>
                    <button 
                    onClick={() => {
                      // resetInterviewData();
                      setShowCandidateActionModal("reset");
                    }}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FEF3F2", color: "#B32318",borderRadius: "60px", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer"  }}>
                            <i className="la la-redo-alt" style={{ color: "#B32318", fontSize: 16 }}></i>
                            <span>Reset Interview Data</span>
                    </button>
                  </div>
                  </div>
                </div>

                {feedback && <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Feedback</span>

                    <div className="layered-card-content">
                      {/* Star Rating */}
                        <div
                          style={{
                            fontSize: "1.25rem",
                            color: "#FFD600",
                            letterSpacing: "0.18em",
                            display: "flex",
                            gap: "0.25em",
                            justifyContent: "center",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              style={{
                                color: i <= feedback.rating ? "#FFD600" : "#ddd",
                                transition: "color 0.2s",
                                marginRight: i < 5 ? 8 : 0,
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {feedback?.feedback && <span style={{ fontSize: "14px", color: "black", textAlign: "left" }}>"{feedback?.feedback}"</span>}
                    </div>
                  </div>
                </div>}

                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Advanced Settings</span>

                    <div className="layered-card-content">
                    <button 
                    onClick={() => {
                      setShowCandidateActionModal("delete");
                    }}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,backgroundColor: "#FEF3F2", color: "#B32318", borderRadius: "60px", padding: "5px 10px", border: "1px solid #B32318", cursor: "pointer"  }}>
                            <i className="la la-trash" style={{ color: "#B32318", fontSize: 16 }}></i>
                            <span>Delete this interview</span>
                    </button>
                    <span style={{ fontSize: "14px", color: "#717680", textAlign: "center" }}>Be careful, this action cannot be undone.</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            {showCandidateModal && <CandidateModal candidate={interview} setShowCandidateModal={setShowCandidateModal} />}
            {showCandidateActionModal && <CandidateActionModal candidate={interview} onAction={onAction} action={showCandidateActionModal} />}
        </div>
      </>
    )
}

function StageTag({stage}: {stage: string}) {

  return (
    <div 
    style={{ 
        borderRadius: "60px", 
        border: "1px solid #FEDF89", 
        backgroundColor: "#FFFAEB", 
        color: "#B54708",
        fontSize: "12px",
        width: "fit-content", 
        display: "flex", 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
        whiteSpace: "nowrap",
        padding: "5px 10px",
        }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#B54708", marginRight: "5px" }} /> {stage}
    </div>
)
}