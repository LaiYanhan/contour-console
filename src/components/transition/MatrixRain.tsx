import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Endfield AIC Industrial Glyphs & Circuit Schematic Tokens (Zero Katakana, Zero movie cliché)
    const industrialChars =
      '0123456789ABCDEF═║╬┼░▒▓█┌┐└┘├┤┬┴EF//::[]#+<>AIC-04TALOSVALLEY-40x4F0xA20x190xEE[OK][SEC]';
    const fontSize = 11.5;
    let columns = Math.floor(width / fontSize);

    // Ultra high-density streams: 2 independent layers per column
    let fgDrops: number[] = [];
    let bgDrops: number[] = [];
    let fgSpeeds: number[] = [];
    let bgSpeeds: number[] = [];
    let scanlineY = 0;

    const initDrops = () => {
      columns = Math.floor(width / fontSize);
      fgDrops = [];
      bgDrops = [];
      fgSpeeds = [];
      bgSpeeds = [];
      for (let i = 0; i < columns; i++) {
        fgDrops[i] = Math.floor(Math.random() * -70);
        bgDrops[i] = Math.floor(Math.random() * -90);
        fgSpeeds[i] = 1.2 + Math.random() * 1.4; // High velocity
        bgSpeeds[i] = 0.6 + Math.random() * 0.8; // Deep velocity
      }
    };

    initDrops();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDrops();
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 42; // Fast, fluid 42 FPS stream

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      // Deep dark fade leaves rich luminous trailing embers
      ctx.fillStyle = 'rgba(10, 12, 15, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px "JetBrains Mono", Consolas, monospace`;

      // 1. LAYER 1: Deep Data Cyan & Ambient Amber Stream (Background Layer)
      for (let i = 0; i < columns; i++) {
        if (i % 2 === 0) {
          const bgChar = industrialChars.charAt(Math.floor(Math.random() * industrialChars.length));
          const bgX = i * fontSize;
          const bgY = bgDrops[i] * fontSize;

          // Data Ice-Cyan with subtle amber variation
          ctx.fillStyle = i % 4 === 0 ? 'rgba(255, 136, 0, 0.45)' : 'rgba(0, 229, 255, 0.42)';
          ctx.fillText(bgChar, bgX, bgY);

          if (bgY > height && Math.random() > 0.94) {
            bgDrops[i] = 0;
          }
          bgDrops[i] += bgSpeeds[i];
        }
      }

      // 2. LAYER 2: High-Density Endfield Hazard Lemon Yellow & White Electric Sparks (Foreground Layer)
      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const y = fgDrops[i] * fontSize;
        const fgChar = industrialChars.charAt(Math.floor(Math.random() * industrialChars.length));

        // Lead Head Spark: Pure white with intense Endfield hazard yellow bloom
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 10;
        ctx.fillText(fgChar, x, y);

        // Second Spark: Blinding Hazard Yellow
        ctx.fillStyle = '#FFE600';
        ctx.shadowBlur = 4;
        const secondChar = industrialChars.charAt(Math.floor(Math.random() * industrialChars.length));
        ctx.fillText(secondChar, x, y - fontSize);

        // Body Trail: Endfield Yellow & Warm Amber / Data Cyan accents
        ctx.shadowBlur = 0;
        const trailColor = i % 5 === 0 ? '#00E5FF' : i % 3 === 0 ? '#FF8800' : '#FFE600';
        ctx.fillStyle = trailColor;
        const thirdChar = industrialChars.charAt(Math.floor(Math.random() * industrialChars.length));
        ctx.fillText(thirdChar, x, y - fontSize * 2);

        if (y > height && Math.random() > 0.92) {
          fgDrops[i] = 0;
        }
        fgDrops[i] += fgSpeeds[i];
      }

      // 3. LAYER 3: Periodic Horizontal Laser Telemetry Scan Pulse
      scanlineY = (scanlineY + 6) % (height + 200);
      ctx.fillStyle = 'rgba(255, 230, 0, 0.08)';
      ctx.fillRect(0, scanlineY - 40, width, 40);
      ctx.fillStyle = 'rgba(255, 230, 0, 0.35)';
      ctx.fillRect(0, scanlineY, width, 1.5);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
      style={{ opacity }}
    />
  );
};
