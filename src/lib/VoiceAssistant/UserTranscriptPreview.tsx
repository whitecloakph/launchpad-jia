import { useState, useEffect } from "react";

export default function UserTranscriptPreview() {
  function generateRandomNumbers(
    min: number,
    max: number,
    count: number
  ): number[] {
    const randomNumbers: number[] = [];

    for (let i = 0; i < count; i++) {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      randomNumbers.push(randomNumber);
    }

    return randomNumbers;
  }

  const [bubbles, setBubbles] = useState<number[]>([20, 11, 15]);

  useEffect(() => {
    setBubbles(generateRandomNumbers(20, 70, 6));

    const interval = setInterval(() => {
      setBubbles(generateRandomNumbers(20, 70, 6));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="preview-bubble-container">
        <span>
          <strong>
            <i className="la la-bullseye text-primary blink-2" /> I'm Listening
          </strong>
        </span>

        <div className="bub-set">
          {bubbles.map((bubble, index) => (
            <div
              key={index}
              className="fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className="bub skeleton-bar blink-2"
                style={{ width: `${bubble}px` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
