"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import { motion } from "framer-motion";
import SwipeNav from "../../components/ui/swipe-nav";
import { getSocialSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import { useAuth } from "../../lib/AuthProvider";
import { useSex } from "../../lib/useSex";
import { supabase } from "../../lib/supabase";
import { computeLevel, getRank } from "../../lib/levelSystem";
import { staggerContainer, staggerItem } from "../../lib/motion";

type Achievement = {
  id: string;
  message: string;
  created_at: string;
};

export default function SocialHub() {
  const router = useRouter();
  const { user } = useAuth();
  const { enabledKeys } = useModules();
  const { sex: userSex } = useSex();

  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;

      const [{ data: statsRow }, { data: notifs }] = await Promise.all([
        supabase.from("user_stats").select("total_xp, current_streak, total_workouts, achievement_count").eq("user_id", user.id).eq("sex", userSex).maybeSingle(),
        supabase.from("notifications").select("id, message, created_at").eq("user_id", user.id).eq("sex", userSex).like("message", "%achievement%").order("created_at", { ascending: false }).limit(5),
      ]);

      if (cancelled) return;

      if (statsRow) {
        setTotalXp(statsRow.total_xp ?? 0);
        setStreak(statsRow.current_streak ?? 0);
        setTotalWorkouts(statsRow.total_workouts ?? 0);
      } else {
        const { data: xpData } = await supabase
          .from("workout_sessions")
          .select("xp_earned")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .eq("sex", userSex);
        if (!cancelled) setTotalXp((xpData ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0));
      }

      setAchievements(
        (notifs ?? []).map((n: any) => ({
          id: n.id,
          message: n.message,
          created_at: n.created_at,
        })),
      );
      setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, [user, userSex]);

  const levelInfo = computeLevel(totalXp);
  const rank = getRank(levelInfo.level);

  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white pb-24 md:pb-10 overflow-x-hidden">
      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto px-4 pt-4 space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={staggerItem} className="text-xl font-bold font-display text-white/90">
          Social
        </motion.h1>

        <motion.div variants={staggerItem}>
          <SwipeNav sections={getSocialSections(enabledKeys)} />
        </motion.div>

        {/* Your Rank card */}
        <motion.div
          variants={staggerItem}
          className="glass-card p-5 cursor-pointer"
          onClick={() => router.push("/rankings")}
        >
          <p className="text-[9px] font-mono tracking-widest text-blue-400/60 mb-3">YOUR RANK</p>
          <div className="flex items-center gap-5">
            {/* Level ring */}
            {(() => {
              const pct = levelInfo.isMaxLevel ? 100 : Math.round(levelInfo.progress * 100);
              const r = 34;
              const circ = 2 * Math.PI * r;
              const offset = circ - (pct / 100) * circ;
              return (
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                    <circle cx="40" cy="40" r={r} fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
                  </svg>
                  <span className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold font-mono text-white/90">{loaded ? levelInfo.level : "—"}</span>
                    <span className="text-[7px] font-mono text-white/25">LVL</span>
                  </span>
                </div>
              );
            })()}
            <div>
              <p className="text-2xl font-bold font-mono text-white/90">
                {loaded ? totalXp.toLocaleString() : "—"} <span className="text-sm text-white/30">XP</span>
              </p>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">
                <span className={rank.color}>{rank.name}</span>
                <span className="text-white/15"> · {levelInfo.isMaxLevel ? "MAX" : `${levelInfo.xpIntoCurrentLevel}/${levelInfo.xpNeededForNext} to next`}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2.5">
          <div className="glass-card p-3 text-center">
            <p className="text-xl font-bold font-mono text-white/90">{loaded ? totalWorkouts : "—"}</p>
            <p className="text-[9px] font-mono text-white/25 mt-0.5">Workouts</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-xl font-bold font-mono text-white/90">{loaded ? streak : "—"}</p>
            <p className="text-[9px] font-mono text-white/25 mt-0.5">Streak</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-xl font-bold font-mono text-white/90">{loaded ? levelInfo.level : "—"}</p>
            <p className="text-[9px] font-mono text-white/25 mt-0.5">Level</p>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div variants={staggerItem} className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-mono tracking-widest text-yellow-400/60">RECENT ACHIEVEMENTS</p>
            <button onClick={() => router.push("/achievements")} className="text-[9px] font-mono text-[rgb(var(--accent-rgb)/0.5)] hover:text-[rgb(var(--accent-rgb))] transition">
              View All
            </button>
          </div>
          {achievements.length > 0 ? (
            <div className="space-y-1">
              {achievements.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 py-1.5 px-1">
                  <Award size={14} className="text-yellow-400/60 shrink-0" />
                  <span className="text-xs text-white/60 flex-1 truncate">{a.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/20 text-center py-4">
              {loaded ? "Complete workouts to unlock achievements" : "Loading..."}
            </p>
          )}
        </motion.div>

      </motion.div>
    </main>
  );
}
