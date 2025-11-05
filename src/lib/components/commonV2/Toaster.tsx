"use client";

import styles from "@/lib/styles/commonV2/toaster.module.scss";
import { assetConstants } from "@/lib/utils/constantsV2";
import { useEffect } from "react";

export default function ({ toasterType, setToasterType }) {
  const toasterList = ["share", "cancel", "reminder", "manageCV"];

  function handleClose() {
    setToasterType(null);
  }

  useEffect(() => {
    if (toasterType == toasterList[3]) {
      setTimeout(() => {
        handleClose();
      }, 5000);
    }
  }, []);

  return (
    <div className={`${styles.toasterContainer} ${styles[toasterType]}`}>
      {toasterType == toasterList[0] && (
        <>
          <img alt="" className={styles.logo} src={assetConstants.checkV2} />
          <div className={styles.textContainer}>
            <span className={styles.header}>Link copied to clipboard</span>
          </div>
          <img
            alt="x"
            className={styles.xIcon}
            src={assetConstants.x}
            onClick={handleClose}
          />
        </>
      )}

      {/* {toasterType == toasterList[1] && (
        <>
          <img
            alt="x"
            className={styles.xIcon}
            src={assetConstants.x}
            onClick={handleClose}
          />
          <img alt="logo" className={styles.logo} src={assetConstants.trash} />
          <div className={styles.textContainer}>
            <span className={styles.header}>Application Cancelled</span>
            <span className={styles.description}>
              Your application for{" "}
              <span className={styles.bold}>Software Engineer - Java</span> has
              been cancelled. If your plans change, we’d be glad to see you
              apply again in the future.
            </span>
          </div>
        </>
      )} */}

      {/* {toasterType == toasterList[2] && (
        <>
          <img
            alt="x"
            className={styles.xIcon}
            src={assetConstants.x}
            onClick={handleClose}
          />
          <img alt="logo" className={styles.logo} src={assetConstants.bellV2} />
          <div className={styles.textContainer}>
            <span className={styles.header}>Reminder set</span>
            <span className={styles.description}>
              We’ll notify you when you’re eligible to reapply for this role.
            </span>
          </div>
        </>
      )} */}

      {toasterType == toasterList[3] && (
        <>
          <img alt="" className={styles.logo} src={assetConstants.checkV2} />
          <div className={styles.textContainer}>
            <span className={styles.header}>CV updated successfully</span>
          </div>
        </>
      )}
    </div>
  );
}
