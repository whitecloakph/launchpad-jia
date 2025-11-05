"use client";

import TableLoader from "@/lib/Loader/TableLoader";
import moment from "moment";
import Fuse from "fuse.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";
import CVScreeningBadge from "@/lib/components/WorkerComponents/CVScreeningBadge";
import { getStatusBadge } from "@/lib/Utils";
export default function () {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const { orgID } = useAppContext();

  const fuseOptions = {
    keys: ["name", "jobTitle", "status", "score", "jobFit", "cvStatus"],
    threshold: 0.3,
  };

  // Filtered data based on search
  const filteredData = React.useMemo(() => {
    // Apply search filter
    let filtered = data;
    if (search) {
      const fuse = new Fuse(data, fuseOptions);
      filtered = fuse.search(search).map((result) => result.item);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        // Get the values to compare
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases
        if (
          sortConfig.key === "createdAt" ||
          sortConfig.key === "completedAt"
        ) {
          // For dates, convert to timestamps for comparison
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          // For strings, use localeCompare for proper alphabetical sorting
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // For numbers and timestamps
        if (sortConfig.direction === "ascending") {
          return aValue - bValue;
        }
        return bValue - aValue;
      });
    }

    return filtered;
  }, [search, data, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortButtonClass = (columnName) => {
    if (sortConfig.key === columnName) {
      return "btn btn-sm btn-primary mr-1";
    }
    return "btn btn-sm btn-white mr-1";
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <i className="la la-sort" />;
    }
    return sortConfig.direction === "ascending" ? (
      <i className="la la-sort-up" />
    ) : (
      <i className="la la-sort-down" />
    );
  };

  const fetchAllInterviews = () => {
    axios.post("/api/all-interviews", { orgID }).then((res) => {
      const activeOrg = localStorage.activeOrg;

      if (activeOrg) {
        const parsedActiveOrg = JSON.parse(activeOrg);

        if (parsedActiveOrg.role == "admin") {
          setData(res.data);
        }

        if (parsedActiveOrg.role == "hiring_manager") {
          const filteredData = res.data.filter((data) =>
            parsedActiveOrg.careers.includes(data.id)
          );

          setData(filteredData);
        }
      } else {
        setData(res.data);
      }
      setIsLoading(false);
    });
  };

  async function rerunCVScreening() {
    console.log("Rerun CV Screening");

    let redoBtns: any = document.querySelectorAll(".redo-cv-screening");

    for (let i = 0; i < redoBtns.length; i++) {
      redoBtns[i].click();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  useEffect(() => {
    if (orgID) {
      fetchAllInterviews();
    }
  }, [orgID]);

  return (
    <div className="row">
      <button
        className="datafetch-btn d-none"
        onClick={fetchAllInterviews}
      ></button>
      <div className="col">
        <div className="card shadow-1">
          <div className="card-header border-0">
            <h3 className="mb-0 mr-auto">
              <i className="la la-list text-primary mr-2" /> Applicant CV
              Screening
            </h3>

            <button className="btn btn-primary" onClick={rerunCVScreening}>
              <span>
                <i className="la la-list" /> Rerun Screening
              </span>
            </button>

            <div className="table-search">
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
          {/* Light table */}
          <div className="table-responsive">
            <table className="table align-items-center table-flush">
              <thead className="thead-light">
                <tr>
                  <th scope="col">
                    <button
                      className={getSortButtonClass("name")}
                      title="Sort by Candidate Name"
                      onClick={() => requestSort("name")}
                    >
                      {getSortIcon("name")}
                    </button>{" "}
                    <span>Candidate</span>
                  </th>

                  <th scope="col">
                    <button
                      className={getSortButtonClass("jobTitle")}
                      title="Sort by Role"
                      onClick={() => requestSort("jobTitle")}
                    >
                      {getSortIcon("jobTitle")}
                    </button>{" "}
                    <span>Role</span>
                  </th>
                  <th scope="col">
                    <button
                      className={getSortButtonClass("status")}
                      title="Sort by Status"
                      onClick={() => requestSort("status")}
                    >
                      {getSortIcon("status")}
                    </button>{" "}
                    <span>Status</span>
                  </th>
                  <th scope="col">
                    <button
                      className={getSortButtonClass("score")}
                      title="Sort by Score"
                      onClick={() => requestSort("score")}
                    >
                      {getSortIcon("cvStatus")}
                    </button>{" "}
                    <span>CV Screening</span>
                  </th>
                  <th scope="col">
                    <button
                      className={getSortButtonClass("completedAt")}
                      title="Sort by Completion Date"
                      onClick={() => requestSort("completedAt")}
                    >
                      {getSortIcon("completedAt")}
                    </button>{" "}
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="list">
                {isLoading && <TableLoader type="interviews" />}

                {!isLoading &&
                  (filteredData.length === 0 ? (
                    <tr>
                      <td
                        className="text-center py-4"
                        colSpan={7}
                        style={{
                          verticalAlign: "middle",
                          height: "200px",
                        }}
                      >
                        <div
                          className="d-flex justify-content-center align-items-center w-100 h-100"
                          style={{ minHeight: "100px" }}
                        >
                          No candidates found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr
                        key={item._id}
                        // onClick={() => {
                        //   window.location.href = `/dashboard/interviews/manage/${item.interviewID}`;
                        // }}
                      >
                        <th scope="row" className="user-cell">
                          <div className="media align-items-center">
                            <a href="#" className="avatar rounded-circle mr-3">
                              <AvatarImage
                                alt="Project avatar"
                                src={item.image}
                              />
                            </a>
                            <div className="media-body">
                              <span className="name mb-0 text-sm">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        </th>
                        <td className="adaptive-cell">
                          <strong>{item.jobTitle}</strong>
                        </td>

                        <td>
                          <span className="tag-text">
                            <i
                              className={`la la-square  ${getStatusBadge(
                                item.status
                              )}`}
                            ></i>{" "}
                            <strong className="status text-uppercase ">
                              {item.status}
                            </strong>
                          </span>
                        </td>
                        <td>
                          <CVScreeningBadge interviewData={item} />
                        </td>
                        <td
                          title={moment(item.completedAt).format(
                            "MMMM D, YYYY - hh:mm:ss A"
                          )}
                        >
                          {item.completedAt && (
                            <>{moment(item.completedAt).fromNow()}</>
                          )}

                          {!item.completedAt && <>N/A</>}
                        </td>
                      </tr>
                    ))
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
