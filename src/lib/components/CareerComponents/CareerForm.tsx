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
    const [province, setProvince] = useState(career?.province ||"");
    const [city, setCity] = useState(career?.location || "");
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState("");
    const [isSavingCareer, setIsSavingCareer] = useState(false);
    const savingCareerRef = useRef(false);
    const [workEmail, setWorkEmail] = useState("");
    const [errors, setErrors] = useState({
      jobTitle: "",
      description: "",
      workEmail: "",
    });
    // Team Access
    const teamRoleOptions = [
      { name: "Job Owner" },
      { name: "Contributor" },
      { name: "Reviewer" },
    ];
    const [teamMembers, setTeamMembers] = useState<{ email: string; role: string }[]>([
      { email: user?.email || "", role: "Job Owner" },
    ]);
    // CV review & pre-screening
    const [cvSecretPrompt, setCvSecretPrompt] = useState<string>(career?.cvSecretPrompt || "");
    type PreScreeningType = "dropdown" | "range";
    type PreScreeningItem = {
      id: string;
      question: string;
      type: PreScreeningType;
      options?: string[];
      range?: { min?: string; max?: string; minCurrency?: string; maxCurrency?: string };
    };

    const normalizePSQ = (val: any): PreScreeningItem[] => {
      if (!Array.isArray(val)) return [];
      return val.map((item) => {
        if (typeof item === "string") {
          return {
            id: `${Date.now()}-${Math.random()}`,
            question: item,
            type: "dropdown" as PreScreeningType,
            options: ["", ""],
          };
        }
        // Already structured
        return {
          id: item.id || `${Date.now()}-${Math.random()}`,
          question: item.question || "",
          type: (item.type as PreScreeningType) || "dropdown",
          options: item.options || (item.type === "dropdown" ? ["", ""] : undefined),
          range:
            item.type === "range"
              ? {
                  min: item.range?.min ?? "",
                  max: item.range?.max ?? "",
                  minCurrency: item.range?.minCurrency || "PHP",
                  maxCurrency: item.range?.maxCurrency || "PHP",
                }
              : undefined,
        };
      });
    };

    const [preScreeningQuestions, setPreScreeningQuestions] = useState<PreScreeningItem[]>(normalizePSQ(career?.preScreeningQuestions || []));
    const suggestedPreScreeningQuestions = [
      "How long is your notice period?",
      "How often are you willing to report to the office each week?",
      "What is your expected monthly salary?",
    ];
    // UI state for pre-screening add/edit
    const [showAddPSQ, setShowAddPSQ] = useState<boolean>(false);
    const [psqInput, setPsqInput] = useState<string>("");
    const [psqEditingIndex, setPsqEditingIndex] = useState<number | null>(null);
    const [psqEditInput, setPsqEditInput] = useState<string>("");
    // AI interview setup
    const [aiScreeningSetting, setAiScreeningSetting] = useState<string>(career?.aiScreeningSetting || screeningSetting || "Good Fit and above");
    const [aiSecretPrompt, setAiSecretPrompt] = useState<string>(career?.aiSecretPrompt || "");
    // Segmented form state (only for Add flow)
    const [currentStep, setCurrentStep] = useState<number>(1);
    const draftTimeoutRef = useRef<any>(null);
    const steps = [
      { key: "details", label: "Career Details & Team Access" },
      { key: "cv", label: "CV Review & Pre-screening" },
      { key: "ai", label: "AI Interview Setup" },
      { key: "pipeline", label: "Pipeline Stages" },
      { key: "review", label: "Review Career" },
    ];

    const validateField = (name, value) => {
      switch (name) {
        case "jobTitle":
          if (!value.trim()) return "Job title is required.";
          break;
        case "description":
          if (!value.trim()) return "Description is required.";
          break;
        default:
          return "";
      }
      return "";
    };
    
    



    const isFormValid = () => {
        return jobTitle?.trim().length > 0 && description?.trim().length > 0 && questions.some((q) => q.questions.length > 0) && workSetup?.trim().length > 0;
    }

    // Step validation (per current step)
    const isStepComplete = (index: number) => {
        switch (index) {
            case 1:
                return (
                    jobTitle?.trim().length > 0 &&
                    description?.trim().length > 0 &&
                    employmentType?.trim().length > 0 &&
                    workSetup?.trim().length > 0 &&
                    (province?.trim()?.length ?? 0) > 0 &&
                    (city?.trim()?.length ?? 0) > 0
                );
            case 2:
                return !!screeningSetting;
            case 3:
                return questions.some((q) => q.questions.length > 0);
            case 4:
                return true; // Pipeline builder not in scope
            case 5:
                return isFormValid();
            default:
                return false;
        }
    };

    const isCurrentStepReady = () => isStepComplete(currentStep);

    // Persist draft to localStorage for add flow
    const persistDraft = () => {
        if (formType !== "add") return;
        try {
            const payload = {
                jobTitle,
                description,
                workSetup,
                workSetupRemarks,
                cvSecretPrompt,
                preScreeningQuestions,
                aiScreeningSetting,
                aiSecretPrompt,
                screeningSetting,
                employmentType,
                requireVideo,
                salaryNegotiable,
                minimumSalary,
                maximumSalary,
                questions,
                country,
                province,
                city,
                currentStep,
            };
            localStorage.setItem("careerFormDraft", JSON.stringify(payload));
        } catch (e) {
            // Ignore storage errors
        }
    };

    useEffect(() => {
        if (formType !== "add") return;
        try {
            const raw = localStorage.getItem("careerFormDraft");
            if (raw) {
                const draft = JSON.parse(raw);
                setJobTitle(draft.jobTitle ?? "");
                setDescription(draft.description ?? "");
                setWorkSetup(draft.workSetup ?? "");
                setWorkSetupRemarks(draft.workSetupRemarks ?? "");
                setScreeningSetting(draft.screeningSetting ?? "Good Fit and above");
                setEmploymentType(draft.employmentType ?? "Full-Time");
                setRequireVideo(draft.requireVideo ?? true);
                setSalaryNegotiable(draft.salaryNegotiable ?? true);
                setMinimumSalary(draft.minimumSalary ?? "");
                setMaximumSalary(draft.maximumSalary ?? "");
                if (Array.isArray(draft.questions)) setQuestions(draft.questions);
                setCountry(draft.country ?? "Philippines");
                setProvince(draft.province ?? "");
                setCity(draft.city ?? "");
                setCurrentStep(draft.currentStep ?? 1);
                setCvSecretPrompt(draft.cvSecretPrompt ?? "");
                setPreScreeningQuestions(normalizePSQ(draft.preScreeningQuestions ?? []));
                setAiScreeningSetting(draft.aiScreeningSetting ?? (draft.screeningSetting || "Good Fit and above"));
                setAiSecretPrompt(draft.aiSecretPrompt ?? "");
            }
        } catch (e) {
            // Ignore parse errors
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (formType !== "add") return;
        if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
        draftTimeoutRef.current = setTimeout(() => {
            persistDraft();
        }, 300);
        return () => {
            if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
        };
    }, [formType, jobTitle, description, workSetup, workSetupRemarks, screeningSetting, employmentType, requireVideo, salaryNegotiable, minimumSalary, maximumSalary, questions, country, province, city, currentStep]);

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
            cvSecretPrompt,
            preScreeningQuestions,
            aiScreeningSetting,
            aiSecretPrompt,
            teamMembers,
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
            try { localStorage.removeItem("careerFormDraft"); } catch {}
            candidateActionToast(
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career added {status === "active" ? "and published" : ""}</span>
                </div>,
                1300, 
            <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
                window.location.href = `/recruiter-dashboard/careers`;
            }, 1300);
            }
        } catch (error) {
            const serverMessage = (error as any)?.response?.data?.error || "Failed to add career";
            errorToast(serverMessage, 1600);
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
      },[career])

  function ReviewSection({ title, children, onEdit, defaultOpen = false }: { title: string, children: any, onEdit?: () => void, defaultOpen?: boolean }) {
    const [open, setOpen] = useState<boolean>(!!defaultOpen);
    return (
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              aria-expanded={open}
            >
              <i className={`la ${open ? "la-angle-down" : "la-angle-right"}`} style={{ fontSize: 18 }}></i>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>{title}</span>
            </button>
            {!!onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="button-primary-v2"
                style={{ color: "#414651", background: "#FFFFFF", width: "fit-content" }}
                title="Edit section"
              >
                <i className="la la-pencil-alt" style={{ fontSize: 16, marginRight: 6 }}></i>
                Edit
              </button>
            )}
          </div>
          {open && (
            <div className="layered-card-content" style={{ marginTop: 8 }}>
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }

    return (
        <div className="col">
        {formType === "add" ? (<>
            <div style={{ marginBottom: "16px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Add new career</h1>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <button
                  disabled={!isCurrentStepReady() || isSavingCareer}
                  style={{
                    width: "fit-content",
                    color: !isCurrentStepReady() || isSavingCareer ? "#98A2B3" : "#414651",
                    background: "#fff",
                    border: "1px solid #D5D7DA",
                    padding: "8px 16px",
                    borderRadius: "60px",
                    cursor: !isCurrentStepReady() || isSavingCareer ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    opacity: !isCurrentStepReady() || isSavingCareer ? 0.6 : 1,
                  }}
                  onClick={() => { confirmSaveCareer("inactive"); }}
                >
                  Save as Unpublished
                </button>
                <button
                  disabled={isSavingCareer || (currentStep === steps.length && !isFormValid())}
                  style={{ width: "fit-content", background: isSavingCareer || (currentStep === steps.length && !isFormValid()) ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: isSavingCareer || (currentStep === steps.length && !isFormValid()) ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                  onClick={() => {
                    if (currentStep === steps.length) {
                      // Final step publishes
                      confirmSaveCareer("active");
                    } else {
                      setCurrentStep((s) => Math.min(s + 1, steps.length));
                    }
                  }}
                >
                  {currentStep === steps.length ? (
                    <>
                      <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Save & Publish
                    </>
                  ) : (
                    <>Save and Continue</>
                  )}
                </button>
              </div>
            </div>
            {/* Stepper */}
            <div style={{ position: "relative", width: "100%", marginBottom: 24, padding: "0 24px 0 12px" }}>
              {/* Baseline: one continuous line */}
              <div style={{ position: "absolute", top: 11, left: 0, right: 0, height: 2, background: "#E4E7EC", borderRadius: 2 }}></div>
              {/* Progress overlay: stretches between circles based on step index */}
              <div
                style={{
                  position: "absolute",
                  top: 11,
                  left: 0,
                  height: 2,
                  width: `${((Math.max(1, Math.min(currentStep, steps.length)) - 1) / Math.max(1, steps.length - 1)) * 100}%`,
                  background: "#111827",
                  borderRadius: 2,
                  transition: "width 240ms ease",
                }}
              ></div>

              {/* Row 1: circles aligned to the left edge of each segment */}
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, alignItems: "center", paddingBottom: 8 }}>
                {steps.map((s, idx) => {
                  const index = idx + 1;
                  const isActive = currentStep === index;
                  const isCompleted = currentStep > index;
                  const showInnerDot = isActive || isCompleted;

                   return (
                    <div key={`${s.key}-circle`} style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "flex-start", justifySelf: "start" }}>
                      <div
                        onClick={() => setCurrentStep(index)}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: `2px solid ${showInnerDot ? "#111827" : "#D5D7DA"}`,
                          background: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title={s.label}
                        aria-current={isActive ? "step" : undefined}
                        role="button"
                      >
                        {showInnerDot && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#111827" }}></div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: labels left-aligned within each segment; prevent right overflow */}
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, alignItems: "start" }}>
                {steps.map((s, idx) => {
                  const index = idx + 1;
                  const isActive = currentStep === index;
                  return (
                    <div key={`${s.key}-label-wrap`} style={{ position: "relative", width: "100%", overflow: "hidden", justifySelf: "start" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 14,
                          color: isActive ? "#111827" : "#667085",
                          fontWeight: isActive ? 700 : 500,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: "100%",
                          textAlign: "left",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
        </>) : (
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
                  style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    updateCareer("active");
                  }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Save Changes as Published
                  </button>
              </div>
       </div>
        )}
        {/* Segmented content */}
        {formType === "add" ? (
          <>
            {currentStep === 1 && (
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-suitcase" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Career Information</span>
                      </div>
                      <div className="layered-card-content">
                        <span>Job Title</span>
                        <input
                          value={jobTitle}
                          className="form-control"
                          placeholder="Enter job title"
                          onChange={(e) => {
                            const value = e.target.value;
                            setJobTitle(value);
                            setErrors((prev) => ({ ...prev, jobTitle: "" }));
                          }}
                          onBlur={(e) => {
                            const message = validateField("jobTitle", e.target.value);
                            setErrors((prev) => ({ ...prev, jobTitle: message }));
                          }}
                          style={{
                            border: errors.jobTitle ? "1px solid red" : "1px solid #D1D5DB",
                            outline: "none",
                          }}
                        />
                        {errors.jobTitle && (
                          <span style={{ color: "red", fontSize: "13px" }}>{errors.jobTitle}</span>
                        )}

                        {/* Work Setting */}
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Work Setting</span>
                        <span>Employment Type</span>
                        <CustomDropdown
                          onSelectSetting={(employmentType) => {
                            setEmploymentType(employmentType);
                          }}
                          screeningSetting={employmentType}
                          settingList={employmentTypeOptions}
                          placeholder="Select Employment Type"
                        />
                        <span>Arrangement</span>
                        <CustomDropdown
                          onSelectSetting={(setting) => {
                            setWorkSetup(setting);
                          }}
                          screeningSetting={workSetup}
                          settingList={workSetupOptions}
                          placeholder="Select Work Setup"
                        />

                        {/* Location */}
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Location</span>
                        <span>Country</span>
                        <CustomDropdown
                          onSelectSetting={(setting) => {
                            setCountry(setting);
                          }}
                          screeningSetting={country}
                          settingList={[]}
                          placeholder="Select Country"
                        />
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
                        <span>City</span>
                        <CustomDropdown
                          onSelectSetting={(city) => {
                            setCity(city);
                          }}
                          screeningSetting={city}
                          settingList={cityList}
                          placeholder="Select City"
                        />

                        {/* Salary */}
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Salary</span>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                          <label className="switch">
                            <input type="checkbox" checked={salaryNegotiable} onChange={() => setSalaryNegotiable(!salaryNegotiable)} />
                            <span className="slider round"></span>
                          </label>
                          <span>{salaryNegotiable ? "Negotiable" : "Fixed"}</span>
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
                            onChange={(e) => {
                              setMinimumSalary(e.target.value || "");
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
                            onChange={(e) => {
                              setMaximumSalary(e.target.value || "");
                            }}
                          ></input>
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
                  {/* Job Description */}
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-file-alt" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Job Description</span>
                      </div>
                      <div className="layered-card-content">
                        <div
                          style={{
                            border: errors.description ? "1px solid red" : "1px solid transparent",
                            borderRadius: "6px",
                            padding: errors.description ? "2px" : "0",
                          }}
                        >
                          <RichTextEditor
                            setText={(text) => {
                              setDescription(text);
                              setErrors((prev) => ({ ...prev, description: "" }));
                            }}
                            text={description}
                          />
                        </div>
                        {errors.description && (
                          <span style={{ color: "red", fontSize: "13px" }}>{errors.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Access */}
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-users" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Team Access</span>
                      </div>
                      <div className="layered-card-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span>You can add other members to collaborate on this career.</span>
                          <button
                            type="button"
                            className="button-primary-v2"
                            style={{ color: "#414651", background: "#FFFFFF", width: "fit-content" }}
                            onClick={() => setTeamMembers((prev) => [...prev, { email: "", role: "" }])}
                          >
                            <span><i className="la la-user-plus" style={{ fontSize: 17, marginRight: 8 }}></i>Add member</span>
                          </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                          {teamMembers.map((member, index) => (
                            <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 200px 32px", gap: 12, alignItems: "end" }}>
                              <div>
                                <span>Email</span>
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder="Enter email"
                                  value={member.email}
                                  onChange={(e) => {
                                    const next = [...teamMembers];
                                    next[index].email = e.target.value;
                                    setTeamMembers(next);
                                  }}
                                />
                              </div>
                              <div>
                                <span>Role</span>
                                <CustomDropdown
                                  onSelectSetting={(role) => {
                                    const next = [...teamMembers];
                                    next[index].role = role;
                                    setTeamMembers(next);
                                  }}
                                  screeningSetting={member.role}
                                  settingList={teamRoleOptions}
                                  placeholder="Select role"
                                />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                                {index > 0 && (
                                  <div title="Remove" style={{ cursor: "pointer" }} onClick={() => {
                                    const next = [...teamMembers];
                                    next.splice(index, 1);
                                    setTeamMembers(next);
                                  }}>
                                    <i className="la la-trash" style={{ fontSize: 24 }}></i>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 8, color: "#667085" }}>*Admins can view all careers regardless of specific access settings.</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-lightbulb" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Tips</span>
                      </div>
                      <div className="layered-card-content">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#475467" }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>Use clear, standard job titles</span> for better searchability (e.g., “Software Engineer” instead of “Code Ninja” or “Tech Rockstar”).
                          </div>
                          <div>
                            <span style={{ fontWeight: 700 }}>Avoid abbreviations</span> or internal role codes that applicants may not understand (e.g., use “QA Engineer” instead of “QE II” or “QA-TL”).
                          </div>
                          <div>
                            <span style={{ fontWeight: 700 }}>Keep it concise</span> — job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* 1. CV Review Settings */}
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-list" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>CV Review Settings</span>
                      </div>
                      <div className="layered-card-content">
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>CV Screening</span>
                        <span>Jia automatically endorses candidates who meet the chosen criteria.</span>
                        <CustomDropdown
                          onSelectSetting={(setting) => {
                            setScreeningSetting(setting);
                          }}
                          screeningSetting={screeningSetting}
                          settingList={screeningSettingList}
                        />

                        {/* Secret prompt */}
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>CV Secret Prompt</span>
                            <span style={{ color: "#667085" }}>(optional)</span>
                            <span title="These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt." style={{ cursor: "help" }}>
                              <i className="la la-question-circle" style={{ color: "#98A2B3" }}></i>
                            </span>
                          </div>
                          <span>Secret Prompts give you extra control over Jia’s evaluation style, complementing her accurate assessment of requirements from the job description.</span>
                          <textarea
                            className="form-control"
                            placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
                            value={cvSecretPrompt}
                            onChange={(e) => setCvSecretPrompt(e.target.value)}
                            style={{ minHeight: 140, resize: "vertical", marginTop: 8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Pre-Screening Questions */}
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-list-ul" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                          </div>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Pre-Screening Questions</span>
                          <span style={{ color: "#667085", marginLeft: 6 }}>(optional)</span>
                          <div style={{ marginLeft: 8, background: "#EEF2F6", borderRadius: 12, padding: "2px 8px", fontSize: 12, color: "#667085" }}>{preScreeningQuestions.length}</div>
                        </div>
                        <button
                          type="button"
                          className="button-primary-v2"
                          style={{ color: "#414651", background: "#FFFFFF", width: "fit-content" }}
                          onClick={() => { setShowAddPSQ(true); setPsqInput(""); }}
                        >
                          <span><i className="la la-plus" style={{ fontSize: 17, marginRight: 8 }}></i>Add custom</span>
                        </button>
                      </div>
                      <div className="layered-card-content">
                        {showAddPSQ && (
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                            <input
                              className="form-control"
                              placeholder="Enter a pre-screening question"
                              value={psqInput}
                              onChange={(e) => setPsqInput(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="button-primary-v2"
                              style={{ color: "#fff", background: "#111827" }}
                              onClick={() => {
                                const text = psqInput.trim();
                                if (text.length > 0) {
                                  setPreScreeningQuestions((prev) => [
                                    ...prev,
                                    {
                                      id: `${Date.now()}-${Math.random()}`,
                                      question: text,
                                      type: "dropdown",
                                      options: ["", ""],
                                    },
                                  ]);
                                  setPsqInput("");
                                  setShowAddPSQ(false);
                                }
                              }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="button-primary-v2"
                              style={{ color: "#414651", background: "#FFFFFF" }}
                              onClick={() => { setShowAddPSQ(false); setPsqInput(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {preScreeningQuestions.length === 0 && (
                          <div style={{ color: "#667085", marginBottom: 12 }}>No pre-screening questions added yet.</div>
                        )}
                        {preScreeningQuestions.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                            {preScreeningQuestions.map((item, idx) => (
                              <div key={item.id} style={{ border: "1px solid #E9EAEB", borderRadius: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6F7F9", padding: "10px 12px", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                                  {psqEditingIndex === idx ? (
                                    <input
                                      className="form-control"
                                      value={psqEditInput}
                                      onChange={(e) => setPsqEditInput(e.target.value)}
                                      style={{ flex: 1, marginRight: 8 }}
                                    />
                                  ) : (
                                    <span style={{ fontWeight: 600 }}>{item.question}</span>
                                  )}
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <select
                                      value={item.type}
                                      onChange={(e) => {
                                        const type = e.target.value as PreScreeningType;
                                        setPreScreeningQuestions((prev) =>
                                          prev.map((q, i) =>
                                            i === idx
                                              ? {
                                                  ...q,
                                                  type,
                                                  options: type === "dropdown" ? q.options || ["", ""] : undefined,
                                                  range:
                                                    type === "range"
                                                      ? {
                                                          min: q.range?.min ?? "",
                                                          max: q.range?.max ?? "",
                                                          minCurrency: q.range?.minCurrency || "PHP",
                                                          maxCurrency: q.range?.maxCurrency || "PHP",
                                                        }
                                                      : undefined,
                                                }
                                              : q
                                          )
                                        );
                                      }}
                                      style={{ border: "1px solid #E9EAEB", borderRadius: 8, padding: "6px 8px", background: "#FFFFFF" }}
                                    >
                                      <option value="dropdown">Dropdown</option>
                                      <option value="range">Range</option>
                                    </select>
                                  </div>
                                </div>

                                <div style={{ padding: "12px" }}>
                                  {item.type === "dropdown" && (
                                    <>
                                      {(item.options || []).map((opt, optIdx) => (
                                        <div key={optIdx} style={{ display: "grid", gridTemplateColumns: "40px 1fr 32px", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                          <div style={{ border: "1px solid #E9EAEB", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>{optIdx + 1}</div>
                                          <input
                                            className="form-control"
                                            value={opt}
                                            placeholder={`Option ${optIdx + 1}`}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              setPreScreeningQuestions((prev) =>
                                                prev.map((q, i) =>
                                                  i === idx
                                                    ? { ...q, options: (q.options || []).map((o, oi) => (oi === optIdx ? value : o)) }
                                                    : q
                                                )
                                              );
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className="button-primary-v2"
                                            style={{ color: "#B42318", background: "#FFFFFF" }}
                                            onClick={() => {
                                              setPreScreeningQuestions((prev) =>
                                                prev.map((q, i) =>
                                                  i === idx
                                                    ? { ...q, options: (q.options || []).filter((_, oi) => oi !== optIdx) }
                                                    : q
                                                )
                                              );
                                            }}
                                          >
                                            <i className="la la-times"></i>
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        className="button-primary-v2"
                                        style={{ color: "#414651", background: "#FFFFFF" }}
                                        onClick={() => {
                                          setPreScreeningQuestions((prev) =>
                                            prev.map((q, i) => (i === idx ? { ...q, options: [...(q.options || []), ""] } : q))
                                          );
                                        }}
                                      >
                                        <i className="la la-plus" style={{ marginRight: 6 }}></i> Add Option
                                      </button>
                                    </>
                                  )}

                                  {item.type === "range" && (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                      <div>
                                        <div style={{ color: "#667085", marginBottom: 6 }}>Minimum</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8 }}>
                                          <div style={{ position: "relative" }}>
                                            <span style={{ position: "absolute", left: 10, top: 8, color: "#6c757d" }}>₱</span>
                                            <input
                                              className="form-control"
                                              style={{ paddingLeft: 24 }}
                                              value={item.range?.min || ""}
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                setPreScreeningQuestions((prev) =>
                                                  prev.map((q, i) =>
                                                    i === idx ? { ...q, range: { ...(q.range || {}), min: v } } : q
                                                  )
                                                );
                                              }}
                                            />
                                          </div>
                                          <select
                                            value={item.range?.minCurrency || "PHP"}
                                            onChange={(e) => {
                                              setPreScreeningQuestions((prev) =>
                                                prev.map((q, i) =>
                                                  i === idx ? { ...q, range: { ...(q.range || {}), minCurrency: e.target.value } } : q
                                                )
                                              );
                                            }}
                                            style={{ border: "1px solid #E9EAEB", borderRadius: 8, padding: "6px 8px", background: "#FFFFFF" }}
                                          >
                                            <option>PHP</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div>
                                        <div style={{ color: "#667085", marginBottom: 6 }}>Maximum</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8 }}>
                                          <div style={{ position: "relative" }}>
                                            <span style={{ position: "absolute", left: 10, top: 8, color: "#6c757d" }}>₱</span>
                                            <input
                                              className="form-control"
                                              style={{ paddingLeft: 24 }}
                                              value={item.range?.max || ""}
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                setPreScreeningQuestions((prev) =>
                                                  prev.map((q, i) =>
                                                    i === idx ? { ...q, range: { ...(q.range || {}), max: v } } : q
                                                  )
                                                );
                                              }}
                                            />
                                          </div>
                                          <select
                                            value={item.range?.maxCurrency || "PHP"}
                                            onChange={(e) => {
                                              setPreScreeningQuestions((prev) =>
                                                prev.map((q, i) =>
                                                  i === idx ? { ...q, range: { ...(q.range || {}), maxCurrency: e.target.value } } : q
                                                )
                                              );
                                            }}
                                            style={{ border: "1px solid #E9EAEB", borderRadius: 8, padding: "6px 8px", background: "#FFFFFF" }}
                                          >
                                            <option>PHP</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                                    {psqEditingIndex === idx ? (
                                      <>
                                        <button
                                          type="button"
                                          className="button-primary-v2"
                                          style={{ color: "#fff", background: "#111827", marginRight: 8 }}
                                          onClick={() => {
                                            const text = psqEditInput.trim();
                                            if (text.length > 0) {
                                              setPreScreeningQuestions((prev) =>
                                                prev.map((it, i) => (i === idx ? { ...it, question: text } : it))
                                              );
                                              setPsqEditingIndex(null);
                                              setPsqEditInput("");
                                            }
                                          }}
                                        >
                                          Save Question
                                        </button>
                                        <button
                                          type="button"
                                          className="button-primary-v2"
                                          style={{ color: "#414651", background: "#FFFFFF" }}
                                          onClick={() => { setPsqEditingIndex(null); setPsqEditInput(""); }}
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          className="button-primary-v2"
                                          style={{ color: "#414651", background: "#FFFFFF", marginRight: 8 }}
                                          onClick={() => { setPsqEditingIndex(idx); setPsqEditInput(item.question); }}
                                        >
                                          Edit Question
                                        </button>
                                        <button
                                          type="button"
                                          className="button-primary-v2"
                                          style={{ color: "#B42318", background: "#FFFFFF" }}
                                          onClick={() => {
                                            setPreScreeningQuestions((prev) => prev.filter((_, i) => i !== idx));
                                          }}
                                        >
                                          Delete Question
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 4 }}>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Suggested Pre-screening Questions:</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                            {suggestedPreScreeningQuestions.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F0F2F5", paddingBottom: 8 }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: 600 }}>{["Notice Period", "Work Setup", "Asking Salary"][idx]}</span>
                                  <span style={{ color: "#667085" }}>{item}</span>
                                </div>
                                <button
                                  type="button"
                                  className="button-primary-v2"
                                  style={{ color: "#414651", background: "#FFFFFF" }}
                                  onClick={() => {
                                    const lower = item.toLowerCase();
                                    const type: PreScreeningType = lower.includes("salary") ? "range" : "dropdown";
                                    const defaults =
                                      lower.includes("notice period")
                                        ? ["Immediately", "< 30 days", "> 30 days"]
                                        : ["", ""];
                                    setPreScreeningQuestions((prev) => [
                                      ...prev,
                                      {
                                        id: `${Date.now()}-${Math.random()}`,
                                        question: item,
                                        type,
                                        options: type === "dropdown" ? defaults : undefined,
                                        range: type === "range" ? { min: "", max: "", minCurrency: "PHP", maxCurrency: "PHP" } : undefined,
                                      },
                                    ]);
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-lightbulb" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Tips</span>
                      </div>
                      <div className="layered-card-content">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#475467" }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>Add a Secret Prompt</span> to fine-tune how Jia scores and evaluates submitted CVs.
                          </div>
                          <div>
                            <span style={{ fontWeight: 700 }}>Add Pre-Screening questions</span> to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* 1. AI Interview Settings */}
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-robot" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>AI Interview Settings</span>
                      </div>
                      <div className="layered-card-content">
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>AI Interview Screening</span>
                        <span>Jia automatically endorses candidates who meet the chosen criteria.</span>
                        <CustomDropdown
                          onSelectSetting={(setting) => setAiScreeningSetting(setting)}
                          screeningSetting={aiScreeningSetting}
                          settingList={screeningSettingList}
                        />

                        {/* Require Video */}
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #E9EAEB" }}>
                          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                              <i className="la la-video" style={{ color: "#414651", fontSize: 20 }}></i>
                              <span>Require Video Interview</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                              <label className="switch">
                                <input type="checkbox" checked={requireVideo} onChange={() => setRequireVideo(!requireVideo)} />
                                <span className="slider round"></span>
                              </label>
                              <span>{requireVideo ? "Yes" : "No"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Secret Prompt */}
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>AI Interview Secret Prompt</span>
                            <span style={{ color: "#667085" }}>(optional)</span>
                            <span title="These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt." style={{ cursor: "help" }}>
                              <i className="la la-question-circle" style={{ color: "#98A2B3" }}></i>
                            </span>
                          </div>
                          <span>Secret Prompts give you extra control over Jia’s evaluation style, complementing her accurate assessment of requirements from the job description.</span>
                          <textarea
                            className="form-control"
                            placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                            value={aiSecretPrompt}
                            onChange={(e) => setAiSecretPrompt(e.target.value)}
                            style={{ minHeight: 120, resize: "vertical", marginTop: 8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. AI Interview Questions */}
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-comments" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                          </div>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>AI Interview Questions</span>
                          <div style={{ marginLeft: 8, background: "#EEF2F6", borderRadius: 12, padding: "2px 8px", fontSize: 12, color: "#667085" }}>
                            {questions.reduce((acc, c) => acc + (c.questions?.length || 0), 0)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="button-primary-v2"
                          style={{ color: "#FFFFFF", background: "#111827" }}
                          onClick={() => {
                            window.dispatchEvent(new Event("generateAllQuestions"));
                          }}
                        >
                          <span><i className="la la-magic" style={{ fontSize: 17, marginRight: 8 }}></i>Generate all questions</span>
                        </button>
                      </div>
                      <div className="layered-card-content">
                        <InterviewQuestionGeneratorV2 inline questions={questions} setQuestions={(questions) => setQuestions(questions)} jobTitle={jobTitle} description={description} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="layered-card-outer">
                    <div className="layered-card-middle">
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-lightbulb" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Tips</span>
                      </div>
                      <div className="layered-card-content">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#475467" }}>
                          <div>
                            <span style={{ fontWeight: 700 }}>Add a Secret Prompt</span> to fine-tune how Jia scores and evaluates the interview responses.
                          </div>
                          <div>
                            <span style={{ fontWeight: 700 }}>Use “Generate Questions”</span> to quickly create tailored interview questions, then refine or mix them with your own for balanced results.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div style={{ width: "100%", marginTop: 16 }}>
                <div className="layered-card-outer">
                  <div className="layered-card-middle">
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="la la-stream" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                      </div>
                      <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Pipeline Stages</span>
                    </div>
                    <div className="layered-card-content">
                      <span>Pipeline builder is not included in this ticket. Proceed to the next step to review details.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div style={{ width: "100%", marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Collapsible: Career Details & Team Access */}
                <ReviewSection
                  title="Career Details & Team Access"
                  onEdit={() => setCurrentStep(1)}
                  defaultOpen
                >
                  {/* Top: Job Title (full width) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                    <div>
                      <div style={{ color: "#667085" }}>Job Title</div>
                      <div style={{ fontWeight: 600 }}>{jobTitle || "-"}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid #E9EAEB", margin: "16px 0" }}></div>

                  {/* Employment + Work arrangement (align with 3-col layout below) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ color: "#667085" }}>Employment Type</div>
                      <div style={{ fontWeight: 600 }}>{employmentType || "-"}</div>
                    </div>
                    <div>
                      <div style={{ color: "#667085" }}>Work Arrangement</div>
                      <div style={{ fontWeight: 600 }}>{workSetup || "-"}</div>
                    </div>
                    <div></div>
                  </div>
                  <div style={{ borderTop: "1px solid #E9EAEB", margin: "16px 0" }}></div>

                  {/* Location */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ color: "#667085" }}>Country</div>
                      <div style={{ fontWeight: 600 }}>{country || "-"}</div>
                    </div>
                    <div>
                      <div style={{ color: "#667085" }}>State / Province</div>
                      <div style={{ fontWeight: 600 }}>{province || "-"}</div>
                    </div>
                    <div>
                      <div style={{ color: "#667085" }}>City</div>
                      <div style={{ fontWeight: 600 }}>{city || "-"}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid #E9EAEB", margin: "16px 0" }}></div>

                  {/* Salary (align with 3-col layout above) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ color: "#667085" }}>Minimum Salary</div>
                      <div style={{ fontWeight: 600 }}>{salaryNegotiable ? "Negotiable" : (minimumSalary || "0")}</div>
                    </div>
                    <div>
                      <div style={{ color: "#667085" }}>Maximum Salary</div>
                      <div style={{ fontWeight: 600 }}>{salaryNegotiable ? "Negotiable" : (maximumSalary || "0")}</div>
                    </div>
                    <div></div>
                  </div>
                  <div style={{ borderTop: "1px solid #E9EAEB", margin: "16px 0" }}></div>

                  {/* Job Description (full width) */}
                  <div>
                    <div style={{ color: "#667085", marginBottom: 6 }}>Job Description</div>
                    <div dangerouslySetInnerHTML={{ __html: description || "<em>No description</em>" }}></div>
                  </div>

                  {/* Team Access */}
                  <div style={{ borderTop: "1px solid #E9EAEB", margin: "16px 0" }}></div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Team Access</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(teamMembers || []).map((member, idx) => {
                        const isYou = member.email?.toLowerCase() === user?.email?.toLowerCase();
                        const name = isYou ? `${user?.name || member.email} (You)` : (member.email?.split("@")[0] || member.email || "-");
                        const avatar = isYou && user?.image ? user.image : "/user-profile.png";
                        return (
                          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <img src={avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: 600 }}>{name}</span>
                                <span style={{ color: "#667085", fontSize: 14 }}>{member.email}</span>
                              </div>
                            </div>
                            <div style={{ color: "#667085" }}>{member.role || "-"}</div>
                          </div>
                        );
                      })}
                      {(!teamMembers || teamMembers.length === 0) && (
                        <div style={{ color: "#667085" }}>No team members added.</div>
                      )}
                    </div>
                  </div>
                </ReviewSection>

                {/* Collapsible: CV Review & Pre-Screening */}
                <ReviewSection
                  title="CV Review & Pre-Screening Questions"
                  onEdit={() => setCurrentStep(2)}
                  defaultOpen
                >
                  <div><span style={{ color: "#667085" }}>CV Screening</span><br /><span style={{ fontWeight: 600 }}>{screeningSetting}</span></div>
                  {cvSecretPrompt && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="la la-magic" style={{ color: "#9747ff" }}></i>
                        <span style={{ fontWeight: 700 }}>CV Secret Prompt</span>
                      </div>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {cvSecretPrompt
                          .split("\n")
                          .map((line, idx) => line.trim())
                          .filter((line) => line.length > 0)
                          .map((line, idx) => (<li key={idx}>{line}</li>))}
                      </ul>
                    </div>
                  )}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>Pre-Screening Questions</span>
                      <div style={{ marginLeft: 4, background: "#EEF2F6", borderRadius: 12, padding: "0 8px", fontSize: 12, color: "#667085" }}>{preScreeningQuestions.length}</div>
                    </div>
                    {preScreeningQuestions.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                        {preScreeningQuestions.map((q, i) => (
                          <div key={q.id}>
                            <div style={{ fontWeight: 600 }}>{i + 1}. {q.question}</div>
                            <div style={{ color: "#667085" }}>
                              Type: {q.type === "dropdown" ? "Dropdown" : "Range"}
                              {q.type === "dropdown" && (
                                <div>Options: {(q.options || []).filter(o => o?.trim()?.length).join(", ") || "-"}</div>
                              )}
                              {q.type === "range" && (
                                <div>Range: {q.range?.min || "—"} {q.range?.minCurrency || ""} to {q.range?.max || "—"} {q.range?.maxCurrency || ""}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "#667085", marginTop: 6 }}>No pre-screening questions added.</div>
                    )}
                  </div>
                </ReviewSection>

                {/* Collapsible: AI Interview Setup */}
                <ReviewSection
                  title="AI Interview Setup"
                  onEdit={() => setCurrentStep(3)}
                  defaultOpen
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><span style={{ color: "#667085" }}>AI Interview Screening</span><br /><span style={{ fontWeight: 600 }}>{aiScreeningSetting}</span></div>
                    <div><span style={{ color: "#667085" }}>Require Video Interview</span><br /><span style={{ fontWeight: 600 }}>{requireVideo ? "Yes" : "No"}</span></div>
                  </div>
                  {aiSecretPrompt && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="la la-magic" style={{ color: "#9747ff" }}></i>
                        <span style={{ fontWeight: 700 }}>AI Interview Secret Prompt</span>
                      </div>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {aiSecretPrompt
                          .split("\n")
                          .map((line, idx) => line.trim())
                          .filter((line) => line.length > 0)
                          .map((line, idx) => (<li key={idx}>{line}</li>))}
                      </ul>
                    </div>
                  )}
                </ReviewSection>

                {/* Collapsible: Pipeline Stages */}
                <ReviewSection
                  title="Pipeline Stages"
                  onEdit={() => setCurrentStep(4)}
                >
                  <span>Pipeline builder is not included in this ticket. Proceed to the next step to review details.</span>
                </ReviewSection>
              </div>
            )}

            {/* Bottom nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <button
                style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: currentStep === 1 ? "not-allowed" : "pointer" }}
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              >
                Back
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {currentStep === 4 && (
                  <button
                    style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px" }}
                    onClick={() => { setCurrentStep(steps.length); }}
                  >
                    Skip to Review
                  </button>
                )}
                <button
                  style={{ width: "fit-content", background: "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px" }}
                  onClick={() => {
                    if (currentStep === steps.length) {
                      confirmSaveCareer("active");
                    } else {
                      setCurrentStep((s) => Math.min(s + 1, steps.length));
                    }
                  }}
                >
                  {currentStep === steps.length ? "Save & Publish" : "Next"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
            <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="layered-card-outer">
                  <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-suitcase" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                      </div>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Career Information</span>
                      </div>
                      <div className="layered-card-content">
                          <span>Job Title</span>
                          <input
                            value={jobTitle}
                            className="form-control"
                            placeholder="Enter job title"
                            onChange={(e) => {
                              const value = e.target.value;
                              setJobTitle(value);
                              setErrors((prev) => ({ ...prev, jobTitle: "" }));
                            }}
                            onBlur={(e) => {
                              const message = validateField("jobTitle", e.target.value);
                              setErrors((prev) => ({ ...prev, jobTitle: message }));
                            }}
                            style={{
                              border: errors.jobTitle ? "1px solid red" : "1px solid #D1D5DB",
                              outline: "none",
                            }}
                          />
                          {errors.jobTitle && (
                            <span style={{ color: "red", fontSize: "13px" }}>{errors.jobTitle}</span>
                          )}
                          <span>Description</span>
                          <div
                            style={{
                              border: errors.description ? "1px solid red" : "1px solid transparent",
                              borderRadius: "6px",
                              padding: errors.description ? "2px" : "0",
                            }}
                          >
                            <RichTextEditor
                              setText={(text) => {
                                setDescription(text);
                                setErrors((prev) => ({ ...prev, description: "" }));
                              }}
                              text={description}
                            />
                          </div>
                          {errors.description && (
                            <span style={{ color: "red", fontSize: "13px" }}>{errors.description}</span>
                          )}
                      </div>
                  </div>
              </div>

              <InterviewQuestionGeneratorV2 questions={questions} setQuestions={(questions) => setQuestions(questions)} jobTitle={jobTitle} description={description} />
            </div>

            <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="layered-card-outer">
                  <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-cog" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                      </div>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Settings</span>
                      </div>
                      <div className="layered-card-content">
                          <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                             <i className="la la-id-badge" style={{ color: "#414651", fontSize: 20 }}></i>
                             <span>Screening Setting</span>
                          </div>
                          <CustomDropdown
                          onSelectSetting={(setting) => {
                              setScreeningSetting(setting);
                          }}
                          screeningSetting={screeningSetting}
                          settingList={screeningSettingList}
                          />
                          <span>This settings allows Jia to automatically endorse candidates who meet the chosen criteria.</span>
                          <div style={{ display: "flex", flexDirection: "row",justifyContent: "space-between", gap: 8 }}>
                              <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                  <i className="la la-video" style={{ color: "#414651", fontSize: 20 }}></i>
                                  <span>Require Video Interview</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                                  <label className="switch">
                                      <input type="checkbox" checked={requireVideo} onChange={() => setRequireVideo(!requireVideo)} />
                                      <span className="slider round"></span>
                                  </label>
                                  <span>{requireVideo ? "Yes" : "No"}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="layered-card-outer">
                  <div className="layered-card-middle">
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="la la-ellipsis-h" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                      </div>
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Additional Information</span>
                      </div>
                      <div className="layered-card-content">
                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Work Setting</span>
                          <span>Employment Type</span>
                          <CustomDropdown
                          onSelectSetting={(employmentType) => {
                              setEmploymentType(employmentType);
                          }}
                          screeningSetting={employmentType}
                          settingList={employmentTypeOptions}
                          placeholder="Select Employment Type"
                          />

                          <span>Work Setup Arrangement</span>
                          <CustomDropdown
                          onSelectSetting={(setting) => {
                              setWorkSetup(setting);
                          }}
                          screeningSetting={workSetup}
                          settingList={workSetupOptions}
                          placeholder="Select Work Setup"
                          />

                          <span>Work Setup Remarks</span>
                          <input
                            className="form-control"
                            placeholder="Additional remarks about work setup (optional)"
                            value={workSetupRemarks}
                            onChange={(e) => {
                              setWorkSetupRemarks(e.target.value || "");
                            }}
                          ></input>

                          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                              <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Salary</span>

                              <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8, minWidth: "130px" }}>
                                  <label className="switch">
                                      <input type="checkbox" checked={salaryNegotiable} onChange={() => setSalaryNegotiable(!salaryNegotiable)} />
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
                              onChange={(e) => {
                                setMinimumSalary(e.target.value || "");
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
                            onChange={(e) => {
                              setMaximumSalary(e.target.value || "");
                            }}
                          ></input>
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
                          

                          <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Location</span>

                          <span>Country</span>
                          <CustomDropdown
                          onSelectSetting={(setting) => {
                              setCountry(setting);
                          }}
                          screeningSetting={country}
                          settingList={[]}
                          placeholder="Select Country"
                          />

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
              </div>
            </div>
          </div>
        )}
      {showSaveModal && (
         <CareerActionModal action={showSaveModal} onAction={(action) => saveCareer(action)} />
        )}
    {isSavingCareer && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving career..." : "Updating career..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`} />
    )}
    </div>
    )
}