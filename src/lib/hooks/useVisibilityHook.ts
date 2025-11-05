import { useEffect, useRef, useState } from 'react';

export const useVisibilityHook = () => {
    const [isVisible, setIsVisible] = useState(true);
    const ref = useRef(null);
  
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, {
            rootMargin: "0px",
            threshold: 0.01
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
            observer.unobserve(ref.current);
            }
        };
    }, []);

    return { ref, isVisible };
}