"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Check, Lock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SwipeNav from "../../components/ui/swipe-nav";
import { getYouSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import { type ModuleDef, type ModuleKey } from "../../lib/modules";
import { staggerContainer, staggerItem } from "../../lib/motion";

const DOMAIN_GROUPS = [
  { label: "Training", keys: ["gym", "running", "martial_arts", "yoga"] as ModuleKey[] },
  { label: "Tracking", keys: ["progress", "nutrition", "cycle", "recovery", "wellness"] as ModuleKey[] },
  { label: "Social & Gamification", keys: ["xp", "social"] as ModuleKey[] },
  { label: "Intelligence", keys: ["ai_coach"] as ModuleKey[] },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { enabledKeys, visibleModules, isEnabled, toggleModule } = useModules();
  const [toggling, setToggling] = useState<ModuleKey | null>(null);

  async function handleToggle(key: ModuleKey) {
    setToggling(key);
    await toggleModule(key);
    setToggling(null);
  }

  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-teal-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6">
        <SwipeNav sections={getYouSections(enabledKeys)} />

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white/90 flex items-center gap-2">
            <Compass size={22} className="text-[rgb(var(--accent-rgb))]" />
            Discover Modules
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Enable the features you need. Core modules are always active. Toggle optional modules on or off anytime.
          </p>
        </div>

        {DOMAIN_GROUPS.map((group) => {
          const mods = group.keys.map((k) => visibleModules.find((m) => m.key === k)).filter((m): m is ModuleDef => !!m);
          return (
            <section key={group.label}>
              <h2 className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-3">{group.label}</h2>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                {mods.map((mod) => (
                  <ModuleCard
                    key={mod.key}
                    mod={mod}
                    enabled={isEnabled(mod.key)}
                    toggling={toggling === mod.key}
                    onToggle={() => handleToggle(mod.key)}
                  />
                ))}
              </motion.div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function ModuleCard({
  mod,
  enabled,
  toggling,
  onToggle,
}: {
  mod: ModuleDef;
  enabled: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  const Icon = mod.icon;
  const isCore = mod.core;
  const isFuture = mod.phase > 1;

  return (
    <motion.div
      variants={staggerItem}
      className={`relative border rounded-lg p-4 flex items-center gap-4 transition-all ${
        enabled
          ? "border-white/10 bg-white/[0.03]"
          : "border-white/5 bg-white/[0.01] opacity-60"
      }`}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `rgb(${mod.colorRgb} / 0.15)` }}
      >
        <Icon size={20} style={{ color: `rgb(${mod.colorRgb})` }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white/90">{mod.name}</span>
          {isCore && (
            <span className="text-[9px] font-mono tracking-wider text-[rgb(var(--accent-rgb))] bg-[rgb(var(--accent-rgb)/0.1)] px-1.5 py-0.5 rounded">
              CORE
            </span>
          )}
          {isFuture && (
            <span className="text-[9px] font-mono tracking-wider text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
              PHASE {mod.phase}
            </span>
          )}
        </div>
        <p className="text-xs text-white/40 mt-0.5 truncate">{mod.description}</p>
      </div>

      {isCore ? (
        <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] flex items-center justify-center shrink-0">
          <Check size={14} className="text-[rgb(var(--accent-rgb))]" />
        </div>
      ) : isFuture ? (
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <Lock size={14} className="text-white/20" />
        </div>
      ) : (
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${
            enabled ? "bg-emerald-500/80" : "bg-white/10"
          }`}
          aria-label={`${enabled ? "Disable" : "Enable"} ${mod.name}`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            } ${toggling ? "opacity-50" : ""}`}
          />
        </button>
      )}
    </motion.div>
  );
}
