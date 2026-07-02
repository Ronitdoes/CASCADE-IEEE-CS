import React, { useState, useEffect } from 'react';

// --- LIGHTS OUT LOGIC ---
const getNeighbors = (index: number): number[] => {
  const neighbors = [index];
  if (index % 3 !== 0) neighbors.push(index - 1); // left
  if (index % 3 !== 2) neighbors.push(index + 1); // right
  if (index >= 3) neighbors.push(index - 3); // up
  if (index < 6) neighbors.push(index + 3); // down
  return neighbors;
};

interface LightsOutPuzzleProps {
  activeAnomaly: {
    pattern?: number[];
  };
  onSolve: () => void;
}

function LightsOutPuzzle({ activeAnomaly, onSolve }: LightsOutPuzzleProps) {
  const [grid, setGrid] = useState<boolean[]>(Array(9).fill(true));
  const [isSolving, setIsSolving] = useState<boolean>(false);

  useEffect(() => {
    let initialGrid = Array(9).fill(true);
    if (activeAnomaly.pattern) {
      activeAnomaly.pattern.forEach(clickIndex => {
        const neighbors = getNeighbors(clickIndex);
        initialGrid = initialGrid.map((val, i) => neighbors.includes(i) ? !val : val);
      });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrid(initialGrid);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSolving(false);
  }, [activeAnomaly]);

  const handleCellClick = (index: number) => {
    if (isSolving) return;
    const neighbors = getNeighbors(index);
    const newGrid = grid.map((val, i) => neighbors.includes(i) ? !val : val);
    setGrid(newGrid);

    if (newGrid.every(val => val === true)) {
      setIsSolving(true);
      setTimeout(onSolve, 1000);
    }
  };

  return (
    <>
      <p className="question-text" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Align all nodes to decrypt this terminal.
      </p>
      <div className="decryption-grid">
        {grid.map((isAligned, index) => (
          <div 
            key={index} 
            className={`decryption-cell ${isAligned ? 'aligned' : 'corrupted'} ${isSolving ? 'solving' : ''}`}
            onClick={() => handleCellClick(index)}
          >
            <div className="glyph-inner"></div>
          </div>
        ))}
      </div>
    </>
  );
}

// --- WEIGHT BALANCING PUZZLE ---
interface WeightBalancePuzzleProps {
  anomalyKey: string;
  onSolve: () => void;
}

const ITEMS = [
  { id: 'feather', name: 'Feather of Truth', weight: 1, img: '/case-file-01/feather.png' },
  { id: 'ankh', name: 'Ankh Amulet', weight: 2, img: '/case-file-01/ankh.png' },
  { id: 'urn', name: 'Golden Urn', weight: 3, img: '/case-file-01/urn.png' },
  { id: 'anvil', name: 'Iron Anvil', weight: 6, img: '/case-file-01/anvil.png' },
];

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function WeightBalancePuzzle({ anomalyKey, onSolve }: WeightBalancePuzzleProps) {
  const [targetWeight] = useState(() => {
    const val = hashCode(anomalyKey);
    return val % 2 === 0 ? 3 : 6;
  });

  const [leftPlacedIds, setLeftPlacedIds] = useState<string[]>([]);
  const [rightPlacedIds, setRightPlacedIds] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState<boolean>(false);

  const leftPlacedWeight = leftPlacedIds.reduce((sum, id) => {
    const item = ITEMS.find(it => it.id === id);
    return sum + (item ? item.weight : 0);
  }, 0);

  const rightPlacedWeight = rightPlacedIds.reduce((sum, id) => {
    const item = ITEMS.find(it => it.id === id);
    return sum + (item ? item.weight : 0);
  }, 0);

  const isBalanced = leftPlacedWeight === rightPlacedWeight && leftPlacedWeight === targetWeight;

  useEffect(() => {
    if (isBalanced && !isSolving) {
      setIsSolving(true);
      setTimeout(onSolve, 1500);
    }
  }, [isBalanced, isSolving, onSolve]);

  const handlePlaceLeft = (id: string) => {
    if (isSolving) return;
    setRightPlacedIds(prev => prev.filter(itemId => itemId !== id));
    setLeftPlacedIds(prev => [...prev.filter(itemId => itemId !== id), id]);
  };

  const handlePlaceRight = (id: string) => {
    if (isSolving) return;
    setLeftPlacedIds(prev => prev.filter(itemId => itemId !== id));
    setRightPlacedIds(prev => [...prev.filter(itemId => itemId !== id), id]);
  };

  const handleRecall = (id: string) => {
    if (isSolving) return;
    setLeftPlacedIds(prev => prev.filter(itemId => itemId !== id));
    setRightPlacedIds(prev => prev.filter(itemId => itemId !== id));
  };

  const diff = rightPlacedWeight - leftPlacedWeight;
  let tilt = 0;
  if (leftPlacedWeight > 0 || rightPlacedWeight > 0) {
    tilt = diff < 0 ? Math.max(-12, diff * 1.5) : Math.min(12, diff * 1.5);
  }

  return (
    <div className="weight-balance-puzzle">
      <p className="question-text" style={{ marginBottom: '1.2rem', fontSize: '1rem', lineHeight: 1.4 }}>
        Balance the sacred scale. Both pans must balance exactly at a weight of: <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{targetWeight}</span>.
        Place weights on either side to align the path.
      </p>
      
      {/* THE SCALE */}
      <div className="scale-container">
        <div className="scale-pivot"></div>
        <div className="scale-beam" style={{ transform: `rotate(${tilt}deg)` }}>
          
          {/* Left Pan */}
          <div className="scale-pan left-pan" style={{ transform: `rotate(${-tilt}deg)` }}>
            <div className="scale-pan-surface">
              <div className="placed-items-container" style={{ minHeight: '55px' }}>
                {leftPlacedIds.map(id => {
                  const item = ITEMS.find(it => it.id === id);
                  if (!item) return null;
                  return (
                    <img 
                      key={id} 
                      src={item.img} 
                      alt={item.name} 
                      className="placed-item-img"
                      title={item.name}
                      onClick={() => handleRecall(id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right Pan */}
          <div className="scale-pan right-pan" style={{ transform: `rotate(${-tilt}deg)` }}>
            <div className="scale-pan-surface">
              <div className="placed-items-container" style={{ minHeight: '55px' }}>
                {rightPlacedIds.map(id => {
                  const item = ITEMS.find(it => it.id === id);
                  if (!item) return null;
                  return (
                    <img 
                      key={id} 
                      src={item.img} 
                      alt={item.name} 
                      className="placed-item-img"
                      title={item.name}
                      onClick={() => handleRecall(id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ margin: '1rem 0 1.5rem', fontSize: '0.95rem', fontFamily: 'var(--font-main)', color: isBalanced ? 'var(--color-success)' : 'var(--color-text)' }}>
        STATUS: <span style={{ color: isBalanced ? 'var(--color-success)' : 'var(--color-accent)', fontWeight: 'bold' }}>
          {isBalanced ? "SCALE BALANCED - PATH ALIGNED" : 
           (leftPlacedWeight === 0 && rightPlacedWeight === 0) ? "SCALE IS EMPTY" :
           leftPlacedWeight === rightPlacedWeight ? "BALANCED BUT NOT AT TARGET COUNTERWEIGHT" :
           diff < 0 ? "LEFT PAN IS HEAVIER" : "RIGHT PAN IS HEAVIER"}
        </span>
      </div>

      {/* INVENTORY */}
      <div className="inventory-grid">
        {ITEMS.map(item => {
          const isLeft = leftPlacedIds.includes(item.id);
          const isRight = rightPlacedIds.includes(item.id);
          return (
            <div 
              key={item.id} 
              className={`inventory-item ${(isLeft || isRight) ? 'placed' : ''}`}
            >
              <img src={item.img} alt={item.name} className="inventory-item-img" onClick={() => handleRecall(item.id)} />
              <div className="inventory-item-info">
                <span className="item-name">{item.name}</span>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  {!(isLeft || isRight) ? (
                    <>
                      <button 
                        type="button" 
                        className="basic-btn" 
                        onClick={() => handlePlaceLeft(item.id)}
                        style={{ padding: '2px 6px', fontSize: '0.75rem', borderColor: 'var(--color-accent)', color: 'var(--color-accent)', background: 'transparent', cursor: 'pointer' }}
                      >
                        Left
                      </button>
                      <button 
                        type="button" 
                        className="basic-btn" 
                        onClick={() => handlePlaceRight(item.id)}
                        style={{ padding: '2px 6px', fontSize: '0.75rem', borderColor: 'var(--color-accent)', color: 'var(--color-accent)', background: 'transparent', cursor: 'pointer' }}
                      >
                        Right
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', alignSelf: 'center' }}>
                        {isLeft ? "On Left" : "On Right"}
                      </span>
                      <button 
                        type="button" 
                        className="basic-btn" 
                        onClick={() => handleRecall(item.id)}
                        style={{ padding: '2px 6px', fontSize: '0.75rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', background: 'transparent', cursor: 'pointer' }}
                      >
                        Recall
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// --- QUESTION LOGIC ---
interface QuestionPuzzleProps {
  activeAnomaly: {
    question?: string;
    puzzleKey?: string;
  };
  onSolve: () => void;
}

function QuestionPuzzle({ activeAnomaly, onSolve }: QuestionPuzzleProps) {
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: "01",
          puzzleKey: activeAnomaly.puzzleKey,
          answer: answer
        })
      });
      const data = await res.json();
      if (data.success && data.correct) {
        setAnswer('');
        setError(false);
        onSolve();
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error("Failed to verify Case 1 answer:", err);
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <p className="question-text" style={{ marginBottom: '2rem', fontSize: '1.2rem', lineHeight: 1.5 }}>
        {activeAnomaly.question}
      </p>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter decryption key..."
          className="basic-input"
          autoFocus
          style={{ borderColor: error ? 'var(--color-danger)' : 'var(--color-accent)' }}
        />
        {error && <div className="error-text">Decryption Failed</div>}
        <button type="submit" className="basic-btn primary-btn" style={{ marginTop: '1rem' }}>
          Decrypt
        </button>
      </form>
    </>
  );
}

// --- SEQUENCE LOGIC ---
interface SequencePuzzleProps {
  activeAnomaly: {
    sequenceLength?: number;
  };
  onSolve: () => void;
}

function SequencePuzzle({ activeAnomaly, onSolve }: SequencePuzzleProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);

  const playSequence = (seq: number[]) => {
    setIsShowing(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActiveIndex(null);
        setIsShowing(false);
        return;
      }
      setActiveIndex(seq[step]);
      setTimeout(() => setActiveIndex(null), 400);
      step++;
    }, 800);
  };

  useEffect(() => {
    const len = activeAnomaly.sequenceLength || 4;
    const newSeq = Array.from({length: len}, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setPlayerStep(0);
    setSolved(false);
    setError(false);
    
    const timer = setTimeout(() => playSequence(newSeq), 500);
    return () => clearTimeout(timer);
  }, [activeAnomaly]);

  const handleTileClick = (index: number) => {
    if (isShowing || solved || error) return;

    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);

    if (index === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);
      if (nextStep === sequence.length) {
        setSolved(true);
        setTimeout(onSolve, 1000);
      }
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPlayerStep(0);
        playSequence(sequence);
      }, 1000);
    }
  };

  return (
    <>
      <p className="question-text" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Observe and repeat the signal sequence.
      </p>
      <div className="sequence-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '200px', margin: '0 auto'
      }}>
        {[0, 1, 2, 3].map(index => (
          <div 
            key={index}
            onClick={() => handleTileClick(index)}
            className={`sequence-cell ${activeIndex === index ? 'active' : ''} ${error ? 'error' : ''} ${solved ? 'solved' : ''}`}
            style={{
              aspectRatio: '1/1',
              border: '2px solid var(--color-danger)',
              background: 'rgba(0,0,0,0.8)',
              cursor: isShowing ? 'default' : 'pointer',
              transition: 'all 0.1s'
            }}
          ></div>
        ))}
      </div>
    </>
  );
}

// --- MAIN WRAPPER ---
interface Puzzle {
  type: string;
  pattern?: number[];
  question?: string;
  answer?: string;
  sequenceLength?: number;
  targetWeight?: number;
  puzzleKey?: string;
}

interface ActiveAnomaly {
  key: string;
  puzzles?: Puzzle[];
  type?: string;
  pattern?: number[];
  question?: string;
  answer?: string;
  sequenceLength?: number;
  targetWeight?: number;
  puzzleKey?: string;
}

interface QuestionModalProps {
  activeAnomaly: ActiveAnomaly | null;
  solveAnomaly: (key: string) => void;
  closeAnomaly: () => void;
  showMap: boolean;
}

export function QuestionModal({ activeAnomaly, solveAnomaly, closeAnomaly, showMap }: QuestionModalProps) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [prevAnomaly, setPrevAnomaly] = useState<ActiveAnomaly | null>(null);

  if (activeAnomaly !== prevAnomaly) {
    setPrevAnomaly(activeAnomaly);
    setCurrentPuzzleIndex(0);
  }

  if (!activeAnomaly) return null;

  const puzzles = activeAnomaly.puzzles || [activeAnomaly as Puzzle];
  const currentPuzzle = puzzles[currentPuzzleIndex];

  if (!currentPuzzle) return null;

  const handleSolve = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      solveAnomaly(activeAnomaly.key);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="hud-box modal-box" style={{ maxWidth: '480px', width: '95%' }}>
        <h2 className="modal-title">
          ANOMALY DETECTED {puzzles.length > 1 && `(${currentPuzzleIndex + 1}/${puzzles.length})`}
        </h2>
        <div className="modal-content">
          
          {currentPuzzle.type === 'lights_out' && <LightsOutPuzzle key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'weight_balance' && <WeightBalancePuzzle key={`${activeAnomaly.key}-${currentPuzzleIndex}`} anomalyKey={activeAnomaly.key} onSolve={handleSolve} />}
          {currentPuzzle.type === 'sequence' && <SequencePuzzle key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'question' && <QuestionPuzzle key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}

          <div className="modal-actions" style={{ marginTop: '2rem' }}>
            <button type="button" onClick={closeAnomaly} className="basic-btn secondary-btn">
              Abort
            </button>
            {showMap && (
              <button 
                type="button" 
                onClick={handleSolve} 
                className="basic-btn primary-btn" 
                style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)', marginLeft: '1rem' }}
              >
                Override (Skip)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
