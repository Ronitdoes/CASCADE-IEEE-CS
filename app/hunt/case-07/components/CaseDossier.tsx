'use client'

import { useState, useEffect } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

interface CaseDossierProps {
  onComplete: () => void
}

export function CaseDossier({ onComplete }: CaseDossierProps) {
  const [activeTab, setActiveTab] = useState<'briefing' | 'logs' | 'evidence'>('briefing')
  const [logIndex, setLogIndex] = useState(0)
  const [viewedTabs, setViewedTabs] = useState({ briefing: true, logs: false, evidence: false })
  const [stamped, setStamped] = useState(false)

  const logLines = [
    'PROJECT NULL // MISSION DIRECTIVE CF-07-IR-9142',
    'DATE: MARCH 14, 1996 // SITE: KENNEDY UNDERGROUND RELAY',
    '--------------------------------------------------',
    '1. The recovered records point to a facility that does not exist on any official map.',
    '2. No agency claims ownership. No construction records remain.',
    '3. Yet the system continued operating. Every missing investigation passed through this terminal.',
    '4. Researchers referred to it as DEADLIGHT. Its purpose was never explained.',
    '5. Entire investigations disappeared without leaving a trace.',
  ]

  // Track completion
  useEffect(() => {
    if (viewedTabs.briefing && viewedTabs.logs && viewedTabs.evidence && logIndex >= logLines.length - 1) {
      onComplete()
    }
  }, [viewedTabs, logIndex, onComplete])

  const handleTabChange = (tab: 'briefing' | 'logs' | 'evidence') => {
    sounds.playPageFlip()
    setActiveTab(tab)
    setViewedTabs(prev => ({ ...prev, [tab]: true }))
  }

  const nextLog = () => {
    if (logIndex < logLines.length - 1) {
      sounds.playClick()
      setLogIndex(prev => prev + 1)
    } else {
      sounds.playReveal()
      setViewedTabs(prev => ({ ...prev, logs: true }))
    }
  }

  const triggerStamp = () => {
    if (stamped) return
    sounds.playStamp()
    setStamped(true)
    setViewedTabs(prev => ({ ...prev, evidence: true }))
  }

  return (
    <div className={styles.dossierFolder}>
      {/* Folder Tabs */}
      <div className={styles.folderTabs}>
        <button
          onClick={() => handleTabChange('briefing')}
          className={`${styles.folderTab} ${activeTab === 'briefing' ? styles.folderTabActive : ''}`}
        >
          📋 I. BRIEFING
        </button>
        <button
          onClick={() => handleTabChange('logs')}
          className={`${styles.folderTab} ${activeTab === 'logs' ? styles.folderTabActive : ''}`}
        >
          📂 II. ARCHIVE LOGS
        </button>
        <button
          onClick={() => handleTabChange('evidence')}
          className={`${styles.folderTab} ${activeTab === 'evidence' ? styles.folderTabActive : ''}`}
        >
          🔍 III. EVIDENCE
        </button>
      </div>

      {/* Paper Content */}
      <div className={styles.dossierPaper}>
        {/* PaperClip decoration */}
        <div className={styles.paperClip} />

        {activeTab === 'briefing' && (
          <div className={styles.dossierContentTab}>
            <div className={styles.dossierStamp}>TOP SECRET</div>
            <h3>FILE: CF-07-IR-9142</h3>
            <p className={styles.dossierMeta}>DEPTH: LEVEL X (OMEGA ACCESS) // CLASSIFICATION: BLACK SIGMA</p>
            <hr />
            <div className={styles.dossierBodyText}>
              <p>
                <strong>SUMMARY OF INVESTIGATION:</strong>
              </p>
              <p>
                A remote underground station was discovered during secondary survey grids. 
                The facility has no known records of funding or operational history. 
                All blueprints, staff details, and security clearance reports have been cleared.
              </p>
              <p>
                Yet the machines remained active. Power levels were consistent with active data routing operations. 
                Any timeline investigations showing anomalies seem to have routed through this terminal center.
              </p>
              <p className={styles.dossierActionHint}>
                → Click the <strong>II. ARCHIVE LOGS</strong> tab to recover the transmission packets.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className={styles.dossierContentTab}>
            <h3>RECOVERED LOG ENTRIES</h3>
            <p className={styles.dossierMeta}>TRANSMISSION BUFFER RECONSTRUCTION</p>
            <hr />
            <div className={styles.dossierLogBox}>
              {logLines.slice(0, logIndex + 1).map((line, idx) => (
                <p key={idx} className={styles.dossierLogLine}>
                  {line}
                </p>
              ))}
            </div>

            {logIndex < logLines.length - 1 ? (
              <button onClick={nextLog} className={styles.dossierButton}>
                ▶ DECRYPT NEXT RECORD ENTRY
              </button>
            ) : (
              <div className={styles.dossierSuccessBanner}>
                ✓ ALL LOGS RESTORED. Proceed to the <strong>III. EVIDENCE</strong> tab to authenticate.
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className={styles.dossierContentTab}>
            <h3>EVIDENCE EXHIBITS</h3>
            <p className={styles.dossierMeta}>CLASSIFIED PHOTOGRAPHIC & PHYSICAL CLUES</p>
            <hr />
            <div className={styles.evidenceGrid}>
              <div className={styles.evidenceCard}>
                <div className={styles.polaroidFrame}>
                  <div className={styles.polaroidImagePlaceholder}>
                    <span>[ REDACTED RADAR PLOT ]</span>
                  </div>
                  <p className={styles.polaroidCaption}>EXHIBIT A: Relay Site coordinates</p>
                </div>
              </div>

              <div className={styles.evidenceCard}>
                <div className={styles.stampActionBox}>
                  <p>Site Security Seal verification required to authorize clearance.</p>
                  <button
                    onClick={triggerStamp}
                    className={`${styles.dossierButton} ${stamped ? styles.dossierButtonDisabled : ''}`}
                    disabled={stamped}
                  >
                    {stamped ? '✓ SITE SEAL APPLIED' : 'APPLY AUTHORIZATION STAMP'}
                  </button>

                  {stamped && (
                    <div className={styles.physicalStamp}>
                      APPROVED
                    </div>
                  )}
                </div>
              </div>
            </div>

            {stamped && (
              <div className={styles.dossierCompleteNote}>
                ✓ Dossier audit complete. Proceed with the containment verification sequence.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
