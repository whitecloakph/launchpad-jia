"use client";

import CardTypingLoader from "@/lib/components/AnalysisComponents/CardTypingLoader";
import CVSectionItem from "@/lib/components/ApplicantComponents/CVSectionItem";
import { useAppContext } from "@/lib/context/AppContext";
import {
  CORE_API_URL,
  errorToast,
  loadingToast,
  successToast,
} from "@/lib/Utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const defaultCVData = {
  errorRemarks: null,
  digitalCV: [
    {
      name: "Introduction",
      content: "",
    },
    {
      name: "Current Position",
      content: "",
    },
    {
      name: "Contact Info",
      content: "",
    },
    {
      name: "Skills",
      content: "",
    },
    {
      name: "Experience",
      content: "",
    },
    {
      name: "Education",
      content: "",
    },
    {
      name: "Projects",
      content: "",
    },
    {
      name: "Certifications",
      content: "",
    },
    {
      name: "Awards",
      content: "",
    },
  ],
};

export default function page() {
  const [file, setFile] = useState(null);

  const [processState, setProcessState] = useState("");
  const [cvData, setCvData] = useState(defaultCVData);

  const { user } = useAppContext();

  function startUpload() {
    document.getElementById("file-cv").click();
  }

  function renderSelectedFile() {
    let inputFile: any = document.getElementById("file-cv");

    let fx = inputFile.files[0];

    if (!fx) {
      return;
    }

    // Check file extension
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = fx.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      errorToast("Please upload a PDF, DOC, or DOCX file only!", "top-center");
      return false;
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (fx.size > maxSize) {
      errorToast("File size must be less than 5MB!", "top-center");
      return false;
    }

    console.log(fx);
    setFile(fx);
  }

  async function digitlizeCV(cvChunks: any) {
    setCvData(null);
    setProcessState("processing");

    let corePrompt = `
    You are a helpful assistant that will extract the following data from the CV:

    CV chunks:
    ${cvChunks.map((chunk: any) => chunk.pageContent).join("\n")}

    Extract the following data from the CV:
    - Name
    - Email
    - Phone
    - Address
    - LinkedIn
    - GitHub
    - Twitter

    JSON template: 
    {
    errorRemarks: <error remarks>,
    digitalCV:[
     {name: "Introduction", content: <Introduction content makrdown format>},
     {name: "Current Position", content: <Current Position content makrdown format>},
     {name: "Contact Info", content: <Contact Info content makrdown format>},
     {name: "Skills", content: <Skills content makrdown format>},
     {name: "Experience", content: <Experience content makrdown format>},
     {name: "Education", content: <Education content makrdown format>},
     {name: "Projects", content: <Projects content makrdown format>},
     {name: "Certifications", content: <Certifications content makrdown format>},
     {name: "Awards", content: <Awards content makrdown format>},
    ]
    }

    Processing Instructions:
    - follow the JSON template strictly
    - for contact info content make sure links are formatted as markdown links,
    - give detailed info in the content field.
    - in Awards content field give details of each award.
    - make sure the markdown format is correct, all section headlines are in bold. all paragraphs are in normal text, all lists are in bullet points, etc.
    - make sure all markdown lead text are equivalent to h2 tags in html,
    - for the Error Remarks, give a message if the cvChunks does seem to be a curriculum vitae, otherwise set it to null,
    - Do not include any other text or comments in the JSON output.
    - Only return the JSON output.
    `;

    try {
      let codeOutput = await axios
        .post(`/api/llm-reasoner`, {
          corePrompt: corePrompt,
        })
        .then((res) => {
          return res.data.result;
        });

      let parsedOutput = JSON.parse(
        codeOutput.replace("```json", "").replace("```", "")
      );
      console.log(parsedOutput);
      setCvData(parsedOutput);

      setTimeout(async () => {
        await saveCV();
        setProcessState("done");
      }, 300);
    } catch (err) {
      console.log(err);
      errorToast("Failed to generate analysis, please try again later", 1300);
    }
  }

  function uploadCV() {
    let inputFile: any = document.getElementById("file-cv");

    let fx = inputFile.files[0];
    let formData = new FormData();
    let userData = user;

    formData.append("file", fx);
    formData.append("fName", file.name);
    formData.append("userEmail", userData.email);

    Swal.fire({
      icon: "info",
      title: "Uploading CV...",
      text: "Please wait while we upload CV...",
      allowOutsideClick: false,
      showConfirmButton: false,
      showCancelButton: false,
    });

    Swal.showLoading();

    axios
      .post(`${CORE_API_URL}/upload-cv`, formData)
      .then(async (res) => {
        console.log(res.data);

        if (res.data.error) {
          Swal.fire({
            icon: "error",
            title: "Failed to upload CV.",
            text: res.data.error,
          });

          return;
        }

        successToast("Sucessfully Uploaded CV.", "top-center");

        digitlizeCV(res.data.cvChunks);

        Swal.close();
      })
      .catch((err) => {
        console.log(err);
        errorToast("Failed to upload CV.", "top-center");
        Swal.close();
      });
  }

  async function fetchCV(email: string) {
    axios
      .post(`/api/load-user-cv`, { email: email })
      .then(async (res) => {
        if (!res.data) {
          setCvData(defaultCVData);
          toast.dismiss();

          Swal.fire({
            icon: "info",
            title: "Set up your CV",
            text: "set up your CV by uploading a PDF, DOC, or DOCX file of your CV / Resume. Or filling up each section manually. by clicking the edit button on the upper right.",
          });

          return false;
        }

        setCvData(res.data);

        toast.dismiss();
      })
      .catch((err) => {
        console.log(err);
        Swal.close();
      });
  }

  useEffect(() => {
    loadingToast("Loading CV...");

    if (user) {
      fetchCV(user.email);
    }

    // Add event listener for LinkedIn data updates
    const handleLinkedInUpdate = (event: CustomEvent) => {
      setCvData(event.detail);
    };

    // Add event listener for processing CV chunks
    const handleProcessCVChunks = (event: CustomEvent) => {
      digitlizeCV(event.detail);
    };

    window.addEventListener(
      "updateCVData",
      handleLinkedInUpdate as EventListener
    );
    window.addEventListener(
      "processCVChunks",
      handleProcessCVChunks as EventListener
    );

    return () => {
      window.removeEventListener(
        "updateCVData",
        handleLinkedInUpdate as EventListener
      );
      window.removeEventListener(
        "processCVChunks",
        handleProcessCVChunks as EventListener
      );
    };
  }, [user]);

  async function saveCV() {
    if (cvData?.errorRemarks) {
      errorToast("Errors must be resolved before saving.", "top-center");
      return false;
    }

    let editingStates: any = document.querySelectorAll(".editing-now");

    if (editingStates.length > 0) {
      errorToast("Please save all sections before saving.", "top-center");
      return false;
    }

    let sectionContents: any = document.querySelectorAll(
      ".markdown-cv-content"
    );
    let sectionNames: any = document.querySelectorAll(".cv-section-name");

    let digitalContent = [];

    sectionNames.forEach((item: any, index: number) => {
      let name = item.parentElement.querySelector(".cv-section-name").innerText;
      let content = sectionContents[index].value;

      digitalContent.push({ name, content });
    });

    let formattedCvData = {
      email: user.email,
      name: user.name,
      updatedAt: Date.now(),
      errorRemarks: null,
      digitalCV: digitalContent,
    };

    console.log(formattedCvData);

    // Swal.fire({
    //   icon: "info",
    //   title: "Saving Changes...",
    //   text: "Please wait while we save your CV...",
    //   allowOutsideClick: false,
    //   showConfirmButton: false,
    // });

    // Swal.showLoading();

    loadingToast("Saving Changes, Please wait...");

    await axios
      .post(`/api/save-cv`, { cvData: formattedCvData })
      .then((res) => {
        console.log(res.data);

        successToast("Changes saved successfully", "top-center");
        localStorage.isCVAvailable = true;

        toast.dismiss();
      })
      .catch((err) => {
        console.log(err);
        toast.dismiss();
        errorToast("Failed to save changes.", "top-center");
      });
  }

  return (
    <>
      <div className="container-fluid mt--6">
        <div className="thread-set">
          <div className="left-thread">
            {processState === "processing" && (
              <>
                <div className="card shadow-1">
                  <div className="card-header">
                    <h3 className="mb-0 mr-auto">
                      <i className="la la-edit text-primary mr-2" /> Processing
                      CV...
                    </h3>
                  </div>

                  <div className="card-body">
                    <CardTypingLoader
                      title="Processing CV..."
                      notesArray={[
                        "Loading: Extracting CV Data...",
                        400,
                        "Loading: Extracting Skills...",
                        400,
                        "Loading: Extracting Experience...",
                        400,
                        "Loading: Extracting Education...",
                        400,
                        "Loading: Extracting Projects...",
                        400,
                        "Working: Extracting Certifications...",
                        400,
                        "Working: Extracting Awards...",
                        400,
                      ]}
                    />
                  </div>
                </div>
              </>
            )}

            {cvData && cvData.errorRemarks && (
              <div className="card shadow-1">
                <div className="card-header">
                  <h3 className="mb-0 mr-auto">
                    <i className="la la-square text-red mr-2" /> Upload Error
                    Remarks
                  </h3>
                </div>

                <div className="card-body">
                  <p>
                    {cvData.errorRemarks} Please upload proper CV / Resume file
                    in PDF or Docs Format.
                  </p>
                </div>
              </div>
            )}

            {cvData && (
              <>
                {cvData.digitalCV.map((section: any) => {
                  return (
                    <CVSectionItem
                      key={section.name}
                      data={section}
                      editable={true}
                      saveCV={saveCV}
                    />
                  );
                })}
              </>
            )}
          </div>
          <div className="right-thread">
            <div className="top-card">
              <div className="card shadow-1 ">
                <div className="card-header">
                  <h3 className="mb-0 mr-auto">
                    <i className="la la-edit text-primary mr-2" /> Manage
                    Curriculum Vitae
                  </h3>

                  <i className="la la-bars text-primary mr-2" />
                </div>

                <div className="card-body">
                  <div className="notice">
                    <span>
                      <i className="la la-info-circle"></i> Managing your CV
                      helps you apply to Jobs in JIA faster. You only have to
                      manage it one place.
                    </span>
                  </div>

                  <div className="section-header">
                    <strong>
                      <i className="la la-file text-primary" /> Upload CV & Auto
                      Fill
                    </strong>

                    <i className="la la-braille" />
                  </div>

                  {file && (
                    <div
                      className="file-render fade-in"
                      onClick={() => {
                        startUpload();
                      }}
                    >
                      <i className="la la-file-text la-3x" />

                      <div className="file-info">
                        <span>{file.name}</span>
                        <small>
                          <i className="la la-square" /> Selected CV - Click to
                          Replace
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="notice fade-in">
                    <span>
                      <i className="la la-info-circle text-primary"></i> Upload
                      a file to prefill your Curiculum Vitae.
                    </span>
                  </div>

                  <input
                    type="file"
                    id="file-cv"
                    className="d-none"
                    accept=".pdf, .doc, .docx"
                    onChange={renderSelectedFile}
                  />

                  {!file && (
                    <button className="btn btn-default" onClick={startUpload}>
                      <span>
                        <i className="la la-upload text-info"></i> Select File
                      </span>
                    </button>
                  )}

                  {file && processState !== "processing" && (
                    <button className="btn btn-primary" onClick={uploadCV}>
                      <span>
                        <i className="la la-upload text-info"></i> Upload File
                      </span>
                    </button>
                  )}
                  {/* <Linkedin /> */}
                  {cvData && !cvData.errorRemarks && (
                    <>
                      <div className="section-header">
                        <strong>
                          <i className="la la-square text-primary" /> Save
                          Changes
                        </strong>

                        <i className="la la-braille" />
                      </div>

                      <div className="notice fade-in">
                        <span>
                          <i className="la la-info-circle text-primary"></i>{" "}
                          Mare sure you reviewed and apply your changes before
                          apply to a job.
                        </span>
                      </div>

                      <button className="btn btn-success" onClick={saveCV}>
                        <span className="text-dark">
                          <i className="la la-square"></i> Save Changes
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer pt-0 mt-7">
          <div className="row align-items-center justify-content-lg-between">
            <div className="col-lg-6">
              <div className="copyright text-center text-lg-left text-muted">
                © {new Date().getFullYear()}{" "}
                <a
                  href="https://www.whitecloak.com"
                  className="font-weight-bold ml-1"
                  target="_blank"
                >
                  WhiteCloak Technologies
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
