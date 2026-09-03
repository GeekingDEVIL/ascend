"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
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
      const mondayStr = toDateString(monday);
      const lastMonday = new Date(monday);
      lastMonday.setDate(lastMonday.getDate() - 7);
      const lastMondayStr = toDateString(lastMonday);

      const weeksBack = 6;
      const sixWeeksAgo = new Date(monday);
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - (weeksBack - 1) * 7);
      const sixWeeksAgoStr = toDateString(sixWeeksAgo);

      const [
        { data: allSessions },
        { data: prData },
        { data: weightLogs },
        { data: lastSession },
      ] = await Promise.all([
        supabase.from("workout_sessions").select("id, date").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).gte("date", sixWeeksAgoStr),
        supabase.from("exercise_leaderboard").select("exercise_id").eq("user_id", user.id).eq("sex", userSex),
        supabase.from("body_weight_logs").select("weight, logged_at").eq("user_id", user.id).eq("sex", userSex).order("logged_at", { ascending: false }).limit(2),
        supabase.from("workout_sessions").select("completed_at").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).order("completed_at", { ascending: false }).limit(1),
      ]);

      if (cancelled) return;

      const sessionIds = (allSessions ?? []).map((s: any) => s.id);
      let allLogs: any[] = [];
      if (sessionIds.length > 0) {
        const { data: logs } = await supabase.from("exercise_set_logs").select("weight, reps, workout_session_id").in("workout_session_id", sessionIds);
        allLogs = logs ?? [];
      }
      if (cancelled) return;

      const sessionDateMap = new Map<string, string>();
      (allSessions ?? []).forEach((s: any) => { sessionDateMap.set(s.id, s.date); });

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

      setStats({
        weeklyVolume: Math.round(thisWeekVol),
        lastWeekVolume: Math.round(lastWeekVol),
        prCount: prData?.length ?? 0,
        bodyWeight: bw,
        bodyWeightChange: bwc,
        recoveryPct: rp,
        weeklyVolumes: weekVolumes,
      });
      setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, [user, userSex]);

  const volChange = stats.lastWeekVolume > 0
    ? Math.round(((stats.weeklyVolume - stats.lastWeekVolume) / stats.lastWeekVolume) * 100)
    : null;

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

        {/* PRs + Body Weight side-by-side */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2.5">
          <div className="glass-card p-4">
            <p className="text-[9px] font-mono tracking-widest text-yellow-400/60 mb-2">PRs</p>
            <p className="text-3xl font-bold font-mono text-white/90">
              {loaded ? stats.prCount : "—"}
            </p>
            <p className="text-[10px] font-mono text-white/25 mt-1">personal records</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-2">BODY WEIGHT</p>
            <p className="text-3xl font-bold font-mono text-white/90">
              {loaded && stats.bodyWeight !== null ? formatWeight(stats.bodyWeight, weightUnit, 1) : "—"}
            </p>
            <p className={`text-[10px] font-mono mt-1 ${
              stats.bodyWeightChange !== null
                ? stats.bodyWeightChange > 0 ? "text-orange-300/50" : stats.bodyWeightChange < 0 ? "text-emerald-300/50" : "text-white/20"
                : "text-white/20"
            }`}>
              {loaded && stats.bodyWeightChange !== null
                ? `${stats.bodyWeightChange > 0 ? "+" : stats.bodyWeightChange < 0 ? "−" : ""}${formatWeight(Math.abs(stats.bodyWeightChange), weightUnit, 1)} ${weightUnit}`
                : weightUnit}
            </p>
          </div>
        </motion.div>

        {/* Recovery with ring */}
        <motion.div variants={staggerItem} className="glass-card p-4">
          <p className="text-[9px] font-mono tracking-widest text-emerald-400/60 mb-3">READINESS</p>
          <div className="flex items-center gap-5">
            {loaded && stats.recoveryPct !== null ? (
              <RecoveryRing pct={stats.recoveryPct} />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full border-4 border-white/[0.04] flex items-center justify-center">
                <span className="text-sm font-mono text-white/20">—</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white/70">
                {loaded && stats.recoveryPct !== null
                  ? stats.recoveryPct >= 80 ? "Good recovery" : stats.recoveryPct >= 50 ? "Partially recovered" : "Rest suggested"
                  : "No data yet"}
              </p>
              <p className="text-[10px] font-mono text-white/25 mt-1">
                {loaded && stats.recoveryPct !== null
                  ? stats.recoveryPct >= 80 ? "Ready to train hard" : stats.recoveryPct >= 50 ? "Light session OK" : "Take it easy today"
                  : "Complete a workout to start tracking"}
              </p>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </main>
  );
}
