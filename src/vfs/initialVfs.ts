import type { VfsNode } from './vfs';

/**
 * INITIAL USER HOME TEMPLATE
 *
 * Developers can add any files and directories here to create
 * puzzles, ARG logs, clues, scripts, and secrets.
 *
 * PERMISSION & LOCK OPTIONS:
 * - owner: 'root' | 'user' (default 'user')
 * - protectedByRoot: true -> Only LV.5 ROOT (admin / su) can delete (rm) or edit (:w in vim)
 * - passwordLock: 'user'  -> Requires entering the operator's login password to read/edit/delete
 * - passwordLock: 'cipher' + cipherKey: '...' -> Requires entering a specific puzzle passkey
 */
export const INITIAL_USER_HOME: Record<string, VfsNode> = {
  'readme.txt': {
    type: 'file',
    name: 'readme.txt',
    owner: 'user',
    content: `================================================================
  DEDWARE / TALOS-II TEMPORARY OPERATOR TERMINAL
================================================================

Welcome, Operator.
This filesystem is mounted in memory for this session.
You have access to mission logs, network ciphers, and diagnostic tools.

BASIC UNIX COMMANDS:
  ls          - List files and directories in current folder
  ls -l       - List detailed file permissions, owner, and locks
  cd <dir>    - Change working directory (e.g. cd logs, cd ..)
  pwd         - Print working directory
  cat <file>  - Display file contents
  vim <file>  - Open interactive Vim editor (i: insert, :w: save, :wq: save & exit, :q!: quit)
  mkdir <dir> - Create directory
  touch <file>- Create empty file
  rm <file>   - Remove file (subject to root/password protection)
  su          - Elevate session to LV.5 ROOT administrator (default pass: admin123)

FILE PERMISSION TIERS IN THIS DIRECTORY:
  1. readme.txt              [USER RW]       - Freely editable & deletable
  2. mission_brief.txt       [ROOT PROTECTED]- Read-only for guest; only admin (su) can rm or edit
  3. operator_vault.txt      [USER PASS LOCK]- Requires your operator login password to open/delete
  4. ciphers/sector04_key.enc[CIPHER LOCKED] - Requires secret passkey (see ~/logs/ctos_audit.log)
`,
    permissions: '-rw-r--r--',
    updatedAt: '2026-10-12 10:14',
  },

  'mission_brief.txt': {
    type: 'file',
    name: 'mission_brief.txt',
    owner: 'root',
    protectedByRoot: true,
    content: `[MISSION BRIEFING // SECTOR 04 VALLEY INFILTRATION]
[SECURITY NOTICE: THIS FILE IS OWNED BY ROOT. GUEST DELETION/MODIFICATION PROHIBITED]

OBJECTIVE:
  Investigate anomalous Blume CTOS power surge in Valley IV.
  Northern pipeline deep crater telemetry reports 14.4kHz oscillation.

AGENTS INVOLVED:
  - DedSec Operative @dedsec00
  - Endfield Subsurface Engineering Squad 04

CLUES:
  1. Check subfolder ~/logs/ctos_audit.log for the passkey to sector04_key.enc.
  2. Check operator_vault.txt using your personal login password.
  3. Need root privileges to modify system directives? Run 'su' (pass: admin123).
`,
    permissions: '-rw-r--r--',
    updatedAt: '2026-10-12 11:20',
  },

  'operator_vault.txt': {
    type: 'file',
    name: 'operator_vault.txt',
    owner: 'user',
    passwordLock: 'user',
    isSecret: true,
    content: `[PERSONAL OPERATOR VAULT // VERIFIED SESSION CREDENTIAL]

PRIVATE NOTES:
  - Temporary Operator Safe House: Sector 04 Sub-level B2
  - Emergency Admin Override Account: admin
  - Default Supervisor Passphrase:   admin123
  - Backup Holotable Uplink Command: system.connect holotable
`,
    permissions: '-rw-------',
    updatedAt: '2026-10-12 11:32',
  },

  'ctos_backdoor.sh': {
    type: 'file',
    name: 'ctos_backdoor.sh',
    owner: 'user',
    content: `#!/bin/bash
# CTOS Subterranean Backdoor Probe v2.4
TARGET_HOST="10.44.0.4"
PORT=4321
echo "[CTOS] Testing neural bridge handshake..."
echo "[CTOS] Subsurface grid linked to Valley IV telemetry."
`,
    permissions: '-rwxr-xr-x',
    updatedAt: '2026-10-12 11:45',
    isExecutable: true,
  },

  'logs': {
    type: 'dir',
    name: 'logs',
    owner: 'root',
    protectedByRoot: true,
    permissions: 'drwxr-xr-x',
    updatedAt: '2026-10-12 12:00',
    children: {
      'ctos_audit.log': {
        type: 'file',
        name: 'ctos_audit.log',
        owner: 'root',
        protectedByRoot: true,
        content: `[LOG 001] 2026-10-12 08:14:02 UTC - CTOS node 04 heartbeat: 100% OK
[LOG 002] 2026-10-12 08:32:19 UTC - Unidentified intrusion from tap interface ctos0
[LOG 003] 2026-10-12 09:01:45 UTC - Pipeline deep crater power: 14.4K/15K KWh
[LOG 004] 2026-10-12 09:44:11 UTC - Intercepted cipher passkey for sector04_key.enc: talos04
[LOG 005] 2026-10-12 10:15:00 UTC - Root privilege elevation policy: su -> admin123
`,
        permissions: '-rw-r--r--',
        updatedAt: '2026-10-12 10:15',
      },
      'telemetry_dump.txt': {
        type: 'file',
        name: 'telemetry_dump.txt',
        owner: 'user',
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
    owner: 'root',
    protectedByRoot: true,
    permissions: 'drwxr-xr-x',
    updatedAt: '2026-10-12 12:10',
    children: {
      'sector04_key.enc': {
        type: 'file',
        name: 'sector04_key.enc',
        owner: 'root',
        protectedByRoot: true,
        passwordLock: 'cipher',
        cipherKey: 'talos04',
        isSecret: true,
        content: `-----BEGIN DECRYPTED PAYLOAD [SECTOR 04]-----
0x4F 0xA2 0x19 0xEE 0x98 0x3C 0x11 0x04
ACCESS_GRANT_CODE: ENDFIELD-VALLEY4-OVERRIDE-7749
DECRYPTION_STATUS: VERIFIED
NEXT_STEP: Execute 'protocol.breach --init' or 'system.connect holotable'.
-----END DECRYPTED PAYLOAD-----
`,
        permissions: '-r--------',
        updatedAt: '2026-10-12 12:10',
      },
    },
  },
};
