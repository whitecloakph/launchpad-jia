"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { candidateActionToast, errorToast, extractInterviewAssessment, formatDateToRelativeTime, getStage } from "@/lib/Utils";
import CareerFit from "../CareerComponents/CareerFit";
import AvatarImage from "../AvatarImage/AvatarImage";
import TableLoader from "../../Loader/TableLoader";
import CustomDropdown from "../Dropdown/CustomDropdown";
import useDebounce from "../../hooks/useDebounceHook";
import CandidateModal from "../CandidateComponents/CandidateModal";
import CustomDropdown2 from "../CareerComponents/CustomDropdown";
import Swal from "sweetalert2";
import ConfirmationModal from "../CandidateComponents/ConfirmationModal";
import { Tooltip } from "react-tooltip";

const tableHeaderStyle: any = {
    textTransform: "none",
    fontWeight: 700,
    fontSize: 12,
    color: "#717680",
}

export default function ToDoTable({ taskType, initialLoadRef }: { taskType: string, initialLoadRef: React.RefObject<boolean> }) {
    const { orgID, user } = useAppContext();
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [filterAssessment, setFilterAssessment] = useState("All Assessments");
    const assessmentOptions = ["All Assessments", "Insufficient Data", "Not Fit", "Bad Fit", "Maybe Fit", "Good Fit", "Strong Fit"];
    const [sortBy, setSortBy] = useState("Oldest First");
    const sortByOptions = [
        "Oldest First", 
        "Latest First",
        "Date Applied (Newest)",
        "Date Applied (Oldest)",
        "Alphabetical (A-Z)", 
        "Alphabetical (Z-A)"
    ];
    const [search, setSearch] = useState("");
    // debounce search
    const debouncedSearch = useDebounce(search, 500);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [filterPosition, setFilterPosition] = useState("All Careers");
    const [positionOptions, setPositionOptions] = useState([{ name: "All Careers" }]);
    const [showConfirmationModal, setShowConfirmationModal] = useState("");

    useEffect(() => {
        const initialLoad = async () => {
            try {
                if (initialLoadRef.current) {
                    setSearch("");
                    setFilterAssessment("All Assessments");
                    setFilterPosition("All Careers");
                    setSortBy("Oldest First");
                    setLoading(true);
                    const response = await axios.get("/api/get-pending-tasks", {
                        params: {
                            orgID,
                            search: "",
                            filterAssessment: "All Assessments",
                            sortBy: "Oldest First",
                            taskType,
                            filterPosition: "All Careers"
                        }
                    });
                    setCandidates(response.data);
                    const uniquePositions = [...new Set(response.data.map((candidate: any) => candidate.jobTitle))];
                    setPositionOptions([{ name: "All Careers" }, ...uniquePositions.map((position: string) => ({ name: position }))]);
                    initialLoadRef.current = false;
                }
            } catch (error) {
                console.error("Error fetching candidates:", error);
                errorToast("Error fetching CV Reviews", 1300);
            } finally {
                setLoading(false);
            }
        }

        if (orgID) {
            initialLoad();
        }
    }, [orgID, taskType])

    useEffect(() => {
        const fetchCVReviews = async () => {
            try {
                if (!initialLoadRef.current) {
                    console.log("fetching candidates", debouncedSearch, filterAssessment, sortBy, taskType, filterPosition);
                    setLoading(true);
                    const response = await axios.get("/api/get-pending-tasks", {
                        params: {
                            orgID,
                            search: debouncedSearch,
                            filterAssessment,
                            sortBy,
                            taskType,
                            filterPosition
                        }
                    });
                    setCandidates(response.data);
                }
            } catch (error) {
                console.error("Error fetching candidates:", error);
                errorToast("Error fetching CV Reviews", 1300);
            } finally {
                setLoading(false);
            }
        }

        if (orgID) {
            fetchCVReviews();
        }
    }, [orgID, taskType, debouncedSearch, filterAssessment, sortBy, filterPosition]);

    const handleRetakeInterview = async (action: string, candidate: any) => {
        setShowConfirmationModal(action);
        setSelectedCandidate(candidate);
    }

    const handleCandidateAction = async (action: string) => {
        setShowConfirmationModal("");
        if (action === "approve-retake") {
            Swal.showLoading();
            // reset interview data
            try {
                await axios.post("/api/reset-interview-data", {
                    id: selectedCandidate._id,
                });
                
                await axios.post("/api/update-interview", {
                    uid: selectedCandidate._id,
                    data: {
                        retakeRequest: {
                        status: "Approved",
                        updatedAt: Date.now(),
                        approvedBy: {
                            image: user.image,
                            name: user.name,
                            email: user.email,
                        },
                        },
                    },
                    interviewTransaction: {
                        interviewUID: selectedCandidate._id,
                        fromStage: getStage(selectedCandidate),
                        toStage: "Pending AI Interview",
                        action: "Endorsed",
                        updatedBy: {
                            image: user?.image,
                            name: user?.name,
                            email: user?.email,
                        },
                    },
                });
                Swal.close();
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Approved request</span>
                        <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have approved <strong>{selectedCandidate?.name}'s</strong> request to retake interview.</span>
                    </div>
                    </div>,
                    1300, 
                <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
                setTimeout(() => {
                    window.location.reload();
                }, 1300);
            } catch (error) {
                console.error("error", error);
                Swal.close();
                errorToast("Failed to approve request", 1300);
            }
        }

        if (action === "reject-retake") {      
            Swal.showLoading();
            try {
               
                await axios.post("/api/update-interview", {
                    uid: selectedCandidate._id,
                    data: {
                    retakeRequest: {
                        status: "Rejected",
                        updatedAt: Date.now(),
                        approvedBy: {
                        image: user.image,
                        name: user.name,
                        email: user.email,
                        },
                    },
                    },
                });
              
                Swal.close();
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Rejected request</span>
                        <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have rejected <strong>{selectedCandidate?.name}'s</strong> request to retake interview.</span>
                    </div>
                    </div>,
                    1300,
                <i className="la la-times-circle" style={{ color: "#D92D20", fontSize: 32 }}></i>)
                setTimeout(() => {
                    window.location.reload();
                }, 1300);
            } catch (error) {
                console.error("error", error);
                Swal.close();
                errorToast("Failed to reject request", 1300);
            }
        }
    }

    return (
        <>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
        <CustomDropdown value={sortBy} setValue={setSortBy} options={sortByOptions} icon="la-sort-amount-down" valuePrefix="Sort by:" />
        {taskType !== "retake-interview-requests" && <CustomDropdown value={filterAssessment} setValue={setFilterAssessment} options={assessmentOptions} icon="la-filter" />}
            </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "10px", width: taskType !== "retake-interview-requests" ? "60%" : "100%", justifyContent: "flex-end" }}>
        {taskType !== "retake-interview-requests" && <CustomDropdown2 screeningSetting={filterPosition} onSelectSetting={setFilterPosition} settingList={positionOptions} placeholder="Select Position" />}
        <div className="table-search-bar" style={{ width: "100%", maxWidth: "320px" }}>
            <div className="icon mr-2">
                <i className="la la-search"></i>
            </div>
            <input
                type="search"
                className="form-control ml-auto search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        </div>
        </div>
        {taskType === "cv-review" && <div className="layered-card-outer" style={{ height: "100%", overflowY: "auto" }}>
        <div className="table-responsive" style={{ height: "100%", background: "#FFFFFF", borderRadius: "20px" }}>
            <table className="table align-items-center table-flush" style={{ border: "1px solid #E9EAEB" }}>
                <thead>
                    <tr>
                    <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                        Name
                    </th>
                    <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                        Position Applied
                    </th>
                    <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                        CV Assessment
                    </th>
                    <th scope="col" className="sort" data-sort="dropped-by" style={tableHeaderStyle}>
                        Date Applied
                    </th>
                    <th scope="col" className="sort" data-sort="date-dropped" style={tableHeaderStyle}>
                        Time Elapsed
                    </th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                         <TableLoader type="career-applicants" />
                    ) : candidates.length > 0 ? candidates.map((candidate: any) => (
                        <tr key={candidate._id} style={{ cursor: "default" }}>
                            <td>
                                <div className="d-flex align-items-center" style={{ gap: "10px", cursor: "pointer" }} onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setShowCandidateModal(true);
                                }}>
                                    {candidate?.image && <AvatarImage src={candidate.image} alt="Candidate" />}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                        <span style={{ fontSize: "14px", fontWeight: 550 }}>{candidate?.name || ""}</span>
                                        <span style={{ fontSize: "12px", color: "#6B7280" }}>{candidate.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{candidate.jobTitle}</td>
                            <td><CareerFit 
                            fit={candidate.currentStep === "CV Screening" || candidate?.stage === "Pending AI Interview" ? `CV: ${candidate?.cvStatus || "N/A"}` : `AI Interview: ${candidate?.jobFit || "N/A"}`} 
                            assessment={candidate.currentStep === "CV Screening" || candidate?.stage === "Pending AI Interview" ? candidate?.cvScreeningReason : extractInterviewAssessment(candidate?.summary)} 
                            /></td>
                            <td>{candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                            <td>{formatDateToRelativeTime(new Date(candidate.updatedAt))}</td>
                        </tr>
                    )) : (
                        <tr style={{ cursor: "default", pointerEvents: "none" }}>
                            <td colSpan={5} className="text-center">No candidates found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>}

    {taskType === "interview-review" && <div className="layered-card-outer" style={{ height: "100%", overflowY: "auto" }}>
        <div className="table-responsive" style={{ height: "100%", background: "#FFFFFF", borderRadius: "20px" }}>
            <table className="table align-items-center table-flush" style={{ border: "1px solid #E9EAEB" }}>
                <thead>
                    <tr>
                    <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                        Name
                    </th>
                    <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                        Position Applied
                    </th>
                    <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                        Interview Assessment
                    </th>
                    <th scope="col" className="sort" data-sort="dropped-by" style={tableHeaderStyle}>
                        Date Interviewed
                    </th>
                    <th scope="col" className="sort" data-sort="dropped-by" style={tableHeaderStyle}>
                        Date Applied
                    </th>
                    <th scope="col" className="sort" data-sort="date-dropped" style={tableHeaderStyle}>
                        Time Elapsed
                    </th>
                    <th scope="col" className="sort"></th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                         <TableLoader type="interviews" />
                    ) : candidates.length > 0 ? candidates.map((candidate: any) => (
                        <tr key={candidate._id} style={{ cursor: "default" }}>
                            <td>
                           <div className="d-flex align-items-center" style={{ gap: "10px", cursor: "pointer" }} onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowCandidateModal(true);
                            }}>
                                {candidate?.image && <AvatarImage src={candidate.image} alt="Candidate" />}
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 550 }}>{candidate?.name || ""}</span>
                                    <span style={{ fontSize: "12px", color: "#6B7280" }}>{candidate.email}</span>
                                </div>
                            </div>
                            </td>
                            <td>{candidate.jobTitle}</td>
                            <td><CareerFit 
                            fit={candidate?.jobFit || "N/A"} 
                            assessment={extractInterviewAssessment(candidate?.summary)} 
                            /></td>
                            <td>{candidate.completedAt ? new Date(candidate.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                            <td>{candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                            <td>{formatDateToRelativeTime(new Date(candidate.completedAt))}</td>
                            <td>
                            <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => {
                                window.location.href = `/recruiter-dashboard/careers/manage/${candidate?.id}/interview-analysis/${candidate?.interviewID}`;
                            }}>
                            <i className="la la-external-link-alt" style={{ fontSize: 20, color: "#787486" }}></i>
                            </button>
                            </td>
                        </tr>
                    )) : (
                        <tr style={{ cursor: "default", pointerEvents: "none" }}>
                            <td colSpan={5} className="text-center">No candidates found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>}

    {taskType === "retake-interview-requests" && <div className="layered-card-outer" style={{ height: "100%", overflowY: "auto" }}>
        <div className="table-responsive" style={{ height: "100%", background: "#FFFFFF", borderRadius: "20px" }}>
            <table className="table align-items-center table-flush" style={{ border: "1px solid #E9EAEB" }}>
                <thead>
                    <tr>
                    <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                        Name
                    </th>
                    <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                        Position Applied
                    </th>
                    <th scope="col" className="sort" data-sort="dropped-by" style={tableHeaderStyle}>
                        Date Interviewed
                    </th>
                    <th scope="col" className="sort" data-sort="dropped-by" style={tableHeaderStyle}>
                        Reason for Retake Request
                    </th>
                    <th scope="col" className="sort" data-sort="date-dropped" style={tableHeaderStyle}>
                        Time Elapsed
                    </th>
                    <th scope="col" className="sort"></th>
                    <th scope="col" className="sort"></th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                         <TableLoader type="candidates" />
                    ) : candidates.length > 0 ? candidates.map((candidate: any) => (
                        <tr key={candidate._id} style={{ cursor: "default" }}>
                            <td>
                           <div className="d-flex align-items-center" style={{ gap: "10px", cursor: "pointer" }}  onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowCandidateModal(true);
                            }}>
                                {candidate?.image && <AvatarImage src={candidate.image} alt="Candidate" />}
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 550 }}>{candidate?.name || ""}</span>
                                    <span style={{ fontSize: "12px", color: "#6B7280" }}>{candidate.email}</span>
                                </div>
                            </div>
                            </td>
                            <td>{candidate.jobTitle}</td>
                            <td>{candidate.completedAt ? new Date(candidate.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                            <td style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "200px" }}>{candidate.retakeRequest?.reason || candidate.retakeRequest || "No reason provided"}</td>
                            <td>{formatDateToRelativeTime(new Date(candidate.completedAt))}</td>
                            <td>
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#B32318" }} onClick={() => {
                                handleRetakeInterview("reject-retake", candidate);
                            }}>
                             <i className="la la-times-circle" style={{ fontSize: 20 }}></i> Reject
                            </button>
                            </td>
                            <td>
                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#535862"}} onClick={() => {
                                handleRetakeInterview("approve-retake", candidate);
                            }}>
                             <i className="la la-check-circle" style={{ fontSize: 20 }}></i> Accept
                            </button>
                            </td>
                        </tr>
                    )) : (
                        <tr style={{ cursor: "default", pointerEvents: "none" }}>
                            <td colSpan={5} className="text-center">No candidates found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>}

    {showCandidateModal && <CandidateModal candidate={selectedCandidate} setShowCandidateModal={setShowCandidateModal} />}
    {showConfirmationModal && <ConfirmationModal action={showConfirmationModal} onAction={handleCandidateAction} />}
    <Tooltip className="career-fit-tooltip fade-in" id="career-fit-tooltip"/>
    </>
    )
}