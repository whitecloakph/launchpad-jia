"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { formatDateToRelativeTime } from "@/lib/Utils";
import Link from "next/link";
import { OrgType } from "@/lib/components/Dropdown/JobDropDown";
import TableLoader from "@/lib/Loader/TableLoader";

export default function () {
  const [allJobOpenings, setAllJobOpenings] = useState([]);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orgList, setOrgList] = useState([]);

  // Fuse.js options for searching careers
  const fuseOptions = {
    keys: ["jobTitle"],
    threshold: 0.3,
  };

  // Set up selectedOrg state, default to 'All Organizations' compatible with OrgType
  const [selectedOrg, setSelectedOrg] = useState<OrgType>({
    id: "all",
    _id: "all",
    name: "All Organizations",
    image: "",
  });

  // Fetch all jobs only once on mount
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      const response = await axios.post("/api/job-openings");
      setAllJobOpenings(response.data);
      setIsLoading(false);
    };
    fetchJobs();
  }, []);

  // Filtered careers based on search and selected org
  const filteredCareers = React.useMemo(() => {
    let jobs =
      selectedOrg._id === "all"
        ? allJobOpenings
        : jobOpenings.filter((job) => job.orgID === selectedOrg._id);

    if (!search) return jobs;
    const fuse = new Fuse(jobs, fuseOptions);
    return fuse.search(search).map((result) => result.item);
  }, [search, jobOpenings, selectedOrg, allJobOpenings]);

  useEffect(() => {
    async function fetchOrg() {
      const response = await axios.get("/api/get-org");
      setOrgList(response.data);
    }
    fetchOrg();
  }, []);

  return (
    <div className="container-fluid">
      <div className="card shadow-1">
        <div className="card-header border-0">
          <h3 className="mb-0 mr-auto">
            <i className="la la-list text-primary mr-2" /> Job Openings
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
        <div
          className="job-list"
          style={{
            maxHeight: "100%",
            width: "100%",
            border: "none",
            borderTop: "2px solid #ddd",
            borderRadius: "0px",
          }}
        >
          {isLoading ? (
            <TableLoader type="job-openings" />
          ) : filteredCareers.length > 0 ? (
            filteredCareers.map((job, index) => (
              <Link href={`/whitecloak/job-openings/${job._id}`} key={index}>
                <div className="job-item">
                  <div className="job-title">
                    <h2>{job.jobTitle}</h2>
                    <small>
                      <i className="la la-briefcase"></i> Posted{" "}
                      {formatDateToRelativeTime(new Date(job?.createdAt))}
                    </small>
                  </div>

                  <div className="cta">
                    <span>Learn More</span>
                    <i className="la la-arrow-circle-right"></i>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div
              className="d-flex justify-content-center align-items-center w-100 h-100"
              style={{ minHeight: "200px" }}
            >
              No job openings found
            </div>
          )}
        </div>
      </div>
      <br />
      <br />
    </div>
  );
}
