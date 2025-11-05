"use client";
import { useEffect, useState } from "react";
import RichTextEditor from "../CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import OrganizationStatus from "./OrganizationStatus";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast, validateEmail } from "@/lib/Utils";
import FullScreenLoadingAnimation from "../CareerComponents/FullScreenLoadingAnimation";
import OrganizationActionModal from "./OrganizationActionModal";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

const organizationTypeList = [
    {
        name: "startup",
        icon: "la la-suitcase",
    },
    {
        name: "enterprise",
        icon: "la la-building",
    }
];

const roleList = [
    {
        name: "hiring_manager",
    },
    {
        name: "admin",
    },
    {
        name: "super_admin",
    }
]

export default function OrganizationForm({ organization, formType }: { organization?: any, formType: string }) {
    const { user } = useAppContext();
    const [name, setName] = useState(organization?.name || "");
    const [description, setDescription] = useState(organization?.description || "");
    const [organizationType, setOrganizationType] = useState(organization?.tier || "startup");
    const [status, setStatus] = useState(organization?.status || "active");
    const [organizationPlan, setOrganizationPlan] = useState<{ _id: string, name: string, jobLimit: number } | null>(null);
    const [organizationPlanList, setOrganizationPlanList] = useState<{ _id: string, name: string, jobLimit: number }[]>([]);
    const [extraJobSlots, setExtraJobSlots] = useState(organization?.extraJobSlots || 0);
    const [country, setCountry] = useState(organization?.country || "Philippines");
    const [province, setProvince] = useState(organization?.province || "");
    const [city, setCity] = useState(organization?.city || "");
    const [cityList, setCityList] = useState([]);
    const [provinceList, setProvinceList] = useState([]);
    const [address, setAddress] = useState(organization?.address || "");
    const [isSavingOrganization, setIsSavingOrganization] = useState(false);
    const [companyRegistrationFile, setCompanyRegistrationFile] = useState<File | string | null>(organization?.documents?.find((document: any) => document.name === "Company/SEC Registration")?.filename || "");
    const [businessPermitFile, setBusinessPermitFile] = useState<File | string | null>(organization?.documents?.find((document: any) => document.name === "Business Permit")?.filename || "");
    const [coverImage, setCoverImage] = useState<File | string | null>(organization?.coverImage || "");
    const [image, setImage] = useState<File | string | null>(organization?.image || "");
    const [members, setMembers] = useState<{ email: string, role: string, error?: string }[]>(organization?.members?.map((member: any) => ({
        email: member.email,
        role: member.role,
    })) || [{
        email: "",
        role: "",
    }]);
    const [showSaveModal, setShowSaveModal] = useState("");

    const isFormValid = () => {
        return image && name && organizationType && members.length > 0 && members.every((member) => member.email && member.role && !member.error);
    }

    const validateMemberEmail = (email: string, index: number) => {
        if (!validateEmail(email)) {
            return "Invalid email address";
        }

        // Check if email is already in the members array
        const otherMembers = members.filter((member, i) => i !== index);
        if (otherMembers.some((member) => member.email === email)) {
            return "Email already exists";
        }
        
        return null;
    }

    const validateFile = (file: File) => {
        if (file.size > 1024 * 1024 * 2) {
            errorToast("File size must be less than 2MB", 1300);
            return false;
        }
        return true;
    }

    const uploadFile = async (file: File, fileName: string): Promise<string | null> => {
       try {
            const response = await axios.post("/api/admin/get-presigned-url", {
                fileName,
                fileType: file.type,
            });
            const uploadResponse = await axios.put(response.data.presignedUrl, file, {
                headers: {
                    "Content-Type": file.type,
                },
            });
            if (uploadResponse.status !== 200) {
                throw new Error("Error uploading file");
            }
            return fileName;
       } catch (error) {
            errorToast("Error uploading file", 1300);
            return null;
       }
    }

    const saveOrganization = async (action: string) => {
        setShowSaveModal("");
        const userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        if (action === "save") {
            const organizationData = {
                name,
                description,
                status,
                image: "",
                coverImage: "",
                organizationType,
                members,
                planId: organizationPlan?._id,
                extraJobSlots: isNaN(Number(extraJobSlots)) ? 0 : Number(extraJobSlots),
                country,
                province,
                city,
                address,
                lastEditedBy: userInfoSlice,
                createdBy: userInfoSlice,
                documents: [],
            }
            try {  
                setIsSavingOrganization(true);
                const response = await axios.post("/api/admin/add-organization", organizationData);
                if (response.status === 200) {
                    const imageUrl = image && typeof image === "object" ? await uploadFile(image as File, `organization/profile-image/${response.data.orgID}.${(image as File).type.split("/")[1]}`) : null;
                    const coverImageUrl = coverImage && typeof coverImage === "object" ? await uploadFile(coverImage as File, `organization/cover-image/${response.data.orgID}.${(coverImage as File).type.split("/")[1]}`) : null;
                    const businessPermitUrl = businessPermitFile && typeof businessPermitFile === "object" ? await uploadFile(businessPermitFile as File, `organization/documents/business-permit/${response.data.orgID}.${(businessPermitFile as File).type.split("/")[1]}`) : null;
                    const companyRegistrationUrl = companyRegistrationFile && typeof companyRegistrationFile === "object" ? await uploadFile(companyRegistrationFile as File, `organization/documents/company-registration/${response.data.orgID}.${(companyRegistrationFile as File).type.split("/")[1]}`) : null;
                    const documents = [];
                    if (businessPermitUrl) {
                        documents.push({
                            name: "Business Permit",
                            filename: (businessPermitFile as File)?.name,
                            filePath: businessPermitUrl,
                            fileType: (businessPermitFile as File).type.split("/")[1],
                        });
                    }
                    if (companyRegistrationUrl) {
                        documents.push({
                            name: "Company/SEC Registration",
                            filename: (companyRegistrationFile as File)?.name,
                            filePath: companyRegistrationUrl,
                            fileType: (companyRegistrationFile as File).type.split("/")[1],
                        });
                    }
                    await axios.post("/api/admin/update-organization", {
                        orgID: response.data.orgID,
                        update: {
                            image: imageUrl ? `https://cdn.hellojia.ai/${imageUrl}` : "",
                            coverImage: coverImageUrl ? `https://cdn.hellojia.ai/${coverImageUrl}` : "",
                            documents,
                        }
                    })
                    candidateActionToast("Organization created successfully", 1300, <i className="la la-check-circle text-success"></i>);
                    setTimeout(() => {
                        window.location.href = "/admin-portal/organizations"
                    }, 1300);
                }
            } catch (error) {
                console.error("Error saving organization:", error);
                errorToast("Error saving organization", 1300);
            } finally {
                setIsSavingOrganization(false);
            }
        }

        if (action === "update") {
            const update: any = {
                name,
                description,
                status,
                tier: organizationType,
                planId: organizationPlan?._id,
                extraJobSlots: isNaN(Number(extraJobSlots)) ? 0 : Number(extraJobSlots),
                country,
                province,
                city,
                address,
                lastEditedBy: userInfoSlice,
                documents: [],
            };
            try {  
                setIsSavingOrganization(true);
                if (image) {
                    update.image = typeof image === "object" ? await uploadFile(image as File, `organization/profile-image/${organization._id}.${(image as File).type.split("/")[1]}`) : image;
                }
                if (coverImage) {
                    update.coverImage = typeof coverImage === "object" ? await uploadFile(coverImage as File, `organization/cover-image/${organization._id}.${(coverImage as File).type.split("/")[1]}`) : coverImage;
                }
                if (businessPermitFile) {
                    let document = organization.documents?.find((d: any) => d.name === "Business Permit");
                    // New file was uploaded
                    if (typeof businessPermitFile === "object") {
                        document = {
                            name: "Business Permit",
                            filename: (businessPermitFile as File)?.name,
                            filePath: await uploadFile(businessPermitFile as File, `organization/documents/business-permit/${organization._id}.${(businessPermitFile as File).type.split("/")[1]}`),
                            fileType: (businessPermitFile as File).type.split("/")[1],
                        };
                    }
                    update.documents.push(document);
                }
                if (companyRegistrationFile) {
                    let document = organization.documents?.find((d: any) => d.name === "Company/SEC Registration");
                    // New file was uploaded
                    if (typeof companyRegistrationFile === "object") {
                        document = {
                            name: "Company/SEC Registration",
                            filename: (companyRegistrationFile as File)?.name,
                            filePath: await uploadFile(companyRegistrationFile as File, `organization/documents/company-registration/${organization._id}.${(companyRegistrationFile as File).type.split("/")[1]}`),
                            fileType: (companyRegistrationFile as File).type.split("/")[1],
                        };
                    }
                    update.documents.push(document);
                }
                const response = await axios.post("/api/admin/update-organization", {
                    orgID: organization._id,
                    update,
                    members,
                });
                if (response.status === 200) {
                    candidateActionToast("Organization updated successfully", 1300, <i className="la la-check-circle text-success"></i>);
                }
                setTimeout(() => {
                    window.location.href = "/admin-portal/organizations"
                }, 1300);
            } catch (error) {
                console.error("Error updating organization:", error);
                errorToast("Error updating organization", 1300);
            } finally {
                setIsSavingOrganization(false);
            }
        }
    }

    useEffect(() => {
        const parseProvinces = () => {
          setProvinceList(philippineCitiesAndProvinces.provinces);
          const defaultProvince = philippineCitiesAndProvinces.provinces[0];
          if (!organization?.province) {
            setProvince(defaultProvince.name);
          }
          const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === defaultProvince.key);
          setCityList(cities);
          if (!organization?.city) {
            setCity(cities[0].name);
          }
        }
        parseProvinces();
      }, [organization])

      useEffect(() => {
        const fetchOrganizationPlans = async () => {
            try {
                const response = await axios.get("/api/admin/get-organization-plan");
                if (response.status === 200) {
                    const currentPlan = response.data.find((plan: any) => plan._id === organization?.planId);
                    setOrganizationPlan(currentPlan || response.data[0]);
                    setOrganizationPlanList(response.data);
                }
            } catch (error) {
                console.error("Error fetching organization plans:", error);
                errorToast("Error fetching organization plans", 1300);
            }
        }
        fetchOrganizationPlans();
      }, [])

    return (
        <div className="col">
            {formType === "add" ? (
                <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Add new organization</h1>

                    <button 
                    disabled={!isFormValid() || isSavingOrganization}
                    style={{ width: "fit-content", background: !isFormValid() || isSavingOrganization ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingOrganization ? "not-allowed" : "pointer", whiteSpace: "nowrap"}} onClick={() => {
                        setShowSaveModal("save");
                    }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Save Organization
                  </button>
                </div>
            ) : (
                <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Edit organization</h1>

                <button 
                disabled={!isFormValid() || isSavingOrganization}
                style={{ width: "fit-content", background: !isFormValid() || isSavingOrganization ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingOrganization ? "not-allowed" : "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    setShowSaveModal("update");
                }}>
                <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                  Save Organization
              </button>
            </div>
            )}

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
                <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", position: "relative", marginBottom: "90px" }}>
                    <div 
                    style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        background: coverImage ? "transparent" : "linear-gradient(to right, #9FCAED, #CEB6DA, #EBACC9, #FCCEC0)", 
                        borderRadius: "20px",
                        border: "1px solid #E9EAEB",
                        minHeight: "194px",
                    }}>
                        {coverImage && (
                            <img src={typeof coverImage === "string" ? coverImage : typeof coverImage === "object" ? URL.createObjectURL(coverImage) : null} id="cover-img" alt="Cover Image" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }} />
                        )}
                        <form>
                            <input type="file" id="coverImage" accept="image/jpeg, image/png, image/jpg" hidden onChange={(e) => {
                                if (e.target instanceof HTMLInputElement && e.target.files?.[0]) {
                                    const file = e.target.files[0];

                                    if (!validateFile(file)) {
                                        // Remove the file from the input
                                        e.target.value = "";
                                        return;
                                    }

                                    setCoverImage(file);
                                    // set image to the img tag
                                    document.getElementById("cover-img")?.setAttribute("src", URL.createObjectURL(file));
                                }
                            }}/>
                            <button type="button" className="button-primary-v2" style={{ color: "#414651", background: "#FFFFFF", width: "fit-content", marginTop: 16, position: "absolute", top: 0, right: 16, zIndex: 2 }} onClick={() => {
                                document.getElementById("coverImage")?.click();
                            }}>
                                <i className="la la-camera" style={{ fontSize: 20, marginRight: 8 }}></i>
                                Add cover image
                            </button>
                        </form>
                   </div>
                       <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", gap: 16, position: "absolute", bottom: -90, right: 0, zIndex: 2 }}>
                        <img src={image && typeof image === "string" ? image : image && typeof image === "object" ? URL.createObjectURL(image) : "/user-profile.png"} id="photo-img" alt="Organization" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "1px solid #E9EAEB", background: "#F8F9FC" }} />
                        <form>
                            <input type="file" id="photo" accept="image/jpeg, image/png, image/jpg" hidden onChange={(e) => {
                                if (e.target instanceof HTMLInputElement && e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    if (!validateFile(file)) {
                                        // Remove the file from the input
                                        e.target.value = "";
                                        return;
                                    }
                                    setImage(file);
                                    // set image to the img tag
                                    document.getElementById("photo-img")?.setAttribute("src", URL.createObjectURL(file));
                                }
                            }}/>
                        <button type="button" className="button-primary-v2" style={{ color: "#414651", background: "#FFFFFF", width: "fit-content", marginTop: 16 }} onClick={() => {
                            document.getElementById("photo")?.click();
                        }}>
                            <i className="la la-camera" style={{ fontSize: 20, marginRight: 8 }}></i>
                            Upload photo
                        </button>
                        </form>
                        </div>
                    </div>
                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-suitcase" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Organization Information</span>
                        </div>
                        <div className="layered-card-content">
                            <span>Organization Name</span>
                            <input
                            value={name}
                            className="form-control"
                            placeholder="Enter company name"
                            onChange={(e) => {
                                setName(e.target.value || "");
                            }}
                            ></input>
                            <span>Organization Type</span>
                            <CustomDropdown
                            onSelectSetting={(setting) => {
                                setOrganizationType(setting);
                            }}
                            screeningSetting={organizationType}
                            settingList={organizationTypeList}
                            />
                            <span>Description</span>
                            <RichTextEditor setText={setDescription} text={description} />
                        </div>
                        </div>
                    </div>

                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="la la-users" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                        </div>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Members</span>
                        </div>
                        <div className="layered-card-content">
                            <span>Add members to automatically send them an email invitation to Jia.</span>
                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 16 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "50%", alignItems: "flex-start" }}>
                                   <span>Email</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "50%", alignItems: "flex-start" }}>
                                   <span>Role</span>
                                </div>
                            </div>
                            {/* Array of form fields for each member */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 16 }}>
                                {members.map((member, index) => (
                                    <div key={index}>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 16 }}>
                                        <input type="text" className="form-control" placeholder="Enter email" value={member.email} onChange={(e) => {
                                            const newMembers = [...members];
                                            newMembers[index].email = e.target.value;
                                            newMembers[index].error = validateMemberEmail(e.target.value, index);
                                            setMembers(newMembers);
                                        }} />
                                        <CustomDropdown
                                        onSelectSetting={(role) => {
                                            const newMembers = [...members];
                                            newMembers[index].role = role;
                                            console.log("newMembers", newMembers);
                                            setMembers(newMembers);
                                        }}
                                        placeholder="Select Role"
                                        screeningSetting={member.role}
                                        settingList={roleList}
                                        />
                                        <div onClick={() => {
                                            const newMembers = [...members];
                                            newMembers.splice(index, 1);
                                            setMembers(newMembers);
                                        }}><i className="la la-trash" style={{ fontSize: 32, marginRight: 8, cursor: "pointer" }}></i></div>
                                    </div>
                                    {member.error && <p className="text-danger">{member.error}</p>}
                                    </div>
                                ))}

                                <button type="button" className="button-primary-v2" style={{ color: "#414651", background: "#FFFFFF", width: "fit-content", marginTop: 16 }} onClick={() => {
                                    setMembers((prev) => [...prev, {
                                        email: "",
                                        role: ""
                                    }]);
                                }}><span><i className="la la-plus-circle" style={{ fontSize: 17, marginRight: 8 }}></i>Add more lines</span></button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="layered-card-outer" style={{ marginTop: 0 }}>
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="la la-cog" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                            </div>
                                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Settings</span>
                            </div>
                            <div className="layered-card-content">
                                <span>Enable organization’s access to Jia</span>                                
                                <div style={{ display: "flex", flexDirection: "row",justifyContent: "space-between", gap: 8 }}>
                                    <span>Status</span>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                                        <OrganizationStatus status={status} />
                                        <label className="switch">
                                            <input type="checkbox" checked={status === "active"} onChange={() => setStatus(status === "active" ? "inactive" : "active")} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>

                                <span>Job Limit</span>
                                <CustomDropdown
                                onSelectSetting={(plan) => {
                                    console.log(plan);
                                    const selectedPlan = organizationPlanList.find((p) => p.name === plan);
                                    setOrganizationPlan(selectedPlan || null);
                                }}
                                screeningSetting={organizationPlan?.name || ""}
                                settingList={organizationPlanList}
                                />

                                <span>Extra Job Slots</span>
                                <input
                                type="number"
                                className="form-control"
                                placeholder="Add numeric value"
                                min={0}
                                value={extraJobSlots}
                                onChange={(e) => {
                                    setExtraJobSlots(e.target.value || "");
                                }}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="layered-card-outer">
                        <div className="layered-card-middle">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, backgroundColor: "#181D27", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="la la-ellipsis-h" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
                            </div>
                                <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Business Details</span>
                            </div>
                            <div className="layered-card-content">
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Documents</span>
                            <span>Company/Sec Registration</span>
                            <form>
                                <input type="file" id="companyRegistration" accept="application/pdf, image/jpeg, image/png, image/jpg" hidden onChange={(e) => {
                                    if (e.target instanceof HTMLInputElement && e.target.files) {
                                        const file = e.target.files[0];
                                        if (!validateFile(file)) {
                                            // Remove the file from the input
                                            e.target.value = "";
                                            return;
                                        }
                                        setCompanyRegistrationFile(file);
                                    }
                                }}/>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <button type="button" className="button-primary-v2" style={{ color: "#414651", background: "#FFFFFF", maxWidth: "300px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} onClick={() => {
                                    document.getElementById("companyRegistration")?.click();
                                }}>{companyRegistrationFile ? (typeof companyRegistrationFile === "string" ? companyRegistrationFile : companyRegistrationFile?.name) : <span><i className="la la-plus-circle" style={{ fontSize: 17, marginRight: 8 }}></i>Upload Document</span>}
                                </button>
                                {companyRegistrationFile && <div style={{ cursor: "pointer" }} onClick={() => {
                                    const form = (document.getElementById("companyRegistration") as HTMLInputElement);
                                    if (form) {
                                        form.value = "";
                                    }
                                    setCompanyRegistrationFile(null);
                                }}>
                                    <i className="la la-times" style={{ fontSize: 17, marginRight: 8 }}></i>
                                </div>}
                                </div>
                            </form>
                            <span>Business Permit</span>
                            <form>
                                <input type="file" id="businessPermit" accept="application/pdf, image/jpeg, image/png, image/jpg" hidden onChange={(e) => {
                                    if (e.target instanceof HTMLInputElement && e.target.files) {
                                        const file = e.target.files[0];
                                        if (!validateFile(file)) {
                                            // Remove the file from the input
                                            e.target.value = "";
                                            return;
                                        }
                                        setBusinessPermitFile(file);
                                    }
                                }}/>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <button type="button" className="button-primary-v2" style={{ color: "#414651", background: "#FFFFFF", maxWidth: "300px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} onClick={() => {
                                    document.getElementById("businessPermit")?.click();
                                }}>{businessPermitFile ? (typeof businessPermitFile === "string" ? businessPermitFile : businessPermitFile?.name) : <span><i className="la la-plus-circle" style={{ fontSize: 17, marginRight: 8 }}></i>Upload Document</span>}
                                </button>
                                {businessPermitFile && <div style={{ cursor: "pointer" }} onClick={() => {
                                    const form = (document.getElementById("businessPermit") as HTMLInputElement);
                                    if (form) {
                                        form.value = "";
                                    }
                                    setBusinessPermitFile(null);
                                }}>
                                    <i className="la la-times" style={{ fontSize: 17, marginRight: 8 }}></i>
                                </div>}
                                </div>
                            </form>
                            <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Organization Address</span>

                            <span>Country</span>
                            <CustomDropdown
                            onSelectSetting={(setting) => {
                                setCountry(setting);
                            }}
                            screeningSetting={country}
                            settingList={[]}
                            placeholder="Select Country"
                            />

                            <span>State / Province</span>
                            <CustomDropdown
                            onSelectSetting={(province) => {
                                setProvince(province);
                                const provinceObj = provinceList.find((p) => p.name === province);
                                const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
                                setCityList(cities);
                                setCity(cities[0].name);
                            }}
                            screeningSetting={province}
                            settingList={provinceList}
                            placeholder="Select State / Province"
                            />

                            <span>City</span>
                            <CustomDropdown
                            onSelectSetting={(city) => {
                                setCity(city);
                            }}
                            screeningSetting={city}
                            settingList={cityList}
                            placeholder="Select City"
                            />

                            <span>Address</span>
                            <input
                            value={address}
                            className="form-control"
                            placeholder="Enter company address"
                            onChange={(e) => {
                                setAddress(e.target.value || "");
                            }}
                            ></input>
                            </div>
                        </div>
                  </div>
                </div>
            </div>
            {showSaveModal && (
         <OrganizationActionModal action={showSaveModal} onAction={(action) => saveOrganization(action)} />
        )}
    {isSavingOrganization && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving organization..." : "Updating organization..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the organization`} />
    )}
        </div>
    )
}