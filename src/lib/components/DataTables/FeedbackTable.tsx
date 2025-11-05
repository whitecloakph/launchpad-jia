"use client";

import TableLoader from "@/lib/Loader/TableLoader";
import moment from "moment";
import Fuse from "fuse.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";

export default function FeedbackTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const { orgID } = useAppContext();

  const fuseOptions = {
    keys: ["rating", "feedback"],
    threshold: 0.3,
  };

  // Filtered data based on search
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    const fuse = new Fuse(data, fuseOptions);
    return fuse.search(search).map((result) => result.item);
  }, [search, data]);

  const fetchAllFeedback = () => {
    axios.post("/api/fetch-feedback", { orgID }).then((res) => {
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

  useEffect(() => {
    if (orgID) {
      setIsLoading(true);
      fetchAllFeedback();
    }
  }, [orgID]);

  // Helper to get name and jobTitle from feedback
  const getName = (item) => item?.interviewDetails?.name || "-";
  const getPosition = (item) => item?.interviewDetails?.jobTitle || "-";
  const getInterviewID = (item) => item?.interviewID;

  return (
    <div className="row">
      <div className="col">
        <div className="card shadow-1">
          <div className="card-header border-0">
            <h3 className="mb-0 mr-auto">
              <i className="la la-comments text-primary mr-2" /> Feedback
            </h3>

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
                  <th scope="col">Name</th>
                  <th scope="col">Position</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Comment</th>
                  <th scope="col">Date</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <TableLoader type="feedback" />}
                {!isLoading &&
                  (filteredData.length === 0 ? (
                    <tr>
                      <td
                        className="text-center py-4"
                        colSpan={6}
                        style={{ verticalAlign: "middle", height: "200px" }}
                      >
                        <div
                          className="d-flex flex-column justify-content-center align-items-center w-100 h-100"
                          style={{ minHeight: "100px" }}
                        >
                          <span style={{ color: "#d1d5db" }}>
                            <i
                              className="la la-inbox"
                              style={{ fontSize: 48 }}
                            ></i>
                          </span>
                          <div
                            className="mt-2 mb-1 font-weight-bold"
                            style={{ color: "#6c757d" }}
                          >
                            No feedback yet
                          </div>
                          <div className="text-muted">
                            Feedback submissions will appear here.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const interviewID = getInterviewID(item);
                      return (
                        <tr
                          key={item._id}
                          style={{
                            cursor: interviewID ? "pointer" : "default",
                          }}
                          onClick={(e) => {
                            // Only redirect if not clicking the button
                            const target = e.target as HTMLElement;
                            if (target.tagName !== "BUTTON" && interviewID) {
                              window.location.href = `/dashboard/interviews/manage/${interviewID}`;
                            }
                          }}
                        >
                          <td>{getName(item)}</td>
                          <td>{getPosition(item)}</td>
                          <td>{item.rating != null ? item.rating : "-"}</td>
                          <td title={item.feedback || "-"}>
                            {item.feedback
                              ? item.feedback.length > 60
                                ? item.feedback.slice(0, 60) + "..."
                                : item.feedback
                              : "-"}
                          </td>
                          <td>
                            {item.createdAt
                              ? moment(item.createdAt).format("MMMM DD, YYYY")
                              : "-"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {interviewID && (
                              <button
                                className="btn btn-sm btn-primary"
                                style={{
                                  background: "#5e39d6",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "0.45em 1.1em",
                                  fontWeight: 600,
                                  fontSize: 16,
                                  boxShadow: "0 2px 8px #5e39d633",
                                  transition:
                                    "background 0.18s, box-shadow 0.18s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                }}
                                title="View Interview Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/dashboard/interviews/manage/${interviewID}`;
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#4629b6")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background = "#5e39d6")
                                }
                              >
                                <span
                                  style={{
                                    fontSize: 18,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <i className="la la-arrow-right" />
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
