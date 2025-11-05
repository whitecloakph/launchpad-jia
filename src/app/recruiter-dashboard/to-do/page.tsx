"use client";

import React, { useEffect, useRef, useState } from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import { errorToast } from "@/lib/Utils";
import ToDoTable from "@/lib/components/DataTables/ToDoTable";


export default function () {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const tabs = [
        { label: "CV Review", value: "cv-review" },
        { label: "Interview Review", value: "interview-review" },
        { label: "Retake Interview Requests", value: "retake-interview-requests" },
    ];
    const { orgID } = useAppContext();
    const [activeTab, setActiveTab] = useState("cv-review");
    const [pendingTaskCounts, setPendingTaskCounts] = useState({
        "cv-review": 0,
        "interview-review": 0,
        "retake-interview-requests": 0
    });
    const initialLoadRef = useRef(true);


    useEffect(() => {
        const fetchPendingTaskCounts = async () => {
            try {
                const response = await axios.get("/api/get-pending-recruiter-tasks", { params: { orgID } });
                if (response.status === 200) {
                    setPendingTaskCounts({
                        "cv-review": response.data.cvReview?.length || 0,
                        "interview-review": response.data.aiInterviewReview?.length || 0,
                        "retake-interview-requests": response.data.retakeRequest?.length || 0
                    });
                }
            } catch (error) {
                console.log(error);
                errorToast("Error failed to load pending tasks", 1300);
            }
        }

        if (orgID) {
            fetchPendingTaskCounts();
        }
    }, [orgID]);

    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    return (
        <>
        <HeaderBar activeLink="To Do" currentPage="Overview" icon="la la-cogs" />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
            <div className="row">
            <div className="col">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "35px"}}>
                <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>To Do</h1>
                <span style={{ fontSize: "16px", color: "#717680", fontWeight: 500 }}>This page lists all the items that need your attention and review.</span>
            </div>

            {/* Tabs */}
            <div className="career-tab-container">
                <div className="career-tab-content">
                    {tabs.map((tab) => (
                    <div 
                    key={tab.value} 
                    className={`career-tab-item ${activeTab === tab.value ? "active" : ""}`}
                        onClick={() => {
                            initialLoadRef.current = true;
                            setActiveTab(tab.value)
                        }}>
                        {tab.label} <span style={{ marginLeft: "5px", borderRadius: "20px", border: "1px solid #D5D9EB", backgroundColor: "#F8F9FC", color: "#363F72", fontSize: "12px", padding: "0 10px" }}>{pendingTaskCounts[tab.value]}</span>
                    </div>
                    ))}
            </div>
            </div>

            <ToDoTable taskType={activeTab} initialLoadRef={initialLoadRef} />
            </div>
            </div>
        </div>
        </>
    );
}