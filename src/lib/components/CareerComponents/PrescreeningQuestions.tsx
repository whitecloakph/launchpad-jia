"use client";

import {
  COLOR_BG_LIGHT,
  COLOR_BORDER_DARK,
  COLOR_BORDER_LIGHT,
  COLOR_BORDER_MEDIUM,
  COLOR_ERROR,
  COLOR_TEXT_TERTIARY,
} from "@/lib/styles/variables";
import { useState } from "react";

interface PrescreeningQuestion {
  id: string;
  question: string;
  options?: string[];
  type: "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range";
  rangeMin?: number;
  rangeMax?: number;
  currency?: string;
}

interface PrescreeningQuestionsProps {
  questions: PrescreeningQuestion[];
  setQuestions: (questions: PrescreeningQuestion[]) => void;
  showHeaderControls?: boolean;
  externalShowAddForm?: boolean;
  setExternalShowAddForm?: (show: boolean) => void;
}

export default function PrescreeningQuestions({
  questions,
  setQuestions,
  showHeaderControls = true,
  externalShowAddForm,
  setExternalShowAddForm,
}: PrescreeningQuestionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>([""]);
  const [questionType, setQuestionType] = useState<
    "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range"
  >("dropdown");
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("PHP");
  const [internalShowAddForm, setInternalShowAddForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Use external state if provided, otherwise use internal state
  const showAddForm =
    externalShowAddForm !== undefined
      ? externalShowAddForm
      : internalShowAddForm;
  const setShowAddForm = setExternalShowAddForm || setInternalShowAddForm;

  const addQuestion = () => {
    const needsOptions =
      questionType === "dropdown" || questionType === "checkboxes";
    const needsRange = questionType === "range";

    if (!newQuestion.trim()) return;
    if (needsOptions && newOptions.filter((opt) => opt.trim()).length < 1)
      return;
    if (needsRange && (!rangeMin || !rangeMax || rangeMin >= rangeMax)) return;

    const question: PrescreeningQuestion = {
      id: Date.now().toString(),
      question: newQuestion,
      type: questionType,
      ...(needsOptions && { options: newOptions.filter((opt) => opt.trim()) }),
      ...(needsRange && { rangeMin, rangeMax, currency }),
    };
    setQuestions([...questions, question]);
    resetForm();
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const resetForm = () => {
    setNewQuestion("");
    setNewOptions([""]);
    setQuestionType("dropdown");
    setRangeMin(0);
    setRangeMax(0);
    setCurrency("PHP");
    setShowAddForm(false);
    setEditingId(null);
  };

  const addOption = () => {
    setNewOptions([...newOptions, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const removeOption = (index: number) => {
    if (newOptions.length > 1) {
      setNewOptions(newOptions.filter((_, i) => i !== index));
    }
  };

  const suggestedQuestions = [
    {
      title: "Notice Period",
      question: "How long is your notice period?",
      type: "dropdown" as const,
      options: [
        "Immediate",
        "1 week",
        "2 weeks",
        "1 month",
        "2 months",
        "3 months",
      ],
    },
    {
      title: "Work Setup",
      question: "How often are you willing to report to the office each week?",
      type: "dropdown" as const,
      options: [
        "Fully remote",
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days (Onsite)",
      ],
    },
    {
      title: "Asking Salary",
      question: "How much is your expected monthly salary?",
      type: "range" as const,
      rangeMin: 40000,
      rangeMax: 90000,
      currency: "PHP",
    },
  ];

  const isSuggestedQuestionAdded = (suggestedTitle: string) => {
    const suggested = suggestedQuestions.find(
      (sq) => sq.title === suggestedTitle
    );
    if (!suggested) return false;

    return questions.some((q) => q.question === suggested.question);
  };

  // Add a suggested question with pre-filled data
  const addSuggestedQuestion = (index: number) => {
    const suggested = suggestedQuestions[index];

    const newQuestion: PrescreeningQuestion = {
      id: Date.now().toString(),
      question: suggested.question,
      type: suggested.type,
      ...(suggested.options && { options: suggested.options }),
      ...(suggested.type === "range" && {
        rangeMin: suggested.rangeMin,
        rangeMax: suggested.rangeMax,
        currency: suggested.currency,
      }),
    };

    setQuestions([...questions, newQuestion]);
  };

  // Add a blank custom question
  const addBlankCustomQuestion = () => {
    const newQuestion: PrescreeningQuestion = {
      id: Date.now().toString(),
      question: "",
      type: "dropdown",
      options: [""],
    };

    setQuestions([...questions, newQuestion]);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedQuestions = [...questions];
    const draggedItem = updatedQuestions[draggedIndex];
    updatedQuestions.splice(draggedIndex, 1);
    updatedQuestions.splice(index, 0, draggedItem);

    setQuestions(updatedQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div style={{ width: "100%" }}>
      {showHeaderControls && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#181D27" }}>
              (optional)
            </span>
            {questions.length > 0 && (
              <span
                style={{
                  padding: "2px 10px",
                  backgroundColor: "#F3F4F6",
                  borderRadius: "12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B7280",
                }}
              >
                {questions.length}
              </span>
            )}
          </div>
          <button
            onClick={addBlankCustomQuestion}
            style={{
              padding: "8px 16px",
              backgroundColor: "#181D27",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="la la-plus"></i>
            Add custom
          </button>
        </div>
      )}

      {questions.length === 0 && (
        <p
          style={{
            margin: "0 0 16px 0",
            color: "#6B7280",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          No pre-screening questions added yet.
        </p>
      )}

      {questions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {questions.map((q, index) => (
            <div
              key={q.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                backgroundColor: "#FFFFFF",
                marginBottom: 12,
                cursor: draggedIndex === index ? "grabbing" : "grab",
                opacity: draggedIndex === index ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Drag handle icon */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "grab",
                    color: "#9CA3AF",
                    fontSize: 16,
                    padding: "4px 0",
                  }}
                >
                  <i className="la la-braille"></i>
                </div>
                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    flex: 1,
                  }}
                >
                  {/* Question and type on same line */}
                  <div
                    style={{
                      backgroundColor: COLOR_BG_LIGHT,
                      display: "flex",
                      gap: 12,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Write your question..."
                      value={q.question}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index] = {
                          ...q,
                          question: e.target.value,
                        };
                        setQuestions(updatedQuestions);
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: 14,
                        fontFamily: "inherit",
                        backgroundColor: "transparent",
                      }}
                    />
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index] = {
                          ...q,
                          type: e.target.value as PrescreeningQuestion["type"],
                        };
                        setQuestions(updatedQuestions);
                      }}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer",
                        color: "#6B7280",
                      }}
                    >
                      <option value="short-answer">Short Answer</option>
                      <option value="long-answer">Long Answer</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="checkboxes">Checkboxes</option>
                      <option value="range">Range</option>
                    </select>
                  </div>

                  {/* Options for dropdown/checkboxes - displayed as simple list */}
                  {(q.type === "dropdown" || q.type === "checkboxes") &&
                    q.options &&
                    q.options.length > 0 && (
                      <div
                        style={{
                          padding: 16,
                          borderBottom: `1px solid ${COLOR_BORDER_LIGHT}`,
                        }}
                      >
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={optIndex}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                              paddingLeft: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                border: `1px solid ${COLOR_BORDER_MEDIUM}`,
                                borderRadius: 8,
                                width: "100%",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: 8,
                                  fontSize: 13,
                                  width: 24,
                                  color: "#6B7280",
                                }}
                              >
                                {optIndex + 1}
                              </span>
                              <input
                                type="text"
                                placeholder={`Option ${optIndex + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const updatedQuestions = [...questions];
                                  const updatedOptions = [
                                    ...(updatedQuestions[index].options || []),
                                  ];
                                  updatedOptions[optIndex] = e.target.value;
                                  updatedQuestions[index] = {
                                    ...q,
                                    options: updatedOptions,
                                  };
                                  setQuestions(updatedQuestions);
                                }}
                                style={{
                                  flex: 1,
                                  padding: "4px 8px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  fontSize: 13,
                                  color: "#181D27",
                                  fontFamily: "inherit",
                                  borderLeft: `1px solid ${COLOR_BORDER_MEDIUM}`,
                                }}
                              />
                            </div>
                            <button
                              onClick={() => {
                                const updatedQuestions = [...questions];
                                const updatedOptions = [
                                  ...(updatedQuestions[index].options || []),
                                ];
                                updatedOptions.splice(optIndex, 1);
                                updatedQuestions[index] = {
                                  ...q,
                                  options: updatedOptions,
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#9CA3AF",
                                fontSize: 14,
                                padding: "4px",
                              }}
                            >
                              <i className="la la-times"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updatedQuestions = [...questions];
                            const updatedOptions = [
                              ...(updatedQuestions[index].options || []),
                            ];
                            updatedOptions.push("");
                            updatedQuestions[index] = {
                              ...q,
                              options: updatedOptions,
                            };
                            setQuestions(updatedQuestions);
                          }}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "transparent",
                            color: COLOR_TEXT_TERTIARY,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 400,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginLeft: 18,
                          }}
                        >
                          <i className="la la-plus"></i>
                          Add Option
                        </button>
                      </div>
                    )}

                  {/* Range fields */}
                  {q.type === "range" && (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 12,
                              color: "#6B7280",
                              marginBottom: 4,
                            }}
                          >
                            Minimum
                          </label>
                          <div style={{ display: "flex", gap: 4 }}>
                            <select
                              value={q.currency || "PHP"}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  currency: e.target.value,
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                padding: "8px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 14,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <option value="PHP">₱</option>
                              <option value="USD">$</option>
                            </select>
                            <input
                              type="number"
                              placeholder="40,000"
                              value={q.rangeMin || ""}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  rangeMin: Number(e.target.value),
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 14,
                              }}
                            />
                            <select
                              value={q.currency || "PHP"}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  currency: e.target.value,
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                padding: "8px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 14,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <option value="PHP">PHP</option>
                              <option value="USD">USD</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 12,
                              color: "#6B7280",
                              marginBottom: 4,
                            }}
                          >
                            Maximum
                          </label>
                          <div style={{ display: "flex", gap: 4 }}>
                            <select
                              value={q.currency || "PHP"}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  currency: e.target.value,
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                padding: "8px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 14,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <option value="PHP">₱</option>
                              <option value="USD">$</option>
                            </select>
                            <input
                              type="number"
                              placeholder="90,000"
                              value={q.rangeMax || ""}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  rangeMax: Number(e.target.value),
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 14,
                              }}
                            />
                            <select
                              value={q.currency || "PHP"}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  currency: e.target.value,
                                };
                                setQuestions(updatedQuestions);
                              }}
                              style={{
                                padding: "8px",
                                border: "1px solid #E5E7EB",
                                borderRadius: "6px",
                                fontSize: 14,
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <option value="PHP">PHP</option>
                              <option value="USD">USD</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delete button at bottom left */}
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    style={{
                      margin: "16px 16px 16px auto",
                      padding: "6px 12px",
                      backgroundColor: "transparent",
                      color: COLOR_ERROR,
                      border: `1px solid ${COLOR_ERROR}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="la la-trash"></i>
                    Delete Question
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Write your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ width: "200px" }}>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: 14,
                  fontFamily: "inherit",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <option value="short-answer">Short Answer</option>
                <option value="long-answer">Long Answer</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkboxes">Checkboxes</option>
                <option value="range">Range</option>
              </select>
            </div>
          </div>

          {(questionType === "dropdown" || questionType === "checkboxes") && (
            <div style={{ marginBottom: 16 }}>
              {newOptions.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      minWidth: "20px",
                    }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      fontSize: 14,
                      fontFamily: "inherit",
                    }}
                  />
                  {newOptions.length > 1 && (
                    <button
                      onClick={() => removeOption(index)}
                      style={{
                        background: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        padding: "4px",
                      }}
                    >
                      <i
                        style={{
                          color: COLOR_TEXT_TERTIARY,
                        }}
                        className="la la-times"
                      ></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  color: "#181D27",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginLeft: "28px",
                }}
              >
                <i className="la la-plus"></i>
                Add Option
              </button>
            </div>
          )}

          {questionType === "range" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    Minimum
                  </label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 14,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <option value="PHP">₱</option>
                      <option value="USD">$</option>
                    </select>
                    <input
                      type="number"
                      placeholder="40,000"
                      value={rangeMin || ""}
                      onChange={(e) => setRangeMin(Number(e.target.value))}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 14,
                      }}
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 14,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <option value="PHP">PHP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    Maximum
                  </label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 14,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <option value="PHP">₱</option>
                      <option value="USD">$</option>
                    </select>
                    <input
                      type="number"
                      placeholder="90,000"
                      value={rangeMax || ""}
                      onChange={(e) => setRangeMax(Number(e.target.value))}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 14,
                      }}
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{
                        padding: "8px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: 14,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <option value="PHP">PHP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {}}
                style={{
                  marginTop: 12,
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  color: "#EF4444",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <i className="la la-trash"></i>
                Delete Question
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggested Pre-screening Questions - Always at the bottom */}
      {(questions.length > 0 || showAddForm) && (
        <hr
          style={{
            border: `1px solid ${COLOR_BORDER_LIGHT}`,
            margin: "1.5em 0",
          }}
        />
      )}

      <div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#181D27",
            margin: "0 0 12px 0",
          }}
        >
          Suggested Pre-screening Questions:
        </p>
        {suggestedQuestions.map((sq, index) => {
          const isAdded = isSuggestedQuestionAdded(sq.title);

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 0",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#181D27",
                  }}
                >
                  {sq.title}
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: 14,
                    color: "#6B7280",
                  }}
                >
                  {sq.question}
                </p>
              </div>
              <button
                onClick={() => !isAdded && addSuggestedQuestion(index)}
                disabled={isAdded}
                style={{
                  padding: "6px 20px",
                  backgroundColor: isAdded ? "#F3F4F6" : "#FFFFFF",
                  color: isAdded ? "#9CA3AF" : "#181D27",
                  border: `1px solid ${isAdded ? "#E5E7EB" : "#D1D5DB"}`,
                  borderRadius: "20px",
                  cursor: isAdded ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  marginLeft: 16,
                }}
              >
                {isAdded ? "Added" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
