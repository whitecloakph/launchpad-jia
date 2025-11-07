import { useCareerForm } from "@/lib/context/CareerFormContext";

export default function () {
    const { careerData, goToStep } = useCareerForm();

    return (
        <div>
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                    <div className="layered-card-content">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                           <h4>Career Details</h4>
                           <button onClick={() => goToStep(1)}>Edit</button>
                        </div>
                        <p><strong>Job Title:</strong> {careerData.jobTitle}</p>
                        {/* Display other fields... */}
                    </div>
                </div>
            </div>

            <div className="layered-card-outer" style={{marginTop: '1rem'}}>
                <div className="layered-card-middle">
                    <div className="layered-card-content">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                           <h4>CV Review Settings</h4>
                           <button onClick={() => goToStep(2)}>Edit</button>
                        </div>
                        <p><strong>Screening:</strong> {careerData.screeningSetting}</p>
                        {/* Display other fields... */}
                    </div>
                </div>
            </div>

            <div className="layered-card-outer" style={{marginTop: '1rem'}}>
                <div className="layered-card-middle">
                    <div className="layered-card-content">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                           <h4>AI Interview Settings</h4>
                           <button onClick={() => goToStep(3)}>Edit</button>
                        </div>
                        <p><strong>Requires Video:</strong> {careerData.requireVideo ? "Yes" : "No"}</p>
                        {/* Display other fields... */}
                    </div>
                </div>
            </div>

        </div>
    )
}