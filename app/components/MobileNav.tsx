"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Calendar, TrendingUp, User } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Dumbbell, label: "Workout", href: "/workout" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-cyan-500/20 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 ${active ? "text-cyan-300" : "text-white/40"}`}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-mono tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}