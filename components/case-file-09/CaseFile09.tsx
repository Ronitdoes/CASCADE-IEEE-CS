"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markCaseCompleted } from "@/components/case-progress";
import { ImageOrderingEngine } from "./ImageOrderingEngine";
import { PuzzleConfig } from "./types";
import { ArchiveFragmentPanel } from "./stage2/ArchiveFragmentPanel";
import { PowerGrid } from "@/components/PowerGrid";
import MorseStage from "./MorseStage";
import TerminalSequence, { NarrativeStep } from "./TerminalSequence";
import { Cpu, Terminal, Shield, RefreshCw } from "lucide-react";

const CASE_9_PUZZLE: PuzzleConfig = {
  id: "archive-dependencies",
  title: "ARCHIVE DEPENDENCIES",
  description:
    "Reconstruct the final archive symbol by dragging and arranging all eight collectible fragments into their correct positions.",
  imageFolder: "/Symbols",
  imageFiles: [
    "cf1.avif",
    "cf2.avif",
    "cf3.avif",
    "cf4.avif",
    "cf5.avif",
    "cf6.avif",
    "cf7.avif",
    "cf8.avif",
  ],
  correctOrder: [
    "cf1",
    "cf2",
    "cf3",
    "cf4",
    "cf5",
    "cf6",
    "cf7",
    "cf8",
  ],
  gridCols: 4,
  gridRows: 2,
};

const STAGE_2_STORY_TEXT = `ARCHIVE RECOVERY: 31%

Cross-file correlation restored.

Recovered object detected.

FILE:
NULL.txt

STATUS:
Contains hidden data.

No visible content detected.`;

const STAGE_2_HINTS = [
  "The archive never creates truly empty files.\nCheck what the operating system knows that your editor does not.",
  "Sometimes information is stored in characters that cannot be seen.",
  "Search for tools that detect or decode zero-width Unicode characters."
];

type NarrativeStage =
  | "BOOT"
  | "INTRO"
  | "QUIZ_1"
  | "QUIZ_1_SUCCESS"
  | "ARCHIVE_FRAGMENT"
  | "ARCHIVE_FRAGMENT_SUCCESS"
  | "QUIZ_2_INTRO"
  | "QUIZ_2"
  | "QUIZ_2_SUCCESS"
  | "QUIZ_3_INTRO"
  | "QUIZ_3"
  | "QUIZ_3_SUCCESS"
  | "AUTHENTICATION"
  | "FINAL_ARCHIVE"
  | "FINAL_LOG"
  | "COMPLETION";

// Retrieve step configurations for narrative stages
const getStepsForStage = (st: NarrativeStage): NarrativeStep[] => {
  switch (st) {
    case "BOOT":
      return [
        { type: "text", content: "Thinking...", animate: "typewriter", speed: 20, delayAfter: 300 },
        { type: "text", content: "Thinking...", animate: "typewriter", speed: 20, delayAfter: 300 },
        { type: "text", content: "Thinking...", animate: "typewriter", speed: 20, delayAfter: 300 },
        { type: "text", content: "System Response Detected...", animate: "typewriter", speed: 25, className: "text-cyan-400 font-bold", delayAfter: 500 },
        { type: "spacer", content: "8" },
        { type: "text", content: "FILE DESIGNATION: CF-09-IR-9999", className: "text-cyan-500/80 font-bold leading-normal", animate: "typewriter", speed: 20, delayAfter: 300 },
        { type: "text", content: "ARCHIVE DEPTH: OMEGA", className: "text-cyan-500/80 font-bold leading-normal", animate: "typewriter", speed: 20, delayAfter: 300 },
        { type: "text", content: "CLASSIFICATION: NULL", className: "text-red-400 font-bold leading-normal", animate: "typewriter", speed: 20, delayAfter: 300 },
        { type: "text", content: "STATUS: ACTIVE", className: "text-emerald-400 font-bold leading-normal", animate: "typewriter", speed: 20, delayAfter: 400 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Accessing Final Archive...", animate: "typewriter", speed: 25, delayAfter: 600 },
        { type: "text", content: "Recovery Successful.", animate: "typewriter", speed: 25, className: "text-emerald-400 font-bold", delayAfter: 400 },
        { type: "spacer", content: "12" },
        { type: "button", content: "BEGIN INVESTIGATION", action: "next" }
      ];
    case "INTRO":
      return [
        { type: "heading", content: "ARCHIVE DEPENDENCIES", className: "text-cyan-455 text-lg font-bold tracking-widest mb-4", animate: "typewriter", speed: 25, delayAfter: 600 },
        { type: "text", content: "The original dependency table was corrupted.", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "text", content: "Only one restoration sequence satisfies every recovery condition.", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "text", content: "Manual reconstruction required.", className: "text-yellow-500/80 font-bold", animate: "typewriter", speed: 20, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "QUIZ_1_SUCCESS":
      return [
        { type: "text", content: "Recovery Stage 1 Complete", className: "text-emerald-400 font-bold text-base", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "spacer", content: "12" },
        { type: "text", content: "Archive Reconstruction", className: "text-zinc-400 text-xs uppercase tracking-wider", animate: "typewriter", speed: 15, delayAfter: 400 },
        { type: "progress", start: 0, end: 31, delayAfter: 800 },
        { type: "spacer", content: "12" },
        { type: "text", content: "Recovered object detected.", className: "text-cyan-455 font-semibold", animate: "typewriter", speed: 20, delayAfter: 605 },
        { type: "spacer", content: "8" },
        { type: "text", content: "FILE\nNULL.txt", className: "text-white font-bold leading-normal underline decoration-cyan-500/40", animate: "typewriter", speed: 20, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "ARCHIVE_FRAGMENT_SUCCESS":
      return [
        { type: "text", content: "Keyword Accepted.", className: "text-emerald-400 font-bold text-base", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "text", content: "Cross-file correlation restored.", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "text", content: "Additional archive sectors unlocked.", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "spacer", content: "12" },
        { type: "text", content: "Archive Recovery", className: "text-zinc-400 text-xs uppercase tracking-wider", animate: "typewriter", speed: 15, delayAfter: 400 },
        { type: "progress", start: 31, end: 58, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "QUIZ_2_INTRO":
      return [
        { type: "text", content: "Emergency Backup Activated.", className: "text-yellow-500 font-bold", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "text", content: "Main Power Source Online.", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "text", content: "Internal Power Network Offline.", className: "text-red-400 font-semibold", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "text", content: "Authentication Core Unreachable.", className: "text-red-400 font-semibold", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Manual rerouting required.", className: "text-cyan-455 font-bold", animate: "typewriter", speed: 20, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "QUIZ_2_SUCCESS":
      return [
        { type: "text", content: "Memory Core\nONLINE", className: "text-emerald-400 font-bold text-base leading-relaxed", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Authentication Core\nONLINE", className: "text-emerald-400 font-bold text-base leading-relaxed", animate: "typewriter", speed: 20, delayAfter: 650 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Power Grid Restored.", className: "text-emerald-400 font-bold", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "spacer", content: "12" },
        { type: "text", content: "Archive Recovery", className: "text-zinc-400 text-xs uppercase tracking-wider", animate: "typewriter", speed: 15, delayAfter: 400 },
        { type: "progress", start: 58, end: 81, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "QUIZ_3_INTRO":
      return [
        { type: "text", content: "Emergency transmission recovered.", className: "text-cyan-455 font-bold", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Signal integrity\n100%", className: "text-emerald-400 font-semibold leading-relaxed", animate: "typewriter", speed: 20, delayAfter: 600 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Automatic conversion\nMORSE CODE", className: "text-cyan-455 font-semibold leading-relaxed", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "spacer", content: "8" },
        { type: "text", content: "Recover the final transmission.", className: "text-zinc-300", animate: "typewriter", speed: 20, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "QUIZ_3_SUCCESS":
      return [
        { type: "text", content: "THE ARCHIVE REMEMBERS WHAT WE FORGOT", className: "text-cyan-400 font-bold text-xl md:text-2xl text-center select-all drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] my-6 tracking-wide", animate: "typewriter", speed: 50, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next", className: "justify-center" }
      ];
    case "AUTHENTICATION":
      return [
        { type: "text", content: "AUTHENTICATION COMPLETE", className: "text-emerald-400 font-bold text-lg", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "spacer", content: "12" },
        { type: "text", content: "CASE FILE RECONSTRUCTED", className: "text-zinc-350 font-semibold", animate: "typewriter", speed: 20, delayAfter: 800 },
        { type: "spacer", content: "16" },
        { type: "text", content: "ARCHIVE DEPENDENCIES\nVERIFIED", className: "text-emerald-450 font-bold leading-normal", animate: "typewriter", speed: 15, delayAfter: 600 },
        { type: "spacer", content: "10" },
        { type: "text", content: "POWER RESTORATION\nVERIFIED", className: "text-emerald-450 font-bold leading-normal", animate: "typewriter", speed: 15, delayAfter: 600 },
        { type: "spacer", content: "10" },
        { type: "text", content: "MORSE TRANSMISSION\nVERIFIED", className: "text-emerald-450 font-bold leading-normal", animate: "typewriter", speed: 15, delayAfter: 800 },
        { type: "spacer", content: "16" },
        { type: "text", content: "OPENING FINAL ARCHIVE...", className: "text-cyan-400 font-semibold animate-pulse", animate: "typewriter", speed: 20, delayAfter: 1000 },
        { type: "spacer", content: "16" },
        { type: "button", content: "CONTINUE", action: "next" }
      ];
    case "FINAL_ARCHIVE":
      return [
        { type: "text", content: "The final archive contains no researcher names.", className: "text-zinc-350 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2500 },
        { type: "text", content: "No signatures.", className: "text-zinc-350 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2000 },
        { type: "text", content: "No timestamps.", className: "text-zinc-350 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2000 },
        { type: "text", content: "Only one instruction appears repeatedly.", className: "text-zinc-350 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2500 },
        { type: "spacer", content: "24" },
        { type: "heading", content: "PREVENTION PROTOCOL", className: "text-red-500 font-extrabold text-3xl tracking-[0.25em] text-center drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] my-8 uppercase font-mono", animate: "fade", speed: 1200, delayAfter: 3500 },
        { type: "spacer", content: "12" },
        { type: "text", content: "It activates whenever an investigation reaches the truth.", className: "text-zinc-355 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2500 },
        { type: "text", content: "Records are altered.", className: "text-zinc-355 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2000 },
        { type: "text", content: "Evidence disappears.", className: "text-zinc-355 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2000 },
        { type: "text", content: "The investigation begins again.", className: "text-zinc-355 text-center text-lg italic my-2", animate: "fade", speed: 1000, delayAfter: 2500 },
        { type: "text", content: "The archive remains.", className: "text-cyan-400 font-bold text-center text-xl tracking-wide my-4", animate: "fade", speed: 1200, delayAfter: 1500 },
        { type: "spacer", content: "24" },
        { type: "button", content: "CONTINUE", action: "next", className: "justify-center font-bold" }
      ];
    case "FINAL_LOG":
      return [
        { type: "heading", content: "FINAL LOG", className: "text-cyan-400 font-bold text-xl tracking-[0.25em] mb-6", animate: "typewriter", speed: 25, delayAfter: 1000 },
        { type: "text", content: "The archive was never empty.", animate: "typewriter", speed: 25, delayAfter: 1200 },
        { type: "text", content: "It was waiting.", animate: "typewriter", speed: 25, delayAfter: 1200 },
        { type: "text", content: "Waiting for someone...", animate: "typewriter", speed: 30, delayAfter: 1500 },
        { type: "text", content: "...to reconstruct the missing records.", animate: "typewriter", speed: 25, delayAfter: 2000 },
        { type: "spacer", content: "16" },
        { type: "heading", content: "SO THE TRUTH WOULD SURVIVE ANOTHER RESET", className: "text-cyan-455 font-bold text-xl tracking-wider my-6 uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]", animate: "typewriter", speed: 30, delayAfter: 2500 },
        { type: "spacer", content: "16" },
        { type: "text", content: "The investigation is complete.", animate: "typewriter", speed: 25, delayAfter: 1500 },
        { type: "text", content: "This time...", animate: "typewriter", speed: 30, delayAfter: 1800 },
        { type: "text", content: "the warning was enough.", className: "font-semibold text-zinc-200", animate: "typewriter", speed: 25, delayAfter: 2500 },
        { type: "spacer", content: "24" },
        { type: "heading", content: "The archive remains open.", className: "text-white font-bold text-2xl tracking-wide text-center my-8 drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]", animate: "typewriter", speed: 30, delayAfter: 1500 },
        { type: "spacer", content: "24" },
        { type: "button", content: "CONTINUE", action: "next", className: "justify-center font-bold" }
      ];
    default:
      return [];
  }
};

export default function CaseFile09() {
  const [stage, setStage] = useState<NarrativeStage | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const [savedStage, setSavedStage] = useState<NarrativeStage>("INTRO");
  const [isStage1Done, setIsStage1Done] = useState(false);
  const [isStage2Done, setIsStage2Done] = useState(false);
  const [isStage3Done, setIsStage3Done] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Sync digital clock in header
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate stage on mount - load from DB first, then advance based on furthest unlocked
  useEffect(() => {
    async function loadProgressAndBoot() {
      try {
        const res = await fetch("/api/progress?caseId=09");
        const data = await res.json();
        if (data.success && data.progress?.case9State) {
          const s = data.progress.case9State;
          if (s.narrativeStage) setSavedStage(s.narrativeStage);
          if (s.symbolReconstructed) setIsStage1Done(true);
          if (s.quiz1Completed) setIsStage2Done(true);
          if (s.stage2Completed) setIsStage3Done(true);
          if (s.completed) setCompleted(true);
        }
      } catch (err) {
        console.error("Failed to load Case 9 DB progress:", err);
      }
      setStage("BOOT");
    }

    loadProgressAndBoot();
  }, []);

  const steps = React.useMemo(() => {
    if (!stage) return [];
    return getStepsForStage(stage);
  }, [stage]);

  const getFurthestUnlockedStage = React.useCallback((): NarrativeStage => {
    if (completed) return "COMPLETION";

    // Prioritize furthest checkpoints
    if (savedStage === "AUTHENTICATION" || savedStage === "FINAL_ARCHIVE" || savedStage === "FINAL_LOG" || savedStage === "QUIZ_3_SUCCESS") {
      return savedStage;
    }
    if (isStage3Done) {
      return "QUIZ_3";
    }
    if (savedStage === "QUIZ_2_SUCCESS" || savedStage === "QUIZ_3_INTRO") {
      return savedStage;
    }
    if (isStage2Done) {
      return "QUIZ_2";
    }
    if (savedStage === "ARCHIVE_FRAGMENT_SUCCESS" || savedStage === "QUIZ_2_INTRO") {
      return savedStage;
    }
    if (isStage1Done) {
      return "ARCHIVE_FRAGMENT";
    }
    if (savedStage === "QUIZ_1_SUCCESS") {
      return savedStage;
    }
    
    return "INTRO";
  }, [completed, savedStage, isStage3Done, isStage2Done, isStage1Done]);

  const isValidStage = (val: string): val is NarrativeStage => {
    return [
      "BOOT",
      "INTRO",
      "QUIZ_1",
      "QUIZ_1_SUCCESS",
      "ARCHIVE_FRAGMENT",
      "ARCHIVE_FRAGMENT_SUCCESS",
      "QUIZ_2_INTRO",
      "QUIZ_2",
      "QUIZ_2_SUCCESS",
      "QUIZ_3_INTRO",
      "QUIZ_3",
      "QUIZ_3_SUCCESS",
      "AUTHENTICATION",
      "FINAL_ARCHIVE",
      "FINAL_LOG",
      "COMPLETION"
    ].includes(val);
  };

  const advanceTo = React.useCallback((nextStage: NarrativeStage) => {
    setIsGlitching(true);
    setTimeout(() => {
      setStage(nextStage);
      setSavedStage(nextStage);
      
      // Update state and DB
      const updatedState = {
        narrativeStage: nextStage,
        symbolReconstructed: isStage1Done || nextStage === "QUIZ_1_SUCCESS" || nextStage === "ARCHIVE_FRAGMENT" || nextStage === "ARCHIVE_FRAGMENT_SUCCESS" || nextStage === "QUIZ_2_INTRO" || nextStage === "QUIZ_2" || nextStage === "QUIZ_2_SUCCESS" || nextStage === "QUIZ_3_INTRO" || nextStage === "QUIZ_3" || nextStage === "QUIZ_3_SUCCESS" || nextStage === "AUTHENTICATION" || nextStage === "FINAL_ARCHIVE" || nextStage === "FINAL_LOG" || nextStage === "COMPLETION",
        quiz1Completed: isStage2Done || nextStage === "ARCHIVE_FRAGMENT_SUCCESS" || nextStage === "QUIZ_2_INTRO" || nextStage === "QUIZ_2" || nextStage === "QUIZ_2_SUCCESS" || nextStage === "QUIZ_3_INTRO" || nextStage === "QUIZ_3" || nextStage === "QUIZ_3_SUCCESS" || nextStage === "AUTHENTICATION" || nextStage === "FINAL_ARCHIVE" || nextStage === "FINAL_LOG" || nextStage === "COMPLETION",
        stage1Completed: isStage2Done || nextStage === "ARCHIVE_FRAGMENT_SUCCESS" || nextStage === "QUIZ_2_INTRO" || nextStage === "QUIZ_2" || nextStage === "QUIZ_2_SUCCESS" || nextStage === "QUIZ_3_INTRO" || nextStage === "QUIZ_3" || nextStage === "QUIZ_3_SUCCESS" || nextStage === "AUTHENTICATION" || nextStage === "FINAL_ARCHIVE" || nextStage === "FINAL_LOG" || nextStage === "COMPLETION",
        stage2Completed: isStage3Done || nextStage === "QUIZ_2_SUCCESS" || nextStage === "QUIZ_3_INTRO" || nextStage === "QUIZ_3" || nextStage === "QUIZ_3_SUCCESS" || nextStage === "AUTHENTICATION" || nextStage === "FINAL_ARCHIVE" || nextStage === "FINAL_LOG" || nextStage === "COMPLETION",
        completed: completed || nextStage === "COMPLETION",
      };

      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "09", key: "case9State", value: updatedState }),
      }).catch((err) => console.error("Failed to save Case 9 progress:", err));
      setIsGlitching(false);
    }, 450);
  }, [isStage1Done, isStage2Done, isStage3Done, completed]);

  // Get current integrity status percentage
  const getIntegrityPercentage = (): number => {
    switch (stage) {
      case "BOOT":
      case "INTRO":
      case "QUIZ_1":
        return 0;
      case "QUIZ_1_SUCCESS":
      case "ARCHIVE_FRAGMENT":
        return 31;
      case "ARCHIVE_FRAGMENT_SUCCESS":
      case "QUIZ_2_INTRO":
      case "QUIZ_2":
        return 58;
      case "QUIZ_2_SUCCESS":
      case "QUIZ_3_INTRO":
      case "QUIZ_3":
        return 81;
      default:
        return 100;
    }
  };

  const handleStageComplete = React.useCallback(() => {
    if (!stage) return;
    switch (stage) {
      case "BOOT":
        const target = getFurthestUnlockedStage();
        advanceTo(target);
        break;
      case "INTRO":
        advanceTo("QUIZ_1");
        break;
      case "QUIZ_1_SUCCESS":
        advanceTo("ARCHIVE_FRAGMENT");
        break;
      case "ARCHIVE_FRAGMENT_SUCCESS":
        advanceTo("QUIZ_2_INTRO");
        break;
      case "QUIZ_2_INTRO":
        advanceTo("QUIZ_2");
        break;
      case "QUIZ_2_SUCCESS":
        advanceTo("QUIZ_3_INTRO");
        break;
      case "QUIZ_3_INTRO":
        advanceTo("QUIZ_3");
        break;
      case "QUIZ_3_SUCCESS":
        advanceTo("AUTHENTICATION");
        break;
      case "AUTHENTICATION":
        advanceTo("FINAL_ARCHIVE");
        break;
      case "FINAL_ARCHIVE":
        advanceTo("FINAL_LOG");
        break;
      case "FINAL_LOG":
        advanceTo("COMPLETION");
        break;
      default:
        break;
    }
  }, [stage, getFurthestUnlockedStage, advanceTo]);

  // Puzzle success triggers
  const handleQuiz1Solved = React.useCallback(() => {
    setIsStage1Done(true);
    advanceTo("QUIZ_1_SUCCESS");
  }, [advanceTo]);

  const handleFragmentSolved = React.useCallback(() => {
    setIsStage2Done(true);
    advanceTo("ARCHIVE_FRAGMENT_SUCCESS");
  }, [advanceTo]);

  const handleQuiz2Solved = React.useCallback(() => {
    setIsStage3Done(true);
    advanceTo("QUIZ_2_SUCCESS");
  }, [advanceTo]);

  const handleQuiz3Solved = React.useCallback(() => {
    advanceTo("QUIZ_3_SUCCESS");
  }, [advanceTo]);

  const handleFinalCompletion = async () => {
    setCompleted(true);
    await markCaseCompleted("09");
    window.location.href = "/hunt";
  };

  const handleRestartLog = () => {
    setCompleted(false);
    setSavedStage("BOOT");
    setIsStage1Done(false);
    setIsStage2Done(false);
    setIsStage3Done(false);
    
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: "09",
        key: "case9State",
        value: {
          narrativeStage: "BOOT",
          symbolReconstructed: false,
          quiz1Completed: false,
          stage1Completed: false,
          stage2Completed: false,
          completed: false,
        }
      }),
    }).catch((err) => console.error("Failed to reset Case 9 progress:", err));
    
    advanceTo("BOOT");
  };



  const isNarrativeStage = (st: NarrativeStage): boolean => {
    return [
      "BOOT",
      "INTRO",
      "QUIZ_1_SUCCESS",
      "ARCHIVE_FRAGMENT_SUCCESS",
      "QUIZ_2_INTRO",
      "QUIZ_2_SUCCESS",
      "QUIZ_3_INTRO",
      "QUIZ_3_SUCCESS",
      "AUTHENTICATION",
      "FINAL_ARCHIVE",
      "FINAL_LOG"
    ].includes(st);
  };

  return (
    <div
      className="min-h-screen w-full text-white bg-cover bg-center bg-no-repeat flex flex-col relative overflow-x-hidden font-mono"
      style={{
        backgroundImage: "url('/Hunt/Background-Image.avif')",
      }}
    >
      {/* Background cinematic dark overlays */}
      <div className="absolute inset-0 bg-black/75 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />

      {/* Floating retro scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-repeating-linear-gradient(to_bottom,rgba(6,182,212,0.015)_0,rgba(6,182,212,0.015)_1px,transparent_2px,transparent_4px) animate-[scan_15s_linear_infinite]" />

      {/* Glitch Overlay Screen */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black pointer-events-none flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-cyan-950/15 pointer-events-none glitch-overlay" />
            <div className="text-cyan-500 text-xs tracking-[0.4em] uppercase font-bold animate-pulse">
              RECONSTRUCTING SECTORS...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title / Diagnostic Header Panel */}
      <header className="relative z-20 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Cpu className="text-cyan-500 animate-pulse" size={20} />
          <div>
            <div className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-bold">
              CLASSIFIED TERMINAL DIRECTORY
            </div>
            <div className="text-sm font-bold text-cyan-400 tracking-wider">
              CF-09-IR-9999 // SYSTEM RESTORE
            </div>
          </div>
        </div>

        {stage && stage !== "BOOT" && stage !== "COMPLETION" && (
          <div className="flex flex-col md:items-end w-full md:w-64 gap-1.5">
            <div className="flex justify-between items-center text-[9px] text-zinc-500 w-full font-bold">
              <span>ARCHIVE INTEGRITY</span>
              <span className="text-cyan-400">{getIntegrityPercentage()}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex p-[1px]">
              <div
                className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] rounded-2xs transition-all duration-500"
                style={{ width: `${getIntegrityPercentage()}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-right text-[10px] text-zinc-500 font-bold hidden lg:block">
          <div>{currentTime || "SYSTEM LOCK"}</div>
          <div className="text-cyan-500/60 font-mono tracking-widest text-[8px] uppercase mt-0.5">
            SECURE_HANDSHAKE: ACTIVE
          </div>
        </div>
      </header>

      {/* Main Narrative / Puzzle View Area */}
      <main className="flex-1 relative z-20 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {stage && (
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center items-center py-6"
            >
              {isNarrativeStage(stage) ? (
                <div className="w-full max-w-2xl border border-zinc-850 bg-zinc-950/65 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/20 rounded-br-2xl pointer-events-none" />

                  {/* Header Indicator */}
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-5 font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Terminal size={10} className="text-cyan-500" />
                      LOG_STREAM: {stage}
                    </span>
                    <span>SECTOR_DEPTH: OMEGA</span>
                  </div>

                  <TerminalSequence
                    steps={steps}
                    onComplete={handleStageComplete}
                  />
                </div>
              ) : stage === "QUIZ_1" ? (
                <div className="w-full flex flex-col items-center">
                  <ImageOrderingEngine config={CASE_9_PUZZLE} onSolve={handleQuiz1Solved} />
                </div>
              ) : stage === "ARCHIVE_FRAGMENT" ? (
                <div className="w-full flex flex-col items-center">
                  <ArchiveFragmentPanel
                    storyText={STAGE_2_STORY_TEXT}
                    filePath="/assets/files/NULL.txt"
                    hints={STAGE_2_HINTS}
                    fileSize="216 Bytes"
                    statusText="No visible characters"
                    onSuccess={handleFragmentSolved}
                  />
                </div>
              ) : stage === "QUIZ_2" ? (
                <div className="w-full flex flex-col items-center">
                  <PowerGrid onSolve={handleQuiz2Solved} hideModal={true} />
                </div>
              ) : stage === "QUIZ_3" ? (
                <div className="w-full flex flex-col items-center">
                  <MorseStage onSolve={handleQuiz3Solved} />
                </div>
              ) : stage === "COMPLETION" ? (
                <div className="w-full max-w-xl border border-emerald-500/35 bg-zinc-950/75 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.85)] text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/[0.015] pointer-events-none" />
                  
                  {/* Glowing frame ticks */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30 rounded-br-2xl pointer-events-none" />

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                  >
                    <Shield size={30} className="animate-pulse" />
                  </motion.div>

                  <div className="text-[10px] tracking-[0.35em] text-emerald-400 font-bold uppercase mb-2">
                    RECONSTRUCTION COMPLETE // SECURED
                  </div>
                  
                  <div className="text-zinc-650 font-bold text-xs mb-6 select-none leading-none">
                    ═══════════════════════════════════════
                  </div>

                  <h2 className="text-2xl font-bold tracking-[0.2em] text-white uppercase mb-6 font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                    CASE FILE 09
                  </h2>

                  <div className="space-y-4 max-w-sm mx-auto text-left border border-zinc-900 bg-black/45 p-5 rounded-lg mb-8 font-mono text-xs">
                    <div className="flex justify-between border-b border-zinc-950 pb-2">
                      <span className="text-zinc-500">Investigations Restored</span>
                      <span className="text-cyan-400 font-bold">9 / 9</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-950 pb-2">
                      <span className="text-zinc-500">Archive Recovery</span>
                      <span className="text-cyan-400 font-bold">100%</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-zinc-500">Status</span>
                      <span className="text-emerald-400 font-bold tracking-widest uppercase">
                        NULL EVENT PREVENTED
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-[11px] leading-relaxed mb-8 max-w-xs mx-auto">
                    Thank you for participating in CASCADE. The records have survived.
                  </p>

                  <div className="text-zinc-650 font-bold text-xs mb-8 select-none leading-none">
                    ═══════════════════════════════════════
                  </div>

                  {/* Complete buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleFinalCompletion}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl tracking-widest text-xs transition-all duration-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.35)] cursor-pointer active:scale-98"
                    >
                      CONTINUE
                    </button>
                    <button
                      onClick={handleRestartLog}
                      className="w-full py-3 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/30 font-semibold rounded-xl tracking-widest text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                    >
                      <RefreshCw size={11} />
                      REPLAY ARCHIVE LOG
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global CSS overrides */}
      <style jsx global>{`
        @keyframes scan {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 0 400px;
          }
        }
        .glitch-overlay {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.25),
            rgba(0, 0, 0, 0.25) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: glitch-anim 0.3s infinite;
        }
        @keyframes glitch-anim {
          0% { background-color: rgba(6, 182, 212, 0.04); }
          50% { background-color: rgba(239, 68, 68, 0.03); }
          100% { background-color: rgba(16, 185, 129, 0.04); }
        }
      `}</style>
    </div>
  );
}
