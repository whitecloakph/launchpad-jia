// TODO (Job Portal) - Check API

"use client";

import Loader from "@/lib/components/commonV2/Loader";
import styles from "@/lib/styles/screens/jobDetails.module.scss";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { useAppContext } from "@/lib/context/ContextV2";
import { processDate } from "@/lib/utils/helpersV2";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ({ params }) {
  const pathname = usePathname();
  const [interview, setInterview] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [viewDropdown, setViewdropdown] = useState(false);
  const { user, setModalType } = useAppContext();
  const dropdown = [
    {
      name: "Share Job",
      onClick: () => {
        setModalType("share");
        setViewdropdown(false);
      },
    },
    {
      name: "Report Job",
      onClick: () => {
        setModalType("report");
        setViewdropdown(false);
      },
    },
  ];

  function handleApply() {
    if (user != null) {
      applyJob();
    } else {
      sessionStorage.setItem("redirectionPath", pathname);
      setModalType("signIn");
    }
  }

  function handleRedirection(path?) {
    if (path == pathConstants.whitecloak) {
      window.open(path, "_blank");
      return null;
    }

    if (path) {
      window.location.href = path;
    } else {
      if (user == null) {
        window.location.href = pathConstants.jobOpenings;
      } else {
        history.back();
      }
    }
  }

  useEffect(() => {
    const jobID = params.jobID;

    if (jobID) {
      fetchCareer(jobID);
    }
  }, []);

  function applyJob() {
    setModalType("loading");

    axios({
      method: "POST",
      url: "/api/whitecloak/apply-job",
      data: { user, selectedCareer },
    })
      .then((res) => {
        if (res.data.error) {
          alert(res.data.message);
          setModalType(null);
        } else {
          setModalType("applied");
        }
      })
      .catch((err) => {
        alert("Error applying for job");
        setModalType(null);
        console.log(err);
      });
  }

  function fetchCareer(jobID) {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-careers",
      data: { jobID },
    })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.error);
          handleRedirection();
        } else {
          sessionStorage.setItem("selectedCareer", JSON.stringify(result[0]));
          document.title = `${result[0].jobTitle} - JIA Job Portal`;

          if (user != null) {
            fetchInterview(result[0]);
          } else {
            setSelectedCareer(result[0]);
          }
        }
      })
      .catch((err) => {
        alert("Error on fetching careers.");
        console.log(err);
      });
  }

  function fetchInterview(career) {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-interviews",
      data: { email: user.email, interviewID: career.id },
    })
      .then((res) => {
        const result = res.data;

        if (result.length > 0) {
          setInterview(result[0]);
        }
      })
      .catch((err) => {
        alert("Error fetching existing application.");
        console.log(err);
      })
      .finally(() => {
        setSelectedCareer(career);
      });
  }

  return selectedCareer ? (
    <div className={styles.contentContainer}>
      <div className={styles.backContainer}>
        <span onClick={() => handleRedirection()}>
          <img alt="" src={assetConstants.chevronV2} />
          Back to Openings
        </span>
      </div>

      <div className={styles.gradientContainer}>
        <div className={styles.jobDetailsContainer}>
          {selectedCareer.jobTitle && (
            <div className={styles.titleContainer}>
              <span>{selectedCareer.jobTitle}</span>
              <img
                alt=""
                src={assetConstants.ellipsis}
                onClick={() => setViewdropdown(!viewDropdown)}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          )}

          {viewDropdown && (
            <div className={styles.dropdownContainer}>
              {dropdown.map((item, index) => (
                <span key={index} onClick={item.onClick}>
                  {item.name}
                </span>
              ))}
            </div>
          )}

          {selectedCareer.organization && selectedCareer.organization.name && (
            <span className={styles.companyName}>
              {selectedCareer.organization.name}
            </span>
          )}

          {selectedCareer.location && (
            <span className={`${styles.details} ${styles.withMargin}`}>
              <img alt="" src={assetConstants.mapPin} />
              {selectedCareer.location}
            </span>
          )}

          {selectedCareer.createdAt && (
            <span className={styles.details}>
              <img alt="" src={assetConstants.clock} />
              {processDate(selectedCareer.createdAt)}
            </span>
          )}

          {selectedCareer.workSetup && (
            <div className={styles.tagContainer}>
              <span>{selectedCareer.workSetup}</span>
            </div>
          )}

          {interview && interview.id == selectedCareer.id ? (
            <div className={styles.appliedContainer}>
              <span className={styles.applied}>
                <img alt="" src={assetConstants.checkV4} />
                Applied {processDate(interview.id.createdAt)}
              </span>

              <hr />
              <span
                className={styles.viewApplication}
                onClick={() => handleRedirection(pathConstants.dashboard)}
              >
                View Application {">"}
              </span>
            </div>
          ) : (
            <button
              className={styles.btnApply}
              name="btn-apply"
              onClick={handleApply}
            >
              Apply Now
            </button>
          )}

          <hr />

          <p
            className={styles.jobDescription}
            dangerouslySetInnerHTML={{ __html: selectedCareer.description }}
          />

          {selectedCareer.organization && (
            <>
              <hr />

              <span className={styles.footerTitle}>About The Company</span>

              <div className={styles.footerContent}>
                {selectedCareer.organization.image && (
                  <img
                    alt=""
                    className={styles.companyLogo}
                    src={selectedCareer.organization.image}
                  />
                )}

                <div className={styles.footerDetails}>
                  {selectedCareer.organization.name && (
                    <span className={styles.footerCompanyName}>
                      {selectedCareer.organization.name}
                    </span>
                  )}

                  {selectedCareer.location && (
                    <span className={styles.details}>
                      {selectedCareer.location}
                    </span>
                  )}

                  {selectedCareer.organization.name.includes("White Cloak") && (
                    <>
                      <span
                        className={`${styles.details} ${styles.withMargin}`}
                      >
                        Founded in 2014, White Cloak continues to be the
                        innovation partner of choice for many major
                        corporations, leveraging technology to take its client’s
                        business to the next level. This technical superiority
                        and commitment to our clients have brought numerous
                        recognition and awards to White Cloak.
                      </span>

                      <button
                        className="secondaryBtn"
                        onClick={() =>
                          handleRedirection(pathConstants.whitecloak)
                        }
                      >
                        Learn More
                        <img alt="" src={assetConstants.arrowV3} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  ) : (
    <Loader loaderData={""} loaderType={""} />
  );
}
