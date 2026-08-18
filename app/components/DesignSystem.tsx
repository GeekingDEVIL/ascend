"use client";

import { Award } from "lucide-react";

export const HOLO_CLIP = "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))";

export function GlassText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.55))",
        filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.25)) drop-shadow(0 3px 14px rgba(0,0,0,0.5))",
      }}
    >
      {children}
    </span>
  );
}

export function DividerWithHyphens() {
  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-cyan-300/50 text-xs leading-none">–</span>
      <span className="h-px flex-1 bg-cyan-400/20" />
      <span className="text-cyan-300/50 text-xs leading-none">–</span>
    </div>
  );
}

export function SideLine({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[-10px] bottom-[-10px] ${side === "left" ? "-left-3" : "-right-3"} w-px hidden md:block`}
      style={{ background: "linear-gradient(to bottom, transparent, rgba(103,232,249,0.5) 50%, transparent)" }}
    />
  );
}

export function GlowPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative w-full">
      <div className="relative p-[1.5px] rounded-md overflow-hidden">
        <style>{`@keyframes beamSpinSlow { to { transform: rotate(360deg); } }`}</style>
        <div
          className="absolute inset-[-60%] animate-[beamSpinSlow_10s_linear_infinite] opacity-60"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 5%, #22d3ee 16%, #a5f3fc 24%, #22d3ee 32%, transparent 45%, transparent 55%, #22d3ee 68%, #a5f3fc 76%, #22d3ee 84%, transparent 95%, transparent 100%)",
            filter: "blur(4px)",
          }}
        />
        <div className={`relative rounded-md bg-[#0a1524]/95 px-6 py-6 ${className}`}>{children}</div>
      </div>
      <SideLine side="left" />
      <SideLine side="right" />
    </div>
  );
}

export function HoloCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        clipPath: HOLO_CLIP,
        border: "1px solid rgba(34,211,238,0.4)",
        boxShadow: "0 0 22px -6px rgba(34,211,238,0.35)",
        background: "linear-gradient(135deg, rgba(10,21,36,0.9), rgba(10,21,36,0.75))",
      }}
    >
      <div className="w-12 shrink-0 flex items-center justify-center bg-cyan-400/10 border-r border-cyan-400/20 text-cyan-300">
        {icon}
      </div>
      <div className="flex-1 p-3">
        <p className="text-xs font-bold text-white/85 tracking-wide mb-2">{label}</p>
        <div className="flex items-center justify-between rounded border border-cyan-400/20 bg-cyan-950/40 px-2.5 py-1.5">
          <span className="text-[10px] text-cyan-300/60 font-mono tracking-widest">{sub ?? "VALUE"}</span>
          <GlassText className="text-base font-bold">{value}</GlassText>
        </div>
      </div>
    </div>
  );
}

export function rankForLevel(level: number) {
  if (level >= 50) return { name: "PLATINUM", color: "text-cyan-200", border: "border-cyan-200/40", glow: "rgba(165,243,252,0.6)" };
  if (level >= 25) return { name: "GOLD", color: "text-yellow-300", border: "border-yellow-300/40", glow: "rgba(250,204,21,0.6)" };
  if (level >= 10) return { name: "SILVER", color: "text-slate-300", border: "border-slate-300/40", glow: "rgba(203,213,225,0.5)" };
  return { name: "BRONZE", color: "text-amber-500", border: "border-amber-500/40", glow: "rgba(217,119,6,0.5)" };
}

export function RankBadge({ level }: { level: number }) {
  const rank = rankForLevel(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${rank.border} bg-white/5 px-3 py-1 rounded-md text-[10px] font-mono tracking-widest ${rank.color}`}
      style={{ boxShadow: `0 0 12px -2px ${rank.glow}` }}
    >
      <Award size={12} />
      {rank.name}
    </span>
  );
}

export function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 font-mono text-sm text-white/70">
      <span className="text-cyan-300">{icon}</span>
      <span className="text-white/40">{label}:</span>
      <GlassText className="font-bold text-base">{value}</GlassText>
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full max-w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)]" />
      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-5">
        {children}
      </div>
    </main>
  );
}