"use client";

import { useState } from "react";

interface CareerFormStep5Props {
  formData: any;
  onPrevious: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onEditStep: (step: number) => void;
  isSaving: boolean;
}

export default function CareerFormStep5({
  formData,
  onPrevious,
  onPublish,
  onSaveDraft,
  onEditStep,
  isSaving,
}: CareerFormStep5Props) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (section: number) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getTotalQuestions = () => {
    return formData.questions?.reduce((total: number, category: any) => {
      return total + (category.questions?.length || 0);
    }, 0) || 0;
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px 0" }}>
          {formData.isDraft && "[Draft] "}{formData.jobTitle || "Untitled Career"}
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          Review all information before publishing your career posting.
        </p>
      </div>

      {/* Step 1: Career Details & Team Access */}
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(1)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={expandedSection === 1 ? "la la-angle-up" : "la la-angle-down"}
                style={{ fontSize: 20, color: "#6B7280" }}
              ></i>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                Career Details & Team Access
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(1);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 1 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                    JOB TITLE
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>{formData.jobTitle || "—"}</p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                    DESCRIPTION
                  </p>
                  <div
                    style={{ fontSize: 14 }}
                    dangerouslySetInnerHTML={{ __html: formData.description || "—" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                      EMPLOYMENT TYPE
                    </p>
                    <p style={{ fontSize: 14, margin: 0 }}>{formData.employmentType || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                      WORK ARRANGEMENT
                    </p>
                    <p style={{ fontSize: 14, margin: 0 }}>{formData.workSetup || "—"}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                    LOCATION
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    {formData.city && formData.province
                      ? `${formData.city}, ${formData.province}, ${formData.country || "Philippines"}`
                      : "—"}
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                    SALARY
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    {formData.minimumSalary && formData.maximumSalary
                      ? `₱${Number(formData.minimumSalary).toLocaleString()} - ₱${Number(formData.maximumSalary).toLocaleString()} ${formData.salaryNegotiable !== false ? "(Negotiable)" : "(Fixed)"}`
                      : formData.salaryNegotiable !== false
                      ? "Negotiable"
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: CV Review & Pre-screening */}
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(2)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={expandedSection === 2 ? "la la-angle-up" : "la la-angle-down"}
                style={{ fontSize: 20, color: "#6B7280" }}
              ></i>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                CV Review & Pre-Screening Questions
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(2);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 2 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 8px 0" }}>
                    CV SCREENING
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    Automatically endorse candidates who are{" "}
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "#DBEAFE",
                        borderRadius: "4px",
                        fontWeight: 500,
                      }}
                    >
                      {formData.screeningSetting || "Good Fit and above"}
                    </span>
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 8px 0" }}>
                    PRE-SCREENING QUESTIONS
                    {formData.prescreeningQuestions?.length > 0 && (
                      <span
                        style={{
                          marginLeft: 8,
                          padding: "2px 6px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "12px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {formData.prescreeningQuestions.length}
                      </span>
                    )}
                  </p>
                  {formData.prescreeningQuestions && formData.prescreeningQuestions.length > 0 ? (
                    formData.prescreeningQuestions.map((q: any, index: number) => (
                      <div
                        key={q.id}
                        style={{
                          marginBottom: 12,
                          padding: "12px",
                          backgroundColor: "#F9FAFB",
                          borderRadius: "6px",
                        }}
                      >
                        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px 0" }}>
                          {index + 1}. {q.question}
                        </p>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                          {q.options.map((opt: string, optIndex: number) => (
                            <li key={optIndex} style={{ fontSize: 13, color: "#6B7280" }}>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>No questions added</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: AI Interview Setup */}
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(3)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={expandedSection === 3 ? "la la-angle-up" : "la la-angle-down"}
                style={{ fontSize: 20, color: "#6B7280" }}
              ></i>
              <span style={{ fontSize: 16, fontWeight: 600 }}>AI Interview Setup</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(3);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 3 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px 0" }}>
                    VIDEO INTERVIEW REQUIRED
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    {formData.requireVideo !== false ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 8px 0" }}>
                    INTERVIEW QUESTIONS ({getTotalQuestions()} questions)
                  </p>
                  {formData.questions?.map((category: any) => {
                    if (category.questions?.length > 0) {
                      return (
                        <div key={category.id} style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px 0" }}>
                            {category.category} ({category.questions.length})
                          </p>
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {category.questions.map((q: string, index: number) => (
                              <li key={index} style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Pipeline Stages */}
      <div className="layered-card-outer" style={{ marginBottom: 12 }}>
        <div
          className="layered-card-middle"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(4)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <i
                className={expandedSection === 4 ? "la la-angle-up" : "la la-angle-down"}
                style={{ fontSize: 20, color: "#6B7280" }}
              ></i>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Pipeline Stages</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStep(4);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                color: "#181D27",
              }}
            >
              <i className="la la-pen" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {expandedSection === 4 && (
            <div
              style={{
                padding: "0 16px 16px 16px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                  Using default pipeline stages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 32,
          gap: 12,
        }}
      >
        <button
          onClick={onPrevious}
          disabled={isSaving}
          style={{
            padding: "10px 24px",
            backgroundColor: "#FFFFFF",
            color: "#181D27",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i className="la la-arrow-left"></i>
          Back
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            style={{
              padding: "10px 24px",
              backgroundColor: "#FFFFFF",
              color: "#414651",
              border: "1px solid #D5D7DA",
              borderRadius: "8px",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Save as Unpublished
          </button>
          <button
            onClick={onPublish}
            disabled={isSaving}
            style={{
              padding: "10px 24px",
              backgroundColor: isSaving ? "#D5D7DA" : "#181D27",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="la la-check-circle"></i>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
