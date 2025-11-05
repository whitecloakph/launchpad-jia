"use client";
import { useState } from "react";
import CareerFit from "./CareerFit";
import { extractInterviewAssessment, formatDateToRelativeTime } from "../../Utils";

export default function CandidateCard({ candidate, stage, handleCandidateMenuOpen, handleCandidateCVOpen, handleEndorseCandidate, handleDropCandidate, handleCandidateHistoryOpen, handleRetakeInterview}: any) {
    const { name, email, image, createdAt, currentStep, cvStatus, jobFit, cvScreeningReason, summary } = candidate;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSelectMenuOption = () => {
        handleCandidateMenuOpen({...candidate, stage});
        setMenuOpen(!menuOpen);
    }

    const handleViewCV = () => {
        handleCandidateCVOpen({...candidate, stage});
        setMenuOpen(!menuOpen);
    }

    const handleViewHistory = () => {
        handleCandidateHistoryOpen({...candidate, stage});
        setMenuOpen(!menuOpen);
    }

    const hasPendingInterviewRetakeRequest = candidate?.retakeRequest  && !["Approved", "Rejected"].includes(candidate?.retakeRequest?.status);
    
    return (
        <div 
        draggable={true}
        onDragStart={(e) => {
            e.dataTransfer.setData("candidateId", candidate._id);
            e.dataTransfer.setData("stageKey", stage);
        }}
        className="candidate-card"
        style={{ 
            cursor: "pointer",
            background: hasPendingInterviewRetakeRequest ? "#FFFAEB" : "white"
        }} 
        onClick={(e) => {
            if (e.defaultPrevented) return;
            handleCandidateMenuOpen({...candidate, stage})
        }}>
            <div className="candidate-card-section" style={{ justifyContent: "space-between" }}>
                <CareerFit fit={currentStep === "CV Screening" || stage === "Pending AI Interview" ? `CV: ${cvStatus || "N/A"}` : `Interview: ${jobFit || "N/A"}`} assessment={currentStep === "CV Screening" || stage === "Pending AI Interview" ? cvScreeningReason : extractInterviewAssessment(summary)} />
                <div className="dropdown">
                <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => {
                    if (e.defaultPrevented) return;
                    e.preventDefault();
                    setMenuOpen(!menuOpen);
                }}>
                    <i className="la la-ellipsis-h" style={{ fontSize: 16, color: "#787486" }}></i>
                </button>
                {menuOpen && (
                    <div 
                    className={`dropdown-menu w-100 mt-1 org-dropdown-anim${
                        menuOpen ? " show" : ""
                        }`}
                    style={{
                        padding: "10px 0px",
                    }}
                    >
                        <div 
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                        style={{ fontSize: 14, fontWeight: 700, color: "#414651", marginLeft: 15, cursor: "default" }}
                        >
                        <span>Candidate Menu</span>
                        </div>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-item" onClick={(e) => {
                            e.preventDefault();
                            handleSelectMenuOption();
                        }}>
                            <i className="la la-bolt" style={{ fontSize: 16, marginRight: 4 }}></i>
                            <span>View Analysis by Jia</span>
                        </div>
                        <div className="dropdown-item" onClick={(e) => {
                            e.preventDefault();
                            handleViewCV();
                        }}>
                            <i className="la la-file-alt" style={{ fontSize: 16, marginRight: 4 }}></i>
                            <span>View CV</span>
                        </div>
                        <div className="dropdown-item" onClick={(e) => {
                            e.preventDefault();
                            handleViewHistory();
                        }}>
                            <i className="la la-history" style={{ fontSize: 16, marginRight: 4 }}></i>
                            <span>View Application History</span>
                        </div>
                        {/* Dropdown divider */}
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-item" onClick={(e) => {
                            e.preventDefault();
                            handleEndorseCandidate({...candidate, stage});
                            setMenuOpen(!menuOpen);
                        }}>
                            <i className="la la-user-check" style={{ fontSize: 16, marginRight: 4 }}></i>
                            <span>Endorse Candidate</span>
                        </div>
                        <div className="dropdown-item" style={{ color: "#B42318" }} onClick={(e) => {
                            e.preventDefault();
                            handleDropCandidate({...candidate, stage});
                            setMenuOpen(!menuOpen);
                        }}>
                            <i className="la la-user-times" style={{ fontSize: 16, marginRight: 4 }}></i>
                            <span>Drop Candidate</span>
                        </div>
                        {hasPendingInterviewRetakeRequest && 
                        <>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item" style={{ color: "#DC6803" }} onClick={(e) => {
                                e.preventDefault();
                                handleRetakeInterview({...candidate, stage});
                                setMenuOpen(!menuOpen);
                            }}>
                                <span>Review Retake Request</span>
                            </div>
                        </>
                        }
                    </div>
                )}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                <div className="candidate-card-section">
                    <img src={image} alt={name} style={{ width: 32, height: 32, borderRadius: "50%", background: "#E0E0E0" }} />
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
                        <div style={{ fontSize: 12, color: "#787486" }}>{email}</div>
                    </div>
                </div>
                {hasPendingInterviewRetakeRequest && 
                <div style={{ border: "1px solid #FEDF89", background: "#FEEFC7", borderRadius: "20px", color: "#B54708", fontSize: 14, textAlign: "center" }}>
                    <i className="la la-exclamation-circle" style={{ color: "#B54708", fontSize: 16, marginRight: 4 }}></i>
                    Requested to retake interview
                </div>}
                <div style={{width: "100%", height: 1, background: "#E0E0E0"}}></div>
            </div>
            <div className="candidate-card-section" style={{ justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, color: "#787486" }}>{createdAt ? formatDateToRelativeTime(new Date(createdAt)) : "N/A"}</div>
                <div style={{ fontSize: 12, color: "#787486" }}>
                <img src={candidate.applicationMetadata?.updatedBy?.image || "/jia-avatar.png"} alt="Jia Avatar" width={20} height={20} style={{ marginRight: 4, borderRadius: "50%" }} />
                {candidate.applicationMetadata?.action && candidate.applicationMetadata?.updatedBy ? `${candidate.applicationMetadata?.action} by ${candidate.applicationMetadata?.updatedBy?.name}` : "Assessed by JIA"}
                </div>
            </div>
        </div>
    );
}