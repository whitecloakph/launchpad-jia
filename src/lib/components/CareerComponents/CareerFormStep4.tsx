"use client";

interface CareerFormStep4Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function CareerFormStep4({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: CareerFormStep4Props) {
  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="layered-card-outer">
        <div className="layered-card-middle">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#181D27",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="la la-project-diagram" style={{ color: "#FFFFFF", fontSize: 18 }}></i>
            </div>
            <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
              Pipeline Stages
            </span>
          </div>

          <div className="layered-card-content">
            <div
              style={{
                padding: "48px 32px",
                textAlign: "center",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                border: "1px dashed #D1D5DB",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: "#E5E7EB",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <i className="la la-cog" style={{ fontSize: 32, color: "#6B7280" }}></i>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", margin: "0 0 8px 0" }}>
                Pipeline Builder Coming Soon
              </h3>
              <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px 0", maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
                The pipeline builder feature will allow you to customize the stages candidates go through during the recruitment process. This feature is currently under development.
              </p>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#FEF3C7",
                  borderRadius: "6px",
                  display: "inline-block",
                }}
              >
                <p style={{ fontSize: 13, color: "#92400E", margin: 0, fontWeight: 500 }}>
                  <i className="la la-info-circle" style={{ marginRight: 6 }}></i>
                  For now, the default pipeline stages will be used
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 32,
          gap: 12,
        }}
      >
        <button
          onClick={onPrevious}
          style={{
            padding: "10px 24px",
            backgroundColor: "#FFFFFF",
            color: "#181D27",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i className="la la-arrow-left"></i>
          Back
        </button>
        <button
          onClick={onNext}
          style={{
            padding: "10px 24px",
            backgroundColor: "#181D27",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Continue
          <i className="la la-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
