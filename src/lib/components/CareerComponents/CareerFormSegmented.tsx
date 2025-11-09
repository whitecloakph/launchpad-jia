"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import CareerFormStepper from "./CareerFormStepper";
import CareerFormStep1 from "./CareerFormStep1";
import CareerFormStep2 from "./CareerFormStep2";
import CareerFormStep3 from "./CareerFormStep3";
import CareerFormStep4 from "./CareerFormStep4";
import CareerFormStep5 from "./CareerFormStep5";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import axios from "axios";
import { candidateActionToast, errorToast } from "@/lib/Utils";

const getInitialFormData = () => ({
  jobTitle: "",
  description: "",
  employmentType: "Full-Time",
  workSetup: "",
  workSetupRemarks: "",
  country: "Philippines",
  province: "",
  city: "",
  salaryNegotiable: true,
  minimumSalary: "",
  maximumSalary: "",
  screeningSetting: "Good Fit and above",
  prescreeningQuestions: [],
  questions: [
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
  ],
  requireVideo: true,
  isUnpublished: false,
});

interface CareerFormSegmentedProps {
  career?: any;
  formType: string;
}

export default function CareerFormSegmented({
  career,
  formType,
}: CareerFormSegmentedProps) {
  const { user, orgID } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [invalidSteps, setInvalidSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState("");
  const [triggerValidation, setTriggerValidation] = useState(false);
  const savingRef = useRef(false);

  const [formData, setFormData] = useState(career || getInitialFormData());

  useEffect(() => {
    if (career) {
      setFormData(career);
      const completed = [];
      if (career.jobTitle && career.description && career.workSetup)
        completed.push(1);
      if (career.screeningSetting) completed.push(2);
      if (career.questions?.some((q: any) => q.questions.length > 0))
        completed.push(3);
      completed.push(4);
      setCompletedSteps(completed);
    }
  }, [career]);

  const updateFormData = useCallback(
    (updates: any) => {
      setFormData((prev: any) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleStepChange = (step: number) => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    handleStepChange(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFormValid = () => {
    return (
      formData.jobTitle?.trim().length > 0 &&
      formData.description?.trim().length > 0 &&
      formData.questions?.some((q: any) => q.questions.length > 0) &&
      formData.workSetup?.trim().length > 0
    );
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
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
      case 2:
        // Step 2: No validation required
        return true;
      case 3:
        // Step 3: Require at least 5 interview questions total
        const totalQuestions =
          formData.questions?.reduce(
            (acc: number, group: any) => acc + group.questions.length,
            0
          ) || 0;
        return totalQuestions >= 5;
      case 4:
        // Step 4: No validation required
        return true;
      default:
        return false;
    }
  };

  const handleSaveContinue = () => {
    if (currentStep === 5) {
      // On final step, save as draft
      confirmSaveCareer("inactive");
    } else {
      // Trigger validation for step 1 and step 3
      if (currentStep === 1 || currentStep === 3) {
        setTriggerValidation(true);
        // Check if current step is valid after triggering validation
        setTimeout(() => {
          if (isCurrentStepValid()) {
            // Remove from invalid steps if valid
            setInvalidSteps(
              invalidSteps.filter((step) => step !== currentStep)
            );
            handleNext();
            setTriggerValidation(false);
          } else {
            // Add to invalid steps if not valid
            if (!invalidSteps.includes(currentStep)) {
              setInvalidSteps([...invalidSteps, currentStep]);
            }
          }
        }, 100);
      } else {
        // For other steps, just check validity
        if (isCurrentStepValid()) {
          handleNext();
        }
      }
    }
  };

  const confirmSaveCareer = (status: string) => {
    if (
      Number(formData.minimumSalary) &&
      Number(formData.maximumSalary) &&
      Number(formData.minimumSalary) > Number(formData.maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    setShowSaveModal(status);
  };

  const saveCareer = async (status: string) => {
    setShowSaveModal("");
    if (!status || savingRef.current) {
      return;
    }

    setIsSaving(true);
    savingRef.current = true;

    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };

    const careerData = {
      jobTitle: formData.jobTitle,
      description: formData.description,
      workSetup: formData.workSetup,
      workSetupRemarks: formData.workSetupRemarks,
      questions: formData.questions,
      prescreeningQuestions: formData.prescreeningQuestions || [],
      lastEditedBy: userInfoSlice,
      createdBy: userInfoSlice,
      screeningSetting: formData.screeningSetting,
      orgID,
      requireVideo: formData.requireVideo,
      salaryNegotiable: formData.salaryNegotiable,
      minimumSalary: isNaN(Number(formData.minimumSalary))
        ? null
        : Number(formData.minimumSalary),
      maximumSalary: isNaN(Number(formData.maximumSalary))
        ? null
        : Number(formData.maximumSalary),
      country: formData.country,
      province: formData.province,
      location: formData.city,
      status,
      employmentType: formData.employmentType,
      isUnpublished: status === "inactive",
      currentStep: 5,
    };

    try {
      const response = await axios.post("/api/add-career", careerData);
      if (response.status === 200) {
        candidateActionToast(
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginLeft: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
              Career {status === "active" ? "published" : "saved as draft"}
            </span>
          </div>,
          1300,
          <i
            className="la la-check-circle"
            style={{ color: "#039855", fontSize: 32 }}
          ></i>
        );
        setTimeout(() => {
          window.location.href = `/recruiter-dashboard/careers`;
        }, 1300);
      }
    } catch (error) {
      errorToast("Failed to save career", 1300);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const updateCareer = async (status: string) => {
    if (
      Number(formData.minimumSalary) &&
      Number(formData.maximumSalary) &&
      Number(formData.minimumSalary) > Number(formData.maximumSalary)
    ) {
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
      jobTitle: formData.jobTitle,
      description: formData.description,
      workSetup: formData.workSetup,
      workSetupRemarks: formData.workSetupRemarks,
      questions: formData.questions,
      prescreeningQuestions: formData.prescreeningQuestions || [],
      lastEditedBy: userInfoSlice,
      status,
      updatedAt: Date.now(),
      screeningSetting: formData.screeningSetting,
      requireVideo: formData.requireVideo,
      salaryNegotiable: formData.salaryNegotiable,
      minimumSalary: isNaN(Number(formData.minimumSalary))
        ? null
        : Number(formData.minimumSalary),
      maximumSalary: isNaN(Number(formData.maximumSalary))
        ? null
        : Number(formData.maximumSalary),
      country: formData.country,
      province: formData.province,
      location: formData.city,
      employmentType: formData.employmentType,
      isUnpublished: status === "inactive",
    };

    try {
      setIsSaving(true);
      const response = await axios.post("/api/update-career", updatedCareer);
      if (response.status === 200) {
        candidateActionToast(
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginLeft: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
              Career updated
            </span>
          </div>,
          1300,
          <i
            className="la la-check-circle"
            style={{ color: "#039855", fontSize: 32 }}
          ></i>
        );
        setTimeout(() => {
          window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
        }, 1300);
      }
    } catch (error) {
      console.error(error);
      errorToast("Failed to update career", 1300);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep1ValidationChange = (isValid: boolean) => {
    setInvalidSteps((prev) => {
      if (isValid) {
        return prev.filter((step) => step !== 1);
      } else if (!prev.includes(1)) {
        return [...prev, 1];
      }
      return prev;
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CareerFormStep1
            formData={formData}
            updateFormData={updateFormData}
            onValidationChange={handleStep1ValidationChange}
            triggerValidation={triggerValidation}
          />
        );
      case 2:
        return (
          <CareerFormStep2
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <CareerFormStep3
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            showValidation={triggerValidation}
          />
        );
      case 4:
        return <CareerFormStep4 />;
      case 5:
        return (
          <CareerFormStep5 formData={formData} onEditStep={handleEditStep} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="col">
      <div
        style={{
          marginBottom: "35px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>
          {formType === "add" ? "Add new career" : "Edit Career Details"}
        </h1>
        {currentStep !== 5 && (
          <div
            style={{
              height: "40px",
              display: "flex",
              gap: "1em",
            }}
          >
            <button
              onClick={() => confirmSaveCareer("inactive")}
              style={{
                border: "2px solid #d5d7da",
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "#414651",
                borderRadius: "2em",
                paddingLeft: "1em",
                paddingRight: "1em",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Save as Unpublished
            </button>
            <button
              onClick={handleSaveContinue}
              style={{
                borderColor: "#181d27",
                backgroundColor: "#181d27",
                color: "#fff",
                borderRadius: "2em",
                paddingLeft: "1em",
                paddingRight: "1em",
                fontWeight: "450",
                cursor: "pointer",
              }}
            >
              Save and Continue
              <i
                className="la la-arrow-right"
                style={{
                  scale: 1.5,
                  marginLeft: "0.75em",
                }}
              ></i>
            </button>
          </div>
        )}
        {currentStep === 5 && formType === "add" && (
          <div
            style={{
              height: "40px",
              display: "flex",
              gap: "1em",
            }}
          >
            <button
              disabled={!isFormValid() || isSaving}
              style={{
                border: "2px solid #d5d7da",
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "#414651",
                borderRadius: "2em",
                paddingLeft: "1em",
                paddingRight: "1em",
                fontWeight: "500",
                cursor: !isFormValid() || isSaving ? "not-allowed" : "pointer",
              }}
              onClick={() => {
                confirmSaveCareer("inactive");
              }}
            >
              Save as Unpublished
            </button>
            <button
              disabled={!isFormValid() || isSaving}
              style={{
                borderColor: "#181d27",
                backgroundColor: "#181d27",
                color: "#fff",
                borderRadius: "2em",
                paddingLeft: "1em",
                paddingRight: "1em",
                fontWeight: "450",
                background: !isFormValid() || isSaving ? "#D5D7DA" : "black",
                cursor: !isFormValid() || isSaving ? "not-allowed" : "pointer",
              }}
              onClick={() => {
                confirmSaveCareer("active");
              }}
            >
              <i
                className="la la-check-circle"
                style={{ color: "#fff", fontSize: 20, marginRight: 8 }}
              ></i>
              Publish
            </button>
          </div>
        )}
      </div>

      <CareerFormStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        invalidSteps={invalidSteps}
      />

      {renderStep()}

      {showSaveModal && (
        <CareerActionModal
          action={showSaveModal}
          onAction={(action) =>
            formType === "add" ? saveCareer(action) : updateCareer(action)
          }
        />
      )}
      {isSaving && (
        <FullScreenLoadingAnimation
          title={formType === "add" ? "Saving career..." : "Updating career..."}
          subtext={`Please wait while we are ${
            formType === "add" ? "saving" : "updating"
          } the career`}
        />
      )}
    </div>
  );
}
