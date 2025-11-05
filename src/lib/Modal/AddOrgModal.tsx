"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "@/lib/context/AppContext";
import { useRouter } from "next/navigation";

const BRAND_BLUE = "#5e39d6";
const BORDER_COLOR = "#ddd";
const TEXT_COLOR = "#333";

const TIERS = [
  { label: "Startup", value: "startup" },
  { label: "Corporate", value: "corporate" },
  { label: "Enterprise", value: "enterprise" },
];

export default function AddOrgModal({ onClose }: { onClose: () => void }) {
  const { user } = useAppContext();
  const [orgName, setOrgName] = useState("");
  const [tier, setTier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (!orgName.trim() || !tier) return;
    setLoading(true);

    const orgData = {
      name: orgName.trim(),
      tier,
      image: `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}`,
      user,
    };

    const response = await axios.post("/api/add-organization", orgData);

    const orgList = await axios.post("/api/get-org", {
      user,
    });
    localStorage.orgList = JSON.stringify(orgList.data);

    Swal.fire({
      title: "Organization added successfully!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    localStorage.activeOrg = JSON.stringify({
      ...orgData,
      _id: response.data.insertedId,
    });

    window.location.href = `${window.location.pathname}?orgID=${response.data.insertedId}`;
    onClose();
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="modal show fade-in-bottom"
      style={{
        display: "block",
        fontFamily: "Open Sans, sans-serif",
        background: "rgba(0,0,0,0.45)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1050,
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="modal-content"
          style={{
            background: "#fff",
            border: `1.5px solid ${BORDER_COLOR}`,
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
            minWidth: 400,
            maxWidth: 480,
            margin: "32px auto",
            position: "relative",
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          {/* X Button */}
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              borderRadius: 0,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: "#9c99a4",
              cursor: "pointer",
              transition: "color 0.2s",
              padding: 0,
            }}
            type="button"
            onMouseOver={(e) => (e.currentTarget.style.color = "#333")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#9c99a4")}
          >
            &times;
          </button>
          <div
            className="modal-header"
            style={{
              borderBottom: `1.5px solid ${BORDER_COLOR}`,
              padding: "28px 36px 18px 36px",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              background: "#fff",
            }}
          >
            <h5
              className="modal-title"
              style={{
                fontWeight: 700,
                fontSize: "1.5rem",
                color: TEXT_COLOR,
                letterSpacing: 0.5,
                margin: 0,
              }}
            >
              Add Organization
            </h5>
          </div>
          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{
                fontWeight: 400,
                fontSize: "1rem",
                color: TEXT_COLOR,
                padding: "24px 36px 0 36px",
              }}
            >
              <div className="mb-3">
                <label
                  htmlFor="orgName"
                  style={{ fontWeight: 600, marginBottom: 4, display: "block" }}
                >
                  Organization Name
                </label>
                <input
                  id="orgName"
                  className="form-control"
                  type="text"
                  placeholder="Enter organization name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    fontSize: "1rem",
                    border: `1.5px solid ${BORDER_COLOR}`,
                    color: TEXT_COLOR,
                    background: "#fff",
                  }}
                  required
                />
              </div>
              <div className="mb-3">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Tier</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {TIERS.map((t) => (
                    <label
                      key={t.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontWeight: 500,
                        border:
                          tier === t.value
                            ? `2px solid ${BRAND_BLUE}`
                            : `1.5px solid ${BORDER_COLOR}`,
                        borderRadius: 6,
                        padding: "10px 18px",
                        background: tier === t.value ? "#f6f8ff" : "#fff",
                        color: TEXT_COLOR,
                        transition: "border 0.2s, background 0.2s",
                        minWidth: 120,
                        boxShadow:
                          tier === t.value
                            ? `0 2px 8px ${BRAND_BLUE}22`
                            : undefined,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={tier === t.value}
                        onChange={() => setTier(t.value)}
                        style={{
                          accentColor: BRAND_BLUE,
                          width: 18,
                          height: 18,
                        }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
                {submitted && !tier && (
                  <div
                    style={{
                      color: "#f5365c",
                      fontSize: 13,
                      marginTop: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>&#9888;</span>{" "}
                    Select a tier
                  </div>
                )}
              </div>
            </div>
            <div
              className="modal-footer"
              style={{
                padding: "24px 36px 28px 36px",
                borderTop: `1.5px solid ${BORDER_COLOR}`,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  fontWeight: 600,
                  background: "#fff",
                  color: TEXT_COLOR,
                  border: `1.5px solid ${BORDER_COLOR}`,
                  borderRadius: 5,
                  padding: "0.5em 2em",
                  marginRight: 12,
                  boxShadow: "none",
                  transition: "background 0.2s, color 0.2s, border 0.2s",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                className="btn"
                type="submit"
                disabled={!orgName.trim() || !tier || loading}
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  fontWeight: 600,
                  background: BRAND_BLUE,
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "0.5em 2em",
                  boxShadow: `0 2px 8px ${BRAND_BLUE}22`,
                  opacity: orgName.trim() && tier && !loading ? 1 : 0.6,
                  cursor:
                    orgName.trim() && tier && !loading
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                {loading ? "Adding..." : "Add Organization"}
              </button>
              {error && (
                <div style={{ color: "#f5365c", marginTop: 8, fontSize: 14 }}>
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
