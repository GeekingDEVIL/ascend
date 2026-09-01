"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type TimelineRowProps = {
  timestamp: string;
  children: ReactNode;
  /** Left border accent as RGB triplet */
  accentRgb?: string;
  className?: string;
};

export default function TimelineRow({
  timestamp,
  children,
  accentRgb,
  className = "",
}: TimelineRowProps) {
  const c = accentRgb ?? "var(--accent-rgb)";

  return (
    <motion.div
      className={`relative rounded-xl border backdrop-blur-xl overflow-hidden pl-3 ${className}`}
      style={{
        background: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
        borderLeftWidth: "3px",
        borderLeftColor: `rgb(${c} / 0.5)`,
      }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="px-3 py-3">
        <span className="font-data text-[10px] text-white/30">{timestamp}</span>
        <div className="mt-1">{children}</div>
      </div>
    </motion.div>
  );
}
