"use client";
import { signInWithGoogle } from "@/lib/firebase/firebaseClient";
import { useEffect } from "react";

export default function () {
  useEffect(() => {
    if (localStorage.user) {
      if (localStorage.role === "admin") {
        window.location.href = "/recruiter-dashboard";
      } else {
        // Applicant dashboard
        window.location.href = window.location.origin.includes("localhost")
          ? "/job-portal"
          : "https://www.hellojia.ai";
      }
    }
  }, []);

  const steps = [
    {
      number: 1,
      text: "Create an account via Google SSO",
      className: "text-white",
    },
    {
      number: 2,
      text: "Upload and manage your CV",
    },
    {
      number: 3,
      text: "Explore job opportunities and apply for them.",
    },
    {
      number: 4,
      text: "Get instant Job Interviews and Feedback",
    },
  ];

  return (
    <div className="auth-panel">
      <div className="panel left">
        <div className="form-section fade-in-bottom">
          <div className="auth-form">
            <img alt="zyploan logo" id="zyp-logo" src="/jia-new-logo.png" />
            <br />
            <span className="text-grey">AI-powered Job Interviewer.</span>

            <br />

            <button
              className="btn btn-default btn-auth"
              onClick={() => {
                signInWithGoogle();
              }}
            >
              <img
                alt="google logo"
                src="https://companieslogo.com/img/orig/GOOG-0ed88f7c.png?t=1633218227"
                className="mr-2"
              />
              <span> Continue with Google</span>
            </button>

            {/* <button
              className="btn btn-auth"
              style={{ border: "2px solid #ddd" }}
              onClick={() => {
                window.location.href = "/api/linkedin";
              }}
            >
              <img
                alt="linkedin logo"
                src="https://companieslogo.com/img/orig/LNKD.defunct.2016-d582336a.png?t=1722850217"
                className="mr-2"
              />
              <span> Log In with LinkedIn</span>
            </button> */}

            <br />
            <br />
            <a target="_blank" href="https://www.whitecloak.com/">
              <div className="cite-set">
                <img
                  src="https://www.whitecloak.com/wp-content/uploads/2024/02/wc-favicon.png"
                  className="fade-in dl-3"
                />

                <span className="text-grey fade-in dl-4">
                  Powered by White Cloak Technologies
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="panel right fade-in dl-2">
        <div className="banner-text">
          {/* <span
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
            Demo Application
          </span> */}
          <br />
          <br />
          <h1 className="fade-in dl-2 text-white display-2 b-text">
            Meet Jia, <br />
            WhiteCloak's fully-automated <br />
            Job Interviewer.
          </h1>

          <br />

          <div className="step-set">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`step fade-in-bottom dl-${(index + 1) * 2}`}
              >
                <div className="number">
                  <span>{step.number}</span>
                </div>
                <span className={step.className}>{step.text}</span>
              </div>
            ))}
            <br />
            <a
              href="/whitecloak"
              style={{ margin: "auto" }}
              className="fade-in-bottom dl-8"
            >
              <div className="step text-white">
                <span>See WhiteCloak's Job Openings</span>
                <div className="number">
                  <span>
                    <i className="la la-arrow-right"></i>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
