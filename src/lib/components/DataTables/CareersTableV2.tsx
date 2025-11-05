"use client";

import TableLoader from "@/lib/Loader/TableLoader";
import moment from "moment";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import useDebounce from "../../hooks/useDebounceHook";
import CareerStatus from "../CareerComponents/CareerStatus";
import { deleteCareer, candidateActionToast, errorToast } from "@/lib/Utils";
import CustomDropdown from "../Dropdown/CustomDropdown";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Tooltip } from "react-tooltip";

const tableHeaderStyle: any = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#717680",
  textTransform: "none",
}

export default function CareersV2Table() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orgID, user } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCareers, setTotalCareers] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const filterStatusOptions = ["All Statuses", "Published", "Unpublished"];
  const [sortBy, setSortBy] = useState("Recent Activity");
  const sortByOptions = {
    // Default sort
    "Recent Activity": {
      key: null,
      direction: "ascending",
    }, 
    "Oldest Activity": {
      key: "lastActivityAt",
      direction: "ascending",
    }, 
    "Date Created (Newest First)": {
      key: "createdAt",
      direction: "descending",
    }, 
    "Date Created (Oldest First)": {
      key: "createdAt",
      direction: "ascending",
    }, 
    "Most Hired": {
      key: "hired",
      direction: "descending",
    },
    "Least Hired": {
      key: "hired",
      direction: "ascending",
    },
    "Most Dropped": {
      key: "dropped",
      direction: "descending",
    },
    "Least Dropped": {
      key: "dropped",
      direction: "ascending",
    },
    "Most Ongoing": {
      key: "interviewsInProgress",
      direction: "descending",
    },
    "Least Ongoing": {
      key: "interviewsInProgress",
      direction: "ascending",
    },
    "Alphabetical (A-Z)": {
      key: "jobTitle",
      direction: "ascending",
    },
    "Alphabetical (Z-A)": {
      key: "jobTitle",
      direction: "descending",
    },
  };
  const [activeOrg, setActiveOrg] = useLocalStorage("activeOrg", null);
  const [availableJobSlots, setAvailableJobSlots] = useState(0);
  const [totalActiveCareers, setTotalActiveCareers] = useState(0);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const orgDetails = await axios.post("/api/feth-org-details", {
          orgID: activeOrg._id,
        });
        setAvailableJobSlots((orgDetails.data?.plan?.jobLimit || 3) + (orgDetails.data?.extraJobSlots || 0));
      } catch (error) {
        console.error("Error fetching org details:", error);
        errorToast("Error fetching organization details", 1500);
      }
    }
      if (activeOrg) {
        fetchOrgDetails();
    }
  }, [activeOrg]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  }

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/get-careers", {
          params: {
            userEmail: user?.email,
            orgID,
            page: currentPage,
            limit,
            search: debouncedSearch,
            sortConfig: sortConfig.key ? JSON.stringify(sortConfig) : null,
            status: filterStatus,
          },
        });
        setCareers(response.data.careers);
        setTotalPages(response.data.totalPages);
        setTotalCareers(response.data.totalCareers);
        setTotalActiveCareers(response.data.totalActiveCareers);
      } catch (error) {
        console.error("Error fetching careers:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orgID) {
      fetchCareers();
    }
  }, [orgID, currentPage, debouncedSearch, sortConfig, filterStatus]);

  return (
    <>
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "35px"}}>
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Careers</h1>
      <span style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}>View all your company’s careers here.</span>
    </div>

    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
    <a 
    href="/recruiter-dashboard/careers/new-career"
    data-tooltip-id="add-career-tooltip"
    data-tooltip-html={`You have reached the maximum number of jobs for your plan. Please upgrade your plan to add more jobs.`}
    >
    <button className="button-primary-v2"
    disabled={totalActiveCareers >= availableJobSlots}
    style={{ 
      opacity: totalActiveCareers >= availableJobSlots ? 0.5 : 1, 
      cursor: totalActiveCareers >= availableJobSlots ? "not-allowed" : "pointer"
    }}
    >
      <i className="la la-plus" /> Add new career
    </button>
    </a>
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
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
      />
  </div>
    </div>
  </div>
    <div className="row" style={{ marginBottom: "50px" }}>
      <div className="col">
        <div className="layered-card-outer">
          <div className="layered-card-content" style={{ padding: 0 }}>
          {/* Card header */}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "15px 20px" }}>
            <div className="mb-0 d-flex align-items-center" style={{ gap: "10px" }}>
              <div style={{ fontSize: "18px", fontWeight: 550, color: "#111827" }}>
                List of Careers
              </div>
              <div style={{ borderRadius: "20px", border: "1px solid #D5D9EB", backgroundColor: "#F8F9FC", color: "#363F72", fontSize: "12px", padding: "0 10px" }}>{totalCareers}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
              {/* Status button */}
              <CustomDropdown value={filterStatus} setValue={setFilterStatus} options={filterStatusOptions} icon="la-filter" />
              {/* Sort by button */}
              <CustomDropdown value={sortBy} setValue={(value) => {
                setSortBy(value);
                setSortConfig({ key: sortByOptions[value].key, direction: sortByOptions[value].direction });
                setCurrentPage(1);
              }} options={Object.keys(sortByOptions)} icon="la-sort-amount-down" valuePrefix="Sort by:" />   
            </div>
          </div>
          {/* Light table */}
          <div className="table-responsive">
            {loading ? (
              <table className="table align-items-center table-flush">
                <thead>
                  <tr>
                    <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                      Job Title
                    </th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      Status
                    </th>
                    <th scope="col" style={tableHeaderStyle}>Ongoing</th>
                    <th scope="col" style={tableHeaderStyle}>Dropped</th>
                    <th scope="col" style={tableHeaderStyle}>Hired</th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      Date Created
                    </th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      Last Updated
                    </th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody className="list">
                  <TableLoader type="careers-v2" />
                </tbody>
              </table>
            ) : (
              <table className="table align-items-center table-flush">
                <thead>
                  <tr>
                    <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="jobTitle" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Job Title
                    </th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="status" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Status
                    </th>

                    <th scope="col" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="interviewsInProgress" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Ongoing
                    </th>

                    <th scope="col" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="dropped" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Dropped
                    </th>

                    <th scope="col" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="hired" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Hired
                    </th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="createdAt" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Date Created
                    </th>
                    <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                      {/* <SortColumnButton columnName="lastActivityAt" sortConfig={sortConfig} requestSort={requestSort} /> */}
                      Last Updated
                    </th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody className="list">
                  {careers.length === 0 ? (
                    <tr style={{ cursor: "default", pointerEvents: "none" }}>
                      <td colSpan={8} className="text-center py-4" style={{ verticalAlign: "middle", height: "200px" }}>
                        <div className="d-flex justify-content-center align-items-center w-100 h-100" style={{ minHeight: "100px" }}>
                          No job titles found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    careers.map((item) => (
                      <tr
                        key={item._id}
                        onClick={(e) => {
                          if (e.defaultPrevented) return;
                          e.preventDefault();
                          window.location.href = `/recruiter-dashboard/careers/manage/${item._id}`;
                        }}
                      >
                        <th scope="row" style={{ maxWidth: "300px", whiteSpace: "initial" }}>
                          <div className="media align-items-center">
                            <div className="media-body">
                              <h3 className="name mb-0 text-sm" style={{ fontSize: "16px", fontWeight: 550, color: "#111827" }}>
                                {item.jobTitle}
                              </h3>
                            </div>
                          </div>
                        </th>
                        <td>
                        <CareerStatus status={item.status} />
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center">
                            <span>
                              {item.interviewsInProgress || 0}
                            </span>
                          </div>
                        </td>

                        <td>
                        <div className="d-flex justify-content-center align-items-center">
                            <span>
                              {item.dropped || 0}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="d-flex justify-content-center align-items-center">
                            <span>
                              {item.hired || 0}
                            </span>
                          </div>
                        </td>

                        <td>{moment(item.createdAt).format("MMM DD, YYYY")}</td>
                        <td>{item.lastActivityAt ? moment(item.lastActivityAt).format("MMM DD, YYYY") : "N/A"}</td>
                        <td>
                        <div className="dropdown">
                        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => {
                            if (e.defaultPrevented) return;
                            e.preventDefault();
                            setSelectedCareer(item);
                            setMenuOpen(!menuOpen);
                        }}>
                            <i className="la la-ellipsis-h" style={{ fontSize: 16, color: "#787486" }}></i>
                        </button>
                        {menuOpen && selectedCareer?._id === item._id && (
                          <div 
                          className={`dropdown-menu dropdown-menu-right w-100 mt-1 org-dropdown-anim${
                              menuOpen ? " show" : ""
                              }`}
                          style={{
                              padding: "10px 15px"
                          }}
                          >
                            <div className="dropdown-item" onClick={(e) => {
                                if (e.defaultPrevented) return;
                                e.preventDefault();
                                setMenuOpen(false);
                                window.location.href = `/recruiter-dashboard/careers/manage/${item._id}?tab=edit`;
                            }}>
                                <span>Edit Career</span>
                            </div>

                            <div className="dropdown-item" onClick={(e) => {
                                if (e.defaultPrevented) return;
                                e.preventDefault();
                                setMenuOpen(false);
                                let careerRedirection = "applicant";
                                if (item.orgID === "682d3fc222462d03263b0881") {
                                    careerRedirection = "whitecloak";
                                }
                                navigator.clipboard.writeText(`https://www.hellojia.ai/${careerRedirection}/job-openings/${item._id}`);
                                candidateActionToast(
                                  "Career Link Copied to Clipboard",
                                  1300,
                                  <i className="la la-link mr-1 text-info"></i>
                                );
                            }}>
                                <span>Copy Career Link</span>
                            </div>

                            <div className="dropdown-divider"></div>

                            <div className="dropdown-item" style={{ color: "#B42318" }} onClick={(e) => {
                                if (e.defaultPrevented) return;
                                e.preventDefault();
                                setMenuOpen(false);
                                deleteCareer(item._id);
                            }}>
                                <span>Delete Career</span>
                            </div>
                            </div>
                        )}
                        </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center border-top" style={{ padding: "15px 20px" }}>
              <button 
              className={`btn btn-primary shadow-none ${currentPage === 1 ? "invisible" : ""}`} 
              style={{ backgroundColor: "white", color: "black", border: "1px solid lightgray" }}
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
                  style={{ backgroundColor: currentPage === index + 1 ? "#F8F8F8": "white", color: "black", border: "none", fontSize: "14px", fontWeight: 550, borderRadius: "60px" }}
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
      </div>
    </div>
    {totalActiveCareers >= availableJobSlots && <Tooltip className="career-fit-tooltip fade-in" id="add-career-tooltip"/>}
    </>
  );
}

function SortColumnButton({ columnName, sortConfig, requestSort }: { columnName: string, sortConfig: any, requestSort: (key: string) => void }) {
  return (
    <button
    className={`btn btn-sm ${sortConfig.key === columnName ? "btn-primary" : "btn-white"} mr-1`}
    onClick={() => requestSort(columnName)}
    >
      <i className={`la la-sort${sortConfig.key === columnName ? sortConfig.direction === "ascending" ? "-up" : "-down" : ""}`}></i>
    </button>
  )
}
