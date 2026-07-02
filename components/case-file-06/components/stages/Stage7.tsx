"use client";

import { useState, useEffect } from "react";

export default function Stage7({ onComplete, onLogRecovered, setFilePrinted }: { onComplete: () => void, onLogRecovered: (id: string, text: string) => void, setFilePrinted?: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [questionText, setQuestionText] = useState("Recognize patterns that survive translation");
  const [isVerifying, setIsVerifying] = useState(false);

  // Load question text from DB
  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch("/api/questions?caseId=06&puzzleKey=stage7");
        const data = await res.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestionText(data.questions[0].question);
        }
      } catch (err) {
        console.error("Failed to load Stage 7 question from DB:", err);
      }
    }
    fetchQuestion();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setIsVerifying(true);
    setError(false);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: "06",
          puzzleKey: "stage7",
          answer: inputValue
        })
      });
      const data = await res.json();
      if (data.success && data.correct) {
        onLogRecovered("log-stage7", `Intelligence is ${questionText.toLowerCase()}.`);
        onComplete();
      } else {
        setError(true);
        setTimeout(() => setError(false), 500);
        setInputValue("");
      }
    } catch (err) {
      console.error("Failed to verify Stage 7 answer:", err);
      setError(true);
      setTimeout(() => setError(false), 500);
      setInputValue("");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "2rem", justifyContent: "center", alignItems: "center" }} className={error ? "glitch" : ""}>
      
      <div style={{ marginTop: "2rem", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span>INPUT_PATTERN &gt;</span>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isVerifying}
            autoFocus
            style={{ 
              flex: 1, 
              color: error ? "var(--text-alert)" : "var(--text-primary)",
              borderBottom: `1px solid ${error ? "var(--text-alert)" : "var(--text-primary)"}`,
              textAlign: "center",
              fontSize: "1.5rem",
              background: "transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              outline: "none"
            }}
          />
        </form>

        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <button
            type="button"
            disabled={printing}
            onClick={(e) => {
              setPrinting(true);
              const target = e.target as HTMLButtonElement;
              target.innerText = "PRINTING...";
              target.style.color = "var(--text-amber)";
              target.style.borderColor = "var(--text-amber)";
              
              setTimeout(() => {
                target.innerText = "DOCUMENT PRINTED (CHECK DESK)";
                target.style.color = "var(--text-primary)";
                target.style.borderColor = "var(--text-primary)";
                setFilePrinted?.();
              }, 1000);
            }}
            style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--text-primary)",
              padding: "1rem 2rem",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.2rem"
            }}
          >
            PRINT ATTACHED DOCUMENT
          </button>
        </div>
      </div>
    </div>
  );
}
