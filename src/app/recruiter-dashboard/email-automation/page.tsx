"use client";

import React, { useEffect, useState } from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast, successToast } from "@/lib/Utils";
import Fuse from "fuse.js";
import axios from "axios";
import moment from "moment";

interface AutomationData {
  _id: string;
  email: string;
  name?: string;
  jobTitle: string;
  status: string;
  reminderType: string;
  lastAutoReminder?: Date;
  [key: string]: any;
}

interface PastReminderData {
  _id: string;
  email: string;
  name?: string;
  jobTitle: string;
  status: string;
  lastAutoReminder: Date;
  timeSinceReminder: string;
  daysSinceReminder: number;
  [key: string]: any;
}

export default function EmailAutomation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "pending";
  const { orgID } = useAppContext();

  // State variables
  const [data, setData] = useState<AutomationData[]>([]);
  const [pastRemindersData, setPastRemindersData] = useState<
    PastReminderData[]
  >([]);
  const [filteredData, setFilteredData] = useState<AutomationData[]>([]);
  const [filteredPastData, setFilteredPastData] = useState<PastReminderData[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pastSearchQuery, setPastSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPastLoading, setIsPastLoading] = useState(false);
  const [automationProgress, setAutomationProgress] = useState(0);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [processedRows, setProcessedRows] = useState<Set<string>>(new Set());
  const [errorRows, setErrorRows] = useState<Set<string>>(new Set());
  const [sendingIndividual, setSendingIndividual] = useState<Set<string>>(
    new Set()
  );
  const [fuse, setFuse] = useState<Fuse<AutomationData> | null>(null);
  const [pastFuse, setPastFuse] = useState<Fuse<PastReminderData> | null>(null);
  const [selectedInterview, setSelectedInterview] =
    useState<PastReminderData | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Step 1: Fetch data on load
  useEffect(() => {
    if (orgID) {
      if (tab === "pending") {
        fetchData();
      } else if (tab === "past") {
        fetchPastRemindersData();
      }
    }
  }, [orgID, tab]);

  // Step 2: Initialize Fuse.js for search
  useEffect(() => {
    if (data.length > 0) {
      const fuseOptions = {
        keys: ["email", "name", "jobTitle", "status", "reminderType"],
        threshold: 0.3,
        includeScore: true,
      };
      const fuseInstance = new Fuse(data, fuseOptions);
      setFuse(fuseInstance);
      setFilteredData(data);
    }
  }, [data]);

  useEffect(() => {
    if (pastRemindersData.length > 0) {
      const fuseOptions = {
        keys: ["email", "name", "jobTitle", "status"],
        threshold: 0.3,
        includeScore: true,
      };
      const fuseInstance = new Fuse(pastRemindersData, fuseOptions);
      setPastFuse(fuseInstance);
      setFilteredPastData(pastRemindersData);
    }
  }, [pastRemindersData]);

  // Step 3: Handle search
  useEffect(() => {
    if (fuse && searchQuery.trim() === "") {
      setFilteredData(data);
    } else if (fuse && searchQuery.trim() !== "") {
      const results = fuse.search(searchQuery);
      const filtered = results.map((result) => result.item);
      setFilteredData(filtered);
    }
  }, [searchQuery, fuse, data]);

  useEffect(() => {
    if (pastFuse && pastSearchQuery.trim() === "") {
      setFilteredPastData(pastRemindersData);
    } else if (pastFuse && pastSearchQuery.trim() !== "") {
      const results = pastFuse.search(pastSearchQuery);
      const filtered = results.map((result) => result.item);
      setFilteredPastData(filtered);
    }
  }, [pastSearchQuery, pastFuse, pastRemindersData]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/automations/fetch-wc-no-cvs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgID }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        errorToast("Failed to fetch data", 1300);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      errorToast("Error fetching data", 1300);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPastRemindersData = async () => {
    try {
      setIsPastLoading(true);

      const response = await fetch("/api/automations/fetch-past-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgID }),
      });

      const result = await response.json();

      if (result.success) {
        setPastRemindersData(result.data);
      } else {
        errorToast("Failed to fetch past reminders data", 1300);
      }
    } catch (error) {
      console.error("Error fetching past reminders data:", error);
      errorToast("Error fetching past reminders data", 1300);
    } finally {
      setIsPastLoading(false);
    }
  };

  const sendIndividualReminder = async (interviewId: string) => {
    try {
      setSendingIndividual((prev) => new Set(prev).add(interviewId));

      const response = await fetch("/api/automations/send-single-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interviewId }),
      });

      const result = await response.json();

      if (result.success) {
        successToast("Reminder sent successfully!", 1300);
        // Update the row to show as processed
        setProcessedRows((prev) => new Set(prev).add(interviewId));
        // Refresh data to update lastAutoReminder
        if (tab === "pending") {
          fetchData();
        } else {
          fetchPastRemindersData();
        }
      } else {
        errorToast("Failed to send reminder", 1300);
        setErrorRows((prev) => new Set(prev).add(interviewId));
      }
    } catch (error) {
      console.error("Error sending individual reminder:", error);
      errorToast("Error sending reminder", 1300);
      setErrorRows((prev) => new Set(prev).add(interviewId));
    } finally {
      setSendingIndividual((prev) => {
        const newSet = new Set(prev);
        newSet.delete(interviewId);
        return newSet;
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        successToast("Copied to clipboard!", 1000);
      })
      .catch(() => {
        errorToast("Failed to copy to clipboard", 1000);
      });
  };

  const showInterviewDetails = (interview: PastReminderData) => {
    setSelectedInterview(interview);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInterview(null);
  };

  const runAutomation = async () => {
    if (filteredData.length === 0) {
      errorToast("No data to process", 1300);
      return;
    }

    setIsAutomationRunning(true);
    setAutomationProgress(0);
    setProcessedRows(new Set());
    setErrorRows(new Set());

    const totalItems = filteredData.length;
    const processedSet = new Set<string>();
    const errorSet = new Set<string>();
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < totalItems; i++) {
      const item = filteredData[i];

      let emailContent = "";
      let emailSubject = "";

      if (item.reminderType === "Remind to Submit CV") {
        emailSubject = `[Jia] Reminder to Submit CV for ${
          item.jobTitle
        } role at WhiteCloak Technologies - ${moment().format("MMMM D, YYYY")}`;
        emailContent = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">

<head>
	<meta charset="utf-8">
	<meta name="x-apple-disable-message-reformatting">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Application Follow-up</title>
</head>

<body style="margin:0;padding:0;background-color:#f6f7f9;">
	<center style="width:100%;background:#f6f7f9;">
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%"
			style="max-width:640px;margin:0 auto;background:#ffffff;">

			<!-- Logo -->
			<tr>
				<td style="text-align:center;padding:28px 0 10px;">
					<img src="https://www.hellojia.ai/jia-new-logo.png" alt="Company Logo" width="80" style="display:block;margin:0 auto;max-width:120px;">
          </td>
			</tr>

			<!-- Body -->
			<tr>
				<td
					style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:16px;line-height:1.6;">
					<p style="margin:0 0 16px;">Hi ${item.name},</p>

					<p style="margin:0 0 24px;">
						Thank you for applying for the <strong>${item.jobTitle}</strong> role at
						<strong>WhiteCloak Technologies</strong>.
						Please submit your CV via the button below at your earliest convenience. We are looking forward
						to your submission.
					</p>

					<!-- Button -->
					<p style="text-align:center;margin:24px 0;">
						<a href="https://www.hellojia.ai/whitecloak/applicant" target="_blank" style="background-color:#2563eb;color:#ffffff;text-decoration:none;
                        padding:12px 28px;border-radius:6px;font-size:16px;
                        font-family:Arial,Helvetica,sans-serif;display:inline-block;">
							Submit Your CV
						</a>
					</p>

					<p style="margin:32px 0 4px;">Best Regards,</p>
					<p style="margin:0;">WhiteCloak Technologies Recruiting Team</p>
				</td>
			</tr>

			<!-- Divider -->
			<tr>
				<td style="height:1px;background:#e5e7eb;"></td>
			</tr>

			<!-- Fallback URL -->
			<tr>
				<td
					style="padding:14px 28px;font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;line-height:1.4;">
					If the button above doesn't work, copy and paste this URL into your browser:
					<br>
					<span style="word-break:break-all;">https://www.hellojia.ai/whitecloak/applicant</span>
				</td>
			</tr>
		</table>
	</center>
</body>

</html>
        `;
      }

      if (emailContent && emailSubject) {
        try {
          // Send email with _id parameter
          const response = await axios.post(
            "/api/automations/send-email-reminder",
            {
              to: item.email,
              subject: emailSubject,
              message: emailContent,
              _id: item._id,
            }
          );

          if (response.data.success) {
            // Success - mark as processed with green background
            processedSet.add(item._id);
            setProcessedRows(new Set(processedSet));
            successCount++;
          } else {
            // Error - mark as error with salmon background
            errorSet.add(item._id);
            setErrorRows(new Set(errorSet));
            errorCount++;
          }
        } catch (error) {
          // Error - mark as error with salmon background
          errorSet.add(item._id);
          setErrorRows(new Set(errorSet));
          errorCount++;
          console.error(`Error sending email to ${item.email}:`, error);
        }

        // Update progress
        const progress = ((i + 1) / totalItems) * 100;
        setAutomationProgress(progress);

        // 350ms delay for each iteration
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    setIsAutomationRunning(false);
    setAutomationProgress(100);

    // Show SweetAlert with summary
    const { default: Swal } = await import("sweetalert2");
    Swal.fire({
      title: "Automation Complete!",
      html: `
        <div style="text-align: left;">
          <p><strong>Total Processed:</strong> ${totalItems}</p>
          <p style="color: #28a745;"><strong>Successful:</strong> ${successCount}</p>
          <p style="color: #dc3545;"><strong>Failed:</strong> ${errorCount}</p>
        </div>
      `,
      icon: errorCount > 0 ? "warning" : "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#000",
    });
  };

  const getRowBackgroundColor = (itemId: string) => {
    if (processedRows.has(itemId)) {
      return "bg-success text-white"; // Green background for successful rows
    }
    if (errorRows.has(itemId)) {
      return "bg-danger text-white"; // Red background for error rows
    }
    return "";
  };

  return (
    <>
      <HeaderBar
        activeLink="Email Automation [Beta]"
        currentPage="Overview"
        icon="la la-cubes"
      />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row">
          <div className="col">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginBottom: "35px",
              }}
            >
              <h1
                style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}
              >
                Email Automation [Beta]
              </h1>
              <span
                style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}
              >
                Global Implementation of Automated Email Reminders for
                Applicants for (WhiteCloak Org Only).
              </span>
            </div>

            {/* Tabs */}
            <div className="row mb-4">
              <div className="col">
                <div
                  className="d-flex"
                  style={{ borderBottom: "2px solid #e9ecef" }}
                >
                  <div
                    className={`px-4 py-3 ${
                      tab === "pending" ? "active-tab" : ""
                    }`}
                    onClick={() =>
                      router.push(
                        `/recruiter-dashboard/email-automation?tab=pending`
                      )
                    }
                    style={{
                      cursor: "pointer",
                      backgroundColor: "white",
                      flexShrink: 0,
                      borderBottom:
                        tab === "pending"
                          ? "5px solid #000"
                          : "2px solid transparent",
                      fontWeight: tab === "pending" ? "600" : "400",
                      color: tab === "pending" ? "#000" : "#6c757d",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Pending Reminders
                  </div>
                  <div
                    className={`px-4 py-3 ${
                      tab === "past" ? "active-tab" : ""
                    }`}
                    onClick={() =>
                      router.push(
                        `/recruiter-dashboard/email-automation?tab=past`
                      )
                    }
                    style={{
                      cursor: "pointer",
                      backgroundColor: "white",
                      flexShrink: 0,
                      borderBottom:
                        tab === "past"
                          ? "5px solid #000"
                          : "2px solid transparent",
                      fontWeight: tab === "past" ? "600" : "400",
                      color: tab === "past" ? "#000" : "#6c757d",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Past Reminders
                  </div>
                </div>
              </div>
            </div>

            {tab === "pending" && (
              <>
                {/* Search Bar */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="la la-search"></i>
                          </span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by email, name, job title, status..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ paddingLeft: "15px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <span className="text-muted">
                      {filteredData.length} of {data.length} records
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {isAutomationRunning && (
                  <div className="row mb-4">
                    <div className="col">
                      <div className="card">
                        <div className="card-body">
                          <h2
                            className="card-title"
                            style={{
                              fontWeight: 500,
                              color: "#000",
                              marginBottom: "0px",
                            }}
                          >
                            Automation Progress:{" "}
                            {Math.round(automationProgress)}%
                          </h2>
                          <div className="progress">
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${automationProgress}%` }}
                              aria-valuenow={automationProgress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Send Reminders Button */}
                <div className="row mb-4">
                  <div className="col">
                    <button
                      className="btn"
                      onClick={runAutomation}
                      disabled={
                        isAutomationRunning || filteredData.length === 0
                      }
                      style={{
                        backgroundColor: "#000",
                        borderColor: "#000",
                        borderRadius: "30px",
                        color: "#fff",
                      }}
                    >
                      {isAutomationRunning ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm mr-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Running Automation...
                        </>
                      ) : (
                        <>
                          <i className="la la-paper-plane mr-2"></i>
                          Send Reminders ({filteredData.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="row">
                  <div className="col">
                    <div className="card">
                      <div className="card-header">
                        <h3 className="mb-0">Pending Reminders</h3>
                      </div>
                      <div className="card-body">
                        {isLoading ? (
                          <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-2">Loading data...</p>
                          </div>
                        ) : filteredData.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-muted">No data found</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Email
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Name
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Job Title
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Status
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Reminder Type
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Last Reminder
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredData.map((item) => (
                                  <tr
                                    key={item._id}
                                    className={getRowBackgroundColor(item._id)}
                                  >
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.email}
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.name || "-"}
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.jobTitle}
                                    </td>
                                    <td>
                                      <span className="badge badge-warning">
                                        {item.status}
                                      </span>
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.reminderType}
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.lastAutoReminder
                                        ? moment(
                                            item.lastAutoReminder
                                          ).fromNow()
                                        : "Never"}
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() =>
                                          sendIndividualReminder(item._id)
                                        }
                                        disabled={sendingIndividual.has(
                                          item._id
                                        )}
                                        style={{ fontSize: "12px" }}
                                      >
                                        {sendingIndividual.has(item._id) ? (
                                          <>
                                            <span
                                              className="spinner-border spinner-border-sm mr-1"
                                              role="status"
                                              aria-hidden="true"
                                            ></span>
                                            Sending...
                                          </>
                                        ) : (
                                          "Send Reminder"
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "past" && (
              <>
                {/* Search Bar for Past Reminders */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-group">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="la la-search"></i>
                          </span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by email, name, job title, status..."
                          value={pastSearchQuery}
                          onChange={(e) => setPastSearchQuery(e.target.value)}
                          style={{ paddingLeft: "15px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <span className="text-muted">
                      {filteredPastData.length} of {pastRemindersData.length}{" "}
                      records
                    </span>
                  </div>
                </div>

                {/* Past Reminders Table */}
                <div className="row">
                  <div className="col">
                    <div className="card">
                      <div className="card-header">
                        <h3 className="mb-0">Past Reminders</h3>
                      </div>
                      <div className="card-body">
                        {isPastLoading ? (
                          <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-2">Loading data...</p>
                          </div>
                        ) : filteredPastData.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-muted">
                              No past reminders found
                            </p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Email
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Name
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Job Title
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Status
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Last Reminder
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Time Since
                                  </th>
                                  <th
                                    style={{ fontWeight: 500, color: "#000" }}
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredPastData.map((item) => (
                                  <tr key={item._id}>
                                    <td
                                      style={{
                                        fontWeight: 500,
                                        color: "#000",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        copyToClipboard(item.email)
                                      }
                                      title="Click to copy email"
                                    >
                                      {item.email}
                                    </td>
                                    <td
                                      style={{
                                        fontWeight: 500,
                                        color: "#000",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        copyToClipboard(item.name || "")
                                      }
                                      title="Click to copy name"
                                    >
                                      {item.name || "-"}
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.jobTitle}
                                    </td>
                                    <td>
                                      <span className="badge badge-warning">
                                        {item.status}
                                      </span>
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {moment(item.lastAutoReminder).format(
                                        "MMM DD, YYYY HH:mm"
                                      )}
                                    </td>
                                    <td
                                      style={{ fontWeight: 500, color: "#000" }}
                                    >
                                      {item.timeSinceReminder}
                                    </td>
                                    <td>
                                      <div className="btn-group" role="group">
                                        <button
                                          className="btn btn-sm btn-outline-primary mr-2"
                                          onClick={() =>
                                            sendIndividualReminder(item._id)
                                          }
                                          disabled={sendingIndividual.has(
                                            item._id
                                          )}
                                          style={{ fontSize: "12px" }}
                                        >
                                          {sendingIndividual.has(item._id) ? (
                                            <>
                                              <span
                                                className="spinner-border spinner-border-sm mr-1"
                                                role="status"
                                                aria-hidden="true"
                                              ></span>
                                              Sending...
                                            </>
                                          ) : (
                                            "Send Again"
                                          )}
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() =>
                                            showInterviewDetails(item)
                                          }
                                          style={{ fontSize: "12px" }}
                                        >
                                          <i className="la la-expand"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interview Details Modal */}
      {showModal && selectedInterview && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ maxHeight: "90vh" }}>
              <div className="modal-header">
                <h5 className="modal-title">Interview Details</h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ overflowY: "auto", maxHeight: "calc(90vh - 120px)" }}
              >
                <div className="d-flex flex-column" style={{ gap: "20px" }}>
                  {/* Basic Information Section */}
                  <div>
                    <h6
                      className="mb-3"
                      style={{ fontWeight: 600, color: "#333" }}
                    >
                      Basic Information
                    </h6>
                    <div className="d-flex flex-column" style={{ gap: "12px" }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: "120px",
                            color: "#666",
                          }}
                        >
                          Name:
                        </span>
                        <span style={{ flex: 1, wordBreak: "break-word" }}>
                          {selectedInterview.name || "N/A"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: "120px",
                            color: "#666",
                          }}
                        >
                          Email:
                        </span>
                        <span style={{ flex: 1, wordBreak: "break-all" }}>
                          {selectedInterview.email}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: "120px",
                            color: "#666",
                          }}
                        >
                          Job Title:
                        </span>
                        <span style={{ flex: 1, wordBreak: "break-word" }}>
                          {selectedInterview.jobTitle}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: "120px",
                            color: "#666",
                          }}
                        >
                          Status:
                        </span>
                        <span style={{ flex: 1 }}>
                          <span className="badge badge-warning">
                            {selectedInterview.status}
                          </span>
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: "120px",
                            color: "#666",
                          }}
                        >
                          Last Reminder:
                        </span>
                        <span style={{ flex: 1, wordBreak: "break-word" }}>
                          {moment(selectedInterview.lastAutoReminder).format(
                            "MMM DD, YYYY HH:mm:ss"
                          )}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-start">
                        <span
                          style={{
                            fontWeight: 500,
                            minWidth: "120px",
                            color: "#666",
                          }}
                        >
                          Time Since:
                        </span>
                        <span style={{ flex: 1, wordBreak: "break-word" }}>
                          {selectedInterview.timeSinceReminder}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div>
                    <h6
                      className="mb-3"
                      style={{ fontWeight: 600, color: "#333" }}
                    >
                      Additional Information
                    </h6>
                    <div className="d-flex flex-column" style={{ gap: "12px" }}>
                      {Object.entries(selectedInterview).map(([key, value]) => {
                        // Skip fields we already displayed
                        if (
                          [
                            "_id",
                            "name",
                            "email",
                            "jobTitle",
                            "status",
                            "lastAutoReminder",
                            "timeSinceReminder",
                            "daysSinceReminder",
                          ].includes(key)
                        ) {
                          return null;
                        }

                        // Skip functions and complex objects
                        if (
                          typeof value === "function" ||
                          (typeof value === "object" &&
                            value !== null &&
                            !Array.isArray(value))
                        ) {
                          return null;
                        }

                        const displayValue = Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "boolean"
                          ? value
                            ? "Yes"
                            : "No"
                          : String(value || "N/A");

                        return (
                          <div
                            key={key}
                            className="d-flex justify-content-between align-items-start"
                          >
                            <span
                              style={{
                                fontWeight: 500,
                                minWidth: "120px",
                                color: "#666",
                              }}
                            >
                              {key}:
                            </span>
                            <span style={{ flex: 1, wordBreak: "break-word" }}>
                              {displayValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showModal && (
        <div className="modal-backdrop fade show" onClick={closeModal}></div>
      )}
    </>
  );
}
