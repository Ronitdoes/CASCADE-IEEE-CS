import React, { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PuzzleGrid } from "./PuzzleGrid";
import { ValidateButton } from "./ValidateButton";
import { ResetButton } from "./ResetButton";
import { SuccessModal } from "./SuccessModal";
import { FailureModal } from "./FailureModal";
import { PuzzleConfig, SortableItem } from "./types";

interface ImageOrderingEngineProps {
  config: PuzzleConfig;
  onSolve: () => void;
}

export function ImageOrderingEngine({ config, onSolve }: ImageOrderingEngineProps) {
  const [items, setItems] = useState<SortableItem[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFailureOpen, setIsFailureOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Helper to initialize and shuffle the puzzle pieces
  const shuffleItems = () => {
    const baseItems: SortableItem[] = config.imageFiles.map((file) => {
      // e.g. "cf1.avif" -> id is "cf1"
      const id = file.replace(/\.[^/.]+$/, "");
      return {
        id,
        fileName: file,
        url: `${config.imageFolder}/${file}`,
      };
    });

    let shuffled = [...baseItems];
    let isCorrect = true;

    // Keep shuffling until the order is randomized and NOT in the correct sequence
    while (isCorrect) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Check if shuffled order matches correct sequence
      isCorrect = shuffled.every(
        (item, index) => item.id === config.correctOrder[index]
      );
    }

    setItems(shuffled);
  };

  // Run shuffle on initial component mount or config change
  useEffect(() => {
    shuffleItems();
  }, [config]);

  // Handle DnD swap
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  // Perform validation on current arrangement
  const handleValidate = () => {
    setIsValidating(true);
    
    // Introduce a short immersive scanner delay (e.g. 800ms) to simulate security scans
    setTimeout(() => {
      const currentOrder = items.map((item) => item.id);
      const isCorrectOrder = currentOrder.every(
        (id, index) => id === config.correctOrder[index]
      );

      if (isCorrectOrder) {
        setIsSuccessOpen(true);
      } else {
        setIsFailureOpen(true);
      }
      setIsValidating(false);
    }, 850);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl px-4 py-8">
      {/* Puzzle description HUD */}
      <div className="text-center font-mono space-y-2 select-none">
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-cyan-400 uppercase">
          {config.title}
        </h2>
        <p className="text-zinc-500 text-xs max-w-lg mx-auto tracking-wide">
          {config.description}
        </p>
      </div>

      {/* Sortable Grid */}
      {items.length > 0 && (
        <PuzzleGrid
          items={items}
          onDragEnd={handleDragEnd}
          gridCols={config.gridCols}
        />
      )}

      {/* Control panel buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
        <ResetButton onClick={shuffleItems} disabled={isValidating} />
        <ValidateButton onClick={handleValidate} disabled={isValidating} />
      </div>

      {/* Result feedback Modals */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onConfirm={() => {
          setIsSuccessOpen(false);
          onSolve();
        }}
      />

      <FailureModal
        isOpen={isFailureOpen}
        onClose={() => setIsFailureOpen(false)}
      />
    </div>
  );
}
