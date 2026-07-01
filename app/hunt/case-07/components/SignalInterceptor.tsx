'use client'

import { useState, useEffect, useRef } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

interface SignalInterceptorProps {
  onComplete: () => void
}

export function SignalInterceptor({ onComplete }: SignalInterceptorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const voiceLines = [
    { time: 10, text: '“All containment systems in Sector 4 failed simultaneously.”' },
    { time: 25, text: '“Confusion reported on all radio bands. Teams saw people walk into rooms they never entered.”' },
    { time: 50, text: '“Security cameras show conflicting timelines occurring in the same hallway.”' },
    { time: 70, text: '“The final static data stream was reconstructed. Only one line remained...”' },
    { time: 85, text: '“It isn\'t spreading... It\'s replacing.”', important: true },
    { time: 98, text: '“Communication terminated. Mainframe buffer self-destruction initiated.”' },
  ]

  const handlePlayToggle = () => {
    sounds.playClick()
    setIsPlaying(prev => !prev)
  }

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1.2
          return next >= 100 ? 100 : next
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  // Track completion when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      setIsPlaying(false)
      sounds.playSuccess()
      onComplete()
    }
  }, [progress, onComplete])

  // Track lines based on time progress percentage
  useEffect(() => {
    const matchingLineIndex = voiceLines.reduce((acc, line, idx) => {
      if (progress >= line.time) {
        return idx
      }
      return acc
    }, -1)

    if (matchingLineIndex !== currentLineIndex) {
      setCurrentLineIndex(matchingLineIndex)
      if (matchingLineIndex !== -1) {
        sounds.playReveal()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  return (
    <div className={styles.signalInterceptor}>
      {/* Scope visualizer */}
      <div className={styles.interceptorScope}>
        <svg viewBox="0 0 400 100" className={styles.scopeWaveform}>
          <path
            d={
              isPlaying
                ? `M 0 50 Q 50 ${50 + Math.sin(progress) * 35}, 100 50 T 200 50 T 300 50 T 400 50`
                : 'M 0 50 L 400 50'
            }
            stroke="#ff3333"
            strokeWidth="2"
            fill="none"
            className={isPlaying ? styles.scopeWaveformActive : ''}
          />
        </svg>
        <div className={styles.interceptorOverlayText}>
          {isPlaying ? '📡 RECEIVING TIMELINE TRANSMISSION...' : '🔴 RECEIVER INACTIVE'}
        </div>
      </div>

      {/* Tape Deck UI */}
      <div className={styles.interceptorControls}>
        <button
          onClick={handlePlayToggle}
          className={`${styles.playButton} ${isPlaying ? styles.playButtonActive : ''}`}
        >
          {isPlaying ? '⏸ PAUSE FREQUENCY' : '▶ LISTEN TO TRANSMISSION'}
        </button>

        <div className={styles.seekbarContainer}>
          <span className={styles.seekbarTime}>00:{Math.round(progress * 0.3).toString().padStart(2, '0')}</span>
          <div className={styles.seekbarTrack}>
            <div className={styles.seekbarFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.seekbarTime}>00:30</span>
        </div>
      </div>

      {/* LED indicators */}
      <div className={styles.interceptorLeds}>
        <div className={`${styles.led} ${isPlaying ? styles.ledRedActive : ''}`} />
        <span className={styles.ledLabel}>REC SIGNAL</span>
        <div className={styles.ledBar}>
          <div className={`${styles.ledGridNode} ${progress > 10 ? styles.ledNodeGreen : ''}`} />
          <div className={`${styles.ledGridNode} ${progress > 30 ? styles.ledNodeGreen : ''}`} />
          <div className={`${styles.ledGridNode} ${progress > 50 ? styles.ledNodeGreen : ''}`} />
          <div className={`${styles.ledGridNode} ${progress > 70 ? styles.ledNodeYellow : ''}`} />
          <div className={`${styles.ledGridNode} ${progress > 90 ? styles.ledNodeRed : ''}`} />
        </div>
      </div>

      {/* Decoded Output */}
      <div className={styles.interceptorOutput}>
        {currentLineIndex === -1 ? (
          <p className={styles.interceptorPlaceholder}>[ Press Play to decode temporal radio static... ]</p>
        ) : (
          <div className={styles.interceptorTranscript}>
            {voiceLines.slice(0, currentLineIndex + 1).map((line, idx) => (
              <p
                key={idx}
                className={`${styles.transcriptLine} ${line.important ? styles.transcriptLineImportant : ''}`}
              >
                {line.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
