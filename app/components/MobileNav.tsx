"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Calendar, TrendingUp, MoreHorizontal, X, Trophy, Award, Bell, HeartPulse, Sparkles, User } from "lucide-react";

const mainTabs = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Dumbbell, label: "Workout", href: "/workout" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
];

const moreItems = [
  { icon: Trophy, label: "Rankings", href: "/rankings", desc: "Rank progression & leaderboard" },
  { icon: Award, label: "Achievements", href: "/achievements", desc: "Milestones and badges" },
  { icon: Bell, label: "Notifications", href: "/notifications", desc: "Alerts and updates" },
  { icon: HeartPulse, label: "Recovery", href: "/recovery", desc: "Recovery status" },
  { icon: Sparkles, label: "AI Coach", href: "/coach", desc: "Training advisor" },
  { icon: User, label: "Profile", href: "/profile", desc: "Stats, goals & settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = moreItems.some((item) => pathname === item.href);

  return (
    <>
      {showMore && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMore(false)} />
          <div className="relative z-10 bg-[#0a1120] border-t border-cyan-500/20 rounded-t-2xl px-5 pt-4 pb-8 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono tracking-widest text-white/40">MORE</p>
              <button onClick={() => setShowMore(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 transition">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${active ? "bg-cyan-500/10 text-cyan-300" : "text-white/70 hover:bg-white/[0.04]"}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-cyan-400/15 border border-cyan-400/30" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                      <item.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-[10px] font-mono text-white/30">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          {mainTabs.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 ${active ? "text-cyan-300" : "text-white/40"}`}>
                <item.icon size={20} />
                <span className="text-[9px] font-mono tracking-wide">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 ${isMoreActive || showMore ? "text-cyan-300" : "text-white/40"}`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[9px] font-mono tracking-wide">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}