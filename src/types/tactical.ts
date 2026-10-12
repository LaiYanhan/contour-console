export type ClearanceLevel = 'LV.3 STANDARD' | 'LV.5 ROOT';

export interface OperatorSession {
  username: string;
  clearance: ClearanceLevel;
  isRoot: boolean;
  token: string;
  loginTimestamp: number;
}

export type TacticalView = 
  | 'terminal'
  | 'holotable'
  | 'operator'
  | 'squads'
  | 'comms'
  | 'archives'
  | 'breach'
  | 'kernel';

export interface LineToken {
  text: string;
  color?: string;
  className?: string;
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'system' | 'info' | 'success' | 'warn' | 'error' | 'input' | 'ascii' | 'root';
  timestamp?: string;
  tokens?: LineToken[];
}

export interface CommandDef {
  command: string;
  usage: string;
  description: string;
  requiresRoot?: boolean;
}
