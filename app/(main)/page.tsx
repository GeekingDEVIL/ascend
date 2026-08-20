"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Activity, Flame, Target, Zap, HeartPulse, Gauge, Trophy, Award, Bell, X, Medal, TrendingUp, Star } from "lucide-react";
import { supabase } from "../lib/supabase";
import { computeLevel, getRank, getNextRank } from "../lib/levelSystem";
import { useAuth } from "../lib/AuthProvider";

const HOLO_CLIP = "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))";

function GlassText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

function DividerWithHyphens() {
  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-[rgb(var(--accent-light-rgb)/0.5)] text-xs leading-none">–</span>
      <span className="h-px flex-1 bg-[rgb(var(--accent-rgb)/0.2)]" />
      <span className="text-[rgb(var(--accent-light-rgb)/0.5)] text-xs leading-none">–</span>
    </div>
  );
}

function SideLine({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[-10px] bottom-[-10px] ${side === "left" ? "-left-3" : "-right-3"} w-px hidden md:block`}
      style={{ background: "linear-gradient(to bottom, transparent, rgb(var(--accent-light-rgb) / 0.5) 50%, transparent)" }}
    />
  );
}

function GlowPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative w-full">
      <div className="relative p-[1.5px] rounded-md overflow-hidden">
        <style>{`@keyframes beamSpinSlow { to { transform: rotate(360deg); } }`}</style>
        <div
          className="absolute inset-[-60%] animate-[beamSpinSlow_10s_linear_infinite] opacity-60"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 5%, rgb(var(--accent-rgb)) 16%, rgb(var(--accent-light-rgb)) 24%, rgb(var(--accent-rgb)) 32%, transparent 45%, transparent 55%, rgb(var(--accent-rgb)) 68%, rgb(var(--accent-light-rgb)) 76%, rgb(var(--accent-rgb)) 84%, transparent 95%, transparent 100%)",
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

function HoloCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        clipPath: HOLO_CLIP,
        border: "1px solid rgb(var(--accent-rgb) / 0.4)",
        boxShadow: "0 0 22px -6px rgb(var(--accent-rgb) / 0.35)",
        background: "linear-gradient(135deg, rgba(10,21,36,0.9), rgba(10,21,36,0.75))",
      }}
    >
      <div className="w-12 shrink-0 flex items-center justify-center border-r text-[rgb(var(--accent-rgb))]" style={{ backgroundColor: "rgb(var(--accent-rgb) / 0.1)", borderColor: "rgb(var(--accent-rgb) / 0.2)" }}>
        {icon}
      </div>
      <div className="flex-1 p-3">
        <p className="text-xs font-bold text-white/85 tracking-wide mb-2">{label}</p>
        <div className="flex items-center justify-between rounded px-2.5 py-1.5" style={{ border: "1px solid rgb(var(--accent-rgb) / 0.2)", backgroundColor: "rgb(var(--accent-rgb) / 0.08)" }}>
          <span className="text-[10px] font-mono tracking-widest" style={{ color: "rgb(var(--accent-rgb) / 0.6)" }}>{sub ?? "VALUE"}</span>
          <GlassText className="text-base font-bold">{value}</GlassText>
        </div>
      </div>
    </div>
  );
}

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case "new_pr": return <Medal size={16} className="text-yellow-300" />;
    case "workout_complete": return <Trophy size={16} className="text-cyan-300" />;
    case "level_up": return <Star size={16} className="text-purple-300" />;
    case "streak_milestone": return <Flame size={16} className="text-orange-300" />;
    default: return <Bell size={16} className="text-white/50" />;
  }
}

function notifBorderColor(type: string): string {
  switch (type) {
    case "new_pr": return "border-yellow-400/30";
    case "workout_complete": return "border-cyan-400/20";
    case "level_up": return "border-purple-400/30";
    case "streak_milestone": return "border-orange-400/30";
    default: return "border-white/10";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function rankForLevel(level: number) {
  if (level >= 50) return { name: "PLATINUM", color: "text-cyan-200", border: "border-cyan-200/40", glow: "rgba(165,243,252,0.6)" };
  if (level >= 25) return { name: "GOLD", color: "text-yellow-300", border: "border-yellow-300/40", glow: "rgba(250,204,21,0.6)" };
  if (level >= 10) return { name: "SILVER", color: "text-slate-300", border: "border-slate-300/40", glow: "rgba(203,213,225,0.5)" };
  return { name: "BRONZE", color: "text-amber-500", border: "border-amber-500/40", glow: "rgba(217,119,6,0.5)" };
}

function RankBadge({ level }: { level: number }) {
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

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 font-mono text-sm text-white/70">
      <span className="text-[rgb(var(--accent-light-rgb))]">{icon}</span>
      <span className="text-white/40">{label}:</span>
      <GlassText className="font-bold text-base">{value}</GlassText>
    </div>
  );
}

type TodayPlan = { title: string; is_rest: boolean; count: number; sets: number; completed?: boolean };

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function Dashboard() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [time, setTime] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);

  const [stats, setStats] = useState({
    streak: 0, totalWorkouts: 0, weeklyVolume: 0, prCount: 0, totalXp: 0,
    strength: 0, endurance: 0, consistency: 0, discipline: 0,
    bodyWeight: null as number | null, bodyWeightChange: null as number | null,
    recoveryPct: null as number | null,
    fatigue: 0,
    goal: null as string | null,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  const levelInfo = computeLevel(stats.totalXp);
  const level = levelInfo.level;
  const rank = getRank(level);
  const nextRank = getNextRank(level);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoaded, setNotifLoaded] = useState(false);

  useEffect(() => {
    const updateClock = () => setTime(new Date().toLocaleTimeString());
    updateClock();
    const id = setInterval(updateClock, 1000);
    setToday(new Date().toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" }).toUpperCase());
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function checkOnboarding() {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("onboarding_completed_at").eq("id", user.id).maybeSingle();
      if (!data?.onboarding_completed_at) router.push("/onboarding");
    }
    checkOnboarding();
  }, [user]);

  useEffect(() => {
    async function loadToday() {
      if (!user) return;
      setTodayLoading(true);
      const dateStr = toDateString(new Date());
      const weekday = new Date().getDay();

      // Check if today's workout is already completed
      const { data: todaySession } = await supabase
        .from("workout_sessions")
        .select("id, total_sets, total_volume, xp_earned")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .eq("status", "completed")
        .maybeSingle();

      if (todaySession) {
        setTodayPlan({
          title: "Session Complete ✓",
          is_rest: false,
          count: 0,
          sets: todaySession.total_sets || 0,
          completed: true,
        } as any);
        setTodayLoading(false);
        return;
      }

      const { data: plan } = await supabase
        .from("recurring_plans")
        .select("template_id, is_rest, workout_templates(name)")
        .eq("user_id", user.id)
        .eq("weekday", weekday)
        .maybeSingle();

      if (!plan) {
        setTodayPlan(null);
        setTodayLoading(false);
        return;
      }

      if (plan.is_rest) {
        setTodayPlan({ title: "Rest / Recovery", is_rest: true, count: 0, sets: 0 });
        setTodayLoading(false);
        return;
      }

      if (plan.template_id) {
        const { data: te } = await supabase
          .from("workout_template_exercises")
          .select("target_sets")
          .eq("template_id", plan.template_id);
        const count = te?.length ?? 0;
        const sets = (te ?? []).reduce((s, e: any) => s + (e.target_sets || 0), 0);
        setTodayPlan({ title: (plan as any).workout_templates?.name || "Untitled Workout", is_rest: false, count, sets });
      } else {
        setTodayPlan(null);
      }
      setTodayLoading(false);
    }
    loadToday();
  }, [user]);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      // Fast cache
      const { data: c } = await supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle();
      if (c) {
        const [{ data: wl }, { data: ls }, { data: pd }] = await Promise.all([
          supabase.from("body_weight_logs").select("weight, logged_at").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(2),
          supabase.from("workout_sessions").select("completed_at").eq("user_id", user.id).eq("status", "completed").order("completed_at", { ascending: false }).limit(1),
          supabase.from("profiles").select("goal").eq("id", user.id).maybeSingle(),
        ]);
        let bw: number | null = null, bwc: number | null = null, rp: number | null = null;
        if (wl?.length) { bw = Number(wl[0].weight); if (wl.length > 1) bwc = Number((wl[0].weight - wl[1].weight).toFixed(1)); }
        if (ls?.[0]?.completed_at) rp = Math.min(100, Math.round(((Date.now() - new Date(ls[0].completed_at).getTime()) / 3600000) / 48 * 100));
        const sk = c.current_streak ?? 0;
        setStats({ streak: sk, totalWorkouts: c.total_workouts ?? 0, weeklyVolume: Math.round(Number(c.total_volume) || 0), prCount: c.achievement_count ?? 0, totalXp: c.total_xp ?? 0, strength: 50, endurance: 0, consistency: Math.min(100, Math.round((sk / 30) * 100)), discipline: 70, bodyWeight: bw, bodyWeightChange: bwc, recoveryPct: rp, fatigue: rp !== null ? Math.max(0, 100 - rp) : 0, goal: pd?.goal ?? null });
        setStatsLoaded(true);
        return;
      }
      const dateStr = toDateString(new Date());

      // 1. Total completed workouts
      const { count: totalWorkouts } = await supabase
        .from("workout_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed");

      // 2. Current streak — consecutive days with completed sessions going backwards from today
      let streak = 0;
      if ((totalWorkouts ?? 0) > 0) {
        const { data: sessions } = await supabase
          .from("workout_sessions")
          .select("date")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("date", { ascending: false })
          .limit(60);

        if (sessions && sessions.length > 0) {
          const completedDates = new Set(sessions.map((s: any) => s.date));

          // Also load recurring plans to know which days are rest days (rest days don't break streaks)
          const { data: plans } = await supabase
            .from("recurring_plans")
            .select("weekday, is_rest")
            .eq("user_id", user.id);
          const restWeekdays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));

          const checkDate = new Date(dateStr + "T00:00:00");
          // If today has no completed session yet and it's not a rest day, start from yesterday
          const todayWeekday = checkDate.getDay();
          if (!completedDates.has(dateStr) && !restWeekdays.has(todayWeekday)) {
            checkDate.setDate(checkDate.getDate() - 1);
          }

          for (let i = 0; i < 60; i++) {
            const d = toDateString(checkDate);
            const wd = checkDate.getDay();
            if (restWeekdays.has(wd)) {
              // Rest day — doesn't break streak, doesn't add to it
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
            if (completedDates.has(d)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }

      // 3. Weekly volume — total weight × reps this week (Monday to now)
      const now = new Date(dateStr + "T00:00:00");
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const mondayStr = toDateString(monday);

      let weeklyVolume = 0;
      const { data: weekSessions } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("date", mondayStr);

      if (weekSessions && weekSessions.length > 0) {
        const sessionIds = weekSessions.map((s: any) => s.id);
        const { data: setLogs } = await supabase
          .from("exercise_set_logs")
          .select("weight, reps")
          .in("workout_session_id", sessionIds);
        weeklyVolume = (setLogs ?? []).reduce((sum, l: any) => sum + ((Number(l.weight) || 0) * (Number(l.reps) || 0)), 0);
      }

      // 4. PR count — number of distinct exercises where user has established a best weight
      let prCount = 0;
      const { data: prData } = await supabase
        .from("exercise_set_logs")
        .select("exercise_id, weight")
        .eq("user_id", user.id)
        .gt("weight", 0);

      if (prData && prData.length > 0) {
        const exerciseIds = new Set(prData.map((r: any) => r.exercise_id));
        prCount = exerciseIds.size;
      }

      // 5. Total XP
      let totalXp = 0;
      const { data: xpData } = await supabase
        .from("workout_sessions")
        .select("xp_earned")
        .eq("user_id", user.id)
        .eq("status", "completed");
      totalXp = (xpData ?? []).reduce((sum, s: any) => sum + (s.xp_earned || 0), 0);

      // 6. Discipline — average completion rate across last 10 sessions
      let discipline = 0;
      const { data: recentSessions } = await supabase
        .from("workout_sessions")
        .select("total_sets")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: false })
        .limit(10);
      if (recentSessions && recentSessions.length > 0) {
        // Get planned sets for comparison
        const { data: planData } = await supabase
          .from("recurring_plans")
          .select("template_id, is_rest")
          .eq("user_id", user.id);
        const templateIds = (planData ?? []).filter((p: any) => !p.is_rest && p.template_id).map((p: any) => p.template_id);
        let avgPlannedSets = 20; // default fallback
        if (templateIds.length > 0) {
          const { data: templateSets } = await supabase
            .from("workout_template_exercises")
            .select("target_sets")
            .in("template_id", templateIds);
          const totalPlanned = (templateSets ?? []).reduce((s, t: any) => s + (t.target_sets || 0), 0);
          avgPlannedSets = Math.max(1, Math.round(totalPlanned / Math.max(1, templateIds.length)));
        }
        const avgCompleted = recentSessions.reduce((s, r: any) => s + (r.total_sets || 0), 0) / recentSessions.length;
        discipline = Math.min(100, Math.round((avgCompleted / avgPlannedSets) * 100));
      }

      // 7. Consistency — streak as a percentage (cap at 30 days = 100%)
      const consistency = Math.min(100, Math.round((streak / 30) * 100));

      // 8. Strength — based on volume progression (this week vs last week)
      let strength = 0;
      const lastWeekMonday = new Date(monday);
      lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
      const lastWeekMondayStr = toDateString(lastWeekMonday);
      const { data: lastWeekSessions } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("date", lastWeekMondayStr)
        .lt("date", mondayStr);
      if (lastWeekSessions && lastWeekSessions.length > 0) {
        const lwIds = lastWeekSessions.map((s: any) => s.id);
        const { data: lwLogs } = await supabase.from("exercise_set_logs").select("weight, reps").in("workout_session_id", lwIds);
        const lastWeekVol = (lwLogs ?? []).reduce((s, l: any) => s + ((Number(l.weight) || 0) * (Number(l.reps) || 0)), 0);
        if (lastWeekVol > 0) {
          const progression = ((weeklyVolume - lastWeekVol) / lastWeekVol) * 100;
          strength = Math.min(100, Math.max(0, Math.round(50 + progression * 2)));
        } else {
          strength = weeklyVolume > 0 ? 50 : 0;
        }
      } else {
        strength = weeklyVolume > 0 ? 50 : 0;
      }

      // 9. Endurance — total cardio minutes this week
      let endurance = 0;
      if (weekSessions && weekSessions.length > 0) {
        const wsIds = weekSessions.map((s: any) => s.id);
        const { data: cardioLogs } = await supabase
          .from("exercise_set_logs")
          .select("duration_seconds, exercises!inner(body_segment)")
          .in("workout_session_id", wsIds)
          .eq("exercises.body_segment", "Cardio");
        const totalCardioMins = (cardioLogs ?? []).reduce((s, l: any) => s + ((l.duration_seconds || 0) / 60), 0);
        endurance = Math.min(100, Math.round(totalCardioMins / 1.5)); // 150 min/week = 100%
      }

      // 10. Body weight — latest log
      let bodyWeight: number | null = null;
      let bodyWeightChange: number | null = null;
      const { data: weightLogs } = await supabase
        .from("body_weight_logs")
        .select("weight, logged_at")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(2);
      if (weightLogs && weightLogs.length > 0) {
        bodyWeight = weightLogs[0].weight;
        if (weightLogs.length > 1) {
          bodyWeightChange = Number((weightLogs[0].weight - weightLogs[1].weight).toFixed(1));
        }
      }

      // 11. Recovery — hours since last workout, simplified
      let recoveryPct: number | null = null;
      const { data: lastSession } = await supabase
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);
      if (lastSession && lastSession.length > 0 && lastSession[0].completed_at) {
        const hoursSince = (Date.now() - new Date(lastSession[0].completed_at).getTime()) / (1000 * 60 * 60);
        recoveryPct = Math.min(100, Math.round((hoursSince / 48) * 100));
      }

      // 12. Fatigue — inverse of recovery, weighted by recent volume
      const fatigue = recoveryPct !== null ? Math.max(0, 100 - recoveryPct) : 0;

      // 13. Goal
      const { data: profileData } = await supabase
        .from("profiles")
        .select("goal")
        .eq("id", user.id)
        .maybeSingle();

      setStats({
        streak, totalWorkouts: totalWorkouts ?? 0, weeklyVolume: Math.round(weeklyVolume), prCount, totalXp,
        strength, endurance, consistency, discipline,
        bodyWeight, bodyWeightChange,
        recoveryPct,
        fatigue,
        goal: profileData?.goal ?? null,
      });
      setStatsLoaded(true);
    }
    loadStats();
  }, [user]);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(data ?? []);
      setNotifLoaded(true);
    }
    loadNotifications();
  }, [user]);

  async function dismissNotification(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function dismissAllNotifications() {
    if (!user || notifications.length === 0) return;
    const ids = notifications.map((n) => n.id);
    await supabase.from("notifications").update({ read: true }).in("id", ids);
    setNotifications([]);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleTodayAction() {
    if (todayPlan?.completed) {
      router.push("/progress");
    } else if (!todayPlan || todayPlan.is_rest || todayPlan.count === 0) {
      router.push("/schedule");
    } else {
      router.push("/workout");
    }
  }

  const estMinutes = todayPlan ? todayPlan.sets * 3 : 0;

  return (
    <main className="relative min-h-screen bg-[#050914] text-white p-6 md:p-10 pb-24 md:pb-10 overflow-hidden">
      <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-[rgb(var(--accent-rgb)/0.1)] rounded-full blur-[130px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-end gap-3">
          <div
            className="flex items-center gap-4 rounded-md border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.05] backdrop-blur-xl px-5 py-2.5 text-xs"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}
          >
            <div className="text-right font-mono">
              <p className="text-white/40 tracking-widest">LOCAL TIME</p>
              <GlassText className="text-sm">{time ?? "--:--:--"}</GlassText>
            </div>
            <span className="w-px h-6 bg-white/10" />
            <span className="font-mono text-white/50">RANK: <GlassText className={`font-bold ${rank.color}`}>{rank.name}</GlassText></span>
            {nextRank && (
              <span className="hidden sm:block text-[9px] font-mono text-white/25 mt-1">Next: {nextRank.name} at Level {nextRank.minLevel}</span>
            )}
            <span className="font-mono text-white/50">LVL <GlassText className="font-bold">{statsLoaded ? level : 1}</GlassText></span>
            <button onClick={() => router.push("/notifications")} className="relative text-white/50 hover:text-[rgb(var(--accent-light-rgb))] transition">
              <Bell size={16} />
              {notifLoaded && notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[rgb(var(--accent-rgb))] text-black text-[8px] font-bold flex items-center justify-center">{notifications.length}</span>
              )}
            </button>
            <span className="w-8 h-8 rounded-md bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-light-rgb)/0.3)] flex items-center justify-center text-[rgb(var(--accent-light-rgb))] font-bold overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (profile?.username?.[0] ?? "?").toUpperCase()
              )}
            </span>
          </div>
          <button onClick={handleSignOut} className="text-xs font-mono text-white/40 hover:text-white/70 transition">
            Sign Out
          </button>
        </div>

        {/* HEADER */}
        <div>
          <GlassText className="text-xl md:text-2xl font-bold tracking-wide">
            WELCOME, {(profile?.username ?? "OPERATOR").toUpperCase()}
          </GlassText>
          <p className="text-white/40 text-sm mt-0.5">Your daily command center.</p>
        </div>

        {/* TODAY'S WORKOUT */}
        <GlowPanel>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs tracking-widest text-[rgb(var(--accent-light-rgb))] mb-1">TODAY · {today ?? "———"}</p>

              {todayLoading ? (
                <h2 className="text-lg font-bold text-white/40">LOADING...</h2>
              ) : !todayPlan ? (
                <>
                  <h2 className="text-lg font-bold text-white/90">NO WORKOUT PLANNED</h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">Head to Schedule to plan today's session.</p>
                </>
              ) : todayPlan.completed ? (
                <>
                  <h2 className="text-lg font-bold text-white/90">SESSION COMPLETE ✓</h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">{todayPlan.sets} sets completed today.</p>
                </>
              ) : todayPlan.is_rest ? (
                <>
                  <h2 className="text-lg font-bold text-white/90">REST / RECOVERY</h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">Recovery is part of the plan too.</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-white/90">{todayPlan.title.toUpperCase()}</h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">
                    {todayPlan.count} EXERCISE{todayPlan.count === 1 ? "" : "S"} · {todayPlan.sets} SETS · ~{estMinutes} MIN
                  </p>
                </>
              )}
            </div>
            <button
              onClick={handleTodayAction}
              className="shrink-0 rounded-md bg-[rgb(var(--accent-rgb))] text-black font-bold text-sm font-mono tracking-widest px-6 py-3 hover:bg-[rgb(var(--accent-light-rgb))] transition"
              style={{ boxShadow: "0 0 25px -4px rgb(var(--accent-rgb) / 0.6)" }}
            >
              {todayPlan?.completed ? "VIEW PROGRESS" : todayPlan?.is_rest || !todayPlan || todayPlan.count === 0 ? "GO TO SCHEDULE" : "INITIATE WORKOUT"}
            </button>
          </div>
        </GlowPanel>

        {/* STATUS */}
        <GlowPanel>
          <h2 className="text-center text-base font-bold tracking-wide text-[rgb(var(--accent-light-rgb))]">STATUS</h2>
          <DividerWithHyphens />
          <div className="flex items-center justify-center gap-10 mb-4">
            <div className="text-center">
              <GlassText className="text-6xl font-bold">{statsLoaded ? level : "—"}</GlassText>
              <p className="text-xs tracking-widest text-white/40 mt-2">LEVEL</p>
            </div>
            <div className="text-xs font-mono text-white/60 space-y-2">
              <p>GOAL: {stats.goal ? (
                <span className="text-white/90">{stats.goal}</span>
              ) : (
                <button onClick={() => router.push("/profile")} className="text-[rgb(var(--accent-light-rgb)/0.7)] hover:text-[rgb(var(--accent-light-rgb))] underline underline-offset-2 transition">Set Goal →</button>
              )}</p>
              <p>RANK: <span className={`font-bold ${rank.color}`}>{rank.name}</span></p>
              {nextRank && <p className="text-[9px] text-white/25">Next: {nextRank.name} at Level {nextRank.minLevel}</p>}
              <span
                className={`inline-flex items-center gap-1.5 border ${rank.border} ${rank.bgClass} px-3 py-1 rounded-md text-[10px] font-mono tracking-widest ${rank.color}`}
                style={{ boxShadow: `0 0 12px -2px ${rank.glow}` }}
              >
                <Award size={12} />
                {rank.name}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6 border-y border-white/10 py-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[rgb(var(--accent-light-rgb))]" />
              <div className="relative w-28 md:w-36 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all`} style={{ width: `${Math.min(100, levelInfo.progress * 100)}%`, background: `linear-gradient(90deg, rgb(var(--accent-rgb) / 0.8), rgb(var(--accent-rgb) / 1))`, boxShadow: "0 0 6px rgb(var(--accent-rgb) / 0.4)" }} />
              </div>
              <span className="text-[10px] font-mono text-white/40">
                {levelInfo.isMaxLevel ? "MAX" : `${levelInfo.xpIntoCurrentLevel}/${levelInfo.xpNeededForNext}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse size={14} className="text-emerald-300" />
              <div className="relative w-28 md:w-36 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-300 rounded-full transition-all" style={{ width: `${stats.recoveryPct ?? 0}%` }} />
              </div>
              <span className="text-[10px] font-mono text-white/40">{stats.recoveryPct ?? 0}/100</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white/50">
              <Gauge size={14} className="text-[rgb(var(--accent-light-rgb))]" />
              <span>FATIGUE: <span className="text-white/90 font-bold">{stats.fatigue}%</span></span>
              <span className="text-[8px] text-white/20 block mt-0.5">
                {stats.fatigue >= 80 ? "Recently trained — rest recommended" : stats.fatigue >= 50 ? "Partially recovered" : stats.fatigue > 0 ? "Mostly recovered" : "Fully rested"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full">
            <div className="text-center">
              <div className="relative w-full aspect-square max-w-[60px] mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(var(--accent-rgb) / 0.7)" strokeWidth="3" strokeDasharray={`${stats.strength * 0.97} 97`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">{stats.strength}</span>
              </div>
              <p className="text-[8px] font-mono text-white/40">STRENGTH</p>
            </div>
            <div className="text-center">
              <div className="relative w-full aspect-square max-w-[60px] mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(52,211,153,0.7)" strokeWidth="3" strokeDasharray={`${stats.endurance * 0.97} 97`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">{stats.endurance}</span>
              </div>
              <p className="text-[8px] font-mono text-white/40">ENDURANCE</p>
            </div>
            <div className="text-center">
              <div className="relative w-full aspect-square max-w-[60px] mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(251,146,60,0.7)" strokeWidth="3" strokeDasharray={`${stats.consistency * 0.97} 97`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">{stats.consistency}</span>
              </div>
              <p className="text-[8px] font-mono text-white/40">CONSISTENCY</p>
            </div>
            <div className="text-center">
              <div className="relative w-full aspect-square max-w-[60px] mx-auto mb-1">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="3" strokeDasharray={`${stats.discipline * 0.97} 97`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">{stats.discipline}</span>
              </div>
              <p className="text-[8px] font-mono text-white/40">DISCIPLINE</p>
            </div>
          </div>
        </GlowPanel>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HoloCard icon={<Flame size={18} />} label="Streak" value={statsLoaded ? String(stats.streak) : "—"} sub="DAYS" />
          <HoloCard icon={<Activity size={18} />} label="Workouts" value={statsLoaded ? String(stats.totalWorkouts) : "—"} sub="COMPLETED" />
          <HoloCard icon={<Zap size={18} />} label="Weekly Vol" value={statsLoaded ? `${stats.weeklyVolume.toLocaleString()} KG` : "—"} sub="THIS WEEK" />
          <HoloCard icon={<Trophy size={18} />} label="PRs" value={statsLoaded ? String(stats.prCount) : "—"} sub="EXERCISES" />
        </div>

        {/* SECONDARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HoloCard
            icon={<Dumbbell size={18} />}
            label="Body Weight"
            value={stats.bodyWeight !== null ? `${stats.bodyWeight} KG` : "— KG"}
            sub={stats.bodyWeightChange !== null ? `${stats.bodyWeightChange > 0 ? "+" : ""}${stats.bodyWeightChange} KG` : "NO DATA"}
          />
          <div>
            <HoloCard
              icon={<HeartPulse size={18} />}
              label="Recovery"
              value={stats.recoveryPct !== null ? `${stats.recoveryPct}%` : "— %"}
              sub={stats.recoveryPct !== null ? (stats.recoveryPct >= 80 ? "READY TO TRAIN" : stats.recoveryPct >= 50 ? "MODERATE — PROCEED WITH CARE" : "FATIGUED — REST SUGGESTED") : "PENDING"}
            />
          </div>
        </div>

        {/* LIVE TELEMETRY */}
        <div>
          <p className="text-xs tracking-widest text-[rgb(var(--accent-light-rgb))] mb-3">LIVE TELEMETRY</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-md border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.05] backdrop-blur-2xl px-5 py-5"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px -8px rgb(var(--accent-rgb) / 0.15)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs tracking-widest text-white/50">WEIGHT TREND</p>
                <span className="text-[10px] font-mono text-white/40">{stats.bodyWeight !== null ? `${stats.bodyWeight} KG` : "NO LOGS"}</span>
              </div>
              <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-md">
                {stats.bodyWeight !== null ? (
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono text-white/90">{stats.bodyWeight} <span className="text-sm text-white/40">KG</span></p>
                    {stats.bodyWeightChange !== null && (
                      <p className={`text-xs font-mono mt-1 ${stats.bodyWeightChange > 0 ? "text-orange-300" : stats.bodyWeightChange < 0 ? "text-emerald-300" : "text-white/40"}`}>
                        {stats.bodyWeightChange > 0 ? "↑" : stats.bodyWeightChange < 0 ? "↓" : "→"} {Math.abs(stats.bodyWeightChange)} KG from previous
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-white/40 text-center px-4">No weight logs yet — log your body weight before a workout.</p>
                )}
              </div>
            </div>
            <div
              className="rounded-md border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.05] backdrop-blur-2xl px-5 py-5"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px -8px rgb(var(--accent-rgb) / 0.15)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs tracking-widest text-white/50">CALORIE INTELLIGENCE</p>
                <span className="text-[10px] font-mono text-white/30">COMING SOON</span>
              </div>
              <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-md">
                <p className="text-xs font-mono text-white/30 text-center px-4">Calorie tracking will be available in a future update.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div><p className="text-[10px] text-white/40">CONSUMED</p><GlassText className="text-xl font-bold">—</GlassText><p className="text-[10px] text-white/40">KCAL</p></div>
                <div><p className="text-[10px] text-white/40">TRAINING</p><GlassText className="text-xl font-bold">—</GlassText><p className="text-[10px] text-white/40">KCAL EST.</p></div>
                <div><p className="text-[10px] text-white/40">NET</p><GlassText className="text-xl font-bold">—</GlassText><p className="text-[10px] text-white/40">KCAL</p></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono border-t border-white/10 pt-3">
              <span className="text-white/40">WEIGHT DATA</span><span className="text-emerald-300">LINKED</span>
            </div>
          </div>
        </div>
      </div>

    </main >
  );
}