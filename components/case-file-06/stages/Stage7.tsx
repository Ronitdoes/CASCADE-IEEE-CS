"use client";

import { useState, useEffect } from "react";
import TypewriterText from "../TypewriterText";

export default function Stage7({ onComplete, onLogRecovered, expectedAnswer = "7" }: { onComplete: () => void, onLogRecovered: (id: string, text: string) => void, expectedAnswer?: string }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const [dataPoint, setDataPoint] = useState("");

  const dataStream = [
    "00000111",
    "VII",
    "07:00:00",
    ".......",
    "111 (base 2)",
    "SEVEN",
    "0x07",
    "3 + 4",
    "10 - 3"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoint(dataStream[Math.floor(Math.random() * dataStream.length)]);
    }, 150);
    return () => clearInterval(interval);
  }, [dataStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().toLowerCase() === expectedAnswer.toLowerCase()) {
      onLogRecovered("log-stage7", "Intelligence is recognizing patterns that survive translation.");
      onComplete();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setInputValue("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "2rem", justifyContent: "center" }} className={error ? "glitch" : ""}>
      <div style={{ minHeight: "40px", color: "var(--text-amber)", position: "absolute", top: "2rem" }}>
        <TypewriterText text="Intelligence is recognizing patterns that survive translation." delay={30} />
      </div>

      <div style={{
        fontSize: "4rem",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontWeight: "bold",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {dataPoint}
      </div>

      <div style={{ marginTop: "2rem", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span>INPUT_PATTERN &gt;</span>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            style={{ 
              flex: 1, 
              color: error ? "var(--text-alert)" : "var(--text-primary)",
              borderBottomColor: error ? "var(--text-alert)" : "var(--text-primary)",
              textAlign: "center",
              fontSize: "1.5rem"
            }}
          />
        </form>
      </div>
    </div>
  );
}
