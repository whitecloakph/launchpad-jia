import Link from "next/link";
import Image from "next/image";
import OrgDropdown from "@/lib/components/Dropdown/OrgDropdown";
import AddOrgModal from "../Modal/AddOrgModal";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import AvatarImage from "../components/AvatarImage/AvatarImage";
import SuperAdminFeature from "../components/SuperAdminFeature";

const baseLinkSet = [
  { name: "Dashboard", icon: "la la-chart-area", href: "/dashboard" },
  {
    name: "Interviews",
    icon: "la la-file-text",
    href: "/dashboard/interviews",
  },
  { name: "Careers", icon: "la la-briefcase", href: "/dashboard/careers" },
  { name: "Candidates", icon: "la la-users", href: "/dashboard/candidates" },
  { name: "Feedback", icon: "la la-comments", href: "/dashboard/feedback" },
  { name: "Members", icon: "la la-users", href: "/dashboard/members" },
  { name: "Settings", icon: "la la-cog", href: "/dashboard/settings" },
];
const baseSuperAdminLinkSet = [
  {
    name: "CV Screen Test",
    icon: "la la-cog",
    href: "/dashboard/cv-screen-test",
  },
];

export default function (props: any) {
  const {
    activeLink,
    sidebarType,
    customLinkSet,
    isOpen = false,
    onClose,
  } = props;
  const { user, orgID } = useAppContext();
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState(baseLinkSet);

  useEffect(() => {
    let links = [...baseLinkSet];
    const activeOrg = localStorage.activeOrg;
    if (activeOrg) {
      const parsedActiveOrg = JSON.parse(activeOrg);
      if (parsedActiveOrg.role == "hiring_manager") {
        links = links.filter(
          (link) =>
            link.name !== "Settings" &&
            link.name !== "Dashboard" &&
            link.name !== "Members"
        );
      }
    }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser.email.includes("@whitecloak.com")) {
        links = links.filter((link) => link.name !== "Settings");
      }
    }
    setFilteredLinks(links);
  }, [orgID]);

  // Determine if mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 900;
  return (
    <>
      {showAddOrgModal && sidebarType !== "Applicant" && (
        <AddOrgModal onClose={() => setShowAddOrgModal(false)} />
      )}
      {/* Mobile overlay only on mobile and when open */}
      {isMobile && (
        <div
          className={`sidebar-overlay${isOpen ? "" : " hide"}`}
          onClick={onClose}
          style={{ display: isOpen ? "block" : "none" }}
        />
      )}
      <nav
        className={`sidenav navbar navbar-vertical sidebar-main${
          isMobile && isOpen ? " open" : ""
        }`}
        id="sidenav-main"
        style={
          isMobile
            ? {
                position: "fixed",
                left: 0,
                top: 0,
                height: "100vh",
                zIndex: 2000,
              }
            : {
                position: "fixed",
                left: 0,
                top: 0,
                height: "100vh",
                zIndex: 100,
              }
        }
      >
        <div className="scroll-wrapper scrollbar-inner sidebar-content">
          <div className="scrollbar-inner scroll-content">
            {/* Brand */}
            <div
              className="sidenav-header align-items-center"
              style={{ flexDirection: "column" }}
            >
              <img
                src="/jia-new-logo.png"
                alt="Logo"
                className="sidebar-logo"
              />
              {/* Organization Dropdown */}
              {sidebarType !== "Applicant" ? (
                <OrgDropdown onAddOrg={() => setShowAddOrgModal(true)} />
              ) : (
                <div className="media align-items-center d-flex">
                  {user && (
                    <div className="cite-set mt-4 pl-1 pr-3 py-1">
                      <AvatarImage src={user.image} />
                      <span className="text-grey fade-in dl-4">
                        <strong>{user.name}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="navbar-inner">
              {/* Collapse */}
              <div className="mx-auto mt-4" id="sidenav-collapse-main">
                {/* Nav items */}
                <ul className="navbar-nav">
                  {[...(customLinkSet ? customLinkSet : filteredLinks)].map(
                    (link) => (
                      <li className="nav-item" key={link.name}>
                        <Link
                          className={`nav-link ${
                            activeLink === link.name ? "active" : ""
                          }`}
                          href={link.href}
                        >
                          <i className={`${link.icon} text-primary`}></i>
                          <span className="nav-link-text">{link.name}</span>
                        </Link>
                      </li>
                    )
                  )}
                </ul>
                {/* Divider */}
                <hr className="my-3" />
                {/* Heading */}
                <SuperAdminFeature>
                  <h6 className="navbar-heading p-0 text-muted">
                    <span className="docs-normal">Super Admin Menu</span>
                  </h6>
                  <ul className="navbar-nav mb-3">
                    {baseSuperAdminLinkSet.map((link) => (
                      <li className="nav-item" key={link.name}>
                        <Link className="nav-link px-2" href={link.href}>
                          <i className={`${link.icon} text-primary`}></i>
                          <span className="nav-link-text">{link.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </SuperAdminFeature>
                <h6 className="navbar-heading p-0 text-muted">
                  <span className="docs-normal">Other Actions</span>
                </h6>
                {/* Navigation */}
                <ul className="navbar-nav mb-md-3">
                  <li
                    className="nav-item"
                    onClick={() => {
                      localStorage.removeItem("authToken");
                      localStorage.removeItem("user");
                      localStorage.removeItem("isCVAvailable");
                      localStorage.removeItem("role");
                      window.location.href = "/login";
                    }}
                  >
                    <Link className="nav-link" href="#log-out">
                      <i className="la la-sign-out"></i>
                      <span className="nav-link-text">Log out</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
