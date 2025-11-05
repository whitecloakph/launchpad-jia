// TODO (Job Portal) - Check API

"use client";

import styles from "@/lib/styles/commonV2/modal.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { signInWithGoogle } from "@/lib/firebase/firebaseClient";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import axios from "axios";
import { useEffect, useState } from "react";
import { processDate } from "@/lib/utils/helpersV2";
import { getStage } from "@/lib/Utils";

export default function ({ modalType, setModalType }) {
  const [applicationData, setApplicationData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [radioValue, setRadioValue] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  // const [tempInputValue, setTempInputValue] = useState("");
  // const [tempRadioValue, setTempRadioValue] = useState(null);
  const { user, setToasterType } = useAppContext();
  const modalList = [
    "location",
    "signIn",
    "loading",
    "applied",
    "share",
    "report",
    "manageCV",
    "retake",
    "cancel",
    "jobDescription",
    "reminder",
    "screening",
    "logout",
  ];
  const checkList = {
    [modalList[5]]: [
      "I think it’s spam or a scam",
      "I think it’s discriminatory or offensive",
      "I think something is broken or incorrect",
    ],
    [modalList[8]]: [
      "I already received a job offer from another company.",
      "I find the application process too long.",
      "I applied to the wrong job role.",
      "Others",
    ],
  };

  let handleButtonClick = () => {};

  function handleClose() {
    setModalType(null);

    if (modalType == modalList[6]) {
      sessionStorage.setItem(modalType, "true");
    }
  }

  if (modalType == modalList[0]) {
    handleButtonClick = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            axios({
              method: "GET",
              url: `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            })
              .then((res) => {
                const location = res.data.address.town;
                sessionStorage.setItem("location", location);
                handleClose();
              })
              .catch((err) => {
                alert("Failed to get detailed location.");
                console.error(err);
              });
          },
          (err) => {
            alert("Location access was denied.");
            console.error(err);
          }
        );
      } else {
        alert("Geolocation is not supported in this browser.");
      }
    };
  }

  if (modalType == modalList[1]) {
    handleButtonClick = () => {
      signInWithGoogle("job-portal");
    };
  }

  if (modalType == modalList[3]) {
    handleButtonClick = () => {
      window.location.href = pathConstants.uploadCV;
    };
  }

  if (modalType == modalList[4]) {
    handleButtonClick = () => {
      const spanElement = document.getElementById("selected-job-link");

      if (spanElement && window.isSecureContext) {
        navigator.clipboard.writeText(spanElement.innerText).then(() => {
          handleClose();
          setToasterType("share");
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = spanElement.innerText;
        textArea.style.position = "fixed"; // Avoid scrolling
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (!successful) throw new Error("Fallback copy failed");
          setToasterType("share");
          handleClose();
        } catch (err) {
          console.error("Fallback copy error:", err);
          alert("Unable to copy. Please try manually.");
        }

        document.body.removeChild(textArea);
      }
    };
  }

  if (modalType == modalList[5]) {
    handleButtonClick = () => {
      const data = {
        careerID: applicationData._id,
        createdAt: Date.now(),
        concern: inputValue.trim(),
        report: radioValue,
      };

      reportJob(data);
    };
  }

  if (modalType == modalList[6]) {
    handleButtonClick = () => {
      sessionStorage.setItem(modalType, "true");
      window.location.href = pathConstants.manageCV;
    };
  }

  if (modalType == modalList[7]) {
    handleButtonClick = () => {
      const data = {
        interviewData: applicationData,
        email: user.email,
        body: {
          updatedAt: Date.now(),
          retakeRequest: {
            reason: inputValue.trim(),
            status: "Pending",
            createdAt: Date.now(),
            approvedBy: null,
            approvedAt: null,
          },
        },
      };

      manageApplication(data);
    };
  }

  if (modalType == modalList[8]) {
    handleButtonClick = () => {
      const date = Date.now();
      const data = {
        interviewData: applicationData,
        email: user.email,
        body: {
          applicationStatus: "Cancelled",
          archived: true,
          cancelReason: inputValue,
          completedAt: date,
          selectedReason: radioValue,
          updatedAt: date,
        },
        interviewTransaction: {
          action: "Cancelled",
          fromStage: getStage(applicationData),
          interviewUID: applicationData._id,
          updatedBy: {
            email: user.email,
            image: user.image,
            name: user.name,
          },
        },
      };

      manageApplication(data);
    };
  }

  if (modalType == modalList[12]) {
    handleButtonClick = () => {
      localStorage.clear();
      sessionStorage.clear();

      window.location.href = `${
        window.location.origin.includes("localhost")
          ? "/job-portal"
          : pathConstants.employee
      }`;
    };
  }

  useEffect(() => {
    if (
      [
        modalList[3],
        modalList[4],
        modalList[5],
        modalList[7],
        modalList[8],
        modalList[9],
        modalList[11],
      ].includes(modalType)
    ) {
      const storedSelectedCareer = sessionStorage.getItem("selectedCareer");

      if (storedSelectedCareer) {
        const parseStoredSelectedCareer = JSON.parse(storedSelectedCareer);
        setApplicationData(parseStoredSelectedCareer);
      }
    }
  }, [modalType]);

  function manageApplication(data) {
    axios({
      method: "POST",
      url: "/api/whitecloak/manage-application",
      data,
    })
      .then((_) => {
        location.reload();
      })
      .catch((err) => {
        alert("Job cancellation failed.");
        setModalType(null);
        console.log(err);
      });
  }

  function reportJob(data) {
    axios({ method: "POST", url: "/api/job-portal/report-job", data })
      .then((res) => {
        setReportSuccess(res.data.success);
      })
      .catch((err) => {
        alert("Error on report job.");
        console.log(err);
      });
  }

  return (
    <div className={styles.modalContainer}>
      {modalType == modalList[0] && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.crosshair} />
          <span className={styles.title}>See results closer to you?</span>
          <span className={styles.description}>
            To get the closest and most relevant results, let Jia use your
            device’s exact location.
          </span>
          <button onClick={handleButtonClick}>
            <img alt="" src={assetConstants.crosshairV2} />
            Use Exact Location
          </button>
          <button className="secondaryBtn" onClick={handleClose}>
            Not Now
          </button>
        </div>
      )}

      {modalType == modalList[1] && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src={assetConstants.x}
            onClick={handleClose}
          />
          <img alt="logo" src={assetConstants.jiaLogo} />
          <span className={styles.title}>Let’s get you set up!</span>
          <span className={styles.description}>
            Sign in to save jobs and apply with one click
          </span>
          <button className="secondaryBtn" onClick={handleButtonClick}>
            <img alt="google" src={assetConstants.google} />
            Continue with Google
          </button>
          <span className={styles.bottomText}>
            By continuing, you agree to our
            <br />
            <span className={styles.bold}>Terms of Service</span> and{" "}
            <span className={styles.bold}>Privacy Policy</span>
          </span>
        </div>
      )}

      {modalType == modalList[2] && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="loading" src={assetConstants.loading} />
          <span className={styles.title}>Loading...</span>
        </div>
      )}

      {modalType == modalList[3] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img
            alt="logo"
            className={styles.logo}
            src={assetConstants.checkV2}
          />
          <span className={styles.title}>Success!</span>
          <span className={styles.description}>You have applied for the</span>
          <span className={styles.description}>
            <span className={styles.bold}>{applicationData.jobTitle}</span> role
          </span>
          <button className="secondaryBtn" onClick={handleButtonClick}>
            OK
          </button>
        </div>
      )}

      {modalType == modalList[4] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.share} />
          <span className={styles.title}>Share Job</span>
          <div className={styles.bottomContainer}>
            <span id="selected-job-link">
              {`${window.location.origin}${pathConstants.jobOpenings}/${applicationData._id}`}
            </span>
            <img alt="" src={assetConstants.copy} onClick={handleButtonClick} />
          </div>
        </div>
      )}

      {modalType == modalList[5] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.alert} />
          <span className={styles.title}>Report Job</span>

          {!radioValue && (
            <>
              <span className={styles.description}>
                Why are you reporting this?
              </span>
              <fieldset>
                {checkList[modalType].map((item, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name={modalType}
                      value={item}
                      onClick={() => setRadioValue(item)}
                    />
                    {item}
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {radioValue && !reportSuccess && (
            <>
              <span className={styles.description}>
                What concerns do you have about this job post?
              </span>
              <textarea
                placeholder="Describe the issue..."
                onBlur={(e) => (e.target.placeholder = "Describe the issue...")}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={(e) => (e.target.placeholder = "")}
              />

              <div className={styles.bottomContainer}>
                <button className="secondaryBtn" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  className={inputValue.trim() ? "" : "disabled"}
                  disabled={!inputValue.trim()}
                  onClick={handleButtonClick}
                >
                  Report Job
                </button>
              </div>
            </>
          )}

          {reportSuccess && (
            <>
              <span className={styles.description}>
                Thank you for reporting this. We appreciate you letting us know.
              </span>
              <button className="secondaryBtn" onClick={handleClose}>
                OK
              </button>
            </>
          )}
        </div>
      )}

      {modalType == modalList[6] && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img
            alt="x"
            className={styles.xIcon}
            src={assetConstants.x}
            onClick={handleClose}
          />
          <img alt="logo" src={assetConstants.jiaLogo} />
          <span className={styles.title}>Welcome!</span>
          <span className={styles.description}>
            You are now one step closer to your dream job. Get started by
            managing your CV to apply to jobs faster.
          </span>
          <button className="secondaryBtn" onClick={handleButtonClick}>
            Manage CV
          </button>
          <span className={styles.bottomText} onClick={handleClose}>
            Maybe Later
          </span>
        </div>
      )}

      {modalType == modalList[7] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.rotateV2} />
          <span className={styles.title}>Request to Retake</span>
          <span className={styles.description}>
            If something went wrong or you would like another chance to take
            your AI interview, let us know why.
          </span>
          <textarea
            placeholder="Tell us what happened..."
            onBlur={(e) => (e.target.placeholder = "Tell us what happened...")}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={(e) => (e.target.placeholder = "")}
          />
          <div className={styles.bottomContainer}>
            <button className="secondaryBtn" onClick={handleClose}>
              Cancel
            </button>
            <button
              className={inputValue.trim() ? "" : "disabled"}
              onClick={handleButtonClick}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {modalType == modalList[8] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.trash} />
          <span className={styles.title}>Cancel Application</span>
          <span className={styles.description}>
            Are you sure you want to cancel your application for this role? ? If
            so, please tell us why.
          </span>

          <fieldset>
            {checkList[modalType].map((item, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name={modalType}
                  value={item}
                  onClick={() => setRadioValue(item)}
                />
                {index == 3 ? `${item} (please specify reason)` : item}
              </label>
            ))}
          </fieldset>

          {radioValue == checkList[modalType][3] && (
            <textarea
              placeholder="Tell us what happened..."
              onBlur={(e) =>
                (e.target.placeholder = "Tell us what happened...")
              }
              onChange={(e) => setInputValue(e.target.value)}
              onClick={(e) => ((e.target as HTMLInputElement).placeholder = "")}
            />
          )}

          <div className={styles.bottomContainer}>
            <button className="secondaryBtn" onClick={handleClose}>
              Go Back
            </button>
            <button
              className={
                radioValue &&
                ((radioValue == checkList[modalType][3] && inputValue.trim()) ||
                  radioValue != checkList[modalType][3])
                  ? styles.secondaryBtn
                  : "disabled"
              }
              onClick={handleButtonClick}
            >
              Cancel Application
            </button>
          </div>
        </div>
      )}

      {modalType == modalList[9] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <div className={styles.gradientContainer}>
            <div className={styles.jobDetailsContainer}>
              {applicationData.jobTitle && (
                <div className={styles.titleContainer}>
                  <span>{applicationData.jobTitle}</span>
                </div>
              )}

              {applicationData.organization &&
                applicationData.organization.name && (
                  <span className={styles.companyName}>
                    {applicationData.organization.name}
                  </span>
                )}

              {applicationData.location && (
                <span className={`${styles.details} ${styles.withMargin}`}>
                  <img alt="" src={assetConstants.mapPin} />
                  {applicationData.location}
                </span>
              )}

              {applicationData.createdAt && (
                <span className={styles.details}>
                  <img alt="" src={assetConstants.clock} />
                  {processDate(applicationData.createdAt)}
                </span>
              )}

              {applicationData.workSetup && (
                <div className={styles.tagContainer}>
                  <span>{applicationData.workSetup}</span>
                </div>
              )}

              <hr />

              <p
                className={styles.jobDescription}
                dangerouslySetInnerHTML={{
                  __html: applicationData.description,
                }}
              />
              <button onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* {modalType == modalList[10] && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="logo" className={styles.logo} src={assetConstants.bellV2} />
          <span className={styles.title}>Set A Reminder to Reapply</span>
          <span className={styles.description}>
            <span className={styles.bold}>Reminder Date:</span>
            <br />
            January 28, 2026
          </span>

          <textarea
            placeholder="Add a personal note...."
            onBlur={(e) => (e.target.placeholder = "Add a personal note...")}
            onChange={(e) => setInputValue(e.target.value)}
            onClick={(e) => ((e.target as HTMLInputElement).placeholder = "")}
          />
          <label>
            <input type="checkbox" />
            Send me an email reminder
          </label>

          <div className={styles.bottomContainer}>
            <button onClick={handleClose}>Cancel</button>
            <button
              className={
                inputValue.trim() ? styles.secondaryBtn : styles.disabled
              }
              onClick={handleButtonClick}
            >
              Set Reminder
            </button>
          </div>
        </div>
      )} */}

      {modalType == modalList[11] && applicationData && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.result} />
          <span className={styles.title}>AI Screening Results</span>

          <div
            className={styles.resultContainer}
            dangerouslySetInnerHTML={{
              __html:
                applicationData.currentStep == "AI Intervew"
                  ? applicationData.summary
                  : applicationData.cvScreeningReason,
            }}
          />

          <div className={styles.bottomContainer}>
            <button className="secondaryBtn" onClick={handleClose}>
              OK
            </button>
          </div>
        </div>
      )}

      {modalType == modalList[12] && (
        <div className={`${styles.modalContent} ${styles[modalType]}`}>
          <img alt="" className={styles.logo} src={assetConstants.logoutV3} />
          <span className={styles.title}>Log Out Confirmation</span>

          <span className={styles.description}>
            Are you sure you want to log out?
          </span>

          <div className={styles.bottomContainer}>
            <button className="secondaryBtn" onClick={handleClose}>
              Cancel
            </button>
            <button onClick={handleButtonClick}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}
