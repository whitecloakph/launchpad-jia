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
      <div
        className="container-fluid mt--7"
        style={{ padding: "6rem 0 1.5rem 0" }}
      >
        <div className="row">
          <CareerFormSegmented formType="add" />
        </div>
      </div>
    </>
  );
}
