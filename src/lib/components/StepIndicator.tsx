import styles from '@/lib/styles/screens/uploadCV.module.scss';
import { assetConstants } from '@/lib/utils/constantsV2';

export default function StepIndicator({ steps, currentStep }) {
    const getStatus = (index) => {
        if (index < currentStep - 1) return "completed";
        if (index === currentStep - 1) return "in_progress";
        return "pending";
    }
    
    const getIcon = (status) => {
        if (status === "completed") return assetConstants.completed;
        if (status === "in_progress") return assetConstants.in_progress;
        return assetConstants.pending;
    }

    return (
        <div className={styles.stepContainer}>
            <div className={styles.step}>
                {steps.map((_, index) => (
                    <div className={styles.stepBar} key={index}>
                        <img src={getIcon(getStatus(index))} alt="step" />
                        {index < steps.length - 1 && (
                            <hr className={styles[getStatus(getStatus(index))]} />
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.step}>
                {steps.map((step, index) => (
                    <span className={`${styles.stepDetails} ${styles[getStatus(index)]}`} key={index}>
                        {step}
                    </span>
                ))}
            </div>
        </div>
    )
}

