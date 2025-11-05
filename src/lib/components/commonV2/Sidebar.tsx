// TODO (Job Portal) - Check API

"use client";

import styles from "@/lib/styles/commonV2/sidebar.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [actveLink, setActiveLink] = useState(null);
  const { user, setModalType } = useAppContext();
  const links = [
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
      href: `${pathConstants.dashboard}/#`,
      image: assetConstants.settings,
      name: "Settings",
    },
    {
      href: pathConstants.home,
      image: assetConstants.logout,
      name: "Logout",
    },
  ];

  function handleRedirection(path) {
    if (path == pathname) {
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
            router.push(path);
          }
        }
      });
    } else {
      if (path == pathConstants.home) {
        setModalType("logout");
      } else {
        router.push(path);
      }
    }
  }

  useEffect(() => {
    if (user == null) {
      alert("Please sign in to continue.");
      handleRedirection(
        `${
          window.location.origin.includes("localhost")
            ? "/job-portal"
            : pathConstants.employee
        }`
      );
    } else {
      links.forEach((link) => {
        if (link.href == pathname) {
          setActiveLink(link.name);
        }
      });

      fetchUserCV();
    }
  }, [pathname, searchParams]);

  function fetchUserCV() {
    axios({
      method: "POST",
      url: "/api/whitecloak/fetch-cv",
      data: {
        email: user.email,
      },
    })
      .then((res) => {
        const result = res.data;
        const manageCV = sessionStorage.getItem("manageCV");

        if (
          !result &&
          manageCV != "true" &&
          pathname != pathConstants.uploadCV
        ) {
          setModalType("manageCV");
        }

        localStorage.setItem("userCV", JSON.stringify(result));
      })
      .catch((err) => {
        alert("Error fetching CV. Please try again.");
        console.log(err);
      });
  }

  if (user == null) return null;

  if (pathname == pathConstants.uploadCV) {
    return children;
  }

  return (
    <>
      <aside className={`webView ${styles.sidebarContainer}`}>
        <span className={styles.groupName}>General</span>
        {links.slice(0, 3).map((link, index) => (
          <span
            key={index}
            className={`${styles.link} ${
              actveLink == link.name ? styles.active : ""
            }`}
            onClick={() => handleRedirection(link.href)}
          >
            <img alt={link.image.split(".")[0]} src={link.image} />
            <span>{link.name}</span>
          </span>
        ))}

        <hr />

        <span className={styles.groupName}>Others</span>
        {links.slice(4, 5).map((link, index) => (
          <span
            key={index}
            className={styles.link}
            onClick={() => handleRedirection(link.href)}
          >
            <img alt={link.image.split(".")[0]} src={link.image} />
            <span>{link.name}</span>
          </span>
        ))}

        <div className={styles.footerContainer}>
          © 2025
          <span>White Cloak Technologies, Inc.</span>
        </div>
      </aside>

      <section>{children}</section>
    </>
  );
}
