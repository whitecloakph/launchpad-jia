"use client";

import React from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CareerForm from "@/lib/components/CareerComponents/CareerForm";
import CreateCareerFlow from "@/lib/components/CareerComponents/CareerFormComponents/CreateCareerFlow";

export default function NewCareerPage() {
    return (
        <>
        <HeaderBar activeLink="Careers" currentPage="Add new career" icon="la la-suitcase" />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
          <div className="row">
            <CreateCareerFlow formType="add" />
          </div>
        </div>
      </>
    )
}
