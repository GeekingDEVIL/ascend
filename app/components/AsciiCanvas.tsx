"use client";

import { useRef, useEffect } from "react";

const CHARS = " .·:;+*?%S#@";
const CHAR_LEN = CHARS.length - 1;

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
  tintStrength = 0.1,
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

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cachedData = null;
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
      oc.drawImage(img, (w - iw * scale) / 2, (h - ih * scale) / 2, iw * scale, ih * scale);
      cachedData = oc.getImageData(0, 0, w, h);
      cachedW = w;
      cachedH = h;
      return cachedData;
    }

    function render(t: number) {
      if (!running || !img.complete || !img.naturalWidth) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const data = sampleImage(w, h).data;

      ctx.fillStyle = "#06080c";
      ctx.fillRect(0, 0, w, h);

      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const fontSize = cellSize * 1.15;
      ctx.font = `${fontSize}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const time = t * 0.001;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const mx = col * cellSize + cellSize / 2;
          const my = row * cellSize + cellSize / 2;

          const sx = Math.min(Math.floor(mx), w - 1);
          const sy = Math.min(Math.floor(my), h - 1);
          const i = (sy * w + sx) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          lum = Math.pow(lum, 0.35) * brightness;
          lum = Math.min(1, Math.max(0, ((lum - 0.5) * contrast + 0.5)));

          // diagonal wave — every character participates, sweeps top-left to bottom-right
          const wave = Math.sin(time * 1.5 - (row * 0.18 + col * 0.12)) * 0.35 + 1;
          // secondary slower cross-wave for complexity
          const wave2 = Math.sin(time * 0.7 + (row * 0.1 - col * 0.2)) * 0.2 + 1;

          const animLum = Math.min(1, lum * wave * wave2);

          const charIdx = Math.floor(animLum * CHAR_LEN);
          const ch = CHARS[charIdx];
          if (ch === " ") continue;

          // vignette
          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
          const vignette = 1 - dist * dist * 0.55;
          const bright = Math.min(1, animLum * vignette);

          const tR = 34, tG = 211, tB = 238;
          const cr = Math.round(Math.min(255, (r * (1 - tintStrength) + tR * tintStrength) * bright));
          const cg = Math.round(Math.min(255, (g * (1 - tintStrength) + tG * tintStrength) * bright));
          const cb = Math.round(Math.min(255, (b * (1 - tintStrength) + tB * tintStrength) * bright));

          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          ctx.fillText(ch, mx, my);
        }
      }
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
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
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
