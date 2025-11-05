"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import axios from "axios";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import CardTypingLoader from "@/lib/components/AnalysisComponents/CardTypingLoader";
import CVSectionItem from "@/lib/components/ApplicantComponents/CVSectionItem";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
const defaultCVData = {
  errorRemarks: null,
  digitalCV: [
    {
      name: "Introduction",
      content: "",
    },
    {
      name: "Current Position",
      content: "",
    },
    {
      name: "Contact Info",
      content: "",
    },
    {
      name: "Skills",
      content: "",
    },
    {
      name: "Experience",
      content: "",
    },
    {
      name: "Education",
      content: "",
    },
    {
      name: "Projects",
      content: "",
    },
    {
      name: "Certifications",
      content: "",
    },
    {
      name: "Awards",
      content: "",
    },
  ],
};

export default function () {
  const [processState, setProcessState] = useState("");
  const [cvData, setCvData] = useState(defaultCVData);
  const [userInfo, setUserInfo] = useState(null);

  const { userID } = useParams();

  const fetchCVData = async () => {
    const response = await axios.post("/api/fetch-applicant-cv", {
      userID: userID,
    });

    if (response.data.error) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: response.data.error,
        allowOutsideClick: false,
        confirmButtonText: "Back to Candidate List",
      }).then(() => {
        window.location.href = "/dashboard/candidates";
      });

      return false;
    }

    setCvData(response.data.userCV);
    setUserInfo(response.data.userData);
  };

  useEffect(() => {
    if (userID) {
      fetchCVData();
    }
  }, [userID]);

  return (
    <>
      <AuthGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>User CV | Jia - WhiteCloak Technologies</title>
        <Sidebar activeLink="Candidates" />

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
                      View CV
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
                          <a href="#">Overview</a>
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
                {processState === "processing" && (
                  <>
                    <div className="card shadow-1">
                      <div className="card-header">
                        <h3 className="mb-0 mr-auto">
                          <i className="la la-edit text-primary mr-2" />{" "}
                          Processing CV...
                        </h3>
                      </div>

                      <div className="card-body">
                        <CardTypingLoader
                          title="Processing CV..."
                          notesArray={[
                            "Loading: Extracting CV Data...",
                            400,
                            "Loading: Extracting Skills...",
                            400,
                            "Loading: Extracting Experience...",
                            400,
                            "Loading: Extracting Education...",
                            400,
                            "Loading: Extracting Projects...",
                            400,
                            "Working: Extracting Certifications...",
                            400,
                            "Working: Extracting Awards...",
                            400,
                          ]}
                        />
                      </div>
                    </div>
                  </>
                )}

                {cvData && cvData.errorRemarks && (
                  <div className="card shadow-1">
                    <div className="card-header">
                      <h3 className="mb-0 mr-auto">
                        <i className="la la-square text-red mr-2" /> Upload
                        Error Remarks
                      </h3>
                    </div>

                    <div className="card-body">
                      <p>
                        {cvData.errorRemarks} Please upload proper CV / Resume
                        file in PDF or Docs Format.
                      </p>
                    </div>
                  </div>
                )}

                {cvData && (
                  <>
                    {cvData.digitalCV.map((section: any) => {
                      return (
                        <CVSectionItem
                          key={section.name}
                          data={section}
                          editable={false}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              <div className="right-thread">
                <div className="top-card">
                  <div className="card shadow-1 ">
                    <div className="card-header">
                      <h3 className="mb-0 mr-auto">
                        <i className="la la-edit text-primary mr-2" /> User
                        Profile
                      </h3>

                      <i className="la la-bars text-primary mr-2" />
                    </div>

                    <div className="card-body">
                      <div className="section-header">
                        <strong>
                          <i className="la la-file text-primary" /> CV User
                          Profile
                        </strong>
                      </div>

                      {userInfo && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",

                              gap: "10px",
                            }}
                          >
                            <AvatarImage src={userInfo.image} />

                            <span className="text-grey fade-in dl-4">
                              <strong>{userInfo.name}</strong>
                            </span>
                          </div>
                        </>
                      )}
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
