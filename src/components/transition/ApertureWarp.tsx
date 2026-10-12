import React, { useEffect, useState } from 'react';
import { MatrixRain } from './MatrixRain';
import { tacticalAudio } from '../audio/TacticalAudio';

interface ApertureWarpProps {
  isActive: boolean;
  onTransitionComplete: () => void;
}

const AVALANCHE_LOGS = [
  '[CRITICAL] KERNEL NEURAL LINK SATURATION: 99.4%',
  '[BUS_OVERLOAD] INTRUSION PROTOCOL BYPASS DETECTED',
  '[MEM_DUMP] 0x7FFF98A2 -> 0x7FFFFFFF FLUSHING BUFFER...',
  '[CTOS_SYS] DECRYPTING VALLEY IV TOPOGRAPHY MATRICES',
  '[OVERRIDE] TALOS SUBSURFACE LIDAR TELEMETRY READY',
  '[CASCADE] MATRIX SIGNAL INTERFERENCE CRITICAL',
];

export const ApertureWarp: React.FC<ApertureWarpProps> = ({
  isActive,
  onTransitionComplete,
}) => {
  // Stages: 'idle' | 'logs' | 'matrix' | 'collapse' | 'burst' | 'fadeout'
  const [phase, setPhase] = useState<'idle' | 'logs' | 'matrix' | 'collapse' | 'burst' | 'fadeout'>('idle');
  const [logIndex, setLogIndex] = useState(0);

  const handleSkip = () => {
    if (phase === 'idle') return;
    onTransitionComplete();
    setPhase('idle');
  };

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    // Stage 1: Log Avalanche (0ms - 450ms)
    setPhase('logs');
    tacticalAudio.playKeyClick();

    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % AVALANCHE_LOGS.length);
      tacticalAudio.playKeyClick();
    }, 70);

    // Stage 2: Matrix Rain Cascade (450ms - 1150ms)
    const tMatrix = setTimeout(() => {
      clearInterval(logInterval);
      setPhase('matrix');
      tacticalAudio.playTransition();
    }, 450);

    // Stage 3: CRT Laser Collapse (1150ms - 1500ms)
    const tCollapse = setTimeout(() => {
      setPhase('collapse');
      tacticalAudio.playTransition();
    }, 1150);

    // Stage 3.5: Singularity & CAD Burst (1500ms - 1800ms)
    const tBurst = setTimeout(() => {
      setPhase('burst');
      tacticalAudio.playSuccess();
    }, 1500);

    // Stage 4: Mount Holotable under fading burst (1750ms)
    const tMount = setTimeout(() => {
      onTransitionComplete();
      setPhase('fadeout');
    }, 1750);

    // Finish (2150ms)
    const tEnd = setTimeout(() => {
      setPhase('idle');
    }, 2150);

    return () => {
      clearInterval(logInterval);
      clearTimeout(tMatrix);
      clearTimeout(tCollapse);
      clearTimeout(tBurst);
      clearTimeout(tMount);
      clearTimeout(tEnd);
    };
  }, [isActive, onTransitionComplete]);

  // Global key to skip transition
  useEffect(() => {
    if (phase === 'idle') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center select-none cursor-pointer"
    >
      {/* Skip indicator prompt */}
      <div className="absolute top-4 right-4 z-[120] text-xs font-mono text-endfield-yellow/80 bg-endfield-bg/80 border border-endfield-border px-2 py-1">
        [CLICK / SPACE TO SKIP WARP]
      </div>

      {/* 1. Stage 1: Log Avalanche Overload */}
      {phase === 'logs' && (
        <div className="absolute inset-0 bg-endfield-bg/95 flex flex-col items-center justify-center font-mono p-4 z-[105]">
          <div className="w-full max-w-xl space-y-1">
            <div className="text-endfield-crimson font-bold text-sm tracking-widest animate-pulse border-b border-endfield-crimson pb-1 mb-2">
              [WARNING: TELEMETRY OVERLOAD DETECTED]
            </div>
            {AVALANCHE_LOGS.slice(0, logIndex + 1).map((log, i) => (
              <div key={i} className="text-xs text-endfield-yellow font-semibold truncate">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Stage 2: Matrix Code Rain Cascade */}
      {phase === 'matrix' && (
        <div className="absolute inset-0 z-[110] bg-endfield-bg/90">
          <MatrixRain opacity={1} />
          {/* Centered Overload Stamp */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-endfield-bg/90 border-2 border-endfield-emerald px-6 py-3 font-mono text-center shadow-glow-yellow animate-pulse">
              <span className="text-xs text-endfield-emerald font-bold tracking-widest uppercase">
                // SYSTEM OVERRIDE: NEURAL CASCADE ACTIVE //
              </span>
              <p className="text-[10px] text-gray-200 mt-1">
                TRANSITION MATRIX SYNCHRONIZING WITH SECTOR 04
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Stage 3: Horizontal Laser Beam Collapse */}
      {phase === 'collapse' && (
        <div className="w-full h-full bg-endfield-bg flex items-center justify-center z-[115]">
          <div
            className="w-full h-1 bg-white shadow-[0_0_40px_#ffe600,0_0_20px_#ffffff] transition-all duration-300"
            style={{
              animation: 'laserCollapse 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
            }}
          />
        </div>
      )}

      {/* 4. Stage 3.5 & 4: Radial CAD Shockwave Explosion & Crosshairs */}
      {(phase === 'burst' || phase === 'fadeout') && (
        <div
          className={`absolute inset-0 z-[115] flex items-center justify-center transition-opacity duration-300 ${
            phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Central Flash */}
          <div className="absolute w-56 h-56 rounded-full bg-endfield-yellow/40 blur-3xl animate-ping" />

          {/* Expanding Shockwave Ring */}
          <div
            className="w-32 h-32 rounded-full border-4 border-endfield-yellow shadow-[0_0_60px_#ffe600] animate-ping"
            style={{ animationDuration: '0.6s' }}
          />

          {/* High-speed CAD Crosshairs and Tactical Coordinates */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-endfield-yellow shadow-[0_0_15px_#ffe600]" />
            <div className="h-full w-[1px] absolute bg-endfield-yellow shadow-[0_0_15px_#ffe600]" />
          </div>

          {/* Center Status Stamp */}
          <div className="absolute z-10 flex flex-col items-center justify-center bg-endfield-bg/95 border border-endfield-yellow px-8 py-3 shadow-glow-yellow">
            <span className="text-sm font-mono font-bold tracking-[0.3em] text-endfield-yellow uppercase animate-pulse">
              // WARP OVERRIDE: SECTOR 04 //
            </span>
            <span className="text-xs font-mono text-gray-200 mt-1">
              HOLOTABLE TELEMETRY ONLINE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
