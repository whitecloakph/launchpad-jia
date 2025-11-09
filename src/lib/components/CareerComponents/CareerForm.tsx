"use client"

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import TipsComponent from "@/lib/components/CareerComponents/TipsComponent";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import { assetConstants } from "@/lib/utils/constantsV2";

// Add error border styles
const errorBorderStyles = `
  .error-border {
    border: 2px solid #EF4444 !important;
    box-shadow: none !important;
  }
  .error-border:focus {
    border: 2px solid #EF4444 !important;
    box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25) !important;
  }
`;

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
  
  // Field error states
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // CV Review settings
  const [cvSecretPrompt, setCvSecretPrompt] = useState(career?.cvSecretPrompt || "");
  
  // AI Interview settings
  const [aiInterviewScreening, setAiInterviewScreening] = useState(career?.aiInterviewScreening || "Good Fit and above");
  const [aiSecretPrompt, setAiSecretPrompt] = useState(career?.aiSecretPrompt || "");
  
  // Pipeline settings
  const [pipelineStages, setPipelineStages] = useState(career?.pipelineStages || [
    {
      id: 1,
      name: "CV Screening",
      type: "core",
      color: "#6B7280",
      locked: true,
      substages: [
        { id: 11, name: "Waiting Submission", canEdit: false, canDelete: false },
        { id: 12, name: "For Review", canEdit: false, canDelete: false }
      ]
    },
    {
      id: 2,
      name: "AI Interview",
      type: "core", 
      color: "#6B7280",
      locked: true,
      substages: [
        { id: 21, name: "Waiting Interview", canEdit: false, canDelete: false },
        { id: 22, name: "For Review", canEdit: false, canDelete: false }
      ]
    },
    {
      id: 3,
      name: "Final Human Interview",
      type: "core",
      color: "#DC2626",
      locked: false,
      substages: [
        { id: 31, name: "Waiting Schedule", canEdit: true, canDelete: false },
        { id: 32, name: "Waiting Interview", canEdit: true, canDelete: false },
        { id: 33, name: "For Review", canEdit: true, canDelete: false }
      ]
    },
    {
      id: 4,
      name: "Job Offer",
      type: "core",
      color: "#059669",
      locked: false,
      substages: [
        { id: 41, name: "For Final Review", canEdit: true, canDelete: false },
        { id: 42, name: "Waiting Offer Acceptance", canEdit: true, canDelete: false },
        { id: 43, name: "For Contract Signing", canEdit: true, canDelete: false },
        { id: 44, name: "Hired", canEdit: true, canDelete: false }
      ]
    }
  ]);
  
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
  const [country, setCountry] = useState(career?.country || "");
  const [province, setProvince] = useState(career?.province || "");
  const [city, setCity] = useState(career?.location || "");
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState("");
  const [isSavingCareer, setIsSavingCareer] = useState(false);
  const savingCareerRef = useRef(false);
  
  // Track saved career for draft state
  const [savedCareerId, setSavedCareerId] = useState(career?._id || null);
  const [isDraft, setIsDraft] = useState(false);

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
      cvSecretPrompt,
      aiInterviewScreening,
      aiSecretPrompt,
      requireVideo,
      salaryNegotiable,
      pipelineStages,
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

  const continueToNextStep = async () => {
    // Clear previous errors
    setFieldErrors({});
    
    // Validate required fields for current step
    const errors: {[key: string]: string} = {};
    
    if (currentStep === 0) {
      // Validate Career Details fields
      if (!jobTitle?.trim()) {
        errors.jobTitle = "This is a required field";
      }
      if (!description?.trim()) {
        errors.description = "This is a required field";
      }
      if (!workSetup?.trim()) {
        errors.workSetup = "This is a required field";
      }
      if (!employmentType?.trim()) {
        errors.employmentType = "This is a required field";
      }
      
      // Validate Location fields
      if (!country?.trim()) {
        errors.country = "This is a required field";
      }
      if (!province?.trim()) {
        errors.province = "This is a required field";
      }
      if (!city?.trim()) {
        errors.city = "This is a required field";
      }
      
      // Validate Salary fields
      if (!minimumSalary || minimumSalary.toString().trim() === "") {
        errors.minimumSalary = "This is a required field";
      }
      if (!maximumSalary || maximumSalary.toString().trim() === "") {
        errors.maximumSalary = "This is a required field";
      }
      
      // Check if there are any validation errors
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        errorToast("Please fill in all required fields", 1300);
        return;
      }
    }

    // Validate salary if provided
    if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }

    // If this is step 0 and we haven't saved yet, save as draft first
    if (currentStep === 0 && !savedCareerId && formType === "add") {
      try {
        setIsSavingCareer(true);
        
        let userInfoSlice = {
          image: user.image,
          name: user.name,
          email: user.email,
        };
        
        const careerData = {
          jobTitle,
          description,
          workSetup,
          workSetupRemarks,
          questions,
          lastEditedBy: userInfoSlice,
          createdBy: userInfoSlice,
          screeningSetting,
          cvSecretPrompt,
          aiInterviewScreening,
          aiSecretPrompt,
          orgID,
          requireVideo,
          salaryNegotiable,
          pipelineStages,
          minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
          maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
          country,
          province,
          location: city,
          status: "draft", // Save as draft
          employmentType,
        };

        const response = await axios.post("/api/add-career", careerData);
        if (response.status === 200) {
          setSavedCareerId(response.data._id);
          setIsDraft(true);
        }
        setIsSavingCareer(false);
      } catch (error) {
        setIsSavingCareer(false);
        errorToast("Failed to save career", 1300);
        return;
      }
    }
    
    // If we already have a saved career, update it with current data
    else if (savedCareerId) {
      try {
        setIsSavingCareer(true);
        
        let userInfoSlice = {
          image: user.image,
          name: user.name,
          email: user.email,
        };
        
        const updatedCareer = {
          _id: savedCareerId,
          jobTitle,
          description,
          workSetup,
          workSetupRemarks,
          questions,
          lastEditedBy: userInfoSlice,
          status: "draft",
          updatedAt: Date.now(),
          screeningSetting,
          cvSecretPrompt,
          aiInterviewScreening,
          aiSecretPrompt,
          requireVideo,
          salaryNegotiable,
          pipelineStages,
          minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
          maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
          country,
          province,
          location: city,
          employmentType,
        };

        const response = await axios.post("/api/update-career", updatedCareer);
        if (response.status === 200) {
          // Career updated successfully
        }
        setIsSavingCareer(false);
      } catch (error) {
        setIsSavingCareer(false);
        errorToast("Failed to save changes", 1300);
        return;
      }
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

      // If we already have a saved career, update it
      if (savedCareerId) {
        const updatedCareer = {
          _id: savedCareerId,
          jobTitle,
          description,
          workSetup,
          workSetupRemarks,
          questions,
          lastEditedBy: userInfoSlice,
          status,
          updatedAt: Date.now(),
          screeningSetting,
          cvSecretPrompt,
          aiInterviewScreening,
          aiSecretPrompt,
          requireVideo,
          salaryNegotiable,
          pipelineStages,
          minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
          maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
          country,
          province,
          location: city,
          employmentType,
        };

        try {
          const response = await axios.post("/api/update-career", updatedCareer);
          if (response.status === 200) {
            candidateActionToast(
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career {status === "active" ? "published" : "saved as unpublished"}</span>
              </div>,
              1300,
              <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
              window.location.href = `/recruiter-dashboard/careers`;
            }, 1300);
          }
        } catch (error) {
          errorToast("Failed to update career", 1300);
        } finally {
          savingCareerRef.current = false;
          setIsSavingCareer(false);
        }
        return;
      }

      // Otherwise create a new career
      const career = {
        jobTitle,
        description,
        workSetup,
        workSetupRemarks,
        questions,
        lastEditedBy: userInfoSlice,
        createdBy: userInfoSlice,
        screeningSetting,
        cvSecretPrompt,
        aiInterviewScreening,
        aiSecretPrompt,
        orgID,
        requireVideo,
        salaryNegotiable,
        pipelineStages,
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
          // Set the savedCareerId for future updates
          if (response.data && response.data._id) {
            setSavedCareerId(response.data._id);
            setIsDraft(true);
          }
          
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
      
      // Only set defaults if editing an existing career
      if (career?.province) {
        const provinceObj = philippineCitiesAndProvinces.provinces.find((p) => p.name === career.province);
        if (provinceObj) {
          const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
          setCityList(cities);
        }
      }
    }
    parseProvinces();
  }, [career])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: errorBorderStyles }} />
      <div className="col">
      {formType === "add" ? (<div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>
          {(isDraft || currentStep > 0) && jobTitle ? `[DRAFT] ${jobTitle}` : "Add new career"}
        </h1>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
          <button
            disabled={isSavingCareer}
            style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
              confirmSaveCareer("inactive");
            }}>
            Save as Unpublished
          </button>
          <button
            disabled={isSavingCareer}
            style={{ width: "fit-content", background: isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={continueToNextStep}>
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
                  className={`form-control ${fieldErrors.jobTitle ? 'error-border' : ''}`}
                  placeholder="Enter job title"
                  style={{
                    ...(fieldErrors.jobTitle && {
                      border: "2px solid #EF4444",
                      boxShadow: "none"
                    })
                  }}
                  onChange={(e) => {
                    setJobTitle(e.target.value || "");
                    if (fieldErrors.jobTitle) {
                      setFieldErrors({...fieldErrors, jobTitle: ""});
                    }
                  }}
                ></input>
                {fieldErrors.jobTitle && (
                  <span style={{ fontSize: 13, color: "#EF4444", marginTop: -8 }}>
                    {fieldErrors.jobTitle}
                  </span>
                )}

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
                        if (fieldErrors.workSetup) {
                          setFieldErrors({...fieldErrors, workSetup: ""});
                        }
                      }}
                      screeningSetting={workSetup}
                      settingList={workSetupOptions}
                      placeholder="Select Work Setup"
                      hasError={!!fieldErrors.workSetup}
                    />
                    {fieldErrors.workSetup && (
                      <span style={{ fontSize: 13, color: "#EF4444", marginTop: -4 }}>
                        {fieldErrors.workSetup}
                      </span>
                    )}
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
                        if (fieldErrors.country) {
                          setFieldErrors({...fieldErrors, country: ""});
                        }
                      }}
                      screeningSetting={country}
                      settingList={[{ name: "Philippines" }]}
                      placeholder="Select Country"
                      hasError={!!fieldErrors.country}
                    />
                    {fieldErrors.country && (
                      <span style={{ fontSize: 13, color: "#EF4444", marginTop: -4 }}>
                        {fieldErrors.country}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span>State / Province</span>
                    <CustomDropdown
                      onSelectSetting={(province) => {
                        setProvince(province);
                        if (fieldErrors.province) {
                          setFieldErrors({...fieldErrors, province: ""});
                        }
                        const provinceObj = provinceList.find((p) => p.name === province);
                        const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
                        setCityList(cities);
                        setCity(cities[0]?.name || "");
                      }}
                      screeningSetting={province}
                      settingList={provinceList}
                      placeholder="Choose state / province"
                      hasError={!!fieldErrors.province}
                    />
                    {fieldErrors.province && (
                      <span style={{ fontSize: 13, color: "#EF4444", marginTop: -4 }}>
                        {fieldErrors.province}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span>City</span>
                    <CustomDropdown
                      onSelectSetting={(city) => {
                        setCity(city);
                        if (fieldErrors.city) {
                          setFieldErrors({...fieldErrors, city: ""});
                        }
                      }}
                      screeningSetting={city}
                      settingList={cityList}
                      placeholder="Select City"
                      hasError={!!fieldErrors.city}
                    />
                    {fieldErrors.city && (
                      <span style={{ fontSize: 13, color: "#EF4444", marginTop: -4 }}>
                        {fieldErrors.city}
                      </span>
                    )}
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
                        className={`form-control ${fieldErrors.minimumSalary ? 'error-border' : ''}`}
                        style={{ 
                          paddingLeft: "28px", 
                          paddingRight: "50px",
                          ...(fieldErrors.minimumSalary && {
                            border: "2px solid #EF4444",
                            boxShadow: "none"
                          })
                        }}
                        placeholder="0"
                        min={0}
                        value={minimumSalary}
                        onChange={(e) => {
                          setMinimumSalary(e.target.value || "");
                          if (fieldErrors.minimumSalary) {
                            setFieldErrors({...fieldErrors, minimumSalary: ""});
                          }
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
                    {fieldErrors.minimumSalary && (
                      <span style={{ fontSize: 13, color: "#EF4444", marginTop: -4 }}>
                        {fieldErrors.minimumSalary}
                      </span>
                    )}
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
                        style={{ 
                          paddingLeft: "28px", 
                          paddingRight: "50px",
                          borderColor: fieldErrors.maximumSalary ? "#EF4444" : undefined,
                          borderWidth: fieldErrors.maximumSalary ? "2px" : undefined,
                          borderStyle: fieldErrors.maximumSalary ? "solid" : undefined
                        }}
                        placeholder="0"
                        min={0}
                        value={maximumSalary}
                        onChange={(e) => {
                          setMaximumSalary(e.target.value || "");
                          if (fieldErrors.maximumSalary) {
                            setFieldErrors({...fieldErrors, maximumSalary: ""});
                          }
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
                    {fieldErrors.maximumSalary && (
                      <span style={{ fontSize: 13, color: "#EF4444", marginTop: -4 }}>
                        {fieldErrors.maximumSalary}
                      </span>
                    )}
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
                <div style={{ 
                  border: fieldErrors.description ? "2px solid #EF4444" : undefined,
                  borderRadius: fieldErrors.description ? "8px" : undefined,
                  padding: fieldErrors.description ? "2px" : undefined
                }}>
                  <RichTextEditor 
                    setText={(value) => {
                      setDescription(value);
                      if (fieldErrors.description) {
                        setFieldErrors({...fieldErrors, description: ""});
                      }
                    }} 
                    text={description} 
                  />
                </div>
                {fieldErrors.description && (
                  <span style={{ fontSize: 13, color: "#EF4444", marginTop: 8, display: "block" }}>
                    {fieldErrors.description}
                  </span>
                )}
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
            <>
              <div className="layered-card-outer">
                <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>1. CV Review Settings</span>
                  </div>
                  <div className="layered-card-content">
                    {/* CV Screening */}
                    <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>CV Screening</span>
                    <span style={{ fontSize: 14, color: "#6c757d", marginBottom: 12, display: "block" }}>
                      Jia automatically endorses candidates who meet the chosen criteria.
                    </span>
                    
                    <div style={{ position: "relative", marginBottom: 16 }}>
                      <CustomDropdown
                        onSelectSetting={(setting) => {
                          setScreeningSetting(setting);
                        }}
                        screeningSetting={screeningSetting}
                        settingList={screeningSettingList}
                        placeholder="Select Screening Level"
                      />
                      
                      
                    </div>

                    {/* CV Secret Prompt */}
                    <div style={{ marginTop: screeningSetting ? 60 : 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <i className="la la-eye-slash" style={{ fontSize: 16, color: "#6c757d" }}></i>
                        <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>CV Secret Prompt</span>
                        <span style={{ fontSize: 13, color: "#9CA3AF" }}>(optional)</span>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "1px solid #9CA3AF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "help",
                              fontSize: 10,
                              color: "#9CA3AF",
                              fontWeight: "bold"
                            }}
                            onMouseEnter={(e) => {
                              const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                              if (tooltip) {
                                tooltip.style.visibility = 'visible';
                                tooltip.style.opacity = '1';
                              }
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                              if (tooltip) {
                                tooltip.style.visibility = 'hidden';
                                tooltip.style.opacity = '0';
                              }
                            }}
                          >
                            ?
                            <div
                              className="custom-tooltip"
                              style={{
                                position: "absolute",
                                bottom: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                marginBottom: "8px",
                                backgroundColor: "#23262cff",
                                color: "white",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                lineHeight: "1.3",
                                maxWidth: "280px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                visibility: "hidden",
                                opacity: "0",
                                transition: "opacity 0.2s, visibility 0.2s",
                                zIndex: 1000,
                                pointerEvents: "none"
                              }}
                            >
                              These prompts remain hidden from candidates and the public job portal.
                              <br />
                              Additionally, only Admins and the Job Owner can view the secret prompt.
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: 0,
                                  height: 0,
                                  borderLeft: "6px solid transparent",
                                  borderRight: "6px solid transparent",
                                  borderTop: "6px solid #23262cff"
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <span style={{ fontSize: 13, color: "#6c757d", display: "block", marginBottom: 12 }}>
                        Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                      </span>
                      
                      <textarea
                        className="form-control"
                        placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
                        value={cvSecretPrompt}
                        onChange={(e) => setCvSecretPrompt(e.target.value)}
                        style={{ 
                          minHeight: 120,
                          resize: "vertical",
                          fontFamily: "inherit",
                          fontSize: 14,
                          lineHeight: "1.5"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                <button
                  onClick={() => setCurrentStep(0)}
                  style={{
                    background: "transparent",
                    color: "#6c757d",
                    border: "1px solid #D1D5DB",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14
                  }}
                >
                  <i className="la la-arrow-left"></i>
                  Back
                </button>
                
                <button
                  onClick={async () => {
                    // Update career with current step data if we have a saved career
                    if (savedCareerId) {
                      try {
                        setIsSavingCareer(true);
                        let userInfoSlice = {
                          image: user.image,
                          name: user.name,
                          email: user.email,
                        };
                        
                        const updatedCareer = {
                          _id: savedCareerId,
                          jobTitle,
                          description,
                          workSetup,
                          workSetupRemarks,
                          questions,
                          lastEditedBy: userInfoSlice,
                          status: "draft",
                          updatedAt: Date.now(),
                          screeningSetting,
                          cvSecretPrompt,
                          aiInterviewScreening,
                          aiSecretPrompt,
                          requireVideo,
                          salaryNegotiable,
                          pipelineStages,
                          minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
                          maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
                          country,
                          province,
                          location: city,
                          employmentType,
                        };

                        await axios.post("/api/update-career", updatedCareer);
                        setIsSavingCareer(false);
                      } catch (error) {
                        setIsSavingCareer(false);
                        errorToast("Failed to save changes", 1300);
                        return;
                      }
                    }
                    setCurrentStep(2);
                  }}
                  style={{
                    background: "#1F2937",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  Continue
                  <i className="la la-arrow-right"></i>
                </button>
              </div>
            </>
          )}

          {/* Step 3: AI Interview */}
          {currentStep === 2 && (
            <>
              <div className="layered-card-outer">
                <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>1. AI Interview Settings</span>
                  </div>
                  <div className="layered-card-content">
                    {/* AI Interview Screening */}
                    <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>AI Interview Screening</span>
                    <span style={{ fontSize: 14, color: "#6c757d", marginBottom: 12, display: "block" }}>
                      Jia automatically endorses candidates who meet the chosen criteria.
                    </span>
                    
                    <div style={{ position: "relative", marginBottom: 16 }}>
                      <CustomDropdown
                        onSelectSetting={(setting) => {
                          setAiInterviewScreening(setting);
                        }}
                        screeningSetting={aiInterviewScreening}
                        settingList={screeningSettingList}
                        placeholder="Select Screening Level"
                      />
                    </div>

                    {/* Require Video on Interview */}
                    <div style={{ marginTop: 24 }}>
                      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <i className="la la-video" style={{ fontSize: 16, color: "#6c757d" }}></i>
                            <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>Require Video on Interview</span>
                          </div>
                          <span style={{ fontSize: 14, color: "#6c757d", display: "block" }}>
                            Require candidates to keep their camera on. Recordings will appear on their analysis page.
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 16 }}>
                          <label className="switch">
                            <input type="checkbox" checked={requireVideo} onChange={() => setRequireVideo(!requireVideo)} />
                            <span className="slider round"></span>
                          </label>
                          <span style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>{requireVideo ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Interview Secret Prompt */}
                    <div style={{ marginTop: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <i className="la la-eye-slash" style={{ fontSize: 16, color: "#6c757d" }}></i>
                        <span style={{ fontSize: 15, color: "#181D27", fontWeight: 700 }}>AI Interview Secret Prompt</span>
                        <span style={{ fontSize: 13, color: "#9CA3AF" }}>(optional)</span>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "1px solid #9CA3AF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "help",
                              fontSize: 10,
                              color: "#9CA3AF",
                              fontWeight: "bold"
                            }}
                            onMouseEnter={(e) => {
                              const tooltip = e.currentTarget.querySelector('.ai-custom-tooltip') as HTMLElement;
                              if (tooltip) {
                                tooltip.style.visibility = 'visible';
                                tooltip.style.opacity = '1';
                              }
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.querySelector('.ai-custom-tooltip') as HTMLElement;
                              if (tooltip) {
                                tooltip.style.visibility = 'hidden';
                                tooltip.style.opacity = '0';
                              }
                            }}
                          >
                            ?
                            <div
                              className="ai-custom-tooltip"
                              style={{
                                position: "absolute",
                                bottom: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                marginBottom: "8px",
                                backgroundColor: "#23262cff",
                                color: "white",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                lineHeight: "1.3",
                                maxWidth: "280px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                visibility: "hidden",
                                opacity: "0",
                                transition: "opacity 0.2s, visibility 0.2s",
                                zIndex: 1000,
                                pointerEvents: "none"
                              }}
                            >
                              These prompts remain hidden from candidates and the public job portal.
                              <br />
                              Additionally, only Admins and the Job Owner can view the secret prompt.
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: 0,
                                  height: 0,
                                  borderLeft: "6px solid transparent",
                                  borderRight: "6px solid transparent",
                                  borderTop: "6px solid #23262cff"
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <span style={{ fontSize: 13, color: "#6c757d", display: "block", marginBottom: 12 }}>
                        Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                      </span>
                      
                      <textarea
                        className="form-control"
                        placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                        value={aiSecretPrompt}
                        onChange={(e) => setAiSecretPrompt(e.target.value)}
                        style={{ 
                          minHeight: 120,
                          resize: "vertical",
                          fontFamily: "inherit",
                          fontSize: 14,
                          lineHeight: "1.5"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Interview Questions Card */}
              <InterviewQuestionGeneratorV2 
                questions={questions} 
                setQuestions={setQuestions} 
                jobTitle={jobTitle} 
                description={description} 
              />

              {/* Step Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{
                    background: "transparent",
                    color: "#6c757d",
                    border: "1px solid #D1D5DB",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14
                  }}
                >
                  <i className="la la-arrow-left"></i>
                  Back
                </button>
                
                <button
                  onClick={async () => {
                    // Update career with current step data if we have a saved career
                    if (savedCareerId) {
                      try {
                        setIsSavingCareer(true);
                        let userInfoSlice = {
                          image: user.image,
                          name: user.name,
                          email: user.email,
                        };
                        
                        const updatedCareer = {
                          _id: savedCareerId,
                          jobTitle,
                          description,
                          workSetup,
                          workSetupRemarks,
                          questions,
                          lastEditedBy: userInfoSlice,
                          status: "draft",
                          updatedAt: Date.now(),
                          screeningSetting,
                          cvSecretPrompt,
                          aiInterviewScreening,
                          aiSecretPrompt,
                          requireVideo,
                          salaryNegotiable,
                          pipelineStages,
                          minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
                          maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
                          country,
                          province,
                          location: city,
                          employmentType,
                        };

                        await axios.post("/api/update-career", updatedCareer);
                        setIsSavingCareer(false);
                      } catch (error) {
                        setIsSavingCareer(false);
                        errorToast("Failed to save changes", 1300);
                        return;
                      }
                    }
                    setCurrentStep(3);
                  }}
                  style={{
                    background: "#1F2937",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  Continue
                  <i className="la la-arrow-right"></i>
                </button>
              </div>
            </>
          )}

          {/* Step 4: Pipeline */}
          {currentStep === 3 && (
            <>
              <div className="layered-card-outer">
                <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Customize pipeline stages</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <button
                        style={{
                          background: "transparent",
                          color: "#6c757d",
                          border: "1px solid #D1D5DB",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                        onClick={() => {
                          // Reset to default pipeline
                          setPipelineStages([
                            {
                              id: 1,
                              name: "CV Screening",
                              type: "core",
                              color: "#6B7280",
                              locked: true,
                              substages: [
                                { id: 11, name: "Waiting Submission", canEdit: false, canDelete: false },
                                { id: 12, name: "For Review", canEdit: false, canDelete: false }
                              ]
                            },
                            {
                              id: 2,
                              name: "AI Interview",
                              type: "core", 
                              color: "#6B7280",
                              locked: true,
                              substages: [
                                { id: 21, name: "Waiting Interview", canEdit: false, canDelete: false },
                                { id: 22, name: "For Review", canEdit: false, canDelete: false }
                              ]
                            },
                            {
                              id: 3,
                              name: "Final Human Interview",
                              type: "core",
                              color: "#DC2626",
                              locked: false,
                              substages: [
                                { id: 31, name: "Waiting Schedule", canEdit: true, canDelete: false },
                                { id: 32, name: "Waiting Interview", canEdit: true, canDelete: false },
                                { id: 33, name: "For Review", canEdit: true, canDelete: false }
                              ]
                            },
                            {
                              id: 4,
                              name: "Job Offer",
                              type: "core",
                              color: "#059669",
                              locked: false,
                              substages: [
                                { id: 41, name: "For Final Review", canEdit: true, canDelete: false },
                                { id: 42, name: "Waiting Offer Acceptance", canEdit: true, canDelete: false },
                                { id: 43, name: "For Contract Signing", canEdit: true, canDelete: false },
                                { id: 44, name: "Hired", canEdit: true, canDelete: false }
                              ]
                            }
                          ]);
                        }}
                      >
                        <i className="la la-undo" style={{ fontSize: 14 }}></i>
                        Restore to default
                      </button>
                      <button
                        style={{
                          background: "transparent",
                          color: "#6c757d",
                          border: "1px solid #D1D5DB",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        Copy pipeline from existing job
                        <i className="la la-angle-down" style={{ fontSize: 14 }}></i>
                      </button>
                    </div>
                  </div>
                  <div className="layered-card-content">
                    {/* Pipeline Stages */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                      {pipelineStages.map((stage, index) => (
                        <div key={stage.id} style={{ display: "flex", flexDirection: "column" }}>
                          {/* Stage Header */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                            padding: "8px 12px",
                            backgroundColor: "#F9FAFB",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB"
                          }}>
                            <div style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: stage.color
                            }}></div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#181D27", flex: 1 }}>
                              {stage.name}
                            </span>
                            {stage.locked && (
                              <i className="la la-lock" style={{ fontSize: 12, color: "#9CA3AF" }}></i>
                            )}
                          </div>

                          {/* Substages */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <span style={{ fontSize: 12, color: "#6c757d", marginBottom: 4 }}>Substages</span>
                            {stage.substages.map((substage) => (
                              <div key={substage.id} style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 13,
                                color: "#374151"
                              }}>
                                <span style={{ flex: 1 }}>{substage.name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  {substage.canEdit && (
                                    <button
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6B7280",
                                        padding: "2px"
                                      }}
                                      onClick={() => {
                                        // Edit substage functionality
                                        const newName = prompt("Edit substage name:", substage.name);
                                        if (newName && newName.trim()) {
                                          const updatedStages = [...pipelineStages];
                                          const stageIndex = updatedStages.findIndex(s => s.id === stage.id);
                                          const substageIndex = updatedStages[stageIndex].substages.findIndex(ss => ss.id === substage.id);
                                          updatedStages[stageIndex].substages[substageIndex].name = newName.trim();
                                          setPipelineStages(updatedStages);
                                        }
                                      }}
                                    >
                                      <i className="la la-edit" style={{ fontSize: 12 }}></i>
                                    </button>
                                  )}
                                  <button
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#6B7280",
                                      padding: "2px"
                                    }}
                                  >
                                    <i className="la la-grip-vertical" style={{ fontSize: 12 }}></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            {/* Add New Substage Button */}
                            <button
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "8px 12px",
                                backgroundColor: "transparent",
                                border: "1px dashed #D1D5DB",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: 13,
                                color: "#6B7280"
                              }}
                              onClick={() => {
                                const newSubstageName = prompt("Enter new substage name:");
                                if (newSubstageName && newSubstageName.trim()) {
                                  const updatedStages = [...pipelineStages];
                                  const stageIndex = updatedStages.findIndex(s => s.id === stage.id);
                                  const newSubstage = {
                                    id: Date.now(), // Simple ID generation
                                    name: newSubstageName.trim(),
                                    canEdit: true,
                                    canDelete: true
                                  };
                                  updatedStages[stageIndex].substages.push(newSubstage);
                                  setPipelineStages(updatedStages);
                                }
                              }}
                            >
                              <i className="la la-plus" style={{ fontSize: 12 }}></i>
                              Add new stage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    background: "transparent",
                    color: "#6c757d",
                    border: "1px solid #D1D5DB",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14
                  }}
                >
                  <i className="la la-arrow-left"></i>
                  Back
                </button>
                
                <button
                  onClick={async () => {
                    // Update career with current step data if we have a saved career
                    if (savedCareerId) {
                      try {
                        setIsSavingCareer(true);
                        let userInfoSlice = {
                          image: user.image,
                          name: user.name,
                          email: user.email,
                        };
                        
                        const updatedCareer = {
                          _id: savedCareerId,
                          jobTitle,
                          description,
                          workSetup,
                          workSetupRemarks,
                          questions,
                          lastEditedBy: userInfoSlice,
                          status: "draft",
                          updatedAt: Date.now(),
                          screeningSetting,
                          cvSecretPrompt,
                          aiInterviewScreening,
                          aiSecretPrompt,
                          requireVideo,
                          salaryNegotiable,
                          pipelineStages,
                          minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
                          maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
                          country,
                          province,
                          location: city,
                          employmentType,
                        };

                        await axios.post("/api/update-career", updatedCareer);
                        setIsSavingCareer(false);
                      } catch (error) {
                        setIsSavingCareer(false);
                        errorToast("Failed to save changes", 1300);
                        return;
                      }
                    }
                    setCurrentStep(4);
                  }}
                  style={{
                    background: "#1F2937",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  Continue
                  <i className="la la-arrow-right"></i>
                </button>
              </div>
            </>
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
        
        {/* Tips Component - Only show on steps 1-3 */}
        {currentStep <= 2 && <TipsComponent currentStep={currentStep} />}
      </div>
      {showSaveModal && (
        <CareerActionModal action={showSaveModal} onAction={(action) => saveCareer(action)} />
      )}
      {isSavingCareer && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving career..." : "Updating career..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`} />
      )}
    </div>
    </>
  )
}