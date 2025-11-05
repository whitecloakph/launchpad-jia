"use client";
import { signInWithGoogle } from "@/lib/firebase/firebaseClient";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import { guid } from "@/lib/Utils";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import ApplicationStatusStep from "@/lib/components/InterviewComponents/ApplicationStatusStep";

export default function () {
  const [jobApplications, setJobApplications] = useState([]);
  const { user } = useAppContext();

  const fetchData = async () => {
    try {
      const response = await axios.post("/api/fetch-interviews", {
        email: user.email,
      });

      setJobApplications(response.data);

    } catch (error) {
      console.error("Error fetching job openings:", error);
    }
  };

  const startInterview = (job) => {
    window.location.href = `/interview/${job.interviewID}`;
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <>
      <title>WhiteCloak | applicant</title>
      <div className="auth-panel">
        <div className="panel left" style={{ 
          overflowY: "auto",
          maxHeight: "100vh",
        }}>
          <div className="form-section fade-in-bottom"
          style={{
            paddingTop: "20px",
          }}
          >
            <div className="auth-form">
              <img
                alt="zyploan logo"
                id="wc-logo"
                src="https://www.whitecloak.com/wp-content/uploads/2024/02/logo.svg"
              />
              <br />
              <span className="text-grey">
                Start your Career with WhiteCloak
              </span>

              {user && (
                <>
                  <div className="cite-set mt-4 py-2">
                    <AvatarImage src={user.image} />

                    <span className="text-grey fade-in dl-4">
                      <strong>{user.name}</strong>
                    </span>
                  </div>

                  <button
                    className="btn btn-default"
                    style={{ width: "fit-content" }}
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                  >
                    Logout <i className="la la-sign-out text-info"></i>
                  </button>
                </>
              )}

              <br />

              <strong>
                <i className="la la-microphone text-primary blink-2"></i>{" "}
                All Applications
              </strong>
              <br />

              <div className="application-list">
                {jobApplications.length > 0 ? (
                  jobApplications.map((job, index) => (
                    <div
                      className="application-item"
                      key={index}
                      style={{ flexDirection: "column" }}
                    >
                      <div style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                        <div className="job-title" style={{ width: "70%" }}>
                          <h2>{job.jobTitle}</h2>
                        </div>

                      {job.status === "For Interview" && <div 
                          className="cta"
                          onClick={() => {
                            startInterview(job);
                          }}
                        >
                        <span>Start Interview</span>
                        <i className="la la-arrow-circle-right"></i>
                      </div>}
                      </div>
                      <ApplicationStatusStep job={job} />
                    </div>
                  ))
                ) : (
                  <div className="job-list blink-2 p-3">
                    <span className="text-center">
                      <i className="la la-list" /> No Applications
                    </span>
                  </div>
                )}
              </div>
              <br />
              <br />
            </div>
          </div>
        </div>
        <div className="panel right fade-in dl-2">
          <div className="banner-text">
            <span
              className="text-white"
              style={{
                marginTop: "20px",
                border: "1px solid #ddd",
                padding: "10px 15px",
                borderRadius: "10px",
              }}
            >
              <i
                className="la la-square blink-1"
                style={{ color: "turquoise" }}
              />{" "}
              Your Interviews
            </span>
            <br />
            <br />
            <h1 className="fade-in dl-2 text-white display-2 b-text">
              Instantly Jump in for an <br />
              Interview when you are ready!
            </h1>

            <br />

            <div className="step-set">
              <div className="step fade-in-bottom dl-2">
                <div className="number">
                  <span>1</span>
                </div>
                <span className="text-white">
                  Apply for a Job Position you like
                </span>
              </div>
              <div className="step fade-in-bottom dl-4">
                <div className="number">
                  <span>2</span>
                </div>
                <span>Login with a Google Account / Email</span>
              </div>
              <div className="step fade-in-bottom dl-6">
                <div className="number">
                  <span>3</span>
                </div>
                <span>Complete the Interview at your own pace.</span>
              </div>
              <br />
              {!user && (
                <a
                  href="/login"
                  style={{ margin: "auto" }}
                  className="fade-in-bottom dl-8"
                >
                  <div className="step text-white">
                    <span>Create Account</span>
                    <div className="number">
                      <span>
                        <i className="la la-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </a>
              )}

              {user && (
                <a
                  href="/applicant"
                  style={{ margin: "auto" }}
                  className="fade-in-bottom dl-8"
                >
                  <div className="step text-white">
                    <span>See Other Job Openings</span>
                    <div className="number">
                      <span>
                        <i className="la la-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
