import { useCareerForm } from "@/lib/context/CareerFormContext";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";

export default function ({ formType }) {
    const { careerData, currentStep, handleNext, handleBack } = useCareerForm();
    const { orgID } = useAppContext();

    const handleSave = async (status) => {
        const career = {
            ...careerData,
            orgID
        };
        const payload = { ...career, status };



        try {
            const endpoint = formType === 'add' ? '/api/add-career' : '/api/update-career';
            const response = await axios.post(endpoint, payload);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            {currentStep > 1 ? (
                <button onClick={handleBack} className="btn btn-secondary">Back</button>
            ) : <div />}

            {currentStep < 4 && (
                <button onClick={handleNext} className="btn btn-primary">Next</button>
            )}

            {currentStep === 4 && (
                <div style={{display: 'flex', gap: '10px'}}>
                     <button onClick={() => handleSave('inactive')} className="btn btn-secondary">Save as Unpublished</button>
                     <button onClick={() => handleSave('active')} className="btn btn-primary">Save and Publish</button>
                </div>
            )}
        </div>
    )

}