"use client";

import styles from "@/lib/styles/screens/home.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function () {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { user } = useAppContext();
  const jobSearchPath = `${
    window.innerWidth < 768 && user != null
      ? pathConstants.dashboardJobOpenings
      : pathConstants.jobOpenings
  }${search && search.trim() ? `?search=${search.trim()}` : ""}`;

  function handleRedirection(path) {
    window.location.href = path;
  }

  useEffect(() => {
    if (
      window.location.origin.includes("hellojia.ai") &&
      pathname.includes("/job-portal")
    ) {
      router.push("/");
    }
  }, []);

  return (
    <div className={styles.background}>
      <img
        alt=""
        className={`webView ${styles.background}`}
        src={assetConstants.background}
      />
      <img
        alt=""
        className={`webView ${styles.sphereLeft}`}
        src={assetConstants.sphereLeft}
      />
      <img
        alt=""
        className={`webView ${styles.sphereRight}`}
        src={assetConstants.sphereRight}
      />
      <div className={styles.homeContainer}>
        <div className={styles.topContainer}>
          <div className={styles.textContainer}>
            <span className={styles.title}>
              Job search made easy with cutting-edge AI.
            </span>
            <span className={styles.description}>
              Jia is modernizing the way companies hire, so you can experience a{" "}
              <span className={styles.bold}>better, faster,</span> and{" "}
              <span className={styles.bold}>more transparent</span> application
              process.
            </span>
          </div>

          <img
            alt=""
            className={`webView ${styles.owl}`}
            src={assetConstants.owl}
          />
          <img
            alt=""
            className={`mobileView ${styles.owl}`}
            src={assetConstants.owlMobile}
          />
          <img
            alt=""
            className={`mobileView ${styles.sphereMobile}`}
            src={assetConstants.sphereMobile}
          />
        </div>

        <div className={styles.bottomContainer}>
          <div className={styles.gradientContainer}>
            <div className={styles.inputContainer}>
              <img
                alt=""
                className={styles.search}
                src={assetConstants.search}
              />
              <input
                name="job-search"
                placeholder="Job title or keyword"
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).placeholder =
                    "Job title or keyword")
                }
                onChange={(e) => setSearch(e.target.value)}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).placeholder = "")
                }
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    handleRedirection(jobSearchPath);
                  }
                }}
              />
              <button onClick={() => handleRedirection(jobSearchPath)}>
                Search Jobs
                <img alt="" src={assetConstants.arrowV2} />
              </button>
            </div>
          </div>
          <span>
            Or{" "}
            <span
              className={styles.redirection}
              onClick={() => handleRedirection(pathConstants.jobOpenings)}
            >
              browse all openings {">"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
