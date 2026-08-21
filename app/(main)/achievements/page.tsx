"use client";

import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { ACHIEVEMENT_DEFS, RARITY_COLORS, type AchievementDef } from "../../lib/achievements";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());
  const [earnedDates, setEarnedDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from("achievements")
        .select("achievement_key, earned_at")
        .eq("user_id", user.id);
      const keys = new Set((data ?? []).map((a: any) => a.achievement_key));
      const dates: Record<string, string> = {};
      (data ?? []).forEach((a: any) => { dates[a.achievement_key] = a.earned_at; });
      setEarnedKeys(keys);
      setEarnedDates(dates);
      setLoading(false);
    }
    load();
  }, [user]);

  const categories = ["all", ...Array.from(new Set(ACHIEVEMENT_DEFS.map((a) => a.category)))];

  const filtered = ACHIEVEMENT_DEFS.filter((a) => {
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (filter === "earned" && !earnedKeys.has(a.key)) return false;
    if (filter === "locked" && earnedKeys.has(a.key)) return false;
    return true;
  });

  const grouped: Record<string, AchievementDef[]> = {};
  filtered.forEach((a) => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  const totalEarned = ACHIEVEMENT_DEFS.filter((a) => earnedKeys.has(a.key)).length;
  const totalAchievements = ACHIEVEMENT_DEFS.length;
  const completionPct = Math.round((totalEarned / totalAchievements) * 100);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[rgb(var(--accent-light-rgb))]">Achievements</h1>
          <p className="text-[11px] text-white/30 mt-0.5">Your training milestones and records</p>
        </div>

        {/* Progress overview */}
        <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-widest text-white/25">COMPLETION</p>
            <p className="text-sm font-bold font-mono text-white/80">{totalEarned}/{totalAchievements}</p>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
            <div
              className="h-full bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgb(var(--accent-light-rgb))] rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-[9px] font-mono text-white/30 mt-1.5">{completionPct}% complete</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "earned", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${
                filter === f ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"
              }`}
            >
              {f.toUpperCase()} {f === "earned" ? `(${totalEarned})` : f === "locked" ? `(${totalAchievements - totalEarned})` : ""}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition ${
                categoryFilter === c ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/30 hover:text-white/60"
              }`}
            >
              {c === "all" ? "ALL" : c.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Achievement cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <Award size={32} className="mx-auto mb-3 text-white/15" />
            <p className="text-sm font-semibold text-white/25">NO ACHIEVEMENTS FOUND</p>
            <p className="text-xs text-white/20 mt-1">Try a different filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, achievements]) => (
            <div key={category}>
              <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.6)] mb-2.5">{category.toUpperCase()}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {achievements.map((a) => {
                  const isEarned = earnedKeys.has(a.key);
                  const rarity = RARITY_COLORS[a.rarity];
                  return (
                    <div
                      key={a.key}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                        isEarned ? `${rarity.border} ${rarity.bg}` : "border-white/[0.06] bg-white/[0.01] opacity-50"
                      }`}
                    >
                      <div className="text-2xl shrink-0 mt-0.5">
                        {isEarned ? a.icon : <Lock size={20} className="text-white/20" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${isEarned ? "text-white/90" : "text-white/30"} truncate`}>{a.name}</p>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${rarity.text} ${rarity.bg} border ${rarity.border} shrink-0`}>
                            {a.rarity}
                          </span>
                        </div>
                        <p className={`text-[10px] font-mono mt-0.5 ${isEarned ? "text-white/50" : "text-white/20"}`}>{a.description}</p>
                        {isEarned && earnedDates[a.key] && (
                          <p className="text-[9px] font-mono text-white/25 mt-1">Earned {timeAgo(earnedDates[a.key])}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}