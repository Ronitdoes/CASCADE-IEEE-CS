'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import styles from '../operation-deadlight.module.css'

// Binary grid puzzle data - correct parity pattern
const BINARY_GRID = [
  [1, 1, 0, 1, 0], // sum = 3 (odd)
  [0, 1, 1, 0, 0], // sum = 2 (even)
  [1, 0, 0, 0, 1], // sum = 2 (even)
  [0, 0, 1, 1, 0], // sum = 2 (even)
  [0, 1, 0, 1, 1], // sum = 3 (odd)
]

const PACKET_HEX = '45 00 00 2e 04 d2 00 00 40 11 ab cd 0a 00 00 01 0a 00 00 02 53 48 49 45 4c 44'
const PACKET_ANSWER = 'SHIELD'

const CIPHER_TEXT = 'ZXHHPZM'
const CIPHER_ANSWER = 'REPLACE'

interface FragmentState {
  binary: boolean
  packet: boolean
  image: boolean
  cipher: boolean
}

export function SymbolReconstruction({ onSolved }: { onSolved: () => void }) {
  const [fragments, setFragments] = useState<FragmentState>({
    binary: false, packet: false, image: false, cipher: false,
  })
  const [activePuzzle, setActivePuzzle] = useState<keyof FragmentState | null>(null)
  const [assembling, setAssembling] = useState(false)
  const [assembled, setAssembled] = useState(false)
  const symbolRef = useRef<HTMLDivElement>(null)

  const solvedCount = Object.values(fragments).filter(Boolean).length

  const solveFragment = useCallback((key: keyof FragmentState) => {
    setFragments(prev => {
      const next = { ...prev, [key]: true }
      const allSolved = Object.values(next).every(Boolean)
      if (allSolved) {
        setTimeout(() => {
          setAssembling(true)
          setActivePuzzle(null)
          // Assembly animation
          setTimeout(() => {
            if (symbolRef.current) {
              const pieces = symbolRef.current.querySelectorAll(`.${styles.symbolPiece}`)
              gsap.fromTo(pieces, 
                { scale: 0.3, opacity: 0, rotation: 45 },
                { scale: 1, opacity: 1, rotation: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)',
                  onComplete: () => {
                    setAssembled(true)
                    setTimeout(onSolved, 2000)
                  }
                }
              )
            }
          }, 500)
        }, 800)
      }
      return next
    })
    setActivePuzzle(null)
  }, [onSolved])

  return (
    <div className={styles.symbolContainer}>
      {/* Central symbol display */}
      <div ref={symbolRef} className={styles.symbolDisplay}>
        <div className={`${styles.symbolPiece} ${styles.symbolTL} ${fragments.binary ? styles.symbolRevealed : ''}`}>
          <svg viewBox="0 0 100 100" width="100" height="100">
            <path d="M50 5 L95 50 L50 50 Z" fill={fragments.binary ? '#b8862a' : '#1a1510'} stroke="#3a3020" strokeWidth="2" />
          </svg>
        </div>
        <div className={`${styles.symbolPiece} ${styles.symbolTR} ${fragments.packet ? styles.symbolRevealed : ''}`}>
          <svg viewBox="0 0 100 100" width="100" height="100">
            <path d="M50 5 L50 50 L5 50 Z" fill={fragments.packet ? '#b8862a' : '#1a1510'} stroke="#3a3020" strokeWidth="2" />
          </svg>
        </div>
        <div className={`${styles.symbolPiece} ${styles.symbolBL} ${fragments.image ? styles.symbolRevealed : ''}`}>
          <svg viewBox="0 0 100 100" width="100" height="100">
            <path d="M50 95 L5 50 L50 50 Z" fill={fragments.image ? '#b8862a' : '#1a1510'} stroke="#3a3020" strokeWidth="2" />
          </svg>
        </div>
        <div className={`${styles.symbolPiece} ${styles.symbolBR} ${fragments.cipher ? styles.symbolRevealed : ''}`}>
          <svg viewBox="0 0 100 100" width="100" height="100">
            <path d="M50 95 L50 50 L95 50 Z" fill={fragments.cipher ? '#b8862a' : '#1a1510'} stroke="#3a3020" strokeWidth="2" />
          </svg>
        </div>
        {assembled && (
          <div className={styles.symbolGlow} />
        )}
      </div>

      <p className={styles.symbolProgress}>{solvedCount}/4 FRAGMENTS RECOVERED</p>

      {/* Puzzle selector grid */}
      {!assembling && !activePuzzle && (
        <div className={styles.miniPuzzleGrid}>
          <button
            className={`${styles.miniPuzzleBtn} ${fragments.binary ? styles.miniPuzzleSolved : ''}`}
            onClick={() => !fragments.binary && setActivePuzzle('binary')}
            disabled={fragments.binary}
          >
            <span className={styles.miniPuzzleIcon}>01</span>
            <span>MATRIX PARITY</span>
            {fragments.binary && <span className={styles.solvedBadge}>✓</span>}
          </button>
          <button
            className={`${styles.miniPuzzleBtn} ${fragments.packet ? styles.miniPuzzleSolved : ''}`}
            onClick={() => !fragments.packet && setActivePuzzle('packet')}
            disabled={fragments.packet}
          >
            <span className={styles.miniPuzzleIcon}>[IP]</span>
            <span>PACKET DECODER</span>
            {fragments.packet && <span className={styles.solvedBadge}>✓</span>}
          </button>
          <button
            className={`${styles.miniPuzzleBtn} ${fragments.image ? styles.miniPuzzleSolved : ''}`}
            onClick={() => !fragments.image && setActivePuzzle('image')}
            disabled={fragments.image}
          >
            <span className={styles.miniPuzzleIcon}>⊦</span>
            <span>DIAGNOSTIC CIRCUIT</span>
            {fragments.image && <span className={styles.solvedBadge}>✓</span>}
          </button>
          <button
            className={`${styles.miniPuzzleBtn} ${fragments.cipher ? styles.miniPuzzleSolved : ''}`}
            onClick={() => !fragments.cipher && setActivePuzzle('cipher')}
            disabled={fragments.cipher}
          >
            <span className={styles.miniPuzzleIcon}>⊗</span>
            <span>VIGENERE DECRYPT</span>
            {fragments.cipher && <span className={styles.solvedBadge}>✓</span>}
          </button>
        </div>
      )}

      {/* Active puzzles */}
      {activePuzzle === 'binary' && (
        <BinaryPuzzle onSolved={() => solveFragment('binary')} onBack={() => setActivePuzzle(null)} />
      )}
      {activePuzzle === 'packet' && (
        <PacketPuzzle onSolved={() => solveFragment('packet')} onBack={() => setActivePuzzle(null)} />
      )}
      {activePuzzle === 'image' && (
        <ImageDecodePuzzle onSolved={() => solveFragment('image')} onBack={() => setActivePuzzle(null)} />
      )}
      {activePuzzle === 'cipher' && (
        <CipherPuzzle onSolved={() => solveFragment('cipher')} onBack={() => setActivePuzzle(null)} packetSolved={fragments.packet} />
      )}

      {/* Assembly / completion */}
      {assembling && !assembled && (
        <div className={styles.assemblingText}>
          <p>ASSEMBLING SYMBOL...</p>
        </div>
      )}
      {assembled && (
        <div className={styles.symbolComplete}>
          <p>&gt; SYMBOL CLASSIFICATION: NEXUS</p>
          <p>&gt; &quot;It isn&apos;t spreading. It&apos;s _______.&quot;</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════ BINARY PUZZLE ═══════════════ */
function BinaryPuzzle({ onSolved, onBack }: { onSolved: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState(false)

  function toggleCell(row: number, col: number) {
    const key = `${row}-${col}`
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function verify() {
    let correct = true
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const key = `${r}-${c}`
        const shouldBe1 = BINARY_GRID[r][c] === 1
        const isSelected = selected.has(key)
        if (shouldBe1 !== isSelected) { correct = false; break }
      }
      if (!correct) break
    }
    if (correct) {
      onSolved()
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 600)
    }
  }

  return (
    <div className={`${styles.miniPuzzlePanel} ${wrong ? styles.miniPuzzleWrong : ''}`}>
      <div className={styles.miniPuzzleHeader}>
        <button onClick={onBack} className={styles.backBtn}>← BACK</button>
        <h4>MATRIX PARITY PUZZLE</h4>
      </div>
      <p className={styles.miniPuzzleDesc}>
        <strong>ANALYST JOURNAL — ENTRY #12:</strong> &quot;The black symbol has corrupted the core registry matrix. The parity bits are misaligned. Based on other PROJECT NULL cases, we can stabilize the matrix using the mathematical laws of the symbol. Configure the safety register values to restore the sector integrity.&quot;
      </p>
      <div style={{ background: '#0a0a08', border: '1px dashed #3a3020', padding: '0.6rem', fontSize: '0.65rem', color: '#8a8070', marginBottom: '1rem', lineHeight: '1.4', textAlign: 'left' }}>
        <strong>Stabilization Matrix Bounds:</strong>
        <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
          <li>Rows 1 and 5 must have an <strong>odd</strong> number of 1s; Rows 2, 3, and 4 must be <strong>even</strong>.</li>
          <li>Columns 2 and 4 must have an <strong>odd</strong> number of 1s; Columns 1, 3, and 5 must be <strong>even</strong>.</li>
          <li>Exactly 12 cells must be activated.</li>
          <li>Memory cells at index (2,2) and (3,3) must remain 0 (OFF).</li>
        </ul>
      </div>
      <div className={styles.binaryGrid}>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className={styles.binaryRow}>
            {Array.from({ length: 5 }).map((_, c) => {
              const key = `${r}-${c}`
              return (
                <button
                  key={key}
                  className={`${styles.binaryCell} ${selected.has(key) ? styles.binaryCellSelected : ''}`}
                  onClick={() => toggleCell(r, c)}
                >
                  {selected.has(key) ? '1' : '0'}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      
      <button onClick={verify} className={styles.verifyBtn} style={{ margin: '1rem 0 0 0' }}>VERIFY PARITY</button>
    </div>
  )
}

/* ═══════════════ PACKET DECODER PUZZLE ═══════════════ */
function PacketPuzzle({ onSolved, onBack }: { onSolved: () => void; onBack: () => void }) {
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    const timer = setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toUpperCase() === PACKET_ANSWER) {
      onSolved()
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 800)
    }
  }

  return (
    <div className={`${styles.miniPuzzlePanel} ${wrong ? styles.miniPuzzleWrong : ''}`}>
      <div className={styles.miniPuzzleHeader}>
        <button onClick={onBack} className={styles.backBtn}>← BACK</button>
        <h4>NETWORK PACKET DECODER</h4>
      </div>
      <p className={styles.miniPuzzleDesc}>
        <strong>COMMUNICATIONS INTERCEPT:</strong> &quot;The main terminal intercepted a raw binary frame from the containment sector. Use the protocol frame architecture to decode the payload bytes into ASCII characters to extract the decryption key.&quot;
      </p>

      {/* Frame Table */}
      <div style={{ background: '#0a0a08', border: '1px solid #3a3020', padding: '0.8rem', fontSize: '0.65rem', color: '#8a8070', marginBottom: '1rem', lineHeight: '1.5', textAlign: 'left' }}>
        <strong>IP Header Structure Reference Table:</strong>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.4rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #3a3020' }}>
              <th style={{ textAlign: 'left', padding: '0.2rem' }}>Byte Offset</th>
              <th style={{ textAlign: 'left', padding: '0.2rem' }}>Field Name</th>
              <th style={{ textAlign: 'left', padding: '0.2rem' }}>Format</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.2rem' }}>1</td>
              <td style={{ padding: '0.2rem' }}>Version & IHL</td>
              <td style={{ padding: '0.2rem' }}>Hex (e.g. 45 = IPv4, 20 bytes)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.2rem' }}>3-4</td>
              <td style={{ padding: '0.2rem' }}>Total Length</td>
              <td style={{ padding: '0.2rem' }}>16-bit Integer (Octets)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.2rem' }}>10</td>
              <td style={{ padding: '0.2rem' }}>Protocol ID</td>
              <td style={{ padding: '0.2rem' }}>8-bit Hex (e.g., 11 = UDP, 06 = TCP)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.2rem' }}>13-16</td>
              <td style={{ padding: '0.2rem' }}>Source IP Address</td>
              <td style={{ padding: '0.2rem' }}>32-bit Address (4 octets)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.2rem' }}>21+</td>
              <td style={{ padding: '0.2rem' }}>Payload Data</td>
              <td style={{ padding: '0.2rem' }}>Hex representation of ASCII string</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.morseDisplay} style={{ padding: '1rem', background: '#020202', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '1rem', fontFamily: 'var(--font-mono, monospace)', border: '1px dashed #3a3020' }}>
        <strong>RAW FRAME HEX DUMP:</strong><br />
        <span style={{ color: '#e8c060', fontSize: '0.9rem', display: 'block', marginTop: '0.5rem' }}>{PACKET_HEX}</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter payload string (ASCII)..."
          autoComplete="off"
          spellCheck={false}
          style={{
            width: '100%',
            background: '#050505',
            border: '1px solid #3a3020',
            color: '#e8c060',
            padding: '0.7rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.8rem',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            background: 'var(--accent-gold)',
            border: 'none',
            color: '#1a1205',
            padding: '0.7rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          DECODE PAYLOAD
        </button>
      </form>
    </div>
  )
}

/* ═══════════════ LOGIC GATE CIRCUIT PUZZLE ═══════════════ */
function ImageDecodePuzzle({ onSolved, onBack }: { onSolved: () => void; onBack: () => void }) {
  const [a, setA] = useState(false)
  const [b, setB] = useState(false)
  const [c, setC] = useState(false)
  const [d, setD] = useState(false)
  const [eVal, setEVal] = useState(false)
  const [f, setF] = useState(false)
  const [g, setG] = useState(false)
  const [h, setH] = useState(false)
  const [wrong, setWrong] = useState(false)

  // Calculations
  const g1 = a && !b // AND-NOT
  const g2 = c !== d // XOR
  const g3 = eVal || f // OR
  const g4 = !(g && h) // NAND
  const s1 = g1 && g2 // AND
  const s2 = g3 && g4 // AND
  const output = s1 && s2 // AND

  const activeCount = [a, b, c, d, eVal, f, g, h].filter(Boolean).length
  const isCorrect = output === true && activeCount === 4 && a && !b && f && !h

  function verify() {
    if (isCorrect) {
      onSolved()
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 600)
    }
  }

  return (
    <div className={`${styles.miniPuzzlePanel} ${wrong ? styles.miniPuzzleWrong : ''}`}>
      <div className={styles.miniPuzzleHeader}>
        <button onClick={onBack} className={styles.backBtn}>← BACK</button>
        <h4>COMBINATIONAL LOCK CIRCUIT</h4>
      </div>
      <p className={styles.miniPuzzleDesc}>
        <strong>MAINTENANCE MANUAL — BREAKER BLOCK:</strong> &quot;The main facility backup power is locked behind a combinational logic gate circuit. The switches control power routers (A to H). Route current to the output node under the safety constraints to decouple the grid.&quot;
      </p>

      {/* Logic Gates Diagram / Panel */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid #3a3020',
        padding: '1.2rem 1rem',
        borderRadius: '4px',
        margin: '1rem 0',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.65rem',
        textAlign: 'left'
      }}>
        {/* Toggle Switches */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button type="button" onClick={() => setA(p => !p)} className={`${styles.binaryCell} ${a ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>A: {a ? '1' : '0'}</button>
          <button type="button" onClick={() => setB(p => !p)} className={`${styles.binaryCell} ${b ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>B: {b ? '1' : '0'}</button>
          <button type="button" onClick={() => setC(p => !p)} className={`${styles.binaryCell} ${c ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>C: {c ? '1' : '0'}</button>
          <button type="button" onClick={() => setD(p => !p)} className={`${styles.binaryCell} ${d ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>D: {d ? '1' : '0'}</button>
          <button type="button" onClick={() => setEVal(p => !p)} className={`${styles.binaryCell} ${eVal ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>E: {eVal ? '1' : '0'}</button>
          <button type="button" onClick={() => setF(p => !p)} className={`${styles.binaryCell} ${f ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>F: {f ? '1' : '0'}</button>
          <button type="button" onClick={() => setG(p => !p)} className={`${styles.binaryCell} ${g ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>G: {g ? '1' : '0'}</button>
          <button type="button" onClick={() => setH(p => !p)} className={`${styles.binaryCell} ${h ? styles.binaryCellSelected : ''}`} style={{ width: '100%', height: '36px', border: '1px solid #3a3020' }}>H: {h ? '1' : '0'}</button>
        </div>

        {/* Logic Gates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #222', paddingTop: '0.8rem', color: '#8a8070' }}>
          <p>&gt; GATE 1 (A AND NOT B) = <span style={{ color: g1 ? '#4aff4a' : '#ff4444' }}>{g1 ? '1 (HIGH)' : '0 (LOW)'}</span></p>
          <p>&gt; GATE 2 (C XOR D) = <span style={{ color: g2 ? '#4aff4a' : '#ff4444' }}>{g2 ? '1 (HIGH)' : '0 (LOW)'}</span></p>
          <p>&gt; GATE 3 (E OR F) = <span style={{ color: g3 ? '#4aff4a' : '#ff4444' }}>{g3 ? '1 (HIGH)' : '0 (LOW)'}</span></p>
          <p>&gt; GATE 4 (G NAND H) = <span style={{ color: g4 ? '#4aff4a' : '#ff4444' }}>{g4 ? '1 (HIGH)' : '0 (LOW)'}</span></p>
          <p>&gt; SUB-STAGE 1 (GATE 1 AND GATE 2) = <span style={{ color: s1 ? '#4aff4a' : '#ff4444' }}>{s1 ? '1 (HIGH)' : '0 (LOW)'}</span></p>
          <p>&gt; SUB-STAGE 2 (GATE 3 AND GATE 4) = <span style={{ color: s2 ? '#4aff4a' : '#ff4444' }}>{s2 ? '1 (HIGH)' : '0 (LOW)'}</span></p>
          <p>&gt; OUTPUT (SUB-STAGE 1 AND SUB-STAGE 2) = <span style={{ color: output ? '#4aff4a' : '#ff4444', fontWeight: 'bold' }}>{output ? 'ACTIVE' : 'INACTIVE'}</span></p>
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', color: '#8a8070', marginBottom: '1.2rem', padding: '0 0.5rem', lineHeight: '1.4', textAlign: 'left' }}>
        <p><strong>CONSTRAINTS:</strong></p>
        <p>1. Exactly four switches must be ON.</p>
        <p>2. Switch A must be ON.</p>
        <p>3. Switch B must be OFF.</p>
        <p>4. Switch F must be ON.</p>
        <p>5. Switch H must be OFF.</p>
      </div>

      <button onClick={verify} className={styles.verifyBtn}>VERIFY OVERRIDE</button>
    </div>
  )
}

/* ═══════════════ CIPHER PUZZLE ═══════════════ */
function CipherPuzzle({ onSolved, onBack, packetSolved }: { onSolved: () => void; onBack: () => void; packetSolved: boolean }) {
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!packetSolved) return
    if (input.trim().toUpperCase() === CIPHER_ANSWER) {
      onSolved()
    } else {
      setWrong(true)
      setTimeout(() => setWrong(false), 600)
    }
  }

  return (
    <div className={`${styles.miniPuzzlePanel} ${wrong ? styles.miniPuzzleWrong : ''}`}>
      <div className={styles.miniPuzzleHeader}>
        <button onClick={onBack} className={styles.backBtn}>← BACK</button>
        <h4>VIGENERE DECRYPTION</h4>
      </div>
      <p className={styles.miniPuzzleDesc}>
        <strong>SECURE INTELLIGENCE MEMO (REDACTED):</strong> &quot;The final autopsy and medical classification files were encrypted using a Vigenère cipher. Decrypt the ciphertext <code>{CIPHER_TEXT}</code> using the key derived from the packet analyzer (Switch 2) on the decryption tool at <a href="https://cs-crypt.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">cs-crypt.vercel.app</a> to reveal the true nature of the parasitic organism.&quot;
      </p>
      <div className={styles.cipherDisplay} style={{ marginBottom: '1rem' }}>
        <div className={styles.cipherRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className={styles.cipherLabel} style={{ color: '#8a8070' }}>CIPHERTEXT:</span>
          <code style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold', letterSpacing: '0.05em' }}>{CIPHER_TEXT}</code>
        </div>
        <div className={styles.cipherRow} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className={styles.cipherLabel} style={{ color: '#8a8070' }}>DECRYPTION KEY:</span>
          <code style={{ fontSize: '1rem', color: packetSolved ? '#4aff4a' : '#ff4444', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            {packetSolved ? 'SHIELD' : 'LOCKED (DECRYPT PACKET)'}
          </code>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={input}
          disabled={!packetSolved}
          onChange={e => setInput(e.target.value)}
          placeholder={packetSolved ? "Decoded word..." : "Locked: Decode Network Packet first"}
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          style={{
            width: '100%',
            background: '#050505',
            border: '1px solid #3a3020',
            color: packetSolved ? '#e8c060' : '#444',
            padding: '0.7rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.8rem',
            boxSizing: 'border-box',
            outline: 'none',
            cursor: packetSolved ? 'text' : 'not-allowed'
          }}
        />
        <button
          type="submit"
          disabled={!packetSolved}
          style={{
            width: '100%',
            background: packetSolved ? 'var(--accent-gold)' : '#1a1a1a',
            border: 'none',
            color: packetSolved ? '#1a1205' : '#555',
            padding: '0.7rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: packetSolved ? 'pointer' : 'not-allowed',
          }}
        >
          DECODE SIGNATURE
        </button>
      </form>
    </div>
  )
}


