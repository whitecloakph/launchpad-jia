export default function OrganizationActionModal({ action, onAction }: { action: string, onAction: (action: string) => void }) {
    
    const actions = {
        "save": {
            icon: "la-check-circle",
            color: "#181D27",
            iconColor: "#039855",
            iconBgColor: "#D1FADF",
            title: "Save and Publish Organization",
            subtext: "Are you ready to publish this Organization? <br /> Once published, organization members will be able to log in and start using Jia.",
            buttonText: "Save & Publish",
        },
        "update": {
            icon: "la-check-circle",
            color: "#181D27",
            iconColor: "#039855",
            iconBgColor: "#D1FADF",
            title: "Update Organization",
            subtext: "Are you ready to update this Organization?",
            buttonText: "Update",
        },
        "deactivate": {
            icon: "la-user-times",
            color: "#D92D20",
            iconColor: "#FFFFFF",
            iconBgColor: "#D92D20",
            title: "Deactivate Organization",
            subtext: "Are you sure you want to deactivate this Organization?",
            buttonText: "Deactivate",
        },
        "activate": {
            icon: "la-user-check",
            color: "#039855",
            iconColor: "#FFFFFF",
            iconBgColor: "#039855",
            title: "Activate Organization",
            subtext: "Are you sure you want to activate this Organization?",
            buttonText: "Activate",
        }
    }
    return (
        <div
        className="modal show fade-in-bottom"
        style={{
          display: "block",
          background: "rgba(0,0,0,0.45)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1050,
        }}
        >
            <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw",
            }}>
           
            <div className="modal-content" style={{ overflowY: "auto", height: "fit-content", width: "fit-content", background: "#fff", border: `1.5px solid #E9EAEB`, borderRadius: 14, boxShadow: "0 8px 32px rgba(30,32,60,0.18)", padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
                    <div style={{ border: "1px solid #E9EAEB", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: actions[action]?.iconBgColor }}>
                    <i className={`la ${actions[action]?.icon}`} style={{ fontSize: 24, color: actions[action]?.iconColor }}></i>
                    </div>
                    <h3 className="modal-title">{actions[action]?.title}</h3>
                    <p style={{ maxWidth: "352px" }} dangerouslySetInnerHTML={{ __html: actions[action]?.subtext }}></p> 
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 16, width: "100%" }}>
                        <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onAction("");
                        }}
                        style={{ display: "flex", width: "50%", flexDirection: "row", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: "60px", border: "1px solid #D5D7DA", cursor: "pointer", padding: "10px 0px" }}>
                            Cancel
                        </button>
                        <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onAction(action);
                        }}
                        style={{ display: "flex", width: "50%", flexDirection: "row", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8, backgroundColor: actions[action]?.color, color: "#FFFFFF", borderRadius: "60px", border: "1px solid #D5D7DA", cursor: "pointer", textTransform: "capitalize" }}>
                            {actions[action]?.buttonText}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}