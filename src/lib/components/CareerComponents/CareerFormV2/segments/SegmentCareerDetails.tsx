"use client";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import philippineCitiesAndProvinces from "../../../../../../public/philippines-locations.json";

const employmentTypeOptions = [
  {
    name: "Full-Time",
  },
  {
    name: "Part-Time",
  },
];

const workSetupOptions = [
  {
    name: "Fully Remote",
  },
  {
    name: "Onsite",
  },
  {
    name: "Hybrid",
  },
];

interface SegmentCareerDetailsProps {
  jobTitle: string;
  setJobTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  workSetup: string;
  setWorkSetup: (value: string) => void;
  employmentType: string;
  setEmploymentType: (value: string) => void;
  salaryNegotiable: boolean;
  setSalaryNegotiable: (value: boolean) => void;
  minimumSalary: string;
  setMinimumSalary: (value: string) => void;
  maximumSalary: string;
  setMaximumSalary: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  province: string;
  setProvince: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  provinceList: any[];
  cityList: any[];
  setCityList: (cities: any[]) => void;
}

export default function SegmentCareerDetails({
  jobTitle,
  setJobTitle,
  description,
  setDescription,
  workSetup,
  setWorkSetup,
  employmentType,
  setEmploymentType,
  salaryNegotiable,
  setSalaryNegotiable,
  minimumSalary,
  setMinimumSalary,
  maximumSalary,
  setMaximumSalary,
  country,
  setCountry,
  province,
  setProvince,
  city,
  setCity,
  provinceList,
  cityList,
  setCityList,
}: SegmentCareerDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Career Information Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Career Information Card */}
        <div>
          <div className="layered-card-middle bg-#F8F9FC">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: "#181D27",
                  fontWeight: 700,
                  marginLeft: 16,
                  paddingTop: 8,
                }}
              >
                1. Career Information
              </span>
            </div>
            <div className="layered-card-content" style={{ fontSize: 14 }}>
              <span style={{ color: "#181D27", fontWeight: "700" }}>
                Basic Information
              </span>
              <span>
                Job Title <span style={{ color: "#EF4444" }}>*</span>
              </span>
              <input
                value={jobTitle}
                className="form-control"
                placeholder="Enter job title"
                onChange={(e) => setJobTitle(e.target.value || "")}
              />
              <span
                style={{ color: "#181D27", fontWeight: 700, marginTop: 16 }}
              >
                Work Setting
              </span>
              <span>Employment Type</span>
              <CustomDropdown
                onSelectSetting={(employmentType) =>
                  setEmploymentType(employmentType)
                }
                screeningSetting={employmentType}
                settingList={employmentTypeOptions}
                placeholder="Choose employment type"
              />

              <span>
                Arrangement <span style={{ color: "#EF4444" }}>*</span>
              </span>
              <CustomDropdown
                onSelectSetting={(setting) => setWorkSetup(setting)}
                screeningSetting={workSetup}
                settingList={workSetupOptions}
                placeholder="Choose work arrangement"
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ color: "#181D27", fontWeight: 700, marginTop: 16 }}
                >
                  Salary
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 8,
                    minWidth: "130px",
                    marginTop: 16,
                  }}
                >
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={salaryNegotiable}
                      onChange={() => setSalaryNegotiable(!salaryNegotiable)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span>{salaryNegotiable ? "Negotiable" : "Fixed"}</span>
                </div>
              </div>

              <span>Minimum Salary</span>
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
                  value={minimumSalary}
                  onChange={(e) => setMinimumSalary(e.target.value || "")}
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

              <span>Maximum Salary</span>
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
                  value={maximumSalary}
                  onChange={(e) => setMaximumSalary(e.target.value || "")}
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

              <span
                style={{
                  color: "#181D27",
                  fontWeight: 700,
                  marginTop: 16,
                }}
              >
                Location
              </span>

              <span>Country</span>
              <CustomDropdown
                onSelectSetting={(setting) => setCountry(setting)}
                screeningSetting={country}
                settingList={[]}
                placeholder="Select Country"
              />

              <span>State / Province</span>
              <CustomDropdown
                onSelectSetting={(selectedProvince) => {
                  setProvince(selectedProvince);
                  const provinceObj = provinceList.find(
                    (p) => p.name === selectedProvince
                  );
                  if (provinceObj) {
                    const cities = philippineCitiesAndProvinces.cities.filter(
                      (city) => city.province === provinceObj.key
                    );
                    setCityList(cities);
                    if (cities.length > 0) {
                      setCity(cities[0].name);
                    } else {
                      setCity("");
                    }
                  }
                }}
                screeningSetting={province}
                settingList={provinceList}
                placeholder="Select State / Province"
              />

              <span>City</span>
              <CustomDropdown
                onSelectSetting={(city) => setCity(city)}
                screeningSetting={city}
                settingList={cityList}
                placeholder="Select City"
              />
            </div>
          </div>
        </div>

        {/* Job Description Card */}
        <div>
          <div className="layered-card-middle bg-#F8F9FC">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: "#181D27",
                  fontWeight: 700,
                  marginLeft: 16,
                  paddingTop: 8,
                }}
              >
                2. Job Description
              </span>
            </div>
            <div className="layered-card-content">
              <RichTextEditor setText={setDescription} text={description} />
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
              <span
                style={{
                  fontSize: 16,
                  color: "#181D27",
                  fontWeight: 700,
                  marginLeft: 16,
                  paddingTop: 8,
                }}
              >
                3. Team Access
              </span>
            </div>
            <div className="layered-card-content">
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
