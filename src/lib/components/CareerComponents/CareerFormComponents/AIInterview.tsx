import { useCareerForm } from "@/lib/context/CareerFormContext";
import InterviewQuestionGeneratorV2 from "../InterviewQuestionGeneratorV2";

export default function () {
    const { careerData, updateCareerData } = useCareerForm();
    const handleQuestionsChange = (newQuestions) => {
        updateCareerData({ ...careerData, questions: newQuestions });
    }
    return (
        <div>
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                    <div className="layered-card-content">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Require Video Interview</span>
                            <label className="switch">
                                <input type="checkbox" checked={careerData.requireVideo} onChange={() => updateCareerData({ ...careerData, requireVideo: !careerData.requireVideo })} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <span style={{fontSize: 16, color: "#181D27", fontWeight: 700}}>AI Interview Secret Prompt (Optional)</span>
                        <span>Provide custom instructions for the AI interviewer.</span>
                        <textarea
                            className="form-control"
                            rows={5}
                            placeholder="e.g., 'Act as a senior engineering manager. Be direct and technical. Ask follow-up questions about scalability if the candidate mentions system design.'"
                            value={careerData.aiInterviewSecretPrompt}
                            onChange={(e) => updateCareerData({ ...careerData, aiInterviewSecretPrompt: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <InterviewQuestionGeneratorV2
                questions={careerData.questions || []}
                setQuestions={handleQuestionsChange}
                jobTitle={careerData.jobTitle}
                description={careerData.description} />
        </div>
    );
}
