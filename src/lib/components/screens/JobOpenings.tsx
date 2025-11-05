// TODO (Job Portal) - Check API

"use client";

import Loader from "@/lib/components/commonV2/Loader";
import styles from "@/lib/styles/screens/jobOpenings.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { processDate } from "@/lib/utils/helpersV2";
import axios from "axios";
import Fuse from "fuse.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function () {
  const pathname = usePathname();
  const buttonRef = useRef([]);
  const cardRef = useRef(null);
  const detailsRef = useRef(null);
  const defaultRef = useRef(null);
  const filterContainerRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsValue = searchParams.get("search");
  const [buttons, setButtons] = useState([
    {
      name: "Sort By",
      value: ["Newest"],
      list: ["Newest", "Most Relevant"],
      dropdownWidth: 164,
    },
    {
      name: "Location",
      value: ["Philippines"],
      list: [
        "Philippines",
        "Makati City",
        "Quezon City",
        "National Capital Region",
        "Near me · use exact location",
      ],
      dropdownWidth: 243,
      placeholder: "Search location",
    },
    {
      name: "Date Posted",
      value: ["Any time"],
      list: ["Any time", "Past month", "Past week", "Past 24 hours"],
      dropdownWidth: 164,
    },
    {
      name: "Experience Level",
      value: [],
      list: [
        "Internship",
        "Entry-level",
        "Associate",
        "Mid-Senior Level",
        "Director",
        "Executive",
      ],
      dropdownWidth: 177,
    },
    {
      name: "Company",
      value: [],
      list: [],
      dropdownWidth: 255,
      placeholder: "Search company",
    },
    {
      name: "Work Setup",
      value: [],
      list: ["Remote", "Onsite", "Hybrid"],
      dropdownWidth: 170,
    },
  ]);
  const [buttonPosition, setButtonPosition] = useState(null);
  const [careers, setCareers] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  const [deviceWidth, setDeviceWidth] = useState(0);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [filteredCareers, setFilteredCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInputs, setSearchInputs] = useState({});
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [viewDropdown, setViewdropdown] = useState(false);
  const { modalType, user, setModalType } = useAppContext();
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
  // const itemPerPage = 10;

  function getFilteredList(button, indexButton) {
    const query = searchInputs[indexButton] ?? "";

    if (![1, 4].includes(indexButton) || !query.trim()) {
      return button.list;
    }

    const fuse = new Fuse(button.list, {
      threshold: 0.3,
      ignoreLocation: true,
    });
    const results = fuse.search(query);

    return results.map((result) => result.item);
  }

  function handleApply() {
    if (user != null) {
      applyJob();
    } else {
      sessionStorage.setItem("redirectionPath", pathname);
      setModalType("signIn");
    }
  }

  function handleCard(career) {
    if (deviceWidth < 768) {
      sessionStorage.setItem("selectedCareer", JSON.stringify(career));
      handleRedirection(`${pathConstants.jobOpenings}/${career._id}`);
      return null;
    }

    if (selectedCareer && career.id == selectedCareer.id) {
      return null;
    }

    sessionStorage.setItem("selectedCareer", JSON.stringify(career));
    setSelectedCareer(career);
    setViewdropdown(false);

    if (detailsRef.current) {
      detailsRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function handleClearFilter(indexButton) {
    const updatedButtons = [...buttons];
    updatedButtons[indexButton].value = [];

    updateQueryParams(
      updatedButtons[indexButton].name.toLowerCase().replace(" ", ""),
      ""
    );

    setButtons(updatedButtons);
    // setCurrentPage(1);
    setSelectedCareer(null);
    sessionStorage.removeItem("selectedCareer");

    if (defaultRef.current) {
      defaultRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function handleDropdownIndex(index) {
    setButtonPosition(null);
    setDropdownIndex((prev) => (prev == index ? null : index));

    const buttonElement = buttonRef.current[index];
    const filterElement = filterContainerRef.current;

    if (filterElement && buttonElement) {
      let offset = 16;

      if (
        pathname == pathConstants.dashboardJobOpenings &&
        deviceWidth >= 768
      ) {
        offset = 272;
      }

      filterElement.scrollTo({
        left: buttonElement.offsetLeft - offset,
        behavior: "smooth",
      });

      setTimeout(() => {
        setButtonPosition({
          left: buttonElement.getBoundingClientRect().left,
        });
      }, 300);
    }
  }

  // function handlePagination(directionOrPage) {
  //   const totalPages = Math.ceil(filteredCareers.length / itemPerPage);

  //   if (typeof directionOrPage === "number") {
  //     setCurrentPage(directionOrPage);
  //   } else if (directionOrPage === "next" && currentPage < totalPages) {
  //     setCurrentPage((prev) => prev + 1);
  //   } else if (directionOrPage === "prev" && currentPage > 1) {
  //     setCurrentPage((prev) => prev - 1);
  //   }
  // }

  function handleRedirection(path) {
    if (path == pathConstants.whitecloak) {
      window.open(path, "_blank");
      return null;
    }

    window.location.href = path;
  }

  function handleResize() {
    setDeviceWidth(window.innerWidth);
  }

  function handleSelection(item, indexButton) {
    const updatedButtons = [...buttons];
    let currentValues = updatedButtons[indexButton].value;

    if (indexButton > 2) {
      const checboxElement = document.getElementById(item);

      if (checboxElement) {
        checboxElement.click();
      }

      if (currentValues.includes(item)) {
        currentValues = currentValues.filter((i) => i !== item);
      } else {
        currentValues = [...new Set([...currentValues, item])];
      }

      updatedButtons[indexButton].value = currentValues;
    } else {
      if (
        !(
          indexButton == 1 &&
          buttons[1].list[buttons[1].list.length - 1] == item
        )
      ) {
        setDropdownIndex(null);
        updatedButtons[indexButton].value = [item];
      }
    }

    if (indexButton == 1) {
      if (
        buttons[indexButton].list[buttons[indexButton].list.length - 1] == item
      ) {
        setModalType("location");
      } else {
        setSearchInputs((prev) => ({ ...prev, [indexButton]: "" }));
      }
    }

    updateQueryParams(
      updatedButtons[indexButton].name.toLowerCase().replace(" ", ""),
      updatedButtons[indexButton].value.join(",")
    );

    setButtons(updatedButtons);
    // setCurrentPage(1);
    setSelectedCareer(null);
    sessionStorage.removeItem("selectedCareer");

    if (defaultRef.current) {
      defaultRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function updateQueryParams(key, value) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${url.pathname}?${params.toString()}`);
  }

  useEffect(() => {
    fetchCareers();
    handleResize();

    if (user != null) {
      fetchInterviews();
    }

    if (searchParamsValue && searchParamsValue.trim()) {
      sessionStorage.removeItem("selectedCareer");
      setSearch(searchParamsValue.trim());
    } else {
      const storedSelecterCareer = sessionStorage.getItem("selectedCareer");

      if (storedSelecterCareer) {
        setSelectedCareer(JSON.parse(storedSelecterCareer));
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setButtonPosition(null);
    setDropdownIndex(null);
  }, [deviceWidth]);

  useEffect(() => {
    if (!loading && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading]);

  useEffect(() => {
    const location = sessionStorage.getItem("location");

    if (location) {
      sessionStorage.removeItem("location");
      const updatedButtons = [...buttons];
      updatedButtons[1].value = [location];
      setButtons(updatedButtons);
      setDropdownIndex(null);
    }
  }, [modalType]);

  useEffect(() => {
    const filters = {};
    let filteredCareers = [...careers];

    buttons.forEach((item) => {
      filters[item.name] = item.value;
    });

    if (search.trim()) {
      const fuse = new Fuse(filteredCareers, {
        threshold: 0.2,
        keys: ["jobTitle", "description"],
      });
      const searchResults = fuse.search(search.trim());

      filteredCareers = searchResults.map((res) => res.item);
    }

    if (filters[buttons[0].name][0] == buttons[0].list[0]) {
      filteredCareers.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (filters[buttons[0].name][0] == buttons[0].list[1]) {
      filteredCareers.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    if (
      filters[buttons[2].name].length > 0 &&
      filters[buttons[2].name][0] != buttons[2].list[0]
    ) {
      const now = new Date().getTime();
      const datePosted = filters[buttons[2].name][0];
      const datePostedFilters = buttons[2].list;

      let timeAgo = now;

      if (datePosted === datePostedFilters[1]) {
        timeAgo = now - 30 * 24 * 60 * 60 * 1000;
      }

      if (datePosted === datePostedFilters[2]) {
        timeAgo = now - 7 * 24 * 60 * 60 * 1000;
      }

      if (datePosted === datePostedFilters[3]) {
        timeAgo = now - 24 * 60 * 60 * 1000;
      }

      filteredCareers = filteredCareers.filter((career) => {
        const createdAt = new Date(career.createdAt).getTime();
        return createdAt >= timeAgo;
      });
    }

    if (filters[buttons[4].name].length > 0) {
      filteredCareers = filteredCareers.filter((career) =>
        filters[buttons[4].name].includes(career.organization.name)
      );
    }

    if (filters[buttons[5].name].length > 0) {
      filteredCareers = filteredCareers.filter((career) => {
        return filters[buttons[5].name].some(
          (setup) =>
            career.workSetup &&
            career.workSetup.toLowerCase().includes(setup.toLowerCase())
        );
      });
    }

    setFilteredCareers(filteredCareers);
  }, [buttons, search]);

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

  function fetchCareers() {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-careers",
      data: { jobID: "all" },
    })
      .then((res) => {
        const result = res.data;
        const organization: any = [
          ...new Set(result.map((item) => item.organization.name)),
        ];
        const updatedButtons = [...buttons];
        updatedButtons[4].list = organization;

        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const queryParams = {};
        const deleteKeys = [];

        for (const [key, value] of params.entries()) {
          if (queryParams[key]) {
            queryParams[key].push(...value.trim().split(","));
          } else {
            queryParams[key] = [...value.trim().split(",")];
          }
        }

        for (const key in queryParams) {
          if (
            Array.isArray(queryParams[key]) &&
            queryParams[key].length == 1 &&
            !queryParams[key][0].trim()
          ) {
            deleteKeys.push(key);
            delete queryParams[key];
          }
        }

        if (deleteKeys.length > 0) {
          deleteKeys.forEach((key) => {
            params.delete(key);
          });
        }

        router.replace(`${url.pathname}?${params.toString()}`);

        if (Object.keys(queryParams).length) {
          updatedButtons.forEach((button) => {
            const key = button.name.toLowerCase().replace(" ", "");
            const selectedValues = queryParams[key];

            if (selectedValues) {
              button.value = selectedValues;
            }
          });
        }

        setButtons(updatedButtons);
        setCareers(result);
        setFilteredCareers(result);
      })
      .catch((err) => {
        alert("Error on fetching careers.");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function fetchInterviews() {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-interviews",
      data: { email: user.email, interviewID: "all" },
    })
      .then((res) => {
        const result = res.data;

        setInterviews(result);
      })
      .catch((err) => {
        alert("Error fetching existing application.");
        console.log(err);
      });
  }

  return (
    <div
      className={`${styles.jobOpeningsContainer} ${
        pathname == pathConstants.dashboardJobOpenings && deviceWidth > 768
          ? styles.dashboard
          : ""
      }`}
    >
      <div className={styles.filterContainer} ref={filterContainerRef}>
        {buttons.map((button, indexBtn) => (
          <div
            className={styles.buttonContainer}
            key={indexBtn}
            ref={(e) => {
              buttonRef.current[indexBtn] = e;
            }}
            style={{ display: [1, 3].includes(indexBtn) ? "none" : "" }}
          >
            <button
              className={`${
                indexBtn > 0 && button.value.length > 0 ? "" : "secondaryBtn"
              }`}
              disabled={loading}
              onClick={() => handleDropdownIndex(indexBtn)}
            >
              {indexBtn == 0 && <img alt="" src={assetConstants.sort} />}

              <span>
                {indexBtn == 0 && "Sort By: "}
                {button.value.length > 0
                  ? button.value.join(", ")
                  : button.name}
              </span>

              {indexBtn > 0 && (
                <img
                  alt=""
                  className={`${
                    button.value.length == 0 &&
                    dropdownIndex == indexBtn &&
                    indexBtn > 0
                      ? styles.rotate
                      : ""
                  }`}
                  src={
                    indexBtn > 0 && button.value.length > 0
                      ? assetConstants.xV3
                      : assetConstants.chevron
                  }
                  onClick={(e) => {
                    if (button.value.length > 0 && indexBtn > 0) {
                      e.stopPropagation();
                      handleClearFilter(indexBtn);
                    }
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </button>

            {dropdownIndex == indexBtn && buttonPosition != null && (
              <div
                className={styles.dropdownContainer}
                style={{
                  width: button.dropdownWidth,
                  ...buttonPosition,
                }}
              >
                {[1, 4].includes(indexBtn) && (
                  <div className={styles.searchContainer}>
                    <img alt="" src={assetConstants.search} />
                    <input
                      placeholder={button.placeholder}
                      value={searchInputs[indexBtn] || ""}
                      onBlur={(e) =>
                        (e.target.placeholder = button.placeholder)
                      }
                      onChange={(e) =>
                        setSearchInputs((prev) => ({
                          ...prev,
                          [indexBtn]: e.target.value,
                        }))
                      }
                      onFocus={(e) =>
                        ((e.target as HTMLInputElement).placeholder = "")
                      }
                    />
                  </div>
                )}

                {getFilteredList(button, indexBtn).map((item, index) => (
                  <span
                    className={button.value.includes(item) ? styles.active : ""}
                    key={index}
                    onClick={() => handleSelection(item, indexBtn)}
                  >
                    {indexBtn > 2 && (
                      <input
                        id={item}
                        type="checkbox"
                        checked={button.value.includes(item)}
                        readOnly
                      />
                    )}
                    {item}
                    {button.value.includes(item) && indexBtn < 3 && (
                      <img alt="" src={assetConstants.checkV5} />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.filterResultContainer}>
        {!loading ? (
          <>
            <span className={styles.searchResult}>
              <span className={styles.bold}>
                {search && search.trim() ? search.trim() : "All Job Openings"}
              </span>{" "}
              {buttons[1].value[0] ? `in ${buttons[1].value[0]}` : ""}{" "}
              <span className={styles.bold}>
                {buttons[4].value.length > 0
                  ? `at ${buttons[4].value.join(", ")}`
                  : ""}
              </span>
            </span>
            <span className={styles.resultNumber}>
              {filteredCareers.length} jobs found
            </span>
          </>
        ) : (
          <span className={styles.loading}></span>
        )}
      </div>

      <div className={styles.jobResultContainer}>
        <div className={styles.jobCardContainer} ref={defaultRef}>
          {loading && (
            <Loader loaderType={"career"} loaderData={{ length: 10 }} />
          )}

          {filteredCareers.length == 0 && !loading && (
            <span className={styles.emptyCards}>No jobs found</span>
          )}

          {filteredCareers.length > 0 &&
            !loading &&
            filteredCareers
              // .slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage)
              .map((career, index) => (
                <div
                  className={`${styles.gradientContainer} ${
                    selectedCareer && selectedCareer.id == career.id
                      ? styles.active
                      : ""
                  }`}
                  key={index}
                  ref={
                    selectedCareer && selectedCareer.id == career.id
                      ? cardRef
                      : null
                  }
                >
                  <div
                    className={styles.cardContainer}
                    onClick={() => handleCard(career)}
                  >
                    <div className={styles.companyDetails}>
                      {career.organization && career.jobTitle && (
                        <>
                          {career.organization.image && (
                            <img alt="" src={career.organization.image} />
                          )}

                          <div className={styles.textContainer}>
                            <span className={styles.jobTitle}>
                              {career.jobTitle}
                            </span>

                            {career.organization.name && (
                              <span className={styles.companyName}>
                                {career.organization.name}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {career.location && (
                      <span className={styles.details}>
                        <img alt="" src={assetConstants.mapPin} />
                        {career.location}
                      </span>
                    )}

                    {career.createdAt && (
                      <span className={styles.details}>
                        <img alt="" src={assetConstants.clock} />
                        {processDate(career.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}

          {/* {filteredCareers.length > 0 && (
            <div className={styles.paginationContainer}>
              <span
                className={`${styles.direction} ${styles.rotate}`}
                onClick={() => handlePagination("prev")}
              >
                <img alt="arrow" src={assetConstants.arrowV3} />
                Prev
              </span>

              {Array.from({
                length: Math.ceil(filteredCareers.length / itemPerPage),
              }).map((_, index) => (
                <span
                  key={index}
                  className={`${styles.index} ${
                    currentPage == index + 1 ? styles.active : ""
                  }`}
                  onClick={() => handlePagination(index + 1)}
                >
                  {index + 1}
                </span>
              ))}

              <span
                className={styles.direction}
                onClick={() => handlePagination("next")}
              >
                Next
                <img alt="arrow" src={assetConstants.arrowV3} />
              </span>
            </div>
          )} */}
        </div>

        {!selectedCareer && !loading && (
          <div className={`webView ${styles.emptyState}`}>
            <img alt="" src={assetConstants.arrowCircle} />
            Select a job to view details
          </div>
        )}

        {selectedCareer && !loading && (
          <div className={`webView ${styles.gradientContainer}`}>
            <div className={styles.jobDetailsContainer} ref={detailsRef}>
              {selectedCareer.jobTitle && (
                <div className={styles.titleContainer}>
                  <span>{selectedCareer.jobTitle}</span>
                  <img
                    alt=""
                    src={assetConstants.externalLink}
                    onClick={() =>
                      handleRedirection(
                        `${pathConstants.jobOpenings}/${selectedCareer._id}`
                      )
                    }
                    onContextMenu={(e) => e.preventDefault()}
                  />
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

              {selectedCareer.organization &&
                selectedCareer.organization.name && (
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

              {interviews.some(
                (interview) => interview.id == selectedCareer.id
              ) ? (
                <div className={styles.appliedContainer}>
                  <span className={styles.applied}>
                    <img alt="" src={assetConstants.checkV4} />
                    Applied{" "}
                    {processDate(
                      interviews.find(
                        (interview) => interview.id == selectedCareer.id
                      ).createdAt
                    )}
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

                      {selectedCareer.organization.name.includes(
                        "White Cloak"
                      ) && (
                        <>
                          <span
                            className={`${styles.details} ${styles.withMargin}`}
                          >
                            Founded in 2014, White Cloak continues to be the
                            innovation partner of choice for many major
                            corporations, leveraging technology to take its
                            client’s business to the next level. This technical
                            superiority and commitment to our clients have
                            brought numerous recognition and awards to White
                            Cloak.
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
        )}
      </div>
    </div>
  );
}
