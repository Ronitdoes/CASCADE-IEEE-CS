"use client";
import '../styles.css';

import { useState, useEffect } from 'react';
import { markCaseCompleted } from '@/components/case-progress';
import dynamic from 'next/dynamic';
import { useAudio } from '@/components/AudioProvider';
import { useGameEngine } from '../hooks/useGameEngine';
import { Minimap } from './Minimap';
import { QuestionModal } from './QuestionModal';
import { StoryModal } from './StoryModal';
import { ArrowUp, ArrowDown, CornerUpLeft, CornerUpRight, Map } from 'lucide-react';

const FirstPersonView = dynamic(
  () => import('./FirstPersonView').then(mod => mod.FirstPersonView),
  { ssr: false }
);

export default function GameContainer() {
  const { changeBGM } = useAudio();
  const { 
    player, anomalies, activeAnomaly, solveAnomaly, closeAnomaly, 
    gameWon, allSolved, movePlayer, turnPlayer, levelIndex, currentMap,
    showStory, finishStory
  } = useGameEngine();

  const [showMap, setShowMap] = useState<boolean>(true);

  useEffect(() => {
    changeBGM('/cathedral.wav');
    return () => {
      changeBGM('/audio/story-start2.mp3');
    };
  }, [changeBGM]);

  useEffect(() => {
    (window as any).map = () => {
      setShowMap(prev => !prev);
      return "Map visibility toggled.";
    };
    return () => {
      delete (window as any).map;
    };
  }, []);

  useEffect(() => {
    if (gameWon) {
      markCaseCompleted("03");
      const timer = setTimeout(() => {
        window.location.href = '/hunt';
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameWon]);

  const solvedCount = Object.values(anomalies).filter(a => a.solved).length;
  const totalAnomalies = Object.keys(anomalies).length;

  return (
    <div className="game-container">
      <div className="scanline-overlay"></div>

      <div className="hud-area">
        <div className="hud-box">
          <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>PROJECT NULL</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>SECTOR: RUINS {levelIndex + 1}</p>
          {levelIndex === 0 && (
            <p style={{ margin: '8px 0 0 0' }}>Anomalies Sealed: {solvedCount} / {totalAnomalies}</p>
          )}
          {levelIndex === 1 && (
            <p style={{ margin: '8px 0 0 0', color: 'var(--color-success)' }}>Flame Sanctuary Reached</p>
          )}
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'var(--desktop-instructions)', marginTop: '8px' }}>W,A,S,D to navigate</p>
        </div>
      </div>

      <div className="viewport-area">
        <FirstPersonView player={player} anomalies={anomalies} allSolved={allSolved} currentMap={currentMap} />
      </div>

      <div className="controls-area">
        <div className="d-pad">
          <button className="basic-btn control-btn" onClick={() => turnPlayer(-1)}><CornerUpLeft size={28} /></button>
          <div className="up-down">
            <button className="basic-btn control-btn" onClick={() => movePlayer(0, 1)}><ArrowUp size={28} /></button>
            <button className="basic-btn control-btn" onClick={() => movePlayer(0, -1)}><ArrowDown size={28} /></button>
          </div>
          <button className="basic-btn control-btn" onClick={() => turnPlayer(1)}><CornerUpRight size={28} /></button>
        </div>
      </div>

      {/* Manual toggle map for mobile/convenience */}
      <button 
        onClick={() => setShowMap(prev => !prev)}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 60,
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid var(--color-accent)',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--color-accent)',
          cursor: 'pointer'
        }}
        title="Toggle Map"
      >
        <Map size={20} />
      </button>

      {showMap && (
        <div className="minimap-area">
          <Minimap player={player} anomalies={anomalies} allSolved={allSolved} currentMap={currentMap} />
        </div>
      )}

      <QuestionModal activeAnomaly={activeAnomaly} solveAnomaly={solveAnomaly} closeAnomaly={closeAnomaly} showMap={showMap} />

      {showStory && <StoryModal onClose={finishStory} />}

      {gameWon && (
        <div className="win-screen">
          <h1 className="glitch-text" data-text="FLAME REKINDLED">
            FLAME STOKED
          </h1>
          <p className="win-subtext">The fire grows warm. The timeline has stabilized.</p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => { markCaseCompleted("03"); window.location.href = '/hunt'; }}
              className="basic-btn"
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                background: 'rgba(0, 0, 0, 0.5)',
                cursor: 'pointer',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              Return to Hub
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              Redirecting automatically in 5 seconds...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
