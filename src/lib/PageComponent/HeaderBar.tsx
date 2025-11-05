"use client";

import { useRouter } from "next/navigation";
import AvatarImage from "../components/AvatarImage/AvatarImage";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import useDateTimer from "../hooks/useDateTimerHook";
import { clearUserSession } from "../Utils";

const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5L8 10L12 15" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
  
  const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5L12 10L8 15" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function HeaderBar(props: { activeLink: string, currentPage: string, icon?: string }) {
  const router = useRouter();
  const { user } = useAppContext();
  const [role, setRole] = useState<string>("");
  const { activeLink, currentPage, icon } = props;
  const [showAuthUserOptions, setShowAuthUserOptions] = useState(false);
  const date = useDateTimer();

  useEffect(() => {
    if (user) {
      const activeOrg = localStorage.activeOrg;
      if (activeOrg) {
        const parsedActiveOrg = JSON.parse(activeOrg);
        setRole(parsedActiveOrg.role);
      }
    }
  }, [user])

    return (
        <div className="header">
        <div className="container-fluid">
          <div className="header-body">
            <div className="row align-items-center justify-content-between py-4">
              <div className="col-lg-6 col-7">
                <nav
                  aria-label="breadcrumb"
                  className="d-none d-md-inline-block"
                >
                  <ol className="breadcrumb breadcrumb-links" style={{ backgroundColor: "transparent", padding: 0, marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 10, cursor: 'pointer' }} onClick={() => router.back()}>
                      <ChevronLeftIcon />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 10, cursor: 'pointer' }} onClick={() => router.forward()}>
                      <ChevronRightIcon />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 10, color: "gray" }}>
                      |
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
                      <i className={icon || "la la-home"} style={{ color: "#414651", fontSize: 24 }}></i>
                    </div>
                    <h4 className="text-gray d-inline-block mb-0" style={{ fontSize: "16px", fontWeight: 550 }}>
                       {activeLink}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', margin: "0 10px", cursor: 'pointer' }} onClick={() => router.forward()}>
                      <ChevronRightIcon />
                    </div>
                    <li className="breadcrumb-item">
                      <h4 className="text-black d-inline-block mb-0" style={{ fontSize: "16px", fontWeight: 550 }}>
                        {currentPage}
                      </h4>
                    </li> 
                  </ol>
                </nav>
              </div>

              <div className="col-lg-6 col-7">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: "row", justifyContent: "flex-end", width: "100%" }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#414651" }}>
                          {date?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#717680" }}>
                          {date?.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </span>
                    {user && 
                    <div 
                    style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                    onClick={() => setShowAuthUserOptions(!showAuthUserOptions)}
                    >
                    <AvatarImage src={user?.image} alt="Avatar" />
                    <div style={{ display: "flex", flexDirection: "column",alignItems: "flex-start" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#414651' }}>{user?.name}</span>
                      <span style={{ fontWeight: 500, fontSize: 14, color: '#717680', textTransform: "capitalize" }}>{role?.replace("_", " ")}</span>
                    </div>
                    </div>}
                    
                  </div>
                  <div
                    className={`dropdown-menu dropdown-menu-right mt-1 org-dropdown-anim${
                      showAuthUserOptions ? " show" : ""
                    }`}
                    style={{
                      maxWidth: "300px",
                      borderRadius: 10,
                      boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
                      overflow: "hidden",
                    }}
                  >
                    <div 
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, borderBottom: "1px solid #E9EAEB", padding: "10px" }}>
                      <AvatarImage src={user?.image} alt="Avatar" />
                      <div style={{ display: "flex", flexDirection: "column",alignItems: "flex-start" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#414651' }}>{user?.name}</span>
                        <span style={{ fontWeight: 500, fontSize: 14, color: '#717680' }}>{user?.email}</span>
                      </div>
                    </div>
                      {/* Log out button */}
                      <button 
                      className="dropdown-item d-flex align-items-center" 
                      style={{ fontWeight: 600, fontSize: 15 }}
                      onClick={() => {
                        clearUserSession();
                        // const host = window.location.host;
                        // if (host.includes("hirejia")) {
                        //   // Redirect to home page for hirejia domain
                        //   window.location.href = "/";
                        // } else {
                        //   window.location.href = "/login";
                        // }

                         window.location.href = "/";
                      }}
                      >
                        <i className="la la-sign-out"></i> Log out
                      </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}