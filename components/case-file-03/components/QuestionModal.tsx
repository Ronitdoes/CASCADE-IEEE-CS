import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCw, RefreshCw } from 'lucide-react';

// ==========================================
// 1. FORGOTTEN HYMN PUZZLE
// ==========================================
interface ForgottenHymnProps {
  activeAnomaly: any;
  onSolve: () => void;
}

function ForgottenHymn({ activeAnomaly, onSolve }: ForgottenHymnProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.toLowerCase().trim() === 'flame') {
      setError(false);
      onSolve();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <p className="question-text" style={{ fontStyle: 'italic', opacity: 0.85, fontSize: '0.9rem', marginBottom: '1rem' }}>
        One fragment of a ceremonial hymn survived the collapse. The archivists believe the answer lies not in what the hymn says, but in how it begins.
      </p>
      
      <div style={{
        background: 'rgba(25, 12, 10, 0.75)',
        borderLeft: '4px solid var(--color-accent)',
        padding: '16px 24px',
        margin: '1.2rem 0',
        fontFamily: 'var(--font-serif)',
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#fbf3eb',
        letterSpacing: '1px',
        boxShadow: '0 4px 15px rgba(255, 78, 32, 0.05)'
      }}>
        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 78, 32, 0.4)' }}>F</span>aith carried us through the longest winters.<br />
        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 78, 32, 0.4)' }}>L</span>ight revealed every hidden truth.<br />
        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 78, 32, 0.4)' }}>A</span>sh buried every forgotten city.<br />
        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 78, 32, 0.4)' }}>M</span>emory outlived every monument.<br />
        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 78, 32, 0.4)' }}>E</span>very ending was once a beginning.
      </div>

      <p className="question-text" style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
        Question: What sustained their civilization?
      </p>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        Hint: "The beginning remembers."
      </p>

      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter key..."
          className="basic-input"
          autoFocus
          style={{ borderColor: error ? 'var(--color-danger)' : 'var(--color-accent)' }}
        />
        {error && <div className="error-text">Decryption Failed</div>}
        <button type="submit" className="basic-btn primary-btn" style={{ marginTop: '0.5rem' }}>
          Decrypt Terminal
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 2. CAESAR SCROLL PUZZLE
// ==========================================
interface CaesarScrollProps {
  activeAnomaly: any;
  onSolve: () => void;
}

function CaesarScroll({ activeAnomaly, onSolve }: CaesarScrollProps) {
  const [shift, setShift] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [stage, setStage] = useState(0);

  // Initialize random shifts for each stage (avoiding 3)
  const [stageShifts] = useState<number[]>(() => {
    return Array.from({ length: 4 }, () => {
      let s;
      do {
        s = Math.floor(Math.random() * 25) + 1;
      } while (s === 3);
      return s;
    });
  });

  const STAGES = [
    { plaintext: "THE" },
    { plaintext: "THE FLAME" },
    { plaintext: "THE FLAME IS" },
    { plaintext: "THE FLAME IS FADING" }
  ];

  const currentStage = STAGES[stage];
  const targetShift = stageShifts[stage];

  const encryptCaesar = (str: string, s: number) => {
    return str.toUpperCase().split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + s) % 26) + 65);
      }
      return char;
    }).join('');
  };

  const decryptCaesar = (str: string, s: number) => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - s + 26) % 26) + 65);
      }
      return char;
    }).join('');
  };

  const ciphertext = encryptCaesar(currentStage.plaintext, targetShift);
  const currentDecryptedText = decryptCaesar(ciphertext, shift);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = answer.toUpperCase().trim().replace(/\s+/g, ' ');
    if (cleanAnswer === currentStage.plaintext) {
      setError(false);
      setAnswer('');
      if (stage < STAGES.length - 1) {
        setStage(prev => prev + 1);
        setShift(0); // reset slider for next stage
      } else {
        onSolve();
      }
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="question-text" style={{ fontSize: '0.85rem', opacity: 0.85, margin: 0, flex: 1 }}>
          Archaeologists recovered an encrypted stone tablet containing a message encoded with a simple letter-shift. Decode the inscription exactly as intended.
        </p>
        <span style={{ 
          fontSize: '0.75rem', 
          fontFamily: 'monospace', 
          background: 'rgba(212, 175, 55, 0.15)', 
          color: 'var(--color-accent)', 
          padding: '2px 8px', 
          borderRadius: '4px',
          border: '1px solid var(--color-accent-dim)',
          marginLeft: '12px',
          whiteSpace: 'nowrap'
        }}>
          Stage {stage + 1} / 4
        </span>
      </div>

      <div className="caesar-ciphertext" style={{ textAlign: 'center', minHeight: '36px' }}>
        {ciphertext}
      </div>

      <div className="caesar-slider-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', fontSize: '0.8rem' }}>
          <span>Caesar Shift: +{shift}</span>
          <span style={{ color: shift === targetShift ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {shift === targetShift ? 'Align' : 'Shift'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="25"
          value={shift}
          onChange={(e) => setShift(parseInt(e.target.value))}
          className="caesar-slider"
        />
        <div style={{
          marginTop: '0.5rem',
          fontSize: '1.2rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-accent)',
          fontWeight: 'bold',
          letterSpacing: '3px',
          minHeight: '24px',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(255, 78, 32, 0.35)'
        }}>
          {currentDecryptedText}
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 'bold' }}>
        Hint: Use slider and find the word
      </p>

      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={`ENTER DECRYPTED STAGE ${stage + 1}...`}
          className="basic-input"
          style={{ borderColor: error ? 'var(--color-danger)' : 'var(--color-accent)' }}
          autoFocus
        />
        {error && <div className="error-text">Decryption Failed</div>}
        <button type="submit" className="basic-btn primary-btn" style={{ marginTop: '0.5rem' }}>
          {stage < STAGES.length - 1 ? `Unlock Stage ${stage + 2}` : "Decrypt Tablet Inscription"}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 3. CHRONICLE RECONSTRUCTION PUZZLE
// ==========================================
interface ChronicleProps {
  activeAnomaly: any;
  onSolve: () => void;
}

interface ParaItem {
  id: string;
  order: number; // Chronological order (0 = earliest, 5 = latest)
  text: string;
  lastWord: string;
}

const CHRONICLES_INITIAL: ParaItem[] = [
  {
    id: "A",
    order: 0,
    text: "Long ago, when the world was young, the First Flame still burned, casting a faint ",
    lastWord: "LIGHT"
  },
  {
    id: "B",
    order: 1,
    text: "Though ash had begun to fall, the western capital had not yet fallen, and a single road still ",
    lastWord: "LEADS"
  },
  {
    id: "C",
    order: 2,
    text: "Survival grew difficult as the rivers had already dried, leaving dust ",
    lastWord: "ONLY"
  },
  {
    id: "D",
    order: 3,
    text: "When the gods ceased speaking, the temples were abandoned to ",
    lastWord: "THE"
  },
  {
    id: "E",
    order: 4,
    text: "With no hope remaining, the final expedition departed, searching for the ",
    lastWord: "WORTHY"
  },
  {
    id: "F",
    order: 5,
    text: "As the years stretched into centuries, memory itself began to fade, far from ",
    lastWord: "HOME"
  }
];

function ChronicleReconstruction({ activeAnomaly, onSolve }: ChronicleProps) {
  // Initialize shuffled
  const [items, setItems] = useState<ParaItem[]>([]);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Shuffle items once on load
    const shuffled = [...CHRONICLES_INITIAL].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < items.length) {
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      setItems(newItems);
    }
  };

  const isCorrectOrder = items.every((item, idx) => item.order === idx);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = answer.toLowerCase().trim().replace(/\s+/g, ' ');
    if (cleanAnswer === 'light leads only the worthy home') {
      setError(false);
      onSolve();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <p className="question-text" style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.5rem' }}>
        Six pages of a manuscript are scrambled. Order them chronologically. Use the arrow buttons to arrange them.
      </p>

      <div className="chronicle-list">
        {items.map((item, index) => (
          <div key={item.id} className="chronicle-item" style={{
            borderColor: isCorrectOrder ? 'var(--color-success)' : undefined,
            background: isCorrectOrder ? 'rgba(16, 185, 129, 0.05)' : undefined
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                style={{
                  background: 'none', border: 'none', color: index === 0 ? '#333' : 'var(--color-accent)',
                  cursor: index === 0 ? 'default' : 'pointer', fontSize: '0.75rem', padding: '0 4px'
                }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                style={{
                  background: 'none', border: 'none', color: index === items.length - 1 ? '#333' : 'var(--color-accent)',
                  cursor: index === items.length - 1 ? 'default' : 'pointer', fontSize: '0.75rem', padding: '0 4px'
                }}
              >
                ▼
              </button>
            </div>
            <div style={{ flex: 1 }}>
              {item.text}
              <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{item.lastWord}</span>
            </div>
          </div>
        ))}
      </div>

      {isCorrectOrder ? (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)',
          padding: '10px 14px', borderRadius: '6px', marginBottom: '1.2rem', fontSize: '0.85rem'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>✓ Manuscript Ordered Successfully</p>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text)' }}>
            Notes state: <span style={{ fontStyle: 'italic' }}>"Truth is found in beginnings, but the archive is mirrored."</span>
          </p>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
          Chronological clues: Flame burns → Capital stands → Rivers dry → Temples abandoned → Expedition leaves → Memory fades.
        </p>
      )}

      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="ENTER DECRYPTION KEY..."
          className="basic-input"
          style={{ borderColor: error ? 'var(--color-danger)' : 'var(--color-accent)' }}
        />
        {error && <div className="error-text">Decryption Failed</div>}
        <button type="submit" className="basic-btn primary-btn" style={{ marginTop: '0.5rem' }}>
          Submit Code
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 4. MEMORY ROOM PUZZLE
// ==========================================
interface MemoryRoomProps {
  activeAnomaly: any;
  onSolve: () => void;
}

const MEMORY_ITEMS = [
  { id: 'moon', name: 'Moon', icon: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#ffd700" stroke="#ffd700" />
    </svg>
  )},
  { id: 'crow', name: 'Crow', icon: () => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 24 C 20 20, 28 20, 32 26 C 36 22, 40 18, 48 24 C 44 26, 40 28, 38 32 C 34 36, 28 38, 22 36 L 14 42 L 18 34 C 14 32, 12 28, 16 24 Z" fill="#2c2c2c" stroke="#616161" />
      <path d="M32 26 L 30 38 L 34 40 Z" fill="#2c2c2c" stroke="#616161" />
      <path d="M48 24 L 56 26 L 46 28 Z" fill="#ffd700" stroke="#ffd700" />
      <circle cx="44" cy="24" r="1.5" fill="#ff1744" />
    </svg>
  )},
  { id: 'four', name: '4', icon: () => (
    <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-accent)', fontFamily: 'monospace', lineHeight: 1, textShadow: '0 0 12px rgba(212, 175, 55, 0.7)' }}>
      4
    </div>
  )},
  { id: 'eye', name: 'Eye', icon: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" fill="rgba(5, 242, 146, 0.1)" stroke="#05f292" />
      <circle cx="12" cy="12" r="3" fill="#05f292" />
    </svg>
  )},
  { id: 'key', name: 'Key', icon: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6" fill="rgba(212, 175, 55, 0.15)" stroke="var(--color-accent)" />
    </svg>
  )},
  { id: 'blood', name: 'Blood', icon: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7Z" fill="#ff1744" stroke="#ff1744" />
    </svg>
  )}
];

const CORRECT_SEQUENCE = ['moon', 'crow', 'four', 'eye', 'key', 'blood'];

function MemoryRoom({ activeAnomaly, onSolve }: MemoryRoomProps) {
  const [gameState, setGameState] = useState<'intro' | 'playback' | 'input'>('intro');
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<typeof MEMORY_ITEMS>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Start playback
  const startPlayback = () => {
    setGameState('playback');
    setPlaybackIndex(0);
    setIsTransitioning(false);
    setUserSelection([]);
    setError(false);
  };

  // Playback timeline controller
  useEffect(() => {
    if (gameState !== 'playback') return;

    if (playbackIndex < CORRECT_SEQUENCE.length) {
      const displayTimer = setTimeout(() => {
        setIsTransitioning(true);
        const transitionTimer = setTimeout(() => {
          setIsTransitioning(false);
          setPlaybackIndex(prev => prev + 1);
        }, 300);
        return () => clearTimeout(transitionTimer);
      }, 1500);
      return () => clearTimeout(displayTimer);
    } else {
      const shuffled = [...MEMORY_ITEMS].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
      setGameState('input');
    }
  }, [gameState, playbackIndex]);

  const handleOptionClick = (id: string) => {
    if (error) return;
    
    const nextSelection = [...userSelection, id];
    setUserSelection(nextSelection);

    const isCorrectSoFar = nextSelection.every((selectedId, idx) => selectedId === CORRECT_SEQUENCE[idx]);

    if (!isCorrectSoFar) {
      setError(true);
      setCooldownRemaining(60);
      setTimeout(() => {
        setUserSelection([]);
        setError(false);
      }, 1200);
    } else if (nextSelection.length === CORRECT_SEQUENCE.length) {
      setTimeout(onSolve, 1000);
    }
  };

  const currentPlaybackItem = MEMORY_ITEMS.find(item => item.id === CORRECT_SEQUENCE[playbackIndex]);

  return (
    <div style={{ textAlign: 'left' }}>
      {gameState === 'intro' && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
            Memory Room
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1.5rem', fontStyle: 'italic' }}>
            Nothing is written down. You must walk through the sequence of six rooms, remember what each room holds, and reconstruct the path at the end.
          </p>
          <button 
            type="button" 
            onClick={startPlayback} 
            className="basic-btn primary-btn"
            style={{ width: '100%', maxWidth: '240px' }}
          >
            Begin Memory Walk
          </button>
        </div>
      )}

      {gameState === 'playback' && currentPlaybackItem && (
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            ROOM {playbackIndex + 1} / 6
          </p>
          <div 
            style={{
              width: '240px',
              height: '240px',
              margin: '0 auto',
              background: '#020101',
              border: '2px solid var(--wall-stroke)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 0.25s ease-in-out',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.95)'
            }}
          >
            {currentPlaybackItem.icon()}
            <span style={{ fontSize: '1.2rem', color: 'var(--color-text)', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {currentPlaybackItem.name}
            </span>
          </div>
        </div>
      )}

      {gameState === 'input' && (
        <div>
          <p className="question-text" style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '1rem', textAlign: 'center' }}>
            Reconstruct the sequence of rooms in the order you saw them.
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {CORRECT_SEQUENCE.map((_, idx) => {
              const selectedId = userSelection[idx];
              const item = selectedId ? MEMORY_ITEMS.find(i => i.id === selectedId) : null;
              return (
                <div 
                  key={idx}
                  style={{
                    width: '42px',
                    height: '42px',
                    border: error 
                      ? '1px solid var(--color-danger)' 
                      : item 
                        ? '1px solid var(--color-success)' 
                        : '1px dashed var(--wall-stroke)',
                    background: error 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : item 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(0,0,0,0.4)',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    color: error ? 'var(--color-danger)' : 'var(--color-success)',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item ? item.name : '?'}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
            {shuffledOptions.map(option => {
              const isAlreadySelected = userSelection.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isAlreadySelected || error}
                  onClick={() => handleOptionClick(option.id)}
                  className="basic-btn"
                  style={{
                    padding: '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid var(--wall-stroke)',
                    background: isAlreadySelected ? 'rgba(0,0,0,0.6)' : 'rgba(20, 10, 8, 0.5)',
                    opacity: isAlreadySelected ? 0.3 : 1,
                    cursor: isAlreadySelected ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {option.icon()}
                  <span style={{ fontSize: '0.75rem', color: isAlreadySelected ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <div style={{ 
              color: 'var(--color-danger)', 
              fontSize: '0.85rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Incorrect sequence! The timeline resets.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={startPlayback} 
              disabled={cooldownRemaining > 0 || userSelection.length === 0}
              className="basic-btn secondary-btn"
              style={{ 
                fontSize: '0.8rem', 
                padding: '6px 16px',
                opacity: (cooldownRemaining > 0 || userSelection.length === 0) ? 0.4 : 1,
                cursor: (cooldownRemaining > 0 || userSelection.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {cooldownRemaining > 0 
                ? `Replay Blocked (${cooldownRemaining}s)` 
                : "Replay Memory Walk"
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. TEMPLE FLOOR PUZZLE
// ==========================================
interface TempleFloorProps {
  activeAnomaly: any;
  onSolve: () => void;
}

function TempleFloor({ activeAnomaly, onSolve }: TempleFloorProps) {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [error, setError] = useState(false);

  // Nodes for EMBER:
  // Node coordinates:
  // E1 (200, 240), M (100, 200), B (200, 160), E2 (300, 200), R (200, 100)
  // Let's place 12 nodes total
  const nodes = [
    { id: 'E1', letter: 'E', x: 200, y: 240, label: 'Sun' },
    { id: 'M', letter: 'M', x: 100, y: 200, label: 'Memory' },
    { id: 'B', letter: 'B', x: 200, y: 160, label: 'Ash' },
    { id: 'E2', letter: 'E', x: 300, y: 200, label: 'Sunburst' },
    { id: 'R', letter: 'R', x: 200, y: 100, label: 'Ruins' },
    // Distractors
    { id: 'L', letter: 'L', x: 200, y: 40, label: 'Light (North)' },
    { id: 'A', letter: 'A', x: 80, y: 100, label: 'Aura' },
    { id: 'S', letter: 'S', x: 320, y: 100, label: 'Shadow' },
    { id: 'T', letter: 'T', x: 100, y: 300, label: 'Time' },
    { id: 'H', letter: 'H', x: 300, y: 300, label: 'Hearth' },
    { id: 'K', letter: 'K', x: 50, y: 200, label: 'Keep' },
    { id: 'Y', letter: 'Y', x: 350, y: 200, label: 'Yonder' }
  ];

  const handleNodeClick = (nodeId: string) => {
    if (error) return;
    const newSelected = [...selectedNodes, nodeId];
    setSelectedNodes(newSelected);

    // Validate path sequentially
    const correctPath = ['E1', 'M', 'B', 'E2', 'R'];
    const currentCorrect = newSelected.every((val, idx) => val === correctPath[idx]);

    if (!currentCorrect) {
      setError(true);
      setTimeout(() => {
        setSelectedNodes([]);
        setError(false);
      }, 1000);
    } else if (newSelected.length === 5) {
      setTimeout(onSolve, 1000);
    }
  };

  const getWord = () => {
    return selectedNodes.map(id => nodes.find(n => n.id === id)?.letter || '').join('');
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <p className="question-text" style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.5rem' }}>
        Cathedral ruins inscription: <span style={{ fontStyle: 'italic' }}>"Walk where the Flame once walked."</span><br />
        Clues: Sun rises after Ash. Ash follows Memory. Memory precedes Light. Light faces North.
      </p>

      <div className="temple-graph-container">
        <svg width="320" height="320" style={{ background: '#020101', border: '1px solid var(--wall-stroke)' }}>
          {/* Grid lines */}
          <line x1="160" y1="0" x2="160" y2="320" stroke="#3a1b17" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="160" x2="320" y2="160" stroke="#3a1b17" strokeWidth="0.5" strokeDasharray="3 3" />
          
          {/* Graph paths */}
          {selectedNodes.length > 1 && selectedNodes.map((nodeId, idx) => {
            if (idx === 0) return null;
            const prev = nodes.find(n => n.id === selectedNodes[idx - 1]);
            const curr = nodes.find(n => n.id === nodeId);
            if (!prev || !curr) return null;
            return (
              <line
                key={`line-${idx}`}
                x1={prev.x} y1={prev.y}
                x2={curr.x} y2={curr.y}
                stroke={error ? 'var(--color-danger)' : 'var(--color-success)'}
                strokeWidth="3"
                className="path-drawn"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNodes.includes(node.id);
            const isLatest = selectedNodes[selectedNodes.length - 1] === node.id;
            
            let color = 'rgba(255, 78, 32, 0.2)';
            let strokeColor = 'var(--wall-stroke)';
            if (isSelected) {
              color = error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
              strokeColor = error ? 'var(--color-danger)' : 'var(--color-success)';
            } else if (node.id === 'L') {
              strokeColor = 'var(--color-accent)'; // Light faces North indicator
            }

            return (
              <g key={node.id} onClick={() => handleNodeClick(node.id)} className="temple-node">
                <circle
                  cx={node.x} cy={node.y} r="16"
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={isLatest ? "3" : "1.5"}
                />
                <text
                  x={node.x} y={node.y + 5}
                  fill={isSelected ? '#fff' : 'var(--color-text)'}
                  fontSize="12" fontWeight="bold" textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {node.letter}
                </text>
                {/* Node labels */}
                <text
                  x={node.x} y={node.y - 20}
                  fill="var(--color-text-muted)"
                  fontSize="8" textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
          Sequence Spelled:{' '}
          <span style={{ color: error ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 'bold', letterSpacing: '4px' }}>
            {getWord() || '____'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedNodes([])}
          className="basic-btn secondary-btn"
          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
        >
          Reset Path
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 6. CANDLE PIANO PUZZLE
// ==========================================
interface CandlePianoProps {
  activeAnomaly: any;
  onSolve: () => void;
}

const TONES = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4, D4, E4, G4, A4
const MELODY = [1, 3, 0, 4, 2]; // 0-indexed keys (2, 4, 1, 5, 3)

function CandlePiano({ activeAnomaly, onSolve }: CandlePianoProps) {
  const [isPlayingClue, setIsPlayingClue] = useState(false);
  const [activeClueIndex, setActiveClueIndex] = useState<number | null>(null);
  const [userInputs, setUserInputs] = useState<number[]>([]);
  const [errorState, setErrorState] = useState(false);
  const [activeKey, setActiveKey] = useState<number | null>(null);

  // Play audio synthesizer tone
  const playNote = (index: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // warmer piano-like sound
      osc.frequency.value = TONES[index];

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } catch (e) {
      console.warn(e);
    }
  };

  // Playback the candle melody clue
  const playClue = () => {
    if (isPlayingClue || errorState) return;
    setIsPlayingClue(true);
    setUserInputs([]);
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < MELODY.length) {
        const keyIndex = MELODY[step];
        setActiveClueIndex(keyIndex);
        playNote(keyIndex);
        step++;
      } else {
        clearInterval(interval);
        setActiveClueIndex(null);
        setIsPlayingClue(false);
      }
    }, 1200);
  };

  const handleKeyPress = (keyIndex: number) => {
    if (isPlayingClue || errorState) return;

    setActiveKey(keyIndex);
    playNote(keyIndex);
    setTimeout(() => setActiveKey(null), 300);

    const nextInputs = [...userInputs, keyIndex];
    setUserInputs(nextInputs);

    // Verify input sequence
    const isCorrectSoFar = nextInputs.every((val, idx) => val === MELODY[idx]);

    if (!isCorrectSoFar) {
      setErrorState(true);
      setTimeout(() => {
        setUserInputs([]);
        setErrorState(false);
      }, 1500);
    } else if (nextInputs.length === MELODY.length) {
      setTimeout(onSolve, 1000);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p className="question-text" style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '1rem' }}>
        An old piano stands in the shadows. Watch the flickering candle flames grow tall in sequence to learn the melody, then play the correct keys.
      </p>

      {/* Candles Row Container */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'flex-end', 
        height: '140px', 
        background: '#040202',
        border: '1px solid var(--wall-stroke)',
        borderRadius: '6px',
        padding: '10px 20px',
        marginBottom: '1.5rem',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.95)'
      }}>
        {TONES.map((_, idx) => {
          const isClueTall = activeClueIndex === idx;
          const isPressedTall = activeKey === idx;
          const isTall = isClueTall || isPressedTall;

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Candle Flame SVG */}
              <svg width="40" height="90" viewBox="0 0 40 90">
                <defs>
                  <radialGradient id={`glow-${idx}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={errorState ? "#ff1744" : "#ff9800"} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={errorState ? "#b71c1c" : "#e65100"} stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Glow effect */}
                <circle 
                  cx="20" 
                  cy={isTall ? "20" : "40"} 
                  r={isTall ? "20" : "12"} 
                  fill={`url(#glow-${idx})`} 
                  opacity={isTall ? "0.9" : "0.5"}
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Flickering Flame */}
                <path 
                  d={isTall 
                    ? "M 20,5 Q 12,20 20,40 Q 28,20 20,5 Z" 
                    : "M 20,25 Q 15,33 20,43 Q 25,33 20,25 Z" 
                  }
                  fill={errorState ? "#ff1744" : "#ffb74d"}
                  stroke={errorState ? "#b71c1c" : "#f57c00"}
                  strokeWidth="1"
                  style={{ transition: 'all 0.2s ease-in-out' }}
                >
                  <animate 
                    attributeName="d" 
                    values={isTall
                      ? `
                        M 20,5 Q 12,20 20,40 Q 28,20 20,5 Z;
                        M 20,8 Q 14,21 19,40 Q 26,21 20,8 Z;
                        M 20,5 Q 12,20 20,40 Q 28,20 20,5 Z
                      `
                      : `
                        M 20,25 Q 15,33 20,43 Q 25,33 20,25 Z;
                        M 20,27 Q 16,34 19,43 Q 24,34 20,27 Z;
                        M 20,25 Q 15,33 20,43 Q 25,33 20,25 Z
                      `
                    } 
                    dur="0.25s" 
                    repeatCount="indefinite" 
                  />
                </path>

                {/* Wick */}
                <line x1="20" y1="43" x2="20" y2="48" stroke="#333" strokeWidth="1.5" />

                {/* Candle Body */}
                <rect x="16" y="48" width="8" height="35" fill="#f5ebe0" rx="1" />
                
                {/* Wax drip */}
                <path d="M 16,52 Q 18,55 18,52 Q 22,50 20,54" fill="none" stroke="#e3d5ca" strokeWidth="1" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Input tracker flames */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
        {MELODY.map((_, idx) => {
          const isSelected = userInputs.length > idx;
          return (
            <div 
              key={idx}
              style={{
                width: '16px',
                height: '24px',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: errorState 
                  ? 'var(--color-danger)' 
                  : isSelected 
                    ? 'var(--color-success)' 
                    : 'transparent',
                border: errorState 
                  ? '1px solid var(--color-danger)' 
                  : isSelected 
                    ? '1px solid var(--color-success)' 
                    : '1px solid var(--wall-stroke)',
                transition: 'all 0.25s ease',
                boxShadow: isSelected && !errorState ? '0 0 6px var(--color-success)' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Piano Keys Grid */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        background: '#1a100c', 
        padding: '16px 20px 24px 20px', 
        border: '2px solid var(--wall-stroke)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
        maxWidth: '360px',
        margin: '0 auto 1.5rem auto'
      }}>
        <div style={{ display: 'flex', background: '#000', padding: '4px', borderRadius: '4px', gap: '3px', width: '100%' }}>
          {TONES.map((_, idx) => {
            const isPressed = activeKey === idx;
            return (
              <button
                key={idx}
                type="button"
                disabled={isPlayingClue || errorState}
                onClick={() => handleKeyPress(idx)}
                style={{
                  flex: 1,
                  height: '140px',
                  background: isPressed 
                    ? '#d4c7b8' 
                    : 'linear-gradient(to bottom, #ffffff 0%, #fdfcf7 85%, #e8e6dd 100%)',
                  border: 'none',
                  borderRadius: '0 0 4px 4px',
                  cursor: isPlayingClue || errorState ? 'default' : 'pointer',
                  outline: 'none',
                  boxShadow: isPressed 
                    ? 'inset 0 4px 8px rgba(0,0,0,0.6)' 
                    : '0 4px 2px rgba(0,0,0,0.3)',
                  transform: isPressed ? 'translateY(2px)' : 'none',
                  transition: 'all 0.1s ease',
                  position: 'relative'
                }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={playClue}
          disabled={isPlayingClue || errorState}
          className="basic-btn primary-btn"
          style={{ width: '100%', maxWidth: '200px' }}
        >
          {isPlayingClue ? "Playing Melody..." : "Watch Candles"}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. IMPOSSIBLE MAP PUZZLE
// ==========================================
interface FlameImagePuzzleProps {
  activeAnomaly: any;
  onSolve: () => void;
}

function FlameImagePuzzle({ activeAnomaly, onSolve }: FlameImagePuzzleProps) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize and shuffle
  useEffect(() => {
    const initialTiles = Array.from({ length: 16 }, (_, i) => i);
    let shuffled = [...initialTiles];
    do {
      shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
    } while (shuffled.every((val, idx) => val === idx));

    setTiles(shuffled);
  }, []);

  const handleTileClick = (index: number) => {
    if (selectedTile === null) {
      setSelectedTile(index);
    } else {
      if (selectedTile !== index) {
        setTiles(prev => {
          const nextTiles = [...prev];
          const temp = nextTiles[selectedTile];
          nextTiles[selectedTile] = nextTiles[index];
          nextTiles[index] = temp;

          const isSolved = nextTiles.every((val, idx) => val === idx);
          if (isSolved) {
            setTimeout(onSolve, 1000);
          }

          return nextTiles;
        });
      }
      setSelectedTile(null);
    }
  };

  const isSolved = tiles.length === 16 && tiles.every((val, idx) => val === idx);

  return (
    <div style={{ textAlign: 'left' }}>
      <p className="question-text" style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.8rem' }}>
        The flame shrine has fractured. Rearrange the 16 pieces by clicking any two tiles to swap their positions. Restore the image to stoke the flame.
      </p>

      <div 
        style={{ 
          position: 'relative',
          width: '320px', 
          height: '320px', 
          margin: '0 auto 1rem auto',
          border: isSolved ? '2px solid var(--color-success)' : '2px solid var(--wall-stroke)',
          boxShadow: isSolved ? '0 0 15px var(--color-success)' : 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          background: '#050202',
          overflow: 'hidden'
        }}
      >
        {tiles.map((tileValue, currentIndex) => {
          const originalRow = Math.floor(tileValue / 4);
          const originalCol = tileValue % 4;

          const xPercent = (originalCol / 3) * 100;
          const yPercent = (originalRow / 3) * 100;

          const isSelected = selectedTile === currentIndex;

          return (
            <div
              key={currentIndex}
              onClick={() => !isSolved && handleTileClick(currentIndex)}
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/case-03/mystical-flame.jpg")',
                backgroundSize: '400% 400%',
                backgroundPosition: `${xPercent}% ${yPercent}%`,
                border: isSelected 
                  ? '2px solid var(--color-success)' 
                  : isSolved 
                    ? 'none' 
                    : '1px solid rgba(92, 74, 20, 0.4)',
                boxShadow: isSelected ? 'inset 0 0 8px var(--color-success)' : 'none',
                cursor: isSolved ? 'default' : 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
                zIndex: isSelected ? 10 : 1
              }}
            />
          );
        })}

        {showPreview && !isSolved && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("/case-03/mystical-flame.jpg")',
              backgroundSize: 'cover',
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 20
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          disabled={isSolved}
          className="basic-btn secondary-btn"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>

        <button
          type="button"
          onClick={() => {
            const initialTiles = Array.from({ length: 16 }, (_, i) => i);
            let shuffled = [...initialTiles];
            do {
              shuffled = [...initialTiles].sort(() => Math.random() - 0.5);
            } while (shuffled.every((val, idx) => val === idx));
            setTiles(shuffled);
            setSelectedTile(null);
          }}
          disabled={isSolved}
          className="basic-btn secondary-btn"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
        >
          Reset
        </button>
      </div>

      {isSolved && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)',
          padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>✓ Flame Restored Successfully</p>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text)' }}>
            The seals are opening...
          </p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN WRAPPER
// ==========================================
interface ActiveAnomaly {
  key: string;
  puzzles?: { type: string }[];
  type?: string;
}

interface QuestionModalProps {
  activeAnomaly: ActiveAnomaly | null;
  solveAnomaly: (key: string) => void;
  closeAnomaly: () => void;
  showMap: boolean;
}

export function QuestionModal({ activeAnomaly, solveAnomaly, closeAnomaly, showMap }: QuestionModalProps) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [prevAnomaly, setPrevAnomaly] = useState<ActiveAnomaly | null>(null);

  if (activeAnomaly !== prevAnomaly) {
    setPrevAnomaly(activeAnomaly);
    setCurrentPuzzleIndex(0);
  }

  if (!activeAnomaly) return null;

  const puzzles = activeAnomaly.puzzles || [activeAnomaly as any];
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
      <div className="hud-box modal-box">
        <h2 className="modal-title">
          ANOMALY TERMINAL DETECTED
        </h2>
        <div className="modal-content" style={{ marginTop: '1.2rem' }}>
          
          {currentPuzzle.type === 'forgotten_hymn' && <ForgottenHymn key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'caesar_scroll' && <CaesarScroll key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'chronicle_reconstruction' && <ChronicleReconstruction key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {(currentPuzzle.type === 'memory_room' || currentPuzzle.type === 'excavation_grid') && <MemoryRoom key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'temple_floor' && <TempleFloor key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {(currentPuzzle.type === 'candle_piano' || currentPuzzle.type === 'cathedral_organ') && <CandlePiano key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {(currentPuzzle.type === 'flame_image_puzzle' || currentPuzzle.type === 'impossible_map') && <FlameImagePuzzle key={`${activeAnomaly.key}-${currentPuzzleIndex}`} activeAnomaly={currentPuzzle} onSolve={handleSolve} />}

          <div className="modal-actions" style={{ marginTop: '2rem' }}>
            <button type="button" onClick={closeAnomaly} className="basic-btn secondary-btn">
              Abort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
