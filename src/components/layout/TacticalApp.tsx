import React, { useState, useEffect } from 'react';
import type { OperatorSession, TacticalView } from '../../types/tactical';
import { BootTerminal } from '../terminal/BootTerminal';
import { Holotable } from '../holotable/Holotable';
import { TacticalSurface } from '../surface/TacticalSurface';
import { HeaderHUD } from './HeaderHUD';
import { tacticalAudio } from '../audio/TacticalAudio';

export const TacticalApp: React.FC = () => {
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [currentView, setCurrentView] = useState<TacticalView>('terminal');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Restore session from sessionStorage on client load
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = sessionStorage.getItem('endfield_operator_session');
      if (stored) {
        const parsed = JSON.parse(stored) as OperatorSession;
        setSession(parsed);
        // If session was already stored, go straight to Holotable
        setCurrentView('holotable');
      }
    } catch {
      // Storage fallback
    }
  }, []);

  // Global hotkey: press ~ (backtick/tilde) to toggle Terminal Drawer
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        tacticalAudio.playPromptBeep();
        setIsDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Prevent SSR flash
  if (!isMounted) {
    return (
      <div className="w-screen h-screen bg-endfield-bg flex items-center justify-center font-mono text-endfield-yellow text-xs">
        [INITIALIZING TALOS-II PROTOCOL...]
      </div>
    );
  }

  const handleNavigate = (view: TacticalView) => {
    if (view === 'terminal') {
      setCurrentView('terminal');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="w-screen h-screen bg-endfield-bg text-gray-200 overflow-hidden flex flex-col relative select-none">
      {/* 1. Header HUD (Shown when in Holotable or Tactical Surface) */}
      {currentView !== 'terminal' && (
        <HeaderHUD
          session={session}
          currentView={currentView}
          onNavigate={handleNavigate}
          onToggleTerminalDrawer={() => setIsDrawerOpen((prev) => !prev)}
        />
      )}

      {/* 2. Main Viewport Surface */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {/* Fullscreen Boot Terminal */}
        {currentView === 'terminal' && (
          <BootTerminal
            session={session}
            onSessionChange={(s) => setSession(s)}
            onNavigate={handleNavigate}
          />
        )}

        {/* 3D Holotable Command Console */}
        {currentView === 'holotable' && (
          <Holotable
            session={session}
            currentView={currentView}
            onNavigate={handleNavigate}
          />
        )}

        {/* Modular Tactical Surface Sub-views */}
        {currentView !== 'terminal' && currentView !== 'holotable' && (
          <TacticalSurface
            view={currentView}
            session={session}
            onExit={() => handleNavigate('holotable')}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* 3. Dropdown Terminal Drawer (Summoned via `~` hotkey or Header button) */}
      {isDrawerOpen && (
        <div className="absolute inset-x-0 top-0 h-[65vh] z-50 shadow-2xl transition-all duration-300 animate-slide-down">
          <BootTerminal
            session={session}
            onSessionChange={(s) => setSession(s)}
            onNavigate={handleNavigate}
            isDrawer={true}
            onCloseDrawer={() => setIsDrawerOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
