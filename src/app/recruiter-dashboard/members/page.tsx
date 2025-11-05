"use client";

import React from "react";
import MembersV2Table from "@/lib/components/DataTables/MembersTableV2";
import HeaderBar from "@/lib/PageComponent/HeaderBar";

export default function () {
  return (
    <>
      <HeaderBar activeLink="Members" currentPage="Overview" icon="la la-users" />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row">
          <div className="col">
            <div style={{ marginBottom: "35px"}}>
              <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Members</h1>
            </div>
            <MembersV2Table />
          </div>
        </div>
      </div>
    </>
  );
}