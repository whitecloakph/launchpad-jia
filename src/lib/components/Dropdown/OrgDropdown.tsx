"use client";

import { act, useEffect, useState } from "react";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";

export default function OrgDropdown({ onAddOrg }: { onAddOrg?: () => void }) {
  const [orgList, setOrgList] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState({
    _id: "",
    orgID: "",
    name: "",
    image: null,
    tier: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { orgID } = useAppContext();

  // Tier color mapping
  const tierColorMap: Record<string, string> = {
    startup: "badge-success",
    corporate: "badge-primary",
    enterprise: "badge-warning",
  };

  const handleSelect = (org: any) => {
    const activeOrg = localStorage.activeOrg;

    if (activeOrg) {
      const activeOrgData = JSON.parse(activeOrg);
      setDropdownOpen(false);

      if (activeOrgData._id === org._id) {
        return;
      }

      localStorage.activeOrg = JSON.stringify(org);
      const pathname = window.location.href;
      const origin = window.location.origin;

      if (org.role == "hiring_manager") {
        const allowedPaths = [
          "/dashboard/careers",
          "/dashboard/interviews",
          "/dashboard/candidates",
          "/dashboard/feedback",
          "/recruiter-dashboard/careers",
          "/recruiter-dashboard/feedback",
          "/recruiter-dashboard/candidates",
        ];

        if (allowedPaths.some((path) => pathname.includes(path))) {
          window.location.href = `${pathname}`;
        } else {
          window.location.href = `${origin}/recruiter-dashboard/careers`;
        }
      } else {
        window.location.href = `${pathname}`;
      }
    }
  };

  useEffect(() => {
    async function fetchOrg() {
      let orgList = localStorage.orgList;

      if (orgList) {
        setOrgList(JSON.parse(orgList));

        if (localStorage.activeOrg) {
          setSelectedOrg(JSON.parse(localStorage.activeOrg));
        } else {
          const orgListParsed = JSON.parse(orgList);
          localStorage.activeOrg = JSON.stringify(orgListParsed[0]);
        }
      } else {
        const userData = JSON.parse(localStorage.user);
        const org = await axios.post("/api/get-org", {
          user: userData,
        });

        orgList = org.data;
        setOrgList(orgList);
        localStorage.orgList = JSON.stringify(orgList);

        if (localStorage.activeOrg) {
          setSelectedOrg(JSON.parse(localStorage.activeOrg));
        } else {
          setSelectedOrg(orgList[0]);
          localStorage.activeOrg = JSON.stringify(orgList[0]);
        }
      }

      setLoading(false);
    }

    if (localStorage.user && localStorage.role === "admin") {
      fetchOrg();
    }
  }, [orgID]);

  return (
    <div className="dropdown w-100 mt-3" style={{ maxWidth: 220 }}>
      <button
        className="btn btn-outline-primary dropdown-toggle d-flex align-items-center w-100"
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        style={{
          justifyContent: "space-between",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
        }}
        disabled={loading}
      >
        {loading ? (
          <span className="d-flex align-items-center w-100 justify-content-center">
            <span
              className="spinner-border spinner-border-sm mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </span>
        ) : (
          <span className="d-flex align-items-center">
            <AvatarImage
              src={selectedOrg.image}
              alt={selectedOrg.name}
              className="mr-2 avatar-sm"
            />
            <span className="d-flex flex-column align-items-start">
              <span
                style={{
                  maxWidth: 100,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
                title={selectedOrg.name}
              >
                {selectedOrg.name}
              </span>
              {/* Show tier badge for selected org */}
              {selectedOrg.tier && (
                <span
                  className={`badge mt-1 ${
                    tierColorMap[selectedOrg.tier] || "badge-secondary"
                  }`}
                  style={{ textTransform: "capitalize" }}
                >
                  {selectedOrg.tier}
                </span>
              )}
            </span>
          </span>
        )}
      </button>
      <div
        className={`dropdown-menu mt-1 org-dropdown-anim${
          dropdownOpen ? " show" : ""
        }`}
        style={{
          minWidth: 200,
          borderRadius: 10,
          boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
          overflow: "hidden",
          paddingBottom: 4,
          paddingTop: 4,
        }}
      >
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-3">
            <span
              className="spinner-border spinner-border-sm mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading organizations...
          </div>
        ) : (
          <>
            {orgList.map((org) => (
              <button
                key={org._id}
                className={`dropdown-item d-flex align-items-center${
                  selectedOrg._id === org._id
                    ? " bg-primary text-white active-org"
                    : ""
                }`}
                style={{
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 15,
                  transition: "background 0.2s, color 0.2s",
                }}
                onClick={() => handleSelect(org)}
              >
                <AvatarImage
                  src={org.image}
                  alt={org.name}
                  className={`mr-2 avatar-sm${
                    selectedOrg._id === org._id ? " border border-white" : ""
                  }`}
                />
                <span className="d-flex flex-column align-items-start">
                  <span
                    style={{
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    }}
                    title={org.name}
                  >
                    {org.name}
                  </span>
                  <span
                    className={`badge mt-1 ${
                      tierColorMap[org.tier] || "badge-secondary"
                    }${
                      selectedOrg._id === org._id
                        ? " bg-white text-primary"
                        : ""
                    }`}
                    style={{ textTransform: "capitalize" }}
                  >
                    {org.tier}
                  </span>
                </span>
              </button>
            ))}
            <div className="dropdown-divider"></div>
            <button
              className="dropdown-item d-flex align-items-center text-primary"
              style={{ fontWeight: 600, fontSize: 15 }}
              onClick={() => {
                onAddOrg();
                setDropdownOpen(false);
              }}
            >
              <i className="la la-plus mr-2"></i> Add Organization
            </button>
          </>
        )}
      </div>
    </div>
  );
}
