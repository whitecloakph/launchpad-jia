export default function LoadingAnimation({text, subtext}: {text: string, subtext: string}) {
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "16px 24px", width: "100%" }}>
        <img alt="loading" src="/gifs/analysis-loading.gif" style={{objectFit: "cover"}} width={100} height={90} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "16px 24px", width: "100%" }}>
          <span style={{ fontSize: 16, color: "#414651", fontWeight: 700 }}>{text}</span>
          <span style={{ fontSize: 12, color: "#717680" }}>{subtext}</span>
        </div>
      </div>
    )
  }