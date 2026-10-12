import React, { useState, useEffect, useRef } from 'react';
import { tacticalAudio } from '../audio/TacticalAudio';

interface VimModalProps {
  fileName: string;
  content: string;
  onClose: () => void;
}

export const VimModal: React.FC<VimModalProps> = ({ fileName, content, onClose }) => {
  const [commandBuffer, setCommandBuffer] = useState('');
  const [isCommandMode, setIsCommandMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = content.split('\n');
  const lineCount = lines.length;
  const byteCount = new TextEncoder().encode(content).length;

  useEffect(() => {
    tacticalAudio.playKeyClick();
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    tacticalAudio.playKeyClick();

    // Direct Esc key exit
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isCommandMode) {
        setIsCommandMode(false);
        setCommandBuffer('');
      } else {
        tacticalAudio.playPromptBeep();
        onClose();
      }
      return;
    }

    // Command mode typing (starts with ':')
    if (isCommandMode) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = commandBuffer.trim().toLowerCase();
        if (cmd === ':q' || cmd === ':q!' || cmd === ':wq' || cmd === 'q') {
          tacticalAudio.playPromptBeep();
          onClose();
        } else {
          setIsCommandMode(false);
          setCommandBuffer(`E492: Not an editor command: ${cmd}`);
        }
        return;
      }
      if (e.key === 'Backspace') {
        if (commandBuffer.length <= 1) {
          setIsCommandMode(false);
          setCommandBuffer('');
        } else {
          setCommandBuffer((p) => p.slice(0, -1));
        }
        return;
      }
      if (e.key.length === 1) {
        setCommandBuffer((p) => p + e.key);
        return;
      }
      return;
    }

    // Normal mode quick single-key 'q' or ':'
    if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      tacticalAudio.playPromptBeep();
      onClose();
      return;
    }

    if (e.key === ':') {
      e.preventDefault();
      setIsCommandMode(true);
      setCommandBuffer(':');
      return;
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 bg-[#0A0C0F] text-gray-200 font-mono text-xs md:text-sm flex flex-col outline-none select-text overflow-hidden"
    >
      {/* Top File Title Bar */}
      <div className="flex items-center justify-between bg-endfield-surface px-4 py-1.5 border-b border-endfield-border select-none shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-endfield-yellow"></span>
          <span className="text-xs font-bold text-endfield-yellow tracking-wider">
            VIM // TTY FILE VIEWER
          </span>
          <span className="text-endfield-muted text-[10px]">
            [{fileName}]
          </span>
        </div>
        <div className="text-[10px] text-endfield-slate">
          PRESS <span className="text-endfield-yellow font-bold">:q</span> OR <span className="text-endfield-yellow font-bold">ESC</span> TO EXIT
        </div>
      </div>

      {/* Main Content Area with Line Numbers Gutter */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-endfield-border select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                {/* Line number gutter */}
                <td className="w-12 text-right pr-4 text-endfield-muted select-none font-mono text-xs align-top border-r border-endfield-border/40">
                  {idx + 1}
                </td>
                {/* Content text with syntax highlight */}
                <td className="pl-4 whitespace-pre-wrap break-all text-gray-200 font-mono select-text">
                  {line.startsWith('#') || line.startsWith('//') ? (
                    <span className="text-endfield-slate italic">{line}</span>
                  ) : line.includes('KEY:') || line.includes('OBJECTIVE:') || line.includes('CLUES:') ? (
                    <span className="text-endfield-yellow font-bold">{line}</span>
                  ) : (
                    line
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vim Bottom Status Bar (Classic Normal Mode) */}
      <div className="bg-[#121620] px-4 py-1 text-xs font-mono border-t border-endfield-border flex items-center justify-between select-none shrink-0">
        {isCommandMode ? (
          <span className="text-endfield-yellow font-bold">
            {commandBuffer}
            <span className="w-2 h-3.5 bg-endfield-yellow inline-block ml-0.5 animate-pulse align-middle"></span>
          </span>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-endfield-cyan font-bold">-- NORMAL --</span>
            <span className="text-gray-300">
              "{fileName}" {lineCount}L, {byteCount}B
            </span>
          </div>
        )}

        <div className="flex items-center space-x-3 text-[10px] text-endfield-slate">
          <span>UTF-8</span>
          <span>100%</span>
          <button
            onClick={onClose}
            className="text-endfield-yellow hover:underline cursor-pointer font-bold"
          >
            [EXIT VIM]
          </button>
        </div>
      </div>
    </div>
  );
};
