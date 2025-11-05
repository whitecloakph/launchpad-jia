"use client";

import Image from "next/image";
import { useState } from "react";

// Centralized color palette for light mode
const palette = {
  primaryBg: "#F8F9FA", // light background
  primaryText: "#18122B", // dark text
  accentText: "#0B0121", // deep accent for headings
  cardBg: "#FFF", // white card background
  accentPurple: "#5e39d6", // keep accent purple
  accentBlue: "#4f04b9f0", // keep accent blue
  gradientCard:
    "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 100%)", // subtle card gradient for light mode
  buttonBg: "#18122B", // dark button background
  buttonText: "#FFF", // white button text
  borderLight: "#ECECEC", // light border
  borderGray: "#ddd", // gray border
  mutedText: "#605c5c", // muted dark text
  footerMuted: "#868484", // muted gray for footer
  heroPillBg: "rgba(255,255,255,0.7)", // light pill background
  heroPillBorder: "1.2px solid #ddd", // light border for pill
  heroPillText: "#5e39d6", // accent purple for pill text
  cardShadow: "0px 2px 24px 0px rgba(78, 76, 76, 0.08)", // subtle shadow for light cards
  codeCardShadow: "0px 0px 24px 0px rgba(149, 37, 201, 0.08)", // subtle shadow for code card
};

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes complexFadeIn {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
            filter: blur(8px);
          }
          60% {
            opacity: 0.7;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounceInUp {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translateY(-10px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          70% {
            opacity: 1;
            transform: scale(1.08);
          }
          85% {
            transform: scale(0.97);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-hero {
          animation: complexFadeIn 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        }
        .fade-in-logos {
          animation: slideInLeft 1.2s 0.4s cubic-bezier(0.39, 0.575, 0.565, 1)
            both;
        }
        .fade-in-features {
          animation: bounceInUp 1.2s 0.8s cubic-bezier(0.39, 0.575, 0.565, 1)
            both;
        }
        .btn-main {
          background: linear-gradient(90deg, #5e39d6 0%, #4f04b9f0 100%);
          color: #fff !important;
          border: none;
          border-radius: 60px;
          padding: 12px 32px;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 4px 24px 0 rgba(94, 57, 214, 0.12);
          transition: all 0.18s cubic-bezier(0.39, 0.575, 0.565, 1);
          cursor: pointer;
          outline: none;
          display: inline-block;
        }
        .btn-main:hover,
        .btn-main:focus {
          filter: brightness(1.15);
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 32px 0 rgba(94, 57, 214, 0.18);
        }
        .pop-in-btn {
          animation: popIn 0.7s 1.1s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        }
        .mobile-menu {
          animation: slideDown 0.3s ease-out;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          cursor: pointer;
          padding: 8px;
          z-index: 1001;
        }
        .hamburger span {
          width: 25px;
          height: 3px;
          background: #18122b;
          margin: 3px 0;
          transition: 0.3s;
          border-radius: 2px;
        }
        .hamburger.active span:nth-child(1) {
          transform: rotate(-45deg) translate(-5px, 6px);
        }
        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.active span:nth-child(3) {
          transform: rotate(45deg) translate(-5px, -6px);
        }
        @media (max-width: 800px) {
          .hamburger {
            display: flex;
          }
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
        @media (min-width: 801px) {
          .mobile-menu {
            display: none !important;
          }
        }
        @media (max-width: 800px) {
          .btn-main {
            padding: 10px 24px !important;
            font-size: 0.9rem !important;
          }
          main {
            overflow-x: hidden;
          }
        }
      `}</style>
      <main
        style={{
          background: palette.primaryBg,
          color: palette.primaryText,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Navbar */}
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "32px 20px 0 20px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Image
              src="/jia-logo-transparent.png"
              alt="Jia Logo"
              width={80}
              height={50}
            />

            {/* Desktop Menu */}
            <div
              className="desktop-menu"
              style={{ display: "flex", alignItems: "center", gap: 32 }}
            >
              <a
                href="#why-jia"
                style={{
                  color: palette.primaryText,
                  fontSize: 16,
                  textDecoration: "none",
                }}
              >
                Why JIA
              </a>
              <a
                href="#pricing"
                style={{
                  color: palette.primaryText,
                  fontSize: 16,
                  textDecoration: "none",
                }}
              >
                Pricing
              </a>
              <a
                href="#about"
                style={{
                  color: palette.primaryText,
                  fontSize: 16,
                  textDecoration: "none",
                }}
              >
                About us
              </a>
              <a
                href="#how-it-works"
                style={{
                  color: palette.primaryText,
                  fontSize: 16,
                  textDecoration: "none",
                }}
              >
                How It Works
              </a>
              <a href="/login" className="btn-main pop-in-btn">
                Try the app
              </a>
            </div>

            {/* Mobile Hamburger Menu */}
            <div
              className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}
              onClick={toggleMobileMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="mobile-menu"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                display: "flex",
                justifyContent: "flex-end",
              }}
              onClick={closeMobileMenu}
            >
              <div
                style={{
                  width: "280px",
                  height: "100%",
                  background: palette.cardBg,
                  padding: "80px 32px 32px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.1)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href="#why-jia"
                  onClick={closeMobileMenu}
                  style={{
                    color: palette.primaryText,
                    fontSize: 18,
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "12px 0",
                    borderBottom: `1px solid ${palette.borderLight}`,
                  }}
                >
                  Why JIA
                </a>
                <a
                  href="#pricing"
                  onClick={closeMobileMenu}
                  style={{
                    color: palette.primaryText,
                    fontSize: 18,
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "12px 0",
                    borderBottom: `1px solid ${palette.borderLight}`,
                  }}
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  onClick={closeMobileMenu}
                  style={{
                    color: palette.primaryText,
                    fontSize: 18,
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "12px 0",
                    borderBottom: `1px solid ${palette.borderLight}`,
                  }}
                >
                  About us
                </a>
                <a
                  href="#how-it-works"
                  onClick={closeMobileMenu}
                  style={{
                    color: palette.primaryText,
                    fontSize: 18,
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "12px 0",
                    borderBottom: `1px solid ${palette.borderLight}`,
                  }}
                >
                  How It Works
                </a>
                <a
                  href="/login"
                  className="btn-main"
                  onClick={closeMobileMenu}
                  style={{
                    marginTop: 16,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Try the app
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section
          className="fade-in-hero"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "170px 0px 80px",
            minHeight: 700,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 960,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              padding: "0 20px",
            }}
          >
            <h1
              style={{
                fontWeight: 500,
                fontSize: "clamp(36px, 8vw, 80px)",
                lineHeight: 1.1,
                textAlign: "center",
                color: palette.accentText,
                margin: 0,
              }}
            >
              Meet JIA:
              <br />
              Your AI Job Interviewer Agent
            </h1>
            <p
              style={{
                color: palette.mutedText,
                fontSize: "clamp(16px, 3vw, 18px)",
                textAlign: "center",
                maxWidth: 600,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              JIA is your personal AI-powered job interviewer. Simulate real
              interview scenarios, receive instant feedback on your answers, and
              build the confidence you need to succeed. Practice anytime,
              improve your skills, and get ready to ace your next interview with
              JIA.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
              <a href="/login" className="btn-main pop-in-btn">
                Try the app
              </a>
            </div>
            {/* Hero Image below text, centered, not overlapping */}
            <div
              style={{
                marginTop: 48,
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Image
                src="/dashboard.png"
                alt="Hero visual"
                width={900}
                height={400}
                style={{
                  objectFit: "contain",
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 20,
                }}
                priority
              />
            </div>
          </div>
        </section>

        {/* Trusted Logos */}
        {/* Hidden for now */}
        {/* <section
          className="fade-in-logos"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            padding: "60px 20px",
            background: "none",
          }}
        >
          <span
            style={{
              color: palette.accentText,
              fontSize: 20,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Trusted by teams at over 1,000 of the world's leading organizations
          </span>
          <div
            style={{
              display: "flex",
              gap: 48,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image src="/wc.svg" alt="Dell" width={100} height={32} />
            <Image src="/wc.svg" alt="Dell" width={100} height={32} />
            <Image src="/wc.svg" alt="Dell" width={100} height={32} />
            <Image src="/wc.svg" alt="Dell" width={100} height={32} />
            <Image src="/wc.svg" alt="Dell" width={100} height={32} />
          </div>
        </section> */}

        {/* Why JIA Section */}
        <section
          id="why-jia"
          className="fade-in-features"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            padding: "80px 20px",
            background: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 470,
              textAlign: "center",
              marginBottom: 40,
              padding: "0 20px",
            }}
          >
            <h2
              style={{
                fontWeight: 500,
                fontSize: "clamp(32px, 6vw, 48px)",
                color: palette.primaryText,
                marginBottom: 16,
              }}
            >
              Why Choose JIA
            </h2>
            <p
              style={{
                color: palette.primaryText,
                fontSize: "clamp(16px, 3vw, 18px)",
                lineHeight: 1.6,
              }}
            >
              Transform your hiring process with AI-powered interviews that save
              time, reduce bias, and help you identify top talent with
              confidence.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              width: "100%",
              maxWidth: 1200,
              flexWrap: "wrap",
              justifyContent: "center",
              padding: "0 20px",
            }}
          >
            {/* Value Proposition 1 */}
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 500,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <i
                className="la la-handshake"
                style={{
                  fontSize: "clamp(40px, 8vw, 50px)",
                  color: palette.accentPurple,
                }}
              />
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
                Get detailed interview transcripts with AI-powered scoring,
                comprehensive candidate assessments on cultural alignment, and
                deep insights into technical competencies and soft skills. Make
                data-driven hiring decisions with confidence.
              </p>
            </div>
            {/* Value Proposition 2 */}
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 500,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <i
                className="la la-clock"
                style={{
                  fontSize: "clamp(40px, 8vw, 50px)",
                  color: palette.accentPurple,
                }}
              />
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
                Eliminate scheduling hassles with our automated interview
                system. Candidates can self-schedule and complete interviews
                24/7, streamlining your recruitment pipeline and reducing
                time-to-hire. No more back-and-forth emails or calendar
                coordination needed.
              </p>
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
            {/* Value Proposition 3 */}
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 500,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <i
                className="la la-piggy-bank"
                style={{
                  fontSize: "clamp(40px, 8vw, 50px)",
                  color: palette.accentPurple,
                }}
              />
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
                Reduce recruitment costs and save valuable time by automating
                interviews. Your hiring team can focus on high-value activities
                while JIA handles screening, resulting in scaling your hiring
                process without scaling your recruitment team.
              </p>
            </div>
            {/* Value Proposition 4 */}
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 500,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <i
                className="la la-balance-scale"
                style={{
                  fontSize: "clamp(40px, 8vw, 50px)",
                  color: palette.accentPurple,
                }}
              />
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  color: palette.primaryText,
                  margin: "16px 0 0 0",
                  textAlign: "left",
                }}
              >
                Bias‑Free Interview
              </h3>
              <p
                style={{
                  color: palette.primaryText,
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.6,
                }}
              >
                Ensure a fair and consistent candidate evaluation with our
                standardized AI-powered interview process. Every candidate
                receives the same core questions and is evaluated using
                objective scoring criteria.
              </p>
            </div>
          </div>
        </section>
        {/* How It Works Section */}
        <section
          id="how-it-works"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            padding: "80px 20px",
            background: "none",
          }}
        >
          <h2
            style={{
              fontWeight: 500,
              fontSize: "clamp(32px, 6vw, 48px)",
              color: palette.primaryText,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            How It Works
          </h2>
          <h3
            style={{
              fontWeight: 500,
              fontSize: "clamp(28px, 5vw, 48px)",
              color: palette.primaryText,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            As a Company
          </h3>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
              maxWidth: 1200,
              padding: "0 20px",
            }}
          >
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 250,
                minWidth: 200,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                1
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-tasks"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Create a Job
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Set up your job posting with requirements and details
              </p>
            </div>

            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 250,
                minWidth: 200,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                2
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-question-circle"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Generate Questions
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                AI generates relevant interview questions
              </p>
            </div>

            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 250,
                minWidth: 200,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                3
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-file-alt"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Post the Job
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Publish and start receiving applications
              </p>
            </div>

            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 250,
                minWidth: 200,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                4
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-lightbulb"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Review Interviews
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Get AI insights including job-fit score, strengths, and
                recommendations
              </p>
            </div>
          </div>
          <h3
            style={{
              fontWeight: 500,
              fontSize: "clamp(28px, 5vw, 48px)",
              color: palette.primaryText,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            As an Applicant
          </h3>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
              maxWidth: 1200,
              padding: "0 20px",
            }}
          >
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 300,
                minWidth: 250,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                1
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-user-edit"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Apply to a Job
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                View the available job posts and apply to the ones that you are
                interested in.
              </p>
            </div>
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 300,
                minWidth: 250,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                2
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-microphone"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Take the Interview
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Take the interview anytime and anywhere.
              </p>
            </div>
            <div
              style={{
                background: palette.gradientCard,
                boxShadow: palette.cardShadow,
                borderRadius: 20,
                padding: "clamp(40px, 8vw, 60px)",
                width: "100%",
                maxWidth: 300,
                minWidth: 250,
                textAlign: "center",
                position: "relative",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `2px solid ${palette.accentPurple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.accentPurple,
                  fontSize: 24,
                  fontWeight: 500,
                  color: "white",
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                3
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <i
                  className="la la-check-circle"
                  style={{
                    fontSize: "clamp(40px, 8vw, 50px)",
                    color: palette.accentPurple,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  margin: "16px 0 8px 0",
                  fontWeight: 500,
                }}
              >
                Wait for the Results
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                View the status and feedback of your application.
              </p>
            </div>
          </div>
        </section>

        {/* Secondary Hero Section */}
        <section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              background: palette.gradientCard,
              boxShadow: palette.cardShadow,
              borderRadius: 20,
              padding: "clamp(40px, 8vw, 60px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
          >
            <h2
              style={{
                fontWeight: 700,
                fontSize: "clamp(28px, 6vw, 48px)",
                color: palette.primaryText,
                textAlign: "center",
                margin: 0,
              }}
            >
              Our powerful analytics provides invaluable insights.
            </h2>
            <p
              style={{
                color: palette.primaryText,
                fontSize: "clamp(16px, 3vw, 18px)",
                textAlign: "center",
                maxWidth: 768,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Unlock the power of data with our cutting-edge analytics product.
              Get instant insights with our user-friendly Analytics Dashboard,
              and take advantage of our innovative digital credit tokens to
              reward your customers and incentivize engagement.
            </p>
            <a
              href="/login"
              className="btn-main pop-in-btn"
              style={{ marginTop: 16 }}
            >
              Try the app
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            background: "none",
            color: palette.primaryText,
            padding: "64px 20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {/* Column 1 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 40,
                minWidth: 250,
                flex: 1,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(20px, 4vw, 24px)",
                    color: palette.accentText,
                  }}
                >
                  Contact
                </span>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <span
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(16px, 3vw, 18px)",
                      color: palette.accentText,
                      lineHeight: 1.5,
                    }}
                  >
                    20th Floor, F. Ortigas Jr Strata 2000 Building
                    <br />
                    San Antonio, Ortigas Center, Pasig, 1605 Metro Manila
                  </span>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(20px, 4vw, 24px)",
                    color: palette.accentText,
                  }}
                >
                  Careers
                </span>
                <span
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(16px, 3vw, 18px)",
                    color: palette.accentText,
                    lineHeight: 1.5,
                  }}
                >
                  Join the most talented software development company in the
                  country today.
                </span>
              </div>
              <span
                style={{
                  fontWeight: 300,
                  fontSize: "clamp(14px, 3vw, 16px)",
                  color: palette.footerMuted,
                }}
                onClick={() => {
                  window.open("https://whitecloak.com", "_blank");
                }}
              >
                © 2025 White Cloak Technologies Inc.
              </span>
            </div>
            {/* Column 2 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 40,
                minWidth: 250,
                flex: 1,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(20px, 4vw, 24px)",
                    color: palette.accentText,
                  }}
                >
                  Navigation
                </span>
                <span
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(16px, 3vw, 18px)",
                    color: palette.accentText,
                    lineHeight: 1.8,
                  }}
                >
                  About Us
                  <br />
                  Services
                  <br />
                  Insights
                  <br />
                  Careers
                  <br />
                  Contact Us
                </span>
              </div>
              <div
                style={{ display: "none", flexDirection: "column", gap: 16 }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(20px, 4vw, 24px)",
                    color: palette.accentText,
                  }}
                >
                  Social
                </span>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <span
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(16px, 3vw, 18px)",
                      color: palette.accentText,
                    }}
                  >
                    Facebook
                  </span>
                  <span
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(16px, 3vw, 18px)",
                      color: palette.accentText,
                    }}
                  >
                    LinkedIn
                  </span>
                  <span
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(16px, 3vw, 18px)",
                      color: palette.accentText,
                    }}
                  >
                    YouTube
                  </span>
                </div>
              </div>
            </div>
            {/* Column 3 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                minWidth: 180,
                gap: 10,
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Image
                  src="/jia-logo-transparent.png"
                  alt="Jia Logo"
                  width={80}
                  height={50}
                />
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
