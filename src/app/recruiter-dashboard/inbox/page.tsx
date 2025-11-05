"use client";

import React, { useEffect, useRef, useState } from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast } from "@/lib/Utils";
import EmailModule from "@/lib/components/EmailComponents/EmailModule";
import SuperAdminFeature from "@/lib/components/SuperAdminFeature";

export default function () {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const { orgID } = useAppContext();

  useEffect(() => {
    if (orgID) {
      // do things
    }
  }, [orgID]);

  return (
    <>
      <HeaderBar
        activeLink="Inbox"
        currentPage="Overview"
        icon="la la-envelope"
      />
      <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
        <div className="row">
          <div className="col">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginBottom: "35px",
              }}
            >
              <h1
                style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}
              >
                Inbox
              </h1>
              <span
                style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}
              >
                Easily keep track of all emails from all your career openings.
              </span>
            </div>

            <SuperAdminFeature>
              <EmailModule />
            </SuperAdminFeature>
          </div>
        </div>
      </div>
    </>
  );
}
