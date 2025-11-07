"use client";

import { useState } from "react";
import styles from "../../styles/commonV2/dropdownV2.module.scss";

interface DropdownProps {
  value?: string;
  placeholder?: string;
  options: string[];
  onValueChange(value: string): void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function CustomDropdownV2({
  value,
  placeholder = "Select an option",
  options,
  onValueChange,
  disabled = false,
  fullWidth = true,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onValueChange?.(option);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`${styles.dropdownContainer} ${fullWidth ? styles.fullWidth : styles.fit}`}>
      <button
        type="button"
        className={`${styles.dropdownButton} ${isOpen ? styles.open : ""} ${
          disabled ? styles.disabled : ""
        }`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.chevron}
        >
          <path
            d="M5 7.85693L10 12.8569L15 7.85693"
            stroke="#717680"
            strokeWidth="1.67"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <div
              key={index}
              className={`${styles.dropdownItem} ${
                option === value ? styles.selected : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
