"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/lib/styles/screens/salaryInput.module.scss";

interface SalaryInputProps {
  value?: string;
  currency?: string;
  placeholder?: string;
  onValueChange?(value: string): void;
  onCurrencyChange?(currency: string): void;
  disabled?: boolean;
}

export default function SalaryInput({
  value = "",
  currency = "PHP",
  placeholder = "0",
  onValueChange,
  onCurrencyChange,
  disabled = false,
}: SalaryInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currencies = ["PHP", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD"];
  
  const currencySymbols: { [key: string]: string } = {
    PHP: "₱",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
  };

  const handleCurrencySelect = (selectedCurrency: string) => {
    onCurrencyChange?.(selectedCurrency);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(inputValue) || inputValue === "") {
      onValueChange?.(inputValue);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.salaryInputContainer}>
      <div className={styles.salaryInput}>
        <span className={styles.currencySymbol}>
          {currencySymbols[currency] || currency}
        </span><input
          type="text"
          className={styles.amountInput}
          value={value}
          placeholder={placeholder}
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className={styles.currencyDropdown} ref={dropdownRef}>
          <button
            type="button"
            className={`${styles.dropdownButton} ${disabled ? styles.disabled : ""}`}
            onClick={handleToggle}
            disabled={disabled}
          >
            <span className={styles.currencyCode}>{currency}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
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
              {currencies.map((curr) => (
                <div
                  key={curr}
                  className={`${styles.dropdownItem} ${
                    curr === currency ? styles.selected : ""
                  }`}
                  onClick={() => handleCurrencySelect(curr)}
                >
                  <span className={styles.currencySymbolInMenu}>
                    {currencySymbols[curr]}
                  </span>
                  <span>{curr}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
