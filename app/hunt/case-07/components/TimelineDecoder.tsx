'use client'

import { useState, useEffect } from 'react'
import styles from '../operation-deadlight.module.css'
import { sounds } from '@/app/hunt/case-07/utils/SoundEffects'

interface TimelineDecoderProps {
  onComplete: () => void
}

interface CaseNode {
  id: string
  label: string
  title: string
  correlation: string
  summary: string
  cx: number
  cy: number
}

export function TimelineDecoder({ onComplete }: TimelineDecoderProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visitedNodes, setVisitedNodes] = useState<Record<string, boolean>>({})

  const caseNodes: CaseNode[] = [
    { id: 'case-01', label: 'CF-01', title: "The Pharaoh's Curse", correlation: '27%', summary: 'A black circular symbol recovered beside the Heart of Osiris matches markings discovered in multiple subsequent files.', cx: 70, cy: 30 },
    { id: 'case-02', label: 'CF-02', title: 'The Lost Chronicle', correlation: '14%', summary: 'Aurelis kingdom database records disappeared. History was rewritten, leaving only NULL copies.', cx: 160, cy: 20 },
    { id: 'case-03', label: 'CF-03', title: 'The Dying Flame', correlation: '19%', summary: 'An entire underground volcanic settlement faded generation by generation, referencing chronological memory wipes.', cx: 250, cy: 30 },
    { id: 'case-04', label: 'CF-04', title: 'The Crimson Carnival', correlation: '12%', summary: 'The Ferris Wheel counting sequence and Mirror Maze reflections aligned with declassified temporal pathways.', cx: 330, cy: 50 },
    { id: 'case-05', label: 'CF-05', title: 'The Blue Ledger', correlation: '18%', summary: 'Subject Heisenberg attempted the artificial insertion of human memory strings into unrelated timelines.', cx: 290, cy: 110 },
    { id: 'case-06', label: 'CF-06', title: 'Override Sequence', correlation: '22%', summary: 'Artificial intelligence SYBIL was shut down after proving that timeline realities could be retroactively rewritten.', cx: 110, cy: 110 },
  ]

  const handleNodeClick = (id: string) => {
    sounds.playClick()
    setSelectedNodeId(id)
    setVisitedNodes(prev => ({ ...prev, [id]: true }))
  }

  // Complete when all 6 nodes have been visited
  const allNodesVisited = caseNodes.every(node => visitedNodes[node.id])

  useEffect(() => {
    if (allNodesVisited) {
      sounds.playSuccess()
      onComplete()
    }
  }, [allNodesVisited, onComplete])

  return (
    <div className={styles.timelineDecoder}>
      {/* Graphic SVG Node Network Map */}
      <div className={styles.decoderMapContainer}>
        <svg viewBox="0 0 400 160" className={styles.decoderSvg}>
          {/* Connection Lines from cases to central DEADLIGHT node */}
          {caseNodes.map(node => (
            <line
              key={`line-${node.id}`}
              x1={node.cx}
              y1={node.cy}
              x2={200}
              y2={80}
              stroke={visitedNodes[node.id] ? '#ff9100' : '#3a2010'}
              strokeWidth={selectedNodeId === node.id ? '2' : '1'}
              strokeDasharray={selectedNodeId === node.id ? '4 2' : 'none'}
              className={styles.decoderLink}
            />
          ))}

          {/* Central DEADLIGHT Node */}
          <circle
            cx={200}
            cy={80}
            r={16}
            fill={allNodesVisited ? '#00cc66' : '#2c1810'}
            stroke={allNodesVisited ? '#00ff88' : '#8b6914'}
            strokeWidth="2"
            className={`${styles.centralNode} ${allNodesVisited ? styles.centralNodeActive : ''}`}
          />
          <text
            x={200}
            y={84}
            textAnchor="middle"
            fill={allNodesVisited ? '#050505' : '#8a8070'}
            className={styles.centralNodeText}
          >
            {allNodesVisited ? 'ACTIVE' : 'NULL'}
          </text>

          {/* Case Nodes */}
          {caseNodes.map(node => (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className={`${styles.nodeGroup} ${selectedNodeId === node.id ? styles.nodeGroupSelected : ''} ${visitedNodes[node.id] ? styles.nodeGroupVisited : ''}`}
            >
              <circle cx={node.cx} cy={node.cy} r={10} />
              <text x={node.cx} y={node.cy + 3} textAnchor="middle">
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Selected Node Details Box */}
      <div className={styles.decoderDetailsBox}>
        {selectedNodeId ? (
          (() => {
            const node = caseNodes.find(n => n.id === selectedNodeId)
            return (
              <div className={styles.nodeDetails}>
                <div className={styles.nodeDetailsHeader}>
                  <h4>{node?.title}</h4>
                  <span className={styles.nodeCorrelation}>CORRELATION: {node?.correlation}</span>
                </div>
                <p className={styles.nodeSummary}>{node?.summary}</p>
              </div>
            )
          })()
        ) : (
          <p className={styles.decoderPlaceholder}>
            SELECT A TIMELINE NODE (CF-01 TO CF-06) TO VERIFY CROSS-FILE CORRELATIONS
          </p>
        )}
      </div>

      {/* Network active banner */}
      {allNodesVisited && (
        <div className={styles.decoderSuccessBanner}>
          ✓ TIMELINE ANOMALY PATHWAYS MAP VERIFIED. Central relay active.
        </div>
      )}
    </div>
  )
}
