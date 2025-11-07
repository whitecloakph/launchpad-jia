import { useCareerForm } from "@/lib/context/CareerFormContext";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

export default function () {
    const { careerData, updateCareerData } = useCareerForm();
    const screeningSettingList = [
        { name: "Good Fit and above" },
        { name: "Only Strong Fit" },
        { name: "No Automatic Promotion" },
    ];

    return (
        <div>
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                    <div className="layered-card-content">
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>CV Screening</span>
                        <span>This allows Jia to automatically endorse candidates who meet the chosen criteria.</span>
                        <CustomDropdown
                            onSelectSetting={(setting) => updateCareerData({ ...careerData, screeningSetting: setting })}
                            screeningSetting={careerData.screeningSetting}
                            settingList={screeningSettingList}
                        />

                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>CV Evaluation Secret Prompt (Optional)</span>
                        <span>Provide custom instructions for the AI to evaluate CVs, focusing on specific skills or experiences not covered by the job description.</span>
                        <textarea
                            className="form-control"
                            rows={5}
                            placeholder="e.g., 'Prioritize candidates with experience in B2B SaaS marketing. Check for specific metrics like customer acquisition cost (CAC) reduction in their past roles.'"
                            value={careerData.cvSecretPrompt}
                            onChange={(e) => updateCareerData({ ...careerData, cvSecretPrompt: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Prescreening Questions */}
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                    <div className="layered-card-content">
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>Pre-screening Questions (Optional)</span>
                        {/** TODO: Add pre-screening questions ui */}
                        <button className="btn btn-primary">Add Question</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
