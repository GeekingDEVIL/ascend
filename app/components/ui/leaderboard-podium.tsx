"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface LeaderboardRanking {
  userId: string;
  userName: string;
  rank: 1 | 2 | 3;
  value: number;
  avatarUrl?: string | null;
}

interface LeaderboardPodiumProps extends React.HTMLAttributes<HTMLDivElement> {
  rankings: LeaderboardRanking[];
}

const PODIUM_CONFIG: Record<number, { height: string; medal: string; ring: string; glow: string; bg: string; barBg: string }> = {
  1: { height: "h-24", medal: "🥇", ring: "border-yellow-400/60", glow: "0 0 24px -4px rgba(250,204,21,0.4)", bg: "bg-yellow-400/10", barBg: "bg-gradient-to-t from-[rgb(var(--accent-rgb)/0.15)] to-transparent" },
  2: { height: "h-16", medal: "🥈", ring: "border-slate-300/50", glow: "0 0 20px -4px rgba(203,213,225,0.3)", bg: "bg-slate-300/10", barBg: "bg-gradient-to-t from-white/[0.06] to-transparent" },
  3: { height: "h-12", medal: "🥉", ring: "border-amber-600/50", glow: "0 0 20px -4px rgba(217,119,6,0.3)", bg: "bg-amber-600/10", barBg: "bg-gradient-to-t from-white/[0.04] to-transparent" },
};

function formatValue(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toLocaleString();
}

const LeaderboardPodium = React.forwardRef<HTMLDivElement, LeaderboardPodiumProps>(
  ({ className, rankings, ...props }, ref) => {
    const ordered = [
      rankings.find((r) => r.rank === 2),
      rankings.find((r) => r.rank === 1),
      rankings.find((r) => r.rank === 3),
    ].filter(Boolean) as LeaderboardRanking[];

    if (ordered.length === 0) return null;

    return (
      <div ref={ref} className={cn("flex items-end justify-center gap-3", className)} {...props}>
        {ordered.map((r) => {
          const config = PODIUM_CONFIG[r.rank];
          const firstName = r.userName.split(" ")[0];
          return (
            <div key={r.userId} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
              <div className="relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden text-sm font-bold",
                    config.ring,
                    config.bg,
                    r.rank === 1 && "w-14 h-14"
                  )}
                  style={{ boxShadow: config.glow }}
                >
                  {r.avatarUrl ? (
                    <img src={r.avatarUrl} alt={r.userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/70">{r.userName[0]?.toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 text-sm">{config.medal}</span>
              </div>
              <div className="text-center">
                <p className={cn("text-[11px] font-semibold text-white/80 truncate max-w-[100px]", r.rank === 1 && "text-[12px] text-white/90")}>{firstName}</p>
                <p className="text-[10px] font-mono text-[rgb(var(--accent-light-rgb))]">{formatValue(r.value)}</p>
              </div>
              <div className={cn("w-full rounded-t-lg", config.height, config.barBg, "border border-b-0 border-white/[0.06]")} />
            </div>
          );
        })}
      </div>
    );
  }
);

LeaderboardPodium.displayName = "LeaderboardPodium";

export { LeaderboardPodium };
