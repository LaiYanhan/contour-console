import React, { useState } from 'react';
import { tacticalAudio } from '../audio/TacticalAudio';

interface NodeGate {
  id: number;
  label: string;
  rotation: number; // 0, 90, 180, 270
  target: number; // 0 is aligned
}

export const BreachProtocol: React.FC = () => {
  const [nodes, setNodes] = useState<NodeGate[]>([
    { id: 1, label: 'GATE_ALPHA', rotation: 90, target: 0 },
    { id: 2, label: 'GATE_BETA', rotation: 270, target: 0 },
    { id: 3, label: 'GATE_GAMMA', rotation: 180, target: 0 },
    { id: 4, label: 'GATE_DELTA', rotation: 90, target: 0 },
  ]);
  const [isBreached, setIsBreached] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleRotateNode = (id: number) => {
    if (isBreached) return;
    tacticalAudio.playKeyClick();

    setNodes((prev) => {
      const next = prev.map((n) => {
        if (n.id === id) {
          const nextRot = (n.rotation + 90) % 360;
          return { ...n, rotation: nextRot };
        }
        return n;
      });

      const allAligned = next.every((n) => n.rotation === n.target);
      if (allAligned) {
        setIsBreached(true);
        tacticalAudio.playSuccess();
      } else {
        tacticalAudio.playPromptBeep();
      }
      return next;
    });

    setAttempts((a) => a + 1);
  };

  const handleReset = () => {
    tacticalAudio.playPromptBeep();
    setNodes([
      { id: 1, label: 'GATE_ALPHA', rotation: 90, target: 0 },
      { id: 2, label: 'GATE_BETA', rotation: 270, target: 0 },
      { id: 3, label: 'GATE_GAMMA', rotation: 180, target: 0 },
      { id: 4, label: 'GATE_DELTA', rotation: 90, target: 0 },
    ]);
    setIsBreached(false);
    setAttempts(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto font-mono select-none">
      {/* Breach Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 text-endfield-yellow text-glow-yellow text-xs font-bold tracking-widest uppercase mb-1">
          <span className="w-2 h-2 bg-endfield-yellow animate-ping"></span>
          <span>WATCH DOGS INTRUSION PROTOCOL // CTOS BREACH</span>
        </div>
        <p className="text-xs text-endfield-slate">
          Click the circuit gates to rotate and align the neural bypass link to 000° alignment.
        </p>
      </div>

      {/* Network Circuit Nodes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
        {nodes.map((node) => {
          const isAligned = node.rotation === node.target;
          return (
            <button
              key={node.id}
              onClick={() => handleRotateNode(node.id)}
              className={`flex flex-col items-center justify-center p-4 border transition-all duration-300 relative group crt-panel
                ${
                  isAligned
                    ? 'border-endfield-emerald bg-endfield-emerald/10 shadow-glow-yellow-sm'
                    : 'border-endfield-border bg-endfield-card/85 hover:border-endfield-yellow'
                }
              `}
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              }}
            >
              {/* Rotating Circuit Graphic */}
              <div
                className="w-14 h-14 flex items-center justify-center transition-transform duration-300 relative my-2"
                style={{ transform: `rotate(${node.rotation}deg)` }}
              >
                <div
                  className={`w-12 h-12 border-2 rounded-full flex items-center justify-center ${
                    isAligned ? 'border-endfield-emerald' : 'border-endfield-yellow'
                  }`}
                >
                  <div
                    className={`w-1 h-6 ${
                      isAligned ? 'bg-endfield-emerald' : 'bg-endfield-yellow'
                    }`}
                  />
                  <div
                    className={`w-6 h-1 absolute ${
                      isAligned ? 'bg-endfield-emerald' : 'bg-endfield-yellow'
                    }`}
                  />
                </div>
              </div>

              {/* Node Label & Angle */}
              <span className="text-[11px] font-bold text-gray-200 mt-2">
                {node.label}
              </span>
              <span
                className={`text-[10px] ${
                  isAligned ? 'text-endfield-emerald font-bold' : 'text-endfield-muted'
                }`}
              >
                {node.rotation}° {isAligned ? '[LOCKED]' : '[BYPASS]'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result Status Banner */}
      {isBreached ? (
        <div className="w-full bg-endfield-emerald/20 border border-endfield-emerald p-4 text-center mb-6 shadow-glow-yellow animate-fade-in crt-panel">
          <div className="text-base font-bold text-endfield-emerald text-glow-emerald tracking-widest uppercase">
            [ACCESS GRANTED // BREACH PROTOCOL OVERRIDE COMPLETE]
          </div>
          <div className="text-xs text-gray-200 mt-1">
            CTOS Subsurface Gateway decrypted in {attempts} rotations. Neural authorization locked.
          </div>
          <button
            onClick={handleReset}
            className="mt-3 px-4 py-1.5 bg-endfield-emerald text-endfield-bg font-bold text-xs hover:bg-emerald-300 transition-colors"
          >
            RE-ENGAGE FIREWALL
          </button>
        </div>
      ) : (
        <div className="w-full flex items-center justify-between text-xs text-endfield-muted border-t border-endfield-border pt-3">
          <span>CYCLE ATTEMPTS: {attempts}</span>
          <span className="text-endfield-yellow">SECURITY LOCK: ARMED</span>
          <button
            onClick={handleReset}
            className="text-endfield-slate hover:text-endfield-yellow underline"
          >
            RESET GATES
          </button>
        </div>
      )}
    </div>
  );
};
