import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const { 
    threshold = 0.1, 
    rootMargin = '0px', 
    delay = 0,
    stagger = false,
    staggerDelay = 100
  } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Add delay if specified
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
            
            // If stagger is enabled, add the stagger class after a short delay
            if (stagger && elementRef.current) {
              setTimeout(() => {
                elementRef.current?.classList.add('lazy-load-stagger-visible');
              }, staggerDelay);
            }
          }, delay);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, delay, hasAnimated, stagger, staggerDelay]);

  return { elementRef, isVisible };
}; 