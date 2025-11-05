"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerStageColumn from "@/lib/components/CareerComponents/CareerStage";
import JobDescription from "@/lib/components/CareerComponents/JobDescription";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CandidateMenu from "@/lib/components/CareerComponents/CandidateMenu";
import CandidateCV from "@/lib/components/CareerComponents/CandidateCV";
import DroppedCandidates from "@/lib/components/CareerComponents/DroppedCandidates";
import CareerApplicantsTable from "@/lib/components/DataTables/CareerApplicantsTable";
import Swal from "sweetalert2";
import CandidateHistory from "@/lib/components/CareerComponents/CandidateHistory";
import { useCareerApplicants } from "@/lib/hooks/useCareerApplicants";
import CareerStatus from "@/lib/components/CareerComponents/CareerStatus";
import CandidateActionModal from "@/lib/components/CandidateComponents/CandidateActionModal";
import { candidateActionToast, errorToast, getStage } from "@/lib/Utils";
import { Tooltip } from "react-tooltip";

export default function ManageCareerPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const { orgID, user } = useAppContext();
    const [career, setCareer] = useState<any>(null);
    const { timelineStages, interviewsInProgress, dropped, hired, setAndSortCandidates } = useCareerApplicants({
        "CV Review": {
            candidates: [],
            droppedCandidates: [],
            color: "#6941C6",
            nextStage: {
                name: "Pending AI Interview",
                step: "AI Interview",
                status: "For Interview"
            },
            currentStage: {
                name: "CV Review",
                step: "CV Screening",
                status: "For CV Screening"
            }
        },
        "Pending AI Interview": {
            candidates: [],
            droppedCandidates: [],
            // Orange
            color: "#D97706",
            nextStage: {
                name: "AI Interview Review",
                step: "AI Interview",
                status: "For AI Interview Review"
            },
            currentStage: {
                name: "Pending AI Interview",
                step: "CV Screening",
                status: "For AI Interview"
            }
        },
        "AI Interview Review": {
            candidates: [],
            droppedCandidates: [],
            // Light Blue
            color: "#00CEC8",
            nextStage: {
                name: "For Human Interview",
                step: "Human Interview",
                status: "For Human Interview"
            },
            currentStage: {
                name: "AI Interview Review",
                step: "AI Interview",
                status: "For AI Interview Review"
            }
        },
        "For Human Interview": {
            candidates: [],
            droppedCandidates: [],
            color: "#B42318",
            nextStage: {
                name: "Human Interview Review",
                step: "Human Interview",
                status: "For Human Interview Review"
            },
            currentStage: {
                name: "For Human Interview",
                step: "Human Interview",
                status: "For Human Interview"
            }
        },
        "Human Interview Review": {
            candidates: [],
            droppedCandidates: [],
            // Violet
            color: "#7E3AF2",
            nextStage: {
                name: "Pending Job Interview",
                step: "Job Interview",
                status: "For Interview"
            },
            currentStage: {
                name: "Human Interview Review",
                step: "Human Interview",
                status: "For Human Interview Review"
            }
        },
        "Pending Job Interview": {
            candidates: [],
            droppedCandidates: [],
            // Blue
            color: "#1849D5",
            nextStage: {
                name: "Job Offered",
                step: "Job Offered",
                status: "Accepted"
            },
            currentStage: {
                name: "Pending Job Interview",
                step: "Job Interview",
                status: "For Interview"
            }
        },
        "Job Offered": {
            candidates: [],
            droppedCandidates: [],
            // Brown
            color: "#854D0E",
            nextStage: {
                name: "Contract Signed",
                step: "Contract Signed",
                status: "Accepted"
            },
            currentStage: {
                name: "Job Offered",
                step: "Job Offered",
                status: "Accepted"
            }
        },
        "Contract Signed": {
            candidates: [],
            droppedCandidates: [],
            // Light Green
            color: "#80EF80",
            nextStage: {
                name: "Hired",
                step: "Hired",
                status: "Accepted"
            },
            currentStage: {
                name: "Contract Signed",
                step: "Contract Signed",
                status: "Accepted"
            }
        },
    });
    const [activeTab, setActiveTab] = useState("application-timeline");
    const [candidateMenuOpen, setCandidateMenuOpen] = useState<boolean>(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>({});
    const [candidateCVOpen, setCandidateCVOpen] = useState<boolean>(false);
    const [selectedCandidateCV, setSelectedCandidateCV] = useState<any>({});
    const [droppedCandidatesOpen, setDroppedCandidatesOpen] = useState<boolean>(false);
    const [selectedDroppedCandidates, setSelectedDroppedCandidates] = useState<any>({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({
        _id: "",
        jobTitle: "",
        description: "",
        questions: [],
        status: "",
        screeningSetting: "",
        requireVideo: false,
        directInterviewLink: "",
    });
    const [showCandidateHistory, setShowCandidateHistory] = useState(false);
    const [selectedCandidateHistory, setSelectedCandidateHistory] = useState<any>({});
    const [showCandidateActionModal, setShowCandidateActionModal] = useState("");
    const draggedCandidateRef = useRef<boolean>(false);
    
    const tabs = [
      {
        label: "Application Timeline",
        value: "application-timeline",
        icon: "stream",
      },
      {
        label: "All Applicants",
        value: "all-applicants",
        icon: "users",
      },
      {
        label: "Career Description",
        value: "job-description",
        icon: "suitcase",
      },
    ];
    
      useEffect(() => {
        const fetchInterviews = async () => {
          if (!career?.id) return;

          const response = await axios.get(`/api/get-career-interviews?careerID=${career.id}`);
          if (response.data.length > 0) {
            let newTimelineStages = { ...timelineStages };
            for (const interview of response.data) {

                const isDropped = interview.applicationStatus === "Dropped" || interview.applicationStatus === "Cancelled";
                if (interview.currentStep === "AI Interview" || !interview.currentStep || (interview.currentStep === "CV Screening" && interview.status === "For AI Interview")) {
                    if (interview.status === "For Interview" || interview.status === "For AI Interview") {
                        isDropped ? newTimelineStages["Pending AI Interview"].droppedCandidates.push(interview) : newTimelineStages["Pending AI Interview"].candidates.push(interview);
                        continue;
                    }

                    isDropped ? newTimelineStages["AI Interview Review"].droppedCandidates.push(interview) : newTimelineStages["AI Interview Review"].candidates.push(interview);
                    continue;
                }
                
                if (interview.currentStep === "CV Screening") {
                    isDropped ? newTimelineStages["CV Review"].droppedCandidates.push(interview) : newTimelineStages["CV Review"].candidates.push(interview);
                    continue;
                }

                if (interview.currentStep === "Human Interview") {
                    if (interview.status === "For Human Interview") {
                        isDropped ? newTimelineStages["For Human Interview"].droppedCandidates.push(interview) : newTimelineStages["For Human Interview"].candidates.push(interview);
                        continue;
                    }
                    if (interview.status === "For Human Interview Review") {
                        isDropped ? newTimelineStages["Human Interview Review"].droppedCandidates.push(interview) : newTimelineStages["Human Interview Review"].candidates.push(interview);
                        continue;
                    }
                }

                if (interview.currentStep === "Job Interview") {
                   isDropped ? newTimelineStages["Pending Job Interview"].droppedCandidates.push(interview) : newTimelineStages["Pending Job Interview"].candidates.push(interview);
                   continue;
                }

                if (interview.currentStep === "Job Offered") {
                    isDropped ? newTimelineStages["Job Offered"].droppedCandidates.push(interview) : newTimelineStages["Job Offered"].candidates.push(interview);
                    continue;
                }

                if (interview.currentStep === "Contract Signed") {
                    isDropped ? newTimelineStages["Contract Signed"].droppedCandidates.push(interview) : newTimelineStages["Contract Signed"].candidates.push(interview);
                    continue;
                }
            }
    
            setAndSortCandidates(newTimelineStages);
          }
        };
        
        fetchInterviews();
      }, [career?.id]);

    useEffect(() => {
        const fetchCareer = async () => {
            if (!slug && !orgID) return;
            try {
                const response = await axios.post("/api/career-data", {
                    id: slug,
                    orgID,
                  });
                  
                setCareer(response.data);
                const deepCopy = JSON.parse(JSON.stringify(response.data?.questions ?? []));
                setFormData({
                    _id: response.data?._id || "",
                    jobTitle: response.data?.jobTitle || "",
                    description: response.data?.description || "",
                    questions: deepCopy,
                    status: response.data?.status || "",
                    screeningSetting: response.data?.screeningSetting || "",
                    requireVideo: response.data?.requireVideo === null || response.data?.requireVideo === undefined ? true : response.data?.requireVideo,
                    directInterviewLink: response.data?.directInterviewLink || "",
                    createdBy: response.data?.createdBy || {},
                    minimumSalary: response.data?.minimumSalary || "",
                    maximumSalary: response.data?.maximumSalary || "",
                    province: response.data?.province || "",
                    location: response.data?.location || "",
                    salaryNegotiable: response.data?.salaryNegotiable || false,
                    workSetup: response.data?.workSetup || "",
                    workSetupRemarks: response.data?.workSetupRemarks || "",
                    createdAt: response.data?.createdAt || "",
                    updatedAt: response.data?.updatedAt || "",
                    lastEditedBy: response.data?.lastEditedBy || {},
                    employmentType: response.data?.employmentType || "Full-time",
                    orgID: response.data?.orgID || "",
                });
                if (tab === "edit") {
                    setActiveTab("job-description");
                }
            } catch (error) {
                if (error.response.status === 404) {
                    Swal.fire({
                        title: "Career not found",
                        text: "Redirecting back to careers page...",
                        timer: 1500,
                    }).then(() => {
                        window.location.href = "/recruiter-dashboard/careers";
                    });
                    return;
                }
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong! Please try again.",
                });
            }
        }
        fetchCareer();
    }, [slug, orgID, tab]);

    const handleCandidateMenuOpen = (candidate: any) => {
        setCandidateMenuOpen(prev => !prev);
        setSelectedCandidate(candidate);
    }

    const handleCandidateCVOpen = (candidate: any) => {
        setCandidateCVOpen(prev => !prev);
        setSelectedCandidateCV(candidate);
    }

    const handleDroppedCandidatesOpen = (stage: string) => {
        setDroppedCandidatesOpen(prev => !prev);
        setSelectedDroppedCandidates({...timelineStages[stage], stage});
    }

    const handleCandidateHistoryOpen = (candidate: any) => {
        setShowCandidateHistory(prev => !prev);
        setSelectedCandidateHistory(candidate);
    }

    const handleCandidateAnalysisComplete = (updatedCandidate: any) => {
        const updatedStages = {...timelineStages };
        updatedStages[updatedCandidate.stage].candidates = updatedStages[updatedCandidate.stage].candidates.map((c: any) => c._id === updatedCandidate._id ? updatedCandidate : c);
        setAndSortCandidates(updatedStages);
    }

    const handleCancelEdit = () => {
        setFormData({
            _id: career?._id || "",
            jobTitle: career?.jobTitle || "",
            description: career?.description || "",
            questions: career?.questions || [],
            status: career?.status || "",
            screeningSetting: career?.screeningSetting || "",
            requireVideo: career?.requireVideo === null || career?.requireVideo === undefined ? true : career?.requireVideo,
        });
        setIsEditing(false);
    }

    const handleEndorseCandidate = (candidate: any) => {
        setShowCandidateActionModal("endorse");
        setSelectedCandidate(candidate);
    }

    const handleDropCandidate = (candidate: any) => {
        setShowCandidateActionModal("drop");
        setSelectedCandidate(candidate);
    }
    
    const dragEndorsedCandidate = (candidateId: string, fromStageKey: string, toStageKey: string) => {
        const candidateIndex = (timelineStages?.[fromStageKey]?.candidates as any[]).findIndex((c) => c._id.toString() === candidateId);
        const currentStage = timelineStages?.[toStageKey]?.currentStage;
        const update = {
            currentStep: currentStage.step,
            status: currentStage.status,
            updatedAt: Date.now(),
            applicationMetadata: {
              updatedAt: Date.now(),
              updatedBy: {
                  image: user?.image,
                  name: user?.name,
                  email: user?.email,
              },
              action: "Endorsed",
            }
        }
        if (candidateIndex !== -1) {
            const updatedStages = {...timelineStages }
            const candidate = updatedStages?.[fromStageKey]?.candidates?.[candidateIndex];
            // Remove and add to new stage
            
            (updatedStages?.[toStageKey]?.candidates as any[]).push({...candidate, ...update});
            (updatedStages?.[fromStageKey]?.candidates as any[]).splice(candidateIndex, 1);
            setAndSortCandidates(updatedStages);
            draggedCandidateRef.current = true;
            setShowCandidateActionModal("endorse");
            setSelectedCandidate({...candidate, stage: fromStageKey, toStage: toStageKey});
        }
    }

    const handleReconsiderCandidate = (candidate: any) => {
        setShowCandidateActionModal("reconsider");
        setSelectedCandidate(candidate);
    }

    const handleRetakeInterview = async (candidate: any) => {
        setShowCandidateActionModal("retake");
        setSelectedCandidate(candidate);
    }

    const handleCandidateAction = async (action: string) => {
        setShowCandidateActionModal("");
        if (action === "endorse") {
            Swal.showLoading();
            const { stage, toStage } = selectedCandidate;
            const nextStage = toStage ? timelineStages[toStage].currentStage : timelineStages[stage].nextStage;
            try {
                const update = {
                    currentStep: nextStage.step,
                    status: nextStage.status,
                    updatedAt: Date.now(),
                    applicationMetadata: {
                      updatedAt: Date.now(),
                      updatedBy: {
                          image: user?.image,
                          name: user?.name,
                          email: user?.email,
                      },
                      action: "Endorsed",
                    }
                }
                await axios.post("/api/update-interview", {
                    uid: selectedCandidate._id,
                    data: update,
                    interviewTransaction: {
                        interviewUID: selectedCandidate._id,
                        fromStage: stage,
                        toStage: nextStage.name,
                        action: "Endorsed",
                        updatedBy: {
                            image: user?.image,
                            name: user?.name,
                            email: user?.email,
                        },
                    }
                });
                if (!draggedCandidateRef.current) {
                    const updatedStages = {...timelineStages };
                    updatedStages[stage].candidates = updatedStages[stage].candidates.filter((c: any) => c._id !== selectedCandidate._id);
                    updatedStages[nextStage.name].candidates.push({...selectedCandidate, ...update});
                    setAndSortCandidates(updatedStages);
                }
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Candidate endorsed</span>
                        <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have endorsed the candidate to the next stage.</span>
                      </div>
                    </div>,
                    1300, 
                  <i className="la la-user-check" style={{ color: "#039855", fontSize: 32 }}></i>)
            } catch (error) {
                console.error("error", error);
                errorToast("Failed to endorse candidate", 1300);
            } finally {
                Swal.close();
            }
        }

        if (action === "drop") {
            Swal.showLoading();
            try {
                const { stage } = selectedCandidate;
                const update = {
                    applicationStatus: "Dropped",
                    updatedAt: Date.now(),
                    applicationMetadata: {
                    updatedAt: Date.now(),
                    updatedBy: {
                        image: user?.image,
                        name: user?.name,
                        email: user?.email,
                    },
                    action: "Dropped",
                    }
                }
                await axios.post("/api/update-interview", {
                    uid: selectedCandidate._id,
                    data: update,
                     // For logging history
                     interviewTransaction: {
                        interviewUID: selectedCandidate._id,
                        fromStage: stage,
                        action: "Dropped",
                        updatedBy: {
                            image: user?.image,
                            name: user?.name,
                            email: user?.email,
                        },
                    }
                });
                 // Update state
                 if (timelineStages?.[stage]) {
                    const updatedStages = {...timelineStages };
                    updatedStages[stage].droppedCandidates.push({...selectedCandidate, ...update});
                    updatedStages[stage].candidates = updatedStages[stage].candidates.filter((c: any) => c._id !== selectedCandidate._id);
                    setAndSortCandidates(updatedStages);
                }
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Candidate dropped</span>
                        <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have dropped the candidate from the application process. </span>
                      </div>
                    </div>,
                    1300, 
                  <i className="la la-user-minus" style={{ color: "#D92D20", fontSize: 32 }}></i>)
            } catch (error) {
                console.error("error", error);
                errorToast("Failed to drop candidate", 1300);
            } finally {
                Swal.close();
            }
        }

        if (action === "reconsider") {
            Swal.showLoading();
            try {
                const { stage } = selectedCandidate;
                const update = {
                    applicationStatus: "Ongoing",
                    updatedAt: Date.now(),
                    applicationMetadata: {
                      updatedAt: Date.now(),
                      updatedBy: {
                          image: user?.image,
                          name: user?.name,
                          email: user?.email,
                      },
                      action: "Reconsidered",
                    }
                };
                 await axios.post("/api/update-interview", {
                    uid: selectedCandidate._id,
                    data: update,
                    interviewTransaction: {
                        interviewUID: selectedCandidate._id,
                        fromStage: stage,
                        action: "Reconsidered",
                        updatedBy: {
                            image: user?.image,
                            name: user?.name,
                            email: user?.email,
                        },
                    }
                });
                if (timelineStages?.[stage]) {
                    const updatedStages = {...timelineStages };
                    updatedStages[stage].droppedCandidates = updatedStages[stage].droppedCandidates.filter((c: any) => c._id !== selectedCandidate._id);
                    updatedStages[stage].candidates.push({...selectedCandidate, ...update});
                    setAndSortCandidates(updatedStages);
                }
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Candidate reconsidered</span>
                        <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have reconsidered the candidate back to the ongoing stage.</span>
                      </div>
                    </div>,
                    1300, 
                  <i className="la la-user-check" style={{ color: "#039855", fontSize: 32 }}></i>)
            } catch (error) {
                console.error("error", error);
                errorToast("Failed to reconsider candidate", 1300);
            } finally {
                Swal.close();
            }
        }
        if (action === "approve") {
            Swal.showLoading();
            // reset interview data
            try {
            await axios.post("/api/reset-interview-data", {
                id: selectedCandidate._id,
            });
            
            await axios.post("/api/update-interview", {
                uid: selectedCandidate._id,
                data: {
                    retakeRequest: {
                    status: "Approved",
                    updatedAt: Date.now(),
                    approvedBy: {
                        image: user.image,
                        name: user.name,
                        email: user.email,
                    },
                    },
                },
                interviewTransaction: {
                    interviewUID: selectedCandidate._id,
                    fromStage: getStage(selectedCandidate),
                    toStage: "Pending AI Interview",
                    action: "Endorsed",
                    updatedBy: {
                        image: user?.image,
                        name: user?.name,
                        email: user?.email,
                    },
                },
            });
            Swal.close();
            candidateActionToast(
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Approved request</span>
                    <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have approved <strong>{selectedCandidate?.name}'s</strong> request to retake interview.</span>
                  </div>
                </div>,
                1300, 
              <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
                window.location.href = `/recruiter-dashboard/careers/manage/${slug}`;
            }, 1300);
            } catch (error) {
                console.error("error", error);
                Swal.close();
                errorToast("Failed to approve request", 1300);
            }
        }

        if (action === "reject") {      
            Swal.showLoading();
            try {
            await axios.post("/api/update-interview", {
                uid: selectedCandidate._id,
                data: {
                  retakeRequest: {
                    status: "Rejected",
                    updatedAt: Date.now(),
                    approvedBy: {
                      image: user.image,
                      name: user.name,
                      email: user.email,
                    },
                  },
                },
              });
              
            Swal.close();
            candidateActionToast(
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Rejected request</span>
                    <span style={{ fontSize: 14, color: "#717680", fontWeight: 500, whiteSpace: "nowrap" }}>You have rejected <strong>{selectedCandidate?.name}'s</strong> request to retake interview.</span>
                  </div>
                </div>,
                1300,
              <i className="la la-times-circle" style={{ color: "#D92D20", fontSize: 32 }}></i>)
            setTimeout(() => {
                window.location.href = `/recruiter-dashboard/careers/manage/${slug}`;
            }, 1300);
            } catch (error) {
                console.error("error", error);
                Swal.close();
                errorToast("Failed to reject request", 1300);
            }
        }

        if (!action && draggedCandidateRef.current) {
            // Revert the changes since cancelled
            const { stage, toStage } = selectedCandidate;
            const revertedStages = {...timelineStages };
            const newCandidateIndex = (revertedStages?.[toStage]?.candidates as any[]).findIndex((c) => c._id.toString() === selectedCandidate._id);
            (revertedStages?.[stage]?.candidates as any[]).push(selectedCandidate);
            (revertedStages?.[toStage]?.candidates as any[]).splice(newCandidateIndex, 1);
            setAndSortCandidates(revertedStages);
            draggedCandidateRef.current = false;
        }
    }
    return (
        <>
            {/* Header */}
            <HeaderBar activeLink="Careers" currentPage={formData.jobTitle} icon="la la-suitcase" />
            <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {isEditing ? 
                    <input 
                    type="text" 
                    value={formData.jobTitle} 
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} 
                    style={{ color: "#030217", fontWeight: 550, fontSize: 30, width: "70%" }} 
                    /> 
                : <div style={{ maxWidth: "70%" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <h1 style={{ color: "#030217", fontWeight: 550, fontSize: 30 }}>{formData.jobTitle}</h1>
                    <CareerStatus status={formData.status} />
                </div>
                </div>}
                {/* <div style={{ display: "flex", gap: 16, alignItems: "center", textAlign: "center" }}>
                <div style={{ color: "#030217" }}>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{hired}</div>
                    <div style={{ fontSize: 14 }}>Hired</div>
                </div>
                <div style={{ width: 1, height: "50px", background: "#E9EAEB", marginLeft: "15px", marginRight: "15px" }} />
                <div  style={{ color: "#030217" }}>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{interviewsInProgress}</div>
                    <div style={{ fontSize: 14 }}>In Progress</div>
                </div>
                <div style={{ width: 1, height: "50px", background: "#E9EAEB", marginLeft: "15px", marginRight: "15px"  }} />
                <div style={{ color: "#030217" }}>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{dropped}</div>
                    <div style={{ fontSize: 14 }}>Dropped</div>
                </div> 
                </div> */}

                {/* Export candidates button */}
                {interviewsInProgress > 0 && <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <button 
                    style={{
                        background: "white",
                        border: "1px solid #E9EAEB",
                        borderRadius: 60,
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        // Download spreadsheed file of all candidates
                        const candidates = Object.keys(timelineStages).flatMap((key) => {
                            const stage = timelineStages[key];
                            if (stage.candidates.length > 0) {
                                return stage.candidates.map((candidate) => {
                                    return {
                                        ...candidate,
                                        stage: key,
                                    }
                                });
                            }
                            return [];
                        });
                        const csvContent = "data:text/csv;charset=utf-8,NAME,EMAIL,JOB TITLE,DATE APPLIED,APPLICATION STAGE,CV SCREENING RATING,AI INTERVIEW RATING" + "\n" + candidates.map((candidate) => {
                            return [
                                candidate.name?.replace(/,/g, ""),
                                candidate.email?.replace(/,/g, ""),
                                career.jobTitle?.replace(/,/g, ""),
                                new Date(candidate.createdAt).toLocaleDateString(),
                                candidate.stage,
                                candidate.cvStatus || "N/A",
                                candidate.jobFit || "N/A",
                            ]
                        }).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `${career.jobTitle}-Candidates-${new Date().toLocaleDateString()}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}>
                        <i className="la la-file-alt" style={{ fontSize: 20, marginRight: 8 }}></i>
                        Export Candidates
                    </button>
                </div>}
            </div>
            <div style={{ padding: "16px 0 48px", background: "#FDFDFD", minHeight: "100vh" }}>
            {/* Tabs */}
            <div className="career-tab-container">
                <div className="career-tab-content">
                    {tabs.map((tab) => (
                    <div 
                    key={tab.value} 
                    className={`career-tab-item ${activeTab === tab.value ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.value)}>
                        <i className={`la la-${tab.icon}`} style={{ fontSize: 20, marginRight: 8 }}></i>
                        {tab.label}
                    </div>
                    ))}
                </div>
            </div>
            {/* Career Tab Information */}
            {activeTab === "application-timeline" && <CareerStageColumn 
            timelineStages={timelineStages} 
            handleCandidateMenuOpen={handleCandidateMenuOpen} 
            handleCandidateCVOpen={handleCandidateCVOpen} 
            handleDroppedCandidatesOpen={handleDroppedCandidatesOpen} 
            handleEndorseCandidate={handleEndorseCandidate} 
            handleDropCandidate={handleDropCandidate} 
            dragEndorsedCandidate={dragEndorsedCandidate} 
            handleCandidateHistoryOpen={handleCandidateHistoryOpen} 
            handleRetakeInterview={handleRetakeInterview}
            />}
            {activeTab === "all-applicants" && <CareerApplicantsTable slug={career?.id} />}
            {activeTab === "job-description" && <JobDescription formData={formData} setFormData={setFormData} editModal={tab === "edit"} isEditing={isEditing} setIsEditing={setIsEditing} handleCancelEdit={handleCancelEdit} />}
            {candidateMenuOpen && <CandidateMenu 
            handleCandidateMenuOpen={handleCandidateMenuOpen} 
            candidate={selectedCandidate} 
            handleCandidateCVOpen={handleCandidateCVOpen} 
            handleEndorseCandidate={handleEndorseCandidate} 
            handleDropCandidate={handleDropCandidate} 
            handleCandidateAnalysisComplete={handleCandidateAnalysisComplete} 
            handleRetakeInterview={handleRetakeInterview} 
            />}
            {candidateCVOpen && <CandidateCV candidate={selectedCandidateCV} setShowCandidateCV={setCandidateCVOpen} />}
            {droppedCandidatesOpen && <DroppedCandidates handleDroppedCandidatesOpen={setDroppedCandidatesOpen} timelineStage={selectedDroppedCandidates} handleCandidateMenuOpen={handleCandidateMenuOpen} handleCandidateCVOpen={handleCandidateCVOpen} handleReconsiderCandidate={handleReconsiderCandidate} />}
            {showCandidateHistory && <CandidateHistory candidate={selectedCandidateHistory} setShowCandidateHistory={setShowCandidateHistory} />}
            {showCandidateActionModal && <CandidateActionModal candidate={selectedCandidate} onAction={handleCandidateAction} action={showCandidateActionModal} />}
            <Tooltip className="career-fit-tooltip fade-in" id="career-fit-tooltip"/>
        </div>
        </div>
    </>
    )
}