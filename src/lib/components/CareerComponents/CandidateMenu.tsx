"use client";
import { useEffect, useRef, useState } from "react";
import CareerFit from "./CareerFit";
import Markdown from "react-markdown";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import { errorToast, extractInterviewAssessment, loadingToast, successToast } from "@/lib/Utils";
import { toast } from "react-toastify";
import CardTypingLoader from "../AnalysisComponents/CardTypingLoader";
import CandidateModal from "../CandidateComponents/CandidateModal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CandidateCVDocument } from "../CandidateComponents/CandidateCVDocument";
import CircularProgress from "../CandidateComponents/CircularProgress";
import LoadingAnimation from "../Loaders/LoadingAnimation";

const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8L10 13L15 8" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ChevronUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 12L10 7L5 12" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const breakdownColorScheme = ["#9FCAED", "#CEB6DA", "#EBACC9", "#FCCEC0"];

export default function CandidateMenu({ handleCandidateMenuOpen, candidate, handleCandidateCVOpen, handleEndorseCandidate, handleDropCandidate, handleCandidateAnalysisComplete, handleRetakeInterview }: any) {
    const [isCVAnalysisOpen, setIsCVAnalysisOpen] = useState(false);
    const [isAIInterviewAnalysisOpen, setIsAIInterviewAnalysisOpen] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [summary, setSummary] = useState(null);
    const [overAllScore, setOverAllScore] = useState(null);
    const [summaryPrompt, setSummaryPrompt] = useState(null);
    const [analysisPrompt, setAnalysisPrompt] = useState(null);
    const [transcripts, setTranscripts] = useState(null);
    const [interviewDetails, setInterviewDetails] = useState(null);
    const isLoadingSettingsRef = useRef(false);
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(true);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(true);
    const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
    const { user } = useAppContext();
    const [cvData, setCvData] = useState(null);

    useEffect(() => {
      const fetchInterviewDetails = async () => {
          loadingToast("Loading, please wait...");
          try {
            if (!isLoadingSettingsRef.current) {
              isLoadingSettingsRef.current = true;
              const configResponse = await axios.post("/api/fetch-global-settings", {
                fields: { summary_prompt: 1, analysis_prompt: 1 },
              });
    
              setSummaryPrompt(configResponse.data.summary_prompt?.prompt || "");
              setAnalysisPrompt(configResponse.data.analysis_prompt?.prompt || "");
              const interviewDetailsResponse = await axios.post("/api/interview-details", {
                id: candidate.interviewID,
              });
              setInterviewDetails(interviewDetailsResponse.data);
    
              if (interviewDetailsResponse.data?.cvStatus && interviewDetailsResponse.data?.cvStatus !== "No CV") {
                setIsCVAnalysisOpen(true);
              }
    
              if (interviewDetailsResponse.data?.analysis) {
                setAnalysis(interviewDetailsResponse.data.analysis);
                setOverAllScore(interviewDetailsResponse.data.analysis.overall_score);
                setIsGeneratingAnalysis(false);
              }
              
              if (interviewDetailsResponse.data?.summary) {
                setSummary(interviewDetailsResponse.data.summary);
                setIsGeneratingSummary(false);
              }

              if (interviewDetailsResponse.data?.analysis || interviewDetailsResponse.data?.summary) {
                setIsAIInterviewAnalysisOpen(true);
              }
              
              isLoadingSettingsRef.current = false;
            }
          } catch (error) {
            console.log(error);
            errorToast("Failed to load candidate analysis", 1300);
          } finally {
            toast.dismiss();
          }
      }

      if (candidate?.interviewID) {
        fetchInterviewDetails();
      }
    }, [candidate?.interviewID]);


    useEffect(() => {
      const fetchTranscripts = async () => {
          try {
            const transcriptResponse = await axios.post("/api/fetch-transcript", {
                id: interviewDetails?.interviewID,
            });

            if (transcriptResponse.data?.length > 0) {
              let analysisAccordionOpen = false;
              if (!interviewDetails.analysis) {
                generateAnalysis(transcriptResponse.data, interviewDetails);
                analysisAccordionOpen = true;
              }

              if (!interviewDetails.summary) {
                createSummary(transcriptResponse.data, interviewDetails);
                analysisAccordionOpen = true;
              }

              if (analysisAccordionOpen && !isAIInterviewAnalysisOpen) {
                setIsAIInterviewAnalysisOpen(true);
              }
              setTranscripts(transcriptResponse.data);
            } else {
              // Set generating analysis and summary to false
              setIsGeneratingAnalysis(false);
              setIsGeneratingSummary(false);
            }
          } catch (error) {
            console.log(error);
            errorToast("Failed to load candidate analysis", 1300);
          }
      }
      if (interviewDetails) {
        fetchTranscripts();
      }
    }, [interviewDetails]);

    useEffect(() => {
      const fetchCVData = async () => {
        try {
          const response = await axios.post("/api/load-user-cv", { email: interviewDetails?.email });
          if (response?.data?.digitalCV) {
            setCvData(response.data.digitalCV);
          }
        } catch (error) {
          console.log(error);
          errorToast("Failed to load candidate CV", 1300);
        }
      }

      if (interviewDetails) {
        fetchCVData();
      }
    }, [interviewDetails])

    const handleViewCV = (e: any) => {
        e.stopPropagation();
        handleCandidateCVOpen(candidate);
    }

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
        setOverAllScore(null);
    
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
    
          // save analysis
          updateInterview(details._id, {
            analysis: codeOuput,
            score: codeOuput.overall_score,
            jobFit: codeOuput.final_assessment,
          });

          handleCandidateAnalysisComplete({
            ...candidate,
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
        setIsGeneratingAnalysis(false);
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

    return (
        <div className="candidate-side-menu">
            <div className="candidate-side-menu-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h1>Candidate Analysis</h1>
                    <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={handleCandidateMenuOpen}>
                        <i className="la la-times"></i>
                    </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div
                    onClick={() => setCandidateDetailsOpen(true)}
                    className="candidate-info-section"
                    >
                        <img alt={candidate?.name} src={candidate?.image} style={{ width: 32, height: 32, borderRadius: "50%", background: "#E0E0E0" }} />
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{candidate?.name}</div>
                            <div style={{ fontSize: 12, color: "#787486" }}>{candidate?.email}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8, borderRadius: "60px", background: "#F8F9FC", border: "1px solid #D5D9EB", padding: "0px 10px", maxWidth: "fit-content", marginBottom: "16px" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4E5BA6" }} />
                      <span style={{ fontSize: 14, color: "#363F72", fontWeight: 700 }}>Stage: {candidate?.stage || ""}</span>
                    </div>
                </div>

                

                {/* Drop and Endorse buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: "16px", width: "100%" }}>
                    {candidate?.retakeRequest  && !["Approved", "Rejected"].includes(candidate?.retakeRequest?.status) && (
                      <button style={{ width: "50%", color: "#ffffff", background: "#181D27", border: "1px solid #181D27", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }} onClick={() => {
                        handleRetakeInterview(candidate);
                      }}>
                        <i className="la la-exclamation-circle" style={{ fontSize: 16, marginRight: "5px" }}></i>
                        Review Retake Request
                      </button>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: candidate?.retakeRequest  && !["Approved", "Rejected"].includes(candidate?.retakeRequest?.status) ? "50%" : "100%" }}>
                      <button style={{ width: "50%", color: "#B42318", background: "#fff", border: "1px solid #B42318", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }} onClick={() => {
                          handleCandidateMenuOpen();
                          handleDropCandidate(candidate);
                      }}>
                          Drop Candidate
                      </button>
                      <button style={{ width: "50%", background: "#181D27", border: "1px solid #181D27", color: "#fff", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }} onClick={() => {
                          handleCandidateMenuOpen();
                          handleEndorseCandidate(candidate);
                      }}>
                          Endorse Candidate
                      </button>
                    </div>
                </div>

                <div style={{ width: "100%", height: 1, background: "#E9EAEB", margin: "16px 0" }} />
                {/* CV Analysis Accordion */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: "20px" }} onClick={(e) => {
                  setIsCVAnalysisOpen(!isCVAnalysisOpen);
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-file-alt" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <h2>CV Analysis</h2>
                        {cvData?.length > 0 && candidate &&
                        <>
                        <button style={{ color: "#414651", border: "1px solid #D5D7DA", borderRadius: "60px", background: "#FFFFFF", padding: "5px 15px", cursor: "pointer" }} onClick={handleViewCV}>
                        <i className="la la-file-alt"></i>
                          View CV
                        </button>

                        <div style={{ color: "#414651", border: "1px solid #D5D7DA", borderRadius: "60px", background: "#FFFFFF", padding: "5px 15px", cursor: "pointer" }} >
                        <i className="la la-download"></i>
                          {/* Download CV */}
                          <PDFDownloadLink
                            key={new Date().toISOString()}
                            document={<CandidateCVDocument candidate={candidate} cvData={cvData} />}
                            fileName={`${candidate?.name}-CV.pdf`}
                            style={{ color: "#414651" }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                          {(event) =>
                            'Download CV'
                          }
                          </PDFDownloadLink>
                        </div>
                        </>
                        }
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CareerFit fit={candidate?.cvStatus ? candidate?.cvStatus : "N/A"} assessment={candidate?.cvScreeningReason} />
                        {isCVAnalysisOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </div>
                </div>
                {isCVAnalysisOpen && candidate?.cvScreeningReason ? (
                    <div>
                        <p dangerouslySetInnerHTML={{ __html: candidate?.cvScreeningReason }}></p>
                    </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", textAlign: "center" }}>
                          <p style={{fontSize: 16, color: "#717680", fontWeight: 500}}>Candidate has no uploaded CV. <br /> Analysis unavailable.</p>
                  </div>
                )}

                <div style={{ width: "100%", height: 1, background: "#E9EAEB", margin: "16px 0" }} />
                {/* AI Interview Analysis */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: "20px" }} onClick={(e) => {
                  setIsAIInterviewAnalysisOpen(!isAIInterviewAnalysisOpen);
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-microphone" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                    <h2>AI Interview Analysis</h2>
                    <button style={{ color: "#414651", border: "1px solid #D5D7DA", borderRadius: "60px", background: "#FFFFFF", padding: "5px 15px", cursor: "pointer" }} 
                        onClick={(e) =>{
                          e.stopPropagation();
                          window.location.href = `/recruiter-dashboard/careers/manage/${candidate?.id}/interview-analysis/${candidate?.interviewID}`;
                        }}
                        >
                          Full analysis & transcript
                          <i className="la la-external-link-alt"></i>
                    </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {analysis?.final_assessment && <CareerFit fit={analysis.final_assessment} assessment={extractInterviewAssessment(summary)} />}
                        {isAIInterviewAnalysisOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </div>
                </div>
                {isAIInterviewAnalysisOpen && (
                    <div>
                      {summary && analysis && transcripts && !isGeneratingAnalysis && !isGeneratingSummary && (
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, width: "100%" }}>
                        <button 
                        style={{
                           color: "#414651", border: "1px solid #D5D7DA", borderRadius: "60px", background: "#FFFFFF", padding: "5px 15px", cursor: "pointer"
                        }} 
                        onClick={() => {
                            generateAnalysis(transcripts, interviewDetails);
                            createSummary(transcripts, interviewDetails);
                        }}>
                          <i className="la la-sync-alt" style={{ fontSize: 16, marginRight: "5px" }}></i>
                            Regenerate
                        </button>
                        </div>
                      )}
                        {/* Overall Score with curved progress bar */}
                        {isGeneratingAnalysis ? (
                          <LoadingAnimation text="Generating Analysis..." subtext="Jia is generating AI Analysis..." />
                        ) : (overAllScore !== null && 
                         <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                           <CircularProgress 
                          percentage={overAllScore}
                          size={200}
                          strokeWidth={15}
                          showLabel={true}
                          label="Overall Score"
                          fontSize={30}
                          labelFontSize={12}
                          progressType="half-circle"
                        />
                         </div>
                      )}

                      <div className="analysis-summary">
                          {isGeneratingSummary ? (
                            <LoadingAnimation text="Generating Summary..." subtext="Working on generating the interview summary..." />
                          )
                      : (summary && (<Markdown>{summary}</Markdown>))}
                      </div>

                        {/* Applicant Qualities */}
                        {isGeneratingAnalysis ? (
                        <LoadingAnimation text="Generating Applicant Qualities Analysis..." subtext="Jia is generating AI Analysis..." />
                        ) : (analysis && (<div>
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
                        </div>))}
                        {!summary && !analysis && !isGeneratingSummary && !isGeneratingAnalysis && 
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", textAlign: "center" }}>
                          <p style={{fontSize: 16, color: "#717680", fontWeight: 500}}>Candidate has not taken AI Interview. <br /> Analysis unavailable.</p>
                        </div>
                        }
                    </div>
                )}
            </div>
            {candidateDetailsOpen && <CandidateModal candidate={candidate} setShowCandidateModal={setCandidateDetailsOpen} />}
        </div>
    )
}