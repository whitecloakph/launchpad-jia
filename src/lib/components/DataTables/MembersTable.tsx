"use client";

import TableLoader from "@/lib/Loader/TableLoader";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import InviteMemberModal from "@/lib/Modal/InviteMemberModal";
import EditMemberModal from "@/lib/Modal/EditMemberModal";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";

const formatRole = (role: string) => {
  if (!role) return "-";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function MembersTable() {
  const { orgID } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const filteredData = React.useMemo(() => {
    if (!search) return data;
    return data.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, data]);

  const fetchAllMembers = () => {
    axios.post("/api/fetch-members", { orgID }).then((res) => {
      setData(res.data);
      setIsLoading(false);
    });
  };

  const deleteMember = async (email: string) => {
    if (filteredData.length === 1) {
      Swal.fire({
        title: "Action Blocked!",
        text: "You cannot delete the last member.",
        icon: "error",
        showClass: { popup: "fade-in-bottom" },
        hideClass: { popup: "fade-out" },
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete the member?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      showClass: {
        popup: "fade-in-bottom",
      },
      hideClass: {
        popup: "fade-out",
      },
    });
    if (result.isConfirmed) {
      await axios.post("/api/delete-member", { email, orgID });
      Swal.fire({
        title: "Deleted!",
        text: "The member has been deleted.",
        icon: "success",
        showClass: { popup: "fade-in-bottom" },
        hideClass: { popup: "fade-out" },
        timer: 1000,
        showConfirmButton: false,
      });
      setTimeout(() => {
        setIsLoading(true);
        fetchAllMembers();
      }, 1000);
    }
  };

  useEffect(() => {
    if (orgID) {
      setIsLoading(true);
      fetchAllMembers();
    }
  }, [orgID]);

  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-1">
          <div className="card-header border-0 flex-wrap flex-md-nowrap d-flex align-items-center justify-content-between gap-2">
            <h3 className="mb-0 mr-auto d-flex align-items-center">
              <i className="la la-users text-primary mr-2" /> Members
            </h3>
            <button
              className="btn btn-primary ml-2"
              type="button"
              onClick={() => setShowInviteModal(true)}
              style={{ whiteSpace: "nowrap" }}
            >
              <i className="la la-plus mr-1" /> Invite Member
            </button>
            <div
              className="d-flex align-items-center gap-2 w-100 w-md-25 mt-2 mt-md-0"
              style={{ maxWidth: 290 }}
            >
              <div className="table-search flex-grow-1">
                <div className="icon mr-2">
                  <i className="la la-search"></i>
                </div>
                <input
                  type="search"
                  className="form-control ml-auto search-input"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ minWidth: 120 }}
                />
              </div>
            </div>
          </div>
          {/* Light table */}
          <div className="table-responsive">
            <table className="table align-items-center table-flush mb-0">
              <thead className="thead-light">
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Last Login</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="list">
                {isLoading && <TableLoader type="members" />}
                {!isLoading &&
                  (filteredData.length === 0 ? (
                    <tr>
                      <td
                        className="text-center py-4"
                        colSpan={6}
                        style={{ verticalAlign: "middle", height: "200px" }}
                      >
                        <div
                          className="d-flex justify-content-center align-items-center w-100 h-100"
                          style={{ minHeight: "100px" }}
                        >
                          No members found
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td className="user-cell">
                          <div className="media align-items-center">
                            <AvatarImage
                              alt="Member avatar"
                              src={item.image}
                              className="avatar avatar-md rounded-circle mr-2"
                            />
                            <div className="media-body adaptive-cell">
                              <span
                                className="name mb-0 text-sm text-truncate d-block"
                                style={{ maxWidth: 140 }}
                              >
                                {item.name || "Unknown Member"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="adaptive-cell">
                          <span
                            className="text-truncate d-block"
                            style={{ maxWidth: 180 }}
                          >
                            {item.email || "Not specified"}
                          </span>
                        </td>
                        <td className="adaptive-cell">
                          <span
                            className="badge badge-primary"
                            style={{ textTransform: "capitalize" }}
                          >
                            {formatRole(item.role)}
                          </span>
                        </td>
                        <td className="adaptive-cell">
                          <span>
                            {item.lastLogin && item.lastLogin
                              ? new Date(item.lastLogin).toDateString()
                              : "-"}
                          </span>
                        </td>
                        <td className="adaptive-cell">
                          <span
                            className={`badge ${
                              item.status === "joined"
                                ? "badge-success"
                                : "badge-secondary"
                            }`}
                            style={{ textTransform: "capitalize" }}
                          >
                            {item.status || "-"}
                          </span>
                        </td>
                        <td className="">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedMember(item);
                              setShowEditModal(true);
                            }}
                          >
                            <i className="la la-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteMember(item.email)}
                          >
                            <i className="la la-trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} />
      )}
      {showEditModal && selectedMember && (
        <EditMemberModal
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          memberData={selectedMember}
        />
      )}
    </div>
  );
}
