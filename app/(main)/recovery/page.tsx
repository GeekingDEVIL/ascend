"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, TrendingUp, TrendingDown, Minus, AlertCircle, ChevronLeft } from "lucide-react";
import { useAuth } from "../../lib/AuthProvider";
import { analyzeAdaptiveVolume, getVolumeStatus, VOLUME_GUIDELINES, type AdaptiveVolumeData, type MuscleTrend } from "../../lib/volumeAnalysis";
import CubeLoader from "../../components/ui/cube-loader";

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

function recoveryColor(pct: number | null): string {
  if (pct === null) return "bg-white/10";
  if (pct >= 80) return "bg-emerald-400";
  if (pct >= 50) return "bg-amber-300";
  return "bg-orange-400";
}

export default function RecoveryPage() {
  const { user } = useAuth();
  const router = useRouter();
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
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition">
          <ChevronLeft size={14} /> Profile
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[rgb(var(--accent-light-rgb))]">Recovery</h1>
            <p className="text-[11px] text-white/30 mt-0.5">Per-muscle readiness based on training history</p>
          </div>
          {avgRecovery !== null && (
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-white/90">{avgRecovery}%</p>
              <p className="text-[9px] font-mono text-white/30">overall</p>
            </div>
          )}
        </div>

        {loading ? (
          <CubeLoader message="Loading recovery data…" />
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <HeartPulse size={24} className="text-white/15" />
            </div>
            <p className="text-sm font-semibold text-white/25">No Training Data</p>
            <p className="text-xs text-white/20 mt-1">Complete a few workouts to see per-muscle recovery here.</p>
          </div>
        ) : (
          <>
            {/* Heat map summary */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-mono tracking-widest text-white/20">MUSCLE STATUS</p>
                <div className="flex items-center gap-3 text-[8px] font-mono text-white/25">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Ready</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300" />Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Fatigued</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {rows.map((r) => (
                  <div key={r.segment} className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${recoveryColor(r.recoveryPct)}`} />
                    <span className="text-[10px] font-mono text-white/60">{r.segment}</span>
                    <span className="text-[10px] font-mono text-white/30">{r.recoveryPct ?? 0}%</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-white/30">
                <span>{readyCount} ready</span>
                <span>{trained.length - readyCount - fatiguedCount} moderate</span>
                <span>{fatiguedCount} fatigued</span>
              </div>
            </div>

            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.segment} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${recoveryColor(r.recoveryPct)}`} />
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
                        className={`h-full rounded-full transition-all ${recoveryColor(r.recoveryPct)}`}
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
