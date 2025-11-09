"use client";

import styles from "@/lib/styles/screens/careerFormStep4.module.scss";

// Define pipeline stages data
const pipelineStages = [
  {
    name: "CV Screening",
    icon: "la-user-check",
    isCore: true,
    substages: [
      { name: "Waiting Submission", hasAutomation: true },
      { name: "For Review", hasAutomation: true },
    ],
  },
  {
    name: "AI Interview",
    icon: "la-microphone",
    isCore: true,
    substages: [
      { name: "Waiting Interview", hasAutomation: true },
      { name: "For Review", hasAutomation: true },
    ],
  },
  {
    name: "Final Human Interview",
    icon: "la-users",
    isCore: true,
    substages: [
      { name: "Waiting Schedule", hasAutomation: true },
      { name: "Waiting Interview", hasAutomation: true },
      { name: "For Review", hasAutomation: true },
    ],
  },
  {
    name: "Job Offer",
    icon: "la-file-contract",
    isCore: true,
    substages: [
      { name: "For Final Review", hasAutomation: true },
      { name: "Waiting Offer Acceptance", hasAutomation: true },
      { name: "For Contract Signing", hasAutomation: true },
      { name: "Hired", hasAutomation: true },
    ],
  },
];

export default function CareerFormStep4() {
  return (
    <div className={styles.mainContainer}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h2 className={styles.headerTitle}>Customize pipeline stages</h2>
          <p className={styles.headerDescription}>
            Create, modify, reorder, and delete stages and sub-stages. Core
            stages are fixed and can't be moved or edited as they are essential
            to Jia's system logic.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton}>
            <i className="la la-redo"></i>
            Restore to default
          </button>
          <button className={styles.actionButtonPrimary}>
            Copy pipeline from existing job
            <i className="la la-angle-down"></i>
          </button>
        </div>
      </div>

      {/* Pipeline Stages Grid */}
      <div className={styles.pipelineGrid}>
        {pipelineStages.slice(0, 2).map((stage, stageIndex) => (
          <div key={stageIndex} className={styles.stageColumn}>
            {/* Core stage notice */}
            <div className={styles.coreStageNotice}>
              <i className="la la-lock" style={{ fontSize: 16 }}></i>
              Core stage, cannot move
            </div>

            {/* Stage Card */}
            <div className={styles.stageCard}>
              {/* Stage Header */}
              <div className={styles.stageHeader}>
                <div className={styles.stageHeaderLeft}>
                  <i className={`la ${stage.icon} ${styles.stageIcon}`}></i>
                  <span className={styles.stageName}>{stage.name}</span>
                  <i
                    className={`la la-question-circle ${styles.stageHelpIcon}`}
                  ></i>
                </div>
                <div className={styles.stageHeaderRight}>
                  <i className={`la la-ellipsis-v ${styles.stageMenuIcon}`}></i>
                  <i className={`la la-lock ${styles.stageLockIcon}`}></i>
                </div>
              </div>

              {/* Substages Label */}
              <div className={styles.substagesLabel}>Substages</div>

              {/* Substages List */}
              <div className={styles.substagesList}>
                {stage.substages.map((substage, substageIndex) => (
                  <div key={substageIndex} className={styles.substageItem}>
                    <span className={styles.substageName}>
                      {substage.name}
                    </span>
                    {substage.hasAutomation && (
                      <div className={styles.automationBadge}>
                        <i className={`la la-bolt ${styles.automationIcon}`}></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add Stage Button - positioned in 3rd column */}
        <div className={styles.addStageButtonWrapper}>
          <button className={styles.addStageButton}>+</button>
        </div>

        {pipelineStages.slice(2, 4).map((stage, stageIndex) => (
          <div key={stageIndex + 2} className={styles.stageColumn}>
            {/* Core stage notice */}
            <div className={styles.coreStageNotice}>
              <i className="la la-lock" style={{ fontSize: 16 }}></i>
              Core stage, cannot move
            </div>

            {/* Stage Card */}
            <div className={styles.stageCard}>
              {/* Stage Header */}
              <div className={styles.stageHeader}>
                <div className={styles.stageHeaderLeft}>
                  <i className={`la ${stage.icon} ${styles.stageIcon}`}></i>
                  <span className={styles.stageName}>{stage.name}</span>
                  <i
                    className={`la la-question-circle ${styles.stageHelpIcon}`}
                  ></i>
                </div>
                <div className={styles.stageHeaderRight}>
                  <i className={`la la-ellipsis-v ${styles.stageMenuIcon}`}></i>
                  <i className={`la la-lock ${styles.stageLockIcon}`}></i>
                </div>
              </div>

              {/* Substages Label */}
              <div className={styles.substagesLabel}>Substages</div>

              {/* Substages List */}
              <div className={styles.substagesList}>
                {stage.substages.map((substage, substageIndex) => (
                  <div key={substageIndex} className={styles.substageItem}>
                    <span className={styles.substageName}>
                      {substage.name}
                    </span>
                    {substage.hasAutomation && (
                      <div className={styles.automationBadge}>
                        <i className={`la la-bolt ${styles.automationIcon}`}></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
