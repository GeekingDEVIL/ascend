"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Medal, Trophy, Star, Flame, Trash2, Award, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import CubeLoader from "../../components/ui/cube-loader";
import { staggerContainer, staggerItem } from "../../lib/motion";

const TYPE_META: Record<string, { icon: (size: number) => React.ReactNode; bg: string; label: string; chipActive: string }> = {
  new_pr: { icon: (s) => <Medal size={s} className="text-yellow-300" />, bg: "bg-yellow-400/10 border-yellow-400/20", label: "PRs", chipActive: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300" },
  workout_complete: { icon: (s) => <Trophy size={s} className="text-[rgb(var(--accent-light-rgb))]" />, bg: "bg-[rgb(var(--accent-rgb)/0.1)] border-[rgb(var(--accent-rgb)/0.2)]", label: "Workouts", chipActive: "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" },
  level_up: { icon: (s) => <Star size={s} className="text-purple-300" />, bg: "bg-purple-400/10 border-purple-400/20", label: "Level Ups", chipActive: "border-purple-400/40 bg-purple-400/10 text-purple-300" },
  streak_milestone: { icon: (s) => <Flame size={s} className="text-orange-300" />, bg: "bg-orange-400/10 border-orange-400/20", label: "Streaks", chipActive: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
  achievement: { icon: (s) => <Award size={s} className="text-emerald-300" />, bg: "bg-emerald-400/10 border-emerald-400/20", label: "Achievements", chipActive: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
};
const DEFAULT_TYPE_META = { icon: (s: number) => <Bell size={s} className="text-white/40" />, bg: "bg-white/[0.04] border-white/[0.08]", label: "Other", chipActive: "border-white/30 bg-white/10 text-white/70" };

function NotifIcon({ type }: { type: string }) {
  const m = TYPE_META[type] ?? DEFAULT_TYPE_META;
  return <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${m.bg}`}>{m.icon(16)}</div>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getDateGroup(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  if (d >= todayStart) return "Today";
  if (d >= yesterdayStart) return "Yesterday";
  if (d >= weekStart) return "This Week";
  return "Earlier";
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      if (!user) return;
      const query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (filter === "unread") query.eq("read", false);
      const { data } = await query;
      setNotifications(data ?? []);
      setLoading(false);
    }
    load();
  }, [user, filter]);

  async function dismiss(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function dismissAll() {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function clearAll() {
    if (!user) return;
    if (!confirm("Delete all notifications permanently?")) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeCounts: Record<string, number> = {};
  notifications.forEach((n) => { typeCounts[n.type] = (typeCounts[n.type] ?? 0) + 1; });
  const presentTypes = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a]);

  const visible = typeFilter === "all" ? notifications : notifications.filter((n) => n.type === typeFilter);

  const grouped: { label: string; items: any[] }[] = [];
  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];
  const groupMap: Record<string, any[]> = {};
  visible.forEach((n) => {
    const g = getDateGroup(n.created_at);
    if (!groupMap[g]) groupMap[g] = [];
    groupMap[g].push(n);
  });
  groupOrder.forEach((label) => {
    if (groupMap[label]?.length) grouped.push({ label, items: groupMap[label] });
  });

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-4">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition">
          <ChevronLeft size={14} /> Profile
        </button>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))]">Notifications</h1>
            <p className="text-[11px] text-white/30 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={dismissAll} className="text-[10px] font-mono px-3 py-1.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition">
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-red-400/20 text-red-400/60 hover:text-red-400 transition">
                <Trash2 size={12} className="inline mr-1 -mt-0.5" />CLEAR
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${filter === "all" ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
              ALL
            </button>
            <button onClick={() => setFilter("unread")} className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${filter === "unread" ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
              UNREAD {unreadCount > 0 && `(${unreadCount})`}
            </button>
            {typeFilter !== "all" && (
              <button onClick={() => setTypeFilter("all")} className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/[0.06] text-white/25 hover:text-white/60 transition ml-auto">
                Clear type ✕
              </button>
            )}
          </div>
          {presentTypes.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {presentTypes.map((t) => {
                const m = TYPE_META[t] ?? DEFAULT_TYPE_META;
                const active = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(active ? "all" : t)}
                    className={`flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1 rounded-full border transition ${active ? m.chipActive : "border-white/[0.06] text-white/30 hover:text-white/55 hover:border-white/15"}`}
                  >
                    {m.icon(10)} {m.label} <span className="opacity-60">{typeCounts[t]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {loading ? (
          <CubeLoader message="Loading notifications…" />
        ) : visible.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl glass-card flex items-center justify-center">
              <Bell size={24} className="text-white/15" />
            </div>
            <p className="text-sm font-semibold text-white/30">All Caught Up</p>
            <p className="text-xs text-white/20 mt-1">
              {notifications.length > 0 ? "No notifications match this filter." : filter === "unread" ? "No unread notifications." : "Complete a workout to see alerts."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-mono tracking-widest text-white/20 mb-2">{group.label.toUpperCase()}</p>
                <motion.div className="space-y-1.5" variants={staggerContainer} initial="hidden" animate="visible">
                  {group.items.map((n) => (
                    <motion.div
                      variants={staggerItem}
                      key={n.id}
                      className={`flex items-center gap-3 rounded-xl border border-white/[0.06] px-3.5 py-3 transition ${n.read ? "bg-white/[0.01] opacity-50" : "bg-white/[0.03]"}`}
                    >
                      <NotifIcon type={n.type} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-semibold ${n.read ? "text-white/50" : "text-white/90"}`}>{n.title}</p>
                        {n.message && <p className="text-[11px] text-white/35 mt-0.5 truncate">{n.message}</p>}
                        <p className="text-[9px] font-mono text-white/20 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.read && (
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-[rgb(var(--accent-rgb))]" />
                          <button onClick={() => dismiss(n.id)} className="text-white/20 hover:text-white/50 transition">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
