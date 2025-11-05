"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function () {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const recorderRef = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => chunks.current.push(e.data);

      recorder.onstop = async () => {
        const t0 = performance.now();
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const formData = new FormData();

        formData.append("file", blob, "recording.webm");
        chunks.current = [];
        setIsLoading(true);

        axios({
          method: "POST",
          url: "/api/speech-to-text",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }).then((STTres) => {
          axios({
            method: "POST",
            url: "/api/chat-completion",
            data: STTres.data,
          }).then((textRes) => {
            axios({
              method: "POST",
              url: "/api/text-to-speech",
              data: { text: textRes.data },
              responseType: "blob",
            }).then((TTSres) => {
              const audio = new Audio(URL.createObjectURL(TTSres.data));
              setIsLoading(false);
              setTranscript(textRes.data);
              audio.play();

              const t1 = performance.now();

              console.log(`Took ${(t1 - t0) / 1000} seconds`);
            });
          });
        });
      };
    });
  }, []);

  function start() {
    recorderRef.current?.start();
    setTranscript("");
    setIsRecording(true);
  }

  function stop() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div>
      {!isLoading && (
        <button
          className="btn btn-default"
          onClick={start}
          disabled={isRecording}
        >
          Start
        </button>
      )}

      <button onClick={stop} disabled={!isRecording}>
        Stop
      </button>

      {transcript && <p>{transcript}</p>}

      {isLoading && <p>Loading...</p>}
    </div>
  );
}
