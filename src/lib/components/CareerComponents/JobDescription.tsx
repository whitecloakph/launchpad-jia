"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import { useAppContext } from "../../context/AppContext";
import DirectInterviewLinkV2 from "./DirectInterviewLinkV2";
import CareerLink from "./CareerLink";
import CareerDetailsForm from '@/app/recruiter-dashboard/careers/new-career/forms/CareerDetailsForm';
import PreScreeningForm from '@/app/recruiter-dashboard/careers/new-career/forms/PreScreeningForm';
import AIInterviewSetupForm from '@/app/recruiter-dashboard/careers/new-career/forms/AIInterviewForm';

export default function JobDescription({ formData, setFormData, editModal, isEditing, setIsEditing, handleCancelEdit }) {
    const { user } = useAppContext();
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (editModal) {
            setShowEditModal(true);
        }
    }, [editModal]);

    const handleEdit = () => {
        setShowEditModal(true);
    }

    async function updateCareer(status?: "active" | "inactive") {
        const userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        
        const input = {
            _id: formData._id,
            jobTitle: formData.jobTitle,
            updatedAt: Date.now(),
            questions: formData.questions,
            status: status || formData.status,
            screeningSetting: formData.screeningSetting,
            requireVideo: formData.requireVideo,
            description: formData.description,
            lastEditedBy: userInfoSlice,
            createdBy: userInfoSlice,
        };

        const statusText = status === "active" ? "Publishing" : status === "inactive" ? "Saving as unpublished" : "Updating";

        Swal.fire({
            title: `${statusText} career...`,
            text: "Please wait while we update the career...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post("/api/update-career", input);
            
            if (response.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: status === "active" ? "Career published successfully" : status === "inactive" ? "Career saved as unpublished" : "Career updated successfully",
                    icon: "success",
                    allowOutsideClick: false,
                }).then(() => {
                   setIsEditing(false);
                   window.location.reload();
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Failed to update career",
                icon: "error",
                allowOutsideClick: false,
            });
        }
    }

    async function deleteCareer() {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Deleting career...",
              text: "Please wait while we delete the career...",
              allowOutsideClick: false,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading();
              },
            });
    
            try {
              const response = await axios.post("/api/delete-career", {
                id: formData._id,
              });
    
              if (response.data.success) {
                Swal.fire({
                  title: "Deleted!",
                  text: "The career has been deleted.",
                  icon: "success",
                  allowOutsideClick: false,
                }).then(() => {
                  window.location.href = "/recruiter-dashboard/careers";
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.data.error || "Failed to delete the career",
                  icon: "error",
                });
              }
            } catch (error) {
              console.error("Error deleting career:", error);
              Swal.fire({
                title: "Error!",
                text: "An error occurred while deleting the career",
                icon: "error",
              });
            }
          }
        });
      }

    const totalInterviewQuestions = formData.questions?.reduce((acc, group) => acc + group.questions.length, 0) || 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={handleEdit}>
              <i className="la la-edit" style={{ marginRight: 8 }}></i>
              Edit details
          </button>
            <div className="thread-set">
                <div className="left-thread">
                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                      <div style={{ width: 32, height: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "#181D27", borderRadius: "60px" }}>
                      <i className="la la-suitcase" style={{ fontSize: 20, color: "#FFFFFF"}} /> 
                      </div>
                      <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Career Information</span>
                    </div>
                        <div className="layered-card-content">
                            {isEditing ? <textarea className="form-control" placeholder="Job Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /> 
                            : <p style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: formData.description }} />}
                        </div>
                        </div>
                    </div>
                    
                    {/* CV Review & Pre-Screening Section */}
                    {!isEditing && (
                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                                <div style={{ width: 32, height: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "#181D27", borderRadius: "60px" }}>
                                    <i className="la la-file-alt" style={{ fontSize: 20, color: "#FFFFFF"}} /> 
                                </div>
                                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>CV Review Settings</span>
                            </div>
                            
                            <div className="layered-card-content">
                                <div style={{ marginBottom: 16 }}>
                                    <span style={{ fontSize: 14, color: "#6c757d", display: "block", marginBottom: 4 }}>CV Screening</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                            Automatically endorse candidates who are
                                        </span>
                                        <span style={{
                                            padding: "4px 12px",
                                            backgroundColor: "#039855",
                                            color: "#fff",
                                            borderRadius: 6,
                                            fontSize: 13,
                                            fontWeight: 600
                                        }}>
                                            {formData.screeningSetting || "Good Fit and above"}
                                        </span>
                                    </div>
                                </div>

                                {formData.secretPrompt && (
                                    <>
                                        <div style={{ height: "1px", width: "100%", background: "#E9EAEB", margin: "16px 0" }}></div>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6c757d", display: "block", marginBottom: 8 }}>CV Secret Prompt</span>
                                            <div style={{ 
                                                padding: "12px",
                                                backgroundColor: "#F8F9FA",
                                                borderRadius: 8,
                                                fontSize: 13,
                                                color: "#181D27",
                                                whiteSpace: "pre-wrap",
                                                border: "1px solid #E9EAEB"
                                            }}>
                                                {formData.secretPrompt}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* AI Interview Questions Section */}
                    {!isEditing ? 
                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                          <div style={{ width: 32, height: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "#181D27", borderRadius: "60px" }}>
                          <i className="la la-microphone" style={{ fontSize: 20, color: "#FFFFFF"}} /> 
                          </div>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>
                            AI Interview Setup
                          </span>
                          <div style={{ borderRadius: "50%", width: 30, height: 22, border: "1px solid #D5D9EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, backgroundColor: "#F8F9FC", color: "#181D27", fontWeight: 700 }}>
                            {totalInterviewQuestions}
                          </div>
                        </div>
                    
                        <div className="layered-card-content">
                            {/* AI Interview Screening Setting */}
                            <div style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 14, color: "#6c757d", display: "block", marginBottom: 4 }}>AI Interview Screening</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                        Automatically endorse candidates who are
                                    </span>
                                    <span style={{
                                        padding: "4px 12px",
                                        backgroundColor: "#039855",
                                        color: "#fff",
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 600
                                    }}>
                                        {formData.AIscreeningSetting || formData.screeningSetting || "Good Fit and above"}
                                    </span>
                                </div>
                            </div>

                            <div style={{ height: "1px", width: "100%", background: "#E9EAEB", margin: "16px 0" }}></div>

                            {/* Require Video Setting */}
                            <div style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 14, color: "#6c757d", display: "block", marginBottom: 4 }}>Require Video on Interview</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className="la la-video" style={{ color: "#181D27", fontSize: 18 }}></i>
                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                        {formData.requireVideo ? "Yes - Video recording required" : "No - Video recording not required"}
                                    </span>
                                </div>
                            </div>

                            <div style={{ height: "1px", width: "100%", background: "#E9EAEB", margin: "16px 0" }}></div>

                            {/* Interview Questions by Category */}
                            {formData.questions?.length > 0 && formData.questions?.map((questionGroup, index) => (
                                questionGroup?.questions?.length > 0 && (
                                    <div key={index} style={{ marginBottom: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#181D27" }}>
                                                    {questionGroup.category}
                                                </h4>
                                                <div style={{
                                                    backgroundColor: "#181D27",
                                                    color: "#fff",
                                                    borderRadius: "50%",
                                                    width: 22,
                                                    height: 22,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    fontWeight: 600
                                                }}>
                                                    {questionGroup.questions.length}
                                                </div>
                                            </div>
                                            {questionGroup.questionCountToAsk && (
                                                <span style={{
                                                    fontSize: 12,
                                                    color: "#6c757d",
                                                    padding: "3px 8px",
                                                    backgroundColor: "#F8F9FA",
                                                    borderRadius: 6,
                                                    border: "1px solid #E9EAEB"
                                                }}>
                                                    <i className="la la-random" style={{ marginRight: 4 }}></i>
                                                    Ask {questionGroup.questionCountToAsk} of {questionGroup.questions.length}
                                                </span>
                                            )}
                                        </div>
                                        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                                            {questionGroup?.questions?.map((question, qIndex) => (
                                                <li key={qIndex} style={{ marginBottom: 6, fontSize: 14, color: "#181D27", lineHeight: "1.5" }}>
                                                    {question.question}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            ))}
                        </div>
                        </div>
                    </div> : <InterviewQuestionGeneratorV2 questions={formData.questions} setQuestions={(questions) => setFormData({ ...formData, questions: questions })} jobTitle={formData.jobTitle} description={formData.description} />}
                </div>

                <div className="right-thread">
                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                      <div style={{ width: 32, height: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "#181D27", borderRadius: "60px" }}>
                      <i className="la la-ellipsis-h" style={{ fontSize: 20, color: "#FFFFFF"}} /> 
                      </div>
                      <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Additional Details</span>
                      </div>
                        
                        <div className="layered-card-content">
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Employment Type:</strong> 
                                <span>{formData.employmentType || "Full-time"}</span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Work Arrangement:</strong> 
                                <span>{formData.workSetup || "-"}</span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Work Arrangement Remarks:</strong> 
                                <span>{formData.workSetupRemarks || "-"}</span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Salary:</strong> 
                                <span>{formData.salaryNegotiable ? "Negotiable" : "Fixed"}</span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Minimum Salary:</strong> 
                                <span>{formData.minimumSalary || "-"}</span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Maximum Salary:</strong> 
                                <span>{formData.maximumSalary || "-"}</span>
                            </div>
                            <div style={{ height: "1px", width: "100%", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Country:</strong> 
                                <span>Philippines </span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>State/Province:</strong> 
                                <span>{formData.province || "-"}</span>
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>City:</strong> 
                                <span>{formData.location || "-"}</span>
                            </div>
                            <div style={{ height: "1px", width: "100%", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Screening Setting:</strong> 
                                {isEditing ? <ScreeningSettingButton screeningSetting={formData.screeningSetting} onSelectSetting={(setting) => setFormData({ ...formData, screeningSetting: setting })} /> : 
                                <span style={{ textTransform: "capitalize" }}>{formData.screeningSetting}</span>}
                            </div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Require Video:</strong> 
                                {isEditing ? <button
                                    className={`button-primary ${formData.requireVideo ? "" : "negative"}`}
                                    onClick={() => {
                                    setFormData({ ...formData, requireVideo: !formData.requireVideo });
                                    }}
                                >
                                <i
                                className={`la ${
                                    formData.requireVideo ? "la-video" : "la-video-slash"
                                }`}
                                ></i>{" "}
                                {formData.requireVideo ? "On" : "Off"}
                            </button> :
                                <span>
                               {formData.requireVideo ? "Yes" : "No"}</span>}
                            </div>

                            <div style={{ height: "1px", width: "100%", background: "#E9EAEB", margin: "16px 0" }}></div>
                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Created By:</strong> 
                                {formData.createdBy && <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <img src={formData.createdBy.image} alt="created by" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#181D27" }}>{formData.createdBy.name}</span>
                                    <span style={{ fontSize: 12, color: "#717680" }}> on {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}</span>
                                  </div>
                                </div>}
                            </div>

                            <div style={{ display: "flex",flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                                <strong>Last Updated By:</strong> 
                                {formData.lastEditedBy && <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <img src={formData.lastEditedBy.image} alt="created by" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#181D27" }}>{formData.lastEditedBy.name}</span>
                                    <span style={{ fontSize: 12, color: "#717680" }}> on {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}</span>
                                  </div>
                                </div>}
                            </div>
                        </div>
                        </div>
                    </div>
                    <CareerLink career={formData} />
                    {/* Card for direct interview link */}
                    <DirectInterviewLinkV2 formData={formData} setFormData={setFormData} />
                    {isEditing && 
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center", marginBottom: "16px", width: "100%" }}>
                         <button className="button-primary" style={{ width: "50%" }} onClick={handleCancelEdit}>Cancel</button>
                        <button className="button-primary" style={{ width: "50%" }} onClick={() => updateCareer()}>Save Changes</button>
                    </div>}
                    <div className="layered-card-outer">
                      <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                      <div style={{ width: 32, height: 32, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "#181D27", borderRadius: "60px" }}>
                      <i className="la la-cog" style={{ fontSize: 20, color: "#FFFFFF"}} /> 
                      </div>
                      <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Advanced Settings</span>
                  </div>

                      <div className="layered-card-content">
                        <button 
                        onClick={() => {
                          deleteCareer();
                        }}
                        style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,backgroundColor: "#FFFFFF", color: "#B32318", borderRadius: "60px", padding: "5px 10px", border: "1px solid #B32318", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                                <i className="la la-trash" style={{ color: "#B32318", fontSize: 16 }}></i>
                                <span>Delete this career</span>
                        </button>
                        <span style={{ fontSize: "14px", color: "#717680", textAlign: "center" }}>Be careful, this action cannot be undone.</span>
                    </div>
                  </div>
                </div>
                </div>
            </div>
            {showEditModal && (
                <EditCareerModal 
                    career={formData} 
                    setShowEditModal={setShowEditModal}
                    user={user}
                    key={formData._id} // Force re-mount when formData changes
                />
            )}
        </div>
    )
}

// New Modal Component for Editing Career
function EditCareerModal({ career, setShowEditModal, user }) {
    const [activeEditTab, setActiveEditTab] = useState("career-details");
    const [isSaving, setIsSaving] = useState(false);

    // State for Career Details
    const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
    const [description, setDescription] = useState(career?.description || "");
    const [employmentType, setEmploymentType] = useState(career?.employmentType || "Full-Time");
    const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(career?.workSetupRemarks || "");
    const [country, setCountry] = useState(career?.country || "Philippines");
    const [province, setProvince] = useState(career?.province || "Metro Manila");
    const [city, setCity] = useState(career?.location || "");
    const [salaryNegotiable, setSalaryNegotiable] = useState(career?.salaryNegotiable || false);
    const [minimumSalary, setMinimumSalary] = useState(career?.minimumSalary?.toString() || "");
    const [maximumSalary, setMaximumSalary] = useState(career?.maximumSalary?.toString() || "");

    // State for CV Review
    const [screeningSetting, setScreeningSetting] = useState(career?.screeningSetting || "Good Fit and above");
    const [secretPrompt, setSecretPrompt] = useState(career?.secretPrompt || "");
    const [preScreeningQuestions, setPreScreeningQuestions] = useState(() => {
        // Transform from API format to form format
        if (career?.preScreeningQuestions && Array.isArray(career.preScreeningQuestions)) {
        return career.preScreeningQuestions.map((q) => {
            const baseQuestion = {
            id: parseInt(q.id) || Date.now(),
            title: q.questionType,
            question: q.question,
            type: q.questionFormat,
            required: true
            };

            if (q.questionFormat === "Dropdown" || q.questionFormat === "Multiple Choice") {
            baseQuestion.options = q.answers ? q.answers.map(a => a.value) : [];
            }

            if (q.questionFormat === "Range") {
            baseQuestion.minValue = q.minValue || "0";
            baseQuestion.maxValue = q.maxValue || "100";
            baseQuestion.rangeUnit = q.rangeUnit || "";
            }

            return baseQuestion;
        });
        }
        return [];
    });

    // State for AI Interview
    const [interviewScreeningSetting, setInterviewScreeningSetting] = useState(career?.AIscreeningSetting || "Good Fit and above");
    const [requireVideo, setRequireVideo] = useState(career?.requireVideo ?? true);
    const [questions, setQuestions] = useState(career?.questions || [
        { id: 1, category: "CV Validation / Experience", questionCountToAsk: null, questions: [] },
        { id: 2, category: "Technical", questionCountToAsk: null, questions: [] },
        { id: 3, category: "Behavioral", questionCountToAsk: null, questions: [] },
        { id: 4, category: "Analytical", questionCountToAsk: null, questions: [] },
        { id: 5, category: "Others", questionCountToAsk: null, questions: [] },
    ]);

    const editTabs = [
        { label: "Career Details", value: "career-details", icon: "suitcase" },
        { label: "CV Review", value: "cv-review", icon: "file-alt" },
        { label: "AI Interview", value: "ai-interview", icon: "microphone" },
    ];

    // Validation function to check if all required fields are filled
    const isFormValid = () => {
        // Career Details validation
        const hasJobTitle = jobTitle.trim().length > 0;
        const hasDescription = description.trim().length > 0;
        const hasWorkSetup = workSetup.trim().length > 0;
        const hasCity = city.trim().length > 0;
        
        // Salary validation
        const hasSalary = !minimumSalary || !maximumSalary || 
            (Number(minimumSalary) > 0 && Number(maximumSalary) > 0 && Number(minimumSalary) <= Number(maximumSalary));
        
        // AI Interview validation - at least one question in any category
        const hasQuestions = questions.some(q => q.questions && q.questions.length > 0);
        
        return hasJobTitle && hasDescription && hasWorkSetup && hasCity && hasSalary && hasQuestions;
    };

    const handleSaveChanges = async (saveAsStatus?: "active" | "inactive") => {
        // If trying to publish, validate all fields
        if (saveAsStatus === "active" && !isFormValid()) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Form",
                text: "Please fill in all required fields before publishing. Required: Job Title, Description, Work Setup, City, and at least one interview question.",
            });
            return;
        }
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
        Swal.fire({
            icon: "warning",
            title: "Invalid Salary Range",
            text: "Minimum salary cannot be greater than maximum salary",
        });
        return;
        }

        setIsSaving(true);
        const statusText = saveAsStatus === "active" ? "Publishing" : saveAsStatus === "inactive" ? "Saving as unpublished" : "Updating";
        
        Swal.fire({
        title: `${statusText} career...`,
        text: "Please wait while we update the career...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
        });

        try {
        // Transform pre-screening questions to match expected format
        const transformedPreScreeningQuestions = preScreeningQuestions.map((q, index) => {
            const baseQuestion = {
            id: String(index + 1),
            questionType: q.title || "Custom",
            question: q.question,
            questionFormat: q.type,
            };

            if (q.type === "Dropdown" || q.type === "Multiple Choice") {
            baseQuestion.answers = q.options ? q.options.map((opt, optIndex) => ({
                id: String(optIndex + 1),
                value: opt,
                type: q.type
            })) : [];
            }

            if (q.type === "Range") {
            baseQuestion.minValue = q.minValue || "0";
            baseQuestion.maxValue = q.maxValue || "100";
            baseQuestion.rangeUnit = q.rangeUnit || "";
            }

            return baseQuestion;
        });

        const userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };

        const updatedData = {
            _id: career._id,
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            location: city,
            country,
            province,
            employmentType,
            salaryNegotiable,
            minimumSalary: minimumSalary ? Number(minimumSalary) : 0,
            maximumSalary: maximumSalary ? Number(maximumSalary) : 0,
            screeningSetting,
            AIscreeningSetting: interviewScreeningSetting,
            secretPrompt: secretPrompt || "",
            preScreeningQuestions: transformedPreScreeningQuestions,
            requireVideo,
            orgID: career.orgID,
            status: saveAsStatus || career.status,
            lastEditedBy: userInfoSlice,
            updatedAt: new Date().toISOString(),
        };

        const response = await axios.post("/api/update-career", updatedData);

        if (response.status === 200) {
            Swal.fire({
            title: "Success",
            text: saveAsStatus === "active" ? "Career published successfully" : saveAsStatus === "inactive" ? "Career saved as unpublished" : "Career updated successfully",
            icon: "success",
            allowOutsideClick: false,
            }).then(() => {
            setShowEditModal(false);
            window.location.reload();
            });
        }
        } catch (error) {
        console.error("Error updating career:", error);
        Swal.fire({
            title: "Error",
            text: error.response?.data?.error || "Failed to update career",
            icon: "error",
            allowOutsideClick: false,
        });
        } finally {
        setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setShowEditModal(false);
    };

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
                }}
            >
                <div 
                    className="modal-content" 
                    style={{ 
                        overflowY: "scroll", 
                        height: "100vh", 
                        width: "90vw", 
                        background: "#fff", 
                        border: `1.5px solid #E9EAEB`, 
                        borderRadius: 14, 
                        boxShadow: "0 8px 32px rgba(30,32,60,0.18)", 
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "0 0 20px 0",
                            borderBottom: "1px solid #E9EAEB",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Edit Career</h3>
                        <button
                            onClick={handleCancel}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: 28,
                                cursor: "pointer",
                                color: "#6c757d",
                                padding: 0,
                                lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ borderBottom: "1px solid #E9EAEB", padding: "16px 0 0 0" }}>
                        <div style={{ display: "flex", gap: 24 }}>
                            {editTabs.map((tab) => (
                                <div
                                    key={tab.value}
                                    style={{
                                        padding: "12px 0",
                                        cursor: "pointer",
                                        borderBottom: activeEditTab === tab.value ? "2px solid #5E72E4" : "2px solid transparent",
                                        color: activeEditTab === tab.value ? "#5E72E4" : "#6c757d",
                                        fontWeight: activeEditTab === tab.value ? 600 : 400,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                    onClick={() => setActiveEditTab(tab.value)}
                                >
                                    <i className={`la la-${tab.icon}`} style={{ fontSize: 18 }}></i>
                                    {tab.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflow: "auto", padding: "24px 0" }}>
                        {activeEditTab === "career-details" && (
                            <CareerDetailsForm
                                jobTitle={jobTitle}
                                setJobTitle={setJobTitle}
                                description={description}
                                setDescription={setDescription}
                                employmentType={employmentType}
                                setEmploymentType={setEmploymentType}
                                workSetup={workSetup}
                                setWorkSetup={setWorkSetup}
                                workSetupRemarks={workSetupRemarks}
                                setWorkSetupRemarks={setWorkSetupRemarks}
                                country={country}
                                setCountry={setCountry}
                                province={province}
                                setProvince={setProvince}
                                city={city}
                                setCity={setCity}
                                salaryNegotiable={salaryNegotiable}
                                setSalaryNegotiable={setSalaryNegotiable}
                                minimumSalary={minimumSalary}
                                setMinimumSalary={setMinimumSalary}
                                maximumSalary={maximumSalary}
                                setMaximumSalary={setMaximumSalary}
                            />
                        )}
                        {activeEditTab === "cv-review" && (
                            <PreScreeningForm
                                screeningSetting={screeningSetting}
                                setScreeningSetting={setScreeningSetting}
                                secretPrompt={secretPrompt}
                                setSecretPrompt={setSecretPrompt}
                                preScreeningQuestions={preScreeningQuestions}
                                setPreScreeningQuestions={setPreScreeningQuestions}
                            />
                        )}
                        {activeEditTab === "ai-interview" && (
                            <AIInterviewSetupForm
                                jobTitle={jobTitle}
                                description={description}
                                screeningSetting={interviewScreeningSetting}
                                setScreeningSetting={setInterviewScreeningSetting}
                                requireVideo={requireVideo}
                                setRequireVideo={setRequireVideo}
                                questions={questions}
                                setQuestions={setQuestions}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            padding: "16px 0 0 0",
                            borderTop: "1px solid #E9EAEB",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            style={{
                                padding: "8px 24px",
                                backgroundColor: "#fff",
                                color: "#414651",
                                border: "1px solid #D5D7DA",
                                borderRadius: 8,
                                cursor: isSaving ? "not-allowed" : "pointer",
                                opacity: isSaving ? 0.6 : 1,
                                fontWeight: 600,
                            }}
                        >
                            Cancel
                        </button>
                        
                        <div style={{ display: "flex", gap: 12 }}>
                            {/* Save as Unpublished Button */}
                            <button
                                onClick={() => handleSaveChanges("inactive")}
                                disabled={isSaving}
                                style={{
                                    padding: "8px 24px",
                                    backgroundColor: "#fff",
                                    color: "#414651",
                                    border: "1px solid #D5D7DA",
                                    borderRadius: 8,
                                    cursor: isSaving ? "not-allowed" : "pointer",
                                    opacity: isSaving ? 0.6 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontWeight: 600,
                                }}
                            >
                                {isSaving ? (
                                    <>
                                        <div
                                            style={{
                                                width: 16,
                                                height: 16,
                                                border: "2px solid #414651",
                                                borderTop: "2px solid transparent",
                                                borderRadius: "50%",
                                                animation: "spin 1s linear infinite",
                                            }}
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="la la-save" style={{ fontSize: 18 }}></i>
                                        Save as Unpublished
                                    </>
                                )}
                            </button>

                            {/* Publish Button */}
                            <button
                                onClick={() => handleSaveChanges("active")}
                                disabled={isSaving || !isFormValid()}
                                style={{
                                    padding: "8px 24px",
                                    backgroundColor: isSaving || !isFormValid() ? "#D5D7DA" : "#5E72E4",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: isSaving || !isFormValid() ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontWeight: 600,
                                }}
                            >
                                {isSaving ? (
                                    <>
                                        <div
                                            style={{
                                                width: 16,
                                                height: 16,
                                                border: "2px solid #fff",
                                                borderTop: "2px solid transparent",
                                                borderRadius: "50%",
                                                animation: "spin 1s linear infinite",
                                            }}
                                        />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <i className="la la-check-circle" style={{ fontSize: 18 }}></i>
                                        Publish Career
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}

function ScreeningSettingButton(props) {
    const { onSelectSetting, screeningSetting } = props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
     // Setting List icons
    const settingList = [
        {
        name: "Good Fit and above",
        icon: "la la-check",
        },
        {
        name: "Only Strong Fit",
        icon: "la la-check-double",
        },
        {
        name: "No Automatic Promotion",
        icon: "la la-times",
        },
    ];
    return (
        <div className="dropdown w-100">
        <button
          className="dropdown-btn fade-in-bottom"
          style={{ width: "100%" }}
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <span>
            <i
              className={
                settingList.find(
                  (setting) => setting.name === screeningSetting
                )?.icon
              }
            ></i>{" "}
            {screeningSetting}
          </span>
          <i className="la la-angle-down ml-10"></i>
        </button>
        <div
          className={`dropdown-menu w-100 mt-1 org-dropdown-anim${
            dropdownOpen ? " show" : ""
          }`}
          style={{
            padding: "10px",
          }}
        >
          {settingList.map((setting, index) => (
            <div style={{ borderBottom: "1px solid #ddd" }} key={index}>
              <button
                className={`dropdown-item d-flex align-items-center${
                  screeningSetting === setting.name
                    ? " bg-primary text-white active-org"
                    : ""
                }`}
                style={{
                  minWidth: 220,
                  borderRadius: screeningSetting === setting.name ? 0 : 10,
                  overflow: "hidden",
                  paddingBottom: 10,
                  paddingTop: 10,
                }}
                onClick={() => {
                  onSelectSetting(setting.name);
                  setDropdownOpen(false);
                }}
              >
                <i className={setting.icon}></i> {setting.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
}