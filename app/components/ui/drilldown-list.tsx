"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../lib/motion";

export type DrilldownItem = {
  key: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: { label: string; color: string };
  progress?: { value: number; max: number; colorRgb?: string };
  onClick?: () => void;
};

type DrilldownListProps = {
  items: DrilldownItem[];
  accentRgb?: string;
};

export default function DrilldownList({ items, accentRgb }: DrilldownListProps) {
  const accent = accentRgb ?? "var(--accent-rgb)";

  return (
    <motion.div
      className="space-y-1.5"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.button
          key={item.key}
          variants={staggerItem}
          onClick={item.onClick}
          whileTap={{ scale: 0.98 }}
          className="w-full glass-card glass-card-interactive flex items-center gap-3 px-4 py-3 text-left group"
        >
          {item.icon && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.04] border border-white/[0.06]">
              {item.icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-white/85 truncate">
                {item.label}
              </p>
              {item.badge && (
                <span
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded-full border shrink-0"
                  style={{
                    color: item.badge.color,
                    borderColor: `${item.badge.color}40`,
                    backgroundColor: `${item.badge.color}15`,
                  }}
                >
                  {item.badge.label}
                </span>
              )}
            </div>
            {item.subtitle && (
              <p className="text-[10px] font-mono text-white/30 mt-0.5 truncate">
                {item.subtitle}
              </p>
            )}
            {item.progress && (
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (item.progress.value / item.progress.max) * 100)}%`,
                    background: `linear-gradient(90deg, rgb(${item.progress.colorRgb ?? accent}), rgb(${item.progress.colorRgb ?? accent} / 0.6))`,
                  }}
                />
              </div>
            )}
          </div>

          <ChevronRight
            size={14}
            className="text-white/15 group-hover:text-white/30 transition shrink-0"
          />
        </motion.button>
      ))}
    </motion.div>
  );
}
