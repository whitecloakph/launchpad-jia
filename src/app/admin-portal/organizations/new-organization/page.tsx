"use client";

import React from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import OrganizationForm from "@/lib/components/AdminComponents/OrganizationForm";

export default function NewOrganizationPage() {
    return (
      <>
        <HeaderBar activeLink="Organizations" currentPage="Add new organization" icon="la la-building" />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
          <div className="row">
            <OrganizationForm formType="add" />
          </div>
        </div>
      </>
    )
}