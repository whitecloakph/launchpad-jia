import moment from "moment";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import { getStage } from "@/lib/Utils";

export default function RetakeInterviewRequest({ data }) {
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
            id: data._id,
          });

          await axios.post("/api/update-interview", {
            uid: data._id,
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
              interviewUID: data._id,
              fromStage: getStage(data),
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
              window.location.href = "/dashboard";
            }, 400);
          });
        }

        if (action == "reject") {
          await axios.post("/api/update-interview", {
            uid: data._id,
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
              window.location.href = "/dashboard";
            }, 400);
          });
        }
      }
    });
  }

  return (
    <>
      {data && (
        <div className="card shadow-1">
          <div className="card-header">
            <h3 className="mb-0 mr-auto">
              <i className="la la-file-text text-primary mr-2" /> [Important]
              Retake Interview Request
            </h3>
          </div>
          <div className="card-body">
            <h2>
              <i className="la la-exclamation-circle text-primary" /> The
              applicant has requested a retake of the interview.
            </h2>
            <strong>Reason: {data?.retakeRequest?.reason}</strong>
            <strong>
              Request submitted on:{" "}
              {moment(data?.retakeRequest?.createdAt).format(
                "MMM D, YYYY | hh:mm:ss A"
              )}
            </strong>
          </div>

          {user && (
            <div className="card-basebar">
              <div className="btn-set ml-auto">
                <button
                  className="btn btn-primary"
                  onClick={() => processRequest("approve")}
                >
                  <i className="la la-check" /> Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => processRequest("reject")}
                >
                  <i className="la la-times" /> Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
