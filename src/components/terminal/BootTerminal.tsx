import React, { useState, useEffect, useRef } from 'react';
import type { OperatorSession, TerminalLine, TacticalView } from '../../types/tactical';
import {
  parseAndExecuteCommand,
  handleTabCompletion,
  hashPassword,
  ADMIN_CONFIG,
} from './CommandParser';
import { tacticalAudio } from '../audio/TacticalAudio';
import { HARDWARE_POST_LOGS, CLEAN_EMBLEM_SEQUENCE } from './BootSequenceData';

interface BootTerminalProps {
  session: OperatorSession | null;
  onSessionChange: (session: OperatorSession | null) => void;
  onNavigate: (view: TacticalView) => void;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}


export const BootTerminal: React.FC<BootTerminalProps> = ({
  session,
  onSessionChange,
  onNavigate,
  isDrawer = false,
  onCloseDrawer,
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(!session && !isDrawer);
  const [loginStep, setLoginStep] = useState<'username' | 'password' | 'authenticated'>(
    session ? 'authenticated' : 'username'
  );
  const [tempUsername, setTempUsername] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoCompleteNotice, setAutoCompleteNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamQueueRef = useRef<Array<{ text: string; type: TerminalLine['type']; delay?: number }>>([]);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamCallbackRef = useRef<(() => void) | null>(null);
  const pendingNavRef = useRef<TacticalView | null>(null);
  // Directly append a line to buffer without animation
  const appendImmediateLine = (text: string, type: TerminalLine['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLines((prev) => [...prev, { id, text, type, timestamp }]);
  };

  // Run next item from stream queue
  const processStreamQueue = () => {
    if (streamQueueRef.current.length === 0) {
      streamTimerRef.current = null;

      if (streamCallbackRef.current) {
        const cb = streamCallbackRef.current;
        streamCallbackRef.current = null;
        cb();
        return;
      }

      setIsStreaming(false);
      if (pendingNavRef.current) {
        const dest = pendingNavRef.current;
        pendingNavRef.current = null;
        onNavigate(dest);
        if (isDrawer && onCloseDrawer) onCloseDrawer();
      } else {
        tacticalAudio.playPromptBeep();
        setTimeout(() => {
          inputRef.current?.focus({ preventScroll: true });
        }, 10);
      }
      return;
    }

    const next = streamQueueRef.current.shift()!;
    const id = `${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toTimeString().split(' ')[0];

    setLines((prev) => [...prev, { id, text: next.text, type: next.type, timestamp }]);
    tacticalAudio.playKeyClick();

    const delay = next.delay ?? 22;
    streamTimerRef.current = setTimeout(processStreamQueue, delay);
  };

  // Stream an array of lines line-by-line
  const streamLines = (
    newItems: Array<{ text: string; type: TerminalLine['type']; delay?: number }>,
    nextView?: TacticalView,
    onDone?: () => void
  ) => {
    if (newItems.length === 0) {
      if (nextView) {
        onNavigate(nextView);
        if (isDrawer && onCloseDrawer) onCloseDrawer();
      }
      if (onDone) onDone();
      return;
    }

    if (nextView) pendingNavRef.current = nextView;
    if (onDone) streamCallbackRef.current = onDone;
    streamQueueRef.current = [...streamQueueRef.current, ...newItems];
    setIsStreaming(true);

    if (!streamTimerRef.current) {
      processStreamQueue();
    }
  };

  // Instant skip for all currently streaming output
  const skipStreaming = () => {
    clearTimeout(streamTimerRef.current);
    streamTimerRef.current = null;
    streamCallbackRef.current = null;
    streamQueueRef.current = [];

    // If skipping during initial unauthenticated boot: clear and stamp clean emblem!
    if (!session && loginStep === 'username') {
      setLines([]);
      const timestamp = new Date().toTimeString().split(' ')[0];
      const emblemLines: TerminalLine[] = CLEAN_EMBLEM_SEQUENCE.map((item) => ({
        id: `${Date.now()}-${Math.random()}`,
        text: item.text,
        type: item.type,
        timestamp,
      }));
      setLines(emblemLines);
      setIsStreaming(false);
      tacticalAudio.playPromptBeep();
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 20);
      return;
    }

    setIsStreaming(false);

    if (pendingNavRef.current) {
      const dest = pendingNavRef.current;
      pendingNavRef.current = null;
      onNavigate(dest);
      if (isDrawer && onCloseDrawer) onCloseDrawer();
    } else {
      tacticalAudio.playPromptBeep();
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 20);
    }
  };

  // Initialize terminal stream on mount
  useEffect(() => {
    if (session || isDrawer) {
      setIsStreaming(false);
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
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 20);
      return;
    }

    // Stage 1: Cold boot 160-line hardware POST logs (Fluctuating Cadence: Slow -> Fast -> Slow)
    streamLines(HARDWARE_POST_LOGS, undefined, () => {
      // Stage 2: POST complete! Wait 350ms, CLEAR SCREEN, then stream CLEAN_EMBLEM_SEQUENCE!
      streamTimerRef.current = setTimeout(() => {
        streamTimerRef.current = null;
        setLines([]); // PHYSICAL SCREEN CLEAR
        tacticalAudio.playTransition();
        streamLines(CLEAN_EMBLEM_SEQUENCE, undefined, () => {
          setIsStreaming(false);
          tacticalAudio.playPromptBeep();
          setTimeout(() => {
            inputRef.current?.focus({ preventScroll: true });
            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
          }, 30);
        });
      }, 350);
    });
    return () => {
      clearTimeout(streamTimerRef.current);
    };
  }, []);

  // Auto-scroll on lines or input changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, inputValue, loginStep, isStreaming]);

  // Selection-aware click handler: if user highlighted text to copy, do not steal focus!
  const handleTerminalClick = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    if (isStreaming) {
      skipStreaming();
    } else {
      inputRef.current?.focus({ preventScroll: true });
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  };

  // Synchronize cursor position with input element
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setCursorPos(e.target.selectionStart ?? e.target.value.length);
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If stream is running, any keypress skips streaming instantly
    if (isStreaming) {
      skipStreaming();
      return;
    }

    // Allow standard copy shortcuts without interference
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return; // Native clipboard copy
      }
    }

    tacticalAudio.playKeyClick();

    // Caret navigation keys
    if (e.key === 'ArrowLeft') {
      setTimeout(() => {
        if (inputRef.current) setCursorPos(inputRef.current.selectionStart ?? 0);
      }, 0);
      return;
    }
    if (e.key === 'ArrowRight') {
      setTimeout(() => {
        if (inputRef.current) setCursorPos(inputRef.current.selectionStart ?? inputValue.length);
      }, 0);
      return;
    }
    if (e.key === 'Home') {
      setTimeout(() => setCursorPos(0), 0);
      return;
    }
    if (e.key === 'End') {
      setTimeout(() => setCursorPos(inputValue.length), 0);
      return;
    }

    // LCP (Longest Common Prefix) Tab Autocompletion
    if (e.key === 'Tab') {
      e.preventDefault();
      if (loginStep !== 'authenticated') return;

      const res = handleTabCompletion(inputValue, session?.isRoot ?? false);
      if (res.hasAdvanced) {
        setInputValue(res.completedValue);
        setCursorPos(res.completedValue.length);
        setAutoCompleteNotice(null);
        tacticalAudio.playPromptBeep();
      } else if (res.candidates.length > 1) {
        setAutoCompleteNotice(`Suggestions: ${res.candidates.join('  |  ')}`);
        tacticalAudio.playPromptBeep();
      } else {
        setAutoCompleteNotice('No matching tactical command');
      }
      return;
    }

    // Command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx);
          const val = history[history.length - 1 - nextIdx];
          setInputValue(val);
          setCursorPos(val.length);
        }
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        const val = history[history.length - 1 - nextIdx];
        setInputValue(val);
        setCursorPos(val.length);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
        setCursorPos(0);
      }
      return;
    }

    // Enter key: freeze current line in-place, then stream responses
    if (e.key === 'Enter') {
      e.preventDefault();
      setAutoCompleteNotice(null);
      const val = inputValue.trim();

      // 1. Username Phase
      if (loginStep === 'username') {
        if (!val) {
          tacticalAudio.playDenied();
          streamLines([{ text: 'Error: Operator ID cannot be empty.', type: 'error' }]);
          return;
        }
        appendImmediateLine(`ENTER OPERATOR ID [Username] > ${val}`, 'input');
        setTempUsername(val);
        setLoginStep('password');
        setInputValue('');
        setCursorPos(0);
        tacticalAudio.playPromptBeep();
        return;
      }

      // 2. Password Phase
      if (loginStep === 'password') {
        appendImmediateLine(`ENTER ACCESS CIPHER [Password] > ${'•'.repeat(Math.max(val.length, 6))}`, 'input');
        setInputValue('');
        setCursorPos(0);

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

        const authOutput: Array<{ text: string; type: TerminalLine['type']; delay?: number }> = isRoot
          ? [
              { text: '[CREDENTIAL RECOGNIZED // OVERRIDE GRANTED]', type: 'root', delay: 35 },
              { text: '[CLEARANCE: LV.5 ROOT // ROOT ACCESS TO SYSTEM KERNEL]', type: 'root', delay: 35 },
              { text: `WELCOME ROOT OPERATOR @${newSession.username}. UNRESTRICTED PRIVILEGES ENGAGED.`, type: 'root', delay: 35 },
              { text: "TYPE 'system.connect holotable' OR 'help' TO BEGIN TACTICAL OPERATIONS.", type: 'warn', delay: 30 },
            ]
          : [
              { text: '[CREDENTIAL VERIFIED // GUEST PROFILE GENERATED]', type: 'success', delay: 35 },
              { text: `[CLEARANCE: LV.3 STANDARD] OPERATOR @${newSession.username} AUTHENTICATED.`, type: 'success', delay: 35 },
              { text: "TYPE 'system.connect holotable' OR 'help' TO BEGIN TACTICAL OPERATIONS.", type: 'warn', delay: 30 },
            ];

        streamLines(authOutput);
        return;
      }

      // 3. Authenticated Commands Phase
      if (val.length > 0) {
        appendImmediateLine(`@${session?.username || 'op'} // TALOS > ${val}`, 'input');
        setHistory((prev) => [...prev, val]);
        setHistoryIndex(-1);

        const result = parseAndExecuteCommand(val, session);

        if (val === 'clear') {
          setLines([]);
        } else if (result.lines.length > 0) {
          // Continuous streaming for command outputs!
          streamLines(result.lines, result.nextView);
        } else if (result.nextView) {
          onNavigate(result.nextView);
          if (isDrawer && onCloseDrawer) onCloseDrawer();
        }

        if (result.clearSession) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('endfield_operator_session');
          }
          onSessionChange(null);
          setLoginStep('username');
          setTempUsername('');
        }

        setInputValue('');
        setCursorPos(0);
      }
    }
  };

  const getLineColorClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'ascii':
        return 'text-endfield-yellow text-glow-yellow font-bold tracking-widest whitespace-pre drop-shadow-[0_0_12px_rgba(255,230,0,0.35)]';
      case 'system':
        return 'text-endfield-slate border-b border-endfield-border/60 pb-1 mb-1 font-mono text-[11px]';
      case 'info':
        return 'text-[#C5D3E8]';
      case 'success':
        return 'text-endfield-emerald text-glow-emerald font-semibold';
      case 'warn':
        return 'text-endfield-yellow text-glow-yellow font-medium';
      case 'error':
        return 'text-endfield-crimson font-bold drop-shadow-[0_0_8px_rgba(255,45,70,0.5)]';
      case 'root':
        return 'text-endfield-crimson font-mono bg-endfield-crimson/15 px-2 py-0.5 border-l-2 border-endfield-crimson font-bold';
      case 'input':
        return 'text-endfield-cyan text-glow-cyan font-mono font-bold';
      default:
        return 'text-gray-100';
    }
  };

  const getPromptText = () => {
    if (loginStep === 'username') return 'ENTER OPERATOR ID [Username] > ';
    if (loginStep === 'password') return 'ENTER ACCESS CIPHER [Password] > ';
    return `@${session?.username || 'op'} // TALOS > `;
  };

  // Render inline caret position
  const renderInlineCaretText = () => {
    const isMasked = loginStep === 'password';
    const displayVal = isMasked ? '•'.repeat(inputValue.length) : inputValue;

    const before = displayVal.slice(0, cursorPos);
    const charAtCursor = displayVal[cursorPos] || ' ';
    const after = displayVal.slice(cursorPos + 1);

    return (
      <span className="font-mono text-xs md:text-sm text-endfield-cyan font-semibold">
        <span>{before}</span>
        {/* Real In-line Caret with square-wave 400ms high-frequency instant blink */}
        <span className="inline-block bg-endfield-yellow text-endfield-bg font-black px-[1.5px] leading-tight cursor-square-wave min-w-[8px] text-center select-none align-baseline shadow-[0_0_8px_#ffe600]">
          {charAtCursor === ' ' ? '\u00A0' : charAtCursor}
        </span>
        <span>{after}</span>
      </span>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-text">
      {/* Fixed CRT Scanline & Optical Lens Vignette Overlay (Decoupled from scroll to prevent seams) */}
      <div className="fixed inset-0 crt-scanlines pointer-events-none z-30" />
      <div className="fixed inset-0 crt-vignette pointer-events-none z-30" />

      <div
        ref={containerRef}
        onClick={handleTerminalClick}
        className={`relative font-mono text-xs md:text-sm leading-relaxed overflow-y-auto cursor-text select-text p-4 md:p-8 scrollbar-thin scrollbar-thumb-endfield-border cad-grid w-full h-full ${
          isDrawer
            ? 'bg-endfield-bg/95 backdrop-blur-xl border-b-2 border-endfield-yellow shadow-tactical'
            : 'bg-endfield-bg text-gray-200'
        }`}
      >
      {/* Heavy-duty Industrial TTY Header Bar */}
      <div className="relative z-20 flex items-center justify-between border-b border-endfield-border pb-2.5 mb-4 select-none bg-endfield-surface/70 px-3 py-1.5 shadow-tactical-card border-l-2 border-l-endfield-yellow">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-endfield-emerald shadow-[0_0_8px_#00ff9d] animate-pulse"></span>
            <span className="text-[10px] font-mono text-endfield-muted tracking-wider">CARRIER_OK</span>
          </div>
          <span className="text-endfield-yellow text-glow-yellow font-black tracking-widest text-xs uppercase">
            {session?.isRoot ? 'ROOT KERNEL TTY // CLEARANCE: LV.5' : 'TALOS-II TTY CONSOLE // TTY1'}
          </span>
          <span className="text-endfield-muted text-[10px] hidden sm:inline">
            [BAUD: 115200 // BUFFER: 64KB // SPEC: AIC-04]
          </span>
          {isStreaming && (
            <span className="text-endfield-cyan text-glow-cyan text-xs animate-pulse">
              [STREAMING TELEPRINTER... CLICK/KEY TO SKIP]
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
              className="px-2.5 py-1 bg-endfield-yellow text-endfield-bg font-bold hover:bg-endfield-yellow-light transition-colors shadow-glow-yellow-sm tracking-wider"
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

      {/* 1. Historical Output Lines Stream (100% Selectable for Copying) */}
      <div className="space-y-1 select-text">
        {lines.map((l) => (
          <div key={l.id} className={`flex items-start select-text ${getLineColorClass(l.type)}`}>
            {l.timestamp && (
              <span className="text-endfield-muted text-xs mr-2 shrink-0 select-none">
                [{l.timestamp}]
              </span>
            )}
            <span className="break-all whitespace-pre-wrap select-text">{l.text}</span>
          </div>
        ))}
      </div>

      {/* Auto-complete prompt banner if present */}
      {autoCompleteNotice && (
        <div className="my-2 text-xs text-endfield-cyan bg-endfield-cyan/10 p-1 border-l-2 border-endfield-cyan">
          {autoCompleteNotice}
        </div>
      )}

      {/* 2. REAL IN-LINE ACTIVE TTY INPUT LINE WITH ADVANCED CARET */}
      {!isStreaming && (
        <div className="flex items-center flex-wrap pt-1 font-mono text-xs md:text-sm select-text">
          <span className="text-endfield-yellow font-bold shrink-0 select-none mr-2">
            {getPromptText()}
          </span>

          {renderInlineCaretText()}

          {/* INLINE ANCHORED INPUT: Positioned directly in active prompt line, ZERO scroll jump! */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="opacity-0 absolute inset-0 w-full h-full pointer-events-none cursor-default"
          />
        </div>
      )}
    </div>
      </div>
  );
};
