import React, { useState, useRef, useEffect } from "react";

export interface OrgType {
  id: string;
  _id: string;
  name: string;
  image?: string;
}

interface JobDropDownProps {
  orgList: OrgType[];
  selectedOrg: OrgType;
  setSelectedOrg: (org: OrgType) => void;
  allJobOpenings: any[];
  setJobOpenings: (jobs: any[]) => void;
}

const JobDropDown: React.FC<JobDropDownProps> = ({
  orgList,
  selectedOrg,
  setSelectedOrg,
  allJobOpenings,
  setJobOpenings,
}) => {
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  // Filter orgs based on search, always include 'All Organizations' at the top
  const ALL_ORGS: OrgType = {
    id: "all",
    _id: "all",
    name: "All Organizations",
    image: "",
  };
  const filteredOrgs = React.useMemo(() => {
    let filtered = orgList;
    if (orgSearch) {
      filtered = orgList.filter((org) =>
        org.name.toLowerCase().includes(orgSearch.toLowerCase())
      );
    }
    return [ALL_ORGS, ...filtered];
  }, [orgSearch, orgList]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target as Node)
      ) {
        setOrgDropdownOpen(false);
      }
    }
    if (orgDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [orgDropdownOpen]);

  return (
    <div
      style={{ position: "relative", width: 220, marginRight: 16 }}
      ref={orgDropdownRef}
    >
      <button
        className="form-control d-flex align-items-center"
        style={{
          cursor: "pointer",
          borderRadius: 30,
          border: "2px solid #5e39d668",
          padding: "6px 16px",
          background: "#fff",
        }}
        onClick={() => setOrgDropdownOpen((v) => !v)}
        type="button"
      >
        <span
          style={{
            flex: 1,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {selectedOrg._id !== "all" &&
            (selectedOrg.image ? (
              <img
                src={selectedOrg.image}
                alt={selectedOrg.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 8,
                }}
              />
            ) : (
              <i
                className="la la-building"
                style={{ fontSize: 20, marginRight: 8, color: "#aaa" }}
              />
            ))}
          {selectedOrg.name}
        </span>
        <i
          className={`la la-chevron-${orgDropdownOpen ? "up" : "down"}`}
          style={{ fontSize: 18 }}
        />
      </button>
      <div
        className={`dropdown-menu org-dropdown-anim${
          orgDropdownOpen ? " show" : ""
        }`}
        style={{
          display: orgDropdownOpen ? "block" : "none",
          position: "absolute",
          top: 44,
          left: 0,
          width: "100%",
          zIndex: 10,
          maxHeight: 260,
          overflowY: "auto",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          padding: 0,
        }}
      >
        <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search orgs..."
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
            style={{ borderRadius: 8, fontSize: 14 }}
            autoFocus={orgDropdownOpen}
          />
        </div>
        {filteredOrgs.length > 0 ? (
          filteredOrgs.map((org, index) => (
            <div
              key={index}
              className={`dropdown-item${
                selectedOrg._id === org._id ? " bg-primary active-org" : ""
              }`}
              style={{
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={() => {
                setSelectedOrg(org);
                setOrgDropdownOpen(false);
                if (org._id === "all") {
                  setJobOpenings(allJobOpenings);
                } else {
                  setJobOpenings(
                    allJobOpenings.filter((job) => job.orgID === org._id)
                  );
                }
              }}
            >
              {org._id !== "all" &&
                (org.image ? (
                  <img
                    src={org.image}
                    alt={org.name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: 8,
                    }}
                  />
                ) : (
                  <i
                    className="la la-building"
                    style={{ fontSize: 18, marginRight: 8, color: "#aaa" }}
                  />
                ))}
              {org.name}
            </div>
          ))
        ) : (
          <div className="dropdown-item" style={{ color: "#aaa" }}>
            No orgs found
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDropDown;
