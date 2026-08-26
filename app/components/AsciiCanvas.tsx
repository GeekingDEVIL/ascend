"use client";

import { useRef, useEffect } from "react";

const CHARS = " .·:;+*?%S#@";
const CHAR_LEN = CHARS.length - 1;

interface Particle {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
  size: number;
  drift: number;
}

interface AsciiCanvasProps {
  src: string;
  cellSize?: number;
  brightness?: number;
  contrast?: number;
  tintStrength?: number;
  className?: string;
}

export default function AsciiCanvas({
  src,
  cellSize = 7,
  brightness = 2.8,
  contrast = 1.2,
  tintStrength = 0.08,
  className,
}: AsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    const ctx = canvas.getContext("2d")!;
    let running = true;
    let cachedData: ImageData | null = null;
    let cachedW = 0;
    let cachedH = 0;
    let startTime = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let isMobile = false;
    const particles: Particle[] = [];

    function createParticles(w: number, h: number) {
      particles.length = 0;
      const count = Math.max(12, Math.floor((w * h) / 40000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          char: CHARS[1 + Math.floor(Math.random() * (CHAR_LEN - 1))],
          speed: 0.15 + Math.random() * 0.4,
          opacity: 0.04 + Math.random() * 0.2,
          size: 8 + Math.random() * 6,
          drift: (Math.random() - 0.5) * 0.3,
        });
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    }
    function onTouchEnd() {
      mouseX = -9999;
      mouseY = -9999;
    }
    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cachedData = null;
      isMobile = window.innerWidth < 768;
      createParticles(window.innerWidth, window.innerHeight);
    }

    function sampleImage(w: number, h: number) {
      if (cachedData && cachedW === w && cachedH === h) return cachedData;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const oc = off.getContext("2d")!;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      oc.drawImage(
        img,
        (w - iw * scale) / 2,
        (h - ih * scale) / 2,
        iw * scale,
        ih * scale,
      );
      cachedData = oc.getImageData(0, 0, w, h);
      cachedW = w;
      cachedH = h;
      return cachedData;
    }

    function render(t: number) {
      if (!running || !img.complete || !img.naturalWidth) return;
      if (!startTime) startTime = t;
      const elapsed = (t - startTime) * 0.001;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const data = sampleImage(w, h).data;

      ctx.fillStyle = "#06080c";
      ctx.fillRect(0, 0, w, h);

      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      const cx = w / 2;
      const cy = h / 2;
      const maxDistSq = cx * cx + cy * cy;
      const fontSize = cellSize * 1.15;
      ctx.font = `${fontSize}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const time = t * 0.001;

      const revealProgress = Math.min(1, elapsed / 1.5);
      const revealRadius = revealProgress * Math.sqrt(maxDistSq) * 1.3;
      const revealRadiusSq = revealRadius * revealRadius;
      const needReveal = revealProgress < 1;

      let spotX = mouseX;
      let spotY = mouseY;
      if (isMobile && mouseX < -1000) {
        spotX = cx + Math.sin(time * 0.4) * w * 0.25;
        spotY = cy * 0.5 + Math.sin(time * 0.7) * h * 0.15;
      }

      const spotRadius = isMobile ? 130 : 200;
      const spotRadiusSq = spotRadius * spotRadius;
      const spotStrength = 2.5;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const mx = col * cellSize + cellSize / 2;
          const my = row * cellSize + cellSize / 2;

          const dcx = mx - cx;
          const dcy = my - cy;
          const distSq = dcx * dcx + dcy * dcy;

          let revealFade = 1;
          if (needReveal) {
            if (distSq > revealRadiusSq) continue;
            const dist = Math.sqrt(distSq);
            revealFade = Math.min(1, (revealRadius - dist) / 60);
          }

          const sx = Math.min(Math.floor(mx), w - 1);
          const sy = Math.min(Math.floor(my), h - 1);
          const i = (sy * w + sx) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          lum = Math.pow(lum, 0.35) * brightness;
          lum = Math.min(1, Math.max(0, (lum - 0.5) * contrast + 0.5));

          const wave =
            Math.sin(time * 1.5 - (row * 0.18 + col * 0.12)) * 0.3 + 1;
          const wave2 =
            Math.sin(time * 0.7 + (row * 0.1 - col * 0.2)) * 0.15 + 1;

          let animLum = lum * wave * wave2;

          const sdx = mx - spotX;
          const sdy = my - spotY;
          const spotDistSq = sdx * sdx + sdy * sdy;
          let spotBoost = 1;
          if (spotDistSq < spotRadiusSq) {
            const f = 1 - spotDistSq / spotRadiusSq;
            spotBoost = 1 + f * spotStrength;
          }
          animLum = Math.min(1, animLum * spotBoost);

          const charIdx = Math.floor(animLum * CHAR_LEN);
          const ch = CHARS[charIdx];
          if (ch === " ") continue;

          const vignette = 1 - (distSq / maxDistSq) * 0.4;
          const bright = Math.min(1, animLum * vignette * revealFade);

          const tR = 34,
            tG = 211,
            tB = 238;
          const cr = Math.round(
            Math.min(255, (r * (1 - tintStrength) + tR * tintStrength) * bright),
          );
          const cg = Math.round(
            Math.min(255, (g * (1 - tintStrength) + tG * tintStrength) * bright),
          );
          const cb = Math.round(
            Math.min(255, (b * (1 - tintStrength) + tB * tintStrength) * bright),
          );

          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          ctx.fillText(ch, mx, my);
        }
      }

      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(time * 0.5 + p.y * 0.01) * p.drift;
        p.opacity += (Math.random() - 0.5) * 0.008;
        p.opacity = Math.max(0.03, Math.min(0.25, p.opacity));
        if (p.y < -20) {
          p.y = h + 10 + Math.random() * 40;
          p.x = Math.random() * w;
          p.char = CHARS[1 + Math.floor(Math.random() * (CHAR_LEN - 1))];
        }
        ctx.font = `${p.size}px "Courier New", monospace`;
        ctx.fillStyle = `rgba(34,211,238,${p.opacity * revealProgress})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.font = `${fontSize}px "Courier New", monospace`;
    }

    function loop(t: number) {
      if (!running) return;
      render(t);
      frameRef.current = requestAnimationFrame(loop);
    }

    img.onload = () => {
      resize();
      frameRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [src, cellSize, brightness, contrast, tintStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
