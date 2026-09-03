"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Calendar, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import SwipeNav from "../../components/ui/swipe-nav";
import { getTrackSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import { useAuth } from "../../lib/AuthProvider";
import { useSex } from "../../lib/useSex";
import { useUnits } from "../../lib/useUnits";
import { formatWeight, kgToUnit } from "../../lib/units";
import { supabase } from "../../lib/supabase";
import { staggerContainer, staggerItem } from "../../lib/motion";

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-12">
      {data.map((val, i) => {
        const h = Math.max(4, (val / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${h}%`,
              backgroundColor: isLast ? color : "rgba(255,255,255,0.08)",
              opacity: isLast ? 1 : 0.6 + (i / data.length) * 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

function RecoveryRing({ pct, size = 72 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "rgb(52 211 153)" : pct >= 50 ? "rgb(251 191 36)" : "rgb(248 113 113)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-white/80">
        {pct}%
      </span>
    </div>
  );
}

const MUSCLE_GROUPS = [
  { key: "chest", label: "Chest", color: "rgb(139 92 246)" },
  { key: "back", label: "Back", color: "rgb(59 130 246)" },
  { key: "shoulders", label: "Shoulders", color: "rgb(249 115 22)" },
  { key: "arms", label: "Arms", color: "rgb(236 72 153)" },
  { key: "core", label: "Core", color: "rgb(251 191 36)" },
  { key: "legs", label: "Legs", color: "rgb(52 211 153)" },
];

function MuscleDistBar({ groups, total }: { groups: { key: string; count: number }[]; total: number }) {
  if (total === 0) return null;
  return (
    <div className="space-y-1.5">
      {groups.map((g) => {
        const mg = MUSCLE_GROUPS.find((m) => m.key === g.key);
        const pct = Math.round((g.count / total) * 100);
        return (
          <div key={g.key} className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-white/30 w-16 text-right shrink-0">{mg?.label ?? g.key}</span>
            <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: mg?.color ?? "rgb(var(--accent-rgb))" }}
              />
            </div>
            <span className="text-[9px] font-mono text-white/20 w-7 shrink-0">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackHub() {
  const router = useRouter();
  const { user } = useAuth();
  const { enabledKeys } = useModules();
  const { sex: userSex } = useSex();
  const weightUnit = useUnits();

  const [stats, setStats] = useState({
    weeklyVolume: 0,
    lastWeekVolume: 0,
    prCount: 0,
    bodyWeight: null as number | null,
    bodyWeightChange: null as number | null,
    recoveryPct: null as number | null,
    weeklyVolumes: [] as number[],
    monthSessions: 0,
    monthTarget: 16,
    muscleGroups: [] as { key: string; count: number }[],
    totalMuscleHits: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      const dateStr = toDateString(new Date());
      const now = new Date(dateStr + "T00:00:00");
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const lastMonday = new Date(monday);
      lastMonday.setDate(lastMonday.getDate() - 7);

      const weeksBack = 6;
      const sixWeeksAgo = new Date(monday);
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - (weeksBack - 1) * 7);
      const sixWeeksAgoStr = toDateString(sixWeeksAgo);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartStr = toDateString(monthStart);

      const [
        { data: allSessions },
        { data: prData },
        { data: weightLogs },
        { data: lastSession },
        { data: monthData },
      ] = await Promise.all([
        supabase.from("workout_sessions").select("id, date").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).gte("date", sixWeeksAgoStr),
        supabase.from("exercise_leaderboard").select("exercise_id").eq("user_id", user.id).eq("sex", userSex),
        supabase.from("body_weight_logs").select("weight, logged_at").eq("user_id", user.id).eq("sex", userSex).order("logged_at", { ascending: false }).limit(2),
        supabase.from("workout_sessions").select("completed_at").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).order("completed_at", { ascending: false }).limit(1),
        supabase.from("workout_sessions").select("id").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).gte("date", monthStartStr),
      ]);

      if (cancelled) return;

      const sessionIds = (allSessions ?? []).map((s: any) => s.id);
      let allLogs: any[] = [];
      if (sessionIds.length > 0) {
        const { data: logs } = await supabase.from("exercise_set_logs").select("weight, reps, workout_session_id, body_part").in("workout_session_id", sessionIds);
        allLogs = logs ?? [];
      }
      if (cancelled) return;

      const weekVolumes: number[] = [];
      let thisWeekVol = 0;
      let lastWeekVol = 0;
      for (let w = 0; w < weeksBack; w++) {
        const wStart = new Date(monday);
        wStart.setDate(monday.getDate() - (weeksBack - 1 - w) * 7);
        const wEnd = new Date(wStart);
        wEnd.setDate(wStart.getDate() + 7);
        const wStartStr = toDateString(wStart);
        const wEndStr = toDateString(wEnd);

        const weekSessionIds = (allSessions ?? [])
          .filter((s: any) => s.date >= wStartStr && s.date < wEndStr)
          .map((s: any) => s.id);
        const vol = allLogs
          .filter((l: any) => weekSessionIds.includes(l.workout_session_id))
          .reduce((sum, l: any) => sum + ((Number(l.weight) || 0) * (Number(l.reps) || 0)), 0);
        weekVolumes.push(Math.round(vol));

        if (w === weeksBack - 1) thisWeekVol = vol;
        if (w === weeksBack - 2) lastWeekVol = vol;
      }

      let bw: number | null = null;
      let bwc: number | null = null;
      if (weightLogs?.length) {
        bw = Number(weightLogs[0].weight);
        if (weightLogs.length > 1) bwc = Number((weightLogs[0].weight - weightLogs[1].weight).toFixed(1));
      }

      let rp: number | null = null;
      if (lastSession?.[0]?.completed_at) {
        const hoursSince = (Date.now() - new Date(lastSession[0].completed_at).getTime()) / 3600000;
        rp = Math.min(100, Math.round((hoursSince / 48) * 100));
      }

      const segmentMap: Record<string, string> = {
        chest: "chest", pectorals: "chest",
        back: "back", lats: "back", "upper back": "back", "lower back": "back", traps: "back",
        shoulders: "shoulders", delts: "shoulders", "front delts": "shoulders", "rear delts": "shoulders", "side delts": "shoulders",
        biceps: "arms", triceps: "arms", forearms: "arms",
        abs: "core", core: "core", obliques: "core",
        quads: "legs", hamstrings: "legs", glutes: "legs", calves: "legs", "hip flexors": "legs", adductors: "legs", abductors: "legs",
      };

      const muscleCounts: Record<string, number> = {};
      let totalHits = 0;
      for (const log of allLogs) {
        const bp = (log.body_part ?? "").toLowerCase().trim();
        const group = segmentMap[bp];
        if (group) {
          muscleCounts[group] = (muscleCounts[group] || 0) + 1;
          totalHits++;
        }
      }
      const muscleGroups = Object.entries(muscleCounts)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        weeklyVolume: Math.round(thisWeekVol),
        lastWeekVolume: Math.round(lastWeekVol),
        prCount: prData?.length ?? 0,
        bodyWeight: bw,
        bodyWeightChange: bwc,
        recoveryPct: rp,
        weeklyVolumes: weekVolumes,
        monthSessions: monthData?.length ?? 0,
        monthTarget: 16,
        muscleGroups,
        totalMuscleHits: totalHits,
      });
      setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, [user, userSex]);

  const volChange = stats.lastWeekVolume > 0
    ? Math.round(((stats.weeklyVolume - stats.lastWeekVolume) / stats.lastWeekVolume) * 100)
    : null;

  const monthPct = Math.min(100, Math.round((stats.monthSessions / stats.monthTarget) * 100));

  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white pb-24 md:pb-10 overflow-x-hidden">
      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto px-4 pt-4 space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={staggerItem} className="text-xl font-bold font-display text-white/90">
          Track
        </motion.h1>

        <motion.div variants={staggerItem}>
          <SwipeNav sections={getTrackSections(enabledKeys)} />
        </motion.div>

        {/* Volume Trend */}
        <motion.div variants={staggerItem} className="glass-card p-4" onClick={() => router.push("/progress")} style={{ cursor: "pointer" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-mono tracking-widest text-emerald-400/60">WEEKLY VOLUME</p>
            {volChange !== null && (
              <span className={`text-[10px] font-mono ${volChange >= 0 ? "text-emerald-400/70" : "text-orange-400/70"}`}>
                {volChange >= 0 ? "↑" : "↓"}{Math.abs(volChange)}%
              </span>
            )}
          </div>
          {loaded && stats.weeklyVolumes.length > 0 && (
            <MiniBarChart data={stats.weeklyVolumes} color="rgb(52 211 153)" />
          )}
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold font-mono text-white/90">
              {loaded ? Math.round(kgToUnit(stats.weeklyVolume, weightUnit)).toLocaleString() : "—"}
            </p>
            <span className="text-xs font-mono text-white/25">{weightUnit} this week</span>
          </div>
        </motion.div>

        {/* PRs + Body Weight + Frequency */}
        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2">
          <div className="glass-card p-3 text-center">
            <p className="text-[8px] font-mono tracking-widest text-yellow-400/60 mb-1.5">PRs</p>
            <p className="text-2xl font-bold font-mono text-white/90">
              {loaded ? stats.prCount : "—"}
            </p>
            <p className="text-[9px] font-mono text-white/20 mt-0.5">records</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-[8px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-1.5">WEIGHT</p>
            <p className="text-2xl font-bold font-mono text-white/90">
              {loaded && stats.bodyWeight !== null ? formatWeight(stats.bodyWeight, weightUnit, 1) : "—"}
            </p>
            <p className={`text-[9px] font-mono mt-0.5 ${
              stats.bodyWeightChange !== null
                ? stats.bodyWeightChange > 0 ? "text-orange-300/50" : stats.bodyWeightChange < 0 ? "text-emerald-300/50" : "text-white/20"
                : "text-white/20"
            }`}>
              {loaded && stats.bodyWeightChange !== null
                ? `${stats.bodyWeightChange > 0 ? "+" : stats.bodyWeightChange < 0 ? "−" : ""}${formatWeight(Math.abs(stats.bodyWeightChange), weightUnit, 1)}`
                : weightUnit}
            </p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-[8px] font-mono tracking-widest text-violet-400/60 mb-1.5">THIS MONTH</p>
            <p className="text-2xl font-bold font-mono text-white/90">
              {loaded ? stats.monthSessions : "—"}
            </p>
            <p className="text-[9px] font-mono text-white/20 mt-0.5">sessions</p>
          </div>
        </motion.div>

        {/* Workout Frequency bar */}
        {loaded && (
          <motion.div variants={staggerItem} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-mono tracking-widest text-violet-400/60">MONTHLY FREQUENCY</p>
              <span className="text-[10px] font-mono text-white/25">{stats.monthSessions}/{stats.monthTarget} target</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: monthPct >= 100 ? "rgb(52 211 153)" : "rgb(var(--accent-rgb))" }}
                initial={{ width: 0 }}
                animate={{ width: `${monthPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Recovery + Muscle Distribution side-by-side */}
        <motion.div variants={staggerItem} className="grid grid-cols-5 gap-2.5">
          {/* Recovery ring — 2 cols */}
          <div className="col-span-2 glass-card p-4 flex flex-col items-center justify-center">
            <p className="text-[8px] font-mono tracking-widest text-emerald-400/60 mb-2">READINESS</p>
            {loaded && stats.recoveryPct !== null ? (
              <RecoveryRing pct={stats.recoveryPct} size={64} />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-white/[0.04] flex items-center justify-center">
                <span className="text-sm font-mono text-white/20">—</span>
              </div>
            )}
            <p className="text-[9px] font-mono text-white/20 mt-2 text-center">
              {loaded && stats.recoveryPct !== null
                ? stats.recoveryPct >= 80 ? "Ready" : stats.recoveryPct >= 50 ? "Moderate" : "Rest"
                : "No data"}
            </p>
          </div>

          {/* Muscle distribution — 3 cols */}
          <div className="col-span-3 glass-card p-4">
            <p className="text-[8px] font-mono tracking-widest text-blue-400/60 mb-3">MUSCLE DISTRIBUTION</p>
            {loaded && stats.muscleGroups.length > 0 ? (
              <MuscleDistBar groups={stats.muscleGroups} total={stats.totalMuscleHits} />
            ) : (
              <p className="text-[10px] font-mono text-white/15 text-center py-6">
                {loaded ? "Train to see distribution" : "Loading..."}
              </p>
            )}
          </div>
        </motion.div>

      </motion.div>
    </main>
  );
}
