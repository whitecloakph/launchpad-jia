// TODO (Vince) - Replace alert and windows.confirm
// TODO (Vince) - Merge API

import styles from "@/lib/styles/common/modal.module.scss";
import { contextProvider } from "@/lib/context/Context";
import { signInWithGoogle } from "@/lib/firebase/firebaseClient";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { getStage } from "@/lib/Utils";

export default function ({ modalType, setModalType }) {
  const pathname = usePathname();
  const { user } = contextProvider();
  const [interviewData, setInterviewData] = useState(null);
  const [textValue, setTextValue] = useState(null);
  const modal = [
    "signIn",
    "welcomePrompt",
    "application",
    "loading",
    "cvUploaded",
    "retake",
    "cancelApplication",
    "cancelletionSuccess",
  ];

  // modalType == cancelApplication
  const [selectedReason, setSelectedReason] = useState(null);
  const radioButtonText = [
    { index: 0, text: "I already received a job offer from another company." },
    { index: 1, text: "I find the application process too long." },
    { index: 2, text: "I applied to the wrong job role." },
    { index: 3, text: "Others" },
  ];

  function handleRadioChange(e) {
    setTextValue(null);
    setSelectedReason(e.target.value);
  }
  // modalType == cancelApplication

  async function manageInterview() {
    let data;

    if (modalType == modal[6]) {
      data = {
        interviewData,
        email: user.email,
        body: {
          updatedAt: Date.now(),
          applicationStatus: "Cancelled",
          selectedReason,
          archived: true,
          completedAt: new Date(),
        },
        interviewTransaction: {
          interviewUID: interviewData._id,
          fromStage: getStage(interviewData),
          action: "Cancelled",
          updatedBy: {
            image: user?.image,
            name: user?.name,
            email: user?.email,
          }
        }
      };

      if (selectedReason == radioButtonText[3].text) {
        data.body.cancelReason = textValue?.trim();
      }
    }

    if (modalType == modal[5]) {
      data = {
        interviewData,
        email: user.email,
        body: {
          updatedAt: Date.now(),
          retakeRequest: {
            reason: textValue?.trim(),
            status: "Pending",
            createdAt: Date.now(),
            approvedBy: null,
            approvedAt: null,
          },
        },
      };
    }

    await axios({
      url: "/api/whitecloak/manage-application",
      method: "POST",
      data,
    })
      .then(() => {
        if (modalType == modal[6]) {
          setModalType(modal[7]);
        } else {
          location.reload();
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message || "Job cancellation failed.");
        setModalType(null);
      });
  }

  let handleButtonClick = () => {};

  function handleClose() {
    setModalType(null);

    if (modalType == modal[1]) {
      sessionStorage.setItem("welcomePrompt", "true");
    }
  }

  if (modalType == modal[0]) {
    handleButtonClick = () => {
      signInWithGoogle("whitecloak-careers");
    };
  }

  if (modalType == modal[1]) {
    handleButtonClick = () => {
      sessionStorage.setItem("welcomePrompt", "true");
      window.location.href = "/whitecloak/applicant/manage-cv";
    };
  }

  if (modalType == modal[2]) {
    handleButtonClick = () => {
      localStorage.removeItem("interviews");
      window.location.href = "/whitecloak/applicant";
    };
  }

  if (modalType == modal[7]) {
    handleButtonClick = () => {
      location.reload();
    };
  }

  useEffect(() => {
    let data;

    if (modalType == modal[2]) {
      data = sessionStorage.getItem("selectedCareer");
    }

    if (modalType == modal[6] || modalType == modal[5]) {
      data = localStorage.getItem("interviewData");
    }

    if (data) {
      const parsedData = JSON.parse(data);
      setInterviewData(parsedData);
    }
  }, [modalType]);

  return (
    <div className={styles.modal}>
      {modalType == modal[0] && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/zap.svg" />
          </div>
          <span className={styles.title}>Let’s get you set up!</span>
          <span className={styles.body}>
            Sign in to save jobs and apply with one click
          </span>
          <button onClick={handleButtonClick}>
            <img alt="google" src="/icons/google.svg" />
            Continue with Google
          </button>
          <span className={styles.bottomText}>
            By continuing, you agree to our
            <br />
            <a href={`${pathname}/#`}>Terms of Service</a> and{" "}
            <a href={`${pathname}/#`}>Privacy Policy</a>
          </span>
        </div>
      )}

      {modalType == modal[1] && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/zap.svg" />
          </div>
          <span className={styles.title}>Welcome!</span>
          <span className={styles.body}>
            You are now one step closer to your dream job.
          </span>
          <span className={styles.body}>
            Get started by managing your CV to apply to jobs faster.
          </span>
          <button onClick={handleButtonClick}>Manage CV</button>
          <span className={styles.bottomText} onClick={handleClose}>
            Maybe Later
          </span>
        </div>
      )}

      {modalType == modal[3] && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img alt="loading" src="/gifs/loading.gif" />
          {/* <span className={styles.title}>Loading...</span> */}
        </div>
      )}

      {modalType == modal[2] && interviewData && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/checkV2.svg" />
          </div>
          <span className={styles.title}>Success</span>
          <span className={styles.body}>
            You have applied for the
            <br />
            <span className={styles.role}>{interviewData.jobTitle}</span> role
          </span>
          <button onClick={handleButtonClick}>Ok</button>
        </div>
      )}

      {modalType == modal[4] && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/file-check.svg" />
          </div>
          <span className={styles.title}>CV Updated Successfully</span>
          <span className={styles.body}>
            You’re one step closer to your next role.
          </span>
          <button
            className={styles.browseBtn}
            onClick={() => {
              window.location.href = "/whitecloak/applicant/job-openings";
            }}
          >
            Browse Job Openings
          </button>
          <button
            onClick={() => {
              window.location.href = "/whitecloak/applicant";
            }}
          >
            View Dashboard
          </button>
        </div>
      )}

      {modalType == modal[5] && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/rotate-ccw.svg" />
          </div>
          <span className={styles.title}>Request to Retake</span>
          <span className={styles.body}>
            If something went wrong or you would like another chance to take
            your AI interview, kindly let us know why.
          </span>
          <textarea
            maxLength={300}
            placeholder="Tell us what happened..."
            value={textValue || ""}
            onBlur={(e) => {
              e.target.placeholder = "Tell us what happened...";
            }}
            onClick={(e) => {
              (e.target as HTMLInputElement).placeholder = "";
            }}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <span className={styles.bottomText}>Max 300 characters</span>
          <button
            className={`${styles.retakeBtn} ${
              textValue?.trim() ? "" : styles.disabled
            }`}
            disabled={!textValue?.trim()}
            onClick={manageInterview}
          >
            Submit
          </button>
        </div>
      )}

      {modalType == modal[6] && interviewData && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/xV2.svg" />
          </div>
          <span className={styles.title}>Cancel Application?</span>
          <span className={styles.body}>
            You’re about to cancel your application for
          </span>
          <span className={`${styles.body} ${styles.role}`}>
            {interviewData?.jobTitle}.
          </span>
          <br />
          <span className={styles.body}>Please tell us why:</span>
          <form>
            {radioButtonText.map((item, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="cancel-reason"
                  value={item.text}
                  checked={selectedReason === item.text}
                  onChange={handleRadioChange}
                />
                {index < radioButtonText.length - 1 ? (
                  item.text
                ) : (
                  <>
                    {item.text}
                    <span>(please specify reason)</span>
                  </>
                )}
              </label>
            ))}
          </form>

          {selectedReason == radioButtonText[3].text && (
            <textarea
              placeholder="Tell us what happened..."
              value={textValue || ""}
              onBlur={(e) => {
                e.target.placeholder = "Tell us what happened...";
              }}
              onChange={(e) => setTextValue(e.target.value)}
              onClick={(e) => {
                (e.target as HTMLInputElement).placeholder = "";
              }}
            />
          )}

          <div className={styles.buttonContainer}>
            <button onClick={handleClose}>Go Back</button>
            <button
              className={`${styles.cancel} ${
                selectedReason &&
                (selectedReason !== radioButtonText[3].text ||
                  textValue?.trim())
                  ? ""
                  : styles.disabled
              }`}
              disabled={
                !selectedReason ||
                (selectedReason &&
                  selectedReason == radioButtonText[3].text &&
                  !textValue?.trim())
              }
              onClick={manageInterview}
            >
              Cancel Application
            </button>
          </div>
        </div>
      )}

      {modalType == modal[7] && (
        <div className={`${styles.modalContainer} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/xV2.svg" />
          </div>
          <span className={styles.title}>Application Cancelled</span>

          <span className={styles.body}>
            Your application for{" "}
            <span className={styles.role}>Software Engineer - Java</span> has
            been cancelled.
          </span>
          <br />
          <span className={styles.body}>
            If your plans change, we’d be glad to see your application again in
            the future.
          </span>

          <div className={styles.buttonContainer}>
            <button onClick={handleButtonClick}>OK</button>
          </div>
        </div>
      )}

      {/* {modalType == "reminder" && (
        <div className={styles.reminder}>
          <img
            alt="x"
            className={styles.x}
            src="/icons/x.svg"
            onClick={handleClose}
          />
          <div className={styles.topIcon}>
            <img alt="top-icon" src="/icons/bellV2.svg" />
          </div>
          <span className={styles.title}>Set A Reminder to Reapply</span>
          <span className={`${styles.body} ${styles.reminderBody}`}>
            <strong>Reminder Date:</strong>
            <br />
            September 17, 2025
            <br />
            <br />
            <strong>Add a Personal Note:</strong>
          </span>
          <textarea className={styles.reminderTextarea} />
          <span className={`${styles.bottomText} ${styles.reminderBottomText}`}>
            <input type="checkbox" />
            <span>Send me an email reminder</span>
          </span>
          <button className={styles.retakeBtn} onClick={handleButtonClick}>
            Set Reminder
          </button>
        </div>
      )} */}
    </div>
  );
}
