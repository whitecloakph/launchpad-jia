"use client";

import TableLoader from "@/lib/Loader/TableLoader";
import moment from "moment";
import Fuse from "fuse.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";

export default function CareersTable() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { orgID } = useAppContext();

  // Fuse.js options for searching careers
  const fuseOptions = {
    keys: ["jobTitle"],
    threshold: 0.3,
  };

  // Filtered careers based on search
  const filteredCareers = React.useMemo(() => {
    if (!search) return careers;
    const fuse = new Fuse(careers, fuseOptions);
    return fuse.search(search).map((result) => result.item);
  }, [search, careers]);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/fetch-careers", { orgID });
      const activeOrg = localStorage.activeOrg;

      if (activeOrg) {
        const parsedActiveOrg = JSON.parse(activeOrg);

        if (parsedActiveOrg.role == "admin") {
          setCareers(response.data);
        }

        if (parsedActiveOrg.role == "hiring_manager") {
          const filteredData = response.data.filter((data) =>
            parsedActiveOrg.careers.includes(data.id)
          );
          setCareers(filteredData);
        }
      } else {
        setCareers(response.data);
      }
    } catch (error) {
      console.error("Error fetching careers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgID) {
      fetchCareers();
    }
  }, [orgID]);

  return (
    <div className="row">
      <div className="col">
        <div className="card shadow-1">
          {/* Card header */}
          <div className="card-header border-0">
            <h3 className="mb-0 mr-auto">
              <i className="la la-list text-primary mr-2" /> List of Careers
            </h3>

            <a href="/dashboard/careers/new-career">
              <button className="btn btn-primary">
                <i className="la la-plus" /> Add New Career
              </button>
            </a>

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
            {loading ? (
              <table className="table align-items-center table-flush">
                <thead className="thead-light">
                  <tr>
                    <th scope="col" className="sort" data-sort="name">
                      Job Title
                    </th>
                    <th scope="col" className="sort" data-sort="status">
                      Status
                    </th>
                    <th scope="col">Contributors</th>
                    <th scope="col" className="sort" data-sort="status">
                      Date Created
                    </th>
                    <th scope="col" className="sort" data-sort="status">
                      Last Updated
                    </th>
                    <th scope="col" className="sort" data-sort="completion">
                      Actions
                    </th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody className="list">
                  <TableLoader type="careers" />
                </tbody>
              </table>
            ) : (
              <table className="table align-items-center table-flush">
                <thead className="thead-light">
                  <tr>
                    <th scope="col" className="sort" data-sort="name">
                      Job Title
                    </th>
                    <th scope="col" className="sort" data-sort="status">
                      Status
                    </th>

                    <th scope="col">Contributors</th>
                    <th scope="col" className="sort" data-sort="status">
                      Date Created
                    </th>
                    <th scope="col" className="sort" data-sort="status">
                      Last Updated
                    </th>
                    <th scope="col" className="sort" data-sort="completion">
                      Actions
                    </th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody className="list">
                  {filteredCareers.length === 0 ? (
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
                          No job titles found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCareers.map((item) => (
                      <tr
                        key={item._id}
                        onClick={() => {
                          window.location.href = `/dashboard/careers/manage/${item._id}`;
                        }}
                      >
                        <th scope="row">
                          <div className="media align-items-center">
                            <div className="media-body">
                              <h3 className="name mb-0 text-sm">
                                {item.jobTitle}
                              </h3>
                            </div>
                          </div>
                        </th>
                        <td>
                          <strong
                            style={{
                              color:
                                item.status === "active" ? "#5bb573" : "salmon",
                            }}
                          >
                            <i className={`la la-square`}></i>{" "}
                            <span className="status text-uppercase">
                              {item.status}
                            </span>
                          </strong>
                        </td>
                        <td>
                          <div className="avatar-group">
                            <AvatarImage
                              alt="Member avatar"
                              src={`${item.createdBy.image}`}
                              className="avatar avatar-sm rounded-circle"
                              title={`Creator: ${item.createdBy.name}`}
                            />
                            <AvatarImage
                              alt="Member avatar"
                              src={`${item.lastEditedBy.image}`}
                              className="avatar avatar-sm rounded-circle"
                              title={`Last Updated: ${item.lastEditedBy.name}`}
                            />
                          </div>
                        </td>

                        <td>{moment(item.createdAt).format("MMM DD, YYYY")}</td>
                        <td>{moment(item.updatedAt).format("MMM DD, YYYY")}</td>
                        <td>
                          <a href={`/dashboard/careers/manage/${item._id}`}>
                            <button className="btn btn-sm btn-default">
                              <span>
                                <i className="la la-edit"></i> Manage
                                <i className="la la-arrow-right"></i>
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
                                Action
                              </a>
                              <a className="dropdown-item" href="#">
                                Another action
                              </a>
                              <a className="dropdown-item" href="#">
                                Something else here
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
