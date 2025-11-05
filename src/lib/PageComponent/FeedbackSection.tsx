import ReactMarkdown from "react-markdown";

export default function ({ feedback }: { feedback: any }) {
  return (
    <div className="card shadow-1 mt-4">
      <div className="card-header">
        <h3 className="mb-0 mr-auto">
          <i className="la la-comments text-primary mr-2" /> Feedback
        </h3>
      </div>
      <div className="card-body">
        <div>
          {/* Star Rating */}
          <div
            style={{
              fontSize: "2.2rem",
              color: "#FFD600",
              letterSpacing: "0.18em",
              display: "flex",
              gap: "0.25em",
              justifyContent: "center",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  color: i <= feedback.rating ? "#FFD600" : "#ddd",
                  transition: "color 0.2s",
                  marginRight: i < 5 ? 8 : 0,
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {feedback.feedback && (
          <>
            <div
              style={{
                fontSize: 15,
                color: "#888",
              }}
            >
              Comment
            </div>
            <div
              style={{
                background: "#f7f7fa",
                border: "1.5px solid #ddd",
                borderRadius: 8,
                padding: "1.25rem 1.25rem 1.25rem 1.25rem",
                color: "#333",
                fontSize: "1.08rem",
                fontWeight: 400,
                minHeight: 80,
                maxHeight: 180,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 8px #0001",
              }}
            >
              {feedback.feedback ? (
                <ReactMarkdown>{feedback.feedback}</ReactMarkdown>
              ) : (
                <span style={{ color: "#aaa" }}>-</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
