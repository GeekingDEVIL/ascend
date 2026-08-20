"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Calendar, TrendingUp, HeartPulse, Sparkles, Trophy, User, Award } from "lucide-react";

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Dumbbell, label: "Workout", href: "/workout" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: Trophy, label: "Rankings", href: "/rankings" },
  { icon: Award, label: "Achievements", href: "/achievements" },
];

const secondaryNav = [
  { icon: HeartPulse, label: "Recovery", href: "/recovery" },
  { icon: Sparkles, label: "AI Coach", href: "/coach" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function NavLink({ item }: { item: typeof mainNav[0] }) {
    const active = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition ${active ? "border-l-2 text-[rgb(var(--accent-rgb))]" : "text-white/50 hover:text-white/80"
          }`}
        style={active ? { backgroundColor: "rgb(var(--accent-rgb) / 0.1)", borderColor: "rgb(var(--accent-rgb))" } : undefined}
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

      <div className="flex items-center gap-2 border rounded px-3 py-2 mb-6 text-xs font-mono text-emerald-400" style={{ borderColor: "rgb(var(--accent-rgb) / 0.1)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        SYSTEM ONLINE
      </div>

      <nav className="flex-1 space-y-1">
        {mainNav.map((item) => <NavLink key={item.label} item={item} />)}
        <div className="h-px bg-white/5 my-3" />
        {secondaryNav.map((item) => <NavLink key={item.label} item={item} />)}
      </nav>

      <Link
        href="/profile"
        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition mt-2 ${pathname === "/profile" ? "border-l-2 text-[rgb(var(--accent-rgb))]" : "text-white/50 hover:text-white/80"
          }`}
        style={pathname === "/profile" ? { backgroundColor: "rgb(var(--accent-rgb) / 0.1)", borderColor: "rgb(var(--accent-rgb))" } : undefined}
      >
        <User size={16} /> Profile
      </Link>

      <div className="pt-4 border-t text-xs font-mono text-white/40 mt-3" style={{ borderColor: "rgb(var(--accent-rgb) / 0.1)" }}>
        <p>PROTOCOL</p>
        <p className="text-white font-bold text-sm">PHASE 01</p>
        <p className="text-[10px] mt-1">ASCEND / 1.1.0</p>
      </div>
    </aside>
  );
}