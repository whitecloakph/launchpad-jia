"use client";

import { useAppContext } from "@/lib/context/AppContext";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { clearUserSession, errorToast } from "@/lib/Utils";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function AuthGuard() {
  const { orgID } = useAppContext();
  const [animation, setAnimation] = useState("");
  const [blocked, setBlocked] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeOrg, setActiveOrg] = useLocalStorage("activeOrg", null);

  useEffect(() => {
    async function fetchOrg() {
      const userData = JSON.parse(localStorage.user);
      const org = await axios.post("/api/get-org", {
        user: userData,
      });

      const orgList = org.data;
      localStorage.orgList = JSON.stringify(orgList);

      if (!orgList.length && !activeOrg) {
        errorToast("Invalid Access", 1500);

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }

      const orgIDparams = searchParams.get("orgID");

      if (!orgIDparams && activeOrg) {
        const params = new URLSearchParams(searchParams);
        params.delete("orgID");
        const existingParams = params.toString();
        router.replace(`${pathname}?orgID=${activeOrg._id}${existingParams ? `&${existingParams}` : ""}`);
      } else if (orgIDparams) {
        const foundOrg = orgList.find((o: any) => o._id === orgIDparams);
        const superAdminResponse = await axios.post("/api/admin/check-super-admin", {
          email: userData.email,
        });
        const isSuperAdmin = superAdminResponse.data.isSuperAdmin;

        if (!foundOrg && !isSuperAdmin) {
          errorToast("Invalid organization", 1500);

          setTimeout(() => {
            window.location.href = `${pathname}?orgID=${
              activeOrg ? JSON.parse(activeOrg)._id : orgList[0]._id
            }`;
          }, 1500);

          return;
        }

        if (!foundOrg && isSuperAdmin) {
          const orgDetails = await axios.get("/api/admin/get-organization-details", {
            params: {
              id: orgIDparams,
            }
          });
          if (orgDetails.data.status === "inactive") {
            clearUserSession();
            errorToast("Your organization is inactive", 1500);
            setTimeout(() => {
              window.location.href = "/";
            }, 1500);
            return;
          }
          setActiveOrg(orgDetails.data);
        }

        if (foundOrg) {
          setActiveOrg(foundOrg);
        }
      }

      if (!activeOrg) {
        setActiveOrg(orgList[0]);
      }

      if (activeOrg) {
        if (!userData.email.includes("@whitecloak.com")) {
          if (pathname.includes("/settings")) {
            errorToast("You are not authorized to access this page", 1500);
            setTimeout(() => {
              window.location.href = "/recruiter-dashboard/careers";
            }, 1500);
            return;
          }
        }

        if (activeOrg.role == "hiring_manager") {
          const allowedPaths = [
            "/dashboard/careers",
            "/dashboard/feedback",
            "/dashboard/interviews",
            "/dashboard/candidates",
            "/recruiter-dashboard/careers",
            "/recruiter-dashboard/feedback",
            "/recruiter-dashboard/candidates",
          ];

          if (!allowedPaths.some((path) => pathname.includes(path))) {
            errorToast("You are not authorized to access this page", 1500);
            setTimeout(() => {
              window.location.href = "/recruiter-dashboard/careers";
            }, 1500);
            return;
          }
        }

        // Check if org is active
        const orgDetails = await axios.get("/api/admin/get-organization-details", {
          params: {
            id: activeOrg._id,
          }
        });
        if (orgDetails.data.status === "inactive") {
          clearUserSession();
          errorToast("Your organization is inactive", 1500);
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
          return;
        }
      }

      setBlocked(false);
    }

    function fetchCV(email: string) {
      axios.post(`/api/load-user-cv`, { email: email }).then((res) => {
        localStorage.isCVAvailable = res.data ? true : false;
      });
    }

    if (!localStorage.user) {
      setBlocked(true);
      window.location.href = "/";
    }

    if (localStorage.user) {
      try {
        const userData = JSON.parse(localStorage.user);
        const role = localStorage.role;

        if (role === "admin") {
          if (window.location.pathname.includes("applicant")) {
            fetchCV(userData.email);
            setBlocked(false);
          }
          if (window.location.pathname.includes("dashboard")) {
            if (orgID) {
              fetchOrg();
            }
          }
        }

        if (role === "applicant") {
          localStorage.removeItem("activeOrg");
          localStorage.removeItem("orgList");
          if (window.location.pathname.includes("applicant")) {
            fetchCV(userData.email);
            setBlocked(false);
          }

          if (window.location.pathname.includes("dashboard")) {
            errorToast("You are not authorized to access this page", 1500);
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          }
        }
      } catch (error) {
        setBlocked(true);
        window.location.href = "/";
      }
    }
  }, [orgID]);

  return (
    <>
      {blocked && (
        <div className={`auth-guard ${animation}`}>
          <h1>
            <i className="la la-circle-notch spin la-2x text-primary"></i>
          </h1>
        </div>
      )}
    </>
  );
}
