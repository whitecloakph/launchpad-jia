// TODO (Vince) - Replace alert and windows.confirm
// TODO (Vince) - Merge API

"use client";

import styles from "@/lib/styles/screen/manageCV.module.scss";
import Markdown from "react-markdown";
import { contextProvider } from "@/lib/context/Context";
import { CORE_API_URL } from "@/lib/Utils";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function () {
  const fileInputRef = useRef(null);
  const { user, setModalType } = contextProvider();
  const [buildingCV, setBuildingCV] = useState(false);
  const [digitalCV, setDigitalCV] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [file, setFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [userCV, setUserCV] = useState(null);
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

  function checkFile(file) {
    if (file.length > 1) {
      alert("Only one file is allowed.");
      return false;
    }

    if (file[0].size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return false;
    }

    if (
      ![
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ].includes(file[0].type)
    ) {
      alert("Only PDF, DOC, DOCX, or TXT files are allowed.");
      return false;
    }

    return file[0];
  }

  function formatFileSize(size) {
    return (size / 1024 / 1024).toFixed(2);
  }

  function handleClick() {
    fileInputRef.current.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files);
  }

  function handleEditChange() {
    setEditingCV(null);
  }

  function handleEditCV(section) {
    setEditingCV(section);

    setTimeout(() => {
      const sectionDetails = document.getElementById(section);
      sectionDetails.focus();
    }, 100);
  }

  function handleFile(files) {
    const file = checkFile(files);

    if (file) {
      setDigitalCV(null);
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
    setLoading(true);
    setRefresh(true);
  }

  function handleRemoveFile(e) {
    e.stopPropagation();
    e.target.value = "";

    setDigitalCV(null);
    setFile(null);
    setUserCV(null);
  }

  useEffect(() => {
    const storedCV = localStorage.getItem("userCV");

    if (storedCV && storedCV != "null") {
      const parsedUserCV = JSON.parse(storedCV);
      const formattedCV = {};

      cvSections.map((section, index) => {
        formattedCV[section] = parsedUserCV.digitalCV[index].content?.trim();
      });

      setFile(parsedUserCV.fileInfo);
      setDigitalCV(storedCV);
      setUserCV(formattedCV);
    } else {
      setFile(null);
      setDigitalCV(null);
      setUserCV(null);
    }

    setLoading(false);
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    if (loading) {
      setModalType("loading");
    } else {
      setModalType(null);
    }
  }, [loading]);

  useEffect(() => {
    sessionStorage.setItem("hasChanges", JSON.stringify(hasChanges));
  }, [hasChanges]);

  async function handleSaveChanges(skip, userCV) {
    if (!hasChanges && !skip) {
      alert("No changes to save.");
      return false;
    }

    if (editingCV != null && !skip) {
      alert("Please save the changes first.");
      return false;
    }

    const allEmpty = Object.values(userCV).every(
      (value: any) => value?.trim() === ""
    );

    if (allEmpty) {
      alert("No details to be save.");
      return false;
    }

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

    if (!skip) {
      setLoading(true);
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

    await axios({
      method: "POST",
      url: `/api/whitecloak/save-cv`,
      data,
    })
      .then(() => {
        setModalType("cvUploaded");
        setHasChanges(false);
        localStorage.setItem("userCV", JSON.stringify(parsedDigitalCV));
      })
      .catch((err) => {
        alert("Error saving CV. Please try again.");
        setLoading(false);
        console.log(err);
      })
      .finally(() => {
        setBuildingCV(false);
      });
  }

  async function handleSubmit() {
    setBuildingCV(true);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fName", file.name);
    formData.append("userEmail", user.email);

    await axios({
      method: "POST",
      url: `${CORE_API_URL}/upload-cv`,
      data: formData,
    })
      .then(async (res) => {
        await axios({
          method: "POST",
          url: `/api/whitecloak/digitalize-cv`,
          data: { chunks: res.data.cvChunks },
        })
          .then(async (res) => {
            const result = await res.data.result;
            const parsedUserCV = JSON.parse(result);
            const formattedCV = {};

            cvSections.map((section, index) => {
              formattedCV[section] =
                parsedUserCV.digitalCV[index].content?.trim();
            });

            setDigitalCV(result);
            setHasChanges(true);
            setUserCV(formattedCV);

            const storedCV = localStorage.getItem("userCV");

            if (!storedCV || storedCV == "null") {
              await handleSaveChanges(true, formattedCV);
            } else {
              setBuildingCV(false);
              setLoading(false);
            }
          })
          .catch((err) => {
            alert("Error building CV. Please try again.");
            setBuildingCV(false);
            setLoading(false);
            console.log(err);
          });
      })
      .catch((err) => {
        alert("Error building CV. Please try again.");
        setBuildingCV(false);
        setLoading(false);
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
        <div className={styles.cvUpload}>
          <span className={styles.uploadTitle}>
            <img alt="upload" src="/icons/upload.svg" />
            Upload CV
            <img
              className={styles.refresh}
              alt="rotate-ccw"
              src="/icons/rotate-ccw.svg"
              onClick={handleRefresh}
            />
          </span>
          <span className={styles.uploadDetails}>
            Upload your CV and let our AI automatically fill in your profile
            information.
          </span>
          <div
            className={`${styles.fileUpload} ${file ? styles.uploaded : ""}`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {file ? (
              <div className={styles.uploadedFile}>
                <img alt="file-text" src="/icons/file-textV2.svg" />
                <span>{file.name}</span>({formatFileSize(file.size)} MB)
                <img
                  alt="x"
                  className={styles.xIcon}
                  onClick={handleRemoveFile}
                  src="/icons/xV2.svg"
                />
              </div>
            ) : (
              <>
                <img alt="file-text" src="/icons/file-text.svg" />
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

          {buildingCV && (
            <span className={styles.cvUploaded}>Building CV...</span>
          )}

          {!buildingCV && !file && !userCV && (
            <span className={styles.cvUploaded}>Submit</span>
          )}

          {!buildingCV && !digitalCV && file && !userCV && (
            <button onClick={handleSubmit}>Submit</button>
          )}

          {!buildingCV && userCV && (
            <>
              {file && (
                <span className={styles.cvUploaded}>
                  <img alt="check" src="/icons/checkV3.svg" />
                  CV Uploaded
                </span>
              )}

              <button
                onClick={() => {
                  handleSaveChanges(false, userCV);
                }}
              >
                Save Changes
              </button>
            </>
          )}
        </div>

        <div className={styles.cvDetailsContainer}>
          {cvSections.map((section, index) => (
            <div className={styles.cvDetailsCard} key={index}>
              <span
                className={`${styles.sectionTitle} ${
                  editingCV == section ? styles.forEditing : ""
                }`}
              >
                {section}

                {editingCV == section ? (
                  <button onClick={handleEditChange}>Save Changes</button>
                ) : (
                  <img
                    alt="square-pen"
                    src="/icons/square-pen.svg"
                    onClick={() => handleEditCV(section)}
                  />
                )}
              </span>

              <hr />

              {editingCV == section ? (
                <>
                  <textarea
                    id={section}
                    value={userCV ? userCV[section] : ""}
                    placeholder="Upload your CV to auto-fill this section."
                    onBlur={(e) => {
                      e.target.placeholder =
                        "Upload your CV to auto-fill this section.";
                    }}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).placeholder = "";
                    }}
                    onChange={(e) => {
                      setUserCV({
                        ...userCV,
                        [section]: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                  />
                </>
              ) : (
                <span
                  className={`${styles.sectionDetails} ${
                    userCV && userCV[section]?.trim() ? styles.withDetails : ""
                  }`}
                >
                  <Markdown>
                    {userCV && userCV[section]?.trim()
                      ? userCV[section]?.trim()
                      : "Upload your CV to auto-fill this section."}
                  </Markdown>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
