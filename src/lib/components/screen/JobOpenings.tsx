// TODO (Vince) - Replace alert and windows.confirm
// TODO (Vince) - Merge API

"use client";

import Loader from "@/lib/components/common/Loader";
import styles from "@/lib/styles/screen/jobOpenings.module.scss";
import { contextProvider } from "@/lib/context/Context";
import axios from "axios";
import Fuse from "fuse.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function () {
  const pathname = usePathname();
  const defaultCareerRef = useRef(null);
  const selectedCareerRef = useRef(null);
  const titleRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setModalType } = contextProvider();
  const [careers, setCareers] = useState([]); // intermediate careers value
  const [currentPage, setCurrentPage] = useState(null);
  const [filteredCareers, setFilteredCareers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // intermediate search value
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [skipSelectJob, setSkipSelectJob] = useState(false);
  const [sort, setSort] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const pageSize = 10;
  // const filters = [
  //   { text: "Work Type" },
  //   { text: "Work Setup" },
  //   { text: "Date Posted" },
  // ];

  function handleApply() {
    if (user != null) {
      applyJob();
    } else {
      if (!pathname.includes("applicant")) {
        sessionStorage.setItem("redirectionPath", pathname);
      }
      setModalType("signIn");
    }
  }

  function handleCardSelect(career) {
    replaceSessionStorage(currentPage.toString(), JSON.stringify(career), sort);
    setSelectedCareer(career);

    if (titleRef.current) {
      setTimeout(() => {
        titleRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setModalType("loading");
      window.location.href = `/whitecloak/job-openings/${career._id}`;
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("selectedJob", career._id);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }

  function handleClick() {
    if (searchQuery.trim().toLowerCase() === search.trim().toLowerCase()) {
      return;
    }

    setModalType("loading");
    removeSessionStorage();
    sessionStorage.setItem("search", searchQuery.trim());

    if (searchQuery.trim()) {
      window.location.href = `${pathname}?search=${searchQuery.trim()}`;
    } else {
      window.location.href = pathname;
    }
  }

  function handlePageChange(direction) {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handleRedirection(type) {
    setModalType("loading");

    if (type == "dashboard") {
      window.location.href = "/whitecloak/applicant";
    }

    if (type == "link-out") {
      window.location.href = `/whitecloak/job-openings/${selectedCareer._id}`;
    }
  }

  function handleSort(selectedSort) {
    if (selectedSort == sort) {
      return;
    }

    if (defaultCareerRef.current) {
      setTimeout(() => {
        defaultCareerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }

    router.push(pathname);

    removeSessionStorage();
    setSkipSelectJob(true);
    setSelectedCareer(null);
    setSort(selectedSort);
    sessionStorage.setItem("sort", selectedSort);
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

  function replaceSessionStorage(currentPage, selectedCareer, sort) {
    sessionStorage.setItem("currentPage", currentPage);
    sessionStorage.setItem("selectedCareer", selectedCareer);
    sessionStorage.setItem("sort", sort);
  }

  function removeSessionStorage() {
    sessionStorage.removeItem("currentPage");
    sessionStorage.removeItem("selectedCareer");
    sessionStorage.removeItem("sort");
  }

  function savingSearch(params, search) {
    params.set("search", search);

    setSearch(search);
    setSearchQuery(search);
  }

  async function searchCareers() {
    let filteredCareers = [...careers];

    if (searchQuery.trim() !== "") {
      const options = {
        keys: ["jobTitle", "description"],
        threshold: 0.3,
      };
      const fuse = new Fuse(careers, options);
      const results = fuse.search(searchQuery.trim());
      filteredCareers = results.map((result) => result.item);
    }

    const sortedCareers = filteredCareers.sort((a, b) => {
      if (sort === "Newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const currentPage = sessionStorage.getItem("currentPage");
    const totalPages = Math.ceil(sortedCareers.length / pageSize);

    if (currentPage) {
      setCurrentPage(parseInt(currentPage));
    } else {
      setCurrentPage(1);
    }

    let selectedJob = searchParams.get("selectedJob");
    const storedJob = sessionStorage.getItem("selectedCareer");

    if (!selectedJob && storedJob) {
      const parsedStoredJob = JSON.parse(storedJob);
      selectedJob = parsedStoredJob._id;
    }

    if (selectedJob && !skipSelectJob) {
      const job = sortedCareers.find((item) => item._id == selectedJob);
      const jobIndex = sortedCareers.findIndex(
        (item) => item._id == selectedJob
      );
      const jobPage = Math.floor(jobIndex / pageSize) + 1;

      setSelectedCareer(job);
      setCurrentPage(jobPage);
      replaceSessionStorage(jobPage.toString(), JSON.stringify(job), sort);
    }

    setFilteredCareers(sortedCareers);
    setLoading(false);
    setSkipSelectJob(false);
    setTotalPages(totalPages);
  }

  useEffect(() => {
    const careers = localStorage.getItem("careers");
    // const navType = (
    //   performance.getEntriesByType(
    //     "navigation"
    //   )[0] as PerformanceNavigationTiming
    // ).type;
    const params = new URLSearchParams(searchParams.toString());
    const search = searchParams.get("search");
    const selectedCareer = sessionStorage.getItem("selectedCareer");
    const storedSearch = sessionStorage.getItem("search");
    const sort = sessionStorage.getItem("sort");

    if (storedSearch && storedSearch.trim()) {
      savingSearch(params, storedSearch.trim());
    }

    // takes precedence over storedSearch
    if (search && search.trim()) {
      savingSearch(params, search.trim());
      sessionStorage.setItem("search", search.trim());
    }

    if (selectedCareer) {
      const parsedSelectedCareer = JSON.parse(selectedCareer);
      params.set("selectedJob", parsedSelectedCareer._id);

      setSelectedCareer(parsedSelectedCareer);
    }

    router.push(`${pathname}?${params.toString()}`);

    if (sort) {
      setSort(sort);
    } else {
      setSort("Newest");
    }

    // if (!careers || navType === "reload") {
      getCareers();
    // } else {
    //   setCareers(JSON.parse(careers));
    // }

    if (user != null) {
      const interviews = localStorage.getItem("interviews");

      // if (!interviews || navType === "reload") {
        fetchInterviews();
      // } else {
      //   const parsedInterviews = JSON.parse(interviews);
      //   setInterviews(parsedInterviews);
      // }
    }
  }, []);

  useEffect(() => {
    if (careers.length > 0) {
      setLoading(true);
      searchCareers();
    }
  }, [careers.length, sort, search.trim()]);

  useEffect(() => {
    if (loading) {
      setModalType("loading");
    } else {
      setModalType(null);
    }
  }, [loading]);

  useEffect(() => {
    if (selectedCareerRef.current) {
      setTimeout(() => {
        selectedCareerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [selectedCareerRef.current]);

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

  async function fetchInterviews() {
    await axios({
      method: "POST",
      url: "/api/whitecloak/fetch-interviews",
      data: { email: user.email },
    })
      .then(async (res) => {
        const result = await res.data;
        setInterviews(result);
        localStorage.setItem("interviews", JSON.stringify(result));
      })
      .catch((err) => {
        alert("Error fetching existing applied jobs");
        console.log(err);
      });
  }

  async function getCareers() {
    await axios({
      method: "GET",
      url: "/api/whitecloak/get-careers",
    })
      .then(async (res) => {
        const result = await res.data;

        setCareers(result);
        localStorage.setItem("careers", JSON.stringify(result));
      })
      .catch((err) => {
        alert("Error fetching jobs");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div
      className={`${styles.jobOpenings} ${
        pathname.includes("/applicant") ? styles.applicant : ""
      }`}
    >
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchContainer}>
          <div>
            <img alt="search" src="/icons/search.svg" />
            <input
              placeholder="Job title or keyword"
              value={searchQuery.trim()}
              onBlur={(e) => {
                e.target.placeholder = "Job title or keyword";
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => {
                (e.target as HTMLInputElement).placeholder = "";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleClick();
                }
              }}
            />
          </div>
          {/* <div className={styles.team}>
            <img alt="users" src="/icons/users.svg" />
            <img
              alt="chevron"
              className={styles.chevron}
              src="/icons/chevron.svg"
            />
            <input placeholder="Team" readOnly />
          </div> */}
          <button onClick={handleClick}>Search Jobs</button>
        </div>

        {/* <div className={styles.filterContainer}>
          <span>
            <img alt="funnel" src="/icons/funnel.svg" />
            Filter by:
          </span>
          {filters.map((item, index) => (
            <button key={index}>
              {item.text}
              <img
                alt="chevron"
                className={styles.chevron}
                src="/icons/chevron.svg"
              />
            </button>
          ))}
        </div> */}
      </div>

      {!loading && filteredCareers.length > 0 && (
        <div className={styles.sortContainer}>
          <span className={styles.result}>
            {search.trim() === ""
              ? "All Job Openings"
              : filteredCareers.length +
                ' jobs found for "' +
                search.trim() +
                '"'}
          </span>

          <div className={styles.sort}>
            <img alt="arrow-down-up" src="/icons/arrow-down-up.svg" />
            Sort by:&nbsp;&nbsp;
            <span
              className={`${styles.sortItem} ${
                sort === "Newest" ? styles.active : ""
              }`}
              onClick={() => handleSort("Newest")}
            >
              Newest
            </span>
            &nbsp;&nbsp;-&nbsp;&nbsp;
            <span
              className={`${styles.sortItem} ${
                sort === "Most Relevant" ? styles.active : ""
              }`}
              onClick={() => handleSort("Most Relevant")}
            >
              Most Relevant
            </span>
          </div>
        </div>
      )}

      <div className={styles.resultContainer}>
        <div className={styles.jobCardContainer}>
          {loading ? (
            <Loader loaderType="jobOpenings" loaderData={{ length: 10 }} />
          ) : (
            <>
              {filteredCareers.length > 0 ? (
                filteredCareers
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <div
                      ref={
                        selectedCareer?.id == item?.id
                          ? selectedCareerRef
                          : index == 0
                          ? defaultCareerRef
                          : null
                      }
                      className={`${styles.cardContainer} ${
                        selectedCareer?.id === item.id ? styles.active : ""
                      }`}
                      key={index}
                      onClick={() => handleCardSelect(item)}
                    >
                      <div className={styles.cardDetails}>
                        <span className={styles.jobTitle}>{item.jobTitle}</span>
                        {item.location && (
                          <span
                            className={`${styles.jobDetails} ${styles.location}`}
                          >
                            <img alt="map-pin" src="/icons/map-pin.svg" />
                            {item.location}
                          </span>
                        )}
                        <span className={styles.jobDetails}>
                          <img alt="clock" src="/icons/clock.svg" />
                          {processDate(item.createdAt)}
                        </span>
                      </div>
                      {/* <img
                        alt="heart"
                        className={styles.heart}
                        src="/icons/heart.svg"
                      /> */}
                    </div>
                  ))
              ) : (
                <div className={`${styles.cardContainer} ${styles.noJobFound}`}>
                  <div className={styles.cardDetails}>
                    <span className={styles.jobTitle}>No jobs found</span>
                  </div>
                </div>
              )}

              {totalPages >= 1 && !loading && filteredCareers.length > 0 && (
                <div className={styles.paginationContainer}>
                  <span onClick={() => handlePageChange("prev")}>{"<"}</span>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <span
                      className={`${styles.number} ${
                        index + 1 == currentPage ? styles.active : ""
                      }`}
                      key={index}
                      onClick={() => {
                        if (index + 1 == currentPage) return;

                        setCurrentPage(index + 1);
                      }}
                    >
                      {index + 1}
                    </span>
                  ))}
                  <span onClick={() => handlePageChange("next")}>{">"}</span>
                </div>
              )}
            </>
          )}
        </div>

        {!selectedCareer || loading || filteredCareers.length === 0 ? (
          <div className={`${styles.selectJob} webView`}>
            <img alt="circle-arrow-left" src="/icons/circle-arrow-left.svg" />
            <span>
              {loading
                ? "Fetching jobs..."
                : filteredCareers.length === 0
                ? "No jobs found"
                : "Select a job to view details"}
            </span>
          </div>
        ) : (
          <div className={`${styles.jobDetailsContainer} webView`}>
            <div className={styles.titleContainer} ref={titleRef}>
              <span>{selectedCareer.jobTitle}</span>
              {!pathname.includes("applicant") && (
                <img
                  alt="external-link"
                  src="/icons/external-link.svg"
                  onClick={() => handleRedirection("link-out")}
                />
              )}
              {/* <img alt="ellipsis-vertical" src="/icons/ellipsis-vertical.svg" /> */}
            </div>

            {selectedCareer.location && (
              <span className={styles.location}>
                <img alt="map-pin" src="/icons/map-pin.svg" />
                {selectedCareer.location}
                {selectedCareer.workSetup && (
                  <>
                    {" "}
                    <hr /> {selectedCareer.workSetup}
                  </>
                )}
              </span>
            )}

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
      </div>
    </div>
  );
}
