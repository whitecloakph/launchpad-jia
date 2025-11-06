"use client";

import { useState } from "react";
import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerForm.module.scss"
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import InterviewQuestionGeneratorV2 from "@/lib/components/CareerComponents/InterviewQuestionGeneratorV2";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";


const step = ["Career Details & Team Access", "CV Review & Pre-screening", "AI Interview Setup", "Pipeline Stages", "Review Career"];

const reviewSections = ["Career Details & Team Access", "CV Review & Pre-screening", "AI Interview Setup", "Pipeline Stages"];

const workSetupOptions = [
    { name: "Fully Remote" },
    { name: "Onsite" },
    { name: "Hybrid" },
];

const employmentTypeOptions = [
    { name: "Full-time" },
    { name: "Part-time" },
];

const screeningSettingList = [
    { name: "Good Fit and above", icon: "la la-check" },
    { name: "Only Strong Fit", icon: "la la-check-double" },
    { name: "No Automatic Promotion", icon: "la la-times" },
];

const aiInterviewScreeningList = [
    { name: "Good Fit and above" },
    { name: "Only Strong Fit" },
    { name: "No Automatic Promotion" },
];

export default function CareerFormV2() {
    const [currentStep, setCurrentStep] = useState(step[0]);
    const [jobTitle, setJobTitle] = useState("");
    const [employmentType, setEmploymentType] = useState("Full-time");
    const [workSetup, setWorkSetup] = useState("Hybrid");
    const [country, setCountry] = useState("Philippines");
    const [province, setProvince] = useState("Metro Manila");
    const [city, setCity] = useState("Pasig City");
    const [salaryNegotiable, setSalaryNegotiable] = useState(true);
    const [minimumSalary, setMinimumSalary] = useState("");
    const [maximumSalary, setMaximumSalary] = useState("");
    const [provinceList, setProvinceList] = useState(philippineCitiesAndProvinces.provinces);
    const [cityList, setCityList] = useState(philippineCitiesAndProvinces.cities.filter((city) => city.province === "NCR"));
    const [aboutRole, setAboutRole] = useState("");
    const [teamMembers, setTeamMembers] = useState([
        {
            id: 1,
            name: "Sabine Beatriz Dy",
            email: "sabine@whitecloak.com",
            role: "Job Owner",
            isCurrentUser: true,
        },
        {
            id: 2,
            name: "Darlene Santo Tomas",
            email: "darlene@whitecloak.com",
            role: "Contributor",
            isCurrentUser: false,
        },
    ]);
    const [screeningSetting, setScreeningSetting] = useState("Good Fit and above");
    const [cvSecretPrompt, setCvSecretPrompt] = useState("");
    const [aiInterviewScreening, setAiInterviewScreening] = useState("Good Fit and above");
    const [requireVideo, setRequireVideo] = useState(true);
    const [aiInterviewSecretPrompt, setAiInterviewSecretPrompt] = useState("");
    const [questions, setQuestions] = useState([
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
    ]);
    const [preScreeningQuestions, setPreScreeningQuestions] = useState([
        {
            id: 1,
            question: "How long is your notice period?",
            type: "Dropdown",
            options: ["Immediately", "< 30 days", "> 30 days"],
            rangeMin: "",
            rangeMax: "",
        },
        {
            id: 2,
            question: "How often are you willing to report to the office?",
            type: "Dropdown",
            options: ["At most 1-2x a week", "At most 3-4x a week", "Open to fully onsite work", "Only open to fully remote work"],
            rangeMin: "",
            rangeMax: "",
        },
        {
            id: 3,
            question: "How much is your expected monthly salary?",
            type: "Range",
            options: [],
            rangeMin: "40000",
            rangeMax: "60000",
        },
    ]);
    const [suggestedQuestions] = useState([
        { id: "notice", title: "Notice Period", question: "How long is your notice period?", added: true },
        { id: "worksetup", title: "Work Setup", question: "Are you willing to report to the office when required?", added: true },
        { id: "salary", title: "Asking Salary", question: "How much is your expected monthly salary?", added: true },
    ]);
    const [pipelineStages, setPipelineStages] = useState([
        {
            id: 1,
            name: "CV Screening",
            isCore: true,
            substages: [
                { id: 1, name: "Waiting Submission", hasAutomation: true },
                { id: 2, name: "For Review", hasAutomation: true },
            ],
        },
        {
            id: 2,
            name: "AI Interview",
            isCore: true,
            substages: [
                { id: 1, name: "Waiting Interview", hasAutomation: true },
                { id: 2, name: "For Review", hasAutomation: true },
            ],
        },
        {
            id: 3,
            name: "Final Human Interview",
            isCore: false,
            substages: [
                { id: 1, name: "Waiting Schedule", hasAutomation: true },
                { id: 2, name: "Waiting Interview", hasAutomation: true },
                { id: 3, name: "For Review", hasAutomation: true },
            ],
        },
        {
            id: 4,
            name: "Job Offer",
            isCore: true,
            substages: [
                { id: 1, name: "For Final Review", hasAutomation: true },
                { id: 2, name: "Waiting Offer Acceptance", hasAutomation: true },
                { id: 3, name: "For Contract Signing", hasAutomation: true },
            ],
        },
    ]);
    const [openAccordion, setOpenAccordion] = useState("Career Details & Team Access");

    const stepStatus = ["Completed", "Pending", "In Progress"];

    function processState(index, isAdvance = false) {
        const currentStepIndex = step.indexOf(currentStep);

        if (currentStepIndex === index) {
            return isAdvance ? stepStatus[2] : stepStatus[1];
        }

        if (currentStepIndex > index) {
            return stepStatus[0];
        }

        return stepStatus[1];
    }

    function handleContinue() {
        const currentStepIndex = step.indexOf(currentStep);
        if (currentStepIndex < step.length - 1) {
            setCurrentStep(step[currentStepIndex + 1]);
        }
    }

    function addPreScreeningQuestion() {
        const newQuestion = {
            id: Date.now(),
            question: "",
            type: "Dropdown",
            options: [],
            rangeMin: "",
            rangeMax: "",
        };
        setPreScreeningQuestions([...preScreeningQuestions, newQuestion]);
    }

    function updatePreScreeningQuestion(id: number, field: string, value: any) {
        setPreScreeningQuestions(preScreeningQuestions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    }

    function deletePreScreeningQuestion(id: number) {
        setPreScreeningQuestions(preScreeningQuestions.filter(q => q.id !== id));
    }

    function addOption(questionId: number) {
        setPreScreeningQuestions(preScreeningQuestions.map(q =>
            q.id === questionId ? { ...q, options: [...q.options, ""] } : q
        ));
    }

    function updateOption(questionId: number, optionIndex: number, value: string) {
        setPreScreeningQuestions(preScreeningQuestions.map(q =>
            q.id === questionId ? {
                ...q,
                options: q.options.map((opt, idx) => idx === optionIndex ? value : opt)
            } : q
        ));
    }

    function deleteOption(questionId: number, optionIndex: number) {
        setPreScreeningQuestions(preScreeningQuestions.map(q =>
            q.id === questionId ? {
                ...q,
                options: q.options.filter((_, idx) => idx !== optionIndex)
            } : q
        ));
    }

    function addPipelineStage() {
        const newStage = {
            id: Date.now(),
            name: "New Stage",
            isCore: false,
            substages: [],
        };
        setPipelineStages([...pipelineStages, newStage]);
    }

    function addSubstage(stageId: number) {
        setPipelineStages(pipelineStages.map(stage =>
            stage.id === stageId ? {
                ...stage,
                substages: [...stage.substages, { id: Date.now(), name: "New Substage", hasAutomation: false }]
            } : stage
        ));
    }

    function updateStageName(stageId: number, name: string) {
        setPipelineStages(pipelineStages.map(stage =>
            stage.id === stageId ? { ...stage, name } : stage
        ));
    }

    function updateSubstageName(stageId: number, substageId: number, name: string) {
        setPipelineStages(pipelineStages.map(stage =>
            stage.id === stageId ? {
                ...stage,
                substages: stage.substages.map(sub =>
                    sub.id === substageId ? { ...sub, name } : sub
                )
            } : stage
        ));
    }

    function deleteStage(stageId: number) {
        setPipelineStages(pipelineStages.filter(stage => stage.id !== stageId));
    }

    function deleteSubstage(stageId: number, substageId: number) {
        setPipelineStages(pipelineStages.map(stage =>
            stage.id === stageId ? {
                ...stage,
                substages: stage.substages.filter(sub => sub.id !== substageId)
            } : stage
        ));
    }

    return (
        <div className={styles.careerFormContainer}>
            <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Add new career</h1>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                    <button
                        style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                        }}>
                        Save as Unpublished
                    </button>
                    <button
                        style={{ width: "fit-content", background: "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={handleContinue}>
                        <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                        Save and Continue
                    </button>
                </div>
            </div>
            <div className={styles.stepContainer}>
                <div className={styles.step}>
                    {step.map((_, index) => (
                        <div className={styles.stepBar} key={index}>
                            <img
                                alt=""
                                src={
                                    assetConstants[
                                    processState(index, true)
                                        .toLowerCase()
                                        .replace(" ", "_")
                                    ]
                                }
                            />
                            {index < step.length - 1 && (
                                <hr
                                    className={
                                        styles[
                                        processState(index).toLowerCase().replace(" ", "_")
                                        ]
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.step}>
                    {step.map((item, index) => (
                        <span
                            className={`${styles.stepDetails} ${styles[
                                processState(index, true).toLowerCase().replace(" ", "_")
                            ]
                                }`}
                            key={index}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {currentStep === step[0] && (
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                    <div style={{ width: "70%", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <span style={{ fontSize: 18, color: "#181D27", fontWeight: 700 }}>1. Career Information</span>
                                </div>
                                <div className="layered-card-content">
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginBottom: 16, display: "block" }}>Basic Information</span>

                                    <span>Job Title</span>
                                    <input
                                        value={jobTitle}
                                        className="form-control"
                                        placeholder="Enter job title"
                                        onChange={(e) => setJobTitle(e.target.value || "")}
                                    />

                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginTop: 24, marginBottom: 16, display: "block" }}>Work Setting</span>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div>
                                            <span>Employment Type</span>
                                            <CustomDropdown
                                                onSelectSetting={(type) => setEmploymentType(type)}
                                                screeningSetting={employmentType}
                                                settingList={employmentTypeOptions}
                                                placeholder="Select Employment Type"
                                            />
                                        </div>
                                        <div>
                                            <span>Arrangement</span>
                                            <CustomDropdown
                                                onSelectSetting={(setup) => setWorkSetup(setup)}
                                                screeningSetting={workSetup}
                                                settingList={workSetupOptions}
                                                placeholder="Select Work Setup"
                                            />
                                        </div>
                                    </div>

                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginTop: 24, marginBottom: 16, display: "block" }}>Location</span>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                        <div>
                                            <span>Country</span>
                                            <CustomDropdown
                                                onSelectSetting={(c) => setCountry(c)}
                                                screeningSetting={country}
                                                settingList={[{ name: "Philippines" }]}
                                                placeholder="Select Country"
                                            />
                                        </div>
                                        <div>
                                            <span>State / Province</span>
                                            <CustomDropdown
                                                onSelectSetting={(prov) => {
                                                    setProvince(prov);
                                                    const provinceObj = provinceList.find((p) => p.name === prov);
                                                    const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
                                                    setCityList(cities);
                                                    setCity(cities[0]?.name || "");
                                                }}
                                                screeningSetting={province}
                                                settingList={provinceList}
                                                placeholder="Select State / Province"
                                            />
                                        </div>
                                        <div>
                                            <span>City</span>
                                            <CustomDropdown
                                                onSelectSetting={(c) => setCity(c)}
                                                screeningSetting={city}
                                                settingList={cityList}
                                                placeholder="Select City"
                                            />
                                        </div>
                                    </div>

                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginTop: 24, marginBottom: 8, display: "block" }}>Salary</span>

                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                        <label className="switch">
                                            <input type="checkbox" checked={salaryNegotiable} onChange={() => setSalaryNegotiable(!salaryNegotiable)} />
                                            <span className="slider round"></span>
                                        </label>
                                        <span style={{ fontSize: 14, color: "#6B7280" }}>Negotiable</span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div>
                                            <span>Minimum Salary</span>
                                            <div style={{ position: "relative" }}>
                                                <span style={{
                                                    position: "absolute",
                                                    left: "12px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    color: "#6c757d",
                                                    fontSize: "16px",
                                                    pointerEvents: "none",
                                                }}>P</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    style={{ paddingLeft: "28px", paddingRight: "50px" }}
                                                    placeholder="0"
                                                    min={0}
                                                    value={minimumSalary}
                                                    onChange={(e) => setMinimumSalary(e.target.value || "")}
                                                />
                                                <span style={{
                                                    position: "absolute",
                                                    right: "12px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    color: "#6c757d",
                                                    fontSize: "14px",
                                                    pointerEvents: "none",
                                                }}>PHP</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span>Maximum Salary</span>
                                            <div style={{ position: "relative" }}>
                                                <span style={{
                                                    position: "absolute",
                                                    left: "12px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    color: "#6c757d",
                                                    fontSize: "16px",
                                                    pointerEvents: "none",
                                                }}>P</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    style={{ paddingLeft: "28px", paddingRight: "50px" }}
                                                    placeholder="0"
                                                    min={0}
                                                    value={maximumSalary}
                                                    onChange={(e) => setMaximumSalary(e.target.value || "")}
                                                />
                                                <span style={{
                                                    position: "absolute",
                                                    right: "12px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    color: "#6c757d",
                                                    fontSize: "14px",
                                                    pointerEvents: "none",
                                                }}>PHP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <span style={{ fontSize: 18, color: "#181D27", fontWeight: 700 }}>2. Job Description</span>
                                </div>
                                <div className="layered-card-content">
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginBottom: 16, display: "block" }}>About This Role</span>
                                    <RichTextEditor setText={setAboutRole} text={aboutRole} />
                                </div>
                            </div>
                        </div>

                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <span style={{ fontSize: 18, color: "#181D27", fontWeight: 700 }}>3. Team Access</span>
                                </div>
                                <div className="layered-card-content">
                                    <div style={{ marginBottom: 16 }}>
                                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 700, display: "block", marginBottom: 4 }}>Add more members</span>
                                        <span style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 12 }}>You can add other members to collaborate on this career.</span>

                                        <div style={{ position: "relative" }}>
                                            <i className="la la-user-plus" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: 18 }}></i>
                                            <select
                                                className="form-control"
                                                style={{ paddingLeft: "40px", appearance: "none", cursor: "pointer" }}
                                            >
                                                <option value="">Add member</option>
                                            </select>
                                            <i className="la la-angle-down" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: 18, pointerEvents: "none" }}></i>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {teamMembers.map((member) => (
                                            <div key={member.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                                                <div style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "50%",
                                                    background: "#E5E7EB",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    color: "#374151"
                                                }}>
                                                    {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                                        {member.name} {member.isCurrentUser && "(You)"}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#6B7280" }}>{member.email}</div>
                                                </div>
                                                <div style={{ position: "relative", minWidth: 140 }}>
                                                    <select
                                                        className="form-control"
                                                        value={member.role}
                                                        onChange={(e) => {
                                                            const newMembers = teamMembers.map(m =>
                                                                m.id === member.id ? { ...m, role: e.target.value } : m
                                                            );
                                                            setTeamMembers(newMembers);
                                                        }}
                                                        style={{ appearance: "none", paddingRight: "30px", fontSize: 14 }}
                                                    >
                                                        <option value="Job Owner">Job Owner</option>
                                                        <option value="Contributor">Contributor</option>
                                                    </select>
                                                    <i className="la la-angle-down" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: 18, pointerEvents: "none" }}></i>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!member.isCurrentUser) {
                                                            setTeamMembers(teamMembers.filter(m => m.id !== member.id));
                                                        }
                                                    }}
                                                    style={{
                                                        background: "transparent",
                                                        border: "1px solid #E5E7EB",
                                                        borderRadius: 8,
                                                        width: 36,
                                                        height: 36,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: member.isCurrentUser ? "not-allowed" : "pointer",
                                                        opacity: member.isCurrentUser ? 0.5 : 1
                                                    }}
                                                    disabled={member.isCurrentUser}
                                                >
                                                    <i className="la la-trash" style={{ color: "#DC2626", fontSize: 18 }}></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <span style={{ fontSize: 12, color: "#6B7280", marginTop: 12, display: "block" }}>
                                        *Admins can view all careers regardless of specific access settings.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <i className="la la-lightbulb" style={{ color: "#F97316", fontSize: 20 }}></i>
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Tips</span>
                                </div>
                                <div className="layered-card-content" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Use clear, standard job titles</strong> for better searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Avoid abbreviations</strong> or internal role codes that applicants may not understand (e.g., use "QA Engineer" instead of "QE II" or "QA TL").
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Keep it concise</strong> — job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms.
                                    </div>
                                    <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "16px 0" }} />
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Keep it concise</strong> — job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === step[1] && (
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                    <div style={{ width: "70%", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <span style={{ fontSize: 18, color: "#181D27", fontWeight: 700 }}>1. CV Review Settings</span>
                                </div>
                                <div className="layered-card-content">
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginBottom: 16, display: "block" }}>CV Screening</span>
                                    <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 12, display: "block" }}>
                                        Jia automatically endorses candidates who meet the chosen criteria.
                                    </span>

                                    <CustomDropdown
                                        onSelectSetting={(setting) => setScreeningSetting(setting)}
                                        screeningSetting={screeningSetting}
                                        settingList={screeningSettingList}
                                        placeholder="Select Screening Setting"
                                    />

                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 24, padding: 16, background: "#F9FAFB", borderRadius: 8 }}>
                                        <i className="la la-magic" style={{ color: "#8B5CF6", fontSize: 20, marginTop: 2 }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>CV Secret Prompt</span>
                                                <span style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>(optional)</span>
                                                <i className="la la-question-circle" style={{ color: "#6B7280", fontSize: 16, cursor: "help" }} title="Secret Prompts give you extra control over Jia's evaluation style"></i>
                                            </div>
                                            <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 12, display: "block" }}>
                                                Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                                            </span>

                                            <textarea
                                                className="form-control"
                                                placeholder="e.g., Prioritize candidates with strong hands-on experience in Java and object-oriented programming..."
                                                value={cvSecretPrompt}
                                                onChange={(e) => setCvSecretPrompt(e.target.value)}
                                                rows={6}
                                                style={{ resize: "vertical", fontSize: 14 }}
                                            />

                                            <ul style={{ marginTop: 12, marginLeft: 20, fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>
                                                <li>Prioritize candidates with strong hands-on experience in Java and object-oriented programming.</li>
                                                <li>Look for familiarity with frameworks like Spring Boot or Hibernate, and experience building scalable backend systems.</li>
                                                <li>Give extra weight to candidates who demonstrate knowledge of REST APIs, microservices, and SQL or NoSQL databases.</li>
                                                <li>Deprioritize resumes that only list Java as a secondary or outdated skill.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* John Alfred Alfonso */}
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 18, color: "#181D27", fontWeight: 700 }}>2. Pre-Screening Questions</span>
                                        <span style={{ fontSize: 14, color: "#6B7280", fontStyle: "italic" }}>(optional)</span>
                                        <span style={{
                                            background: "#F3F4F6",
                                            color: "#6B7280",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {preScreeningQuestions.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={addPreScreeningQuestion}
                                        style={{
                                            background: "#000",
                                            color: "#fff",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: 14,
                                            fontWeight: 500,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6
                                        }}
                                    >
                                        <i className="la la-plus" style={{ fontSize: 16 }}></i>
                                        Add custom
                                    </button>
                                </div>
                                <div className="layered-card-content">
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {preScreeningQuestions.map((question, qIndex) => (
                                            <div key={question.id} style={{
                                                background: "#F9FAFB",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: 12,
                                                padding: 16
                                            }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                                                    <i className="la la-grip-vertical" style={{ color: "#9CA3AF", fontSize: 20, cursor: "grab", marginTop: 8 }}></i>
                                                    <input
                                                        className="form-control"
                                                        placeholder="Enter your question"
                                                        value={question.question}
                                                        onChange={(e) => updatePreScreeningQuestion(question.id, "question", e.target.value)}
                                                        style={{ flex: 1, fontSize: 14 }}
                                                    />
                                                    <div style={{ position: "relative", minWidth: 160 }}>
                                                        <i className="la la-circle" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: 12 }}></i>
                                                        <select
                                                            className="form-control"
                                                            value={question.type}
                                                            onChange={(e) => updatePreScreeningQuestion(question.id, "type", e.target.value)}
                                                            style={{ paddingLeft: "32px", paddingRight: "30px", fontSize: 14, appearance: "none" }}
                                                        >
                                                            <option value="Dropdown">Dropdown</option>
                                                            <option value="Range">Range</option>
                                                            <option value="Text">Text</option>
                                                        </select>
                                                        <i className="la la-angle-down" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: 18, pointerEvents: "none" }}></i>
                                                    </div>
                                                </div>

                                                {question.type === "Dropdown" && (
                                                    <div style={{ marginLeft: 32 }}>
                                                        {question.options.map((option, optIndex) => (
                                                            <div key={optIndex} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                                <span style={{
                                                                    minWidth: 24,
                                                                    height: 24,
                                                                    background: "#fff",
                                                                    border: "1px solid #D1D5DB",
                                                                    borderRadius: 4,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: 12,
                                                                    color: "#6B7280",
                                                                    fontWeight: 500
                                                                }}>
                                                                    {optIndex + 1}
                                                                </span>
                                                                <input
                                                                    className="form-control"
                                                                    placeholder="Enter option"
                                                                    value={option}
                                                                    onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                                                    style={{ flex: 1, fontSize: 14 }}
                                                                />
                                                                <button
                                                                    onClick={() => deleteOption(question.id, optIndex)}
                                                                    style={{
                                                                        background: "transparent",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                        padding: 4,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    }}
                                                                >
                                                                    <i className="la la-times-circle" style={{ color: "#9CA3AF", fontSize: 20 }}></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => addOption(question.id)}
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                color: "#6B7280",
                                                                cursor: "pointer",
                                                                fontSize: 14,
                                                                fontWeight: 500,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                                marginLeft: 32,
                                                                marginTop: 8,
                                                                padding: 0
                                                            }}
                                                        >
                                                            <i className="la la-plus" style={{ fontSize: 16 }}></i>
                                                            Add Option
                                                        </button>
                                                    </div>
                                                )}

                                                {question.type === "Range" && (
                                                    <div style={{ marginLeft: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                        <div>
                                                            <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 8, display: "block" }}>Minimum</span>
                                                            <div style={{ position: "relative" }}>
                                                                <span style={{
                                                                    position: "absolute",
                                                                    left: "12px",
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: "#6c757d",
                                                                    fontSize: "16px",
                                                                }}>₱</span>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="40,000"
                                                                    value={question.rangeMin}
                                                                    onChange={(e) => updatePreScreeningQuestion(question.id, "rangeMin", e.target.value)}
                                                                    style={{ paddingLeft: "28px", paddingRight: "50px" }}
                                                                />
                                                                <span style={{
                                                                    position: "absolute",
                                                                    right: "12px",
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: "#6c757d",
                                                                    fontSize: "14px",
                                                                }}>PHP</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 8, display: "block" }}>Maximum</span>
                                                            <div style={{ position: "relative" }}>
                                                                <span style={{
                                                                    position: "absolute",
                                                                    left: "12px",
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: "#6c757d",
                                                                    fontSize: "16px",
                                                                }}>₱</span>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="60,000"
                                                                    value={question.rangeMax}
                                                                    onChange={(e) => updatePreScreeningQuestion(question.id, "rangeMax", e.target.value)}
                                                                    style={{ paddingLeft: "28px", paddingRight: "50px" }}
                                                                />
                                                                <span style={{
                                                                    position: "absolute",
                                                                    right: "12px",
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: "#6c757d",
                                                                    fontSize: "14px",
                                                                }}>PHP</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => deletePreScreeningQuestion(question.id)}
                                                    style={{
                                                        background: "transparent",
                                                        border: "1px solid #FCA5A5",
                                                        color: "#DC2626",
                                                        padding: "6px 12px",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        marginTop: 16,
                                                        marginLeft: "auto"
                                                    }}
                                                >
                                                    <i className="la la-trash" style={{ fontSize: 16 }}></i>
                                                    Delete Question
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {preScreeningQuestions.length > 0 && (
                                        <div style={{ marginTop: 24, padding: 16, background: "#F9FAFB", borderRadius: 8 }}>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 12 }}>
                                                Suggested Pre-screening Questions:
                                            </span>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                {suggestedQuestions.map((suggested) => (
                                                    <div key={suggested.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>{suggested.title}</div>
                                                            <div style={{ fontSize: 13, color: "#6B7280" }}>{suggested.question}</div>
                                                        </div>
                                                        <button
                                                            disabled={suggested.added}
                                                            style={{
                                                                background: suggested.added ? "#E5E7EB" : "#fff",
                                                                border: "1px solid #D1D5DB",
                                                                color: suggested.added ? "#9CA3AF" : "#374151",
                                                                padding: "6px 16px",
                                                                borderRadius: "20px",
                                                                cursor: suggested.added ? "not-allowed" : "pointer",
                                                                fontSize: 13,
                                                                fontWeight: 500,
                                                                minWidth: 80
                                                            }}
                                                        >
                                                            {suggested.added ? "Added" : "Add"}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Alfred */}
                    <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <i className="la la-lightbulb" style={{ color: "#F97316", fontSize: 20 }}></i>
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Tips</span>
                                </div>
                                <div className="layered-card-content" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Add a Secret Prompt</strong> to fine-tune how Jia scores and evaluates submitted CVs.
                                    </div>
                                    <div>
                                        <strong style={{ color: "#181D27" }}>Add Pre-Screening questions</strong> to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === step[2] && (
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                    <div style={{ width: "70%", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <span style={{ fontSize: 18, color: "#181D27", fontWeight: 700 }}>1. AI Interview Settings</span>
                                </div>
                                <div className="layered-card-content">
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginBottom: 16, display: "block" }}>AI Interview Screening</span>
                                    <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 12, display: "block" }}>
                                        Jia automatically endorses candidates who meet the chosen criteria.
                                    </span>

                                    <CustomDropdown
                                        onSelectSetting={(setting) => setAiInterviewScreening(setting)}
                                        screeningSetting={aiInterviewScreening}
                                        settingList={aiInterviewScreeningList}
                                        placeholder="Select Screening Setting"
                                    />

                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700, marginTop: 24, marginBottom: 12, display: "block" }}>Require Video on Interview</span>
                                    <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 12, display: "block" }}>
                                        Require candidates to keep their camera on. Recordings will appear on their analysis page.
                                    </span>

                                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#F9FAFB", borderRadius: 8 }}>
                                        <i className="la la-video" style={{ color: "#414651", fontSize: 20 }}></i>
                                        <span style={{ flex: 1, fontSize: 14, color: "#181D27", fontWeight: 500 }}>Require Video Interview</span>
                                        <label className="switch">
                                            <input type="checkbox" checked={requireVideo} onChange={() => setRequireVideo(!requireVideo)} />
                                            <span className="slider round"></span>
                                        </label>
                                        <span style={{ fontSize: 14, color: "#6B7280", minWidth: 40 }}>{requireVideo ? "Yes" : "No"}</span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 24, padding: 16, background: "#F9FAFB", borderRadius: 8 }}>
                                        <i className="la la-magic" style={{ color: "#8B5CF6", fontSize: 20, marginTop: 2 }}></i>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>AI Interview Secret Prompt</span>
                                                <span style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>(optional)</span>
                                                <i className="la la-question-circle" style={{ color: "#6B7280", fontSize: 16, cursor: "help" }} title="Secret Prompts give you extra control over Jia's evaluation style"></i>
                                            </div>
                                            <span style={{ fontSize: 14, color: "#6B7280", marginBottom: 12, display: "block" }}>
                                                Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                                            </span>

                                            <textarea
                                                className="form-control"
                                                placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                                                value={aiInterviewSecretPrompt}
                                                onChange={(e) => setAiInterviewSecretPrompt(e.target.value)}
                                                rows={4}
                                                style={{ resize: "vertical", fontSize: 14 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <InterviewQuestionGeneratorV2
                            questions={questions}
                            setQuestions={(questions) => setQuestions(questions)}
                            jobTitle={jobTitle}
                            description={aboutRole}
                        />
                    </div>
                    <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <i className="la la-lightbulb" style={{ color: "#F97316", fontSize: 20 }}></i>
                                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Tips</span>
                                </div>
                                <div className="layered-card-content" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Add a Secret Prompt</strong> to fine-tune how Jia scores and evaluates the interview responses.
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <strong style={{ color: "#181D27" }}>Use "Generate Questions"</strong> to quickly create tailored interview questions, then refine or mix them with your own for balanced results.
                                    </div>
                                    <div>
                                        <strong style={{ color: "#181D27" }}>Generate all questions</strong> at once to save time, or generate per category for more control over question types.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === step[3] && (
                <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 16, marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#181D27", marginBottom: 4 }}>Customize pipeline stages</h2>
                            <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
                                Create, modify, reorder, and delete stages and sub-stages. Core stages are fixed and can't be moved or edited as they are essential to Jia's system logic.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button
                                style={{
                                    background: "#fff",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                }}
                            >
                                <i className="la la-undo" style={{ fontSize: 16 }}></i>
                                Restore to default
                            </button>
                            <button
                                style={{
                                    background: "#fff",
                                    border: "1px solid #D1D5DB",
                                    color: "#374151",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                }}
                            >
                                Copy pipeline from existing job
                                <i className="la la-angle-down" style={{ fontSize: 16 }}></i>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                        {pipelineStages.map((stage, stageIndex) => (
                            <div key={stage.id} style={{
                                background: "#F9FAFB",
                                border: "1px solid #E5E7EB",
                                borderRadius: 12,
                                padding: 16,
                                position: "relative"
                            }}>
                                {stage.isCore && (
                                    <div style={{
                                        position: "absolute",
                                        top: 12,
                                        left: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        color: "#9CA3AF",
                                        fontSize: 12
                                    }}>
                                        <i className="la la-lock" style={{ fontSize: 14 }}></i>
                                        <span>Core stage, cannot move</span>
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: stage.isCore ? 24 : 0, marginBottom: 12 }}>
                                    {!stage.isCore && (
                                        <i className="la la-grip-vertical" style={{ color: "#9CA3AF", fontSize: 20, cursor: "grab" }}></i>
                                    )}
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                                        {stage.isCore ? (
                                            <>
                                                <i className={`la ${stageIndex === 0 ? 'la-file-text' : stageIndex === 1 ? 'la-robot' : stageIndex === 2 ? 'la-users' : 'la-briefcase'}`} style={{ fontSize: 18, color: "#6B7280" }}></i>
                                                <span style={{ fontSize: 16, fontWeight: 600, color: "#181D27" }}>{stage.name}</span>
                                            </>
                                        ) : (
                                            <input
                                                className="form-control"
                                                value={stage.name}
                                                onChange={(e) => updateStageName(stage.id, e.target.value)}
                                                style={{ fontSize: 14, fontWeight: 600 }}
                                            />
                                        )}
                                    </div>
                                    {stage.isCore && (
                                        <i className="la la-question-circle" style={{ color: "#9CA3AF", fontSize: 16, cursor: "help" }}></i>
                                    )}
                                    {stage.isCore && (
                                        <i className="la la-lock" style={{ color: "#9CA3AF", fontSize: 16 }}></i>
                                    )}
                                    {!stage.isCore && (
                                        <button
                                            onClick={() => deleteStage(stage.id)}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: 4
                                            }}
                                        >
                                            <i className="la la-ellipsis-v" style={{ color: "#6B7280", fontSize: 18 }}></i>
                                        </button>
                                    )}
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Substages</span>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {stage.substages.map((substage) => (
                                        <div key={substage.id} style={{
                                            background: "#fff",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: 8,
                                            padding: "10px 12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <input
                                                className="form-control"
                                                value={substage.name}
                                                onChange={(e) => updateSubstageName(stage.id, substage.id, e.target.value)}
                                                style={{ flex: 1, fontSize: 13, border: "none", padding: 0, background: "transparent" }}
                                            />
                                            {substage.hasAutomation && (
                                                <i className="la la-bolt" style={{ color: "#F59E0B", fontSize: 16 }} title="Has automation"></i>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addPipelineStage}
                            style={{
                                background: "#F9FAFB",
                                border: "2px dashed #D1D5DB",
                                borderRadius: 12,
                                padding: 16,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                color: "#6B7280",
                                fontSize: 14,
                                fontWeight: 500,
                                minHeight: 200
                            }}
                        >
                            <i className="la la-plus" style={{ fontSize: 20 }}></i>
                            Add Stage
                        </button>
                    </div>
                </div>
            )}

            {currentStep === step[4] && (
                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 900, gap: 16 }}>
                        {/* Career Details & Team Access Accordion */}
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                            <button
                                onClick={() => setOpenAccordion(openAccordion === reviewSections[0] ? "" : reviewSections[0])}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 20px",
                                    background: "#F9FAFB",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: "#181D27"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className={`la la-angle-${openAccordion === reviewSections[0] ? 'down' : 'right'}`} style={{ fontSize: 20, color: "#6B7280" }}></i>
                                    <span>Career Details & Team Access</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentStep(step[0]);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 4
                                    }}
                                >
                                    <i className="la la-pen" style={{ fontSize: 18, color: "#6B7280" }}></i>
                                </button>
                            </button>

                            {/* John Alfred */}
                            {openAccordion === reviewSections[0] && (
                                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                                    {/* Job Title */}
                                    <div>
                                        <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>Job Title</span>
                                        <span style={{ fontSize: 14, color: "#181D27" }}>{jobTitle || "—"}</span>
                                    </div>

                                    {/* Employment Type & Work Arrangement */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>Employment Type</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>{employmentType}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>Work Arrangement</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>{workSetup}</span>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>Country</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>{country}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>State / Province</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>{province}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>City</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>{city}</span>
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>Minimum Salary</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>
                                                {salaryNegotiable ? "Negotiable" : minimumSalary ? `₱${minimumSalary} PHP` : "—"}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 4 }}>Maximum Salary</span>
                                            <span style={{ fontSize: 14, color: "#181D27" }}>
                                                {salaryNegotiable ? "Negotiable" : maximumSalary ? `₱${maximumSalary} PHP` : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Job Description */}
                                    <div>
                                        <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 8 }}>Job Description</span>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                color: "#181D27",
                                                lineHeight: 1.6,
                                                maxHeight: 200,
                                                overflow: "auto"
                                            }}
                                            dangerouslySetInnerHTML={{ __html: aboutRole || "—" }}
                                        />
                                    </div>

                                    {/* Team Access */}
                                    <div>
                                        <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 12 }}>Team Access</span>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {teamMembers.map((member) => (
                                                <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        background: "#E5E7EB",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        color: "#374151"
                                                    }}>
                                                        {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>
                                                            {member.name} {member.isCurrentUser && "(You)"}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: "#6B7280" }}>{member.email}</div>
                                                    </div>
                                                    <div style={{ fontSize: 14, color: "#6B7280" }}>{member.role}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CV Review & Pre-Screening Questions Accordion */}
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                            <button
                                onClick={() => setOpenAccordion(openAccordion === reviewSections[1] ? "" : reviewSections[1])}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 20px",
                                    background: "#F9FAFB",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: "#181D27"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className={`la la-angle-${openAccordion === reviewSections[1] ? 'down' : 'right'}`} style={{ fontSize: 20, color: "#6B7280" }}></i>
                                    <span>CV Review & Pre-Screening Questions</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentStep(step[1]);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 4
                                    }}
                                >
                                    <i className="la la-pen" style={{ fontSize: 18, color: "#6B7280" }}></i>
                                </button>
                            </button>

                            {openAccordion === reviewSections[1] && (
                                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
                                    {/* CV Screening */}
                                    <div>
                                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600, display: "block", marginBottom: 8 }}>CV Screening</span>
                                        <div style={{ fontSize: 14, color: "#6B7280" }}>
                                            Automatically endorse candidates who are{" "}
                                            <span style={{
                                                color: "#3B82F6",
                                                fontWeight: 600,
                                                background: "#EFF6FF",
                                                padding: "2px 8px",
                                                borderRadius: 4
                                            }}>
                                                {screeningSetting}
                                            </span>
                                            {" "}and above
                                        </div>
                                    </div>

                                    {/* CV Secret Prompt */}
                                    {cvSecretPrompt && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <i className="la la-magic" style={{ color: "#8B5CF6", fontSize: 18 }}></i>
                                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>CV Secret Prompt</span>
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>
                                                {cvSecretPrompt.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                    <li key={idx}>{line.trim()}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Pre-Screening Questions */}
                                    {preScreeningQuestions.length > 0 && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>Pre-Screening Questions</span>
                                                <span style={{
                                                    background: "#F3F4F6",
                                                    color: "#6B7280",
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}>
                                                    {preScreeningQuestions.length}
                                                </span>
                                            </div>
                                            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#181D27", lineHeight: 2 }}>
                                                {preScreeningQuestions.map((q, idx) => (
                                                    <li key={q.id} style={{ marginBottom: 12 }}>
                                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{q.question}</div>
                                                        {q.type === "Dropdown" && q.options.length > 0 && (
                                                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
                                                                {q.options.map((opt, optIdx) => (
                                                                    <li key={optIdx}>{opt}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {q.type === "Range" && (q.rangeMin || q.rangeMax) && (
                                                            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                                                                Preferred: PHP {q.rangeMin || "0"} - PHP {q.rangeMax || "0"}
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* AI Interview Setup Accordion */}
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                            <button
                                onClick={() => setOpenAccordion(openAccordion === reviewSections[2] ? "" : reviewSections[2])}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 20px",
                                    background: "#F9FAFB",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: "#181D27"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className={`la la-angle-${openAccordion === reviewSections[2] ? 'down' : 'right'}`} style={{ fontSize: 20, color: "#6B7280" }}></i>
                                    <span>AI Interview Setup</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentStep(step[2]);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 4
                                    }}
                                >
                                    <i className="la la-pen" style={{ fontSize: 18, color: "#6B7280" }}></i>
                                </button>
                            </button>

                            {openAccordion === reviewSections[2] && (
                                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
                                    {/* AI Interview Screening */}
                                    <div>
                                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600, display: "block", marginBottom: 8 }}>AI Interview Screening</span>
                                        <div style={{ fontSize: 14, color: "#6B7280" }}>
                                            Automatically endorse candidates who are{" "}
                                            <span style={{
                                                color: "#3B82F6",
                                                fontWeight: 600,
                                                background: "#EFF6FF",
                                                padding: "2px 8px",
                                                borderRadius: 4
                                            }}>
                                                {aiInterviewScreening}
                                            </span>
                                            {" "}and above
                                        </div>
                                    </div>

                                    {/* Require Video on Interview */}
                                    <div>
                                        <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600, display: "block", marginBottom: 8 }}>Require Video on Interview</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontSize: 14, color: "#6B7280" }}>{requireVideo ? "Yes" : "No"}</span>
                                            {requireVideo && (
                                                <i className="la la-check-circle" style={{ color: "#10B981", fontSize: 18 }}></i>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Interview Secret Prompt */}
                                    {aiInterviewSecretPrompt && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <i className="la la-magic" style={{ color: "#8B5CF6", fontSize: 18 }}></i>
                                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>AI Interview Secret Prompt</span>
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>
                                                {aiInterviewSecretPrompt.split('\n').filter(line => line.trim()).map((line, idx) => (
                                                    <li key={idx}>{line.trim()}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Interview Questions */}
                                    {questions.some(cat => cat.questions.length > 0) && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                                <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600 }}>Interview Questions</span>
                                                <span style={{
                                                    background: "#F3F4F6",
                                                    color: "#6B7280",
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}>
                                                    {questions.reduce((total, cat) => total + cat.questions.length, 0)}
                                                </span>
                                            </div>

                                            {questions.filter(cat => cat.questions.length > 0).map((category) => (
                                                <div key={category.id} style={{ marginBottom: 16 }}>
                                                    <span style={{ fontSize: 14, color: "#181D27", fontWeight: 600, display: "block", marginBottom: 8 }}>
                                                        {category.category}
                                                    </span>
                                                    <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>
                                                        {category.questions.map((q, idx) => (
                                                            <li key={idx}>{typeof q === 'string' ? q : q.question}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pipeline Stages Accordion */}
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                            <button
                                onClick={() => setOpenAccordion(openAccordion === reviewSections[3] ? "" : reviewSections[3])}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 20px",
                                    background: "#F9FAFB",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: "#181D27"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <i className={`la la-angle-${openAccordion === reviewSections[3] ? 'down' : 'right'}`} style={{ fontSize: 20, color: "#6B7280" }}></i>
                                    <span>Pipeline Stages</span>
                                    <span style={{
                                        background: "#F3F4F6",
                                        color: "#6B7280",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}>
                                        {pipelineStages.length}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentStep(step[3]);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 4
                                    }}
                                >
                                    <i className="la la-pen" style={{ fontSize: 18, color: "#6B7280" }}></i>
                                </button>
                            </button>

                            {openAccordion === reviewSections[3] && (
                                <div style={{ padding: "20px 24px" }}>
                                    <div style={{
                                        display: "flex",
                                        gap: 16,
                                        overflowX: "auto",
                                        paddingBottom: 8
                                    }}>
                                        {pipelineStages.map((stage, stageIndex) => (
                                            <div key={stage.id} style={{
                                                minWidth: 240,
                                                background: "#F9FAFB",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: 12,
                                                padding: 16,
                                                flex: "0 0 auto"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                                    <i className={`la ${stageIndex === 0 ? 'la-file-text' :
                                                        stageIndex === 1 ? 'la-robot' :
                                                            stageIndex === 2 ? 'la-users' :
                                                                stageIndex === 3 ? 'la-briefcase' :
                                                                    'la-layer-group'
                                                        }`} style={{ fontSize: 18, color: "#6B7280" }}></i>
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#181D27" }}>{stage.name}</span>
                                                </div>

                                                <div style={{ marginBottom: 8 }}>
                                                    <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Substages</span>
                                                </div>

                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {stage.substages.map((substage) => (
                                                        <div key={substage.id} style={{
                                                            background: "#fff",
                                                            border: "1px solid #E5E7EB",
                                                            borderRadius: 8,
                                                            padding: "10px 12px",
                                                            fontSize: 13,
                                                            color: "#6B7280"
                                                        }}>
                                                            {substage.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}