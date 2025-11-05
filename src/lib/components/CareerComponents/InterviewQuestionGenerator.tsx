import { guid } from "@/lib/Utils";
import Swal from "sweetalert2";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  errorToast,
  interviewQuestionCategoryMap,
  successToast,
} from "@/lib/Utils";

export default function (props) {
  const { questions, setQuestions, jobTitle, description } = props;
  const [questionGenPrompt, setQuestionGenPrompt] = useState("");
  const questionCount = 5;

  function addQuestion(groupId: number) {
    // Open SweetAlert modal with textarea
    Swal.fire({
      title: "Add Interview Question",
      html: `
            <textarea 
              id="questionText" 
              class="form-control" 
              placeholder="Enter your question here..."
              style="height: 150px"
            ></textarea>`,
      showCancelButton: true,
      confirmButtonText: "Add Question",
      preConfirm: () => {
        const questionText = (
          document.getElementById("questionText") as HTMLInputElement
        ).value;
        if (!questionText) {
          Swal.showValidationMessage("Please enter a question");
          return false;
        }
        return questionText;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newQuestion = result.value;
        const categoryIndex = questions.findIndex((q) => q.id === groupId);
        if (categoryIndex !== -1) {
          const updatedQuestions = [...questions];
          updatedQuestions[categoryIndex].questions = [
            ...updatedQuestions[categoryIndex].questions,
            {
              id: guid(),
              question: newQuestion,
            },
          ];

          setQuestions(updatedQuestions);
        }
      }
    });
  }

  function editQuestion(category, question) {
    Swal.fire({
      title: "Edit Interview Question",
      html: `
            <textarea 
              id="questionText" 
              class="form-control" 
              placeholder="Enter your question here..."
              style="height: 150px"
            >${question.question}</textarea>`,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      preConfirm: () => {
        const questionText = (
          document.getElementById("questionText") as HTMLInputElement
        ).value;
        if (!questionText) {
          Swal.showValidationMessage("Please enter a question");
          return false;
        }
        return questionText;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const categoryIndex = questions.findIndex(
          (q) => q.category === category
        );

        const updatedQuestions = [...questions];
        if (categoryIndex !== -1) {
          updatedQuestions[categoryIndex].questions = updatedQuestions[
            categoryIndex
          ].questions.map((q) =>
            q.id === question.id ? { ...q, question: result.value } : q
          );
        }

        setQuestions(updatedQuestions);
      }
    });
  }

  async function generateAllQuestions() {
    try {
      if (!jobTitle.trim() || !description.trim()) {
        errorToast("Please fill in all fields", 1500);
        return;
      }
      Swal.fire({
        title: "Generating questions...",
        text: "Please wait while we generate the questions...",
        allowOutsideClick: false,
      });

      Swal.showLoading();
      const interviewCategories = Object.keys(interviewQuestionCategoryMap);
      const response = await axios.post("/api/llm-engine", {
      systemPrompt:
        "You are a helpful assistant that can answer questions and help with tasks.",
      prompt: `Generate ${questionCount * interviewCategories.length} interview questions for the following Job opening: 
        Job Title:
        ${jobTitle} 
        Job Description:
        ${description}
  
        ${interviewCategories.map((category) => {
          return `Category:
          ${category}
          Category Description:
          ${interviewQuestionCategoryMap[category].description}`
        }).join("\n")}
  
        ${interviewCategories.map((category) => `${questionCount} questions for ${category}`).join(", ")}

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
    })

    console.log(newArray);

    setQuestions(newArray);

    successToast("Questions generated successfully", 1500);

    Swal.close();
    } catch(err) {
      console.log(err);
      errorToast("Error generating questions, please try again", 1500);
    }
  }

  async function generateQuestions(groupCategory: string) {
    try {
      if (!jobTitle.trim() || !description.trim()) {
        errorToast("Please fill in all fields", 1500);
        return;
      }
      Swal.fire({
        title: "Generating questions...",
        text: "Please wait while we generate the questions...",
        allowOutsideClick: false,
      });

      Swal.showLoading();

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

      console.log(newArray);

      setQuestions(newArray);

      successToast("Questions generated successfully", 1500);

      Swal.close();
    } catch (err) {
      console.log(err);
      errorToast("Error generating questions, please try again", 1500);
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
      });

    setQuestionGenPrompt(configData.question_gen_prompt.prompt);
  }

  useEffect(() => {
    fetchInstructionPrompt();
  }, []);

  return (
    <div className="card shadow-1">
      <div className="card-header">
        <h3 className="mb-0 mr-auto">
          <i className="la la-cubes text-primary mr-2" /> Interview Questions (
          {questions.reduce((acc, group) => acc + group.questions.length, 0)})
        </h3>
        <button
          className="btn btn-default"
          style={{ padding: "5px 20px" }}
          onClick={() => {
            generateAllQuestions();                                
          }}  
        >
          <i className="la la-cubes text-info"></i> Generate All Questions
        </button>
      </div>
      <div className="card-body">
        <div className="questions-set">
          {questions.map((group, index) => (
            <div
              className="question-group"
              key={index}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData("categoryId", group.id.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const bounding = target.getBoundingClientRect();
                const offset = bounding.y + bounding.height / 2;

                if (e.clientY - offset > 0) {
                  target.style.borderBottom = "3px solid #4CAF50";
                  target.style.borderTop = "none";
                } else {
                  target.style.borderTop = "3px solid #4CAF50";
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

                const bounding = e.currentTarget.getBoundingClientRect();
                const offset = bounding.y + bounding.height / 2;
                const insertIndex = e.clientY - offset > 0 ? index + 1 : index;

                const categoryId = Number(e.dataTransfer.getData("categoryId"));
                if (!isNaN(categoryId) && categoryId !== group.id) {
                  // This is a category being dragged
                  handleReorderCategories(categoryId, insertIndex);
                }

                const draggedQuestionId = e.dataTransfer.getData("questionId");
                const fromCategoryId = Number(
                  e.dataTransfer.getData("fromCategoryId")
                );
                if (draggedQuestionId && !isNaN(fromCategoryId)) {
                  // This is a question being dragged
                  handleReorderQuestions(
                    draggedQuestionId,
                    fromCategoryId,
                    group.id
                  );
                }
              }}
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
                  <hr
                    style={{
                      borderTop: "1px solid #eee",
                      width: "100%",
                      paddingBottom: "5px",
                    }}
                  />
                </div>
                {/* Row of questions */}
                {group.questions.map((question, index) => (
                  <div
                    className="question-item"
                    key={index}
                    draggable={true}
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
                      const target = e.currentTarget;
                      const bounding = target.getBoundingClientRect();
                      const offset = bounding.y + bounding.height / 2;

                      // Add visual indicator for drop position
                      if (e.clientY - offset > 0) {
                        target.style.borderBottom = "2px solid #4CAF50";
                        target.style.borderTop = "none";
                      } else {
                        target.style.borderTop = "2px solid #4CAF50";
                        target.style.borderBottom = "none";
                      }
                    }}
                    onDragLeave={(e) => {
                      // Remove visual indicators
                      e.currentTarget.style.borderTop = "none";
                      e.currentTarget.style.borderBottom = "none";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation(); // Prevent bubbling to question-group handler

                      // Remove visual indicators
                      e.currentTarget.style.borderTop = "none";
                      e.currentTarget.style.borderBottom = "none";

                      const draggedQuestionId =
                        e.dataTransfer.getData("questionId");
                      const fromCategoryId = Number(
                        e.dataTransfer.getData("fromCategoryId")
                      );

                      if (draggedQuestionId && !isNaN(fromCategoryId)) {
                        const bounding =
                          e.currentTarget.getBoundingClientRect();
                        const offset = bounding.y + bounding.height / 2;
                        const insertIndex =
                          e.clientY - offset > 0 ? index + 1 : index;

                        handleReorderQuestions(
                          draggedQuestionId,
                          fromCategoryId,
                          group.id,
                          insertIndex
                        );
                      }
                    }}
                  >
                    <h3>
                      <i className="la la-square text-primary"></i>{" "}
                      {question.question}
                    </h3>
                    <p></p>

                    <div className="button-set">
                      <button
                        className="btn btn-default"
                        onClick={() => {
                          editQuestion(group.category, question);
                        }}
                      >
                        <i className="la la-edit"></i>
                        <span>Edit</span>
                      </button>

                      <button
                        className="btn btn-default"
                        onClick={() => {
                          const categoryIndex = questions.findIndex(
                            (q) => q.category === group.category
                          );
                          const updatedQuestions = [...questions];

                          if (categoryIndex !== -1) {
                            let categoryToUpdate =
                              updatedQuestions[categoryIndex];
                            categoryToUpdate.questions =
                              categoryToUpdate.questions.filter(
                                (q) => q.id !== question.id
                              );
                            if (
                              categoryToUpdate.questionCountToAsk !== null &&
                              categoryToUpdate.questionCountToAsk >
                                categoryToUpdate.questions.length
                            ) {
                              categoryToUpdate.questionCountToAsk =
                                categoryToUpdate.questions.length;
                            }
                          }
                          setQuestions(updatedQuestions);
                        }}
                      >
                        <i className="la la-trash text-red"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {/* Buttons to add or generate questions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <button
                      className="btn btn-default"
                      style={{ padding: "5px 20px" }}
                      onClick={() => {
                        generateQuestions(group.category);
                      }}
                    >
                      <i className="la la-cubes text-info"></i> Generate
                      Questions
                    </button>
                    <button
                      className="btn btn-default"
                      style={{ padding: "5px 20px" }}
                      onClick={() => addQuestion(group.id)}
                    >
                      <i className="la la-plus text-info"></i> Manually Add
                    </button>
                  </div>
                  {group.questions.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          marginRight: "10px",
                          marginTop: "10px",
                          paddingTop: "5px",
                        }}
                      >
                        # of Questions to Ask:
                      </p>
                      <input
                        type="number"
                        id="questionCount"
                        placeholder={questionCount.toString()}
                        value={
                          group.questionCountToAsk !== null
                            ? group.questionCountToAsk
                            : ""
                        }
                        max={group.questions.length}
                        min={0}
                        style={{
                          maxWidth: "40px",
                          maxHeight: "40px",
                        }}
                        onChange={(e) => {
                          let value = parseInt(e.target.value);

                          if (isNaN(value)) {
                            value = null;
                          }

                          if (value > group.questions.length) {
                            value = group.questions.length;
                          }

                          // Update the input's displayed value to match the parsed number
                          e.target.value =
                            value === null ? "" : value.toString();

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
    </div>
  );
}
