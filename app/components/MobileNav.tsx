"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, TrendingUp, User } from "lucide-react";
import { useSex } from "../lib/useSex";

const mainTabs = [
  { icon: LayoutDashboard, label: "Home", href: "/", match: ["/"] },
  { icon: Dumbbell, label: "Train", href: "/workout", match: ["/workout", "/schedule"] },
  { icon: TrendingUp, label: "Progress", href: "/progress", match: ["/progress"] },
  { icon: User, label: "Profile", href: "/profile", match: ["/profile", "/rankings", "/achievements", "/notifications", "/recovery", "/coach"] },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { sex } = useSex();

  const isFemale = sex === "female";
  const modeColor = isFemale ? "rgb(236,72,153)" : "rgb(96,165,250)";
  const modeGlow = isFemale ? "rgba(236,72,153,0.15)" : "rgba(96,165,250,0.15)";
  const modeSymbol = isFemale ? "♀" : "♂";

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black/90 backdrop-blur-xl" style={{ borderTop: `1.5px solid ${modeColor}40` }}>
      <div className="absolute inset-x-0 top-0 h-8 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${modeGlow}, transparent)` }} />
      <div className="flex items-center justify-around py-2 relative">
        {mainTabs.map((item, i) => {
          const active = item.match.includes(pathname);
          if (i === 2) {
            return (
              <div key="mode-indicator" className="flex flex-col items-center relative">
                <Link href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 ${active ? "text-[rgb(var(--accent-rgb))]" : "text-white/40"}`}>
                  <item.icon size={20} />
                  <span className="text-[9px] font-mono tracking-wide">{item.label}</span>
                </Link>
              </div>
            );
          }
          return (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 ${active ? "text-[rgb(var(--accent-rgb))]" : "text-white/40"}`}>
              <item.icon size={20} />
              <span className="text-[9px] font-mono tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div
        className="absolute -top-3.5 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-semibold tracking-widest uppercase"
        style={{
          background: `linear-gradient(135deg, ${isFemale ? "rgba(236,72,153,0.2)" : "rgba(96,165,250,0.2)"}, ${isFemale ? "rgba(190,24,93,0.15)" : "rgba(59,130,246,0.15)"})`,
          border: `1px solid ${modeColor}50`,
          color: modeColor,
          boxShadow: `0 0 12px ${isFemale ? "rgba(236,72,153,0.25)" : "rgba(96,165,250,0.25)"}`,
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="text-sm leading-none">{modeSymbol}</span>
        <span>{sex}</span>
      </div>
    </nav>
  );
}
