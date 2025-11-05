"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function CandidateHistory({ candidate, setShowCandidateHistory }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [interviewLogs, setInterviewLogs] = useState([]);

    useEffect(() => {
        const fetchInterviewLogs = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/api/get-interview-history?interviewUID=${candidate._id}`);
                setInterviewLogs(response.data);
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to fetch interview history",
                    icon: "error",
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchInterviewLogs();
    }, [candidate._id])

    const getLogDescription = (log: any) => {
        if (log.action === "Direct Link Promotion") {
            return `This candidate entered the ${log.toStage} stage from direct interview link.`;
        }

        if (log.action === "Cancelled") {
            const reason = candidate.selectedReason === "Others" ? candidate.cancelReason : candidate.selectedReason;
            return `${log.action} the application at ${log.fromStage} stage for this following reason: ${reason || "No reason provided"}`
        }
        return `${log.action} ${candidate.name} from ${log.fromStage}` + (log.toStage ? ` to ${log.toStage}` : "");
    }
    return (
        <div
        className="modal show fade-in-bottom"
        style={{
          display: "block",
          background: "rgba(0,0,0,0.45)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1050,
        }}
        >
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
        }}>
            <div className="modal-content" style={{ overflowY: "auto", maxHeight: "80vh", maxWidth: "80vw", background: "#fff", border: `1.5px solid #E9EAEB`, borderRadius: 14, boxShadow: "0 8px 32px rgba(30,32,60,0.18)" }}>
                <div className="modal-header">
                    <h3 className="modal-title">Candidate History</h3>
                    <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setShowCandidateHistory(false)}>
                        <i className="la la-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {isLoading ? 
                        Array.from({length: 3}).map((_, index) => (
                            <div key={index} className="mb-3" style={{ marginTop: 16 }}>
                                <div className="skeleton-bar" style={{ width: "100%", height: "20px" }}></div>
                            </div>
                        )) : interviewLogs.length > 0 ?
                            <div className="table-responsive" style={{ height: "100%" }}>
                                                  <table className="table align-items-center table-flush" style={{ border: "1px solid #E9EAEB", borderRadius: 8 }}>
                            <thead className="thead-light">
                                <tr>
                                <th scope="col" className="sort" data-sort="name" style={{ textTransform: "none", fontWeight: 550 }}>
                                    Admin/Candidate
                                </th>
                                <th scope="col" className="sort" data-sort="description" style={{ textTransform: "none", fontWeight: 550 }}>
                                    Description
                                </th>
                                <th scope="col" className="sort" data-sort="date-of-action" style={{ textTransform: "none", fontWeight: 550 }}>
                                    Date of Action
                                </th> 
                                </tr>
                            </thead>
                            <tbody>
                                {interviewLogs.map((log: any) => (
                                    <tr key={log._id}>
                                        <td>{log.updatedBy?.name || "N/A"}</td>
                                        <td style={{ whiteSpace: "pre-wrap" }}>{getLogDescription(log)}</td>
                                        <td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                            </div>
                     : <div style={{ display: "flex", justifyContent: "center"}}>
                        <h3 style={{ color: "#787486" }}>No Candidate History Found</h3>
                        </div>}
                </div>
            </div>
        </div>
    </div>
    )
}