"use client";

import styles from "@/lib/styles/common/navbar.module.scss";
import { contextProvider } from "@/lib/context/Context";
import { usePathname } from "next/navigation";
import { useState, Fragment, useEffect } from "react";

export default function () {
  const pathname = usePathname();
  const { user, setModalType } = contextProvider();
  const [activeLink, setActiveLink] = useState(null);
  const [viewDropdown, setViewDropdown] = useState(false);
  const links = [
    {
      icon: "homeV2",
      text: "Dashboard",
      function: (link) => {
        if (link === activeLink) {
          return false;
        }

        checkChanges("/whitecloak/applicant");
      },
    },
    {
      icon: "briefcaseV2",
      text: "Job Openings",
      function: (link) => {
        if (link === activeLink) {
          return false;
        }

        checkChanges("/whitecloak/applicant/job-openings");
      },
    },
    {
      icon: "userV2",
      text: "Manage CV",
      function: (link) => {
        if (link === activeLink) {
          return false;
        }

        checkChanges("/whitecloak/applicant/manage-cv");
      },
    },
    {
      icon: "settingsV2",
      text: "Settings",
      function: (link) => {
        if (link === activeLink) {
          return false;
        }

        setActiveLink(link);
      },
    },
  ];

  function checkChanges(route) {
    setModalType("loading");

    if (sessionStorage.getItem("hasChanges") == "true") {
      Promise.resolve(
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave this page?"
        )
      ).then((confirmed) => {
        if (confirmed) {
          if (route == "/whitecloak") {
            localStorage.clear();
            sessionStorage.clear();
          }

          window.location.href = route;
        } else {
          setModalType(null);
        }
      });
    } else {
      if (route == "/whitecloak") {
        localStorage.clear();
        sessionStorage.clear();
      }

      window.location.href = route;
    }
  }

  function handleClick() {
    checkChanges("/whitecloak/#");
  }

  function handleLogout() {
    checkChanges("/whitecloak");
  }

  // function handleNotification() {}

  function handleSignIn() {
    setModalType("signIn");
  }

  function handleUserIcon() {
    checkChanges("/whitecloak/applicant");
  }

  function toggleDropdown() {
    setViewDropdown(!viewDropdown);
  }

  useEffect(() => {
    if (pathname.includes("applicant")) {
      if (pathname.includes("job-openings")) {
        setActiveLink("Job Openings");
      } else if (pathname.includes("manage-cv")) {
        setActiveLink("Manage CV");
      } else {
        setActiveLink("Dashboard");
      }
    }
  }, []);

  return (
    <nav className={styles.navbar}>
      <img alt="wc-careers" src="/icons/wc-careers.svg" onClick={handleClick} />

      <div
        className={`webView ${styles.linkContainer} ${
          user == null ? "" : styles.login
        }`}
      >
        {user == null ? (
          <>
            <a
              onClick={() => {
                checkChanges("/whitecloak/job-openings");
              }}
            >
              Find Jobs
            </a>
            <a href="https://www.whitecloak.com" target="_blank">
              Why White Cloak
            </a>
            <button onClick={handleSignIn}>Sign in</button>
          </>
        ) : (
          <>
            {/* <img
              alt="bell"
              src="/icons/bell.svg"
              onClick={handleNotification}
            /> */}
            {pathname.includes("upload-cv") && (
              <a
                className="webView"
                onClick={() => {
                  checkChanges("/whitecloak/applicant");
                }}
              >
                Dashboard
              </a>
            )}
            <img
              alt="user"
              className={`${styles.user} webView`}
              src={user.image}
              onClick={handleUserIcon}
            />
          </>
        )}
      </div>

      <img
        alt="dropdown"
        className={`mobileView ${styles.user}`}
        src={`${
          viewDropdown
            ? "/icons/x.svg"
            : user != null
            ? user.image
            : "/icons/menu.svg"
        }`}
        onClick={toggleDropdown}
      />

      {viewDropdown && (
        <div
          className={`mobileView ${styles.dropdownContainer} ${
            user == null ? "" : styles.login
          }`}
        >
          {user == null ? (
            <>
              <a
                onClick={() => {
                  checkChanges("/whitecloak/job-openings");
                }}
              >
                Find Jobs
              </a>
              <a href="https://www.whitecloak.com" target="_blank">
                Why White Cloak
              </a>
              <hr />
              <button onClick={handleSignIn}>Sign in</button>
            </>
          ) : (
            <>
              {links.map((link, index) => (
                <Fragment key={index}>
                  <span
                    className={
                      activeLink === link.text
                        ? styles.active
                        : pathname.includes("/whitecloak/job-openings/") &&
                          link.text == "Job Openings"
                        ? styles.active
                        : ""
                    }
                    onClick={() => link.function(link.text)}
                  >
                    <img alt={link.icon} src={`/icons/${link.icon}.svg`} />
                    {link.text}
                  </span>
                </Fragment>
              ))}
              <hr />
              <button onClick={handleLogout}>Log out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
