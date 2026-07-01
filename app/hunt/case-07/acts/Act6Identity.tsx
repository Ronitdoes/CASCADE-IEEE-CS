'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ActCinematicIntro } from '../components/ActCinematicIntro'
import { DialogueBox } from '../components/DialogueBox'
import { PersonnelDossier } from '../components/PersonnelDossier'
import { IdentityDatabase } from '../components/IdentityDatabase'
import { NarrativeGate } from '../components/NarrativeGate'
import { PuzzleInput } from '@/components/case-07/shared/PuzzleInput'
import styles from '../operation-deadlight.module.css'

interface Act6Props {
  onPuzzleSolved: () => void
}

export function Act6Identity({ onPuzzleSolved }: Act6Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [narrativeComplete, setNarrativeComplete] = useState(false)

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
        index="06"
        act="ANOMALY 2"
        title="IDENTITY DISTORTION"
        transmission="PERSONNEL FILES MODIFIED // ONE FILE PLANTED // IDENTITY FABRICATED"
      />

      <section ref={sectionRef} className={`${styles.act} ${styles.identityAct}`}>
        <div className={styles.static} />
        <div className={styles.actContent}>
          <p className={styles.chapter}>Anomaly 2 · Identity Distortion</p>
          <h2>None of us remember <em>arriving.</em></h2>

          <DialogueBox
            speaker="PROJECT NULL AUDIT REPORT"
            side="left"
            style="classified"
            text="A critical identity anomaly has been flagged in the Site Kennedy personnel database. Open the directory, review specialist files, and locate the anomalous plant."
          />

          {/* Identity Database Grid UI — replacing TerminalReplay */}
          <IdentityDatabase onComplete={() => setNarrativeComplete(true)} />

          {/* Narrative Gate — blocks puzzle until terminal replay is complete */}
          <NarrativeGate narrativeComplete={narrativeComplete}>
            <PersonnelDossier onSolved={() => { }} />

            <div style={{ marginTop: '2rem' }}>
              <DialogueBox
                speaker="SYSTEM"
                side="center"
                style="system"
                text="Something created an identity to exist among us. Enter its method of infiltration to proceed."
              />
              <PuzzleInput
                puzzleId="identity-distortion"
                timelineId="operation-deadlight"
                onCorrect={onPuzzleSolved}
                placeholder="Enter method of infiltration..."
                theme="terminal"
              />
            </div>
          </NarrativeGate>
        </div>
      </section>
    </>
  )
}
