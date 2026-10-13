import React, { useState } from 'react';
import type { OperatorSession, TacticalView } from '../../types/tactical';
import { tacticalAudio } from '../audio/TacticalAudio';

interface HeaderHUDProps {
  session: OperatorSession | null;
  currentView: TacticalView;
  onNavigate: (view: TacticalView) => void;
  onToggleTerminalDrawer: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  session,
  currentView,
  onNavigate,
  onToggleTerminalDrawer,
}) => {
  const [isMuted, setIsMuted] = useState(tacticalAudio.isMuted);

  const handleToggleSound = () => {
    const muted = tacticalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) tacticalAudio.playPromptBeep();
  };

  return (
    <header className="relative w-full h-14 bg-[#0C0E12]/95 backdrop-blur-xl border-b border-endfield-border px-4 flex items-center justify-between select-none z-30 shrink-0 shadow-tactical crt-panel before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
      {/* Left: Tactical Brand & Operator Identity */}
      <div className="flex items-center space-x-3">
        {/* Endfield Geometric Monogram */}
        <div
          onClick={() => {
            tacticalAudio.playTransition();
            onNavigate('holotable');
          }}
          className="cursor-pointer flex items-center space-x-2 group"
        >
          <div className="w-7 h-7 bg-endfield-yellow text-endfield-bg flex items-center justify-center font-black font-mono text-sm group-hover:bg-endfield-yellow-light transition-colors shadow-[0_0_12px_rgba(255,230,0,0.4)]">
            EF
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-mono font-bold tracking-widest text-gray-100 group-hover:text-endfield-yellow text-glow-yellow transition-colors">
              TALOS-II // ENDFIELD
            </span>
            <span className="text-[9px] font-mono text-endfield-slate">
              TACTICAL COMMAND OS
            </span>
          </div>
        </div>

        {/* Operator Badge with Clearance Level */}
        {session && (
          <div className="flex items-center space-x-2 pl-3 border-l border-endfield-border/80">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-endfield-cyan text-glow-cyan">
                  @{session.username}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase tracking-wider ${
                    session.isRoot
                      ? 'bg-endfield-crimson text-white shadow-glow-crimson'
                      : 'bg-endfield-yellow text-endfield-bg font-black'
                  }`}
                >
                  {session.clearance}
                </span>
              </div>
              <span className="text-[9px] font-mono text-endfield-muted hidden md:inline">
                TOKEN: {session.token} // STATUS: ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Image #1 Signature Resource Counters */}
      <div className="hidden md:flex items-center space-x-6 font-mono text-xs">
        {/* Yellow Power Cube Metric */}
        <div className="flex items-center space-x-2 bg-endfield-surface/90 px-3 py-1 border border-endfield-border/80 crt-panel">
          <div className="w-2.5 h-2.5 bg-endfield-yellow rotate-45 shadow-[0_0_6px_#ffe600]"></div>
          <span className="text-endfield-slate text-[10px]">ENERGY:</span>
          <span className="font-bold text-endfield-yellow text-glow-yellow">2,406</span>
        </div>

        {/* Tactical Credits / C-Metric */}
        <div className="flex items-center space-x-2 bg-endfield-surface/90 px-3 py-1 border border-endfield-border/80 crt-panel">
          <span className="text-endfield-cyan text-glow-cyan font-bold">©</span>
          <span className="text-endfield-slate text-[10px]">CREDITS:</span>
          <span className="font-bold text-gray-100 text-glow-cyan">159,640</span>
        </div>
      </div>

      {/* Right: Sound, Terminal Toggle & Exit Button */}
      <div className="flex items-center space-x-2">
        {/* Audio Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          className={`px-2 py-1 text-xs font-mono border transition-all crt-panel ${
            isMuted
              ? 'border-endfield-border text-endfield-muted hover:text-gray-200'
              : 'border-endfield-yellow/60 text-endfield-yellow text-glow-yellow bg-endfield-yellow/10 hover:bg-endfield-yellow/20'
          }`}
        >
          {isMuted ? 'SFX: OFF' : 'SFX: ON'}
        </button>

        {/* Summon Terminal Drawer */}
        <button
          onClick={() => {
            tacticalAudio.playPromptBeep();
            onToggleTerminalDrawer();
          }}
          className="px-2.5 py-1 text-xs font-mono font-bold bg-endfield-surface hover:bg-endfield-card text-endfield-cyan text-glow-cyan border border-endfield-cyan/50 hover:border-endfield-cyan transition-colors crt-panel"
          title="Toggle Terminal Drawer (or press ~)"
        >
          CLI [~]
        </button>

        {/* Exit / Return to Gateway */}
        <button
          onClick={() => {
            tacticalAudio.playTransition();
            if (currentView !== 'holotable') {
              onNavigate('holotable');
            } else {
              onNavigate('terminal');
            }
          }}
          className="p-1.5 text-xs font-mono bg-endfield-card hover:bg-endfield-yellow hover:text-endfield-bg text-endfield-slate border border-endfield-border transition-colors group flex items-center space-x-1"
          title="Return to Holotable or Gateway"
        >
          <svg
            className="w-4 h-4 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};
