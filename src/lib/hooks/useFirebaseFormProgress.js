import { useState, useEffect, useCallback, useRef } from "react";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import {
  saveFormProgress,
  loadFormProgress,
  clearFormProgress,
} from "@/lib/firebase/firestoreProgress";

export const useFirebaseFormProgress = ({ userId, careerKey }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [savedProgressData, setSavedProgressData] = useState(null);
  const lastSavedDataRef = useRef(null);

  // Load saved progress on mount
  useEffect(() => {
    const initProgress = async () => {
      try {
        setIsLoading(true);
        const result = await loadFormProgress(userId, careerKey);

        if (result.success && result.data && !hasRestoredProgress) {
          setSavedProgressData(result.data);
          setHasRestoredProgress(true);

          // Show notification
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
                Your previous progress has been restored
              </span>
            </div>,
            2000,
            <i
              className="la la-info-circle"
              style={{ color: "#0066FF", fontSize: 32 }}
            ></i>
          );
        }
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && careerKey) {
      initProgress();
    }
  }, [userId, careerKey]);

  // Save progress
  const saveProgress = useCallback(
    async (progressData) => {
      try {
        // Avoid duplicate saves
        const currentData = JSON.stringify(progressData);
        if (currentData === lastSavedDataRef.current) {
          return { success: true };
        }

        setIsSaving(true);
        const result = await saveFormProgress(userId, careerKey, progressData);
        
        if (result.success) {
          lastSavedDataRef.current = currentData;
        }
        
        return result;
      } catch (error) {
        console.error("Failed to save progress:", error);
        return { success: false, error: error.message };
      } finally {
        setIsSaving(false);
      }
    },
    [userId, careerKey]
  );

  // Clear progress
  const clearProgress = useCallback(async () => {
    try {
      const result = await clearFormProgress(userId, careerKey);
      if (result.success) {
        setSavedProgressData(null);
        lastSavedDataRef.current = null;
      }
      return result;
    } catch (error) {
      console.error("Failed to clear progress:", error);
      return { success: false, error: error.message };
    }
  }, [userId, careerKey]);

  // Manual save with notification
  const handleManualSave = useCallback(
    async (progressData) => {
      const result = await saveProgress(progressData);
      
      if (result.success) {
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
              Progress saved! You can continue later
            </span>
          </div>,
          1500,
          <i
            className="la la-check-circle"
            style={{ color: "#039855", fontSize: 32 }}
          ></i>
        );
      } else {
        errorToast("Failed to save progress", 1300);
      }
      
      return result;
    },
    [saveProgress]
  );

  return {
    isLoading,
    isSaving,
    savedProgressData,
    saveProgress,
    clearProgress,
    handleManualSave,
  };
};