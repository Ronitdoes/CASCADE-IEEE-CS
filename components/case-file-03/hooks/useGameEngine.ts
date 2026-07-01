import { useState, useEffect, useCallback } from 'react';

export interface Player {
  x: number;
  y: number;
  facing: number;
}

export interface Puzzle {
  type: string;
  question?: string;
  answer?: string;
}

export interface Anomaly {
  id: string;
  puzzles: Puzzle[];
  solved: boolean;
}

export interface Level {
  map: number[][];
  anomalies: Record<string, Anomaly>;
  start: Player;
}

interface ActiveAnomaly extends Anomaly {
  key: string;
}

const LEVELS: Level[] = [
  {
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 2, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    anomalies: {
      "3,3": {
        id: "a1",
        puzzles: [{ type: "forgotten_hymn", answer: "FLAME" }],
        solved: false
      },
      "3,37": {
        id: "a2",
        puzzles: [{ type: "caesar_scroll", answer: "THE FLAME IS FADING" }],
        solved: false
      },
      "19,19": {
        id: "a3",
        puzzles: [{ type: "chronicle_reconstruction", answer: "LIGHT LEADS ONLY THE WORTHY HOME" }],
        solved: false
      },
      "37,3": {
        id: "a4",
        puzzles: [{ type: "memory_room", answer: "MOON CROW 4 EYE KEY BLOOD" }],
        solved: false
      },
      "37,37": {
        id: "a5",
        puzzles: [{ type: "temple_floor", answer: "EMBER" }],
        solved: false
      },
      "11,29": {
        id: "a6",
        puzzles: [{ type: "candle_piano", answer: "2 4 1 5 3" }],
        solved: false
      },
      "29,11": {
        id: "a7",
        puzzles: [{ type: "flame_image_puzzle", answer: "AURELIS" }],
        solved: false
      }
    },
    start: { x: 1, y: 1, facing: 1 }
  },
  {
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    anomalies: {},
    start: { x: 7, y: 13, facing: 0 }
  }
];

export function useGameEngine() {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [player, setPlayer] = useState<Player>(LEVELS[0].start);
  const [anomalies, setAnomalies] = useState<Record<string, Anomaly>>(LEVELS[0].anomalies);
  const [activeAnomaly, setActiveAnomaly] = useState<ActiveAnomaly | null>(null);
  console.log("[GameEngine State]", {
    levelIndex,
    player,
    anomaliesKeys: Object.keys(anomalies)
  });

  const [showStory, setShowStory] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const currentLevel = LEVELS[levelIndex];
  const allSolved = Object.values(anomalies).every(a => a.solved);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayer(prev => {
      let nx = prev.x;
      let ny = prev.y;

      if (prev.facing === 0) { nx += dx; ny -= dy; }
      else if (prev.facing === 1) { nx += dy; ny += dx; }
      else if (prev.facing === 2) { nx -= dx; ny += dy; }
      else if (prev.facing === 3) { nx -= dy; ny -= dx; }

      if (ny >= 0 && ny < currentLevel.map.length && nx >= 0 && nx < currentLevel.map[0].length) {
        const targetTile = currentLevel.map[ny][nx];
        if (targetTile === 1) return prev;

        if (targetTile === 2) {
          const key = `${ny},${nx}`;
          console.log("[Anomaly Step]", { key, exists: !!anomalies[key], solved: anomalies[key]?.solved, anomaly: anomalies[key] });
          if (anomalies[key] && !anomalies[key].solved) {
            setActiveAnomaly({ key, ...anomalies[key] });
            return prev;
          }
        }

        if (targetTile === 3) {
          if (allSolved) {
            if (levelIndex < LEVELS.length - 1) {
              const nextLevelIndex = levelIndex + 1;
              setLevelIndex(nextLevelIndex);
              setAnomalies(LEVELS[nextLevelIndex].anomalies);
              return LEVELS[nextLevelIndex].start;
            } else {
              setGameWon(true);
              return { ...prev, x: nx, y: ny };
            }
          }
          return prev;
        }

        if (targetTile === 4) {
          setShowStory(true);
          return prev;
        }

        return { ...prev, x: nx, y: ny };
      }
      return prev;
    });
  }, [anomalies, allSolved, currentLevel, levelIndex]);

  const turnPlayer = useCallback((dir: number) => {
    setPlayer(prev => ({
      ...prev,
      facing: (prev.facing + dir + 4) % 4
    }));
  }, []);

  useEffect(() => {
    if (activeAnomaly || showStory || gameWon) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': movePlayer(0, 1); break;
        case 's': case 'arrowdown': movePlayer(0, -1); break;
        case 'a': case 'arrowleft': turnPlayer(-1); break;
        case 'd': case 'arrowright': turnPlayer(1); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, turnPlayer, activeAnomaly, showStory, gameWon]);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/progress?caseId=03");
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.progress?.solvedAnomalies)) {
            const solvedList = data.progress.solvedAnomalies;
            setAnomalies(prev => {
              const updated = { ...prev };
              solvedList.forEach((anomalyKey: string) => {
                if (updated[anomalyKey]) {
                  updated[anomalyKey].solved = true;
                }
              });
              const allNowSolved = Object.keys(updated).length > 0 && Object.values(updated).every(a => a.solved);
              if (allNowSolved) {
                setGameWon(true);
              }
              return updated;
            });
          }
          if (data.progress?.player) {
            setPlayer(data.progress.player);
          }
          if (data.progress?.levelIndex !== undefined) {
            setLevelIndex(data.progress.levelIndex);
          }
        }
      } catch (err) {
        console.error("Failed to load Case 3 progress:", err);
      }
    }
    loadProgress();
  }, []);

  // Save player position and level index with a 1-second debounce
  useEffect(() => {
    if (player.x === LEVELS[0].start.x && player.y === LEVELS[0].start.y && levelIndex === 0) return;

    const handler = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "03", key: "player", value: player }),
      }).catch((err) => console.error("Failed to save player position:", err));

      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "03", key: "levelIndex", value: levelIndex }),
      }).catch((err) => console.error("Failed to save level index:", err));
    }, 1000);

    return () => clearTimeout(handler);
  }, [player, levelIndex]);

  const solveAnomaly = (key: string) => {
    setAnomalies(prev => {
      const updated = {
        ...prev,
        [key]: { ...prev[key], solved: true }
      };

      const solvedIds = Object.keys(updated).filter(k => updated[k].solved);
      
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: '03', key: 'solvedAnomalies', value: solvedIds })
      }).catch(err => console.error('Failed to save Case 3 progress:', err));

      const allNowSolved = Object.values(updated).every(a => a.solved);
      if (allNowSolved) {
        setGameWon(true);
      }

      return updated;
    });
    setActiveAnomaly(null);
  };

  const closeAnomaly = () => setActiveAnomaly(null);

  const finishStory = () => {
    setShowStory(false);
    setGameWon(true);
  };

  return {
    player,
    anomalies,
    activeAnomaly,
    solveAnomaly,
    closeAnomaly,
    gameWon,
    allSolved,
    movePlayer,
    turnPlayer,
    levelIndex,
    currentMap: currentLevel.map,
    showStory,
    finishStory
  };
}
