"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import ApplicationStatusStep from "@/lib/components/InterviewComponents/ApplicationStatusStep";
import { useAppContext } from "@/lib/context/AppContext";
import GradientBorder from "../GradientBorder";
import Swal from "sweetalert2";
import { getStatusBadge } from "@/lib/Utils";

export default function () {
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppContext();
  // Fuse.js options for searching careers
  const fuseOptions = {
    keys: ["jobTitle"],
    threshold: 0.3,
  };

  const filterInterviews = (interviews, search) => {
    if (search && search !== "") {
      const fuse = new Fuse(interviews, fuseOptions);
      return fuse.search(search).map((result) => result.item);
    }
    return interviews;
  };

  // Filtered careers based on search
  const filteredCompletedInterviews = React.useMemo(() => {
    return filterInterviews(completedInterviews, search);
  }, [search, completedInterviews]);

  const filteredUpcomingInterviews = React.useMemo(() => {
    return filterInterviews(upcomingInterviews, search);
  }, [search, upcomingInterviews]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/fetch-interviews", {
        email: user.email,
      });
      const upcomingInterviews = response.data.filter(
        (interview) => interview.status === "For Interview"
      );
      const completedInterviews = response.data.filter(
        (interview) => interview.status !== "For Interview"
      );

      setCompletedInterviews(response.data);
      // setUpcomingInterviews(upcomingInterviews);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching job openings:", error);
    }
  };

  const startInterview = (job) => {
    window.location.href = `/interview/${job.interviewID}`;
  };

  async function requestRetake(jobInfo: any) {
    Swal.fire({
      title: "Request Retake",
      text: `Your interview for ${jobInfo.jobTitle} seems to have enough information, Please tell us why you want to retake the interview.`,
      icon: "info",
      input: "textarea",
      confirmButtonText: "Submit Request",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return "Please provide a reason for requesting a retake.";
        }
        if (value.trim().length < 10) {
          return "Please provide a more detailed reason (at least 10 characters).";
        }
        return null;
      },
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.value) {
        // flag request

        Swal.fire({
          title: "Please wait",
          text: "We are processing your request...",
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        let requestResponse = await axios
          .post("/api/update-interview", {
            uid: jobInfo._id,
            data: {
              updatedAt: Date.now(),
              completedAt: Date.now(),
              status: "Action Required",
              retakeRequest: {
                reason: result.value,
                status: "Pending",
                createdAt: Date.now(),
                approvedBy: null,
                approvedAt: null,
              },
            },
          })

          .then((res) => {
            return "done";
          })
          .catch((err) => {
            return "error";
          });

        if (requestResponse === "done") {
          Swal.fire({
            title: "Request Submitted",
            text: "Your request has been submitted. Please wait for the admin to approve it.",
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while submitting your request. Please try again later.",
            icon: "error",
          }).then(() => {
            window.location.reload();
          });
        }
      }
    });
  }

  async function retakeInterview(jobInfo) {
    if (jobInfo.interviewDuration < 5) {
      // clear transcript first
      Swal.fire({
        title: "Preparing Interview...",
        text: "Please wait while we reset the Interview for you to re-take. Please make sure that you have better internet connection.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await axios.post("/api/reset-interview-data", {
          id: jobInfo._id,
        });

        if (response.data.success) {
          startInterview(jobInfo);
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.error || "Failed to reset the Interview",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error deleting Interview:", error);
        Swal.fire({
          title: "Error!",
          text: "An error occurred while deleting the Interview",
          icon: "error",
        });
      }
    } else {
      requestRetake(jobInfo);
    }
  }

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="container-fluid mt--6">
      {/* Search Bar */}
      <div className="d-flex justify-content-end align-items-center mb-3">
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
      {/* Upcoming Interviews */}
      {/* <div className="card shadow-1" style={{ marginBottom: "30px" }}>
        <div className="card-header border-0 d-flex align-items-center">
          <h3 className="mb-0 mr-auto">
            <i className="la la-calendar-check-o text-primary mr-2" /> Upcoming
            Interviews
          </h3>
        </div>
        <div className="application-list">
          {isLoading ? (
            <div className="application-list blink-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="application-item" key={index}>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="job-title">
                      <h2>
                        <div
                          className="skeleton-bar"
                          style={{ animationDuration: "2.3s" }}
                        ></div>
                      </h2>
                    </div>
                    <div className="cta">
                      <span>
                        <div className="skeleton-bar"></div>
                      </span>
                      <i className="la la-arrow-circle-right"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUpcomingInterviews.length > 0 ? (
            filteredUpcomingInterviews.map((job, index) => (
              <div
                className="application-item"
                key={index}
                style={{ flexDirection: "column" }}
              >
                <div className="job-item">
                  <div className="job-info">
                    <div className="job-title">
                      <h2>{job.jobTitle}</h2>
                    </div>

                    {job.status === "For Interview" && (
                      <GradientBorder>
                        <button
                          className="btn btn-default"
                          onClick={() => {
                            startInterview(job);
                          }}
                        >
                          <span>Start Interview</span>
                          <i className="la la-arrow-circle-right text-info"></i>
                        </button>
                      </GradientBorder>
                    )}
                  </div>
                </div>
                <ApplicationStatusStep job={job} />
              </div>
            ))
          ) : (
            <div
              className="d-flex justify-content-center align-items-center w-100 h-100"
              style={{ minHeight: "200px" }}
            >
              No upcoming interviews found
            </div>
          )}
        </div>
      </div> */}

      {/* Completed Interviews */}
      <div className="card shadow-1">
        <div className="card-header border-0 d-flex align-items-center">
          <h3 className="mb-0 mr-auto">
            <i className="la la-list text-primary mr-2" /> Completed Interviews
          </h3>
        </div>
        <div className="application-list">
          {isLoading ? (
            <div className="application-list blink-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="application-item" key={index}>
                  <div className="job-item">
                    <div className="job-info">
                      <div className="job-title">
                        <h2>
                          <div
                            className="skeleton-bar"
                            style={{ animationDuration: "2.3s" }}
                          ></div>
                        </h2>
                      </div>
                      <div className="cta">
                        <span>
                          <div className="skeleton-bar"></div>
                        </span>
                        <i className="la la-arrow-circle-right"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCompletedInterviews.length > 0 ? (
            filteredCompletedInterviews.map((job, index) => (
              <div
                className="application-item"
                key={index}
                style={{ flexDirection: "column" }}
              >
                <div className="job-item">
                  <div className="job-info">
                    <div className="job-title">
                      <h2>{job.jobTitle}</h2>
                    </div>

                    {job.interviewDuration &&
                      job.stateClass === "state-accepted" &&
                      !job.retakeRequest &&
                      job.status !== "Accepted" && (
                        <button
                          className="btn btn-muted"
                          onClick={() => {
                            retakeInterview(job);
                          }}
                        >
                          <span>
                            <i className="la la-microphone text-primary" />{" "}
                            Retake Interview
                          </span>
                        </button>
                      )}

                    {!job.retakeRequest && (
                      <span>
                        <strong className="tag-text">
                          <i
                            className={`${getStatusBadge(
                              job.status
                            )} la la-square`}
                          />{" "}
                          {job.status}
                        </strong>
                      </span>
                    )}

                    {job.retakeRequest && (
                      <span>
                        <strong className="tag-text">
                          <i className={`la la-square text-primary`} /> Retake
                          Request: {job.retakeRequest.status}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
                <ApplicationStatusStep job={job} />

                {job.status == "For CV Upload" && (
                  <div style={{ alignSelf: "flex-end" }}>
                    <GradientBorder>
                      <button
                        className="btn btn-default"
                        onClick={() => {
                          sessionStorage.setItem(
                            "selectedCareer",
                            JSON.stringify(job)
                          );
                          window.location.href =
                            "/dashboard/upload-cv";
                        }}
                      >
                        <span>Submit CV</span>
                        <i className="la la-arrow-circle-right text-info"></i>
                      </button>
                    </GradientBorder>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div
              className="d-flex justify-content-center align-items-center w-100 h-100"
              style={{ minHeight: "200px" }}
            >
              No completed interviews found
            </div>
          )}
        </div>
      </div>
      <br />
      <br />
    </div>
  );
}
