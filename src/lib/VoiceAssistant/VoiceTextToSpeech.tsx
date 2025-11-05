"use client";

import { useState, useEffect } from "react";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

interface VoiceTextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  voice?: Voice;
  onPlay?: () => void;
  onEnd?: () => void;
  onReady?: () => void;
  className?: string;
  buttonText?: string;
  loadingText?: string;
}

export const VoiceTextToSpeech = ({
  text,
  autoPlay = false,
  voice = "alloy",
  onPlay,
  onEnd,
  onReady,
  className = "",
  buttonText = "Play",
  loadingText = "Loading...",
}: VoiceTextToSpeechProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    if (text && !isLoading && !isReady) {
      generateSpeech();
    }

    return () => {
      if (audioElement) {
        URL.revokeObjectURL(audioElement.src);
        audioElement.pause();
      }
    };
  }, [text]);

  useEffect(() => {
    if (autoPlay && isReady && audioElement) {
      playAudio();
    }
  }, [isReady, autoPlay]);

  const generateSpeech = async () => {
    if (!text || isLoading) return;

    try {
      setIsLoading(true);
      setIsReady(false);

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioElement) {
        URL.revokeObjectURL(audioElement.src);
        audioElement.pause();
      }

      const audio = new Audio(audioUrl);
      audio.onended = () => {
        onEnd?.();
      };

      setAudioElement(audio);
      setIsReady(true);
      onReady?.();
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioElement && isReady) {
      audioElement.currentTime = 0;
      audioElement.play();
      onPlay?.();
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      onEnd?.();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className} d-none`}>
      <button
        onClick={playAudio}
        disabled={isLoading || !isReady}
        className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        aria-label="Play text as speech"
        id="play-tts-btn"
      >
        {isLoading ? loadingText : buttonText}
      </button>
      {audioElement && audioElement.paused === false && (
        <button
          onClick={stopAudio}
          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
          aria-label="Stop playing speech"
        >
          Stop
        </button>
      )}
    </div>
  );
};

export default VoiceTextToSpeech;
