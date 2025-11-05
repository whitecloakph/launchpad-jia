"use client"
import { useState } from 'react';

const dropdownOptionIconMap = {
    "Ongoing": "#F79009",
    "Dropped": "#F04438",
    "Cancelled": "#F04438",
    "Hired": "#12B76A",
    "No CV Uploaded": "#414651",
    "Published": "#12B76A",
    "Unpublished": "#717680"
}

export default function CustomDropdown({ value, setValue, options, icon, valuePrefix }: any) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="dropdown">
        <div 
        style={{ 
            minWidth: "180px",
            display: "flex", 
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center", 
            gap: 8, 
            backgroundColor: "#FFFFFF", 
            borderRadius: "60px", 
            padding: "5px 10px", 
            border: "1px solid #D5D7DA", 
            cursor: "pointer",
            color: "#414651" ,
            fontSize: 14,
            fontWeight: 700,
        }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        >
    <i className={`la ${icon}`} style={{ fontSize: 16 }}></i>
    <span>{valuePrefix || ""} {value}</span>
        </div>
        {dropdownOpen && (
            <div className={`dropdown-menu dropdown-menu-right w-100 mt-1 org-dropdown-anim${
                dropdownOpen ? " show" : ""
                }`}
            >
                {options.map((option) => (
                    <div 
                    key={option} 
                    className="dropdown-item" 
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "5px",
                        color: "#181D27",
                        fontSize: "14px",
                        fontWeight: option === value ? 700 : 500,
                    }}
                    onClick={() => {
                        setValue(option);
                        setDropdownOpen(false);
                    }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
                        {dropdownOptionIconMap[option] && <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: dropdownOptionIconMap[option], marginRight: "5px" }} />}
                        {option}
                        </div>
                        {option === value && (
                            <i
                                className="la la-check"
                                style={{
                                    fontSize: "20px",
                                    background: "linear-gradient(180deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    color: "transparent"
                                }}
                            ></i>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
    )
}
