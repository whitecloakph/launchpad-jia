"use client"
import Image from "next/image";

export default function Footer({ isVisible }: { isVisible: boolean }) {

    return (
        <footer
        className="home-footer"
        style={{ zIndex: isVisible ? 1 : 3 }}
      >
        <Image src="/Logomark.svg" alt="Footer Logo" width={72} height={72} className="footer-logo"/>
        <div className="footer-container">
          {/* Column 1 */}
          <div
          className="footer-column"
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(20px, 4vw, 24px)",
                  color: "black",
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
                    color: "black",
                    lineHeight: 1.5,
                  }}
                >
                  20th Floor, F. Ortigas Jr Strata 2000 Building
                  <br />
                  San Antonio, Ortigas Center, Pasig, 1605 Metro Manila
                </span>

                {/* Sales Team Email */}
                <div
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(16px, 3vw, 18px)",
                    color: "black",
                  }}
                >
                  Sales Team: <a href="mailto:inquire@hellojia.ai" target="_blank" rel="noopener noreferrer">inquire@hellojia.ai</a>
                </div>
                
                <div
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(16px, 3vw, 18px)",
                    color: "black",
                  }}
                >
                  Development Team: <a href="mailto:hello@whitecloak.com" target="_blank" rel="noopener noreferrer">hello@whitecloak.com</a>
                </div>
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(20px, 4vw, 24px)",
                  color: "black",
                }}
              >
                Careers
              </span>
              <span
                style={{
                  fontWeight: 300,
                  fontSize: "clamp(16px, 3vw, 18px)",
                  color: "black",
                  lineHeight: 1.5,
                }}
              >
                Join the most talented software development <br/>
                company in the country today.
              </span>
            </div>
          </div>
          {/* Column 2 */}
          <div
          className="footer-column"
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <span
                style={{
                  fontWeight: 500,
                  fontSize: "clamp(20px, 4vw, 24px)",
                  color: "black",
                }}
              >
                Navigation
              </span>
              <span
                style={{
                  fontWeight: 300,
                  fontSize: "clamp(16px, 3vw, 18px)",
                  color: "black",
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
          </div>
        </div>
        <span
              style={{
                fontWeight: 300,
                fontSize: "clamp(14px, 3vw, 16px)",
              }}
              onClick={() => {
                window.open("https://whitecloak.com", "_blank");
              }}
            >
             Powered by <Image src="/wc-logo-black.png" alt="White Cloak Logo" width={100} height={100} className="footer-powered-by-logo"/>
            </span>
      </footer>
    )
}