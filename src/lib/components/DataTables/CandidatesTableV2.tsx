"use client";
import React,{ useState, useEffect } from "react";
import AvatarImage from "../AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import Swal from "sweetalert2";
import CareerFit from "../CareerComponents/CareerFit";
import CandidateModal from "../CandidateComponents/CandidateModal";
import useDebounce from "../../hooks/useDebounceHook";
import ApplicantStatusBadge from "../CareerComponents/ApplicantStatusBadge";
import CustomDropdown from "../Dropdown/CustomDropdown";
import { Tooltip } from "react-tooltip";
import { extractInterviewAssessment } from "@/lib/Utils";

export default function CandidatesTableV2() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const { orgID } = useAppContext();
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All Application Statuses");
    const [filterStatusOpen, setFilterStatusOpen] = useState(false);
    const filterStatusOptions = ["All Application Statuses", "Ongoing", "Dropped", "Cancelled", "Hired"];
    const [sortBy, setSortBy] = useState("Recent Activity");
    const [sortByOpen, setSortByOpen] = useState(false);
    const sortByOptions = ["Recent Activity", "Oldest Activity", "Alphabetical (A-Z)", "Alphabetical (Z-A)"];

    useEffect(() => {
    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/get-candidates", { params: { orgID, filterStatus, search: debouncedSearch, sortBy } })
            setCandidates(response.data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text: "Failed to fetch candidates",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (orgID) {
        fetchCandidates();
    }
    }, [orgID, filterStatus, debouncedSearch, sortBy]);

    const handleCandidateClick = (candidate: any) => {
        setSelectedCandidate(candidate);
        setShowCandidateModal(true);
    }

    return (
        <>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "35px" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Candidates</h1>
                <div style={{ borderRadius: "60px", border: "1px solid lightgray", backgroundColor: "#F8F9FC", color: "#363F72", fontSize: "12px", padding: "5px 10px" }}> {candidates.length} total</div>
                </div>
                <span>See the list of candidates across all your job openings here.</span>
        </div>
        <div className="row" style={{ marginBottom: "50px" }}>
        <div className="col">
          <div className="card shadow-none border-0">
            {/* Card header */}
            <div className="card-header border-0 justify-content-between">
              <div className="mb-0 d-flex align-items-center" style={{ gap: "10px" }}>
            {/* Sort by button */}
            <CustomDropdown value={sortBy} setValue={setSortBy} options={sortByOptions} icon="la-sort-amount-down" valuePrefix="Sort by:" />
            {/* Application status button */}
            <CustomDropdown value={filterStatus} setValue={(value) => {
                            setFilterStatus(value);
                          }} options={filterStatusOptions} icon="la-filter" />
                
              </div>
              <div className="table-search-bar" style={{ minWidth: "300px" }}>
                    <div className="icon mr-2">
                        <i className="la la-search"></i>
                    </div>
                    <input
                        type="search"
                        className="form-control ml-auto search-input"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value?.trim());
                        }}
                    />
                </div>
            </div>
            <div className="table-responsive">
                 <table className="table align-items-center table-flush">
                    <tbody className="list">
                         {candidates.length > 0 ? candidates.map((candidate, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    style={{
                                        border: "1px solid #E9EAEB",
                                        height: "75px",
                                    }}
                                    onClick={() => handleCandidateClick(candidate)}
                                >
                                    <td style={{padding: "0 16px" }}>
                                        <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                            {candidate.interviews?.[0]?.image && <AvatarImage src={candidate.interviews[0].image} alt="Candidate" />}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                <span style={{ fontSize: "14px", fontWeight: 550 }}>{candidate.interviews?.[0]?.name || ""}</span>
                                                <span style={{ fontSize: "12px", color: "#6B7280" }}>{candidate.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{padding: "0 16px"}}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                            <span>Last active</span>
                                            <span style={{ fontSize: "12px", color: "#6B7280" }}>{new Date(candidate.activeAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                        </div>
                                    </td>
                                    <td style={{padding: "0 16px"}}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                            <span>Application Status</span>
                                            <ApplicantStatusBadge status={candidate.candidateStatus} />
                                        </div>
                                    </td>
                                    <td style={{padding: "0 16px"}}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                            <span>Active Applications</span>
                                            <CandidateActiveApplications candidate={candidate} />
                                        </div>
                                    </td>
                                </tr>
                                {/* Spacer row for vertical space between table rows */}
                                {index < candidates.length - 1 && (
                                    <tr style={{ height: "12px", background: "transparent" }}>
                                        <td colSpan={4} style={{ padding: 0, border: "none", background: "transparent" }}></td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center">
                                    <span>No candidates found</span>
                                </td>
                            </tr>
                        )}
                </tbody>
            </table>
            {showCandidateModal && <CandidateModal candidate={selectedCandidate} setShowCandidateModal={setShowCandidateModal} />}
            </div>
          </div>
        </div>
      </div>
      <Tooltip className="career-fit-tooltip fade-in" id="career-fit-tooltip"/>
      </>
    )
}

function CandidateActiveApplications({ candidate }: { candidate: any }) {
    const getApplicationStatus = (candidate: any) => {
        if (candidate.interviews?.[0]?.currentStep === "Applied") {
            return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px", color: "#414651", border: "1px solid #E9EAEB", backgroundColor: "#F5F5F5", borderRadius: "60px", padding: "2px 10px", fontSize: "12px" }}>
                <i className="la la-exclamation-triangle" style={{ fontSize: "12px", color: "#414651" }}></i>
                <span>No CV Uploaded</span>
            </div>)
        }
        return (<CareerFit 
            fit={candidate.interviews?.[0]?.currentStep === "CV Screening" || candidate?.interviews?.[0]?.status?.includes("For Interview") ? `CV: ${candidate.interviews?.[0]?.cvStatus || "N/A"}` : `Interview: ${candidate.interviews?.[0]?.jobFit || "N/A"}`} 
            assessment={candidate.interviews?.[0]?.currentStep === "CV Screening" || candidate?.interviews?.[0]?.status?.includes("For Interview") ? candidate.interviews?.[0]?.cvScreeningReason : extractInterviewAssessment(candidate.interviews?.[0]?.summary)}
            />)
    }
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
            {["Cancelled","Dropped"].includes(candidate.candidateStatus) ? (
                <span>N/A</span>
            ) : <>
            <span>{candidate.interviews?.[0]?.jobTitle}</span>
            {getApplicationStatus(candidate)}
            {candidate.interviews?.length > 1 && <>
            <div style={{ width: "1px", height: "10px", backgroundColor: "#EAECF5", margin: "0 5px" }} />
            <span style={{ fontSize: "12px", color: "#717680" }}>+{candidate.interviews.length - 1} more roles</span>
            </>}
            </>}
        </div>
    )
}
