import type { CommandDef, OperatorSession, TacticalView } from '../../types/tactical';

export const ADMIN_CONFIG = {
  username: 'admin',
  // SHA-256 for 'endfield.root'
  passwordHash: 'd8de3df96de5fb709c007b227ba30a96053dea0e6e39016b95a75b36a7f562a3',
};

export const COMMAND_REGISTRY: CommandDef[] = [
  {
    command: 'help',
    usage: 'help [command]',
    description: 'Display interactive tactical command matrix and usage docs',
  },
  {
    command: 'system.connect holotable',
    usage: 'system.connect holotable',
    description: 'Establish neural link to the 3D Holotable command deck',
  },
  {
    command: 'deploy.sector valley-4',
    usage: 'deploy.sector valley-4',
    description: 'Direct tactical deployment to Valley IV central hub',
  },
  {
    command: 'navigate.to',
    usage: 'navigate.to <operator|squads|comms|archives|breach>',
    description: 'Sub-system surface jump to specified module container',
  },
  {
    command: 'protocol.breach --init',
    usage: 'protocol.breach --init',
    description: 'Execute Watch Dogs styled decryption sandbox sequence',
  },
  {
    command: 'session.status',
    usage: 'session.status',
    description: 'Query current operator authorization clearance and token',
  },
  {
    command: 'session.logout',
    usage: 'session.logout',
    description: 'Terminate active operator session and return to gateway',
  },
  {
    command: 'clear',
    usage: 'clear',
    description: 'Flush current terminal buffer and reset display stream',
  },
  // Root / Admin Privileged Commands
  {
    command: 'system.override',
    usage: 'system.override',
    description: 'Kernel level security bypass & telemetry override protocol',
    requiresRoot: true,
  },
  {
    command: 'telemetry.debug',
    usage: 'telemetry.debug',
    description: 'Inspect live sensor feed, memory registers & system metrics',
    requiresRoot: true,
  },
  {
    command: 'admin.kernel',
    usage: 'admin.kernel',
    description: 'Mount root operator management & privileged subsystem surface',
    requiresRoot: true,
  },
];

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface ParseResult {
  lines: Array<{
    text: string;
    type: 'system' | 'info' | 'success' | 'warn' | 'error' | 'root';
  }>;
  nextView?: TacticalView;
  clearSession?: boolean;
}

export function parseAndExecuteCommand(
  rawInput: string,
  session: OperatorSession | null
): ParseResult {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return { lines: [] };
  }

  const isRoot = session?.isRoot ?? false;

  // Exact or prefix matching
  if (trimmed === 'help' || trimmed === 'help.list' || trimmed === 'help --list') {
    const output: ParseResult['lines'] = [
      { text: '================================================================', type: 'system' },
      { text: '  ENDFIELD TACTICAL OS // COMMAND MATRIX INTERFACE', type: 'info' },
      { text: '================================================================', type: 'system' },
      { text: 'USAGE: Enter exact command or use [TAB] for auto-completion.', type: 'warn' },
      { text: '', type: 'info' },
    ];

    COMMAND_REGISTRY.forEach((cmd) => {
      if (cmd.requiresRoot && !isRoot) return;
      const rootTag = cmd.requiresRoot ? '[ROOT ONLY] ' : '            ';
      const type = cmd.requiresRoot ? 'root' : 'info';
      output.push({
        text: `  ${cmd.command.padEnd(26)} ${rootTag}- ${cmd.description}`,
        type,
      });
    });

    if (!isRoot) {
      output.push({ text: '', type: 'info' });
      output.push({
        text: '  NOTE: [3] Root-level privileged commands are hidden. Log in as admin to unlock.',
        type: 'warn',
      });
    }

    return { lines: output };
  }

  if (trimmed === 'clear') {
    return { lines: [] };
  }

  if (trimmed === 'system.connect holotable' || trimmed === 'deploy.sector valley-4') {
    return {
      lines: [
        { text: '[INITIATING TACTICAL LINK] Routing to Holotable command deck...', type: 'warn' },
        { text: '[TELEMETRY SYNCHRONIZED] Holotable rendering online.', type: 'success' },
      ],
      nextView: 'holotable',
    };
  }

  if (trimmed.startsWith('navigate.to')) {
    const parts = trimmed.split(/\s+/);
    const target = parts[1]?.toLowerCase();
    const validTargets: Record<string, TacticalView> = {
      operator: 'operator',
      squads: 'squads',
      comms: 'comms',
      archives: 'archives',
      archive: 'archives',
      breach: 'breach',
      kernel: 'kernel',
      holotable: 'holotable',
    };

    if (target && target in validTargets) {
      const dest = validTargets[target];
      if (dest === 'kernel' && !isRoot) {
        return {
          lines: [
            { text: `[SECURITY VIOLATION] ACCESS DENIED: Target '${target}' requires LV.5 ROOT clearance.`, type: 'error' },
          ],
        };
      }
      return {
        lines: [
          { text: `[VECTOR LOCK] Jumping to tactical surface: ${dest.toUpperCase()}...`, type: 'warn' },
          { text: '[SURFACE ENGAGED] Display container loaded.', type: 'success' },
        ],
        nextView: dest,
      };
    }

    return {
      lines: [
        { text: `[INVALID TARGET] Usage: navigate.to <operator|squads|comms|archives|breach>`, type: 'error' },
        { text: `Available targets: operator, squads, comms, archives, breach`, type: 'info' },
      ],
    };
  }

  if (trimmed === 'protocol.breach --init' || trimmed === 'protocol.breach' || trimmed === 'breach') {
    return {
      lines: [
        { text: '[WATCH DOGS PROTOCOL ACTIVATED] Initializing intrusion handshake...', type: 'warn' },
        { text: '[DECRYPTION MATRIX] Launching breach simulation surface...', type: 'success' },
      ],
      nextView: 'breach',
    };
  }

  if (trimmed === 'session.status') {
    if (!session) {
      return {
        lines: [{ text: '[NO ACTIVE SESSION] Guest gateway unauthenticated.', type: 'warn' }],
      };
    }
    const duration = Math.floor((Date.now() - session.loginTimestamp) / 1000);
    return {
      lines: [
        { text: `OPERATOR ID   : @${session.username}`, type: session.isRoot ? 'root' : 'success' },
        { text: `CLEARANCE     : ${session.clearance}`, type: session.isRoot ? 'root' : 'warn' },
        { text: `ACCESS TOKEN  : ${session.token}`, type: 'info' },
        { text: `SESSION AGE   : ${duration}s`, type: 'info' },
      ],
    };
  }

  if (trimmed === 'session.logout') {
    return {
      lines: [
        { text: '[TERMINATING SESSION] Operator credentials invalidated.', type: 'warn' },
        { text: '[SYSTEM RESET] Returning to authentication gateway...', type: 'system' },
      ],
      clearSession: true,
      nextView: 'terminal',
    };
  }

  // Root privileged commands
  if (trimmed === 'system.override') {
    if (!isRoot) {
      return {
        lines: [{ text: '[PERMISSION DENIED] Operation requires LV.5 ROOT clearance.', type: 'error' }],
      };
    }
    return {
      lines: [
        { text: '[ROOT OVERRIDE GRANTED] Neural limiter bypass: ACTIVE.', type: 'root' },
        { text: '[SUBSYSTEMS] All security gates set to permissive mode.', type: 'success' },
      ],
    };
  }

  if (trimmed === 'telemetry.debug') {
    if (!isRoot) {
      return {
        lines: [{ text: '[PERMISSION DENIED] Operation requires LV.5 ROOT clearance.', type: 'error' }],
      };
    }
    return {
      lines: [
        { text: '== KERNEL TELEMETRY DIAGNOSTIC DUMP ==', type: 'root' },
        { text: 'CPU_AFFINITY: 0x000000FF | BUS_FREQ: 3200MHz | VOLTAGE: 1.18V', type: 'info' },
        { text: 'MEM_REGISTERS: 0x7FFF98A2 -> 0x7FFF99BC (ALLOC: OK)', type: 'info' },
        { text: 'WEBGPU_CONTEXT: ACTIVE | PIPELINE_STATE: 60.0 FPS STABLE', type: 'success' },
      ],
    };
  }

  if (trimmed === 'admin.kernel') {
    if (!isRoot) {
      return {
        lines: [{ text: '[PERMISSION DENIED] Operation requires LV.5 ROOT clearance.', type: 'error' }],
      };
    }
    return {
      lines: [
        { text: '[ADMIN ACCESS] Opening privileged root kernel surface...', type: 'root' },
      ],
      nextView: 'kernel',
    };
  }

  return {
    lines: [
      { text: `[COMMAND UNRECOGNIZED]: '${trimmed}'`, type: 'error' },
      { text: `Type 'help' to review the valid tactical command matrix.`, type: 'warn' },
    ],
  };
}

export interface AutocompleteResult {
  completedValue: string;
  candidates: string[];
  hasAdvanced: boolean;
  isSingleMatch: boolean;
}

export function computeLcp(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}

export function handleTabCompletion(
  rawInput: string,
  isRoot: boolean
): AutocompleteResult {
  const trimmed = rawInput.trim().toLowerCase();
  if (!trimmed) {
    return { completedValue: rawInput, candidates: [], hasAdvanced: false, isSingleMatch: false };
  }

  const candidates: string[] = [];
  COMMAND_REGISTRY.forEach((cmd) => {
    if (cmd.requiresRoot && !isRoot) return;
    if (cmd.command.toLowerCase().startsWith(trimmed)) {
      candidates.push(cmd.command);
    }
  });

  // Sub-targets for navigate.to
  const navPrefix = 'navigate.to ';
  if (trimmed.startsWith(navPrefix)) {
    const sub = trimmed.slice(navPrefix.length);
    const targets = ['operator', 'squads', 'comms', 'archives', 'breach'];
    if (isRoot) targets.push('kernel');
    targets.forEach((t) => {
      if (t.startsWith(sub)) {
        candidates.push(`navigate.to ${t}`);
      }
    });
  }
  const seen: Record<string, true> = {};
  const uniqueCandidates = candidates.filter((item) => {
    if (seen[item]) return false;
    seen[item] = true;
    return true;
  });
  if (uniqueCandidates.length === 0) {
    return { completedValue: rawInput, candidates: [], hasAdvanced: false, isSingleMatch: false };
  }

  if (uniqueCandidates.length === 1) {
    const single = uniqueCandidates[0];
    return {
      completedValue: single,
      candidates: uniqueCandidates,
      hasAdvanced: single.toLowerCase() !== trimmed,
      isSingleMatch: true,
    };
  }

  const lcp = computeLcp(uniqueCandidates);
  const hasAdvanced = lcp.length > trimmed.length;

  return {
    completedValue: hasAdvanced ? lcp : rawInput,
    candidates: uniqueCandidates,
    hasAdvanced,
    isSingleMatch: false,
  };
}
