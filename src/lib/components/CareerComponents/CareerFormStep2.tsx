"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import PrescreeningQuestions from "@/lib/components/CareerComponents/PrescreeningQuestions";

const screeningSettingList = [
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

interface CareerFormStep2Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function CareerFormStep2({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: CareerFormStep2Props) {
  const isStepValid = () => {
    return formData.screeningSetting?.trim().length > 0;
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
              <i className="la la-id-badge" style={{ color: "#FFFFFF", fontSize: 18 }}></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              CV Screening
            </span>
          </div>

          <div className="layered-card-content">
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Automatically endorse candidates who are
              </label>
              <CustomDropdown
                onSelectSetting={(setting: string) => {
                  updateFormData({ screeningSetting: setting });
                }}
                screeningSetting={formData.screeningSetting || "Good Fit and above"}
                settingList={screeningSettingList}
              />
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 8 }}>
              This setting allows Jia to automatically endorse candidates who meet the chosen criteria.
            </p>
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
              <i className="la la-clipboard-list" style={{ color: "#FFFFFF", fontSize: 18 }}></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Pre-Screening Questions
            </span>
          </div>

          <div className="layered-card-content">
            <PrescreeningQuestions
              questions={formData.prescreeningQuestions || []}
              setQuestions={(questions: any) =>
                updateFormData({ prescreeningQuestions: questions })
              }
            />
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
