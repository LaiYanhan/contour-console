import React, { useEffect, useState } from 'react';
import { MatrixRain } from './MatrixRain';
import { tacticalAudio } from '../audio/TacticalAudio';

export type TransitionDirection = 'forward' | 'backward';

interface ApertureWarpProps {
  isActive: boolean;
  direction?: TransitionDirection;
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
  direction = 'forward',
  onTransitionComplete,
}) => {
  // Stages: 'idle' | 'logs' | 'matrix' | 'collapse' | 'burst' | 'fadeout' | 'backward_deconstruct'
  const [phase, setPhase] = useState<
    'idle' | 'logs' | 'matrix' | 'collapse' | 'burst' | 'fadeout' | 'backward_deconstruct'
  >('idle');
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

    // ==========================================================
    // BACKWARD DIRECTION: Holotable -> Terminal (Lightweight ASCII Deconstruction)
    // ==========================================================
    if (direction === 'backward') {
      setPhase('backward_deconstruct');
      tacticalAudio.playKeyClick();

      // Deconstruct for ~0.35s and cleanly return to terminal
      const tBack = setTimeout(() => {
        onTransitionComplete();
        setPhase('idle');
      }, 360);

      return () => {
        clearTimeout(tBack);
      };
    }

    // ==========================================================
    // FORWARD DIRECTION: Terminal -> Holotable (Full 5x Matrix Rain + Laser Burst)
    // ==========================================================
    // Stage 1: Log Avalanche (0ms - 450ms)
    setPhase('logs');
    tacticalAudio.playKeyClick();

    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % AVALANCHE_LOGS.length);
      tacticalAudio.playKeyClick();
    }, 70);

    // Stage 2: 5x Extended Matrix Code Rain Cascade (450ms - 3800ms, ~3.35s of pure rain!)
    const tMatrix = setTimeout(() => {
      clearInterval(logInterval);
      setPhase('matrix');
      tacticalAudio.playTransition();
    }, 450);

    // Stage 3: CRT Laser Collapse (3800ms - 4150ms) - Direct collapse without showing terminal
    const tCollapse = setTimeout(() => {
      setPhase('collapse');
      tacticalAudio.playTransition();
    }, 3800);

    // Stage 3.5: Singularity Detonation & CAD Burst (4150ms - 4450ms)
    const tBurst = setTimeout(() => {
      setPhase('burst');
      tacticalAudio.playSuccess();
    }, 4150);

    // Stage 4: Mount Holotable under fading burst (4400ms)
    const tMount = setTimeout(() => {
      onTransitionComplete();
      setPhase('fadeout');
    }, 4400);

    // Finish transition (4700ms)
    const tEnd = setTimeout(() => {
      setPhase('idle');
    }, 4700);

    return () => {
      clearInterval(logInterval);
      clearTimeout(tMatrix);
      clearTimeout(tCollapse);
      clearTimeout(tBurst);
      clearTimeout(tMount);
      clearTimeout(tEnd);
    };
  }, [isActive, direction, onTransitionComplete]);

  // Global key to skip forward transition
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
      className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center select-none cursor-pointer bg-[#0A0C0F]"
    >
      {/* Skip indicator prompt (Only during forward long transition) */}
      {direction === 'forward' && phase !== 'fadeout' && (
        <div className="absolute top-4 right-4 z-[125] text-xs font-mono text-endfield-yellow bg-endfield-bg/90 border border-endfield-yellow/60 px-3 py-1 shadow-glow-yellow-sm animate-pulse">
          [PRESS SPACE / ESC / CLICK TO SKIP WARP]
        </div>
      )}

      {/* ======================================================== */}
      {/* BACKWARD DECONSTRUCTION OVERLAY (Holotable -> Terminal) */}
      {/* ======================================================== */}
      {phase === 'backward_deconstruct' && (
        <div className="absolute inset-0 bg-[#0A0C0F] z-[120] flex flex-col items-center justify-center font-mono p-4">
          <div className="w-full max-w-lg space-y-1 text-center">
            <span className="text-sm font-bold text-endfield-yellow text-glow-yellow tracking-widest animate-pulse uppercase">
              // REVERTING TO TTY PROTOCOL BUFFER //
            </span>
            <div className="text-xs text-endfield-slate mt-2 tracking-wider">
              [DECONSTRUCTING VOLUMETRIC HOLOTABLE SHADER... PASS]
            </div>
            {/* Quick scanline glitch bar */}
            <div className="w-full h-1 bg-endfield-yellow/60 mt-3 animate-ping" />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORWARD STAGE 1: Log Avalanche Overload */}
      {/* ======================================================== */}
      {phase === 'logs' && (
        <div className="absolute inset-0 bg-[#0A0C0F] flex flex-col items-center justify-center font-mono p-4 z-[105]">
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

      {/* ======================================================== */}
      {/* FORWARD STAGE 2: 5x Extended Matrix Code Rain Cascade */}
      {/* ======================================================== */}
      {phase === 'matrix' && (
        <div className="absolute inset-0 z-[110] bg-[#0A0C0F]">
          <MatrixRain opacity={1} />
          {/* Centered Overload Stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#0A0C0F]/95 border-2 border-endfield-yellow px-8 py-3.5 font-mono text-center shadow-glow-yellow animate-pulse">
              <span className="text-sm text-endfield-yellow font-black tracking-widest uppercase">
                // AIC OVERLOAD: SECTOR 04 TOPOLOGY TELEMETRY //
              </span>
              <p className="text-xs text-endfield-cyan mt-1 font-mono tracking-wider font-bold">
                SUBTERRANEAN SENSOR ARRAY RE-SAMPLING STREAM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORWARD STAGE 3: Direct CRT Laser Collapse (Over Code Rain) */}
      {/* ======================================================== */}
      {phase === 'collapse' && (
        <div className="absolute inset-0 z-[115] bg-[#0A0C0F] flex items-center justify-center overflow-hidden">
          {/* Code Rain stays behind so there is ZERO flash-back to terminal */}
          <MatrixRain opacity={0.3} />
          <div
            className="w-full h-1 bg-white shadow-[0_0_50px_#ffe600,0_0_25px_#ffffff] transition-all duration-300 relative z-20"
            style={{
              animation: 'laserCollapse 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* FORWARD STAGE 3.5 & 4: Radial CAD Shockwave Explosion */}
      {/* ======================================================== */}
      {(phase === 'burst' || phase === 'fadeout') && (
        <div
          className={`absolute inset-0 z-[115] flex items-center justify-center transition-opacity duration-300 bg-[#0A0C0F] ${
            phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Central Flash */}
          <div className="absolute w-64 h-64 rounded-full bg-endfield-yellow/45 blur-3xl animate-ping" />

          {/* Expanding Shockwave Ring */}
          <div
            className="w-36 h-36 rounded-full border-4 border-endfield-yellow shadow-[0_0_60px_#ffe600] animate-ping"
            style={{ animationDuration: '0.6s' }}
          />

          {/* High-speed CAD Crosshairs and Tactical Coordinates */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-endfield-yellow shadow-[0_0_18px_#ffe600]" />
            <div className="h-full w-[1px] absolute bg-endfield-yellow shadow-[0_0_18px_#ffe600]" />
          </div>

          {/* Center Status Stamp */}
          <div className="absolute z-10 flex flex-col items-center justify-center bg-endfield-bg/95 border-2 border-endfield-yellow px-8 py-3.5 shadow-glow-yellow">
            <span className="text-sm font-mono font-black tracking-[0.3em] text-endfield-yellow uppercase animate-pulse">
              // WARP OVERRIDE: SECTOR 04 //
            </span>
            <span className="text-xs font-mono text-gray-100 mt-1 font-bold">
              HOLOTABLE TELEMETRY ONLINE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
