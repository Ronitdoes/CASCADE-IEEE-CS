"use client";

import React, { useEffect } from "react";
import { PuzzleHeader } from "@/components/PuzzleHeader";
import { TransmissionPanel } from "@/components/TransmissionPanel";
import { MorseDisplay } from "@/components/MorseDisplay";
import { AnswerInput } from "@/components/AnswerInput";
import { HintPanel } from "@/components/HintPanel";
import { useMorsePuzzle } from "@/hooks/useMorsePuzzle";

interface MorseStageProps {
  onSolve: () => void;
  expectedAnswer?: string;
}

export default function MorseStage({ onSolve, expectedAnswer }: MorseStageProps) {
  const {
    answer,
    setAnswer,
    error,
    setError,
    hintIndex,
    isSolved,
    handleSubmit,
    showNextHint,
    story,
    transmission,
    hints,
    title,
  } = useMorsePuzzle(expectedAnswer);

  useEffect(() => {
    if (isSolved) {
      // Trigger callback to transition to next stage in the state machine
      const timer = setTimeout(() => {
        onSolve();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSolved, onSolve]);

  return (
    <div className="w-full flex flex-col items-center justify-start max-w-6xl mx-auto space-y-8 font-mono">
      <PuzzleHeader title={title} category="CASE 9 // FINAL SECURITY PROTOCOL" />

      {/* Decryption grid system - Two column layout on large screens */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Narrative (Story/Log) & Hints */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full items-stretch">
          <TransmissionPanel story={story} />
          <HintPanel hints={hints} hintIndex={hintIndex} />
        </div>

        {/* Right Column: Morse Raw Data & Input submission */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full items-center">
          <MorseDisplay transmission={transmission} />
          <AnswerInput
            value={answer}
            onChange={(val) => {
              setAnswer(val);
              if (error) setError(false);
            }}
            onSubmit={handleSubmit}
            onHint={showNextHint}
            error={error}
            disabled={isSolved}
          />
        </div>
      </div>
    </div>
  );
}
