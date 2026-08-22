"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, TrendingUp, User } from "lucide-react";

const mainTabs = [
  { icon: LayoutDashboard, label: "Home", href: "/", match: ["/"] },
  { icon: Dumbbell, label: "Train", href: "/workout", match: ["/workout", "/schedule"] },
  { icon: TrendingUp, label: "Progress", href: "/progress", match: ["/progress"] },
  { icon: User, label: "Profile", href: "/profile", match: ["/profile", "/rankings", "/achievements", "/notifications", "/recovery", "/coach"] },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-black/80 backdrop-blur-xl" style={{ borderColor: "rgb(var(--accent-rgb) / 0.2)" }}>
      <div className="flex items-center justify-around py-2">
        {mainTabs.map((item) => {
          const active = item.match.includes(pathname);
          return (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 ${active ? "text-[rgb(var(--accent-rgb))]" : "text-white/40"}`}>
              <item.icon size={20} />
              <span className="text-[9px] font-mono tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}