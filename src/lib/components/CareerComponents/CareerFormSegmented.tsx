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
import styles from "@/lib/styles/screens/careerFormSegmented.module.scss";

const getInitialFormData = () => ({
  jobTitle: "",
  description: "",
  employmentType: "",
  workSetup: "",
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
  teamAccess: []
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
  const [validatedSteps, setValidatedSteps] = useState<number[]>([]);
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

      // For existing careers, mark all completed steps as validated
      setValidatedSteps(completed);
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
          ) &&
          formData.teamAccess?.length >= 1 &&
          formData.teamAccess?.some((m: any) => m.role === "Job Owner")
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
            // Add to validated steps
            if (!validatedSteps.includes(currentStep)) {
              setValidatedSteps([...validatedSteps, currentStep]);
            }
            handleNext();
            setTriggerValidation(false);
          } else {
            // Add to invalid steps if not valid
            if (!invalidSteps.includes(currentStep)) {
              setInvalidSteps([...invalidSteps, currentStep]);
            }
            // Remove from validated steps if invalid
            setValidatedSteps(validatedSteps.filter((step) => step !== currentStep));
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
      teamAccess: formData.teamAccess || [],
    };

    try {
      const response = await axios.post("/api/add-career", careerData);
      if (response.status === 200) {
        candidateActionToast(
          <div className={styles.toastContainer}>
            <span className={styles.toastText}>
              Career {status === "active" ? "published" : "saved as draft"}
            </span>
          </div>,
          1300,
          <i className={`la la-check-circle ${styles.toastIcon}`}></i>
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
      teamAccess: formData.teamAccess || [],
    };

    try {
      setIsSaving(true);
      const response = await axios.post("/api/update-career", updatedCareer);
      if (response.status === 200) {
        candidateActionToast(
          <div className={styles.toastContainer}>
            <span className={styles.toastText}>
              Career updated
            </span>
          </div>,
          1300,
          <i className={`la la-check-circle ${styles.toastIcon}`}></i>
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

    setValidatedSteps((prev) => {
      if (isValid && !prev.includes(1)) {
        return [...prev, 1];
      } else if (!isValid) {
        return prev.filter((step) => step !== 1);
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

  const renderTitle = (): string => (currentStep !== 1 && formData.jobTitle) ? `[Draft] ${formData.jobTitle}` : "Add new career";

  return (
    <div className="col">
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          {formType === "add" ? renderTitle(): "Edit Career Details"}
        </h1>
        {currentStep !== 5 && (
          <div className={styles.buttonContainer}>
            <button
              onClick={() => confirmSaveCareer("inactive")}
              className={styles.saveUnpublishedBtn}
            >
              Save as Unpublished
            </button>
            <button
              onClick={handleSaveContinue}
              className={styles.saveContinueBtn}
            >
              Save and Continue
              <i className={`la la-arrow-right ${styles.continueIcon}`}></i>
            </button>
          </div>
        )}
        {currentStep === 5 && formType === "add" && (
          <div className={styles.buttonContainer}>
            <button
              disabled={!isFormValid() || isSaving}
              className={styles.saveUnpublishedBtn}
              onClick={() => {
                confirmSaveCareer("inactive");
              }}
            >
              Save as Unpublished
            </button>
            <button
              disabled={!isFormValid() || isSaving}
              className={styles.publishBtn}
              onClick={() => {
                confirmSaveCareer("active");
              }}
            >
              <i className={`la la-check-circle ${styles.checkIcon}`}></i>
              Publish
            </button>
          </div>
        )}
      </div>

      <CareerFormStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        invalidSteps={invalidSteps}
        validatedSteps={validatedSteps}
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
