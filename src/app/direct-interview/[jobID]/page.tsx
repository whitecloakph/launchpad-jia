"use client";

import { guid } from "@/lib/Utils";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function () {
  const { jobID } = useParams();

  async function processDirectInterview(jID) {
    if (!localStorage.user) {
      Swal.fire({
        icon: "info",
        title: "User Info Required.",
        text: "You need to Log in or Create an account to proceed with the interview.",
        allowOutsideClick: false,
        showCancelButton: false,
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = `/login?directInterviewID=${jobID}`;
        }
      });

      return false;
    }

    let user = JSON.parse(localStorage.user);

    let jobDetails = await axios
      .post("/api/career-data", { id: jID })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("job details error =>", err);

        Swal.fire({
          icon: "error",
          title: "Not Found",
          text: "Sorry, we can't find the interview you are looking for.",
          allowOutsideClick: false,
          showConfirmButton: true,
        }).then((res) => {
          if (res.isConfirmed) {
            `${
              window.location.origin.includes("localhost")
                ? "/job-portal"
                : `https://www.hellojia.ai`
            }`;
          }
        });
      });

    if (!jobDetails.directInterviewLink || jobDetails.status !== "active") {
      Swal.fire({
        icon: "error",
        title: "Not Available",
        text: "This interview link is no longer available.",
        allowOutsideClick: false,
        showConfirmButton: false,
      }).then((res) => {
        if (res.isConfirmed) {
          `${
            window.location.origin.includes("localhost")
              ? "/job-portal"
              : `https://www.hellojia.ai`
          }`;
        }
      });

      return false;
    }

    Swal.fire({
      icon: "info",
      title: "Preparing Interview...",
      text: `Hello ${
        user.name.split(" ")[0]
      }, We are currently preparing your interview for ${
        jobDetails.jobTitle
      }, Please wait for a few moments.... \n Thank you.`,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
    });
    Swal.showLoading();

    let jobApplication = {
      ...jobDetails,
      userId: user._id,
      name: user.name,
      image: user.image,
      email: user.email,
      applicationStatus: "Ongoing",
      currentStep: "CV Screening",
      status: "For AI Interview",
      createdAt: new Date(),
      updatedAt: new Date(),
      interviewID: guid(),
      completedAt: null,
      origin: "direct-interview",
    };

    delete jobApplication._id;

    let applicationStep = await axios
      .post("/api/apply-job", jobApplication)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("Job Application Error =>", err);
      });

    if (applicationStep.error) {
      Swal.fire({
        icon: "error",
        title: "Sorry",
        text: "You have a pending application / interview for this role. Please check your profile page.",
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonText: "Go Back to Profile Page",
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = window.location.origin.includes("localhost")
            ? "/job-portal"
            : "https://www.hellojia.ai";
        }
      });

      return false;
    }

    if (applicationStep.message) {
      Swal.fire({
        icon: "success",
        title: "Redirecting to Interview",
        text: `Hello ${
          user.name.split(" ")[0]
        }, We will now redirect you to your interview ${
          jobDetails.jobTitle
        }, \n Thank you.`,
        allowOutsideClick: false,
        showCancelButton: false,
        showConfirmButton: false,
      });
      Swal.showLoading();

      setTimeout(() => {
        window.location.href = `/interview/${jobApplication.interviewID}`;
      }, 200);
    }
  }

  useEffect(() => {
    Swal.fire({
      icon: "info",
      title: "Loading...",
      text: "Verfying the interview, Please wait..",
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
    });
    Swal.showLoading();
    if (jobID) {
      processDirectInterview(jobID);
    }
  }, [jobID]);

  return (
    <>
      <title>Direct Interview | JIA</title>
      <div className="splash-page fade-in"></div>
    </>
  );
}
