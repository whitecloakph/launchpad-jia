"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";

const BRAND_BLUE = "#5e39d6";
const BORDER_COLOR = "#ddd";
const TEXT_COLOR = "#333";

export default function InviteMemberModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { orgID } = useAppContext();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "hiring_manager" | null>(null);
  const [selectedCareers, setSelectedCareers] = useState<
    { id: string; jobTitle: string }[]
  >([]);
  const [careerSearch, setCareerSearch] = useState("");
  const [careersLoading, setCareersLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [careers, setCareers] = useState<{ id: string; jobTitle: string }[]>(
    []
  );

  // Filter careers based on search
  const filteredCareers = careers.filter((career) =>
    career.jobTitle.toLowerCase().includes(careerSearch.toLowerCase())
  );

  // Simulate loading careers data
  useEffect(() => {
    async function getCareers() {
      const response = await axios.post("/api/fetch-careers", {
        orgID: orgID,
      });
      setCareers(
        response.data.map((career: any) => ({
          id: career.id,
          jobTitle: career.jobTitle,
        }))
      );
      setCareersLoading(false);
    }
    getCareers();
  }, []);

  const handleCareerChange = (
    career: { id: string; jobTitle: string } | "All Careers"
  ) => {
    if (career === "All Careers") {
      setSelectedCareers(
        selectedCareers.length === careers.length ? [] : [...careers]
      );
    } else {
      setSelectedCareers((prev) =>
        prev.some((c) => c.id === career.id)
          ? prev.filter((c) => c.id !== career.id)
          : [...prev, career]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/add-member", {
        email: email.trim(),
        orgID: orgID,
        role: role,
        careers:
          role === "hiring_manager"
            ? selectedCareers.map((c) => c.id)
            : undefined,
      });
      Swal.fire({
        title: "Member invited successfully",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1500);
    } catch (err) {
      setError("Failed to invite member. Please try again.");
    } finally {
      setLoading(false);
    }
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
            border: `2px solid ${BORDER_COLOR}`,
            borderRadius: 14,
            boxShadow: "rgba(78, 76, 76, 0.439) 0px 3px 8px",
            minWidth: 340,
            maxWidth: 400,
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
              borderBottom: `2px solid ${BORDER_COLOR}`,
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
              Invite Member
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
                  htmlFor="inviteEmail"
                  style={{ fontWeight: 600, marginBottom: 4, display: "block" }}
                >
                  Email Address
                </label>
                <input
                  id="inviteEmail"
                  className="form-control"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    fontSize: "1rem",
                    border: `2px solid ${BORDER_COLOR}`,
                    color: TEXT_COLOR,
                    background: "#fff",
                    borderRadius: 5,
                    padding: "8px 12px",
                    width: "100%",
                    transition: "all 0.2s ease",
                  }}
                  required
                  autoFocus
                />
                {error && (
                  <div style={{ color: "salmon", marginTop: 6, fontSize: 14 }}>
                    {error}
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <label
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      display: "block",
                    }}
                  >
                    Role
                  </label>
                  <div style={{ display: "flex", gap: 16 }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={role === "admin"}
                        onChange={() => setRole("admin")}
                        style={{ cursor: "pointer" }}
                      />
                      Admin
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={role === "hiring_manager"}
                        onChange={() => setRole("hiring_manager")}
                        style={{ cursor: "pointer" }}
                      />
                      Hiring Manager
                    </label>
                  </div>
                </div>
                {role === "hiring_manager" && (
                  <div style={{ marginTop: 16 }}>
                    <label
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      Select Careers
                    </label>
                    <div style={{ marginBottom: 12 }}>
                      <input
                        type="text"
                        placeholder="Search careers..."
                        value={careerSearch}
                        onChange={(e) => setCareerSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: `2px solid ${BORDER_COLOR}`,
                          borderRadius: 5,
                          fontSize: "0.9rem",
                          fontFamily: "Open Sans, sans-serif",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        border: `2px solid ${BORDER_COLOR}`,
                        borderRadius: 5,
                        padding: 8,
                        maxHeight: 200,
                        overflowY: "auto",
                        minHeight: 200,
                        display: "flex",
                        flexDirection: "column",
                        background: "#fff",
                      }}
                    >
                      {careersLoading ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#666",
                            fontSize: "0.9rem",
                          }}
                        >
                          Loading careers...
                        </div>
                      ) : careers.length === 0 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#666",
                            fontSize: "0.9rem",
                          }}
                        >
                          No careers available
                        </div>
                      ) : (
                        <>
                          {!careerSearch && (
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                padding: "4px 8px",
                                transition: "background-color 0.2s ease",
                                borderRadius: 4,
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f8f9fa")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <input
                                type="checkbox"
                                checked={
                                  selectedCareers.length === careers.length
                                }
                                onChange={() =>
                                  handleCareerChange("All Careers")
                                }
                                style={{ cursor: "pointer" }}
                              />
                              All Careers
                            </label>
                          )}
                          {filteredCareers.length > 0 ? (
                            filteredCareers.map((career) => (
                              <label
                                key={career.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  transition: "background-color 0.2s ease",
                                  borderRadius: 4,
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f8f9fa")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCareers.some(
                                    (c) => c.id === career.id
                                  )}
                                  onChange={() => handleCareerChange(career)}
                                  style={{ cursor: "pointer" }}
                                />
                                {career.jobTitle}
                              </label>
                            ))
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                color: "#666",
                                fontSize: "0.9rem",
                              }}
                            >
                              No matching careers found
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div
              className="modal-footer"
              style={{
                background: "#fff",
                borderTop: `2px solid ${BORDER_COLOR}`,
                padding: "18px 36px",
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-primary"
                type="submit"
                style={{
                  fontWeight: 600,
                  background: BRAND_BLUE,
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "0.5em 2em",
                  boxShadow: `0 2px 8px ${BRAND_BLUE}22`,
                  opacity: loading || !role || !email.trim() ? 0.5 : 1,
                  cursor:
                    loading || !role || !email.trim()
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease",
                }}
                disabled={loading || !role || !email.trim()}
              >
                {loading ? "Inviting..." : "Invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
