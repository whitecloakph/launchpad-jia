"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { clearUserSession, errorToast } from "../../Utils";

export default function SuperAdminAuthGuard() {
  const [animation, setAnimation] = useState("");
  const [blocked, setBlocked] = useState(true);

  useEffect(() => {

    const checkSuperAdmin = async (email: string) => {
      const response = await axios.post("/api/admin/check-super-admin", {
        email: email
      });

      if (response.data.isSuperAdmin) {
        setBlocked(false);
      } else {
        errorToast("You are not authorized to access this page", 1500);
        clearUserSession();
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    }
    if (!localStorage.user) {
      setBlocked(true);
      window.location.href = "/";
    }

    if (localStorage.user) {
      const userData = JSON.parse(localStorage.user);
      checkSuperAdmin(userData.email);
    } 
  }, []);

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