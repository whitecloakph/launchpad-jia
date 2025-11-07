"use client";

import { createContext, useContext, useState, useEffect } from "react";



interface CareerData {
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
    location: string;
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
    updateCareerData: (data: CareerData) => void;
    handleNext: () => void;
    handleBack: () => void;
    setCareerData: (data: CareerData) => void;
}

const intitialCareerData = {
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
    location: "",
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
    updateCareerData: (data: CareerData) => {},
    setCareerData: (data: CareerData) => {},
});

export function CareerFormProvider({ children, existingCareer}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [careerData, setCareerData] = useState(existingCareer || intitialCareerData);

    // Load state from sessionStorage on initial render
    useEffect(() => {
        try {
            const savedStep = sessionStorage.getItem("careerFormStep");
            const savedData = sessionStorage.getItem("careerFormData");
            
            if(savedData && savedStep && !existingCareer) {
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
        }
    }, [currentStep, careerData, existingCareer]);

    const goToStep = (step) => {
        if(step > 0 && step < 4) {
            setCurrentStep(step);
        }
    }

    const handleNext = () => {
        if(currentStep < 4) {
            setCurrentStep((prev) => prev + 1);
        }
    }

    const handleBack = () => {
        if(currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    }

    const updateCareerData = (newData) => {
        setCareerData((prev) => ({ ...prev, ...newData }));
    }

    const values = {
        currentStep,
        careerData,
        goToStep,
        handleNext,
        handleBack,
        updateCareerData,
        setCareerData
    };

    return (
        <CareerFormContext.Provider value={values}>
            {children}
        </CareerFormContext.Provider>
    )
}

export function useCareerForm() {
    const context = useContext(CareerFormContext);
    if (!context) {
        throw new Error("useCareerForm must be used within a CareerFormProvider");
    }
    return context;
}
