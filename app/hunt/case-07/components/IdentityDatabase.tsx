'use client'

import { useState, useEffect } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

interface IdentityDatabaseProps {
  onComplete: () => void
}

interface Specialist {
  id: string
  name: string
  role: string
  clearance: string
  joined: string
  anomalous: boolean
  notes: string
}

export function IdentityDatabase({ onComplete }: IdentityDatabaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({})

  const specialists: Specialist[] = [
    { id: 'bravo-01', name: 'Dr. John H. Watson', role: 'Chief Medical Specialist', clearance: 'L-VII', joined: '1995-10-12', anomalous: false, notes: 'Watson filed initial reports of localized medical incidents. Notes indicate confusion, but logic registers remained stable.' },
    { id: 'bravo-02', name: 'Agent Leon S. Kennedy', role: 'Security Coordinator', clearance: 'L-IX (NEXUS)', joined: '1996-01-04', anomalous: false, notes: 'Kennedy led secondary grids. Last logs show he located the temporal wave signatures.' },
    { id: 'bravo-03', name: 'Analyst Sarah Connor', role: 'System Auditor', clearance: 'L-VI', joined: '1995-11-22', anomalous: false, notes: 'Connor performed the baseline storage validation checks. Coherence rating 98%.' },
    { id: 'bravo-04', name: 'Specialist Kyle Reese', role: 'Temporal Analyst', clearance: 'L-VIII', joined: '1996-02-14', anomalous: false, notes: 'Reese reported offset system clock cycles in Sector 2. Verified anomalies.' },
    { id: 'bravo-05', name: 'Dr. Elizabeth Shaw', role: 'Paleobiologist', clearance: 'L-VII', joined: '1995-09-08', anomalous: false, notes: 'Shaw studied the carbonaceous matter. Reports are locked/redacted.' },
    { id: 'bravo-06', name: 'OPERATOR CLONE-X', role: 'DATABASE OVERRIDE UNIT', clearance: 'L-X (BLACK)', joined: '2026-06-30', anomalous: true, notes: '⚠️ ALERT: THIS DOSSIER CONTAINS UNMATCHED LOG ENTRIES. CREATION TIMESTAMP DETECTED POST-SHUTDOWN. METHOD OF INFILTRATION DETECTED.' },
    { id: 'bravo-07', name: 'Dr. Nathan Cooper', role: 'Bio-Engineer', clearance: 'L-VI', joined: '1995-12-05', anomalous: false, notes: 'Cooper confirmed host cells display no standard physical pathogens.' },
    { id: 'bravo-08', name: 'Specialist Claire Redfield', role: 'Security Agent', clearance: 'L-VII', joined: '1996-01-18', anomalous: false, notes: 'Redfield monitored quarantine borders. Confirmed zero containment breaches.' },
  ]

  const handleSelectSpecialist = (id: string) => {
    sounds.playClick()
    setSelectedId(id)
    setCheckedIds(prev => ({ ...prev, [id]: true }))
  }

  // Complete when anomalous specialist is inspected AND at least 3 specialists total are checked
  useEffect(() => {
    const totalChecked = Object.keys(checkedIds).length
    const checkedAnomalous = checkedIds['bravo-06'] === true

    if (totalChecked >= 3 && checkedAnomalous) {
      onComplete()
    }
  }, [checkedIds, onComplete])

  const selectedSpecialist = specialists.find(s => s.id === selectedId)

  return (
    <div className={styles.identityDb}>
      <div className={styles.identityDbGrid}>
        {/* Specialists List */}
        <div className={styles.dbListSide}>
          <div className={styles.dbListHeader}>
            BRAVO TEAM SPECIALISTS ({specialists.length})
          </div>
          <div className={styles.dbListScroll}>
            {specialists.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelectSpecialist(s.id)}
                className={`${styles.dbItemBtn} ${selectedId === s.id ? styles.dbItemBtnSelected : ''} ${s.anomalous && checkedIds[s.id] ? styles.dbItemBtnAlert : ''}`}
              >
                <div className={styles.dbItemMeta}>
                  <span>{s.role}</span>
                  <span>{s.clearance}</span>
                </div>
                <div className={styles.dbItemName}>
                  {s.name}
                  {checkedIds[s.id] && <span className={styles.dbItemCheck}>✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dossier Viewer */}
        <div className={styles.dbViewerSide}>
          {selectedSpecialist ? (
            <div className={`${styles.dossierViewerCard} ${selectedSpecialist.anomalous ? styles.dossierViewerAlert : ''}`}>
              <div className={styles.viewerStamp}>
                {selectedSpecialist.anomalous ? '⚠️ ANOMALOUS DOSSIER' : '✓ SECURE PROFILE'}
              </div>
              <h3>{selectedSpecialist.name}</h3>
              <p className={styles.viewerRole}>{selectedSpecialist.role} — Clearance {selectedSpecialist.clearance}</p>
              
              <div className={styles.viewerMetaGrid}>
                <div>
                  <span className={styles.metaLabel}>ID TAG</span>
                  <span className={styles.metaValue}>{selectedSpecialist.id.toUpperCase()}</span>
                </div>
                <div>
                  <span className={styles.metaLabel}>JOINED RECORD</span>
                  <span className={styles.metaValue}>{selectedSpecialist.joined}</span>
                </div>
              </div>

              <hr />

              <div className={styles.viewerNotesBox}>
                <p className={styles.notesLabel}>AUDIT MEMORANDUM & SYSTEM NOTES:</p>
                <p className={styles.notesText}>{selectedSpecialist.notes}</p>
              </div>
            </div>
          ) : (
            <div className={styles.dbViewerPlaceholder}>
              <p>SELECT A SPECIALIST FROM THE DIRECTORY TO REVIEW FILE LOGS</p>
            </div>
          )}
        </div>
      </div>

      {/* Database sync status info */}
      <div className={styles.identityDbFooter}>
        <span>SYSTEM INSPECTION: {Object.keys(checkedIds).length}/3 REQUIRED PROFILES AUDITED</span>
        <span>ANOMALY VERIFICATION: {checkedIds['bravo-06'] ? '✓ DETECTED' : '❌ PENDING'}</span>
      </div>
    </div>
  )
}
