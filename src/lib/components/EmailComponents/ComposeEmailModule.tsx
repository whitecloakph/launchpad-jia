"use client";

import React, { useState } from "react";
import AvatarImage from "../AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast, successToast } from "@/lib/Utils";

interface ComposeEmailModuleProps {
  isOpen: boolean;
  onClose: () => void;
  replyData?: {
    to: string;
    subject: string;
    threadId?: string;
    originalEmail?: any;
    isReply?: boolean;
  };
}

export default function ComposeEmailModule({
  isOpen,
  onClose,
  replyData,
}: ComposeEmailModuleProps) {
  const { user } = useAppContext();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    to: replyData?.to || "",
    job: "",
    subject: replyData?.subject || "",
    message: "",
  });

  // Update form data when replyData changes
  React.useEffect(() => {
    if (replyData) {
      const originalMessage =
        replyData.originalEmail?.emailContent?.messages?.[0]?.content || "";
      const replyPrefix = `\n\n--- Original Message ---\n${originalMessage}`;

      setFormData({
        to: replyData.to,
        job: "",
        subject: replyData.subject,
        message: replyPrefix,
      });
    }
  }, [replyData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSend = async () => {
    // Validate required fields
    if (!formData.to || !formData.subject || !formData.message) {
      errorToast(
        "Please fill in all required fields (To, Subject, and Message)",
        "top-center"
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.to)) {
      errorToast("Please enter a valid email address", "top-center");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/email-module/gm-send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromEmail: user?.email || "sabine.dy@whitecloak.com",
          toEmail: formData.to,
          subject: formData.subject,
          message: formData.message,
          threadId: replyData?.threadId,
          isReply: replyData?.isReply || false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          successToast("Email sent successfully!", "top-center");
          onClose();
        } else {
          errorToast(
            "Failed to send email: " + (data.error || "Unknown error"),
            "top-center"
          );
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Unknown error";

        // Handle specific error cases
        if (errorMessage.includes("Thread not found")) {
          errorToast(
            "The original email thread was not found. The email will be sent as a new message.",
            "top-center"
          );
        } else {
          errorToast("Failed to send email: " + errorMessage, "top-center");
        }
      }
    } catch (error) {
      console.error("Error sending email:", error);
      errorToast("Failed to send email. Please try again.", "top-center");
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = () => {
    // Handle save draft logic here
    console.log("Saving draft:", formData);
  };

  const handleDiscard = () => {
    setFormData({
      to: "candidate@example.com",
      job: "",
      subject: "",
      message: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
    padding: "20px",
  };

  const modalStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#ffffff",
  };

  const headerLeftStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const headerTitleStyle = {
    fontSize: "16px",
    fontWeight: 600,
    color: "#212529",
    margin: 0,
  };

  const windowControlsStyle = {
    display: "flex",
    gap: "8px",
  };

  const windowControlButtonStyle = {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f8f9fa",
    color: "#6c757d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "12px",
  };

  const contentStyle = {
    flex: 1,
    padding: "24px",
    overflowY: "auto" as const,
  };

  const formSectionStyle = {
    marginBottom: "24px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    color: "#495057",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
  };

  const fromContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    backgroundColor: "#f8f9fa",
  };

  const fromInfoStyle = {
    flex: 1,
  };

  const fromEmailStyle = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#212529",
    marginBottom: "2px",
  };

  const fromSubtextStyle = {
    fontSize: "12px",
    color: "#6c757d",
  };

  const selectStyle = {
    ...inputStyle,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px 12px",
    paddingRight: "40px",
    appearance: "none" as const,
  };

  const templateButtonStyle = {
    backgroundColor: "#f8f9fa",
    color: "#495057",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    marginBottom: "24px",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical" as const,
    fontFamily: "inherit",
  };

  const toolbarStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 0",
    borderBottom: "1px solid #dee2e6",
    marginBottom: "16px",
  };

  const toolbarButtonStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
    backgroundColor: "#ffffff",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
  };

  const toolbarSelectStyle = {
    ...toolbarButtonStyle,
    width: "auto",
    padding: "0 8px",
    fontSize: "12px",
  };

  const footerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderTop: "1px solid #dee2e6",
    backgroundColor: "#ffffff",
  };

  const footerLeftStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  };

  const attachButtonStyle = {
    backgroundColor: "#f8f9fa",
    color: "#495057",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  };

  const discardLinkStyle = {
    color: "#dc3545",
    fontSize: "14px",
    textDecoration: "none",
    cursor: "pointer",
  };

  const footerRightStyle = {
    display: "flex",
    gap: "12px",
  };

  const saveDraftButtonStyle = {
    backgroundColor: "#ffffff",
    color: "#495057",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
  };

  const sendButtonStyle = {
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: 500,
  };

  return (
    <div
      style={modalOverlayStyle}
      onClick={onClose}
      className="compose-email-modal"
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerLeftStyle}>
            <i
              className="la la-envelope"
              style={{ fontSize: "18px", color: "#6c757d" }}
            ></i>
            <h3 style={headerTitleStyle}>
              {replyData?.isReply ? "Reply to Email" : "Compose Email"}
            </h3>
          </div>
          <div style={windowControlsStyle}>
            <button style={windowControlButtonStyle}>−</button>
            <button style={windowControlButtonStyle}>⤢</button>
            <button style={windowControlButtonStyle} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* From Field */}
          <div style={formSectionStyle}>
            <label style={labelStyle}>From</label>
            <div style={fromContainerStyle}>
              <AvatarImage
                src={
                  user?.image ||
                  "https://api.dicebear.com/9.x/glass/svg?seed=sabine"
                }
                className="rounded-circle"
                alt={user?.name || "jia"}
                style={{ width: "32px", height: "32px" }}
              />
              <div style={fromInfoStyle}>
                <div style={fromEmailStyle}>
                  {user?.email || "jia@whitecloak.com"}
                </div>
                <div style={fromSubtextStyle}>Sending via Gmail account</div>
              </div>
            </div>
          </div>

          {/* To Field */}
          <div style={formSectionStyle}>
            <label style={labelStyle}>To</label>
            <input
              type="email"
              style={inputStyle}
              value={formData.to}
              onChange={(e) => handleInputChange("to", e.target.value)}
            />
          </div>

          {/* Job Field */}
          <div style={formSectionStyle}>
            <label style={labelStyle}>Job</label>
            <select
              style={selectStyle}
              value={formData.job}
              onChange={(e) => handleInputChange("job", e.target.value)}
            >
              <option value="">Choose related job</option>
              <option value="software-engineer">Software Engineer</option>
              <option value="product-manager">Product Manager</option>
              <option value="business-developer">
                Business Development Associate
              </option>
            </select>
          </div>

          {/* Template Button */}
          <button style={templateButtonStyle}>
            <i className="la la-file-text"></i>
            Insert a Template
          </button>

          {/* Subject Field */}
          <div style={formSectionStyle}>
            <label style={labelStyle}>Subject</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
            />
          </div>

          {/* Message Field */}
          <div style={formSectionStyle}>
            <label style={labelStyle}>Message</label>
            <textarea
              style={textareaStyle}
              placeholder="Enter message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
            />
          </div>

          {/* Rich Text Editor Toolbar */}
          <div style={toolbarStyle} className="compose-email-toolbar">
            <select style={toolbarSelectStyle}>
              <option>16</option>
              <option>14</option>
              <option>12</option>
            </select>
            <button style={toolbarButtonStyle}>
              <i className="la la-font" style={{ color: "#000" }}></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-highlighter"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <strong>B</strong>
            </button>
            <button style={toolbarButtonStyle}>
              <em>I</em>
            </button>
            <button style={toolbarButtonStyle}>
              <u>U</u>
            </button>
            <button style={toolbarButtonStyle}>
              <s>S</s>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-align-left"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-align-center"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-align-right"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-list-ul"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-list-ol"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-image"></i>
            </button>
            <button style={toolbarButtonStyle}>
              <i className="la la-link"></i>
            </button>
            <button style={toolbarButtonStyle}>
              T Tags <i className="la la-question-circle"></i>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle} className="compose-email-footer">
          <div style={footerLeftStyle}>
            <button style={attachButtonStyle}>
              <i className="la la-paperclip"></i>
              Attach a File
            </button>
            <a style={discardLinkStyle} onClick={handleDiscard}>
              Discard
            </a>
          </div>
          <div style={footerRightStyle}>
            <button
              onClick={handleSaveDraft}
              className="btn btn-outline-default"
              style={{ borderRadius: "25px" }}
            >
              Save Draft
            </button>
            <button
              onClick={handleSend}
              className="btn btn-default btn-pill"
              style={{ borderRadius: "25px" }}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <i className="la la-spinner la-spin"></i> Sending...
                </>
              ) : (
                <>
                  <i className="la la-paper-plane"></i> Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
