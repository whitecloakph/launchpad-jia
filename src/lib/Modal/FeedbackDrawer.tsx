import React from "react";
import moment from "moment";
import ReactMarkdown from "react-markdown";

export default function FeedbackDrawer({ open, onClose, feedback }) {
  if (!open) return null;
  const interviewID = feedback?.interviewID;
  const intervieweeName = feedback?.interviewDetails?.name || "-";
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          zIndex: 2000,
        }}
        onClick={onClose}
      />
      <div
        className="slide-in-right"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "440px",
          background: "#fff",
          boxShadow: "-2px 0 24px #0002",
          zIndex: 2001,
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3
            style={{
              color: "#5e39d6",
              fontWeight: 800,
              fontSize: "2rem",
              margin: 0,
              letterSpacing: 0.5,
            }}
          >
            Feedback Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "2rem",
              cursor: "pointer",
              color: "#888",
              marginLeft: 16,
              marginBottom: 0,
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div
          style={{
            marginBottom: "1.2rem",
            paddingBottom: 12,
            borderBottom: "1.5px solid #eee",
          }}
        >
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Name
          </div>
          <div style={{ fontWeight: 700, color: "#222", fontSize: 18 }}>
            {intervieweeName}
          </div>
        </div>
        <div
          style={{
            marginBottom: "1.2rem",
            paddingBottom: 12,
            borderBottom: "1.5px solid #eee",
          }}
        >
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Interview ID
          </div>
          <div style={{ fontWeight: 600, color: "#333" }}>
            {interviewID || "Not specified"}
          </div>
        </div>
        <div
          style={{
            marginBottom: "1.2rem",
            paddingBottom: 12,
            borderBottom: "1.5px solid #eee",
          }}
        >
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Email
          </div>
          <div style={{ fontWeight: 600, color: "#333" }}>
            {feedback?.interviewDetails?.email || "-"}
          </div>
        </div>
        <div
          style={{
            marginBottom: "1.2rem",
            paddingBottom: 12,
            borderBottom: "1.5px solid #eee",
          }}
        >
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Position
          </div>
          <div style={{ fontWeight: 600, color: "#333" }}>
            {feedback?.interviewDetails?.jobTitle || "-"}
          </div>
        </div>
        <div
          style={{
            marginBottom: "1.2rem",
            paddingBottom: 12,
            borderBottom: "1.5px solid #eee",
          }}
        >
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Rating
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 32 }}>
            {feedback?.rating != null ? (
              <div style={{ fontSize: '2rem', color: '#FFD600', letterSpacing: '0.18em', display: 'flex', gap: '0.25em' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    style={{
                      color: i <= feedback.rating ? '#FFD600' : '#ddd',
                      transition: 'color 0.2s',
                      marginRight: i < 5 ? 8 : 0,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: '#aaa', fontSize: '1.2rem' }}>-</span>
            )}
          </div>
        </div>
        <div
          style={{
            marginBottom: "1.2rem",
            paddingBottom: 12,
            borderBottom: "1.5px solid #eee",
          }}
        >
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Comment
          </div>
          <div
            style={{
              background: "#f7f7fa",
              border: "1.5px solid #ddd",
              borderRadius: 8,
              padding: "1.25rem 1.25rem 1.25rem 1.25rem",
              marginTop: 6,
              color: "#333",
              fontSize: "1.08rem",
              fontWeight: 400,
              minHeight: 120,
              maxHeight: 220,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              boxShadow: "0 2px 8px #0001",
            }}
          >
            {feedback?.feedback ? (
              <ReactMarkdown>{feedback.feedback}</ReactMarkdown>
            ) : (
              <span style={{ color: "#aaa" }}>-</span>
            )}
          </div>
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontSize: 15, color: "#888", marginBottom: 2 }}>
            Date
          </div>
          <div style={{ fontWeight: 600, color: "#333" }}>
            {feedback?.createdAt
              ? moment(feedback.createdAt).format("MMMM DD, YYYY")
              : "-"}
          </div>
        </div>
        {interviewID && (
          <button
            style={{
              marginTop: 24,
              background: "#5e39d6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.75em 1.5em",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #5e39d633",
              transition: "background 0.2s",
            }}
            onClick={() => {
              window.location.href = `/dashboard/interviews/manage/${interviewID}`;
            }}
          >
            View Full Interview
          </button>
        )}
      </div>
    </>
  );
}
