"use client";

import { useEffect, useRef, useState } from "react";
import philippineCitiesAndProvinces from "../../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "../CareerActionModal";
import FullScreenLoadingAnimation from "../FullScreenLoadingAnimation";
import ProgressSteps from "./progress/ProgressSteps";
import SegmentCareerDetails from "./segments/SegmentCareerDetails";
import SegmentSettings from "./segments/SegmentSettings";
import SegmentInterviewQuestions from "./segments/SegmentInterviewQuestions";
import SegmentReview from "./segments/SegmentReview";

export default function CareerFormV2({
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

  // Form States
  const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
  const [description, setDescription] = useState(career?.description || "");
  const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
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
      title: "Career Details",
      icon: "la-dot-circle",
    },
    {
      id: 1,
      title: "Settings",
      icon: "la-dot-circle",
    },
    {
      id: 2,
      title: "Interview Questions",
      icon: "la-dot-circle",
    },
    {
      id: 3,
      title: "Review & Submit",
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
      const careerData = {
        jobTitle,
        description,
        workSetup,
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
        const response = await axios.post("/api/add-career", careerData);
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
        return (
          <SegmentCareerDetails
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            description={description}
            setDescription={setDescription}
            workSetup={workSetup}
            setWorkSetup={setWorkSetup}
            employmentType={employmentType}
            setEmploymentType={setEmploymentType}
            salaryNegotiable={salaryNegotiable}
            setSalaryNegotiable={setSalaryNegotiable}
            minimumSalary={minimumSalary}
            setMinimumSalary={setMinimumSalary}
            maximumSalary={maximumSalary}
            setMaximumSalary={setMaximumSalary}
            country={country}
            setCountry={setCountry}
            province={province}
            setProvince={setProvince}
            city={city}
            setCity={setCity}
            provinceList={provinceList}
            cityList={cityList}
            setCityList={setCityList}
          />
        );
      case 1:
        return (
          <SegmentSettings
            screeningSetting={screeningSetting}
            setScreeningSetting={setScreeningSetting}
            requireVideo={requireVideo}
            setRequireVideo={setRequireVideo}
          />
        );
      case 2:
        return (
          <SegmentInterviewQuestions
            questions={questions}
            setQuestions={setQuestions}
            jobTitle={jobTitle}
            description={description}
          />
        );
      case 3:
        return (
          <SegmentReview
            jobTitle={jobTitle}
            description={description}
            employmentType={employmentType}
            workSetup={workSetup}
            salaryNegotiable={salaryNegotiable}
            minimumSalary={minimumSalary}
            maximumSalary={maximumSalary}
            city={city}
            province={province}
            country={country}
            screeningSetting={screeningSetting}
            requireVideo={requireVideo}
            questions={questions}
            setCurrentSegment={setCurrentSegment}
          />
        );
      default:
        return null;
    }
  };

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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            disabled={!isFormValid() || isSavingCareer}
            style={{
              width: "fit-content",
              color: "#414651",
              background: "#fff",
              border: "1px solid #D5D7DA",
              padding: "8px 16px",
              borderRadius: "60px",
              cursor:
                !isFormValid() || isSavingCareer ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
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
              padding: "8px 16px",
              borderRadius: "60px",
              cursor:
                !isFormValid() || isSavingCareer ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => {
              formType === "add"
                ? confirmSaveCareer("active")
                : updateCareer("active");
            }}
          >
            Save and Continue
          </button>
        </div>
      </div>
      <ProgressSteps
        segments={segments}
        currentSegment={currentSegment}
        completedSegments={completedSegments}
        onSegmentClick={handleSegmentClick}
      />

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
