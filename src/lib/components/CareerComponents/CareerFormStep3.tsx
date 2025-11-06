"use client";

import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";

interface CareerFormStep3Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function CareerFormStep3({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: CareerFormStep3Props) {
  const isStepValid = () => {
    return formData.questions?.some((q: any) => q.questions.length > 0);
  };

  const handleNext = () => {
    if (isStepValid()) {
      onNext();
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#181D27",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="la la-comments" style={{ color: "#FFFFFF", fontSize: 18 }}></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Interview Questions
            </span>
          </div>

          <div className="layered-card-content">
            <InterviewQuestionGeneratorV2
              questions={formData.questions || []}
              setQuestions={(questions: any) => updateFormData({ questions })}
              jobTitle={formData.jobTitle || ""}
              description={formData.description || ""}
            />
          </div>
        </div>
      </div>

      <div className="layered-card-outer" style={{ marginTop: 16 }}>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#181D27",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="la la-video" style={{ color: "#FFFFFF", fontSize: 18 }}></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Video Interview Requirement
            </span>
          </div>

          <div className="layered-card-content">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>
                  Require Video Interview
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#6B7280" }}>
                  When enabled, applicants must complete a video interview as part of the application process.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.requireVideo !== false}
                    onChange={() => updateFormData({ requireVideo: !formData.requireVideo })}
                  />
                  <span className="slider round"></span>
                </label>
                <span style={{ fontSize: 14, fontWeight: 500, minWidth: "35px" }}>
                  {formData.requireVideo !== false ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          style={{
            padding: "10px 24px",
            backgroundColor: "#FFFFFF",
            color: "#181D27",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            cursor: "pointer",
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
        <button
          disabled={!isStepValid()}
          onClick={handleNext}
          style={{
            padding: "10px 24px",
            backgroundColor: isStepValid() ? "#181D27" : "#D5D7DA",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: isStepValid() ? "pointer" : "not-allowed",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Continue
          <i className="la la-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
