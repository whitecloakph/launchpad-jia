"use client"
import Image from "next/image";
import Footer from "@/lib/PageComponent/Footer";
import HomeNavBar from "@/lib/PageComponent/HomeNavBar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { validateEmail } from "../lib/Utils";
import { useLazyLoad } from "@/lib/hooks/useLazyLoad";
import { useParallax } from "react-scroll-parallax";
import { useVisibilityHook } from "../lib/hooks/useVisibilityHook";

const palette = {
    primaryText: "black",
    gradientCard: "linear-gradient(180deg, #F5F5F5 0%, #FFFFFF 100%)",
    cardShadow: "0px 0px 24px 0px rgba(149, 37, 201, 0.08)",
    accentPurple: "#9525C9",
};

const testimonials = [
  {
    quote: "I liked that it was formal - like a real-life interview - but still natural and conversational!"
  },
  {
    quote: "Talking to JIA felt less pressuring. It was a new and interesting experience!",
  },
  {
    quote: "The questions were tailored to the role I was applying for. Super efficient!",
  },
  {
    quote: "I spoke in Taglish, and JIA still understood me perfectly."
  }
]

const parallaxOptions = {
  speed: -10,
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsContainerRef = useRef<HTMLDivElement>(null);
  const [isStickyMobileMenu, setIsStickyMobileMenu] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Lazy load hooks for each section
  const { elementRef: heroRef, isVisible: isHeroVisible } = useLazyLoad({ delay: 0 });
  const { elementRef: logoRef, isVisible: isLogoVisible } = useLazyLoad({ delay: 200 });
  const { elementRef: subheaderRef, isVisible: isSubheaderVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: subheader2Ref, isVisible: isSubheader2Visible } = useLazyLoad({ delay: 600 });
  const { elementRef: imagesContainerRef, isVisible: isImagesContainerVisible } = useLazyLoad({ delay: 600 });
  const { elementRef: featureListRef, isVisible: isFeatureListVisible } = useLazyLoad({ delay: 0, stagger: true, staggerDelay: 200 });
  
  // Additional lazy load hooks for other sections
  const { elementRef: valuePropsRef, isVisible: isValuePropsVisible } = useLazyLoad({ delay: 0 });

  // Strengths section icons
  const { elementRef: strengthsCalendarIconRef, isVisible: isStrengthsCalendarIconVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: strengthsClockIconRef, isVisible: isStrengthsClockIconVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: strengthsTrophyIconRef, isVisible: isStrengthsTrophyIconVisible } = useLazyLoad({ delay: 600 });
  const { elementRef: strengthsMagnifyingGlassIconRef, isVisible: isStrengthsMagnifyingGlassIconVisible } = useLazyLoad({ delay: 600 });

  // How it works section
  const { elementRef: howItWorksRef, isVisible: isHowItWorksVisible } = useLazyLoad({ delay: 200 });
  const { elementRef: firstStepRef, isVisible: isFirstStepVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: firstStepLineRef, isVisible: isFirstStepLineVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: firstStepGuideTextRef, isVisible: isFirstStepGuideTextVisible } = useLazyLoad({ delay: 600 });
  const { elementRef: secondStepRef, isVisible: isSecondStepVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: secondStepLineRef, isVisible: isSecondStepLineVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: secondStepGuideTextRef, isVisible: isSecondStepGuideTextVisible } = useLazyLoad({ delay: 600 });
  const { elementRef: thirdStepRef, isVisible: isThirdStepVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: thirdStepLineRef, isVisible: isThirdStepLineVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: thirdStepGuideTextRef, isVisible: isThirdStepGuideTextVisible } = useLazyLoad({ delay: 600 });
  const { elementRef: fourthStepRef, isVisible: isFourthStepVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: fourthStepLineRef, isVisible: isFourthStepLineVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: fourthStepGuideTextRef, isVisible: isFourthStepGuideTextVisible } = useLazyLoad({ delay: 600 });
  const { elementRef: fifthStepRef, isVisible: isFifthStepVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: fifthStepLineRef, isVisible: isFifthStepLineVisible } = useLazyLoad({ delay: 400 });
  const { elementRef: fifthStepGuideTextRef, isVisible: isFifthStepGuideTextVisible } = useLazyLoad({ delay: 600 });


  const sphere1ParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const halfCircleParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const sphere2ParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const candidateAnalysisParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const cvReviewParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const rockParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const sphere3ParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const sphere4ParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);
  const sphere5ParallaxRef = useParallax<HTMLImageElement>(parallaxOptions);

  const { ref, isVisible } = useVisibilityHook();

  const scrollToIndex = (index: number) => {
    if (testimonialsContainerRef.current) {
      const nextCard = testimonialsContainerRef.current.children[index] as HTMLElement;
      if (nextCard) {
        nextCard.scrollIntoView({ behavior: "smooth", inline: index === testimonialsContainerRef.current.children?.length - 1 ? "nearest" : "center", block: "nearest" });
      }
    }
  }

  useEffect(() => {
     if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsStickyMobileMenu(true);
      } else {
        setIsStickyMobileMenu(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!testimonialsContainerRef.current) return;

    const handleScroll = () => {
      const children = Array.from(testimonialsContainerRef.current.children);
      if (children.length === 0) return;
      const firstChild = children[0];
      let currentIndex = 0;
      let scrollLeft = Math.abs(firstChild.getBoundingClientRect().left - testimonialsContainerRef.current.getBoundingClientRect().left);

      children.forEach((child, index) => {
        const offset = Math.abs(child.getBoundingClientRect().left - testimonialsContainerRef.current.getBoundingClientRect().left);
        if (offset < scrollLeft) {
          currentIndex = index;
          scrollLeft = offset;
        }
      })
      setCurrentTestimonialIndex(currentIndex);
    }

    testimonialsContainerRef.current.addEventListener("scroll", handleScroll);
    return () => testimonialsContainerRef.current?.removeEventListener("scroll", handleScroll);
  },[])

  const handleSubmitNewsletter = async () => {
    if (!validateEmail(email) || !email?.trim()) {
      setEmailError("Please enter a valid email address");
      return;
    } else {
      setEmailError("");
    }

    try {
      Swal.fire({
        title: "Subscribing to newsletter...",
        text: "Please wait while we subscribe you to our newsletter...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      await axios.post("/api/add-newsletter-subscriber", { email });
      Swal.close();
      Swal.fire({
        title: "Success",
        text: "You have been subscribed to our newsletter. Thank you for subscribing!",
        icon: "success",
        confirmButtonText: "OK",
      })
      setEmail("");
      setEmailError("");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
      })
    }
  }


    return (
      <>
        <main className="homepage-main">
          <div ref={ref}>
            <div className="homepage-container">
            <HomeNavBar isStickyMobileMenu={isStickyMobileMenu} />
            <div className="homepage-section-1">
            <section
              id="about"
              className="fade-in-hero"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "80px 0px 80px",
                minHeight: 700,
              }}
            >
            <div className="about-us-section">
                <div 
                  ref={heroRef}
                  style={{
                    opacity: isHeroVisible ? 1 : 0,
                    transform: isHeroVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                  <h1 className="meet-jia">Meet</h1>
                </div>
                
                <div 
                  ref={logoRef}
                  style={{
                    opacity: isLogoVisible ? 1 : 0,
                    transform: isLogoVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                  <Image
                      className="jia-logo"
                      src="/Logo.svg"
                      alt="Jia Logo"
                      width={277}
                      height={120}
                  />
                </div>
                
                <div 
                  ref={subheaderRef}
                  style={{
                    opacity: isSubheaderVisible ? 1 : 0,
                    transform: isSubheaderVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                  <h2 className="subheader">Your AI-Powered Hiring Suite</h2>
                </div>
                
                <div 
                  ref={subheader2Ref}
                  style={{
                    opacity: isSubheader2Visible ? 1 : 0,
                    transform: isSubheader2Visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                  <h2 className="subheader-2">Modernize your hiring process <br /> with cutting-edge AI</h2>
                </div>
                
                <div 
                  ref={imagesContainerRef}
                  className="images-container"
                  style={{
                    opacity: isImagesContainerVisible ? 1 : 0,
                    transform: isImagesContainerVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                <Image
                    src="/sphere.png"
                    alt="Sphere"
                    width={100}
                    height={100}
                    className="sphere-1"
                    ref={sphere1ParallaxRef.ref}
                />
                <img
                    src="/half-circle.png"
                    alt="Half Circle"
                    width={300}
                    height={300}
                    ref={halfCircleParallaxRef.ref}
                    className="half-circle"
                />
                <Image
                    src="/sphere.png"
                    alt="Sphere"
                    width={230}
                    height={230}
                    ref={sphere2ParallaxRef.ref}
                    className="sphere-2"
                />
                <Image
                    className="career-swimlane"
                    src="/career-swimlane-v2.svg"
                    alt="Career Swimlane"
                    width={870}
                    height={735}
                    priority={true}
                />
                <Image
                    src="/cv-review-v2.svg"
                    alt="CV Review"
                    className="cv-review"
                    width={188}
                    height={369}
                    ref={cvReviewParallaxRef.ref}
                />
                <Image
                    className="candidate-analysis"
                    src="/candidate-analysis-v2.svg"
                    alt="Candidate Analysis"
                    width={243}
                    height={444}
                    ref={candidateAnalysisParallaxRef.ref}
                />
                </div>
                
                <div 
                  ref={featureListRef}
                  className="lazy-load-stagger"
                  style={{
                    opacity: isFeatureListVisible ? 1 : 0,
                    transform: isFeatureListVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                  }}
                >
                  <h1 className="subheader">Jia is an end-to-end hiring tool for recruiters that combines:</h1>
                  <div className="feature-list">
                    <div style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 24,
                      alignItems: "center",
                      textAlign: "left",
                    }}>
                      <i className="la la-check-circle" style={{ fontSize: 24, color: "#9525C9" }}></i>
                      <span>AI Interviewer with <br />
                      Smart Analysis and Scoring</span>
                    </div>
                    <div style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 24,
                      alignItems: "center",
                      textAlign: "left",
                    }}>
                      <i className="la la-check-circle" style={{ fontSize: 24, color: "#9525C9" }}></i>
                      <span>Automated Smart <br />
                      CV Screener</span>
                    </div>
                    <div style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 24,
                      alignItems: "center",
                      textAlign: "left",
                    }}>
                      <i className="la la-check-circle" style={{ fontSize: 24, color: "#9525C9" }}></i>
                      <span>Modern Application <br /> Tracking System (ATS)</span>
                    </div>
                  </div>
                </div>
            </div>
        </section>
        </div>
        </div>
        <section
          className="fade-in-hero"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 0px 80px",
            minHeight: 700,
            backgroundColor: "#FFFFFF",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div 
            ref={valuePropsRef}
            className="strengths-section"
            style={{
              opacity: isValuePropsVisible ? 1 : 0,
              transform: isValuePropsVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            }}
          >
            <h1 className="header">Modernize your hiring process with <br /> cutting-edge AI</h1>

            <div
            style={{
              display: "flex",
              gap: 24,
              width: "100%",
              maxWidth: 1200,
              flexWrap: "wrap",
              justifyContent: "center",
              padding: "0 20px",
              position: "relative",
            }}
          >
              <Image
                    src="/sphere.png"
                    alt="Sphere"
                    width={230}
                    height={230}
                    className="sphere-1"
                    ref={sphere3ParallaxRef.ref}
                />
                <Image
                    src="/rock.png"
                    alt="Rock"
                    width={200}
                    height={200}
                    ref={rockParallaxRef.ref}
                    style={{
                      position: "absolute",
                      bottom: -100,
                      left: -50,
                      zIndex: -1
                    }}
                />

            {/* Value Proposition 1 */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(196, 185, 252, 0.5) 0%, rgba(176, 228, 240, 0.5) 100%)",
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "20px 40px",
                minHeight: 270,
                width: "100%",
                maxWidth: 450,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  color: palette.primaryText,
                  margin: "16px 0 0 0",
                  textAlign: "left",
                }}
              >
                Faster Hiring Process
              </h3>
              <p
                style={{
                  color: palette.primaryText,
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.6,
                }}
              >
                Cut screening time from weeks to days. Jia screens CVs simultaneously and conducts AI interviews anytime, eliminating back-and-forth scheduling.
              </p>
              <div 
              ref={strengthsCalendarIconRef}
              style={{
                opacity: isStrengthsCalendarIconVisible ? 1 : 0,
                transform: isStrengthsCalendarIconVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: "absolute",
                  bottom: 0,
                  right: 0,
              }}
              >
              <Image
                src="/calendar.svg"
                alt="Value Proposition 1"
                width={110}
                height={110}
              />
              </div>
            </div>
            {/* Value Proposition 2 */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(214, 213, 255, 0.5) 0%, rgba(255, 228, 228, 0.5) 100%)",
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "20px 40px",
                minHeight: 270,
                width: "100%",
                maxWidth: 450,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  color: palette.primaryText,
                  margin: "16px 0 0 0",
                }}
              >
                Cost & Time Savings
              </h3>
              <p
                style={{
                  color: palette.primaryText,
                  fontSize: "clamp(14px, 3vw, 16px)",
                  textAlign: "left",
                  lineHeight: 1.6,
                }}
              >
                Automate interviews and free your team to focus on top candidates, allowing you to scale hiring without scaling your recruitment team.
              </p>
              <div ref={strengthsClockIconRef} style={{
                opacity: isStrengthsClockIconVisible ? 1 : 0,
                transform: isStrengthsClockIconVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: "absolute",
                  bottom: 0,
                  right: 0,
              }}>
              <Image
                src="/clock.svg"
                alt="Value Proposition 1"
                width={110}
                height={110}
              />
              </div>
            </div>
            {/* Value Proposition 3 */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(255, 228, 228, 0.5) 0%, rgba(214, 213, 255, 0.5) 100%)",
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "20px 40px",
                minHeight: 270,
                width: "100%",
                maxWidth: 450,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  color: palette.primaryText,
                  margin: "16px 0 0 0",
                  textAlign: "left",
                }}
              >
                Bias‑Free Screening
              </h3>
              <p
                style={{
                  color: palette.primaryText,
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.6,
                }}
              >
                Ensure fair, consistent evaluations with standardized AI questions and objective scoring for every candidate.
              </p>
              <div ref={strengthsMagnifyingGlassIconRef} style={{
                opacity: isStrengthsMagnifyingGlassIconVisible ? 1 : 0,
                transform: isStrengthsMagnifyingGlassIconVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: "absolute",
                  bottom: 0,
                  right: 0,
              }}>
              <Image
                src="/magnifying-glass.svg"
                alt="Value Proposition 1"
                width={110}
                height={110}
              />
              </div>
            </div>
            {/* Value Proposition 4 */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(176, 228, 240, 0.5) 0%, rgba(196, 185, 252, 0.5) 100%)",
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "20px 40px",
                minHeight: 270,
                width: "100%",
                maxWidth: 450,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  color: palette.primaryText,
                  margin: "16px 0 0 0",
                }}
              >
                Better Hiring Decisions
              </h3>
              <p
                style={{
                  color: palette.primaryText,
                  fontSize: "clamp(14px, 3vw, 16px)",
                  textAlign: "left",
                  lineHeight: 1.6,
                }}
              >
                Get AI-powered interview transcripts, job-fit scores, and insights on technical and soft skills to make confident, data-driven hiring choices.
              </p>
              <div ref={strengthsTrophyIconRef} style={{
                opacity: isStrengthsTrophyIconVisible ? 1 : 0,
                transform: isStrengthsTrophyIconVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: "absolute",
                  bottom: 0,
                  right: 0,
              }}>
              <Image
                src="/trophy.svg"
                alt="Value Proposition 1"
                width={110}
                height={110}
              />
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              width: "100%",
              maxWidth: 1200,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 40,
              padding: "0 20px",
            }}
          >
          </div>
            
            </div>
        </section>

        {/* How it works */}
        <section 
          id="how-it-works"
          className="how-it-works-section"
        >
          <div className="how-it-works">
            <div 
            ref={howItWorksRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
                opacity: isHowItWorksVisible ? 1 : 0,
                transform: isHowItWorksVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            }}>
              <h1 className="header">How it Works</h1>
              <Image
                className="macbook-pro"
                src="/macbook-pro.png"
                alt="How it works"
                width={1000}
                height={600}
              />
            </div>

            <div className="steps-container">
              <div className="step">
                <div 
                className="vector-line"
                ref={firstStepLineRef}
                style={{
                  opacity: isFirstStepLineVisible ? 1 : 0,
                  transform: isFirstStepLineVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
                >
                  <Image src="/vector.png" alt="Vector" width={13} height={13}/>
                  <div className="vector-line-divider"></div>
                </div>
                <div>
                <div ref={firstStepRef} className="step-header"
                style={{
                  opacity: isFirstStepVisible ? 1 : 0,
                  transform: isFirstStepVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
                >
                <h3>Post Your Job</h3>
                </div>
                <div ref={firstStepGuideTextRef} style={{
                  opacity: isFirstStepGuideTextVisible ? 1 : 0,
                  transform: isFirstStepGuideTextVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                <p>Set up your job post with requirements and details. While waiting for applications, generate AI-powered interview questions in advance.</p>
                </div>
                </div>
              </div>
              <div className="step">
                <div className="vector-line"
                ref={secondStepLineRef}
                style={{
                  opacity: isSecondStepLineVisible ? 1 : 0,
                  transform: isSecondStepLineVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                  <Image src="/vector.png" alt="Vector" width={13} height={13}/>
                  <div className="vector-line-divider"></div>
                </div>

                <div>
                <div ref={secondStepRef} className="step-header"
                 style={{
                  opacity: isSecondStepVisible ? 1 : 0,
                  transform: isSecondStepVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
                 >
                <h3>Screen Applicants Automatically</h3>
                </div>
                <div ref={secondStepGuideTextRef} style={{
                  opacity: isSecondStepGuideTextVisible ? 1 : 0,
                  transform: isSecondStepGuideTextVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                <p>Jia reviews CVs using AI, automatically moving good-fit candidates to the next step.
                  <br />
                  <br />
                  For those below good-fit, recruiters can review candidates whether to endorse or drop.  For bad-fit candidates, they are 
                  automatically dropped.</p>
                </div>
                </div>
              </div>
              <div className="step">

                <div className="vector-line"
                ref={thirdStepLineRef}
                style={{
                  opacity: isThirdStepLineVisible ? 1 : 0,
                  transform: isThirdStepLineVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                  <Image src="/vector.png" alt="Vector" width={13} height={13}/>
                  <div className="vector-line-divider"></div>
                </div>

                <div>
                 <div ref={thirdStepRef} className="step-header"
                 style={{
                  opacity: isThirdStepVisible ? 1 : 0,
                  transform: isThirdStepVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
                 >
                <h3>Conduct AI Interviews</h3>
                </div>
                <div ref={thirdStepGuideTextRef} style={{
                  opacity: isThirdStepGuideTextVisible ? 1 : 0,
                  transform: isThirdStepGuideTextVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                <p>Candidates complete structured, skills-based AI interviews anytime, anywhere.</p>
                </div>
                </div>
              </div>
              <div className="step">
              <div className="vector-line"
              ref={fourthStepLineRef}
              style={{
                opacity: isFourthStepLineVisible ? 1 : 0,
                transform: isFourthStepLineVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              }}>
                <Image src="/vector.png" alt="Vector" width={13} height={13}/>
                <div className="vector-line-divider"></div>
                </div>

                <div>
                 <div ref={fourthStepRef} className="step-header"
                 style={{
                  opacity: isFourthStepVisible ? 1 : 0,
                  transform: isFourthStepVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
                 >
                <h3>Receive Actionable Insights</h3>
                </div>
                <div ref={fourthStepGuideTextRef} style={{
                  opacity: isFourthStepGuideTextVisible ? 1 : 0,
                  transform: isFourthStepGuideTextVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                <p>Access job-fit scores, strengths, and clear recommendations to identify top candidates.</p>
                </div>
                </div>
              </div>
              <div className="step">
                <div className="vector-line"
                ref={fifthStepLineRef}
                style={{
                  opacity: isFifthStepLineVisible ? 1 : 0,
                  transform: isFifthStepLineVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                <Image src="/vector.png" alt="Vector" width={13} height={13}/>
                </div>

                <div>
                 <div ref={fifthStepRef} className="step-header"
                 style={{
                  opacity: isFifthStepVisible ? 1 : 0,
                  transform: isFifthStepVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
                 >
                <h3>Conduct AI Interviews</h3>
                </div>
                <div ref={fifthStepGuideTextRef} style={{
                  opacity: isFifthStepGuideTextVisible ? 1 : 0,
                  transform: isFifthStepGuideTextVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}>
                <p>Move qualified candidates to your final interviews, allowing your team to double-check and confidently decide on the best hire.</p>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
      <div
      style={{
        backgroundImage: "url('/section-1-background.svg')",
        backgroundSize: "cover",
        backgroundColor: "#FFFFFF",
        position: "relative",
        zIndex: 2,
      }}
      >
        <section 
          id="testimonials"
          className="testimonials-section"
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            width: "100%",
            position: "relative",
            maxWidth: 1000,
          }}>
            <div className="testimonial-header">
              <h1 className="header">What candidates are <br/> saying about Jia</h1>
            </div>
            <Image 
              src="/sphere.png" 
              alt="Sphere" 
              width={150} 
              height={150} 
              style={{
                position: "absolute",
                left: 50,
                bottom: 0,
                zIndex: -1,
              }}
              ref={sphere4ParallaxRef.ref}
              />

            {/* Scrollable testimonial cards (horizontal) */}
            <div style={{position: "relative", width: "100%"}}>
            {currentTestimonialIndex > 0 && <div className="testimonials-gradient-left" />}
            {currentTestimonialIndex < testimonials.length - 1 && <div className="testimonials-gradient-right" />}
            <div className="testimonials-container" ref={testimonialsContainerRef}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <i className="la la-quote-left"></i>
                  <p>{testimonial.quote}</p>
                </div>
              ))}
            </div>
            </div>

            {/* Nav buttons left and right arrow */}
            <div style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "flex-end",
              gap: 16,
              marginTop: 24,
              marginRight: 100,
            }}>
              <button 
              className="testimonial-button-left"
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: currentTestimonialIndex === 0 ? "none" : "block",
              }}
              onClick={() => {
                const nextIndex = Math.max(0, currentTestimonialIndex - 1);
                setCurrentTestimonialIndex(nextIndex);
                scrollToIndex(nextIndex);
              }}
              >
                <i className="la la-arrow-circle-left" style={{ fontSize: 36, color: "gray" }}></i>
              </button>
              <button 
              className="testimonial-button-right"
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: currentTestimonialIndex === testimonials.length - 1 ? "none" : "block",
              }}
              onClick={() => {
                const newIndex = Math.min(testimonials.length - 1, currentTestimonialIndex + 1);
                setCurrentTestimonialIndex(newIndex);
                scrollToIndex(newIndex);
              }}
              >
                <i className="la la-arrow-circle-right" style={{ fontSize: 36, color: "gray" }}></i>
              </button>
            </div>
            </div>
        </section>

        {/* Newsletter */}
        <section 
          id="newsletter"
          className="newsletter-section"
        >
        <Image 
          src="/sphere.png" 
          alt="Sphere" 
          width={230} 
          height={230} 
          className="sphere-1"
          ref={sphere5ParallaxRef.ref}
          />
          <div
          className="newsletter-container"
          >
            <h1 className="header">Subscribe to Our Newsletter</h1>
            <p>Get the latest updates on Jia and more Exclusive behind-the- <br/> scenes look on our production.</p>
            
            <input 
            type="email" 
            placeholder="email address" 
            className="form-control search-input"
            style={{
              maxWidth: 615
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p style={{ color: "red", fontSize: 12 }}>{emailError}</p>}
            <button 
            className="button-primary-v2"
            style={{
                marginTop: 16,
                width: "240px",
                height: "40px",
            }}
            onClick={handleSubmitNewsletter}
            >
              Submit
            </button>
          </div>
        </section>
        </div>
       </div>
    </main>
     {/* Footer */}
     <Footer isVisible={isVisible} />
     </>
    )
}