"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { useAppContext } from "@/lib/context/AppContext";

const employmentTypeOptions = [
  { name: "Full-Time" },
  { name: "Part-Time" },
];

const workSetupOptions = [
  { name: "Fully Remote" },
  { name: "Onsite" },
  { name: "Hybrid" },
];

interface CareerFormStep1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

export default function CareerFormStep1({
  formData,
  updateFormData,
  onNext,
}: CareerFormStep1Props) {
  const { user } = useAppContext();
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);

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

  const isStepValid = () => {
    return (
      formData.jobTitle?.trim().length > 0 &&
      formData.description?.trim().length > 0 &&
      formData.employmentType?.trim().length > 0 &&
      formData.workSetup?.trim().length > 0 &&
      formData.country?.trim().length > 0 &&
      formData.province?.trim().length > 0 &&
      formData.city?.trim().length > 0
    );
  };

  const validateSalary = () => {
    if (
      Number(formData.minimumSalary) &&
      Number(formData.maximumSalary) &&
      Number(formData.minimumSalary) > Number(formData.maximumSalary)
    ) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateSalary()) {
      alert("Minimum salary cannot be greater than maximum salary");
      return;
    }
    if (isStepValid()) {
      onNext();
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "24px" }}>
      {/* Form Content */}
      <div style={{ flex: 1 }}>
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
              <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 600 }}>
                1
              </span>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Career Information
            </span>
          </div>

          <div className="layered-card-content">
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Job Title
              </label>
              <input
                value={formData.jobTitle || ""}
                className="form-control"
                placeholder="Enter job title"
                onChange={(e) => {
                  updateFormData({ jobTitle: e.target.value || "" });
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Description
              </label>
              <RichTextEditor
                setText={(text: string) => updateFormData({ description: text })}
                text={formData.description || ""}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="layered-card-outer"
        style={{ marginTop: 16 }}
      >
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
              <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 600 }}>
                2
              </span>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Work Setting
            </span>
          </div>

          <div className="layered-card-content">
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Employment Type
              </label>
              <CustomDropdown
                onSelectSetting={(employmentType: string) => {
                  updateFormData({ employmentType });
                }}
                screeningSetting={formData.employmentType || ""}
                settingList={employmentTypeOptions}
                placeholder="Choose employment type"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Arrangement
              </label>
              <CustomDropdown
                onSelectSetting={(setting: string) => {
                  updateFormData({ workSetup: setting });
                }}
                screeningSetting={formData.workSetup || ""}
                settingList={workSetupOptions}
                placeholder="Choose work arrangement"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="layered-card-outer"
        style={{ marginTop: 16 }}
      >
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
              <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 600 }}>
                3
              </span>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Location
            </span>
          </div>

          <div className="layered-card-content">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
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
                <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
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
                />
              </div>

              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                  City
                </label>
                <CustomDropdown
                  onSelectSetting={(city: string) => {
                    updateFormData({ city });
                  }}
                  screeningSetting={formData.city || ""}
                  settingList={cityList}
                  placeholder="Choose city"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="layered-card-outer"
        style={{ marginTop: 16 }}
      >
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
              <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 600 }}>
                4
              </span>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Salary
            </span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.salaryNegotiable !== false}
                  onChange={() =>
                    updateFormData({ salaryNegotiable: !formData.salaryNegotiable })
                  }
                />
                <span className="slider round"></span>
              </label>
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {formData.salaryNegotiable !== false ? "Negotiable" : "Fixed"}
              </span>
            </div>
          </div>

          <div className="layered-card-content">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                  Minimum Salary
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      fontSize: "16px",
                      pointerEvents: "none",
                    }}
                  >
                    P
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    style={{ paddingLeft: "28px" }}
                    placeholder="0"
                    min={0}
                    value={formData.minimumSalary || ""}
                    onChange={(e) => {
                      updateFormData({ minimumSalary: e.target.value || "" });
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "30px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      fontSize: "16px",
                      pointerEvents: "none",
                    }}
                  >
                    PHP
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                  Maximum Salary
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      fontSize: "16px",
                      pointerEvents: "none",
                    }}
                  >
                    P
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    style={{ paddingLeft: "28px" }}
                    placeholder="0"
                    min={0}
                    value={formData.maximumSalary || ""}
                    onChange={(e) => {
                      updateFormData({ maximumSalary: e.target.value || "" });
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "30px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                      fontSize: "16px",
                      pointerEvents: "none",
                    }}
                  >
                    PHP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="layered-card-outer"
        style={{ marginTop: 16 }}
      >
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
              <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 600 }}>
                5
              </span>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Team Access
            </span>
          </div>

          <div className="layered-card-content">
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                Add more members
              </label>
              <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
              }}
            >
              <img
                src={user?.image || "/profile-placeholder.png"}
                alt={user?.name}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                  {user?.name} (You)
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                  {user?.email}
                </p>
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Job Owner
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12, marginBottom: 0 }}>
              *Admins can view all careers regardless of specific access settings.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 32,
          gap: 12,
        }}
      >
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

      {/* Tips Section */}
      <div style={{ width: "300px", flexShrink: 0 }}>
        <div style={{
          padding: "20px",
          backgroundColor: "#F9FAFB",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}>
            <i className="la la-lightbulb" style={{ fontSize: "20px", color: "#181D27" }}></i>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#181D27" }}>
              Tips
            </h3>
          </div>

          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#6B7280" }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>Use clear, standard job titles</strong> for better searchability (e.g., "Software Engineer", "Marketing Manager" instead of "Tech Rockstar").
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Avoid abbreviations</strong> of your role unless it's standard "aka" form (e.g., use "Quality Assurance" instead of "QA IT" or "QA LT").
            </p>
            <p style={{ marginBottom: "0" }}>
              <strong>Keep job titles concise</strong> - try to use no more than a few words (2-4 max), avoiding fluff or marketing terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
