"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "./AppContext";

interface CareerData {
  _id?: string; // Add _id for existing careers
  jobTitle: string;
  description: string;
  employmentType: string;
  workSetup: string;
  workSetupRemarks: string;
  salaryNegotiable: boolean;
  minimumSalary: string;
  maximumSalary: string;
  country: string;
  province: string;
  location: string; // This will map to 'city' from the form
  teamAccess: string[];

  // CV Review
  screeningSetting: string;
  cvSecretPrompt: string;
  prescreeningQuestions: any[]; // { id, type: 'text' | 'choice', text, options: [] }

  // AI Interview
  aiEndorsementSetting: string;
  requireVideo: boolean;
  aiInterviewSecretPrompt: string;
  questions: any[];
}

interface CareerFormContextType {
  careerData: CareerData;
  currentStep: number;
  goToStep: (step: number) => void;
  updateCareerData: (data: Partial<CareerData>) => void; // Changed to Partial
  handleNext: () => void;
  handleBack: () => void;
  setCareerData: (data: CareerData) => void; // Added for initial data setup
  isSavingCareer: boolean;
  showSaveModal: string;
  confirmSaveCareer: (status: string) => void;
  saveCareer: (status: string) => Promise<void>;
  updateCareer: (status: string) => Promise<void>;
  isFormValid: () => boolean; // Added for form validation logic
}

const intitialCareerData: CareerData = {
  // Career Details
  jobTitle: "",
  description: "",
  employmentType: "Full-Time",
  workSetup: "",
  workSetupRemarks: "",
  salaryNegotiable: true,
  minimumSalary: "",
  maximumSalary: "",
  country: "Philippines",
  province: "",
  location: "", // This will map to 'city' from the form
  teamAccess: [],

  // CV Review
  screeningSetting: "Good Fit and above",
  cvSecretPrompt: "",
  prescreeningQuestions: [], // { id, type: 'text' | 'choice', text, options: [] }

  // AI Interview
  aiEndorsementSetting: "Good Fit and above",
  requireVideo: true,
  aiInterviewSecretPrompt: "",
  questions: [
    { id: 1, category: "CV Validation / Experience", questions: [] },
    { id: 2, category: "Technical", questions: [] },
    { id: 3, category: "Behavioral", questions: [] },
    { id: 4, category: "Analytical", questions: [] },
    { id: 5, category: "Others", questions: [] },
  ],
};

export const CareerFormContext = createContext<CareerFormContextType>({
  careerData: intitialCareerData,
  currentStep: 1,
  handleNext: () => {},
  handleBack: () => {},
  goToStep: (step: number) => {},
  updateCareerData: (data: Partial<CareerData>) => {},
  setCareerData: (data: CareerData) => {},
  isSavingCareer: false,
  showSaveModal: "",
  confirmSaveCareer: () => {},
  saveCareer: async () => {},
  updateCareer: async () => {},
  isFormValid: () => false, // Default implementation
});

export function CareerFormProvider({ children, existingCareer }) {
  const { user, orgID } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [careerData, setCareerData] = useState<CareerData>(
    existingCareer || intitialCareerData,
  );
  const [isSavingCareer, setIsSavingCareer] = useState(false);
  const savingCareerRef = useRef(false);
  const [showSaveModal, setShowSaveModal] = useState("");

  // Load state from sessionStorage on initial render
  useEffect(() => {
    try {
      const savedStep = sessionStorage.getItem("careerFormStep");
      const savedData = sessionStorage.getItem("careerFormData");

      if (savedData && savedStep && !existingCareer) {
        setCurrentStep(JSON.parse(savedStep));
        setCareerData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading state from sessionStorage:", error);
      sessionStorage.removeItem("careerFormStep");
      sessionStorage.removeItem("careerFormData");
    }
  }, [existingCareer]);

  useEffect(() => {
    if (!existingCareer) {
      sessionStorage.setItem("careerFormStep", JSON.stringify(currentStep));
      sessionStorage.setItem("careerFormData", JSON.stringify(careerData));
    } else {
      // When existingCareer is present (edit mode), update the form data initially
      setCareerData(existingCareer);
    }
  }, [currentStep, careerData, existingCareer]);

  const goToStep = (step: number) => {
    if (step > 0 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateCareerData = (newData: Partial<CareerData>) => {
    setCareerData((prev) => ({ ...prev, ...newData }));
  };

  const isFormValid = () => {
    const { jobTitle, description, questions, workSetup, minimumSalary, maximumSalary } =
      careerData;
    // Basic validation for core fields
    const questionsAreValid = questions.some((q) => q.questions.length > 0);
    const salaryIsValid =
      (!Number(minimumSalary) && !Number(maximumSalary)) ||
      (Number(minimumSalary) <= Number(maximumSalary));

    return (
      jobTitle?.trim().length > 0 &&
      description?.trim().length > 0 &&
      questionsAreValid &&
      workSetup?.trim().length > 0 &&
      salaryIsValid
    );
  };

  const confirmSaveCareer = (status: string) => {
    if (
      Number(careerData.minimumSalary) &&
      Number(careerData.maximumSalary) &&
      Number(careerData.minimumSalary) > Number(careerData.maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    setShowSaveModal(status);
  };

  const saveCareer = async (status: string) => {
    setShowSaveModal(""); // Close the modal
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

      const careerToSave = {
        jobTitle: careerData.jobTitle,
        description: careerData.description,
        workSetup: careerData.workSetup,
        workSetupRemarks: careerData.workSetupRemarks,
        questions: careerData.questions,
        lastEditedBy: userInfoSlice,
        createdBy: userInfoSlice,
        screeningSetting: careerData.screeningSetting,
        orgID,
        requireVideo: careerData.requireVideo,
        salaryNegotiable: careerData.salaryNegotiable,
        minimumSalary: isNaN(Number(careerData.minimumSalary))
          ? null
          : Number(careerData.minimumSalary),
        maximumSalary: isNaN(Number(careerData.maximumSalary))
          ? null
          : Number(careerData.maximumSalary),
        country: careerData.country,
        province: careerData.province,
        location: careerData.location, // Assuming careerData.location is the city
        status,
        employmentType: careerData.employmentType,
      };

      try {
        const response = await axios.post("/api/add-career", careerToSave);
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
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#181D27",
                }}
              >
                Career added {status === "active" ? "and published" : ""}
              </span>
            </div>,
            1300,
            <i
              className="la la-check-circle"
              style={{ color: "#039855", fontSize: 32 }}
            ></i>,
          );
          sessionStorage.removeItem("careerFormStep"); // Clear session storage on success
          sessionStorage.removeItem("careerFormData");
          setTimeout(() => {
            window.location.href = `/recruiter-dashboard/careers`;
          }, 1300);
        }
      } catch (error) {
        console.error(error);
        errorToast("Failed to add career", 1300);
      } finally {
        savingCareerRef.current = false;
        setIsSavingCareer(false);
      }
    }
  };

  const updateCareer = async (status: string) => {
    setShowSaveModal(""); // Close the modal
    if (
      Number(careerData.minimumSalary) &&
      Number(careerData.maximumSalary) &&
      Number(careerData.minimumSalary) > Number(careerData.maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
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
      const updatedCareer = {
        _id: careerData._id, // Ensure _id is passed for update
        jobTitle: careerData.jobTitle,
        description: careerData.description,
        workSetup: careerData.workSetup,
        workSetupRemarks: careerData.workSetupRemarks,
        questions: careerData.questions,
        lastEditedBy: userInfoSlice,
        status,
        updatedAt: Date.now(),
        screeningSetting: careerData.screeningSetting,
        requireVideo: careerData.requireVideo,
        salaryNegotiable: careerData.salaryNegotiable,
        minimumSalary: isNaN(Number(careerData.minimumSalary))
          ? null
          : Number(careerData.minimumSalary),
        maximumSalary: isNaN(Number(careerData.maximumSalary))
          ? null
          : Number(careerData.maximumSalary),
        country: careerData.country,
        province: careerData.province,
        location: careerData.location, // Assuming careerData.location is the city
        employmentType: careerData.employmentType,
      };
      try {
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
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#181D27",
                }}
              >
                Career updated
              </span>
            </div>,
            1300,
            <i
              className="la la-check-circle"
              style={{ color: "#039855", fontSize: 32 }}
            ></i>,
          );
          sessionStorage.removeItem("careerFormStep"); // Clear session storage on success
          sessionStorage.removeItem("careerFormData");
          setTimeout(() => {
            window.location.href = `/recruiter-dashboard/careers/manage/${careerData._id}`;
          }, 1300);
        }
      } catch (error) {
        console.error(error);
        errorToast("Failed to update career", 1300);
      } finally {
        savingCareerRef.current = false;
        setIsSavingCareer(false);
      }
    }
  };

  const values = {
    currentStep,
    careerData,
    goToStep,
    handleNext,
    handleBack,
    updateCareerData,
    setCareerData,
    isSavingCareer,
    showSaveModal,
    confirmSaveCareer,
    saveCareer,
    updateCareer,
    isFormValid,
  };

  return (
    <CareerFormContext.Provider value={values}>
      {children}
    </CareerFormContext.Provider>
  );
}

export function useCareerForm() {
  const context = useContext(CareerFormContext);
  if (!context) {
    throw new Error("useCareerForm must be used within a CareerFormProvider");
  }
  return context;
}