"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/lib/PageComponent/Sidebar";
import { useAppContext } from "@/lib/context/AppContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import SettingsLoader from "@/lib/Loader/SettingsLoader";
import AuthGuard from "@/lib/components/AuthGuard/AuthGuard";
import NavBar from "@/lib/components/NavBar/NavBar";
import AvatarImage from "@/lib/components/AvatarImage/AvatarImage";
import moment from "moment";
import SuperAdminAccessGuard from "@/lib/components/SuperAdminAccessGuard";
// Tooltip text constants
const TOOLTIP_TEXTS = {
  maxTokens: `
    Limits response length (default: 4096 tokens).
    1 token ≈ ¾ of a word in English.
    Higher values allow longer responses, but may impact speed/cost.
    Tip: Use smaller values to keep replies brief and fast.
  `.trim(),
  temperature: `
    Controls response randomness (default: 0.8).
    Lower values (e.g. 0.2) = more focused, repeatable answers.
    Higher values (e.g. 1.0) = more creative, diverse output.
    Tip: Use lower values for factual or technical tasks.
  `.trim(),
  turnDetection: `
    <strong>Configuration for turn detection</strong>
    
    <strong>Server VAD:</strong>
    • Detects start and end of speech based on audio volume
    • Responds at the end of user speech
    • Faster response time
    • More straightforward detection
    
    <strong>Semantic VAD:</strong>
    • Uses a turn detection model with VAD
    • Semantically estimates if user has finished speaking
    • Dynamically sets timeout based on probability
    • Handles natural speech patterns (e.g., "uhhm")
    • More natural conversations
    • May have higher latency
    
    <span class="tip">Tip: Use Server VAD for faster responses, Semantic VAD for more natural conversations.</span>
  `.trim(),
};

// Custom tooltip component
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="tooltip-container">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="tooltip-trigger"
      >
        {children}
      </div>
      {show && (
        <div className="tooltip-content">
          <div
            className="tooltip-text"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  // Get user data from AppContext
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const [disableSave, setDisableSave] = useState(true);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    axios({
      method: "POST",
      url: "/api/fetch-global-settings",
      data: { fields: {} },
    }).then((res) => {
      // Ensure we don't set undefined values
      setSettings(res.data);

      setIsLoading(false);
    });
  }, []);

  // Handle voice model change
  const handleVoiceModelChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      voice: e.target.value,
      lastEdited: Date.now(),
      editor: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    }));
  };

  // Handle max output tokens change
  const handleMaxOutputTokensChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      max_response_output_tokens: parseInt(e.target.value),
      lastEdited: Date.now(),
      editor: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    }));
  };

  // Handle temperature change
  const handleTemperatureChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      temperature: parseFloat(e.target.value),
      lastEdited: Date.now(),
      editor: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    }));
  };

  // Handle turn detection change
  const handleTurnDetectionChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      turn_detection: { type: e.target.value },
      lastEdited: Date.now(),
      editor: {
        name: user.name,
        image: user.image,
        email: user.email,
      },
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    console.log(settings);
    axios({
      method: "POST",
      url: "/api/save-global-settings",
      data: settings,
    }).then((res) => {
      toast.success("Settings saved successfully!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  };

  function changeSetting(type: string, delta: any) {
    if (type === "llmModel") {
      if (delta.trim() === "") {
        return false;
      }

      setSettings((prev) => ({
        ...prev,
        llm_realtime_model: delta,
        lastEdited: Date.now(),
        editor: {
          name: user.name,
          image: user.image,
          email: user.email,
        },
      }));
    }

    if (type === "transcriptionModel") {
      setSettings((prev) => ({
        ...prev,
        transcription_model: delta,
        lastEdited: Date.now(),
        editor: {
          name: user.name,
          image: user.image,
          email: user.email,
        },
      }));
    }

    if (type === "transcriptionPrompt") {
      setSettings((prev) => ({
        ...prev,
        transcription_prompt: delta,
        lastEdited: Date.now(),
        editor: {
          name: user.name,
          image: user.image,
          email: user.email,
        },
      }));
    }

    if (type === "summaryPrompt") {
      setSettings((prev) => ({
        ...prev,

        summary_prompt: {
          prompt: delta,
          lastEdited: Date.now(),
          editor: {
            name: user.name,
            image: user.image,
            email: user.email,
          },
        },
      }));
    }

    if (type === "traitsPrompt") {
      setSettings((prev) => ({
        ...prev,

        traits_prompt: {
          prompt: delta,
          lastEdited: Date.now(),
          editor: {
            name: user.name,
            image: user.image,
            email: user.email,
          },
        },
      }));
    }

    if (type === "questionGenPrompt") {
      setSettings((prev) => ({
        ...prev,
        question_gen_prompt: {
          prompt: delta,
          lastEdited: Date.now(),
          editor: {
            name: user.name,
            image: user.image,
            email: user.email,
          },
        },
      }));
    }

    if (type === "analysisPrompt") {
      setSettings((prev) => ({
        ...prev,
        analysis_prompt: {
          prompt: delta,
          lastEdited: Date.now(),
          editor: {
            name: user.name,
            image: user.image,
            email: user.email,
          },
        },
      }));
    }

    if (type === "cvScreeningPrompt") {
      setSettings((prev) => ({
        ...prev,
        cv_screening_prompt: {
          prompt: delta,
          lastEdited: Date.now(),
          editor: {
            name: user.name,
            image: user.image,
            email: user.email,
          },
        },
      }));
    }
  }

  // Add this above your component or inside it before the return
  const voiceModels = [
    { value: "alloy", label: "Alloy – Smooth & Versatile" },
    { value: "ash", label: "Ash – Raspy & Grounded" },
    { value: "ballad", label: "Ballad – Soft & Lyrical" },
    { value: "coral", label: "Coral – Bright & Friendly" },
    { value: "echo", label: "Echo – Crisp & Echoic" },
    { value: "fable", label: "Fable – Whimsical & Story-like" },
    { value: "onyx", label: "Onyx – Deep & Bold" },
    { value: "nova", label: "Nova – Energetic & Modern" },
    { value: "sage", label: "Sage – Calm & Wise" },
    { value: "shimmer", label: "Shimmer – Light & Sparkly" },
    { value: "verse", label: "Verse – Poetic & Expressive" },
  ];

  const llmRealtimeModels = [
    {
      value: "gpt-4o-realtime-preview",
      label: "gpt-4o-realtime-preview - Best but Expensive",
    },
    {
      value: "gpt-4o-realtime-preview-2025-06-03",
      label:
        "gpt-4o-realtime-preview-2025-06-03 - Improved Snapshot | June 3, 2025",
    },
    {
      value: "gpt-4o-mini-realtime-preview",
      label: "gpt-4o-mini-realtime-preview - 2nd Best and Cheaper",
    },
  ];

  const transcriptionModels = [
    {
      value: "gpt-4o-mini-transcribe",
      label: "gpt-4o-mini-transcribe - Best but more Expensive",
    },
    {
      value: "whisper-1",
      label: "whisper-1 - 2nd Best and Cheaper",
    },
  ];

  return (
    <>
      <AuthGuard />
      <SuperAdminAccessGuard />
      <div className="g-sidenav-show g-sidenav-pinned">
        <title>Settings | Jia - WhiteCloak Technologies</title>
        <Sidebar activeLink="Settings" />

        {/* Main content */}
        <div className="main-content" id="panel">
          {/* Topnav */}
          <NavBar />
          {/* Header */}
          <div className="header gradient-1 pb-7">
            <div className="container-fluid">
              <div className="header-body">
                <div className="row align-items-center py-4">
                  <div className="col-lg-6 col-7">
                    <h6 className="h2 text-white d-inline-block mb-0">
                      Settings
                    </h6>
                    <nav
                      aria-label="breadcrumb"
                      className="d-none d-md-inline-block ml-md-4"
                    >
                      <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                        <li className="breadcrumb-item">
                          <a href="#">
                            <i className="fas fa-home"></i>
                          </a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="/dashboard">Dashboard</a>
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Page content */}
          <div className="container-fluid mt--6">
            <div className="thread-set">
              <div className="left-thread">
                {isLoading ? (
                  <SettingsLoader />
                ) : (
                  <div className="thread-set d-flex justify-content-center">
                    <div
                      className="right-thread"
                      style={{ width: "100%", maxWidth: "1000px" }}
                    >
                      <div className="card shadow-1">
                        <div className="card-header d-flex justify-content-center">
                          <h3 className="mb-0">
                            <i className="la la-cubes text-primary mr-2" />{" "}
                            General Model Settings
                          </h3>
                        </div>
                        <div className="card-body flex-row">
                          <div className="mb-3" style={{ width: "40%" }}>
                            <label className="form-label">
                              <i className="las la-square text-primary mr-2"></i>
                              <strong>LLM Realtime Model</strong>
                            </label>
                            <select
                              className="form-control"
                              defaultValue={settings?.llm_realtime_model}
                              value={settings?.llm_realtime_model}
                              onChange={(e) => {
                                changeSetting("llmModel", e.target.value);
                              }}
                            >
                              <option value="">Select an option</option>
                              {llmRealtimeModels.map((model) => (
                                <option key={model.value} value={model.value}>
                                  {model.label}
                                </option>
                              ))}
                            </select>
                            <br />

                            <label className="form-label">Voice Model</label>
                            <select
                              className="form-control"
                              value={settings?.voice}
                              onChange={handleVoiceModelChange}
                            >
                              <option value="">Select an option</option>
                              {voiceModels.map((model) => (
                                <option key={model.value} value={model.value}>
                                  {model.label}
                                </option>
                              ))}
                            </select>

                            <div className="mt-4" style={{ width: "100%" }}>
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="form-label d-block mb-0">
                                  <Tooltip text={TOOLTIP_TEXTS.maxTokens}>
                                    <i className="las la-info-circle text-primary mr-2"></i>
                                  </Tooltip>
                                  Max Output Tokens:{" "}
                                  {settings.max_response_output_tokens}
                                </label>
                              </div>
                              <input
                                type="range"
                                className="form-range mt-2"
                                min="1"
                                max="4096"
                                value={settings.max_response_output_tokens}
                                onChange={handleMaxOutputTokensChange}
                                style={{ width: "100%" }}
                              />
                            </div>

                            <div className="mt-4" style={{ width: "100%" }}>
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="form-label d-block mb-0">
                                  <Tooltip text={TOOLTIP_TEXTS.temperature}>
                                    <i className="las la-info-circle text-primary mr-2"></i>
                                  </Tooltip>
                                  Temperature: {settings.temperature.toFixed(1)}
                                </label>
                              </div>
                              <input
                                type="range"
                                className="form-range mt-2"
                                min="0.6"
                                max="1.2"
                                step="0.1"
                                value={settings.temperature}
                                onChange={handleTemperatureChange}
                                style={{ width: "100%" }}
                              />
                            </div>

                            <div className="mt-4" style={{ width: "100%" }}>
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="form-label d-block mb-0">
                                  <Tooltip text={TOOLTIP_TEXTS.turnDetection}>
                                    <i className="las la-info-circle text-primary mr-2"></i>
                                  </Tooltip>
                                  Turn Detection Type
                                </label>
                              </div>
                              <select
                                className="form-control"
                                value={settings.turn_detection.type}
                                onChange={handleTurnDetectionChange}
                              >
                                <option value="server_vad">Server VAD</option>
                                <option value="semantic_vad">
                                  Semantic VAD
                                </option>
                              </select>
                            </div>

                            <div className="mt-4" style={{ width: "100%" }}>
                              <div className="d-flex align-items-center justify-content-between">
                                <label className="form-label d-block mb-0">
                                  <i className="la la-square text-primary mr-2"></i>
                                  Audio Transcription Model
                                </label>
                              </div>
                              <select
                                className="form-control"
                                value={settings?.transcription_model}
                                onChange={(e) => {
                                  changeSetting(
                                    "transcriptionModel",
                                    e.target.value
                                  );
                                }}
                              >
                                {transcriptionModels.map((model) => (
                                  <option key={model.value} value={model.value}>
                                    {model.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="mb-3" style={{ width: "60%" }}>
                            <label className="form-label">
                              <i className="la la-square text-primary mr-2"></i>
                              [Prompt] Audio Transcription Prompt
                            </label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={settings?.transcription_prompt}
                              onChange={(e) => {
                                changeSetting(
                                  "transcriptionPrompt",
                                  e.target.value
                                );
                              }}
                              placeholder="Enter your Transcription input prompt here"
                            ></textarea>
                          </div>
                        </div>

                        {settings?.lastEdited && (
                          <div className="card-basebar">
                            <AvatarImage src={settings?.editor?.image} />
                            <span>{settings?.editor?.name}</span>
                            <span>
                              | Edited this{" "}
                              {moment(settings?.lastEdited).fromNow()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="card shadow-1">
                  <div className="card-header d-flex">
                    <h3 className="mb-0">
                      <i className="la la-cube text-primary mr-2" />
                      [Prompt] JIA Default Traits | Interviewer Traits
                    </h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={settings?.traits_prompt?.prompt}
                      onChange={(e) => {
                        changeSetting("traitsPrompt", e.target.value);
                      }}
                      placeholder="Enter Prompt here"
                    ></textarea>
                  </div>

                  {settings?.traits_prompt?.lastEdited && (
                    <div className="card-basebar">
                      <AvatarImage
                        src={settings?.traits_prompt?.editor?.image}
                      />
                      <span>{settings?.traits_prompt?.editor?.name}</span>
                      <span>
                        | Edited this{" "}
                        {moment(settings?.traits_prompt?.lastEdited).fromNow()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card shadow-1">
                  <div className="card-header d-flex">
                    <h3 className="mb-0">
                      <i className="la la-square text-primary mr-2" />
                      [Prompt] Interview Summary Prompt
                    </h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      className="form-control"
                      rows={2}
                      defaultValue={settings?.summary_prompt?.prompt}
                      onChange={(e) => {
                        changeSetting("summaryPrompt", e.target.value);
                      }}
                      placeholder="Enter your instructions here..."
                    ></textarea>
                  </div>

                  {settings?.summary_prompt?.lastEdited && (
                    <div className="card-basebar">
                      <AvatarImage
                        src={settings?.summary_prompt?.editor?.image}
                      />
                      <span>{settings?.summary_prompt?.editor?.name}</span>
                      <span>
                        | Edited this{" "}
                        {moment(settings?.summary_prompt?.lastEdited).fromNow()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card shadow-1">
                  <div className="card-header d-flex">
                    <h3 className="mb-0">
                      <i className="la la-square text-primary mr-2" />
                      [Prompt] Interview Analysis Prompt
                    </h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      className="form-control"
                      rows={2}
                      defaultValue={settings?.analysis_prompt?.prompt}
                      onChange={(e) => {
                        changeSetting("analysisPrompt", e.target.value);
                      }}
                      placeholder="Enter Prompt here"
                    ></textarea>
                  </div>

                  {settings?.analysis_prompt?.lastEdited && (
                    <div className="card-basebar">
                      <AvatarImage
                        src={settings?.analysis_prompt?.editor?.image}
                      />
                      <span>{settings?.analysis_prompt?.editor?.name}</span>
                      <span>
                        | Edited this{" "}
                        {moment(
                          settings?.analysis_prompt?.lastEdited
                        ).fromNow()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card shadow-1">
                  <div className="card-header d-flex">
                    <h3 className="mb-0">
                      <i className="la la-square text-primary mr-2" />
                      [Prompt] Question Generator Prompt
                    </h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      className="form-control"
                      rows={2}
                      defaultValue={settings?.question_gen_prompt?.prompt}
                      onChange={(e) => {
                        changeSetting("questionGenPrompt", e.target.value);
                      }}
                      placeholder="Enter Prompt here"
                    ></textarea>
                  </div>

                  {settings?.question_gen_prompt?.lastEdited && (
                    <div className="card-basebar">
                      <AvatarImage
                        src={settings?.question_gen_prompt?.editor?.image}
                      />
                      <span>{settings?.question_gen_prompt?.editor?.name}</span>
                      <span>
                        | Edited this{" "}
                        {moment(
                          settings?.question_gen_prompt?.lastEdited
                        ).fromNow()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card shadow-1">
                  <div className="card-header d-flex">
                    <h3 className="mb-0">
                      <i className="la la-square text-primary mr-2" />
                      [Prompt] CV Screening Prompt
                    </h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      className="form-control"
                      rows={2}
                      defaultValue={settings?.cv_screening_prompt?.prompt}
                      onChange={(e) => {
                        changeSetting("cvScreeningPrompt", e.target.value);
                      }}
                      placeholder="Enter Prompt here"
                    ></textarea>
                  </div>

                  {settings?.cv_screening_prompt?.lastEdited && (
                    <div className="card-basebar">
                      <AvatarImage
                        src={settings?.cv_screening_prompt?.editor?.image}
                      />
                      <span>{settings?.question_gen_prompt?.editor?.name}</span>
                      <span>
                        | Edited this{" "}
                        {moment(
                          settings?.cv_screening_prompt?.lastEdited
                        ).fromNow()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="right-thread ">
                <div className="top-card">
                  <div className="card shadow-1">
                    <div className="card-header d-flex justify-content-center">
                      <h3 className="mb-0">
                        <i className="la la-edit text-primary mr-2" /> Settings
                        Toolbar
                      </h3>
                    </div>

                    <div className="card-body">
                      <button
                        className="btn btn-default"
                        onClick={handleSaveChanges}
                        // disabled={disableSave}
                      >
                        <i className="la la-square text-success"></i> Save
                        Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="footer pt-0 mt-7">
              <div className="row align-items-center justify-content-lg-between">
                <div className="col-lg-6">
                  <div className="copyright text-center text-lg-left text-muted">
                    © {new Date().getFullYear()}{" "}
                    <a
                      href="https://www.whitecloak.com"
                      className="font-weight-bold ml-1"
                      target="_blank"
                    >
                      WhiteCloak Technologies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

// Add this at the end of the file, before the last closing brace
const styles = `
  .tooltip-container {
    position: relative;
    display: inline-block;
  }

  .tooltip-trigger {
    cursor: pointer;
  }

  .tooltip-content {
    position: absolute;
    background-color: #333;
    color: white;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    min-width: 400px;
    max-width: 600px;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    top: -10px;
    left: 30px;
  }

  .tooltip-text {
    line-height: 1.6;
    margin: 0;
    white-space: pre-line;
  }

  .tooltip-text strong {
    color: #4CAF50;
    font-weight: 600;
  }

  .tooltip-text ul {
    margin: 8px 0;
    padding-left: 20px;
  }

  .tooltip-text li {
    margin-bottom: 4px;
  }

  .tooltip-text .tip {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
    font-style: italic;
  }

  .tooltip-content::before {
    content: '';
    position: absolute;
    top: 10px;
    left: -6px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #333;
  }

  .test-settings-popup {
    max-width: 1200px !important;
    padding: 0 !important;
  }

  .test-settings-popup .swal2-close {
    color: white;
    font-size: 24px;
    z-index: 1000;
  }

  .test-modal {
    background: #1a1a1a;
    color: white;
    padding: 20px;
    border-radius: 8px;
  }

  .test-interface {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .test-block {
    flex: 1;
  }

  .test-controls {
    display: flex;
    align-items: center;
    padding: 10px 0;
  }

  .header-bar {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .header-bar h3 {
    margin: 0;
    color: white;
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
