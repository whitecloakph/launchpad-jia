"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import { useAppContext } from "../../context/AppContext";
import DirectInterviewLinkV2 from "./DirectInterviewLinkV2";
import CareerForm from "./CareerForm";
import CareerLink from "./CareerLink";
import Accordion from "./Accordion";

export default function JobDescription({ formData, setFormData, editModal, isEditing, setIsEditing, handleCancelEdit }: { formData: any, setFormData: (formData: any) => void, editModal: boolean, isEditing: boolean, setIsEditing: (isEditing: boolean) => void, handleCancelEdit: () => void }) {
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

    async function updateCareer() {
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
            status: formData.status,
            screeningSetting: formData.screeningSetting,
            requireVideo: formData.requireVideo,
            description: formData.description,
            lastEditedBy: userInfoSlice,
            createdBy: userInfoSlice,
        };

        Swal.fire({
            title: "Updating career...",
            text: "Please wait while we update the career...",
            allowOutsideClick: false,
        });

        try {
            const response = await axios.post("/api/update-career", input);
            
            if (response.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Career updated successfully",
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

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
  
          
          <div className="thread-set">
            <div className="left-thread">
              <Accordion 
                items={[
                  {
                    id: "career-details",
                    title: "Career Details & Team Access",
                    content: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Job Title */}
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Job Title</span>
                          <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.jobTitle || "Not specified"}</span>
                        </div>

                        {/* Employment Type & Work Setup */}
                        <div style={{ display: "flex", gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Employment Type</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.employmentType || "Not specified"}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Work Arrangement</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.workSetup || "Not specified"}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div style={{ display: "flex", gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Country</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.country || "Philippines"}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>State / Province</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.province || "Not specified"}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>City</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.location || "Not specified"}</span>
                          </div>
                        </div>

                        {/* Salary */}
                        <div style={{ display: "flex", gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Minimum Salary</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>₱{formData.minimumSalary || "0"} PHP</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Maximum Salary</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>₱{formData.maximumSalary || "0"} PHP</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Negotiable</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.salaryNegotiable ? "Yes" : "No"}</span>
                          </div>
                        </div>

                        {/* Job Description */}
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Job Description</span>
                          <div style={{ fontSize: 15, color: "#6c757d", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: formData.description || "No description provided" }}></div>
                        </div>

                        {/* Work Setup Remarks */}
                        {formData.workSetupRemarks && (
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Work Setup Remarks</span>
                            <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.workSetupRemarks}</span>
                          </div>
                        )}

                        {/* Created By */}
                        <div style={{ display: "flex", gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 8 }}>Created By</span>
                            {formData.createdBy && (
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <img
                                  src={formData.createdBy.image}
                                  alt={formData.createdBy.name}
                                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                                />
                                <div>
                                  <span style={{ fontSize: 15, color: "#181D27", display: "block" }}>{formData.createdBy.name}</span>
                                  <span style={{ fontSize: 13, color: "#6c757d" }}>
                                    {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 8 }}>Last Updated By</span>
                            {formData.lastEditedBy && (
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <img
                                  src={formData.lastEditedBy.image}
                                  alt={formData.lastEditedBy.name}
                                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                                />
                                <div>
                                  <span style={{ fontSize: 15, color: "#181D27", display: "block" }}>{formData.lastEditedBy.name}</span>
                                  <span style={{ fontSize: 13, color: "#6c757d" }}>
                                    {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    id: "cv-review",
                    title: "CV Review & Pre-Screening Questions",
                    content: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>CV Screening</span>
                          <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.screeningSetting || "Not specified"}</span>
                        </div>
                        {formData.cvSecretPrompt && (
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>CV Secret Prompt</span>
                            <div style={{ 
                              padding: "12px", 
                              backgroundColor: "#F9FAFB", 
                              borderRadius: "6px",
                              border: "1px solid #E5E7EB",
                              fontSize: 15, 
                              color: "#6c757d",
                              lineHeight: 1.5
                            }}>
                              {formData.cvSecretPrompt}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    id: "ai-interview",
                    title: "AI Interview",
                    content: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>AI Interview Screening</span>
                          <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.aiInterviewScreening || "Not specified"}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>Require Video</span>
                          <span style={{ fontSize: 15, color: "#6c757d" }}>{formData.requireVideo ? "Yes" : "No"}</span>
                        </div>
                        {formData.aiSecretPrompt && (
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>AI Interview Secret Prompt</span>
                            <div style={{ 
                              padding: "12px", 
                              backgroundColor: "#F9FAFB", 
                              borderRadius: "6px",
                              border: "1px solid #E5E7EB",
                              fontSize: 15, 
                              color: "#6c757d",
                              lineHeight: 1.5
                            }}>
                              {formData.aiSecretPrompt}
                            </div>
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 8 }}>Interview Questions</span>
                          {formData.questions && formData.questions.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {formData.questions.map((category: any, index: number) => (
                                <div key={index} style={{ 
                                  padding: "12px", 
                                  backgroundColor: "#F9FAFB", 
                                  borderRadius: "6px",
                                  border: "1px solid #E5E7EB"
                                }}>
                                  <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 4 }}>
                                    {category.category}
                                  </span>
                                  <span style={{ fontSize: 15, color: "#6c757d", display: "block", marginBottom: 8 }}>
                                    Questions to ask: {category.questionCountToAsk || "All"}
                                  </span>
                                  {category.questions && category.questions.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      {category.questions.map((q: any, qIndex: number) => (
                                        <span key={qIndex} style={{ fontSize: 15, color: "#374151" }}>
                                          • {q.question}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 15, color: "#6c757d" }}>No questions added</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 15, color: "#6c757d" }}>No interview questions configured</span>
                          )}
                        </div>
                      </div>
                    )
                  },
                  {
                    id: "pipeline",
                    title: "Pipeline",
                    content: (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27", display: "block", marginBottom: 8 }}>Pipeline Stages</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {formData.pipelineStages && formData.pipelineStages.length > 0 ? formData.pipelineStages.map((stage: any, index: number) => (
                            <div key={stage.id} style={{ 
                              padding: "12px", 
                              backgroundColor: "#F9FAFB", 
                              borderRadius: "6px",
                              border: "1px solid #E5E7EB"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <div style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: stage.color
                                }}></div>
                                <span style={{ fontSize: 15, fontWeight: 600, color: "#181D27" }}>
                                  {stage.name}
                                </span>
                                {stage.locked && (
                                  <i className="la la-lock" style={{ fontSize: 12, color: "#9CA3AF" }}></i>
                                )}
                              </div>
                              <div style={{ marginLeft: 16 }}>
                                <span style={{ fontSize: 15, color: "#6c757d", display: "block", marginBottom: 4 }}>Substages:</span>
                                {stage.substages && stage.substages.map((substage: any) => (
                                  <span key={substage.id} style={{ fontSize: 15, color: "#374151", display: "block" }}>
                                    • {substage.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )) : (
                            <span style={{ fontSize: 15, color: "#6c757d" }}>No pipeline stages configured</span>
                          )}
                        </div>
                      </div>
                    )
                  }
                ]}
                allowMultiple={true}
              />
            </div>

            <div className="right-thread">
              <CareerLink career={formData} />
              <DirectInterviewLinkV2 formData={formData} setFormData={setFormData} />
              
              {/* Advanced Settings */}
              <div className="layered-card-outer" style={{ marginTop: "16px" }}>
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
                      style={{
                        background: "#DC2626",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="la la-trash"></i>
                      Delete Career
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Career Form Modal */}
          {showEditModal && (
            <CareerForm
              career={formData}
              formType="edit"
              setShowEditModal={setShowEditModal}
            />
          )}
        </div>
    );
}

