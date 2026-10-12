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

const ASCII_LOGO = [
  '  ███████╗███╗   ██╗██████╗ ███████╗██╗███████╗██╗     ██████╗ ',
  '  ██╔════╝████╗  ██║██╔══██╗██╔════╝██║██╔════╝██║     ██╔══██╗',
  '  █████╗  ██╔██╗ ██║██║  ██║█████╗  ██║█████╗  ██║     ██║  ██║',
  '  ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██║██╔══╝  ██║     ██║  ██║',
  '  ███████╗██║ ╚████║██████╔╝██║     ██║███████╗███████╗██████╔╝',
  '  ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ',
  '    // TALOS-II PROTOCOL GATEWAY // TACTICAL ARCHITECTURE //   ',
];

export const BootTerminal: React.FC<BootTerminalProps> = ({
  session,
  onSessionChange,
  onNavigate,
  isDrawer = false,
  onCloseDrawer,
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loginStep, setLoginStep] = useState<'username' | 'password' | 'authenticated'>(
    session ? 'authenticated' : 'username'
  );
  const [tempUsername, setTempUsername] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoCompleteNotice, setAutoCompleteNotice] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = (text: string, type: TerminalLine['type']) => {
    const id = `${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLines((prev) => [...prev, { id, text, type, timestamp }]);
  };

  // Initialize terminal stream
  useEffect(() => {
    if (lines.length === 0) {
      const initialLines: TerminalLine[] = [];
      ASCII_LOGO.forEach((logoLine, idx) => {
        initialLines.push({
          id: `ascii-${idx}`,
          text: logoLine,
          type: 'ascii',
        });
      });

      initialLines.push({
        id: 'sys-0',
        text: 'TALOS-II SUBSURFACE KERNEL 4.19-RT // SECURITY LEVEL 3',
        type: 'system',
        timestamp: new Date().toTimeString().split(' ')[0],
      });
      initialLines.push({
        id: 'sys-1',
        text: 'HARDWARE INTEGRITY: PASS | BUS SPEED: 12.8 Gbps | STATUS: READY',
        type: 'info',
        timestamp: new Date().toTimeString().split(' ')[0],
      });

      if (!session) {
        initialLines.push({
          id: 'auth-0',
          text: '================================================================',
          type: 'system',
        });
        initialLines.push({
          id: 'auth-1',
          text: '[ACCESS GATEWAY]: Operator credentials unverified. Provisioning guest profile.',
          type: 'warn',
        });
        initialLines.push({
          id: 'auth-2',
          text: 'Please enter your Operator ID (or admin for root authorization):',
          type: 'info',
        });
      } else {
        initialLines.push({
          id: 'auth-restored',
          text: `[SESSION RESUMED] Active Operator: @${session.username} [${session.clearance}]`,
          type: session.isRoot ? 'root' : 'success',
        });
        initialLines.push({
          id: 'auth-hint',
          text: "Type 'help' to inspect command matrix or 'system.connect holotable' to launch.",
          type: 'warn',
        });
      }

      setLines(initialLines);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, loginStep]);

  // Keep focus on input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    // Command history
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

    if (e.key === 'Enter') {
      e.preventDefault();
      setAutoCompleteNotice(null);
      const val = inputValue.trim();

      // Step 1: Username input
      if (loginStep === 'username') {
        if (!val) {
          tacticalAudio.playDenied();
          addLine('Error: Operator ID cannot be empty.', 'error');
          return;
        }
        setTempUsername(val);
        addLine(`ENTER OPERATOR ID [Username]: ${val}`, 'input');
        addLine('ENTER ACCESS CIPHER [Password]:', 'info');
        setLoginStep('password');
        setInputValue('');
        tacticalAudio.playPromptBeep();
        return;
      }

      // Step 2: Password input
      if (loginStep === 'password') {
        addLine(`ENTER ACCESS CIPHER [Password]: ${'*'.repeat(Math.max(val.length, 6))}`, 'input');
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
          addLine('[CREDENTIAL RECOGNIZED // OVERRIDE GRANTED]', 'root');
          addLine(`[SECURITY CLEARANCE: LV.5 ROOT // SUPERVISOR ACCESS]`, 'root');
          addLine(`WELCOME ROOT OPERATOR @${newSession.username}. UNRESTRICTED PRIVILEGES ENGAGED.`, 'root');
        } else {
          tacticalAudio.playSuccess();
          addLine('[CREDENTIAL VERIFIED // GUEST PROFILE GENERATED]', 'success');
          addLine(`[CLEARANCE: LV.3 STANDARD] OPERATOR @${newSession.username} AUTHENTICATED.`, 'success');
        }

        addLine("TYPE 'system.connect holotable' OR 'help' TO BEGIN TACTICAL OPERATIONS.", 'warn');
        return;
      }

      // Step 3: Authenticated Command execution
      if (val.length > 0) {
        addLine(`@${session?.username || 'operator'} // TALOS > ${val}`, 'input');
        setHistory((prev) => [...prev, val]);
        setHistoryIndex(-1);

        const result = parseAndExecuteCommand(val, session);

        if (val === 'clear') {
          setLines([]);
        } else {
          result.lines.forEach((l) => addLine(l.text, l.type));
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
          tacticalAudio.playTransition();
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
        return 'text-endfield-slate border-b border-endfield-border/40 pb-1 mb-1';
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
        return 'text-endfield-cyan font-mono';
      default:
        return 'text-gray-200';
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`font-mono text-sm leading-relaxed overflow-hidden flex flex-col ${
        isDrawer
          ? 'h-full bg-endfield-bg/95 backdrop-blur-md border-b-2 border-endfield-yellow'
          : 'w-full h-screen bg-endfield-bg text-gray-200 p-4 md:p-8'
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-endfield-border pb-2 mb-3 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-endfield-yellow rounded-none inline-block animate-pulse"></span>
          <span className="text-endfield-yellow font-bold tracking-wider text-xs uppercase">
            {session?.isRoot ? 'ROOT KERNEL CLI // LV.5' : 'END-CLI PROTOCOL TERMINAL v2.4'}
          </span>
          <span className="text-endfield-muted text-xs hidden sm:inline">
            // STATUS: {loginStep === 'authenticated' ? 'CONNECTED' : 'AUTHENTICATING'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {session && (
            <button
              onClick={() => {
                tacticalAudio.playTransition();
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

      {/* Terminal Output Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-endfield-border">
        {lines.map((l) => (
          <div key={l.id} className={`flex items-start ${getLineColorClass(l.type)}`}>
            {l.timestamp && (
              <span className="text-endfield-muted text-xs mr-2 shrink-0 select-none">
                [{l.timestamp}]
              </span>
            )}
            <span className="break-all">{l.text}</span>
          </div>
        ))}

        {autoCompleteNotice && (
          <div className="text-xs text-endfield-cyan bg-endfield-cyan/10 p-1 border-l-2 border-endfield-cyan">
            {autoCompleteNotice}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Prompt Section */}
      <div className="pt-3 border-t border-endfield-border flex items-center space-x-2">
        <span className="text-endfield-yellow font-bold shrink-0 select-none">
          {loginStep === 'username'
            ? 'LOGIN_ID >'
            : loginStep === 'password'
            ? 'CIPHER_KEY >'
            : `@${session?.username || 'op'} // TALOS >`}
        </span>

        <input
          ref={inputRef}
          type={loginStep === 'password' ? 'password' : 'text'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent text-endfield-cyan outline-none border-none font-mono text-sm placeholder-endfield-muted"
          placeholder={
            loginStep === 'username'
              ? 'Enter username (or admin)...'
              : loginStep === 'password'
              ? 'Enter password...'
              : "Type 'help' or 'system.connect holotable' (TAB to complete)..."
          }
        />
        <span className="w-2 h-4 bg-endfield-yellow animate-pulse"></span>
      </div>
    </div>
  );
};
