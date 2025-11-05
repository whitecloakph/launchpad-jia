import CandidateCard from "./CandidateCard";

export default function CareerStageColumn({ timelineStages, handleCandidateMenuOpen, handleCandidateCVOpen, handleDroppedCandidatesOpen, handleEndorseCandidate, handleDropCandidate, dragEndorsedCandidate, handleCandidateHistoryOpen, handleRetakeInterview }: any) {
  return (
      <div className="career-stage-container">
        {Object.keys(timelineStages).map((stage, idx) => (
      <div className="layered-card-outer" key={idx}>    
      <div 
      onDragOver={(e) => {
        e.preventDefault();
        const target = e.currentTarget;

        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + bounding.height / 2;

        if (e.clientY - offset > 0) {
          target.style.borderBottom = "3px solid #6941C6";
          target.style.borderTop = "none";
        } else {
          target.style.borderTop = "3px solid #6941C6";
          target.style.borderBottom = "none";
        }
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.borderTop = "none";
        e.currentTarget.style.borderBottom = "none";
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.borderTop = "none";
        e.currentTarget.style.borderBottom = "none";

        const candidateId = e.dataTransfer.getData("candidateId");
        const originStageKey = e.dataTransfer.getData("stageKey");
        if (candidateId && originStageKey && originStageKey !== stage) {
          dragEndorsedCandidate(candidateId, originStageKey, stage);
        }
      }}
      className="career-stage-column">
        <div className="career-stage-header">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1E1F3B" }}>{stage}</span>
            {/* Count in a circle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#F8F9FC", border: "1px solid #D5D9EB" }}>
            <span style={{ fontSize: 12, color: "#363F72", fontWeight: 700 }}>{timelineStages[stage].candidates?.length || 0}</span>
            </div>
          </div>
          {/* <div className="dropdown">
                <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <i className="la la-ellipsis-h" style={{ fontSize: 16, color: "#787486" }}></i>
                </button>
          </div> */}
        </div>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <button className="dropped-candidates-btn" onClick={() => handleDroppedCandidatesOpen(stage)}>
            <div>
              <i className="la la-user-times" style={{ fontSize: 20, color: "#787486" }}></i> {timelineStages[stage].droppedCandidates?.length || 0} Dropped Candidates
            </div>
          </button>
        </div>
        {timelineStages[stage]?.candidates?.length > 0 ? timelineStages[stage].candidates.map((c: any, idx: number) => (
          <CandidateCard 
          key={idx} 
          candidate={c} 
          stage={stage}
          handleCandidateMenuOpen={handleCandidateMenuOpen} 
          handleCandidateCVOpen={handleCandidateCVOpen} 
          handleEndorseCandidate={handleEndorseCandidate} 
          handleDropCandidate={handleDropCandidate} 
          handleCandidateHistoryOpen={handleCandidateHistoryOpen}
          handleRetakeInterview={handleRetakeInterview}
          />
        )) : <div style={{ display: "flex", justifyContent: "center", width: "100%", height: "100%", alignItems: "flex-start", padding: "50px 0" }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#787486" }}>Currently no candidates in this stage</div>
        </div>}
      </div>
      </div>
      ))}
      </div>
    );
  }