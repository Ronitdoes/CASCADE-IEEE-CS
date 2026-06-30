import React from 'react';

interface Player {
  x: number;
  y: number;
  facing: number;
}

interface Anomaly {
  id: string;
  solved: boolean;
  puzzles: any[];
}

interface MinimapProps {
  player: Player;
  anomalies: Record<string, Anomaly>;
  allSolved: boolean;
  currentMap: number[][];
}

export function Minimap({ player, anomalies, allSolved, currentMap }: MinimapProps) {
  if (!currentMap) return null;

  const rowsCount = currentMap.length;
  const colsCount = currentMap[0]?.length || 0;
  const gapSize = rowsCount > 20 ? '1px' : '2px';

  return (
    <div 
      className="minimap" 
      style={{ 
        display: 'grid',
        gridTemplateRows: `repeat(${rowsCount}, 1fr)`,
        gridTemplateColumns: `repeat(${colsCount}, 1fr)`,
        gap: gapSize,
        height: '220px',
        width: '220px'
      }}
    >
      {currentMap.flatMap((row, y) => 
        row.map((cell, x) => {
          let className = "minimap-cell ";
          let anomaly = null;
          let anomalyNumber = "";

          if (cell === 1) className += "wall";
          else if (cell === 2) {
            anomaly = anomalies[`${y},${x}`];
            className += `anomaly-cell ${anomaly?.solved ? 'solved' : ''}`;
            if (anomaly) {
              anomalyNumber = anomaly.id.replace('a', '');
            }
          }
          else if (cell === 3) className += `exit ${allSolved ? 'unlocked' : ''}`;
          else if (cell === 4) className += `exit unlocked`;
          else className += "path";

          const isPlayerHere = player.x === x && player.y === y;

          return (
            <div
              key={`cell-${x}-${y}`}
              className={className}
              style={{
                position: 'relative',
                backgroundColor: cell === 4 ? 'var(--color-accent)' : undefined,
                width: '100%',
                height: '100%'
              }}
            >
              {cell === 2 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: anomaly?.solved ? 'var(--color-success)' : 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 4px rgba(0,0,0,0.6)',
                    zIndex: 2,
                  }}
                  title={anomaly?.solved ? `Solved Anomaly ${anomalyNumber}` : `Unsolved Anomaly ${anomalyNumber}`}
                >
                  <span style={{
                    fontSize: '8px',
                    fontWeight: '900',
                    color: '#000000',
                    fontFamily: 'monospace',
                    lineHeight: '1',
                  }}>
                    {anomalyNumber}
                  </span>
                </div>
              )}
              {isPlayerHere && (
                <div className="minimap-cell player" style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60%', height: '60%',
                  zIndex: 3
                }} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
