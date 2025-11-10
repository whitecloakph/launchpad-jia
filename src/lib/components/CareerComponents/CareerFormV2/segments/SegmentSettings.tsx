"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

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

export default function SegmentSettings({
  screeningSetting,
  setScreeningSetting,
}: {
  screeningSetting: string;
  setScreeningSetting: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="layered-card-middle">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="career-label">1. CV Review Settings</span>
        </div>
        <div className="layered-card-content">
          <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <span className="sub-career-label">
              CV Screening <span style={{ color: "#EF4444" }}>*</span>
            </span>
          </div>
          <span
            style={{
              fontSize: "16px",
              marginBottom: "8px",
              color: "#414651",
            }}
          >
            Jia automatically endorses candidates who meet the chosen criteria.
          </span>
          <div style={{ borderBottom: "1px solid #D1D5DB", paddingBottom: 25 }}>
            <div style={{ width: "30%" }}>
              <CustomDropdown
                onSelectSetting={(setting) => setScreeningSetting(setting)}
                screeningSetting={screeningSetting}
                settingList={screeningSettingList}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <span className="sub-career-label">CV Secret Prompt </span>
              <span>(optional)</span>
            </div>
            <span
              style={{
                fontSize: "16px",
                marginBottom: "8px",
                color: "#414651",
              }}
            >
              Secret Prompts give you extra control over Jia’s evaluation style,
              complementing her accurate assessment of requirements from the job
              description.
            </span>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div className="layered-card-content">
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team Access PlaceHolder */}
      <div>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="career-label">2. Pre-Screening Questions</span>
            <span style={{ paddingTop: 8 }}>(optional)</span>
          </div>
          <div className="layered-card-content">
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
