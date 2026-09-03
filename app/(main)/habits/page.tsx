"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Flame, Plus, Check, Trash2, Zap, Star, Sparkles, Sun, Moon, Clock, Link, Dumbbell, Droplets, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import SwipeNav from "../../components/ui/swipe-nav";
import { getTrackSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import CubeLoader from "../../components/ui/cube-loader";
import { staggerContainer, staggerItem } from "../../lib/motion";
import OnboardingTooltip from "../../components/ui/onboarding-tooltip";

type Habit = {
  id: string;
  name: string;
  icon: string;
  color_rgb: string;
  xp_reward: number;
  sort_order: number;
  routine: "morning" | "evening" | "anytime";
  auto_source: string | null;
};

const AUTO_SOURCES = [
  { key: "workout_complete", label: "Workout", icon: Dumbbell, desc: "Auto-completes when you finish a workout" },
  { key: "water_goal", label: "Water Goal", icon: Droplets, desc: "Auto-completes when you hit your daily water goal" },
  { key: "weight_logged", label: "Weight Log", icon: Scale, desc: "Auto-completes when you log your weight" },
] as const;

const ROUTINES = [
  { key: "anytime", label: "Anytime", icon: Clock },
  { key: "morning", label: "Morning", icon: Sun },
  { key: "evening", label: "Evening", icon: Moon },
] as const;

type Completion = {
  habit_id: string;
  completed_date: string;
};

const HABIT_ICONS = ["💪", "🧘", "📖", "🏃", "💧", "🧠", "😴", "🥗", "🎯", "✅", "⏰", "🧹"];

const DIFFICULTIES = [
  { key: "easy", label: "Easy", xp: 5, color: "16 185 129", desc: "Quick wins" },
  { key: "medium", label: "Medium", xp: 10, color: "59 130 246", desc: "Steady effort" },
  { key: "hard", label: "Hard", xp: 20, color: "239 68 68", desc: "Real challenge" },
] as const;

const SUGGESTED_HABITS: { name: string; icon: string; difficulty: string; auto_source?: string }[] = [
  { name: "Daily Workout", icon: "💪", difficulty: "hard", auto_source: "workout_complete" },
  { name: "Hit Water Goal", icon: "💧", difficulty: "easy", auto_source: "water_goal" },
  { name: "Log Weight", icon: "⚖️", difficulty: "easy", auto_source: "weight_logged" },
  { name: "10 Min Stretch", icon: "🧘", difficulty: "easy" },
  { name: "8 Hours Sleep", icon: "😴", difficulty: "medium" },
  { name: "No Junk Food", icon: "🥗", difficulty: "hard" },
];

const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function getHeatmapDays(weeks: number): string[] {
  const days: string[] = [];
  const now = new Date();
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
}

export default function HabitsPage() {
  const { user } = useAuth();
  const { enabledKeys } = useModules();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("✅");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [newRoutine, setNewRoutine] = useState<"morning" | "evening" | "anytime">("anytime");
  const [newAutoSource, setNewAutoSource] = useState<string | null>(null);
  const [xpPop, setXpPop] = useState<string | null>(null);
  const [perfectDay, setPerfectDay] = useState(false);

  const today = useMemo(todayStr, []);
  const heatmapDays = useMemo(() => getHeatmapDays(12), []);

  const loadData = useCallback(async () => {
    if (!user) return;
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
    const [{ data: habitsData }, { data: compData }] = await Promise.all([
      supabase.from("habits").select("id, name, icon, color_rgb, xp_reward, sort_order, routine, auto_source")
        .eq("user_id", user.id).eq("archived", false).order("sort_order"),
      supabase.from("habit_completions").select("habit_id, completed_date")
        .eq("user_id", user.id).gte("completed_date", `${twelveWeeksAgo.getFullYear()}-${String(twelveWeeksAgo.getMonth() + 1).padStart(2, "0")}-${String(twelveWeeksAgo.getDate()).padStart(2, "0")}`),
    ]);
    setHabits(habitsData ?? []);
    setCompletions(compData ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const onFocus = () => { if (!loading) loadData(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadData, loading]);

  const completionSet = useMemo(() => {
    const s = new Set<string>();
    completions.forEach((c) => s.add(`${c.habit_id}:${c.completed_date}`));
    return s;
  }, [completions]);

  const todayCompleted = habits.filter((h) => completionSet.has(`${h.id}:${today}`)).length;
  const todayTotal = habits.length;
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  async function addHabit(name?: string, icon?: string, diff?: "easy" | "medium" | "hard", autoSource?: string) {
    if (!user) return;
    const habitName = name ?? newName.trim();
    const habitIcon = icon ?? newIcon;
    const difficulty = diff ?? newDifficulty;
    const source = autoSource ?? newAutoSource;
    if (!habitName) return;
    const xp = DIFFICULTIES.find((d) => d.key === difficulty)!.xp;
    const { data } = await supabase.from("habits").insert({
      user_id: user.id,
      name: habitName,
      icon: habitIcon,
      xp_reward: xp,
      routine: diff ? "anytime" : newRoutine,
      sort_order: habits.length,
      ...(source ? { auto_source: source } : {}),
    }).select("id, name, icon, color_rgb, xp_reward, sort_order, routine, auto_source").single();
    if (data) setHabits((prev) => [...prev, data]);
    setNewName("");
    setNewIcon("✅");
    setNewDifficulty("medium");
    setNewAutoSource(null);
    setShowAdd(false);
  }

  async function toggleHabit(habitId: string) {
    if (!user) return;
    const key = `${habitId}:${today}`;
    if (completionSet.has(key)) {
      await supabase.from("habit_completions").delete()
        .eq("habit_id", habitId).eq("completed_date", today);
      setCompletions((prev) => prev.filter((c) => !(c.habit_id === habitId && c.completed_date === today)));
    } else {
      await supabase.from("habit_completions").insert({
        habit_id: habitId, user_id: user.id, completed_date: today,
      });
      setCompletions((prev) => {
        const next = [...prev, { habit_id: habitId, completed_date: today }];
        const newCompleted = habits.filter((h) =>
          h.id === habitId || next.some((c) => c.habit_id === h.id && c.completed_date === today)
        ).length;
        if (newCompleted === habits.length && habits.length > 1) {
          setPerfectDay(true);
          setTimeout(() => setPerfectDay(false), 4000);
        }
        return next;
      });
      setXpPop(habitId);
      setTimeout(() => setXpPop(null), 1200);
    }
  }

  async function deleteHabit(habitId: string) {
    await supabase.from("habits").update({ archived: true }).eq("id", habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }

  function getHabitHeatmap(habitId: string): Map<string, boolean> {
    const map = new Map<string, boolean>();
    heatmapDays.forEach((d) => map.set(d, completionSet.has(`${habitId}:${d}`)));
    return map;
  }

  function getHabitStreak(habitId: string): number {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i <= 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (completionSet.has(`${habitId}:${dateStr}`)) streak++;
      else if (i > 0) break;
      else break;
    }
    return streak;
  }

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
        <SwipeNav sections={getTrackSections(enabledKeys)} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))]">Habits</h1>
            <p className="text-[11px] text-white/30 mt-0.5">Build consistency, earn XP</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-white/90">
              {todayCompleted}<span className="text-sm text-white/30">/{todayTotal}</span>
            </p>
            <p className="text-[9px] font-mono text-white/30">{todayPct}% today</p>
          </div>
        </div>

        {loading ? (
          <CubeLoader message="Loading habits…" />
        ) : (
          <>
            {/* Today's habits — grouped by routine */}
            {(["morning", "anytime", "evening"] as const).map((routineKey) => {
              const routineHabits = habits.filter((h) => h.routine === routineKey);
              if (routineHabits.length === 0) return null;
              const RoutineIcon = ROUTINES.find((r) => r.key === routineKey)!.icon;
              const routineLabel = ROUTINES.find((r) => r.key === routineKey)!.label;
              return (
                <div key={routineKey}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <RoutineIcon size={11} className="text-white/20" />
                    <p className="text-[9px] font-mono tracking-widest text-white/20">{routineLabel.toUpperCase()}</p>
                  </div>
                  <motion.div className="space-y-2 mb-4" variants={staggerContainer} initial="hidden" animate="visible">
                    {routineHabits.map((habit) => {
                const done = completionSet.has(`${habit.id}:${today}`);
                const streak = getHabitStreak(habit.id);
                const heatmap = getHabitHeatmap(habit.id);
                const isAuto = !!habit.auto_source;
                const autoInfo = AUTO_SOURCES.find((a) => a.key === habit.auto_source);
                return (
                  <motion.div
                    key={habit.id}
                    variants={staggerItem}
                    onClick={() => !isAuto && toggleHabit(habit.id)}
                    className={`rounded-xl border p-3 transition ${isAuto ? "" : "cursor-pointer active:scale-[0.98]"} ${
                      done ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition ${
                          done
                            ? "bg-emerald-500/20 border border-emerald-500/30"
                            : "bg-white/[0.03] border border-white/10"
                        }`}
                      >
                        {done ? <Check size={18} className="text-emerald-400" /> : <span className="text-lg">{habit.icon}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold truncate ${done ? "text-white/50 line-through" : "text-white/80"}`}>
                            {habit.name}
                          </p>
                          <span className="relative">
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400/70">
                              +{habit.xp_reward} XP
                            </span>
                            <AnimatePresence>
                              {xpPop === habit.id && (
                                <motion.span
                                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-400 whitespace-nowrap"
                                  initial={{ opacity: 1, y: 0 }}
                                  animate={{ opacity: 0, y: -16 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 1 }}
                                >
                                  +{habit.xp_reward} XP!
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[8px] font-mono text-orange-400/60">
                              <Flame size={9} /> {streak}d
                            </span>
                          )}
                          {isAuto ? (
                            <span className="flex items-center gap-0.5 text-[8px] font-mono text-cyan-400/50">
                              <Link size={8} /> {autoInfo?.label ?? "Auto"}
                            </span>
                          ) : !done && (
                            <span className="text-[8px] font-mono text-white/15">Tap to complete</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                        className="p-1.5 text-white/15 hover:text-red-400/50 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Mini heatmap */}
                    <div className="mt-2.5 flex gap-[2px] flex-wrap">
                      {heatmapDays.map((day) => (
                        <div
                          key={day}
                          className="w-[10px] h-[10px] rounded-[2px]"
                          style={{
                            background: heatmap.get(day)
                              ? `rgb(${habit.color_rgb} / 0.6)`
                              : "rgb(255 255 255 / 0.03)",
                          }}
                          title={day}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
                  </motion.div>
                </div>
              );
            })}

            {/* Impact Score */}
            {habits.length > 0 && (() => {
              const last7 = heatmapDays.slice(-7);
              const possible = habits.length * 7;
              const actual = last7.reduce((sum, day) =>
                sum + habits.filter((h) => completionSet.has(`${h.id}:${day}`)).length, 0);
              const impactScore = possible > 0 ? Math.round((actual / possible) * 100) : 0;
              const grade = impactScore >= 90 ? "S" : impactScore >= 75 ? "A" : impactScore >= 60 ? "B" : impactScore >= 40 ? "C" : "D";
              const gradeColor = impactScore >= 75 ? "16 185 129" : impactScore >= 50 ? "59 130 246" : "239 68 68";
              return (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-[9px] font-mono tracking-widest text-white/25 mb-2">HABIT IMPACT SCORE</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold font-mono"
                      style={{ background: `rgb(${gradeColor} / 0.1)`, border: `1px solid rgb(${gradeColor} / 0.3)`, color: `rgb(${gradeColor})` }}
                    >
                      {grade}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white/80">{impactScore}% consistency</p>
                      <p className="text-[10px] font-mono text-white/30 mt-0.5">{actual}/{possible} completions this week</p>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden mt-1.5">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${impactScore}%`, background: `linear-gradient(90deg, rgb(${gradeColor} / 0.4), rgb(${gradeColor} / 0.8))` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Add habit */}
            <AnimatePresence>
              {showAdd && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3 overflow-hidden"
                >
                  <p className="text-[9px] font-mono tracking-widest text-white/25">NEW HABIT</p>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Habit name…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-white/20"
                    maxLength={50}
                    onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition ${
                          newIcon === icon ? "bg-white/10 border border-white/20" : "bg-white/[0.02] border border-transparent hover:bg-white/[0.05]"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-white/20 mb-1.5">DIFFICULTY</p>
                    <div className="flex gap-1.5">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d.key}
                          onClick={() => setNewDifficulty(d.key as "easy" | "medium" | "hard")}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono text-center transition ${
                            newDifficulty === d.key
                              ? `border bg-[rgb(${d.color}/0.15)] border-[rgb(${d.color}/0.3)] text-white/80`
                              : "border border-white/[0.06] text-white/25 hover:text-white/40"
                          }`}
                        >
                          {d.label} (+{d.xp} XP)
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-white/20 mb-1.5">ROUTINE</p>
                    <div className="flex gap-1.5">
                      {ROUTINES.map((r) => {
                        const Icon = r.icon;
                        return (
                          <button
                            key={r.key}
                            onClick={() => setNewRoutine(r.key as "morning" | "evening" | "anytime")}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono text-center flex items-center justify-center gap-1 transition ${
                              newRoutine === r.key
                                ? "border bg-white/[0.08] border-white/20 text-white/80"
                                : "border border-white/[0.06] text-white/25 hover:text-white/40"
                            }`}
                          >
                            <Icon size={10} /> {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-mono text-white/20 mb-1.5">AUTO-COMPLETE <span className="text-white/10">(optional)</span></p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setNewAutoSource(null)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-center transition ${
                          newAutoSource === null
                            ? "border bg-white/[0.08] border-white/20 text-white/80"
                            : "border border-white/[0.06] text-white/25 hover:text-white/40"
                        }`}
                      >
                        Manual
                      </button>
                      {AUTO_SOURCES.map((a) => {
                        const Icon = a.icon;
                        return (
                          <button
                            key={a.key}
                            onClick={() => setNewAutoSource(a.key)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono text-center flex items-center justify-center gap-1 transition ${
                              newAutoSource === a.key
                                ? "border bg-cyan-500/[0.08] border-cyan-500/20 text-cyan-400/80"
                                : "border border-white/[0.06] text-white/25 hover:text-white/40"
                            }`}
                          >
                            <Icon size={10} /> {a.label}
                          </button>
                        );
                      })}
                    </div>
                    {newAutoSource && (
                      <p className="text-[8px] font-mono text-cyan-400/40 mt-1">{AUTO_SOURCES.find((a) => a.key === newAutoSource)?.desc}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addHabit()}
                      disabled={!newName.trim()}
                      className="flex-1 py-2 rounded-lg text-sm font-mono font-bold bg-[rgb(var(--accent-rgb)/0.2)] border border-[rgb(var(--accent-rgb)/0.3)] text-white/80 active:scale-95 transition disabled:opacity-30"
                    >
                      Add Habit
                    </button>
                    <button
                      onClick={() => setShowAdd(false)}
                      className="px-4 py-2 rounded-lg text-sm font-mono text-white/30 border border-white/10 active:scale-95 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <Plus size={16} /> Add habit
              </button>
              {habits.length === 0 && (
                <OnboardingTooltip id="habits-first" message="Start with a suggestion below, or create your own!" position="bottom" />
              )}
            </div>

            {/* Perfect Day celebration */}
            <AnimatePresence>
              {perfectDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-center"
                >
                  <Star size={28} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-sm font-bold text-amber-300">PERFECT DAY!</p>
                  <p className="text-[10px] font-mono text-amber-400/50 mt-1">All habits completed — bonus XP earned</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state with suggestions */}
            {habits.length === 0 && !showAdd && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Flame size={32} className="mx-auto mb-3 text-white/15" />
                  <p className="text-sm font-semibold text-white/25">NO HABITS YET</p>
                  <p className="text-xs text-white/20 mt-1">Add your first habit to start building streaks</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={12} className="text-amber-400/50" />
                    <p className="text-[9px] font-mono tracking-widest text-white/25">SUGGESTED HABITS</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTED_HABITS.map((s) => {
                      const diff = DIFFICULTIES.find((d) => d.key === s.difficulty)!;
                      return (
                        <button
                          key={s.name}
                          onClick={() => addHabit(s.name, s.icon, s.difficulty as "easy" | "medium" | "hard", s.auto_source)}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-left transition active:scale-95"
                        >
                          <span className="text-base">{s.icon}</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white/60 truncate">{s.name}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[8px] font-mono" style={{ color: `rgb(${diff.color} / 0.6)` }}>+{diff.xp} XP</p>
                              {s.auto_source && <span className="flex items-center gap-0.5 text-[7px] font-mono text-cyan-400/40"><Link size={7} />Auto</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Overall heatmap summary */}
            {habits.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[9px] font-mono tracking-widest text-white/25 mb-3">COMPLETION RATE — LAST 12 WEEKS</p>
                <div className="flex gap-[2px] flex-wrap">
                  {heatmapDays.map((day) => {
                    const completed = habits.filter((h) => completionSet.has(`${h.id}:${day}`)).length;
                    const ratio = todayTotal > 0 ? completed / todayTotal : 0;
                    return (
                      <div
                        key={day}
                        className="w-[10px] h-[10px] rounded-[2px]"
                        style={{
                          background: ratio === 0
                            ? "rgb(255 255 255 / 0.03)"
                            : ratio < 0.5
                              ? "rgb(var(--accent-rgb) / 0.2)"
                              : ratio < 1
                                ? "rgb(var(--accent-rgb) / 0.4)"
                                : "rgb(var(--accent-rgb) / 0.7)",
                        }}
                        title={`${day}: ${completed}/${todayTotal}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[8px] font-mono text-white/15">Less</span>
                  {[0.03, 0.2, 0.4, 0.7].map((op, i) => (
                    <div
                      key={i}
                      className="w-[10px] h-[10px] rounded-[2px]"
                      style={{
                        background: i === 0
                          ? `rgb(255 255 255 / ${op})`
                          : `rgb(var(--accent-rgb) / ${op})`,
                      }}
                    />
                  ))}
                  <span className="text-[8px] font-mono text-white/15">More</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
