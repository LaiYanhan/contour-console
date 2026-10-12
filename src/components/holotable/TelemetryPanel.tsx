import React from 'react';
import type { TacticalView } from '../../types/tactical';
import { tacticalAudio } from '../audio/TacticalAudio';

interface TelemetryPanelProps {
  onDeploy: () => void;
  onNavigate: (view: TacticalView) => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  onDeploy,
  onNavigate,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 select-none pointer-events-auto z-20 shrink-0 gap-3">
      {/* 1. Left Telemetry Module (Image #1 1:1 match) */}
      <div className="flex flex-col bg-endfield-surface/90 border border-endfield-border p-2.5 min-w-[260px] md:min-w-[320px] backdrop-blur-md">
        {/* Row 1: North Pipeline Deep Crater */}
        <div className="flex items-center justify-between py-1 border-b border-endfield-border/60 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-endfield-yellow"></div>
            <span className="text-gray-200 font-bold">北部管线深坑</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-endfield-yellow">⚡ 14.4K/15K</span>
            <span className="text-endfield-cyan">⚙ 4200 O/MIN</span>
          </div>
        </div>

        {/* Row 2: Alkali Land */}
        <div className="flex items-center justify-between py-1 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-gray-400"></div>
            <span className="text-gray-300">大盘碱地</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-endfield-yellow">⚡ 14.4K/15K</span>
            <span className="text-endfield-cyan">⚙ 4200 O/MIN</span>
          </div>
        </div>

        <div className="text-[9px] font-mono text-endfield-muted flex justify-between pt-1">
          <span>FACTORY_NET: TALOS_NODE_04</span>
          <span className="text-endfield-emerald">● GRID_STABLE</span>
        </div>
      </div>

      {/* 2. Center Signature Endfield Yellow Deployment Hub (Image #1 1:1 match) */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            tacticalAudio.playTransition();
            onDeploy();
          }}
          className="group relative flex items-center bg-endfield-yellow hover:bg-endfield-yellow-light text-endfield-bg transition-all duration-200 shadow-glow-yellow px-6 py-2.5"
          style={{
            clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
          }}
        >
          {/* Geometric Endfield Icon */}
          <div className="w-6 h-6 mr-3 flex items-center justify-center font-black font-mono text-base border-2 border-endfield-bg">
            EF
          </div>

          <div className="flex flex-col text-left mr-6">
            <span className="text-base font-bold font-sans tracking-wider leading-none text-endfield-bg">
              四号谷地
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-endfield-bg/80">
              VALLEY IV // SECTOR_04
            </span>
          </div>

          <div className="border-l border-endfield-bg/40 pl-4 flex items-center space-x-1.5 font-bold font-mono tracking-widest text-sm text-endfield-bg">
            <span>部署</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>

      {/* 3. Right Alert Card (Image #1 Engineering Upgrade match) */}
      <div
        onClick={() => {
          tacticalAudio.playTransition();
          onNavigate('breach');
        }}
        className="cursor-pointer group flex items-center bg-endfield-surface/90 border border-endfield-yellow/40 hover:border-endfield-yellow p-2.5 min-w-[240px] md:min-w-[280px] backdrop-blur-md transition-all shadow-glow-yellow-sm"
      >
        {/* Warning Badge */}
        <div className="w-10 h-10 bg-endfield-yellow/20 border border-endfield-yellow flex flex-col items-center justify-center mr-3 shrink-0">
          <span className="text-endfield-yellow text-xs font-bold font-mono">NEW</span>
          <div className="w-4 h-0.5 bg-endfield-yellow mt-0.5"></div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono font-bold bg-endfield-crimson text-white px-1">
              ALERT
            </span>
            <span className="text-[11px] font-mono font-bold text-gray-100 group-hover:text-endfield-yellow transition-colors">
              WATCH DOGS BREACH
            </span>
          </div>
          <span className="text-[10px] font-mono text-endfield-slate mt-0.5">
            解密协议沙盘已接入 [点击测试]
          </span>
        </div>
      </div>
    </div>
  );
};
