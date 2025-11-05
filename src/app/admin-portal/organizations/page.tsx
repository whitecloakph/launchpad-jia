"use client";

import React from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import OrganizationsTable from "@/lib/components/DataTables/OrganizationsTable";

export default function () {
  return (
    <>
      <HeaderBar activeLink="Organizations" currentPage="Overview" icon="la la-building" />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row">
          <div className="col">
            <OrganizationsTable />
          </div>
        </div>
      </div>
    </>
  );
}