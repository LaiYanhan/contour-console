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
      <div className="relative flex flex-col bg-[#11141B]/95 border border-endfield-border p-3 min-w-[270px] md:min-w-[340px] backdrop-blur-xl shadow-tactical-card crt-panel">
        {/* Reticle Corner Brackets */}
        <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-endfield-yellow/80 pointer-events-none"></span>
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-endfield-yellow/80 pointer-events-none"></span>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Row 1: North Pipeline Deep Crater */}
        <div className="flex items-center justify-between py-1.5 border-b border-endfield-border/60 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-endfield-yellow shadow-[0_0_6px_#ffe600]"></div>
            <span className="text-gray-100 font-bold">北部管线深坑</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-endfield-yellow text-glow-yellow font-bold">⚡ 14.4K/15K</span>
            <span className="text-endfield-cyan text-glow-cyan font-bold">⚙ 4200 O/MIN</span>
          </div>
        </div>

        {/* Row 2: Alkali Land */}
        <div className="flex items-center justify-between py-1.5 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-endfield-slate"></div>
            <span className="text-gray-200">大盘碱地</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-endfield-yellow text-glow-yellow font-bold">⚡ 14.4K/15K</span>
            <span className="text-endfield-cyan text-glow-cyan font-bold">⚙ 4200 O/MIN</span>
          </div>
        </div>

        <div className="text-[9px] font-mono text-endfield-slate flex justify-between pt-1 border-t border-endfield-border/40">
          <span>AIC_NETWORK: TALOS_NODE_04</span>
          <span className="text-endfield-emerald text-glow-emerald font-bold">● GRID_STABLE [100%]</span>
        </div>
      </div>

      {/* 2. Center Signature Endfield Yellow Deployment Hub (Image #1 1:1 match) */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            tacticalAudio.playTransition();
            onDeploy();
          }}
          className="group relative flex items-center bg-endfield-yellow hover:bg-endfield-yellow-light text-endfield-bg transition-all duration-200 shadow-glow-yellow px-7 py-3 font-sans"
          style={{
            clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)',
          }}
        >
          {/* Mini Hazard Warning Stripes Tab on Left */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 hazard-stripes-yellow opacity-85" />

          {/* Geometric Endfield Monogram */}
          <div className="w-6 h-6 ml-2 mr-3 flex items-center justify-center font-black font-mono text-sm border-2 border-endfield-bg bg-endfield-bg text-endfield-yellow">
            EF
          </div>

          <div className="flex flex-col text-left mr-7">
            <span className="text-lg font-black tracking-wider leading-none text-endfield-bg">
              四号谷地
            </span>
            <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-endfield-bg/85 mt-0.5">
              VALLEY IV // SECTOR_04
            </span>
          </div>

          <div className="border-l-2 border-endfield-bg/40 pl-4 flex items-center space-x-1.5 font-bold font-mono tracking-widest text-sm text-endfield-bg">
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
        className="relative cursor-pointer group flex items-center bg-[#11141B]/95 border border-endfield-yellow/50 hover:border-endfield-yellow p-3 min-w-[250px] md:min-w-[290px] backdrop-blur-xl transition-all shadow-tactical-card crt-panel"
      >
        {/* Reticle Corner Brackets */}
        <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-endfield-yellow/80 pointer-events-none"></span>
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-endfield-yellow/80 pointer-events-none"></span>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
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
            <span className="text-[11px] font-mono font-bold text-gray-100 text-glow-yellow group-hover:text-endfield-yellow transition-colors">
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
