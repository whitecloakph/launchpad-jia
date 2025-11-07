import { useCareerForm } from "@/lib/context/CareerFormContext";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../../public/philippines-locations.json";
import { useEffect, useState } from "react";

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

const employmentTypeOptions = [
    {
        name: "Full-Time",
    },
    {
        name: "Part-Time",
    },
];
export default function CareerDetails() {
    const { careerData, updateCareerData, setCareerData } = useCareerForm();
    const [provinces, setProvinceList] = useState([]);
    const [cities, setCityList] = useState([]);

    const parseProvinces = () => {
        setProvinceList(philippineCitiesAndProvinces.provinces);
        const defaultProvince = philippineCitiesAndProvinces.provinces[0];
        if (!careerData.province) {
            setCareerData({ ...careerData, province: defaultProvince.name });
        }
        const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === defaultProvince.key);
        setCityList(cities);
        if (!careerData.location) {
            setCareerData({ ...careerData, location: cities[0].name });
        }
    }

    useEffect(() => {
        parseProvinces();
    }, [careerData]);
    

    useEffect(() => {
        console.log(careerData);
    }, [careerData]);

    return (
        <div>
            <div className="layered-card-outer">
                
                <div className="layered-card-middle">
                    <h2>1. Job Details</h2>
                    <div className="layered-card-content">
                        <h4>Job Title</h4>
                        <input
                            value={careerData.jobTitle}
                            className="form-control"
                            placeholder="Enter job title"
                            onChange={(e) => updateCareerData({ ...careerData, jobTitle: e.target.value })}
                            />
                        {/* flex row */}
                        <h3>Work Setting</h3>
                        <div className="work-setting" style={{ display: "flex", flexDirection: "row" }}>
                            
                            <h4>Employment Type</h4>
                            <CustomDropdown
                                onSelectSetting={(v) => updateCareerData({ ...careerData, employmentType: v })}
                                placeholder="Choose employment type"
                                screeningSetting={careerData.employmentType}
                                settingList={employmentTypeOptions}
                            />
                            <h4>Arrangemet</h4>
                            <CustomDropdown
                                onSelectSetting={(v) => updateCareerData({ ...careerData, workSetup: v })}
                                placeholder="Choose work arrangement"
                                screeningSetting={careerData.workSetup}
                                settingList={workSetupOptions}
                            />
                        </div>

                        <h3>Location</h3>
                        <div className="work-setting" style={{ display: "flex", flexDirection: "row" }}>
                            <h4>Province</h4>
                            <CustomDropdown
                                onSelectSetting={(v) => updateCareerData({ ...careerData, province: v })}
                                placeholder="Choose province"
                                screeningSetting={careerData.province}
                                settingList={provinces}
                            />
                            <h4>City</h4>
                            <CustomDropdown
                                onSelectSetting={(v) => updateCareerData({ ...careerData, location: v })}
                                placeholder="Choose city"
                                screeningSetting={careerData.location}
                                settingList={cities}
                            />
                        </div>
                        
                        <h3>Salary</h3>
                        <div>
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
                                value={careerData.minimumSalary}
                                onChange={(e) => {
                                    updateCareerData({ ...careerData, minimumSalary: e.target.value });
                                }}
                                />
                            <span style={{
                                position: "absolute",
                                right: "30px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#6c757d",
                                fontSize: "16px",
                                pointerEvents: "none",
                            }}>
                                PHP
                            </span>
                      </div>
                            <div>
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
                                value={careerData.maximumSalary}
                                onChange={(e) => {
                                    updateCareerData({ ...careerData, maximumSalary: e.target.value });
                                }}
                                />
                            <span style={{
                                position: "absolute",
                                right: "30px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#6c757d",
                                fontSize: "16px",
                                pointerEvents: "none",
                            }}>
                                PHP
                            </span>
                      </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                    <h2>2. Job Description</h2>
                    <div className="layered-card-content">
                        <RichTextEditor
                            setText={(value) => {
                                updateCareerData({ ...careerData, description: value })
                            }}
                            text={careerData.description}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}