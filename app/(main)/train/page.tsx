"use client";

import { useRouter } from "next/navigation";
import {
  Dumbbell, Activity, Swords, Wind, PersonStanding, ChevronRight, Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useModules } from "../../lib/useModules";
import { staggerContainer, staggerItem } from "../../lib/motion";
import type { ModuleKey } from "../../lib/modules";

type MethodCard = {
  key: string;
  href: string;
  label: string;
  desc: string;
  icon: typeof Dumbbell;
  colorRgb: string;
  module?: ModuleKey;
  comingSoon?: boolean;
};

const METHODS: MethodCard[] = [
  { key: "gym", href: "/workout", label: "Gym Workout", desc: "Barbell, dumbbell & machine training with smart scheduling", icon: Dumbbell, colorRgb: "139 92 246" },
  { key: "running", href: "/running", label: "Running", desc: "GPS tracking, pace analysis, splits & route history", icon: Activity, colorRgb: "249 115 22", module: "running", comingSoon: true },
  { key: "calisthenics", href: "/calisthenics", label: "Calisthenics", desc: "Bodyweight skill progressions & hold training", icon: PersonStanding, colorRgb: "168 85 247", module: "calisthenics", comingSoon: true },
  { key: "martial-arts", href: "/martial-arts", label: "Martial Arts", desc: "Muay Thai, BJJ & boxing session logging", icon: Swords, colorRgb: "239 68 68", module: "martial_arts", comingSoon: true },
  { key: "yoga", href: "/yoga", label: "Yoga", desc: "Guided flows, pose library & flexibility tracking", icon: Wind, colorRgb: "236 72 153", module: "yoga", comingSoon: true },
];

export default function TrainHub() {
  const router = useRouter();
  const { enabledKeys } = useModules();

  const visibleMethods = METHODS.filter(
    (m) => !m.module || enabledKeys.includes(m.module),
  );

  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white pb-24 md:pb-10 overflow-x-hidden">
      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto px-4 pt-6 space-y-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl font-black tracking-tight">Train</h1>
          <p className="text-[10px] font-mono text-white/30 mt-0.5">Choose your training method</p>
        </motion.div>

        <div className="space-y-3">
          {visibleMethods.map((method) => {
            const Icon = method.icon;
            return (
              <motion.button
                key={method.key}
                variants={staggerItem}
                onClick={() => { if (!method.comingSoon) router.push(method.href); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition text-left ${
                  method.comingSoon
                    ? "border-white/[0.04] cursor-default"
                    : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] cursor-pointer active:scale-[0.98]"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `rgb(${method.colorRgb} / ${method.comingSoon ? 0.05 : 0.1})`,
                    border: `1px solid rgb(${method.colorRgb} / ${method.comingSoon ? 0.08 : 0.15})`,
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: method.comingSoon ? `rgb(${method.colorRgb} / 0.25)` : `rgb(${method.colorRgb})` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-semibold ${method.comingSoon ? "text-white/25" : "text-white/85"}`}>
                    {method.label}
                  </p>
                  <p className={`text-[11px] font-mono mt-0.5 ${method.comingSoon ? "text-white/12" : "text-white/30"}`}>
                    {method.desc}
                  </p>
                </div>
                {method.comingSoon ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <Lock size={10} className="text-white/15" />
                    <span className="text-[8px] font-mono tracking-widest text-white/15 uppercase">Soon</span>
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-white/15 shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </main>
  );
}
