import { useState, useMemo, useCallback } from "react";

interface TimelineStage {
    candidates: any[];
    droppedCandidates: any[];
    color: string;
    nextStage: any;
    currentStage: any;
}

type TimelineStages = Record<string, TimelineStage>;

const sortOrder = {
    "Strong Fit": 1,
    "Good Fit": 2,
    "Maybe Fit": 3,
    "Bad Fit": 4,
    "No Fit": 5,
    "Not Fit": 6,
    "Insufficient Data": 7,
    "No CV": 8,
    "N/A": 9
}

export function useCareerApplicants(initialStages: TimelineStages) {
    const [timelineStages, setTimelineStages] = useState<TimelineStages>(initialStages);

    // Memoized counts
    const interviewsInProgress = useMemo(
        () => Object.values(timelineStages).reduce((acc, stage) => acc + (stage.candidates?.length || 0), 0),
        [timelineStages]
    );
    const dropped = useMemo(
        () => Object.values(timelineStages).reduce((acc, stage) => acc + (stage.droppedCandidates?.length || 0), 0),
        [timelineStages]
    );
    const hired = useMemo(
        () => (timelineStages["Hired"]?.candidates?.length || 0),
        [timelineStages]
    );

    const setAndSortCandidates = useCallback((newStages: TimelineStages) => {
        const sortedStages: TimelineStages = {};

        for (const [key, stage] of Object.entries(newStages)) {
            sortedStages[key] = {
                ...stage,
                candidates: stage.candidates.sort((a: any, b: any) => {
                    const ratingA = (a.currentStep === "CV Screening" || key === "Pending AI Interview" ? a.cvStatus : a.jobFit) || "N/A";
                    const ratingB = (b.currentStep === "CV Screening" || key === "Pending AI Interview" ? b.cvStatus : b.jobFit) || "N/A";
                    return sortOrder[ratingA] - sortOrder[ratingB];
                })
            }
        }

        setTimelineStages(sortedStages);
    }, []);

    return {
        timelineStages,
        setAndSortCandidates,
        interviewsInProgress,
        dropped,
        hired,
    };
}