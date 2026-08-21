"use client";

import { useEffect, useState } from "react";
import { Award, Lock, Zap, Users, User, Trophy, Flame, Dumbbell, TrendingUp } from "lucide-react";
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
    { key: "achievement_count", label: "ACHIEVEMENTS", icon: Award },
];

export default function RankingsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<"personal" | "leaderboard">("personal");
    const [totalXp, setTotalXp] = useState(0);
    const [loading, setLoading] = useState(true);

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [lbLoading, setLbLoading] = useState(false);
    const [sortBy, setSortBy] = useState<LeaderboardSort>("total_xp");

    useEffect(() => {
        async function load() {
            if (!user) return;
            const { data } = await supabase
                .from("workout_sessions")
                .select("xp_earned")
                .eq("user_id", user.id)
                .eq("status", "completed");
            setTotalXp((data ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0));

            // Auto-populate user_stats if missing
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

    function formatVolume(v: number): string {
        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
        return String(v);
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10">

            <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
                <div>
                    <h1 className="text-xl font-bold text-white/90">Rankings</h1>
                    <p className="text-[11px] text-white/30 mt-0.5">Your ascent through the ranks</p>
                </div>

                {/* ── TABS ── */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab("personal")}
                        className={`flex items-center gap-1.5 text-[10px] font-mono px-4 py-2 rounded-lg border transition ${tab === "personal" ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"
                            }`}
                    >
                        <User size={12} /> MY RANK
                    </button>
                    <button
                        onClick={() => setTab("leaderboard")}
                        className={`flex items-center gap-1.5 text-[10px] font-mono px-4 py-2 rounded-lg border transition ${tab === "leaderboard" ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"
                            }`}
                    >
                        <Users size={12} /> LEADERBOARD
                    </button>
                </div>

                {/* ════════════════════════════════════
            PERSONAL TAB
        ════════════════════════════════════ */}
                {tab === "personal" && (
                    <>
                        {/* Current Rank Hero */}
                        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className={`w-20 h-20 rounded-xl border-2 ${currentRank.border} ${currentRank.bgClass} flex items-center justify-center mb-4`}
                                    >
                                        <span className="text-3xl">{currentRankIdx >= 10 ? "👑" : currentRankIdx >= 7 ? "💎" : currentRankIdx >= 4 ? "🛡️" : "⚔️"}</span>
                                    </div>
                                    <p className={`text-2xl font-bold tracking-widest ${currentRank.color}`}>{currentRank.name}</p>
                                    <p className="text-sm font-mono text-white/50 mt-1">Level {levelInfo.level} · {totalXp.toLocaleString()} XP</p>

                                    {nextRank && (
                                        <div className="w-full max-w-xs mt-5">
                                            <div className="flex items-center justify-between text-[9px] font-mono text-white/30 mb-1.5">
                                                <span>{currentRank.name}</span>
                                                <span>{nextRank.name}</span>
                                            </div>
                                            <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${rankProgress}%`, background: `linear-gradient(90deg, ${currentRank.glow}, ${nextRank.glow})` }} />
                                            </div>
                                            <p className="text-[10px] font-mono text-white/40 mt-1.5 text-center">{levelsToNextRank} levels to {nextRank.name}</p>
                                        </div>
                                    )}
                                    {!nextRank && <p className="text-sm font-mono text-white/50 mt-4">Maximum rank achieved.</p>}
                                </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                <p className="text-[8px] font-mono text-white/30">LEVEL</p>
                                <p className="text-xl font-bold font-mono text-white/90">{levelInfo.level}</p>
                            </div>
                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                <p className="text-[8px] font-mono text-white/30">TOTAL XP</p>
                                <p className="text-xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{totalXp.toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                <p className="text-[8px] font-mono text-white/30">NEXT LEVEL</p>
                                <p className="text-xl font-bold font-mono text-white/90">{levelInfo.isMaxLevel ? "MAX" : levelInfo.xpNeededForNext - levelInfo.xpIntoCurrentLevel}</p>
                            </div>
                        </div>

                        {/* Tier Ladder */}
                        <div>
                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">RANK PROGRESSION</p>
                            <div className="space-y-1.5">
                                {[...RANK_TIERS].reverse().map((tier, i) => {
                                    const reverseIdx = RANK_TIERS.length - 1 - i;
                                    const isCurrentTier = tier.name === currentRank.name;
                                    const isUnlocked = levelInfo.level >= tier.minLevel;
                                    const nextTier = reverseIdx < RANK_TIERS.length - 1 ? RANK_TIERS[reverseIdx + 1] : null;
                                    const tierIcon = reverseIdx >= 10 ? "👑" : reverseIdx >= 7 ? "💎" : reverseIdx >= 4 ? "🛡️" : reverseIdx >= 1 ? "⚔️" : "📋";

                                    return (
                                        <div key={tier.name} className={`flex items-center gap-3 rounded-lg border p-3 transition ${isCurrentTier ? `${tier.border} ${tier.bgClass}` : isUnlocked ? "border-white/[0.08] bg-white/[0.02]" : "border-white/[0.04] bg-white/[0.01] opacity-40"}`} style={isCurrentTier ? { boxShadow: `0 0 20px -6px ${tier.glow}` } : undefined}>
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg ${isUnlocked ? `${tier.bgClass} border ${tier.border}` : "bg-white/[0.03] border border-white/[0.06]"}`}>
                                                {isUnlocked ? tierIcon : <Lock size={14} className="text-white/20" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-bold ${isUnlocked ? tier.color : "text-white/25"}`}>{tier.name}</p>
                                                    {isCurrentTier && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))]">YOU</span>}
                                                </div>
                                                <p className="text-[10px] font-mono text-white/30">Level {tier.minLevel}{nextTier ? ` — ${nextTier.minLevel - 1}` : "+"}</p>
                                            </div>
                                            <div className="shrink-0">
                                                {isCurrentTier ? (
                                                    <div className="flex items-center gap-1.5"><Zap size={12} className="text-[rgb(var(--accent-light-rgb))]" /><span className="text-[10px] font-mono text-[rgb(var(--accent-light-rgb))]">ACTIVE</span></div>
                                                ) : isUnlocked ? (
                                                    <span className="text-[10px] font-mono text-white/25">ACHIEVED</span>
                                                ) : (
                                                    <span className="text-[10px] font-mono text-white/15">LOCKED</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* XP Info */}
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">HOW XP IS EARNED</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                                {[
                                    ["Session completed", "+50 XP"],
                                    ["Per set logged", "+4 XP"],
                                    ["100% completion", "+30 XP"],
                                    ["New personal record", "+25 XP"],
                                    ["Weight progression", "+20 XP"],
                                    ["Streak bonus (7/14/30d)", "+10-35 XP"],
                                ].map(([label, xp]) => (
                                    <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                        <span className="text-white/50">{label}</span>
                                        <span className="text-[rgb(var(--accent-light-rgb))]">{xp}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] font-mono text-white/20 mt-2.5">Maximum 300 XP per session. Consistency beats intensity.</p>
                        </div>
                    </>
                )}

                {/* ════════════════════════════════════
            LEADERBOARD TAB
        ════════════════════════════════════ */}
                {tab === "leaderboard" && (
                    <>
                        {/* Sort options */}
                        <div className="flex flex-wrap gap-1.5">
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setSortBy(opt.key)}
                                    className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${sortBy === opt.key ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"
                                        }`}
                                >
                                    <opt.icon size={11} /> {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Leaderboard list */}
                        {lbLoading ? (
                            <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /></div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-16">
                                <Users size={32} className="mx-auto mb-3 text-white/15" />
                                <p className="text-sm font-semibold text-white/25">NO RANKINGS YET</p>
                                <p className="text-xs text-white/20 mt-1">Complete a workout to appear on the leaderboard.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((entry, i) => {
                                    const rank = getRank(entry.level);
                                    const isMe = entry.user_id === user?.id;
                                    const position = i + 1;
                                    const positionIcon = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : null;

                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={`flex items-center gap-3 rounded-lg border p-3 transition ${isMe ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb))]/[0.05]" : "border-white/[0.06] bg-white/[0.02]"
                                                }`}
                                            style={isMe ? { boxShadow: "0 0 15px -6px rgb(var(--accent-rgb) / 0.3)" } : undefined}
                                        >
                                            {/* Position */}
                                            <div className="w-8 text-center shrink-0">
                                                {positionIcon ? (
                                                    <span className="text-lg">{positionIcon}</span>
                                                ) : (
                                                    <span className="text-sm font-bold font-mono text-white/40">{position}</span>
                                                )}
                                            </div>

                                            {/* Avatar + name */}
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold overflow-hidden ${rank.bgClass} border ${rank.border} ${rank.color}`}>
                                                {entry.avatar_url ? (
                                                    <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    entry.username?.[0]?.toUpperCase() ?? "?"
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-bold truncate ${isMe ? "text-[rgb(var(--accent-light-rgb))]" : "text-white/85"}`}>{entry.username}</p>
                                                    {isMe && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] shrink-0">YOU</span>}
                                                </div>
                                                <p className="text-[10px] font-mono text-white/30">
                                                    LVL {entry.level} · {rank.name}
                                                </p>
                                            </div>

                                            {/* Sort value */}
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold font-mono text-white/80">
                                                    {sortBy === "total_xp" ? entry.total_xp.toLocaleString() :
                                                        sortBy === "total_workouts" ? entry.total_workouts :
                                                            sortBy === "current_streak" ? entry.current_streak :
                                                                sortBy === "total_volume" ? formatVolume(entry.total_volume) :
                                                                    entry.achievement_count}
                                                </p>
                                                <p className="text-[8px] font-mono text-white/25">
                                                    {sortBy === "total_xp" ? "XP" :
                                                        sortBy === "total_workouts" ? "SESSIONS" :
                                                            sortBy === "current_streak" ? "DAYS" :
                                                                sortBy === "total_volume" ? "KG" :
                                                                    "BADGES"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {leaderboard.length > 0 && (
                            <p className="text-[9px] font-mono text-white/20 text-center">
                                Rankings update after each completed workout.
                            </p>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}