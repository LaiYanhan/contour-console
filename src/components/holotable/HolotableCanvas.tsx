import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HolotableCanvasProps {
  onSelectBeacon?: (name: string) => void;
}

export const HolotableCanvas: React.FC<HolotableCanvasProps> = ({ onSelectBeacon }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080a0d, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Angled top-down tactical isometric perspective like Endfield
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Procedural Topographic Elevation Function
    const getElevation = (x: number, z: number): number => {
      const d = Math.sqrt(x * x + z * z);
      if (d > 7.5) return 0;
      // Ridge waves + central caldera
      const wave1 = Math.sin(x * 0.9 + z * 0.4) * 0.8;
      const wave2 = Math.cos(x * 0.4 - z * 0.8) * 0.7;
      const wave3 = Math.sin(x * 1.6 + z * 1.5) * 0.35;
      const centerPeak = Math.exp(-(x * x + z * z) * 0.15) * 2.2;
      const falloff = Math.cos((d / 7.5) * (Math.PI / 2));
      return Math.max(0, (wave1 + wave2 + wave3 + centerPeak) * falloff);
    };

    // 3. Generate Layered Horizontal Contour Slice Rings
    const contourGroup = new THREE.Group();
    const levels = 22; // 22 contour height layers
    const resolution = 180; // points per slice
    const radius = 7.2;

    for (let l = 0; l < levels; l++) {
      const targetHeight = (l / levels) * 3.5;
      const points: THREE.Vector3[] = [];

      for (let i = 0; i <= resolution; i++) {
        const theta = (i / resolution) * Math.PI * 2;
        // Search along the radius for elevation matching targetHeight
        let bestR = radius;
        let minDiff = 999;
        for (let r = 0.2; r <= radius; r += 0.1) {
          const px = Math.cos(theta) * r;
          const pz = Math.sin(theta) * r;
          const elev = getElevation(px, pz);
          const diff = Math.abs(elev - targetHeight);
          if (diff < minDiff) {
            minDiff = diff;
            bestR = r;
          }
        }

        const px = Math.cos(theta) * bestR;
        const pz = Math.sin(theta) * bestR;
        points.push(new THREE.Vector3(px, targetHeight, pz));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(resolution);
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

      // Color gradient: warm amber yellow at bottom to bright golden-white at peaks
      const ratio = l / levels;
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0xd97706), // amber
        new THREE.Color(0xffe600), // endfield bright yellow
        ratio
      );

      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4 + ratio * 0.55,
        linewidth: 1,
      });

      const line = new THREE.Line(geometry, material);
      contourGroup.add(line);
    }
    scene.add(contourGroup);

    // 4. Subtle Base Radar Grid (Concentric Rings & Radial Azimuth Spokes)
    const radarGroup = new THREE.Group();
    const ringRadii = [2.2, 4.4, 6.6, 7.5];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
      }
      ringGeo.setFromPoints(ringPts);
      const ringMat = new THREE.LineBasicMaterial({
        color: idx === ringRadii.length - 1 ? 0xf5c400 : 0x273142,
        transparent: true,
        opacity: idx === ringRadii.length - 1 ? 0.7 : 0.25,
      });
      radarGroup.add(new THREE.Line(ringGeo, ringMat));
    });

    // Radar radial crosshairs
    const crosshairGeo = new THREE.BufferGeometry();
    const crosshairPts = [
      new THREE.Vector3(-7.5, 0, 0),
      new THREE.Vector3(7.5, 0, 0),
      new THREE.Vector3(0, 0, -7.5),
      new THREE.Vector3(0, 0, 7.5),
    ];
    crosshairGeo.setFromPoints(crosshairPts);
    radarGroup.add(
      new THREE.LineSegments(
        crosshairGeo,
        new THREE.LineBasicMaterial({ color: 0x3f4d63, transparent: true, opacity: 0.3 })
      )
    );
    scene.add(radarGroup);

    // 5. Vertical Beacon Light Pillars (Image #1 signature visual)
    const beaconsGroup = new THREE.Group();
    const beaconDefs = [
      { name: 'ENDFIELD CENTRAL', x: 0, z: -0.5, height: 5.5, color: 0xffe600 },
      { name: 'OUTPOST 01', x: -3.8, z: 2.2, height: 4.2, color: 0xff9900 },
      { name: 'OUTPOST 02', x: 4.2, z: 1.8, height: 3.8, color: 0xffb700 },
      { name: 'NORTH DEEP CRATER', x: -1.8, z: -4.0, height: 4.0, color: 0xffffff },
    ];

    beaconDefs.forEach((b) => {
      const elev = getElevation(b.x, b.z);
      // Beacon vertical cylinder beam
      const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.08, b.height, 16);
      cylinderGeo.translate(0, b.height / 2, 0);
      const cylinderMat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
      cylinder.position.set(b.x, elev, b.z);
      beaconsGroup.add(cylinder);

      // Beacon ring target base on terrain
      const targetRingGeo = new THREE.RingGeometry(0.15, 0.35, 24);
      targetRingGeo.rotateX(-Math.PI / 2);
      const targetRingMat = new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
      targetRing.position.set(b.x, elev + 0.05, b.z);
      beaconsGroup.add(targetRing);
    });
    scene.add(beaconsGroup);

    // 6. Holographic Rotating Radar Sweep Beam
    const sweepGeo = new THREE.BufferGeometry();
    const sweepPts = [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(7.5, 0.05, 0)];
    sweepGeo.setFromPoints(sweepPts);
    const sweepLine = new THREE.Line(
      sweepGeo,
      new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.45,
      })
    );
    scene.add(sweepLine);

    // 7. Ambient Particle Field
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = Math.random() * 7.5;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * r;
      particlePositions[i * 3 + 1] = Math.random() * 4.5;
      particlePositions[i * 3 + 2] = Math.sin(angle) * r;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf5c400,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse movement tracker for parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera tilt parallax
      const targetCamX = mouseRef.current.x * 2.8;
      const targetCamY = 14 + mouseRef.current.y * 1.8;
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, 0.8, 0);

      // Rotate radar sweep
      sweepLine.rotation.y = elapsedTime * 0.45;

      // Slow terrain rotation
      contourGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.05;
      beaconsGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.05;

      // Subtle pulse on particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-crosshair select-none overflow-hidden"
    >
      {/* Tactical Center Overlay Crosshair & Reticle */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Outer Circular Dial Bezel */}
        <div className="w-[340px] h-[340px] md:w-[540px] md:h-[540px] rounded-full border border-endfield-border/60 border-dashed pointer-events-none absolute flex items-center justify-center">
          {/* Degree ticks */}
          <span className="absolute top-1 text-[10px] font-mono text-endfield-yellow/70 tracking-widest">
            000° // NORTH
          </span>
          <span className="absolute bottom-1 text-[10px] font-mono text-endfield-slate/60 tracking-widest">
            180° // SOUTH
          </span>
          <span className="absolute left-1 text-[10px] font-mono text-endfield-slate/60 tracking-widest">
            270° // WEST
          </span>
          <span className="absolute right-1 text-[10px] font-mono text-endfield-slate/60 tracking-widest">
            090° // EAST
          </span>
        </div>

        {/* Center Target Badge */}
        <div className="pointer-events-none flex flex-col items-center">
          <div className="text-[11px] font-mono font-bold tracking-[0.25em] text-endfield-yellow bg-endfield-bg/80 px-2 py-0.5 border border-endfield-yellow/40 backdrop-blur-sm shadow-glow-yellow-sm">
            ENDFIELD // LIDAR SURVEY
          </div>
          <div className="text-[9px] font-mono text-endfield-slate/80 mt-1">
            ELEVATION_MAP: VALLEY_04 [ACTIVE]
          </div>
        </div>
      </div>
    </div>
  );
};
