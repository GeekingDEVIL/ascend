"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Lock, ChevronLeft, Sparkles, Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { ACHIEVEMENT_DEFS, RARITY_COLORS, type AchievementDef } from "../../lib/achievements";
import CubeLoader from "../../components/ui/cube-loader";
import SwipeNav from "../../components/ui/swipe-nav";
import { getSocialSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import { staggerContainer, staggerItem } from "../../lib/motion";

export default function AchievementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { enabledKeys } = useModules();
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());
  const [earnedDates, setEarnedDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

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
  const rarities = ["all", ...Array.from(new Set(ACHIEVEMENT_DEFS.map((a) => a.rarity)))];

  const activeAdvancedCount = (categoryFilter !== "all" ? 1 : 0) + (rarityFilter !== "all" ? 1 : 0);

  const filtered = ACHIEVEMENT_DEFS.filter((a) => {
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (rarityFilter !== "all" && a.rarity !== rarityFilter) return false;
    if (filter === "earned" && !earnedKeys.has(a.key)) return false;
    if (filter === "locked" && earnedKeys.has(a.key)) return false;
    if (search.trim() && !`${a.name} ${a.description}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
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

  const recentlyEarned = ACHIEVEMENT_DEFS
    .filter((a) => earnedKeys.has(a.key) && earnedDates[a.key])
    .sort((a, b) => new Date(earnedDates[b.key]).getTime() - new Date(earnedDates[a.key]).getTime())
    .slice(0, 3);

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

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
        <SwipeNav sections={getSocialSections(enabledKeys)} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))]">Achievements</h1>
            <p className="text-[11px] text-white/30 mt-0.5">Your training milestones and records</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-white/90">{totalEarned}<span className="text-sm text-white/30">/{totalAchievements}</span></p>
            <p className="text-[9px] font-mono text-white/30">{completionPct}% complete</p>
          </div>
        </div>

        <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-[rgb(var(--accent-rgb))] to-[rgb(var(--accent-light-rgb))] rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {recentlyEarned.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles size={12} className="text-yellow-300" />
              <p className="text-[10px] font-mono tracking-widest text-white/25">RECENTLY EARNED</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {recentlyEarned.map((a) => {
                const rarity = RARITY_COLORS[a.rarity];
                return (
                  <div key={a.key} className={`flex-shrink-0 w-32 rounded-xl border ${rarity.border} ${rarity.bg} p-3 text-center`}>
                    <div className="text-3xl mb-1.5">{a.icon}</div>
                    <p className="text-[11px] font-bold text-white/90 truncate">{a.name}</p>
                    <span className={`text-[8px] font-mono ${rarity.text}`}>{a.rarity}</span>
                    <p className="text-[9px] font-mono text-white/25 mt-1">{timeAgo(earnedDates[a.key])}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search achievements…"
                className="w-full text-[11px] font-mono glass-input pl-8 pr-3 py-2"
              />
            </div>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-lg border transition shrink-0 ${
                moreOpen || activeAdvancedCount > 0 ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.08] text-white/40 hover:text-white/70"
              }`}
            >
              <SlidersHorizontal size={12} /> Filters{activeAdvancedCount > 0 && ` (${activeAdvancedCount})`}
            </button>
          </div>

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
          </div>

          {moreOpen && (
            <div className="glass-card p-3 space-y-3">
              <div>
                <p className="text-[8px] font-mono tracking-widest text-white/25 mb-1.5">CATEGORY</p>
                <div className="flex gap-1.5 flex-wrap">
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
              </div>
              <div>
                <p className="text-[8px] font-mono tracking-widest text-white/25 mb-1.5">RARITY</p>
                <div className="flex gap-1.5 flex-wrap">
                  {rarities.map((r) => {
                    const active = rarityFilter === r;
                    const rc = r !== "all" ? RARITY_COLORS[r as keyof typeof RARITY_COLORS] : null;
                    return (
                      <button
                        key={r}
                        onClick={() => setRarityFilter(r)}
                        className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition ${
                          active ? (rc ? `${rc.border} ${rc.bg} ${rc.text}` : "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]") : "border-white/10 text-white/30 hover:text-white/60"
                        }`}
                      >
                        {r === "all" ? "ALL" : r}
                      </button>
                    );
                  })}
                </div>
              </div>
              {activeAdvancedCount > 0 && (
                <button
                  onClick={() => { setCategoryFilter("all"); setRarityFilter("all"); }}
                  className="flex items-center gap-1 text-[9px] font-mono text-white/30 hover:text-white/60 transition"
                >
                  <X size={10} /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <CubeLoader message="Loading achievements…" />
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
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-2" variants={staggerContainer} initial="hidden" animate="visible">
                {achievements.map((a) => {
                  const isEarned = earnedKeys.has(a.key);
                  const rarity = RARITY_COLORS[a.rarity];
                  return (
                    <motion.div
                      key={a.key}
                      variants={staggerItem}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition ${
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
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
