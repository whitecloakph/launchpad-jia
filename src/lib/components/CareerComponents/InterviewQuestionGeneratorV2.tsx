import { guid } from "@/lib/Utils";
import Swal from "sweetalert2";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  errorToast,
  interviewQuestionCategoryMap,
  candidateActionToast,
} from "@/lib/Utils";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";

export default function (props) {
  const { questions, setQuestions, jobTitle, description, showValidation } = props;
  const [questionGenPrompt, setQuestionGenPrompt] = useState("");
  const questionCount = 5;
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [tempQuestionText, setTempQuestionText] = useState("");

  function addQuestion(groupId: number, newQuestion: string) {
    const categoryIndex = questions.findIndex((q) => q.id === groupId);
    if (categoryIndex !== -1) {
      const newQuestionId = guid();
      const updatedQuestions = [...questions];
      updatedQuestions[categoryIndex].questions = [
        ...updatedQuestions[categoryIndex].questions,
        {
          id: newQuestionId,
          question: newQuestion,
        },
      ];

      setQuestions(updatedQuestions);
      return newQuestionId;
    }
    return null;
  }

  function editQuestion(groupId, updatedQuestion, questionId) {
    const categoryIndex = questions.findIndex((q) => q.id === groupId);

    const updatedQuestions = [...questions];
    if (categoryIndex !== -1) {
      updatedQuestions[categoryIndex].questions = updatedQuestions[
        categoryIndex
      ].questions.map((q) =>
        q.id === questionId ? { ...q, question: updatedQuestion } : q
      );
    }

    setQuestions(updatedQuestions);
  }

  function deleteQuestion(groupId, questionId) {
    const categoryIndex = questions.findIndex((q) => q.id === groupId);
    const updatedQuestions = [...questions];

    if (categoryIndex !== -1) {
      let categoryToUpdate = updatedQuestions[categoryIndex];
      categoryToUpdate.questions = categoryToUpdate.questions.filter(
        (q) => q.id !== questionId
      );
      if (
        categoryToUpdate.questionCountToAsk !== null &&
        categoryToUpdate.questionCountToAsk > categoryToUpdate.questions.length
      ) {
        categoryToUpdate.questionCountToAsk = categoryToUpdate.questions.length;
      }
    }
    setQuestions(updatedQuestions);
  }

  async function generateAllQuestions() {
    try {
      if (!jobTitle.trim() || !description.trim()) {
        errorToast("Please fill in all fields", 1500);
        return;
      }

      setIsGeneratingQuestions(true);

      const interviewCategories = Object.keys(interviewQuestionCategoryMap);
      const response = await axios.post("/api/llm-engine", {
        systemPrompt:
          "You are a helpful assistant that can answer questions and help with tasks.",
        prompt: `Generate ${
          questionCount * interviewCategories.length
        } interview questions for the following Job opening: 
        Job Title:
        ${jobTitle} 
        Job Description:
        ${description}
  
        ${interviewCategories
          .map((category) => {
            return `Category:
          ${category}
          Category Description:
          ${interviewQuestionCategoryMap[category].description}`;
          })
          .join("\n")}
  
        ${interviewCategories
          .map((category) => `${questionCount} questions for ${category}`)
          .join(", ")}

        ${
          questions.reduce((acc, group) => acc + group.questions.length, 0) > 0
            ? `Do not generate questions that are already covered in this list:\n${questions
                .map((group) =>
                  group.questions
                    .map(
                      (question, index) =>
                        `          ${index + 1}. ${question.question}`
                    )
                    .join("\n")
                )
                .join("\n")}`
            : ""
        }
        
        return it in json format following this for each element {category: "category", questions: ["question1", "question2", "question3", "question4", "question5"]}
        return only the json array, nothing else, now markdown format just pure json code.
        `,
      });

      let finalGeneratedQuestions = response.data.result;

      finalGeneratedQuestions = finalGeneratedQuestions.replace("```json", "");
      finalGeneratedQuestions = finalGeneratedQuestions.replace("```", "");

      finalGeneratedQuestions = JSON.parse(finalGeneratedQuestions);
      console.log(finalGeneratedQuestions);

      let newArray = [...questions];

      finalGeneratedQuestions.forEach((questionGroup) => {
        const categoryIndex = newArray.findIndex(
          (q) => q.category === questionGroup.category
        );

        if (categoryIndex !== -1) {
          const newQuestions = questionGroup.questions.map((q) => ({
            id: guid(),
            question: q,
          }));
          newArray[categoryIndex].questions = [
            ...newArray[categoryIndex].questions,
            ...newQuestions,
          ];
        }
      });

      setQuestions(newArray);

      candidateActionToast(
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#181D27",
            marginLeft: 8,
          }}
        >
          Questions generated successfully
        </span>,
        1500,
        <i
          className="la la-check-circle"
          style={{ color: "#039855", fontSize: 32 }}
        ></i>
      );
    } catch (err) {
      console.log(err);
      errorToast("Error generating questions, please try again", 1500);
    } finally {
      setIsGeneratingQuestions(false);
    }
  }

  async function generateQuestions(groupCategory: string) {
    try {
      if (!jobTitle.trim() || !description.trim()) {
        errorToast("Please fill in all fields", 1500);
        return;
      }

      setIsGeneratingQuestions(true);

      const interviewQuestionCategory =
        interviewQuestionCategoryMap[groupCategory];
      const response = await axios.post("/api/llm-engine", {
        systemPrompt:
          "You are a helpful assistant that can answer questions and help with tasks.",
        prompt: `Generate ${questionCount} interview questions for the following Job opening: 
          Job Title:
          ${jobTitle} 
          Job Description:
          ${description}
    
          Interview Category:
          ${groupCategory}
          Interview Category Description:
          ${interviewQuestionCategory.description}
    
          The ${questionCount} interview questions should be related to the job description and follow the scope of the interview category.

          ${
            questions.reduce((acc, group) => acc + group.questions.length, 0) >
            0
              ? `Do not generate questions that are already covered in this list:\n${questions
                  .map((group) =>
                    group.questions
                      .map(
                        (question, index) =>
                          `          ${index + 1}. ${question.question}`
                      )
                      .join("\n")
                  )
                  .join("\n")}`
              : ""
          }
          
          return it as a json object following this format for the category {category: "${groupCategory}", questions: ["question1", "question2", "question3"]}
          
          ${questionGenPrompt}
          `,
      });

      let finalGeneratedQuestions = response.data.result;

      finalGeneratedQuestions = finalGeneratedQuestions.replace("```json", "");
      finalGeneratedQuestions = finalGeneratedQuestions.replace("```", "");

      finalGeneratedQuestions = JSON.parse(finalGeneratedQuestions);
      console.log(finalGeneratedQuestions);

      let newArray = [...questions];

      const categoryIndex = newArray.findIndex(
        (q) => q.category === finalGeneratedQuestions.category
      );

      if (categoryIndex !== -1) {
        const newQuestions = finalGeneratedQuestions.questions.map((q) => ({
          id: guid(),
          question: q,
        }));
        newArray[categoryIndex].questions = [
          ...newArray[categoryIndex].questions,
          ...newQuestions,
        ];
      }

      setQuestions(newArray);

      candidateActionToast(
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#181D27",
            marginLeft: 8,
          }}
        >
          Questions generated successfully
        </span>,
        1500,
        <i
          className="la la-check-circle"
          style={{ color: "#039855", fontSize: 32 }}
        ></i>
      );
    } catch (err) {
      console.log(err);
      errorToast("Error generating questions, please try again", 1500);
    } finally {
      setIsGeneratingQuestions(false);
    }
  }

  function handleReorderCategories(
    draggedCategoryId: number,
    dropIndex: number
  ) {
    const updatedQuestions = [...questions];
    const draggedCategoryIndex = updatedQuestions.findIndex(
      (q) => q.id === draggedCategoryId
    );
    const draggedCategory = updatedQuestions[draggedCategoryIndex];

    // Remove the dragged category from the array
    updatedQuestions.splice(draggedCategoryIndex, 1);

    updatedQuestions.splice(dropIndex, 0, draggedCategory);
    setQuestions(updatedQuestions);
  }

  function handleReorderQuestions(
    draggedQuestionId: string,
    fromCategoryId: number,
    toCategoryId: number,
    insertIndex?: number
  ) {
    const updatedQuestions = [...questions];

    // Find source category and question
    const fromCategoryIndex = updatedQuestions.findIndex(
      (q) => q.id === fromCategoryId
    );
    const categoryOrigin = updatedQuestions[fromCategoryIndex];
    const questionIndex = categoryOrigin.questions.findIndex(
      (q) => q.id.toString() === draggedQuestionId
    );
    const questionToMove = categoryOrigin.questions[questionIndex];

    // Remove from source category
    categoryOrigin.questions.splice(questionIndex, 1);

    // If moving within the same category
    if (fromCategoryId === toCategoryId) {
      // Insert at the specified index
      const targetIndex = insertIndex ?? 0;
      categoryOrigin.questions.splice(targetIndex, 0, questionToMove);
    } else {
      // Moving to different category - add to end
      const toCategoryIndex = updatedQuestions.findIndex(
        (q) => q.id === toCategoryId
      );
      updatedQuestions[toCategoryIndex].questions.push(questionToMove);

      if (
        categoryOrigin.questionCountToAsk !== null &&
        categoryOrigin.questionCountToAsk > categoryOrigin.questions.length
      ) {
        categoryOrigin.questionCountToAsk = categoryOrigin.questions.length;
      }
    }

    setQuestions(updatedQuestions);
  }

  async function fetchInstructionPrompt() {
    const configData = await axios
      .post("/api/fetch-global-settings", {
        fields: { question_gen_prompt: 1 },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("[Question Generator Fetch Prompt Error]", err);
        return null;
      });

    // Check if configData exists and has the expected structure before accessing
    if (
      configData &&
      configData.question_gen_prompt &&
      configData.question_gen_prompt.prompt
    ) {
      setQuestionGenPrompt(configData.question_gen_prompt.prompt);
    }
  }

  useEffect(() => {
    fetchInstructionPrompt();
  }, []);

  const totalQuestions = questions.reduce((acc, group) => acc + group.questions.length, 0);
  const hasMinimumQuestions = totalQuestions >= 5;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginLeft: 8,
          padding: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#181D27",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 600 }}>
              2.
            </span>
          </div>
          <span style={{ fontSize: 16, color: "#181D27", fontWeight: 700 }}>
            AI Interview Questions
          </span>
          {totalQuestions > 0 && (
            <div
              style={{
                borderRadius: "50%",
                width: 30,
                height: 22,
                border: "1px solid #D5D9EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                backgroundColor: "#F8F9FC",
                color: "#181D27",
                fontWeight: 700,
              }}
            >
              {totalQuestions}
            </div>
          )}
        </div>
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
          onClick={() => {
            generateAllQuestions();
          }}
        >
          <i className="la la-bolt" style={{ fontSize: 20 }}></i> Generate All
          Questions
        </button>
      </div>
      {showValidation && !hasMinimumQuestions && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            backgroundColor: "#FEF3F2",
            border: "1px solid #FECDCA",
            borderRadius: "8px",
            margin: "16px 16px 0 16px",
          }}
        >
          <i className="la la-exclamation-triangle" style={{ color: "#F04438", fontSize: 16 }}></i>
          <span style={{ color: "#B42318", fontSize: 14, fontWeight: 500 }}>
            Please add at least 5 interview questions.
          </span>
        </div>
      )}
      <div className="layered-card-content">
        <div className="questions-set">
          {questions.map((group, index) => (
            <div
              className="question-group"
              key={index}
              style={
                group.category === "Others" ? { borderBottom: "none" } : {}
              }
            >
              {/* Row of category */}
              <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h3
                    style={{
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                      marginRight: "10px",
                    }}
                  >
                    {group.category}
                  </h3>
                </div>
                {/* Empty drop zone for categories with no questions */}
                {group.questions.length === 0 && (
                  <div
                    style={{
                      padding: "20px",
                      border: "2px dashed #E5E7EB",
                      borderRadius: "8px",
                      backgroundColor: "#F9FAFB",
                      textAlign: "center",
                      color: "#9CA3AF",
                      fontSize: 14,
                      marginBottom: 12,
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.borderColor = "#9CA3AF";
                      e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.backgroundColor = "#F9FAFB";

                      const draggedQuestionId =
                        e.dataTransfer.getData("questionId");
                      const fromCategoryId = Number(
                        e.dataTransfer.getData("fromCategoryId")
                      );

                      if (draggedQuestionId && !isNaN(fromCategoryId)) {
                        handleReorderQuestions(
                          draggedQuestionId,
                          fromCategoryId,
                          group.id,
                          0 // Insert at beginning of empty category
                        );
                      }
                    }}
                  >
                    Drag questions here or use the buttons below to add
                  </div>
                )}
                {/* Row of questions */}
                {group.questions.map((question, qIndex) => {
                  const isEditing = editingQuestionId === question.id;

                  return (
                    <div
                      className="question-item"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                      key={question.id}
                      draggable={!isEditing}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "questionId",
                          question.id.toString()
                        );
                        e.dataTransfer.setData(
                          "fromCategoryId",
                          group.id.toString()
                        );
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const draggedQuestionId =
                          e.dataTransfer.getData("questionId");
                        const fromCategoryId = Number(
                          e.dataTransfer.getData("fromCategoryId")
                        );

                        if (draggedQuestionId && !isNaN(fromCategoryId)) {
                          handleReorderQuestions(
                            draggedQuestionId,
                            fromCategoryId,
                            group.id,
                            qIndex
                          );
                        }
                      }}
                    >
                      {/* Drag handle */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isEditing ? "default" : "grab",
                          color: "#9CA3AF",
                          fontSize: 16,
                        }}
                      >
                        <i className="la la-braille"></i>
                      </div>

                      {/* Question content */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempQuestionText}
                            onChange={(e) =>
                              setTempQuestionText(e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "1px solid #E5E7EB",
                              borderRadius: "6px",
                              fontSize: 14,
                              fontFamily: "inherit",
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            style={{
                              flex: 1,
                              wordBreak: "break-word",
                              whiteSpace: "pre-line",
                              fontSize: 14,
                            }}
                          >
                            {question.question}
                          </span>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {isEditing ? (
                            <button
                              style={{
                                background: "#fff",
                                border: "1px solid #E9EAEB",
                                borderRadius: "60px",
                                cursor: "pointer",
                                padding: "8px 16px",
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onClick={() => {
                                editQuestion(
                                  group.id,
                                  tempQuestionText,
                                  question.id
                                );
                                setEditingQuestionId(null);
                                setTempQuestionText("");
                              }}
                            >
                              <i className="la la-check"></i>
                              <span>Save</span>
                            </button>
                          ) : (
                            <button
                              style={{
                                background: "#fff",
                                border: "1px solid #E9EAEB",
                                borderRadius: "60px",
                                cursor: "pointer",
                                padding: "8px 16px",
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onClick={() => {
                                setEditingQuestionId(question.id);
                                setTempQuestionText(question.question);
                              }}
                            >
                              <i className="la la-pencil-alt"></i>
                              <span>Edit</span>
                            </button>
                          )}

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
                            onClick={() => {
                              deleteQuestion(group.id, question.id);
                            }}
                          >
                            <i
                              className="la la-trash"
                              style={{ fontSize: 18 }}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Buttons to add or generate questions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
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
                      onClick={() => {
                        generateQuestions(group.category);
                      }}
                    >
                      <i className="la la-bolt" style={{ fontSize: 20 }}></i>{" "}
                      Generate Questions
                    </button>
                    <button
                      style={{
                        width: "fit-content",
                        color: "#414651",
                        background: "#fff",
                        border: "1px solid #D5D7DA",
                        padding: "8px 16px",
                        borderRadius: "60px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        // Add a blank question and set it to editing mode
                        const newQuestionId = addQuestion(group.id, "");
                        if (newQuestionId) {
                          setEditingQuestionId(newQuestionId);
                          setTempQuestionText("");
                        }
                      }}
                    >
                      <i
                        className="la la-plus-circle"
                        style={{ fontSize: 20 }}
                      ></i>{" "}
                      Manually add
                    </button>
                  </div>
                  {group.questions.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          fontWeight: 400,
                        }}
                      >
                        # of questions to ask
                      </span>
                      <input
                        type="number"
                        placeholder={group.questions.length.toString()}
                        value={
                          group.questionCountToAsk !== null
                            ? group.questionCountToAsk
                            : ""
                        }
                        max={group.questions.length}
                        min={0}
                        style={{
                          width: "50px",
                          height: "36px",
                          padding: "8px",
                          border: "1px solid #E5E7EB",
                          borderRadius: "6px",
                          fontSize: 14,
                          textAlign: "center",
                          appearance: "textfield",
                          MozAppearance: "textfield",
                          WebkitAppearance: "none",
                        }}
                        onChange={(e) => {
                          let value = parseInt(e.target.value);

                          if (isNaN(value)) {
                            value = null;
                          }

                          if (value > group.questions.length) {
                            value = group.questions.length;
                          }

                          const updatedQuestions = [...questions];
                          updatedQuestions[index].questionCountToAsk = value;
                          setQuestions(updatedQuestions);
                        }}
                        onKeyDown={(e) => {
                          // Prevent non-numeric input except for backspace, delete, and arrow keys
                          if (
                            !/[0-9]/.test(e.key) &&
                            ![
                              "Backspace",
                              "Delete",
                              "ArrowLeft",
                              "ArrowRight",
                            ].includes(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isGeneratingQuestions && (
        <FullScreenLoadingAnimation
          title="Generating questions..."
          subtext="Please wait while Jia is generating the questions"
        />
      )}
    </>
  );
}
