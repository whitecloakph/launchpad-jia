import { useEffect, useRef } from "react";

export const useAutoSaveProgress = ({
  progressData,
  onSave,
  interval = 30000, // 30 seconds
  enabled = true,
  minDataRequired = () => true,
}) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (minDataRequired(progressData)) {
        onSave(progressData);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [progressData, onSave, interval, enabled, minDataRequired]);
};