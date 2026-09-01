"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FabAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  colorRgb?: string;
};

type QuickActionFabProps = {
  actions: FabAction[];
  accentRgb?: string;
};

const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

export default function QuickActionFab({ actions, accentRgb }: QuickActionFabProps) {
  const [open, setOpen] = useState(false);
  const c = accentRgb ?? "var(--accent-rgb)";

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open &&
          actions.map((a, i) => {
            const ac = a.colorRgb ?? c;
            return (
              <motion.button
                key={a.key}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                transition={{ ...spring, delay: i * 0.05 }}
                onClick={() => {
                  a.onClick();
                  setOpen(false);
                }}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border backdrop-blur-xl"
                style={{
                  background: `rgb(${ac} / 0.12)`,
                  borderColor: `rgb(${ac} / 0.2)`,
                }}
              >
                <a.icon size={16} style={{ color: `rgb(${ac})` }} />
                <span className="text-xs font-medium text-white/80">{a.label}</span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center border backdrop-blur-xl shadow-lg"
        style={{
          background: open ? "rgba(255 255 255 / 0.08)" : `rgb(${c} / 0.2)`,
          borderColor: open ? "rgba(255 255 255 / 0.12)" : `rgb(${c} / 0.3)`,
          boxShadow: open ? "none" : `0 0 30px -5px rgb(${c} / 0.3)`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={spring}
      >
        {open ? (
          <X size={22} className="text-white/60" />
        ) : (
          <Plus size={22} style={{ color: `rgb(${c})` }} />
        )}
      </motion.button>
    </div>
  );
}
