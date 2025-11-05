"use client";

import React, { useState } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import axios from "axios";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import InterviewQuestionGenerator from "@/lib/components/CareerComponents/InterviewQuestionGenerator";
import ScreeningSettingDropdown from "@/lib/components/Dropdown/ScreeningSettingDropdown";
import VideoRecordingSettingButton from "@/lib/components/CareerComponents/VideoRecordingSettingButton";
import { workSetupOptions } from "@/lib/Utils";

export default function Dashboard() {
  // Get user data from AppContext
  const { user, isAuthenticated, orgID } = useAppContext();
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [workSetup, setWorkSetup] = useState("");
  const [workSetupRemarks, setWorkSetupRemarks] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: 1,
      category: "CV Validation / Experience",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 2,
      category: "Technical",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 3,
      category: "Behavioral",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 4,
      category: "Analytical",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 5,
      category: "Others",
      questionCountToAsk: null,
      questions: [],
    },
  ]);
  const [screeningSetting, setScreeningSetting] =
    useState("Good Fit and above");
  const [requireVideo, setRequireVideo] = useState(true);

  async function addCareer() {
    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };

    Swal.fire({
      title: "Adding career...",
      text: "Please wait while we add the career...",
      allowOutsideClick: false,
    });

    const response = await axios.post("/api/add-career", {
      jobTitle,
      description,
      location,
      workSetup,
      workSetupRemarks,
      questions,
      lastEditedBy: userInfoSlice,
      createdBy: userInfoSlice,
      screeningSetting,
      orgID,
      requireVideo,
    });

    console.log(response);

    if (response.status === 200) {
      Swal.fire({
        title: "Success",
        text: "Career added successfully",
        icon: "success",
        allowOutsideClick: false,
      }).then(() => {
        setJobTitle("");
        setDescription("");
        setLocation("");
        setWorkSetup("");
        setWorkSetupRemarks("");
        setQuestions([]);
        window.location.href = "/dashboard/careers";
      });
    }
  }

  return (
    <>
      <AuthGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Add New Career | Jia - WhiteCloak Technologies</title>
        <Sidebar activeLink="Careers" />

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
                      Add New Career
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
                          <a href="/dashboard">Dashboard</a>
                        </li>

                        <li className="breadcrumb-item">
                          <a href="/dashboard/careers">Careers</a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="/dashboard/careers/new-career">New Career</a>
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
            <div className="thread-set">
              <div className="left-thread">
                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-list text-primary mr-2" /> Career
                      Information
                    </h3>
                  </div>

                  <div className="card-body">
                    <strong>Job Title</strong>
                    <input
                      className="form-control"
                      placeholder="Title"
                      onChange={(e) => {
                        setJobTitle(e.target.value || "");
                      }}
                    ></input>
                    <strong>Location</strong>
                    <input
                      className="form-control"
                      placeholder="Work Location"
                      onChange={(e) => {
                        setLocation(e.target.value || "");
                      }}
                    ></input>
                    <strong>Work Setup</strong>
                    <select
                      className="form-control"
                      onChange={(e) => {
                        setWorkSetup(e.target.value || "");
                      }}
                      value={workSetup}
                    >
                      <option value="">Select Work Setup</option>
                      {workSetupOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <strong>Work Setup Remarks</strong>
                    <input
                      className="form-control"
                      placeholder="Additional remarks about work setup (optional)"
                      onChange={(e) => {
                        setWorkSetupRemarks(e.target.value || "");
                      }}
                    ></input>
                    <strong>Description</strong>
                    <textarea
                      className="form-control"
                      placeholder="Job Description"
                      onChange={(e) => {
                        setDescription(e.target.value || "");
                      }}
                    ></textarea>
                  </div>
                </div>

                {/* Interview Question Generator */}
                <InterviewQuestionGenerator
                  questions={questions}
                  setQuestions={setQuestions}
                  jobTitle={jobTitle}
                  description={description}
                />
              </div>

              <div className="right-thread">
                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-edit text-primary mr-2" /> Editor
                      Toolkit
                    </h3>

                    <i className="la la-bars text-primary mr-2" />
                  </div>

                  <div className="card-body">
                    <div className="tag-check-set mb-2">
                      <div className="tag-item">
                        <img src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png" />
                        <strong>Complete form on the left to proceed.</strong>
                      </div>
                    </div>
                    {jobTitle &&
                      description &&
                      location &&
                      workSetup &&
                      questions.reduce(
                        (acc, group) => acc + group.questions.length,
                        0
                      ) > 0 && (
                        <button
                          className="btn btn-success fade-in-bottom"
                          onClick={() => {
                            addCareer();
                          }}
                        >
                          <i className="la la-square "></i> Save Changes
                        </button>
                      )}
                    <ScreeningSettingDropdown
                      onSelectSetting={(setting) => {
                        setScreeningSetting(setting);
                      }}
                      screeningSetting={screeningSetting}
                    />
                    <VideoRecordingSettingButton
                      requireVideo={requireVideo}
                      setRequireVideo={setRequireVideo}
                    />
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
