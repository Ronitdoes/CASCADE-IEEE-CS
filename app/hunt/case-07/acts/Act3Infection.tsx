'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ActCinematicIntro } from '../components/ActCinematicIntro'
import { DialogueBox } from '../components/DialogueBox'
import { ProfileMatch } from '../components/ProfileMatch'
import { FragmentUnlock, Fragment } from '../components/FragmentUnlock'
import { NarrativeGate } from '../components/NarrativeGate'
import { PuzzleInput } from '@/components/case-07/shared/PuzzleInput'
import styles from '../operation-deadlight.module.css'

const INFECTION_FRAGMENTS: Fragment[] = [
  {
    label: 'MEDICAL RECORD 01/03',
    subheading: 'INITIAL CONTACT',
    content: 'The task force initially deployed to investigate reports of unexplained disappearances within remote settlement Site Kennedy. Those who returned from the quarantine zone displayed significant behavioral shifts. They looked the same, sounded the same, but family members claimed they were entirely different people.',
  },
  {
    label: 'MEDICAL RECORD 02/03',
    subheading: 'PARASITE DISCOVERY',
    content: 'As the investigation progressed, task force personnel discovered evidence suggesting the presence of an unidentified parasitic organism. The organism appeared capable of spreading undetected through the settlement, leaving no physical trace on its hosts. Instead of physical symptoms, the infection manifested through subtle behavioral changes: memory inconsistencies, personality shifts, and periods of missing time.',
  },
  {
    label: 'MEDICAL RECORD 03/03',
    subheading: 'CRITICAL WARNING',
    content: 'Recovered transmissions indicate growing panic among researchers as they realized multiple hosts could be influenced simultaneously. The final complete medical report ends with a chilling warning: "We can no longer determine who is infected." To secure the facility, you must calibrate the diagnostic subsystems of the quarantine terminal and bypass the locking mechanism.',
  },
]

interface Act3Props {
  onPuzzleSolved: () => void
}

export function Act3Infection({ onPuzzleSolved }: Act3Props) {
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
        index="03"
        act="THE INFECTION"
        title="STAGE 2"
        transmission="BEHAVIORAL PROFILING SYSTEM // PARASITIC ORGANISM DETECTED // IDENTITY UNCERTAIN"
      />

      <section ref={sectionRef} className={`${styles.act} ${styles.infectionAct}`}>
        <div className={styles.static} />
        <div className={styles.actContent}>
          <p className={styles.chapter}>Stage 2 · The Infection</p>
          <h2>Who is <em>infected?</em></h2>

          <DialogueBox
            speaker="MEDICAL DIVISION — CASE FILE RECORD"
            side="left"
            style="classified"
            text="Medical examinations failed to identify any known pathogens. The organism appeared to operate beyond conventional detection methods. Three encrypted medical archives were recovered from the quarantine zone. Decrypt them to understand the nature of the infection."
          />

          {/* Fragment Unlock — story content split into 3 encrypted medical records */}
          <FragmentUnlock
            fragments={INFECTION_FRAGMENTS}
            title="RECOVERED MEDICAL ARCHIVES"
            onComplete={() => setNarrativeComplete(true)}
          />

          {/* Narrative Gate — blocks puzzle until all fragments are decrypted */}
          <NarrativeGate narrativeComplete={narrativeComplete}>
            <ProfileMatch onSolved={() => { }} />

            <div style={{ marginTop: '2rem' }}>
              <DialogueBox
                speaker="SYSTEM"
                side="center"
                style="system"
                text="Diagnostic nodes restored. Reconstruct the decrypted letters in node sequence (1 to 4) to decrypt the access key."
              />
              <PuzzleInput
                puzzleId="behavioral-match"
                timelineId="operation-deadlight"
                onCorrect={onPuzzleSolved}
                placeholder="Enter decrypted access key..."
                theme="terminal"
              />
            </div>
          </NarrativeGate>
        </div>
      </section>
    </>
  )
}
