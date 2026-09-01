"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type NavPill = {
  key: string;
  label: string;
  icon?: LucideIcon;
};

type SubNavPillsProps = {
  pills: NavPill[];
  activeKey: string;
  onSelect: (key: string) => void;
  accentRgb?: string;
};

export default function SubNavPills({ pills, activeKey, onSelect, accentRgb }: SubNavPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeKey]);

  const accent = accentRgb ?? "var(--accent-rgb)";
  const accentVal = accentRgb ? accentRgb : "var(--accent-rgb)";
  const lightVal = accentRgb ? accentRgb : "var(--accent-light-rgb)";

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1"
    >
      {pills.map((pill) => {
        const active = pill.key === activeKey;
        const Icon = pill.icon;
        return (
          <motion.button
            key={pill.key}
            ref={active ? activeRef : undefined}
            onClick={() => onSelect(pill.key)}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-mono tracking-wide whitespace-nowrap shrink-0 transition-colors ${
              active
                ? "text-white"
                : "text-white/35 hover:text-white/60"
            }`}
          >
            {active && (
              <motion.div
                layoutId="pill-active"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `rgb(${accentVal} / 0.15)`,
                  border: `1px solid rgb(${accentVal} / 0.3)`,
                  boxShadow: `0 0 12px -4px rgb(${accentVal} / 0.3)`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && (
                <Icon
                  size={12}
                  style={active ? { color: `rgb(${lightVal})` } : undefined}
                />
              )}
              <span>{pill.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
