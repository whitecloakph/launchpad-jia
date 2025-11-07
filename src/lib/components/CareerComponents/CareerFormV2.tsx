"use client";

import "@/lib/styles/commonV2/globals.scss";

import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerForm.module.scss";
import { CareerFormProps } from "./CareerForm";
import { useState } from "react";
import CustomDropdownV2 from "@/lib/components/Dropdown/CustomDropdownV2";
import SalaryInput from "@/lib/components/CareerComponents/SalaryInput";
import RichTextEditor from "./RichTextEditor";
import AvatarImage from "../AvatarImage/AvatarImage";

export default function CareerFormV2({
  career,
  formType,
  setShowEditModal,
}: CareerFormProps) {
  const formSteps = [
    "Career Details & Team Access",
    "CV Review & Pre-screening",
    "AI Interview Setup",
    "Pipeline Stages",
    "Review Center"
  ] as const;

  const [currentStep, setCurrentStep] = useState<number>(0);

  // FIXME: should use the provided geo data
  const [province, setProvince] = useState<string>(""); 
  const [city, setCity] = useState<string>("");

  const [employmentType, setEmploymentType] = useState<string>("");
  const [workArrangement, setWorkArrangement] = useState<string>("");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [salaryCurrency, setSalaryCurrency] = useState<string>("PHP");
  const [description, setDescription] = useState<string>("");
  const [authorizedMember, setAuthorizedMember] = useState<string>("");

  const getStepStatus = (stepIndex: number): "completed" | "in_progress" | "pending" => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "in_progress";
    return "pending";
  };

  const handleSaveAndContinue = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const employmentTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ];

  const workArrangementOptions = [
    "On-site",
    "Hybrid",
    "Remote",
  ];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "35px", display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>
          {/* FIXME: should change to `[Draft] ${Job Title}` */}
          Add new career
        </h1>

        <div className={styles.buttonContainer}>
          <button className={`${styles.actionButton} ${styles.secondary} ${styles.disabled}`} disabled>
            Save as Unpublished
          </button>

          <button className={styles.actionButton} onClick={handleSaveAndContinue}>
            Save and Continue
            <img alt="arrow" src={assetConstants.arrow} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className={styles.topContainer}>
          <div className={styles.applicationStepContainer}>
            {formSteps.map((step, index) => {
              const stepStatus = getStepStatus(index);
              const isClickable = index <= currentStep;
              
              return (
                <div className={styles.stepContainer} key={index}>
                  <div 
                    className={styles.indicator}
                    onClick={() => handleStepClick(index)}
                    style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  >
                    <img alt="" src={stepStatus === "completed" ? assetConstants.completed : assetConstants.in_progress} />
                    {index < formSteps.length - 1 && (
                      <hr className={`webView ${styles[stepStatus]}`} />
                    )}
                  </div>

                  <div 
                    className={styles.stepDetails}
                    onClick={() => handleStepClick(index)}
                    style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  >
                    <div className={`webView ${styles.stepDescription} ${styles[stepStatus]}`}>{step}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", width: "100%", paddingBottom: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {currentStep === 0 && (
              <>
                <div className={styles.stepFieldsContainer}>
                  <h2>1. Career Information</h2>

                  <div className={styles.fieldsWrapper}>
                    <div className={styles.fieldGroup}>
                      <h3>Basic Information</h3>
                      <div className={styles.field}>
                        <span className={styles.fieldLabel}>Job Title</span>
                        <input
                          type="text"
                          placeholder="Enter job title"
                          style={{ padding: "10px 14px" }}
                        />
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <h3>Work Setting</h3>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Employment Type</span>
                          <CustomDropdownV2
                            value={employmentType}
                            placeholder="Choose employment type"
                            options={employmentTypeOptions}
                            onValueChange={setEmploymentType}
                          />
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Arrangement</span>
                          <CustomDropdownV2
                            value={workArrangement}
                            placeholder="Choose work arrangement"
                            options={workArrangementOptions}
                            onValueChange={setWorkArrangement}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <h3>Location</h3>

                      <div style={{ display: "flex", gap: "16px" }}>
                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Country</span>
                          <CustomDropdownV2
                            value="Philippines"
                            options={["Philippines"]}
                            onValueChange={(value: string) => console.log(value)}
                          />
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>State / Province</span>
                          <CustomDropdownV2
                            value={province}
                            placeholder="Choose state / province"
                            options={["Philippines"]}
                            onValueChange={setProvince}
                          />
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>City</span>
                          <CustomDropdownV2
                            value={city}
                            placeholder="Choose city"
                            options={["Philippines"]}
                            onValueChange={setCity}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>Salary</h3>

                        <div>
                          <span style={{ color: "#414651" }}>Negotiate</span>
                        </div>
                      </div>


                      <div style={{ display: "flex", gap: "16px" }}>
                        {/* FIXME: there should be a guard if min salary is greater that maximum salary */}

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Minimum Salary</span>
                          <SalaryInput
                            value={minSalary}
                            currency={salaryCurrency}
                            onValueChange={setMinSalary}
                            onCurrencyChange={setSalaryCurrency}
                          />
                        </div>

                        <div className={styles.field}>
                          <span className={styles.fieldLabel}>Maximum Salary</span>
                          <SalaryInput
                            value={maxSalary}
                            currency={salaryCurrency}
                            onValueChange={setMaxSalary}
                            onCurrencyChange={setSalaryCurrency}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.stepFieldsContainer}>
                  <h2>2. Job Description</h2>

                  <div className={styles.fieldsWrapper}>
                    <RichTextEditor setText={setDescription} text={description} />
                  </div>
                </div>

                <div className={styles.stepFieldsContainer}>
                  <h2>3. Team Access</h2>

                  <div className={styles.fieldsWrapper}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div className={styles.fieldGroupRow}>
                        <div>
                          <div className={styles.fieldGroupTitle}>Add more members</div>
                          <span className={styles.fieldLabel}>You can add other members to collaborate on this career.</span>
                        </div>

                        <div>
                          <CustomDropdownV2
                            value={authorizedMember}
                            placeholder="Add member"
                            options={["John Doe"]}
                            onValueChange={setAuthorizedMember}
                          />
                        </div>
                      </div>

                      <hr className={styles.divider} />

                      {/* added members list */}
                      <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
                        {/* TODO: should provide an error if there's no at least one job owner */}

                        <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <AvatarImage src="https://ui-avatars.com/api/?name=TechCorp+Solutions&size=200&background=4F46E5&color=fff" alt="User avatar" />

                            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                              <div className={styles.fieldGroupTitle}>John Doe <span>(You)</span></div>
                              <span className={styles.fieldLabel}>sample@email.com</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <CustomDropdownV2
                              value="Job Owner" // FIXME: should only be the default for the currently logged-in (super)admin
                              options={["Job Owner"]}
                              onValueChange={(value: string) => console.log(value)}
                            />

                            <button
                              disabled={true}
                              className={styles.deleteButton}
                              onClick={() => {
                                // FIXME: handle delete action when enabled
                                console.log("Delete clicked");
                              }}
                            >
                              <img 
                                alt="Delete" 
                                src={assetConstants.trashV2} 
                              />
                            </button>
                          </div>
                        </div>
                      </div>


                      <div style={{ fontSize: "12px", color: "#717680", marginTop: "10px" }}>
                        *Admins can view all careers regardless of specific access settings.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div className={styles.stepFieldsContainer}>
                <h2>CV Review & Pre-screening</h2>
                <div className={styles.fieldsWrapper}></div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.stepFieldsContainer}>
                <h2>AI Interview Setup</h2>
                <div className={styles.fieldsWrapper}></div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.stepFieldsContainer}>
                <h2>Pipeline Stages</h2>
                <div className={styles.fieldsWrapper}></div>
              </div>
            )}

            {currentStep === 4 && (
              <div className={styles.stepFieldsContainer}>
                <h2>Review Center</h2>
                <div className={styles.fieldsWrapper}></div>
              </div>
            )}
          </div>

          <div>
            <div className={styles.stepFieldsContainer}>
              <div>
                <h2 className={styles.tipsTitle}>
                  <img src="/iconsV3/lightbulbV2.svg" alt="Tips icon" style={{ width: "19px", height: "19px" }} />
                  Tips
                </h2>
              </div>

              {/* FIXME: should be alterable */}
              <div className={styles.fieldsWrapper}>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vero eligendi maiores aut voluptas obcaecati
                voluptatem asperiores animi tenetur laboriosam eius dignissimos assumenda harum nisi dolor incidunt labore,
                blanditiis repudiandae iste!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
