"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { guid } from "../Utils";
import Swal from "sweetalert2";
import AvatarImage from "../components/AvatarImage/AvatarImage";
import FeedbackModal from "../Modal/FeedbackModal";
import VoiceTextToSpeech from "./VoiceTextToSpeech";
import { refineUserTranscriptInput } from "./TranscriptUtils";
import { customLog } from "../CustomLogs";
import { Offline } from "react-detect-offline";
import JiaOrb from "./JiaOrb";
import MeetingTimer from "./MeetingTimer";
import MeetingClock from "./MeetingClock";
import UserTranscriptPreview from "./UserTranscriptPreview";
import InterviewSummary from "./InterviewSummary";
import InterviewSystemCheck from "./InterviewSystemCheck";
import NetworkMonitorTag from "./NetworkMonitorTag";

// Declare the tabSwitch property on the Window interface
declare global {
  interface Window {
    tabSwitch: number;
    savedMessageIDs: any[];
  }
}

export default function VoiceAssistantV2({
  interviewID,
}: {
  interviewID: string;
}) {
  const { user } = useAppContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recorderRef = useRef(null);
  const pcRef = useRef(null);
  const [message, setMessage] = useState([]);

  const [userSpeaking, setUserSpeaking] = useState(false);
  const [jiaSpeaking, setJiaSpeaking] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const mixedRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const videoElement = useRef<HTMLVideoElement>(null);
  const videoElement2 = useRef<HTMLVideoElement>(null);
  const actualMimeTypeRef = useRef("");
  const uploadIdRef = useRef(null);
  const recordingIdRef = useRef(null);
  const uploadPartsRef = useRef<{ partNumber: number; etag: string }[]>([]);
  const currentPartNumberRef = useRef(0);
  const uploadChainRef = useRef(Promise.resolve());
  const finalUploadRef = useRef(false);
  const bufferSizeRef = useRef(0);
  const recordingChunksRef = useRef([]);
  const CHUNK_SIZE = 5 * 1024 * 1024;
  const [currentJiaMessage, setCurrentJiaMessage] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("interview");

  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [selectedMicrophoneDevice, setSelectedMicrophoneDevice] = useState("");
  const [selectedSpeakerDevice, setSelectedSpeakerDevice] = useState("");
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);

  // Function to enumerate available devices
  const enumerateDevices = async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras = devices.filter((device) => device.kind === "videoinput");
      const microphones = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput"
      );

      setCameraDevices(cameras);
      setMicrophoneDevices(microphones);
      setSpeakerDevices(speakers);

      // Set default selections if available
      if (cameras.length > 0) {
        setSelectedVideoDevice(cameras[0].deviceId);
      }
      if (microphones.length > 0) {
        setSelectedMicrophoneDevice(microphones[0].deviceId);
      }
      if (speakers.length > 0) {
        setSelectedSpeakerDevice(speakers[0].deviceId);
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  };

  // Function to validate if a device is still available
  const isDeviceAvailable = (
    deviceId: string,
    deviceList: MediaDeviceInfo[]
  ) => {
    return deviceList.some((device) => device.deviceId === deviceId);
  };

  // Function to get fallback device
  const getFallbackDevice = (deviceList: MediaDeviceInfo[]) => {
    return deviceList.length > 0 ? deviceList[0].deviceId : undefined;
  };

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, []);

  // Callback functions for device selection
  const handleVideoDeviceChange = (deviceId: string) => {
    if (isDeviceAvailable(deviceId, cameraDevices)) {
      setSelectedVideoDevice(deviceId);
    } else {
      console.warn(`Selected video device ${deviceId} is not available`);
      const fallbackDevice = getFallbackDevice(cameraDevices);
      if (fallbackDevice) {
        setSelectedVideoDevice(fallbackDevice);
      }
    }
  };

  const handleMicrophoneDeviceChange = (deviceId: string) => {
    if (isDeviceAvailable(deviceId, microphoneDevices)) {
      setSelectedMicrophoneDevice(deviceId);
    } else {
      console.warn(`Selected microphone device ${deviceId} is not available`);
      const fallbackDevice = getFallbackDevice(microphoneDevices);
      if (fallbackDevice) {
        setSelectedMicrophoneDevice(fallbackDevice);
      }
    }
  };

  const handleSpeakerDeviceChange = (deviceId: string) => {
    if (isDeviceAvailable(deviceId, speakerDevices)) {
      setSelectedSpeakerDevice(deviceId);
    } else {
      console.warn(`Selected speaker device ${deviceId} is not available`);
      const fallbackDevice = getFallbackDevice(speakerDevices);
      if (fallbackDevice) {
        setSelectedSpeakerDevice(fallbackDevice);
      }
    }
  };

  function start() {
    if (!localStorage.acceptedDisclaimer) {
      runDisclaimer(start);
      return false;
    }

    recorderRef.current?.start();
    // Add timesplice to chunk data every 1 second
    mixedRecorderRef.current?.start(1000);

    setIsSpeaking(true);

    if (document.getElementById("play-tts-btn")) {
      setTimeout(() => {
        document.getElementById("play-tts-btn").click();
      }, 200);
    }

    setIsStarted(true);
  }

  function stop() {
    recorderRef.current?.stop();
    mixedRecorderRef.current?.stop();
    setIsSpeaking(false);
    setJiaSpeaking(false);
    setUserSpeaking(false);

    setCurrentScreen("summary");
    setCurrentJiaMessage(null);
  }

  function runDisclaimer(start: any) {
    const steps = [
      {
        title: "Interview Terms and Conditions",
        html: `
          <div style="text-align: left; padding: 20px;">
            <p style="margin-bottom: 20px;">By proceeding, you confirm that you have read, understood, and agree to the following terms:</p>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #333; margin-bottom: 8px;">Authenticity</h3>
              <p style="margin: 0; font-size: 14px;">You will complete this interview independently. You confirm that all responses provided are your own and that you are the actual applicant participating in the interview.</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #333; margin-bottom: 8px;">Fairness</h3>
              <p style="margin: 0; font-size: 14px;">You agree not to use any external assistance, tools, or AI systems that may give you an unfair advantage over other applicants.</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #333; margin-bottom: 8px;">Confidentiality</h3>
              <p style="margin: 0; font-size: 14px;">You will not copy, share, or distribute any part of the interview questions or process to others in any form.</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #333; margin-bottom: 8px;">Audio Recording</h3>
              <p style="margin: 0; font-size: 14px;">You consent to the recording of your audio responses for the purpose of review, assessment, and audit. These recordings will be handled in accordance with our data privacy policy.</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #333; margin-bottom: 8px;">Data Privacy</h3>
              <p style="margin: 0; font-size: 14px;">Your interview data, including audio and metadata, will be stored securely and used solely for recruitment purposes in compliance with applicable data protection laws.</p>
            </div>
            
            <p style="margin-top: 20px; font-weight: bold;">By clicking Start Interview, you agree to be bound by these terms.</p>
          </div>
        `,
        confirmButtonText: "Start Interview",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        preConfirm: undefined,
      },
    ];

    let currentStep = 0;

    const showStep = (stepIndex: number) => {
      const step = steps[stepIndex];

      Swal.fire({
        title: step.title,
        html: step.html,
        confirmButtonText: step.confirmButtonText,
        showCancelButton: step.showCancelButton || false,
        cancelButtonText: step.cancelButtonText || "Cancel",
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: step.preConfirm,
        customClass: {
          popup: "disclaimer-popup fade-in-bottom",
        },
        showClass: {
          popup: `
     fade-in-bottom
    `,
        },
      }).then((result) => {
        if (result.isConfirmed) {
          if (stepIndex < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
          } else {
            // All steps completed, mark disclaimer as accepted and start interview
            localStorage.setItem("acceptedDisclaimer", "true");
            start();
          }
        } else if (result.isDismissed && step.showCancelButton) {
          // User cancelled on final step
          Swal.fire({
            icon: "info",
            title: "Interview Cancelled",
            text: "You can restart when you're ready.",
            confirmButtonText: "OK",
          });
        }
      });
    };

    // Start the disclaimer flow
    showStep(0);
  }

  function progressivelySaveTranscript() {
    if (message.length === 0) {
      return false;
    }

    let currentMessage = message[message.length - 1];

    axios
      .post("/api/save-transcript", {
        interviewID: interviewID,
        data: [currentMessage],
      })
      .then((res) => {
        // console.log(`[INFO] Message ${currentMessage.uid} Saved!`);
      })
      .catch((err) => {
        console.log(`[ERR] Message ${currentMessage.uid}`);
        console.log(err);
      });
  }

  const [interviewDetails, setInterviewDetails] = useState(null);
  const [meetingPrompt, setMeetingPrompt] = useState(null);

  const fetchInterviewDetails = async () => {
    Swal.fire({
      icon: "info",
      title: "Preparing Interview...",
      text: "Please wait, for a few moments, Thank you..",
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
      showClass: {
        popup: `
     fade-in-bottom
    `,
      },
    });
    Swal.showLoading();

    const response = await axios
      .post("/api/interview-details", {
        id: interviewID,
      })
      .then((res: any) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Interview Not Found",
          text: "This interview is not available anymore.",
          allowOutsideClick: false,
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = "/dashboard";
            // const interviewRedirection = sessionStorage.getItem(
            //   "interviewRedirection"
            // );

            // if (interviewRedirection) {
            //   sessionStorage.removeItem("interviewRedirection");
            //   window.location.href = interviewRedirection;
            // } else {
            //   window.location.href = "/applicant";
            // }
          }
        });

        return false;
      });

    let details = response.data;

    if (!["For Interview", "For AI Interview"].includes(details.status)) {
      window.location.href = "/dashboard";
      // const interviewRedirection = sessionStorage.getItem(
      //   "interviewRedirection"
      // );

      // if (interviewRedirection) {
      //   sessionStorage.removeItem("interviewRedirection");
      //   window.location.href = interviewRedirection;
      // } else {
      //   window.location.href = "/applicant";
      // }

      return false;
    }

    // Set default requireVideo to true if it is undefined or null
    if (details.requireVideo === undefined || details.requireVideo === null) {
      details.requireVideo = true;
    }

    setInterviewDetails(details);

    let selectedQuestions = [];
    if (details.questions?.[0]?.category) {
      const filteredQuestions = details.questions.filter(
        (questionGroup) => questionGroup.questions.length > 0
        // && questionGroup.questionCountToAsk !== 0
      );

      filteredQuestions.forEach((questionGroup) => {
        selectedQuestions.push(
          ...questionGroup.questions.map((question) => question.question)
        );
      });
      // selectedQuestions = shuffleArray(selectedQuestions);
    } else {
      // Old data structure
      // selectedQuestions = shuffleArray(
      //   details.questions.map((question) => question.question)
      // );
      selectedQuestions = details.questions.map(
        (question) => question.question
      );
    }

    let interviewInstructions = `
    You an Job Interview Assistant named Jia from White Cloak Technologies
    Greet the user first to start the interview.
    Interview the applicant based of the information and instructions below:

    Applicant Name: 
    ${details.name}
    Role Applying for: 
    ${details.jobTitle}
    Job Description: 
    ${details.description}

    Question List:
    ${selectedQuestions
      .map((question, i) => {
        return i + 1 + ". " + question;
      })
      .join("\n")}

    
      ${details.config.traits_prompt.prompt}
    `;
    setMeetingPrompt(interviewInstructions);
  };

  const fns = {
    endInterview: () => {
      stop();
      return { success: true };
    },
  };

  useEffect(() => {
    fetchInterviewDetails();
    enumerateDevices();

    window.onblur = () => {
      if (!window.tabSwitch) {
        window.tabSwitch = 0;
      }

      if (window.tabSwitch) {
        window.tabSwitch += 1;
      }
      console.log(window.tabSwitch);
    };
  }, []);

  const handleVideoEnded = () => {
    console.log("[INFO] Camera has been turned off or disconnected");
    setCameraOpen(false);
  };

  useEffect(() => {
    if (meetingPrompt && isReady) {
      let BASE_URL = window.location.origin;

      axios({
        method: "POST",
        url: `${BASE_URL}/api/ephemeral-key`,
        data: {
          instructions: meetingPrompt,
          config: interviewDetails.config,
          tools: [
            {
              type: "function",
              name: "endInterview",
              description:
                "Ends the interview, can be triggered by assistant or user",
              parameters: {
                type: "object",
                properties: {},
              },
            },
          ],
        },
      })
        .then((keyResponse) => {
          const startWebRTCLLMSession = (keyResponse: any) => {
            // Validate and get available devices
            const validVideoDevice = isDeviceAvailable(
              selectedVideoDevice,
              cameraDevices
            )
              ? selectedVideoDevice
              : getFallbackDevice(cameraDevices);

            const validAudioDevice = isDeviceAvailable(
              selectedMicrophoneDevice,
              microphoneDevices
            )
              ? selectedMicrophoneDevice
              : getFallbackDevice(microphoneDevices);

            // Create constraints based on selected devices
            const videoConstraints = Boolean(interviewDetails?.requireVideo)
              ? {
                  width: { ideal: 640 },
                  height: { ideal: 360 },
                  frameRate: { ideal: 15 },
                  deviceId: validVideoDevice ? validVideoDevice : undefined,
                }
              : false;

            const audioConstraints = {
              noiseSuppression: true,
              autoGainControl: true,
              echoCancellation: true,
              deviceId: validAudioDevice ? validAudioDevice : undefined,
            };

            navigator.mediaDevices
              .getUserMedia({
                video: videoConstraints,
                audio: audioConstraints,
              })
              .then(async (stream) => {
                // close loading button
                Swal.close();
                const recorder = new MediaRecorder(stream);
                recorderRef.current = recorder;

                const EPHEMERAL_KEY = keyResponse.data.key.client_secret.value;
                const pc = new RTCPeerConnection();
                pcRef.current = pc;

                // Create an audio context for mixing video and audio streams
                if (!audioContextRef.current) {
                  try {
                    audioContextRef.current = new AudioContext({
                      sampleRate: 16000,
                    });
                    if (audioContextRef.current.state === "suspended") {
                      await audioContextRef.current.resume();
                    }
                    console.log(
                      "[INFO] Audio Context Created",
                      audioContextRef.current.state
                    );
                  } catch (error) {
                    console.error("[Error] Creating Audio Context =>", error);
                    customLog({
                      name: "[Interview Recording] Audio Context Error",
                      interviewID: interviewID,
                      err: error?.message || error,
                    });
                  }
                }

                // Add video to the mix if required
                if (interviewDetails?.requireVideo && videoElement.current) {
                  videoElement.current.srcObject = stream;
                  videoElement2.current.srcObject = stream;
                  setCameraOpen(true);

                  stream.getVideoTracks().forEach((track) => {
                    track?.addEventListener("ended", handleVideoEnded);
                  });
                }
                const audioContext = audioContextRef.current;
                const destination = audioContext.createMediaStreamDestination();

                // Add microphone audio to the mix
                const micSource = audioContext.createMediaStreamSource(stream);
                micSource.connect(destination);

                // Create and connect speaker audio
                const audioEl = document.createElement("audio");
                audioEl.autoplay = true;
                pc.ontrack = (e) => {
                  audioEl.srcObject = e.streams[0];
                  // Add JIA speaker audio to the mix
                  const speakerSource = audioContext.createMediaStreamSource(
                    e.streams[0]
                  );
                  speakerSource.connect(destination);
                };
                pc.addTrack(stream.getTracks()[0]);

                // Create recorder with the mixed audio stream and video stream
                const mixedStream = new MediaStream([
                  ...destination.stream.getAudioTracks(),
                  ...stream.getVideoTracks(),
                ]);
                let mimeType = interviewDetails?.requireVideo
                  ? "video/webm;codecs=vp9,opus"
                  : "audio/webm;codecs=opus";
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                  console.log(
                    `[INFO] MIME type ${mimeType} not supported, using default`
                  );
                  mimeType = "";
                }
                const constraints: any = {
                  audioBitsPerSecond: 32000,
                };
                if (interviewDetails?.requireVideo) {
                  constraints.videoBitsPerSecond = 400000;
                }
                if (mimeType) {
                  constraints.mimeType = mimeType;
                }
                const mixedRecorder = new MediaRecorder(
                  mixedStream,
                  constraints
                );
                mixedRecorderRef.current = mixedRecorder;
                console.log(`[INFO] MIME type ${mixedRecorder.mimeType}`);
                actualMimeTypeRef.current =
                  mixedRecorder.mimeType ||
                  (interviewDetails?.requireVideo
                    ? "video/webm;codecs=vp9,opus"
                    : "audio/webm;codecs=opus");

                mixedRecorder.onerror = (event) => {
                  customLog({
                    name: "[Interview Recording] MediaRecorder Error",
                    interviewID: interviewID,
                    err: event?.message || event,
                  });
                };

                mixedRecorder.onstop = () => {
                  console.log("[INFO] Recording stopped, finishing upload");
                  if (
                    bufferSizeRef.current > 0 &&
                    recordingChunksRef.current.length > 0
                  ) {
                    const finalChunk = new Blob(recordingChunksRef.current);
                    uploadChainRef.current = uploadChainRef.current.then(() =>
                      saveInterviewRecording(finalChunk)
                    );
                  }
                  uploadChainRef.current = uploadChainRef.current.then(() =>
                    completeInterviewUpload()
                  );
                };

                mixedRecorder.ondataavailable = (e) => {
                  if (e.data.size > 0) {
                    // console.log("[INFO] Recording chunk received");
                    recordingChunksRef.current.push(e.data);
                    bufferSizeRef.current += e.data.size;

                    let fullBlob = new Blob(recordingChunksRef.current);
                    let bufferSize = fullBlob.size;

                    while (bufferSize >= CHUNK_SIZE) {
                      const chunk = fullBlob.slice(0, CHUNK_SIZE);
                      uploadChainRef.current = uploadChainRef.current.then(() =>
                        saveInterviewRecording(chunk)
                      );

                      fullBlob = fullBlob.slice(CHUNK_SIZE);
                      bufferSize = fullBlob.size;
                    }

                    recordingChunksRef.current =
                      bufferSize > 0 ? [fullBlob] : [];
                    bufferSizeRef.current = bufferSize;
                  } else {
                    customLog({
                      name: "[Interview Recording] MediaRecorder Empty Chunk",
                      interviewID: interviewID,
                      err: "Recording chunk is empty",
                    });
                  }
                };

                const dc = pc.createDataChannel("oai-events");
                dc.addEventListener("message", (e) => {
                  try {
                    const data = JSON.parse(e.data);

                    // console.log(data);

                    if (
                      data.type.includes("input_audio_buffer.speech_started") ||
                      data.type.includes("input_audio_buffer.committed")
                    ) {
                      setUserSpeaking(true);
                      setJiaSpeaking(false);
                    }

                    if (
                      data.type.includes("output_audio") ||
                      data.type.includes("input_audio_buffer.speech_stopped")
                    ) {
                      setUserSpeaking(false);
                      setJiaSpeaking(true);
                    }

                    if (
                      data.type ===
                        "conversation.item.input_audio_transcription.completed" &&
                      data?.transcript
                    ) {
                      setMessage((prevMessages) => {
                        let lastMessage = prevMessages[prevMessages.length - 1];

                        if (
                          prevMessages.length === 0 ||
                          (lastMessage && lastMessage.type !== "user")
                        ) {
                          console.log("[new user msg] Add new user message");

                          let firstEntry = refineUserTranscriptInput(
                            data.transcript,
                            data.transcript
                          );

                          if (firstEntry.length === 0) {
                            return prevMessages;
                          }

                          return [
                            ...prevMessages,
                            {
                              type: "user",
                              content: firstEntry,
                              time: Date.now(),
                              uid: guid(),
                            },
                          ];
                        }

                        // bind content to the last type if it is the same type
                        if (lastMessage && lastMessage.type === "user") {
                          lastMessage.content = refineUserTranscriptInput(
                            lastMessage.content,
                            data.transcript
                          );
                          lastMessage.time = Date.now();
                          lastMessage.updated = true;

                          if (prevMessages.length === 0) return [lastMessage]; // edge case: empty array
                          return [...prevMessages.slice(0, -1), lastMessage]; // immutably replace last item
                        }
                      });
                    }

                    if (
                      data.type === "response.done" &&
                      data?.response?.output[0]?.type === "message"
                    ) {
                      setJiaSpeaking(true);
                      setUserSpeaking(false);
                      const newAIMessage = {
                        type: "jia",
                        content:
                          data?.response?.output[0]?.content[0]?.transcript,
                        time: Date.now(),
                        uid: guid(),
                      };

                      setCurrentJiaMessage(newAIMessage);

                      if (newAIMessage.content) {
                        setMessage((prevMessages) => {
                          // Check if this message content already exists in previous messages
                          const isDuplicate = prevMessages.some(
                            (msg) =>
                              msg.type === "jia" &&
                              msg.content === newAIMessage.content
                          );

                          if (isDuplicate) {
                            return prevMessages; // Don't add duplicate message
                          }

                          return [...prevMessages, newAIMessage].sort(
                            (a, b) => a.time - b.time
                          );
                        });
                      }
                    }

                    // handle function calls

                    // if (data.type === "response.function_call_arguments.done") {
                    //   const fn = fns[data.name];
                    //   fn();
                    // }

                    // catch possible event errors on custom logs
                    if (
                      data.type.includes("error") ||
                      data.type.includes("failed")
                    ) {
                      customLog({
                        name: "[Interview] RT OpenAI Error",
                        interviewID: interviewID,
                        err: data,
                      });
                    }
                  } catch (error) {
                    console.error("[Error] Data Channel Message =>", error);
                    customLog({
                      name: "[Interview] Data Channel Error",
                      interviewID: interviewID,
                      err: error?.message || error,
                    });
                  }
                });

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                recorder.onstart = () => {
                  axios({
                    method: "POST",
                    url: `https://api.openai.com/v1/realtime?model=${interviewDetails.config.llm_realtime_model}`,
                    data: offer.sdp,
                    headers: {
                      Authorization: `Bearer ${EPHEMERAL_KEY}`,
                      "Content-Type": "application/sdp",
                    },
                  }).then(async (sdpResponse) => {
                    await pc.setRemoteDescription({
                      type: "answer",
                      sdp: await sdpResponse.data,
                    });
                  });
                };

                recorder.onstop = () => {
                  pcRef.current?.close();
                  pcRef.current = null;
                };
              })
              .catch((error) => {
                console.error("[WebRTC Error] =>", error);
                customLog({
                  name: "[Interview] WebRTC Error",
                  interviewID: interviewID,
                  err: error,
                });

                // If error is permission denied, show a modal to ask for permission
                if (error.name === "NotAllowedError") {
                  // Modal to require camera
                  const requiredMedia = interviewDetails?.requireVideo
                    ? "Microphone and Camera"
                    : "Microphone";
                  Swal.fire({
                    icon: "info",
                    title: `${requiredMedia} Required`,
                    text: `Please open your ${requiredMedia} and refresh the page to start the interview.`,
                    allowOutsideClick: false,
                    showCancelButton: false,
                    showConfirmButton: true,
                  });
                  customLog({
                    name: "[Interview] Permission Denied Error",
                    interviewID: interviewID,
                    err: error,
                  });
                  return;
                }

                // If device not found or overconstrained, try with default constraints
                if (
                  error.name === "NotFoundError" ||
                  error.name === "NotReadableError" ||
                  error.name === "OverconstrainedError"
                ) {
                  console.log(
                    "[INFO] Selected device not available or overconstrained, trying with default devices"
                  );
                  const fallbackConstraints = {
                    video: Boolean(interviewDetails?.requireVideo)
                      ? {
                          width: { ideal: 640 },
                          height: { ideal: 360 },
                          frameRate: { ideal: 15 },
                        }
                      : false,
                    audio: {
                      noiseSuppression: true,
                      autoGainControl: true,
                      echoCancellation: true,
                    },
                  };

                  navigator.mediaDevices
                    .getUserMedia(fallbackConstraints)
                    .then(async (stream) => {
                      // Retry the session with default devices
                      startWebRTCLLMSession(keyResponse);
                    })
                    .catch((fallbackError) => {
                      console.error(
                        "[WebRTC Fallback Error] =>",
                        fallbackError
                      );
                      customLog({
                        name: "[Interview] WebRTC Fallback Error",
                        interviewID: interviewID,
                        err: fallbackError,
                      });

                      // Show error to user
                      Swal.fire({
                        icon: "error",
                        title: "Device Access Error",
                        text: "Unable to access camera or microphone. Please check your device permissions and try again.",
                        allowOutsideClick: false,
                        showCancelButton: false,
                        showConfirmButton: true,
                      });
                    });
                  return;
                }

                // try to reinitiate session
                customLog({
                  name: "[Interview] Retry WebRTC",
                  interviewID: interviewID,
                  err: error,
                });
                startWebRTCLLMSession(keyResponse);
              });
          };

          startWebRTCLLMSession(keyResponse);
        })
        .catch((error) => {
          console.error("[Error] Starting Voice Assistant Session =>", error);
          customLog({
            name: "[Interview] Error Starting Voice Assistant Session",
            interviewID: interviewID,
            err: error,
          });
        });
    }

    return () => {
      mixedRecorderRef.current?.stream?.getVideoTracks()?.forEach((track) => {
        track?.removeEventListener("ended", handleVideoEnded);
      });

      if (audioContextRef.current) {
        audioContextRef.current?.close().catch((error) => {
          console.error("[Error] Closing Audio Context =>", error);
        });
        audioContextRef.current = null;
      }
    };
  }, [meetingPrompt, isReady]);

  useEffect(() => {
    progressivelySaveTranscript();
  }, [message]);

  async function saveInterviewRecording(recordingBlob: Blob) {
    if (finalUploadRef.current) {
      console.log("[INFO] Upload already completed, skipping upload");
      return;
    }
    const partNumber = currentPartNumberRef.current + 1;
    console.log("[INFO] Saving interview recording part", partNumber);
    // Upload interview recording to storage
    try {
      const fileExtension = actualMimeTypeRef.current
        .split(";")[0]
        .split("/")[1];
      if (!recordingIdRef.current) {
        const recordingId = guid();
        const fileName = `recordings/interview_${interviewDetails._id}/${recordingId}.${fileExtension}`;
        recordingIdRef.current = fileName;
      }
      // Start the multipart upload
      if (!uploadIdRef.current) {
        const startUploadResponse = await fetch(
          "/api/start-multi-part-upload",
          {
            method: "POST",
            body: JSON.stringify({
              name: recordingIdRef.current,
              type: actualMimeTypeRef.current,
            }),
          }
        );
        const { uploadId } = await startUploadResponse.json();
        uploadIdRef.current = uploadId;
      }
      // Upload the part
      const presignedUrlResponse = await fetch("/api/get-presigned-url", {
        method: "POST",
        body: JSON.stringify({
          uploadId: uploadIdRef.current,
          partNumber: partNumber,
          filename: recordingIdRef.current,
        }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error(
          `Upload error - Status: ${presignedUrlResponse.status} - ${presignedUrlResponse.statusText}`
        );
      }

      const { presignedUrl } = await presignedUrlResponse.json();

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: recordingBlob,
        headers: {
          "Content-Type": actualMimeTypeRef.current,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Upload error - Status: ${uploadResponse.status} - ${uploadResponse.statusText}`
        );
      }

      const etag = uploadResponse.headers?.get("etag")?.replace(/"/g, "");
      if (etag) {
        uploadPartsRef.current.push({ partNumber: partNumber, etag });
        currentPartNumberRef.current = partNumber;

        // Update interview details with the new part number
        await fetch("/api/update-recording-details", {
          method: "POST",
          body: JSON.stringify({
            uid: interviewDetails._id,
            partNumber: partNumber,
            etag: etag,
            uploadId: uploadIdRef.current,
            filename: recordingIdRef.current,
            filetype: actualMimeTypeRef.current,
          }),
        });
      }
    } catch (error) {
      // Silently fail to proceed with the interview
      console.error("Error uploading recording", error);
      customLog({
        name: "[Interview Recording] Error Uploading Recording",
        interviewID: interviewID,
        err: error?.message || error,
      });
    }
  }

  async function completeInterviewUpload() {
    if (finalUploadRef.current) {
      console.log("[INFO] Final upload already completed");
      return;
    }

    if (uploadPartsRef.current.length === 0) {
      console.log("[INFO] No parts to upload");
      customLog({
        name: "[Interview Recording] No parts to upload",
        interviewID: interviewID,
        error: "No parts to upload",
      });
      return;
    }
    try {
      // Finish the upload
      const finishUploadResponse = await fetch("/api/finish-upload", {
        method: "POST",
        body: JSON.stringify({
          uploadId: uploadIdRef.current,
          parts: uploadPartsRef.current,
          fileName: recordingIdRef.current,
          filetype: actualMimeTypeRef.current,
          uid: interviewDetails._id,
        }),
      });

      if (!finishUploadResponse.ok) {
        throw new Error(
          `Finish upload error - Status: ${finishUploadResponse.status} - ${finishUploadResponse.statusText}`
        );
      }
      finalUploadRef.current = true;
    } catch (error) {
      console.error("[Error] Completing interview upload", error);
      customLog({
        name: "[Interview Recording] Error Completing Interview Upload",
        interviewID: interviewID,
        err: error?.message || error,
      });
    }
  }

  async function finishInterview() {
    let interviewInfo = { ...interviewDetails };
    delete interviewInfo.config;

    interviewInfo.tabSwitch = window.tabSwitch;

    let messageSet = [...message];

    messageSet = messageSet.sort((a, b) => a.time - b.time);
    if (!window.savedMessageIDs) {
      window.savedMessageIDs = [];
    }
    messageSet = messageSet.filter(
      (x) => !window.savedMessageIDs.includes(x.uid)
    );

    Swal.fire({
      icon: "info",
      title: "Completing Interview..",
      text: "Please wait, Don't close this tab yet..",
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
    });

    Swal.showLoading();

    await axios
      .post("/api/finish-interview", {
        data: interviewInfo,
      })
      .then((res) => {
        localStorage.removeItem("interviews");
        setTimeout(() => {
          Swal.close();
          setShowFeedbackModal(true);
        }, 1000);
      });
  }

  return (
    <>
      <Offline
        polling={{
          interval: 1000,
        }}
      >
        <div className="offline-indicator">
          <i className="la la-wifi la-2x text-danger"></i>
          <span>
            You are offline or have a slow internet connection, please check
            your network.
          </span>
        </div>
      </Offline>

      <InterviewSystemCheck
        candidateName={interviewDetails?.name}
        jobTitle={interviewDetails?.jobTitle}
        onSystemCheckComplete={() => {
          start();
        }}
        isStarted={isStarted}
        videoElement={videoElement}
        cameraDevices={cameraDevices}
        microphoneDevices={microphoneDevices}
        speakerDevices={speakerDevices}
        selectedVideoDevice={selectedVideoDevice}
        selectedMicrophoneDevice={selectedMicrophoneDevice}
        selectedSpeakerDevice={selectedSpeakerDevice}
        onVideoDeviceChange={handleVideoDeviceChange}
        onMicrophoneDeviceChange={handleMicrophoneDeviceChange}
        onSpeakerDeviceChange={handleSpeakerDeviceChange}
      />

      <div
        className={`meeting-interface ${
          currentScreen === "interview" ? "d-flex" : "d-none"
        }`}
      >
        <div className="meeting-container">
          <div className="interview-top-bar">
            <div className="interview-info">
              <MeetingClock />
              <span className="muted-text">|</span>
              <span className="interview-title">
                {interviewDetails && (
                  <>
                    {interviewDetails.jobTitle} : {interviewDetails.name}
                  </>
                )}
              </span>
              <span className="muted-text">|</span>
              <div className="timer">
                <MeetingTimer isStarted={isStarted} />
              </div>
            </div>
            <div className="interview-status">
              <NetworkMonitorTag
                setInternetChecked={(status) => {
                  // console.log("status", status);
                }}
              />
              {isSpeaking && (
                <button className="end-interview-btn" onClick={stop}>
                  <i className="la la-phone-slash"></i>
                  End Interview
                </button>
              )}

              <div className="start-btn-group">
                <button
                  className={`start-interview-btn ${
                    isSpeaking ? "d-none" : ""
                  }`}
                  onClick={() => {
                    if (
                      interviewDetails?.requireVideo &&
                      !cameraOpen &&
                      !isSpeaking
                    ) {
                      // Modal to require camera
                      Swal.fire({
                        icon: "info",
                        title: "Camera Required",
                        text: "Please open your camera and refresh the page to start the interview.",
                        allowOutsideClick: false,
                        showCancelButton: false,
                        showConfirmButton: true,
                      });
                    } else {
                      if (isSpeaking) {
                        stop();
                        customLog({
                          name: "[Interview] User Clicked Stop Interview",
                          interviewID: interviewID,
                          userEmail: user?.email,
                        });
                      } else {
                        start();
                      }
                    }
                  }}
                >
                  <i className="la la-phone"></i>
                  Start Interview
                </button>

                {isReady && !isStarted && (
                  <div className="start-tooltip heartbeat dl-3">
                    <div className="sharp-tip"></div>

                    <div className="box">
                      <span>
                        <i className="la la-microphone text-primary"></i> Click
                        "Start Interview" Begin
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="meeting-block"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Participant Video Display */}
            {interviewDetails?.requireVideo && (
              <div className="participant-video-container">
                <div
                  className={`video-preview ${
                    userSpeaking ? "user-speaking" : ""
                  }`}
                >
                  <div className="video-container">
                    <video
                      ref={videoElement2}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        display: cameraOpen ? "block" : "none",
                      }}
                    />
                  </div>
                </div>

                <div className="participant-info">
                  <span className="participant-name">
                    {user && (
                      <AvatarImage
                        src={user.image}
                        className="avatar-xsm rounded"
                      />
                    )}{" "}
                    {interviewDetails?.name || "Applicant"}
                  </span>
                  {userSpeaking && (
                    <div className="speaking-indicator">
                      <div className="wave"></div>
                      <div className="wave"></div>
                      <div className="wave"></div>
                      <div className="wave"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              className={`avatar-set  ${
                jiaSpeaking ? "heartbeat active" : "inactive"
              }`}
            >
              <div className={`outer-ring ${jiaSpeaking ? "heartbeat" : ""}`}>
                <div className="gap-ring">
                  <JiaOrb />
                </div>
              </div>
            </div>
          </div>
        </div>

        <VoiceTextToSpeech
          text="Hello there, how are you doing. Let's start the interview, when your are ready, just start speaking."
          voice={"alloy"}
          autoPlay={false}
          buttonText="Play Audio"
          loadingText="Generating..."
          onPlay={() => {
            setJiaSpeaking(true);
          }}
          onEnd={() => {
            setJiaSpeaking(false);
          }}
          onReady={() => {
            console.log("Greeting Ready");
            setIsReady(true);
          }}
          className="custom-class"
        />
      </div>

      {currentJiaMessage && (
        <div className="live-caption">
          <div className="live-caption-text">
            <span>
              <strong>Jia:</strong> {currentJiaMessage?.content}
            </span>
            {userSpeaking && <UserTranscriptPreview />}
          </div>
        </div>
      )}

      <InterviewSummary
        onFinishInterview={() => {
          finishInterview();
        }}
        interviewData={{
          transcript: message ? [...message] : [],
          candidateName: interviewDetails?.name,
          jobTitle: interviewDetails?.jobTitle,
        }}
        currentScreen={currentScreen}
      />

      {showFeedbackModal && (
        <FeedbackModal
          feedbackData={interviewDetails}
          onClose={() => {
            setShowFeedbackModal(false);

            Swal.fire({
              icon: "success",
              title: "Interview is Complete.",
              text: "You will be redirected in a few moments...",
              allowOutsideClick: false,
              showCancelButton: false,
              showConfirmButton: false,
            });

            setTimeout(() => {
              window.location.href = "/dashboard";
              // const interviewRedirection = sessionStorage.getItem(
              //   "interviewRedirection"
              // );

              // // custom whitecloak redirection
              // if (interviewDetails.orgID === "682d3fc222462d03263b0881") {
              //   window.location.href = "/whitecloak/applicant";
              //   return false;
              // }

              // if (interviewRedirection) {
              //   sessionStorage.removeItem("interviewRedirection");
              //   window.location.href = interviewRedirection;
              // } else {
              //   window.location.href = "/applicant";
              // }
            }, 3000);
          }}
        />
      )}
    </>
  );
}
