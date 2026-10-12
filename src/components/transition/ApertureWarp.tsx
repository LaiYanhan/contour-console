import React, { useEffect, useState } from 'react';
import { tacticalAudio } from '../audio/TacticalAudio';

interface ApertureWarpProps {
  isActive: boolean;
  onTransitionComplete: () => void;
}

export const ApertureWarp: React.FC<ApertureWarpProps> = ({
  isActive,
  onTransitionComplete,
}) => {
  // Phase: 'idle' | 'collapse' | 'burst' | 'fadeout'
  const [phase, setPhase] = useState<'idle' | 'collapse' | 'burst' | 'fadeout'>('idle');

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    // Step 1: Collapse screen vertically into a single horizontal laser beam
    setPhase('collapse');
    tacticalAudio.playTransition();

    // Step 2: At 320ms, condense to singularity and blast radial shockwave
    const t1 = setTimeout(() => {
      setPhase('burst');
      tacticalAudio.playSuccess();
    }, 320);

    // Step 3: At 650ms, switch page state under the fading burst
    const t2 = setTimeout(() => {
      onTransitionComplete();
      setPhase('fadeout');
    }, 650);

    // Step 4: Finish transition at 950ms
    const t3 = setTimeout(() => {
      setPhase('idle');
    }, 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onTransitionComplete]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex items-center justify-center select-none">
      {/* 1. Stage 1: Horizontal Laser Beam Collapse */}
      {phase === 'collapse' && (
        <div className="w-full flex items-center justify-center animate-pulse">
          <div
            className="w-full h-1 bg-white shadow-[0_0_35px_#ffe600,0_0_15px_#ffffff] transition-all duration-300"
            style={{
              animation: 'laserCollapse 0.32s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
            }}
          />
        </div>
      )}

      {/* 2. Stage 2: Radial CAD Shockwave Explosion & Crosshairs */}
      {(phase === 'burst' || phase === 'fadeout') && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Central Flash */}
          <div className="absolute w-40 h-40 rounded-full bg-endfield-yellow/40 blur-2xl animate-ping" />

          {/* Expanding Shockwave Ring */}
          <div
            className="w-24 h-24 rounded-full border-4 border-endfield-yellow shadow-[0_0_50px_#ffe600] animate-ping"
            style={{ animationDuration: '0.6s' }}
          />

          {/* High-speed CAD Crosshairs and Tactical Coordinates */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-endfield-yellow/80 shadow-[0_0_10px_#ffe600]" />
            <div className="h-full w-[1px] absolute bg-endfield-yellow/80 shadow-[0_0_10px_#ffe600]" />
          </div>

          {/* Center Status Stamp */}
          <div className="absolute z-10 flex flex-col items-center justify-center bg-endfield-bg/90 border border-endfield-yellow px-6 py-2 shadow-glow-yellow">
            <span className="text-xs font-mono font-bold tracking-[0.3em] text-endfield-yellow uppercase animate-pulse">
              // WARP OVERRIDE: SECTOR 04 //
            </span>
            <span className="text-[10px] font-mono text-gray-200 mt-1">
              HOLOTABLE TELEMETRY SYNCHRONIZED
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
