import { useState } from "react";

export default function ScreeningSettingDropdown(props) {
  const { onSelectSetting, screeningSetting } = props;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div className="section-header w-100">
          <strong>
            <i className="la la-filter text-primary mr-2"></i> Screening Setting
          </strong>
          <i className="la la-braille"></i>
        </div>
        <div className="dropdown w-100 mt-3">
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
      </div>
    </>
  );
}
