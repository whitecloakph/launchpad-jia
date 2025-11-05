"use client";

import styles from "@/lib/styles/screen/home.module.scss";
import { contextProvider } from "@/lib/context/Context";
import { useEffect, useState } from "react";

export default function () {
  const { user, setModalType } = contextProvider();
  const [search, setSearch] = useState("");

  function handleBrowseOpenings() {
    setModalType("loading");
    removeSessionStorage();

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

  function handleClick() {
    setModalType("loading");
    removeSessionStorage();

    if (search.trim()) {
      window.location.href = `/whitecloak/job-openings?search=${search.trim()}`;
    } else {
      window.location.href = "/whitecloak/job-openings";
    }
  }

  function removeSessionStorage() {
    sessionStorage.removeItem("currentPage");
    sessionStorage.removeItem("selectedCareer");
    sessionStorage.removeItem("search");
    sessionStorage.removeItem("sort");
  }

  useEffect(() => {
    const storedSearch = sessionStorage.getItem("search");

    if (storedSearch && storedSearch.trim()) {
      setSearch(storedSearch.trim());
    }
  }, []);

  return (
    <>
      <div className={styles.bg} />

      <div className={styles.home}>
        <div className={styles.topContainer}>
          <div className={styles.textContainer}>
            <span className={styles.title}>Your future at </span>
            <span className={`${styles.title} ${styles.whitecloak}`}>
              White Cloak
            </span>
            <span className={styles.title}>starts here.</span>

            <span className={`${styles.description} ${styles.withMargin}`}>
              We've modernized the way we hire,
            </span>
            <span className={styles.description}>
              so you can experience a
              <span className={styles.bold}> better, faster,</span>
            </span>
            <span className={styles.description}>
              and <span className={styles.bold}>more transparent </span>
              application process.
            </span>
          </div>

          <div className={styles.imageContainer}>
            <img alt="banner" src="/images/banner.webp" />
          </div>
        </div>

        <div className={styles.bottomContainer}>
          <div className={styles.inputContainer}>
            <img alt="search" src="/icons/search.svg" />

            <input
              // list="job-suggestions"
              placeholder="Job title or keyword"
              value={search.trim()}
              onBlur={(e) => {
                e.target.placeholder = "Job title or keyword";
              }}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => {
                (e.target as HTMLInputElement).placeholder = "";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleClick();
                }
              }}
            />

            {/* <datalist id="job-suggestions">
              <option value="Frontend Developer" />
              <option value="Backend Developer" />
              <option value="UI/UX Designer" />
              <option value="Project Manager" />
            </datalist> */}

            <button onClick={handleClick}>Search Jobs</button>
          </div>

          <span>
            Or <a onClick={handleBrowseOpenings}>browse all openings {">"}</a>
          </span>
        </div>
      </div>
    </>
  );
}
