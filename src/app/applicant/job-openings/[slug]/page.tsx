"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import { guid } from "@/lib/Utils";
import OrgInfoTag from "@/lib/components/CareerComponents/OrgInfoTag";

export default function () {
  const [jobDetails, setJobDetails] = useState(null);
  const { slug } = useParams();
  const { user } = useAppContext();

  async function fetchJobDetails() {
    const response = await axios.post(`/api/job-details`, { jobId: slug });

    if (response.data) {
      document.title = `${response.data.jobTitle} | Job Opening | Jia`;
    }

    setJobDetails(response.data);
  }

  const applyForJob = async (job) => {
    let jobApplication = {
      ...job,
      userId: user._id,
      name: user.name,
      image: user.image,
      email: user.email,
      currentStep: "Applied",
      status: "For CV Upload",
      applicationStatus: "Ongoing",
      createdAt: new Date(),
      updatedAt: new Date(),
      interviewID: guid(),
      completedAt: null,
    };

    delete jobApplication._id;

    console.log(jobApplication);

    Swal.fire({
      title: "Please wait",
      text: "We are applying for the job",
      icon: "info",
      allowOutsideClick: false,
    });

    Swal.showLoading();

    await axios
      .post("/api/apply-job", jobApplication)
      .then((res) => {
        if (res.data.error) {
          Swal.fire({
            title: res.data.error,
            text: res.data.message,
            icon: "error",
          });
          return false;
        }

        Swal.fire({
          title: "Success",
          text: `You have applied for the ${job.jobTitle} role`,
          icon: "success",
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = "/applicant";
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  return (
    <div className="container-fluid mt--6">
      <div className="card shadow-1">
        {/* Job Header Sticky */}
        <div className="career-header">
          <div className="career-info-header">
            {jobDetails !== null ? (
              <div
                className="job-openings-header mt-5"
                style={{ marginLeft: "-15px", marginRight: "-15px" }}
              >
                <div className="job-info-header-left">
                  <h1>{jobDetails?.jobTitle}</h1>
                  <p>
                    {jobDetails?.hiringStatus || "Hiring"} |{" "}
                    {new Date(jobDetails?.createdAt).toLocaleDateString() ||
                      "May 2025"}
                  </p>

                  {jobDetails?.workSetup && (
                    <strong>
                      <i className="la la-map-marker mr-1 text-primary"></i>{" "}
                      {jobDetails?.location} | {jobDetails?.workSetup}{" "}
                      {jobDetails?.workSetupRemarks}
                    </strong>
                  )}
                </div>
                <div className="job-info-header-right">
                  <OrgInfoTag orgID={jobDetails?.orgID} labelText="Posted By" />
                  <button
                    onClick={() => {
                      applyForJob(jobDetails);
                    }}
                    className="btn btn-primary"
                    style={{ padding: "6px 30px", fontSize: "16px" }}
                  >
                    <i className="la la-briefcase mr-1"></i> Apply Now
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginLeft: "-15px", marginRight: "-15px" }}>
                <div
                  style={{
                    width: "100%",
                    float: "left",
                    padding: "15px 15px",
                    position: "relative",
                  }}
                >
                  <div className="skeleton-bar"></div>
                  <br />
                  <div className="skeleton-bar"></div>
                </div>
                <div
                  style={{
                    width: "30%",
                    float: "left",
                    padding: "15px 15px",
                    position: "relative",
                  }}
                >
                  <div className="skeleton-bar"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Job Description */}
        <div
          style={{
            margin: "0 auto",
            width: "75%",
            maxWidth: "960px",
          }}
          className="pb-8"
        >
          <div style={{ marginLeft: "-15px", marginRight: "-15px" }}>
            {jobDetails !== null ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  padding: "0 15px",
                  position: "relative",
                  marginTop: "30px",
                }}
              >
                <h2>Job Description</h2>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {jobDetails?.description}
                </p>
              </div>
            ) : (
              <div
                style={{
                  width: "66%",
                  float: "left",
                  padding: "0 15px",
                  position: "relative",
                }}
              >
                <div className="skeleton-bar"></div>
                <br />
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="skeleton-bar"
                    style={{ width: "100%", marginBottom: "15px" }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
}
