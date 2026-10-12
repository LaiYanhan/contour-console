import type { VfsNode } from './vfs';

/**
 * INITIAL USER HOME TEMPLATE
 *
 * Developers can add any files and directories here to create
 * puzzles, ARG logs, clues, scripts, and secrets.
 *
 * When any temporary user logs in, their personal home directory
 * (/home/<username>/) is automatically populated with a clone of this tree.
 */
export const INITIAL_USER_HOME: Record<string, VfsNode> = {
  'readme.txt': {
    type: 'file',
    name: 'readme.txt',
    content: `================================================================
  DEDWARE / TALOS-II TEMPORARY OPERATOR TERMINAL
================================================================

Welcome, Operator.
This filesystem is mounted in memory for this session.
You have access to mission logs, network ciphers, and diagnostic tools.

BASIC UNIX COMMANDS:
  ls          - List files and directories in current folder
  ls -l       - List detailed file attributes and permissions
  cd <dir>    - Change working directory (e.g. cd logs, cd ..)
  pwd         - Print working directory
  cat <file>  - Display file contents
  vim <file>  - Open in-line terminal text reader/editor
  mkdir <dir> - Create directory
  touch <file>- Create empty file
  rm <file>   - Remove file

TACTICAL SYSTEM COMMANDS:
  system.connect holotable  - Jump to 3D Holotable console
  protocol.breach --init    - Launch Watch Dogs breach puzzle
  session.status            - Query active clearance level
  help                      - Display full command matrix

INVESTIGATION OBJECTIVES:
  1. Inspect ~/logs/ctos_audit.log for compromised network nodes.
  2. Decrypt ~/ciphers/sector04_key.enc using protocol.breach.
  3. Use 'vim mission_brief.txt' to review mission objectives.
`,
    permissions: '-rw-r--r--',
    updatedAt: '2026-10-12 10:14',
  },

  'mission_brief.txt': {
    type: 'file',
    name: 'mission_brief.txt',
    content: `[MISSION BRIEFING // SECTOR 04 VALLEY INFILTRATION]

OBJECTIVE:
  Investigate anomalous Blume CTOS power surge in Valley IV.
  Northern pipeline deep crater telemetry reports 14.4kHz oscillation.

AGENTS INVOLVED:
  - DedSec Operative @dedsec00
  - Endfield Subsurface Engineering Squad 04

CLUES:
  1. Check subfolder ~/logs/ for transmission captures.
  2. Use 'cat mission_brief.txt' or 'vim mission_brief.txt' to review.
  3. Secret encryption cipher located in ~/ciphers/sector04_key.enc.
`,
    permissions: '-rw-r--r--',
    updatedAt: '2026-10-12 11:20',
  },

  'ctos_backdoor.sh': {
    type: 'file',
    name: 'ctos_backdoor.sh',
    content: `#!/bin/bash
# CTOS Subterranean Backdoor Probe v2.4
echo "[CTOS] Testing neural bridge handshake..."
echo "[CTOS] Port 4321: LISTENING"
echo "[CTOS] Subsurface grid linked to Valley IV telemetry."
`,
    permissions: '-rwxr-xr-x',
    updatedAt: '2026-10-12 11:45',
    isExecutable: true,
  },

  'logs': {
    type: 'dir',
    name: 'logs',
    permissions: 'drwxr-xr-x',
    updatedAt: '2026-10-12 12:00',
    children: {
      'ctos_audit.log': {
        type: 'file',
        name: 'ctos_audit.log',
        content: `[LOG 001] 2026-10-12 08:14:02 UTC - CTOS node 04 heartbeat: 100% OK
[LOG 002] 2026-10-12 08:32:19 UTC - Unidentified intrusion from tap interface ctos0
[LOG 003] 2026-10-12 09:01:45 UTC - Pipeline deep crater power: 14.4K/15K KWh
[LOG 004] 2026-10-12 09:44:11 UTC - Encryption cipher SHA256 match: d8de3df9...
[LOG 005] 2026-10-12 10:15:00 UTC - System clearance elevated to LV.5 ROOT
`,
        permissions: '-rw-r--r--',
        updatedAt: '2026-10-12 10:15',
      },
      'telemetry_dump.txt': {
        type: 'file',
        name: 'telemetry_dump.txt',
        content: `SECTOR: 04 // VALLEY IV
SUBSTATION: 120MW
GEOMAGNETIC DRIFT: 9.8142 m/s^2
RESONANCE: 14.402 kHz
GRID: 100% STABLE
`,
        permissions: '-rw-r--r--',
        updatedAt: '2026-10-12 10:30',
      },
    },
  },

  'ciphers': {
    type: 'dir',
    name: 'ciphers',
    permissions: 'drwxr-xr-x',
    updatedAt: '2026-10-12 12:10',
    children: {
      'sector04_key.enc': {
        type: 'file',
        name: 'sector04_key.enc',
        content: `-----BEGIN ENCRYPTED PAYLOAD-----
0x4F 0xA2 0x19 0xEE 0x98 0x3C 0x11 0x04
CIPHER_HASH: SHA256:d8de3df96de5fb709c007b227ba30a96053dea0e6e39016b95a75b36a7f562a3
DECRYPTION HINT: Use command 'protocol.breach --init' or 'admin.kernel'.
-----END ENCRYPTED PAYLOAD-----
`,
        permissions: '-rw-r-----',
        updatedAt: '2026-10-12 12:10',
        isSecret: true,
      },
    },
  },
};
