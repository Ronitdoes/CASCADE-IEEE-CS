'use client'

import { useState, useEffect, useRef } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

interface NarrativeGateProps {
  /** Whether the upstream narrative components are all complete */
  narrativeComplete: boolean
  /** The puzzle content to reveal */
  children: React.ReactNode
  /** Optional label for the proceed button */
  buttonLabel?: string
}

export function NarrativeGate({ narrativeComplete, children, buttonLabel }: NarrativeGateProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [shaking, setShaking] = useState(false)
  const gateRef = useRef<HTMLDivElement>(null)

  // If narrative is complete and user has already unlocked, persist
  useEffect(() => {
    if (unlocked && !narrativeComplete) {
      setUnlocked(false)
    }
  }, [narrativeComplete, unlocked])

  function handleProceed() {
    if (!narrativeComplete) {
      setShaking(true)
      sounds.playError()
      setTimeout(() => setShaking(false), 500)
      return
    }

    sounds.playStamp()
    setUnlocked(true)

    // Scroll the revealed puzzle into view
    setTimeout(() => {
      gateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
  }

  if (unlocked) {
    return <div ref={gateRef}>{children}</div>
  }

  return (
    <div className={`${styles.narrativeGate} ${shaking ? styles.narrativeGateShake : ''}`}>
      <div className={styles.narrativeGateIcon}>
        {narrativeComplete ? '◈' : '◆'}
      </div>
      <p className={styles.narrativeGateStatus}>
        {narrativeComplete
          ? 'ARCHIVE RECOVERY COMPLETE — INVESTIGATION ACCESS AUTHORIZED'
          : 'COMPLETE ARCHIVE RECOVERY ABOVE TO UNLOCK INVESTIGATION'
        }
      </p>
      <button
        className={`${styles.narrativeGateBtn} ${narrativeComplete ? styles.narrativeGateBtnReady : ''}`}
        onClick={handleProceed}
      >
        {buttonLabel || 'PROCEED TO INVESTIGATION'}
      </button>
      {!narrativeComplete && (
        <p className={styles.narrativeGateHint}>
          ▲ Read and interact with the recovered archives above
        </p>
      )}
    </div>
  )
}
