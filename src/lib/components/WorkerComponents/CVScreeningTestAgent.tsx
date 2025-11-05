import { useState } from "react";
import axios from "axios";
import {
  CORE_API_URL,
  errorToast,
  guid,
  htmlToPlainText,
  successToast,
} from "@/lib/Utils";
import Swal from "sweetalert2";

export default function CVScreeningTestAgent(props) {
  const { fileData, index, fileItem, jobTitle, jobDescription } = props;

  const [digitalCV, setDigitalCV] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const [agentError, setAgentError] = useState("");

  const [processing, setProcessing] = useState(false);
  const [step1, setStep1] = useState({
    name: "Upload and Content Processing",
    icon1: "la la-circle-notch spin",
    icon2: "la la-square text-info",
  });
  const [step2, setStep2] = useState({
    name: "CV Screening",
    icon1: "",
    icon2: "la la-square text-muted",
  });
  const [step3, setStep3] = useState({
    name: "Results",
    icon1: "",
    icon2: "la la-square text-muted",
  });

  function screenCV(cvData) {
    setAgentError("");
    setProcessing(true);

    setStep2({
      name: "CV Screening",
      icon1: "la la-check text-primary",
      icon2: "la la-square text-success",
    });

    let testInterviewData = {
      interviewID: guid(),
      jobTitle: jobTitle,
      description: jobDescription,
      name: cvData.applicantName,
    };

    let testCVData = {
      email: cvData.applicantEmail,
      ...cvData,
    };

    setStep3({
      name: "Results",
      icon1: "la la-circle-notch spin",
      icon2: "la la-square text-info",
    });

    let corellateStatusBtn: any = document.querySelector(
      "#correlate-status-btn"
    );

    axios
      .post("/api/screen-cv", {
        interviewID: testInterviewData.interviewID,
        userEmail: cvData.applicantEmail,
        testMode: true,
        testInterviewData: testInterviewData,
        testCVData: testCVData,
      })
      .then((res) => {
        console.log("CV Screening Result", res.data);
        setResults(res.data);

        setStep3({
          name: "Results",
          icon1: "la la-check text-primary",
          icon2: "la la-square text-success",
        });

        setProgress(100);

        setProcessing(false);

        if (corellateStatusBtn) {
          corellateStatusBtn.click();
        }

        setTimeout(() => {
          if (corellateStatusBtn) {
            corellateStatusBtn.click();
          }
        }, 200);

        setTimeout(() => {
          if (corellateStatusBtn) {
            corellateStatusBtn.click();
          }
        }, 400);

        setTimeout(() => {
          if (corellateStatusBtn) {
            corellateStatusBtn.click();
          }
        }, 600);

        setAgentError("");
      })
      .catch((err) => {
        console.log(err);
        setProcessing(false);

        if (corellateStatusBtn) {
          corellateStatusBtn.click();
        }

        setTimeout(() => {
          if (corellateStatusBtn) {
            corellateStatusBtn.click();
          }
        }, 200);

        setTimeout(() => {
          if (corellateStatusBtn) {
            corellateStatusBtn.click();
          }
        }, 400);

        setTimeout(() => {
          if (corellateStatusBtn) {
            corellateStatusBtn.click();
          }
        }, 600);

        setStep2({
          name: "[Failed] CV Screening",
          icon1: "la la-times text-danger",
          icon2: "la la-square text-red",
        });

        setAgentError("[Failed]CV Screening Failed.");

        setTimeout(() => {
          setAgentError("");
          screenCV(cvData);
          successToast(
            "Retrying CV Screening for " + cvData.applicantName,
            900
          );
        }, 4000);
      });
  }

  async function digitizeCV(cvChunks) {
    setAgentError("");
    setProcessing(true);

    setProgress(68);

    setStep1({
      name: "Upload and Content Processing",
      icon1: "la la-check text-primary",
      icon2: "la la-square text-success",
    });

    setStep2({
      name: "CV Screening",
      icon1: "la la-circle-notch spin",
      icon2: "la la-square text-info",
    });

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
    applicantName: <applicant name>,
    applicantEmail: <applicant email>,
    jobPosition: <job position>,
    previousRoles: <previous roles array of strings>,
    skills: <skills array of strings>,
    yearsOfExperience: <years of experience>,
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

      setProgress(78);

      console.log(parsedOutput);

      screenCV(parsedOutput);
      setDigitalCV(parsedOutput);
    } catch (err) {
      console.log(err);
      errorToast("Failed to generate analysis, please try again later", 1300);
      setProgress(progress - 33.33);
      setProcessing(false);

      setStep3({
        name: "[Failed] Result Generation",
        icon1: "la la-times text-danger",
        icon2: "la la-square text-red",
      });

      setAgentError("[Failed] Digitize CV Failed to Generate Result.");

      setTimeout(() => {
        setAgentError("");
        digitizeCV(cvChunks);
        successToast("Retrying Digitize CV for " + fileItem.name, 900);
      }, 4000);
    }
  }

  function analyzeCV() {
    setAgentError("");
    setProcessing(true);
    setStep1({
      name: "Upload and Content Processing",
      icon1: "la la-circle-notch spin",
      icon2: "la la-square text-info",
    });

    setProgress(33.33);

    const formData = new FormData();
    formData.append("userEmail", "cv-screen-test@hellojia.ai");
    formData.append("file", fileData);
    formData.append("fName", fileItem.name);

    axios
      .post(`${CORE_API_URL}/upload-cv`, formData)
      .then(async (res) => {
        if (res.data.error) {
          Swal.fire({
            icon: "error",
            title: "Failed to upload CV.",
            text: res.data.error,
          });

          return;
        }

        digitizeCV(res.data.cvChunks);
      })
      .catch((err) => {
        console.log(err);

        setStep1({
          name: "[Failed] Upload and Content Processing",
          icon1: "la la-times text-danger",
          icon2: "la la-square text-red",
        });

        setAgentError("Uploading Failed.");

        setTimeout(() => {
          retryOnError();
          successToast("Retrying Upload for " + fileItem.name, 900);
        }, 5000);
      });
  }

  function retryOnError() {
    setAgentError("");
    analyzeCV();
  }

  return (
    <div
      className={`card shadow-1 cv-tester-agent  ${
        agentError ? "bg-salmon agent-error" : ""
      }`}
    >
      <div className="card-header">
        <i className="la la-bars text-primary mr-2" />
        <strong>Applicant CV File</strong>

        <div className="btn-set ml-auto">
          <button
            className={`btn btn-sm 
          btn-cv-screen-test    
          ${processing ? "btn-white" : "btn-default"}
          `}
            onClick={analyzeCV}
          >
            <i
              className={`la ${
                processing
                  ? "la-circle-notch spin text-primary"
                  : "text-info la-square"
              }`}
            />{" "}
            {processing ? "Processing..." : "Analyze"}
          </button>
        </div>
      </div>
      <div className="card-body">
        {agentError && (
          <h3>
            <i className="la la-exclamation-triangle mr-2 ml-2 la la-chevron-circle-right text-danger" />
            {agentError}
          </h3>
        )}

        <h3>
          <i className="la la-file-pdf mr-2 ml-2 la la-chevron-circle-right text-primary" />
          {fileItem.name}
        </h3>

        <div className="tr-time mt--2 mb-2 fade-in-bottom">
          <small>
            <i className={`la ${step1.icon1}`} />{" "}
            <i className={`la ${step1.icon2}`} /> Step1: {step1.name}
          </small>

          <div className="line-div"></div>
          <small title={"Amout of time from the last message"}>
            <i className={`la ${step2.icon1}`} />{" "}
            <i className={`la ${step2.icon2}`} /> Step 2: {step2.name}
          </small>

          <div className="line-div"></div>
          <small title={"Amout of time from the last message"}>
            <i className={`la ${step3.icon1}`} />{" "}
            <i className={`la ${step3.icon2}`} /> Step 3: {step3.name}
          </small>
        </div>

        {digitalCV && (
          <>
            <>
              <h3>
                <i className="la la-user mr-2 ml-2 la la-chevron-circle-right text-primary" />
                {digitalCV.applicantName}
              </h3>
              <small className="mt--2">
                <i className="la la-envelope mr-2 ml-2 la la-chevron-circle-right text-primary" />
                {digitalCV.jobPosition} | {digitalCV.applicantEmail} |{" "}
                {digitalCV.yearsOfExperience} years of experience.
              </small>
            </>
          </>
        )}

        <div className="progress">
          <div
            className={`bar 
            ${progress === 100 ? "bg-gradient-success" : "bg-gradient-info"}
            `}
            style={{ width: `${progress}%`, transition: "0.3s" }}
          ></div>
        </div>

        {results && (
          <>
            <strong>AI Assessment Confidence: {results.confidence}%</strong>

            <div className="progress">
              <div
                className={`bar bg-warning`}
                style={{ width: `${results.confidence}%`, transition: "0.3s" }}
              ></div>
            </div>

            <strong>Job Fit Score: {results.jobFitScore}%</strong>

            <div className="progress">
              <div
                className={`bar bg-primary`}
                style={{ width: `${results.jobFitScore}%`, transition: "0.3s" }}
              ></div>
            </div>

            <div className="section-header">
              <strong>Results</strong>
              <i className="la la-bars" />
            </div>
            <div className="accord-item">
              <div
                className={`job-fit-card cvp-exp-block worker-badge ${results.stateClass}  w-100 p-3`}
              >
                <small className="ax-tag">
                  <strong>
                    <i className="la la-first-order text-primary" /> AI CV
                    Screening Result
                  </strong>
                </small>
                <h2 className="mb-0">
                  <i className={"la la-square"} /> {results.cvStatus}
                </h2>
              </div>
            </div>
            <span
              dangerouslySetInnerHTML={{ __html: results.cvScreeningReason }}
            />

            <textarea
              className="form-control cv-screen-csv"
              style={{ display: "none" }}
              value={`${
                digitalCV.applicantName
                  ? digitalCV.applicantName.replace(/,/g, " ")
                  : fileItem.name
              },${
                digitalCV.applicantEmail ? digitalCV.applicantEmail : "N/A"
              },${results.cvStatus},${htmlToPlainText(
                results.cvScreeningReason
              )},${results.jobFitScore},${results.confidence}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
