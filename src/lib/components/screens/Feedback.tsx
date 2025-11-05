"use client";

import Loader from "../common/Loader";
import styles from "@/lib/styles/screens/feedback.module.scss";
import { FIGMA_DIMENSIONS } from "@/lib/utils/constants";
import { getWidthPercentage } from "@/lib/utils/helpers";
import axios from "axios";
import Fuse from "fuse.js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CandidateModal from "../CandidateComponents/CandidateModal";

export default function () {
  const searchParams = useSearchParams();
  const orgID = searchParams.get("orgID");
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackData, setFeedbackData] = useState([]);
  const [filteredFeedbackData, setFilteredFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState(null);
  const [viewDropdown, setViewDropdown] = useState(null);
  const columnDetails = [
    { name: "Name", width: 262 },
    { name: "Position Applied", width: 215 },
    { name: "Rating", width: 148 },
    { name: "Feedback", width: 339 },
    { name: "Date", width: 148 },
  ];
  const itemsPerPage = 10;
  const ratingList = ["All Ratings", "5", "4", "3", "2", "1"];
  const sortList = ["Newest", "Oldest"];
  const tableWidth = FIGMA_DIMENSIONS.TABLE.WIDTH;
  const totalPages = Math.ceil(filteredFeedbackData.length / itemsPerPage);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  function getPaginationRange(currentPage, totalPages, maxPagesToShow = 5) {
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More pages than maxPagesToShow - need ellipses

      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftEllipsis = leftSiblingIndex > 2;
      const showRightEllipsis = rightSiblingIndex < totalPages - 1;

      if (!showLeftEllipsis && showRightEllipsis) {
        // No left ellipsis, but right ellipsis needed
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftEllipsis && !showRightEllipsis) {
        // Left ellipsis needed, no right ellipsis
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else if (showLeftEllipsis && showRightEllipsis) {
        // Both ellipses needed
        pages.push(1);
        pages.push("...");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++)
          pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else {
        // Fallback (should not occur)
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  }

  function handleDropdown(type) {
    setViewDropdown(type);
  }

  function handleRating(rating) {
    setRating(rating);
    setViewDropdown(null);
  }

  // function handleSelectFeedback() {}

  function handleSort(sort) {
    setSort(sort);
    setViewDropdown(null);
  }

  function processFeedbackData() {
    let filteredData = [...feedbackData];

    if (searchQuery.trim() !== "") {
      const fuse = new Fuse(filteredData, {
        keys: ["name", "email", "position_applied", "feedback"],
        threshold: 0.3,
      });

      const results = fuse.search(searchQuery);
      filteredData = results.map((r) => r.item);
    }

    if (rating && rating !== ratingList[0]) {
      filteredData = filteredData.filter(
        (item) => String(item.rating) === rating
      );
    }

    if (sort === sortList[0]) {
      filteredData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    if (sort === sortList[1]) {
      filteredData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    setFilteredFeedbackData(filteredData);
    setLoading(false);
  }

  function downloadFeedback() {
    if (filteredFeedbackData.length > 0) {
      const headers = columnDetails.map((col) => col.name).join(",") + "\n";
      const rows = filteredFeedbackData.map((obj) =>
        columnDetails
          .map(
            (col) => obj[col.name.toLowerCase().replaceAll(" ", "_")] || "N/A"
          )
          .join(",")
      );
      const csvContent = headers + rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = Date.now();

      link.href = url;
      link.setAttribute("download", `feedback-${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function processDate(date) {
    const newDate = new Date(date);

    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(newDate);

    return formatted;
  }

  useEffect(() => {
    const activeOrg = localStorage.getItem("activeOrg");

    if (activeOrg) {
      const parsedActiveOrg = JSON.parse(activeOrg);
      fetchFeedback(parsedActiveOrg._id);
    }
  }, []);

  useEffect(() => {
    if (feedbackData.length > 0) {
      setCurrentPage(1);
      processFeedbackData();
    }
  }, [rating, sort, searchQuery]);

  async function fetchFeedback(orgID) {
    await axios({
      data: { orgID },
      method: "POST",
      url: "/api/fetch-feedback",
    })
      .then(async (res) => {
        const result = await res.data;

        if (result.length > 0) {
          const sortedResult = result.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const data = sortedResult.map((item) => ({
            image: item.interviewDetails?.image,
            name: item.interviewDetails?.name,
            email: item.interviewDetails?.email,
            position_applied: item.interviewDetails?.jobTitle,
            rating: item?.rating,
            feedback: item?.feedback,
            date: processDate(item?.createdAt),
          }));

          setFeedbackData(data);
          setRating(ratingList[0]);
          setSort(sortList[0]);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        alert("Error on fetching feedback data.");
        setLoading(false);
        console.log(err);
      });
  }

  return (
    <div className={styles.feedbackContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.textContainer}>
          <span className={styles.title}>Feedback</span>
          <span className={styles.description}>
            Check interview feedbacks provided by the applicants here.
          </span>
        </div>

        <div className={styles.actionBar}>
          <div className={styles.inputContainer}>
            <img alt="search" src="/icons/search.svg" />
            <input
              placeholder="Search"
              value={searchQuery}
              onBlur={(e) => {
                (e.target as HTMLInputElement).placeholder = "Search";
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onClick={(e) => {
                (e.target as HTMLInputElement).placeholder = "";
              }}
            />
          </div>

          <button onClick={downloadFeedback}>
            <img alt="download" src="/icons/download-cloud.svg" />
            Download
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.bg} />

        <div className={styles.tableHeader}>
          <span className={styles.title}>Feedbacks</span>
          <span className={styles.count}>{filteredFeedbackData?.length}</span>
          <button
            onBlur={() => handleDropdown(null)}
            onClick={() => handleDropdown("rating")}
          >
            <img alt="star" src="/icons/star.svg" />
            {rating}
          </button>
          <button
            onBlur={() => handleDropdown(null)}
            onClick={() => handleDropdown("sort")}
          >
            <img alt="sort" src="/icons/sort.svg" />
            Sort By: {sort} First
          </button>

          {viewDropdown != null && (
            <div
              className={`${styles.dropdownContainer} ${styles[viewDropdown]}`}
            >
              {viewDropdown == "rating" &&
                ratingList.map((item, index) => (
                  <span
                    key={index}
                    className={rating == item ? styles.active : ""}
                    onClick={() => handleRating(item)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {index == 0 ? item : `${item} star`}
                    {rating == item && (
                      <img alt="check" src="/icons/checkV4.svg" />
                    )}
                  </span>
                ))}

              {viewDropdown == "sort" &&
                sortList.map((item, index) => (
                  <span
                    key={index}
                    className={sort == item ? styles.active : ""}
                    onClick={() => handleSort(item)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {item} First
                    {sort == item && (
                      <img alt="check" src="/icons/checkV4.svg" />
                    )}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className={styles.tableDetails}>
          {columnDetails.map((item, index) => (
            <span
              key={index}
              style={{
                width: `${getWidthPercentage(
                  item.width,
                  FIGMA_DIMENSIONS.TABLE.WIDTH
                )}%`,
              }}
            >
              {item.name}
            </span>
          ))}
        </div>

        <div className={styles.tableContents}>
          {loading && (
            <Loader
              loaderType={"feedback"}
              loaderData={{ length: 10, columnDetails }}
            />
          )}

          {!loading && filteredFeedbackData.length == 0 && (
            <div className={styles.emptyState}>
              <img alt="reviews" src="/icons/reviews.svg" />
              <span className={styles.title}>No Feedback Yet</span>
              <span className={styles.description}>
                Feedback from applicants will appear here once it's submitted.
              </span>
            </div>
          )}

          {!loading &&
            filteredFeedbackData.length > 0 &&
            filteredFeedbackData
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((data, index) => (
                <div
                  className={styles.contentContainer}
                  key={index}
                  // onClick={() => handleSelectFeedback(data.email)}
                >
                  <div
                    className={styles.userContainer}
                    style={{
                      width: `${getWidthPercentage(
                        columnDetails[0].width,
                        tableWidth
                      )}%`,
                    }}
                    onClick={() => {
                      setSelectedCandidate(data);
                      setCandidateDetailsOpen(true);
                    }}
                  >
                    <img alt="user" src={data?.image} />
                    <div className={styles.userDetails}>
                      <span className={styles.name}>{data?.name}</span>
                      <span className={styles.email}>{data?.email}</span>
                    </div>
                  </div>
                  <span
                    className={styles.position}
                    style={{
                      width: `${getWidthPercentage(
                        columnDetails[1].width,
                        tableWidth
                      )}%`,
                    }}
                  >
                    {data?.position_applied}
                  </span>
                  <div
                    className={styles.ratingContainer}
                    style={{
                      width: `${getWidthPercentage(
                        columnDetails[2].width,
                        tableWidth
                      )}%`,
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <img
                        key={index}
                        alt="star-rating"
                        src={`/icons/${
                          index < parseInt(data?.rating)
                            ? "star-filled"
                            : "star-empty"
                        }.svg`}
                      />
                    ))}
                  </div>
                  <span
                    className={styles.feedback}
                    style={{
                      width: `${getWidthPercentage(
                        columnDetails[3].width,
                        tableWidth
                      )}%`,
                    }}
                  >
                    {data?.feedback || "-"}
                  </span>
                  <span
                    className={styles.date}
                    style={{
                      width: `${getWidthPercentage(
                        columnDetails[4].width,
                        tableWidth
                      )}%`,
                    }}
                  >
                    {data?.date}
                  </span>
                </div>
              ))}
        </div>

        <div className={styles.tablePagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={currentPage === 1 ? styles.disabled : ""}
          >
            <img
              alt="arrow"
              src={`/icons/arrow${currentPage === 1 ? "-disabled" : ""}.svg`}
            />
            Previous
          </button>

          <div className={styles.pagination}>
            {getPaginationRange(currentPage, totalPages).map((page, index) =>
              page === "..." ? (
                <span key={index} className={styles.ellipsis}>
                  &hellip;
                </span>
              ) : (
                <span
                  key={index}
                  className={currentPage === page ? styles.active : ""}
                  onClick={() => setCurrentPage(page)}
                  style={{ cursor: "pointer" }}
                >
                  {page}
                </span>
              )
            )}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? styles.disabled : ""}
          >
            Next
            <img
              alt="arrow"
              src={`/icons/arrow${
                currentPage === totalPages ? "-disabled" : ""
              }.svg`}
            />
          </button>
        </div>
      </div>
      {candidateDetailsOpen && (
        <CandidateModal
          candidate={selectedCandidate}
          setShowCandidateModal={setCandidateDetailsOpen}
        />
      )}
    </div>
  );
}
