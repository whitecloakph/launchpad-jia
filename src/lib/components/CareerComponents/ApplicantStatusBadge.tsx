import { applicantStatusFormatMap } from "@/lib/Utils";

export default function ApplicantStatusBadge({ status }: { status: string }) {
    return (
      <div 
        style={{ 
          borderRadius: "60px", 
          border: applicantStatusFormatMap[status].border, 
          backgroundColor: applicantStatusFormatMap[status].backgroundColor, 
          color: applicantStatusFormatMap[status].color, 
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          width: "fit-content",
          padding: "0px 10px",
          fontWeight: 700,
          }}> 
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: applicantStatusFormatMap[status].dotColor }} /><span style={{ fontSize: "12px" }}>{status}</span> 
        </div>
    )
  }