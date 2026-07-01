'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

export interface Fragment {
  /** Label, e.g. "ARCHIVE FRAGMENT 01" */
  label: string
  /** The story text revealed after decryption */
  content: string
  /** Optional — secondary heading inside the card */
  subheading?: string
}

interface FragmentUnlockProps {
  /** The fragments to display */
  fragments: Fragment[]
  /** Called when all fragments have been decrypted */
  onComplete: () => void
  /** Title for the overall section */
  title?: string
}

export function FragmentUnlock({ fragments, onComplete, title }: FragmentUnlockProps) {
  const [decrypted, setDecrypted] = useState<boolean[]>(() => fragments.map(() => false))
  const [scanning, setScanning] = useState<number | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const completedRef = useRef(false)

  const decryptedCount = decrypted.filter(Boolean).length
  const totalCount = fragments.length

  // Check completion
  useEffect(() => {
    if (decryptedCount === totalCount && !completedRef.current) {
      completedRef.current = true
      sounds.playSuccess()
      onComplete()
    }
  }, [decryptedCount, totalCount, onComplete])

  const handleDecrypt = useCallback((index: number) => {
    if (decrypted[index] || scanning !== null) return

    setScanning(index)
    setScanProgress(0)
    sounds.playPageFlip()

    // Animate scan progress over ~2.5 seconds
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setScanProgress(100)

        setTimeout(() => {
          setDecrypted(prev => {
            const next = [...prev]
            next[index] = true
            return next
          })
          setScanning(null)
          setScanProgress(0)
          sounds.playReveal()
        }, 300)
      } else {
        setScanProgress(progress)
      }
    }, 120)
  }, [decrypted, scanning])

  return (
    <div className={styles.fragmentUnlockWrapper}>
      {/* Section header */}
      <div className={styles.fragmentUnlockHeader}>
        <span className={styles.fragmentUnlockTitle}>
          {title || 'ENCRYPTED ARCHIVE FRAGMENTS'}
        </span>
        <span className={styles.fragmentUnlockCounter}>
          RECOVERED: {decryptedCount}/{totalCount}
          <span className={styles.fragmentUnlockCounterBar}>
            <span style={{ width: `${(decryptedCount / totalCount) * 100}%` }} />
          </span>
        </span>
      </div>

      {/* Fragment cards */}
      <div className={styles.fragmentUnlockGrid}>
        {fragments.map((fragment, idx) => (
          <div
            key={idx}
            className={`${styles.fragmentCard} ${decrypted[idx] ? styles.fragmentCardDecrypted : ''} ${scanning === idx ? styles.fragmentCardScanning : ''}`}
          >
            {/* Card header */}
            <div className={styles.fragmentCardHeader}>
              <span>{fragment.label}</span>
              <span className={decrypted[idx] ? styles.fragmentStatusRecovered : styles.fragmentStatusEncrypted}>
                {decrypted[idx] ? '✓ RECOVERED' : scanning === idx ? 'SCANNING...' : '◈ ENCRYPTED'}
              </span>
            </div>

            {/* Card body */}
            <div className={styles.fragmentCardBody}>
              {decrypted[idx] ? (
                <div className={styles.fragmentCardContent}>
                  {fragment.subheading && (
                    <p className={styles.fragmentSubheading}>{fragment.subheading}</p>
                  )}
                  <p>{fragment.content}</p>
                </div>
              ) : (
                <div className={styles.fragmentCardLocked}>
                  {/* Redacted blocks */}
                  <div className={styles.fragmentRedactedBlock} />
                  <div className={styles.fragmentRedactedBlock} style={{ width: '85%' }} />
                  <div className={styles.fragmentRedactedBlock} style={{ width: '70%' }} />
                  <div className={styles.fragmentRedactedBlock} style={{ width: '90%' }} />

                  {/* Scan progress bar */}
                  {scanning === idx && (
                    <div className={styles.fragmentScanBar}>
                      <div className={styles.fragmentScanFill} style={{ width: `${scanProgress}%` }} />
                      <span>{Math.round(scanProgress)}%</span>
                    </div>
                  )}

                  {/* Decrypt button */}
                  {scanning !== idx && (
                    <button
                      className={styles.fragmentDecryptBtn}
                      onClick={() => handleDecrypt(idx)}
                      disabled={scanning !== null}
                    >
                      ▶ DECRYPT FRAGMENT
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion banner */}
      {decryptedCount === totalCount && (
        <div className={styles.fragmentUnlockComplete}>
          ✓ ALL FRAGMENTS RECOVERED — ARCHIVE INTEGRITY RESTORED
        </div>
      )}
    </div>
  )
}
