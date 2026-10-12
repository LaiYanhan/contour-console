import React, { useState, useEffect, useRef } from 'react';
import type { OperatorSession, TerminalLine, TacticalView } from '../../types/tactical';
import {
  parseAndExecuteCommand,
  getAutocompleteCandidates,
  hashPassword,
  ADMIN_CONFIG,
} from './CommandParser';
import { tacticalAudio } from '../audio/TacticalAudio';

interface BootTerminalProps {
  session: OperatorSession | null;
  onSessionChange: (session: OperatorSession | null) => void;
  onNavigate: (view: TacticalView) => void;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}

const BOOT_SEQUENCE: Array<{ text: string; type: TerminalLine['type']; delay?: number }> = [
  { text: '[ 0.000000] TALOS-II SUBTERRA KERNEL 4.19-RT COLD BOOT SEQUENCE...', type: 'system', delay: 45 },
  { text: '[ 0.038102] CPU ARCH: ARM64 // BUS SPEED: 12.8 Gbps // REGISTERS: OK', type: 'info', delay: 35 },
  { text: '[ 0.071920] WEBGPU TOPOGRAPHIC SHADER CONTEXT: INITIALIZED [60 FPS]', type: 'info', delay: 35 },
  { text: '[ 0.114290] SCANLINE RESOLUTION: 1080P // AUDIO SYNTHESIZER: ARMED', type: 'info', delay: 35 },
  { text: '[ 0.158200] DECRYPTING SECTOR 04 TOPOLOGY & LIDAR CONTOUR MESH...', type: 'warn', delay: 45 },
  { text: '[ 0.189000] [SYSTEM OVERRIDE DETECTED // RENDERING VECTOR EMBLEM]', type: 'warn', delay: 60 },
  // ASCII Emblem
  { text: '  ███████╗███╗   ██╗██████╗ ███████╗██╗███████╗██╗     ██████╗ ', type: 'ascii', delay: 30 },
  { text: '  ██╔════╝████╗  ██║██╔══██╗██╔════╝██║██╔════╝██║     ██╔══██╗', type: 'ascii', delay: 30 },
  { text: '  █████╗  ██╔██╗ ██║██║  ██║█████╗  ██║█████╗  ██║     ██║  ██║', type: 'ascii', delay: 30 },
  { text: '  ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██║██╔══╝  ██║     ██║  ██║', type: 'ascii', delay: 30 },
  { text: '  ███████╗██║ ╚████║██████╔╝██║     ██║███████╗███████╗██████╔╝', type: 'ascii', delay: 30 },
  { text: '  ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ', type: 'ascii', delay: 30 },
  { text: '    // TALOS-II PROTOCOL GATEWAY // TACTICAL ARCHITECTURE //   ', type: 'ascii', delay: 50 },
  // Gateway Ready Prompt
  { text: '================================================================', type: 'system', delay: 35 },
  { text: '[ACCESS GATEWAY]: Unauthenticated terminal session detected.', type: 'warn', delay: 40 },
  { text: 'Provisioning guest profile. Enter Operator ID (or admin for root):', type: 'info', delay: 40 },
];

export const BootTerminal: React.FC<BootTerminalProps> = ({
  session,
  onSessionChange,
  onNavigate,
  isDrawer = false,
  onCloseDrawer,
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isBooting, setIsBooting] = useState<boolean>(!session && !isDrawer);
  const [loginStep, setLoginStep] = useState<'username' | 'password' | 'authenticated'>(
    session ? 'authenticated' : 'username'
  );
  const [tempUsername, setTempUsername] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoCompleteNotice, setAutoCompleteNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bootTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to add lines with timestamps
  const appendLine = (text: string, type: TerminalLine['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLines((prev) => [...prev, { id, text, type, timestamp }]);
  };

  // Skip boot teleprinter animation and dump all lines immediately
  const skipBootAnimation = () => {
    if (!isBooting) return;
    clearTimeout(bootTimerRef.current);

    const fullLines: TerminalLine[] = BOOT_SEQUENCE.map((b, i) => ({
      id: `boot-${i}`,
      text: b.text,
      type: b.type,
      timestamp: new Date().toTimeString().split(' ')[0],
    }));

    setLines(fullLines);
    setIsBooting(false);
    tacticalAudio.playPromptBeep();
  };

  // Run teleprinter boot stream sequence
  useEffect(() => {
    if (session || isDrawer) {
      // Direct instant mount for drawer or restored session
      setIsBooting(false);
      setLines([
        {
          id: 'restored-1',
          text: `[SESSION RESUMED] Active Operator: @${session?.username || 'GUEST'} [${session?.clearance || 'LV.3'}]`,
          type: session?.isRoot ? 'root' : 'success',
          timestamp: new Date().toTimeString().split(' ')[0],
        },
        {
          id: 'restored-2',
          text: "Type 'help' to review command matrix or 'system.connect holotable' to launch.",
          type: 'warn',
        },
      ]);
      return;
    }

    let currentIndex = 0;
    const streamNext = () => {
      if (currentIndex >= BOOT_SEQUENCE.length) {
        setIsBooting(false);
        tacticalAudio.playPromptBeep();
        return;
      }

      const item = BOOT_SEQUENCE[currentIndex];
      const id = `boot-${currentIndex}`;
      const timestamp = new Date().toTimeString().split(' ')[0];

      setLines((prev) => [...prev, { id, text: item.text, type: item.type, timestamp }]);
      tacticalAudio.playKeyClick();
      currentIndex++;

      bootTimerRef.current = setTimeout(streamNext, item.delay || 40);
    };

    bootTimerRef.current = setTimeout(streamNext, 120);
    return () => {
      clearTimeout(bootTimerRef.current);
    };
  }, []);

  // Auto-scroll on lines / input changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, inputValue, loginStep]);
  // Always keep focus on the active in-line input
  const handleTerminalClick = () => {
    if (isBooting) {
      skipBootAnimation();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isBooting) {
      skipBootAnimation();
      return;
    }

    tacticalAudio.playKeyClick();

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      if (loginStep !== 'authenticated') return;

      const candidates = getAutocompleteCandidates(inputValue, session?.isRoot ?? false);
      if (candidates.length === 1) {
        setInputValue(candidates[0]);
        setAutoCompleteNotice(null);
        tacticalAudio.playPromptBeep();
      } else if (candidates.length > 1) {
        setAutoCompleteNotice(`Suggestions: ${candidates.join('  |  ')}`);
        tacticalAudio.playPromptBeep();
      } else {
        setAutoCompleteNotice('No matching tactical command');
      }
      return;
    }

    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx);
          setInputValue(history[history.length - 1 - nextIdx]);
        }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputValue(history[history.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
      return;
    }

    // Enter submission: freeze current line in-place and open next line underneath
    if (e.key === 'Enter') {
      e.preventDefault();
      setAutoCompleteNotice(null);
      const val = inputValue.trim();

      // 1. Username Phase
      if (loginStep === 'username') {
        if (!val) {
          tacticalAudio.playDenied();
          appendLine('Error: Operator ID cannot be empty.', 'error');
          return;
        }
        // Freeze typed username into the stream
        appendLine(`ENTER OPERATOR ID [Username] > ${val}`, 'input');
        setTempUsername(val);
        setLoginStep('password');
        setInputValue('');
        tacticalAudio.playPromptBeep();
        return;
      }

      // 2. Password Phase
      if (loginStep === 'password') {
        // Freeze masked password into the stream
        appendLine(`ENTER ACCESS CIPHER [Password] > ${'*'.repeat(Math.max(val.length, 6))}`, 'input');
        setInputValue('');

        // Authenticate credentials
        const hashed = await hashPassword(val);
        const isRoot =
          tempUsername.toLowerCase() === ADMIN_CONFIG.username &&
          hashed === ADMIN_CONFIG.passwordHash;

        const newSession: OperatorSession = {
          username: tempUsername,
          clearance: isRoot ? 'LV.5 ROOT' : 'LV.3 STANDARD',
          isRoot,
          token: `SEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          loginTimestamp: Date.now(),
        };

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('endfield_operator_session', JSON.stringify(newSession));
        }

        onSessionChange(newSession);
        setLoginStep('authenticated');

        if (isRoot) {
          tacticalAudio.playSuccess();
          appendLine('[CREDENTIAL RECOGNIZED // OVERRIDE GRANTED]', 'root');
          appendLine(`[CLEARANCE: LV.5 ROOT // ROOT ACCESS TO SYSTEM KERNEL]`, 'root');
          appendLine(`WELCOME ROOT OPERATOR @${newSession.username}. UNRESTRICTED PRIVILEGES ENGAGED.`, 'root');
        } else {
          tacticalAudio.playSuccess();
          appendLine('[CREDENTIAL VERIFIED // GUEST PROFILE GENERATED]', 'success');
          appendLine(`[CLEARANCE: LV.3 STANDARD] OPERATOR @${newSession.username} AUTHENTICATED.`, 'success');
        }

        appendLine("TYPE 'system.connect holotable' OR 'help' TO BEGIN TACTICAL OPERATIONS.", 'warn');
        return;
      }

      // 3. Authenticated Commands Phase
      if (val.length > 0) {
        // Freeze command into stream
        appendLine(`@${session?.username || 'op'} // TALOS > ${val}`, 'input');
        setHistory((prev) => [...prev, val]);
        setHistoryIndex(-1);

        const result = parseAndExecuteCommand(val, session);

        if (val === 'clear') {
          setLines([]);
        } else {
          result.lines.forEach((l) => appendLine(l.text, l.type));
        }

        if (result.clearSession) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('endfield_operator_session');
          }
          onSessionChange(null);
          setLoginStep('username');
          setTempUsername('');
        }

        if (result.nextView) {
          onNavigate(result.nextView);
          if (isDrawer && onCloseDrawer) {
            onCloseDrawer();
          }
        } else {
          tacticalAudio.playPromptBeep();
        }

        setInputValue('');
      }
    }
  };

  const getLineColorClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'ascii':
        return 'text-endfield-yellow font-bold tracking-widest whitespace-pre';
      case 'system':
        return 'text-endfield-slate border-b border-endfield-border/30 pb-0.5 mb-1';
      case 'info':
        return 'text-gray-300';
      case 'success':
        return 'text-endfield-emerald font-semibold';
      case 'warn':
        return 'text-endfield-yellow font-medium';
      case 'error':
        return 'text-endfield-crimson font-bold';
      case 'root':
        return 'text-endfield-crimson font-mono bg-endfield-crimson/10 px-1 border-l-2 border-endfield-crimson';
      case 'input':
        return 'text-endfield-cyan font-mono font-semibold';
      default:
        return 'text-gray-200';
    }
  };

  const getPromptText = () => {
    if (loginStep === 'username') return 'ENTER OPERATOR ID [Username] > ';
    if (loginStep === 'password') return 'ENTER ACCESS CIPHER [Password] > ';
    return `@${session?.username || 'op'} // TALOS > `;
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTerminalClick}
      className={`font-mono text-xs md:text-sm leading-relaxed overflow-y-auto cursor-text select-text p-4 md:p-8 scrollbar-thin scrollbar-thumb-endfield-border ${
        isDrawer
          ? 'h-full bg-endfield-bg/95 backdrop-blur-md border-b-2 border-endfield-yellow'
          : 'w-full h-full bg-endfield-bg text-gray-200'
      }`}
    >
      {/* Top Banner & Skip hint */}
      <div className="flex items-center justify-between border-b border-endfield-border/60 pb-2 mb-4 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-endfield-yellow rounded-none inline-block animate-pulse"></span>
          <span className="text-endfield-yellow font-bold tracking-wider text-xs uppercase">
            {session?.isRoot ? 'ROOT KERNEL TTY // CLEARANCE: LV.5' : 'TALOS-II TTY CONSOLE v2.4'}
          </span>
          {isBooting && (
            <span className="text-endfield-cyan text-xs animate-pulse">
              [BOOT SEQUENCE STREAMING... CLICK ANYWHERE TO SKIP]
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs select-none">
          {session && (
            <button
              onClick={() => {
                onNavigate('holotable');
                if (isDrawer && onCloseDrawer) onCloseDrawer();
              }}
              className="px-2 py-0.5 bg-endfield-yellow text-endfield-bg font-bold hover:bg-endfield-yellow-light transition-colors"
            >
              [LAUNCH HOLOTABLE]
            </button>
          )}
          {isDrawer && (
            <button
              onClick={onCloseDrawer}
              className="text-endfield-slate hover:text-endfield-yellow px-1 font-bold"
            >
              [ESC / CLOSE]
            </button>
          )}
        </div>
      </div>

      {/* 1. Historical Output Lines Stream */}
      <div className="space-y-1">
        {lines.map((l) => (
          <div key={l.id} className={`flex items-start ${getLineColorClass(l.type)}`}>
            {l.timestamp && (
              <span className="text-endfield-muted text-xs mr-2 shrink-0 select-none">
                [{l.timestamp}]
              </span>
            )}
            <span className="break-all whitespace-pre-wrap">{l.text}</span>
          </div>
        ))}
      </div>

      {/* Auto-complete prompt banner if present */}
      {autoCompleteNotice && (
        <div className="my-2 text-xs text-endfield-cyan bg-endfield-cyan/10 p-1 border-l-2 border-endfield-cyan">
          {autoCompleteNotice}
        </div>
      )}

      {/* 2. REAL IN-LINE ACTIVE TTY INPUT LINE (Directly following the text stream) */}
      {!isBooting && (
        <div className="flex items-center flex-wrap pt-1 font-mono text-xs md:text-sm">
          <span className="text-endfield-yellow font-bold shrink-0 select-none mr-2">
            {getPromptText()}
          </span>

          <span className="text-endfield-cyan font-mono font-semibold tracking-wide">
            {loginStep === 'password' ? '•'.repeat(inputValue.length) : inputValue}
          </span>

          {/* Authentic Blinking Block Caret █ */}
          <span className="w-2.5 h-4 bg-endfield-yellow inline-block align-middle ml-0.5 animate-pulse select-none"></span>

          {/* Off-screen/hidden capture input element */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="opacity-0 absolute -left-[9999px] -top-[9999px] w-1 h-1 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
};
