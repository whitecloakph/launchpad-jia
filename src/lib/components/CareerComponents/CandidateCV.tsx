"use client"
import axios from "axios";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import CareerFit from "./CareerFit";
import Swal from "sweetalert2";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CandidateCVDocument } from "../CandidateComponents/CandidateCVDocument";
import { extractInterviewAssessment } from "@/lib/Utils";


export default function CandidateCV({ candidate, setShowCandidateCV }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [cvData, setCvData] = useState([
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
  ]);

      useEffect(() => {
        const fetchCVData = async () => {
            if (!candidate) return;
            setIsLoading(true);
            const response = await axios.post("/api/load-user-cv", { email: candidate?.email });
            if (response?.data?.error) {
                Swal.fire({
                  icon: "error",
                  title: "Something went wrong",
                  text: response?.data?.error,
                  allowOutsideClick: false,
                  confirmButtonText: "Back to Career Page",
                })
                setIsLoading(false);
                return false;
            }
            setCvData(response?.data?.digitalCV);
            setIsLoading(false);
        }
        fetchCVData();
      }, [candidate]);


    const getContent = (name: string) => {
      const section = cvData?.find((section: any) => section.name === name);
      return section?.content?.split(`**${name}**`)[1]?.trim() || section?.content?.trim();
    }
    
    return (
        <div
        className="modal show fade-in-bottom"
        style={{
          display: "block",
          background: "rgba(0,0,0,0.45)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1050,
        }}
        >
            <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw",
            }}>
                <div 
                className="modal-content" 
                style={{ overflowY: "auto", maxHeight: "80vh", maxWidth: "80vw", background: "#fff", border: `1.5px solid #E9EAEB`, borderRadius: 14, boxShadow: "0 8px 32px rgba(30,32,60,0.18)" }}>
                    <div className="modal-header">
                        <h3 className="modal-title">Candidate CV</h3> 
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          {/* Download CV */}
                          {cvData?.length > 0 && candidate &&
                          <PDFDownloadLink
                            key={new Date().toISOString()}
                            document={<CandidateCVDocument candidate={candidate} cvData={cvData} />}
                            fileName={`${candidate?.name}-CV.pdf`}
                          >
                          {({ loading }) =>
                            loading ? 'Preparing document...' : 'Download CV'
                          }
                          </PDFDownloadLink>
                          }
                          {/* Close Modal */}
                          <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowCandidateCV(false)}>
                            <i className="la la-times"></i>
                          </button>
                        </div>
                    </div>
                    {isLoading ? (<div className="modal-body">
                      <div className="text-center">
                        {/* Skeleton candidate avatar */}
                      <div className="skeleton-bar" style={{ width: "100%", height: "50px" }}></div>
                      
                      <div className="mb-3" style={{ marginTop: 16 }}>
                        <div className="skeleton-bar" style={{ width: "100%", height: "20px" }}></div>
                      </div>
                      {/* Skeleton CV Info */}
                      <div style={{ display: "flex", alignItems: "flex-start", flexDirection: "row", gap: 16 }}>
                        <div style={{ width: "60%", display: "flex", flexDirection: "column", borderRight: "1px solid #E9EAEB", paddingRight: "16px" }}>
                          {[...Array(4)].map((_, index) => (
                            <div key={index} style={{ marginBottom: 16 }}>
                              <div className="skeleton-bar" style={{ width: "30%", height: "20px", marginBottom: 8 }}></div>
                              <div className="skeleton-bar" style={{ width: "100%", height: "20px" }}></div>
                            </div>
                          ))}
                        </div>
                        <div style={{ width: "40%", display: "flex", flexDirection: "column" }}>
                          {[...Array(4)].map((_, index) => (
                            <div key={index} style={{ marginBottom: 16 }}>
                              <div className="skeleton-bar" style={{ width: "30%", height: "20px", marginBottom: 8 }}></div>
                              <div className="skeleton-bar" style={{ width: "100%", height: "20px" }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      </div>
                    </div>) : cvData?.length > 0 ? (<div className="modal-body">
                      {/* Candidate Avatar and name */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderRadius: 8, border: "1px solid #E9EAEB", padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <img alt={candidate?.name} src={candidate?.image} style={{ width: 48, height: 48, borderRadius: "50%", background: "#E0E0E0" }} />
                          <div>
                              <div style={{ fontWeight: 500, fontSize: 14 }}>{candidate?.name}</div>
                              <div style={{ fontSize: 12, color: "#787486" }}>{candidate?.email}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                          <div><i className="la la-asterisk" style={{ fontSize: 16, marginRight: "5px", color: "#6941C6" }}></i>JIA thinks this candidate is a {<CareerFit 
                          fit={candidate?.currentStep === "CV Screening" || candidate?.stage === "Pending AI Interview" ? `CV: ${candidate?.cvStatus || "N/A"}` : `Interview: ${candidate?.jobFit || "N/A"}`} 
                          assessment={candidate?.currentStep === "CV Screening" || candidate?.stage === "Pending AI Interview" ? candidate?.cvScreeningReason : extractInterviewAssessment(candidate?.summary)} />} 
                          for the role(s):</div>
                          <div style={{ fontWeight: 600 }}>{candidate?.jobTitle}</div>
                        </div>
                      </div>
                        <div className="mb-3">
                             <h3>Introduction</h3>
                             {getContent("Introduction") || "No introduction provided in CV"}
                        </div>
                       <div style={{ display: "flex", alignItems: "flex-start", flexDirection: "row", gap: 16 }}>
                        <div style={{ width: "60%", display: "flex", flexDirection: "column", borderRight: "1px solid #E9EAEB", paddingRight: "16px" }}>
                            <div>
                            <h3>Current Position</h3>
                            <Markdown>{getContent("Current Position") || "No current position provided in CV"}</Markdown>
                            </div>
                            <div style={{ width: "100%", height: "1px", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div>
                            <h3>Experience</h3>
                            <Markdown>{getContent("Experience") || "No experience provided in CV"}</Markdown>
                            </div>
                            <div style={{ width: "100%", height: "1px", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div>
                            <h3>Education</h3>
                            <Markdown>{getContent("Education") || "No education provided in CV"}</Markdown>
                            </div>
                            <div style={{ width: "100%", height: "1px", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div>
                            <h3>Skills</h3>
                            <Markdown>{getContent("Skills") || "No skills provided in CV"}</Markdown>
                            </div>
                        </div>
                        <div style={{ width: "40%", display: "flex", flexDirection: "column" }}>
                            <div>
                            <h3>Contact Information</h3>
                            <Markdown>{getContent("Contact Info") || "No contact information provided in CV"}</Markdown>
                            </div>
                            <div style={{ width: "100%", height: "1px", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div>
                            <h3>Certifications</h3>
                            <Markdown>{getContent("Certifications") || "No certifications provided in CV"}</Markdown>
                            </div>
                            <div style={{ width: "100%", height: "1px", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div>
                            <h3>Projects</h3>
                            <Markdown>{getContent("Projects") || "No projects provided in CV"}</Markdown>
                            </div>
                            <div style={{ width: "100%", height: "1px", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div>
                            <h3>Awards</h3>
                            <Markdown>{getContent("Awards") || "No awards provided in CV"}</Markdown>
                            </div>
                        </div>
                       </div>
                    </div>) : (
                      <div className="modal-body">
                        <div className="text-center">
                          <h3>Applicant has no uploaded CV</h3>
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
    )
}
