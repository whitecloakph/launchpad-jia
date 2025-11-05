"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import axios from "axios";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import { useAppContext } from "@/lib/context/AppContext";
import SuperAdminAccessGuard from "@/lib/components/SuperAdminAccessGuard";
import Swal from "sweetalert2";
import { FileUploader } from "react-drag-drop-files";
import CVScreeningTestAgent from "@/lib/components/WorkerComponents/CVScreeningTestAgent";
import { saveContentToFile } from "@/lib/Utils";
import moment from "moment";

export default function () {
  const [metrics, setMetrics] = useState([
    {
      name: "Pending CV Screening",
      value: 0,
      iconColor: "text-primary",
      icon: "la la-list",
    },
    {
      name: "Completed CV Screening",
      value: 0,
      iconColor: "text-primary",
      icon: "la la-check",
    },
    {
      name: "Passed CV Screening",
      value: 0,
      iconColor: "text-success",
      icon: "la la-check",
    },
    {
      name: "Failed CV Screening",
      value: 0,
      iconColor: "text-danger",
      icon: "la la-times",
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const { orgID } = useAppContext();
  const [loadingKey, setLoadingKey] = useState(0);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [completed, setCompleted] = useState(0);
  const [passed, setPassed] = useState(0);
  const [failed, setFailed] = useState(0);
  const [files, setFiles] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const [fileList, setFileList] = useState([]);

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedJobTitle = localStorage.getItem("cvScreeningJobTitle");
    const savedJobDescription = localStorage.getItem(
      "cvScreeningJobDescription"
    );

    if (savedJobTitle) {
      setJobTitle(savedJobTitle);
    }
    if (savedJobDescription) {
      setJobDescription(savedJobDescription);
    }
  }, []);

  // Save jobTitle to localStorage when it changes
  useEffect(() => {
    if (jobTitle) {
      localStorage.setItem("cvScreeningJobTitle", jobTitle);
    }
  }, [jobTitle]);

  // Save jobDescription to localStorage when it changes
  useEffect(() => {
    if (jobDescription) {
      localStorage.setItem("cvScreeningJobDescription", jobDescription);
    }
  }, [jobDescription]);

  const runTest = () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      // Sweet Alert error
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in both job title and job description before running the test.",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }

    if (!files) {
      Swal.fire({
        icon: "error",
        title: "Upload CV Files",
        text: "Please upload at least one CV file before running the test.",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }

    // Proceed with test execution
    console.log("Running test with:", { jobTitle, jobDescription });

    let analysisNodes = document.querySelectorAll(".btn-cv-screen-test");

    analysisNodes.forEach((node: any, index: number) => {
      setTimeout(() => {
        node.click();
      }, index * 400);
    });
  };

  function downloadCSVResults() {
    let csvContent =
      "Applicant Name, Email, CV Screen Grade, CV Screen Analysis, Job Fit Score, AI Assessment Confidence\n";

    let csvNodes = document.querySelectorAll(".cv-screen-csv");

    csvNodes.forEach((node: any) => {
      if (node.value) {
        csvContent += node.value + "\n";
      }
    });

    let resultsFileName = `[Jia] CV Screening Test Results | ${jobTitle} | ${moment().format(
      "MMM-DD-YYYY hh-mm-ss A"
    )}.csv`;

    saveContentToFile(csvContent, resultsFileName);
  }

  const handleChange = (fileSet: any) => {
    setFiles(fileSet);

    setMetrics([
      {
        name: "Pending CV Screening",
        value: fileSet.length,
        iconColor: "text-primary",
        icon: "la la-list",
      },
      {
        name: "Completed CV Screening",
        value: completed ? completed : 0,
        iconColor: "text-primary",
        icon: "la la-check",
      },
      {
        name: "Passed CV Screening",
        value: passed ? passed : 0,
        iconColor: "text-success",
        icon: "la la-check",
      },
      {
        name: "Failed CV Screening",
        value: failed ? failed : 0,
        iconColor: "text-danger",
        icon: "la la-times",
      },
    ]);

    console.log(fileSet);

    // Convert fileSet to array and set it to fileList
    const fileArray = Array.from(fileSet);
    setFileList(fileArray);
  };

  function correlateProcessStatus() {
    let progress = 0;

    let totalNodes = document.querySelectorAll(".btn-cv-screen-test").length;

    let totalResultBlocks = document.querySelectorAll(".cvp-exp-block").length;

    let totalPassed =
      document.querySelectorAll(".state-accepted").length +
      document.querySelectorAll(".state-good").length;

    let totalFailed = document.querySelectorAll(".state-rejected").length;

    progress = (totalResultBlocks / totalNodes) * 100;

    setOverallProgress(progress);

    setCompleted(totalResultBlocks);

    setMetrics([
      {
        name: "Pending CV Screening",
        value: totalNodes - totalResultBlocks,
        iconColor: "text-primary",
        icon: "la la-list",
      },
      {
        name: "Completed CV Screening",
        value: totalResultBlocks,
        iconColor: "text-primary",
        icon: "la la-check",
      },
      {
        name: "Passed CV Screening",
        value: totalPassed,
        iconColor: "text-success",
        icon: "la la-check",
      },
      {
        name: "Failed CV Screening",
        value: totalFailed,
        iconColor: "text-danger",
        icon: "la la-times",
      },
    ]);

    // Check for error agents and scroll them into view
    let errorAgents = document.querySelectorAll(".cv-tester-agent.agent-error");

    if (errorAgents.length > 0) {
      errorAgents.forEach((agent, index) => {
        setTimeout(() => {
          agent.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, index * 400);
      });
    }
  }

  useEffect(() => {
    if (orgID) {
      setIsLoading(true);
      setLoadingKey((k) => k + 1);
    }
    setIsLoading(false);
  }, [orgID]);

  return (
    <>
      <AuthGuard />
      <SuperAdminAccessGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>CV Screening Test | Jia - WhiteCloak Technologies</title>
        <Sidebar activeLink="Dashboard" />

        {/* Main content */}
        <div className="main-content" id="panel">
          {/* Topnav */}
          <NavBar />
          {/* Header */}
          <div className="header gradient-1 pb-7">
            <div className="container-fluid">
              <div className="header-body">
                <div className="row align-items-center py-4">
                  <div className="col-lg-6 col-7">
                    <h6 className="h2 text-white d-inline-block mb-0">
                      CV Screening Test
                    </h6>
                    <nav
                      aria-label="breadcrumb"
                      className="d-none d-md-inline-block ml-md-4"
                    >
                      <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <i className="fas fa-home"></i>
                          </a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="#">Super Admin</a>
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Page content */}
          <div className="container-fluid mt--6">
            <div className="card-set mb-4">
              {isLoading
                ? [0, 1, 2, 3].map((index) => (
                    <div
                      className="dashboard-card card shadow-1"
                      key={`loading-${loadingKey}-${index}`}
                    >
                      {/* Skeleton Loader */}
                      <div
                        className="skeleton-bar blink-2 mt-2"
                        style={{ width: "60%" }}
                      />
                      <div
                        className="skeleton-bar blink-2 ml-auto mt-3"
                        style={{ width: "40%", height: 32 }}
                      />
                    </div>
                  ))
                : metrics.map((x, index) => {
                    return (
                      <div
                        className="dashboard-card card shadow-1 fade-in-bottom"
                        style={{ animationDelay: `${index * 200}ms` }}
                        key={index}
                      >
                        <h4 className="mt-2">
                          <i className={`la la-square ${x.iconColor}`} />{" "}
                          {x.name}
                        </h4>
                        <h1 className="ml-auto">
                          <i
                            className={`la la-cubes ${x.iconColor} ${x.icon}`}
                          />{" "}
                          {x.value}
                        </h1>
                      </div>
                    );
                  })}
            </div>

            <div className="thread-set px-0 mx-0">
              <div className="left-thread">
                <button
                  id="correlate-status-btn"
                  className="btn btn-primary d-none"
                  onClick={correlateProcessStatus}
                >
                  Corellate Status
                </button>
                {jobTitle && jobDescription && files && (
                  <>
                    <div className="card shadow-1">
                      <div className="card-header">
                        <i className="la la-bars text-primary mr-2" />
                        <strong>CV Screening Overview</strong>
                      </div>
                      <div className="card-body">
                        <h1>
                          <i className="la la-briefcase mr-2 ml-2 la la-chevron-circle-right text-primary" />
                          {jobTitle}
                        </h1>
                        <span>
                          CV Screening Test Progress: {completed}/{files.length}
                        </span>
                        <div className="progress">
                          <div
                            className="bar bg-gradient-primary"
                            style={{ width: `${overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {files && files.length > 0 && (
                  <>
                    {fileList.map((file, index) => {
                      return (
                        <CVScreeningTestAgent
                          fileData={files[index]}
                          index={index}
                          fileItem={file}
                          jobTitle={jobTitle}
                          jobDescription={jobDescription}
                        />
                      );
                    })}

                    <hr></hr>
                  </>
                )}

                <div className="card shadow-1">
                  <div className="card-header">
                    <i className="la la-bars text-primary mr-2" />
                    <strong>
                      Upload CV Files - Upload multiple (files, .pdf, .docx,
                      .doc, .txt)
                    </strong>
                  </div>
                  <div className="card-body mx-auto">
                    <div
                      style={{
                        transform: "scale(1.5)",
                        position: "relative",
                        top: "8px",
                      }}
                    >
                      <FileUploader
                        handleChange={handleChange}
                        name="file"
                        multiple={true}
                        types={["PDF", "DOCX", "DOC", "TXT"]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="right-thread">
                <div className="top-card">
                  <div className="card shadow-1 ">
                    <div className="card-header">
                      <i className="la la-bars text-primary mr-2" />
                      <strong>Screening Test Controls</strong>
                    </div>

                    <div className="card-body">
                      <div className="form-group">
                        <label
                          htmlFor="jobTitle"
                          className="form-control-label"
                        >
                          Job Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="jobTitle"
                          placeholder="Enter job title"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label
                          htmlFor="jobDescription"
                          className="form-control-label"
                        >
                          Job Description
                        </label>
                        <textarea
                          className="form-control"
                          id="jobDescription"
                          rows={4}
                          placeholder="Enter job description"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          style={{ height: "220px !important" }}
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <button
                          type="button"
                          className="btn btn-primary btn-block"
                          onClick={runTest}
                        >
                          <i className="la la-play mr-2"></i>
                          Run CV Screening Test
                        </button>

                        {overallProgress === 100 && (
                          <button
                            type="button"
                            className="btn btn-default btn-block"
                            onClick={downloadCSVResults}
                          >
                            <i className="la la-download text-info mr-2"></i>
                            Download CSV Results
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="footer pt-0 mt-7">
              <div className="row align-items-center justify-content-lg-between">
                <div className="col-lg-6">
                  <div className="copyright text-center text-lg-left text-muted">
                    © {new Date().getFullYear()}{" "}
                    <a
                      href="https://www.whitecloak.com"
                      className="font-weight-bold ml-1"
                      target="_blank"
                    >
                      WhiteCloak Technologies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
