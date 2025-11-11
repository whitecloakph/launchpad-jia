"use client";

import React from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CareerFormSegmented from "@/lib/components/CareerComponents/CareerFormSegmented";

export default function NewCareerPage() {
  return (
    <>
      <HeaderBar
        activeLink="Careers"
        currentPage="Add new career"
        icon="la la-suitcase"
      />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row" style={{ marginBottom: "2rem" }}>
          <CareerFormSegmented formType="add" />
        </div>
      </div>
    </>
  );
}
