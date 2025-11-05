"use client";

import styles from "@/lib/styles/commonV2/navbar.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function () {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search");
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [viewSearch, setViewSearch] = useState(false);
  const { user, setModalType } = useAppContext();
  const links = [
    {
      href: pathConstants.jobOpenings,
      name: "Find Jobs",
    },
    {
      href: `${pathConstants.employer}/#how-it-works`,
      name: "How it works",
    },
    {
      href: `${pathConstants.home}#`,
      name: "Testimonials",
    },
    {
      href: `${pathConstants.home}#`,
      name: "About",
    },
    {
      href: pathConstants.dashboard,
      image: assetConstants.dashboard,
      name: "Dashboard",
    },
    {
      href: pathConstants.dashboardJobOpenings,
      image: assetConstants.briefcase,
      name: "Job Openings",
    },
    {
      href: pathConstants.manageCV,
      image: assetConstants.file,
      name: "Manage CV",
    },
    {
      href: pathConstants.dashboard,
      image: assetConstants.settings,
      name: "Settings",
    },
  ];

  function handleSearch() {
    const jobSearchPath = `${pathname}${
      search && search.trim() ? `?search=${search.trim()}` : ""
    }`;

    handleRedirection(jobSearchPath);
  }

  function handleSignIn() {
    setModalType("signIn");
  }

  function handleRedirection(path) {
    if (path.includes(pathConstants.employer)) {
      window.open(path, "_blank");
      return null;
    }

    const hasChanges = sessionStorage.getItem("hasChanges");

    if (hasChanges == "true") {
      Promise.resolve(
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave this page?"
        )
      ).then((confirmed) => {
        if (confirmed) {
          if (path == pathConstants.home) {
            setModalType("logout");
          } else {
            window.location.href = path;
          }
        }
      });
    } else {
      if (path == pathConstants.home) {
        setModalType("logout");
      } else {
        window.location.href = path;
      }
    }
  }

  useEffect(() => {
    if (
      pathname.includes("/job-openings") &&
      querySearch &&
      querySearch.trim()
    ) {
      setSearch(querySearch.trim());
    } else {
      setSearch("");
    }
  }, [pathname, searchParams]);

  if (pathname.includes("/dashboard") && user == null) {
    return null;
  }

  return (
    <nav
      className={`${styles.navbarContainer} ${
        pathname == pathConstants.home ||
        (window.location.origin.includes("localhost") &&
          pathname.includes("job-portal"))
          ? styles.home
          : ""
      }`}
    >
      <img
        alt=""
        className={styles.jia}
        src={assetConstants.jia}
        onClick={() =>
          handleRedirection(
            `${
              window.location.origin.includes("localhost")
                ? "/job-portal"
                : pathConstants.employee
            }`
          )
        }
        onContextMenu={(e) => e.preventDefault()}
      />

      {(pathname == pathConstants.home ||
        (window.location.origin.includes("localhost") &&
          pathname.includes("job-portal"))) && (
        <div className={`webView ${styles.linkContainer}`}>
          {links.slice(0, 2).map((item, index) => (
            <span key={index} onClick={() => handleRedirection(item.href)}>
              {item.name}
            </span>
          ))}
        </div>
      )}

      {[pathConstants.jobOpenings, pathConstants.dashboardJobOpenings].includes(
        pathname
      ) && (
        <div className={`webView ${styles.searchContainer}`}>
          <img alt="" src={assetConstants.search} />
          <input
            placeholder="Job title or keyword"
            value={search}
            onBlur={(e) => (e.target.placeholder = "Job title or keyword")}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => ((e.target as HTMLInputElement).placeholder = "")}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                handleSearch();
              }
            }}
          />
          <button onClick={handleSearch}>Search Jobs</button>
        </div>
      )}

      {user ? (
        <div className={`webView ${styles.userItems}`}>
          {pathname == pathConstants.uploadCV ? (
            <span onClick={() => handleRedirection(pathConstants.dashboard)}>
              Dashboard
            </span>
          ) : (
            <></>
            // <img alt="" src={assetConstants.bell} />
          )}
          <img
            alt=""
            className={styles.user}
            src={user.image}
            onClick={() => handleRedirection(pathConstants.dashboard)}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      ) : (
        <div className={`webView ${styles.loginItems}`}>
          <button className="secondaryBtn" onClick={handleSignIn}>
            Sign In
          </button>
          <span onClick={() => handleRedirection(pathConstants.employer)}>
            For Employers
          </span>
        </div>
      )}

      {[pathConstants.jobOpenings, pathConstants.dashboardJobOpenings].includes(
        pathname
      ) && (
        <img
          alt=""
          className={`mobileView ${styles.menu}`}
          src={assetConstants.search}
          onClick={() => {
            if (dropdown) {
              setDropdown(false);
            }

            setViewSearch((prev) => !prev);
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      <img
        alt=""
        className={`mobileView ${styles.menu}`}
        src={`${
          user == null && dropdown == false
            ? assetConstants.menu
            : user != null && dropdown == false
            ? user.image
            : assetConstants.x
        }`}
        onClick={() => {
          if (viewSearch) {
            setViewSearch(false);
          }

          setDropdown((prev) => !prev);
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {viewSearch && (
        <div className={`mobileView ${styles.searchContainer}`}>
          <img alt="" src={assetConstants.search} />
          <input
            placeholder="Job title or keyword"
            value={search}
            onBlur={(e) => (e.target.placeholder = "Job title or keyword")}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => ((e.target as HTMLInputElement).placeholder = "")}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                handleSearch();
              }
            }}
          />
          <button onClick={handleSearch}>Search Jobs</button>
        </div>
      )}

      {dropdown && (
        <div className={`mobileView ${styles.dropdownContainer}`}>
          {user == null ? (
            <>
              {links.slice(0, 2).map((link, index) => (
                <span key={index} onClick={() => handleRedirection(link.href)}>
                  {link.name}
                </span>
              ))}
              <span
                className={styles.employer}
                onClick={() => handleRedirection(pathConstants.employer)}
              >
                For Employers
              </span>
              <div className={styles.buttonContainer}>
                <button className="secondaryBtn" onClick={handleSignIn}>
                  Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              {links.slice(4, 7).map((link, index) => (
                <span key={index} onClick={() => handleRedirection(link.href)}>
                  <img alt="" src={link.image} />
                  {link.name}
                </span>
              ))}
              <div className={styles.buttonContainer}>
                <button
                  className="secondaryBtn"
                  onClick={() => handleRedirection(pathConstants.home)}
                >
                  <img alt="" src={assetConstants.logoutV2} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
