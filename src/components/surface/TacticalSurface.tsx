import React, { useEffect } from 'react';
import type { OperatorSession, TacticalView } from '../../types/tactical';
import { BreachProtocol } from './BreachProtocol';
import { tacticalAudio } from '../audio/TacticalAudio';

interface TacticalSurfaceProps {
  view: TacticalView;
  session: OperatorSession | null;
  onExit: () => void;
  onNavigate: (view: TacticalView) => void;
}

export const TacticalSurface: React.FC<TacticalSurfaceProps> = ({
  view,
  session,
  onExit,
  onNavigate,
}) => {
  // Listen for Escape key to quickly exit to Holotable
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        tacticalAudio.playTransition();
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const getViewMeta = () => {
    switch (view) {
      case 'operator':
        return {
          code: '// 01',
          titleZh: '干员资料',
          titleEn: 'OPERATOR PROFILE',
          desc: '身份识别凭证、专精领域与战术技能矩阵',
        };
      case 'squads':
        return {
          code: '// 02',
          titleZh: '作战编队',
          titleEn: 'TACTICAL SQUADS & PROJECTS',
          desc: '开源工程、部署原型与核心作品集归档',
        };
      case 'comms':
        return {
          code: '// 03',
          titleZh: '通讯节点',
          titleEn: 'COMMUNICATIONS & NODES',
          desc: '加密联络信标、社交网络与外部终端直连',
        };
      case 'archives':
        return {
          code: '// 04',
          titleZh: '机密档案',
          titleEn: 'SYSTEM ARCHIVES & LOGS',
          desc: '技术架构演进纪要、研读笔记与开发日志',
        };
      case 'breach':
        return {
          code: '// 05',
          titleZh: '解密协议',
          titleEn: 'WATCH DOGS BREACH PROTOCOL',
          desc: 'CTOS 神经旁路入侵与交互式电路破解协议',
        };
      case 'kernel':
        return {
          code: '// 07',
          titleZh: '系统内核',
          titleEn: 'ROOT KERNEL MANAGEMENT',
          desc: 'LV.5 特权操作员专享全局参数控制台',
        };
      default:
        return {
          code: '// 00',
          titleZh: '战术视窗',
          titleEn: 'TACTICAL SURFACE',
          desc: '模块化系统容器',
        };
    }
  };

  const meta = getViewMeta();

  return (
    <div className="relative w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto bg-endfield-bg select-none cad-grid">
      {/* 1. Tactical Surface Armored Header Bar */}
      <div className="relative flex items-center justify-between border-b-2 border-endfield-yellow pb-3.5 mb-6 shrink-0 bg-[#11141B]/90 p-4 border border-endfield-border shadow-tactical-card">
        {/* Reticle Corner Brackets */}
        <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-endfield-yellow pointer-events-none"></span>
        <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-endfield-yellow pointer-events-none"></span>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex items-center space-x-3.5">
          <span className="text-sm font-mono font-black px-2.5 py-1 bg-endfield-yellow text-endfield-bg shadow-[0_0_10px_rgba(255,230,0,0.4)]">
            {meta.code}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg md:text-xl font-black font-sans text-gray-100 tracking-wide">
                {meta.titleZh}
              </h2>
              <span className="text-xs font-mono text-endfield-yellow text-glow-yellow font-bold tracking-widest uppercase">
                {meta.titleEn}
              </span>
            </div>
            <p className="text-xs font-mono text-endfield-slate mt-0.5">
              {meta.desc} // AIC_STATUS: OK
            </p>
          </div>
        </div>

        {/* Top-Right Exit Button (Image #1 1:1 match) */}
        <button
          onClick={() => {
            tacticalAudio.playTransition();
            onExit();
          }}
          className="relative flex items-center space-x-2 px-3.5 py-2 bg-[#161B24] hover:bg-endfield-yellow hover:text-endfield-bg text-endfield-slate border border-endfield-border hover:border-endfield-yellow transition-all duration-200 group text-xs font-mono font-bold shadow-tactical-card"
          style={{
            clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
          }}
        >
          <span>返回沙盘</span>
          <span className="bg-endfield-bg/70 group-hover:bg-endfield-bg group-hover:text-endfield-yellow text-gray-300 px-1.5 text-[10px]">
            ESC
          </span>
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 2. Modular Content Surface */}
      <div className="flex-1 max-w-5xl mx-auto w-full">
        {/* VIEW: OPERATOR */}
        {view === 'operator' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            {/* ID Card */}
            <div className="bg-endfield-surface border border-endfield-border p-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-endfield-card border-2 border-endfield-yellow mb-4 flex items-center justify-center font-bold text-3xl text-endfield-yellow shadow-glow-yellow-sm">
                {session?.username ? session.username.substring(0, 2).toUpperCase() : 'OP'}
              </div>
              <h3 className="text-lg font-bold text-gray-100">
                @{session?.username || 'OPERATOR'}
              </h3>
              <span className="text-xs text-endfield-cyan mt-1">
                SYSTEM OPERATOR // TALOS-IV
              </span>
              <div className="mt-4 w-full border-t border-endfield-border pt-3 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-endfield-muted">CLEARANCE:</span>
                  <span className={session?.isRoot ? 'text-endfield-crimson font-bold' : 'text-endfield-yellow'}>
                    {session?.clearance || 'LV.3 STANDARD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-endfield-muted">ACCESS TOKEN:</span>
                  <span className="text-gray-300">{session?.token || 'UNASSIGNED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-endfield-muted">STATUS:</span>
                  <span className="text-endfield-emerald">● ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Spec & Skills Matrix */}
            <div className="md:col-span-2 bg-endfield-surface border border-endfield-border p-5 space-y-4">
              <h4 className="text-sm font-bold text-endfield-yellow tracking-wider border-b border-endfield-border pb-2">
                // TECHNICAL ARCHITECTURE & STACKS
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                欢迎登入操作员终端。此模块为你的个人简介与技术栈占位视窗。你可在后续直接通过组件注入真实经历、作品图集或个人技能雷达。
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {['WebGL / Three.js', 'Astro / React', 'TailwindCSS', 'TypeScript', 'GitHub Pages CI', 'Web Audio API'].map((tag) => (
                  <div key={tag} className="bg-endfield-card border border-endfield-border/60 p-2.5 text-xs">
                    <div className="text-[10px] text-endfield-muted">CAPABILITY //</div>
                    <div className="text-gray-200 font-bold mt-0.5">{tag}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SQUADS (PROJECTS) */}
        {view === 'squads' && (
          <div className="space-y-4 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'Endfield Tactical Holotable',
                  status: 'DEPLOYED // v1.0',
                  desc: '基于明日方舟终末地工业美学的高集成度全息战术中控沙盘与 WebGL 地形渲染。',
                  tags: ['Astro', 'Three.js', 'React'],
                },
                {
                  name: 'Watch Dogs Breach Sandbox',
                  status: 'ACTIVE PROTOCOL',
                  desc: '仿看门狗黑客神经回路密码解密实验沙盒，具备 Web Audio 实时音效与交互电路。',
                  tags: ['Cybersec', 'Canvas', 'Interactive'],
                },
                {
                  name: 'Modular Content Collection Engine',
                  status: 'EXTENSIBLE',
                  desc: '支持通过 Markdown / MDX 极简无痛扩展博客文章与作品集合的静态架构。',
                  tags: ['SSG', 'Markdown', 'GitHub Pages'],
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="bg-endfield-surface border border-endfield-border p-4 hover:border-endfield-yellow transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-gray-100 group-hover:text-endfield-yellow transition-colors">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-endfield-emerald font-bold bg-endfield-emerald/10 px-1.5 py-0.5">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-endfield-slate mb-3 font-sans">
                    {p.desc}
                  </p>
                  <div className="flex space-x-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[9px] bg-endfield-card text-endfield-slate px-1.5 py-0.5 border border-endfield-border">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: COMMS */}
        {view === 'comms' && (
          <div className="bg-endfield-surface border border-endfield-border p-6 font-mono space-y-4 max-w-xl mx-auto">
            <h3 className="text-sm font-bold text-endfield-yellow tracking-wider border-b border-endfield-border pb-2">
              // SECURE COMMUNICATION CHANNELS
            </h3>
            <p className="text-xs text-gray-300 font-sans">
              通讯节点已就绪。在此展示你的 GitHub、社交媒体外链或用于接收邮件的加密通讯表单。
            </p>
            <div className="space-y-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-endfield-card border border-endfield-border hover:border-endfield-yellow transition-colors"
              >
                <span className="text-xs font-bold text-gray-200">GITHUB REPOSITORY // SOURCE</span>
                <span className="text-xs text-endfield-yellow">OPEN LINK →</span>
              </a>
              <div className="flex items-center justify-between p-3 bg-endfield-card border border-endfield-border">
                <span className="text-xs font-bold text-gray-200">SIGNAL PROTOCOL // ENCRYPTED COMMS</span>
                <span className="text-xs text-endfield-emerald">LISTENING</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ARCHIVES */}
        {view === 'archives' && (
          <div className="bg-endfield-surface border border-endfield-border p-6 font-mono space-y-4">
            <h3 className="text-sm font-bold text-endfield-yellow tracking-wider border-b border-endfield-border pb-2">
              // ARCHIVE INDEX & ARTICLES
            </h3>
            <p className="text-xs text-gray-300 font-sans">
              文章与博客档案库。依托 Astro Content Collections 规范，后续只需在 <code>src/content/</code> 增加 Markdown 文件即可自动生成新文章。
            </p>
            <div className="space-y-2 pt-2">
              {[
                { title: 'ADR 0001: 采用 Astro + React 静态架构与 GitHub Pages 自动化部署', date: '2026-10-12', tag: 'ADR' },
                { title: 'ADR 0002: 采用纯前端临时操作员凭证生成与双轨权限分级', date: '2026-10-12', tag: 'SECURITY' },
                { title: 'Endfield Tactical Holotable: 3D 等高线着色器与全息中控设计演进', date: '2026-10-12', tag: 'GRAPHICS' },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-endfield-card border border-endfield-border/60 hover:border-endfield-yellow transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] bg-endfield-yellow/20 text-endfield-yellow px-1 font-bold">{a.tag}</span>
                    <span className="text-xs text-gray-200 font-bold">{a.title}</span>
                  </div>
                  <span className="text-[10px] text-endfield-muted">{a.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: BREACH */}
        {view === 'breach' && (
          <div className="bg-endfield-surface border border-endfield-border p-6">
            <BreachProtocol />
          </div>
        )}

        {/* VIEW: KERNEL (ROOT ONLY) */}
        {view === 'kernel' && (
          <div className="bg-endfield-surface border-2 border-endfield-crimson p-6 font-mono space-y-4">
            <div className="flex items-center space-x-2 text-endfield-crimson">
              <span className="w-3 h-3 bg-endfield-crimson"></span>
              <h3 className="text-sm font-bold tracking-widest uppercase">
                ROOT KERNEL CONTROLLER // CLEARANCE: LV.5
              </h3>
            </div>
            <p className="text-xs text-gray-300 font-sans">
              您当前以 Root 管理员身份登录。此管理视窗仅对通过 SHA-256 密码核验的管理员开放。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="bg-endfield-card p-3 border border-endfield-border">
                <span className="text-[10px] text-endfield-muted">TELEMETRY OVERRIDE</span>
                <div className="text-endfield-crimson font-bold text-sm mt-1">LV.5 BYPASS ENABLED</div>
              </div>
              <div className="bg-endfield-card p-3 border border-endfield-border">
                <span className="text-[10px] text-endfield-muted">CLIENT CREDENTIAL HASH</span>
                <div className="text-endfield-yellow font-bold text-xs truncate mt-1">SHA256: d8de3df9...</div>
              </div>
              <div className="bg-endfield-card p-3 border border-endfield-border">
                <span className="text-[10px] text-endfield-muted">SECURITY POLICIES</span>
                <div className="text-endfield-emerald font-bold text-sm mt-1">PERMISSIVE_SANDBOX</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
