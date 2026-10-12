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

    // Characters: Katakana, hex numbers, tactical symbols, AIC tokens
    const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍEF//::[]#AIC-04';
    const fontSize = 15;
    let columns = Math.floor(width / fontSize);

    // Foreground and background drops for 3D depth
    let fgDrops: number[] = [];
    let bgDrops: number[] = [];
    let speeds: number[] = [];

    const initDrops = () => {
      columns = Math.floor(width / fontSize);
      fgDrops = [];
      bgDrops = [];
      speeds = [];
      for (let i = 0; i < columns; i++) {
        fgDrops[i] = Math.floor(Math.random() * -60);
        bgDrops[i] = Math.floor(Math.random() * -40);
        speeds[i] = 1 + Math.random() * 0.8;
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
    const fpsInterval = 1000 / 38;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      // Deep dark fade creates long cascading rain trails
      ctx.fillStyle = 'rgba(10, 12, 15, 0.16)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;

        // Background slower drop (darker green, smaller depth)
        const bgChar = chars.charAt(Math.floor(Math.random() * chars.length));
        const bgY = bgDrops[i] * fontSize;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.28)'; // Data cyan faint trail
        ctx.fillText(bgChar, x, bgY);
        if (bgY > height && Math.random() > 0.98) {
          bgDrops[i] = 0;
        }
        bgDrops[i] += 0.6;

        // Foreground fast drop (brilliant lime & Endfield yellow)
        const fgChar = chars.charAt(Math.floor(Math.random() * chars.length));
        const fgY = fgDrops[i] * fontSize;

        // Glowing white/hazard lemon yellow head
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 8;
        ctx.fillText(fgChar, x, fgY);

        // Body stream: High-vis terminal emerald & signal yellow
        ctx.fillStyle = i % 3 === 0 ? '#FFE600' : '#00FF9D';
        ctx.shadowBlur = 0;
        ctx.fillText(fgChar, x, fgY - fontSize);

        if (fgY > height && Math.random() > 0.95) {
          fgDrops[i] = 0;
        }
        fgDrops[i] += speeds[i];
      }
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
