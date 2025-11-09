import styles from "@/lib/styles/screens/careerFormStepper.module.scss";

interface CareerFormStepperProps {
  currentStep: number;
  completedSteps: number[];
  invalidSteps?: number[];
  validatedSteps?: number[];
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
  validatedSteps = [],
}: CareerFormStepperProps) {
  return (
    <div className={styles.stepperContainer}>
      {steps.map((step, index) => (
        <div key={step.id} className={styles.stepWrapper}>
          <div className={styles.stepHeader}>
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
                className={`${styles.stepSeparator} ${
                  completedSteps.includes(step.id)
                    ? styles.completed
                    : currentStep === step.id && validatedSteps.includes(step.id)
                    ? styles.current
                    : styles.upcoming
                }`}
              />
            )}
          </div>
          {/* Step Name */}
          <span
            className={`${styles.stepName} ${
              currentStep === step.id ? styles.active : styles.inactive
            }`}
          >
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
}
