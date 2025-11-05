"use client";

import React from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CandidatesTableV2 from "@/lib/components/DataTables/CandidatesTableV2";


export default function () {

  return (
    <>
      <HeaderBar activeLink="Candidates" currentPage="Overview" icon="la la-id-badge" />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row">
          <div className="col">
            <CandidatesTableV2 />
          </div>
        </div>
      </div>
    </>
  );
}