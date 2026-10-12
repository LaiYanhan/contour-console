import React from 'react';
import type { OperatorSession, TacticalView } from '../../types/tactical';
import { HolotableCanvas } from './HolotableCanvas';
import { ArcNavDeck } from './ArcNavDeck';
import { TelemetryPanel } from './TelemetryPanel';

interface HolotableProps {
  session: OperatorSession | null;
  currentView: TacticalView;
  onNavigate: (view: TacticalView) => void;
}

export const Holotable: React.FC<HolotableProps> = ({
  session,
  currentView,
  onNavigate,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-endfield-bg select-none">
      {/* 1. Background Grid & Radar Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2633_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* 2. Central 3D Topographic Canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <HolotableCanvas onSelectBeacon={(name) => console.log('Selected Beacon:', name)} />
      </div>

      {/* 3. Left & Right Curved Arc Nav Decks */}
      <ArcNavDeck
        currentView={currentView}
        onNavigate={onNavigate}
        isRoot={session?.isRoot ?? false}
      />

      {/* Spacer for flexible middle layer */}
      <div className="flex-1 pointer-events-none" />

      {/* 4. Bottom Industrial Telemetry & Deployment Hub */}
      <TelemetryPanel
        onDeploy={() => onNavigate('operator')}
        onNavigate={onNavigate}
      />
    </div>
  );
};
