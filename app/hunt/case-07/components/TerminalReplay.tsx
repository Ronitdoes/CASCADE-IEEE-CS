'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

export interface TerminalLine {
  text: string
  /** 'normal' default green terminal, 'warning' red pulse, 'classified' gold dashed, 'quote' white italic, 'system' amber caps, 'blank' empty spacer */
  style?: 'normal' | 'warning' | 'classified' | 'quote' | 'system' | 'blank'
  /** If true, triggers a screen flicker when this line appears */
  glitch?: boolean
  /** Delay in ms before auto-advancing to next line (skips click-to-advance). 0 = wait for click. Default 0 */
  autoAdvanceMs?: number
}

interface TerminalReplayProps {
  /** The sequence of lines to replay */
  lines: TerminalLine[]
  /** Title shown at top of the terminal, e.g. "ACCESSING ARCHIVED INVESTIGATION..." */
  title?: string
  /** Called when all lines have been consumed */
  onComplete: () => void
}

const SCRAMBLE_CHARS = '█▓░▒XYZ#@$&*0123456789'

export function TerminalReplay({ lines, title, onComplete }: TerminalReplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedLines, setDisplayedLines] = useState<{ text: string; style: TerminalLine['style'] }[]>([])
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef(false)
  const cancelRef = useRef(false)

  const progressPct = lines.length > 0 ? Math.round((currentIndex / lines.length) * 100) : 0

  // Type out a single line with scramble effect
  const typeLine = useCallback(async (text: string) => {
    if (typingRef.current) return
    typingRef.current = true
    setIsTyping(true)
    cancelRef.current = false

    let built = ''
    for (let i = 0; i < text.length; i++) {
      if (cancelRef.current) break

      // 2 frames of scramble
      for (let f = 0; f < 2; f++) {
        if (cancelRef.current) break
        const rand = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        setCurrentText(built + rand)
        await new Promise(r => setTimeout(r, 15))
      }

      built += text[i]
      setCurrentText(built)

      // Punctuation pause
      if (['.', '!', '?', '…', '"', '"'].includes(text[i])) {
        await new Promise(r => setTimeout(r, 120))
      }
    }

    setCurrentText(text)
    setIsTyping(false)
    typingRef.current = false
  }, [])

  // Start typing the current line
  useEffect(() => {
    if (currentIndex >= lines.length) return
    const line = lines[currentIndex]

    if (line.style === 'blank') {
      // Blank line — add immediately and auto-advance
      setDisplayedLines(prev => [...prev, { text: '', style: 'blank' }])
      sounds.playClick()
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 200)
      return
    }

    // Trigger glitch if flagged
    if (line.glitch) {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 400)
    }

    typeLine(line.text).then(() => {
      // Auto-advance if configured
      if (line.autoAdvanceMs && line.autoAdvanceMs > 0) {
        setTimeout(() => {
          advanceLine()
        }, line.autoAdvanceMs)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Advance to next line
  const advanceLine = useCallback(() => {
    if (isTyping) {
      // Skip to end of current line
      cancelRef.current = true
      typingRef.current = false
      setIsTyping(false)
      const line = lines[currentIndex]
      if (line) setCurrentText(line.text)
      return
    }

    if (currentIndex >= lines.length) return

    const line = lines[currentIndex]
    setDisplayedLines(prev => [...prev, { text: currentText, style: line?.style || 'normal' }])
    setCurrentText('')
    sounds.playClick()

    if (currentIndex + 1 >= lines.length) {
      setIsComplete(true)
      sounds.playReveal()
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, currentText, isTyping, lines, onComplete])

  // Click/keypress handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        advanceLine()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [advanceLine])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedLines, currentText])

  const getLineColor = (style: TerminalLine['style']) => {
    switch (style) {
      case 'warning': return '#ff4444'
      case 'classified': return '#e8c060'
      case 'quote': return '#ffffff'
      case 'system': return '#b8862a'
      case 'blank': return 'transparent'
      default: return '#4aff4a'
    }
  }

  return (
    <div className={styles.terminalReplayWrapper}>
      {/* Glitch overlay */}
      {isGlitching && <div className={styles.terminalReplayGlitch} />}

      {/* Header */}
      <div className={styles.terminalReplayHeader}>
        <span>{title || 'ARCHIVED TRANSMISSION LOG'}</span>
        <span className={styles.terminalReplayProgress}>
          RECOVERY: {progressPct}%
          <span className={styles.terminalReplayProgressBar}>
            <span style={{ width: `${progressPct}%` }} />
          </span>
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className={styles.terminalReplayBody}
        onClick={advanceLine}
        role="button"
        tabIndex={0}
        aria-label="Click to advance terminal"
      >
        {/* Already displayed lines */}
        {displayedLines.map((line, idx) => (
          <p
            key={idx}
            style={{
              color: getLineColor(line.style),
              fontStyle: line.style === 'quote' ? 'italic' : 'normal',
              textTransform: line.style === 'system' ? 'uppercase' : 'none',
              fontWeight: line.style === 'warning' || line.style === 'quote' ? 'bold' : 'normal',
              minHeight: line.style === 'blank' ? '0.8em' : undefined,
            }}
          >
            <span className={styles.terminalReplayPrompt}>{'>'}</span>
            {line.text}
          </p>
        ))}

        {/* Currently typing line */}
        {!isComplete && currentIndex < lines.length && (
          <p
            style={{
              color: getLineColor(lines[currentIndex]?.style),
              fontStyle: lines[currentIndex]?.style === 'quote' ? 'italic' : 'normal',
              textTransform: lines[currentIndex]?.style === 'system' ? 'uppercase' : 'none',
              fontWeight: lines[currentIndex]?.style === 'warning' || lines[currentIndex]?.style === 'quote' ? 'bold' : 'normal',
            }}
          >
            <span className={styles.terminalReplayPrompt}>{'>'}</span>
            {currentText}
            <span className={styles.terminalReplayCaret}>▋</span>
          </p>
        )}

        {/* Completion message */}
        {isComplete && (
          <div className={styles.terminalReplayComplete}>
            <p>✓ ARCHIVE RECOVERY COMPLETE</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {!isComplete && (
        <div className={styles.terminalReplayFooter}>
          <span>{isTyping ? 'DECRYPTING...' : 'CLICK OR PRESS ENTER TO CONTINUE'}</span>
        </div>
      )}
    </div>
  )
}
