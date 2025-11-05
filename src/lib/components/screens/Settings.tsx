"use client";

import styles from "@/lib/styles/screens/settings.module.scss";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function () {
  const [dropdown, setDropdown] = useState(null);
  const [inputValue, setInputValue] = useState({});
  const [loading, setLoading] = useState(true);
  const [settingsItems, setSettingsItems] = useState([
    {
      id: "transcription_prompt",
      name: "General Model Settings",
      descriptions:
        "Configure AI models, voice settings, and system parameters used across the platform.",
      editor: {
        image: "",
        name: "",
      },
      date: "",
      value: "",
    },
    {
      id: "traits_prompt",
      name: "[Prompt] JIA Default Traits | Interviewer Traits",
      descriptions:
        "Customize interviewer personality and behavior for AI-led interviews.",
      editor: {
        image: "",
        name: "",
      },
      date: "",
      value: "",
    },
    {
      id: "summary_prompt",
      name: "[Prompt] Interview Summary Prompt",
      descriptions:
        "Define how Jia generates structured summaries of interview sessions.",
      editor: {
        image: "",
        name: "",
      },
      date: "",
      value: "",
    },
    {
      id: "analysis_prompt",
      name: "[Prompt] Interview Analysis Prompt",
      descriptions:
        "Set instructions for Jia to assess and score interview performance.",
      editor: {
        image: "",
        name: "",
      },
      date: "",
      value: "",
    },
    {
      id: "question_gen_prompt",
      name: "[Prompt] Question Generator Prompt",
      descriptions:
        "Control how follow-up and probing questions are generated during interviews.",
      editor: {
        image: "",
        name: "",
      },
      date: "",
      value: "",
    },
    {
      id: "cv_screening_prompt",
      name: "[Prompt] CV Screening Prompt",
      descriptions: "Guide Jia in evaluating and tagging CVs based on job fit.",
      editor: {
        image: "",
        name: "",
      },
      date: "",
      value: "",
    },
  ]);
  const [tempValue, setTempValue] = useState({});
  const [tempInputValue, setTempInputValue] = useState({});
  const [user, setUser] = useState(null);

  function handleReset() {
    setDropdown(null);
    setTempValue({});
    setTempInputValue({});
  }

  function handleSave() {
    let data = {};
    const date = Date.now();

    if (tempValue[settingsItems[0].id]) {
      data[settingsItems[0].id] = tempValue[settingsItems[0].id];
      data["editor"] = user;
      data["lastEdited"] = date;
    }

    for (const key in tempInputValue) {
      if (key == "turn_detection") {
        data[key] = { type: tempInputValue[key] };
      } else {
        data[key] = tempInputValue[key];
      }

      data["editor"] = user;
      data["lastEdited"] = date;
    }

    for (const key in tempValue) {
      if (key != settingsItems[0].id) {
        data[key] = {
          prompt: tempValue[key],
          editor: user,
          lastEdited: date,
        };
      }
    }

    saveSettings(data);
  }

  function processDate(date) {
    const newDate = moment(date);
    const dateNow = moment();

    const diffInDays = dateNow.diff(newDate, "days");

    if (diffInDays < 1) {
      return "today";
    } else if (diffInDays < 2) {
      return "yesterday";
    } else {
      return `${diffInDays}d ago`;
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedStoredUser = JSON.parse(storedUser);
      setUser(parsedStoredUser);
    }

    fetchSettings();
  }, []);

  function fetchSettings() {
    axios({
      method: "POST",
      url: "/api/fetch-global-settings",
      data: { fields: "" },
    })
      .then((res) => {
        const result = res.data;
        const tempSettingsItems = [...settingsItems];
        console.log(result);
        // transcription_prompt
        tempSettingsItems[0].editor = result.editor;
        tempSettingsItems[0].date = result.lastEdited;
        tempSettingsItems[0].value = result.transcription_prompt;

        // traits_prompt
        tempSettingsItems[1].editor = result["traits_prompt"].editor;
        tempSettingsItems[1].date = result["traits_prompt"].lastEdited;
        tempSettingsItems[1].value = result["traits_prompt"].prompt;

        // summary_prompt
        tempSettingsItems[2].editor = result["summary_prompt"].editor;
        tempSettingsItems[2].date = result["summary_prompt"].lastEdited;
        tempSettingsItems[2].value = result["summary_prompt"].prompt;

        // analysis_prompt
        tempSettingsItems[3].editor = result["analysis_prompt"].editor;
        tempSettingsItems[3].date = result["analysis_prompt"].lastEdited;
        tempSettingsItems[3].value = result["analysis_prompt"].prompt;

        // question_gen_prompt
        tempSettingsItems[4].editor = result["question_gen_prompt"].editor;
        tempSettingsItems[4].date = result["question_gen_prompt"].lastEdited;
        tempSettingsItems[4].value = result["question_gen_prompt"].prompt;

        // cv_screening_prompt
        tempSettingsItems[5].editor = result["cv_screening_prompt"].editor;
        tempSettingsItems[5].date = result["cv_screening_prompt"].lastEdited;
        tempSettingsItems[5].value = result["cv_screening_prompt"].prompt;

        setSettingsItems(tempSettingsItems);
        setInputValue({
          llm_realtime_model: result["llm_realtime_model"],
          voice: result["voice"],
          max_response_output_tokens: result["max_response_output_tokens"],
          temperature: result["temperature"],
          turn_detection: result["turn_detection"].type,
          transcription_model: result["transcription_model"],
        });
      })
      .catch((err) => {
        alert("Error fetching settings.");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function saveSettings(data) {
    axios({
      method: "POST",
      url: "/api/save-global-settings",
      data,
    })
      .then((_) => {
        Swal.fire({
          toast: true,
          position: "top",
          icon: "success",
          title: "Settings saved successfully",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setLoading(true);
        handleReset();
        fetchSettings();
      })
      .catch((err) => {
        alert("Error saving settings.");
        console.log(err);
      });
  }

  function Dropdown({ id, label, data }) {
    return (
      <div className={styles.dropdown}>
        <span>{label}</span>

        <div
          className={styles.value}
          onClick={() => setDropdown((prev) => (prev == id ? null : id))}
        >
          <span>
            {
              data.item.find(
                (item) =>
                  item.value ===
                  (tempInputValue[id] !== undefined
                    ? tempInputValue[id]
                    : inputValue[id])
              ).label
            }
          </span>

          <img
            alt=""
            className={dropdown == id ? styles.active : ""}
            src="/icons/chevron.svg"
          />
        </div>

        {dropdown == id && (
          <div className={styles.dropdownContainer}>
            {data.item.map((item, index) => (
              <span
                className={
                  item ==
                  (tempInputValue[id] ? tempInputValue[id] : inputValue[id])
                    ? styles.active
                    : ""
                }
                key={index}
                onClick={() => {
                  setDropdown(null);
                  setTempInputValue((prev) => ({
                    ...prev,
                    [id]: item.value,
                  }));
                }}
              >
                {item.label}

                {item ==
                  (tempInputValue[id]
                    ? tempInputValue[id]
                    : inputValue[id]) && (
                  <img alt="" src="/icons/checkV4.svg" />
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  function Scroll({ id, label, data }) {
    return (
      <div className={styles.selection}>
        <span>
          <img alt="" src="/icons/help.svg" />
          {label}
          {tempInputValue[id] ? tempInputValue[id] : inputValue[id]}
        </span>

        <input
          type="range"
          min={data.min}
          max={data.max}
          step={data.step}
          value={tempInputValue[id] ? tempInputValue[id] : inputValue[id]}
          onChange={(e) =>
            setTempInputValue((prev) => ({
              ...prev,
              [id]: Number(e.target.value),
            }))
          }
        />
      </div>
    );
  }

  return (
    !loading && (
      <div className={styles.container}>
        <div className={styles.settingsContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.textContainer}>
              <span className={styles.title}>Settings</span>
              <span className={styles.descriptions}>
                Adjust model and advanced prompt settings here.
              </span>
            </div>
            <div className={styles.buttonConatainer}>
              <button
                className={`${styles.primary} ${
                  Object.keys(tempValue).length > 0 ||
                  Object.keys(tempInputValue).length > 0
                    ? ""
                    : styles.disabled
                }`}
                onClick={handleReset}
              >
                Reset Changes
              </button>
              <button
                className={`${styles.secondary} ${
                  Object.keys(tempValue).length > 0 ||
                  Object.keys(tempInputValue).length > 0
                    ? ""
                    : styles.disabled
                }`}
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className={styles.bodyContainer}>
            {settingsItems.map((item, index) => (
              <div className={styles.contentContainer} key={index}>
                <div className={styles.detailsContainer}>
                  <div className={styles.titleContainer}>
                    <span className={styles.title}>{item.name}</span>

                    {(tempValue[item.id] ||
                      (item.id == settingsItems[0].id &&
                        Object.keys(tempInputValue).length > 0)) && (
                      <span className={styles.tag}>
                        <img alt="" src="/icons/alert-octagon.svg" />
                        Unsaved changed
                      </span>
                    )}
                  </div>

                  <span className={styles.description}>
                    {item.descriptions}
                  </span>

                  {item.editor.name && item.date && (
                    <div className={styles.userInfoContainer}>
                      <img alt="" src={item.editor.image} />
                      <span className={styles.name}>{item.editor.name}</span>
                      <span className={styles.date}>
                        edited this {processDate(item.date)}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.inputContainer}>
                  {item.id == settingsItems[0].id && (
                    <div className={styles.selectionContainer}>
                      <Dropdown
                        id="llm_realtime_model"
                        label="LLM Realtime Model"
                        data={{
                          item: [
                            {
                              value: "gpt-4o-realtime-preview",
                              label:
                                "gpt-4o-realtime-preview - Best but Expensive",
                            },
                            {
                              value: "gpt-4o-realtime-preview-2025-06-03",
                              label:
                                "gpt-4o-realtime-preview-2025-06-03 - Improved Snapshot | June 3, 2025",
                            },
                            {
                              value: "gpt-4o-mini-realtime-preview",
                              label:
                                "gpt-4o-mini-realtime-preview - 2nd Best and Cheaper",
                            },
                          ],
                        }}
                      />
                      <Dropdown
                        id="voice"
                        label="Voice Model"
                        data={{
                          item: [
                            {
                              value: "alloy",
                              label: "Alloy – Smooth & Versatile",
                            },
                            { value: "ash", label: "Ash – Raspy & Grounded" },
                            {
                              value: "ballad",
                              label: "Ballad – Soft & Lyrical",
                            },
                            {
                              value: "coral",
                              label: "Coral – Bright & Friendly",
                            },
                            { value: "echo", label: "Echo – Crisp & Echoic" },
                            {
                              value: "fable",
                              label: "Fable – Whimsical & Story-like",
                            },
                            { value: "onyx", label: "Onyx – Deep & Bold" },
                            {
                              value: "nova",
                              label: "Nova – Energetic & Modern",
                            },
                            { value: "sage", label: "Sage – Calm & Wise" },
                            {
                              value: "shimmer",
                              label: "Shimmer – Light & Sparkly",
                            },
                            {
                              value: "verse",
                              label: "Verse – Poetic & Expressive",
                            },
                          ],
                        }}
                      />
                      <Scroll
                        id="max_response_output_tokens"
                        label="Max Output Tokens: "
                        data={{
                          min: 1,
                          max: 4096,
                          step: 1,
                        }}
                      />
                      <Scroll
                        id={"temperature"}
                        label={"Temperature: "}
                        data={{
                          min: 0.6,
                          max: 1.2,
                          step: 0.1,
                        }}
                      />
                      <Dropdown
                        id="turn_detection"
                        label="Turn Detection Type"
                        data={{
                          item: [
                            {
                              value: "server_vad",
                              label: "Server VAD",
                            },
                            {
                              value: "semantic_vad",
                              label: "Semantic VAD",
                            },
                          ],
                        }}
                      />
                      <Dropdown
                        id="transcription_model"
                        label="Audio Transcription Model"
                        data={{
                          item: [
                            {
                              value: "gpt-4o-mini-transcribe",
                              label:
                                "gpt-4o-mini-transcribe - Best but more Expensive",
                            },
                            {
                              value: "whisper-1",
                              label: "whisper-1 - 2nd Best and Cheaper",
                            },
                          ],
                        }}
                      />
                    </div>
                  )}

                  <div className={styles.textContainer}>
                    {item.id == settingsItems[0].id && (
                      <span className={styles.label}>
                        [Prompt] Audio Transcription Prompt
                      </span>
                    )}
                    <textarea
                      className={
                        item.id == settingsItems[0].id ? styles.audioPrompt : ""
                      }
                      placeholder="Enter prompt instructions to guide AI behavior. Be clear and concise."
                      value={
                        tempValue[item.id] ? tempValue[item.id] : item.value
                      }
                      onBlur={(e) =>
                        (e.target.placeholder =
                          "Enter prompt instructions to guide AI behavior. Be clear and concise.")
                      }
                      onChange={(e) =>
                        setTempValue((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      onFocus={(e) => (e.target.placeholder = "")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
}
