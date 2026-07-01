'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DialogueBox } from '../components/DialogueBox'
import { CaseDossier } from '../components/CaseDossier'
import styles from '../operation-deadlight.module.css'

export function Act1Archive() {
  const sectionRef = useRef<HTMLElement>(null)
  const dossierRef = useRef<HTMLElement>(null)
  const redactionsRef = useRef<HTMLSpanElement[]>([])
  const [archiveRead, setArchiveRead] = useState(false)
  
  const [timeStr, setTimeStr] = useState('1996/03/14 04:17:09')
  useEffect(() => {
    const base = new Date(1996, 2, 14, 4, 17, 9)
    const interval = setInterval(() => {
      base.setSeconds(base.getSeconds() + 1)
      const y = base.getFullYear()
      const m = String(base.getMonth() + 1).padStart(2, '0')
      const d = String(base.getDate()).padStart(2, '0')
      const hh = String(base.getHours()).padStart(2, '0')
      const mm = String(base.getMinutes()).padStart(2, '0')
      const ss = String(base.getSeconds()).padStart(2, '0')
      setTimeStr(`${y}/${m}/${d} ${hh}:${mm}:${ss}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const [isIdle, setIsIdle] = useState(false)
  const idleTimer = useRef<NodeJS.Timeout | null>(null)

  const resetIdle = () => {
    setIsIdle(false)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      setIsIdle(true)
    }, 30000)
  }

  useEffect(() => {
    setTimeout(() => resetIdle(), 0)
    window.addEventListener('scroll', resetIdle)
    window.addEventListener('mousemove', resetIdle)
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      window.removeEventListener('scroll', resetIdle)
      window.removeEventListener('mousemove', resetIdle)
    }
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const dossier = dossierRef.current
      if (!dossier) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      })
      
      tl.fromTo(dossier, { x: -80, opacity: 0 }, { x: 30, opacity: 0.7, duration: 0.05 })
        .to(dossier, { x: -10, opacity: 0.5, duration: 0.04 })
        .to(dossier, { x: 15, opacity: 0.9, duration: 0.04 })
        .to(dossier, { x: 0, opacity: 1, duration: 0.12, ease: 'power2.out' })

      const bars = redactionsRef.current.filter(Boolean)
      if (bars.length > 0) {
        gsap.fromTo(bars, 
          { scaleX: 1 },
          {
            scaleX: 0,
            transformOrigin: 'left',
            stagger: 0.25,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: dossier,
              start: 'top 60%',
              end: 'bottom 20%',
              scrub: 0.6,
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={`${styles.act} ${styles.transmission}`}>
      <div className={styles.static} />
      <div className={styles.tacticalGrid} />
      <div className={styles.crtScanlineSweep} />
      
      <div className={styles.timelineLog}>
        <p>SYSTEM STATUS: ONLINE</p>
        <p>ARCHIVE DEPTH: LEVEL IX</p>
        <hr />
        <p>&gt; CASE FILE: CF-07-OK-1996</p>
        <p>&gt; CLASSIFICATION: NEXUS</p>
        <p>&gt; STATUS: HIGHLY REDACTED</p>
        <p>&gt; SETTLEMENT: SITE KENNEDY</p>
      </div>

      {isIdle && (
        <>
          <div className={styles.decayBar} style={{ top: '25%', height: '6px', opacity: 0.2 }} />
          <div className={styles.decayBar} style={{ top: '60%', height: '3px', opacity: 0.4 }} />
        </>
      )}

      <div className={styles.actContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className={styles.chapter}>Case File 07 · Accessing the Archive</p>
          <div className={styles.recStamp} style={{ color: '#ff4444', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem' }}>
            <span className={styles.recDot} />
            <span>REC ● {timeStr}</span>
          </div>
        </div>

        <h1>Operation<br/><em>Deadlight</em></h1>
        <p className={styles.decrypt}>PROJECT NULL // ARCHIVE ACCESS // EYES ONLY</p>

        <article ref={dossierRef} className={styles.dossier} style={{ opacity: 0 }}>
          <p>CLASSIFIED CASE DOSSIER</p>
          <dl>
            <div>
              <dt>File Designation</dt>
              <dd style={{ position: 'relative' }}>
                CF-07-OK-1996
                <span 
                  ref={el => { if (el) redactionsRef.current[0] = el }}
                  className={styles.redactedBar}
                  style={{ position: 'absolute', inset: '-1px -4px', background: '#000', transformOrigin: 'left' }}
                />
              </dd>
            </div>
            <div>
              <dt>Classification</dt>
              <dd style={{ position: 'relative' }}>
                NEXUS — Level IX
                <span 
                  ref={el => { if (el) redactionsRef.current[1] = el }}
                  className={styles.redactedBar}
                  style={{ position: 'absolute', inset: '-1px -4px', background: '#000', transformOrigin: 'left' }}
                />
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className={styles.darkStatus}>HIGHLY REDACTED</dd>
            </div>
            <div>
              <dt>Settlement</dt>
              <dd style={{ position: 'relative' }}>
                Site Kennedy — Remote Settlement
                <span 
                  ref={el => { if (el) redactionsRef.current[2] = el }}
                  className={styles.redactedBar}
                  style={{ position: 'absolute', inset: '-1px -4px', background: '#000', transformOrigin: 'left' }}
                />
              </dd>
            </div>
          </dl>
        </article>

        <DialogueBox 
          speaker="SITE KENNEDY COMMAND" 
          side="left" 
          style="command" 
          signalStrength={86} 
          text="Recovery Agent, a classified government task force was deployed to investigate unusual activity within a remote settlement designated Site Kennedy. All communication was lost three weeks later."
        />
        
        <DialogueBox 
          speaker="SITE KENNEDY COMMAND" 
          side="right" 
          style="command" 
          signalStrength={72} 
          text="The Aetherion fragment is the source of the parasitic organism. Your directive: recover the fragment before the timeline fracture becomes irreversible."
        />

        {/* Case Dossier Component — replacing TerminalReplay */}
        <CaseDossier onComplete={() => setArchiveRead(true)} />

        <div className={styles.narrativeEtch} style={{ marginTop: '3rem' }}>
          <p>In 1996, initial reports described isolated medical incidents and unexplained disappearances. Personnel began reporting unusual behavior among residents. Witness accounts contradicted one another.</p>
          <p style={{ marginTop: '1.5rem' }}>Medical examinations produced inconsistent results. Three weeks later, all contact with Site Kennedy was lost. The investigation was classified and archived under <strong>PROJECT NULL</strong>.</p>
        </div>

        <DialogueBox 
          speaker="PROJECT NULL ARCHIVE" 
          side="center" 
          style="classified" 
          text="ARCHIVE ACCESS GRANTED. Proceed through the quarantine checkpoint. Your identity will be verified."
        />
      </div>
    </section>
  )
}
