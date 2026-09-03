"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dumbbell, Play, Check, Calendar, Activity, Swords, Wind,
  PersonStanding, ChevronRight, Lock,
} from "lucide-react";
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
import type { ModuleKey } from "../../lib/modules";

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
  { key: "running", href: "/running", label: "Running", desc: "GPS pace & splits", icon: Activity, colorRgb: "249 115 22", module: "running", comingSoon: true },
  { key: "calisthenics", href: "/calisthenics", label: "Calisthenics", desc: "Bodyweight skills", icon: PersonStanding, colorRgb: "139 92 246", module: "calisthenics", comingSoon: true },
  { key: "martial-arts", href: "/martial-arts", label: "Martial Arts", desc: "Striking & grappling", icon: Swords, colorRgb: "239 68 68", module: "martial_arts", comingSoon: true },
  { key: "yoga", href: "/yoga", label: "Yoga", desc: "Flows & flexibility", icon: Wind, colorRgb: "236 72 153", module: "yoga", comingSoon: true },
];

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TrainHub() {
  const router = useRouter();
  const { user } = useAuth();
  const { enabledKeys } = useModules();
  const { sex: userSex } = useSex();

  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);
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
  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIdx = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const visibleMethods = METHODS.filter(
    (m) => !m.module || enabledKeys.includes(m.module),
  );

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

        {/* Today's Workout — hero card */}
        {todayLoading ? (
          <motion.div variants={staggerItem} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/[0.06] shimmer" />
                <div className="h-3 w-48 rounded bg-white/[0.04] shimmer" />
              </div>
            </div>
          </motion.div>
        ) : todayPlan?.completed ? (
          <motion.div variants={staggerItem} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">{todayPlan.title}</p>
                <p className="text-[10px] font-mono text-white/30">
                  {formatClock(todayPlan.duration || 0)} · {todayPlan.sets} sets
                  {todayPlan.todaySessions && todayPlan.todaySessions.length > 1
                    ? ` · ${todayPlan.todaySessions.length} sessions`
                    : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-[rgb(var(--accent-rgb))]">
                  +{todayPlan.todaySessions
                    ? todayPlan.todaySessions.reduce((a, s) => a + s.xp, 0)
                    : todayPlan.xp || 0} XP
                </p>
                <p className="text-[9px] font-mono text-white/20">
                  {Math.round(kgToUnit(
                    todayPlan.todaySessions
                      ? todayPlan.todaySessions.reduce((a, s) => a + s.volume, 0)
                      : todayPlan.volume || 0,
                    weightUnit,
                  )).toLocaleString()} {weightUnit}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {(todayPlan.todaySessions?.length ?? 1) >= MAX_SESSIONS_PER_DAY ? (
                <p className="flex-1 text-[10px] font-mono py-2.5 text-center text-white/20">
                  Daily limit reached ({MAX_SESSIONS_PER_DAY}/{MAX_SESSIONS_PER_DAY})
                </p>
              ) : (
                <button
                  onClick={() => router.push("/workout")}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-mono py-2.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 transition"
                >
                  <Play size={10} fill="currentColor" />
                  Another session ({(todayPlan.todaySessions?.length ?? 1)}/{MAX_SESSIONS_PER_DAY})
                </button>
              )}
              <button
                onClick={() => router.push("/progress")}
                className="flex-1 text-[11px] font-mono font-semibold py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition"
              >
                View Progress
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerItem}
            className="glass-card p-5 cursor-pointer"
            onClick={() => {
              if (!todayPlan || todayPlan.is_rest) router.push("/schedule");
              else router.push("/workout");
            }}
          >
            {!todayPlan ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Calendar size={18} className="text-white/25" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/70">No Workout Planned</p>
                  <p className="text-[10px] font-mono text-white/25">Tap to set up your schedule</p>
                </div>
                <ChevronRight size={14} className="text-white/15" />
              </div>
            ) : todayPlan.is_rest ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                  <span className="text-lg">😴</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/70">Rest Day</p>
                  <p className="text-[10px] font-mono text-white/25">Recovery is part of the plan</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(139 92 246 / 0.12)", border: "1px solid rgb(139 92 246 / 0.2)" }}
                >
                  <Dumbbell size={18} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90">{todayPlan.title}</p>
                  <p className="text-[10px] font-mono text-white/30">
                    {todayPlan.count} exercises · ~{estMinutes} min
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push("/workout"); }}
                  className="px-5 py-2 rounded-lg bg-[rgb(var(--accent-rgb))] text-black text-xs font-bold hover:brightness-110 transition"
                >
                  BEGIN
                </button>
              </div>
            )}

            {/* Schedule link inside the card */}
            {todayPlan && !todayPlan.is_rest && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push("/schedule"); }}
                className="mt-3 pt-3 border-t border-white/[0.04] w-full flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/25 hover:text-white/50 transition"
              >
                <Calendar size={11} />
                Edit Schedule
              </button>
            )}
          </motion.div>
        )}

        {/* This Week — compact inline */}
        {loaded && (
          <motion.div variants={staggerItem} className="glass-card p-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1 flex-1">
                {DAY_LABELS.map((day, i) => {
                  const isToday = i === todayDayIdx;
                  const done = weekDays[i];
                  return (
                    <div
                      key={`${day}-${i}`}
                      className={`flex-1 py-1.5 rounded text-center text-[9px] font-mono font-semibold transition-colors
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
              <p className="text-[10px] font-mono text-white/25 shrink-0">
                {weekDays.filter(Boolean).length}/7
              </p>
            </div>
          </motion.div>
        )}

        {/* Other Training Methods — 2-col grid */}
        {visibleMethods.length > 0 && (
          <motion.div variants={staggerItem}>
            <p className="text-[9px] font-mono tracking-widest text-white/25 mb-2.5 px-0.5">MORE TRAINING</p>
            <div className="grid grid-cols-2 gap-2">
              {visibleMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.key}
                    onClick={() => { if (!method.comingSoon) router.push(method.href); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition text-center ${
                      method.comingSoon
                        ? "border-white/[0.04] opacity-40 cursor-default"
                        : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] cursor-pointer active:scale-[0.97]"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `rgb(${method.colorRgb} / ${method.comingSoon ? 0.05 : 0.1})`,
                        border: `1px solid rgb(${method.colorRgb} / ${method.comingSoon ? 0.08 : 0.15})`,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: method.comingSoon ? `rgb(${method.colorRgb} / 0.3)` : `rgb(${method.colorRgb})` }}
                      />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${method.comingSoon ? "text-white/25" : "text-white/70"}`}>
                        {method.label}
                      </p>
                      <p className="text-[9px] font-mono text-white/15 mt-0.5">{method.desc}</p>
                    </div>
                    {method.comingSoon && (
                      <span className="text-[7px] font-mono tracking-widest text-white/15 uppercase">Coming Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

      </motion.div>
    </main>
  );
}
