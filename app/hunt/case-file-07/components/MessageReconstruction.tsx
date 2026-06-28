'use client'

import { useState, useRef, useEffect } from 'react'
import { sounds } from '@/app/hunt/case-file-07/utils/SoundEffects'
import styles from '../operation-deadlight.module.css'

type SubPuzzle = 'registry' | 'polyhedron' | 'splicer'

export function MessageReconstruction({ onSolved }: { onSolved: () => void }) {
  const [currentPuzzle, setCurrentPuzzle] = useState<SubPuzzle>('registry')
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<SubPuzzle>>(new Set())
  const [revealLines, setRevealLines] = useState<string[]>([])
  const [allDone, setAllDone] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (revealLines.length > 0) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [revealLines])

  function completePuzzle(puzzle: SubPuzzle) {
    setCompletedPuzzles(prev => {
      const next = new Set(prev)
      next.add(puzzle)

      if (puzzle === 'registry') setCurrentPuzzle('polyhedron')
      else if (puzzle === 'polyhedron') setCurrentPuzzle('splicer')
      else if (puzzle === 'splicer') {
        setTimeout(async () => {
          const lines = [
            '> FULL MESSAGE RECONSTRUCTED:',
            '',
            '"The fragment was never lost. It chose its host.',
            ' The organism exists to carry what cannot be contained.',
            ' When you find it — and you will — understand this:',
            ' The fragment is not the end.',
            '',
            ' It is waiting.',
            '',
            ' —  K."',
            '',
            '> TRANSMISSION AUTHOR: LEON S. KENNEDY',
            '> SIGNATURE INITIAL: K',
            '> AETHERION ANCHOR HARMONICS STABILIZED.',
          ]
          for (let i = 0; i < lines.length; i++) {
            await new Promise(r => setTimeout(r, 300))
            setRevealLines(prev => [...prev, lines[i]])
          }
          setAllDone(true)
          setTimeout(onSolved, 3000)
        }, 500)
      }
      return next
    })
  }

  if (revealLines.length > 0) {
    return (
      <div className={styles.crtTerminal}>
        <div className={styles.crtScanlines} />
        <div className={styles.terminalOutput}>
          {revealLines.map((line, i) => (
            <p key={i} className={line.includes('AETHERION') ? styles.tracingHighlight : ''}>
              {line || '\u00A0'}
            </p>
          ))}
          {allDone && (
            <p className={styles.alertCleared} style={{ color: 'var(--terminal-green)', fontSize: '1.2rem', marginTop: '1.5rem', animation: 'blink 1s steps(2) infinite' }}>
              &gt; AETHERION RECOVERY KEY READY
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.messageContainer}>
      {/* Diagnostics Grid status */}
      <div className={styles.corruptionBlock} style={{ marginBottom: '1.5rem', border: '1px solid #331111', padding: '1rem', background: '#0a0505' }}>
        {completedPuzzles.has('registry') ? (
          <p style={{ color: 'var(--terminal-green)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', margin: '0.2rem 0' }}>✓ SUB-GRID 1: CHRONO-REGISTRY LOGIC VERIFIED</p>
        ) : (
          <p style={{ color: 'var(--warning-red)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', margin: '0.2rem 0', animation: 'pulse 2s infinite' }}>[UNSTABLE] SUB-GRID 1: REGISTRY LOG DATA CORRUPTED</p>
        )}
        {completedPuzzles.has('polyhedron') ? (
          <p style={{ color: 'var(--terminal-green)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', margin: '0.2rem 0' }}>✓ SUB-GRID 2: 3D DODECAHEDRAL LOOP CLOSED</p>
        ) : (
          <p style={{ color: 'var(--warning-red)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', margin: '0.2rem 0' }}>[LOCKED] SUB-GRID 2: 3D ENCRYPTION CIRCUIT SEVERED</p>
        )}
        {completedPuzzles.has('splicer') ? (
          <p style={{ color: 'var(--terminal-green)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', margin: '0.2rem 0' }}>✓ SUB-GRID 3: OPTICAL SLIDING CORE BYPASSED</p>
        ) : (
          <p style={{ color: 'var(--warning-red)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', margin: '0.2rem 0' }}>[STANDBY] SUB-GRID 3: REFRACTIVE LASER PATH GRIDLOCKED</p>
        )}
      </div>

      {/* Sub-puzzles */}
      {currentPuzzle === 'registry' && !completedPuzzles.has('registry') && (
        <ChronoRegistryLogicGrid onSolved={() => completePuzzle('registry')} />
      )}
      {currentPuzzle === 'polyhedron' && !completedPuzzles.has('polyhedron') && (
        <DodecahedronPathRouter onSolved={() => completePuzzle('polyhedron')} />
      )}
      {currentPuzzle === 'splicer' && !completedPuzzles.has('splicer') && (
        <LaserSlidingKlotski onSolved={() => completePuzzle('splicer')} />
      )}
    </div>
  )
}

/* ═══════════════ SUB-PUZZLE 1: CHRONO-REGISTRY LOGIC GRID ═══════════════ */
interface SectorState {
  researcher: string
  strain: string
  keycard: string
  offset: string
}

const INITIAL_SECTORS: SectorState[] = Array.from({ length: 5 }, () => ({
  researcher: '',
  strain: '',
  keycard: '',
  offset: ''
}))

const CLUES = [
  "The researcher with the Blue keycard is in Sector 3.",
  "Wesker is stationed in Sector 1.",
  "The sector with the Green keycard is immediately to the left of the sector with Las Plagas.",
  "Ada is the holder of the Red keycard.",
  "The Uroboros strain is quarantined in Sector 5.",
  "The T-Virus strain is stored in Wesker's sector.",
  "The G-Virus is stored in the sector requiring the Yellow keycard.",
  "Claire's sector is immediately to the right of the sector containing T-Veronica.",
  "Leon is in the sector mapped to the Purple keycard.",
  "The sector operating with a -2h temporal offset uses the Green keycard.",
  "The sector operating with a 0h temporal offset is Sector 3.",
  "Sherry's sector has a lower index than Claire's sector.",
  "The sector with a +1h offset is immediately to the left of Leon's sector.",
  "The sector with the G-Virus has a +1h temporal offset.",
  "The Las Plagas parasite sector runs with a -1h offset.",
  "Agent Leon S. Kennedy is stationed in Sector 5.",
  "Sector 1 operates with a -2h temporal offset.",
  "The T-Veronica virus strain is located in Sector 3.",
  "Ada Wong is assigned to Sector 2 with the Red keycard.",
  "Sherry Birkin is assigned to Sector 3 with the Blue keycard.",
  "Claire Redfield is assigned to Sector 4 with the Yellow keycard."
]

function ChronoRegistryLogicGrid({ onSolved }: { onSolved: () => void }) {
  const [sectors, setSectors] = useState<SectorState[]>(INITIAL_SECTORS)
  const [checkedClues, setCheckedClues] = useState<boolean[]>(Array(CLUES.length).fill(false))
  const [wrong, setWrong] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (sectorIdx: number, field: keyof SectorState, value: string) => {
    sounds.playClick()
    setSectors(prev => {
      const next = [...prev]
      next[sectorIdx] = { ...next[sectorIdx], [field]: value }
      return next
    })
  }

  const toggleClue = (idx: number) => {
    sounds.playClick()
    setCheckedClues(prev => {
      const next = [...prev]
      next[idx] = !next[idx]
      return next
    })
  }

  const verify = () => {
    const solution = [
      { researcher: 'Wesker', strain: 'T-Virus', keycard: 'Green', offset: '-2h' },
      { researcher: 'Ada', strain: 'Las Plagas', keycard: 'Red', offset: '-1h' },
      { researcher: 'Sherry', strain: 'T-Veronica', keycard: 'Blue', offset: '0h' },
      { researcher: 'Claire', strain: 'G-Virus', keycard: 'Yellow', offset: '+1h' },
      { researcher: 'Leon', strain: 'Uroboros', keycard: 'Purple', offset: '+2h' }
    ]

    const isCorrect = sectors.every((s, idx) => 
      s.researcher === solution[idx].researcher &&
      s.strain === solution[idx].strain &&
      s.keycard === solution[idx].keycard &&
      s.offset === solution[idx].offset
    )

    if (isCorrect) {
      setSuccess(true)
      sounds.playSuccess()
      setTimeout(onSolved, 1800)
    } else {
      sounds.playError()
      setWrong(true)
      setTimeout(() => setWrong(false), 800)
    }
  }

  return (
    <div className={`${styles.miniPuzzlePanel} ${wrong ? styles.miniPuzzleWrong : ''}`} style={{ maxWidth: '780px', margin: '0 auto' }}>
      <h4>STAGE A: TEMPORAL REGISTRY DECODER</h4>
      <p className={styles.miniPuzzleDesc} style={{ marginBottom: '1.2rem' }}>
        <strong>CLASSIFIED FACILITY LOGS:</strong> Leon encrypted the final registry logs using a logic matrix. Cross-reference the 18 intercepted clues below to reconstruct the exact alignment of researchers, keycards, viruses, and temporal offsets.
      </p>

      {/* Narrative Backstory Dossier */}
      <div style={{ background: 'rgba(25, 12, 6, 0.35)', border: '1px solid #5c352a', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.75rem', lineHeight: '1.6', color: '#a09584', textAlign: 'left' }}>
        <h5 style={{ color: 'var(--accent-gold)', marginBottom: '0.6rem', textTransform: 'uppercase', font: '700 0.8rem var(--font-mono, monospace)', letterSpacing: '0.05em' }}>
          📁 INCIDENT SUMMARY: SITE KENNEDY QUARANTINE PROTOCOL
        </h5>
        <p>
          Before Site Kennedy went completely dark, Agent Leon S. Kennedy initialized the Chrono-Registry lockdown protocol. To prevent unauthorized extraction of the Aetherion fragment, the facility was split into five separate temporal containment sectors (Sectors 1 to 5). Five distinct researchers were assigned five colored security keycards to protect five isolated biological strains across shifted time offsets.
        </p>
        <p style={{ marginTop: '0.6rem' }}>
          Below are the fragmented security logs and audio log transcripts decrypted from the facility's black box. Use these logs to reconstruct the full grid mapping.
        </p>
      </div>

      {/* Grid Matrix Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} style={{ background: '#070505', border: '1px solid #331111', padding: '0.6rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <span style={{ font: '700 0.75rem var(--font-mono, monospace)', color: 'var(--accent-gold)', display: 'block', textAlign: 'center', borderBottom: '1px solid #221111', paddingBottom: '0.3rem' }}>
              SECTOR {idx + 1}
            </span>

            {/* Researcher */}
            <div>
              <label style={{ font: '700 0.55rem monospace', color: '#888', display: 'block', marginBottom: '0.15rem', letterSpacing: '0.05em' }}>RESEARCHER</label>
              <select
                value={sectors[idx].researcher}
                onChange={e => handleChange(idx, 'researcher', e.target.value)}
                style={{ width: '100%', background: '#020202', border: '1px solid #442211', color: sectors[idx].researcher ? '#fff' : '#888', fontSize: '0.7rem', padding: '0.35rem 0.25rem', outline: 'none', fontFamily: 'monospace' }}
              >
                <option value="">[Select]</option>
                <option value="Ada">Ada</option>
                <option value="Claire">Claire</option>
                <option value="Leon">Leon</option>
                <option value="Sherry">Sherry</option>
                <option value="Wesker">Wesker</option>
              </select>
            </div>

            {/* Virus Strain */}
            <div>
              <label style={{ font: '700 0.55rem monospace', color: '#888', display: 'block', marginBottom: '0.15rem', letterSpacing: '0.05em' }}>VIRUS STRAIN</label>
              <select
                value={sectors[idx].strain}
                onChange={e => handleChange(idx, 'strain', e.target.value)}
                style={{ width: '100%', background: '#020202', border: '1px solid #442211', color: sectors[idx].strain ? '#fff' : '#888', fontSize: '0.7rem', padding: '0.35rem 0.25rem', outline: 'none', fontFamily: 'monospace' }}
              >
                <option value="">[Select]</option>
                <option value="G-Virus">G-Virus</option>
                <option value="Las Plagas">Las Plagas</option>
                <option value="T-Virus">T-Virus</option>
                <option value="T-Veronica">T-Veronica</option>
                <option value="Uroboros">Uroboros</option>
              </select>
            </div>

            {/* Keycard Color */}
            <div>
              <label style={{ font: '700 0.55rem monospace', color: '#888', display: 'block', marginBottom: '0.15rem', letterSpacing: '0.05em' }}>KEYCARD</label>
              <select
                value={sectors[idx].keycard}
                onChange={e => handleChange(idx, 'keycard', e.target.value)}
                style={{ width: '100%', background: '#020202', border: '1px solid #442211', color: sectors[idx].keycard ? '#fff' : '#888', fontSize: '0.7rem', padding: '0.35rem 0.25rem', outline: 'none', fontFamily: 'monospace' }}
              >
                <option value="">[Select]</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Purple">Purple</option>
                <option value="Red">Red</option>
                <option value="Yellow">Yellow</option>
              </select>
            </div>

            {/* Temporal Offset */}
            <div>
              <label style={{ font: '700 0.55rem monospace', color: '#888', display: 'block', marginBottom: '0.15rem', letterSpacing: '0.05em' }}>OFFSET</label>
              <select
                value={sectors[idx].offset}
                onChange={e => handleChange(idx, 'offset', e.target.value)}
                style={{ width: '100%', background: '#020202', border: '1px solid #442211', color: sectors[idx].offset ? '#fff' : '#888', fontSize: '0.7rem', padding: '0.35rem 0.25rem', outline: 'none', fontFamily: 'monospace' }}
              >
                <option value="">[Select]</option>
                <option value="-2h">-2h</option>
                <option value="-1h">-1h</option>
                <option value="0h">0h</option>
                <option value="+1h">+1h</option>
                <option value="+2h">+2h</option>
              </select>
            </div>

          </div>
        ))}
      </div>

      {/* Clues Ledger */}
      <div style={{ background: '#050303', border: '1px solid #221111', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'left' }}>
        <p style={{ font: '700 0.8rem var(--font-mono, monospace)', color: 'var(--accent-gold)', marginBottom: '0.8rem', letterSpacing: '0.1em', borderBottom: '1px solid #221111', paddingBottom: '0.4rem' }}>
          📜 SYSTEM INTERCEPT LOG CLUES:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.4rem' }}>
          {CLUES.map((clue, idx) => (
            <label key={idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)', cursor: 'pointer', color: checkedClues[idx] ? '#444' : '#a09584', textDecoration: checkedClues[idx] ? 'line-through' : 'none', padding: '0.1rem 0' }}>
              <input type="checkbox" checked={checkedClues[idx]} onChange={() => toggleClue(idx)} style={{ marginTop: '3px', accentColor: 'var(--accent-gold)' }} />
              <span>{clue}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={verify}
          disabled={success}
          style={{ flex: 1, background: success ? '#152b15' : 'var(--accent-gold)', border: 'none', color: success ? '#4aff4a' : '#1a1205', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold', cursor: success ? 'default' : 'pointer', borderRadius: '3px' }}
        >
          {success ? '✓ REGISTRY SOLVED' : 'VERIFY REGISTRY'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════ SUB-PUZZLE 2: 3D WIREFRAME DODECAHEDRON ═══════════════ */
type Point3D = { x: number; y: number; z: number }

function DodecahedronPathRouter({ onSolved }: { onSolved: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [path, setPath] = useState<number[]>([0]) // starts at 0
  const [success, setSuccess] = useState(false)
  const [wrong, setWrong] = useState(false)

  const phi = 1.618
  const iphi = 0.618
  const scale = 40

  const vertices: Point3D[] = [
    { x: -scale, y: -scale, z: -scale }, // 0
    { x:  scale, y: -scale, z: -scale }, // 1
    { x:  scale, y:  scale, z: -scale }, // 2
    { x: -scale, y:  scale, z: -scale }, // 3
    { x: -scale, y: -scale, z:  scale }, // 4
    { x:  scale, y: -scale, z:  scale }, // 5
    { x:  scale, y:  scale, z:  scale }, // 6
    { x: -scale, y:  scale, z:  scale }, // 7
    { x: 0, y: -scale * iphi, z: -scale * phi }, // 8
    { x: 0, y:  scale * iphi, z: -scale * phi }, // 9
    { x: 0, y: -scale * iphi, z:  scale * phi }, // 10
    { x: 0, y:  scale * iphi, z:  scale * phi }, // 11
    { x: -scale * iphi, y: -scale * phi, z: 0 }, // 12
    { x:  scale * iphi, y: -scale * phi, z: 0 }, // 13
    { x:  scale * iphi, y:  scale * phi, z: 0 }, // 14
    { x: -scale * iphi, y:  scale * phi, z: 0 }, // 15
    { x: -scale * phi, y: 0, z: -scale * iphi }, // 16
    { x:  scale * phi, y: 0, z: -scale * iphi }, // 17
    { x:  scale * phi, y: 0, z:  scale * iphi }, // 18
    { x: -scale * phi, y: 0, z:  scale * iphi }, // 19
  ]

  const adj: { [key: number]: number[] } = {
    0: [8, 12, 16],
    1: [8, 13, 17],
    2: [9, 14, 17],
    3: [9, 15, 16],
    4: [10, 12, 19],
    5: [10, 13, 18],
    6: [11, 14, 18],
    7: [11, 15, 19],
    8: [0, 1, 9],
    9: [2, 3, 8],
    10: [4, 5, 11],
    11: [6, 7, 10],
    12: [0, 4, 13],
    13: [1, 5, 12],
    14: [2, 6, 15],
    15: [3, 7, 14],
    16: [0, 3, 19],
    17: [1, 2, 18],
    18: [5, 6, 17],
    19: [4, 7, 16]
  }

  const anglesRef = useRef({ currentTheta: 0.8, currentPhi: 0.5 })
  const nodesProjRef = useRef<{ x: number; y: number; id: number }[]>([])
  
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let animationId: number

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      const cosT = Math.cos(anglesRef.current.currentTheta)
      const sinT = Math.sin(anglesRef.current.currentTheta)
      const cosP = Math.cos(anglesRef.current.currentPhi)
      const sinP = Math.sin(anglesRef.current.currentPhi)

      const projected = vertices.map((v, i) => {
        let x1 = v.x * cosT - v.z * sinT
        let z1 = v.x * sinT + v.z * cosT
        let y2 = v.y * cosP - z1 * sinP
        let z2 = v.y * sinP + z1 * cosP

        const dist = 220
        const scaleFactor = dist / (dist + z2)

        return {
          x: cx + x1 * scaleFactor,
          y: cy + y2 * scaleFactor,
          id: i
        }
      })
      nodesProjRef.current = projected

      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(139, 26, 26, 0.25)'
      for (let u = 0; u < 20; u++) {
        adj[u].forEach(v => {
          if (u < v) {
            ctx.beginPath()
            ctx.moveTo(projected[u].x, projected[u].y)
            ctx.lineTo(projected[v].x, projected[v].y)
            ctx.stroke()
          }
        })
      }

      ctx.lineWidth = 3
      ctx.strokeStyle = '#4aff4a'
      ctx.shadowColor = '#4aff4a'
      ctx.shadowBlur = 6
      if (path.length > 1) {
        ctx.beginPath()
        ctx.moveTo(projected[path[0]].x, projected[path[0]].y)
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(projected[path[i]].x, projected[path[i]].y)
        }
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      projected.forEach(node => {
        const isSelected = path.includes(node.id)
        const isCurrent = path[path.length - 1] === node.id

        ctx.beginPath()
        ctx.arc(node.x, node.y, isCurrent ? 6.5 : 4.5, 0, 2 * Math.PI)
        ctx.fillStyle = isCurrent ? '#ffffff' : (isSelected ? '#4aff4a' : '#221111')
        ctx.fill()
        ctx.strokeStyle = isSelected ? '#4aff4a' : '#8b1a1a'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = '#9a8f7c'
        ctx.font = '8px monospace'
        ctx.fillText(node.id.toString(), node.x + 6, node.y - 3)
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [path])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x
      const dy = e.clientY - lastMousePosRef.current.y
      anglesRef.current.currentTheta += dx * 0.007
      anglesRef.current.currentPhi += dy * 0.007
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (success) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedNode = nodesProjRef.current.find(node => {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)
      return dist <= 13
    })

    if (clickedNode !== undefined) {
      const nodeId = clickedNode.id
      const lastNode = path[path.length - 1]

      if (adj[lastNode].includes(nodeId)) {
        if (path.includes(nodeId)) {
          sounds.playError()
          setWrong(true)
          setTimeout(() => setWrong(false), 500)
        } else {
          sounds.playClick()
          const newPath = [...path, nodeId]
          setPath(newPath)

          if (newPath.length === 20) {
            setSuccess(true)
            sounds.playReveal()
            setTimeout(onSolved, 1500)
          }
        }
      }
    }
  }

  const resetPath = () => {
    sounds.playClick()
    setPath([0])
  }

  return (
    <div className={`${styles.miniPuzzlePanel} ${wrong ? styles.miniPuzzleWrong : ''}`}>
      <h4>STAGE B: 3D DODECAHEDRON LOOP ROUTER</h4>
      <p className={styles.miniPuzzleDesc}>
        <strong>ICOSIAN SYSTEM SECURITY MATRIX:</strong> Click and drag the grid matrix to rotate the dodecahedron. Click adjacent nodes to trace a temporal Hamiltonian path starting at **0** visiting **all 20 nodes exactly once** to bridge the nodes.
      </p>

      <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0.8rem auto' }}>
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClick={handleCanvasClick}
          style={{ display: 'block', background: '#020202', border: '1px dashed #3a1a1a', borderRadius: '4px', cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        />
        {success && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,30,10,0.85)', color: 'var(--terminal-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', font: '700 0.8rem var(--font-mono, monospace)', borderRadius: '4px' }}>
            ICOSIAN CIRCUIT LOOP CLOSED ✓
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: 'var(--font-mono, monospace)', fontSize: '0.65rem', color: '#888' }}>
        <span>PATH ({path.length}/20): {path.join('➔')}</span>
        <button onClick={resetPath} disabled={success} style={{ background: '#3a1a1a', color: '#ffaaaa', border: '1px solid #8b1a1a', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>RESET PATH</button>
      </div>
    </div>
  )
}

/* ═══════════════ SUB-PUZZLE 3: LASER SLIDING KLOTSKI ═══════════════ */
interface BlockItem {
  id: number
  x: number // col offset
  y: number // row offset
  w: number // block width
  h: number // block height
  orientation: 'h' | 'v'
  color: string
  mirror?: { type: '/' | '\\' | 'S'; lx: number; ly: number }
}

const INITIAL_BLOCKS: BlockItem[] = [
  // Block 0: Horizontal 1x2. Solution position is x = 2, y = 2. Has mirror '/' at relative (0,0).
  { id: 0, x: 0, y: 2, w: 2, h: 1, orientation: 'h', color: '#00e5ff', mirror: { type: '/', lx: 0, ly: 0 } },
  // Block 1: Vertical 2x1. Solution position is x = 2, y = 0. Has mirror '\' at relative (0,1).
  { id: 1, x: 2, y: 1, w: 1, h: 2, orientation: 'v', color: '#ff9100', mirror: { type: '\\', lx: 0, ly: 1 } },
  // Block 2: Horizontal 1x2. Solution position is x = 4, y = 1. Has Splitter 'S' at relative (0,0).
  { id: 2, x: 1, y: 1, w: 2, h: 1, orientation: 'h', color: '#ffd600', mirror: { type: 'S', lx: 0, ly: 0 } },
  // Block 3: Vertical 2x1. Solution position is x = 4, y = 3. Has mirror '/' at relative (0,0).
  { id: 3, x: 4, y: 4, w: 1, h: 2, orientation: 'v', color: '#ff1744', mirror: { type: '/', lx: 0, ly: 0 } },
  // Static obstacles for sliding block complexity
  { id: 4, x: 0, y: 4, w: 2, h: 1, orientation: 'h', color: '#332222' },
  { id: 5, x: 5, y: 1, w: 1, h: 2, orientation: 'v', color: '#332222' }
]

function LaserSlidingKlotski({ onSolved }: { onSolved: () => void }) {
  const [blocks, setBlocks] = useState<BlockItem[]>(INITIAL_BLOCKS)
  const [dragState, setDragState] = useState<{ id: number; startMouseX: number; startMouseY: number; startBlockX: number; startBlockY: number } | null>(null)
  
  // Real-time lasers tracking
  const [laserPath, setLaserPath] = useState<{ r: number; c: number }[]>([])
  const [receptorsHit, setReceptorsHit] = useState({ r1: false, r2: false })

  const boardSize = 6
  const cellSize = 42 // in px

  // Trace laser path
  useEffect(() => {
    let r = 2
    let c = 0
    let dir: 'N' | 'S' | 'E' | 'W' = 'E'
    
    // We queue beams to handle the beam splitter S
    const beamsQueue: { r: number; c: number; dir: 'N' | 'S' | 'E' | 'W' }[] = [{ r, c, dir }]
    const fullPath: { r: number; c: number }[] = []
    let hitR1 = false
    let hitR2 = false

    let safetyLimit = 0
    while (beamsQueue.length > 0 && safetyLimit < 50) {
      safetyLimit++
      const currentBeam = beamsQueue.shift()!
      let currR = currentBeam.r
      let currC = currentBeam.c
      let currDir = currentBeam.dir

      let stepLimit = 0
      while (currR >= 0 && currR < boardSize && currC >= 0 && currC < boardSize && stepLimit < 30) {
        stepLimit++
        fullPath.push({ r: currR, c: currC })

        // Check if this cell hits any receptor
        if (currR === 0 && currC === 4) {
          hitR1 = true
        }
        if (currR === 3 && currC === 5) {
          hitR2 = true
        }

        // Find block occupying this cell
        const hitBlock = blocks.find(b => 
          currC >= b.x && currC < b.x + b.w && currR >= b.y && currR < b.y + b.h
        )

        if (hitBlock) {
          const localC = currC - hitBlock.x
          const localR = currR - hitBlock.y

          // Check if block has a mirror/splitter at hit location
          if (hitBlock.mirror && hitBlock.mirror.lx === localC && hitBlock.mirror.ly === localR) {
            const mType = hitBlock.mirror.type
            if (mType === '/') {
              if (currDir === 'E') currDir = 'N'
              else if (currDir === 'W') currDir = 'S'
              else if (currDir === 'N') currDir = 'E'
              else if (currDir === 'S') currDir = 'W'
            } else if (mType === '\\') {
              if (currDir === 'E') currDir = 'S'
              else if (currDir === 'W') currDir = 'N'
              else if (currDir === 'N') currDir = 'W'
              else if (currDir === 'S') currDir = 'E'
            } else if (mType === 'S') {
              // Beam splitter: split into perpendicular directions
              if (currDir === 'E' || currDir === 'W') {
                beamsQueue.push({ r: currR - 1, c: currC, dir: 'N' })
                beamsQueue.push({ r: currR + 1, c: currC, dir: 'S' })
              } else {
                beamsQueue.push({ r: currR, c: currC + 1, dir: 'E' })
                beamsQueue.push({ r: currR, c: currC - 1, dir: 'W' })
              }
              break // terminate this main beam branch
            }
          } else {
            // Block acts as an obstacle
            break
          }
        }

        // Move beam forward
        if (currDir === 'E') currC++
        else if (currDir === 'W') currC--
        else if (currDir === 'N') currR--
        else if (currDir === 'S') currR++
      }
    }

    setLaserPath(fullPath)
    setReceptorsHit({ r1: hitR1, r2: hitR2 })

    if (hitR1 && hitR2) {
      sounds.playSuccess()
      setTimeout(onSolved, 2000)
    }
  }, [blocks, onSolved])

  const checkCollision = (id: number, nx: number, ny: number, w: number, h: number) => {
    // Check board boundaries
    if (nx < 0 || nx + w > boardSize || ny < 0 || ny + h > boardSize) return true

    // Check collisions with other blocks
    for (const b of blocks) {
      if (b.id === id) continue
      const overlapX = nx < b.x + b.w && nx + w > b.x
      const overlapY = ny < b.y + b.h && ny + h > b.y
      if (overlapX && overlapY) return true
    }
    return false
  }

  const handleMouseDown = (e: React.MouseEvent, item: BlockItem) => {
    e.preventDefault()
    setDragState({
      id: item.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startBlockX: item.x,
      startBlockY: item.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return
      const dx = e.clientX - dragState.startMouseX
      const dy = e.clientY - dragState.startMouseY

      const cellDelta = Math.round(dragState.id % 2 === 0 ? dx / cellSize : dy / cellSize)
      
      setBlocks(prev => {
        const item = prev.find(b => b.id === dragState.id)!
        let targetX = item.x
        let targetY = item.y

        if (item.orientation === 'h') {
          const moveX = dragState.startBlockX + Math.round(dx / cellSize)
          // Slide step validation
          const step = Math.sign(moveX - item.x)
          let nextX = item.x
          while (nextX !== moveX) {
            const candidate = nextX + step
            if (!checkCollision(item.id, candidate, item.y, item.w, item.h)) {
              nextX = candidate
            } else {
              break
            }
          }
          targetX = nextX
        } else {
          const moveY = dragState.startBlockY + Math.round(dy / cellSize)
          // Slide step validation
          const step = Math.sign(moveY - item.y)
          let nextY = item.y
          while (nextY !== moveY) {
            const candidate = nextY + step
            if (!checkCollision(item.id, item.x, candidate, item.w, item.h)) {
              nextY = candidate
            } else {
              break
            }
          }
          targetY = nextY
        }

        if (targetX !== item.x || targetY !== item.y) {
          sounds.playClick()
          return prev.map(b => b.id === item.id ? { ...b, x: targetX, y: targetY } : b)
        }
        return prev
      })
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState])

  return (
    <div className={styles.miniPuzzlePanel}>
      <h4>STAGE C: SLIDING LASER BEAM SPLITTER</h4>
      <p className={styles.miniPuzzleDesc}>
        <strong>REFRACTIVE OVERRIDE GRID:</strong> Connect the laser matrix back to receptors. Click and drag the colored block buffers to slide them (horizontal blocks slide left/right, vertical blocks slide up/down). Direct the laser beam to strike both terminal receptors simultaneously.
      </p>

      {/* Grid Canvas Wrapper */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap' }}>
        
        {/* Sliding Board Grid Container */}
        <div style={{
          position: 'relative',
          width: `${boardSize * cellSize}px`,
          height: `${boardSize * cellSize}px`,
          background: '#040202',
          border: '3px solid #221510',
          borderRadius: '4px',
          boxSizing: 'content-box'
        }}>
          {/* Static background grid boxes */}
          {Array.from({ length: boardSize * boardSize }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                border: '1px solid #1a0f0a',
                boxSizing: 'border-box',
                left: `${(i % boardSize) * cellSize}px`,
                top: `${Math.floor(i / boardSize) * cellSize}px`,
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* Laser Path overlays */}
          {laserPath.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                background: '#4aff4a',
                borderRadius: '50%',
                boxShadow: '0 0 8px #4aff4a',
                left: `${p.c * cellSize + cellSize / 2 - 3}px`,
                top: `${p.r * cellSize + cellSize / 2 - 3}px`,
                pointerEvents: 'none',
                zIndex: 5
              }}
            />
          ))}

          {/* Fixed Laser Emitter */}
          <div style={{
            position: 'absolute',
            width: '12px',
            height: '24px',
            background: '#ff4444',
            border: '1px solid #fff',
            left: '-6px',
            top: `${2 * cellSize + cellSize / 2 - 12}px`,
            borderRadius: '3px',
            zIndex: 10
          }} />

          {/* Target Receptor 1 */}
          <div style={{
            position: 'absolute',
            width: '24px',
            height: '12px',
            background: receptorsHit.r1 ? '#4aff4a' : '#221111',
            border: receptorsHit.r1 ? '1px solid #fff' : '1px solid #ff4444',
            left: `${4 * cellSize + cellSize / 2 - 12}px`,
            top: '-6px',
            borderRadius: '3px',
            zIndex: 10,
            boxShadow: receptorsHit.r1 ? '0 0 10px #4aff4a' : 'none'
          }} />

          {/* Target Receptor 2 */}
          <div style={{
            position: 'absolute',
            width: '12px',
            height: '24px',
            background: receptorsHit.r2 ? '#4aff4a' : '#221111',
            border: receptorsHit.r2 ? '1px solid #fff' : '1px solid #ff4444',
            left: `${5 * cellSize + cellSize - 6}px`,
            top: `${3 * cellSize + cellSize / 2 - 12}px`,
            borderRadius: '3px',
            zIndex: 10,
            boxShadow: receptorsHit.r2 ? '0 0 10px #4aff4a' : 'none'
          }} />

          {/* Interactive Sliding Blocks */}
          {blocks.map(b => (
            <div
              key={b.id}
              onMouseDown={e => handleMouseDown(e, b)}
              style={{
                position: 'absolute',
                width: `${b.w * cellSize - 4}px`,
                height: `${b.h * cellSize - 4}px`,
                left: `${b.x * cellSize + 2}px`,
                top: `${b.y * cellSize + 2}px`,
                background: b.color,
                border: '1px solid #ffffff33',
                borderRadius: '4px',
                cursor: dragState?.id === b.id ? 'grabbing' : 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: '#000',
                userSelect: 'none',
                zIndex: 8,
                transition: dragState?.id === b.id ? 'none' : 'left 0.15s, top 0.15s'
              }}
            >
              {/* Show block mirrors */}
              {b.mirror && (
                <div style={{
                  position: 'absolute',
                  width: `${cellSize - 8}px`,
                  height: `${cellSize - 8}px`,
                  left: `${b.mirror.lx * cellSize + 2}px`,
                  top: `${b.mirror.ly * cellSize + 2}px`,
                  background: 'rgba(255,255,255,0.25)',
                  border: '1px solid #fff',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: '#fff',
                  textShadow: '0 0 3px #000'
                }}>
                  {b.mirror.type}
                </div>
              )}
            </div>
          ))}

        </div>

        {/* Legend Panel */}
        <div style={{ width: '180px', background: '#0a0505', border: '1px solid #331111', padding: '0.8rem', borderRadius: '4px', textAlign: 'left', fontSize: '0.65rem', color: '#8a8070', lineHeight: '1.4' }}>
          <strong>📡 BOARD LEGEND:</strong>
          <ul style={{ margin: '0.4rem 0 0 1rem', padding: 0 }}>
            <li><strong style={{ color: '#ff4444' }}>Emitter:</strong> Fixed Red port on left.</li>
            <li><strong style={{ color: '#4aff4a' }}>Receptors:</strong> Top and Right green receiver ports.</li>
            <li><strong>Mirrors (/ or \):</strong> Reflects light beam 90 degrees.</li>
            <li><strong>Splitter (S):</strong> Splits incoming light beam in two.</li>
            <li><strong>Obstacles (Dark):</strong> Blocks the path of the laser.</li>
          </ul>
        </div>

      </div>

      {receptorsHit.r1 && receptorsHit.r2 && (
        <div style={{ color: 'var(--terminal-green)', textAlign: 'center', font: '700 0.8rem var(--font-mono, monospace)', letterSpacing: '0.15em', marginTop: '1rem', animation: 'blink 0.5s infinite' }}>
          ✓ HARMONICS ALIGNED. DIRECT MESSAGE LOADING...
        </div>
      )}
    </div>
  )
}
