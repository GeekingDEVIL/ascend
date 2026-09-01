"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type TabItem = {
  key: string;
  label: string;
  icon?: LucideIcon;
};

type AnimatedTabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Number of columns — defaults to tab count */
  columns?: number;
  /** Domain color override as RGB triplet, e.g. "139 92 246" */
  accentRgb?: string;
  className?: string;
};

const spring = { type: "spring" as const, stiffness: 500, damping: 30 };
const gentleSpring = { type: "spring" as const, stiffness: 300, damping: 25 };

export default function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  columns,
  accentRgb,
  className = "",
}: AnimatedTabsProps) {
  const cols = columns ?? tabs.length;
  const accent = accentRgb ?? "var(--accent-rgb)";
  const accentVal = accentRgb ? accentRgb : "var(--accent-rgb)";

  return (
    <div
      className={`relative grid gap-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {tabs.map((t) => {
        const isActive = t.key === activeTab;
        const Icon = t.icon;

        return (
          <motion.button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className="relative flex items-center justify-center gap-1.5 font-data text-[10px] px-2 py-2.5 rounded-xl border transition-colors overflow-hidden"
            style={{
              borderColor: isActive
                ? `rgb(${accentVal} / 0.25)`
                : "rgba(255 255 255 / 0.06)",
              color: isActive
                ? `rgb(${accentVal})`
                : "rgba(255 255 255 / 0.35)",
            }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
          >
            {/* Active background glow */}
            {isActive && (
              <motion.div
                layoutId="tab-active-bg"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `rgb(${accentVal} / 0.08)`,
                  boxShadow: `0 0 24px -4px rgb(${accentVal} / 0.15)`,
                }}
                transition={gentleSpring}
              />
            )}

            {/* Content */}
            <motion.span
              className="relative z-10 flex items-center gap-1.5"
              animate={{ scale: isActive ? 1 : 0.95 }}
              transition={spring}
            >
              {Icon && (
                <motion.span
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    rotate: isActive ? [0, -8, 8, 0] : 0,
                  }}
                  transition={{
                    scale: spring,
                    rotate: { duration: 0.4, ease: "easeInOut" },
                  }}
                >
                  <Icon size={12} />
                </motion.span>
              )}
              {t.label}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ═══ Tab Content Wrapper ═══ */

type TabContentProps = {
  tabKey: string;
  children: ReactNode;
  direction?: "left" | "right";
};

const contentVariants = {
  enter: (dir: string) => ({
    opacity: 0,
    x: dir === "right" ? 12 : -12,
    scale: 0.98,
  }),
  active: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 28 },
  },
  exit: (dir: string) => ({
    opacity: 0,
    x: dir === "right" ? -12 : 12,
    scale: 0.98,
    transition: { duration: 0.15 },
  }),
};

export function TabContent({ tabKey, children, direction = "right" }: TabContentProps) {
  return (
    <motion.div
      key={tabKey}
      custom={direction}
      variants={contentVariants}
      initial="enter"
      animate="active"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
