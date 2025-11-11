import { guid } from "@/lib/Utils";
import { useState } from "react";
import { candidateActionToast, errorToast } from "@/lib/Utils";

import { PreScreeningQuestion } from "@/lib/types";

const SUGGESTED_QUESTIONS = [
  {
    title: "Notice Period",
    question: "How long is your notice period?",
    answerType: "dropdown" as const,
    options: ["Immediately", "< 30 days", "> 30 days"],
  },
  {
    title: "Work Setup",
    question: "Are you willing to report to the office when required?",
    answerType: "dropdown" as const,
    options: ["Remote", "On-site", "Hybrid", "Flexible"],
  },
  {
    title: "Asking Salary",
    question: "How much is your expected monthly salary?",
    answerType: "range" as const,
    rangeConfig: {
      min: 30000,
      max: 60000,
      step: 1000,
      minLabel: "₱30,000",
      maxLabel: "₱60,000",
    },
  },
];

export default function PreScreeningQuestionGenerator({
  questions,
  setQuestions,
}: {
  questions: PreScreeningQuestion[];
  setQuestions: (questions: PreScreeningQuestion[]) => void;
}) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Temporary state for editing
  const [tempQuestion, setTempQuestion] = useState("");
  const [tempAnswerType, setTempAnswerType] = useState<
    "short_answer" | "long_answer" | "dropdown" | "checkboxes" | "range"
  >("short_answer");
  const [tempOptions, setTempOptions] = useState<string[]>(["", ""]);
  const [tempRangeConfig, setTempRangeConfig] = useState({
    min: 0,
    max: 10,
    step: 1,
    minLabel: "",
    maxLabel: "",
  });
  const [tempRequired, setTempRequired] = useState(true);

  function startAddNew() {
    setIsAddingNew(true);
    setTempQuestion("");
    setTempAnswerType("short_answer");
    setTempOptions(["", ""]);
    setTempRangeConfig({
      min: 0,
      max: 10,
      step: 1,
      minLabel: "",
      maxLabel: "",
    });
    setTempRequired(true);
  }

  function startEdit(question: PreScreeningQuestion) {
    setEditingQuestionId(question.id);
    setTempQuestion(question.question);
    setTempAnswerType(question.answerType);
    setTempOptions(question.options || ["", ""]);
    setTempRangeConfig(
      question.rangeConfig
        ? {
            min: question.rangeConfig.min,
            max: question.rangeConfig.max,
            step: question.rangeConfig.step,
            minLabel: question.rangeConfig.minLabel || "",
            maxLabel: question.rangeConfig.maxLabel || "",
          }
        : {
            min: 0,
            max: 10,
            step: 1,
            minLabel: "",
            maxLabel: "",
          }
    );
    setTempRequired(question.required);
  }

  function cancelEdit() {
    setEditingQuestionId(null);
    setIsAddingNew(false);
  }

  function saveQuestion() {
    if (!tempQuestion.trim()) {
      errorToast("Please enter a question", 1300);
      return;
    }

    if (tempAnswerType === "dropdown" || tempAnswerType === "checkboxes") {
      const validOptions = tempOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        errorToast("Please provide at least 2 options", 1300);
        return;
      }
    }

    if (tempAnswerType === "range") {
      if (tempRangeConfig.min >= tempRangeConfig.max) {
        errorToast("Maximum value must be greater than minimum value", 1300);
        return;
      }
      if (tempRangeConfig.step <= 0) {
        errorToast("Step value must be greater than 0", 1300);
        return;
      }
    }

    const questionData: PreScreeningQuestion = {
      id: editingQuestionId || guid(),
      question: tempQuestion,
      answerType: tempAnswerType,
      options:
        tempAnswerType === "dropdown" || tempAnswerType === "checkboxes"
          ? tempOptions.filter((opt) => opt.trim().length > 0)
          : [],
      rangeConfig: tempAnswerType === "range" ? tempRangeConfig : undefined,
      required: tempRequired,
    };

    if (isAddingNew) {
      setQuestions([...questions, questionData]);
      candidateActionToast(
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#181D27",
            marginLeft: 8,
          }}
        >
          Question added successfully
        </span>,
        1500,
        <i
          className="la la-check-circle"
          style={{ color: "#039855", fontSize: 32 }}
        ></i>
      );
    } else {
      setQuestions(
        questions.map((q) => (q.id === editingQuestionId ? questionData : q))
      );
    }

    setIsAddingNew(false);
    setEditingQuestionId(null);
  }

  function addSuggestedQuestion(suggestion: any) {
    const newQuestion: PreScreeningQuestion = {
      id: guid(),
      question: suggestion.question,
      answerType: suggestion.answerType,
      options: suggestion.options || [],
      rangeConfig: suggestion.rangeConfig,
      required: true,
    };
    setQuestions([...questions, newQuestion]);
    candidateActionToast(
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#181D27",
          marginLeft: 8,
        }}
      >
        Question added from suggestions
      </span>,
      1500,
      <i
        className="la la-check-circle"
        style={{ color: "#039855", fontSize: 32 }}
      ></i>
    );
  }

  function deleteQuestion(questionId: string) {
    setQuestions(questions.filter((q) => q.id !== questionId));
  }

  function handleReorderQuestions(
    draggedQuestionId: string,
    insertIndex: number
  ) {
    const updatedQuestions = [...questions];
    const draggedIndex = updatedQuestions.findIndex(
      (q) => q.id === draggedQuestionId
    );
    const draggedQuestion = updatedQuestions[draggedIndex];

    updatedQuestions.splice(draggedIndex, 1);
    updatedQuestions.splice(insertIndex, 0, draggedQuestion);
    setQuestions(updatedQuestions);
  }

  const getAnswerTypeLabel = (answerType: string) => {
    const labels = {
      short_answer: "Short Answer",
      long_answer: "Long Answer",
      dropdown: "Dropdown",
      checkboxes: "Checkboxes",
      range: "Range",
    };
    return labels[answerType] || answerType;
  };

  const getAnswerTypeIcon = (answerType: string) => {
    const icons = {
      short_answer: "la-align-left",
      long_answer: "la-align-justify",
      dropdown: "la-caret-down",
      checkboxes: "la-check-square",
      range: "la-sliders-h",
    };
    return icons[answerType] || "la-question";
  };

  const addOption = () => {
    setTempOptions([...tempOptions, ""]);
  };

  const removeOption = (index: number) => {
    if (tempOptions.length > 2) {
      setTempOptions(tempOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...tempOptions];
    newOptions[index] = value;
    setTempOptions(newOptions);
  };

  const renderQuestionCard = (
    question: PreScreeningQuestion | null,
    isNew: boolean
  ) => {
    const isEditing = isNew || editingQuestionId === question?.id;

    if (!isEditing && question) {
      // Display mode
      return (
        <div
          className="question-item"
          key={question.id}
          draggable={true}
          onDragStart={(e) => {
            e.dataTransfer.setData("questionId", question.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            const target = e.currentTarget;
            const bounding = target.getBoundingClientRect();
            const offset = bounding.y + bounding.height / 2;

            if (e.clientY - offset > 0) {
              target.style.borderBottom = "2px solid";
              target.style.borderImage =
                "linear-gradient(90deg, #9fcaed 0%, #ceb6da 33%, #ebacc9 66%, #fccec0 100%) 1";
              target.style.borderTop = "none";
            } else {
              target.style.borderTop = "2px solid";
              target.style.borderImage =
                "linear-gradient(90deg, #9fcaed 0%, #ceb6da 33%, #ebacc9 66%, #fccec0 100%) 1";
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

            const draggedQuestionId = e.dataTransfer.getData("questionId");

            if (draggedQuestionId) {
              const bounding = e.currentTarget.getBoundingClientRect();
              const offset = bounding.y + bounding.height / 2;
              const insertIndex =
                e.clientY - offset > 0
                  ? questions.indexOf(question) + 1
                  : questions.indexOf(question);

              handleReorderQuestions(draggedQuestionId, insertIndex);
            }
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i
                className="la la-grip-vertical"
                style={{ fontSize: 20, color: "#A4A7AE" }}
              ></i>
              <span
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                  fontWeight: 500,
                }}
              >
                {question.question}
              </span>
              {question.required && (
                <span
                  style={{
                    color: "#EF4444",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  *
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginLeft: 28,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  backgroundColor: "#F3F4F6",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <i
                  className={`la ${getAnswerTypeIcon(question.answerType)}`}
                ></i>
                {getAnswerTypeLabel(question.answerType)}
              </span>
              {(question.answerType === "dropdown" ||
                question.answerType === "checkboxes") &&
                question.options && (
                  <span style={{ fontSize: 12, color: "#6B7280" }}>
                    {question.options.length} options
                  </span>
                )}
              {question.answerType === "range" && question.rangeConfig && (
                <span style={{ fontSize: 12, color: "#6B7280" }}>
                  {question.rangeConfig.min} - {question.rangeConfig.max}
                </span>
              )}
            </div>
          </div>

          <div
            className="button-set"
            style={{
              gap: 8,
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <button
              style={{
                background: "#fff",
                border: "1px solid #E9EAEB",
                borderRadius: "60px",
                cursor: "pointer",
                width: "82px",
                height: "36px",
              }}
              onClick={() => startEdit(question)}
            >
              <i className="la la-pencil-alt"></i>
              <span>Edit</span>
            </button>

            <button
              style={{
                color: "#B42318",
                background: "#fff",
                border: "1px solid #B42318",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              onClick={() => deleteQuestion(question.id)}
            >
              <i className="la la-trash text-red" style={{ fontSize: 20 }}></i>
            </button>
          </div>
        </div>
      );
    }

    // Edit mode
    return (
      <div
        key={isNew ? "new" : question?.id}
        style={{
          backgroundColor: "#F9FAFB",
          border: "2px solid #E5E7EB",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          {/* Question manual input */}
          <input
            value={tempQuestion}
            className="form-control"
            onChange={(e) => setTempQuestion(e.target.value)}
            placeholder="Write your question..."
            style={{ flex: 7 }}
          />

          {/* Answer Type */}

          <select
            value={tempAnswerType}
            onChange={(e) => setTempAnswerType(e.target.value as any)}
            style={{
              flex: 3,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #D5D7DA",
              fontSize: "14px",
            }}
          >
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
            <option value="dropdown">Dropdown</option>
            <option value="checkboxes">Checkboxes</option>
            <option value="range">Range</option>
          </select>
        </div>

        {/* Dropdown & Checkboxes Options */}
        {(tempAnswerType === "dropdown" || tempAnswerType === "checkboxes") && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              {tempAnswerType === "checkboxes" ? "Checkbox" : "Dropdown"}{" "}
              Options <span style={{ color: "#EF4444" }}>*</span>
            </label>
            {tempOptions.map((option, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    minWidth: "20px",
                    fontSize: "14px",
                    color: "#6B7280",
                  }}
                >
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    fontSize: "14px",
                  }}
                />
                {tempOptions.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    style={{
                      padding: "8px",
                      borderRadius: "50%",
                      border: "1px solid #B42318",
                      background: "#fff",
                      color: "#B42318",
                      cursor: "pointer",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="la la-times" style={{ fontSize: 16 }}></i>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              style={{
                padding: "8px 16px",
                borderRadius: "60px",
                border: "1px solid #D5D7DA",
                background: "#fff",
                cursor: "pointer",
                marginTop: "8px",
                marginLeft: "28px",
              }}
            >
              <i className="la la-plus" style={{ fontSize: 16 }}></i> Add Option
            </button>
          </div>
        )}

        {/* Range Configuration */}
        {tempAnswerType === "range" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Range Configuration <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Minimum
                </label>
                <input
                  type="number"
                  value={tempRangeConfig.min}
                  onChange={(e) =>
                    setTempRangeConfig({
                      ...tempRangeConfig,
                      min: Number(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Maximum
                </label>
                <input
                  type="number"
                  value={tempRangeConfig.max}
                  onChange={(e) =>
                    setTempRangeConfig({
                      ...tempRangeConfig,
                      max: Number(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Step
                </label>
                <input
                  type="number"
                  value={tempRangeConfig.step}
                  onChange={(e) =>
                    setTempRangeConfig({
                      ...tempRangeConfig,
                      step: Number(e.target.value),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Min Label (optional)
                </label>
                <input
                  type="text"
                  value={tempRangeConfig.minLabel}
                  onChange={(e) =>
                    setTempRangeConfig({
                      ...tempRangeConfig,
                      minLabel: e.target.value,
                    })
                  }
                  placeholder="e.g., ₱30,000"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Max Label (optional)
                </label>
                <input
                  type="text"
                  value={tempRangeConfig.maxLabel}
                  onChange={(e) =>
                    setTempRangeConfig({
                      ...tempRangeConfig,
                      maxLabel: e.target.value,
                    })
                  }
                  placeholder="e.g., ₱60,000"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #D5D7DA",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={tempRequired}
              onChange={(e) => setTempRequired(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span style={{ fontSize: "14px" }}>This question is required</span>
          </label>
        </div>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            style={{
              padding: "8px 16px",
              borderRadius: "60px",
              border: "1px solid #D5D7DA",
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={cancelEdit}
          >
            Cancel
          </button>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: "60px",
              border: "none",
              background: "black",
              color: "white",
              cursor: "pointer",
            }}
            onClick={saveQuestion}
          >
            {isNew ? "Add Question" : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="layered-card-middle">
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="career-label">2. Pre-Screening Questions</span>
            <span style={{ paddingTop: 8 }}>(optional)</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              style={{
                width: "fit-content",
                background: "black",
                color: "#fff",
                border: "1px solid #E9EAEB",
                padding: "8px 16px",
                borderRadius: "60px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={startAddNew}
              disabled={isAddingNew || editingQuestionId !== null}
            >
              <i
                className="la la-plus"
                style={{ fontSize: 20, marginRight: 4, marginTop: -2 }}
              ></i>
              Add Custom
            </button>
          </div>
        </div>
      </div>
      <div className="layered-card-content">
        {/* Questions List */}
        <div className="questions-set">
          {questions.length === 0 && !isAddingNew ? (
            <div
              style={{
                textAlign: "start",
                padding: "5px 5px 20px",
                fontSize: 16,
                fontWeight: 500,
                color: "#414651",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              No pre-screening questions added yet.
            </div>
          ) : (
            <>
              {questions.map((question) => renderQuestionCard(question, false))}
              {isAddingNew && renderQuestionCard(null, true)}
            </>
          )}
        </div>

        {/* Suggested Questions Section */}
        <div
          style={{
            marginTop: 20,
            marginBottom: 20,
            padding: 16,
            backgroundColor: "#F9FAFB",
            borderRadius: 8,
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span className="sub-career-label">
              Suggested Pre-screening Questions:
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SUGGESTED_QUESTIONS.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  border: "1px solid #E5E7EB",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {suggestion.title}
                  </span>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    {suggestion.question}
                  </span>
                </div>
                <button
                  onClick={() => addSuggestedQuestion(suggestion)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "60px",
                    border: "1px solid #D5D7DA",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    marginLeft: 16,
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
