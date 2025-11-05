"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import axios from "axios";
import InterviewsTable from "@/lib/components/DataTables/InterviewsTable";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import { useAppContext } from "@/lib/context/AppContext";

export default function () {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { orgID } = useAppContext();
  const [loadingKey, setLoadingKey] = useState(0);

  const fetchMetrics = () => {
    axios.post("/api/get-metrics", { orgID }).then((res) => {
      setMetrics(res.data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (orgID) {
      setIsLoading(true);
      setLoadingKey((k) => k + 1);
      fetchMetrics();
    }
  }, [orgID]);

  return (
    <>
      <AuthGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Dashboard | Jia - WhiteCloak Technologies</title>
        <Sidebar activeLink="Dashboard" />

        {/* Main content */}
        <div className="main-content" id="panel">
          {/* Topnav */}
          <NavBar />
          {/* Header */}
          <div className="header gradient-1 pb-7">
            <div className="container-fluid">
              <div className="header-body">
                <div className="row align-items-center py-4">
                  <div className="col-lg-6 col-7">
                    <h6 className="h2 text-white d-inline-block mb-0">
                      Dashboard
                    </h6>
                    <nav
                      aria-label="breadcrumb"
                      className="d-none d-md-inline-block ml-md-4"
                    >
                      <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <i className="fas fa-home"></i>
                          </a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="#">Overview</a>
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Page content */}
          <div className="container-fluid mt--6">
            <div className="card-set mb-4">
              {isLoading
                ? [0, 1, 2, 3].map((index) => (
                    <div
                      className="dashboard-card card shadow-1"
                      key={`loading-${loadingKey}-${index}`}
                    >
                      {/* Skeleton Loader */}
                      <div
                        className="skeleton-bar blink-2 mt-2"
                        style={{ width: "60%" }}
                      />
                      <div
                        className="skeleton-bar blink-2 ml-auto mt-3"
                        style={{ width: "40%", height: 32 }}
                      />
                    </div>
                  ))
                : metrics.map((x, index) => {
                    return (
                      <div
                        className="dashboard-card card shadow-1 fade-in-bottom"
                        style={{ animationDelay: `${index * 200}ms` }}
                        key={index}
                      >
                        <h4 className="mt-2">
                          <i className="la la-square text-primary" /> {x.name}
                        </h4>
                        <h1 className="ml-auto">
                          <i className="la la-cubes text-primary" /> {x.value}
                        </h1>
                      </div>
                    );
                  })}
            </div>

            <InterviewsTable />

            {/* Footer */}
            <footer className="footer pt-0 mt-7">
              <div className="row align-items-center justify-content-lg-between">
                <div className="col-lg-6">
                  <div className="copyright text-center text-lg-left text-muted">
                    © {new Date().getFullYear()}{" "}
                    <a
                      href="https://www.whitecloak.com"
                      className="font-weight-bold ml-1"
                      target="_blank"
                    >
                      WhiteCloak Technologies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
