// TODO (Vince) - Replace alert and windows.confirm
// TODO (Vince) - Merge API

"use client";

import styles from "@/lib/styles/screen/jobDetails.module.scss";
import { contextProvider } from "@/lib/context/Context";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ({ params }) {
  const pathname = usePathname();
  const { user, setModalType } = contextProvider();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null);

  // Extract jobID from params
  const getJobIdFromParams = () => {
    if (params?.value) {
      try {
        const parsedSlug = JSON.parse(params.value);
        return parsedSlug.jobID;
      } catch (error) {
        console.error("Error parsing params:", error);
        return null;
      }
    }
    return null;
  };

  // Fetch job details from API
  const fetchJobDetails = async (jobId) => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/job-details", { jobId });

      if (response.data) {
        setSelectedCareer(response.data);
        document.title = `${response.data.jobTitle} - Whitecloak Careers`;
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      alert("Error fetching job details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user interviews if logged in
  const fetchUserInterviews = async () => {
    if (!user) return;

    try {
      const response = await axios.post("/api/whitecloak/fetch-interviews", {
        email: user.email,
      });
      setInterviews(response.data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      alert("Error fetching existing applied jobs");
    }
  };

  function handleApply() {
    if (user != null) {
      applyJob();
    } else {
      setModalType("signIn");
    }
  }

  function handleRedirection(type) {
    setModalType("loading");

    if (type == "back") {
      if (
        typeof window !== "undefined" &&
        window.innerWidth < 768 &&
        user != null
      ) {
        window.location.href = "/whitecloak/applicant/job-openings";
      } else {
        window.location.href = "/whitecloak/job-openings";
      }
    }

    if (type == "dashboard") {
      window.location.href = "/whitecloak/applicant";
    }
  }

  function processDate(date) {
    const createdDate = new Date(date);
    const today = new Date();

    // Reset times to midnight to avoid partial-day confusion
    createdDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffInMs = today.getTime() - createdDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  useEffect(() => {
    const jobId = getJobIdFromParams();
    fetchJobDetails(jobId);
    fetchUserInterviews();
  }, []);

  useEffect(() => {
    if (loading) {
      setModalType("loading");
    } else {
      setModalType(null);
    }
  }, [loading]);

  async function applyJob() {
    setModalType("loading");

    await axios({
      method: "POST",
      url: "/api/whitecloak/apply-job",
      data: { user, selectedCareer },
    })
      .then((res) => {
        if (res.data.error) {
          alert(res.data.message);
          setModalType(null);
        } else {
          setModalType("application");
        }
      })
      .catch((err) => {
        alert("Error applying for job");
        setModalType(null);
        console.log(err);
      });
  }

  return (
    <div className={styles.jobOpenings}>
      <div className={styles.backContainer}>
        <a onClick={() => handleRedirection("back")}>
          {"< "}Back to Job Openings
        </a>
      </div>

      <div className={styles.resultContainer}>
        {selectedCareer && !loading && (
          <div className={styles.jobDetailsContainer}>
            <div className={styles.titleContainer}>
              <span>{selectedCareer.jobTitle}</span>
              {/* <img alt="ellipsis-vertical" src="/icons/ellipsis-vertical.svg" /> */}
            </div>

            {selectedCareer.location && (
              <span className={`${styles.jobDetails} ${styles.location}`}>
                <img alt="map-pin" src="/icons/map-pin.svg" />
                {selectedCareer.location}
                {selectedCareer.workSetup && (
                  <>
                    <hr /> {selectedCareer.workSetup}
                  </>
                )}
              </span>
            )}
            <span className={styles.jobDetails}>
              <img alt="clock" src="/icons/clock.svg" />
              Posted {processDate(selectedCareer.createdAt)}
            </span>

            {/* <div className={styles.tagContainer}>
              {selectedCareer.tags.map((tag, index) => (
                <span key={index}>{tag}</span>
              ))}
            </div> */}

            {!interviews.some(
              (interview) => interview.id === selectedCareer.id
            ) ? (
              <div className={styles.buttonContainer}>
                <button className={styles.apply} onClick={handleApply}>
                  <img alt="zap" src="/icons/zapV2.svg" />
                  Apply Now
                </button>
                {/* <button className={styles.save}>
                <img alt="heart" src="/icons/heartV2.svg" />
                Save
              </button> */}
              </div>
            ) : (
              <div className={styles.appliedDetails}>
                <div>
                  <img alt="check" src="/icons/check.svg" />
                  <span>
                    Applied{" "}
                    {processDate(
                      interviews.find(
                        (interview) => interview.id === selectedCareer.id
                      ).createdAt
                    )}
                  </span>
                </div>
                <hr className="webView" />
                <a onClick={() => handleRedirection("dashboard")}>
                  View Application {">"}
                </a>
              </div>
            )}

            <p
              dangerouslySetInnerHTML={{ __html: selectedCareer.description }}
            />
          </div>
        )}

        {!selectedCareer && !loading && (
          <div className={styles.selectJob}>
            <img alt="circle-arrow-left" src="/icons/circle-arrow-left.svg" />
            <span>No matching job found.</span>
            <span>Please go back to the job listings.</span>
          </div>
        )}
      </div>
    </div>
  );
}
