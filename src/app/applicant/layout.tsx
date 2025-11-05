"use client";

import Sidebar from "@/lib/PageComponent/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";

export default function Layout({ children }) {
  const [activeLink, setActiveLink] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAppContext();
  const pathname = usePathname();
  const applicantLinkSet = [
    {
      name: "Dashboard",
      icon: "la la-briefcase",
      href: "/applicant",
    },
    {
      name: "Job Openings",
      icon: "la la-file-text",
      href: "/applicant/job-openings",
    },
    {
      name: "Manage CV",
      icon: "la la-user",
      href: "/applicant/manage-cv",
    },
  ];
  // Check active link from the url
  useEffect(() => {
    window.location.href = "https://www.hellojia.ai"
    
    if (pathname) {
      let pathSplit = pathname.split("/");

      let activeMenu = null;

      if (pathSplit.length <= 3) {
        activeMenu = applicantLinkSet.find((x) => x.href === pathname);
      }

      if (pathSplit.length > 3) {
        let path = "/" + pathSplit[1] + "/" + pathSplit[2];
        activeMenu = applicantLinkSet.find((x) => x.href === path);
      }

      setActiveLink(activeMenu.name);
    }
  }, [pathname]);

  // Track window width for mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (true) return null;

  return (
    <>
      <AuthGuard />
      {/* Hamburger for mobile only */}
      {isMobile && (
        <button
          className="hamburger-btn"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className={`la la-bars ${sidebarOpen ? "la-times" : ""}`} />
        </button>
      )}
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Jia - WhiteCloak Technologies</title>
        <Sidebar
          activeLink={activeLink}
          sidebarType="Applicant"
          customLinkSet={applicantLinkSet}
          isOpen={isMobile ? sidebarOpen : true}
          onClose={isMobile ? () => setSidebarOpen(false) : undefined}
        />
        <div className="main-content" id="panel">
          {/* Header Component */}
          <div className="header gradient-1 pb-7">
            <div className="container-fluid">
              <div className="header-body">
                <div className="row align-items-center py-4">
                  <div className="col-lg-6 col-7">
                    <h6 className="h2 text-white d-inline-block mb-0">
                      {activeLink}
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
                  <div className="col-lg-6 col-5 text-right">
                    {/* Notification Button */}
                    <div
                      className="position-relative d-inline-block"
                      style={{
                        paddingRight: "8px",
                      }}
                    >
                      <button
                        className="btn btn-sm btn-neutral position-relative d-none"
                        onClick={() => setShowNotifications(!showNotifications)}
                      >
                        <i
                          className="la la-bell"
                          style={{
                            fontSize: "25px",
                            color: "#5e39d6",
                            marginRight: "0px",
                          }}
                        ></i>
                        {/* Notification Badge Counter */}
                        {/* <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white"
                                        style={{
                                            marginLeft: "-5px",
                                            marginTop: "-5px",
                                        }}
                                        >
                                            99+
                                        </span> */}
                      </button>

                      {showNotifications && (
                        <div className="notification-panel">
                          <div className="card" style={{ width: "500px" }}>
                            <div className="card-header">
                              <h3 className="mb-0">Notifications</h3>
                            </div>
                            <div
                              className="card-body p-0"
                              style={{ maxHeight: "400px", overflowY: "auto" }}
                            >
                              <div
                                className="notification-item p-3 border-bottom"
                                style={{
                                  minHeight: "300px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <p className="text-sm text-muted mb-0">
                                  No notifications yet.
                                </p>
                              </div>
                              {/* TODO: Display notifcations once implemented */}
                              {/* {notifications.map((item) => (
                            <div key={item} className="notification-item p-3 border-bottom">
                              <h6 className="mb-1">Notification Title {item}</h6>
                              <p className="text-sm text-muted mb-0">
                                This is a sample notification message.
                              </p>
                            </div>
                          ))} */}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Avatar Image */}
                    <AvatarImage alt="Avatar" src={user?.image} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
