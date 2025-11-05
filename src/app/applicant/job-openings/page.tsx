"use client";
import React, { useEffect, useState } from "react";
import JobOpeningsTable from "@/lib/components/DataTables/JobOpeningsTable";
import TableLoader from "@/lib/Loader/TableLoader";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function () {
  const [isCVAvailable, setIsCVAvailable] = useState(false);

  useEffect(() => {
    const data = localStorage.isCVAvailable;

    if (data) {
      toast.dismiss();
      const parsedData = JSON.parse(data);

      if (parsedData) {
        setIsCVAvailable(true);
      } else {
        Swal.fire({
          icon: "warning",
          title: "CV Required",
          text: "Please upload your CV to start applying for jobs",
          confirmButtonText: "Upload CV Now",
          showCancelButton: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/applicant/manage-cv";
          }
        });
        setIsCVAvailable(false);
      }
    }

    if (!data) {
      Swal.fire({
        icon: "warning",
        title: "CV Required",
        text: "Please upload your CV to start applying for jobs.",
        confirmButtonText: "Upload CV Now",
        showCancelButton: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/applicant/manage-cv";
        }
      });
      setIsCVAvailable(false);
    }
  }, []);

  return isCVAvailable ? (
    <JobOpeningsTable />
  ) : (
    <div className="container-fluid mt--6">
      <div className="card shadow-1">
        <div className="card-header border-0">
          <h3 className="mb-0 mr-auto">
            <i className="la la-list text-primary mr-2" /> Job Openings
          </h3>
          <div className="table-search">
            <div className="icon mr-2">
              <i className="la la-search"></i>
            </div>
            <input
              type="search"
              className="form-control ml-auto search-input"
              placeholder="Search..."
              disabled
            />
          </div>
        </div>
        <TableLoader type="job-openings" />
      </div>
      <br />
      <br />
    </div>
  );
}
