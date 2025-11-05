"use client";

import React, { useState } from "react";
import AvatarImage from "../AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";
import ComposeEmailModule from "./ComposeEmailModule";

const mockEmailThreads: any = [
  {
    id: "1",
    name: "Hector Castro",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=hector",
    role: "Software Engineer",
    subject: "Application Received - Hector Castro",
    snippet: "Dear Sabine, I am reaching out regarding my applica...",
    timeAgo: "2 hours ago",
    isNew: true,
    unreadCount: 0,
    messageCount: 2,
    hasAttachment: true,
    stage: "CV Review",
    emailContent: {
      subject: "Application Received - Hector Castro",
      messages: [
        {
          id: "1",
          sender: {
            name: "Sabine Beatrix Dy",
            email: "sabine.dy@whitecloak.com",
            avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sabine",
          },
          recipient: {
            name: "Hector Castro",
            email: "hector.castro@gmail.com",
          },
          timestamp: "Mon, Jul 22, 2025, 10:53 AM (2 days ago)",
          type: "automated",
          content: `Hi Hector,

Thank you for applying for 10x Developer at White Cloak Technologies. Please submit your CV via https://www.hirejia.ai at your earliest convenience. We are looking forward to your submission.

Best Regards,
Sabine Beatrix Dy
HR Manager | White Cloak Technologies
Office: +6322840633 | Mobile: +639392249224 | www.whitecloak.com`,
          signature: {
            name: "Sabine Beatrix Dy",
            title: "HR Manager | White Cloak Technologies",
            contact:
              "Office: +6322840633 | Mobile: +639392249224 | www.whitecloak.com",
            logo: "W",
          },
        },
        {
          id: "2",
          sender: {
            name: "Hector Castro",
            email: "hector.castro@gmail.com",
            avatar: "https://api.dicebear.com/9.x/glass/svg?seed=hector",
          },
          recipient: {
            name: "Sabine Beatrix Dy",
            email: "sabine.dy@whitecloak.com",
          },
          timestamp: "Wed, Jul 24, 2025, 7:12 AM (2 hours ago)",
          type: "direct",
          content: `Dear Sabine,

I am reaching out regarding my application for the 10x Developer position at White Cloak Technologies. I have submitted my CV through the provided link and I'm excited about the opportunity to contribute to your team.

I have over 5 years of experience in full-stack development with expertise in React, Node.js, and cloud technologies. I'm particularly interested in the innovative projects White Cloak Technologies is working on.

Please let me know if you need any additional information or if there are next steps in the application process.

Best regards,
Hector Castro`,
          signature: {
            name: "Hector Castro",
            title: "Software Engineer",
            contact: "hector.castro@gmail.com",
          },
        },
      ],
    },
  },
  {
    id: "2",
    name: "Angelina Dimaano",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=angelina",
    role: "Business Development Associate",
    subject: "Application Status Update - Angelina Dimaano",
    snippet: "Thank you for the update. I look forward to hearing f...",
    timeAgo: "2 hours ago",
    isNew: true,
    unreadCount: 0,
    messageCount: 3,
    hasAttachment: false,
    stage: "AI Interview Review",
    emailContent: {
      subject: "Application Status Update - Angelina Dimaano",
      messages: [
        {
          id: "1",
          sender: {
            name: "Sabine Beatrix Dy",
            email: "sabine.dy@whitecloak.com",
            avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sabine",
          },
          recipient: {
            name: "Angelina Dimaano",
            email: "angelina.dimaano@gmail.com",
          },
          timestamp: "Tue, Jul 23, 2025, 2:30 PM (1 day ago)",
          type: "automated",
          content: `Hi Angelina,

Thank you for your application for the Business Development Associate position. We have received your CV and it has been forwarded to our AI screening system for initial review.

You will receive an update within 24-48 hours regarding the next steps in our hiring process.

Best Regards,
Sabine Beatrix Dy
HR Manager | White Cloak Technologies`,
          signature: {
            name: "Sabine Beatrix Dy",
            title: "HR Manager | White Cloak Technologies",
            contact:
              "Office: +6322840633 | Mobile: +639392249224 | www.whitecloak.com",
          },
        },
      ],
    },
  },
  {
    id: "3",
    name: "Evelyn Corcuera",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=evelyn",
    role: "Product Manager",
    subject: "Interview Confirmation - Evelyn Corcuera",
    snippet: "I confirm my availability for the scheduled interview...",
    timeAgo: "2 hours ago",
    isNew: false,
    unreadCount: 0,
    messageCount: 1,
    hasAttachment: false,
    stage: "Interview Scheduled",
    emailContent: {
      subject: "Interview Confirmation - Evelyn Corcuera",
      messages: [
        {
          id: "1",
          sender: {
            name: "Evelyn Corcuera",
            email: "evelyn.corcuera@gmail.com",
            avatar: "https://api.dicebear.com/9.x/glass/svg?seed=evelyn",
          },
          recipient: {
            name: "Sabine Beatrix Dy",
            email: "sabine.dy@whitecloak.com",
          },
          timestamp: "Wed, Jul 24, 2025, 9:45 AM (1 hour ago)",
          type: "direct",
          content: `Dear Sabine,

I confirm my availability for the scheduled interview on Friday, July 26th at 2:00 PM. I have prepared thoroughly and I'm looking forward to discussing the Product Manager role at White Cloak Technologies.

Please let me know if there are any specific materials I should prepare or if there are any changes to the interview schedule.

Best regards,
Evelyn Corcuera`,
          signature: {
            name: "Evelyn Corcuera",
            title: "Product Manager",
            contact: "evelyn.corcuera@gmail.com",
          },
        },
      ],
    },
  },
];

export default function EmailModule() {
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGmailToken, setHasGmailToken] = useState(false);
  const [isEnablingGmail, setIsEnablingGmail] = useState(false);
  const [emailThreads, setEmailThreads] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  const { user } = useAppContext();

  // Check for Gmail integration function
  const checkGmailIntegration = async () => {
    try {
      // Check if refresh token exists in sessionStorage
      const storedToken = sessionStorage.getItem("gmRefreshToken");

      if (storedToken) {
        setHasGmailToken(true);
        setIsLoading(false);
        return;
      }

      // If no stored token, check with the API
      if (user?.email) {
        const response = await fetch("/api/email-module/gm-fetch-extension", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.refreshToken) {
            // Save refresh token to sessionStorage
            sessionStorage.setItem("gmRefreshToken", data.data.refreshToken);
            setHasGmailToken(true);
          } else {
            setHasGmailToken(false);
          }
        } else {
          setHasGmailToken(false);
        }
      } else {
        setHasGmailToken(false);
      }
    } catch (error) {
      console.error("Error checking Gmail integration:", error);
      setHasGmailToken(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for Gmail integration on component mount
  React.useEffect(() => {
    checkGmailIntegration();
  }, [user?.email]);

  // Fetch emails when Gmail integration is available
  React.useEffect(() => {
    if (hasGmailToken && user?.email) {
      fetchEmails();
    }
  }, [hasGmailToken, user?.email]);

  // Handle URL parameters for OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success === "gmail_integrated") {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Re-check Gmail integration
      setIsLoading(true);
      checkGmailIntegration();
    } else if (error) {
      // Handle OAuth errors
      console.error("Gmail OAuth error:", error);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch emails from Gmail API
  const fetchEmails = async () => {
    if (!user?.email) return;

    setIsLoadingEmails(true);
    try {
      const response = await fetch("/api/email-module/gm-fetch-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          maxResults: 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.emails) {
          setEmailThreads(data.data.emails);
        }
      } else {
        console.error("Failed to fetch emails");
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Handle reply functionality
  const handleReply = (emailData: any) => {
    const lastMessage =
      emailData.emailContent.messages[
        emailData.emailContent.messages.length - 1
      ];

    // Use the thread ID from Gmail API for proper threading
    const replyData = {
      to: lastMessage.sender.email,
      subject: emailData.emailContent.subject.startsWith("Re:")
        ? emailData.emailContent.subject
        : `Re: ${emailData.emailContent.subject}`,
      threadId: emailData.threadId, // Use the actual thread ID from Gmail
      originalEmail: emailData,
      isReply: true,
    };

    console.log("Reply data:", {
      to: replyData.to,
      subject: replyData.subject,
      threadId: replyData.threadId,
    });

    setComposeData(replyData);
    setIsComposeOpen(true);
  };

  // Handle Gmail integration enable
  const handleEnableGmailIntegration = async () => {
    if (!user?.email) {
      console.error("No user email available");
      return;
    }

    setIsEnablingGmail(true);
    try {
      const response = await fetch("/api/email-module/gm-enable-extension", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = data.data.authUrl;
        } else if (data.success && data.data.refreshToken) {
          // User already has integration
          sessionStorage.setItem("gmRefreshToken", data.data.refreshToken);
          setHasGmailToken(true);
          setIsEnablingGmail(false);
        }
      } else {
        console.error("Failed to enable Gmail integration");
        setIsEnablingGmail(false);
      }
    } catch (error) {
      console.error("Error enabling Gmail integration:", error);
      setIsEnablingGmail(false);
    }
  };

  const inboxStats = {
    unread: 2,
    total: 42,
    automated: 33,
    direct: 9,
  };

  const containerStyle = {
    display: "flex",
    height: "100vh",
    backgroundColor: "#ffffff",
  };

  const sidebarStyle = {
    width: "40%",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #dee2e6",
    display: "flex",
    flexDirection: "column" as const,
  };

  const tabContainerStyle = {
    display: "flex",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#f8f9fa",
  };

  const tabButtonStyle = (isActive: boolean) => ({
    flex: 1,
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 500,
    border: "none",
    backgroundColor: isActive ? "#ffffff" : "transparent",
    color: isActive ? "#007bff" : "#6c757d",
    borderBottom: isActive ? "2px solid #007bff" : "none",
    position: "relative" as const,
    cursor: "pointer",
  });

  const badgeStyle = {
    position: "absolute" as const,
    top: "8px",
    right: "8px",
    backgroundColor: "#6c757d",
    color: "#ffffff",
    fontSize: "12px",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const summaryStyle = {
    padding: "8px 16px",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#ffffff",
  };

  const summaryContentStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "12px",
    color: "#6c757d",
  };

  const unreadBadgeStyle = {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 8px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: 500,
  };

  const searchContainerStyle = {
    padding: "8px 16px",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#ffffff",
  };

  const searchInputStyle = {
    width: "100%",
    paddingLeft: "36px",
    paddingRight: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
  };

  const filterContainerStyle = {
    padding: "8px 16px",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#ffffff",
  };

  const filterSelectStyle = {
    flex: 1,
    padding: "6px 8px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "12px",
    marginRight: "8px",
  };

  const emailListStyle = {
    flex: 1,
    overflowY: "auto" as const,
    backgroundColor: "#ffffff",
  };

  const emailItemStyle = (isSelected: boolean) => ({
    padding: "12px 16px",
    borderBottom: "1px solid #f8f9fa",
    cursor: "pointer",
    backgroundColor: isSelected ? "#e3f2fd" : "transparent",
    borderLeft: isSelected ? "4px solid #007bff" : "none",
  });

  const emailContentStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  };

  const emailInfoStyle = {
    flex: 1,
    minWidth: 0,
  };

  const emailHeaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  };

  const emailNameStyle = {
    fontWeight: 500,
    color: "#212529",
    fontSize: "14px",
    overflow: "hidden",
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  };

  const newBadgeStyle = {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    fontSize: "12px",
    padding: "2px 6px",
    borderRadius: "12px",
  };

  const timeStyle = {
    fontSize: "12px",
    color: "#6c757d",
    flexShrink: 0,
  };

  const roleStyle = {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "4px",
  };

  const subjectStyle = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#007bff",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  };

  const snippetStyle = {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "8px",
    overflow: "hidden",
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  };

  const tagsContainerStyle = {
    display: "flex",
    gap: "6px",
  };

  const tagStyle = {
    backgroundColor: "#f8f9fa",
    color: "#495057",
    fontSize: "12px",
    padding: "2px 6px",
    borderRadius: "4px",
  };

  const contentAreaStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#f8f9fa",
    minWidth: 0, // Allow flex item to shrink below content size
  };

  const headerStyle = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #dee2e6",
    padding: "12px 24px",
  };

  const headerContentStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const userTextStyle = {
    fontSize: "12px",
  };

  const userEmailStyle = {
    fontWeight: 500,
    color: "#212529",
  };

  const userStatusStyle = {
    color: "#6c757d",
  };

  const composeButtonStyle = {
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "14px",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  };

  const emailContentHeaderStyle = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #dee2e6",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const emailSubjectStyle = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#212529",
  };

  const emailActionsStyle = {
    display: "flex",
    gap: "8px",
  };

  const actionButtonStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f8f9fa",
    color: "#6c757d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const emailThreadStyle = {
    flex: 1,
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    padding: "24px",
    width: "100%",
    maxWidth: "100%",
  };

  const emailMessageStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflowWrap: "break-word" as const,
    wordBreak: "break-word" as const,
    whiteSpace: "normal" as const,
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  };

  const messageHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  };

  const messageInfoStyle = {
    flex: 1,
  };

  const senderInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
    flexWrap: "wrap" as const,
    maxWidth: "100%",
  };

  const senderNameStyle = {
    fontWeight: 600,
    color: "#212529",
    fontSize: "14px",
  };

  const senderEmailStyle = {
    color: "#6c757d",
    fontSize: "14px",
    overflowWrap: "break-word" as const,
    wordBreak: "break-all" as const,
    maxWidth: "100%",
  };

  const recipientInfoStyle = {
    fontSize: "12px",
    color: "#6c757d",
    marginBottom: "8px",
  };

  const timestampStyle = {
    fontSize: "12px",
    color: "#6c757d",
    textAlign: "right" as const,
  };

  const tagStyle2 = (type: string) => ({
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "12px",
    fontWeight: 500,
    backgroundColor: type === "automated" ? "#e3f2fd" : "#fff3e0",
    color: type === "automated" ? "#1976d2" : "#f57c00",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
  });

  const messageContentStyle = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#212529",
    whiteSpace: "pre-wrap" as const,
  };

  const signatureStyle = {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e9ecef",
  };

  const signatureNameStyle = {
    fontWeight: 600,
    color: "#212529",
    fontSize: "14px",
    marginBottom: "2px",
  };

  const signatureTitleStyle = {
    color: "#6c757d",
    fontSize: "12px",
    marginBottom: "2px",
  };

  const signatureContactStyle = {
    color: "#6c757d",
    fontSize: "12px",
    marginBottom: "8px",
  };

  const logoStyle = {
    width: "24px",
    height: "24px",
    backgroundColor: "#000000",
    color: "#ffffff",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  };

  const emptyStateStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  };

  const emptyStateContentStyle = {
    textAlign: "center" as const,
  };

  const emptyStateIconStyle = {
    color: "#6c757d",
    marginBottom: "16px",
    width: "48px",
    height: "48px",
    margin: "16px auto",
    borderRadius: "50%",
    backgroundColor: "#E9EAEB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "35px",
  };

  const emptyStateTitleStyle = {
    fontSize: "16px",
    fontWeight: 500,
    color: "#212529",
    marginBottom: "8px",
  };

  const emptyStateTextStyle = {
    fontSize: "14px",
    color: "#6c757d",
  };

  const loadingStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#ffffff",
  };

  const loadingContentStyle = {
    textAlign: "center" as const,
  };

  const loadingSpinnerStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  };

  const gmailIntegrationStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#ffffff",
  };

  const gmailIntegrationContentStyle = {
    textAlign: "center" as const,
    maxWidth: "400px",
    padding: "40px 20px",
  };

  const gmailIntegrationIconStyle = {
    fontSize: "64px",
    color: "#ea4335",
    marginBottom: "24px",
  };

  const gmailIntegrationTitleStyle = {
    fontSize: "24px",
    fontWeight: 600,
    color: "#212529",
    marginBottom: "16px",
  };

  const gmailIntegrationTextStyle = {
    fontSize: "16px",
    color: "#6c757d",
    marginBottom: "32px",
    lineHeight: "1.5",
  };

  const replyButtonStyle = {
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
    marginTop: "16px",
  };

  const selectedEmailData = emailThreads.find(
    (email) => email.id === selectedEmail
  );

  // Show loading state
  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={loadingContentStyle}>
          <div style={loadingSpinnerStyle}></div>
          <h3 style={{ color: "#212529", marginBottom: "8px" }}>
            Loading Email Module
          </h3>
          <p style={{ color: "#6c757d" }}>Checking Gmail integration...</p>
        </div>
      </div>
    );
  }

  // Show Gmail integration prompt if no token found
  if (!hasGmailToken) {
    return (
      <div style={gmailIntegrationStyle}>
        <div style={gmailIntegrationContentStyle}>
          <i className="la la-envelope" style={gmailIntegrationIconStyle}></i>
          <h2 style={gmailIntegrationTitleStyle}>Gmail Integration Required</h2>
          <p style={gmailIntegrationTextStyle}>
            To access your emails, you need to enable Gmail integration. This
            allows us to securely connect to your Gmail account and display your
            emails.
          </p>
          <button
            className="btn btn-default"
            onClick={handleEnableGmailIntegration}
            disabled={isEnablingGmail}
          >
            {isEnablingGmail ? (
              <>
                <i
                  className="la la-spinner la-spin"
                  style={{ marginRight: "8px" }}
                ></i>
                Enabling...
              </>
            ) : (
              "Enable Gmail Integration"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="email-module" style={containerStyle}>
      {/* Left Sidebar - Email Navigation and List */}
      <div style={sidebarStyle}>
        {/* Primary Navigation Tabs */}
        <div style={tabContainerStyle}>
          <button
            onClick={() => setSelectedTab("inbox")}
            style={tabButtonStyle(selectedTab === "inbox")}
          >
            Inbox
            {inboxStats.unread > 0 && (
              <span style={badgeStyle}>{inboxStats.unread}</span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab("sent")}
            style={tabButtonStyle(selectedTab === "sent")}
          >
            Sent
          </button>
          <button
            onClick={() => setSelectedTab("drafts")}
            style={tabButtonStyle(selectedTab === "drafts")}
          >
            Drafts
            <span style={badgeStyle}>1</span>
          </button>
        </div>

        {/* Inbox Summary */}
        <div style={summaryStyle}>
          <div style={summaryContentStyle}>
            <span style={unreadBadgeStyle}>{inboxStats.unread} unread</span>
            <span>{inboxStats.total} total</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg
                style={{ width: "12px", height: "12px" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              {inboxStats.automated} automated
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg
                style={{ width: "12px", height: "12px" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {inboxStats.direct} direct
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={searchContainerStyle}>
          <div style={{ position: "relative" }}>
            <svg
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "16px",
                height: "16px",
                color: "#6c757d",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search emails"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div style={filterContainerStyle}>
          <div style={{ display: "flex", gap: "8px" }}>
            <select style={filterSelectStyle}>
              <option>Related Job</option>
            </select>
            <select style={filterSelectStyle}>
              <option>All Stages</option>
            </select>
            <select style={{ ...filterSelectStyle, marginRight: 0 }}>
              <option>All Emails</option>
            </select>
          </div>
        </div>

        {/* Email List */}
        <div style={emailListStyle}>
          {isLoadingEmails ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}
            >
              <i
                className="la la-spinner la-spin la-2x"
                style={{ marginBottom: "8px" }}
              ></i>
              <div>Loading emails...</div>
            </div>
          ) : emailThreads.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}
            >
              <i
                className="la la-inbox la-2x"
                style={{ marginBottom: "8px" }}
              ></i>
              <div>No emails found</div>
            </div>
          ) : (
            emailThreads.map((email: any) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email.id)}
                style={emailItemStyle(selectedEmail === email.id)}
              >
                <div style={emailContentStyle}>
                  <AvatarImage
                    src={email.avatar}
                    className="rounded-circle"
                    alt={email.name}
                    style={{ width: "32px", height: "32px" }}
                  />
                  <div style={emailInfoStyle}>
                    <div style={emailHeaderStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={emailNameStyle}>{email.name}</span>
                        {email.isNew && <span style={newBadgeStyle}>New</span>}
                      </div>
                      <span style={timeStyle}>{email.timeAgo}</span>
                    </div>
                    <div style={roleStyle}>{email.role}</div>
                    <div style={subjectStyle}>• {email.subject}</div>
                    <div style={snippetStyle}>{email.snippet}</div>
                    <div style={tagsContainerStyle}>
                      <span style={tagStyle}>{email.stage}</span>
                      <span style={tagStyle}>
                        {email.messageCount} messages
                      </span>
                      {email.hasAttachment && (
                        <span style={tagStyle}>1 attachment</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content Area - Email Viewer */}
      <div style={contentAreaStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerContentStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                style={{
                  padding: "6px",
                  color: "#6c757d",
                  border: "none",
                  backgroundColor: "transparent",
                }}
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={userInfoStyle}>
                {user?.image && (
                  <AvatarImage
                    src={user?.image}
                    className="rounded-circle"
                    alt={user?.name}
                    style={{ width: "24px", height: "24px" }}
                  />
                )}
                <div style={userTextStyle}>
                  <div style={userEmailStyle}>{user?.email}</div>
                  <div style={userStatusStyle}>
                    Gmail | Last sync: 2 minutes ago
                  </div>
                </div>
              </div>
              <button
                style={composeButtonStyle}
                onClick={() => setIsComposeOpen(true)}
              >
                <svg
                  style={{ width: "12px", height: "12px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Compose
              </button>
            </div>
          </div>
        </div>

        {/* Email Content Area */}
        {selectedEmailData ? (
          <>
            {/* Email Content Header */}
            <div style={emailContentHeaderStyle}>
              <div style={emailSubjectStyle}>
                {selectedEmailData.emailContent.subject}
              </div>
              <div style={emailActionsStyle}>
                <button style={actionButtonStyle}>
                  <svg
                    style={{ width: "16px", height: "16px" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                </button>
                <button style={actionButtonStyle}>
                  <svg
                    style={{ width: "16px", height: "16px" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Email Thread */}
            <div style={emailThreadStyle}>
              {selectedEmailData.emailContent.messages.map((message: any) => (
                <div key={message.id} style={emailMessageStyle}>
                  <div style={messageHeaderStyle}>
                    <AvatarImage
                      src={message.sender.avatar}
                      className="rounded-circle"
                      alt={message.sender.name}
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div style={messageInfoStyle}>
                      <div style={senderInfoStyle}>
                        <span style={senderNameStyle}>
                          {message.sender.name}
                        </span>
                        <span style={senderEmailStyle}>
                          &lt;{message.sender.email}&gt;
                        </span>
                      </div>
                      <div style={recipientInfoStyle}>
                        to {message.recipient.name} &lt;
                        {message.recipient.email}&gt;
                      </div>
                      <div style={timestampStyle}>
                        {message.timestamp}
                        <div style={tagStyle2(message.type)}>
                          {message.type === "automated" ? (
                            <>
                              <svg
                                style={{ width: "10px", height: "10px" }}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Automated
                            </>
                          ) : (
                            <>
                              <svg
                                style={{ width: "10px", height: "10px" }}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Direct
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={messageContentStyle}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  ></div>
                  {message.signature && (
                    <div style={signatureStyle}>
                      <div style={signatureNameStyle}>
                        {message.signature.name}
                      </div>
                      <div style={signatureTitleStyle}>
                        {message.signature.title}
                      </div>
                      <div style={signatureContactStyle}>
                        {message.signature.contact}
                      </div>
                      {message.signature.logo && (
                        <div style={logoStyle}>{message.signature.logo}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Reply Button */}
              <div style={{ padding: "0 24px 24px" }}>
                <button
                  style={replyButtonStyle}
                  onClick={() => handleReply(selectedEmailData)}
                >
                  <i className="la la-reply"></i>
                  Reply
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={emptyStateStyle}>
            <div style={emptyStateContentStyle}>
              <div style={emptyStateIconStyle}>
                <i className="la la-envelope la-3x"></i>
              </div>
              <h3 style={emptyStateTitleStyle}>
                Select an email to view the conversation
              </h3>
              <p style={emptyStateTextStyle}>
                Choose an email from the inbox to read the full conversation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      <ComposeEmailModule
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setComposeData(null);
        }}
        replyData={composeData}
      />
    </div>
  );
}
