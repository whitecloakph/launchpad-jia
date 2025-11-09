"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "@/../public/philippines-locations.json";
import { useAppContext } from "@/lib/context/AppContext";
import styles from "@/lib/styles/screens/careerFormStep1.module.scss";

const employmentTypeOptions = [{ name: "Full-Time" }, { name: "Part-Time" }];

const workSetupOptions = [
  { name: "Fully Remote" },
  { name: "Onsite" },
  { name: "Hybrid" },
];

interface CareerFormStep1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void;
  triggerValidation?: boolean;
}

export default function CareerFormStep1({
  formData,
  updateFormData,
  onValidationChange,
  triggerValidation,
}: CareerFormStep1Props) {
  const { user } = useAppContext();
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const parseProvinces = () => {
      setProvinceList(philippineCitiesAndProvinces.provinces);
      const defaultProvince = philippineCitiesAndProvinces.provinces[0];
      if (!formData.province) {
        updateFormData({ province: defaultProvince.name });
      }
      const cities = philippineCitiesAndProvinces.cities.filter(
        (city: any) => city.province === defaultProvince.key
      );
      setCityList(cities);
      if (!formData.city) {
        updateFormData({ city: cities[0].name });
      }
    };
    parseProvinces();
  }, []);

  useEffect(() => {
    // Mark all fields as touched when validation is triggered
    if (triggerValidation) {
      const allTouched: Record<string, boolean> = {};
      [
        "jobTitle",
        "description",
        "employmentType",
        "workSetup",
        "country",
        "province",
        "city",
        "minimumSalary",
        "maximumSalary",
      ].forEach((field) => {
        allTouched[field] = true;
      });
      setTouched(allTouched);
    }
  }, [triggerValidation]);

  useEffect(() => {
    // Only validate if fields have been touched
    if (Object.keys(touched).length > 0) {
      validateAllFields();
      if (onValidationChange) {
        onValidationChange(isStepValid());
      }
    }
  }, [formData, touched]);

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case "jobTitle":
        if (!value || value.trim().length === 0) {
          return "Job title is required";
        }
        return "";
      case "description":
        if (!value || value.trim().length === 0) {
          return "Description is required";
        }
        return "";
      case "employmentType":
        if (!value || value.trim().length === 0) {
          return "Employment type is required";
        }
        return "";
      case "workSetup":
        if (!value || value.trim().length === 0) {
          return "Work arrangement is required";
        }
        return "";
      case "country":
        if (!value || value.trim().length === 0) {
          return "Country is required";
        }
        return "";
      case "province":
        if (!value || value.trim().length === 0) {
          return "State/Province is required";
        }
        return "";
      case "city":
        if (!value || value.trim().length === 0) {
          return "City is required";
        }
        return "";
      case "minimumSalary":
        if (
          formData.minimumSalary &&
          formData.maximumSalary &&
          Number(formData.minimumSalary) > Number(formData.maximumSalary)
        ) {
          return "Minimum salary cannot be greater than maximum salary";
        }
        return "";
      case "maximumSalary":
        if (
          formData.minimumSalary &&
          formData.maximumSalary &&
          Number(formData.minimumSalary) > Number(formData.maximumSalary)
        ) {
          return "Maximum salary cannot be less than minimum salary";
        }
        return "";
      default:
        return "";
    }
  };

  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = [
      "jobTitle",
      "description",
      "employmentType",
      "workSetup",
      "country",
      "province",
      "city",
      "minimumSalary",
      "maximumSalary",
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error && touched[field]) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
  };

  const isStepValid = () => {
    return (
      formData.jobTitle?.trim().length > 0 &&
      formData.description?.trim().length > 0 &&
      formData.employmentType?.trim().length > 0 &&
      formData.workSetup?.trim().length > 0 &&
      formData.country?.trim().length > 0 &&
      formData.province?.trim().length > 0 &&
      formData.city?.trim().length > 0 &&
      !(
        formData.minimumSalary &&
        formData.maximumSalary &&
        Number(formData.minimumSalary) > Number(formData.maximumSalary)
      )
    );
  };

  return (
    <div className={styles.container}>
      {/* Form Content */}
      <div className={styles.formContent}>
        <div className="layered-card-outer">
          <div className="layered-card-middle">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className={styles.sectionBadgeText}>1.</span>
              </div>
              <span className={styles.sectionTitle}>Career Information</span>
            </div>

            <div className="layered-card-content">
              <div className={styles.fieldWrapper}>
                <label className={styles.label}>Job Title</label>
                <div className={styles.inputWrapper}>
                  <input
                    value={formData.jobTitle || ""}
                    className={`form-control ${errors.jobTitle ? styles.inputError : ''}`}
                    placeholder="Enter job title"
                    onChange={(e) => {
                      updateFormData({ jobTitle: e.target.value || "" });
                    }}
                  />
                  {errors.jobTitle && (
                    <img
                      src="/career-form/warning-step-icon.svg"
                      alt="Warning"
                      className={styles.warningIcon}
                    />
                  )}
                </div>
                {errors.jobTitle && (
                  <p className={styles.errorText}>
                    {errors.jobTitle}
                  </p>
                )}
              </div>

              <div className={styles.fieldWrapper}>
                <label className={styles.label}>
                  Description
                </label>
                <div className={errors.description ? styles.editorError : ''}>
                  <RichTextEditor
                    setText={(text: string) =>
                      updateFormData({ description: text })
                    }
                    text={formData.description || ""}
                  />
                </div>
                {errors.description && (
                  <p className={styles.errorText}>
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`layered-card-outer ${styles.cardSpacing}`}>
          <div className="layered-card-middle">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className={styles.sectionBadgeText}>
                  2
                </span>
              </div>
              <span className={styles.sectionTitle}>
                Work Setting
              </span>
            </div>

            <div className="layered-card-content">
              <div className={styles.fieldWrapper}>
                <label className={styles.label}>
                  Employment Type
                </label>
                <CustomDropdown
                  onSelectSetting={(employmentType: string) => {
                    updateFormData({ employmentType });
                  }}
                  screeningSetting={formData.employmentType || ""}
                  settingList={employmentTypeOptions}
                  placeholder="Choose employment type"
                  hasError={!!errors.employmentType}
                />
                {errors.employmentType && (
                  <p className={styles.errorText}>
                    {errors.employmentType}
                  </p>
                )}
              </div>

              <div className={styles.fieldWrapper}>
                <label className={styles.label}>
                  Arrangement
                </label>
                <CustomDropdown
                  onSelectSetting={(setting: string) => {
                    updateFormData({ workSetup: setting });
                  }}
                  screeningSetting={formData.workSetup || ""}
                  settingList={workSetupOptions}
                  placeholder="Choose work arrangement"
                  hasError={!!errors.workSetup}
                />
                {errors.workSetup && (
                  <p className={styles.errorText}>
                    {errors.workSetup}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`layered-card-outer ${styles.cardSpacing}`}>
          <div className="layered-card-middle">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className={styles.sectionBadgeText}>
                  3
                </span>
              </div>
              <span className={styles.sectionTitle}>
                Location
              </span>
            </div>

            <div className="layered-card-content">
              <div className={styles.gridThreeColumn}>
                <div>
                  <label className={styles.label}>
                    Country
                  </label>
                  <CustomDropdown
                    onSelectSetting={(setting: string) => {
                      updateFormData({ country: setting });
                    }}
                    screeningSetting={formData.country || "Philippines"}
                    settingList={[{ name: "Philippines" }]}
                    placeholder="Choose state / province"
                  />
                </div>

                <div>
                  <label className={styles.label}>
                    State / Province
                  </label>
                  <CustomDropdown
                    onSelectSetting={(province: string) => {
                      updateFormData({ province });
                      const provinceObj: any = provinceList.find(
                        (p: any) => p.name === province
                      );
                      const cities = philippineCitiesAndProvinces.cities.filter(
                        (city: any) => city.province === provinceObj.key
                      );
                      setCityList(cities);
                      updateFormData({ city: cities[0].name });
                    }}
                    screeningSetting={formData.province || ""}
                    settingList={provinceList}
                    placeholder="Choose state / province"
                    hasError={!!errors.province}
                  />
                  {errors.province && (
                    <p className={styles.errorText}>
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label className={styles.label}>
                    City
                  </label>
                  <CustomDropdown
                    onSelectSetting={(city: string) => {
                      updateFormData({ city });
                    }}
                    screeningSetting={formData.city || ""}
                    settingList={cityList}
                    placeholder="Choose city"
                    hasError={!!errors.city}
                  />
                  {errors.city && (
                    <p className={styles.errorText}>
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`layered-card-outer ${styles.cardSpacing}`}>
          <div className="layered-card-middle">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className={styles.sectionBadgeText}>
                  4
                </span>
              </div>
              <span className={styles.sectionTitle}>
                Salary
              </span>
              <div className={styles.toggleContainer}>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.salaryNegotiable !== false}
                    onChange={() =>
                      updateFormData({
                        salaryNegotiable: !formData.salaryNegotiable,
                      })
                    }
                  />
                  <span className="slider round"></span>
                </label>
                <span className={styles.toggleLabel}>
                  {formData.salaryNegotiable !== false ? "Negotiable" : "Fixed"}
                </span>
              </div>
            </div>

            <div className="layered-card-content">
              <div className={styles.gridTwoColumn}>
                <div>
                  <label className={styles.label}>
                    Minimum Salary
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencySymbol}>
                      ₱
                    </span>
                    <input
                      type="number"
                      className={`form-control ${styles.salaryInput} ${errors.minimumSalary ? styles.salaryInputError : styles.salaryInputNoError}`}
                      placeholder="0"
                      min={0}
                      value={formData.minimumSalary || ""}
                      onChange={(e) => {
                        updateFormData({ minimumSalary: e.target.value || "" });
                      }}
                    />
                    {errors.minimumSalary && (
                      <img
                        src="/career-form/warning-step-icon.svg"
                        alt="Warning"
                        className={styles.warningIconSalary}
                      />
                    )}
                    <span className={styles.currencyCode}>
                      PHP
                    </span>
                  </div>
                  {errors.minimumSalary && (
                    <p className={styles.errorText}>
                      {errors.minimumSalary}
                    </p>
                  )}
                </div>

                <div>
                  <label className={styles.label}>
                    Maximum Salary
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencySymbol}>
                      ₱
                    </span>
                    <input
                      type="number"
                      className={`form-control ${styles.salaryInput} ${errors.maximumSalary ? styles.salaryInputError : styles.salaryInputNoError}`}
                      placeholder="0"
                      min={0}
                      value={formData.maximumSalary || ""}
                      onChange={(e) => {
                        updateFormData({ maximumSalary: e.target.value || "" });
                      }}
                    />
                    {errors.maximumSalary && (
                      <img
                        src="/career-form/warning-step-icon.svg"
                        alt="Warning"
                        className={styles.warningIconSalary}
                      />
                    )}
                    <span className={styles.currencyCode}>
                      PHP
                    </span>
                  </div>
                  {errors.maximumSalary && (
                    <p className={styles.errorText}>
                      {errors.maximumSalary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`layered-card-outer ${styles.cardSpacing}`}>
          <div className="layered-card-middle">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className={styles.sectionBadgeText}>
                  5
                </span>
              </div>
              <span className={styles.sectionTitle}>
                Team Access
              </span>
            </div>

            <div className="layered-card-content">
              <div className={styles.fieldWrapper}>
                <label className={styles.label}>
                  Add more members
                </label>
                <p className={styles.description}>
                  You can add other members to collaborate on this career.
                </p>
                <CustomDropdown
                  onSelectSetting={(member: string) => {
                    // This would require integrating with members API
                    console.log("Add member:", member);
                  }}
                  screeningSetting=""
                  settingList={[]}
                  placeholder="Add member"
                />
              </div>

              <div className={styles.memberCard}>
                <img
                  src={user?.image}
                  alt={user?.name}
                  className={styles.memberAvatar}
                />
                <div className={styles.memberInfo}>
                  <p className={styles.memberName}>
                    {user?.name} (You)
                  </p>
                  <p className={styles.memberEmail}>
                    {user?.email}
                  </p>
                </div>
                <div className={styles.roleBadge}>
                  Job Owner
                </div>
              </div>

              <p className={styles.disclaimer}>
                *Admins can view all careers regardless of specific access
                settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className={styles.sidebarTips}>
        <div className="layered-card-outer">
          <div className="layered-card-middle">
            <div className={styles.tipsHeader}>
              <img src="/career-form/tips.svg" alt="Tips Icon" />
              <h3 className={styles.tipsTitle}>
                Tips
              </h3>
            </div>

            <div className="layered-card-content">
              <div className={styles.tipsContent}>
                <p className={styles.tipsParagraph}>
                  <strong className={styles.tipsStrong}>
                    Use clear, standard job titles
                  </strong>{" "}
                  for better searchability (e.g., "Software Engineer",
                  "Marketing Manager" instead of "Tech Rockstar").
                </p>
                <p className={styles.tipsParagraph}>
                  <strong className={styles.tipsStrong}>
                    Avoid abbreviations
                  </strong>{" "}
                  of your role unless it's standard "aka" form (e.g., use
                  "Quality Assurance" instead of "QA IT" or "QA LT").
                </p>
                <p className={styles.tipsParagraph}>
                  <strong className={styles.tipsStrong}>
                    Keep job titles concise
                  </strong>{" "}
                  - try to use no more than a few words (2-4 max), avoiding
                  fluff or marketing terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
