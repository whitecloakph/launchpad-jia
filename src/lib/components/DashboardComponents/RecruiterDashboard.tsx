"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast, formatDateToRelativeTime } from "@/lib/Utils";
import CandidateModal from "@/lib/components/CandidateComponents/CandidateModal";

export default function RecruiterDashboard() {
    const { orgID } = useAppContext();
    const [recruiterStats, setRecruiterStats] = useState([]);
    const [pendingCVReview, setPendingCVReview] = useState([]);
    const [pendingAIInterviewReview, setPendingAIInterviewReview] = useState([]);
    const [pendingRetakeRequest, setPendingRetakeRequest] = useState([]);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
    const [isLoadingPendingTasks, setIsLoadingPendingTasks] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        const fetchRecruiterStats = async () => {
            try {
                setIsLoadingMetrics(true);
                const response =await axios.post("/api/get-metrics", { orgID });

                if (response.status === 200) {
                    setRecruiterStats(response.data);
                }
            } catch (error) {
                console.log(error);
                errorToast("Error failed to load recruiter metrics", 1300);
            } finally {
                setIsLoadingMetrics(false);
            }
        }

        const fetchPendingTasks = async () => {
            try {
                setIsLoadingPendingTasks(true);
                const response = await axios.get("/api/get-pending-recruiter-tasks", { params: { orgID } });

                if (response.status === 200) {
                    setPendingCVReview(response.data.cvReview);
                    setPendingAIInterviewReview(response.data.aiInterviewReview);
                    setPendingRetakeRequest(response.data.retakeRequest);
                }
            } catch (error) {
                console.log(error);
                errorToast("Error failed to load pending tasks", 1300);
            } finally {
                setIsLoadingPendingTasks(false);
            }
        }

        if (orgID) {
            fetchRecruiterStats();
            fetchPendingTasks();
        }
    }, [orgID]);

    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setShowCandidateModal(true);
    }

    return (
        <div className="recruiter-dashboard-container">
            {/* Row of 4 cards */}
            <div className="recruiter-dashboard-metrics-container">
                <div className="recruiter-dashboard-metric-card" style={{  backgroundColor: "#EFF8FF" }}>
                    <div className="metric-content">
                        <div className="metric-icon">
                            <i className="la la-suitcase" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Total Careers</span>
                            <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{recruiterStats[0]?.value || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="recruiter-dashboard-metric-card" style={{ backgroundColor: "#FDF2FA" }}>
                    <div className="metric-content">
                        <div className="metric-icon">
                            <i className="la la-microphone" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Total Interviews</span>
                            <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{recruiterStats[1]?.value || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="recruiter-dashboard-metric-card" style={{ backgroundColor: "#F4F3FF" }}>
                    <div className="metric-content">
                        <div className="metric-icon">
                            <i className="la la-comment" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Total Transcripts</span>
                            <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{recruiterStats[2]?.value || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="recruiter-dashboard-metric-card" style={{ backgroundColor: "#FFF6ED" }}>
                    <div className="metric-content">
                        <div className="metric-icon">
                            <i className="la la-users" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Total Applicants</span>
                            <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{recruiterStats[3]?.value || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0, margin: "20px 0" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#181D27" }}>Tasks</h1>
                <span style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}>These items require your decision.</span>
            </div>

            {/* Row of 3 tables */}
            <div className="pending-recruiter-tasks-container">
                <div className="layered-card-content">
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "flex-start" }}>
                            <h1 style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>CV Review</h1>
                            <div style={{ borderRadius: "50%", width: 30, height: 22, border: "1px solid #D5D9EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, backgroundColor: "#F8F9FC", color: "#181D27", fontWeight: 700 }}>
                                {pendingCVReview?.length || 0}
                            </div>
                        </div>
                        {pendingCVReview?.length > 0 && <button 
                        style={{ fontSize: 14, fontWeight: 500, borderRadius: "60px", backgroundColor: "#FFFFFF", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer" }}
                        onClick={() => window.location.href = "/recruiter-dashboard/to-do?tab=cv-review"}
                        >
                            View All
                        </button>}
                    </div>
                    {isLoadingPendingTasks ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px"}}>
                            {Array.from({ length: 10 }).map((_, index) => (
                               <div key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "10px", alignItems: "center",}}>
                                 <div className="skeleton-bar" style={{ width: 40, height: 40, borderRadius: "50%" }}></div>
                                 <div className="skeleton-bar"></div>
                               </div>
                            ))}
                        </div>
                    ) : pendingCVReview?.length > 0 ? (
                        <div className="pending-recruiter-task-table">
                            {/* Display only 10 max */}
                            {pendingCVReview.slice(0, 10).map((candidate, index) => (
                                <div 
                                key={candidate._id} 
                                onClick={() => handleViewCandidate(candidate)}
                                className="pending-recruiter-task-row"
                                style={{ borderBottom: index === pendingCVReview.slice(0, 10).length - 1 ? "none" : "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        <img src={candidate?.image} alt={candidate?.name} style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }} />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: 14 }}>{candidate?.name || ""}</div>
                                            <div style={{ fontSize: 12, color: "#787486" }}>{candidate?.jobTitle || ""}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#787486" }}>{candidate.updatedAt ? formatDateToRelativeTime(new Date(candidate.updatedAt)) : "N/A"}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            No pending CV reviews found
                        </div>
                    ) }
                </div>
                <div className="layered-card-content">
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "flex-start" }}>
                            <h1 style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Interview Review</h1>
                            <div style={{ borderRadius: "50%", width: 30, height: 22, border: "1px solid #D5D9EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, backgroundColor: "#F8F9FC", color: "#181D27", fontWeight: 700 }}>
                                {pendingAIInterviewReview?.length || 0}
                            </div>
                        </div>
                        {pendingAIInterviewReview?.length > 0 && <button 
                        style={{ fontSize: 14, fontWeight: 500, borderRadius: "60px", backgroundColor: "#FFFFFF", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer" }}
                        onClick={() => window.location.href = "/recruiter-dashboard/to-do?tab=interview-review"}
                        >
                            View All
                        </button>}
                    </div>
                    {isLoadingPendingTasks ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px"}}>
                            {Array.from({ length: 10 }).map((_, index) => (
                               <div key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "10px", alignItems: "center",}}>
                                 <div className="skeleton-bar" style={{ width: 40, height: 40, borderRadius: "50%" }}></div>
                                 <div className="skeleton-bar"></div>
                               </div>
                            ))}
                        </div>
                    ) : pendingAIInterviewReview?.length > 0 ? (
                        <div className="pending-recruiter-task-table">
                            {/* Display only 10 max */}
                            {pendingAIInterviewReview.slice(0, 10).map((candidate, index) => (
                                 <div 
                                 key={candidate._id} 
                                 onClick={() => handleViewCandidate(candidate)}
                                 className="pending-recruiter-task-row"
                                 style={{ borderBottom: index === pendingAIInterviewReview.slice(0, 10).length - 1 ? "none" : "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        <img src={candidate?.image} alt={candidate?.name} style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }} />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: 14 }}>{candidate?.name || ""}</div>
                                            <div style={{ fontSize: 12, color: "#787486" }}>{candidate?.jobTitle || ""}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#787486" }}>{candidate.updatedAt ? formatDateToRelativeTime(new Date(candidate.updatedAt)) : "N/A"}</div>
                                 </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            No pending interview reviews found
                        </div>
                    ) }
                </div>
                <div className="layered-card-content">
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "flex-start" }}>
                            <h1 style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Retake Request</h1>
                            <div style={{ borderRadius: "50%", width: 30, height: 22, border: "1px solid #D5D9EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, backgroundColor: "#F8F9FC", color: "#181D27", fontWeight: 700 }}>
                                {pendingRetakeRequest?.length || 0}
                            </div>
                        </div>
                        {pendingRetakeRequest?.length > 0 && <button 
                        style={{ fontSize: 14, fontWeight: 500, borderRadius: "60px", backgroundColor: "#FFFFFF", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer" }}
                        onClick={() => window.location.href = "/recruiter-dashboard/to-do?tab=retake-interview-requests"}
                        >
                            View All
                        </button>}
                    </div>
                    {isLoadingPendingTasks ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px"}}>
                            {Array.from({ length: 10 }).map((_, index) => (
                               <div key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "10px", alignItems: "center",}}>
                                 <div className="skeleton-bar" style={{ width: 40, height: 40, borderRadius: "50%" }}></div>
                                 <div className="skeleton-bar"></div>
                               </div>
                            ))}
                        </div>
                    ) : pendingRetakeRequest?.length > 0 ? (
                        <div className="pending-recruiter-task-table">
                            {/* Display only 10 max */}
                            {pendingRetakeRequest.slice(0, 10).map((candidate, index) => (
                                 <div 
                                 key={candidate._id}
                                 onClick={() => handleViewCandidate(candidate)}
                                 className="pending-recruiter-task-row"
                                 style={{ borderBottom: index === pendingRetakeRequest.slice(0, 10).length - 1 ? "none" : "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        <img src={candidate?.image} alt={candidate?.name} style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }} />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: 14 }}>{candidate?.name || ""}</div>
                                            <div style={{ fontSize: 12, color: "#787486" }}>{candidate?.jobTitle || ""}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#787486" }}>{candidate.updatedAt ? formatDateToRelativeTime(new Date(candidate.updatedAt)) : "N/A"}</div>
                             </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            No pending retake requests found
                        </div>
                    ) }
                </div>
            </div>
            {showCandidateModal && <CandidateModal candidate={selectedCandidate} setShowCandidateModal={setShowCandidateModal} />}
        </div>
    )
}