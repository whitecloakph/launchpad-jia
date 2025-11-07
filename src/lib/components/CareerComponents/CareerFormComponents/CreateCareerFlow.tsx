"use client";

import { CareerFormProvider, useCareerForm } from '@/lib/context/CareerFormContext';
import StepIndicator from '../../StepIndicator';
import CareerDetails from './CareerDetails';
import CVReview from './CVReview';
import AIInterview from './AIInterview';
import ReviewCareer from './ReviewCareer';
import NavigationButtons from './NavigationButtons';
import CareerActionModal from '@/lib/components/CareerComponents/CareerActionModal'; // Ensure this path is correct
import FullScreenLoadingAnimation from '@/lib/components/CareerComponents/FullScreenLoadingAnimation'; // Ensure this path is correct

function CreateCareerFlowContent({ formType, career }) {
    const {
        currentStep,
        showSaveModal,
        isSavingCareer,
        saveCareer,     // Used if formType is "add"
        updateCareer,   // Used if formType is "edit"
        // No need for confirmSaveCareer here, it's called by NavigationButtons
    } = useCareerForm();

    const steps = [
        { name: "Career Details", component: <CareerDetails /> },
        { name: "CV Review", component: <CVReview /> },
        { name: "AI Interview", component: <AIInterview /> },
        { name: "Review Career", component: <ReviewCareer /> },
    ];

    const renderStepComponent = () => {
        switch (currentStep) {
            case 1:
                return <CareerDetails />;
            case 2:
                return <CVReview />;
            case 3:
                return <AIInterview />;
            case 4:
                return <ReviewCareer />;
            default:
                return <CareerDetails />;
        }
    }

    return (
        <div className="col">
             <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827", marginBottom: "2rem" }}>
                {formType === "add" ? "Add New Career" : "Edit Career"}
            </h1>
            <StepIndicator steps={steps.map((step) => step.name)} currentStep={currentStep} />
            <div style={{ marginTop: "2rem" }}>
                {renderStepComponent()}
            </div>
            <NavigationButtons formType={formType} />

            {/* Render modals and loading animation at the top level */}
            {showSaveModal && (
                <CareerActionModal
                    action={showSaveModal}
                    onAction={(action) =>
                        formType === "add" ? saveCareer(action) : updateCareer(action)
                    }
                />
            )}
            {isSavingCareer && (
                <FullScreenLoadingAnimation
                    title={formType === "add" ? "Saving career..." : "Updating career..."}
                    subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`}
                />
            )}
        </div>
    );
}

export default function CreateCareerFlow({ formType, career }: { formType: string, career?: any }) {
    return (
        <CareerFormProvider existingCareer={career}>
            <CreateCareerFlowContent formType={formType} career={career} />
        </CareerFormProvider>
    );
}