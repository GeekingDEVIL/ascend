"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type GlassCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  /** Hover glow color as RGB triplet */
  glowRgb?: string;
  /** Disable hover lift animation */
  static?: boolean;
  /** Extra wrapper classes */
  className?: string;
};

export default function GlassCard({
  children,
  glowRgb,
  static: isStatic = false,
  className = "",
  ...props
}: GlassCardProps) {
  const glow = glowRgb ?? "var(--accent-rgb)";

  return (
    <motion.div
      className={`
        relative rounded-2xl border backdrop-blur-xl overflow-hidden
        ${className}
      `}
      style={{
        background: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
      }}
      whileHover={
        isStatic
          ? undefined
          : {
              scale: 1.015,
              borderColor: "var(--glass-border-hover)",
              boxShadow: `var(--glass-glow-spread) rgb(${glow} / 0.12)`,
            }
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ═══ Stat Chip ═══ */

type StatChipProps = {
  label: string;
  value: string | number;
  /** Domain color as RGB triplet */
  colorRgb?: string;
  className?: string;
};

export function StatChip({
  label,
  value,
  colorRgb,
  className = "",
}: StatChipProps) {
  const c = colorRgb ?? "var(--accent-rgb)";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${className}`}
      style={{
        background: `rgb(${c} / 0.08)`,
        borderColor: `rgb(${c} / 0.15)`,
      }}
    >
      <span
        className="font-data text-sm font-semibold"
        style={{ color: `rgb(${c})` }}
      >
        {value}
      </span>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

/* ═══ Progress Ring ═══ */

type ProgressRingProps = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colorRgb?: string;
  label?: string;
  className?: string;
};

export function ProgressRing({
  value,
  max,
  size = 64,
  strokeWidth = 4,
  colorRgb,
  label,
  className = "",
}: ProgressRingProps) {
  const c = colorRgb ?? "var(--accent-rgb)";
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255 255 255 / 0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`rgb(${c})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-data text-xs font-semibold" style={{ color: `rgb(${c})` }}>
          {Math.round(pct * 100)}%
        </span>
        {label && (
          <span className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
