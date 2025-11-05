"use client";

import React, { useEffect, useState } from "react";
import CustomDropdown from "../Dropdown/CustomDropdown";
import TableLoader from "../../Loader/TableLoader";
import axios from "axios";
import { candidateActionToast, errorToast, formatDateToRelativeTime } from "../../Utils";
import OrganizationStatus from "../AdminComponents/OrganizationStatus";
import useDebounce from "../../hooks/useDebounceHook";
import Swal from "sweetalert2";
import OrganizationActionModal from "../AdminComponents/OrganizationActionModal";

const tableHeaderStyle: any = {
    fontSize: "12px",
    fontWeight: 700,
    color: "#717680",
    textTransform: "none",
}

export default function OrganizationsTable() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [filterStatus, setFilterStatus] = useState("All Statuses");
    const filterStatusOptions = ["All Statuses", "Active", "Inactive"];
    const [sortBy, setSortBy] = useState("Recent Activity");
    const sortByOptions = ["Recent Activity", "Oldest Activity", "Alphabetical (A-Z)", "Alphabetical (Z-A)"];
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [showUpdateStatusModal, setShowUpdateStatusModal] = useState("");

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/api/admin/get-organizations", {
                    params: {
                        search: debouncedSearch,
                        filterStatus: filterStatus,
                        sortBy: sortBy
                    }
                });
                setOrganizations(response.data);
            } catch (error) {
                console.error("Error fetching organizations:", error);
                errorToast("Error fetching organizations", 1300);
            } finally {
                setLoading(false);
            }
        };
        fetchOrganizations();
    }, [debouncedSearch, filterStatus, sortBy]);

    const handleUpdateOrganizationStatus = async (orgID: string, status: string) => {
        try {
            Swal.showLoading();
            const response = await axios.post("/api/admin/update-organization", { orgID, update: { status: status } });
            if (response.status === 200) {
                candidateActionToast("Organization status updated successfully", 1300, <i className="la la-check-circle text-success"></i>);
            }
            setTimeout(() => {
                window.location.reload();
            }, 1300);
        } catch (error) {
            console.error("Error updating organization status:", error);
            errorToast("Error updating organization status", 1300);
        } finally {
            Swal.close();
        }
    }

    
    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "35px"}}>
                <div>
                <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Organizations</h1>
                <span style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}>View all organizations listed under Jia.</span>
                </div>

                <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                <a href="/admin-portal/organizations/new-organization">
                <button className="button-primary-v2">
                <i className="la la-plus" /> Add new organization
                </button>
                </a>
                <div className="table-search-bar" style={{ minWidth: "300px" }}>
                <div className="icon mr-2">
                    <i className="la la-search"></i>
                </div>
                <input
                    type="search"
                    className="form-control ml-auto search-input"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                </div>
                </div>
            </div>

            <div className="row" style={{ marginBottom: "50px" }}>
                <div className="col">
                    <div className="layered-card-outer">
                        <div className="layered-card-content" style={{ padding: 0 }}>

                            {/* Card header */}
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "15px 20px" }}>
                                <div className="mb-0 d-flex align-items-center" style={{ gap: "10px" }}>
                                <div style={{ fontSize: "18px", fontWeight: 550, color: "#111827" }}>
                                    List of Organizations
                                </div>
                                <div style={{ borderRadius: "20px", border: "1px solid #D5D9EB", backgroundColor: "#F8F9FC", color: "#363F72", fontSize: "12px", padding: "0 10px" }}>{organizations.length}</div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                {/* Status button */}
                                <CustomDropdown value={filterStatus} setValue={setFilterStatus} options={filterStatusOptions} icon="la-filter" />
                                {/* Sort by button */}
                                <CustomDropdown value={sortBy} setValue={(value) => {
                                    setSortBy(value);
                                }} options={sortByOptions} icon="la-sort-amount-down" valuePrefix="Sort by:" />   
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table align-items-center table-flush">
                                <thead>
                                    <tr>
                                        <th scope="col" className="sort" data-sort="name" style={tableHeaderStyle}>
                                        Name
                                        </th>
                                        <th scope="col" className="sort" data-sort="members" style={tableHeaderStyle}>
                                        Members
                                        </th>
                                        <th scope="col" style={tableHeaderStyle}>Active Jobs</th>
                                        <th scope="col" style={tableHeaderStyle}>Job Limit</th>
                                        <th scope="col" style={tableHeaderStyle}>Status</th>
                                        <th scope="col" className="sort" data-sort="status" style={tableHeaderStyle}>
                                        Last Updated
                                        </th>
                                        <th scope="col"></th>
                                    </tr>
                                    </thead>
                                    <tbody className="list">
                                      {loading ? <TableLoader type="careers-v2" /> : (
                                        organizations.map((organization: any) => (
                                            <tr key={organization._id}>
                                                <td>
                                                <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                                    <img src={organization.image} alt="logo" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }} />   
                                                    <div style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>{organization.name}</div>
                                                </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 14, color: "#717680", fontWeight: 500 }}>{organization.members}</span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                                        {/* Progress bar */}
                                                        <div style={{ width: "100%", height: 8, borderRadius: 10, background: "#E0E0E0" }}>
                                                            <div style={{ width: `${organization.activeJobs >= organization.jobLimit ? 100 : (organization.activeJobs / organization.jobLimit) * 100}%`, height: 8, borderRadius: 10, background: "#FCCEC0" }}></div>
                                                        </div>
                                                        <span style={{ fontSize: 14, color: "#717680", fontWeight: 500 }}>{organization.activeJobs}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 14, color: "#717680", fontWeight: 500 }}>{organization.jobLimit}</span>
                                                </td>
                                                <td><OrganizationStatus status={organization.status} /></td>
                                                <td>{formatDateToRelativeTime(new Date(organization.updatedAt))}</td>
                                                <td>
                                                <div className="dropdown">
                                                <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={(e) => {
                                                    if (e.defaultPrevented) return;
                                                    e.preventDefault();
                                                    setSelectedOrganization(organization);
                                                    setMenuOpen(!menuOpen);
                                                }}>
                                                    <i className="la la-ellipsis-v" style={{ fontSize: 16, color: "#787486" }}></i>
                                                </button>
                                                {menuOpen && selectedOrganization?._id === organization._id && (
                                                <div 
                                                className={`dropdown-menu dropdown-menu-right w-100 mt-1 org-dropdown-anim${
                                                    menuOpen ? " show" : ""
                                                    }`}
                                                style={{
                                                    padding: "10px 15px"
                                                }}
                                                >
                                                    <div className="dropdown-item" onClick={(e) => {
                                                        if (e.defaultPrevented) return;
                                                        e.preventDefault();
                                                        setMenuOpen(false);
                                                        window.location.href = `/admin-portal/organizations/manage/${organization._id}`;
                                                    }}>
                                                        <span>Edit Organization</span>
                                                    </div>

                                                    <div className="dropdown-item" style={{ color: organization.status === "active" ? "#B42318" : "#027948" }} onClick={(e) => {
                                                        if (e.defaultPrevented) return;
                                                        e.preventDefault();
                                                        setMenuOpen(false);
                                                        setShowUpdateStatusModal(organization.status === "active" ? "deactivate" : "activate")
                                                    }}>
                                                        <span>{organization.status === "active" ? "Deactivate Organization" : "Activate Organization"}</span>
                                                    </div>

                                                    <div className="dropdown-item" onClick={(e) => {
                                                        if (e.defaultPrevented) return;
                                                        e.preventDefault();
                                                        setMenuOpen(false);
                                                        window.location.href = `https://hirejia.ai/recruiter-dashboard?orgID=${organization._id}`;
                                                    }}>
                                                        <span>Go to Recruiter's Portal</span>
                                                    </div>
                                                    
                                                    <div className="dropdown-divider"></div>
                                                    <div className="dropdown-item" onClick={(e) => {
                                                        if (e.defaultPrevented) return;
                                                        e.preventDefault();
                                                        setMenuOpen(false);
                                                        const url = new URL("https://www.hellojia.ai/job-openings");
                                                        url.searchParams.set("company", organization.name);
                                                        window.location.href = url.toString();
                                                    }}>
                                                        <span>Go to Career Page</span>
                                                    </div>
                                                    </div>
                                                    )}
                                                </div>
                                                </td>
                                            </tr>
                                        ))
                                      )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showUpdateStatusModal && (
         <OrganizationActionModal action={showUpdateStatusModal} onAction={(action) => {
            setShowUpdateStatusModal("");
            if (action) {
                handleUpdateOrganizationStatus(selectedOrganization._id, action === "activate" ? "active" : "inactive");
            }
         }} />
        )}
        </>
    )
}