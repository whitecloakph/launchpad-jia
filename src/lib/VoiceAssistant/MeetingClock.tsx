"use client";

import { useEffect, useState } from "react";
import moment from "moment";

export default function MeetingClock() {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    // Update time immediately
    setCurrentTime(moment());

    // Set up interval to update every minute
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 50000); // 30000ms = 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <span className="text-bold">{currentTime.format("hh:mm A")}</span>;
}
