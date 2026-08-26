"use client";

import { useRef, useEffect, useCallback } from "react";

const CHARS = " .·:;+*?%S#@";

interface AsciiCanvasProps {
  src: string;
  cellSize?: number;
  brightness?: number;
  contrast?: number;
  animSpeed?: number;
  animIntensity?: number;
  tintStrength?: number;
  className?: string;
}

export default function AsciiCanvas({
  src,
  cellSize = 7,
  brightness = 1.6,
  contrast = 1.3,
  animSpeed = 0.8,
  animIntensity = 0.5,
  tintStrength = 0.08,
  className,
}: AsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const off = offRef.current;
      const img = imgRef.current;
      if (!off || !img || !img.complete || !img.naturalWidth) return;

      const oc = off.getContext("2d", { willReadFrequently: true })!;
      off.width = w;
      off.height = h;

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      oc.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

      const data = oc.getImageData(0, 0, w, h).data;

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

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * cellSize;
          const py = row * cellSize;
          const mx = px + cellSize / 2;
          const my = py + cellSize / 2;

          const sx = Math.min(Math.floor(mx), w - 1);
          const sy = Math.min(Math.floor(my), h - 1);
          const i = (sy * w + sx) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          lum = Math.pow(lum, 0.5) * brightness;
          lum = Math.min(1, Math.max(0, ((lum - 0.5) * contrast + 0.5)));

          const pulse =
            1 +
            Math.sin(t * 0.0015 * animSpeed + row * 0.25 + col * 0.12) *
              0.12 * animIntensity;
          lum = Math.min(1, lum * pulse);

          const charIdx = Math.floor(lum * (CHARS.length - 1));
          const ch = CHARS[charIdx];
          if (ch === " ") continue;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
          const vignette = 1 - dist * dist * 0.55;

          const bright = Math.min(1, lum * vignette);

          // keep original photo colors, very subtle accent tint
          const tR = 34, tG = 211, tB = 238;
          const cr = Math.round(Math.min(255, (r * (1 - tintStrength) + tR * tintStrength) * bright));
          const cg = Math.round(Math.min(255, (g * (1 - tintStrength) + tG * tintStrength) * bright));
          const cb = Math.round(Math.min(255, (b * (1 - tintStrength) + tB * tintStrength) * bright));

          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          ctx.fillText(ch, mx, my);
        }
      }

      // bloom
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(10px)";
      ctx.globalAlpha = 0.15;
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.globalAlpha = 1;
    },
    [cellSize, brightness, contrast, animSpeed, animIntensity, tintStrength],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    offRef.current = document.createElement("canvas");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    imgRef.current = img;

    const ctx = canvas.getContext("2d")!;
    let running = true;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function loop(t: number) {
      if (!running) return;
      render(ctx, window.innerWidth, window.innerHeight, t);
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
  }, [src, render]);

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
