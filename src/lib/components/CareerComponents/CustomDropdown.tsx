"use client";
import { useState } from "react";
import styles from "@/lib/styles/components/customDropdown.module.scss";

export default function CustomDropdown(props) {
  const { onSelectSetting, screeningSetting, settingList, placeholder, hasError } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const hasValue = screeningSetting && screeningSetting.trim() !== "";

  return (
    <div className={`dropdown ${styles.dropdownWrapper}`}>
      <button
        disabled={settingList.length === 0}
        className={`dropdown-btn fade-in-bottom ${styles.dropdownButton} ${hasError ? styles.hasError : ""}`}
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
      >
        <span className={`${styles.buttonText} ${!hasValue ? styles.isPlaceholder : ""}`}>
          <i
            className={
              settingList.find(
                (setting) => setting.name === screeningSetting
              )?.icon
            }
          ></i>{" "}
          {hasValue ? screeningSetting.replace("_", " ") : placeholder}
        </span>
        <i className={`la la-angle-down ${styles.dropdownIcon}`}></i>
      </button>
      <div
        className={`dropdown-menu mt-1 org-dropdown-anim ${styles.dropdownMenu}${
          dropdownOpen ? " show" : ""
        }`}
      >
        {settingList.map((setting, index) => {
          const isSelected = screeningSetting === setting.name;
          const hasDescription = setting.description && setting.description.trim() !== "";

          return (
            <div className={styles.menuItemWrapper} key={index}>
              <button
                className={`dropdown-item ${styles.menuItem} ${
                  isSelected ? styles.isSelected : ""
                } ${hasDescription ? styles.hasDescription : ""}`}
                onClick={() => {
                  onSelectSetting(setting.name);
                  setDropdownOpen(false);
                }}
              >
                {/* Menu Item Text */}
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemText}>
                    {setting.icon && <i className={setting.icon}></i>}
                    <span className={styles.menuItemName}>
                      {setting.name?.replace("_", " ")}
                    </span>
                  </div>
                  {hasDescription && (
                    <span className={styles.menuItemDescription}>
                      {setting.description}
                    </span>
                  )}
                </div>

                {/* Left check icon for simple items (no description) */}
                {!hasDescription && (
                  <div className={styles.menuItemIconWrapper}>
                    {isSelected ? (
                      <i className={`la la-check ${styles.checkIcon}`}></i>
                    ) : (
                      <span className={styles.checkIconPlaceholder}></span>
                    )}
                  </div>
                )}

                {/* Right check icon for items with description */}
                {hasDescription && (
                  <div className={styles.menuItemIconWrapper}>
                    {isSelected ? (
                      <i className={`la la-check ${styles.checkIcon}`}></i>
                    ) : (
                      <span className={styles.checkIconPlaceholder}></span>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}