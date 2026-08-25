"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Droplets, Brain, Moon, Zap, Calendar,
  TrendingUp, Heart, Plus, Check, X, Flame, Wind,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import {
  estimateCyclePhase, computeAdaptiveCycleLength, getCycleInsight,
  fetchCycleLogs, fetchCycleSymptoms, logPeriod, endPeriod, logSymptoms,
  SYMPTOM_OPTIONS, MOOD_OPTIONS, FLOW_LEVELS, CRAVING_OPTIONS,
  type CycleLog, type CycleSymptomLog, type CycleInsight,
} from "../../lib/cycleAwareTrend";
import CubeLoader from "../../components/ui/cube-loader";
import { staggerContainer, staggerItem, tabContent } from "../../lib/motion";

type Tab = "today" | "log" | "history";

const PHASE_COLORS: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  menstrual: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: Droplets },
  follicular: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", icon: TrendingUp },
  ovulation: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: Flame },
  luteal: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", icon: Moon },
};

const PHASE_LABELS: Record<string, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

export default function CyclePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("today");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [symptoms, setSymptoms] = useState<CycleSymptomLog[]>([]);
  const [insight, setInsight] = useState<CycleInsight | null>(null);
  const [userSex, setUserSex] = useState<string | null>(null);

  const [showPeriodLog, setShowPeriodLog] = useState(false);
  const [periodDate, setPeriodDate] = useState(new Date().toISOString().split("T")[0]);
  const [flowLevel, setFlowLevel] = useState("medium");

  const [todaySymptoms, setTodaySymptoms] = useState<string[]>([]);
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [todaySleep, setTodaySleep] = useState<number | null>(null);
  const [todayCraving, setTodayCraving] = useState<string | null>(null);
  const [symptomSaved, setSymptomSaved] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    if (!user) return;
    const [cycleLogs, cycleSymptoms, { data: prof }] = await Promise.all([
      fetchCycleLogs(user.id),
      fetchCycleSymptoms(user.id, 60),
      supabase.from("profiles").select("sex").eq("id", user.id).maybeSingle(),
    ]);

    setUserSex(prof?.sex ?? null);
    setLogs(cycleLogs);
    setSymptoms(cycleSymptoms);

    if (prof?.sex !== "female") {
      setLoading(false);
      return;
    }

    const periodStarts = cycleLogs.map((l) => l.period_start);
    const cycleLen = computeAdaptiveCycleLength(periodStarts);

    const { data: goals } = await supabase
      .from("user_goals")
      .select("cycle_start_date")
      .eq("user_id", user.id)
      .limit(1);

    const lastStart = periodStarts[0] ?? goals?.[0]?.cycle_start_date ?? today;
    const cycleInsight = getCycleInsight(lastStart, cycleLen, today);
    setInsight(cycleInsight);

    const todayLog = cycleSymptoms.find((s) => s.date === today);
    if (todayLog) {
      setTodaySymptoms(todayLog.symptoms ?? []);
      setTodayEnergy(todayLog.energy_level);
      setTodayMood(todayLog.mood);
      setTodaySleep(todayLog.sleep_quality);
      setTodayCraving(todayLog.craving);
      setSymptomSaved(true);
    }

    setLoading(false);
  }, [user, today]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleLogPeriod() {
    if (!user) return;
    await logPeriod(user.id, periodDate, flowLevel);
    setShowPeriodLog(false);
    await loadData();
  }

  async function handleEndPeriod(log: CycleLog) {
    if (!user) return;
    await endPeriod(user.id, log.period_start, today);
    await loadData();
  }

  async function handleSaveSymptoms() {
    if (!user) return;
    await logSymptoms(user.id, today, {
      symptoms: todaySymptoms,
      energy_level: todayEnergy ?? undefined,
      mood: todayMood ?? undefined,
      sleep_quality: todaySleep ?? undefined,
      craving: todayCraving ?? undefined,
    });
    setSymptomSaved(true);
  }

  function toggleSymptom(s: string) {
    setSymptomSaved(false);
    setTodaySymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center">
        <CubeLoader message="Loading cycle data…" />
      </main>
    );
  }

  if (userSex !== "female") {
    return (
      <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-white/40 text-sm">Cycle tracking is available in female mode.</p>
          <button onClick={() => router.push("/profile")} className="text-[10px] font-mono text-[rgb(var(--accent-light-rgb))] hover:underline">
            Go to Profile Settings
          </button>
        </div>
      </main>
    );
  }

  const phaseStyle = insight ? PHASE_COLORS[insight.currentPhase] : PHASE_COLORS.follicular;
  const PhaseIcon = phaseStyle.icon;

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-4">
        <button onClick={() => router.push("/recovery")} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition">
          <ChevronLeft size={14} /> Recovery
        </button>

        {/* Phase hero */}
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-2xl border-2 ${phaseStyle.border} overflow-hidden`}
            style={{ boxShadow: `0 0 40px -12px rgba(var(--accent-rgb), 0.15)` }}
          >
            <div className={`absolute inset-0 ${phaseStyle.bg} opacity-40`} />
            <div className="relative px-5 pt-5 pb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl border-2 ${phaseStyle.border} ${phaseStyle.bg} flex items-center justify-center`}>
                  <PhaseIcon size={28} className={phaseStyle.text} />
                </div>
                <div className="flex-1">
                  <p className={`text-xl font-bold tracking-wide ${phaseStyle.text}`}>
                    {PHASE_LABELS[insight.currentPhase]} Phase
                  </p>
                  <p className="text-[11px] font-mono text-white/40 mt-0.5">
                    Day {insight.cycleDay} of {insight.cycleLength} · {insight.phaseDaysRemaining}d remaining
                  </p>
                </div>
              </div>

              {/* Phase ring */}
              <div className="mt-4 flex items-center gap-1.5">
                {["menstrual", "follicular", "ovulation", "luteal"].map((p) => {
                  const isActive = p === insight.currentPhase;
                  const pc = PHASE_COLORS[p];
                  return (
                    <div key={p} className={`flex-1 h-2 rounded-full transition-all ${isActive ? pc.bg + " border " + pc.border : "bg-white/[0.06]"}`}>
                      {isActive && <div className={`h-full rounded-full ${pc.bg.replace("/10", "/40")}`} style={{ width: `${((insight.cycleDay / insight.cycleLength) * 100)}%` }} />}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[7px] font-mono text-white/20">
                {["menstrual", "follicular", "ovulation", "luteal"].map((p) => (
                  <span key={p} className={p === insight.currentPhase ? phaseStyle.text : ""}>{PHASE_LABELS[p]}</span>
                ))}
              </div>

              {insight.nextPeriodEstimate && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[10px] font-mono text-white/30">
                  <Calendar size={11} />
                  <span>Next period estimated: <span className="text-white/60">{new Date(insight.nextPeriodEstimate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {(["today", "log", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-[10px] font-mono py-2.5 rounded-xl border transition ${tab === t ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}
            >
              {t === "today" ? "TODAY" : t === "log" ? "LOG PERIOD" : "HISTORY"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* TODAY TAB */}
          {tab === "today" && insight && (
            <motion.div key="today" className="space-y-4" variants={tabContent} initial="hidden" animate="visible" exit="exit">
              {/* Training rec */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} className={phaseStyle.text} />
                  <p className="text-[10px] font-mono tracking-widest text-white/30">TRAINING</p>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">{insight.trainingRec}</p>
              </div>

              {/* Nutrition rec */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart size={14} className={phaseStyle.text} />
                  <p className="text-[10px] font-mono tracking-widest text-white/30">NUTRITION</p>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">{insight.nutritionRec}</p>
              </div>

              {/* Body note */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Wind size={14} className={phaseStyle.text} />
                  <p className="text-[10px] font-mono tracking-widest text-white/30">YOUR BODY</p>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed">{insight.phaseInfo}</p>
              </div>

              {/* Symptom tracker */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                <p className="text-[10px] font-mono tracking-widest text-white/30">HOW ARE YOU FEELING TODAY?</p>

                {/* Symptoms */}
                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-2">SYMPTOMS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SYMPTOM_OPTIONS.map((s) => (
                      <button key={s} onClick={() => toggleSymptom(s)}
                        className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition ${todaySymptoms.includes(s) ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-2">ENERGY LEVEL</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => { setTodayEnergy(n); setSymptomSaved(false); }}
                        className={`flex-1 text-[11px] font-mono py-2 rounded-lg border transition ${todayEnergy === n ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30"}`}>
                        {n === 1 ? "🪫" : n === 2 ? "😴" : n === 3 ? "😐" : n === 4 ? "💪" : "🔥"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-2">MOOD</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOOD_OPTIONS.map((m) => (
                      <button key={m} onClick={() => { setTodayMood(m); setSymptomSaved(false); }}
                        className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition ${todayMood === m ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep quality */}
                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-2">SLEEP QUALITY</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => { setTodaySleep(n); setSymptomSaved(false); }}
                        className={`flex-1 text-[11px] font-mono py-2 rounded-lg border transition ${todaySleep === n ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30"}`}>
                        {n === 1 ? "😵" : n === 2 ? "😣" : n === 3 ? "😐" : n === 4 ? "😊" : "😴"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cravings */}
                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-2">CRAVINGS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CRAVING_OPTIONS.map((c) => (
                      <button key={c} onClick={() => { setTodayCraving(c); setSymptomSaved(false); }}
                        className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition ${todayCraving === c ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveSymptoms}
                  className={`w-full py-2.5 rounded-xl text-[11px] font-mono font-semibold transition ${symptomSaved ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.25)]"}`}>
                  {symptomSaved ? "Saved" : "Save Today's Log"}
                </button>
              </div>
            </motion.div>
          )}

          {/* LOG PERIOD TAB */}
          {tab === "log" && (
            <motion.div key="log" className="space-y-4" variants={tabContent} initial="hidden" animate="visible" exit="exit">
              {/* Active period check */}
              {logs[0] && !logs[0].period_end && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-red-400" />
                    <p className="text-[11px] font-mono text-red-400">Period in progress</p>
                  </div>
                  <p className="text-[10px] text-white/40">
                    Started {new Date(logs[0].period_start + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                  </p>
                  <button onClick={() => handleEndPeriod(logs[0])}
                    className="w-full py-2.5 rounded-xl text-[11px] font-mono bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition">
                    Mark Period Ended Today
                  </button>
                </div>
              )}

              {/* New period */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                <p className="text-[10px] font-mono tracking-widest text-white/30">LOG NEW PERIOD</p>

                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-1.5">START DATE</p>
                  <input type="date" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[12px] font-mono text-white/70 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.3)]" />
                </div>

                <div>
                  <p className="text-[9px] font-mono text-white/20 mb-2">FLOW LEVEL</p>
                  <div className="flex gap-1.5">
                    {FLOW_LEVELS.map((f) => (
                      <button key={f.value} onClick={() => setFlowLevel(f.value)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border transition ${flowLevel === f.value ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-white/[0.06] text-white/30"}`}>
                        <span className="text-[10px]">{"●".repeat(f.dots)}</span>
                        <span className="text-[8px] font-mono">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleLogPeriod}
                  className="w-full py-2.5 rounded-xl text-[11px] font-mono font-semibold bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.25)] transition">
                  Log Period Start
                </button>
              </div>

              {/* Cycle stats */}
              {insight && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <p className="text-[10px] font-mono tracking-widest text-white/30">CYCLE STATS</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                      <p className="text-[18px] font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{insight.cycleLength}</p>
                      <p className="text-[8px] font-mono text-white/25 mt-0.5">AVG CYCLE LENGTH</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                      <p className="text-[18px] font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{logs.length}</p>
                      <p className="text-[8px] font-mono text-white/25 mt-0.5">PERIODS LOGGED</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            <motion.div key="history" className="space-y-4" variants={tabContent} initial="hidden" animate="visible" exit="exit">
              {/* Period history */}
              <div>
                <p className="text-[9px] font-mono tracking-widest text-white/20 mb-2">PERIOD HISTORY</p>
                {logs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                    <Droplets size={24} className="mx-auto text-white/10 mb-2" />
                    <p className="text-[11px] text-white/25">No periods logged yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {logs.map((log) => {
                      const start = new Date(log.period_start + "T00:00:00");
                      const end = log.period_end ? new Date(log.period_end + "T00:00:00") : null;
                      const duration = end ? Math.round((end.getTime() - start.getTime()) / 86400000) + 1 : null;
                      const flowInfo = FLOW_LEVELS.find((f) => f.value === log.flow_level);
                      return (
                        <div key={log.id} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Droplets size={16} className="text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-mono text-white/60">
                              {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              {end && ` – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {duration && <span className="text-[9px] font-mono text-white/25">{duration}d</span>}
                              {flowInfo && <span className="text-[9px] font-mono text-red-400/60">{"●".repeat(flowInfo.dots)} {flowInfo.label}</span>}
                            </div>
                          </div>
                          {!log.period_end && (
                            <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">ACTIVE</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent symptom logs */}
              <div>
                <p className="text-[9px] font-mono tracking-widest text-white/20 mb-2">RECENT SYMPTOM LOGS</p>
                {symptoms.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                    <Brain size={24} className="mx-auto text-white/10 mb-2" />
                    <p className="text-[11px] text-white/25">No symptom logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {symptoms.slice(0, 14).map((s) => (
                      <div key={s.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-white/40">
                            {new Date(s.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <div className="flex items-center gap-2">
                            {s.energy_level && <span className="text-[9px] font-mono text-white/25">Energy {s.energy_level}/5</span>}
                            {s.mood && <span className="text-[9px] font-mono text-white/25">{s.mood}</span>}
                          </div>
                        </div>
                        {s.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.symptoms.map((sym) => (
                              <span key={sym} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">{sym}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
