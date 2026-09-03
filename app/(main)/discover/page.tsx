"use client";

import { useState } from "react";
import { Compass, Check } from "lucide-react";
import { motion } from "framer-motion";
import SwipeNav from "../../components/ui/swipe-nav";
import { getYouSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import { useSex } from "../../lib/useSex";
import { type ModuleDef, type ModuleKey, MODULE_REGISTRY } from "../../lib/modules";
import { staggerContainer, staggerItem } from "../../lib/motion";
import { AnimatePresence } from "framer-motion";

const DOMAIN_HUB_LABELS: Record<string, string> = {
  train: "Train hub",
  track: "Track hub",
  social: "Social hub",
  you: "You hub",
  gamification: "Social hub",
  lifestyle: "Track hub",
  nutrition: "Track hub",
  wearables: "Track hub",
};

const DOMAIN_GROUPS = [
  { label: "Training & Movement", keys: ["gym", "running", "martial_arts", "yoga", "calisthenics"] as ModuleKey[] },
  { label: "Health & Body", keys: ["progress", "recovery", "cycle", "wellness", "sleep", "progress_photos"] as ModuleKey[] },
  { label: "Nutrition & Fuel", keys: ["nutrition", "recipes"] as ModuleKey[] },
  { label: "Social & Community", keys: ["social", "guilds", "challenges"] as ModuleKey[] },
  { label: "Gamification & RPG", keys: ["xp", "daily_quests", "character_sheet", "cosmetics", "seasons"] as ModuleKey[] },
  { label: "AI & Intelligence", keys: ["ai_coach", "smart_programs"] as ModuleKey[] },
  { label: "Lifestyle & Habits", keys: ["habits"] as ModuleKey[] },
  { label: "Wearables & Devices", keys: ["wearables"] as ModuleKey[] },
];

export default function DiscoverPage() {
  const { enabledKeys, isEnabled, isCoreKey, toggleModule } = useModules();
  const { sex } = useSex();
  const [toggling, setToggling] = useState<ModuleKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleToggle(key: ModuleKey) {
    const wasEnabled = isEnabled(key);
    setToggling(key);
    await toggleModule(key);
    setToggling(null);
    const mod = MODULE_REGISTRY[key];
    const hub = DOMAIN_HUB_LABELS[mod.domain] ?? "your dashboard";
    const msg = wasEnabled ? `${mod.name} removed from ${hub}` : `${mod.name} added to ${hub}`;
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
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
            Enable the features you need. Core modules are always active. Toggle optional modules on or off — even upcoming ones.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono tracking-wider text-white/25">
            <span className="text-emerald-400/60">LIVE — built &amp; ready</span>
            <span className="text-white/15">|</span>
            <span className="text-amber-400/50">COMING SOON — on the roadmap</span>
          </div>
        </div>

        {DOMAIN_GROUPS.map((group) => {
          const mods = group.keys.map((k) => MODULE_REGISTRY[k]).filter((m): m is ModuleDef => !!m && (!m.sexGate || m.sexGate === sex));
          if (mods.length === 0) return null;
          return (
            <section key={group.label}>
              <h2 className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-3">{group.label}</h2>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                {mods.map((mod) => (
                  <ModuleCard
                    key={mod.key}
                    mod={mod}
                    enabled={isEnabled(mod.key)}
                    core={isCoreKey(mod.key)}
                    toggling={toggling === mod.key}
                    onToggle={() => handleToggle(mod.key)}
                  />
                ))}
              </motion.div>
            </section>
          );
        })}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-white/80 shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

const PHASE_LABELS: Record<number, string> = {
  0: "LIVE",
  1: "PHASE 1",
  2: "PHASE 2",
  3: "PHASE 3",
  4: "PHASE 4",
  5: "PHASE 5",
};

function ModuleCard({
  mod,
  enabled,
  core,
  toggling,
  onToggle,
}: {
  mod: ModuleDef;
  enabled: boolean;
  core: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  const Icon = mod.icon;
  const isCore = core;
  const isBuilt = mod.phase === 0;
  const phaseLabel = PHASE_LABELS[mod.phase] ?? `PHASE ${mod.phase}`;

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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-white/90">{mod.name}</span>
          {isCore && (
            <span className="text-[9px] font-mono tracking-wider text-[rgb(var(--accent-rgb))] bg-[rgb(var(--accent-rgb)/0.1)] px-1.5 py-0.5 rounded">
              CORE
            </span>
          )}
          {isBuilt && !isCore && (
            <span className="text-[9px] font-mono tracking-wider text-emerald-400/80 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              LIVE
            </span>
          )}
          {!isBuilt && (
            <span className="text-[9px] font-mono tracking-wider text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
              {phaseLabel}
            </span>
          )}
          {!isBuilt && (
            <span className="text-[8px] font-mono tracking-widest text-amber-400/60 bg-amber-400/[0.08] px-1.5 py-0.5 rounded">
              COMING SOON
            </span>
          )}
        </div>
        <p className="text-xs text-white/40 mt-0.5 truncate">{mod.description}</p>
      </div>

      {isCore ? (
        <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] flex items-center justify-center shrink-0">
          <Check size={14} className="text-[rgb(var(--accent-rgb))]" />
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
