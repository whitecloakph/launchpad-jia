"use client";
import React, { useState } from "react";
import Link from "next/link";
import OrgDropdownV2 from "../components/Dropdown/OrgDropdownV2";
import AddOrgModal from "../Modal/AddOrgModal";
import SuperAdminFeature from "../components/SuperAdminFeature";

export default function SidebarV2(props: any) {
  const {
    activeLink,
    navItems,
    footerNavItems,
    superAdminNavItems,
    isAdmin = false,
  } = props;
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);

  return (
    <>
      {showAddOrgModal && (
        <AddOrgModal onClose={() => setShowAddOrgModal(false)} />
      )}
      <aside className="sidebar-v2">
        {/* Header */}
        <div className="sidebar-header">
          <div>
            <div className="sidebar-subheader">
              <img src="/jia-dashboard-logo.png" alt="Logo" />
            </div>
            {isAdmin ? (
              <div
                style={{
                  border: "1px solid #E0E0E0",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#FFFFFF",
                  color: "#181D27",
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  margin: "20px",
                }}
              >
                <span>Admin Portal</span>
              </div>
            ) : (
              <OrgDropdownV2 />
            )}

            {/* Navigation */}
            <nav className="nav-section">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#AFB5D9",
                  marginBottom: 8,
                }}
              >
                GENERAL
              </span>
              {navItems.map((item, idx) => (
                <Link href={item.href} key={item.label}>
                  <div
                    className={`nav-item ${
                      activeLink === item.label ? "active" : ""
                    }`}
                  >
                    <span>
                      <i
                        className={item.icon}
                        style={{ color: "#414651", fontSize: 24 }}
                      ></i>
                    </span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>

            <div className="nav-divider" />
            <nav className="nav-section">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#AFB5D9",
                  marginBottom: 8,
                }}
              >
                OTHERS
              </span>
              {footerNavItems.map((item) => (
                <Link href={item.href} key={item.label}>
                  <div
                    className={`nav-item ${
                      activeLink === item.label ? "active" : ""
                    }`}
                  >
                    <span>
                      <i
                        className={item.icon}
                        style={{ color: "#414651", fontSize: 24 }}
                      ></i>
                    </span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>

            {superAdminNavItems && superAdminNavItems.length > 0 && (
              <SuperAdminFeature>
                <nav className="nav-section">
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#AFB5D9",
                      marginBottom: 8,
                    }}
                  >
                    ADMIN MENU
                  </span>
                  {superAdminNavItems.map((item) => (
                    <Link href={item.href} key={item.label}>
                      <div
                        className={`nav-item ${
                          activeLink === item.label ? "active" : ""
                        }`}
                      >
                        <span>
                          <i
                            className={item.icon}
                            style={{ color: "#414651", fontSize: 24 }}
                          ></i>
                        </span>
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </SuperAdminFeature>
            )}

            {/* Footer */}
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 500, color: "#717680" }}
                >
                  © 2025
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#717680" }}
                >
                  White Cloak Technologies Inc.
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
