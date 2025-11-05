"use client";

import React, { useEffect, useState } from "react";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import OrganizationForm from "@/lib/components/AdminComponents/OrganizationForm";
import axios from "axios";
import { errorToast } from "@/lib/Utils";
import { useParams } from "next/navigation";

export default function ManageOrganizationPage() {
    const { slug } = useParams();
    const [organization, setOrganization] = useState(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await axios.get("/api/admin/get-organization-details", {
                    params: {
                        id: slug
                    }
                });
                if (response.status === 200) {
                    setOrganization(response.data);
                }
            } catch (error) {
                console.error("Error fetching organization:", error);
                errorToast("Error fetching organization", 1300);
                setTimeout(() => {
                    window.location.href = "/admin-portal/organizations";
                }, 1300);
            }
        }
        fetchOrganization();
    }, [slug]);

    return (
      <>
        <HeaderBar activeLink="Organizations" currentPage={organization?.name} icon="la la-building" />
        <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
          <div className="row">
            {organization && <OrganizationForm formType="edit" organization={organization} />}
          </div>
        </div>
      </>
    )
}