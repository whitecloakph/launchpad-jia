"use client"
import React,{ useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import TableLoader from "../../Loader/TableLoader";
import useDebounce from "@/lib/hooks/useDebounceHook";
import ApplicantStatusBadge from "../CareerComponents/ApplicantStatusBadge";
import CandidateModal from "../CandidateComponents/CandidateModal";
import CustomDropdown from "../Dropdown/CustomDropdown";
import { errorToast } from "../../Utils";

const tableHeaderStyle: any = {
  textTransform: "none",
  fontWeight: 550
}

export default function CareerApplicantsTable({ slug }: {slug: string}) {
    const { orgID } = useAppContext();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [filterStatus, setFilterStatus] = useState("All Statuses");
    const [filterStage, setFilterStage] = useState("All Stages");
    const filterStatusOptions = ["All Statuses", "Ongoing", "Dropped", "Cancelled", "Hired"];
    const filterStageOptions = ["All Stages", "CV Review", "Pending AI Interview", "AI Interview Review", "For Human Interview", "Pending Job Interview", "Job Offered", "Contract Signed"];
    const [loading, setLoading] = useState(true);
    const [applicants, setApplicants] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplicants, setTotalApplicants] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const limit = 10;
    const [sortBy, setSortBy] = useState("Recent Activity");
    const sortByOptions = [
        "Recent Activity", 
        "Oldest Activity", 
        "Date Applied (Newest First)",
        "Date Applied (Oldest First)",
        "Alphabetical (A-Z)", 
        "Alphabetical (Z-A)"
    ];

    const fetchApplicants = async () => {
        try {
            if (!slug) return;
            setLoading(true);
            const response = await axios.get("/api/get-career-applicants", {
                params: {
                    careerID: slug,
                    page: currentPage,
                    limit: limit,
                    search: debouncedSearch,
                    filterStatus: filterStatus,
                    filterStage: filterStage,
                    sortBy: sortBy
                }
            });
            setApplicants(response.data.applicants);
            setTotalPages(response.data.totalPages);
            setTotalApplicants(response.data.totalApplicants);
        } catch (error) {
          console.error("Error fetching applicants:", error);
          errorToast("Error fetching applicants", 1300);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        if (orgID) {
            fetchApplicants();
        }
      }, [orgID, currentPage, slug, debouncedSearch, filterStatus, filterStage, sortBy]);
      
    return (
        <>
                    {/* Search Bar and Filter */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <CustomDropdown value={sortBy} setValue={(value) => {
                            setSortBy(value);
                            setCurrentPage(1);
                          }} options={sortByOptions} icon="la-sort-amount-down" />
                          <CustomDropdown value={filterStatus} setValue={(value) => {
                            setFilterStatus(value);
                            setCurrentPage(1);
                          }} options={filterStatusOptions} icon="la-filter" />
                           <CustomDropdown value={filterStage} setValue={(value) => {
                            setFilterStage(value);
                            setCurrentPage(1);
                          }} options={filterStageOptions} icon="la-filter" />
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
                            onChange={(e) => {
                              setSearch(e.target.value?.trim());
                              setCurrentPage(1);
                            }}
                        />
                    </div>
                    </div>
        <div className="layered-card-outer">
          {/* Card header */}
          <div className="layered-card-content" style={{ padding: 0 }}>
          <div style={{ margin: "15px 20px" }}>
            <h3 className="mb-0 mr-auto d-flex align-items-center" style={{ fontSize: "18px", fontWeight: 550, color: "#111827" }}>
              Applicants <div style={{ borderRadius: "20px", border: "1px solid #D5D9EB", backgroundColor: "#F8F9FC", color: "#363F72", fontSize: "12px", padding: "0 10px", marginLeft: "10px" }}> {totalApplicants}</div>
            </h3>
          </div>
            {/* Table */}
            <div className="table-responsive">
                {loading ? (
              <table className="table align-items-center table-flush">
              <thead>
                <tr>
                  <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                  Candidates
                  </th>
                  <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                  Application Status
                  </th>
                  <th scope="col" style={tableHeaderStyle}>Stage</th>
                  <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                    Date Applied
                  </th>
                  <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                    Stage Updated
                  </th>
                </tr>
              </thead>
              <tbody className="list">
                <TableLoader type="career-applicants" />
              </tbody>
            </table>
                ) :
            (<table className="table align-items-center table-flush">
                <thead>
                  <tr>
                    <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                      Candidates
                    </th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      Application Status
                    </th>

                    <th scope="col" style={tableHeaderStyle}>Stage</th>

                    <th scope="col" style={tableHeaderStyle}>Date Applied</th>

                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      Stage Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="list">
                    {/* Table Body */}
                    {applicants.length === 0 ? (
                    <tr style={{ cursor: "default", pointerEvents: "none" }}>
                      <td colSpan={8} className="text-center py-4" style={{ verticalAlign: "middle", height: "200px" }}>
                        <div className="d-flex justify-content-center align-items-center w-100 h-100" style={{ minHeight: "100px" }}>
                          No applicants found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    applicants.map((applicant: any) => (
                        <tr key={applicant._id} style={{ cursor: "auto" }}>
                            <td>
                            <div
                            onClick={() => {
                              setSelectedCandidate(applicant);
                              setCandidateDetailsOpen(true);
                          }}
                            className="candidate-card-section"
                            >
                              <img src={applicant?.image} alt={applicant?.name} style={{ width: 32, height: 32, borderRadius: "50%", background: "#E0E0E0" }} />
                              <div>
                                  <div style={{ fontWeight: 500, fontSize: 14 }}>{applicant?.name || ""}</div>
                                  <div style={{ fontSize: 12, color: "#787486" }}>{applicant?.email || ""}</div>
                              </div>
                            </div>
                            </td>
                            <td>
                            <ApplicantStatusBadge status={applicant?.applicationStatus || "Ongoing"} />
                            </td>
                            <td>{applicant.stage}</td>
                            <td>{applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                            <td>{applicant.updatedAt ? new Date(applicant.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                        </tr>
                    )))}
                </tbody>
            </table>)}
            <div className="d-flex justify-content-between align-items-center border-top" style={{ padding: "15px 20px" }}>
              <button 
              className={`btn btn-primary shadow-none ${currentPage === 1 ? "invisible" : ""}`} 
              style={{ backgroundColor: "white", color: "black", border: "1px solid lightgray", borderRadius: "60px" }}
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}>
                <i className="la la-arrow-left"></i> Previous
              </button>

              <div>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button 
                  key={index} 
                  className={`btn shadow-none ${currentPage === index + 1 ? "btn-primary" : ""}`} 
                  style={{ backgroundColor: currentPage === index + 1 ? "#F8F8F8": "white", color: "black", border: "none", fontSize: "14px", fontWeight: 550 }}
                  onClick={() => {
                    setCurrentPage(index + 1);
                  }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
              className={`btn btn-primary shadow-none ${currentPage >= totalPages ? "invisible" : ""}`} 
              style={{ backgroundColor: "white", color: "black", border: "1px solid lightgray", fontSize: "14px", fontWeight: 550, borderRadius: "60px" }}
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                }
              }}>
                <i className="la la-arrow-right"></i> Next
              </button>
            </div>
            </div>
            </div>
        </div>
        {candidateDetailsOpen && <CandidateModal candidate={selectedCandidate} setShowCandidateModal={setCandidateDetailsOpen} />}
        </>
    )
}