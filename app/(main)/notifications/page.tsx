"use client";

import { useEffect, useState } from "react";
import { Bell, X, Medal, Trophy, Star, Flame, Trash2, Award } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case "new_pr": return <Medal size={18} className="text-yellow-300" />;
    case "workout_complete": return <Trophy size={18} className="text-[rgb(var(--accent-light-rgb))]" />;
    case "level_up": return <Star size={18} className="text-purple-300" />;
    case "streak_milestone": return <Flame size={18} className="text-orange-300" />;
    case "achievement": return <Award size={18} className="text-emerald-300" />;
    default: return <Bell size={18} className="text-white/50" />;
  }
}

function notifBorder(type: string): string {
  switch (type) {
    case "new_pr": return "border-yellow-400/20";
    case "workout_complete": return "border-[rgb(var(--accent-rgb)/0.15)]";
    case "level_up": return "border-purple-400/20";
    case "streak_milestone": return "border-orange-400/20";
    case "achievement": return "border-emerald-400/20";
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
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

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

  return (
    <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-[rgb(var(--accent-light-rgb))]">Notifications</h1>
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

        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${filter === "all" ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
            ALL
          </button>
          <button onClick={() => setFilter("unread")} className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${filter === "unread" ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}>
            UNREAD {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto mb-3 text-white/15" />
            <p className="text-sm font-semibold text-white/25">NO NOTIFICATIONS</p>
            <p className="text-xs text-white/20 mt-1">{filter === "unread" ? "No unread notifications." : "Complete a workout to see alerts."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border ${notifBorder(n.type)} px-4 py-3 transition ${n.read ? "bg-white/[0.01] opacity-60" : "bg-white/[0.03]"}`}
              >
                <div className="shrink-0 mt-0.5"><NotifIcon type={n.type} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold tracking-wide ${n.read ? "text-white/50" : "text-white/90"}`}>{n.title}</p>
                  {n.message && <p className="text-[11px] text-white/40 mt-0.5">{n.message}</p>}
                  <p className="text-[9px] font-mono text-white/25 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && (
                  <button onClick={() => dismiss(n.id)} className="shrink-0 text-white/25 hover:text-white/50 transition mt-0.5">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}