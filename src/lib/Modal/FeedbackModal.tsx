"use client";

import { useState } from "react";
import axios from "axios";

const BRAND_BLUE = "#5e39d6";
const BORDER_COLOR = "#ddd";
const TEXT_COLOR = "#333";
const STAR_ACTIVE = "#FDB022";
const STAR_INACTIVE = "#ddd";
const LIGHT_GREEN = "#e8f5e8";
const GREEN_OUTLINE = "#4CAF50";

export default function FeedbackModal({
  onClose,
  feedbackData,
}: {
  onClose: () => void;
  feedbackData: any;
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    try {
      await axios.post("/api/submit-feedback", {
        rating,
        feedback,
        interviewID: feedbackData.interviewID,
        orgID: feedbackData.orgID,
        id: feedbackData.id,
      });
      onClose();
    } catch (err) {
      // Optionally handle error (e.g., show toast)
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show fade-in-bottom"
      style={{
        display: "block",
        fontFamily: "Open Sans, sans-serif",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1050,
        background: "rgba(0,0,0,0.2)",
      }}
    >
      {/* Responsive styles for modal */}
      <style>{`
        @media (max-width: 600px) {
          .feedback-modal-dialog {
            width: 95vw !important;
            min-width: unset !important;
            margin: 0 auto !important;
          }
          .feedback-modal-content {
            border-radius: 10px !important;
            min-width: unset !important;
            width: 100% !important;
            max-width: 100vw !important;
            max-height: 95vh !important;
          }
        }
      `}</style>
      <div
        className="modal-dialog modal-dialog-centered feedback-modal-dialog"
        style={{
          maxWidth: "512px",
          height: "510px",
          width: "90vw",
          minWidth: 320,
          margin: "40px auto",
          pointerEvents: "auto",
        }}
      >
        <div
          className="modal-content feedback-modal-content"
          style={{
            background: "#fff",
            border: `1.5px solid ${BORDER_COLOR}`,
            borderRadius: "30px",
            minWidth: 320,
            maxWidth: "100vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            className="modal-body"
            style={{
              fontWeight: 400,
              fontSize: "1rem",
              color: TEXT_COLOR,
              flex: "1 1 auto",
              overflowY: "auto",
              padding: "2rem",
              paddingBottom: "0px",
              textAlign: "center",
            }}
          >
            {/* Star Icon */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  marginBottom: "0px",
                }}
              >
                <img
                  src="/star-icon.png"
                  alt="star"
                  style={{ width: "60px", height: "60px" }}
                />
              </div>
            </div>

            {/* Title */}
            <h5
              style={{
                fontWeight: 700,
                fontSize: "1.5rem",
                color: TEXT_COLOR,
                marginBottom: "1rem",
                marginTop: "-10px",
                textAlign: "center",
              }}
            >
              Jia values your feedback
            </h5>

            {/* Description */}
            <p
              style={{
                fontSize: "1rem",
                color: "#666",
                marginBottom: "0.4rem",
                lineHeight: "1.5",
                textAlign: "center",
                fontWeight: 400,
              }}
            >
              Your insights will help Jia improve and continue delivering the
              best possible experience. Take a moment to share your thoughts.
            </p>

            {/* Star Rating */}
            <div style={{ marginBottom: "2rem" }}>
              {[1, 2, 3, 4, 5].map((index) => (
                <span
                  key={index}
                  style={{
                    cursor: "pointer",
                    color: index <= rating ? STAR_ACTIVE : STAR_INACTIVE,
                    fontSize: "2.5rem",
                    margin: "0 0.3em",
                    transition: "0.3s",
                  }}
                  onClick={() => setRating(index)}
                  aria-label={index + " star"}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Feedback Section */}
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: TEXT_COLOR,
                }}
              >
                Feedback
              </div>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Enter your feedback here"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  fontSize: "1rem",
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: "8px",
                  color: TEXT_COLOR,
                  background: "#fff",
                  width: "100%",
                  resize: "vertical",
                  maxHeight: 220,
                  padding: "0.75rem",
                  boxSizing: "border-box",
                }}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div
            style={{
              padding: "1rem 2rem 2rem 2rem",
              textAlign: "center",
            }}
          >
            <button
              className="btn"
              style={{
                fontWeight: 600,
                background: "#000",
                maxWidth: "194px",
                height: "44px",
                width: "100%",
                color: "#fff",
                border: "none",
                borderRadius: "30px",
                display: "grid",
                fontSize: "1rem",
                margin: "0 auto",
                transition: "all 0.3s ease",
                opacity: rating === 0 || submitting ? 0.5 : 1,
                cursor: rating === 0 || submitting ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              <span className="m-auto">
                {submitting ? "Submitting..." : "Submit"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
