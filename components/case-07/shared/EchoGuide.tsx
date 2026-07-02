'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props {
  character: 'crow' | 'archivist' | 'wisp' | 'spirit'
  actProgress: number // 0-4: which act is current
}

const dialogueMap: Record<string, Record<number, string>> = {
  crow: {
    0: 'Something cold is moving here, Agent. I can feel the fracture...',
    1: 'Site Kennedy is quarantined. Register at the checkpoint to proceed.',
    2: 'Watch the residents closely. The reports will show who is infected.',
    3: 'Containment systems have failed! Acknowledge and clear the alerts quickly!',
    4: 'A strange black symbol... solve the fragments to decode its meaning.',
    5: 'A planted dossier. Compare records side-by-side to find the suspect.',
    6: 'The timeline is corrupt. Arrange the events in chronological order.',
    7: 'Reconstruct the final transmission to recover the Aetherion fragment.',
    8: 'Fragment secured. The Core awaits your return.',
  },
  archivist: {
    0: 'The timeline is fractured. This place reeks of broken time.',
    1: 'Search for the pattern. Decode what was left behind.',
    2: 'Match the reports. The deeper you go, the darker it gets.',
    3: 'Containment is the only option. Stay focused.',
    4: 'Reconstruct the symbol to understand what is replacing them.',
    5: 'Analyze the personnel. Find the inconsistency.',
    6: 'Order the timeline. Sort the events.',
    7: 'Listen to the transmission. Rebuild it.',
    8: 'Well done. The fragment is yours. Go.',
  },
}

const ImageMap: Record<string, string> = {
  crow: '/case-file-07/agent.avif',
  archivist: '/case-file-07/curator.avif',
}

export function EchoGuide({ character, actProgress }: Props) {
  const effectiveCharacter = (character === 'wisp' || character === 'spirit') 
    ? (character === 'wisp' ? 'crow' : 'archivist') 
    : character;

  const [visible, setVisible] = useState(false)
  const [dialogue, setDialogue] = useState('')
  const [spriteState, setSpriteState] = useState<'idle' | 'talk'>('idle')

  // Fade in after 2s
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Update dialogue when act changes
  useEffect(() => {
    setTimeout(() => setSpriteState('talk'), 0)
    setTimeout(() => setDialogue(dialogueMap[effectiveCharacter]?.[actProgress] ?? ''), 0)
    const t = setTimeout(() => setSpriteState('idle'), 3000)
    return () => clearTimeout(t)
  }, [actProgress, effectiveCharacter])

  const imageSrc = ImageMap[effectiveCharacter] || '/case-file-07/raven.avif'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.6rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease',
        pointerEvents: 'none',
      }}
    >
      {dialogue && (
        <div style={{
          background: 'rgba(6,5,4,0.92)',
          border: '1px solid rgba(184,134,42,0.3)',
          borderRight: '3px solid var(--gold-mid, #b8862a)',
          padding: '0.6rem 0.9rem',
          maxWidth: '220px',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-geist-mono, monospace)',
          color: 'rgba(200,188,168,0.85)',
          lineHeight: 1.6,
          letterSpacing: '0.02em',
        }}>
          {dialogue}
        </div>
      )}
      {/* Sprite Container */}
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        background: 'radial-gradient(circle, #b8862a22 0%, transparent 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}>
        <Image 
          src={imageSrc} 
          alt={effectiveCharacter}
          width={40}
          height={40}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(184, 134, 42, 0.4))',
            opacity: spriteState === 'talk' ? 1 : 0.7,
            transform: spriteState === 'talk' ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s'
          }}
        />
      </div>
    </div>
  )
}
