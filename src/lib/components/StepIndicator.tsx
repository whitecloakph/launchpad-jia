import styles from '@/lib/styles/components/StepIndicator.module.scss';
import { assetConstants } from '@/lib/utils/constantsV2';

export default function StepIndicator({ steps, currentStep }) {
    const getStatus = (index) => {
        if (index < currentStep - 1) return "completed";
        if (index === currentStep - 1) return "in_progress";
        return "pending";
    };

    const getIcon = (status) => {
        if (status === "completed") return assetConstants.checkV3;
        // For 'in_progress' and 'pending', we'll use the step number or a different icon within the circle
        return null;
    };

    return (
        <div className={styles.stepContainer}>
            <div className={styles.step}>
                {steps.map((_, index) => (
                    <div className={styles.stepBar} key={index}>
                        <div className={`${styles.stepIcon} ${styles[getStatus(index)]}`}>
                            {getStatus(index) === "completed" ? (
                                <img src={getIcon("completed")} alt="completed" />
                            ) : (
                                index + 1 // Display step number for pending/in-progress
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <hr className={styles[getStatus(index)]} />
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.step}>
                {steps.map((item, index) => (
                    <span className={`${styles.stepDetails} ${styles[getStatus(index)]}`} key={index}>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

