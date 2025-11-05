"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context/AppContext";
import Swal from "sweetalert2";
import TableLoader from "../../Loader/TableLoader";
import AvatarImage from "../AvatarImage/AvatarImage";
import Fuse from "fuse.js";
import { validateEmail } from "../../Utils";
import useDebounce from "../../hooks/useDebounceHook";

export default function MembersV2Table() {
    const { orgID } = useAppContext();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const debouncedSearch = useDebounce(search, 500);
    const limit = 10;

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get("/api/search-members", {
                    params: {
                        orgID,
                        search,
                        page: currentPage,
                        limit,
                    },
                });
                setMembers(response.data.members);
                setTotalMembers(response.data.totalMembers);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Failed to fetch members",
                    icon: "error",
                });
            } finally {
                setIsLoading(false);
            }
        }
        if (orgID) {
            fetchMembers();
        }
    }, [orgID, debouncedSearch, currentPage]);

    const deleteMember = async (email: string) => {
        if (members.length === 1) {
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
            window.location.reload();
          }, 1000);
        }
      };

    return (
        <div className="row" style={{ marginBottom: "50px" }}>
            <div className="col">
                <div className="card shadow-none">
                    {/* Card header */}
                    <div className="card-header border-0 justify-content-between">
                        <div className="mb-0 d-flex align-items-center" style={{ gap: "10px" }}>
                            <div style={{ fontSize: "18px", fontWeight: 550, color: "#111827" }}>List of Members</div>
                            <div style={{ borderRadius: "60px", border: "1px solid lightgray", backgroundColor: "#F9F5FF", color: "#6941C6", fontSize: "12px", padding: "5px 10px" }}> {totalMembers} Members</div>

                            <div className="table-search-bar" style={{ minWidth: "300px" }}>
                            <div className="icon mr-2">
                                <i className="la la-search"></i>
                            </div>
                            <input
                                type="search"
                                className="form-control ml-auto search-input"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value?.trim());
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        </div>

                        <button className="btn btn-primary" style={{ backgroundColor: "#6941C6", fontSize: "14px", fontWeight: 550 }} onClick={() => setShowInviteModal(true)}>
                            <i className="la la-plus" /> Invite Member
                        </button>
                    </div>

                    {/* Light table */}
                    <div className="table-responsive">
                        {isLoading ? (
                            <table className="table align-items-center table-flush">
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col" className="sort" data-sort="name">Member</th>
                                        <th scope="col" className="sort" data-sort="email">Email</th>
                                        <th scope="col" className="sort" data-sort="role">Role</th>
                                        <th scope="col" className="sort" data-sort="status">Status</th>
                                        <th scope="col" className="sort" data-sort="status">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="list">
                                    <TableLoader type="members" />
                                </tbody>
                            </table>
                        ) : (
                            <table className="table align-items-center table-flush">
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col" className="sort" data-sort="name">Member</th>
                                        <th scope="col" className="sort" data-sort="email">Email</th>
                                        <th scope="col" className="sort" data-sort="role">Role</th>
                                        <th scope="col" className="sort" data-sort="status">Status</th>
                                        <th scope="col" className="sort" data-sort="status">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="list">
                                    {members.length === 0 ? (
                                        <tr style={{ cursor: "default", pointerEvents: "none" }}>
                                        <td colSpan={8} className="text-center py-4" style={{ verticalAlign: "middle", height: "200px" }}>
                                          <div className="d-flex justify-content-center align-items-center w-100 h-100" style={{ minHeight: "100px" }}>
                                            No members found
                                          </div>
                                        </td>
                                      </tr>
                                    ) : (
                                        members.map((member) => (
                                            <tr key={member._id}>
                                                <td>
                                                    <div className="media align-items-center">
                                                        <AvatarImage
                                                            alt="Member avatar"
                                                            src={member.image}
                                                            className="avatar avatar-md rounded-circle mr-2"
                                                        />
                                                        <div className="media-body adaptive-cell">
                                                            <span
                                                                className="name mb-0 text-sm text-truncate d-block"
                                                                style={{ maxWidth: 140 }}
                                                            >
                                                                {member.name || "Unknown Member"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className="text-truncate d-block"
                                                        style={{ maxWidth: 180 }}
                                                    >
                                                        {member.email || "Not specified"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className="badge badge-primary"
                                                        style={{ textTransform: "capitalize", borderRadius: "60px", padding: "10px 20px", border: "none" }}
                                                    >
                                                        {member.role?.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                        member.status === "joined"
                                                            ? "badge-success"
                                                            : "badge-secondary"
                                                        }`}
                                                        style={{ textTransform: "capitalize", borderRadius: "60px", padding: "10px 20px", border: "none" }}
                                                    >
                                                        {member.status || "-"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                    <button
                                                        className="button-primary"
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        <i className="la la-edit" />
                                                    </button>
                                                    <button
                                                        className="button-primary negative"
                                                        onClick={() => deleteMember(member.email)}
                                                    >
                                                        <i className="la la-trash" />
                                                    </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center border-top" style={{ padding: "15px 20px" }}>
                        <button 
                        className={`btn btn-primary shadow-none ${currentPage === 1 ? "invisible" : ""}`} 
                        style={{ backgroundColor: "white", color: "black", border: "1px solid lightgray" }}
                        onClick={() => {
                            if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            }
                        }}>
                            <i className="la la-arrow-left"></i> Previous
                        </button>

                        <div>
                            {Array.from({ length: totalPages }, (_, index) => (
                            <button 
                            key={index} 
                            className={`btn shadow-none ${currentPage === index + 1 ? "btn-primary" : ""}`} 
                            style={{ backgroundColor: currentPage === index + 1 ? "#F8F8F8": "white", color: "black", border: "none", fontSize: "14px", fontWeight: 550 }}
                            onClick={() => {
                                setCurrentPage(index + 1);
                            }}
                            >
                                {index + 1}
                            </button>
                            ))}
                        </div>
                        
                        <button 
                        className={`btn btn-primary shadow-none ${currentPage >= totalPages ? "invisible" : ""}`} 
                        style={{ backgroundColor: "white", color: "black", border: "1px solid lightgray", fontSize: "14px", fontWeight: 550 }}
                        onClick={() => {
                            if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                            }
                        }}>
                            <i className="la la-arrow-right"></i> Next
                        </button>
                        </div>
                    </div>
                </div>
            </div>
            {showInviteModal && (
                <InviteMemberMenu onClose={() => setShowInviteModal(false)} />
            )}
            {showEditModal && selectedMember && (
            <EditMemberMenu
            onClose={() => {
                setShowEditModal(false);
                setSelectedMember(null);
            }}
            memberData={selectedMember}
            />
           )}
        </div>
    )
}

function InviteMemberMenu({ onClose }: { onClose: () => void }) {
    const { orgID } = useAppContext();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(null);
    const [selectedCareers, setSelectedCareers] = useState([]);
    const [careers, setCareers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [emailError, setEmailError] = useState("");
    const [careersLoading, setCareersLoading] = useState(false);

      // Fuse.js options for searching careers
  const fuseOptions = {
    keys: ["jobTitle"],
    threshold: 0.3,
  };

  // Filtered careers based on search
  const filteredCareers = React.useMemo(() => {
    if (!search) return careers;
    const fuse = new Fuse(careers, fuseOptions);
    return fuse.search(search).map((result) => result.item);
  }, [search, careers]);

    useEffect(() => {
        const fetchCareers = async () => {
            setCareersLoading(true);
            try {
                const response = await axios.post("/api/fetch-careers", { orgID });
                setCareers(response.data);
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Failed to fetch careers",
                    icon: "error",
                });
            } finally {
                setCareersLoading(false);
            }
        }
        fetchCareers();
    }, []);

    const handleOnSubmit = async () => {
        try {
            Swal.fire({
                title: "Inviting member...",
                text: "Please wait while we invite the member...",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                  Swal.showLoading();
                },
            });
            await axios.post("/api/add-member", {
                email: email.trim(),
                orgID: orgID,
                role: role,
                careers:
                  role === "hiring_manager"
                    ? selectedCareers.map((c) => c.id)
                    : undefined,
            });
            Swal.close();
            onClose();
            window.location.reload();
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Failed to invite member",
            });
        }
    }
    
    return (
                <div 
                style={{
                    display: "block",
                    background: "#fff",
                    position: "fixed",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: "100%",
                    maxWidth: "560px",
                    overflowY: "auto",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderLeft: "1px solid #E9EAEB",
                    zIndex: 1050,
                }}
                >
                    <div className="modal-header" style={{ borderBottom: "1px solid #E9EAEB"}}>
                        <h3 className="modal-title">Invite Member</h3>
                         {/* Close Modal */}
                        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={onClose}>
                            <i className="la la-times"></i>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" className="form-control" id="email" placeholder="Enter email" value={email} onChange={(e) => {
                                setEmail(e.target.value)
                                setEmailError(validateEmail(e.target.value) ? "" : "Invalid email address")
                            }} />
                            {/* Error message */}
                            {emailError && <p className="text-danger">{emailError}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            {/* Radio buttons */}
                            <div className="form-check" style={{ display: "flex", flexDirection: "row", gap: 32 }}>
                                
                                <label className="form-check-label" htmlFor="role-admin">
                                <input className="form-check-input" type="radio" name="role" id="role-admin" value="admin" checked={role === "admin"} onChange={(e) => setRole(e.target.value)} style={{ marginRight: 8 }} />
                                    Admin
                                </label>
                                <label className="form-check-label" htmlFor="role-hiring-manager">
                                <input className="form-check-input" type="radio" name="role" id="role-hiring-manager" value="hiring_manager" checked={role === "hiring_manager"} onChange={(e) => setRole(e.target.value)} style={{ marginRight: 8 }} />
                                    Hiring Manager
                                </label>
                            </div>
                        </div>

                        {role === "hiring_manager" && (
                            <div>
                                <label>Select Careers</label>
                                <input
                                type="search"
                                className="form-control ml-auto search-input"
                                placeholder="Search Careers..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value?.trim());
                                }}
                                />
                                {/* Row of careers */}
                                <div style={{ marginTop: 16, border: "1px solid #E9EAEB", borderRadius: 4, padding: 8, maxHeight: "250px", overflowY: "auto" }}>
                                    {careersLoading ? (
                                        <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          height: "100%",
                                          color: "#666",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Loading careers...
                                      </div>
                                    ) : filteredCareers.length > 0 ? (
                                        <div>
                                            {!search && (
                                                <label
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    cursor: "pointer",
                                                    padding: "4px 8px",
                                                    transition: "background-color 0.2s ease",
                                                    borderRadius: 4,
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                    "#f8f9fa")
                                                }
                                                onMouseOut={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                    "transparent")
                                                }
                                                >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                    selectedCareers.length === careers.length
                                                    }
                                                    onChange={() =>
                                                    setSelectedCareers(
                                                        selectedCareers.length === careers.length ? [] : [...careers]
                                                      )
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                />
                                                All Careers
                                                </label>
                                            )}
                                            {filteredCareers.map((career) => (
                                                <label
                                                key={career.id}
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 8,
                                                  cursor: "pointer",
                                                  padding: "4px 8px",
                                                  transition: "background-color 0.2s ease",
                                                  borderRadius: 4,
                                                }}
                                                onMouseOver={(e) =>
                                                  (e.currentTarget.style.backgroundColor =
                                                    "#f8f9fa")
                                                }
                                                onMouseOut={(e) =>
                                                  (e.currentTarget.style.backgroundColor =
                                                    "transparent")
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={selectedCareers.some(
                                                    (c) => c.id === career.id
                                                  )}
                                                  onChange={() => {
                                                    setSelectedCareers((prev) =>
                                                        prev.some((c) => c.id === career.id)
                                                        ? prev.filter((c) => c.id !== career.id)
                                                        : [...prev, career]
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                />
                                                {career.jobTitle}
                                              </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: "#666",
                                            fontSize: "0.9rem",
                                          }}
                                        >
                                            <p>No careers found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                            <button className="button-primary" disabled={!email?.trim() || emailError !== "" || !role || (role === "hiring_manager" && selectedCareers.length === 0)} onClick={handleOnSubmit}>
                                Invite
                            </button>
                        </div>
                    </div>
                </div>
    )
}

function EditMemberMenu({ onClose, memberData }: { onClose: () => void, memberData: any }) {
    const { orgID } = useAppContext();
    const [role, setRole] = useState(null);
    const [selectedCareers, setSelectedCareers] = useState([]);
    const [careers, setCareers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [careersLoading, setCareersLoading] = useState(false);

    // Fuse.js options for searching careers
    const fuseOptions = {
        keys: ["jobTitle"],
        threshold: 0.3,
      };
    
      // Filtered careers based on search
      const filteredCareers = React.useMemo(() => {
        if (!search) return careers;
        const fuse = new Fuse(careers, fuseOptions);
        return fuse.search(search).map((result) => result.item);
      }, [search, careers]);

      useEffect(() => {
        const fetchCareers = async () => {
            try {
                setCareersLoading(true);
                const response = await axios.post("/api/fetch-careers", { orgID });
                setCareers(response.data);
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: "Failed to fetch careers",
                    icon: "error",
                });
            } finally {
                setCareersLoading(false);
            }
        }
        fetchCareers();
    }, []);

    const handleOnSubmit = async () => {
        try {
            Swal.fire({
                title: "Updating member...",
                text: "Please wait while we update the member...",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                  Swal.showLoading();
                },
            });
            await axios.post("/api/update-member", {
                email: memberData.email,
                orgID: orgID,
                role: role,
                careers:
                  role === "hiring_manager"
                    ? selectedCareers.map((c) => c.id)
                    : undefined,
            });
            Swal.fire({
                title: "Member updated successfully",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                onClose();
                window.location.reload();
            });
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: "Error",
                text: "Failed to update member",
                icon: "error",
            });
        }
    }

    useEffect(() => {
        if (memberData) {
          setRole(memberData.role as "admin" | "hiring_manager");
          if (memberData.careers) {
            // Match careers with their full data
            const matchedCareers = memberData.careers.map((careerId) => {
              const career = careers.find((c) => c.id === careerId);
              return career || { id: careerId, jobTitle: "Unknown Career" };
            });
            setSelectedCareers(matchedCareers);
          }
        }
      }, [memberData, careers]);
    return (
        <div 
                style={{
                    display: "block",
                    background: "#fff",
                    position: "fixed",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: "100%",
                    maxWidth: "560px",
                    overflowY: "auto",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderLeft: "1px solid #E9EAEB",
                    zIndex: 1050,
                }}
                >
                    <div className="modal-header" style={{ borderBottom: "1px solid #E9EAEB"}}>
                        <h3 className="modal-title">Edit Member</h3>
                         {/* Close Modal */}
                        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={onClose}>
                            <i className="la la-times"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        {/* Display email */}
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" className="form-control" id="email" placeholder="Enter email" value={memberData.email} disabled />
                        </div>
                        <div className="form-group">
                                <label htmlFor="role">Role</label>
                                {/* Radio buttons */}
                                <div className="form-check" style={{ display: "flex", flexDirection: "row", gap: 32 }}>
                                    
                                    <label className="form-check-label" htmlFor="role-admin">
                                    <input className="form-check-input" type="radio" name="role" id="role-admin" value="admin" checked={role === "admin"} onChange={(e) => setRole(e.target.value)} style={{ marginRight: 8 }} />
                                        Admin
                                    </label>
                                    <label className="form-check-label" htmlFor="role-hiring-manager">
                                    <input className="form-check-input" type="radio" name="role" id="role-hiring-manager" value="hiring_manager" checked={role === "hiring_manager"} onChange={(e) => setRole(e.target.value)} style={{ marginRight: 8 }} />
                                        Hiring Manager
                                    </label>
                                </div>
                            </div>
                            {role === "hiring_manager" && (
                            <div>
                                <label>Select Careers</label>
                                <input
                                type="search"
                                className="form-control ml-auto search-input"
                                placeholder="Search Careers..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value?.trim());
                                }}
                                />
                                {/* Row of careers */}
                                <div style={{ marginTop: 16, border: "1px solid #E9EAEB", borderRadius: 4, padding: 8, maxHeight: "250px", overflowY: "auto" }}>
                                    {careersLoading ? (
                                        <div
                                            style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: "#666",
                                            fontSize: "0.9rem",
                                            }}
                                        >
                                        Loading careers...
                                      </div>
                                    ) : filteredCareers.length > 0 ? (
                                        <div>
                                            {!search && (
                                                <label
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    cursor: "pointer",
                                                    padding: "4px 8px",
                                                    transition: "background-color 0.2s ease",
                                                    borderRadius: 4,
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                    "#f8f9fa")
                                                }
                                                onMouseOut={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                    "transparent")
                                                }
                                                >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                    selectedCareers.length === careers.length
                                                    }
                                                    onChange={() =>
                                                    setSelectedCareers(
                                                        selectedCareers.length === careers.length ? [] : [...careers]
                                                      )
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                />
                                                All Careers
                                                </label>
                                            )}
                                            {filteredCareers.map((career) => (
                                                <label
                                                key={career.id}
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 8,
                                                  cursor: "pointer",
                                                  padding: "4px 8px",
                                                  transition: "background-color 0.2s ease",
                                                  borderRadius: 4,
                                                }}
                                                onMouseOver={(e) =>
                                                  (e.currentTarget.style.backgroundColor =
                                                    "#f8f9fa")
                                                }
                                                onMouseOut={(e) =>
                                                  (e.currentTarget.style.backgroundColor =
                                                    "transparent")
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={selectedCareers.some(
                                                    (c) => c.id === career.id
                                                  )}
                                                  onChange={() => {
                                                    setSelectedCareers((prev) =>
                                                        prev.some((c) => c.id === career.id)
                                                        ? prev.filter((c) => c.id !== career.id)
                                                        : [...prev, career]
                                                    );
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                />
                                                {career.jobTitle}
                                              </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            color: "#666",
                                            fontSize: "0.9rem",
                                          }}
                                        >
                                            <p>No careers found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                            <button className="button-primary" disabled={!role || (role === "hiring_manager" && selectedCareers.length === 0)} onClick={handleOnSubmit}>
                                Update
                            </button>
                        </div>
                        </div>
                </div>
    )
}

