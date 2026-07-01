'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ActCinematicIntro } from '../components/ActCinematicIntro'
import { DialogueBox } from '../components/DialogueBox'
import { AlertElimination } from '../components/AlertElimination'
import { SignalInterceptor } from '../components/SignalInterceptor'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'
import styles from '../operation-deadlight.module.css'

interface Act4Props {
  onPuzzleSolved: () => void
}

export function Act4Silence({ onPuzzleSolved }: Act4Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [narrativeComplete, setNarrativeComplete] = useState(false)
  const [puzzleStarted, setPuzzleStarted] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)

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

  function startPuzzleFlow() {
    if (!narrativeComplete) {
      sounds.playError()
      return
    }

    sounds.playError() // Play low warning buzz
    setIsGlitching(true)

    // Trigger visual CRT shake on the parent section using GSAP
    if (sectionRef.current) {
      const tl = gsap.timeline()
      for (let i = 0; i < 15; i++) {
        tl.to(sectionRef.current, {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          duration: 0.03,
        })
      }
      tl.to(sectionRef.current, { x: 0, y: 0, duration: 0.05, clearProps: 'transform' })
    }

    setTimeout(() => {
      setIsGlitching(false)
      setPuzzleStarted(true)
    }, 850)
  }

  return (
    <>
      <ActCinematicIntro
        index="04"
        act="THE SILENCE"
        title="STAGE 3"
        transmission="ALL CONTAINMENT SYSTEMS FAILED // MULTIPLE BREACH EVENTS // MANUAL OVERRIDE REQUIRED"
        danger
      />

      <section ref={sectionRef} className={`${styles.act} ${styles.silenceAct}`}>
        <div className={styles.static} />
        <div className={styles.actContent}>
          <p className={styles.chapter}>Stage 3 · The Silence</p>
          <h2>Containment has <em>failed.</em></h2>

          <DialogueBox
            speaker="CONTAINMENT PROTOCOLS — SECTOR 4"
            side="left"
            style="classified"
            text="The containment timeline has been recovered. Access the declassified frequency channel and play back the tape to capture the transmission log before it deletes."
          />

          {/* Signal Interceptor Tape UI — replacing TerminalReplay */}
          <SignalInterceptor onComplete={() => setNarrativeComplete(true)} />

          {!puzzleStarted ? (
            <div className={`border ${narrativeComplete ? 'border-red-900/50' : 'border-zinc-800/30'} bg-[#0f0909]/80 p-8 rounded-xl my-8 text-center backdrop-blur-md relative overflow-hidden group shadow-[inset_0_0_20px_rgba(139,26,26,0.15)] hover:border-red-600/40 transition-all duration-300`}>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 group-hover:scale-x-110 transition-transform duration-700" />
              <div className="font-mono text-xs text-red-500 tracking-[0.2em] uppercase mb-3">
                SYSTEM CASCADE // BUFFER WIPING IN PROGRESS
              </div>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                {narrativeComplete
                  ? 'CRITICAL WARNING: Mainframe security cascade active. Halting the deletion protocol requires emergency terminal override.'
                  : 'LOCKED: Play the tape above to capture the final transmission log.'
                }
              </p>
              <button
                onClick={startPuzzleFlow}
                disabled={!narrativeComplete}
                className={`font-mono text-xs font-bold tracking-[0.25em] ${narrativeComplete ? 'text-[#ff6666] bg-[#3a1010]/80 border-[#8b1a1a] hover:bg-[#5a1515] hover:border-[#ff4444] hover:shadow-[0_0_25px_rgba(139,26,26,0.3)] cursor-pointer' : 'text-zinc-600 bg-zinc-900/50 border-zinc-700 cursor-not-allowed'} border rounded px-6 py-3.5 transition-all duration-300 active:scale-95 uppercase`}
              >
                {narrativeComplete ? 'Access Alert Dashboard & Override' : '◆ LOCKED — AUDIO TRANSMISSION PENDING'}
              </button>
            </div>
          ) : (
            <AlertElimination onSolved={onPuzzleSolved} />
          )}
        </div>
      </section>

      {/* Glitch System Override Overlay */}
      {isGlitching && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-red-950/40 animate-[pulse_0.1s_infinite] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-red-900/20 mix-blend-color-burn" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.95)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px]" />
          
          <div className="w-full h-2 bg-red-500/20 absolute top-1/4 left-0 animate-[bounce_0.2s_infinite]" />
          <div className="w-full h-1 bg-cyan-500/20 absolute top-2/3 left-0 animate-[bounce_0.15s_infinite]" />
          
          <div className="text-center p-6 bg-black/95 border border-red-800 rounded-lg shadow-2xl relative max-w-sm">
            <div className="font-mono text-red-500 text-sm font-bold tracking-[0.25em] uppercase mb-2 animate-pulse">
              ⚠️ CASCADE DETECTION ⚠️
            </div>
            <div className="font-mono text-zinc-400 text-[10px] tracking-widest uppercase">
              INITIALIZING CRITICAL RECOVERY PROTOCOL // BYPASSING LOCK
            </div>
          </div>
        </div>
      )}
    </>
  )
}
