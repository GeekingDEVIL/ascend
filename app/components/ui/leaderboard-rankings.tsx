"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface LeaderboardRankingItem {
  userId: string;
  rank: number;
  userName: string;
  byline?: string;
  value: number;
  displayed?: boolean;
  avatarUrl?: string | null;
}

interface LeaderboardRankingsProps extends React.HTMLAttributes<HTMLDivElement> {
  rankings: LeaderboardRankingItem[];
  currentUserId?: string;
  showPagination?: boolean;
  defaultPageSize?: number;
}

function formatValue(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toLocaleString();
}

const LeaderboardRankings = React.forwardRef<HTMLDivElement, LeaderboardRankingsProps>(
  ({ className, rankings, currentUserId, showPagination, defaultPageSize = 10, ...props }, ref) => {
    const [page, setPage] = React.useState(0);
    const totalPages = showPagination ? Math.ceil(rankings.length / defaultPageSize) : 1;
    const visible = showPagination ? rankings.slice(page * defaultPageSize, (page + 1) * defaultPageSize) : rankings;

    return (
      <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
        {visible.map((entry) => {
          const isMe = entry.userId === currentUserId;
          const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

          return (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition",
                isMe
                  ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.06)]"
                  : entry.rank <= 3
                    ? "border-white/[0.08] bg-white/[0.03]"
                    : "border-white/[0.04] bg-white/[0.01]"
              )}
              style={isMe ? { boxShadow: "0 0 15px -6px rgb(var(--accent-rgb) / 0.3)" } : undefined}
            >
              <div className="w-7 text-center shrink-0">
                {medal ? (
                  <span className="text-base">{medal}</span>
                ) : (
                  <span className="text-xs font-bold font-mono text-white/30">{entry.rank}</span>
                )}
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt={entry.userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/50">{entry.userName[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={cn("text-[13px] font-bold truncate", isMe ? "text-[rgb(var(--accent-light-rgb))]" : "text-white/85")}>{entry.userName}</p>
                  {isMe && <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] shrink-0">YOU</span>}
                </div>
                {entry.byline && <p className="text-[9px] font-mono text-white/25">{entry.byline}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-white/80">{formatValue(entry.value)}</p>
              </div>
            </div>
          );
        })}

        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-7 h-7 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-mono text-white/30">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="w-7 h-7 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }
);

LeaderboardRankings.displayName = "LeaderboardRankings";

export { LeaderboardRankings };
