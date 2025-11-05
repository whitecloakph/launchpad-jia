"use client"
import { useState } from "react";
import Image from "next/image";
import { signInWithGoogle } from "../firebase/firebaseClient";

export default function HomeNavBar({ isStickyMobileMenu }: { isStickyMobileMenu: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    const handleLoginClick = () => {
      const host = window.location.host;
      if (host.includes("hirejia")) {
        if (localStorage.user) {
          if (localStorage.role === "admin") {
            window.location.href = "/recruiter-dashboard";
            return;
          }
        }
      }
      signInWithGoogle();
    }

    return (
              <nav className={`home-navbar ${isStickyMobileMenu ? "sticky" : ""}`}>
              <div className="navbar-container">
                  <div
                  style={{ display: "flex", alignItems: "center", gap: 32 }}
                  >
                  <div className="hamburger-menu" onClick={toggleMobileMenu}>
                    <i className="la la-bars" style={{ fontSize: 42, color: "black" }}></i>
                  </div>
                  {isMobileMenuOpen && (
                    <div className="mobile-menu">
                      <div className="mobile-menu-container">
                        <div className="close-button" onClick={toggleMobileMenu}>
                          <i className="la la-times" style={{ fontSize: 42, color: "black" }}></i>
                        </div>
                       <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                       }} onClick={toggleMobileMenu}>
                       <a href="/#about" className="nav-link">About</a>
                        <a href="/#how-it-works" className="nav-link">How it works</a>
                        <a href="/#testimonials" className="nav-link">Testimonials</a>
                        <a href="/#newsletter" className="nav-link">Newsletter</a>
                        <a href="/developer" className="nav-link">Developer</a>
                        <a href="/developer#contact-us" className="nav-link">Contact Us</a>
                       </div>
                      </div>
                    </div>
                  )}
                  <Image
                      className="jia-logo"
                      src="/Logomark.svg"
                      alt="Jia Logo"
                      width={48}
                      height={48}
                      onClick={() => {
                        window.location.href = "/";
                      }}
                  />
                <a
                  href="/#about"
                  className="navbar-links"
                >
                  About
                </a>
                <a
                  href="/#how-it-works"
                  className="navbar-links"
                >
                  How it works
                </a>
                <a
                  href="/#testimonials"
                  className="navbar-links"
                >
                  Testimonials
                </a>
                <a
                  href="/#newsletter"
                  className="navbar-links"
                >
                  Newsletter
                </a>
                <a href="/developer" className="navbar-links">
                  Developer
                </a>
                <a href="/developer#contact-us" className="navbar-links">
                  Contact Us
                </a>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}
              >
                  <a className="navbar-links">
                  For Job Hunters
                </a>
                <a
                    onClick={handleLoginClick}
                    className="navbar-login-btn"
                  >
                    Sign up/Login
                  </a>
              </div>
          </div>
          </nav>
    )
}