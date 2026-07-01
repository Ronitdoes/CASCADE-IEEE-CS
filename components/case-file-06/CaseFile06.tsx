"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Stage1 from "./stages/Stage1";
import Stage2 from "./stages/Stage2";
import Stage3 from "./stages/Stage3";
import Stage4 from "./stages/Stage4";
import Stage5 from "./stages/Stage5";
import Stage6 from "./stages/Stage6";
import Stage7 from "./stages/Stage7";
import Stage8 from "./stages/Stage8";
import Stage9 from "./stages/Stage9";

export default function CaseFile06() {
  const [stage, setStage] = useState<number>(1);
  const [logs, setLogs] = useState<{ id: string; text: string }[]>([]);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [dbAnswers, setDbAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load DB questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch("/api/questions?caseId=06");
        const data = await res.json();
        if (data.success && data.questions) {
          const answers: Record<string, string> = {};
          data.questions.forEach((q: any) => {
            answers[q.puzzleKey] = q.answer;
          });
          setDbAnswers(answers);
        }
      } catch (err) {
        console.error("Failed to load Case 6 questions:", err);
      }
    }
    loadQuestions();
  }, []);

  // Load DB progress on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/progress?caseId=06");
        const data = await res.json();
        if (data.success && data.progress?.case6State) {
          const state = data.progress.case6State;
          if (state.stage !== undefined) setStage(state.stage);
          if (Array.isArray(state.logs)) setLogs(state.logs);
        }
      } catch (err) {
        console.error("Failed to load Case 6 progress:", err);
      }
    }
    loadProgress();
  }, []);

  // Save progress whenever stage or logs change
  useEffect(() => {
    if (stage === 1 && logs.length === 0) return;
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: "06", key: "case6State", value: { stage, logs } }),
    }).catch((err) => console.error("Failed to save Case 6 progress:", err));
  }, [stage, logs]);

  const addLog = (id: string, text: string) => {
    if (!logs.find(log => log.id === id)) {
      setLogs((prev) => [...prev, { id, text }]);
    }
  };

  const advanceStage = () => {
    setStage((prev) => Math.min(prev + 1, 9));
  };

  const renderStage = () => {
    switch (stage) {
      case 1: return <Stage1 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 2: return <Stage2 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 3: return <Stage3 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 4: return <Stage4 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 5: return <Stage5 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 6: return <Stage6 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 7: return <Stage7 onComplete={advanceStage} onLogRecovered={addLog} expectedAnswer={dbAnswers.stage7 || "7"} />;
      case 8: return <Stage8 onComplete={advanceStage} onLogRecovered={addLog} />;
      case 9: return <Stage9 onComplete={advanceStage} onLogRecovered={addLog} />;
      default: return <div style={{ padding: "2rem" }}>LOADING STAGE {stage}...</div>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <Header sessionTime={sessionTime} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <main style={{ flex: 3, position: "relative", borderRight: "1px solid var(--text-muted)", padding: "2rem", display: "flex", flexDirection: "column" }}>
          {renderStage()}
        </main>
        <aside style={{ flex: 1, padding: "2rem", overflowY: "auto", background: "rgba(0,0,0,0.3)" }}>
          <Sidebar logs={logs} stage={stage} />
        </aside>
      </div>
    </div>
  );
}
