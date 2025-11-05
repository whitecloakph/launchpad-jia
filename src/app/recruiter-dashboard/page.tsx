"use client";

import React from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import RecruiterDashboard from "../../lib/components/DashboardComponents/RecruiterDashboard";

export default function () {
  
  return (
    <>
      <HeaderBar activeLink="Dashboard" currentPage="Overview" icon="la la-chart-area" />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="row">
          <div className="col">
            <div style={{ marginBottom: "35px"}}>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#181D27" }}>Dashboard</h1>
              <span style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}>Here’s an overview of your current recruitment process.</span>
            </div>
            <RecruiterDashboard />
          </div>
        </div>
      </div>
    </>
  );
}
