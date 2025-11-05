"use client"
import moment from "moment";
import Swal from "sweetalert2";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { getStage } from "@/lib/Utils";

export default function RetakeInterviewRequestV2({ interviewDetails }: { interviewDetails: any }) {
    const { user } = useAppContext();
    async function processRequest(action) {
        Swal.fire({
          title: "Are you sure you want to " + action + " this request?",
          text:
            "Confirm that you want to " +
            action +
            " this request. You will not be able to revert this action.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, " + action + " it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Processing Request...",
              text: "Please wait while we process the request.",
              icon: "info",
              allowOutsideClick: false,
              showConfirmButton: false,
              showCancelButton: false,
              showCloseButton: false,
            });
    
            Swal.showLoading();
    
            if (action == "approve") {
              // reset interview data
    
              await axios.post("/api/reset-interview-data", {
                id: interviewDetails._id,
              });
    
              await axios.post("/api/update-interview", {
                uid: interviewDetails._id,
                data: {
                  retakeRequest: {
                    status: "Approved",
                    updatedAt: Date.now(),
                    approvedBy: {
                      image: user.image,
                      name: user.name,
                      email: user.email,
                    },
                  },
                },
                interviewTransaction: {
                  interviewUID: interviewDetails._id,
                  fromStage: getStage(interviewDetails),
                  toStage: "Pending AI Interview",
                  action: "Endorsed",
                  updatedBy: {
                      image: user?.image,
                      name: user?.name,
                      email: user?.email,
                  },
                },
              });
    
              Swal.fire({
                title: "Request Approved",
                text: "The request has been approved.",
                icon: "success",
                allowOutsideClick: false,
              }).then(() => {
                setTimeout(() => {
                  window.location.href = "/recruiter-dashboard/careers";
                }, 400);
              });
            }
    
            if (action == "reject") {
              await axios.post("/api/update-interview", {
                uid: interviewDetails._id,
                data: {
                  retakeRequest: {
                    status: "Rejected",
                    updatedAt: Date.now(),
                    approvedBy: {
                      image: user.image,
                      name: user.name,
                      email: user.email,
                    },
                  },
                },
              });
    
              Swal.fire({
                title: "Request Rejected",
                text: "The request has been rejected.",
                icon: "success",
                allowOutsideClick: false,
              }).then(() => {
                setTimeout(() => {
                  window.location.href = "/recruiter-dashboard/careers";
                }, 400);
              });
            }
          }
        });
      }
    return (
        <div className="layered-card-middle" style={{ backgroundColor: "#181D27" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, backgroundColor: "#FEF0C7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="la la-exclamation-triangle" style={{ color: "#DC6803", fontSize: 20 }}></i>
            </div>
                <span style={{fontSize: 16, color: "#FFFFFF", fontWeight: 700}}>Retake Interview Request</span>
            </div>
            <div className="layered-card-content">
                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>The candidate has requested a retake of the interview.</span>
                <span>Reason: {interviewDetails?.retakeRequest?.reason || interviewDetails?.retakeRequest || "No reason provided"}</span>
                <span>Request submitted on: {moment(interviewDetails?.retakeRequest?.createdAt).format("MMM D, YYYY | hh:mm:ss A")}</span>

                {user && <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                  <button style={{ width: "fit-content", color: "#B42318", background: "#fff", border: "1px solid #B42318", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                      processRequest("reject");
                      }}>
                          Reject
                  </button>
                  <button style={{ width: "fit-content", background: "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    processRequest("approve");
                  }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Approve
                  </button>
                </div>}
            </div>
        </div>
    )
}