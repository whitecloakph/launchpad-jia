"use client";

import TableLoader from "@/lib/Loader/TableLoader";
import moment from "moment";
import Fuse from "fuse.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";

export default function () {
  const { orgID } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const fuseOptions = {
    keys: ["applicantInfo.name", "applicantInfo.email"],
    threshold: 0.3,
  };

  // Filtered data based on search
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    const fuse = new Fuse(data, fuseOptions);
    return fuse.search(search).map((result) => result.item);
  }, [search, data]);

  const fetchAllCandidates = () => {
    axios.post("/api/fetch-applicants", { orgID }).then((res) => {
      setData(res.data);
      setIsLoading(false);
    });
  };

  // Generate DiceBear avatar URL
  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/6.x/shapes/svg?seed=${encodeURIComponent(
      name
    )}`;
  };

  useEffect(() => {
    if (orgID) {
      fetchAllCandidates();
    }
  }, [orgID]);

  return (
    <div className="row">
      <div className="col">
        <div className="card shadow-1">
          <div className="card-header border-0">
            <h3 className="mb-0 mr-auto">
              <i className="la la-list text-primary mr-2" /> All Applicants
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
                  <th scope="col" className="sort" data-sort="name">
                    Applicant Name
                  </th>
                  <th scope="col" className="sort" data-sort="budget">
                    Email
                  </th>
                  <th scope="col" className="sort" data-sort="status">
                    Date Started
                  </th>

                  <th scope="col" className="sort" data-sort="status">
                    Action
                  </th>
                  {/* <th scope="col" className="sort" data-sort="status">
                    Last Seen
                  </th> */}
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody className="list">
                {isLoading && <TableLoader type="candidates" />}

                {!isLoading &&
                  (filteredData.length === 0 ? (
                    <tr>
                      <td
                        className="text-center py-4"
                        colSpan={5}
                        style={{
                          verticalAlign: "middle",
                          height: "200px",
                        }}
                      >
                        <div
                          className="d-flex justify-content-center align-items-center w-100 h-100"
                          style={{ minHeight: "100px" }}
                        >
                          No applicants found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item._id}>
                        <th scope="row">
                          <div className="media align-items-center">
                            <AvatarImage
                              alt="Applicant avatar"
                              src={
                                item.applicantInfo.image ||
                                getAvatarUrl(
                                  item.applicantInfo.name || "Applicant"
                                )
                              }
                              className="avatar avatar-md rounded-circle mr-2"
                            />
                            <div className="media-body">
                              <span className="name mb-0 text-sm">
                                {item.applicantInfo.name || "Unknown Applicant"}
                              </span>
                            </div>
                          </div>
                        </th>
                        <td className="budget">
                          {item.applicantInfo.email || "Not specified"}
                        </td>
                        <td>
                          {moment(item.createdAt).format("MMMM DD, YYYY") ||
                            "Not started"}
                        </td>

                        <td>
                          <a href={`/dashboard/candidates/view-cv/${item._id}`}>
                            <button className="btn btn-sm btn-primary">
                              <span>
                                <i className="la la-file"></i> View CV
                              </span>
                            </button>
                          </a>
                        </td>

                        <td className="text-right">
                          <div className="dropdown">
                            <a
                              className="btn btn-sm btn-icon-only text-light"
                              href="#"
                              role="button"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </a>
                            <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                              <a className="dropdown-item" href="#">
                                View Details
                              </a>
                              <a className="dropdown-item" href="#">
                                Edit
                              </a>
                              <a className="dropdown-item" href="#">
                                Delete
                              </a>
                            </div>
                          </div>
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
