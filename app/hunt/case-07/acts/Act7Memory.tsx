'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ActCinematicIntro } from '../components/ActCinematicIntro'
import { DialogueBox } from '../components/DialogueBox'
import { CorruptedTerminal } from '../components/CorruptedTerminal'
import { FragmentUnlock, Fragment } from '../components/FragmentUnlock'
import { TerminalReplay, TerminalLine } from '../components/TerminalReplay'
import { NarrativeGate } from '../components/NarrativeGate'
import { PuzzleInput } from '@/components/case-07/shared/PuzzleInput'
import styles from '../operation-deadlight.module.css'

const MEMORY_FRAGMENTS: Fragment[] = [
  {
    label: 'COGNITIVE LOG 01/03',
    subheading: 'TEMPORAL DRIFT',
    content: 'Analyst Dolen was the first to notice the drift. He documented the cognitive lapses in his journals: whole days appearing in wrong sequences, staff forgetting names they had worked with for years, and clocks running at offset cycles.',
  },
  {
    label: 'COGNITIVE LOG 02/03',
    subheading: 'MAINFRAME DECAY',
    content: 'The mainframe itself began experiencing similar temporal decay — its storage sectors degrading into biological clusters, overwriting operational system files with corrupted logs. The system address lines were overlapping. Crew retro-cognitive memories were overwriting active registers.',
  },
  {
    label: 'COGNITIVE LOG 03/03',
    subheading: 'DOLEN\'S RECOVERY FILES',
    content: 'Before his disappearance, Dolen attempted to map the memory sectors back into stable partitions. He left a series of recovery files in the terminal, but the system BIOS must be loaded first to unlock the sector allocation tools. His final note: "The sequence of events is wrong for them. Tuesday after Thursday. The briefing before the arrival."',
  },
]

const MEMORY_TERMINAL_LINES: TerminalLine[] = [
  { text: 'CRITICAL INSTABILITY ALERT', style: 'warning', autoAdvanceMs: 800 },
  { text: 'Temporal drift detected.', style: 'warning', autoAdvanceMs: 600 },
  { text: 'System address lines are overlapping.', style: 'warning', autoAdvanceMs: 600 },
  { text: '', style: 'blank' },
  { text: 'I\'ve started writing everything down.', style: 'quote' },
  { text: 'The others are forgetting.', style: 'quote' },
  { text: 'Not forgetting — I know what forgetting looks like.', style: 'quote' },
  { text: 'This is different.', style: 'quote', glitch: true },
  { text: '', style: 'blank' },
  { text: 'Initiate the recovery terminal.', style: 'system' },
  { text: 'Load boot_loader.sys and resolve block dependencies.', style: 'system' },
]

interface Act7Props {
  onPuzzleSolved: () => void
}

export function Act7Memory({ onPuzzleSolved }: Act7Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [fragmentsComplete, setFragmentsComplete] = useState(false)
  const [terminalComplete, setTerminalComplete] = useState(false)
  const [terminalSolved, setTerminalSolved] = useState(false)

  const narrativeComplete = fragmentsComplete && terminalComplete

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <ActCinematicIntro
        index="07"
        act="ANOMALY 3"
        title="MEMORY CORRUPTION"
        transmission="TIMELINE SCRAMBLED // SEQUENCE WRONG // TRUTH MUST BE RECONSTRUCTED"
      />

      <section ref={sectionRef} className={`${styles.act} ${styles.memoryAct}`}>
        <div className={styles.static} />
        <div className={styles.actContent}>
          <p className={styles.chapter}>Anomaly 3 · Memory Corruption</p>
          <h2>The sequence is <em>wrong.</em></h2>

          <DialogueBox
            speaker="MAINFRAME COGNITIVE LOG #704"
            side="right"
            style="classified"
            text="Multiple cognitive anomalies have been detected. Three encrypted cognitive logs were recovered. Decrypt them to understand the scope of the temporal corruption."
          />

          {/* Fragment Unlock — 3 cognitive logs about memory corruption */}
          <FragmentUnlock
            fragments={MEMORY_FRAGMENTS}
            title="RECOVERED COGNITIVE LOGS — ANOMALY 3"
            onComplete={() => setFragmentsComplete(true)}
          />

          {/* Terminal Replay — Dolen's journal entries */}
          {fragmentsComplete && (
            <TerminalReplay
              lines={MEMORY_TERMINAL_LINES}
              title="ANALYST DOLEN — JOURNAL RECONSTRUCTION"
              onComplete={() => setTerminalComplete(true)}
            />
          )}

          {/* Narrative Gate — blocks puzzle until both components are complete */}
          <NarrativeGate narrativeComplete={narrativeComplete}>
            <CorruptedTerminal onSolved={() => setTerminalSolved(true)} />

            {terminalSolved && (
              <div style={{ marginTop: '2rem' }}>
                <DialogueBox
                  speaker="SYSTEM"
                  side="center"
                  style="system"
                  text="Terminal logs reconstructed. Extract the first letter of each repaired file word in sequence to form the classification code."
                />
                <PuzzleInput
                  puzzleId="memory-corruption"
                  timelineId="operation-deadlight"
                  onCorrect={onPuzzleSolved}
                  placeholder="Enter classification code..."
                  theme="terminal"
                />
              </div>
            )}
          </NarrativeGate>
        </div>
      </section>
    </>
  )
}
