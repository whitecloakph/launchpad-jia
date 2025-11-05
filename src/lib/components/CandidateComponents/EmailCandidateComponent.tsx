import React, { useState, useEffect } from "react";
import CandidateRichTextEditor from "./CandidateRichTextEditor";
import { errorToast, successToast } from "@/lib/Utils";

interface EmailCandidateComponentProps {
  isDisabled?: boolean;
  emailContent?: {
    subject?: string;
    body?: string;
  };
  onEmailContentChange?: (content: { subject: string; body: string }) => void;
  endorseFrom?: string;
  endorseTo?: string;
  onEndorseFromChange?: (value: string) => void;
  onEndorseToChange?: (value: string) => void;
  onActionChange?: (value: string) => void;
  // External data for dynamic content
  candidateName?: string;
  jobTitle?: string;
  interviewDate?: string;
  action?: string;
  candidateEmail?: string;
}

export default function EmailCandidateComponent({
  isDisabled = false,
  emailContent = {
    subject: "[Job Title @ Company Name] Candidate Name",
    body: `Hi [Candidate Name],

Great news! You have been shortlisted for the role [Job Title].

Please take the AI interview by [Interview Date].

Reminders:
• The interview will take around 30 minutes, which widely varies based on the length of your answers.
• The interview recording will be reviewed by a human recruiter.
• Please ensure you have a stable internet connection and a quiet environment.`,
  },
  onEmailContentChange,
  endorseFrom = "CV Screening: For Review",
  endorseTo = "AI Interview: Waiting Interview",
  onEndorseFromChange,
  onEndorseToChange,
  onActionChange,
  candidateName = "Hector",
  jobTitle = "10x Developer",
  interviewDate = "August 2, 2025",
  candidateEmail = "hector@jia.com",
  action = "endorse",
}: EmailCandidateComponentProps) {
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  // Function to replace placeholders with actual values
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\[Candidate Name\]/g, candidateName)
      .replace(/\[Job Title\]/g, jobTitle)
      .replace(/\[Interview Date\]/g, interviewDate);
  };

  // Function to highlight dynamic values in blue
  const highlightDynamicValues = (text: string) => {
    return (
      text
        .replace(
          new RegExp(candidateName, "g"),
          `<span style="color: #007bff;">${candidateName}</span>`
        )
        .replace(
          new RegExp(jobTitle, "g"),
          `<span style="color: #007bff;">${jobTitle}</span>`
        )
        //   .replace(
        //     new RegExp(companyName, "g"),
        //     `<span style="color: #007bff;">${companyName}</span>`
        //   )
        .replace(
          new RegExp(interviewDate, "g"),
          `<span style="color: #007bff;">${interviewDate}</span>`
        )
    );
  };

  // Function to generate dynamic email content based on endorseTo and action
  const generateEmailTemplate = (
    endorseToValue: string,
    actionValue: string = "endorse"
  ) => {
    let companyName = "";
    if (typeof window !== "undefined" && localStorage.activeOrg) {
      try {
        const activeOrg = JSON.parse(localStorage.activeOrg);
        companyName = activeOrg?.name || "";
      } catch (e) {
        companyName = "";
      }
    }

    const templates = {
      "CV Review": {
        endorse: {
          subject: `[${jobTitle} @ ${companyName}] CV Review - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We have received your CV for the job ${jobTitle}. Your CV is now being reviewed. We will send an email update soon.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
        drop: {
          subject: `[${jobTitle} @ ${companyName}] Application Update - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We have received your CV for the job ${jobTitle}. Unfortunately, you have not met the strictest criteria set for this position.</p>

<p>Here's a constructive feedback:</p>
<ul style="padding-left: 20px; margin: 0;">
<li>Your experience level doesn't match our current requirements</li>
<li>We're looking for candidates with more specific technical skills</li>
<li>Your background would be better suited for other roles in our organization</li>
</ul>

<p>That said, we would love for you to apply again in the future. Wishing you success in your job hunt.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
      },
      "Pending AI Interview": {
        endorse: {
          subject: `[${jobTitle} @ ${companyName}] AI Interview Invitation - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>Great news! You have been shortlisted for the ${jobTitle} role.</p>

<p>Please take the AI interview by ${interviewDate}.</p>

<p><strong>Reminders:</strong></p>
<ul style="padding-left: 20px; margin: 0;">
<li>The interview will take around 30 minutes, which widely varies based on the length of your answers.</li>
<li>The interview recording will be reviewed by a human recruiter.</li>
<li>It is best to take in a quiet, distraction-free environment.</li>
<li>Make sure your internet connection is good and stable.</li>
<li>Allow mic and video permissions before proceeding.</li>
<li>Be as authentic as possible in your answers</li>
<li>In case you encounter any technical difficulties, there will be an interview retake request button on your dashboard.</li>
</ul>

<p>You may login to the <a href="https://www.hellojia.ai/dashboard" target="_blank" rel="noopener noreferrer">Jia Job Portal</a> Link to take your AI interview. Best of luck!</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
        drop: {
          subject: `[${jobTitle} @ ${companyName}] Application Update - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We appreciate you for taking the time to apply for the ${jobTitle} role. We regret to inform you that we will no longer move forward with your application. This is because your profile doesn't match what we're looking for for this role.</p>

<p>That said, we would love for you to apply again in the future. Wishing you success in your job hunt.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
      },
      "AI Interview Review": {
        endorse: {
          subject: `[${jobTitle} @ ${companyName}] AI Interview Review - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>Thank you for taking the AI interview for the ${jobTitle} role. Your interview is now being reviewed. We will send an email update soon.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
        drop: {
          subject: `[${jobTitle} @ ${companyName}] Application Update - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We appreciate you for taking the time to apply for the ${jobTitle} role. We regret to inform you that we will no longer move forward with your application.</p>

<p>Here's a constructive feedback:</p>
<ul style="padding-left: 20px; margin: 0;">
<li>Your interview responses didn't align with our expectations</li>
<li>We're looking for candidates with different communication skills</li>
<li>Your technical knowledge needs further development for this role</li>
</ul>

<p>That said, we would love for you to apply again in the future. Wishing you success in your job hunt.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
      },
      "For Human Interview": {
        endorse: {
          subject: `[${jobTitle} @ ${companyName}] Human Interview Invitation - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>Great news! You have passed the AI Interview. You are one step closer to getting a job offer for the ${jobTitle} role.</p>

<p>We will contact you soon via email or your contact details.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
        drop: {
          subject: `[${jobTitle} @ ${companyName}] Application Update - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We appreciate you for taking the time to apply for the ${jobTitle} role. We regret to inform you that we will no longer move forward with your application. This is because your profile doesn't match what we're looking for for this role.</p>

<p>That said, we would love for you to apply again in the future. Wishing you success in your job hunt.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
      },
      "Pending Job Interview": {
        endorse: {
          subject: `[${jobTitle} @ ${companyName}] Job Interview Invitation - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>Great news! You have passed the AI Interview. You are one step closer to getting a job offer for the ${jobTitle} role.</p>

<p>We will contact you soon via email or your contact details.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
        drop: {
          subject: `[${jobTitle} @ ${companyName}] Application Update - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We appreciate you for taking the time to apply for the ${jobTitle} role. We regret to inform you that we will no longer move forward with your application. This is because your profile doesn't match what we're looking for for this role.</p>

<p>That said, we would love for you to apply again in the future. Wishing you success in your job hunt.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
      },
      "Job Offered": {
        endorse: {
          subject: `[${jobTitle} @ ${companyName}] Congratulations! Job Offer - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>Congratulations! Our team has found you to be a great fit for the role ${jobTitle}.</p>

<p>We will contact you for a formal job offer soon.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
        drop: {
          subject: `[${jobTitle} @ ${companyName}] Application Update - ${candidateName}`,
          body: `<p>Hi ${candidateName},</p>

<p>We appreciate you for taking the time to apply for the ${jobTitle} role. We regret to inform you that we will no longer move forward with your application. This is because your profile doesn't match what we're looking for for this role.</p>

<p>That said, we would love for you to apply again in the future. Wishing you success in your job hunt.</p>

<p>Best Regards,<br>
${companyName}</p>`,
        },
      },
    };

    const stageTemplate =
      templates[endorseToValue] || templates["Pending AI Interview"];
    return stageTemplate[actionValue] || stageTemplate["endorse"];
  };

  const [currentEmailContent, setCurrentEmailContent] = useState(() => {
    const template = generateEmailTemplate(endorseTo, action);
    return {
      subject: emailContent?.subject || template.subject,
      body: emailContent?.body || template.body,
    };
  });

  // Update email content when endorseTo or action changes
  useEffect(() => {
    const template = generateEmailTemplate(endorseTo, action);
    setCurrentEmailContent((prev) => ({
      subject:
        prev.subject === emailContent?.subject
          ? template.subject
          : prev.subject,
      body: prev.body === emailContent?.body ? template.body : prev.body,
    }));
  }, [endorseTo, action, candidateName, jobTitle, interviewDate]);

  const handleEmailContentChange = (
    field: "subject" | "body",
    value: string
  ) => {
    const updatedContent = {
      ...currentEmailContent,
      [field]: value,
    };
    setCurrentEmailContent(updatedContent);
    onEmailContentChange?.(updatedContent);
  };

  const toggleAutomation = () => {
    if (!isDisabled) {
      setIsAutomationEnabled(!isAutomationEnabled);
    }
  };

  const toggleEmailEditing = () => {
    if (!isDisabled) {
      setIsEditingEmail(!isEditingEmail);
    }
  };

  // Function to build email automation JSON
  const buildEmailAutomationData = () => {
    if (!isAutomationEnabled) {
      console.log("Email automation is disabled");
      return;
    }

    const emailAutomation = {
      to: candidateEmail,
      subject: currentEmailContent.subject,
      message: currentEmailContent.body,
    };

    return emailAutomation;
  };

  const sendEmailAutomation = async () => {
    const emailAutomation = buildEmailAutomationData();

    const response = await fetch("/api/automations/send-email-reminder", {
      method: "POST",
      body: JSON.stringify(emailAutomation),
    });

    if (response.ok) {
      successToast("Email sent successfully", "bottom-center");
    } else {
      errorToast("Failed to send email", "bottom-center");
    }
  };

  return (
    <div className="card" style={{ margin: 0 }}>
      <div
        className="card-body"
        style={{
          padding: "20px",
          paddingBottom: isAutomationEnabled ? "20px" : "0px",
        }}
      >
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4
            className="mb-0"
            style={{
              fontWeight: "600",
              color: "#333",
              fontSize: "18px",
            }}
          >
            Automation
          </h4>
          <div className="d-flex align-items-center">
            <button
              type="button"
              onClick={toggleAutomation}
              disabled={isDisabled}
              style={{
                background: "none",
                border: "none",
                cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <i
                className={`la ${
                  isAutomationEnabled
                    ? "la-toggle-on jia-gradient-text"
                    : "la-toggle-off"
                }`}
                style={{
                  fontSize: "30px",
                  color: isAutomationEnabled ? "" : "#6c757d",
                }}
              ></i>

              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  position: "relative",
                  top: "-1px",
                }}
              >
                Send Email Automation
              </span>
            </button>
          </div>
        </div>

        {/* Workflow Stages */}

        {/* Email Preview Section - Only show if automation is enabled */}
        {isAutomationEnabled && (
          <>
            {/* Workflow Stages Row */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {/* Endorse From */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    marginBottom: "4px",
                    textAlign: "left",
                  }}
                >
                  Endorse from
                </div>
                <div
                  style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}
                >
                  {endorseFrom}
                </div>
              </div>

              {/* Endorse To */}
              <div style={{ flex: 1, marginLeft: "24px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    marginBottom: "4px",
                    textAlign: "left",
                  }}
                >
                  Endorse to
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#333",
                    fontWeight: "500",
                    textAlign: "left",
                  }}
                >
                  {endorseTo}
                </div>
              </div>

              {/* Edit Email Button */}
              <div style={{ marginLeft: "24px" }}>
                <button
                  className={`btn ${
                    isEditingEmail ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={toggleEmailEditing}
                  disabled={isDisabled || !isAutomationEnabled}
                  style={{
                    fontSize: "12px",
                    borderColor: isEditingEmail ? "#4169e1" : "#dee2e6",
                    color: isEditingEmail ? "white" : "#333",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    border: `1px solid ${
                      isEditingEmail ? "#4169e1" : "#dee2e6"
                    }`,
                    backgroundColor: isEditingEmail ? "#4169e1" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <i
                    className={`la ${
                      isEditingEmail ? "la-times" : "la-pencil"
                    }`}
                    style={{ fontSize: "12px" }}
                  ></i>
                  {isEditingEmail ? "Stop editing" : "Edit email"}
                </button>
              </div>
            </div>

            <button
              onClick={sendEmailAutomation}
              className="btn btn-primary d-none"
              style={{ marginTop: "10px" }}
              id="candidate-email-send-button"
            >
              Send Email
            </button>

            <div
              className="border rounded p-4"
              style={{
                backgroundColor: "#f8f9fa",
                borderColor: "#dee2e6",
                textAlign: "left",
              }}
            >
              <div className="mb-3">
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Subject
                </label>
                {isEditingEmail ? (
                  <input
                    type="text"
                    className="form-control"
                    value={currentEmailContent.subject}
                    onChange={(e) =>
                      handleEmailContentChange("subject", e.target.value)
                    }
                    disabled={isDisabled}
                    style={{
                      fontSize: "13px",
                      border: "2px solid #4169e1",
                      borderRadius: "4px",
                      outline: "none",
                      boxShadow: "0 0 0 1px #4169e1",
                    }}
                  />
                ) : (
                  <div
                    className="p-2"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      minHeight: "38px",
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightDynamicValues(
                        currentEmailContent.subject
                      ),
                    }}
                  />
                )}
              </div>

              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Body
                </label>

                {isEditingEmail ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      border: "2px solid #4169e1",
                      borderRadius: "4px",
                      outline: "none",
                      boxShadow: "0 0 0 1px #4169e1",
                      minHeight: "200px",
                    }}
                  >
                    <CandidateRichTextEditor
                      value={currentEmailContent.body}
                      onChange={(value) =>
                        handleEmailContentChange("body", value)
                      }
                    />
                  </div>
                ) : (
                  <div
                    className="p-3"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      minHeight: "200px",
                      lineHeight: "1.5",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightDynamicValues(currentEmailContent.body),
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
