"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AvatarImage from "../components/AvatarImage/AvatarImage";

const AVATARS = {
  JIA_SPEAKING:
    "https://i.pinimg.com/originals/d8/e6/eb/d8e6eb6b345ada088e2448947c483ab4.gif",
  JIA_IDLE:
    "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc4181549-399a-4f21-9512-fc751a69a560_800x600.gif",
  SOUND: "/sound.gif",
} as const;

export default function TestSettingsModal({ settings }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recorderRef = useRef(null);
  const pcRef = useRef(null);
  const [message, setMessage] = useState([]);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [jiaSpeaking, setJiaSpeaking] = useState(false);

  function start() {
    recorderRef.current?.start();
    setIsSpeaking(true);
  }

  function stop() {
    recorderRef.current?.stop();
    setIsSpeaking(false);
    setJiaSpeaking(false);
    setUserSpeaking(false);
  }

  function autoScrollChat() {
    let chatThread = document.getElementById("test-chat");
    if (chatThread) {
      chatThread.scrollTo({
        top: chatThread.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    if (settings) {
      axios({
        method: "POST",
        url: "http://localhost:3000/api/ephemeral-key",
        data: {
          instructions: settings.instructions,
          turn_detection: settings.turn_detection,
        },
      }).then((keyResponse) => {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(async (stream) => {
            const recorder = new MediaRecorder(stream);
            recorderRef.current = recorder;

            const EPHEMERAL_KEY = keyResponse.data.key.client_secret.value;
            const pc = new RTCPeerConnection();
            pcRef.current = pc;

            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);
            pc.addTrack(stream.getTracks()[0]);

            const dc = pc.createDataChannel("oai-events");
            dc.addEventListener("message", (e) => {
              const data = JSON.parse(e.data);

              if (data.type.includes("input_audio")) {
                setUserSpeaking(true);
                setJiaSpeaking(false);
              }

              if (data.type.includes("output_audio")) {
                setUserSpeaking(false);
                setJiaSpeaking(true);
              }

              if (
                data.type ===
                  "conversation.item.input_audio_transcription.completed" &&
                data?.transcript
              ) {
                setUserSpeaking(true);
                setJiaSpeaking(false);
                setMessage((prevMessages) => [
                  ...prevMessages,
                  {
                    type: "user",
                    content: data.transcript,
                    time: Date.now(),
                  },
                ]);

                autoScrollChat();
              }

              if (data.type === "response.done") {
                setJiaSpeaking(true);
                setUserSpeaking(false);
                const newAIMessage = {
                  type: "jia",
                  content: data?.response?.output[0]?.content[0]?.transcript,
                  time: Date.now(),
                };

                if (newAIMessage.content) {
                  setMessage((prevMessages) =>
                    [...prevMessages, newAIMessage].sort(
                      (a, b) => a.time - b.time
                    )
                  );
                }

                autoScrollChat();
              }
            });

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            recorder.onstart = () => {
              axios({
                method: "POST",
                url: "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
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
          });
      });
    }
  }, [settings]);

  return (
    <div className="test-modal bg-default text-white rounded-lg p-4">
      <div className="test-interface flex flex-col md:flex-row gap-4">
        <div
          className="test-block mb-4 flex justify-center items-center"
          style={{ minWidth: 260, minHeight: 260 }}
        >
          <div
            className={`avatar-set ${jiaSpeaking ? "heartbeat active" : ""}`}
            style={{
              width: 260,
              height: 260,
              minWidth: 260,
              minHeight: 260,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className={`outer-ring ${jiaSpeaking ? "heartbeat" : ""}`}
              style={{
                width: 220,
                height: 220,
                minWidth: 220,
                minHeight: 220,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                className="gap-ring"
                style={{
                  width: 200,
                  height: 200,
                  minWidth: 200,
                  minHeight: 200,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AvatarImage
                  src={jiaSpeaking ? AVATARS.JIA_SPEAKING : AVATARS.JIA_IDLE}
                  className="chat-avatar spin blink-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="live-transcript bg-white text-dark rounded-lg shadow-lg flex-1"
          id="test-chat"
          style={{
            minWidth: 320,
            maxWidth: 480,
            width: "100%",
            minHeight: 320,
            maxHeight: 480,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="header-bar bg-primary text-white p-3 rounded-t-lg">
            <h3 className="mb-0">
              <i className="la la-square text-danger blink-1" /> Test Chat
            </h3>
          </div>
          <ul className="p-4 max-h-96 overflow-y-auto">
            {message.map((msg, idx) => (
              <li
                key={idx}
                className={`fade-in-bottom mb-3 p-3 rounded-lg ${
                  msg.type === "user"
                    ? "bg-light text-dark ml-auto"
                    : "bg-primary text-white"
                }`}
                style={{ maxWidth: "80%" }}
              >
                <strong className="text-sm">
                  {msg.type === "user" ? "You" : "Jia"}:
                </strong>{" "}
                <span className="text-sm">{msg.content}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="test-controls mt-4 flex items-center justify-between">
        <button
          className={`btn rounded-lg px-4 py-2 ${
            isSpeaking ? "bg-danger text-white" : "bg-primary text-white"
          }`}
          onClick={() => {
            isSpeaking ? stop() : start();
          }}
        >
          <i className="la la-microphone text-white la-2x"></i>
          <span className="ml-2">
            {isSpeaking ? "Stop Test" : "Start Test"}
          </span>
        </button>

        {userSpeaking && (
          <button
            className="btn fade-in bg-info text-white rounded-lg px-3 py-2"
            onClick={stop}
          >
            <AvatarImage
              src={AVATARS.SOUND}
              className="avatar-sm rounded-full"
            />
          </button>
        )}
      </div>
    </div>
  );
}
