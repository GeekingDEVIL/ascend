"use client";

import { useEffect, useState } from "react";
import { Award, Lock, Zap, Users, User, Trophy, Flame, Dumbbell, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { computeLevel, getRank, getNextRank, RANK_TIERS } from "../../lib/levelSystem";

type LeaderboardEntry = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  rank_name: string;
  total_workouts: number;
  current_streak: number;
  total_volume: number;
  achievement_count: number;
  best_streak: number;
};

type LeaderboardSort = "total_xp" | "total_workouts" | "current_streak" | "total_volume" | "achievement_count";

const SORT_OPTIONS: { key: LeaderboardSort; label: string; icon: any }[] = [
  { key: "total_xp", label: "XP", icon: Zap },
  { key: "total_workouts", label: "WORKOUTS", icon: Dumbbell },
  { key: "current_streak", label: "STREAK", icon: Flame },
  { key: "total_volume", label: "VOLUME", icon: TrendingUp },
  { key: "achievement_count", label: "BADGES", icon: Award },
];

function formatVolume(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return String(v);
}

function getSortValue(entry: LeaderboardEntry, sortBy: LeaderboardSort): string {
  switch (sortBy) {
    case "total_xp": return entry.total_xp.toLocaleString();
    case "total_workouts": return String(entry.total_workouts);
    case "current_streak": return String(entry.current_streak);
    case "total_volume": return formatVolume(entry.total_volume);
    case "achievement_count": return String(entry.achievement_count);
  }
}

function getSortUnit(sortBy: LeaderboardSort): string {
  switch (sortBy) {
    case "total_xp": return "XP";
    case "total_workouts": return "SESSIONS";
    case "current_streak": return "DAYS";
    case "total_volume": return "KG";
    case "achievement_count": return "BADGES";
  }
}

export default function RankingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "leaderboard">("personal");
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState<{ xp: number; date: string; title: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [sortBy, setSortBy] = useState<LeaderboardSort>("total_xp");
  const [showAllTiers, setShowAllTiers] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [{ data }, { data: sessions }] = await Promise.all([
        supabase
          .from("workout_sessions")
          .select("xp_earned")
          .eq("user_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("workout_sessions")
          .select("xp_earned, date, title")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setTotalXp((data ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0));
      setRecentSessions((sessions ?? []).map((s: any) => ({ xp: s.xp_earned || 0, date: s.date, title: s.title || "Workout" })));
      const { data: existing } = await supabase.from("user_stats").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!existing && (data ?? []).length > 0) {
        const { updateUserStats } = await import("../../lib/updateUserStats");
        await updateUserStats(user.id);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (tab !== "leaderboard") return;
    async function loadLeaderboard() {
      setLbLoading(true);
      const { data } = await supabase
        .from("user_stats")
        .select("*")
        .order(sortBy, { ascending: false })
        .limit(50);
      setLeaderboard(data ?? []);
      setLbLoading(false);
    }
    loadLeaderboard();
  }, [tab, sortBy]);

  const levelInfo = computeLevel(totalXp);
  const currentRank = getRank(levelInfo.level);
  const nextRank = getNextRank(levelInfo.level);
  const currentRankIdx = RANK_TIERS.indexOf(currentRank);
  const levelsToNextRank = nextRank ? nextRank.minLevel - levelInfo.level : 0;
  const currentRankSpan = nextRank ? nextRank.minLevel - currentRank.minLevel : 1;
  const levelsIntoCurrentRank = levelInfo.level - currentRank.minLevel;
  const rankProgress = nextRank ? Math.min(100, (levelsIntoCurrentRank / currentRankSpan) * 100) : 100;
  const xpProgress = levelInfo.isMaxLevel ? 100 : Math.round((levelInfo.xpIntoCurrentLevel / levelInfo.xpNeededForNext) * 100);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" />
      </main>
    );
  }

  const tierIcon = (idx: number) => idx >= 10 ? "👑" : idx >= 7 ? "💎" : idx >= 4 ? "🛡️" : idx >= 1 ? "⚔️" : "📋";

  const nearbyTiers = RANK_TIERS.slice(Math.max(0, currentRankIdx - 1), currentRankIdx + 3);

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-4">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition">
          <ChevronLeft size={14} /> Profile
        </button>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <button onClick={() => setTab("personal")} className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono px-4 py-2.5 rounded-xl border transition ${tab === "personal" ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
            <User size={12} /> MY RANK
          </button>
          <button onClick={() => setTab("leaderboard")} className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono px-4 py-2.5 rounded-xl border transition ${tab === "leaderboard" ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
            <Users size={12} /> LEADERBOARD
          </button>
        </div>

        {tab === "personal" && (
          <div className="space-y-4">
            {/* Hero rank card */}
            <div
              className={`relative rounded-2xl border-2 ${currentRank.border} overflow-hidden`}
              style={{ boxShadow: `0 0 40px -8px ${currentRank.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` }}
            >
              <div className={`absolute inset-0 ${currentRank.bgClass} opacity-30`} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050914]/80" />
              <div className="relative px-5 pt-6 pb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl border-2 ${currentRank.border} ${currentRank.bgClass} flex items-center justify-center`} style={{ boxShadow: `0 0 20px -4px ${currentRank.glow}` }}>
                    <span className="text-3xl">{tierIcon(currentRankIdx)}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-2xl font-bold tracking-wider ${currentRank.color}`}>{currentRank.name}</p>
                    <p className="text-[11px] font-mono text-white/40 mt-0.5">Level {levelInfo.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{totalXp.toLocaleString()}</p>
                    <p className="text-[9px] font-mono text-white/30">TOTAL XP</p>
                  </div>
                </div>

                {/* XP to next level */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/30 mb-1.5">
                    <span>LVL {levelInfo.level}</span>
                    <span>{levelInfo.isMaxLevel ? "MAX" : `${levelInfo.xpNeededForNext - levelInfo.xpIntoCurrentLevel} XP to LVL ${levelInfo.level + 1}`}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgb(var(--accent-light-rgb))] transition-all"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>

                {/* Rank progress */}
                {nextRank && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
                      <span className={currentRank.color}>{currentRank.name}</span>
                      <span className="text-white/20">{levelsToNextRank} levels to rank up</span>
                      <span style={{ color: nextRank.glow }}>{nextRank.name}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rankProgress}%`, background: `linear-gradient(90deg, ${currentRank.glow}, ${nextRank.glow})` }} />
                    </div>
                  </div>
                )}
                {!nextRank && (
                  <p className="text-[10px] font-mono text-white/40 mt-4 pt-4 border-t border-white/[0.06] text-center">Maximum rank achieved.</p>
                )}
              </div>
            </div>

            {/* Recent XP gains */}
            {recentSessions.length > 0 && (
              <div>
                <p className="text-[9px] font-mono tracking-widest text-white/20 mb-2">RECENT XP</p>
                <div className="space-y-1">
                  {recentSessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap size={11} className="text-[rgb(var(--accent-light-rgb))] shrink-0" />
                        <span className="text-[11px] font-mono text-white/50 truncate">{s.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] font-mono text-white/20">{new Date(s.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        <span className="text-[11px] font-bold font-mono text-[rgb(var(--accent-light-rgb))]">+{s.xp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby tiers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-mono tracking-widest text-white/20">RANK LADDER</p>
                <button onClick={() => setShowAllTiers(!showAllTiers)} className="text-[9px] font-mono text-white/25 hover:text-white/50 transition">
                  {showAllTiers ? "SHOW LESS" : "ALL TIERS"}
                </button>
              </div>
              <div className="space-y-1.5">
                {(showAllTiers ? [...RANK_TIERS].reverse() : nearbyTiers.reverse()).map((tier) => {
                  const idx = RANK_TIERS.indexOf(tier);
                  const isCurrentTier = tier.name === currentRank.name;
                  const isUnlocked = levelInfo.level >= tier.minLevel;
                  const nextTier = idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
                  return (
                    <div
                      key={tier.name}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${isCurrentTier ? `${tier.border} ${tier.bgClass}` : isUnlocked ? "border-white/[0.06] bg-white/[0.02]" : "border-white/[0.04] bg-white/[0.01] opacity-40"}`}
                      style={isCurrentTier ? { boxShadow: `0 0 16px -6px ${tier.glow}` } : undefined}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base ${isUnlocked ? `${tier.bgClass} border ${tier.border}` : "bg-white/[0.03] border border-white/[0.06]"}`}>
                        {isUnlocked ? tierIcon(idx) : <Lock size={12} className="text-white/20" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-[13px] font-bold ${isUnlocked ? tier.color : "text-white/25"}`}>{tier.name}</p>
                          {isCurrentTier && (
                            <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))]">YOU</span>
                          )}
                        </div>
                        <p className="text-[9px] font-mono text-white/25">Level {tier.minLevel}{nextTier ? `–${nextTier.minLevel - 1}` : "+"}</p>
                      </div>
                      <div className="shrink-0">
                        {isCurrentTier ? (
                          <Zap size={14} className="text-[rgb(var(--accent-light-rgb))]" />
                        ) : isUnlocked ? (
                          <span className="text-[9px] font-mono text-white/20">DONE</span>
                        ) : (
                          <Lock size={12} className="text-white/10" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* XP breakdown */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[9px] font-mono tracking-widest text-white/20 mb-3">HOW XP IS EARNED</p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                {[
                  ["Session completed", "+50"],
                  ["Per set logged", "+4"],
                  ["100% completion", "+30"],
                  ["New personal record", "+25"],
                  ["Weight progression", "+20"],
                  ["Streak bonus", "+10–35"],
                ].map(([label, xp]) => (
                  <div key={label} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                    <span className="text-white/40">{label}</span>
                    <span className="text-[rgb(var(--accent-light-rgb))]">{xp}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] font-mono text-white/15 mt-2 text-center">Max 300 XP per session</p>
            </div>
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`flex items-center gap-1 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition ${sortBy === opt.key ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}
                >
                  <opt.icon size={10} /> {opt.label}
                </button>
              ))}
            </div>

            {lbLoading ? (
              <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /></div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Users size={24} className="text-white/15" />
                </div>
                <p className="text-sm font-semibold text-white/25">No Rankings Yet</p>
                <p className="text-xs text-white/20 mt-1">Complete a workout to appear.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {leaderboard.map((entry, i) => {
                  const rank = getRank(entry.level);
                  const isMe = entry.user_id === user?.id;
                  const position = i + 1;
                  const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : null;
                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${isMe ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.06)]" : position <= 3 ? "border-white/[0.08] bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.01]"}`}
                      style={isMe ? { boxShadow: "0 0 15px -6px rgb(var(--accent-rgb) / 0.3)" } : undefined}
                    >
                      <div className="w-7 text-center shrink-0">
                        {medal ? (
                          <span className="text-base">{medal}</span>
                        ) : (
                          <span className="text-xs font-bold font-mono text-white/30">{position}</span>
                        )}
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold overflow-hidden ${rank.bgClass} border ${isMe ? "border-[rgb(var(--accent-rgb))]" : rank.border} ${rank.color}`}>
                        {entry.avatar_url ? (
                          <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                        ) : (
                          entry.username?.[0]?.toUpperCase() ?? "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-[13px] font-bold truncate ${isMe ? "text-[rgb(var(--accent-light-rgb))]" : "text-white/85"}`}>{entry.username}</p>
                          {isMe && <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] shrink-0">YOU</span>}
                        </div>
                        <p className="text-[9px] font-mono text-white/25">LVL {entry.level} · {rank.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold font-mono text-white/80">{getSortValue(entry, sortBy)}</p>
                        <p className="text-[7px] font-mono text-white/20">{getSortUnit(sortBy)}</p>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[8px] font-mono text-white/15 text-center pt-2">Rankings update after each completed workout.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
