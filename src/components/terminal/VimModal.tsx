import React, { useState, useEffect, useRef } from 'react';
import { tacticalAudio } from '../audio/TacticalAudio';

interface VimModalProps {
  fileName: string;
  initialContent: string;
  readOnly?: boolean;
  onSave: (newContent: string) => { success: boolean; error?: string };
  onClose: (statusMsg?: string) => void;
}

type VimMode = 'NORMAL' | 'INSERT' | 'COMMAND';

export const VimModal: React.FC<VimModalProps> = ({
  fileName,
  initialContent,
  readOnly = false,
  onSave,
  onClose,
}) => {
  const [lines, setLines] = useState<string[]>(() => {
    const split = initialContent.split('\n');
    return split.length > 0 ? split : [''];
  });
  const [mode, setMode] = useState<VimMode>('NORMAL');
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [commandBuffer, setCommandBuffer] = useState('');
  const [pendingKey, setPendingKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    readOnly
      ? { text: `"${fileName}" [RO / ROOT-PROTECTED]`, isError: false }
      : { text: `"${fileName}" -- Press 'i' to edit, ':wq' to save & exit, ':q!' to quit --`, isError: false }
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLTableRowElement>(null);

  const fullContent = lines.join('\n');
  const lineCount = lines.length;
  const byteCount = new TextEncoder().encode(fullContent).length;

  useEffect(() => {
    tacticalAudio.playKeyClick();
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [cursorRow]);

  const executeExCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    setMode('NORMAL');
    setCommandBuffer('');

    if (cmd === ':w' || cmd === ':w!') {
      const res = onSave(lines.join('\n'));
      if (!res.success) {
        tacticalAudio.playDenied();
        setStatusMessage({
          text: res.error || `E45: 'readonly' option is set (requires LV.5 ROOT clearance)`,
          isError: true,
        });
        return;
      }
      tacticalAudio.playSuccess();
      setIsDirty(false);
      setStatusMessage({
        text: `"${fileName}" ${lineCount}L, ${byteCount}B written`,
        isError: false,
      });
      return;
    }

    if (cmd === ':wq' || cmd === ':wq!' || cmd === ':x') {
      const res = onSave(lines.join('\n'));
      if (!res.success) {
        tacticalAudio.playDenied();
        setStatusMessage({
          text: res.error || `E45: Permission denied: cannot write '${fileName}'`,
          isError: true,
        });
        return;
      }
      tacticalAudio.playSuccess();
      onClose(`"${fileName}" ${lineCount}L, ${byteCount}B written`);
      return;
    }

    if (cmd === ':q') {
      if (isDirty) {
        tacticalAudio.playDenied();
        setStatusMessage({
          text: 'E37: No write since last change (add ! to override, e.g. :q!)',
          isError: true,
        });
        return;
      }
      tacticalAudio.playPromptBeep();
      onClose();
      return;
    }

    if (cmd === ':q!') {
      tacticalAudio.playPromptBeep();
      onClose();
      return;
    }

    tacticalAudio.playDenied();
    setStatusMessage({
      text: `E492: Not an editor command: ${cmd}`,
      isError: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;
    }

    tacticalAudio.playKeyClick();
    const currentLine = lines[cursorRow] ?? '';

    // ==========================================
    // 1. COMMAND MODE (:)
    // ==========================================
    if (mode === 'COMMAND') {
      e.preventDefault();
      if (e.key === 'Escape') {
        setMode('NORMAL');
        setCommandBuffer('');
        return;
      }
      if (e.key === 'Enter') {
        executeExCommand(commandBuffer);
        return;
      }
      if (e.key === 'Backspace') {
        if (commandBuffer.length <= 1) {
          setMode('NORMAL');
          setCommandBuffer('');
        } else {
          setCommandBuffer((p) => p.slice(0, -1));
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setCommandBuffer((p) => p + e.key);
      }
      return;
    }

    // ==========================================
    // 2. INSERT MODE (-- INSERT --)
    // ==========================================
    if (mode === 'INSERT') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMode('NORMAL');
        setCursorCol((c) => Math.max(0, Math.min(c, Math.max(0, currentLine.length - 1))));
        setStatusMessage(null);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cursorRow > 0) {
          const nextRow = cursorRow - 1;
          setCursorRow(nextRow);
          setCursorCol((c) => Math.min(c, lines[nextRow].length));
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cursorRow < lines.length - 1) {
          const nextRow = cursorRow + 1;
          setCursorRow(nextRow);
          setCursorCol((c) => Math.min(c, lines[nextRow].length));
        }
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (cursorCol > 0) {
          setCursorCol((c) => c - 1);
        } else if (cursorRow > 0) {
          const prevRow = cursorRow - 1;
          setCursorRow(prevRow);
          setCursorCol(lines[prevRow].length);
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (cursorCol < currentLine.length) {
          setCursorCol((c) => c + 1);
        } else if (cursorRow < lines.length - 1) {
          setCursorRow((r) => r + 1);
          setCursorCol(0);
        }
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setCursorCol(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        setCursorCol(currentLine.length);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const before = currentLine.slice(0, cursorCol);
        const after = currentLine.slice(cursorCol);
        setLines((prev) => {
          const copy = [...prev];
          copy.splice(cursorRow, 1, before, after);
          return copy;
        });
        setCursorRow((r) => r + 1);
        setCursorCol(0);
        setIsDirty(true);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (cursorCol > 0) {
          const updated = currentLine.slice(0, cursorCol - 1) + currentLine.slice(cursorCol);
          setLines((prev) => {
            const copy = [...prev];
            copy[cursorRow] = updated;
            return copy;
          });
          setCursorCol((c) => c - 1);
          setIsDirty(true);
        } else if (cursorRow > 0) {
          const prevLine = lines[cursorRow - 1];
          const newCol = prevLine.length;
          setLines((prev) => {
            const copy = [...prev];
            copy.splice(cursorRow - 1, 2, prevLine + currentLine);
            return copy;
          });
          setCursorRow((r) => r - 1);
          setCursorCol(newCol);
          setIsDirty(true);
        }
        return;
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        if (cursorCol < currentLine.length) {
          const updated = currentLine.slice(0, cursorCol) + currentLine.slice(cursorCol + 1);
          setLines((prev) => {
            const copy = [...prev];
            copy[cursorRow] = updated;
            return copy;
          });
          setIsDirty(true);
        } else if (cursorRow < lines.length - 1) {
          const nextLine = lines[cursorRow + 1];
          setLines((prev) => {
            const copy = [...prev];
            copy.splice(cursorRow, 2, currentLine + nextLine);
            return copy;
          });
          setIsDirty(true);
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const updated = currentLine.slice(0, cursorCol) + '  ' + currentLine.slice(cursorCol);
        setLines((prev) => {
          const copy = [...prev];
          copy[cursorRow] = updated;
          return copy;
        });
        setCursorCol((c) => c + 2);
        setIsDirty(true);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const updated = currentLine.slice(0, cursorCol) + e.key + currentLine.slice(cursorCol);
        setLines((prev) => {
          const copy = [...prev];
          copy[cursorRow] = updated;
          return copy;
        });
        setCursorCol((c) => c + 1);
        setIsDirty(true);
      }
      return;
    }

    // ==========================================
    // 3. NORMAL MODE (-- NORMAL --)
    // ==========================================
    e.preventDefault();

    // Navigation
    if (e.key === 'ArrowUp' || e.key === 'k') {
      setPendingKey('');
      if (cursorRow > 0) {
        const nextRow = cursorRow - 1;
        setCursorRow(nextRow);
        setCursorCol((c) => Math.min(c, Math.max(0, lines[nextRow].length - 1)));
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'j') {
      setPendingKey('');
      if (cursorRow < lines.length - 1) {
        const nextRow = cursorRow + 1;
        setCursorRow(nextRow);
        setCursorCol((c) => Math.min(c, Math.max(0, lines[nextRow].length - 1)));
      }
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'h') {
      setPendingKey('');
      setCursorCol((c) => Math.max(0, c - 1));
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'l') {
      setPendingKey('');
      setCursorCol((c) => Math.min(Math.max(0, currentLine.length - 1), c + 1));
      return;
    }
    if (e.key === 'Home' || e.key === '0') {
      setPendingKey('');
      setCursorCol(0);
      return;
    }
    if (e.key === 'End' || e.key === '$') {
      setPendingKey('');
      setCursorCol(Math.max(0, currentLine.length - 1));
      return;
    }

    // Enter INSERT mode: i, a, o
    if (e.key === 'i') {
      setPendingKey('');
      setMode('INSERT');
      if (readOnly) {
        setStatusMessage({
          text: 'W10: Warning: Changing a readonly file (requires LV.5 ROOT to :w)',
          isError: true,
        });
      } else {
        setStatusMessage(null);
      }
      return;
    }
    if (e.key === 'a') {
      setPendingKey('');
      setMode('INSERT');
      setCursorCol(Math.min(currentLine.length, cursorCol + 1));
      setStatusMessage(null);
      return;
    }
    if (e.key === 'o') {
      setPendingKey('');
      setLines((prev) => {
        const copy = [...prev];
        copy.splice(cursorRow + 1, 0, '');
        return copy;
      });
      setCursorRow((r) => r + 1);
      setCursorCol(0);
      setIsDirty(true);
      setMode('INSERT');
      setStatusMessage(null);
      return;
    }

    // Delete char with x
    if (e.key === 'x' || e.key === 'Delete') {
      setPendingKey('');
      if (currentLine.length > 0) {
        const updated = currentLine.slice(0, cursorCol) + currentLine.slice(cursorCol + 1);
        setLines((prev) => {
          const copy = [...prev];
          copy[cursorRow] = updated;
          return copy;
        });
        setCursorCol((c) => Math.min(c, Math.max(0, updated.length - 1)));
        setIsDirty(true);
      }
      return;
    }

    // Delete line with dd
    if (e.key === 'd') {
      if (pendingKey === 'd') {
        setPendingKey('');
        setLines((prev) => {
          if (prev.length <= 1) return [''];
          const copy = [...prev];
          copy.splice(cursorRow, 1);
          return copy;
        });
        setCursorRow((r) => Math.max(0, Math.min(r, lines.length - 2)));
        setCursorCol(0);
        setIsDirty(true);
      } else {
        setPendingKey('d');
      }
      return;
    }

    // Enter Command mode with :
    if (e.key === ':') {
      setPendingKey('');
      setMode('COMMAND');
      setCommandBuffer(':');
      setStatusMessage(null);
      return;
    }

    setPendingKey('');
  };

  const renderLineWithCursor = (line: string, rowIdx: number) => {
    const isCurrentRow = rowIdx === cursorRow && mode !== 'COMMAND';
    if (!isCurrentRow) {
      if (line.startsWith('#') || line.startsWith('//')) {
        return <span className="text-endfield-slate italic">{line || '\u00A0'}</span>;
      }
      if (line.includes('OBJECTIVE:') || line.includes('CLUES:') || line.includes('PRIVATE NOTES:')) {
        return <span className="text-endfield-yellow text-glow-yellow font-bold">{line}</span>;
      }
      return <span>{line || '\u00A0'}</span>;
    }

    const safeCol = Math.min(cursorCol, line.length);
    const before = line.slice(0, safeCol);
    const charAt = line[safeCol] ?? ' ';
    const after = line.slice(safeCol + 1);

    return (
      <span>
        <span>{before}</span>
        <span
          className={`inline-block font-bold px-[1px] leading-tight select-none ${
            mode === 'INSERT'
              ? 'bg-endfield-emerald text-endfield-bg shadow-[0_0_8px_#00ff9d]'
              : 'bg-endfield-yellow text-endfield-bg shadow-[0_0_8px_#ffe600]'
          }`}
        >
          {charAt === ' ' ? '\u00A0' : charAt}
        </span>
        <span>{after}</span>
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => containerRef.current?.focus({ preventScroll: true })}
      className="fixed inset-0 z-50 bg-[#0A0C0F] text-gray-200 font-mono text-xs md:text-sm flex flex-col outline-none select-text overflow-hidden cad-grid crt-panel"
    >
      {/* Top File Title Bar */}
      <div className="flex items-center justify-between bg-[#11141B] px-4 py-2 border-b border-endfield-border select-none shrink-0 shadow-tactical-card">
        <div className="flex items-center space-x-3">
          <span
            className={`w-2.5 h-2.5 rounded-none ${
              mode === 'INSERT'
                ? 'bg-endfield-emerald shadow-[0_0_8px_#00ff9d]'
                : 'bg-endfield-yellow shadow-[0_0_8px_#ffe600]'
            }`}
          />
          <span className="text-xs font-black text-endfield-yellow text-glow-yellow tracking-wider">
            VIM // INTERACTIVE TTY EDITOR
          </span>
          <span className="text-endfield-cyan text-xs font-bold">
            [{fileName}]{isDirty ? ' [+]' : ''}{readOnly ? ' [RO]' : ''}
          </span>
        </div>

        {/* Interactive Toolbar for convenience */}
        <div className="flex items-center space-x-2 text-[11px]">
          {mode === 'NORMAL' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMode('INSERT');
                containerRef.current?.focus({ preventScroll: true });
              }}
              className="px-2 py-0.5 bg-endfield-emerald/20 border border-endfield-emerald text-endfield-emerald font-bold hover:bg-endfield-emerald hover:text-endfield-bg transition-colors"
            >
              [i: INSERT MODE]
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMode('NORMAL');
                containerRef.current?.focus({ preventScroll: true });
              }}
              className="px-2 py-0.5 bg-endfield-yellow/20 border border-endfield-yellow text-endfield-yellow font-bold hover:bg-endfield-yellow hover:text-endfield-bg transition-colors"
            >
              [ESC: NORMAL MODE]
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              executeExCommand(':wq');
              containerRef.current?.focus({ preventScroll: true });
            }}
            className="px-2 py-0.5 bg-endfield-cyan/20 border border-endfield-cyan text-endfield-cyan font-bold hover:bg-endfield-cyan hover:text-endfield-bg transition-colors"
          >
            [:wq SAVE & EXIT]
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              executeExCommand(':q!');
            }}
            className="px-2 py-0.5 bg-endfield-crimson/20 border border-endfield-crimson text-endfield-crimson font-bold hover:bg-endfield-crimson hover:text-white transition-colors"
          >
            [:q! QUIT]
          </button>
        </div>
      </div>

      {/* Main Editable Content Area with Line Numbers Gutter */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-endfield-border select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const isCurrent = idx === cursorRow;
              return (
                <tr
                  key={idx}
                  ref={isCurrent ? activeRowRef : undefined}
                  onClick={() => {
                    setCursorRow(idx);
                    setCursorCol(Math.min(cursorCol, Math.max(0, line.length)));
                  }}
                  className={isCurrent ? 'bg-endfield-yellow/[0.06]' : 'hover:bg-white/[0.02]'}
                >
                  <td
                    className={`w-12 text-right pr-4 select-none font-mono text-xs align-top border-r border-endfield-border/50 ${
                      isCurrent ? 'text-endfield-yellow font-bold' : 'text-endfield-muted'
                    }`}
                  >
                    {idx + 1}
                  </td>
                  <td className="pl-4 whitespace-pre-wrap break-all text-gray-100 font-mono select-text">
                    {renderLineWithCursor(line, idx)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vim Bottom Status Bar */}
      <div className="bg-[#121620] px-4 py-1.5 text-xs font-mono border-t border-endfield-border flex items-center justify-between select-none shrink-0">
        {mode === 'COMMAND' ? (
          <div className="flex items-center space-x-1 text-endfield-yellow text-glow-yellow font-bold">
            <span>{commandBuffer}</span>
            <span className="w-2 h-4 bg-endfield-yellow inline-block cursor-square-wave align-middle" />
          </div>
        ) : (
          <div className="flex items-center space-x-4 overflow-hidden">
            <span
              className={`px-2 py-0.5 font-black tracking-wider ${
                mode === 'INSERT'
                  ? 'bg-endfield-emerald text-endfield-bg shadow-[0_0_8px_#00ff9d]'
                  : 'bg-endfield-yellow text-endfield-bg shadow-[0_0_8px_#ffe600]'
              }`}
            >
              -- {mode} --
            </span>
            {statusMessage ? (
              <span
                className={
                  statusMessage.isError
                    ? 'text-endfield-crimson font-bold truncate'
                    : 'text-endfield-emerald font-semibold truncate'
                }
              >
                {statusMessage.text}
              </span>
            ) : (
              <span className="text-gray-300 truncate">
                "{fileName}"{isDirty ? ' [Modified]' : ''} {lineCount}L, {byteCount}B
              </span>
            )}
          </div>
        )}

        <div className="flex items-center space-x-4 text-[11px] text-endfield-slate shrink-0">
          <span className="text-endfield-cyan font-bold">
            Ln {cursorRow + 1}, Col {cursorCol + 1}
          </span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
