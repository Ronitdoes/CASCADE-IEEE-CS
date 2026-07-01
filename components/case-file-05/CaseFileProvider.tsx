"use client";

import React, { createContext, useContext, useRef, useEffect } from "react";
import { useStore } from "zustand";
import { createCaseStore, CaseStore, CaseStoreApi } from "./hooks/useCaseStore";
import { puzzlesConfig } from "./lib/puzzles.config";

export const CaseFileStoreContext = createContext<CaseStoreApi | undefined>(undefined);

export interface CaseFileProviderProps {
  children: React.ReactNode;
}

export function CaseFileProvider({ children }: CaseFileProviderProps) {
  const storeRef = useRef<CaseStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createCaseStore();
  }

  useEffect(() => {
    async function loadDbQuestionsAndProgress() {
      try {
        const res = await fetch("/api/questions?caseId=05");
        const data = await res.json();
        if (data.success && data.questions) {
          data.questions.forEach((q: any) => {
            const p = puzzlesConfig.find(
              (x) => x.slug === q.puzzleKey || x.slug.replaceAll("-", "_") === q.puzzleKey.replaceAll("-", "_")
            );
            if (p) {
              p.clue = q.question;
              p.answer = q.answer;
            }
          });
        }

        const pRes = await fetch("/api/progress?caseId=05");
        const pData = await pRes.json();
        if (pData.success && pData.progress?.case5ZustandState && storeRef.current) {
          const dbState = pData.progress.case5ZustandState;

          storeRef.current.setState({
            solved: dbState.solved || [],
            hintsUsed: dbState.hintsUsed || {},
            scores: dbState.scores || {},
            totalScore: dbState.totalScore || 0,
            puzzleDurations: dbState.puzzleDurations || {},
            seenArchives: dbState.seenArchives || [],
          });
        }
      } catch (err) {
        console.error("Failed to load Case 5 questions/progress from DB:", err);
      } finally {
        if (storeRef.current) {
          storeRef.current.setState({ hydrated: true });
        }
      }
    }
    loadDbQuestionsAndProgress();
  }, []);

  useEffect(() => {
    if (!storeRef.current) return;
    
    let lastSavedString = "";
    const unsubscribe = storeRef.current.subscribe((state) => {
      const stateToSave = {
        solved: state.solved,
        hintsUsed: state.hintsUsed,
        scores: state.scores,
        totalScore: state.totalScore,
        puzzleDurations: state.puzzleDurations,
        seenArchives: state.seenArchives || [],
      };

      const newString = JSON.stringify(stateToSave);
      if (newString === lastSavedString) return;
      lastSavedString = newString;

      if (state.solved.length === 0 && Object.keys(state.hintsUsed).length === 0 && (state.seenArchives || []).length === 0) return;

      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: '05',
          key: 'case5ZustandState',
          value: stateToSave
        })
      }).catch(err => console.error('Failed to sync Case 5 progress to DB:', err));
    });

    return () => unsubscribe();
  }, []);

  return (
    <CaseFileStoreContext.Provider value={storeRef.current}>
      {children}
    </CaseFileStoreContext.Provider>
  );
}

export function useCaseStore<T>(selector: (store: CaseStore) => T): T {
  const context = useContext(CaseFileStoreContext);
  if (!context) {
    throw new Error("useCaseStore must be used within a CaseFileProvider");
  }
  return useStore(context, selector);
}
