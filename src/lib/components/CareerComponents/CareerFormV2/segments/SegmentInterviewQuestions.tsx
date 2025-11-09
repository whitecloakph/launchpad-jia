"use client";

import InterviewQuestionGeneratorV2 from "../../InterviewQuestionGeneratorV2";

export default function SegmentInterviewQuestions({
  questions,
  setQuestions,
  jobTitle,
  description,
}: {
  questions: any[];
  setQuestions: (questions: any[]) => void;
  jobTitle: string;
  description: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <InterviewQuestionGeneratorV2
        questions={questions}
        setQuestions={setQuestions}
        jobTitle={jobTitle}
        description={description}
      />
    </div>
  );
}
