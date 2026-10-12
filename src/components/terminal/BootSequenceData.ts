import type { TerminalLine } from '../../types/tactical';

export const DEEP_POST_BOOT_SEQUENCE: Array<{
  text: string;
  type: TerminalLine['type'];
  delay?: number;
}> = [
  // --- 1. BIOS / UEFI ROM & CPU MICROCODE (01 - 25) ---
  { text: '[ 0.000000] TALOS-II COLD BOOT: INITIALIZING HARDWARE ARCHITECTURE...', type: 'system', delay: 20 },
  { text: '[ 0.001042] CPU0: MICROCODE REV: 0x0000024B (AMD/ARM64 NEURAL SUBTERRA HYBRID)', type: 'info', delay: 8 },
  { text: '[ 0.002190] CPU0: SMU FIRMWARE VERSION: 76.19.00 // TELEMETRY CALIBRATION: OK', type: 'info', delay: 8 },
  { text: '[ 0.003412] CPU0: 16 PHYSICAL CORES / 32 LOGICAL THREADS DETECTED', type: 'info', delay: 8 },
  { text: '[ 0.004819] CPU0: L1 D-CACHE: 32K (8-WAY) | L1 I-CACHE: 32K (8-WAY)', type: 'info', delay: 8 },
  { text: '[ 0.005910] CPU0: L2 CACHE: 512K (8-WAY) | L3 UNIFIED CACHE: 64M (16-WAY)', type: 'info', delay: 8 },
  { text: '[ 0.007120] APIC: LOCAL APIC CLOCK TICK RATE: 1000.000 MHz', type: 'info', delay: 8 },
  { text: '[ 0.008412] SMP: BRINGING UP SECONDARY CPUS...', type: 'info', delay: 8 },
  { text: '[ 0.009980] SMP: CPU1 THROUGH CPU15 NODE ONLINE // STATUS: SYNCHRONIZED', type: 'success', delay: 8 },
  { text: '[ 0.011240] ACPI: RSDP 0x000000007FFE0014 (V02 TALOS ) FIXED ACPI DESCRIPTION TABLE', type: 'info', delay: 8 },
  { text: '[ 0.012580] ACPI: XSDT 0x000000007FFE00E8 (V01 TALOS AIC_SYS 0x00000001)', type: 'info', delay: 8 },
  { text: '[ 0.013920] ACPI: FADT 0x000000007FFE0180 (V06 TALOS AIC_SYS 0x00000001)', type: 'info', delay: 8 },
  { text: '[ 0.015240] ACPI: MADT 0x000000007FFE02D0 (V05 TALOS AIC_SYS 0x00000001)', type: 'info', delay: 8 },
  { text: '[ 0.016620] ACPI: DSDT 0x000000007FFE0360 (V02 TALOS AIC_DSDT 0x00000001)', type: 'info', delay: 8 },
  { text: '[ 0.017990] ACPI: 24 GLOBAL SYSTEM INTERRUPTS REGISTERED VIA IO-APIC #0', type: 'info', delay: 8 },
  { text: '[ 0.019410] VCORE VOLTAGE TELEMETRY: 1.182V (NOMINAL) // VRM TEMP: 41.2°C [STABLE]', type: 'info', delay: 8 },
  { text: '[ 0.020810] CLOCK GENERATOR: SPREAD SPECTRUM MODULATION ACTIVE [100.00 MHz]', type: 'info', delay: 8 },

  // --- 2. MEMORY CONTROLLER & NUMA MAPPING (26 - 50) ---
  { text: '[ 0.022140] MEMORY CONTROLLER: QUAD-CHANNEL DDR5-6400 TRANSLATION LAYER INIT', type: 'warn', delay: 8 },
  { text: '[ 0.023590] DDR5 TIMING: CL32-38-38-96 2T // COMMAND RATE: 1T // VDD: 1.35V', type: 'info', delay: 8 },
  { text: '[ 0.025020] MEMORY ECC DIAGNOSTIC: 65,536 MB REGISTERED [ZERO FLIPPED BITS]', type: 'success', delay: 8 },
  { text: '[ 0.026480] NUMA: NODE 0 [MEM: 0x0000000000000000 - 0x00000007FFFFFFFF] (32768 MB)', type: 'info', delay: 8 },
  { text: '[ 0.027910] NUMA: NODE 1 [MEM: 0x0000000800000000 - 0x0000000FFFFFFFFF] (32768 MB)', type: 'info', delay: 8 },
  { text: '[ 0.029340] NUMA: INTER-NODE INFINITY FABRIC BANDWIDTH: 102.4 GB/s', type: 'info', delay: 8 },
  { text: '[ 0.030800] PAGE TABLES: 4-LEVEL PAGING (PML4) INITIALIZED WITH 1GB HUGEPAGES', type: 'info', delay: 8 },
  { text: '[ 0.032210] ZONE NORMAL: 16777216 PAGES // SLAB ALLOCATOR CACHES MOUNTED', type: 'info', delay: 8 },
  { text: '[ 0.033650] KMEM_CACHE: ALLOCATED 4096 ROOT SLABS IN HIGHMEM BUFFER', type: 'info', delay: 8 },
  { text: '[ 0.035120] DMA32 CONTROLLER: BOUNCE BUFFER ALLOCATED (64 MB)', type: 'info', delay: 8 },
  { text: '[ 0.036580] IOMMU: INTEL/AMD VT-d STAGE-2 TRANSLATION UNIT ONLINE [PASSTHROUGH]', type: 'info', delay: 8 },

  // --- 3. BUS INTERCONNECT & PCIE 5.0 ROOT (51 - 75) ---
  { text: '[ 0.038100] PCIE: SCANNING ROOT BUS 0000:00...', type: 'system', delay: 8 },
  { text: '[ 0.039550] PCIE: [0000:00:01.0] ROOT PORT #1 X16 GEN5 (32.0 GT/s) LINK UP', type: 'info', delay: 8 },
  { text: '[ 0.041020] PCIE: [0000:01:00.0] ENDFIELD NEURAL ACCELERATOR NPU-04 [ATTACHED]', type: 'success', delay: 8 },
  { text: '[ 0.042500] PCIE: [0000:00:02.0] ROOT PORT #2 X4 GEN5 (32.0 GT/s) LINK UP', type: 'info', delay: 8 },
  { text: '[ 0.043980] PCIE: [0000:02:00.0] NVME CONTROLLER: TALOS INDUSTRIAL STORAGE (4TB)', type: 'info', delay: 8 },
  { text: '[ 0.045430] NVME: 64 I/O QUEUES CONFIGURED // QUEUE DEPTH: 1024 COMMANDS', type: 'info', delay: 8 },
  { text: '[ 0.046910] NVME: SEQUENTIAL READ: 14,200 MB/s // WRITE: 11,800 MB/s [OPTIMAL]', type: 'info', delay: 8 },
  { text: '[ 0.048390] USB: XHCI CONTROLLER INITIALIZED (10 Gbps SUPERSPEED+ BUS ACTIVE)', type: 'info', delay: 8 },
  { text: '[ 0.049870] SPI CONTROLLER: FLASH MEMORY MAP AT 0xFF000000 READ-ONLY', type: 'info', delay: 8 },
  { text: '[ 0.051340] CAN BUS CONTROLLER: CAN-0 / CAN-1 1000 Kbps DIFFERENTIAL TRANCEIVER OK', type: 'info', delay: 8 },

  // --- 4. TALOS-II SUBTERRANEAN SENSOR ARRAY & AIC NETWORK (76 - 105) ---
  { text: '[ 0.052820] AIC_LAYER: INITIALIZING INTEGRATED INDUSTRIAL NETWORK (AIC-OS)', type: 'warn', delay: 8 },
  { text: '[ 0.054310] SENSOR_NET: CONNECTING TO SECTOR 04 VALLEY TELEMETRY GATEWAY...', type: 'info', delay: 8 },
  { text: '[ 0.055800] SENSOR_NET: NODE [NORTH PIPELINE CRATER] 14.4K/15K KWh POWER SYNCHRONIZED', type: 'info', delay: 8 },
  { text: '[ 0.057280] SENSOR_NET: NODE [ALKALI LAND ROTOR] 4200 O/MIN ANGULAR VELOCITY LOCKED', type: 'info', delay: 8 },
  { text: '[ 0.058770] SENSOR_NET: NODE [VALLEY IV CORE SUBSTATION] STATUS: 100% OPERATIONAL', type: 'success', delay: 8 },
  { text: '[ 0.060260] AIC_BUS: OPTICAL FIBER RING TOPOLOGY [PING: 0.12ms // PACKET LOSS: 0%]', type: 'info', delay: 8 },
  { text: '[ 0.061750] SEISMIC ACOUSTIC TELEMETRY: SUBTERRA RESONANCE FREQ: 14.402 kHz', type: 'info', delay: 8 },
  { text: '[ 0.063240] GRAVIMETRIC DRIFT COMPENSATOR: 9.8142 m/s² LOCAL GRAVITY VECTOR', type: 'info', delay: 8 },
  { text: '[ 0.064730] ATMOSPHERIC SPECTROMETER: CORROSION INDEX: 0.04 ppm [SAFE LEVEL]', type: 'info', delay: 8 },
  { text: '[ 0.066220] THERMAL EXCHANGE LOOP: CRYOGENIC COOLANT PUMP 1 & 2 ENGAGED', type: 'info', delay: 8 },
  { text: '[ 0.067710] POWER MANAGEMENT: 120MW SUBSTATION TRANSFORMER COLD PHASE BALANCED', type: 'info', delay: 8 },

  // --- 5. CTOS & WATCH DOGS NEURAL INTRUSION PROTOCOL (106 - 130) ---
  { text: '[ 0.069200] CTOS_BRIDGE: INITIALIZING SHADOW INTRUSION INTERFACE...', type: 'warn', delay: 8 },
  { text: '[ 0.070690] CTOS_BRIDGE: VIRTUAL TAP INTERFACE [ctos0] BOUND TO MAC 00:EF:4F:A2:19:EE', type: 'info', delay: 8 },
  { text: '[ 0.072180] CTOS_BRIDGE: INTRUSION DECRYPTION VECTOR LOADED [ALGORITHM: AES-GCM-256]', type: 'info', delay: 8 },
  { text: '[ 0.073670] BREACH_SANDBOX: ALLOCATED SHADOW CIRCUIT MEMORY BUFFER (0x40000 BYTES)', type: 'info', delay: 8 },
  { text: '[ 0.075160] BREACH_SANDBOX: ROTATING CIRCUIT GATES (ALPHA, BETA, GAMMA, DELTA) ARMED', type: 'info', delay: 8 },
  { text: '[ 0.076650] PROXY ENCLAVE: SOCKS5 MULTI-HOP ONION TUNNEL READY [3 PEERS ACTIVE]', type: 'info', delay: 8 },
  { text: '[ 0.078140] SECURITY DAEMON: AUDIT LOGGING REDIRECTED TO /dev/null [STEALTH ACTIVE]', type: 'warn', delay: 8 },
  { text: '[ 0.079630] PRIVILEGE POLICY: DUAL CLEARANCE SYSTEM MOUNTED [LV.3 GUEST / LV.5 ROOT]', type: 'info', delay: 8 },
  { text: '[ 0.081120] SHA256 ENCLAVE: OPERATOR AUTHENTICATION ROUTINE COMPILED', type: 'success', delay: 8 },

  // --- 6. WEBGPU TOPOGRAPHIC CONTOUR & THREE.JS SHADER CONTEXT (131 - 155) ---
  { text: '[ 0.082610] WEBGPU_HAL: INITIALIZING GRAPHICS DRIVER INTERFACE...', type: 'system', delay: 8 },
  { text: '[ 0.084100] WEBGPU_HAL: PHYSICAL ADAPTER DETECTED: HIGH-PERFORMANCE VIRTUAL GPU', type: 'info', delay: 8 },
  { text: '[ 0.085590] WEBGPU_HAL: WGSL COMPUTE SHADER COMPILED [24 CONTOUR SLICES // 180 RES]', type: 'info', delay: 8 },
  { text: '[ 0.087080] WEBGPU_HAL: VERTEX BUFFER ALLOCATED: 8640 FLOATS (LIDAR WIREFRAME)', type: 'info', delay: 8 },
  { text: '[ 0.088570] WEBGPU_HAL: VOLUMETRIC GRADIENT BUFFER [0xD97706 -> 0xFFE600] MAPPED', type: 'info', delay: 8 },
  { text: '[ 0.090060] THREE_SCENE: PHYSICAL ACRYLIC TABLE DISC GEOMETRY GENERATED (R=8.0)', type: 'info', delay: 8 },
  { text: '[ 0.091550] THREE_SCENE: BEACON LIGHT PILLARS INSTANTIATED [CENTRAL, 01, 02, CRATER]', type: 'info', delay: 8 },
  { text: '[ 0.093040] THREE_SCENE: GROUND EMISSION HALOS WITH ADDITIVE BLENDING ATTACHED', type: 'info', delay: 8 },
  { text: '[ 0.094530] AUDIO_SYNTH: WEB AUDIO API HARDWARE OSCILLATOR ARMED [44.1 kHz STEREO]', type: 'info', delay: 8 },
  { text: '[ 0.096020] AUDIO_SYNTH: AMBIENT CARRIER HUM FREQ: 55Hz (A1) & 110Hz (A2) CALIBRATED', type: 'info', delay: 8 },
  { text: '[ 0.097510] SYSTEM PIPELINE: 60.0 FPS HARDWARE VSYNC LOCK CONFIRMED', type: 'success', delay: 8 },

  // --- 7. FINAL SYSTEM OVERRIDE & VECTOR EMBLEM STAMP (156 - 170) ---
  { text: '[ 0.099000] [SYSTEM OVERRIDE DETECTED // RENDERING VECTOR EMBLEM]', type: 'warn', delay: 40 },
  { text: '  ███████╗███╗   ██╗██████╗ ███████╗██╗███████╗██╗     ██████╗ ', type: 'ascii', delay: 18 },
  { text: '  ██╔════╝████╗  ██║██╔══██╗██╔════╝██║██╔════╝██║     ██╔══██╗', type: 'ascii', delay: 18 },
  { text: '  █████╗  ██╔██╗ ██║██║  ██║█████╗  ██║█████╗  ██║     ██║  ██║', type: 'ascii', delay: 18 },
  { text: '  ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██║██╔══╝  ██║     ██║  ██║', type: 'ascii', delay: 18 },
  { text: '  ███████╗██║ ╚████║██████╔╝██║     ██║███████╗███████╗██████╔╝', type: 'ascii', delay: 18 },
  { text: '  ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ', type: 'ascii', delay: 18 },
  { text: '    // TALOS-II PROTOCOL GATEWAY // TACTICAL ARCHITECTURE //   ', type: 'ascii', delay: 35 },
  { text: '================================================================', type: 'system', delay: 20 },
  { text: '[ACCESS GATEWAY]: Unauthenticated terminal session detected.', type: 'warn', delay: 25 },
  { text: 'Provisioning guest profile. Enter Operator ID (or admin for root):', type: 'info', delay: 25 },
];
