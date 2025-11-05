"use client";

import MeetingClock from "./MeetingClock";
import LayeredCard from "../components/LayeredCard";
import NetworkMonitorTag from "./NetworkMonitorTag";
import { useState, useEffect } from "react";
import { errorToast, successToast } from "../Utils";

export default function InterviewSystemCheck({
  candidateName,
  jobTitle,
  onSystemCheckComplete,
  videoElement,
  cameraDevices,
  microphoneDevices,
  speakerDevices,
  selectedVideoDevice,
  selectedMicrophoneDevice,
  selectedSpeakerDevice,
  onVideoDeviceChange,
  onMicrophoneDeviceChange,
  onSpeakerDeviceChange,
  isStarted,
}: {
  candidateName: string;
  jobTitle: string;
  onSystemCheckComplete: () => void;
  videoElement: any;
  cameraDevices: MediaDeviceInfo[];
  microphoneDevices: MediaDeviceInfo[];
  speakerDevices: MediaDeviceInfo[];
  selectedVideoDevice: string;
  selectedMicrophoneDevice: string;
  selectedSpeakerDevice: string;
  isStarted: boolean;
  onVideoDeviceChange: (deviceId: string) => void;
  onMicrophoneDeviceChange: (deviceId: string) => void;
  onSpeakerDeviceChange: (deviceId: string) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMicrophoneDropdownOpen, setIsMicrophoneDropdownOpen] =
    useState(false);
  const [isVideoDropdownOpen, setIsVideoDropdownOpen] = useState(false);
  const [selectedVideoDeviceLocal, setSelectedVideoDeviceLocal] =
    useState(selectedVideoDevice);
  const [selectedMicrophoneDeviceLocal, setSelectedMicrophoneDeviceLocal] =
    useState(selectedMicrophoneDevice);
  const [selectedSpeakerDeviceLocal, setSelectedSpeakerDeviceLocal] = useState(
    selectedSpeakerDevice
  );
  const [cameraDevicesLocal, setCameraDevices] =
    useState<MediaDeviceInfo[]>(cameraDevices);
  const [microphoneDevicesLocal, setMicrophoneDevices] =
    useState<MediaDeviceInfo[]>(microphoneDevices);
  const [speakerDevicesLocal, setSpeakerDevices] =
    useState<MediaDeviceInfo[]>(speakerDevices);

  const [checkerNotice, setCheckerNotice] = useState({
    title: "Before you begin...",
    desc: "Let's set everything up so JIA can hear you crystal clear.",
  });

  const [internetChecked, setInternetChecked] = useState(false);
  const [audioChecked, setAudioChecked] = useState(false);
  const [micChecked, setMicChecked] = useState(false);
  const [videoChecked, setVideoChecked] = useState(false);

  const [startInterview, setStartInterview] = useState(false);

  // Modal states
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [micStrength, setMicStrength] = useState(0);

  useEffect(() => {
    if (internetChecked && audioChecked && micChecked && videoChecked) {
      setStartInterview(true);

      setCheckerNotice({
        title: "All Set!",
        desc: "You are ready to start the interview.",
      });
    } else {
      setStartInterview(false);

      setCheckerNotice({
        title: "Before you begin...",
        desc: "Let's set everything up so JIA can hear you crystal clear.",
      });
    }

    if (videoElement) {
      setVideoChecked(true);
    }
    // errorToast("Hello it works fine", "bottom-center");
  }, [internetChecked, audioChecked, micChecked, videoChecked]);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".device-picker")) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update local state when props change
  useEffect(() => {
    setSelectedVideoDeviceLocal(selectedVideoDevice);
    setSelectedMicrophoneDeviceLocal(selectedMicrophoneDevice);
    setSelectedSpeakerDeviceLocal(selectedSpeakerDevice);
    setCameraDevices(cameraDevices);
    setMicrophoneDevices(microphoneDevices);
    setSpeakerDevices(speakerDevices);

    if (!internetChecked) {
      setCheckerNotice({
        title: "Slow Network",
        desc: "It seems your network is slow, please check your internet connection.",
      });
    }

    if (cameraDevices.length === 0) {
      setCheckerNotice({
        title: "No Camera Found",
        desc: "Please check your browser permissions and try again.",
      });
    }

    if (microphoneDevices.length === 0) {
      setCheckerNotice({
        title: "No Microphone Found",
        desc: "Please check your browser permissions and try again.",
      });
    }

    if (speakerDevices.length === 0) {
      setCheckerNotice({
        title: "No Speaker Found",
        desc: "Please check your browser permissions and try again.",
      });
    }
  }, [
    selectedVideoDevice,
    selectedMicrophoneDevice,
    selectedSpeakerDevice,
    cameraDevices,
    microphoneDevices,
    speakerDevices,
  ]);

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setIsDropdownOpen(false);
    setIsMicrophoneDropdownOpen(false);
    setIsVideoDropdownOpen(false);
  };

  // Function to open a specific dropdown and close others
  const openDropdown = (dropdownType: "speaker" | "microphone" | "video") => {
    closeAllDropdowns();
    switch (dropdownType) {
      case "speaker":
        setIsDropdownOpen(true);
        break;
      case "microphone":
        setIsMicrophoneDropdownOpen(true);
        break;
      case "video":
        setIsVideoDropdownOpen(true);
        break;
    }
  };

  // Custom Device Picker Component
  const DevicePicker = ({
    devices,
    selectedDevice,
    onDeviceChange,
    isOpen,
    setIsOpen,
    icon,
    placeholder,
    dropdownType,
  }: {
    devices: MediaDeviceInfo[];
    selectedDevice: string;
    onDeviceChange: (deviceId: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    icon: string;
    placeholder: string;
    dropdownType: "speaker" | "microphone" | "video";
  }) => {
    // Find the selected device to display its label
    const selectedDeviceInfo = devices.find(
      (device) => device.deviceId === selectedDevice
    );
    const displayText =
      selectedDeviceInfo?.label || selectedDevice || placeholder;

    return (
      <div className="device-picker mr-1">
        <div
          className="picker-button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              openDropdown(dropdownType);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 12px",
            backgroundColor: "#F8F8F8",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minWidth: "200px",
            position: "relative",
          }}
        >
          <i
            className={icon}
            style={{
              color: "#6B6B6B",
              fontSize: "16px",
            }}
          ></i>
          <span
            style={{
              color: "#2C2C2C",
              fontSize: "14px",
              flex: 1,
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayText.substring(0, 15)}...
          </span>
          <i
            className={`la ${isOpen ? "la-chevron-up" : "la-chevron-down"}`}
            style={{
              color: "#6B6B6B",
              fontSize: "12px",
            }}
          ></i>
        </div>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              backgroundColor: "white",
              border: "1px solid #E0E0E0",
              width: "fit-content",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              marginTop: "4px",
              zIndex: 1000,
            }}
          >
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className="dropdown-item"
                onClick={() => {
                  onDeviceChange(device.deviceId);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#2C2C2C",
                  whiteSpace: "nowrap",
                }}
              >
                {device.label || `Device ${device.deviceId.slice(0, 8)}...`}
              </div>
            ))}
            {devices.length === 0 && (
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                No devices available
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const testAudio = async () => {
    setShowAudioModal(true);

    const audio = document.getElementById("sound-sample") as HTMLAudioElement;
    audio.currentTime = 0;
    audio.muted = false;
    audio.loop = true;
    audio.play();

    audio.addEventListener("ended", () => {
      setShowAudioModal(false);
    });
  };

  const stopAudioTest = async () => {
    setShowAudioModal(false);

    const audio = document.getElementById("sound-sample") as HTMLAudioElement;

    audio.pause();
    audio.currentTime = 0;
    audio.muted = true;
  };

  const testMic = async () => {
    try {
      setShowMicModal(true);
      setMicStrength(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      // Create an analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Create a buffer to receive the data
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Function to get mic input strength (0-100)
      function getMicStrength() {
        analyser.getByteTimeDomainData(dataArray);
        // Calculate RMS (root mean square) of the waveform
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        // Map RMS (0-1) to 0-39 scale for the meter
        const strength = Math.min(100, Math.max(0, Math.round(rms * 100)));
        return strength;
      }

      let accumulator = 0;

      let maxAccumulator = 120;

      const interval = setInterval(() => {
        const strength = getMicStrength();
        setMicStrength(strength);

        accumulator += strength;

        if (accumulator >= maxAccumulator) {
          setMicChecked(true);
          successToast("Great I can hear you well!", 2000);
          setShowMicModal(false);
          return false;
        }

        console.log("Mic input strength:", strength);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        setShowMicModal(false);

        if (accumulator >= maxAccumulator) {
          setMicChecked(true);
          successToast("Great I can hear you well!", 2000);
        } else {
          errorToast(
            "Please check your microphone, Speak louder and try again",
            "bottom-center"
          );
          setMicChecked(false);
        }
      }, 5000); // Reduced to 10 seconds for better UX
    } catch (err) {
      setShowMicModal(false);
      console.error("Mic test failed:", err);
    }
  };

  // Audio Test Modal Component
  const TEST_AUDIO_MODAL = () => {
    if (!showAudioModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/speaker-icon.png"
            alt="speaker"
            className="img-fluid mb-2 heartbeat"
          />

          {/* Title */}
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 16px",
              color: "#333",
            }}
          >
            Playing Sound...
          </h3>

          {/* Instructions */}
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              margin: "0 0 32px",
              lineHeight: "1.5",
              fontWeight: 500,
            }}
          >
            Listen for the audio and adjust your speaker volume if you can hear.
          </p>

          {/* Audio Level Meter */}

          <div
            style={{
              display: "flex",
              gap: "2px",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
              marginTop: "90px",
              position: "absolute",
            }}
          >
            {Array.from({ length: 14 }, (_, i) => (
              <>
                <div className="speaking-indicator">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              </>
            ))}
          </div>

          <button
            className="btn btn-dark btn-rounded-pill mt-5"
            onClick={() => {
              successToast(
                "Awesome!, double check your microphone next.",
                3000
              );
              setAudioChecked(true);
              stopAudioTest();
            }}
          >
            Yes, I can hear it fine.
          </button>

          <button
            className="btn btn-outline-default btn-rounded-pill mt-2 ml-0"
            onClick={() => {
              errorToast(
                "Hmm, Check your speaker and volume.. and try again",
                3000
              );
              setAudioChecked(false);
              setShowAudioModal(false);
              stopAudioTest();
            }}
          >
            No, I can't hear it.
          </button>
        </div>
      </div>
    );
  };

  // Microphone Test Modal Component
  const TEST_MIC_MODAL = () => {
    if (!showMicModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          }}
        >
          <img
            src="/speaker-icon.png"
            alt="speaker"
            className="img-fluid mb-2 heartbeat"
          />

          {/* Title */}
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 16px",
              color: "#333",
            }}
          >
            Speak now.
          </h3>

          {/* Instructions */}
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              margin: "0 0 32px",
              lineHeight: "1.5",
            }}
          >
            Say hello and tell Jia your nickname.
          </p>

          {/* Audio Level Meter */}
          <div
            style={{
              display: "flex",
              gap: "2px",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {Array.from({ length: 39 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "30px",
                  backgroundColor: i < micStrength ? "#4CAF50" : "#e0e0e0",
                  borderRadius: "2px",
                  transition: "background-color 0.1s ease",
                }}
              ></div>
            ))}
          </div>

          {/* Progress indicator */}
          <div
            style={{
              fontSize: "14px",
              color: "#999",
            }}
          >
            Testing microphone input...
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="interview-system-check"
        style={{
          display: isStarted ? "none" : "",
        }}
      >
        <TEST_AUDIO_MODAL />
        <TEST_MIC_MODAL />

        <audio id="sound-sample" autoPlay className="d-none" controls muted>
          <source src="/promise-616.mp3" type="audio/mpeg" />
        </audio>

        <div className="main-container">
          <div className="inner-panes">
            <div className="left-pane">
              <div className="system-check-title">
                <MeetingClock /> <span className=" text-muted">|</span>{" "}
                <span>
                  {jobTitle} : {candidateName}
                </span>
              </div>
              <div className="system-check-video-group">
                {!isStarted && (
                  <video ref={videoElement} autoPlay muted playsInline />
                )}
              </div>
            </div>
            <div className="right-pane">
              <div className="system-cheklist">
                <h2>Hey, {candidateName?.split(" ")?.[0]}</h2>

                <LayeredCard
                  style={{
                    border: "1px solid #ddd",
                  }}
                  innerCardClassName="bg-white px-4 py-3"
                >
                  <div className="text-center">
                    <h3>{checkerNotice.title}</h3>
                    <span>{checkerNotice.desc}</span>
                  </div>
                  <div className="system-check-list-item">
                    <div className="system-check-rows">
                      <div className="check-item-row">
                        <div className="item-info">
                          <div
                            className={`check-node ${
                              internetChecked ? "passed" : ""
                            }`}
                          >
                            {internetChecked && <i className="la la-check"></i>}
                          </div>
                          <strong>Internet</strong>
                        </div>

                        <div className="item-action">
                          <NetworkMonitorTag
                            setInternetChecked={setInternetChecked}
                          />
                        </div>
                      </div>

                      <div className="check-item-row">
                        <div
                          className="item-info"
                          onClick={() => {
                            testAudio();
                          }}
                        >
                          <div
                            className={`check-node ${
                              audioChecked ? "passed" : ""
                            }`}
                          >
                            {audioChecked && <i className="la la-check"></i>}
                          </div>
                          <strong>Audio</strong>
                        </div>

                        <div className="item-action d-flex align-items-center">
                          {speakerDevicesLocal.length > 0 && (
                            <DevicePicker
                              devices={speakerDevicesLocal}
                              selectedDevice={selectedSpeakerDeviceLocal}
                              onDeviceChange={(deviceId) => {
                                setSelectedSpeakerDeviceLocal(deviceId);
                                onSpeakerDeviceChange(deviceId);
                              }}
                              isOpen={isDropdownOpen}
                              setIsOpen={setIsDropdownOpen}
                              icon="la la-volume-up"
                              placeholder="Select Speaker"
                              dropdownType="speaker"
                            />
                          )}

                          {audioChecked && speakerDevicesLocal.length > 0 && (
                            <div className={`connection-status good`}>
                              <span>Passed</span>
                            </div>
                          )}

                          {speakerDevicesLocal.length === 0 && (
                            <div className={`connection-status bad`}>
                              <span>No Speaker Found</span>
                            </div>
                          )}

                          {!audioChecked && speakerDevicesLocal.length > 0 && (
                            <div
                              className={`connection-status cursor-pointer`}
                              onClick={() => {
                                testAudio();
                              }}
                            >
                              <span>Test</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="check-item-row">
                        <div
                          className="item-info"
                          onClick={() => {
                            setMicChecked(false);
                            testMic();
                          }}
                        >
                          <div
                            className={`check-node ${
                              micChecked ? "passed" : ""
                            }`}
                          >
                            {micChecked && <i className="la la-check"></i>}
                          </div>
                          <strong>Mic</strong>
                        </div>

                        <div className="item-action d-flex align-items-center">
                          {microphoneDevicesLocal.length > 0 && (
                            <DevicePicker
                              devices={microphoneDevicesLocal}
                              selectedDevice={selectedMicrophoneDeviceLocal}
                              onDeviceChange={(deviceId) => {
                                setSelectedMicrophoneDeviceLocal(deviceId);
                                onMicrophoneDeviceChange(deviceId);
                              }}
                              isOpen={isMicrophoneDropdownOpen}
                              setIsOpen={setIsMicrophoneDropdownOpen}
                              icon="la la-microphone"
                              placeholder="Select Microphone"
                              dropdownType="microphone"
                            />
                          )}

                          {micChecked && microphoneDevicesLocal.length > 0 && (
                            <div className={`connection-status good`}>
                              <span>Passed</span>
                            </div>
                          )}

                          {microphoneDevicesLocal.length === 0 && (
                            <div className={`connection-status bad`}>
                              <span>No Microphone Found</span>
                            </div>
                          )}

                          {!micChecked && microphoneDevicesLocal.length > 0 && (
                            <div
                              className={`connection-status cursor-pointer`}
                              onClick={testMic}
                            >
                              <span>Test</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="check-item-row">
                        <div className="item-info">
                          <div
                            className={`check-node ${
                              videoChecked ? "passed" : ""
                            }`}
                          >
                            {videoChecked && <i className="la la-check"></i>}
                          </div>
                          <strong>Video</strong>
                        </div>

                        <div className="item-action d-flex align-items-center">
                          {cameraDevicesLocal.length > 0 && (
                            <DevicePicker
                              devices={cameraDevicesLocal}
                              selectedDevice={selectedVideoDeviceLocal}
                              onDeviceChange={(deviceId) => {
                                setSelectedVideoDeviceLocal(deviceId);
                                onVideoDeviceChange(deviceId);
                              }}
                              isOpen={isVideoDropdownOpen}
                              setIsOpen={setIsVideoDropdownOpen}
                              icon="la la-video-camera"
                              placeholder="Select Camera"
                              dropdownType="video"
                            />
                          )}

                          {videoChecked && cameraDevicesLocal.length > 0 && (
                            <div className={`connection-status good`}>
                              <span>Passed</span>
                            </div>
                          )}

                          {cameraDevicesLocal.length === 0 && (
                            <div className={`connection-status bad`}>
                              <span>No Camera Found</span>
                            </div>
                          )}

                          {!videoChecked && (
                            <div className={`connection-status cursor-pointer`}>
                              <span>Test</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </LayeredCard>

                {!startInterview && (
                  <small className="text-dark mt-4 text-center">
                    Please make sure the you have the 4 items above tested{" "}
                    <br /> and checked in order to proceed.
                  </small>
                )}

                {startInterview && (
                  <small className="text-dark mt-4 text-center">
                    All good, click "Start Interview" to proceed.
                  </small>
                )}

                <button
                  className="btn mt-4"
                  style={{
                    fontWeight: 600,
                    background: "#000",
                    maxWidth: "194px",
                    height: "44px",
                    width: "100%",
                    color: "#fff",
                    border: "none",
                    borderRadius: "30px",
                    display: "grid",
                    fontSize: "1rem",
                    margin: "0 auto",
                    transition: "all 0.3s ease",
                    opacity: startInterview ? 1 : 0.3,
                    cursor: startInterview ? "pointer" : "not-allowed",
                  }}
                  onClick={onSystemCheckComplete}
                >
                  <span className="m-auto">
                    Start Interview <i className="la la-arrow-right"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
