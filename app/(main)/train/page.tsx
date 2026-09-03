"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Play, Check } from "lucide-react";
import { motion } from "framer-motion";
import SwipeNav from "../../components/ui/swipe-nav";
import { getTrainSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import { useAuth } from "../../lib/AuthProvider";
import { useSex } from "../../lib/useSex";
import { supabase } from "../../lib/supabase";
import { staggerContainer, staggerItem } from "../../lib/motion";
import { useUnits } from "../../lib/useUnits";
import { kgToUnit } from "../../lib/units";

type CompletedSession = {
  id: string;
  duration: number;
  sets: number;
  volume: number;
  xp: number;
};

type TodayPlan = {
  title: string;
  is_rest: boolean;
  count: number;
  sets: number;
  completed?: boolean;
  duration?: number;
  volume?: number;
  xp?: number;
  todaySessions?: CompletedSession[];
};

const MAX_SESSIONS_PER_DAY = 3;

type RecentSession = {
  id: string;
  date: string;
  template_name: string | null;
  total_sets: number;
};

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function relativeDate(dateStr: string): string {
  const today = toDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = toDateString(yesterday);
  if (dateStr === today) return "Today";
  if (dateStr === yStr) return "Yesterday";
  const diff = Math.floor((Date.now() - new Date(dateStr + "T00:00:00").getTime()) / 86400000);
  return `${diff}d ago`;
}

export default function TrainHub() {
  const router = useRouter();
  const { user } = useAuth();
  const { enabledKeys } = useModules();
  const { sex: userSex } = useSex();

  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [recent, setRecent] = useState<RecentSession[]>([]);
  const [weekDays, setWeekDays] = useState<boolean[]>(new Array(7).fill(false));
  const [loaded, setLoaded] = useState(false);
  const weightUnit = useUnits();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      const dateStr = toDateString(new Date());
      const weekday = new Date().getDay();

      const { data: completedSessions } = await supabase
        .from("workout_sessions")
        .select("id, title, total_sets, duration_seconds, total_volume, xp_earned")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .eq("sex", userSex)
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (completedSessions && completedSessions.length > 0) {
        const allSessions: CompletedSession[] = completedSessions.map((s: any) => ({
          id: s.id,
          duration: s.duration_seconds || 0,
          sets: s.total_sets || 0,
          volume: Number(s.total_volume) || 0,
          xp: s.xp_earned || 0,
        }));
        const latest: any = completedSessions[completedSessions.length - 1];
        setTodayPlan({
          title: latest.title || "Session Complete",
          is_rest: false,
          count: 0,
          sets: latest.total_sets || 0,
          completed: true,
          duration: latest.duration_seconds || 0,
          volume: Number(latest.total_volume) || 0,
          xp: latest.xp_earned || 0,
          todaySessions: allSessions,
        });
      } else {
        const { data: plan } = await supabase
          .from("recurring_plans")
          .select("template_id, is_rest, workout_templates(name)")
          .eq("user_id", user.id)
          .eq("weekday", weekday)
          .eq("sex", userSex)
          .maybeSingle();

        if (cancelled) return;

        if (!plan) {
          setTodayPlan(null);
        } else if (plan.is_rest) {
          setTodayPlan({ title: "Rest Day", is_rest: true, count: 0, sets: 0 });
        } else if (plan.template_id) {
          const { data: te } = await supabase
            .from("workout_template_exercises")
            .select("target_sets")
            .eq("template_id", plan.template_id);
          if (cancelled) return;
          const count = te?.length ?? 0;
          const sets = (te ?? []).reduce((s, e: any) => s + (e.target_sets || 0), 0);
          setTodayPlan({ title: (plan as any).workout_templates?.name || "Workout", is_rest: false, count, sets });
        } else {
          setTodayPlan(null);
        }
      }
      setTodayLoading(false);

      const { data: recentData } = await supabase
        .from("workout_sessions")
        .select("id, date, title, total_sets")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex)
        .order("date", { ascending: false })
        .limit(4);
      if (cancelled) return;
      setRecent(
        (recentData ?? []).map((s: any) => ({
          id: s.id,
          date: s.date,
          template_name: s.title ?? null,
          total_sets: s.total_sets ?? 0,
        })),
      );

      const now = new Date(dateStr + "T00:00:00");
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const mondayStr = toDateString(monday);

      const { data: weekSessions } = await supabase
        .from("workout_sessions")
        .select("date")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex)
        .gte("date", mondayStr);

      if (cancelled) return;
      const completedDates = new Set((weekSessions ?? []).map((s: any) => s.date));
      const days: boolean[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(completedDates.has(toDateString(d)));
      }
      setWeekDays(days);
      setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, [user, userSex]);

  const estMinutes = todayPlan ? todayPlan.sets * 3 : 0;
  const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const todayDayIdx = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();

  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white pb-24 md:pb-10 overflow-x-hidden">
      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto px-4 pt-4 space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={staggerItem} className="text-xl font-bold font-display text-white/90">
          Train
        </motion.h1>

        <motion.div variants={staggerItem}>
          <SwipeNav sections={getTrainSections(enabledKeys)} />
        </motion.div>

        {/* Hero: Start Workout / Completed Today */}
        {todayLoading ? (
          <motion.div variants={staggerItem} className="glass-card p-5 text-center">
            <div className="py-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] shimmer mx-auto" />
              <div className="h-5 w-36 rounded bg-white/[0.06] shimmer mx-auto" />
              <div className="h-3 w-48 rounded bg-white/[0.04] shimmer mx-auto" />
            </div>
          </motion.div>
        ) : todayPlan?.completed ? (
          <motion.div variants={staggerItem} className="glass-card p-5">
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check size={22} className="text-emerald-400" />
              </div>
              <p className="text-[9px] font-mono tracking-widest text-white/25 mb-1">COMPLETED TODAY</p>
              <p className="text-lg font-bold text-white/90">{todayPlan.title}</p>
            </div>

            {todayPlan.todaySessions && todayPlan.todaySessions.length > 1 ? (
              <div className="space-y-2 mb-4">
                {todayPlan.todaySessions.map((s, i) => (
                  <div key={s.id} className="glass-card p-3">
                    <p className="text-[8px] font-mono tracking-widest text-white/25 mb-2">SESSION {i + 1}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center"><p className="text-[8px] font-mono text-white/25">TIME</p><p className="text-sm font-bold font-mono text-white/80">{formatClock(s.duration)}</p></div>
                      <div className="text-center"><p className="text-[8px] font-mono text-white/25">SETS</p><p className="text-sm font-bold font-mono text-white/80">{s.sets}</p></div>
                      <div className="text-center"><p className="text-[8px] font-mono text-white/25">VOL</p><p className="text-sm font-bold font-mono text-white/80">{Math.round(kgToUnit(s.volume, weightUnit)).toLocaleString()}</p></div>
                      <div className="text-center"><p className="text-[8px] font-mono text-[rgb(var(--accent-rgb)/0.5)]">XP</p><p className="text-sm font-bold font-mono text-[rgb(var(--accent-rgb))]">+{s.xp}</p></div>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb)/0.05)] p-3">
                  <p className="text-[8px] font-mono tracking-widest text-[rgb(var(--accent-rgb)/0.5)] mb-2">TODAY&apos;S TOTAL</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-[8px] font-mono text-white/25">SESSIONS</p><p className="text-sm font-bold font-mono text-white/80">{todayPlan.todaySessions.length}</p></div>
                    <div><p className="text-[8px] font-mono text-white/25">TOTAL SETS</p><p className="text-sm font-bold font-mono text-white/80">{todayPlan.todaySessions.reduce((a, s) => a + s.sets, 0)}</p></div>
                    <div><p className="text-[8px] font-mono text-[rgb(var(--accent-rgb)/0.5)]">TOTAL XP</p><p className="text-sm font-bold font-mono text-[rgb(var(--accent-rgb))]">+{todayPlan.todaySessions.reduce((a, s) => a + s.xp, 0)}</p></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="glass-card px-3 py-2.5 text-center"><p className="text-[8px] font-mono tracking-widest text-white/25 mb-0.5">DURATION</p><p className="text-lg font-bold font-mono text-white/90">{formatClock(todayPlan.duration || 0)}</p></div>
                <div className="glass-card px-3 py-2.5 text-center"><p className="text-[8px] font-mono tracking-widest text-white/25 mb-0.5">SETS</p><p className="text-lg font-bold font-mono text-white/90">{todayPlan.sets}</p></div>
                <div className="glass-card px-3 py-2.5 text-center"><p className="text-[8px] font-mono tracking-widest text-white/25 mb-0.5">VOLUME</p><p className="text-lg font-bold font-mono text-white/90">{Math.round(kgToUnit(todayPlan.volume || 0, weightUnit)).toLocaleString()} {weightUnit}</p></div>
                <div className="glass-card px-3 py-2.5 text-center"><p className="text-[8px] font-mono tracking-widest text-[rgb(var(--accent-rgb)/0.5)] mb-0.5">XP EARNED</p><p className="text-lg font-bold font-mono text-[rgb(var(--accent-rgb))]">+{todayPlan.xp || 0}</p></div>
              </div>
            )}

            <p className="text-[10px] font-mono text-white/20 text-center mb-4">Nice work! You can start another session or come back tomorrow.</p>

            <div className="flex gap-2">
              <button onClick={() => router.push("/")} className="flex-1 text-sm font-medium py-3 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition">
                Dashboard
              </button>
              <button onClick={() => router.push("/progress")} className="flex-1 text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                View Progress
              </button>
            </div>
            {(todayPlan.todaySessions?.length ?? 1) >= MAX_SESSIONS_PER_DAY ? (
              <p className="w-full mt-2 text-[10px] font-mono py-2.5 text-center text-white/20">
                Daily session limit reached ({MAX_SESSIONS_PER_DAY}/{MAX_SESSIONS_PER_DAY})
              </p>
            ) : (
              <button
                onClick={() => router.push("/workout")}
                className="w-full mt-2 text-[10px] font-mono py-2.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15 transition"
              >
                Start another workout ({todayPlan.todaySessions?.length ?? 1}/{MAX_SESSIONS_PER_DAY})
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerItem}
            className="glass-card glass-card-interactive p-5 text-center cursor-pointer"
            onClick={() => {
              if (!todayPlan || todayPlan.is_rest) router.push("/schedule");
              else router.push("/workout");
            }}
          >
            {!todayPlan ? (
              <>
                <div className="text-4xl mb-3">🗓️</div>
                <p className="text-lg font-semibold text-white/80">No Workout Planned</p>
                <p className="text-xs text-white/30 mt-1">Tap to set up your schedule</p>
              </>
            ) : todayPlan.is_rest ? (
              <>
                <div className="text-4xl mb-3">😴</div>
                <p className="text-lg font-semibold text-white/80">Rest Day</p>
                <p className="text-xs text-white/30 mt-1">Recovery is part of the plan</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">💪</div>
                <p className="text-lg font-semibold text-white/90">Start Workout</p>
                <p className="text-xs text-white/35 mt-1">
                  {todayPlan.title} · {todayPlan.count} exercises · ~{estMinutes} min
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push("/workout"); }}
                  className="mt-4 px-8 py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black text-sm font-bold tracking-wide hover:brightness-110 transition"
                >
                  BEGIN SESSION
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Recent Sessions */}
        {loaded && recent.length > 0 && (
          <motion.div variants={staggerItem} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)]">RECENT SESSIONS</p>
              <button onClick={() => router.push("/progress")} className="text-[9px] font-mono text-[rgb(var(--accent-rgb)/0.5)] hover:text-[rgb(var(--accent-rgb))] transition">
                View All
              </button>
            </div>
            <div className="space-y-0.5">
              {recent.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 px-1">
                  <span className="text-sm text-white/70">{s.template_name || "Workout"}</span>
                  <span className="text-xs font-mono text-white/25">{relativeDate(s.date)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* This Week */}
        {loaded && (() => {
          const doneCount = weekDays.filter(Boolean).length;
          const weekPct = Math.round((doneCount / 7) * 100);
          const r = 28;
          const circ = 2 * Math.PI * r;
          const offset = circ - (weekPct / 100) * circ;
          return (
            <motion.div variants={staggerItem} className="glass-card p-4">
              <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-3">THIS WEEK</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-16 h-16 shrink-0">
                  <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                    <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white/80">
                    {doneCount}/7
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">{doneCount === 0 ? "No sessions yet" : `${doneCount} session${doneCount !== 1 ? "s" : ""} done`}</p>
                  <p className="text-[10px] font-mono text-white/25 mt-0.5">
                    {7 - doneCount} day{7 - doneCount !== 1 ? "s" : ""} remaining
                  </p>
                </div>
              </div>
              <div className="flex justify-between gap-1">
                {DAY_LABELS.map((day, i) => {
                  const isToday = i === todayDayIdx;
                  const done = weekDays[i];
                  return (
                    <div
                      key={day}
                      className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-mono font-semibold transition-colors
                        ${done
                          ? "bg-[rgb(var(--accent-rgb))] text-black"
                          : isToday
                            ? "border border-[rgb(var(--accent-rgb)/0.4)] text-[rgb(var(--accent-rgb))] border-dashed"
                            : "bg-white/[0.04] text-white/20"
                        }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

      </motion.div>
    </main>
  );
}
