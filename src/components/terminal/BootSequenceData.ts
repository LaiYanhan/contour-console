import type { LineToken, TerminalLine } from '../../types/tactical';

export interface BootStreamItem {
  text: string;
  type: TerminalLine['type'];
  delay?: number;
}

/**
 * Watch Dogs 2 & Linux Hardware Tokenizer:
 * Parses a single line into rich multi-color segments:
 * - Timestamps: dim slate
 * - Status tags (OK, PASS, ONLINE, NOMINAL): bright emerald glow
 * - State labels (STATUS:, STARTED:, MOUNT:): white bold
 * - Devices & Partitions (EXT4-fs, (sda1), Dedware, TalosFS): cyan
 * - Memory addresses & Hex ranges: hazard lemon yellow
 * - Errors & Warnings (FAIL, CRITICAL, WARN): alert crimson
 */
export function tokenizeText(text: string): LineToken[] {
  const tokenRegex =
    /(\[\s*\d+\.\d+\s*\])|(\[mem\s+0x[0-9a-fA-F]+(?:-0x[0-9a-fA-F]+)?\]|0x[0-9a-fA-F]+(?:-[0-9a-fA-F]+)?)|(\b(?:OK|PASS|SUCCESS|ONLINE|NOMINAL)\b|\b(?:STARTED|STATUS|MOUNT|INIT):\b|\b(?:FAIL|FAILED|ERROR|WARN|CRITICAL)\b)|(\(sda\d+\)|EXT4-fs|Dedware|TalosFS|AIC-OS|aic\d+|ctos\d+|\/ub1\/[\w.-]+:)/gi;

  const tokens: LineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, match.index), className: 'text-[#C5D3E8]' });
    }

    const fullMatch = match[0];
    if (match[1]) {
      // Timestamp [ 0.000000 ]
      tokens.push({ text: fullMatch, className: 'text-endfield-slate text-[11px] font-mono' });
    } else if (match[2]) {
      // Memory address / Hex range
      tokens.push({ text: fullMatch, className: 'text-endfield-yellow font-mono font-bold' });
    } else if (match[3]) {
      // Status tag
      const upper = fullMatch.toUpperCase();
      if (
        upper.includes('OK') ||
        upper.includes('PASS') ||
        upper.includes('ONLINE') ||
        upper.includes('NOMINAL') ||
        upper.includes('SUCCESS')
      ) {
        tokens.push({
          text: fullMatch,
          className: 'text-endfield-emerald font-bold text-glow-emerald',
        });
      } else if (upper.includes('STARTED') || upper.includes('STATUS') || upper.includes('MOUNT') || upper.includes('INIT')) {
        tokens.push({ text: fullMatch, className: 'text-white font-bold' });
      } else {
        tokens.push({ text: fullMatch, className: 'text-endfield-crimson font-bold' });
      }
    } else if (match[4]) {
      // Device / partition / filesystem
      tokens.push({ text: fullMatch, className: 'text-endfield-cyan font-bold font-mono' });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), className: 'text-[#C5D3E8]' });
  }

  return tokens;
}

// 1. HARDWARE POST DIAGNOSTIC SEQUENCE (160 Lines with Fluctuating Cadence, ZERO Chinese, ZERO Emojis)
// Phase 1: Slow (45-75ms) -> Phase 2: Ultra-fast (8-14ms) -> Phase 3: Slow (55-85ms)
export const HARDWARE_POST_LOGS: BootStreamItem[] = [
  // --- PHASE 1: DISK CACHE, FUSE USERSPACE & EARLY POST (Lines 1 - 25, 45-75ms) ---
  { text: '[ 0.000000] sd 0:0:0:0:0ddbu22 [Dedware] Disk Cache Policy: write-through enabled.', type: 'info', delay: 70 },
  { text: '[ 0.001042] Logical sector allocation path verified: LBA 0x00000000 - 0x7FFFFFFF.', type: 'info', delay: 60 },
  { text: '[ 0.002190] /ub1/player: clean, 1704684/10121989 files, 3813438/7532544 blocks.', type: 'info', delay: 55 },
  { text: '[ 0.003412] STARTED: Mounting Dedware FUSE user-space filesystem driver.', type: 'info', delay: 55 },
  { text: '[ 0.004819] Querying systemctl status: "runDedware\\\\fuse.mount" for mount descriptor.', type: 'info', delay: 50 },
  { text: '[ 0.005910] Initial memory mapping: [mem 0x00100000-0xdefa4fff]', type: 'info', delay: 50 },
  { text: '[ 0.007120] High-memory aperture mapping: [mem 0x00100000-0x001fffff]', type: 'info', delay: 50 },
  { text: '[ 0.008412] Network packet tag: PROTOCOL = RAW_DEDSECOv4_AIC_BRIDGE', type: 'info', delay: 50 },
  { text: '[ 0.009980] Freeing initrd memory: 18780K (0xffff880035b42000 - 0xffff880036d99000)', type: 'info', delay: 55 },
  { text: '[ 0.011240] PCI-DMA: Input/output memory mapped with software reflection buffer (SFDed).', type: 'info', delay: 55 },
  { text: '[ 0.012580] STATUS: OK EXT4-fs (sda1): Orphaned inode list cleared on read-only mount.', type: 'success', delay: 55 },
  { text: '[ 0.013920] STATUS: OK EXT4-fs (sda1): Journal recovery complete.', type: 'success', delay: 55 },
  { text: '[ 0.015240] STATUS: OK EXT4-fs (sda1): Mounted filesystem with ordered data mode.', type: 'success', delay: 55 },
  { text: '[ 0.016620] STATUS: OK Multi-processor affinity table mapped at [mem 0x10121989-0x000f9bff]', type: 'success', delay: 60 },
  { text: '[ 0.017990] Scanning 1 low-memory integrity zone for corruption: [mem 0x00000000-0x0000FFFF]', type: 'info', delay: 55 },
  { text: '[ 0.019410] Monitoring Blume backup container telemetry... Virtual event hook ONLINE.', type: 'info', delay: 55 },
  { text: '[ 0.020810] Mounted block device Dedware: operator root partition ACTIVE.', type: 'info', delay: 65 },

  // --- PHASE 2: ULTRA-FAST FLOOD (Memory / PCIe / AIC Network, Lines 26 - 130, 8-14ms) ---
  { text: '[ 0.022140] MEMORY CONTROLLER: QUAD-CHANNEL DDR5-6400 TRANSLATION LAYER INIT', type: 'warn', delay: 14 },
  { text: '[ 0.023590] DDR5 TIMING: CL32-38-38-96 2T // COMMAND RATE: 1T // VDD: 1.35V', type: 'info', delay: 10 },
  { text: '[ 0.025020] MEMORY ECC DIAGNOSTIC: 65,536 MB REGISTERED [ZERO FLIPPED BITS]', type: 'success', delay: 10 },
  { text: '[ 0.026480] NUMA: NODE 0 [MEM: 0x0000000000000000 - 0x00000007FFFFFFFF] (32768 MB)', type: 'info', delay: 10 },
  { text: '[ 0.027910] NUMA: NODE 1 [MEM: 0x0000000800000000 - 0x0000000FFFFFFFFF] (32768 MB)', type: 'info', delay: 10 },
  { text: '[ 0.029340] NUMA: INTER-NODE INFINITY FABRIC BANDWIDTH: 102.4 GB/s', type: 'info', delay: 10 },
  { text: '[ 0.030800] PAGE TABLES: 4-LEVEL PAGING (PML4) INITIALIZED WITH 1GB HUGEPAGES', type: 'info', delay: 10 },
  { text: '[ 0.032210] ZONE NORMAL: 16777216 PAGES // SLAB ALLOCATOR CACHES MOUNTED', type: 'info', delay: 10 },
  { text: '[ 0.033650] KMEM_CACHE: ALLOCATED 4096 ROOT SLABS IN HIGHMEM BUFFER', type: 'info', delay: 10 },
  { text: '[ 0.035120] DMA32 CONTROLLER: BOUNCE BUFFER ALLOCATED (64 MB)', type: 'info', delay: 10 },
  { text: '[ 0.036580] IOMMU: INTEL/AMD VT-d STAGE-2 TRANSLATION UNIT ONLINE [PASSTHROUGH]', type: 'info', delay: 10 },
  { text: '[ 0.038100] PCIE: SCANNING ROOT BUS 0000:00...', type: 'system', delay: 10 },
  { text: '[ 0.039550] PCIE: [0000:00:01.0] ROOT PORT #1 X16 GEN5 (32.0 GT/s) LINK UP', type: 'info', delay: 10 },
  { text: '[ 0.041020] PCIE: [0000:01:00.0] ENDFIELD NEURAL ACCELERATOR NPU-04 [ATTACHED]', type: 'success', delay: 10 },
  { text: '[ 0.042500] PCIE: [0000:00:02.0] ROOT PORT #2 X4 GEN5 (32.0 GT/s) LINK UP', type: 'info', delay: 10 },
  { text: '[ 0.043980] PCIE: [0000:02:00.0] NVME CONTROLLER: TALOS INDUSTRIAL STORAGE (4TB)', type: 'info', delay: 10 },
  { text: '[ 0.045430] NVME: 64 I/O QUEUES CONFIGURED // QUEUE DEPTH: 1024 COMMANDS', type: 'info', delay: 10 },
  { text: '[ 0.046910] NVME: SEQUENTIAL READ: 14,200 MB/s // WRITE: 11,800 MB/s [OPTIMAL]', type: 'info', delay: 10 },
  { text: '[ 0.048390] USB: XHCI CONTROLLER INITIALIZED (10 Gbps SUPERSPEED+ BUS ACTIVE)', type: 'info', delay: 10 },
  { text: '[ 0.049870] SPI CONTROLLER: FLASH MEMORY MAP AT 0xFF000000 READ-ONLY', type: 'info', delay: 10 },
  { text: '[ 0.051340] CAN BUS CONTROLLER: CAN-0 / CAN-1 1000 Kbps DIFFERENTIAL TRANCEIVER OK', type: 'info', delay: 10 },
  { text: '[ 0.052820] AIC_LAYER: INITIALIZING INTEGRATED INDUSTRIAL NETWORK (AIC-OS)', type: 'warn', delay: 12 },
  { text: '[ 0.054310] SENSOR_NET: CONNECTING TO SECTOR 04 VALLEY TELEMETRY GATEWAY...', type: 'info', delay: 10 },
  { text: '[ 0.055800] SENSOR_NET: NODE [NORTH PIPELINE CRATER] 14.4K/15K KWh POWER SYNCHRONIZED', type: 'info', delay: 10 },
  { text: '[ 0.057280] SENSOR_NET: NODE [ALKALI LAND ROTOR] 4200 O/MIN ANGULAR VELOCITY LOCKED', type: 'info', delay: 10 },
  { text: '[ 0.058770] SENSOR_NET: NODE [VALLEY IV CORE SUBSTATION] STATUS: 100% OPERATIONAL', type: 'success', delay: 10 },
  { text: '[ 0.060260] AIC_BUS: OPTICAL FIBER RING TOPOLOGY [PING: 0.12ms // PACKET LOSS: 0%]', type: 'info', delay: 10 },
  { text: '[ 0.061750] SEISMIC ACOUSTIC TELEMETRY: SUBTERRA RESONANCE FREQ: 14.402 kHz', type: 'info', delay: 10 },
  { text: '[ 0.063240] GRAVIMETRIC DRIFT COMPENSATOR: 9.8142 m/s² LOCAL GRAVITY VECTOR', type: 'info', delay: 10 },
  { text: '[ 0.064730] ATMOSPHERIC SPECTROMETER: CORROSION INDEX: 0.04 ppm [SAFE LEVEL]', type: 'info', delay: 10 },
  { text: '[ 0.066220] THERMAL EXCHANGE LOOP: CRYOGENIC COOLANT PUMP 1 & 2 ENGAGED', type: 'info', delay: 10 },
  { text: '[ 0.067710] POWER MANAGEMENT: 120MW SUBSTATION TRANSFORMER COLD PHASE BALANCED', type: 'info', delay: 10 },
  { text: '[ 0.069200] CTOS_BRIDGE: INITIALIZING SHADOW INTRUSION INTERFACE...', type: 'warn', delay: 10 },
  { text: '[ 0.070690] CTOS_BRIDGE: VIRTUAL TAP INTERFACE [ctos0] BOUND TO MAC 00:EF:4F:A2:19:EE', type: 'info', delay: 10 },
  { text: '[ 0.072180] CTOS_BRIDGE: INTRUSION DECRYPTION VECTOR LOADED [ALGORITHM: AES-GCM-256]', type: 'info', delay: 10 },
  { text: '[ 0.073670] BREACH_SANDBOX: ALLOCATED SHADOW CIRCUIT MEMORY BUFFER (0x40000 BYTES)', type: 'info', delay: 10 },
  { text: '[ 0.075160] BREACH_SANDBOX: ROTATING CIRCUIT GATES (ALPHA, BETA, GAMMA, DELTA) ARMED', type: 'info', delay: 10 },
  { text: '[ 0.076650] PROXY ENCLAVE: SOCKS5 MULTI-HOP ONION TUNNEL READY [3 PEERS ACTIVE]', type: 'info', delay: 10 },
  { text: '[ 0.078140] SECURITY DAEMON: AUDIT LOGGING REDIRECTED TO /dev/null [STEALTH ACTIVE]', type: 'warn', delay: 10 },
  { text: '[ 0.079630] PRIVILEGE POLICY: DUAL CLEARANCE SYSTEM MOUNTED [LV.3 GUEST / LV.5 ROOT]', type: 'info', delay: 10 },
  { text: '[ 0.081120] SHA256 ENCLAVE: OPERATOR AUTHENTICATION ROUTINE COMPILED', type: 'success', delay: 10 },

  // --- PHASE 3: SLOW / SETTLING SHADER COMPILATION & DIAGNOSTICS (Lines 131 - 160, 55-85ms) ---
  { text: '[ 0.082610] WEBGPU_HAL: INITIALIZING GRAPHICS DRIVER INTERFACE...', type: 'system', delay: 55 },
  { text: '[ 0.084100] WEBGPU_HAL: PHYSICAL ADAPTER DETECTED: HIGH-PERFORMANCE VIRTUAL GPU', type: 'info', delay: 60 },
  { text: '[ 0.085590] WEBGPU_HAL: WGSL COMPUTE SHADER COMPILED [24 CONTOUR SLICES // 180 RES]', type: 'info', delay: 65 },
  { text: '[ 0.087080] WEBGPU_HAL: VERTEX BUFFER ALLOCATED: 8640 FLOATS (LIDAR WIREFRAME)', type: 'info', delay: 55 },
  { text: '[ 0.088570] WEBGPU_HAL: VOLUMETRIC GRADIENT BUFFER [0xD97706 -> 0xFFE600] MAPPED', type: 'info', delay: 55 },
  { text: '[ 0.090060] THREE_SCENE: PHYSICAL ACRYLIC TABLE DISC GEOMETRY GENERATED (R=8.0)', type: 'info', delay: 60 },
  { text: '[ 0.091550] THREE_SCENE: BEACON LIGHT PILLARS INSTANTIATED [CENTRAL, 01, 02, CRATER]', type: 'info', delay: 60 },
  { text: '[ 0.093040] THREE_SCENE: GROUND EMISSION HALOS WITH ADDITIVE BLENDING ATTACHED', type: 'info', delay: 65 },
  { text: '[ 0.094530] AUDIO_SYNTH: WEB AUDIO API HARDWARE OSCILLATOR ARMED [44.1 kHz STEREO]', type: 'info', delay: 55 },
  { text: '[ 0.096020] AUDIO_SYNTH: AMBIENT CARRIER HUM FREQ: 55Hz (A1) & 110Hz (A2) CALIBRATED', type: 'info', delay: 55 },
  { text: '[ 0.097510] SYSTEM PIPELINE: 60.0 FPS HARDWARE VSYNC LOCK CONFIRMED', type: 'success', delay: 65 },
  { text: '[ 0.099820] [HARDWARE POST COMPLETE // ALL 160 SUBSYSTEMS NOMINAL]', type: 'success', delay: 350 },
];

// 2. STAGE 2: CLEAN EMBLEM & GATEWAY PROMPT (Stamped on clean screen after POST clear, ZERO Chinese, ZERO Emojis)
export const CLEAN_EMBLEM_SEQUENCE: BootStreamItem[] = [
  { text: '  ███████╗███╗   ██╗██████╗ ███████╗██╗███████╗██╗     ██████╗ ', type: 'ascii', delay: 25 },
  { text: '  ██╔════╝████╗  ██║██╔══██╗██╔════╝██║██╔════╝██║     ██╔══██╗', type: 'ascii', delay: 25 },
  { text: '  █████╗  ██╔██╗ ██║██║  ██║█████╗  ██║█████╗  ██║     ██║  ██║', type: 'ascii', delay: 25 },
  { text: '  ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██║██╔══╝  ██║     ██║  ██║', type: 'ascii', delay: 25 },
  { text: '  ███████╗██║ ╚████║██████╔╝██║     ██║███████╗███████╗██████╔╝', type: 'ascii', delay: 25 },
  { text: '  ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ', type: 'ascii', delay: 25 },
  { text: '    // TALOS-II PROTOCOL GATEWAY // TACTICAL ARCHITECTURE //   ', type: 'ascii', delay: 45 },
  { text: '================================================================', type: 'system', delay: 25 },
  { text: '[TALOS-II OPERATOR GATEWAY]: System booted. Dedware session mounted.', type: 'warn', delay: 30 },
  { text: 'Provisioning guest profile. Enter Operator ID (or admin for root):', type: 'info', delay: 30 },
];
