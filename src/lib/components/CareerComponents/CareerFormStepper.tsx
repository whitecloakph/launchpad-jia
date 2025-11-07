import React from "react";

interface CareerFormStepperProps {
  currentStep: number;
  completedSteps: number[];
  invalidSteps?: number[];
}

const steps = [
  { id: 1, name: "Career Details & Team Access" },
  { id: 2, name: "CV Review & Pre-screening" },
  { id: 3, name: "AI Interview Setup" },
  { id: 4, name: "Pipeline Stages" },
  { id: 5, name: "Review Career" },
];

export default function CareerFormStepper({
  currentStep,
  completedSteps,
  invalidSteps = [],
}: CareerFormStepperProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1em",
        margin: "0 auto 32px auto",
        width: "100%",
        maxWidth: "1200px",
      }}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          style={{
            display: "grid",
            gridTemplateRows: "auto auto",
            gap: "12px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Step Icons */}
            {invalidSteps.includes(step.id) && currentStep === step.id ? (
              <img
                src="/career-form/warning-step-icon.svg"
                alt="Warning step"
              />
            ) : completedSteps.includes(step.id) ? (
              <img src="/career-form/done-step-icon.svg" alt="Done step" />
            ) : currentStep === step.id ? (
              <img
                src="/career-form/current-step-icon.svg"
                alt="Current step"
              />
            ) : (
              <img src="/career-form/next-step-icon.svg" alt="Next step" />
            )}

            {/* Step Separator */}
            {index < steps.length - 1 && (
              <div
                style={{
                  height: "6px",
                  borderRadius: "1em",
                  flex: 1,
                  background: completedSteps.includes(step.id)
                    ? "linear-gradient(90deg, rgba(159, 202, 237, 1) 0%, rgba(206, 182, 218, 1) 34%, rgba(235, 172, 201, 1) 67%, rgba(252, 206, 192, 1) 100%)"
                    : currentStep === step.id
                    ? "linear-gradient(90deg, rgba(159, 202, 237, 1) 0%, rgba(206, 182, 218, 1) 17%, rgba(235, 172, 201, 1) 33.5%, rgba(252, 206, 192, 1) 50%, #e9eaeb 50%)"
                    : "#e9eaeb",
                  marginLeft: "8px",
                  transition: "all 0.3s ease",
                }}
              />
            )}
          </div>
          {/* Step Name */}
          <span
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: currentStep === step.id ? "#181D27" : "#6B7280",
              textAlign: "left",
            }}
          >
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
}
