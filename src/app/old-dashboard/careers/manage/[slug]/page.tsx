"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import axios from "axios";
import { errorToast, loadingToast } from "@/lib/Utils";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import DirectInterviewLink from "@/lib/components/CareerComponents/DirectInterviewLink";
import InterviewQuestionGenerator from "@/lib/components/CareerComponents/InterviewQuestionGenerator";
import ScreeningSettingDropdown from "@/lib/components/Dropdown/ScreeningSettingDropdown";
import VideoRecordingSettingButton from "@/lib/components/CareerComponents/VideoRecordingSettingButton";
import { workSetupOptions } from "@/lib/Utils";
import ManageCareerOverviewCard from "@/lib/components/CareerComponents/ManageCareerOverviewCard";

export default function Dashboard() {
  // Get user data from AppContext
  const { user, orgID } = useAppContext();
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [workSetup, setWorkSetup] = useState("");
  const [workSetupRemarks, setWorkSetupRemarks] = useState("");
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const { slug } = useParams();
  const [screeningSetting, setScreeningSetting] = useState("");
  const [requireVideo, setRequireVideo] = useState(true);

  async function fetchCareerData(id: string) {
    loadingToast("Loading, please wait...");

    try {
      const response = await axios.post("/api/career-data", {
        id: id,
        orgID,
      });

      let careerData = response.data;

      document.title = `${careerData.jobTitle} | Manage Career | Jia`;

      setJobTitle(careerData.jobTitle);
      setDescription(careerData.description);
      setLocation(careerData.location || "");
      setWorkSetup(careerData.workSetup || "");
      setWorkSetupRemarks(careerData.workSetupRemarks || "");
      setQuestions(careerData.questions);
      setStatus(careerData.status);
      setData(careerData);
      setScreeningSetting(careerData.screeningSetting || "Good Fit and above");
      setRequireVideo(
        careerData.requireVideo === undefined ||
          careerData.requireVideo === null
          ? true
          : careerData.requireVideo
      );
      toast.dismiss();
    } catch (err) {
      errorToast("Career not found", 1500);
      setTimeout(() => {
        window.location.href = "/dashboard/careers";
      }, 1500);
    }
  }

  useEffect(() => {
    if (slug && orgID) {
      // Handle slug if it's an array or string
      const slugValue = Array.isArray(slug) ? slug[0] : slug;
      fetchCareerData(slugValue);
    }
  }, [slug, orgID]);

  async function updateCareer() {
    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };

    Swal.fire({
      title: "Updating career...",
      text: "Please wait while we update the career...",
      allowOutsideClick: false,
    });

    // Handle slug if it's an array or string
    const slugValue = Array.isArray(slug) ? slug[0] : slug;

    const response = await axios.post("/api/update-career", {
      _id: slugValue,
      jobTitle,
      description,
      location,
      workSetup,
      workSetupRemarks,
      questions,
      lastEditedBy: userInfoSlice,
      createdBy: userInfoSlice,
      status,
      updatedAt: Date.now(),
      screeningSetting,
      requireVideo,
    });

    console.log(response);

    if (response.status === 200) {
      Swal.fire({
        title: "Success",
        text: "Career updated successfully",
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

  async function deleteCareer() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleting career...",
          text: "Please wait while we delete the career...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await axios.post("/api/delete-career", {
            id: slug,
          });

          if (response.data.success) {
            Swal.fire({
              title: "Deleted!",
              text: "The career has been deleted.",
              icon: "success",
              allowOutsideClick: false,
            }).then(() => {
              window.location.href = "/dashboard/careers";
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.error || "Failed to delete the career",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error deleting career:", error);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the career",
            icon: "error",
          });
        }
      }
    });
  }

  return (
    <>
      <AuthGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Manage Career | Jia - WhiteCloak Technologies</title>
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
                      Manage Career
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
                <ManageCareerOverviewCard
                  jobTitle={jobTitle}
                  description={description}
                  location={location}
                  workSetup={workSetup}
                  workSetupRemarks={workSetupRemarks}
                  jobID={slug}
                  orgID={orgID}
                />

                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-list text-primary mr-2" />
                      Edit Career Information
                    </h3>
                  </div>

                  <div className="card-body">
                    <strong>Job Title</strong>
                    <input
                      defaultValue={jobTitle}
                      className="form-control"
                      placeholder="Title"
                      onChange={(e) => {
                        setJobTitle(e.target.value || "");
                      }}
                    ></input>
                    <strong>Location</strong>
                    <input
                      defaultValue={location}
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
                      defaultValue={workSetupRemarks}
                      className="form-control"
                      placeholder="Additional remarks about work setup (optional)"
                      onChange={(e) => {
                        setWorkSetupRemarks(e.target.value || "");
                      }}
                    ></input>
                    <strong>Description</strong>
                    <textarea
                      defaultValue={description}
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
                <div className="top-card">
                  <div className="card shadow-1 ">
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

                      <div className="btn-set careers-btn-set">
                        <button
                          className={`btn  ${
                            status === "active" ? "btn-primary" : "btn-danger"
                          }`}
                          onClick={() => {
                            setStatus(
                              status === "active" ? "inactive" : "active"
                            );
                          }}
                        >
                          <i className="la la-square text-info"></i> Status:{" "}
                          {status === "active" ? "Active" : "Inactive"}
                        </button>

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
                                updateCareer();
                              }}
                            >
                              <i className="la la-square "></i> Save Changes
                            </button>
                          )}
                      </div>
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

                  <DirectInterviewLink data={data} />

                  <div className="card shadow-1 mt-4">
                    <div className="card-header">
                      <h3 className="mb-0 mr-auto">
                        <i className="la la-edit text-primary mr-2" /> Advanced
                        Settings
                      </h3>

                      <i className="la la-bars text-primary mr-2" />
                    </div>

                    <div className="card-body">
                      <small className="text-black">
                        <i className="la la-exclamation-triangle text-danger"></i>{" "}
                        Be Careful, This Action cannot be undone.
                      </small>
                      <button
                        className="btn btn-default"
                        onClick={deleteCareer}
                      >
                        <i className="la la-trash text-danger"></i> Delete this
                        Entry
                      </button>
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
