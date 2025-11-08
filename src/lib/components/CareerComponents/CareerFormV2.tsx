"use client";

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";

// Setting List icons
const screeningSettingList = [
  {
    name: "Good Fit and above",
    icon: "la la-check",
  },
  {
    name: "Only Strong Fit",
    icon: "la la-check-double",
  },
  {
    name: "No Automatic Promotion",
    icon: "la la-times",
  },
];

const workSetupOptions = [
  {
    name: "Fully Remote",
  },
  {
    name: "Onsite",
  },
  {
    name: "Hybrid",
  },
];

const employmentTypeOptions = [
  {
    name: "Full-Time",
  },
  {
    name: "Part-Time",
  },
];

export default function CareerForm({
  career,
  formType,
  setShowEditModal,
}: {
  career?: any;
  formType: string;
  setShowEditModal?: (show: boolean) => void;
}) {
  const { user, orgID } = useAppContext();

  // Segment State
  const [currentSegment, setCurrentSegment] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<number[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form States
  const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
  const [description, setDescription] = useState(career?.description || "");
  const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
  const [workSetupRemarks, setWorkSetupRemarks] = useState(
    career?.workSetupRemarks || ""
  );
  const [screeningSetting, setScreeningSetting] = useState(
    career?.screeningSetting || "Good Fit and above"
  );
  const [employmentType, setEmploymentType] = useState(
    career?.employmentType || "Full-Time"
  );
  const [requireVideo, setRequireVideo] = useState(
    career?.requireVideo || true
  );
  const [salaryNegotiable, setSalaryNegotiable] = useState(
    career?.salaryNegotiable || true
  );
  const [minimumSalary, setMinimumSalary] = useState(
    career?.minimumSalary || ""
  );
  const [maximumSalary, setMaximumSalary] = useState(
    career?.maximumSalary || ""
  );
  const [questions, setQuestions] = useState(
    career?.questions || [
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
    ]
  );
  const [country, setCountry] = useState(career?.country || "Philippines");
  const [province, setProvince] = useState(career?.province || "");
  const [city, setCity] = useState(career?.location || "");
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState("");
  const [isSavingCareer, setIsSavingCareer] = useState(false);
  const savingCareerRef = useRef(false);

  // Segment Configuration
  const segments = [
    {
      id: 0,
      title: "Career Details & Team Access",
      icon: "la-dot-circle",
    },
    {
      id: 1,
      title: "CV Review & Pre-screening",
      icon: "la-dot-circle",
    },
    {
      id: 2,
      title: "AI Interview Setup",
      icon: "la-dot-circle",
    },
    {
      id: 3,
      title: "Review Career",
      icon: "la-dot-circle",
    },
  ];

  // Validation Functions
  const validateSegment = (segmentId: number) => {
    switch (segmentId) {
      case 0: // Career Details & Additional Info
        return jobTitle.trim().length > 0 && workSetup.trim().length > 0;
      case 1: // Settings
        return screeningSetting.trim().length > 0;
      case 2: // Interview Questions
        return questions.some((q) => q.questions.length > 0);
      case 3: // Review
        return true;
      default:
        return true;
    }
  };

  const isFormValid = () => {
    return (
      jobTitle?.trim().length > 0 &&
      description?.trim().length > 0 &&
      questions.some((q) => q.questions.length > 0) &&
      workSetup?.trim().length > 0
    );
  };

  // Navigation Handlers
  const handleNext = () => {
    if (!validateSegment(currentSegment)) {
      errorToast("Please fill in all required fields", 1300);
      return;
    }

    // Mark current segment as completed
    if (!completedSegments.includes(currentSegment)) {
      setCompletedSegments([...completedSegments, currentSegment]);
    }

    // Move to next segment
    if (currentSegment < segments.length - 1) {
      setCurrentSegment(currentSegment + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentSegment > 0) {
      setCurrentSegment(currentSegment - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSegmentClick = (segmentId: number) => {
    // Only allow clicking on current or completed segments
    if (segmentId <= currentSegment || completedSegments.includes(segmentId)) {
      setCurrentSegment(segmentId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Helper Functions
  const formatRelativeTime = (date: Date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  // Career Management Functions
  const updateCareer = async (status: string) => {
    if (
      Number(minimumSalary) &&
      Number(maximumSalary) &&
      Number(minimumSalary) > Number(maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };
    const updatedCareer = {
      _id: career._id,
      jobTitle,
      description,
      workSetup,
      workSetupRemarks,
      questions,
      lastEditedBy: userInfoSlice,
      status,
      updatedAt: Date.now(),
      screeningSetting,
      requireVideo,
      salaryNegotiable,
      minimumSalary: isNaN(Number(minimumSalary))
        ? null
        : Number(minimumSalary),
      maximumSalary: isNaN(Number(maximumSalary))
        ? null
        : Number(maximumSalary),
      country,
      province,
      location: city,
      employmentType,
    };
    try {
      setIsSavingCareer(true);
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
            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
              Career updated
            </span>
          </div>,
          1300,
          <i
            className="la la-check-circle"
            style={{ color: "#039855", fontSize: 32 }}
          ></i>
        );
        setTimeout(() => {
          window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
        }, 1300);
      }
    } catch (error) {
      console.error(error);
      errorToast("Failed to update career", 1300);
    } finally {
      setIsSavingCareer(false);
    }
  };

  const confirmSaveCareer = (status: string) => {
    if (
      Number(minimumSalary) &&
      Number(maximumSalary) &&
      Number(minimumSalary) > Number(maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    setShowSaveModal(status);
  };

  const saveCareer = async (status: string) => {
    setShowSaveModal("");
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
      const career = {
        jobTitle,
        description,
        workSetup,
        workSetupRemarks,
        questions,
        lastEditedBy: userInfoSlice,
        createdBy: userInfoSlice,
        screeningSetting,
        orgID,
        requireVideo,
        salaryNegotiable,
        minimumSalary: isNaN(Number(minimumSalary))
          ? null
          : Number(minimumSalary),
        maximumSalary: isNaN(Number(maximumSalary))
          ? null
          : Number(maximumSalary),
        country,
        province,
        location: city,
        status,
        employmentType,
      };

      try {
        const response = await axios.post("/api/add-career", career);
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
              <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
                Career added {status === "active" ? "and published" : ""}
              </span>
            </div>,
            1300,
            <i
              className="la la-check-circle"
              style={{ color: "#039855", fontSize: 32 }}
            ></i>
          );
          setTimeout(() => {
            window.location.href = `/recruiter-dashboard/careers`;
          }, 1300);
        }
      } catch (error) {
        errorToast("Failed to add career", 1300);
      } finally {
        savingCareerRef.current = false;
        setIsSavingCareer(false);
      }
    }
  };

  useEffect(() => {
    const parseProvinces = () => {
      setProvinceList(philippineCitiesAndProvinces.provinces);
      const defaultProvince = philippineCitiesAndProvinces.provinces[0];
      if (!career?.province) {
        setProvince(defaultProvince.name);
      }
      const cities = philippineCitiesAndProvinces.cities.filter(
        (city) => city.province === defaultProvince.key
      );
      setCityList(cities);
      if (!career?.location) {
        setCity(cities[0].name);
      }
    };
    parseProvinces();
  }, [career]);

  // Segment Content Renderers
  const renderSegmentContent = () => {
    switch (currentSegment) {
      case 0:
        return <Segment1CareerDetailsAndAdditionalInfo />;
      case 1:
        return <Segment2Settings />;
      case 2:
        return <Segment3InterviewQuestions />;
      case 3:
        return <Segment4Review />;
      default:
        return null;
    }
  };

  // SEGMENT 1: Career Details & Additional Information (Combined)
  const Segment1CareerDetailsAndAdditionalInfo = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Career Information Card */}
      <div>
        <div className="layered-card-middle bg-#F8F9FC">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: "#181D27",
                fontWeight: 700,
                marginLeft: 16,
                paddingTop: 8,
              }}
            >
              1. Career Information
            </span>
          </div>
          <div className="layered-card-content" style={{ fontSize: 14 }}>
            <span style={{ color: "#181D27", fontWeight: "700" }}>
              Basic Information
            </span>
            <span>
              Job Title <span style={{ color: "#EF4444" }}>*</span>
            </span>
            <input
              value={jobTitle}
              className="form-control"
              placeholder="Enter job title"
              onChange={(e) => setJobTitle(e.target.value || "")}
            />
            <span style={{ color: "#181D27", fontWeight: 700, marginTop: 16 }}>
              Work Setting
            </span>
            <span>Employment Type</span>
            <CustomDropdown
              onSelectSetting={(employmentType) =>
                setEmploymentType(employmentType)
              }
              screeningSetting={employmentType}
              settingList={employmentTypeOptions}
              placeholder="Choose employment type"
            />

            <span>
              Arrangement <span style={{ color: "#EF4444" }}>*</span>
            </span>
            <CustomDropdown
              onSelectSetting={(setting) => setWorkSetup(setting)}
              screeningSetting={workSetup}
              settingList={workSetupOptions}
              placeholder="Choose work arrangement"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ color: "#181D27", fontWeight: 700, marginTop: 16 }}
              >
                Salary
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                  minWidth: "130px",
                  marginTop: 16,
                }}
              >
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={salaryNegotiable}
                    onChange={() => setSalaryNegotiable(!salaryNegotiable)}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{salaryNegotiable ? "Negotiable" : "Fixed"}</span>
              </div>
            </div>

            <span>Minimum Salary</span>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
                P
              </span>
              <input
                type="number"
                className="form-control"
                style={{ paddingLeft: "28px" }}
                placeholder="0"
                min={0}
                value={minimumSalary}
                onChange={(e) => setMinimumSalary(e.target.value || "")}
              />
              <span
                style={{
                  position: "absolute",
                  right: "30px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
                PHP
              </span>
            </div>

            <span>Maximum Salary</span>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
                P
              </span>
              <input
                type="number"
                className="form-control"
                style={{ paddingLeft: "28px" }}
                placeholder="0"
                min={0}
                value={maximumSalary}
                onChange={(e) => setMaximumSalary(e.target.value || "")}
              />
              <span
                style={{
                  position: "absolute",
                  right: "30px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
                PHP
              </span>
            </div>

            <span
              style={{
                color: "#181D27",
                fontWeight: 700,
                marginTop: 16,
              }}
            >
              Location
            </span>

            <span>Country</span>
            <CustomDropdown
              onSelectSetting={(setting) => setCountry(setting)}
              screeningSetting={country}
              settingList={[]}
              placeholder="Select Country"
            />

            <span>State / Province</span>
            <CustomDropdown
              onSelectSetting={(province) => {
                setProvince(province);
                const provinceObj = provinceList.find(
                  (p) => p.name === province
                );
                const cities = philippineCitiesAndProvinces.cities.filter(
                  (city) => city.province === provinceObj.key
                );
                setCityList(cities);
                setCity(cities[0].name);
              }}
              screeningSetting={province}
              settingList={provinceList}
              placeholder="Select State / Province"
            />

            <span>City</span>
            <CustomDropdown
              onSelectSetting={(city) => setCity(city)}
              screeningSetting={city}
              settingList={cityList}
              placeholder="Select City"
            />
          </div>
        </div>
      </div>

      {/* Job Description Card */}
      <div>
        <div className="layered-card-middle bg-#F8F9FC">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: "#181D27",
                fontWeight: 700,
                marginLeft: 16,
                paddingTop: 8,
              }}
            >
              2. Job Description
            </span>
          </div>
          <div className="layered-card-content">
            <RichTextEditor setText={setDescription} text={description} />
          </div>
        </div>
      </div>

      {/* Team Access PlaceHolder */}
      <div>
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: "#181D27",
                fontWeight: 700,
                marginLeft: 16,
                paddingTop: 8,
              }}
            >
              3. Team Access
            </span>
          </div>
          <div className="layered-card-content">
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );

  // SEGMENT 2: Settings
  const Segment2Settings = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#181D27",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="la la-cog"
                style={{ color: "#FFFFFF", fontSize: 20 }}
              ></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Settings
            </span>
          </div>
          <div className="layered-card-content">
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <i
                className="la la-id-badge"
                style={{ color: "#414651", fontSize: 20 }}
              ></i>
              <span>
                Screening Setting <span style={{ color: "#EF4444" }}>*</span>
              </span>
            </div>
            <CustomDropdown
              onSelectSetting={(setting) => setScreeningSetting(setting)}
              screeningSetting={screeningSetting}
              settingList={screeningSettingList}
            />
            <span>
              This settings allows Jia to automatically endorse candidates who
              meet the chosen criteria.
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                <i
                  className="la la-video"
                  style={{ color: "#414651", fontSize: 20 }}
                ></i>
                <span>Require Video Interview</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={requireVideo}
                    onChange={() => setRequireVideo(!requireVideo)}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{requireVideo ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SEGMENT 3: Interview Questions
  const Segment3InterviewQuestions = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <InterviewQuestionGeneratorV2
        questions={questions}
        setQuestions={(questions) => setQuestions(questions)}
        jobTitle={jobTitle}
        description={description}
      />
    </div>
  );

  // SEGMENT 4: Review
  const Segment4Review = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Career Information Review */}
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-suitcase"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Career Information
              </span>
            </div>
            <button
              onClick={() => setCurrentSegment(0)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Job Title
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {jobTitle || "Not provided"}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Description
                </span>
                <div
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    margin: "4px 0",
                    maxHeight: "200px",
                    overflowY: "auto",
                    padding: "8px",
                    background: "#F9FAFB",
                    borderRadius: "8px",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: description || "Not provided",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Review */}
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-ellipsis-h"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Additional Information
              </span>
            </div>
            <button
              onClick={() => setCurrentSegment(1)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Employment Type
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {employmentType}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Work Setup
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {workSetup || "Not provided"}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Salary
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {salaryNegotiable ? "Negotiable" : "Fixed"}
                  {minimumSalary &&
                    ` (₱${minimumSalary} - ₱${maximumSalary || "N/A"})`}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Location
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {city}, {province}, {country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Review */}
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-cog"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Settings
              </span>
            </div>
            <button
              onClick={() => setCurrentSegment(2)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Screening Setting
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {screeningSetting}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}
                >
                  Video Interview
                </span>
                <p
                  style={{
                    fontSize: 14,
                    color: "#181D27",
                    fontWeight: 600,
                    margin: "4px 0",
                  }}
                >
                  {requireVideo ? "Required" : "Optional"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Questions Review */}
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#181D27",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="la la-comments"
                  style={{ color: "#FFFFFF", fontSize: 20 }}
                ></i>
              </div>
              <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
                Interview Questions
              </span>
              <div
                style={{
                  borderRadius: "50%",
                  width: 30,
                  height: 22,
                  border: "1px solid #D5D9EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  backgroundColor: "#F8F9FC",
                  color: "#181D27",
                  fontWeight: 700,
                }}
              >
                {questions.reduce(
                  (acc, group) => acc + group.questions.length,
                  0
                )}
              </div>
            </div>
            <button
              onClick={() => setCurrentSegment(3)}
              style={{
                color: "#6941C6",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <i className="la la-edit" style={{ marginRight: 4 }}></i>
              Edit
            </button>
          </div>
          <div className="layered-card-content">
            {questions.map(
              (group, index) =>
                group.questions.length > 0 && (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <h4
                      style={{
                        fontSize: 14,
                        color: "#181D27",
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {group.category} ({group.questions.length} questions)
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {group.questions.map((question, qIndex) => (
                        <li
                          key={qIndex}
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                            marginBottom: 4,
                          }}
                        >
                          {question.question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="col">
      {/* HEADER SECTION */}
      <div
        style={{
          marginBottom: "35px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>
          {formType === "add" ? "Add new career" : "Edit Career Details"}
        </h1>

        {/* Last Saved Indicator */}
        {lastSaved && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#6B7280",
              fontSize: "14px",
            }}
          >
            <i className="la la-clock"></i>
            <span>Last saved: {formatRelativeTime(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* PROGRESS STEPS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          marginBottom: "40px",
          padding: "32px 24px",
          background: "#F9FAFB",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          position: "relative",
        }}
      >
        {/* Progress Line */}
        <div
          style={{
            position: "absolute",
            top: "64px", // Adjusted to center with icons
            left: "15%",
            right: "15%",
            height: "2px",
            background: "#E5E7EB",
            zIndex: 0,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#000000",
              width: `${(currentSegment / (segments.length - 1)) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {segments.map((segment, index) => {
          const isCompleted = completedSegments.includes(segment.id);
          const isCurrent = currentSegment === segment.id;
          const isClickable =
            segment.id <= currentSegment ||
            completedSegments.includes(segment.id);

          return (
            <div
              key={segment.id}
              onClick={() => handleSegmentClick(segment.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isClickable ? "pointer" : "not-allowed",
                opacity: isClickable ? 1 : 0.5,
                position: "relative",
                zIndex: 1,
                maxWidth: "180px",
              }}
            >
              {/* White Background Container */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Step Circle */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      isCompleted || isCurrent ? "#000000" : "#E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isCompleted ? (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="la la-check"
                        style={{
                          fontSize: 14,
                          color: "#000000",
                          fontWeight: 900,
                        }}
                      ></i>
                    </div>
                  ) : (
                    <i
                      className={`la ${segment.icon}`}
                      style={{
                        fontSize: 20,
                        color: isCurrent ? "#fff" : "#9CA3AF",
                      }}
                    ></i>
                  )}
                </div>
              </div>

              {/* Step Title */}
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: isCurrent ? 700 : 600,
                  color: isCurrent ? "#181D27" : "#6B7280",
                  textAlign: "center",
                  lineHeight: "1.4",
                  marginBottom: "6px",
                }}
              >
                {segment.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* FORM CONTENT - Conditionally Rendered Segments */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          minHeight: "400px",
        }}
      >
        {renderSegmentContent()}
      </div>

      {/* NAVIGATION BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          padding: "24px",
          background: "#F9FAFB",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentSegment === 0}
          style={{
            width: "fit-content",
            color: currentSegment === 0 ? "#9CA3AF" : "#414651",
            background: "#fff",
            border: "1px solid #D5D7DA",
            padding: "12px 24px",
            borderRadius: "60px",
            cursor: currentSegment === 0 ? "not-allowed" : "pointer",
            opacity: currentSegment === 0 ? 0.5 : 1,
            whiteSpace: "nowrap",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          <i className="la la-arrow-left" style={{ marginRight: 8 }}></i>
          Previous
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          {currentSegment === segments.length - 1 ? (
            // Final segment - show save buttons
            <>
              <button
                disabled={!isFormValid() || isSavingCareer}
                style={{
                  width: "fit-content",
                  color: "#414651",
                  background: "#fff",
                  border: "1px solid #D5D7DA",
                  padding: "12px 24px",
                  borderRadius: "60px",
                  cursor:
                    !isFormValid() || isSavingCareer
                      ? "not-allowed"
                      : "pointer",
                  whiteSpace: "nowrap",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                onClick={() => {
                  formType === "add"
                    ? confirmSaveCareer("inactive")
                    : updateCareer("inactive");
                }}
              >
                Save as Unpublished
              </button>
              <button
                disabled={!isFormValid() || isSavingCareer}
                style={{
                  width: "fit-content",
                  background:
                    !isFormValid() || isSavingCareer ? "#D5D7DA" : "black",
                  color: "#fff",
                  border: "1px solid #E9EAEB",
                  padding: "12px 24px",
                  borderRadius: "60px",
                  cursor:
                    !isFormValid() || isSavingCareer
                      ? "not-allowed"
                      : "pointer",
                  whiteSpace: "nowrap",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                onClick={() => {
                  formType === "add"
                    ? confirmSaveCareer("active")
                    : updateCareer("active");
                }}
              >
                <i
                  className="la la-check-circle"
                  style={{ color: "#fff", fontSize: 20, marginRight: 8 }}
                ></i>
                Save as Published
              </button>
            </>
          ) : (
            // Not final segment - show continue button
            <button
              onClick={handleNext}
              disabled={!validateSegment(currentSegment)}
              style={{
                width: "fit-content",
                background: !validateSegment(currentSegment)
                  ? "#D5D7DA"
                  : "black",
                color: "#fff",
                border: "1px solid #E9EAEB",
                padding: "12px 32px",
                borderRadius: "60px",
                cursor: !validateSegment(currentSegment)
                  ? "not-allowed"
                  : "pointer",
                whiteSpace: "nowrap",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Save & Continue
              <i className="la la-arrow-right" style={{ marginLeft: 8 }}></i>
            </button>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showSaveModal && (
        <CareerActionModal
          action={showSaveModal}
          onAction={(action) => saveCareer(action)}
        />
      )}
      {isSavingCareer && (
        <FullScreenLoadingAnimation
          title={formType === "add" ? "Saving career..." : "Updating career..."}
          subtext={`Please wait while we are ${
            formType === "add" ? "saving" : "updating"
          } the career`}
        />
      )}
    </div>
  );
}
