import { useState } from "react";

export default function FilterDropdown(props) {
    const { onSelectFilter, filterSetting, filterList } = props;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div 
            className="dropdown w-100" 
            style={{ 
                maxWidth: "210px",
            }}
            >
            <button 
            className="btn btn-primary fade-in-bottom"
            style={{ width: "100%" }}
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            >
                <i className="la la-filter"></i> {filterSetting}
            </button>
            <div
            className={`dropdown-menu w-100 mt-1 org-dropdown-anim${
            dropdownOpen ? " show" : ""
            }`} 
            style={{
                padding: '10px',
            }}
            >
            {filterList.map((filter, index) => (
                <div 
                    style={{ borderBottom: "1px solid #ddd" }}
                    key={index}
                >
                <button
                className={`dropdown-item d-flex align-items-center${
                    filterSetting === filter ? " bg-primary text-white active-org" : ""
                }`}
                style={{
                    borderRadius: filterSetting === filter ? 0 : 10,
                    overflow: "hidden",
                    paddingBottom: 10,
                    paddingTop: 10,
                }}
                onClick={() => {
                    onSelectFilter(filter);
                    setDropdownOpen(false);
                }}
                >
                    {filter}
                </button>
                </div>
            ))}
            </div>
        </div>
    )
}