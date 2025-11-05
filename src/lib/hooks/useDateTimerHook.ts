import { useEffect, useState } from "react";

export default function useDateTimer() {
    const [date, setDate] = useState<Date>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return date;
}