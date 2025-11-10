"use client"

import { useEffect, useState } from "react";
import { candidateActionToast } from "../../Utils";

export default function CareerLink(props: {career: any}) {
    const { career } = props;
    const [shareLink, setShareLink] = useState("");

    useEffect(() => {
        let careerRedirection = "applicant";
        if (career.orgID === "682d3fc222462d03263b0881") {
            careerRedirection = "whitecloak";
        }
        setShareLink(`https://www.hellojia.ai/${careerRedirection}/job-openings/${career._id}`);
    }, [career]);

    return (
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 8 }}>
                    <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>Career Link</span>
                </div>
                {shareLink && <div className="layered-card-content">
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", gap: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      value={shareLink}
                      readOnly={true}
                    />
                    <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        candidateActionToast(
                            "Career Link Copied to Clipboard",
                            1300,
                            <i className="la la-link mr-1 text-info"></i>
                        );
                    }}
                    >
                    <i className="la la-copy" style={{ fontSize: 20, color: "#535862" }}></i>
                    </div>
                    </div>

                    <a href={shareLink} target="_blank">
                    <div style={{ color: "#414651", display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap", width: "fit-content", fontWeight: 700, fontSize: 14 }}>
                        <i className="la la-link"></i> Open link
                    </div>
                    </a>
                </div>}
                </div>
            </div>
    )
}