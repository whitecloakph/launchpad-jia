"use client";

import { useState } from "react";
import styles from "@/lib/styles/screens/careerFormStep2.module.scss";

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
        "Immediately",
        "< 30 days",
        "> 30 days",
      ],
    },
    {
      title: "Work Setup",
      question: "How often are you willing to report to the office each week?",
      type: "dropdown" as const,
      options: [
        "At most 1-2x a week",
        "At most 3-4x a week",
        "Open to fully onsite work",
        "Only open to fully remote work",
      ],
    },
    {
      title: "Asking Salary",
      question: "How much is your expected monthly salary?",
      type: "range" as const,
      rangeMin: 40000,
      rangeMax: 60000,
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
    <div className={styles.prescreeningContainer}>
      {showHeaderControls && (
        <div className={styles.prescreeningHeader}>
          <div className={styles.prescreeningHeaderLeft}>
            <span className={styles.prescreeningOptionalText}>
              (optional)
            </span>
            {questions.length > 0 && (
              <span className={styles.prescreeningCountBadge}>
                {questions.length}
              </span>
            )}
          </div>
          <button
            onClick={addBlankCustomQuestion}
            className={styles.addCustomButton}
          >
            <i className="la la-plus"></i>
            Add custom
          </button>
        </div>
      )}

      {questions.length === 0 && (
        <p className={styles.prescreeningEmptyText}>
          No pre-screening questions added yet.
        </p>
      )}

      {questions.length > 0 && (
        <div className={styles.questionsListContainer}>
          {questions.map((q, index) => (
            <div
              key={q.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`${styles.questionItemWrapper} ${draggedIndex === index ? styles.dragging : ''}`}
            >
              <div className={styles.questionItemInner}>
                {/* Drag handle icon */}
                <div className={styles.dragHandle}>
                  <i className="la la-braille"></i>
                </div>
                <div className={styles.questionCard}>
                  {/* Question and type on same line */}
                  <div className={styles.questionHeaderRow}>
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
                      className={styles.questionInput}
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
                      className={styles.questionTypeSelect}
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
                      <div className={styles.optionsContainer}>
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className={styles.optionItem}>
                            <div className={styles.optionInputWrapper}>
                              <span className={styles.optionNumber}>
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
                                className={styles.optionInput}
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
                              className={styles.optionRemoveButton}
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
                          className={styles.addOptionButton}
                        >
                          <i className="la la-plus"></i>
                          Add Option
                        </button>
                      </div>
                    )}

                  {/* Range fields */}
                  {q.type === "range" && (
                    <div className={styles.rangeFieldsContainer}>
                      <div className={styles.rangeFieldsInner}>
                        <div className={styles.rangeFieldWrapper}>
                          <label className={styles.rangeLabel}>
                            Minimum Salary
                          </label>
                          <div className={styles.rangeInputWithSymbols}>
                            <span className={styles.currencySymbolLeft}>
                              {q.currency === "USD" ? "$" : "₱"}
                            </span>
                            <input
                              type="number"
                              placeholder="0"
                              value={q.rangeMin || ""}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  rangeMin: Number(e.target.value),
                                };
                                setQuestions(updatedQuestions);
                              }}
                              className={styles.rangeInputStyled}
                            />
                            <span className={styles.currencyCodeRight}>
                              {q.currency || "PHP"}
                            </span>
                          </div>
                        </div>
                        <div className={styles.rangeFieldWrapper}>
                          <label className={styles.rangeLabel}>
                            Maximum Salary
                          </label>
                          <div className={styles.rangeInputWithSymbols}>
                            <span className={styles.currencySymbolLeft}>
                              {q.currency === "USD" ? "$" : "₱"}
                            </span>
                            <input
                              type="number"
                              placeholder="0"
                              value={q.rangeMax || ""}
                              onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[index] = {
                                  ...q,
                                  rangeMax: Number(e.target.value),
                                };
                                setQuestions(updatedQuestions);
                              }}
                              className={styles.rangeInputStyled}
                            />
                            <span className={styles.currencyCodeRight}>
                              {q.currency || "PHP"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delete button at bottom left */}
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className={styles.deleteQuestionButton}
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
        <div className={styles.addFormContainer}>
          <div className={styles.addFormTopRow}>
            <div className={styles.addFormInputWrapper}>
              <input
                type="text"
                placeholder="Write your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className={styles.addFormInput}
              />
            </div>
            <div className={styles.addFormSelectWrapper}>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className={styles.addFormSelect}
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
            <div className={styles.addFormOptionsContainer}>
              {newOptions.map((option, index) => (
                <div key={index} className={styles.addFormOptionItem}>
                  <span className={styles.addFormOptionNumber}>
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={styles.addFormOptionInput}
                  />
                  {newOptions.length > 1 && (
                    <button
                      onClick={() => removeOption(index)}
                      className={styles.addFormOptionRemoveButton}
                    >
                      <i className="la la-times"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                className={styles.addFormAddOptionButton}
              >
                <i className="la la-plus"></i>
                Add Option
              </button>
            </div>
          )}

          {questionType === "range" && (
            <div className={styles.addFormRangeContainer}>
              <div className={styles.rangeFieldsInner}>
                <div className={styles.rangeFieldWrapper}>
                  <label className={styles.rangeLabel}>
                    Minimum Salary
                  </label>
                  <div className={styles.rangeInputWithSymbols}>
                    <span className={styles.currencySymbolLeft}>
                      {currency === "USD" ? "$" : "₱"}
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={rangeMin || ""}
                      onChange={(e) => setRangeMin(Number(e.target.value))}
                      className={styles.rangeInputStyled}
                    />
                    <span className={styles.currencyCodeRight}>
                      {currency}
                    </span>
                  </div>
                </div>
                <div className={styles.rangeFieldWrapper}>
                  <label className={styles.rangeLabel}>
                    Maximum Salary
                  </label>
                  <div className={styles.rangeInputWithSymbols}>
                    <span className={styles.currencySymbolLeft}>
                      {currency === "USD" ? "$" : "₱"}
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={rangeMax || ""}
                      onChange={(e) => setRangeMax(Number(e.target.value))}
                      className={styles.rangeInputStyled}
                    />
                    <span className={styles.currencyCodeRight}>
                      {currency}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {}}
                className={styles.addFormDeleteButton}
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
        <hr className={styles.suggestedQuestionsHr} />
      )}

      <div>
        <p className={styles.suggestedQuestionsTitle}>
          Suggested Pre-screening Questions:
        </p>
        {suggestedQuestions.map((sq, index) => {
          const isAdded = isSuggestedQuestionAdded(sq.title);

          return (
            <div key={index} className={styles.suggestedQuestionItem}>
              <div className={styles.suggestedQuestionContent}>
                <p className={styles.suggestedQuestionTitle}>
                  {sq.title}
                </p>
                <p className={styles.suggestedQuestionText}>
                  {sq.question}
                </p>
              </div>
              <button
                onClick={() => !isAdded && addSuggestedQuestion(index)}
                disabled={isAdded}
                className={`${styles.suggestedQuestionButton} ${isAdded ? styles.added : ''}`}
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
