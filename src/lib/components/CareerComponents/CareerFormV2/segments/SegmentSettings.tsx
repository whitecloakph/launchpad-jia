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
  requireVideo,
  setRequireVideo,
}: {
  screeningSetting: string;
  setScreeningSetting: (value: string) => void;
  requireVideo: boolean;
  setRequireVideo: (value: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
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
              <i
                className="la la-cog"
                style={{ color: "#FFFFFF", fontSize: 20 }}
              ></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Settings
            </span>
          </div>
          <div className="layered-card-content">
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <i
                className="la la-id-badge"
                style={{ color: "#414651", fontSize: 20 }}
              ></i>
              <span>
                Screening Setting <span style={{ color: "#EF4444" }}>*</span>
              </span>
            </div>
            <CustomDropdown
              onSelectSetting={(setting) => setScreeningSetting(setting)}
              screeningSetting={screeningSetting}
              settingList={screeningSettingList}
            />
            <span>
              This settings allows Jia to automatically endorse candidates who
              meet the chosen criteria.
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                <i
                  className="la la-video"
                  style={{ color: "#414651", fontSize: 20 }}
                ></i>
                <span>Require Video Interview</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={requireVideo}
                    onChange={() => setRequireVideo(!requireVideo)}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{requireVideo ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
