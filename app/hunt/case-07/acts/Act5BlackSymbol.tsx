'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ActCinematicIntro } from '../components/ActCinematicIntro'
import { DialogueBox } from '../components/DialogueBox'
import { SymbolReconstruction } from '../components/SymbolReconstruction'
import { FragmentUnlock, Fragment } from '../components/FragmentUnlock'
import { NarrativeGate } from '../components/NarrativeGate'
import { PuzzleInput } from '@/components/case-07/shared/PuzzleInput'
import styles from '../operation-deadlight.module.css'

const SYMBOL_FRAGMENTS: Fragment[] = [
  {
    label: 'EVIDENCE LOG 01/04',
    subheading: 'INITIAL DISCOVERY',
    content: 'Following the loss of communication, Site Kennedy was permanently abandoned. Official records describing the settlement were removed from public archives. The surviving evidence provides no definitive explanation. However, investigators identified several anomalies matching patterns observed in other cases.',
  },
  {
    label: 'EVIDENCE LOG 02/04',
    subheading: 'THE RECURRING SYMBOL',
    content: 'The symbol was discovered drawn in charcoal and etched into walls across 14 separate recovered documents. No two instances are identical, yet analysts confirm they all represent the same structural pattern. A black circular mark appearing throughout every recovered structure.',
  },
  {
    label: 'EVIDENCE LOG 03/04',
    subheading: 'DOLEN\'S INVESTIGATION',
    content: 'Analyst Dolen was investigating these fragments, but they kept disappearing from his desk. It was as if someone — or something — with access to the secure facility was scrubbing the evidence in real time. His final journal entry reads: "Something is removing them before I can document the pattern."',
  },
  {
    label: 'EVIDENCE LOG 04/04',
    subheading: 'RECONSTRUCTION PROTOCOL',
    content: 'To reconstruct the symbol, you must secure 4 fragment partitions: solve the Matrix Parity registers, decode the Morse timeline signals, unlock the Combinational Logic Gate circuit, and decrypt the Vigenère communication logs. The answers lie in the archives.',
  },
]

interface Act5Props {
  onPuzzleSolved: () => void
}

export function Act5BlackSymbol({ onPuzzleSolved }: Act5Props) {
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
        index="05"
        act="ANOMALY 1"
        title="THE BLACK SYMBOL"
        transmission="RECURRING SYMBOL DETECTED // 14 DOCUMENTS // NO TWO INSTANCES IDENTICAL"
      />

      <section ref={sectionRef} className={`${styles.act} ${styles.symbolAct}`}>
        <div className={styles.static} />
        <div className={styles.actContent}>
          <p className={styles.chapter}>Anomaly 1 · The Black Symbol</p>
          <h2>Something keeps <em>removing</em> them.</h2>

          <DialogueBox
            speaker="CHIEF LOGS — PROJECT NULL RECORDS"
            side="left"
            style="classified"
            text="A recurring anomaly has been detected across multiple recovered documents. The marking matches symbols recovered in multiple PROJECT NULL investigations. Decrypt the evidence logs to understand the scope of this anomaly."
          />

          {/* Fragment Unlock — 4 evidence logs about the black symbol */}
          <FragmentUnlock
            fragments={SYMBOL_FRAGMENTS}
            title="RECOVERED EVIDENCE LOGS — ANOMALY 1"
            onComplete={() => setNarrativeComplete(true)}
          />

          {/* Narrative Gate — blocks puzzle until all fragments are decrypted */}
          <NarrativeGate narrativeComplete={narrativeComplete}>
            <SymbolReconstruction onSolved={() => { }} />

            <div style={{ marginTop: '2rem' }}>
              <DialogueBox
                speaker="SYSTEM"
                side="center"
                style="system"
                text='SYMBOL DECODED. "It isn&apos;t spreading. It&apos;s _______." Enter the decoded word to proceed.'
              />
              <PuzzleInput
                puzzleId="black-symbol"
                timelineId="operation-deadlight"
                onCorrect={onPuzzleSolved}
                placeholder="Enter decoded word..."
                theme="terminal"
              />
            </div>
          </NarrativeGate>
        </div>
      </section>
    </>
  )
}
