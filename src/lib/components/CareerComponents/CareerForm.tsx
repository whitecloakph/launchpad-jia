"use client"

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import { assetConstants } from "@/lib/utils/constantsV2";
// Setting List icons
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

export default function CareerForm({ career, formType, setShowEditModal }: { career?: any, formType: string, setShowEditModal?: (show: boolean) => void }) {
  const { user, orgID } = useAppContext();
  const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
  const [description, setDescription] = useState(career?.description || "");
  const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
  const [workSetupRemarks, setWorkSetupRemarks] = useState(career?.workSetupRemarks || "");
  const [screeningSetting, setScreeningSetting] = useState(career?.screeningSetting || "Good Fit and above");
  const [employmentType, setEmploymentType] = useState(career?.employmentType || "Full-Time");
  const [requireVideo, setRequireVideo] = useState(career?.requireVideo || true);
  const [salaryNegotiable, setSalaryNegotiable] = useState(career?.salaryNegotiable || true);
  const [minimumSalary, setMinimumSalary] = useState(career?.minimumSalary || "");
  const [maximumSalary, setMaximumSalary] = useState(career?.maximumSalary || "");
  const [questions, setQuestions] = useState(career?.questions || [
    {
      id: 1,
      category: "CV Validation / Experience",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 2,
      category: "Technical",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 3,
      category: "Behavioral",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 4,
      category: "Analytical",
      questionCountToAsk: null,
      questions: [],
    },
    {
      id: 5,
      category: "Others",
      questionCountToAsk: null,
      questions: [],
    },
  ]);
  const [country, setCountry] = useState(career?.country || "Philippines");
  const [province, setProvince] = useState(career?.province || "");
  const [city, setCity] = useState(career?.location || "");
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState("");
  const [isSavingCareer, setIsSavingCareer] = useState(false);
  const savingCareerRef = useRef(false);

  // Stepper state
  const steps = ["Career Details & Team Access", "CV Review", "AI Interview", "Pipeline", "Review"];
  const stepIcons = ["la la-briefcase", "la la-clipboard-list", "la la-robot", "la la-filter", "la la-eye"];
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const stepStatus = ["Completed", "Pending", "In Progress"];

  // Team Access state
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([
    {
      _id: user?.uid,
      name: user?.displayName || user?.name,
      email: user?.email,
      image: user?.photoURL || user?.image,
      role: "Job Owner",
      isCurrentUser: true
    }
  ]);

  const isFormValid = () => {
    // For step 1, only require basic fields
    if (currentStep === 0) {
      return jobTitle?.trim().length > 0 && description?.trim().length > 0 && workSetup?.trim().length > 0;
    }
    // For other steps, require all fields including questions
    return jobTitle?.trim().length > 0 && description?.trim().length > 0 && questions.some((q) => q.questions.length > 0) && workSetup?.trim().length > 0;
  }

  // Process step state for stepper
  const processState = (index: number, isAdvance = false) => {
    if (currentStep === index) {
      return isAdvance ? stepStatus[2] : stepStatus[2]; // In Progress
    }
    if (currentStep > index) {
      return stepStatus[0]; // Completed
    }
    return stepStatus[1]; // Pending
  };

  // Ensure current user is in team access
  useEffect(() => {
    if (user && !selectedTeamMembers.some(m => m.email === user.email)) {
      setSelectedTeamMembers([{
        _id: user?.uid,
        name: user?.displayName || user?.name,
        email: user?.email,
        image: user?.photoURL || user?.image,
        role: "Job Owner",
        isCurrentUser: true
      }]);
    }
  }, [user]);

  // Fetch organization members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.post("/api/fetch-members", { orgID });
        setOrgMembers(response.data || []);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    if (orgID) {
      fetchMembers();
    }
  }, [orgID]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMemberDropdown && !target.closest('.member-dropdown-container')) {
        setShowMemberDropdown(false);
      }
      if (openRoleDropdown && !target.closest('.role-dropdown-container')) {
        setOpenRoleDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMemberDropdown, openRoleDropdown]);

  // Role options with descriptions
  const roleOptions = [
    {
      value: "Job Owner",
      label: "Job Owner",
      description: "Leads the hiring process for assigned jobs. Has access with all career settings."
    },
    {
      value: "Contributor",
      label: "Contributor",
      description: "Helps evaluate candidates and assist with hiring tasks. Can move candidates through the pipeline, but cannot change any career settings."
    },
    {
      value: "Reviewer",
      label: "Reviewer",
      description: "Reviews candidates and provides feedback. Can only view candidate profiles and comment."
    }
  ];

  // Filter members for dropdown (exclude already added members)
  const availableMembers = orgMembers.filter(
    (member) => !selectedTeamMembers.some((tm) => tm.email === member.email)
  ).filter((member) => 
    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const addTeamMember = (member: any) => {
    setSelectedTeamMembers([...selectedTeamMembers, { 
      ...member, 
      role: "Contributor",
      isCurrentUser: false 
    }]);
    setShowMemberDropdown(false);
    setMemberSearchQuery("");
  };

  const removeMember = (memberId: string) => {
    const member = selectedTeamMembers.find(m => m._id === memberId);
    if (member?.isCurrentUser) {
      errorToast("You cannot remove yourself from the team", 1300);
      return;
    }
    setSelectedTeamMembers(selectedTeamMembers.filter(m => m._id !== memberId));
  };

  const updateMemberRole = (memberId: string, newRole: string) => {
    setSelectedTeamMembers(selectedTeamMembers.map(member => 
      member._id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const updateCareer = async (status: string) => {
    if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };
    const updatedCareer = {
      _id: career._id,
      jobTitle,
      description,
      workSetup,
      workSetupRemarks,
      questions,
      lastEditedBy: userInfoSlice,
      status,
      updatedAt: Date.now(),
      screeningSetting,
      requireVideo,
      salaryNegotiable,
      minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
      maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
      country,
      province,
      // Backwards compatibility
      location: city,
      employmentType,
    }
    try {
      setIsSavingCareer(true);
      const response = await axios.post("/api/update-career", updatedCareer);
      if (response.status === 200) {
        candidateActionToast(
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career updated</span>
          </div>,
          1300,
          <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
        setTimeout(() => {
          window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
        }, 1300);
      }
    } catch (error) {
      console.error(error);
      errorToast("Failed to update career", 1300);
    } finally {
      setIsSavingCareer(false);
    }
  }


  const confirmSaveCareer = (status: string) => {
    if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }

    setShowSaveModal(status);
  }

  const continueToNextStep = () => {
    // Validate form before proceeding
    if (!isFormValid()) {
      return;
    }

    // Validate salary if provided
    if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  const saveCareer = async (status: string) => {
    setShowSaveModal("");
    if (!status) {
      return;
    }

    if (!savingCareerRef.current) {
      setIsSavingCareer(true);
      savingCareerRef.current = true;
      let userInfoSlice = {
        image: user.image,
        name: user.name,
        email: user.email,
      };
      const career = {
        jobTitle,
        description,
        workSetup,
        workSetupRemarks,
        questions,
        lastEditedBy: userInfoSlice,
        createdBy: userInfoSlice,
        screeningSetting,
        orgID,
        requireVideo,
        salaryNegotiable,
        minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
        maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
        country,
        province,
        // Backwards compatibility
        location: city,
        status,
        employmentType,
      }

      try {

        const response = await axios.post("/api/add-career", career);
        if (response.status === 200) {
          // Move to next step if status is active (Save and Continue)
          if (status === "active") {
            setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
          } else {
            // Show toast and redirect only for Save as Unpublished
            candidateActionToast(
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career saved as unpublished</span>
              </div>,
              1300,
              <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
              window.location.href = `/recruiter-dashboard/careers`;
            }, 1300);
          }
        }
      } catch (error) {
        errorToast("Failed to add career", 1300);
      } finally {
        savingCareerRef.current = false;
        setIsSavingCareer(false);
      }
    }
  }

  useEffect(() => {
    const parseProvinces = () => {
      setProvinceList(philippineCitiesAndProvinces.provinces);
      const defaultProvince = philippineCitiesAndProvinces.provinces[0];
      if (!career?.province) {
        setProvince(defaultProvince.name);
      }
      const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === defaultProvince.key);
      setCityList(cities);
      if (!career?.location) {
        setCity(cities[0].name);
      }
    }
    parseProvinces();
  }, [career])

  return (
    <div className="col">
      {formType === "add" ? (<div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Add new career</h1>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
          <button
            disabled={!isFormValid() || isSavingCareer}
            style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
              confirmSaveCareer("inactive");
            }}>
            Save as Unpublished
          </button>
          <button
            disabled={!isFormValid() || isSavingCareer}
            style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={continueToNextStep}>
            Save and Continue
          </button>
        </div>
      </div>) : (
        <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Edit Career Details</h1>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
            <button
              style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                setShowEditModal?.(false);
              }}>
              Cancel
            </button>
            <button
              disabled={!isFormValid() || isSavingCareer}
              style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
                updateCareer("inactive");
              }}>
              Save Changes as Unpublished
            </button>
            <button
              disabled={!isFormValid() || isSavingCareer}
              style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
                updateCareer("active");
              }}>
              <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
              Save Changes as Published
            </button>
          </div>
        </div>
      )}

      {/* Stepper Progress - UploadCV Style */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {/* Step Icons and Connectors */}
        <div style={{ display: "flex", gap: 32 }}>
          {steps.map((_, index) => (
            <div key={index} style={{ width: index === steps.length - 1 ? "unset" : "100%", maxWidth: index === steps.length - 1 ? "unset" : 300, alignItems: "center", display: "flex", gap: 32 }}>
              <img
                alt=""
                src={assetConstants[
                      processState(index, true)
                        .toLowerCase()
                        .replace(" ", "_")
                    ]}
                style={{ height: 20, width: 20, flexShrink: 0 }}
              />
              {index < steps.length - 1 && (
                <hr
                  style={{
                    height: 6,
                    width: "100%",
                    border: "unset",
                    borderRadius: 10,
                    margin: 0,
                    background:
                      processState(index) === "Completed"
                        ? "linear-gradient(90deg, #fccec0 0%, #ebacc9 33%, #ceb6da 66%, #9fcaed 100%)"
                        : processState(index) === "In Progress"
                        ? "linear-gradient(90deg, #fccec0 0%, #ebacc9 33%, #ceb6da 66%, #9fcaed 100%) 0 0 / 50% 100% no-repeat, #d9d9d9"
                        : "#d9d9d9",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div style={{ display: "flex", gap: 32 }}>
          {steps.map((step, index) => (
            <span
              key={index}
              style={{
                width: index === steps.length - 1 ? "unset" : "100%",
                maxWidth: index === steps.length - 1 ? "unset" : 300,
                fontWeight: 700,
                fontSize: 14,
                lineHeight: "20px",
                color:
                  processState(index, true) === "In Progress"
                    ? "#181d27"
                    : "#a4a7ae",
              }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Step 1: Career Details & Team Access */}
          {currentStep === 0 && (
            <>
          {/* 1. Career Information Card */}
          <div className="layered-card-outer">
            <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>1. Career Information</span>
              </div>
              <div className="layered-card-content">
                {/* Basic Information */}
                <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>Basic Information</span>
                <span>Job Title</span>
                <input
                  value={jobTitle}
                  className="form-control"
                  placeholder="Enter job title"
                  onChange={(e) => {
                    setJobTitle(e.target.value || "");
                  }}
                ></input>

                {/* Work Setting */}
                <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700, marginTop: 16 }}>Work Setting</span>
                <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span>Employment Type</span>
                    <CustomDropdown
                      onSelectSetting={(employmentType) => {
                        setEmploymentType(employmentType);
                      }}
                      screeningSetting={employmentType}
                      settingList={employmentTypeOptions}
                      placeholder="Select Employment Type"
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span>Work Setup Arrangement</span>
                    <CustomDropdown
                      onSelectSetting={(setting) => {
                        setWorkSetup(setting);
                      }}
                      screeningSetting={workSetup}
                      settingList={workSetupOptions}
                      placeholder="Select Work Setup"
                    />
                  </div>
                </div>

                <span>Work Setup Remarks</span>
                <input
                  className="form-control"
                  placeholder="Additional remarks about work setup (optional)"
                  value={workSetupRemarks}
                  onChange={(e) => {
                    setWorkSetupRemarks(e.target.value || "");
                  }}
                ></input>

                {/* Location */}
                <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700, marginTop: 16 }}>Location</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span>Country</span>
                    <CustomDropdown
                      onSelectSetting={(setting) => {
                        setCountry(setting);
                      }}
                      screeningSetting={country}
                      settingList={[{ name: "Philippines" }]}
                      placeholder="Select Country"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span>State / Province</span>
                    <CustomDropdown
                      onSelectSetting={(province) => {
                        setProvince(province);
                        const provinceObj = provinceList.find((p) => p.name === province);
                        const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
                        setCityList(cities);
                        setCity(cities[0].name);
                      }}
                      screeningSetting={province}
                      settingList={provinceList}
                      placeholder="Select State / Province"
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span>City</span>
                    <CustomDropdown
                      onSelectSetting={(city) => {
                        setCity(city);
                      }}
                      screeningSetting={city}
                      settingList={cityList}
                      placeholder="Select City"
                    />
                  </div>
                </div>

                {/* Salary */}
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                  <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>Salary</span>
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <label className="switch">
                      <input type="checkbox" checked={salaryNegotiable} onChange={() => setSalaryNegotiable(!salaryNegotiable)} />
                      <span className="slider round"></span>
                    </label>
                    <span>{salaryNegotiable ? "Negotiable" : "Fixed"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
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
                        ₱
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ paddingLeft: "28px", paddingRight: "50px" }}
                        placeholder="0"
                        min={0}
                        value={minimumSalary}
                        onChange={(e) => {
                          setMinimumSalary(e.target.value || "");
                        }}
                      />
                      <span style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6c757d",
                        fontSize: "14px",
                        pointerEvents: "none",
                      }}>
                        PHP
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
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
                        ₱
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        style={{ paddingLeft: "28px", paddingRight: "50px" }}
                        placeholder="0"
                        min={0}
                        value={maximumSalary}
                        onChange={(e) => {
                          setMaximumSalary(e.target.value || "");
                        }}
                      />
                      <span style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6c757d",
                        fontSize: "14px",
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

          {/* 2. Job Description Card */}
          <div className="layered-card-outer">
            <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>2. Job Description</span>
              </div>
              <div className="layered-card-content">
                <RichTextEditor setText={setDescription} text={description} />
              </div>
            </div>
          </div>

          {/* 3. Team Access Card */}
          <div className="layered-card-outer">
            <div className="layered-card-middle">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>3. Team Access</span>
              </div>
              <div className="layered-card-content">
                {/* Add Member Section - Horizontal Layout */}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                  {/* Labels */}
                  <div style={{ flex: 2 }}>
                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600, display: "block", marginBottom: 4 }}>Add more members</span>
                    <span style={{ fontSize: 13, color: "#6c757d", display: "block" }}>You can add other members to collaborate on this career.</span>
                  </div>
                  
                  {/* Add Member Dropdown - 1/3 width */}
                  <div className="member-dropdown-container" style={{ position: "relative", flex: 1 }}>
                    {/* Dropdown Button */}
                    <div
                      onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                      style={{ 
                        width: "100%", 
                        padding: "10px 16px", 
                      border: "1px solid #D5D7DA", 
                      borderRadius: "8px", 
                      backgroundColor: "#fff", 
                      color: "#9CA3AF", 
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="la la-user-plus" style={{ fontSize: 16 }}></i>
                      <span>Add member</span>
                    </div>
                    <i className={`la la-angle-${showMemberDropdown ? 'up' : 'down'}`} style={{ fontSize: 16 }}></i>
                  </div>

                  {/* Dropdown Panel */}
                  {showMemberDropdown && (
                    <div style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      width: "450px",
                      marginBottom: 4,
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 10,
                      overflow: "hidden"
                    }}>
                      {/* Search Field */}
                      <div style={{ padding: "12px", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8,
                          padding: "8px 12px",
                          backgroundColor: "#F9FAFB",
                          borderRadius: "6px",
                          border: "1px solid #E5E7EB"
                        }}>
                          <i className="la la-search" style={{ fontSize: 16, color: "#9CA3AF" }}></i>
                          <input
                            type="text"
                            placeholder="Search member"
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            autoFocus
                            style={{
                              flex: 1,
                              border: "none",
                              outline: "none",
                              fontSize: 14,
                              color: "#414651",
                              backgroundColor: "transparent"
                            }}
                          />
                        </div>
                      </div>

                      {/* Member List */}
                      <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                        {availableMembers.length > 0 ? (
                          availableMembers.map((member) => (
                            <div
                              key={member._id}
                              onClick={() => addTeamMember(member)}
                              style={{
                                padding: "12px 16px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                borderBottom: "1px solid #F3F4F6",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#F9FAFB";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#fff";
                              }}
                            >
                              <img 
                                src={member.image} 
                                alt={member.name}
                                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                              />
                              <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: "#181D27", whiteSpace: "nowrap" }}>{member.name}</span>
                                <span style={{ fontSize: 13, color: "#6c757d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>• {member.email}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{
                            padding: "20px 16px",
                            textAlign: "center",
                            color: "#6c757d",
                            fontSize: 13
                          }}>
                            {memberSearchQuery ? "No members found" : "No available members"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                </div>

                {/* Selected Team Members List */}
                {selectedTeamMembers.map((member, memberIndex) => (
                  <div 
                    key={member._id || member.email || memberIndex}
                    style={{ 
                      display: "flex", 
                      flexDirection: "row", 
                      alignItems: "center", 
                      gap: 16,
                      padding: "12px 16px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      marginBottom: 12,
                      border: "1px solid #E5E7EB"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, flex: 3 }}>
                      <img 
                        src={member.image || "/default-avatar.png"} 
                        alt={member.name} 
                        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: "50%", 
                        backgroundColor: "#F3F4F6", 
                        display: "none", 
                        alignItems: "center", 
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <i className="la la-user" style={{ fontSize: 20, color: "#6B7280" }}></i>
                      </div>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#181D27", whiteSpace: "nowrap" }}>
                          {member.name} 
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      {/* Custom Role Dropdown */}
                      <div className="role-dropdown-container" style={{ position: "relative", width: "100%" }}>
                        <div
                          onClick={() => setOpenRoleDropdown(openRoleDropdown === member._id ? null : member._id)}
                          style={{ 
                            width: "230px",
                            padding: "8px 12px", 
                            border: "1px solid #D5D7DA", 
                            borderRadius: "6px", 
                            fontSize: 13,
                            color: "#414651",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span>{member.role}</span>
                          <i className={`la la-angle-${openRoleDropdown === member._id ? 'up' : 'down'}`} style={{ fontSize: 14 }}></i>
                        </div>

                        {/* Dropdown Panel */}
                        {openRoleDropdown === member._id && (
                          <div style={{
                            position: "absolute",
                            bottom: "100%",
                            left: 0,
                            width: "400px",
                            marginBottom: 4,
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            zIndex: 100,
                            overflow: "hidden"
                          }}>
                            {roleOptions.map((role) => (
                              <div
                                key={role.value}
                                onClick={() => {
                                  updateMemberRole(member._id, role.value);
                                  setOpenRoleDropdown(null);
                                }}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: role.value !== roleOptions[roleOptions.length - 1].value ? "1px solid #F3F4F6" : "none",
                                  backgroundColor: member.role === role.value ? "#F0F3FF" : "#fff"
                                }}
                                onMouseEnter={(e) => {
                                  if (member.role !== role.value) {
                                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = member.role === role.value ? "#F0F3FF" : "#fff";
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: "#181D27", marginBottom: 2 }}>
                                      {role.label}
                                    </div>
                                    <div style={{ fontSize: 8, color: "#717680", lineHeight: "18px" }}>
                                      {role.description}
                                    </div>
                                  </div>
                                  {member.role === role.value && (
                                    <i className="la la-check" style={{ fontSize: 18, color: "#5B7FFF", marginLeft: 4 }}></i>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => removeMember(member._id)}
                        style={{ 
                          width: 32,
                          height: 32,
                          border: "none", 
                          background: "transparent", 
                          cursor: "pointer",
                          color: "#D1D5DB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <i className="la la-trash" style={{ fontSize: 20 }}></i>
                      </button>
                    </div>
                  </div>
                ))}

                <span style={{ fontSize: 11, color: "#9CA3AF" }}>*Admins can view all careers regardless of specific access settings.</span>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Step 2: CV Review */}
          {currentStep === 1 && (
            <div className="layered-card-outer">
              <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>CV Review & Pre-screening</span>
                </div>
                <div className="layered-card-content">
                  <p style={{ color: "#6c757d" }}>Configure CV review and pre-screening settings here.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: AI Interview */}
          {currentStep === 2 && (
            <div className="layered-card-outer">
              <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>AI Interview Setup</span>
                </div>
                <div className="layered-card-content">
                  <p style={{ color: "#6c757d" }}>Configure AI interview settings here.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pipeline */}
          {currentStep === 3 && (
            <div className="layered-card-outer">
              <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Pipeline Stages</span>
                </div>
                <div className="layered-card-content">
                  <p style={{ color: "#6c757d" }}>Configure pipeline stages here.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div className="layered-card-outer">
              <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Review Career</span>
                </div>
                <div className="layered-card-content">
                  <p style={{ color: "#6c757d" }}>Review and finalize your career posting here.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips Sidebar */}
        <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ backgroundColor: "#FEF9F5", border: "1px solid #FDE5D4", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <i className="la la-lightbulb" style={{ fontSize: 20, color: "#EA580C" }}></i>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#EA580C" }}>Tips</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#181D27", marginBottom: 4 }}>Use clear, standard job titles</p>
                <p style={{ fontSize: 12, color: "#6c757d", margin: 0 }}>for better searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").</p>
              </div>
              
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#181D27", marginBottom: 4 }}>Avoid abbreviations</p>
                <p style={{ fontSize: 12, color: "#6c757d", margin: 0 }}>or internal role codes that applicants may not understand (e.g., use "QA Engineer" instead of "QE" or "QA-LT").</p>
              </div>
              
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#181D27", marginBottom: 4 }}>Keep it concise</p>
                <p style={{ fontSize: 12, color: "#6c757d", margin: 0 }}>— job titles should be no more than a few words (2–4 max), avoiding fluff or marketing terms.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSaveModal && (
        <CareerActionModal action={showSaveModal} onAction={(action) => saveCareer(action)} />
      )}
      {isSavingCareer && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving career..." : "Updating career..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`} />
      )}
    </div>
  )
}