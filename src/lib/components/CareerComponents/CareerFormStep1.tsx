"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "@/../public/philippines-locations.json";
import { useAppContext } from "@/lib/context/AppContext";
import styles from "@/lib/styles/screens/careerFormStep1.module.scss";

// Member interface based on schema
interface Member {
  _id?: string;
  name: string;
  email: string;
  image: string;
  orgID?: string;
  role: "Job Owner" | "Contributor" | "Reviewer";
  careers?: string[];
  addedAt?: Date;
  lastLogin?: Date | null;
  status?: string;
}

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
  const { user, orgID } = useAppContext();
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teamAccess, setTeamAccess] = useState<Member[]>([]);
  const [orgMembers, setOrgMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Currency configuration
  const currencyConfig = {
    PHP: { symbol: "₱", code: "PHP" },
    USD: { symbol: "$", code: "USD" },
  };
  const currentCurrency = currencyConfig[formData.currency as keyof typeof currencyConfig] || currencyConfig.PHP;

  // Initialize team access with current user or from formData
  useEffect(() => {
    if (formData.teamAccess && formData.teamAccess.length > 0) {
      // Load existing team access from formData
      setTeamAccess(formData.teamAccess);
    } else if (user && teamAccess.length === 0) {
      // Initialize with current user as Job Owner
      const initialMember: Member = {
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
        role: "Job Owner",
      };
      setTeamAccess([initialMember]);
    }
  }, [user, formData.teamAccess]);

  // Sync teamAccess with parent formData
  useEffect(() => {
    if (teamAccess.length > 0) {
      updateFormData({ teamAccess });
    }
  }, [teamAccess, updateFormData]);

  // Fetch organization members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!orgID) return;

      setLoadingMembers(true);
      try {
        const response = await axios.post("/api/fetch-members", {
          orgID: orgID,
        });
        setOrgMembers(response.data);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [orgID]);

  useEffect(() => {
    const parseProvinces = () => {
      setProvinceList(philippineCitiesAndProvinces.provinces);

      // Only set city list if province is already selected
      if (formData.province) {
        const provinceObj = philippineCitiesAndProvinces.provinces.find(
          (p: any) => p.name === formData.province
        );
        if (provinceObj) {
          const cities = philippineCitiesAndProvinces.cities.filter(
            (city: any) => city.province === provinceObj.key
          );
          setCityList(cities);
        }
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

  // Member management functions
  const addMember = (memberEmail: string) => {
    const member = orgMembers.find((m) => m.email === memberEmail);
    if (!member) return;

    // Check if member is already added
    if (teamAccess.some((m) => m.email === memberEmail)) {
      return;
    }

    const newMember: Member = {
      ...member,
      role: "Contributor", // Default role for new members
    };

    setTeamAccess([...teamAccess, newMember]);
  };

  const removeMember = (email: string) => {
    // Prevent removing if only one member left
    if (teamAccess.length <= 1) return;

    setTeamAccess(teamAccess.filter((m) => m.email !== email));
  };

  const updateMemberRole = (email: string, role: Member["role"]) => {
    setTeamAccess(
      teamAccess.map((m) => (m.email === email ? { ...m, role } : m))
    );
  };

  // Check if at least one Job Owner exists
  const hasJobOwner = () => {
    return teamAccess.some((m) => m.role === "Job Owner");
  };

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
        if (!value || value.toString().trim().length === 0) {
          return "Minimum salary is required";
        }
        if (Number(value) <= 0) {
          return "Minimum salary must be greater than 0";
        }
        if (
          formData.minimumSalary &&
          formData.maximumSalary &&
          Number(formData.minimumSalary) > Number(formData.maximumSalary)
        ) {
          return "Minimum salary cannot be greater than maximum salary";
        }
        return "";
      case "maximumSalary":
        if (!value || value.toString().trim().length === 0) {
          return "Maximum salary is required";
        }
        if (Number(value) <= 0) {
          return "Maximum salary must be greater than 0";
        }
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

    // At least one Job Owner required
    if (!hasJobOwner() && touched.teamAccess) {
      newErrors.teamAccess = "At least one member must have the Job Owner role";
    }

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
      formData.minimumSalary &&
      Number(formData.minimumSalary) > 0 &&
      formData.maximumSalary &&
      Number(formData.maximumSalary) > 0 &&
      Number(formData.minimumSalary) <= Number(formData.maximumSalary) &&
      teamAccess.length >= 1 &&
      hasJobOwner()
    );
  };

  return (
    <div className={styles.container}>
      {/* Form Content */}
      <div className={styles.formContent}>
        {/* 1. Career Information */}
        <div className="layered-card-middle">
          {/* Title */}
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>1. Career Information</h1>
          </div>

          <div className="layered-card-content">
            {/* Content */}
            <div className={styles.fieldWrapper}>
              {/* Basic Information */}
              <h2 className={styles.inputTitle}>Basic Information</h2>
              <label className={styles.label}>Job Title</label>
              <div className={styles.inputWrapper}>
                <input
                  value={formData.jobTitle || ""}
                  className={`form-control ${errors.jobTitle ? styles.inputError : styles.noJobTitleError}`}
                  placeholder="Enter job title"
                  onChange={(e) => {
                    updateFormData({ jobTitle: e.target.value || "" });
                  }}
                />
                {errors.jobTitle && (
                  <i className={`la la-exclamation-circle ${styles.warningIcon}`}></i>
                )}
              </div>
              {errors.jobTitle && (
                <p className={styles.errorText}>
                  {errors.jobTitle}
                </p>
              )}
            </div>

            {/* Work Setting */}
            <div className={styles.fieldWrapper}>
              <h2 className={styles.inputTitle}>Work Setting</h2>
              <div className={styles.gridTwoColumn}>
                <div>
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
                <div>
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

            {/* Location */}
            <div className={styles.fieldWrapper}>
              <h2 className={styles.inputTitle}>Location</h2>
              <div className={styles.locationGrid}>
                {/* Country */}
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

                {/* State / Province */}
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

                {/* City */}
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

            {/* Salary */}
            <div className="fieldWrapper">
              {/* Header */}
              <div className={styles.salaryHeader}>
                <h2 className={styles.inputTitle}>Salary</h2>
                <div className={styles.toggleContainer}>
                  <label className="switch" style={{ margin: 0 }}>
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

              {/* Inputs */}
              <div className={styles.gridTwoColumn}>
                {/* Minimum Salary */}
                <div>
                  <label className={styles.label}>
                    Minimum Salary
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencySymbol}>
                      {currentCurrency.symbol}
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
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, minimumSalary: true }));
                      }}
                    />
                    {errors.minimumSalary && (
                      <i className={`la la-exclamation-circle ${styles.warningIconSalary}`}></i>
                    )}
                    <button
                      type="button"
                      className={styles.currencyToggle}
                      onClick={() => {
                        const newCurrency = formData.currency === "USD" ? "PHP" : "USD";
                        updateFormData({ currency: newCurrency });
                      }}
                    >
                      <span>{currentCurrency.code}</span>
                      <i className="la la-angle-down"></i>
                    </button>
                  </div>
                  {errors.minimumSalary && (
                    <p className={styles.errorText}>
                      {errors.minimumSalary}
                    </p>
                  )}
                </div>

                {/* Maximum Salary */}
                <div>
                  <label className={styles.label}>
                    Maximum Salary
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencySymbol}>
                      {currentCurrency.symbol}
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
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, maximumSalary: true }));
                      }}
                    />
                    {errors.maximumSalary && (
                      <i className={`la la-exclamation-circle ${styles.warningIconSalary}`}></i>
                    )}
                    <button
                      type="button"
                      className={styles.currencyToggle}
                      onClick={() => {
                        const newCurrency = formData.currency === "USD" ? "PHP" : "USD";
                        updateFormData({ currency: newCurrency });
                      }}
                    >
                      <span>{currentCurrency.code}</span>
                      <i className="la la-angle-down"></i>
                    </button>
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

        {/* 2. Job Description */}
        <div className="layered-card-middle">
          {/* Title */}
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>2. Job Description</h1>
          </div>

          {/* Content */}
          <div className="layered-card-content">
            <div className={styles.fieldWrapper}>
              <label className={styles.label}>
                Description
              </label>
              <div className={`${styles.descEditor} ${errors.description ? styles.editorError : ''}`}>
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

        {/* 3. Team Access */}
        <div className="layered-card-middle">
          {/* Title */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              3. Team Access
            </h2>
          </div>

          {/* Content */}
          <div className="layered-card-content">
            <div className={styles.teamAccessContainer}>
              {/* Add Members Section */}
              <div className={styles.addMembersSection}>
                <div className={styles.addMembersHeader}>
                  <h3 className={styles.addMembersTitle}>Add more members</h3>
                  <p className={styles.addMembersDescription}>
                    You can add other members to collaborate on this career.
                  </p>
                </div>
                <CustomDropdown
                  onSelectSetting={(memberEmail: string) => {
                    addMember(memberEmail);
                    setTouched((prev) => ({ ...prev, teamAccess: true }));
                  }}
                  screeningSetting=""

                  // Filter org members who are not yet in teamAcess.
                  // Formatted with name (email) and description (full name)
                  settingList={orgMembers
                    .filter((m) => !teamAccess.some((t) => t.email === m.email))
                    .map((m) => ({ name: m.email, description: m.name }))}
                  placeholder={loadingMembers ? "Loading members..." : "Add member"}
                />
              </div>

              {/* Team Access */}
              <div className={styles.membersList}>
                {/* Error message */}
                {errors.teamAccess && (
                  <div className={styles.membersMessageText}>
                    <img src="/career-form/warning-step-icon.svg" alt="Warning step"></img>
                    <p className={styles.errorText}>
                      {errors.teamAccess}
                    </p>
                  </div>
                )}

                {teamAccess.map((member, index) => (
                  <div key={member.email} className={styles.memberRow}>
                    <div className={styles.memberDetails}>
                      <img
                        src={member.image}
                        alt={member.name}
                        className={styles.memberAvatar}
                      />
                      <div className={styles.memberInfo}>
                        <p className={styles.memberName}>
                          {member.name}
                          {member.email === user?.email && (
                            <span className={styles.youBadge}> (You)</span>
                          )}
                        </p>
                        <p className={styles.memberEmail}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className={styles.memberActions}>
                      <div className={styles.roleSelector}>
                        <CustomDropdown
                          onSelectSetting={(role: string) => {
                            updateMemberRole(member.email, role as Member["role"]);
                            setTouched((prev) => ({ ...prev, teamAccess: true }));
                          }}
                          screeningSetting={member.role}
                          settingList={[
                            {
                              name: "Job Owner",
                              description: "Leads the hiring process for assigned jobs. Has access with all career settings."
                            },
                            {
                              name: "Contributor",
                              description: "Helps evaluate candidates and assist with hiring tasks. Can move candidates throughout the pipeline, but cannot change any career settings."
                            },
                            {
                              name: "Reviewer",
                              description: "Reviews candidates and provides feedback. Can only view candidate profiles and comment."
                            }
                          ]}
                          placeholder="Select role"
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => {
                          removeMember(member.email);
                          setTouched((prev) => ({ ...prev, teamAccess: true }));
                        }}
                        disabled={teamAccess.length <= 1}
                        style={{
                          opacity: teamAccess.length <= 1 ? 0.5 : 1,
                          cursor: teamAccess.length <= 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        <i className="la la-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <p className={styles.disclaimer}>
                *Admins can view all careers regardless of specific access settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className={styles.sidebarTips}>
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
  );
}
