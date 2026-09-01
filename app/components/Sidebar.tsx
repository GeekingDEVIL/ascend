"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Dumbbell, Calendar, TrendingUp, HeartPulse, Sparkles,
  Trophy, User, Award, Bell, Users, Droplets,
} from "lucide-react";
import { useSex } from "../lib/useSex";

type NavItem = { icon: any; label: string; href: string };

const hubNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Hub", href: "/" },
];

const trainNav: NavItem[] = [
  { icon: Dumbbell, label: "Workout", href: "/workout" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
];

const trackNavBase: NavItem[] = [
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: HeartPulse, label: "Recovery", href: "/recovery" },
];

const trackCyclePill: NavItem = { icon: Droplets, label: "Cycle", href: "/cycle" };

const socialNav: NavItem[] = [
  { icon: Trophy, label: "Rankings", href: "/rankings" },
  { icon: Award, label: "Achievements", href: "/achievements" },
];

const youNav: NavItem[] = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Sparkles, label: "AI Coach", href: "/coach" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

const sections = [
  { label: "HUB", items: hubNav },
  { label: "TRAIN", items: trainNav },
  { label: "TRACK", items: trackNavBase },
  { label: "SOCIAL", items: socialNav },
  { label: "YOU", items: youNav },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sex } = useSex();
  const isFemale = sex === "female";

  function NavLink({ item }: { item: NavItem }) {
    const active = pathname === item.href;
    const isCycle = item.href === "/cycle";
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition ${
          active
            ? `border-l-2 ${isCycle ? "text-pink-400" : "text-[rgb(var(--accent-rgb))]"}`
            : "text-white/50 hover:text-white/80"
        }`}
        style={
          active
            ? {
                backgroundColor: isCycle ? "rgba(236,72,153,0.1)" : "rgb(var(--accent-rgb) / 0.1)",
                borderColor: isCycle ? "rgb(236,72,153)" : "rgb(var(--accent-rgb))",
              }
            : undefined
        }
      >
        <item.icon size={16} />
        {item.label}
      </Link>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-black/80 backdrop-blur-xl h-screen sticky top-0 z-20 p-5 shrink-0 overflow-y-auto" style={{ borderColor: "rgb(var(--accent-rgb) / 0.1)" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 border flex items-center justify-center font-bold text-sm" style={{ borderColor: "rgb(var(--accent-rgb) / 0.4)", color: "rgb(var(--accent-rgb))" }}>A</div>
        <div>
          <p className="font-bold text-white leading-tight">ASCEND</p>
          <p className="text-[9px] tracking-widest text-white/40">YOUR TRAINING SYSTEM</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border rounded px-3 py-2 mb-6 text-xs font-mono" style={{
        borderColor: isFemale ? "rgba(236,72,153,0.2)" : "rgb(var(--accent-rgb) / 0.1)",
        color: isFemale ? "rgb(236,72,153)" : "rgb(var(--accent-rgb))",
      }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: isFemale ? "rgb(236,72,153)" : "rgb(var(--accent-rgb))" }} />
        {isFemale ? "♀ FEMALE MODE" : "♂ MALE MODE"}
      </div>

      <nav className="flex-1 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[8px] font-mono tracking-[0.2em] text-white/20 mb-1.5 px-3">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
              {section.label === "TRACK" && isFemale && (
                <NavLink item={trackCyclePill} />
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t text-xs font-mono text-white/40 mt-3" style={{ borderColor: "rgb(var(--accent-rgb) / 0.1)" }}>
        <p>PROTOCOL</p>
        <p className="text-white font-bold text-sm">PHASE 01</p>
        <p className="text-[10px] mt-1">ASCEND / 1.1.0</p>
      </div>
    </aside>
  );
}
