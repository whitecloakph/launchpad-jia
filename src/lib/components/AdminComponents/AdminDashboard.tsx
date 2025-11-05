"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { errorToast } from "@/lib/Utils";
import moment from "moment";

export default function AdminDashboard() {
    const [adminStats, setAdminStats] = useState({
        activeOrganizations: 0,
        jobs: 0,
        newApplicants: [],
    });
    const [newApplicantsFilter, setNewApplicantsFilter] = useState("last_3_months");
    const [topCareers, setTopCareers] = useState([]);
    const [topOrganizations, setTopOrganizations] = useState([]);
    const [topCareersFilter, setTopCareersFilter] = useState("last_7_days");
    const [topCareersLoading, setTopCareersLoading] = useState(false);
    const [topOrganizationsFilter, setTopOrganizationsFilter] = useState("last_7_days");
    const [topOrganizationsLoading, setTopOrganizationsLoading] = useState(false);

    const filteredApplicants = React.useMemo(() => {
        return adminStats.newApplicants.filter((applicant: any) => {
            const applicantDate = new Date(applicant.createdAt);
            let filterDate = new Date();
            if (newApplicantsFilter === "last_7_days") {
                filterDate = moment().subtract(7, "days").toDate();
            } else if (newApplicantsFilter === "last_30_days") {
                filterDate = moment().subtract(30, "days").toDate();
            } else if (newApplicantsFilter === "last_3_months") {
                filterDate = moment().subtract(3, "months").toDate();
            }

            return applicantDate >= filterDate;
        });
    }, [adminStats.newApplicants, newApplicantsFilter]);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await axios.get("/api/admin/get-stats");
                setAdminStats(response.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                errorToast("Error fetching admin stats", 1300);
            }
        };
        fetchAdminStats();
    }, []);

    useEffect(() => {
        const fetchTopCareers = async () => {
            try {
                setTopCareersLoading(true);
                const response = await axios.get("/api/admin/get-top-careers", {
                    params: {
                        filter: topCareersFilter
                    }
                });
                setTopCareers(response.data);
            } catch (error) {
                console.error("Error fetching top careers:", error);
                errorToast("Error fetching top careers", 1300);
            } finally {
                setTopCareersLoading(false);
            }
        };
        fetchTopCareers();
    }, [topCareersFilter]);

    useEffect(() => {
        const fetchTopOrganizations = async () => {
            try {
                setTopOrganizationsLoading(true);
                const response = await axios.get("/api/admin/get-top-organizations", {
                    params: {
                        filter: topOrganizationsFilter
                    }
                });
                setTopOrganizations(response.data);
            } catch (error) {
                console.error("Error fetching top organizations:", error);
                errorToast("Error fetching top organizations", 1300);
            } finally {
                setTopOrganizationsLoading(false);
            }
        };
        fetchTopOrganizations();
    }, [topOrganizationsFilter]);

    return (
        <div className="recruiter-dashboard-container">
             <div className="recruiter-dashboard-metrics-container">
               <div className="recruiter-dashboard-metric-card" style={{  backgroundColor: "#EFF8FF", minWidth: "360px" }}>
                    <div className="metric-content">
                        <div className="metric-icon">
                            <i className="la la-building" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Active Organizations</span>
                            <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{adminStats.activeOrganizations}</span>
                        </div>
                    </div>
                </div>
             <div className="recruiter-dashboard-metric-card" style={{  backgroundColor: "#FDF2FA", minWidth: "360px" }}>
                <div className="metric-content">
                    <div className="metric-icon">
                        <i className="la la-suitcase" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>Jobs</span>
                        <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{adminStats.jobs}</span>
                    </div>
                </div>
            </div>
            <div className="recruiter-dashboard-metric-card" style={{  backgroundColor: "#F4F3FF", minWidth: "360px" }}>
                <div className="metric-content">
                    <div className="metric-icon">
                        <i className="la la-user" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 14, color: "#414651", fontWeight: 500 }}>New Applicants</span>
                            <MetricsFilter filter={newApplicantsFilter} setFilter={setNewApplicantsFilter} />
                        </div>
                        <span style={{ fontSize: 24, color: "#030217", fontWeight: 700 }}>{filteredApplicants.length || 0}</span>
                    </div>
                </div>
            </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0, margin: "20px 0" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#181D27" }}>Latest Activity</h1>
            </div>

            <div className="pending-recruiter-tasks-container">
                <div className="layered-card-content">
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                            <h1 style={{ fontSize: 20, color: "#181D27", fontWeight: 700 }}>Top Careers</h1>
                            <MetricsFilter filter={topCareersFilter} setFilter={setTopCareersFilter} />
                        </div>
                        {/* <button 
                        style={{ fontSize: 14, fontWeight: 500, borderRadius: "60px", backgroundColor: "#FFFFFF", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer" }}
                        onClick={() => {}}
                        >
                            View All
                        </button> */}
                    </div>
                    <div className="pending-recruiter-task-table">
                            {topCareersLoading ? 
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="pending-recruiter-task-row" style={{ borderBottom: "1px solid #E0E0E0" }}>
                                            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                            <div className="skeleton-box" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }}></div>
                                            <div className="skeleton-box" style={{ width: 100, height: 14, borderRadius: "60px", background: "#E0E0E0" }}></div>
                                            </div>
                                        </div>
                                    ))
                             : topCareers?.length > 0 ? topCareers.map((career: any, index: number) => (
                                <div 
                                key={index} 
                                className="pending-recruiter-task-row"
                                style={{ borderBottom: index === 4 ? "none" : "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        {career?.organization?.image && <img src={career?.organization?.image} alt="logo" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }} />}
                                        <div>
                                            <div style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>{career.jobTitle}</div>
                                            <div style={{ fontSize: 12, color: "#787486" }}>{career?.organization?.name}</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "flex-end" }}>
                                            <div style={{ fontWeight: 500, fontSize: 14 }}>{career.newApplications || 0}</div>
                                            <div style={{ fontSize: 12, color: "#787486" }}>New Applications</div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                // No data found
                                <div className="pending-recruiter-task-row" style={{ borderBottom: "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                        <div style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>No top careers found</div>
                                    </div>
                                </div>
                            )}
                        </div>
                </div>

                <div className="layered-card-content">
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "flex-start" }}>
                            <h1 style={{ fontSize: 20, color: "#181D27", fontWeight: 700 }}>Top Organizations</h1>
                            <MetricsFilter filter={topOrganizationsFilter} setFilter={setTopOrganizationsFilter} />
                        </div>
                        {/* <button 
                        style={{ fontSize: 14, fontWeight: 500, borderRadius: "60px", backgroundColor: "#FFFFFF", padding: "5px 10px", border: "1px solid #D5D7DA", cursor: "pointer" }}
                        onClick={() => {}}
                        >
                            View All
                        </button> */}
                    </div>

                    <div className="pending-recruiter-task-table">
                            {topOrganizationsLoading ? 
                             Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="pending-recruiter-task-row" style={{ borderBottom: "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                    <div className="skeleton-box" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }}></div>
                                    <div className="skeleton-box" style={{ width: 100, height: 14, borderRadius: "60px", background: "#E0E0E0" }}></div>
                                    </div>
                                </div>
                            ))
                            : topOrganizations?.length > 0 ? topOrganizations.map((organization: any, index: number) => (
                                <div 
                                key={index} 
                                className="pending-recruiter-task-row"
                                style={{ borderBottom: index === 4 ? "none" : "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                        {organization?.image && <img src={organization?.image} alt="logo" style={{ width: 40, height: 40, borderRadius: "50%", background: "#E0E0E0" }} />}
                                        <div style={{ fontSize: 14, color: "#181D27", fontWeight: 700 }}>{organization?.name}</div>
                                    </div>
                                    
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "flex-end" }}>
                                            <div style={{ fontWeight: 500, fontSize: 14 }}>{organization?.newApplications || 0}</div>
                                            <div style={{ fontSize: 12, color: "#787486" }}>New Applications</div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                // No data found
                                <div className="pending-recruiter-task-row" style={{ borderBottom: "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                        <div style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>No top organizations found</div>
                                    </div>
                                </div>
                            )}
                        </div>
                </div>
            </div>
        </div>
    )
}

const MetricsFilter = ({ filter, setFilter }: { filter: string, setFilter: (filter: string) => void }) => {
    const filterOptions = [
        "last_7_days",
        "last_30_days",
        "last_3_months"
    ]
     
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center", border: "1px solid #E9EAEB", borderRadius: "60px", padding: "0px 10px", backgroundColor: "#F5F5F5", color: "#414651", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
        onClick={() => {
            const currentIndex = filterOptions.indexOf(filter);
            const nextIndex = (currentIndex + 1) % filterOptions.length;
            setFilter(filterOptions[nextIndex]);
        }}
        >
            <span style={{ fontSize: 12, color: "#787486", textTransform: "capitalize" }}>{filter?.replaceAll("_", " ")}</span>
            <i className="la la-sort" style={{ fontSize: 12, color: "#787486" }}></i>
        </div>
    )
}