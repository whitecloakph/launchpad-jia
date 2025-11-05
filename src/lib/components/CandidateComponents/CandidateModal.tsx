"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Markdown from "react-markdown";
import CareerFit from "../CareerComponents/CareerFit";
import React from "react";
import { errorToast, extractInterviewAssessment } from "@/lib/Utils";
import { CandidateCVDocument } from "./CandidateCVDocument";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LoadingAnimation from "@/lib/components/Loaders/LoadingAnimation";
import { useAppContext } from "../../context/AppContext";
import ApplicantStatusBadge from "../CareerComponents/ApplicantStatusBadge";
import CustomDropdown from "../Dropdown/CustomDropdown";
import { Tooltip } from "react-tooltip";

export default function CandidateModal({ candidate, setShowCandidateModal }: { candidate: any, setShowCandidateModal: any }) {
    const { orgID } = useAppContext();
    const [candidateInfo, setCandidateInfo] = useState(null);
    const [activeTab, setActiveTab] = useState("cv");
    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const response = await axios.get(`/api/get-candidate-interviews`, {
                    params: {
                        candidateEmail: candidate?.email,
                        orgID,
                    },
                });
                setInterviews(response?.data);
                setCandidateInfo({image: response?.data?.[0]?.image, name: response?.data?.[0]?.name, email: response?.data?.[0]?.email});
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Something went wrong",
                    text: "Redirecting back to candidates page...",
                    timer: 1500,
                }).then(() => {
                    setShowCandidateModal(false);
                    window.location.href = "/recruiter-dashboard/candidates";
                });
            }
        }
        if (candidate) {
            fetchInterviews();
        }
    }, [candidate]);
    
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
                height: "100vh",
                width: "100vw",
            }}>
                <div className="modal-content" style={{ overflowY: "auto", height: "100vh", maxWidth: "80vw", background: "#fff", border: `1.5px solid #E9EAEB`, borderRadius: 14, boxShadow: "0 8px 32px rgba(30,32,60,0.18)" }}>
                    <div className="modal-header">
                        <h3 className="modal-title">Candidate Details</h3> 
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setShowCandidateModal(false)}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderRadius: 8 }}>
                            {candidateInfo && <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <img alt={candidateInfo?.name} src={candidateInfo?.image} style={{ width: 48, height: 48, borderRadius: "50%", background: "#E0E0E0" }} />
                            <div>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{candidateInfo?.name}</div>
                                <div style={{ fontSize: 12, color: "#787486" }}>{candidateInfo?.email}</div>
                            </div>
                            </div>}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row", height: "44px", maxWidth: "460px", width: "100%", backgroundColor: "#EAECF5", borderRadius: "60px", padding: "5px"}}>
                                <div 
                                style={{ 
                                    display:"flex",
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: 8, 
                                    width: "50%", 
                                    height: "100%", 
                                    backgroundColor: activeTab === "cv" ? "#FFFFFF" : "#EAECF5", 
                                    color: activeTab === "cv" ? "#414651" : "#717680",
                                    borderRadius: "60px",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                    }}
                                    onClick={() => setActiveTab("cv")}
                                >
                                    <i className="la la-file-alt" style={{ color: "#414651", fontSize: 16 }}></i>
                                    <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Candidate CV</span>
                                </div>
                                <div style={{ 
                                    display:"flex",
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: 8, 
                                    width: "50%", 
                                    height: "100%", 
                                    backgroundColor: activeTab === "history" ? "#FFFFFF" : "#EAECF5", 
                                    color: activeTab === "history" ? "#414651" : "#717680",
                                    borderRadius: "60px",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                    }}
                                    onClick={() => setActiveTab("history")}
                                >
                                    <i className="la la-suitcase" style={{ color: "#414651", fontSize: 16 }}></i>
                                    <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Application History</span>
                                </div>
                            </div>
                        </div>
                    {activeTab === "cv" && <CandidateCVAnalysis candidate={candidate} interviews={interviews} setInterviews={setInterviews} />}
                    {activeTab === "history" && <CandidateApplicationHistory candidate={candidate} interviews={interviews} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CandidateCVAnalysis({ candidate, interviews, setInterviews }: { candidate: any, interviews: any, setInterviews: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [cvData, setCvData] = useState([]);
    const [regenerateLoading, setRegenerateLoading] = useState(false);

    const getActiveInterviews = (interviews: any[]) => {
        return interviews?.filter((interview: any) => !["Dropped", "Cancelled"].includes(interview.applicationStatus));
    }

    useEffect(() => {
        const fetchCVData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.post("/api/load-user-cv", { email: candidate?.email });
                if (response?.data?.digitalCV) {
                    setCvData(response?.data?.digitalCV);
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Failed to load CV",
                    text: "Redirecting back to candidates page...",
                    allowOutsideClick: false,
                    confirmButtonText: "Back to Candidates Page",
                }).then(() => {
                    window.location.href = "/recruiter-dashboard/candidates";
                }); 
            } finally{
                setIsLoading(false);
            }
        }
        if (candidate) {
            fetchCVData();
        }
      }, [candidate]);

    async function regenerateCV() {
        const interviewsToProcess = interviews.filter((interview: any) => !["Dropped", "Cancelled"].includes(interview.applicationStatus) && interview.currentStep !== "Applied");
        if (interviewsToProcess.length === 0) return;
        try {
            setRegenerateLoading(true);
            let updatedInterviews = [...interviews];
            
            for (const interview of interviewsToProcess) {
                const response = await axios.post("/api/analyze-cv", {
                    interviewID: interview.interviewID,
                    userEmail: interview.email,
                });
                let updatedInterview = {...interview};

                if (response?.data?.update) {
                    updatedInterview = {...updatedInterview, ...response?.data?.update};
                }
                
                updatedInterviews = updatedInterviews.map((i: any) => i._id === interview._id ? updatedInterview : i);
            }
            setInterviews(updatedInterviews);
        } catch (error) {
            console.log(error);
            errorToast("Failed to regenerate CV Analysis", 1300);
        } finally {
            setRegenerateLoading(false);
        }
    }
    return (<>
    <div className="layered-card-outer">
        <div className="layered-card-middle">
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="la la-bolt" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                    </div>
                    <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>CV Analysis by JIA</span>
                </div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <button 
                    disabled={regenerateLoading || interviews?.filter((interview: any) => !["Dropped", "Cancelled"].includes(interview.applicationStatus) && interview.currentStep !== "Applied")?.length === 0}
                    onClick={regenerateCV}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", padding: "5px 10px", cursor: "pointer", border: "1px solid #E9EAEB" }}>
                        <i className="la la-sync-alt" style={{ color: "#414651", fontSize: 16 }}></i>
                        <span>Regenerate</span>
                    </button>
                    <button
                    disabled={cvData?.length === 0}
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", padding: "5px 10px", cursor: "pointer", border: "1px solid #E9EAEB" }}>
                    <PDFDownloadLink
                            key={new Date().toISOString()}
                            document={<CandidateCVDocument candidate={interviews?.[0]} cvData={cvData} includeCVAnalysis={false} />}
                            fileName={`${interviews?.[0]?.name}-CV.pdf`}
                    >
                        {({ loading }) =>
                            loading ? 'Preparing document...' : 
                        <>
                        <i className="la la-cloud-download-alt" style={{ color: "#414651", fontSize: 16, marginRight: 4 }}></i>
                        <span style={{color: cvData?.length > 0 ? "#414651" : "#1010104d"}}>Download CV</span>
                        </>
                        }
                    </PDFDownloadLink>
                    </button>
                </div>
            </div>
        {/* CV Analysis by JIA content */}
        <div className="layered-card-content">
            {regenerateLoading ? (
                <LoadingAnimation text="Regenerating CV Analysis..." subtext="JIA is analyzing the CV..." />
            ) : 
            getActiveInterviews(interviews)?.length > 0 ? getActiveInterviews(interviews).map((interview: any) => (
                <div key={interview.id}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent:"flex-start", gap: 4, alignItems: "center" }}>
                        {interview.cvStatus &&
                        <>
                        <CareerFit fit={interview.cvStatus} assessment={interview.cvScreeningReason} />
                        <span>
                            for
                        </span>
                        </>}
                        <span style={{fontSize: 12, fontWeight: 700, color: "#181D27"}}>
                            {interview.jobTitle}
                        </span>
                        {interview.currentStep === "Applied" && (
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px", color: "#414651", border: "1px solid #E9EAEB", backgroundColor: "#F5F5F5", borderRadius: "60px", padding: "2px 10px", fontSize: "12px" }}>
                                <i className="la la-exclamation-triangle" style={{ fontSize: "12px", color: "#414651" }}></i>
                                <span>No CV Uploaded</span>
                            </div>
                        )}
                    </div>
                    <span style={{fontSize: 16, color: "#414651", fontWeight: 500}}>
                    <p dangerouslySetInnerHTML={{ __html: interview.cvScreeningReason || "No CV Analysis available" }}></p>
                    </span>
                </div>
            )) : (
                <div className="text-center">
                    <h3>No Active Applications</h3>
                </div>
            )}
            <Tooltip className="career-fit-tooltip fade-in" id="career-fit-tooltip"/>
        </div>
        </div>
    </div>
        {isLoading ? (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="layered-card-middle">
                            <div className="skeleton-bar" style={{ width: "30%", height: "20px", marginBottom: 8 }}></div>
                            <div className="skeleton-bar" style={{ width: "100%", height: "20px" }}></div>
                        </div>
                    ))}
                </div>
                <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="layered-card-middle">
                        <div className="skeleton-bar" style={{ width: "30%", height: "20px", marginBottom: 8 }}></div>
                        <div className="skeleton-bar" style={{ width: "100%", height: "20px" }}></div>
                    </div>
                </div>
            </div>
        ) : cvData?.length > 0 ? <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
            <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Current Experience */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Experience</span>
                {cvData?.find((section) => section.name === "Experience") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Experience")?.content.split("**Experience**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            {/* Education */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Education</span>
                {cvData?.find((section) => section.name === "Education") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Education")?.content.split("**Education**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            {/* Skills */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Skills</span>
                {cvData?.find((section) => section.name === "Skills") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Skills")?.content.split("**Skills**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            {/* Certifications */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Certifications</span>
                {cvData?.find((section) => section.name === "Certifications") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Certifications")?.content.split("**Certifications**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            {/* Projects */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Projects</span>
                {cvData?.find((section) => section.name === "Projects") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Projects")?.content.split("**Projects**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            {/* Awards */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Awards</span>
                {cvData?.find((section) => section.name === "Awards") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Awards")?.content.split("**Awards**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            </div>
            <div style={{ width: "40%", display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                    {/* Contact Info */}
            <div className="layered-card-middle">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700, marginLeft: 16}}>Contact Info</span>
                {cvData?.find((section) => section.name === "Contact Info") && <div className="layered-card-content">
                <Markdown>{cvData?.find((section: any) => section.name === "Contact Info")?.content.split("**Contact Info**")?.[1]?.trim()}</Markdown>
                </div>}
            </div>
            </div>
        </div> : (
            <div className="text-center" style={{ marginTop: 16 }}>
                <h3>Applicant has no uploaded CV</h3>
            </div>
        )}
    </>)
}

function CandidateApplicationHistory({ candidate, interviews }: { candidate: any, interviews: any }) {
    const [applications, setApplications] = useState([]);
    const filterStatusOptions = ["All Statuses", "Hired", "Ongoing", "Dropped"];
    const assessmentOptions = ["All Assessments", "Insufficient Data","Not Fit", "Bad Fit", "Maybe Fit", "Good Fit", "Strong Fit"];
    const [filterStatus, setFilterStatus] = useState("All Statuses");
    const [filterAssessment, setFilterAssessment] = useState("All Assessments");
    const [filterAssessmentOpen, setFilterAssessmentOpen] = useState(false);
    const [filterStatusOpen, setFilterStatusOpen] = useState(false);
    
    const filteredApplications = React.useMemo(() => {
        let filtered = applications;
        if (filterStatus !== "All Statuses") {
            filtered = filtered.filter((interview: any) => {
                if (filterStatus === "Ongoing") {
                    return interview.applicationStatus === "Ongoing" || !interview.applicationStatus;
                }

                return interview.applicationStatus === filterStatus;
            });
        }
        if (filterAssessment !== "All Assessments") {
            filtered = filtered.filter((interview: any) => interview.assessment.includes(filterAssessment));
        }
        return filtered;
    }, [applications, filterStatus, filterAssessment]);

    useEffect(() => {
        if (interviews) {
            let newApplications = [];
            for (const interview of interviews) {
                if (interview.currentStep === "AI Interview" || !interview.currentStep || (interview.currentStep === "CV Screening" && interview.status === "For AI Interview")) {
                    if (interview.status === "For Interview" || interview.status === "For AI Interview") {
                        newApplications.push({...interview, stage: "Pending AI Interview", assessment: `CV: ${interview.cvStatus || "N/A"}`});
                        continue;
                    }

                    newApplications.push({...interview, stage: "AI Interview Review", assessment: `Interview: ${interview.jobFit || "N/A"}`});
                    continue;
                }
                
                if (interview.currentStep === "CV Screening" && (interview.status !== "For AI Interview" && interview.status !== "For Interview")) {
                    newApplications.push({...interview, stage: "CV Review", assessment: `CV: ${interview.cvStatus || "N/A"}`});
                    continue;
                }

                if (interview.currentStep === "Human Interview") {
                    if (interview.status === "For Human Interview") {
                        newApplications.push({...interview, stage: "For Human Interview", assessment: `Interview: ${interview.jobFit || "N/A"}`});
                        continue;
                    }
                    if (interview.status === "For Human Interview Review") {
                        newApplications.push({...interview, stage: "Human Interview Review", assessment: `Interview: ${interview.jobFit || "N/A"}`});
                        continue;
                    }
                }

                if (interview.currentStep === "Job Interview") {
                   newApplications.push({...interview, stage: "Pending Job Interview"});
                   continue;
                }

                if (interview.currentStep === "Job Offered") {
                    newApplications.push({...interview, stage: "Job Offered"});
                    continue;
                }

                if (interview.currentStep === "Contract Signed") {
                    newApplications.push({...interview, stage: "Contract Signed"});
                    continue;
                }

                if (interview.currentStep === "Applied") {
                    newApplications.push({...interview, stage: "Applied", assessment: `CV: ${interview.status || "N/A"}`});
                    continue;
                }
            }
            setApplications(newApplications);
        }
    },[interviews])


    return (
    <div className="layered-card-outer">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E9EAEB" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "16px 20px" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                   <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Applied Jobs</span>
                    <div style={{borderRadius: "50%", backgroundColor: "lightgray", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <span style={{fontSize: 12, color: "#181D27", fontWeight: 700}}>{applications?.length}</span>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CustomDropdown value={filterAssessment} setValue={setFilterAssessment} options={assessmentOptions} icon="la-filter" />
                    <CustomDropdown value={filterStatus} setValue={setFilterStatus} options={filterStatusOptions} icon="la-filter" />
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
            <table className="table align-items-center table-flush">
                    <thead>
                        <tr>
                            <th scope="col" style={{ textTransform: "none", fontWeight: 550 }}>Position Applied</th>
                       
                            <th scope="col" style={{ textTransform: "none", fontWeight: 550 }}>Date Applied</th>
                        
                            <th scope="col" style={{ textTransform: "none", fontWeight: 550 }}>CV/Interview Assessment</th>
                        
                            <th scope="col" style={{ textTransform: "none", fontWeight: 550 }}>Application Status</th>
                        
                            <th scope="col" style={{ textTransform: "none", fontWeight: 550 }}>Stage</th>
                        
                            <th scope="col" style={{ textTransform: "none", fontWeight: 550 }}>Stage Updated</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications?.map((interview: any, index: number) => (
                            <tr key={index} onClick={() => {
                                window.location.href = `/recruiter-dashboard/careers/manage/${interview.id}/interview-analysis/${interview.interviewID}`;
                            }}>
                                <td>{interview.jobTitle}</td>
                                <td>{new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td>
                                    <CareerFit fit={interview.assessment} assessment={interview.currentStep === "CV Screening" || interview.stage === "Pending AI Interview" ? interview.cvScreeningReason : extractInterviewAssessment(interview?.summary)} />
                                </td>
                                <td><ApplicantStatusBadge status={interview.applicationStatus || "Ongoing"}/></td>
                                <td>{interview.stage}</td>
                                <td>{interview.applicationMetadata?.updatedAt ? new Date(interview.applicationMetadata.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date(interview.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td>
                                    <i className="la la-external-link-alt" style={{ fontSize: "20px", color: "black" }}></i>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Tooltip className="career-fit-tooltip fade-in" id="career-fit-tooltip"/>
            </div>
        </div>
    </div>)
}