import React from 'react';
import type { TacticalView } from '../../types/tactical';
import { tacticalAudio } from '../audio/TacticalAudio';

interface ArcNavDeckProps {
  currentView: TacticalView;
  onNavigate: (view: TacticalView) => void;
  isRoot: boolean;
}

interface NavCardItem {
  id: TacticalView;
  code: string;
  labelZh: string;
  labelEn: string;
  iconSvg: React.ReactNode;
  requiresRoot?: boolean;
}

export const ArcNavDeck: React.FC<ArcNavDeckProps> = ({
  currentView,
  onNavigate,
  isRoot,
}) => {
  const leftCards: NavCardItem[] = [
    {
      id: 'operator',
      code: '// 01',
      labelZh: '干员',
      labelEn: 'OPERATOR',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'squads',
      code: '// 02',
      labelZh: '编队',
      labelEn: 'SQUADS',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'comms',
      code: '// 03',
      labelZh: '通讯',
      labelEn: 'COMMS',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  const rightCards: NavCardItem[] = [
    {
      id: 'archives',
      code: '// 04',
      labelZh: '档案',
      labelEn: 'ARCHIVES',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      id: 'breach',
      code: '// 05',
      labelZh: '协议',
      labelEn: 'BREACH',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'terminal',
      code: '// 06',
      labelZh: '终端',
      labelEn: 'TERMINAL',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    ...(isRoot
      ? [
          {
            id: 'kernel' as TacticalView,
            code: '// 07',
            labelZh: '权限',
            labelEn: 'ROOT KERNEL',
            requiresRoot: true,
            iconSvg: (
              <svg className="w-5 h-5 text-endfield-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const handleCardClick = (item: NavCardItem) => {
    tacticalAudio.playTransition();
    onNavigate(item.id);
  };

  const handleCardHover = () => {
    tacticalAudio.playKeyClick();
  };

  const renderCard = (item: NavCardItem, isLeft: boolean) => {
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleCardClick(item)}
        onMouseEnter={handleCardHover}
        className={`group relative flex items-center space-x-3 px-4 py-3 min-w-[145px] md:min-w-[172px] transition-all duration-200 select-none text-left
          border backdrop-blur-xl shadow-tactical-card
          before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent
          ${
            item.requiresRoot
              ? 'border-endfield-crimson/60 bg-[#161218]/90 hover:bg-endfield-crimson/20 hover:border-endfield-crimson shadow-glow-crimson'
              : isActive
              ? 'border-endfield-yellow bg-[#1A1812]/95 shadow-glow-yellow'
              : 'border-endfield-border/90 bg-[#11141B]/85 hover:border-endfield-yellow/80 hover:bg-[#181C26]/90'
          }
        `}
        style={{
          clipPath: isLeft
            ? 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)'
            : 'polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px)',
        }}
      >
        {/* Corner Reticle Brackets (⌜ ⌟) */}
        <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-endfield-yellow/80 pointer-events-none"></span>
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-endfield-yellow/80 pointer-events-none"></span>

        {/* Glow edge indicator */}
        <div
          className={`absolute ${
            isLeft ? 'left-0' : 'right-0'
          } top-0 bottom-0 w-1 transition-colors ${
            item.requiresRoot
              ? 'bg-endfield-crimson'
              : isActive
              ? 'bg-endfield-yellow shadow-[0_0_8px_#ffe600]'
              : 'bg-transparent group-hover:bg-endfield-yellow'
          }`}
        />

        {/* Icon */}
        <div
          className={`p-1.5 transition-colors ${
            item.requiresRoot
              ? 'text-endfield-crimson'
              : isActive
              ? 'text-endfield-yellow text-glow-yellow'
              : 'text-endfield-slate group-hover:text-endfield-yellow'
          }`}
        >
          {item.iconSvg}
        </div>

        {/* Text information */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-black text-sm tracking-wide text-gray-100 group-hover:text-endfield-yellow group-hover:text-glow-yellow transition-colors font-sans">
              {item.labelZh}
            </span>
            <span className="text-[10px] font-mono text-endfield-muted font-bold">
              {item.code}
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="w-1 h-1 rounded-full bg-endfield-yellow/60 group-hover:bg-endfield-yellow"></span>
            <span
              className={`text-[9px] font-mono tracking-widest uppercase font-bold ${
                item.requiresRoot
                  ? 'text-endfield-crimson'
                  : 'text-endfield-slate group-hover:text-endfield-yellow-light'
              }`}
            >
              {item.labelEn}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Desktop Arc Positioning: Left Wing */}
      <div className="hidden lg:flex flex-col space-y-4 absolute left-8 top-1/2 -translate-y-1/2 z-20">
        <div className="text-[10px] font-mono text-endfield-muted uppercase tracking-widest pl-2 border-l border-endfield-border">
          // IDENTITY & ASSETS
        </div>
        {leftCards.map((c) => renderCard(c, true))}
      </div>

      {/* Desktop Arc Positioning: Right Wing */}
      <div className="hidden lg:flex flex-col space-y-4 absolute right-8 top-1/2 -translate-y-1/2 z-20 items-end">
        <div className="text-[10px] font-mono text-endfield-muted uppercase tracking-widest pr-2 border-r border-endfield-border text-right">
          // OPERATIONS & PROTOCOL
        </div>
        {rightCards.map((c) => renderCard(c, false))}
      </div>

      {/* Mobile & Tablet Flow Deck */}
      <div className="flex lg:hidden flex-wrap justify-center gap-2 p-3 w-full bg-endfield-surface/80 border-t border-endfield-border z-20">
        {[...leftCards, ...rightCards].map((c, idx) =>
          renderCard(c, idx < leftCards.length)
        )}
      </div>
    </>
  );
};
