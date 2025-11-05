// TODO (Job Portal) - Check API

"use client";

import styles from "@/lib/styles/screens/manageCV.module.scss";
import { assetConstants } from "@/lib/utils/constantsV2";
import { checkFile, formatFileSize } from "@/lib/utils/helpersV2";
import { useAppContext } from "@/lib/context/ContextV2";
import { CORE_API_URL } from "@/lib/Utils";
import axios from "axios";
import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";

export default function () {
  const fileInputRef = useRef(null);
  const [buildingCV, setBuildingCV] = useState(false);
  const [digitalCV, setDigitalCV] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [file, setFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [userCV, setUserCV] = useState(null);
  const { user, setModalType, setToasterType } = useAppContext();
  const cvSections = [
    "Introduction",
    "Current Position",
    "Contact Info",
    "Skills",
    "Experience",
    "Education",
    "Projects",
    "Certifications",
    "Awards",
  ];

  function handleClick() {
    if (buildingCV) {
      alert("You can't upload a new file while JIA is building your profile.");
    } else {
      fileInputRef.current.click();
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();

    if (buildingCV) {
      alert("You can't upload a new file while JIA is building your profile.");
    } else {
      handleFile(e.dataTransfer.files);
    }
  }

  function handleEditCV(section) {
    if (file && !userCV) {
      alert(
        "Please upload and submit your file to build your CV before editing."
      );
    } else {
      setEditingCV(section);

      if (section != null) {
        setTimeout(() => {
          const sectionDetails = document.getElementById(section);

          if (sectionDetails) {
            sectionDetails.focus();
          }
        }, 100);
      }
    }
  }

  function handleFile(files) {
    const file = checkFile(files);

    if (file) {
      setDigitalCV(null);
      setEditingCV(null);
      setFile(file);
      setUserCV(null);
    }
  }

  function handleFileChange(e) {
    const files = e.target.files;

    if (files.length > 0) {
      handleFile(files);
    }
  }

  function handleRefresh() {
    if (buildingCV) {
      alert("CV building is in progress. Please wait for it to complete.");
    } else {
      setEditingCV(null);
      setHasChanges(false);
      setLoading(true);
      setRefresh(true);
    }
  }

  function handleRemoveFile(e) {
    e.stopPropagation();
    e.target.value = "";

    if (buildingCV) {
      alert("You can't remove your file while JIA is building your profile.");
    } else {
      setDigitalCV(null);
      setEditingCV(null);
      setFile(null);
      setUserCV(null);
    }
  }

  useEffect(() => {
    const storedCV = localStorage.getItem("userCV");

    if (storedCV && storedCV != "null") {
      const parsedUserCV = JSON.parse(storedCV);
      const formattedCV = {};

      cvSections.forEach((section, index) => {
        formattedCV[section] =
          parsedUserCV.digitalCV[index].content.trim() || "";
      });

      setDigitalCV(storedCV);
      setFile(parsedUserCV.fileInfo);
      setUserCV(formattedCV);
    } else {
      setDigitalCV(null);
      setFile(null);
      setUserCV(null);
    }

    setLoading(false);
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    sessionStorage.setItem("hasChanges", JSON.stringify(hasChanges));
  }, [hasChanges]);

  function handleSaveChanges(skip, userCV) {
    if (editingCV != null && !skip) {
      alert("Please save the changes first.");
      return false;
    }

    const allEmpty = Object.values(userCV).every(
      (value: any) => value.trim() == ""
    );

    if (allEmpty) {
      alert("No details to be save.");
      return false;
    }

    setModalType("loading");

    let parsedDigitalCV = {
      errorRemarks: null,
      digitalCV: null,
    };

    if (digitalCV) {
      parsedDigitalCV = JSON.parse(digitalCV);

      if (parsedDigitalCV.errorRemarks) {
        alert(
          "Please fix the errors in the CV first.\n\n" +
            parsedDigitalCV.errorRemarks
        );
        return false;
      }
    }

    const formattedUserCV = cvSections.map((section) => ({
      name: section,
      content: userCV[section]?.trim() || "",
    }));

    parsedDigitalCV.digitalCV = formattedUserCV;

    const data = {
      name: user.name,
      cvData: parsedDigitalCV,
      email: user.email,
      fileInfo: null,
    };

    if (file) {
      data.fileInfo = { name: file.name, size: file.size, type: file.type };
    }

    axios({
      method: "POST",
      url: `/api/whitecloak/save-cv`,
      data,
    })
      .then(() => {
        setHasChanges(false);
        setToasterType("manageCV");
        localStorage.setItem(
          "userCV",
          JSON.stringify({ ...data, ...data.cvData })
        );
      })
      .catch((err) => {
        alert("Error saving CV. Please try again.");
        console.log(err);
      })
      .finally(() => {
        setBuildingCV(false);
        setModalType(null);
      });
  }

  function handleSubmit() {
    setBuildingCV(true);
    setHasChanges(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fName", file.name);
    formData.append("userEmail", user.email);

    axios({
      method: "POST",
      url: `${CORE_API_URL}/upload-cv`,
      data: formData,
    })
      .then((res) => {
        axios({
          method: "POST",
          url: `/api/whitecloak/digitalize-cv`,
          data: { chunks: res.data.cvChunks },
        })
          .then((res) => {
            const result = res.data.result;
            const parsedUserCV = JSON.parse(result);
            const formattedCV = {};

            cvSections.forEach((section, index) => {
              formattedCV[section] =
                parsedUserCV.digitalCV[index].content.trim();
            });

            setDigitalCV(result);
            setUserCV(formattedCV);

            const storedCV = localStorage.getItem("userCV");

            if (!storedCV || storedCV == "null") {
              handleSaveChanges(true, formattedCV);
            } else {
              setBuildingCV(false);
            }
          })
          .catch((err) => {
            alert("Error building CV. Please try again.");
            setBuildingCV(false);
            console.log(err);
          });
      })
      .catch((err) => {
        alert("Error building CV. Please try again.");
        setBuildingCV(false);
        console.log(err);
      });
  }

  return (
    <div className={styles.manageCV}>
      <div className={styles.textContainer}>
        <span className={styles.name}>Manage CV</span>
        <span className={styles.description}>
          Apply to more jobs in less time by managing your CV here.
        </span>
      </div>

      <div className={styles.cvContainer}>
        <div className={`${styles.gradient} ${styles.maxWidth}`}>
          <div className={styles.cvDetailsCard}>
            <span className={styles.uploadTitle}>
              <div className={styles.uploadIcon}>
                <img alt="" src={assetConstants.upload} />
              </div>
              Upload CV
              <img
                alt=""
                className={styles.refreshIcon}
                src={assetConstants.rotate}
                onClick={handleRefresh}
                onContextMenu={(e) => e.preventDefault()}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
              />
              {isHover && (
                <div className={styles.hoverContainer}>
                  <span>Revert your CV to the previous saved version.</span>
                </div>
              )}
            </span>
            <div className={styles.uploadDetailsContainer}>
              {!loading && (
                <>
                  <div
                    className={`${styles.fileUpload} ${
                      file ? styles.uploaded : ""
                    }`}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className={styles.uploadedFile}>
                        <img alt="" src={assetConstants.fileV2} />
                        <span>{file.name}</span>({formatFileSize(file.size)} MB)
                        <img
                          alt=""
                          className={styles.xIcon}
                          onClick={handleRemoveFile}
                          onContextMenu={(e) => e.preventDefault()}
                          src={assetConstants.xV2}
                        />
                      </div>
                    ) : (
                      <>
                        <img alt="" src={assetConstants.fileV2} />
                        <span className={styles.uploadFileText}>
                          <span>Click to upload</span> or drag and drop
                        </span>
                        <span className={styles.uploadFileRules}>
                          PDF, DOC, DOCX, or TXT (max 10MB)
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </>
              )}

              {(buildingCV || loading) && (
                <div className={styles.loadingContainer}>
                  <img alt="" src={assetConstants.loading} />
                  {buildingCV && (
                    <>
                      <span className={styles.cvExtract}>
                        Extracting information from your CV...
                      </span>
                      <span className={styles.building}>
                        Jia is building your profile...
                      </span>
                    </>
                  )}
                </div>
              )}

              {!buildingCV && !userCV && !loading && (
                <>
                  <span className={styles.uploadDetails}>
                    Upload your CV and let our AI automatically fill in your
                    profile information.
                  </span>
                  <button
                    className={file ? "" : "disabled"}
                    disabled={!file}
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </>
              )}

              {!buildingCV && userCV && !loading && (
                <>
                  {file && (
                    <span className={styles.cvUploaded}>
                      <img alt="" src={assetConstants.check} />
                      CV Uploaded
                    </span>
                  )}

                  <button
                    className={hasChanges ? "" : "disabled"}
                    disabled={!hasChanges}
                    onClick={() => handleSaveChanges(false, userCV)}
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.cvDetailsContainer}>
          {cvSections.map((section, index) => (
            <div key={index} className={styles.gradient}>
              <div className={styles.cvDetailsCard}>
                <span className={styles.sectionTitle}>
                  {section}

                  <div className={styles.editIcon}>
                    <img
                      alt=""
                      src={
                        editingCV == section
                          ? assetConstants.save
                          : assetConstants.edit
                      }
                      onClick={() =>
                        handleEditCV(editingCV == section ? null : section)
                      }
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </span>

                <div className={styles.detailsContainer}>
                  {editingCV == section ? (
                    <textarea
                      id={section}
                      placeholder="Upload your CV to auto-fill this section."
                      value={userCV && userCV[section] ? userCV[section] : ""}
                      onBlur={(e) =>
                        (e.target.placeholder =
                          "Upload your CV to auto-fill this section.")
                      }
                      onChange={(e) => {
                        setUserCV({
                          ...userCV,
                          [section]: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      onClick={(e) =>
                        ((e.target as HTMLInputElement).placeholder = "")
                      }
                      onFocus={(e) => (e.target.placeholder = "")}
                    />
                  ) : (
                    <span
                      className={`${styles.sectionDetails} ${
                        userCV && userCV[section] && userCV[section].trim()
                          ? styles.withDetails
                          : ""
                      }`}
                    >
                      {buildingCV || loading ? (
                        <>
                          <div className={styles.loading} />
                          <div className={styles.loading} />
                        </>
                      ) : (
                        <Markdown>
                          {userCV && userCV[section] && userCV[section].trim()
                            ? userCV[section].trim()
                            : "Upload your CV to auto-fill this section."}
                        </Markdown>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
