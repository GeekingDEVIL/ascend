"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, TrendingUp, TrendingDown, Minus, AlertCircle, ChevronLeft, Zap, Clock, Dumbbell, Activity, ShieldCheck, ShieldAlert, Shield, ShieldX } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/AuthProvider";
import { supabase } from "../../lib/supabase";
import { analyzeRecovery, type MuscleRecoveryData, type RecoveryStatus } from "../../lib/muscleRecovery";
import { analyzeAdaptiveVolume, getVolumeStatus, getVolumeGuidelines, type AdaptiveVolumeData } from "../../lib/volumeAnalysis";
import type { Sex } from "../../lib/calorieEngine";
import CubeLoader from "../../components/ui/cube-loader";
import { staggerContainer, staggerItem } from "../../lib/motion";

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

function timeAgo(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusConfig(status: RecoveryStatus): { icon: React.ReactNode; color: string; barColor: string; label: string; bgAccent: string } {
  switch (status) {
    case "recovered": return {
      icon: <ShieldCheck size={14} />,
      color: "text-emerald-300",
      barColor: "bg-emerald-400",
      label: "RECOVERED",
      bgAccent: "bg-emerald-400/8 border-emerald-400/15",
    };
    case "ready": return {
      icon: <Shield size={14} />,
      color: "text-cyan-300",
      barColor: "bg-cyan-400",
      label: "READY",
      bgAccent: "bg-cyan-400/8 border-cyan-400/15",
    };
    case "moderate": return {
      icon: <ShieldAlert size={14} />,
      color: "text-amber-300",
      barColor: "bg-amber-300",
      label: "RECOVERING",
      bgAccent: "bg-amber-300/8 border-amber-300/15",
    };
    case "fatigued": return {
      icon: <ShieldX size={14} />,
      color: "text-orange-400",
      barColor: "bg-orange-400",
      label: "FATIGUED",
      bgAccent: "bg-orange-400/8 border-orange-400/15",
    };
    case "overtrained": return {
      icon: <ShieldX size={14} />,
      color: "text-red-400",
      barColor: "bg-red-400",
      label: "REST NEEDED",
      bgAccent: "bg-red-400/8 border-red-400/15",
    };
  }
}

function recoveryBarColor(pct: number): string {
  if (pct >= 95) return "bg-emerald-400";
  if (pct >= 80) return "bg-cyan-400";
  if (pct >= 50) return "bg-amber-300";
  if (pct >= 25) return "bg-orange-400";
  return "bg-red-400";
}

function overallStatusLabel(avg: number): { label: string; color: string } {
  if (avg >= 85) return { label: "Fully Recovered", color: "text-emerald-300" };
  if (avg >= 70) return { label: "Mostly Ready", color: "text-cyan-300" };
  if (avg >= 50) return { label: "Partially Recovered", color: "text-amber-300" };
  if (avg >= 30) return { label: "Significant Fatigue", color: "text-orange-400" };
  return { label: "Rest Recommended", color: "text-red-400" };
}

export default function RecoveryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recoveryData, setRecoveryData] = useState<Record<string, MuscleRecoveryData>>({});
  const [adaptiveData, setAdaptiveData] = useState<Record<string, AdaptiveVolumeData>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [userSex, setUserSex] = useState<Sex | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("sex").eq("id", user.id).single();
      const sex = (prof?.sex as Sex) ?? null;
      setUserSex(sex);
      const [recovery, adaptive] = await Promise.all([
        analyzeRecovery(user.id, sex),
        analyzeAdaptiveVolume(user.id),
      ]);
      setRecoveryData(recovery);
      setAdaptiveData(adaptive);
      setLoading(false);
    })();
  }, [user]);

  const currentWeekStart = getWeekStart(new Date());

  const rows = Object.values(recoveryData).sort((a, b) => a.recoveryPct - b.recoveryPct);

  const avgRecovery = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.recoveryPct, 0) / rows.length)
    : null;
  const readyCount = rows.filter(r => r.recoveryPct >= 80).length;
  const fatiguedCount = rows.filter(r => r.recoveryPct < 50).length;
  const totalWeeklyVolume = rows.reduce((s, r) => s + r.weeklyVolume, 0);
  const totalFrequency = new Set(rows.flatMap(r => {
    const sessions: string[] = [];
    if (r.lastTrainedAt) sessions.push(r.lastTrainedAt.split("T")[0]);
    return sessions;
  })).size;

  const overallStatus = avgRecovery !== null ? overallStatusLabel(avgRecovery) : null;

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition">
          <ChevronLeft size={14} /> Profile
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[rgb(var(--accent-light-rgb))]">Recovery</h1>
            <p className="text-[11px] text-white/30 mt-0.5">Evidence-based per-muscle readiness</p>
          </div>
          {avgRecovery !== null && (
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-white/90">{avgRecovery}%</p>
              <p className={`text-[9px] font-mono ${overallStatus!.color}`}>{overallStatus!.label}</p>
            </div>
          )}
        </div>

        {loading ? (
          <CubeLoader message="Analyzing recovery…" />
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
            {/* Overview stats */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-lg font-bold font-mono text-white/90">{rows.length}</p>
                <p className="text-[8px] font-mono text-white/25 mt-0.5">MUSCLES</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-lg font-bold font-mono text-emerald-300">{readyCount}</p>
                <p className="text-[8px] font-mono text-white/25 mt-0.5">READY</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-lg font-bold font-mono text-orange-400">{fatiguedCount}</p>
                <p className="text-[8px] font-mono text-white/25 mt-0.5">FATIGUED</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-lg font-bold font-mono text-white/90">{totalWeeklyVolume}</p>
                <p className="text-[8px] font-mono text-white/25 mt-0.5">SETS/WK</p>
              </div>
            </div>

            {/* Recovery heat map */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-mono tracking-widest text-white/20">READINESS MAP</p>
                <div className="flex items-center gap-3 text-[8px] font-mono text-white/25">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Ready</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-300" />Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Fatigued</span>
                </div>
              </div>

              {/* Visual heat strip per muscle */}
              <div className="space-y-1.5">
                {rows.map((r) => (
                  <div key={r.segment} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/50 w-20 text-right shrink-0">{r.segment}</span>
                    <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.recoveryPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className={`h-full rounded-full ${recoveryBarColor(r.recoveryPct)}`}
                        style={{ opacity: 0.8 + (r.recoveryPct / 500) }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/40 w-8 shrink-0">{r.recoveryPct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-muscle cards */}
            <motion.div className="space-y-2.5" variants={staggerContainer} initial="hidden" animate="visible">
              {rows.map((r) => {
                const config = statusConfig(r.status);
                const adaptive = adaptiveData[r.segment];
                const weekSets = adaptive?.weeklyHistory.find(w => w.weekLabel === currentWeekStart)?.sets ?? r.weeklyVolume;
                const volumeStatus = getVolumeStatus(r.segment, weekSets, adaptive, userSex);
                const isExpanded = expandedSegment === r.segment;

                return (
                  <motion.div
                    key={r.segment}
                    variants={staggerItem}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedSegment(isExpanded ? null : r.segment)}
                      className="w-full text-left p-4 hover:bg-white/[0.01] transition"
                    >
                      {/* Top row: name + status */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${config.bgAccent}`}>
                            <span className={config.color}>{config.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white/90">{r.segment}</p>
                            <p className="text-[10px] font-mono text-white/30">{timeAgo(r.hoursElapsed)} · {r.setsInSession} sets last session</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold font-mono ${config.color}`}>{r.recoveryPct}%</p>
                          <p className={`text-[8px] font-mono ${config.color}`}>{config.label}</p>
                        </div>
                      </div>

                      {/* Recovery bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${r.recoveryPct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${config.barColor}`}
                          />
                        </div>
                      </div>

                      {/* Quick stats row */}
                      <div className="flex items-center gap-4 mt-2.5 text-[10px] font-mono text-white/30">
                        <span className="flex items-center gap-1"><Clock size={10} /> ~{r.estimatedFullRecoveryHours}h full recovery</span>
                        <span className="flex items-center gap-1"><Dumbbell size={10} /> {weekSets} sets/wk</span>
                        <span className={`${volumeStatus.color}`}>{volumeStatus.label}</span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-white/[0.04] space-y-3">
                        {/* Science-based recommendation */}
                        <div className="flex items-start gap-2 mt-3 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
                          <Activity size={14} className={`${config.color} mt-0.5 shrink-0`} />
                          <p className="text-[11px] text-white/50 leading-relaxed">{r.recommendation}</p>
                        </div>

                        {/* Recovery factors */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                            <p className="text-[8px] font-mono text-white/25 mb-0.5">INTENSITY FACTOR</p>
                            <p className="text-sm font-bold font-mono text-white/80">{r.intensityFactor}x</p>
                            <p className="text-[9px] text-white/25 mt-0.5">
                              {r.intensityFactor > 1.1 ? "High load — extended recovery" : r.intensityFactor < 0.9 ? "Light session — faster recovery" : "Moderate load"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                            <p className="text-[8px] font-mono text-white/25 mb-0.5">WEEKLY FREQUENCY</p>
                            <p className="text-sm font-bold font-mono text-white/80">{r.frequencyThisWeek}x</p>
                            <p className="text-[9px] text-white/25 mt-0.5">
                              {r.frequencyThisWeek >= 3 ? "High frequency" : r.frequencyThisWeek === 2 ? "Standard frequency" : "Low frequency"}
                            </p>
                          </div>
                        </div>

                        {/* Volume status with trend */}
                        {adaptive && adaptive.trend !== "insufficient" && (
                          <div className="flex items-center gap-2 text-[10px] font-mono">
                            {adaptive.trend === "improving" && <><TrendingUp size={12} className="text-emerald-300" /><span className="text-emerald-300">Performance improving</span></>}
                            {adaptive.trend === "maintaining" && <><Minus size={12} className="text-cyan-300" /><span className="text-cyan-300">Performance stable</span></>}
                            {adaptive.trend === "stalling" && <><Minus size={12} className="text-amber-300" /><span className="text-amber-300">Performance stalling</span></>}
                            {adaptive.trend === "declining" && <><TrendingDown size={12} className="text-red-400" /><span className="text-red-400">Performance declining</span></>}
                            {adaptive.performanceChangePct !== null && (
                              <span className="text-white/25">({adaptive.performanceChangePct > 0 ? "+" : ""}{Math.round(adaptive.performanceChangePct)}% e1RM)</span>
                            )}
                          </div>
                        )}

                        {volumeStatus.tip && (
                          <div className="flex items-start gap-1.5">
                            <AlertCircle size={12} className="text-white/20 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-white/30 leading-snug">{volumeStatus.tip}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Science footer */}
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
              <p className="text-[9px] font-mono text-white/20 leading-relaxed">
                Recovery model based on ACSM position stand on resistance training (2009), NSCA Essentials of Strength Training & Conditioning (Haff & Triplett), Schoenfeld et al. (2016) meta-analysis on training volume, and Bishop et al. (2008) recovery review. Uses non-linear recovery curve accounting for muscle size, session volume, and estimated intensity.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
