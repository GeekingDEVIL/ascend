"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Activity, Flame, Zap, HeartPulse, Trophy, Award, Bell, ChevronRight, TrendingUp, Target, Play, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { computeLevel, getRank, getNextRank } from "../lib/levelSystem";
import { useAuth } from "../lib/AuthProvider";
import { getFullCalorieSummary, ageFromDOB, type CalorieSummary, type GoalType, type ActivityLevel, type DietPreference, type Sex } from "../lib/calorieEngine";
import { estimateObservedTdee, blendTdee } from "../lib/energyEstimator";
import { rematerializeDailyIntake } from "../lib/intakeLog";
import { Plus } from "lucide-react";
import { staggerContainer, staggerItem, fadeInUp } from "../lib/motion";
import { useSex } from "../lib/useSex";

type TodayPlan = { title: string; is_rest: boolean; count: number; sets: number; completed?: boolean };

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
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
  const [calorieSummary, setCalorieSummary] = useState<CalorieSummary | null>(null);
  const [todayIntake, setTodayIntake] = useState<{ kcal: number; protein_g: number; carbs_g: number; fat_g: number } | null>(null);
  const { sex: userSex } = useSex();
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [qlLabel, setQlLabel] = useState("");
  const [qlKcal, setQlKcal] = useState("");
  const [qlProtein, setQlProtein] = useState("");
  const [qlCarbs, setQlCarbs] = useState("");
  const [qlFat, setQlFat] = useState("");
  const [qlSaving, setQlSaving] = useState(false);

  useEffect(() => {
    const updateClock = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    updateClock();
    const id = setInterval(updateClock, 1000);
    setToday(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }));
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
    let cancelled = false;
    async function loadToday() {
      if (!user) return;
      setTodayLoading(true);
      const dateStr = toDateString(new Date());
      const weekday = new Date().getDay();

      const { data: todaySession } = await supabase
        .from("workout_sessions")
        .select("id, total_sets, total_volume, xp_earned")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .eq("sex", userSex)
        .eq("status", "completed")
        .limit(1);

      if (cancelled) return;

      if (todaySession && todaySession.length > 0) {
        setTodayPlan({
          title: "Session Complete",
          is_rest: false,
          count: 0,
          sets: todaySession[0].total_sets || 0,
          completed: true,
        });
        setTodayLoading(false);
        return;
      }

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
        if (cancelled) return;
        const count = te?.length ?? 0;
        const sets = (te ?? []).reduce((s, e: any) => s + (e.target_sets || 0), 0);
        setTodayPlan({ title: (plan as any).workout_templates?.name || "Untitled Workout", is_rest: false, count, sets });
      } else {
        setTodayPlan(null);
      }
      setTodayLoading(false);
    }
    loadToday();
    return () => { cancelled = true; };
  }, [user, userSex]);

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      if (!user) return;
      const { data: c } = await supabase.from("user_stats").select("*").eq("user_id", user.id).eq("sex", userSex).maybeSingle();
      if (cancelled) return;
      if (c) {
        const [{ data: wl }, { data: ls }, { data: pd }] = await Promise.all([
          supabase.from("body_weight_logs").select("weight, logged_at").eq("user_id", user.id).eq("sex", userSex).order("logged_at", { ascending: false }).limit(2),
          supabase.from("workout_sessions").select("completed_at").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).order("completed_at", { ascending: false }).limit(1),
          supabase.from("profile_body_stats").select("goal").eq("user_id", user.id).eq("sex", userSex).maybeSingle(),
        ]);
        let bw: number | null = null, bwc: number | null = null, rp: number | null = null;
        if (wl?.length) { bw = Number(wl[0].weight); if (wl.length > 1) bwc = Number((wl[0].weight - wl[1].weight).toFixed(1)); }
        if (ls?.[0]?.completed_at) rp = Math.min(100, Math.round(((Date.now() - new Date(ls[0].completed_at).getTime()) / 3600000) / 48 * 100));
        const sk = c.current_streak ?? 0;
        if (!cancelled) {
          setStats({ streak: sk, totalWorkouts: c.total_workouts ?? 0, weeklyVolume: Math.round(Number(c.total_volume) || 0), prCount: c.achievement_count ?? 0, totalXp: c.total_xp ?? 0, strength: 50, endurance: 0, consistency: Math.min(100, Math.round((sk / 30) * 100)), discipline: 70, bodyWeight: bw, bodyWeightChange: bwc, recoveryPct: rp, fatigue: rp !== null ? Math.max(0, 100 - rp) : 0, goal: pd?.goal ?? null });
          setStatsLoaded(true);
        }
        return;
      }
      const dateStr = toDateString(new Date());

      const { count: totalWorkouts } = await supabase
        .from("workout_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex);

      let streak = 0;
      if ((totalWorkouts ?? 0) > 0) {
        const { data: sessions } = await supabase
          .from("workout_sessions")
          .select("date")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .eq("sex", userSex)
          .order("date", { ascending: false })
          .limit(60);

        if (sessions && sessions.length > 0) {
          const completedDates = new Set(sessions.map((s: any) => s.date));
          const { data: plans } = await supabase
            .from("recurring_plans")
            .select("weekday, is_rest")
            .eq("user_id", user.id)
            .eq("sex", userSex);
          const restWeekdays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));

          const checkDate = new Date(dateStr + "T00:00:00");
          const todayWeekday = checkDate.getDay();
          if (!completedDates.has(dateStr) && !restWeekdays.has(todayWeekday)) {
            checkDate.setDate(checkDate.getDate() - 1);
          }

          for (let i = 0; i < 60; i++) {
            const d = toDateString(checkDate);
            const wd = checkDate.getDay();
            if (restWeekdays.has(wd)) {
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
        .eq("sex", userSex)
        .gte("date", mondayStr);

      if (weekSessions && weekSessions.length > 0) {
        const sessionIds = weekSessions.map((s: any) => s.id);
        const { data: setLogs } = await supabase
          .from("exercise_set_logs")
          .select("weight, reps")
          .in("workout_session_id", sessionIds);
        weeklyVolume = (setLogs ?? []).reduce((sum, l: any) => sum + ((Number(l.weight) || 0) * (Number(l.reps) || 0)), 0);
      }

      let prCount = 0;
      const { data: prData } = await supabase
        .from("exercise_leaderboard")
        .select("exercise_id")
        .eq("user_id", user.id)
        .eq("sex", userSex);
      if (prData && prData.length > 0) {
        prCount = prData.length;
      }

      let totalXp = 0;
      const { data: xpData } = await supabase
        .from("workout_sessions")
        .select("xp_earned")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex);
      totalXp = (xpData ?? []).reduce((sum, s: any) => sum + (s.xp_earned || 0), 0);

      let discipline = 0;
      const { data: recentSessions } = await supabase
        .from("workout_sessions")
        .select("total_sets")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex)
        .order("date", { ascending: false })
        .limit(10);
      if (recentSessions && recentSessions.length > 0) {
        const { data: planData } = await supabase
          .from("recurring_plans")
          .select("template_id, is_rest")
          .eq("user_id", user.id)
          .eq("sex", userSex);
        const templateIds = (planData ?? []).filter((p: any) => !p.is_rest && p.template_id).map((p: any) => p.template_id);
        let avgPlannedSets = 20;
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

      const consistency = Math.min(100, Math.round((streak / 30) * 100));

      let strength = 0;
      const lastWeekMonday = new Date(monday);
      lastWeekMonday.setDate(lastWeekMonday.getDate() - 7);
      const lastWeekMondayStr = toDateString(lastWeekMonday);
      const { data: lastWeekSessions } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex)
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

      let endurance = 0;
      if (weekSessions && weekSessions.length > 0) {
        const wsIds = weekSessions.map((s: any) => s.id);
        const { data: cardioLogs } = await supabase
          .from("exercise_set_logs")
          .select("duration_seconds, exercises!inner(body_segment)")
          .in("workout_session_id", wsIds)
          .eq("exercises.body_segment", "Cardio");
        const totalCardioMins = (cardioLogs ?? []).reduce((s, l: any) => s + ((l.duration_seconds || 0) / 60), 0);
        endurance = Math.min(100, Math.round(totalCardioMins / 1.5));
      }

      let bodyWeight: number | null = null;
      let bodyWeightChange: number | null = null;
      const { data: weightLogs } = await supabase
        .from("body_weight_logs")
        .select("weight, logged_at")
        .eq("user_id", user.id)
        .eq("sex", userSex)
        .order("logged_at", { ascending: false })
        .limit(2);
      if (weightLogs && weightLogs.length > 0) {
        bodyWeight = weightLogs[0].weight;
        if (weightLogs.length > 1) {
          bodyWeightChange = Number((weightLogs[0].weight - weightLogs[1].weight).toFixed(1));
        }
      }

      let recoveryPct: number | null = null;
      const { data: lastSession } = await supabase
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("sex", userSex)
        .order("completed_at", { ascending: false })
        .limit(1);
      if (lastSession && lastSession.length > 0 && lastSession[0].completed_at) {
        const hoursSince = (Date.now() - new Date(lastSession[0].completed_at).getTime()) / (1000 * 60 * 60);
        recoveryPct = Math.min(100, Math.round((hoursSince / 48) * 100));
      }

      const fatigue = recoveryPct !== null ? Math.max(0, 100 - recoveryPct) : 0;

      const { data: profileData } = await supabase
        .from("profile_body_stats")
        .select("goal")
        .eq("user_id", user.id)
        .eq("sex", userSex)
        .maybeSingle();

      if (!cancelled) {
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
    }
    loadStats();
    return () => { cancelled = true; };
  }, [user, userSex]);

  useEffect(() => {
    let cancelled = false;
    async function loadCalories() {
      if (!user) return;
      const [{ data: prof }, { data: bodyStats }, { data: goalRows }, { data: trendRows }, { data: allIntake }, { data: bwLogs }] = await Promise.all([
        supabase.from("profiles").select("date_of_birth").eq("id", user.id).maybeSingle(),
        supabase.from("profile_body_stats").select("height_cm, activity_level").eq("user_id", user.id).eq("sex", userSex).maybeSingle(),
        supabase.from("user_goals").select("*").eq("user_id", user.id).eq("sex", userSex).eq("is_active", true).limit(1),
        supabase.from("weight_trend").select("date, ema_kg").eq("user_id", user.id).eq("sex", userSex).order("date", { ascending: true }),
        supabase.from("daily_intake").select("date, kcal").eq("user_id", user.id).eq("sex", userSex).order("date", { ascending: true }),
        supabase.from("body_weight_logs").select("weight").eq("user_id", user.id).eq("sex", userSex).order("logged_at", { ascending: false }).limit(1),
      ]);
      if (cancelled) return;
      if (!bodyStats?.height_cm || !prof?.date_of_birth) return;
      const activeSex = userSex;
      const g = goalRows?.[0] as any;
      const weightKg = (trendRows && trendRows.length > 0)
        ? Number(trendRows[trendRows.length - 1].ema_kg)
        : (bwLogs?.[0] ? Number(bwLogs[0].weight) : null);
      if (!weightKg) return;

      let blendedTdee: number | undefined;
      const baseSummary = getFullCalorieSummary({
        weightKg,
        heightCm: bodyStats.height_cm,
        ageYears: ageFromDOB(prof.date_of_birth),
        sex: activeSex,
        activity: (bodyStats.activity_level as ActivityLevel) ?? "moderate",
        goalType: (g?.goal_type as GoalType) ?? "general_fitness",
        ratePerWeekKg: g?.rate_per_week_kg ?? undefined,
        diet: (g?.diet_preference as DietPreference) ?? "balanced",
        calorieOverride: g?.calorie_target_override ?? undefined,
      });

      if (g?.adaptive_mode && allIntake && trendRows && trendRows.length >= 2) {
        const estimate = estimateObservedTdee({
          dailyIntakes: allIntake.map((r: any) => ({ date: r.date, kcal: Number(r.kcal) })),
          trendWeights: trendRows.map((r: any) => ({ date: r.date, ema_kg: Number(r.ema_kg) })),
          seedTdee: baseSummary.tdee,
          previousEstimate: null,
        });
        if (estimate && estimate.method === "observed") {
          blendedTdee = blendTdee(baseSummary.tdee, estimate);
        }
      }

      const summary = blendedTdee
        ? getFullCalorieSummary({
            weightKg,
            heightCm: bodyStats.height_cm,
            ageYears: ageFromDOB(prof.date_of_birth),
            sex: activeSex,
            activity: (bodyStats.activity_level as ActivityLevel) ?? "moderate",
            goalType: (g?.goal_type as GoalType) ?? "general_fitness",
            ratePerWeekKg: g?.rate_per_week_kg ?? undefined,
            diet: (g?.diet_preference as DietPreference) ?? "balanced",
            calorieOverride: g?.calorie_target_override ?? undefined,
            blendedTdee,
          })
        : baseSummary;
      setCalorieSummary(summary);

      const todayStr = new Date().toISOString().split("T")[0];
      const { data: di } = await supabase
        .from("daily_intake")
        .select("kcal, protein_g, carbs_g, fat_g")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .eq("sex", userSex)
        .limit(1);
      if (cancelled) return;
      if (di && di[0]) {
        setTodayIntake({ kcal: di[0].kcal, protein_g: Number(di[0].protein_g), carbs_g: Number(di[0].carbs_g), fat_g: Number(di[0].fat_g) });
      }
    }
    loadCalories();
    return () => { cancelled = true; };
  }, [user, userSex]);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      setNotifications(data ?? []);
      setNotifLoaded(true);
    }
    loadNotifications();
  }, [user]);

  async function dismissNotification(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleQuickLog() {
    if (!user || !qlKcal) return;
    setQlSaving(true);
    const dateStr = toDateString(new Date());
    await supabase.from("food_entries").insert({
      user_id: user.id,
      date: dateStr,
      meal_slot: "snack",
      label: qlLabel.trim() || null,
      kcal: Number(qlKcal),
      protein_g: Number(qlProtein) || 0,
      carbs_g: Number(qlCarbs) || 0,
      fat_g: Number(qlFat) || 0,
      sex: userSex,
    });
    await rematerializeDailyIntake(user.id, dateStr, userSex);
    const { data: di } = await supabase.from("daily_intake").select("kcal, protein_g, carbs_g, fat_g").eq("user_id", user.id).eq("date", dateStr).eq("sex", userSex).limit(1);
    if (di?.[0]) setTodayIntake({ kcal: di[0].kcal, protein_g: Number(di[0].protein_g), carbs_g: Number(di[0].carbs_g), fat_g: Number(di[0].fat_g) });
    setQlLabel(""); setQlKcal(""); setQlProtein(""); setQlCarbs(""); setQlFat("");
    setShowQuickLog(false);
    setQlSaving(false);
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
  const xpProgress = levelInfo.isMaxLevel ? 100 : Math.round(levelInfo.progress * 100);

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />
      <motion.div
        className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* ─── Header ─── */}
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[rgb(var(--accent-light-rgb))]">
              {profile?.username ? `Hi, ${profile.username}` : "Dashboard"}
            </h1>
            <p className="text-[11px] font-mono text-white/30 mt-0.5">{today ?? "..."} {time ? `· ${time}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/notifications")}
              className="relative w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition"
            >
              <Bell size={16} />
              {notifLoaded && notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[rgb(var(--accent-rgb))] text-black text-[8px] font-bold flex items-center justify-center">{notifications.length}</span>
              )}
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-9 h-9 rounded-xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center text-[rgb(var(--accent-rgb))] font-bold text-sm overflow-hidden shrink-0"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (profile?.username?.[0] ?? "?").toUpperCase()
              )}
            </button>
          </div>
        </motion.div>

        {/* ─── Today's Workout Card ─── */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] overflow-hidden" style={{ boxShadow: "0 0 20px -5px rgb(var(--accent-rgb) / 0.1), inset 0 1px 0 rgb(var(--accent-rgb) / 0.05)" }}>
          <div className="p-4">
            <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-2">TODAY&apos;S WORKOUT</p>

            {todayLoading ? (
              <div className="animate-pulse space-y-2 py-2">
                <div className="h-5 w-40 rounded bg-white/[0.06]" />
                <div className="h-3 w-28 rounded bg-white/[0.04]" />
              </div>
            ) : !todayPlan ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white/80">No Workout Planned</p>
                  <p className="text-[11px] text-white/30 mt-0.5">Set up your schedule to get started</p>
                </div>
                <button onClick={() => router.push("/schedule")} className="shrink-0 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.1] transition">
                  Schedule
                </button>
              </div>
            ) : todayPlan.completed ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Trophy size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-emerald-400">Session Complete</p>
                    <p className="text-[11px] font-mono text-white/30 mt-0.5">{todayPlan.sets} sets completed</p>
                  </div>
                </div>
                <button onClick={() => router.push("/progress")} className="shrink-0 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.1] transition flex items-center gap-1.5">
                  Progress <ChevronRight size={12} />
                </button>
              </div>
            ) : todayPlan.is_rest ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <HeartPulse size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white/80">Rest Day</p>
                  <p className="text-[11px] text-white/30 mt-0.5">Recovery is part of the plan</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center">
                    <Dumbbell size={18} className="text-[rgb(var(--accent-rgb))]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/80">{todayPlan.title}</p>
                    <p className="text-[11px] font-mono text-white/30 mt-0.5">
                      {todayPlan.count} exercise{todayPlan.count !== 1 ? "s" : ""} · {todayPlan.sets} sets · ~{estMinutes} min
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/workout")}
                  className="shrink-0 w-10 h-10 rounded-xl bg-[rgb(var(--accent-rgb))] flex items-center justify-center text-black hover:brightness-110 transition"
                >
                  <Play size={18} fill="black" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── Level & Rank ─── */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-4" style={{ boxShadow: "0 0 20px -5px rgb(var(--accent-rgb) / 0.1), inset 0 1px 0 rgb(var(--accent-rgb) / 0.05)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center">
                <span className="text-lg font-bold text-[rgb(var(--accent-rgb))]">{statsLoaded ? level : "—"}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">Level {statsLoaded ? level : "—"}</p>
                <p className="text-[10px] font-mono text-white/30 mt-0.5">
                  <span className={rank.color}>{rank.name}</span>
                  {nextRank && <span className="text-white/15"> · Next: {nextRank.name} at Lv.{nextRank.minLevel}</span>}
                </p>
              </div>
            </div>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-mono tracking-wider ${rank.color}`}
              style={{ borderColor: `${rank.glow?.replace("0.6", "0.3") ?? "rgba(255,255,255,0.1)"}`, backgroundColor: `${rank.glow?.replace("0.6", "0.06") ?? "rgba(255,255,255,0.03)"}` }}
            >
              <Award size={10} />
              {rank.name}
            </span>
          </div>

          {/* XP Bar */}
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-[rgb(var(--accent-rgb))] shrink-0" />
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, rgb(var(--accent-rgb) / 0.7), rgb(var(--accent-rgb)))` }} />
            </div>
            <span className="text-[9px] font-mono text-white/25 shrink-0 min-w-[48px] text-right">
              {levelInfo.isMaxLevel ? "MAX" : `${levelInfo.xpIntoCurrentLevel}/${levelInfo.xpNeededForNext}`}
            </span>
          </div>

          {stats.goal && (
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/[0.04]">
              <Target size={12} className="text-white/20" />
              <span className="text-[10px] font-mono text-white/30">Goal: <span className="text-white/50">{stats.goal}</span></span>
            </div>
          )}
        </motion.div>

        {/* ─── Quick Stats Grid ─── */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2.5">
          {[
            { icon: <Flame size={16} />, label: "STREAK", value: statsLoaded ? `${stats.streak}` : "—", sub: "days", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
            { icon: <Activity size={16} />, label: "WORKOUTS", value: statsLoaded ? `${stats.totalWorkouts}` : "—", sub: "completed", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
            { icon: <TrendingUp size={16} />, label: "WEEKLY VOL", value: statsLoaded ? `${stats.weeklyVolume.toLocaleString()}` : "—", sub: "kg", color: "text-[rgb(var(--accent-rgb))]", bg: "bg-[rgb(var(--accent-rgb)/0.1)]", border: "border-[rgb(var(--accent-rgb)/0.2)]" },
            { icon: <Trophy size={16} />, label: "PRs", value: statsLoaded ? `${stats.prCount}` : "—", sub: "exercises", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.03] p-3" style={{ boxShadow: "0 0 15px -5px rgb(var(--accent-rgb) / 0.08)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className={`w-7 h-7 rounded-lg ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color}`}>{stat.icon}</span>
                <p className="text-[8px] font-mono tracking-wider text-white/20">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-white/90 font-mono">{stat.value}</p>
              <p className="text-[9px] font-mono text-white/20 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Attribute Rings ─── */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-4" style={{ boxShadow: "0 0 20px -5px rgb(var(--accent-rgb) / 0.1), inset 0 1px 0 rgb(var(--accent-rgb) / 0.05)" }}>
          <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-3">ATTRIBUTES</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "STR", value: stats.strength, color: "rgb(var(--accent-rgb))" },
              { label: "END", value: stats.endurance, color: "rgb(52,211,153)" },
              { label: "CON", value: stats.consistency, color: "rgb(251,146,60)" },
              { label: "DIS", value: stats.discipline, color: "rgb(168,85,247)" },
            ].map((attr) => (
              <div key={attr.label} className="flex flex-col items-center">
                <div className="relative w-14 h-14 mb-1.5">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke={attr.color} strokeWidth="2.5" strokeDasharray={`${attr.value * 0.94} 94`} strokeLinecap="round" opacity="0.7" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-white/70">{attr.value}</span>
                </div>
                <p className="text-[8px] font-mono text-white/25">{attr.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Recovery & Body ─── */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.03] p-3" style={{ boxShadow: "0 0 15px -5px rgb(var(--accent-rgb) / 0.08)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <HeartPulse size={12} className="text-emerald-400" />
              <p className="text-[8px] font-mono tracking-wider text-white/25">RECOVERY</p>
            </div>
            <p className="text-2xl font-bold font-mono text-white/90">{stats.recoveryPct ?? "—"}<span className="text-xs text-white/25">%</span></p>
            <p className="text-[9px] font-mono text-white/20 mt-0.5">
              {stats.recoveryPct !== null
                ? stats.recoveryPct >= 80 ? "Ready to train" : stats.recoveryPct >= 50 ? "Partially recovered" : "Rest suggested"
                : "No data"}
            </p>
          </div>
          <div className="rounded-xl border border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.03] p-3" style={{ boxShadow: "0 0 15px -5px rgb(var(--accent-rgb) / 0.08)" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Dumbbell size={12} className="text-white/30" />
              <p className="text-[8px] font-mono tracking-wider text-white/25">BODY WEIGHT</p>
            </div>
            <p className="text-2xl font-bold font-mono text-white/90">
              {stats.bodyWeight !== null ? stats.bodyWeight : "—"}<span className="text-xs text-white/25"> kg</span>
            </p>
            {stats.bodyWeightChange !== null ? (
              <p className={`text-[9px] font-mono mt-0.5 ${stats.bodyWeightChange > 0 ? "text-orange-300/60" : stats.bodyWeightChange < 0 ? "text-emerald-300/60" : "text-white/20"}`}>
                {stats.bodyWeightChange > 0 ? "+" : ""}{stats.bodyWeightChange} kg from previous
              </p>
            ) : (
              <p className="text-[9px] font-mono text-white/20 mt-0.5">No trend data</p>
            )}
          </div>
        </motion.div>

        {/* ─── Energy Dashboard ─── */}
        {calorieSummary && (() => {
          const eaten = todayIntake?.kcal ?? 0;
          const target = calorieSummary.calorieTarget;
          const remaining = target - eaten;
          const pct = Math.min((eaten / target) * 100, 100);
          const over = eaten > target;
          return (
            <motion.div variants={staggerItem} className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-4" style={{ boxShadow: "0 0 20px -5px rgb(var(--accent-rgb) / 0.1), inset 0 1px 0 rgb(var(--accent-rgb) / 0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-[rgb(var(--accent-light-rgb))]" />
                  <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)]">ENERGY</p>
                </div>
                <button onClick={() => setShowQuickLog(!showQuickLog)} className="flex items-center gap-1 text-[9px] font-mono text-[rgb(var(--accent-rgb)/0.6)] hover:text-[rgb(var(--accent-rgb))] transition">
                  <Plus size={10} /> Log Food
                </button>
              </div>

              {/* Target + remaining */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{remaining > 0 ? remaining : 0}</span>
                  <span className="text-xs font-mono text-white/25">kcal left</span>
                </div>
                <span className="text-[9px] font-mono text-white/20">{eaten} / {target}</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-white/[0.06] mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-400" : "bg-[rgb(var(--accent-rgb))]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Macros: eaten / target */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <p className="text-[8px] font-mono text-white/25">PROTEIN</p>
                  <p className="text-sm font-bold font-mono text-rose-300">{Math.round(todayIntake?.protein_g ?? 0)}<span className="text-white/20">/{calorieSummary.macros.protein}g</span></p>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <p className="text-[8px] font-mono text-white/25">CARBS</p>
                  <p className="text-sm font-bold font-mono text-amber-300">{Math.round(todayIntake?.carbs_g ?? 0)}<span className="text-white/20">/{calorieSummary.macros.carbs}g</span></p>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <p className="text-[8px] font-mono text-white/25">FAT</p>
                  <p className="text-sm font-bold font-mono text-blue-300">{Math.round(todayIntake?.fat_g ?? 0)}<span className="text-white/20">/{calorieSummary.macros.fat}g</span></p>
                </div>
              </div>

              {showQuickLog && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                  <input type="text" value={qlLabel} onChange={(e) => setQlLabel(e.target.value)} placeholder="What did you eat?" className="w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[8px] font-mono text-white/30 block mb-1">KCAL *</label>
                      <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} value={qlKcal} onChange={(e) => setQlKcal(e.target.value)} placeholder="—" className="w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-rose-300/50 block mb-1">PROT</label>
                      <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} value={qlProtein} onChange={(e) => setQlProtein(e.target.value)} placeholder="—" className="w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-amber-300/50 block mb-1">CARB</label>
                      <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} value={qlCarbs} onChange={(e) => setQlCarbs(e.target.value)} placeholder="—" className="w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-blue-300/50 block mb-1">FAT</label>
                      <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} value={qlFat} onChange={(e) => setQlFat(e.target.value)} placeholder="—" className="w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                    </div>
                  </div>
                  <button onClick={handleQuickLog} disabled={!qlKcal || qlSaving} className="w-full py-2 rounded-lg bg-[rgb(var(--accent-rgb))] text-black text-xs font-semibold hover:brightness-110 disabled:opacity-40 transition">
                    {qlSaving ? "Saving..." : "Log Entry"}
                  </button>
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* ─── Quick Links ─── */}
        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Schedule", icon: <Calendar size={16} />, href: "/schedule" },
            { label: "Progress", icon: <TrendingUp size={16} />, href: "/progress" },
            { label: "Recovery", icon: <HeartPulse size={16} />, href: "/recovery" },
          ].map((link) => (
            <button
              key={link.label}
              onClick={() => router.push(link.href)}
              className="rounded-xl border border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.03] p-3 flex flex-col items-center gap-1.5 text-white/30 hover:text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.05)] hover:border-[rgb(var(--accent-rgb)/0.25)] transition"
            >
              {link.icon}
              <span className="text-[9px] font-mono tracking-wider">{link.label.toUpperCase()}</span>
            </button>
          ))}
        </motion.div>

        {/* ─── Recent Notifications ─── */}
        {notifLoaded && notifications.length > 0 && (
          <motion.div variants={staggerItem} className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.03] overflow-hidden" style={{ boxShadow: "0 0 15px -5px rgb(var(--accent-rgb) / 0.08)" }}>
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)]">RECENT NOTIFICATIONS</p>
              <button onClick={() => router.push("/notifications")} className="text-[9px] font-mono text-[rgb(var(--accent-rgb)/0.5)] hover:text-[rgb(var(--accent-rgb))] transition">
                View All
              </button>
            </div>
            <div className="px-3 pb-3 space-y-1">
              {notifications.slice(0, 3).map((n) => (
                <button
                  key={n.id}
                  onClick={() => dismissNotification(n.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition text-left"
                >
                  <Bell size={12} className="text-white/20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-white/60 truncate">{n.message}</p>
                    <p className="text-[9px] font-mono text-white/15 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </main>
  );
}
