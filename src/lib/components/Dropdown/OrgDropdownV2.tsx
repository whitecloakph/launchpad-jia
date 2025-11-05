import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Placeholder SVG components for icons
const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8L10 13L15 8" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

export default function OrgDropdownV2() {
    const [activeOrg, setActiveOrg] = useLocalStorage("activeOrg", null);
    const [selectedOrg, setSelectedOrg] = useState<any>({});
    const [orgList, setOrgList] = useState<any[]>([]);
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const nextPath = usePathname();

      // Tier color mapping
    const tierColorMap: Record<string, any> = {
      startup: {
        color: "#027948",
        backgroundColor: "#ECFDF3",
        border: "1px solid #A6F4C5",
      },
      corporate: {
        color: "#3538CD",
        backgroundColor: "#EEF4FF",
        border: "1px solid #C7D7FE",
      },
      enterprise: {
        color: "#C01048",
        backgroundColor: "#FFF1F3",
        border: "1px solid #FECCD6",
      },
    };

  const handleSelect = (org: any) => {
    if (activeOrg) {
      setShowOrgDropdown(false);

      if (activeOrg._id === org._id) {
        return;
      }

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

        if (!allowedPaths.some((path) => nextPath.includes(path))) {
          window.location.href = `${origin}/recruiter-dashboard/careers`;
          return;
        }
      }

      window.location.href = `${nextPath}?orgID=${org._id}`;
    }
  };

    useEffect(() => {
        const fetchOrg = async () => {
          setLoading(true);
          const userData = JSON.parse(localStorage.user);
          const org = await axios.post("/api/get-org", {
            user: userData,
          });
          const orgList = org.data;
          setOrgList(orgList);
          localStorage.orgList = JSON.stringify(orgList);
          setLoading(false);
        }
        fetchOrg();
      }, []);

      useEffect(() => {
        if (activeOrg) {
          setSelectedOrg(activeOrg);
        } else if (orgList.length > 0) {
          setSelectedOrg(orgList[0]);
        }
      }, [orgList, activeOrg]);

      return (
        <div className="dropdown w-100" style={{ padding: "0 10px" }}>
          <button 
           className="btn btn-outline-primary d-flex align-items-center w-100"
           type="button"
           onClick={() => setShowOrgDropdown((v) => !v)}
           style={{
             height: "98px",
             backgroundColor: "#FFFFFF",
             border: "1px solid #E9EAEB",
             justifyContent: "space-between",
             borderRadius: "20px",
             fontWeight: 600,
             fontSize: 15,
             margin: "10px 0 20px 0",
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
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: "column", gap: 8, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div>
              <img
                src={selectedOrg.image}
                alt={selectedOrg.name}
                className="mr-2 avatar rounded"
                style={{ border: "1px solid #E9EAEB" }}
              />
                <span style={{ fontWeight: 600, fontSize: 16, color: '#030217' }}>
                  {selectedOrg?.name}
                </span>
              </div>
              <ChevronDownIcon />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, width: "100%", justifyContent: "center" }}>
            <span style={{ background: '#FFF1F3',width: "100%", color: '#C01048', borderRadius: 8, padding: '2px 10px', fontSize: 14, fontWeight: 500 }}>
              {selectedOrg?.tier?.charAt(0)?.toUpperCase() + selectedOrg?.tier?.slice(1) || ""}
            </span>
          </div>
        </div>)}
        </button>
          
        <div
        className={`dropdown-menu w-100 org-dropdown-anim${
          showOrgDropdown ? " show" : ""
        }`}
        style={{
          width: "100%",
          maxWidth: 210,
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: 10,
          boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
          overflowY: "scroll",
          maxHeight: "300px",
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
                className={`dropdown-item-option ${selectedOrg._id === org._id ? "active" : ""}`}
                onClick={() => handleSelect(org)}
              >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                <img
                  src={org.image}
                  alt={org.name}
                  style={{ border: "1px solid #E9EAEB", borderRadius: "50%", width: 24, height: 24 }}
                />
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
                </div>
                  <span
                    className={`badge mt-1`}
                    style={{ 
                      textTransform: "capitalize", 
                      backgroundColor: tierColorMap[org.tier]?.backgroundColor || "#FFF1F3", 
                      color: tierColorMap[org.tier]?.color || "#C01048",
                      border: tierColorMap[org.tier]?.border || "1px solid #E9EAEB",
                      borderRadius: 8, 
                      padding: "2px 10px", 
                      fontSize: 14, 
                      fontWeight: 500 
                    }}
                  >
                    {org.tier}
                  </span>
              </button>
            ))}
            {/* <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 10 }}>
             <button
              className="button-primary-v2"
              onClick={() => {
                onAddOrg();
                setShowOrgDropdown(false);
              }}
            >
              <i className="la la-plus mr-2"></i> Add organization
            </button> 
            </div> */}
          </>
        )}
      </div>
        </div>
      )
}