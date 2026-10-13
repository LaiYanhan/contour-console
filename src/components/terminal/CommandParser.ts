import type { CommandDef, OperatorSession, TacticalView, TerminalLine } from '../../types/tactical';
import { VirtualFileSystem } from '../../vfs/vfs';

export const ADMIN_CONFIG = {
  username: 'admin',
  // SHA-256 hashes for 'admin123' and 'endfield.root'
  passwordHashes: [
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'd8de3df96de5fb709c007b227ba30a96053dea0e6e39016b95a75b36a7f562a3',
  ],
};

export const COMMAND_REGISTRY: CommandDef[] = [
  // POSIX / VFS File Management Commands
  {
    command: 'ls',
    usage: 'ls [-l] [path]',
    description: 'List files, owners, permissions, and security locks',
  },
  {
    command: 'cd',
    usage: 'cd <path>',
    description: 'Change working directory (supports ~, .., relative/absolute paths)',
  },
  {
    command: 'pwd',
    usage: 'pwd',
    description: 'Print current working directory path',
  },
  {
    command: 'cat',
    usage: 'cat <filename>',
    description: 'Read and display text content of specified file',
  },
  {
    command: 'vim',
    usage: 'vim <filename>',
    description: 'Open interactive multi-mode Vim editor (i: insert, :wq: save & quit)',
  },
  {
    command: 'mkdir',
    usage: 'mkdir <dirname>',
    description: 'Create a new directory in current working path',
  },
  {
    command: 'touch',
    usage: 'touch <filename>',
    description: 'Create an empty file or update timestamp',
  },
  {
    command: 'rm',
    usage: 'rm <filename>',
    description: 'Remove file from VFS (subject to root & password locks)',
  },
  {
    command: 'su',
    usage: 'su [admin]',
    description: 'Elevate current session to LV.5 ROOT administrator (pass: admin123)',
  },
  {
    command: 'whoami',
    usage: 'whoami',
    description: 'Print current effective operator username and clearance level',
  },

  // Tactical System Commands
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

export interface PasswordChallengeRequest {
  kind: 'user' | 'cipher' | 'su';
  prompt: string;
  targetFile?: string;
  cipherKey?: string;
  pendingCommand: string;
}

export interface ParseResult {
  lines: Array<{
    text: string;
    type: 'system' | 'info' | 'success' | 'warn' | 'error' | 'root';
  }>;
  nextView?: TacticalView;
  clearSession?: boolean;
  downgradeFromRoot?: boolean;
  openVim?: { fileName: string; content: string; readOnly: boolean };
  passwordChallenge?: PasswordChallengeRequest;
}

export function parseAndExecuteCommand(
  rawInput: string,
  session: OperatorSession | null,
  vfs?: VirtualFileSystem,
  passwordVerified: boolean = false
): ParseResult {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return { lines: [] };
  }

  const isRoot = session?.isRoot ?? false;
  const parts = trimmed.split(/\s+/);
  const cmdName = parts[0]?.toLowerCase();
  const cmdArg = parts.slice(1).join(' ').trim();

  // 1. HELP MATRIX
  if (trimmed === 'help' || trimmed === 'help.list' || trimmed === 'help --list') {
    const output: ParseResult['lines'] = [
      { text: '================================================================', type: 'system' },
      { text: '  TALOS-II / DEDWARE // COMMAND MATRIX INTERFACE', type: 'info' },
      { text: '================================================================', type: 'system' },
      { text: 'USAGE: Type command or press [TAB] for longest common prefix completion.', type: 'warn' },
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
        text: "  NOTE: [3] Root commands hidden. Run 'su' (default pass: admin123) or log in as admin.",
        type: 'warn',
      });
    }

    return { lines: output };
  }

  if (trimmed === 'clear') {
    return { lines: [] };
  }

  // 2. WHOAMI & SU (Privilege Elevation)
  if (cmdName === 'whoami') {
    return {
      lines: [
        {
          text: `${session?.username || 'guest'} [${session?.clearance || 'LV.3 STANDARD'}]`,
          type: isRoot ? 'root' : 'success',
        },
      ],
    };
  }

  if (cmdName === 'su' || trimmed === 'sudo su') {
    if (cmdArg && cmdArg !== 'admin' && cmdArg !== 'root') {
      if (isRoot && session?.originalUsername && cmdArg === session.originalUsername) {
        return {
          lines: [
            { text: `[SESSION DOWNGRADED] Returning to standard operator @${session.originalUsername}.`, type: 'info' },
          ],
          downgradeFromRoot: true,
        };
      }
      return {
        lines: [{ text: `su: user '${cmdArg}' does not exist. Use 'su' or 'su admin' for root.`, type: 'error' }],
      };
    }

    if (isRoot) {
      return {
        lines: [{ text: '[ALREADY ROOT] Active session already holds LV.5 ROOT clearance.', type: 'root' }],
      };
    }

    return {
      lines: [],
      passwordChallenge: {
        kind: 'su',
        prompt: 'Password for root [admin]: ',
        pendingCommand: 'su',
      },
    };
  }

  if (cmdName === 'exit' && isRoot && session?.originalUsername) {
    return {
      lines: [
        { text: `[EXIT ROOT SHELL] Returning to operator @${session.originalUsername} [LV.3 STANDARD].`, type: 'info' },
      ],
      downgradeFromRoot: true,
    };
  }

  // 3. POSIX VFS: PWD
  if (cmdName === 'pwd') {
    const cur = vfs ? vfs.currentPath : '/home/guest';
    return {
      lines: [{ text: cur, type: 'info' }],
    };
  }

  // 4. POSIX VFS: CD
  if (cmdName === 'cd') {
    if (!vfs) return { lines: [{ text: 'cd: vfs not initialized', type: 'error' }] };
    const target = cmdArg || '~';
    const res = vfs.changeDirectory(target);
    if (!res.success) {
      return { lines: [{ text: res.error || 'cd: error', type: 'error' }] };
    }
    return { lines: [] };
  }

  // 5. POSIX VFS: LS
  if (cmdName === 'ls') {
    if (!vfs) return { lines: [{ text: 'ls: vfs not initialized', type: 'error' }] };
    const isLong = parts.includes('-l') || parts.includes('-la') || parts.includes('-al');
    const pathArg = parts.filter((p) => !p.startsWith('-') && p !== 'ls')[0] || '';

    const res = vfs.listDirectory(pathArg);
    if (!res.success || !res.nodes) {
      return { lines: [{ text: res.error || 'ls: error', type: 'error' }] };
    }

    if (res.nodes.length === 0) {
      return { lines: [{ text: '[empty directory]', type: 'system' }] };
    }

    if (isLong) {
      const output: ParseResult['lines'] = [
        { text: `total ${res.nodes.length * 4}`, type: 'system' },
      ];
      res.nodes.forEach((node) => {
        const isDir = node.type === 'dir';
        const perms = node.permissions || (isDir ? 'drwxr-xr-x' : '-rw-r--r--');
        const ownerName = (node.owner === 'root' ? 'root' : session?.username || 'op').padEnd(10);
        const contentLen = node.type === 'file' ? new TextEncoder().encode(node.content).length : 4096;
        const size = `${contentLen}`.padStart(5);
        const date = node.updatedAt || '2026-10-12 12:00';
        const nameSuffix = isDir ? '/' : node.isExecutable ? '*' : '';

        let lockBadge = '';
        if (node.passwordLock === 'user' && !node.unlocked) {
          lockBadge = ' [USER-PASS-LOCKED]';
        } else if (node.passwordLock === 'cipher' && !node.unlocked) {
          lockBadge = ' [CIPHER-LOCKED]';
        } else if (node.protectedByRoot || node.owner === 'root') {
          lockBadge = ' [ROOT-PROTECTED]';
        }

        const lineType: TerminalLine['type'] = node.passwordLock && !node.unlocked
          ? 'warn'
          : node.owner === 'root'
          ? 'root'
          : isDir
          ? 'info'
          : node.isExecutable
          ? 'success'
          : 'system';

        output.push({
          text: `${perms}  1  ${ownerName}  ${size}  ${date}  ${node.name}${nameSuffix}${lockBadge}`,
          type: lineType,
        });
      });
      return { lines: output };
    }

    const formatted = res.nodes
      .map((n) => {
        if (n.type === 'dir') return `[DIR] ${n.name}/`;
        if (n.passwordLock && !n.unlocked) return `[LOCK] ${n.name}`;
        if (n.owner === 'root' || n.protectedByRoot) return `[ROOT] ${n.name}`;
        if (n.isExecutable) return `[EXE] ${n.name}*`;
        return `      ${n.name}`;
      })
      .join('    ');

    return {
      lines: [{ text: formatted, type: 'info' }],
    };
  }

  // 6. POSIX VFS: CAT
  if (cmdName === 'cat') {
    if (!vfs) return { lines: [{ text: 'cat: vfs not initialized', type: 'error' }] };
    if (!cmdArg) return { lines: [{ text: 'cat: missing file operand', type: 'error' }] };

    const res = vfs.readFile(cmdArg, isRoot, passwordVerified);
    if (!res.success) {
      if (res.requiresPassword === 'user') {
        return {
          lines: [],
          passwordChallenge: {
            kind: 'user',
            prompt: `[SECURITY CHALLENGE] Enter login password for @${session?.username || 'op'} to read '${cmdArg}': `,
            targetFile: cmdArg,
            pendingCommand: rawInput,
          },
        };
      }
      if (res.requiresPassword === 'cipher') {
        return {
          lines: [],
          passwordChallenge: {
            kind: 'cipher',
            prompt: `[ENCRYPTED FILE] Enter decryption passkey for '${cmdArg}': `,
            targetFile: cmdArg,
            cipherKey: res.cipherKey,
            pendingCommand: rawInput,
          },
        };
      }
      return { lines: [{ text: res.error || 'cat: read error', type: 'error' }] };
    }

    const outputLines: ParseResult['lines'] = (res.content || '')
      .split('\n')
      .map((line) => ({ text: line, type: 'info' }));

    return { lines: outputLines };
  }

  // 7. POSIX VFS: VIM / VIEW / NANO
  if (cmdName === 'vim' || cmdName === 'view' || cmdName === 'nano') {
    if (!vfs) return { lines: [{ text: 'vim: vfs not initialized', type: 'error' }] };
    if (!cmdArg) return { lines: [{ text: 'vim: missing file operand', type: 'error' }] };

    const targetAbs = vfs.resolvePath(cmdArg);
    const existingNode = vfs.getNode(targetAbs);

    if (existingNode) {
      if (existingNode.type === 'dir') {
        return { lines: [{ text: `vim: '${cmdArg}' is a directory`, type: 'error' }] };
      }
      const readAccess = vfs.checkAccess(cmdArg, 'read', isRoot, passwordVerified);
      if (!readAccess.allowed && readAccess.requiresPassword) {
        return {
          lines: [],
          passwordChallenge: {
            kind: readAccess.requiresPassword,
            prompt:
              readAccess.requiresPassword === 'user'
                ? `[SECURITY CHALLENGE] Enter login password for @${session?.username || 'op'} to edit '${cmdArg}': `
                : `[ENCRYPTED FILE] Enter decryption passkey for '${cmdArg}': `,
            targetFile: cmdArg,
            cipherKey: readAccess.cipherKey,
            pendingCommand: rawInput,
          },
        };
      }
    }

    const writeAccess = vfs.checkAccess(cmdArg, 'write', isRoot, true);
    const content = existingNode && existingNode.type === 'file' ? existingNode.content : '';

    return {
      lines: [],
      openVim: {
        fileName: cmdArg,
        content,
        readOnly: !writeAccess.allowed,
      },
    };
  }

  // 8. POSIX VFS: MKDIR
  if (cmdName === 'mkdir') {
    if (!vfs) return { lines: [{ text: 'mkdir: vfs not initialized', type: 'error' }] };
    if (!cmdArg) return { lines: [{ text: 'mkdir: missing operand', type: 'error' }] };
    const res = vfs.makeDirectory(cmdArg);
    if (!res.success) return { lines: [{ text: res.error || 'mkdir error', type: 'error' }] };
    return { lines: [{ text: `Directory '${cmdArg}' created.`, type: 'success' }] };
  }

  // 9. POSIX VFS: TOUCH
  if (cmdName === 'touch') {
    if (!vfs) return { lines: [{ text: 'touch: vfs not initialized', type: 'error' }] };
    if (!cmdArg) return { lines: [{ text: 'touch: missing file operand', type: 'error' }] };
    const res = vfs.touchFile(cmdArg);
    if (!res.success) return { lines: [{ text: res.error || 'touch error', type: 'error' }] };
    return { lines: [{ text: `File '${cmdArg}' touched.`, type: 'success' }] };
  }

  // 10. POSIX VFS: RM (With Root & Password Protection)
  if (cmdName === 'rm') {
    if (!vfs) return { lines: [{ text: 'rm: vfs not initialized', type: 'error' }] };
    if (!cmdArg) return { lines: [{ text: 'rm: missing operand', type: 'error' }] };

    const cleanTarget = parts.filter((p) => !p.startsWith('-') && p !== 'rm')[0] || cmdArg;
    const res = vfs.removeNode(cleanTarget, isRoot, passwordVerified);

    if (!res.success) {
      if (res.requiresPassword === 'user') {
        return {
          lines: [],
          passwordChallenge: {
            kind: 'user',
            prompt: `[SECURITY CHALLENGE] Enter login password for @${session?.username || 'op'} to delete '${cleanTarget}': `,
            targetFile: cleanTarget,
            pendingCommand: rawInput,
          },
        };
      }
      if (res.requiresPassword === 'cipher') {
        return {
          lines: [],
          passwordChallenge: {
            kind: 'cipher',
            prompt: `[ENCRYPTED FILE] Enter decryption passkey to delete '${cleanTarget}': `,
            targetFile: cleanTarget,
            cipherKey: res.cipherKey,
            pendingCommand: rawInput,
          },
        };
      }
      return { lines: [{ text: res.error || 'rm error', type: 'error' }] };
    }
    return { lines: [{ text: `Removed '${cleanTarget}'.`, type: 'warn' }] };
  }

  // 11. TACTICAL TRANSITIONS & PROTOCOLS
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
        { text: `CURRENT VFS   : ${vfs ? vfs.currentPath : '/home/' + session.username}`, type: 'info' },
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
        lines: [{ text: "[PERMISSION DENIED] Operation requires LV.5 ROOT clearance. Run 'su' (pass: admin123).", type: 'error' }],
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
        lines: [{ text: "[PERMISSION DENIED] Operation requires LV.5 ROOT clearance. Run 'su' (pass: admin123).", type: 'error' }],
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
        lines: [{ text: "[PERMISSION DENIED] Operation requires LV.5 ROOT clearance. Run 'su' (pass: admin123).", type: 'error' }],
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
      { text: `Type 'help' to review the valid tactical command matrix or 'ls' to view files.`, type: 'warn' },
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
  isRoot: boolean,
  vfs?: VirtualFileSystem
): AutocompleteResult {
  const trimmed = rawInput.toLowerCase();
  if (!trimmed) {
    return { completedValue: rawInput, candidates: [], hasAdvanced: false, isSingleMatch: false };
  }

  const fileCmds = ['cd ', 'cat ', 'vim ', 'view ', 'rm ', 'touch '];
  for (const cmd of fileCmds) {
    if (trimmed.startsWith(cmd)) {
      const prefix = rawInput.slice(0, cmd.length);
      const sub = rawInput.slice(cmd.length).trim().toLowerCase();

      if (vfs) {
        const listRes = vfs.listDirectory();
        if (listRes.success && listRes.nodes) {
          const fileCandidates: string[] = [];
          listRes.nodes.forEach((n) => {
            const name = n.name + (n.type === 'dir' ? '/' : '');
            if (name.toLowerCase().startsWith(sub)) {
              fileCandidates.push(`${prefix}${name}`);
            }
          });

          if (fileCandidates.length === 1) {
            return {
              completedValue: fileCandidates[0],
              candidates: fileCandidates,
              hasAdvanced: fileCandidates[0].toLowerCase() !== trimmed,
              isSingleMatch: true,
            };
          }
          if (fileCandidates.length > 1) {
            const lcp = computeLcp(fileCandidates);
            return {
              completedValue: lcp.length > rawInput.length ? lcp : rawInput,
              candidates: fileCandidates,
              hasAdvanced: lcp.length > rawInput.length,
              isSingleMatch: false,
            };
          }
        }
      }
    }
  }

  const candidates: string[] = [];
  COMMAND_REGISTRY.forEach((cmd) => {
    if (cmd.requiresRoot && !isRoot) return;
    if (cmd.command.toLowerCase().startsWith(trimmed)) {
      candidates.push(cmd.command);
    }
  });

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
