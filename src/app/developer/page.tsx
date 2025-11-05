"use client"
import Image from "next/image";
import Footer from "@/lib/PageComponent/Footer";
import HomeNavBar from "@/lib/PageComponent/HomeNavBar";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { validateEmail } from "../../lib/Utils";
import { useVisibilityHook } from "@/lib/hooks/useVisibilityHook";

export default function DeveloperPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isStickyMobileMenu, setIsStickyMobileMenu] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");
  const { ref, isVisible } = useVisibilityHook();

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

  const handleSubmitInquiry = async () => {
    let hasError = false;
    if (!validateEmail(email) || !email?.trim()) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!message?.trim()) {
      setMessageError("Please enter a message");
      hasError = true;
    } else {
      setMessageError("");
    }

    if (hasError) return;

    try {
      Swal.fire({
        title: "Submitting inquiry...",
        text: "Please wait while we submit your inquiry...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post("/api/add-inquiry", {
        email,
        message,
      })
      Swal.close();
      Swal.fire({
        title: "Success",
        text: "Your inquiry has been submitted. We will get back to you as soon as possible.",
        icon: "success",
        confirmButtonText: "OK",
      })
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
      });
    }
  }
    return (
      <>
        <main
        style={{
          color: "black",
          fontFamily: "Satoshi, sans-serif",
          position: "relative",
          paddingBottom:"100vh",
          zIndex: 2,
        }}
      >
        <div 
        ref={ref}
        style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundImage: "url('/section-1-background.svg')",
            backgroundSize: "cover",
            backgroundColor: "#FFFFFF",
          }}
        >
        <HomeNavBar isStickyMobileMenu={isStickyMobileMenu} />

        {/* Developer Section */}
        <div className="developer-section">
            <div className="developer-section-left">
              <h1 className="header">Developer</h1>
              <Image className="white-cloak-logo" src="https://www.whitecloak.com/wp-content/uploads/2024/02/logo.svg" alt="White Cloak Logo" width={162} height={50} />
              <p>
              Established in 2014, White Cloak Technologies Inc. has grown to be a trusted pillar in software development from the heart of the Philippines. As a preferred innovation partner, we've collaborated with prominent corporations, converting challenges into success stories through adept technology applications.
              <br/>
              <br/>
              Beyond Jia, White Cloak has also developed other AI-powered applications, including <a href="https://splurge.art" target="_blank" rel="noopener noreferrer">Splurge Art</a>, an AI art generator, and <a href="https://www.hellopixie.ai/" target="_blank" rel="noopener noreferrer">Pixie</a>, an AI chatbot builder for SMEs and enterprises.
              </p>
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                justifyContent: "flex-start",
                width: "100%",
                height: "100%",
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  textAlign: "left",
                }}>
                  <h1>200+</h1>
                  <p>Engineers</p>
                </div>

                {/* White line */}
                <div style={{
                  width: "1px",
                  height: "100%",
                  minHeight: "100px",
                  backgroundColor: "white",
                  margin: "0 24px",
                }}></div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  textAlign: "left",
                }}>
                  <h1>100+</h1>
                  <p>Projects Delivered</p>
                </div>
              </div>
            </div>

            <div className="developer-section-right">
            <Image src="/wc-logo-black.png" alt="White Cloak Logo" width={300} height={300} style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }} />
          </div>
          </div>

          <section 
          id="contact-us"
          className="contact-us-section"
        >
          <div className="contact-us-container">
            <h1 className="header">Contact Us</h1>
            <p>Got inquiries about Jia or our company? <br/>
            Shoot us an email.</p>
            <input 
            type="email" 
            placeholder="email address" 
            className="form-control search-input"
            style={{
              maxWidth: "615px",
              padding: "10px",
              border: "1px solid #E0E0E0",
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p style={{ color: "red", fontSize: 12 }}>{emailError}</p>}
            <textarea
            placeholder="message"
            className="form-control"
            style={{
              maxHeight: "200px",
              maxWidth: "615px",
              padding: "10px",
              border: "1px solid #E0E0E0",
            }}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            />
            {messageError && <p style={{ color: "red", fontSize: 12 }}>{messageError}</p>}
            <button 
            style={{
                marginTop: 16,
                textAlign: "center",
                width: "240px",
                height: "40px",
                backgroundColor: "black",
                color: "white",
                padding: "5px 10px",
                borderRadius: "60px",
                textDecoration: "none",
              }}
              onClick={handleSubmitInquiry}
            >
              Submit
            </button>
          </div>
        </section>
        </div>
      </main>
      {/* Footer */}
      <Footer isVisible={isVisible} />
      </>
    )
}