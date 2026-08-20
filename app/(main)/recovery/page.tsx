"use client";

import { useEffect, useState } from "react";
import { HeartPulse, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { useAuth } from "../../lib/AuthProvider";
import { analyzeAdaptiveVolume, getVolumeStatus, VOLUME_GUIDELINES, type AdaptiveVolumeData, type MuscleTrend } from "../../lib/volumeAnalysis";

const SEGMENT_ORDER = Object.keys(VOLUME_GUIDELINES);

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

function hoursSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

function recoveryFromHours(hours: number): number {
  return Math.min(100, Math.round((hours / 48) * 100));
}

function timeAgo(hours: number): string {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function TrendBadge({ trend }: { trend?: MuscleTrend }) {
  if (!trend || trend === "insufficient") return null;
  const map: Record<Exclude<MuscleTrend, "insufficient">, { icon: React.ReactNode; color: string; label: string }> = {
    improving: { icon: <TrendingUp size={11} />, color: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", label: "IMPROVING" },
    maintaining: { icon: <Minus size={11} />, color: "text-[rgb(var(--accent-light-rgb))] border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)]", label: "STABLE" },
    stalling: { icon: <Minus size={11} />, color: "text-amber-300 border-amber-400/30 bg-amber-400/10", label: "STALLING" },
    declining: { icon: <TrendingDown size={11} />, color: "text-red-400 border-red-400/30 bg-red-400/10", label: "DECLINING" },
  };
  const t = map[trend];
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border ${t.color}`}>
      {t.icon}
      {t.label}
    </span>
  );
}

export default function RecoveryPage() {
  const { user } = useAuth();
  const [adaptiveData, setAdaptiveData] = useState<Record<string, AdaptiveVolumeData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyzeAdaptiveVolume(user.id).then((data) => {
      setAdaptiveData(data);
      setLoading(false);
    });
  }, [user]);

  const currentWeekStart = getWeekStart(new Date());

  const rows = SEGMENT_ORDER.map((segment) => {
    const adaptive = adaptiveData[segment];
    const currentWeekSets = adaptive?.weeklyHistory.find((w) => w.weekLabel === currentWeekStart)?.sets ?? 0;
    const status = getVolumeStatus(segment, currentWeekSets, adaptive);
    const hrs = adaptive?.lastTrainedAt ? hoursSince(adaptive.lastTrainedAt) : null;
    const recoveryPct = hrs !== null ? recoveryFromHours(hrs) : null;
    return { segment, adaptive, currentWeekSets, status, hrs, recoveryPct };
  }).filter((r) => r.hrs !== null || r.currentWeekSets > 0)
    .sort((a, b) => (a.recoveryPct ?? 999) - (b.recoveryPct ?? 999));

  const trained = rows.filter((r) => r.recoveryPct !== null);
  const avgRecovery = trained.length > 0 ? Math.round(trained.reduce((s, r) => s + (r.recoveryPct ?? 0), 0) / trained.length) : null;
  const readyCount = trained.filter((r) => (r.recoveryPct ?? 0) >= 80).length;
  const fatiguedCount = trained.filter((r) => (r.recoveryPct ?? 0) < 50).length;

  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-[rgb(var(--accent-rgb)/0.1)] rounded-full blur-[130px]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white/90">Recovery</h1>
          <p className="text-white/40 text-sm mt-0.5">Per-muscle readiness based on training history.</p>
        </div>

        {loading ? (
          <p className="text-sm text-white/40 py-12 text-center">Loading...</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-9 h-9 mx-auto mb-3 rotate-45 border-2 border-[rgb(var(--accent-rgb)/0.3)]" />
            <p className="text-sm font-bold tracking-widest text-[rgb(var(--accent-light-rgb)/0.7)]">NO TRAINING DATA</p>
            <p className="text-xs text-white/40 mt-1">Complete a few workouts to see per-muscle recovery here.</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono tracking-widest text-white/40">OVERALL READINESS</p>
                <HeartPulse size={16} className="text-[rgb(var(--accent-light-rgb))]" />
              </div>
              <div className="flex items-end gap-4">
                <p className="text-3xl font-bold text-white">{avgRecovery ?? "—"}%</p>
                <div className="flex-1 space-y-1 pb-1">
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-[rgb(var(--accent-light-rgb))] rounded-full transition-all"
                      style={{ width: `${avgRecovery ?? 0}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-mono text-white/30">
                    {readyCount} ready · {trained.length - readyCount - fatiguedCount} moderate · {fatiguedCount} fatigued
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.segment} className="rounded-md border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white/90">{r.segment}</p>
                      <TrendBadge trend={r.adaptive?.trend} />
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border border-white/10 ${r.status.color}`}>
                      {r.status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          r.recoveryPct === null ? "bg-white/10" : r.recoveryPct >= 80 ? "bg-emerald-400" : r.recoveryPct >= 50 ? "bg-amber-300" : "bg-orange-400"
                        }`}
                        style={{ width: `${r.recoveryPct ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white/70 w-10 text-right shrink-0">
                      {r.recoveryPct !== null ? `${r.recoveryPct}%` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
                    <span>{r.hrs !== null ? `Last trained ${timeAgo(r.hrs)}` : "Not trained recently"}</span>
                    <span>{r.currentWeekSets} sets this week</span>
                  </div>

                  {r.status.tip && (
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-white/[0.06]">
                      <AlertCircle size={12} className="text-white/30 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-white/40 leading-snug">{r.status.tip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
