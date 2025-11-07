import { useCareerForm } from '@/lib/context/CareerFormContext';

export default function NavigationButtons({ formType }) {
    const {
        currentStep,
        handleNext,
        handleBack,
        confirmSaveCareer, // This will trigger the modal
        isFormValid,
        isSavingCareer,
    } = useCareerForm();

    return (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            {currentStep > 1 ? (
                <button onClick={handleBack} className="btn btn-secondary">Back</button>
            ) : <div />}

            {currentStep < 4 ? ( // Next button logic
                <button
                    onClick={handleNext}
                    className="btn btn-primary"
                    disabled={isSavingCareer} // Disable if saving is in progress
                >
                    Next
                </button>
            ) : ( // Final step buttons (Save/Publish)
                <div style={{display: 'flex', gap: '10px'}}>
                     {formType === "add" ? (
                        <>
                            <button
                                onClick={() => confirmSaveCareer('inactive')}
                                className="btn btn-secondary"
                                disabled={!isFormValid() || isSavingCareer}
                            >
                                Save as Unpublished
                            </button>
                            <button
                                onClick={() => confirmSaveCareer('active')}
                                className="btn btn-primary"
                                disabled={!isFormValid() || isSavingCareer}
                            >
                                Save and Publish
                            </button>
                        </>
                    ) : ( // Edit form type
                        <>
                            <button
                                onClick={() => confirmSaveCareer('inactive')}
                                className="btn btn-secondary"
                                disabled={!isFormValid() || isSavingCareer}
                            >
                                Save Changes as Unpublished
                            </button>
                            <button
                                onClick={() => confirmSaveCareer('active')}
                                className="btn btn-primary"
                                disabled={!isFormValid() || isSavingCareer}
                            >
                                Save Changes as Published
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}