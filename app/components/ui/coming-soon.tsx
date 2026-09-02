"use client";

import { Construction } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type ComingSoonProps = {
  icon: LucideIcon;
  name: string;
  description: string;
  colorRgb: string;
};

export default function ComingSoon({ icon: Icon, name, description, colorRgb }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 gap-5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `rgb(${colorRgb} / 0.12)` }}
      >
        <Icon size={36} style={{ color: `rgb(${colorRgb})` }} />
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <h1 className="text-xl font-bold text-white/90">{name}</h1>
        <p className="text-sm text-white/40 max-w-xs">{description}</p>
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]"
      >
        <Construction size={16} className="text-white/30" />
        <span className="text-xs font-mono tracking-wider text-white/30 uppercase">Coming Soon</span>
      </motion.div>
    </div>
  );
}
