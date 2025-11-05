"use client"
import Fuse from "fuse.js";
import React,{ useState, useEffect } from "react";
import CareerFit from "./CareerFit";
import CandidateHistory from "./CandidateHistory";
import CustomDropdown from "../Dropdown/CustomDropdown";
import { extractInterviewAssessment } from "@/lib/Utils";

const tableHeaderStyle: any = {
    textTransform: "none",
    fontWeight: 700,
    fontSize: 12,
    color: "#717680",
}

export default function DroppedCandidates({ timelineStage, handleDroppedCandidatesOpen, handleCandidateMenuOpen, handleCandidateCVOpen, handleReconsiderCandidate }: any) {
    const { stage, droppedCandidates } = timelineStage;
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [search, setSearch] = useState("");
    const [filterAssessment, setFilterAssessment] = useState("All Assessments");
    const [filterDroppedBy, setFilterDroppedBy] = useState("All");
    const assessmentOptions = ["All Assessments", "Not Fit", "Bad Fit", "Maybe Fit", "Good Fit", "Strong Fit"];
    const [droppedByOptions, setDroppedByOptions] = useState(["All", "Jia"]);
    const [showCandidateHistory, setShowCandidateHistory] = useState(false);
    const [sortBy, setSortBy] = useState("Recent Activity");
    const sortByOptions = [
        "Recent Activity", 
        "Oldest Activity", 
        "Alphabetical (A-Z)", 
        "Alphabetical (Z-A)"
    ];

    const fuseOptions = {
        keys: ["name"],
        threshold: 0.3,
    };

    useEffect(() => {
        if (droppedCandidates.length > 0) {
            const updatedCandidates = droppedCandidates.map((candidate) => {
                console.log(candidate);
                if (candidate.applicationStatus === "Cancelled") {
                    return candidate.name;
                }
                return candidate.applicationMetadata?.updatedBy?.name || "Jia";
            });
            setDroppedByOptions((prev) => [...new Set([...prev, ...updatedCandidates])]);
        }
    }, []);

    const filteredCandidates = React.useMemo(() => {
        let filtered = droppedCandidates;
        if (search) {
            const fuse = new Fuse(droppedCandidates, fuseOptions);
            filtered = fuse.search(search).map((result) => result.item);
        }

        if (filterAssessment !== "All Assessments") {
            filtered = filtered.filter((candidate) => candidate.currentStep === "CV Screening" ? candidate?.cvStatus === filterAssessment : candidate?.jobFit === filterAssessment);
        }

        if (sortBy === "Recent Activity") {
            filtered = filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }

        if (sortBy === "Oldest Activity") {
            filtered = filtered.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        }

        if (sortBy === "Alphabetical (A-Z)") {
            filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (sortBy === "Alphabetical (Z-A)") {
            filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        if (filterDroppedBy !== "All") {
            filtered = filtered.filter((candidate) => candidate.applicationStatus === "Cancelled" ? candidate.name === filterDroppedBy : (candidate.applicationMetadata?.updatedBy?.name || "Jia") === filterDroppedBy);
        }

        return filtered;
    }, [search, droppedCandidates, filterAssessment, filterDroppedBy, sortBy]);
    
    const handleSelectMenuOption = () => {
        handleCandidateMenuOpen(selectedCandidate);
        handleDroppedCandidatesOpen(false);
        setMenuOpen(!menuOpen);
    }

    const handleViewCV = () => {
        handleCandidateCVOpen(selectedCandidate);
        handleDroppedCandidatesOpen(false);
        setMenuOpen(!menuOpen);
    }

    const handleViewHistory = () => {
        setShowCandidateHistory(true);
        setMenuOpen(!menuOpen);
    }

    const getFormattedDate = (candidate: any) => {
        return candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";
    }
    
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
                 <div 
                className="modal-content" 
                style={{ overflowY: "auto", height: "80vh", maxWidth: "80vw", background: "#fff", border: `1.5px solid #E9EAEB`, borderRadius: 14, boxShadow: "0 8px 32px rgba(30,32,60,0.18)" }}>
                    <div className="modal-header" style={{ padding: "1.25rem 1.25rem 0 1.25rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <h3 className="modal-title">Dropped Candidates</h3>
                            <div style={{ borderRadius: "20px", border: "1px solid #D5D9EB", backgroundColor: "#F8F9FC", color: "#363F72", fontSize: "12px", padding: "0 10px" }}> {filteredCandidates?.length || 0}</div>
                            </div>
                            
                            <p style={{ fontSize: 14, fontWeight: 500, color: "#717680" }}>
                                {stage}
                            </p>
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => handleDroppedCandidatesOpen(false)}>
                          <i className="la la-times"></i>
                        </button>
                    </div>

                    <div className="modal-body" style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
                    {/* Search Bar and Filter */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 10 }}>
                            <CustomDropdown value={sortBy} setValue={setSortBy} options={sortByOptions} icon="la-sort-amount-down" />
                            <CustomDropdown value={filterAssessment} setValue={setFilterAssessment} options={assessmentOptions} icon="la-filter" />
                            <CustomDropdown value={filterDroppedBy} setValue={setFilterDroppedBy} options={droppedByOptions} icon="la-filter" valuePrefix="Dropped By:" />
                        </div>

                        <div className="table-search-bar">
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
                    <div className="layered-card-outer" style={{ height: "100%", overflowY: "auto" }}>
                    <div className="table-responsive" style={{ height: "100%", background: "#FFFFFF", borderRadius: "20px" }}>
                        <table className="table align-items-center table-flush" style={{ border: "1px solid #E9EAEB" }}>
                            <thead>
                                <tr>
                                <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                                    Candidate
                                </th>
                                <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                                    Assessment
                                </th>
                                <th scope="col" className="sort" data-sort="assessment" style={tableHeaderStyle}>
                                    Application Status
                                </th>
                                <th scope="col" className="sort" data-sort="dropped-by" style={tableHeaderStyle}>
                                    Dropped/Cancelled By
                                </th>
                                <th scope="col" className="sort" data-sort="date-dropped" style={tableHeaderStyle}>
                                    Date Dropped/Cancelled
                                </th>
                                <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length > 0 ? filteredCandidates.map((candidate: any) => (
                                    <tr key={candidate._id} style={{ cursor: "default" }}>
                                        <td>{candidate.name}</td>
                                        <td><CareerFit fit={candidate.currentStep === "CV Screening" || candidate?.stage === "Pending AI Interview" ? `CV: ${candidate?.cvStatus || "N/A"}` : `Interview: ${candidate?.jobFit || "N/A"}`} 
                                        assessment={candidate.currentStep === "CV Screening" || candidate?.stage === "Pending AI Interview" ? candidate?.cvScreeningReason : extractInterviewAssessment(candidate?.summary)} />
                                        </td>
                                        <td>{candidate.applicationStatus}</td>
                                        <td>{candidate.applicationStatus === "Cancelled" ? candidate.name : candidate.applicationMetadata?.updatedBy?.name || "Jia"}</td>
                                        <td>{getFormattedDate(candidate)}</td>
                                        <td>
                                            <div className="dropdown">
                                            <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => {
                                                setSelectedCandidate(candidate);
                                                setMenuOpen(!menuOpen);
                                            }}>
                                                <span>
                                                    <i className="la la-ellipsis-v" style={{ fontSize: "20px", color: "black" }}></i>
                                                </span>
                                            </button>
                                            {menuOpen && candidate._id === selectedCandidate?._id && (
                                                <div 
                                                className={`dropdown-menu dropdown-menu-right w-100 mt-1 org-dropdown-anim${
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
                                                    <div className="dropdown-item" onClick={() => handleSelectMenuOption()}>
                                                        <i className="la la-bolt" style={{ fontSize: 16, marginRight: 4 }}></i>
                                                        <span>View Analysis by Jia</span>
                                                    </div>
                                                    <div className="dropdown-item" onClick={() => handleViewCV()}>
                                                        <i className="la la-file-alt" style={{ fontSize: 16, marginRight: 4 }}></i>
                                                        <span>View CV</span>
                                                    </div>
                                                    <div className="dropdown-item" onClick={() => handleViewHistory()}>
                                                        <i className="la la-history" style={{ fontSize: 16, marginRight: 4 }}></i>
                                                        <span>View Application History</span>
                                                    </div>
                                                    {/* Dropdown divider */}
                                                    {candidate.applicationStatus !== "Cancelled" && 
                                                    <>
                                                    <div className="dropdown-divider"></div>
                                                    <div className="dropdown-item" onClick={() => {
                                                        handleReconsiderCandidate({...candidate, stage});
                                                        handleDroppedCandidatesOpen(false);
                                                    }}>
                                                        <i className="la la-user-check" style={{ fontSize: 16, marginRight: 4 }}></i>
                                                        <span>Reconsider Candidate</span>
                                                    </div>
                                                    </>}
                                                </div>
                                            )}
                                            </div>
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
                    </div>
                </div>
                </div>
            </div>
            {showCandidateHistory && <CandidateHistory candidate={selectedCandidate} setShowCandidateHistory={setShowCandidateHistory} />}
    </div>
    )
}