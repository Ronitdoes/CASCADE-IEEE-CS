import { useState } from "react";
import { validateAnswer } from "@/lib/validateAnswer";
import { morsePuzzleData } from "@/data/morseTransmission";

export function useMorsePuzzle(expectedAnswer?: string) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [isSolved, setIsSolved] = useState(false);

  const handleSubmit = () => {
    const targetAnswer = expectedAnswer || morsePuzzleData.expectedAnswer;
    if (validateAnswer(answer, targetAnswer)) {
      setIsSolved(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const showNextHint = () => {
    if (hintIndex < morsePuzzleData.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
    }
  };

  return {
    answer,
    setAnswer,
    error,
    setError,
    hintIndex,
    isSolved,
    handleSubmit,
    showNextHint,
    story: morsePuzzleData.story,
    transmission: morsePuzzleData.transmission,
    hints: morsePuzzleData.hints,
    title: morsePuzzleData.title,
  };
}
