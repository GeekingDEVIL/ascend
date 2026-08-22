"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { LeaderboardPodium, type LeaderboardRanking as LeaderboardPodiumRanking } from "./leaderboard-podium";
import { LeaderboardRankings, type LeaderboardRankingItem } from "./leaderboard-rankings";

interface LeaderboardRunOption {
  id: string;
  label: string;
}

interface LeaderboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  fromDate: string | Date;
  toDate: string | Date;
  podiumRankings: LeaderboardPodiumRanking[];
  rankings: LeaderboardRankingItem[];
  currentUserId?: string;
  runOptions?: LeaderboardRunOption[];
  selectedRunId?: string;
  onRunChange?: (runId: string) => void;
}

function formatRangeDate(date: string | Date) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const LeaderboardCard = React.forwardRef<HTMLDivElement, LeaderboardCardProps>(
  ({ className, title = "Leaderboard", fromDate, toDate, podiumRankings, rankings, currentUserId, runOptions, selectedRunId, onRunChange, ...props }, ref) => {
    const fromLabel = formatRangeDate(fromDate);
    const toLabel = formatRangeDate(toDate);
    const resolvedRunId = selectedRunId ?? runOptions?.[0]?.id ?? "";
    const hasOnRunChange = Boolean(onRunChange);
    const [localRunId, setLocalRunId] = React.useState(resolvedRunId);

    React.useEffect(() => {
      if (hasOnRunChange) return;
      setLocalRunId(resolvedRunId);
    }, [hasOnRunChange, resolvedRunId]);

    const activeRunId = hasOnRunChange ? resolvedRunId : localRunId;

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5", className)}
        {...props}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white/90">{title}</h3>
            <p className="text-[10px] font-mono text-white/30">
              {fromLabel} – {toLabel}
            </p>
          </div>

          {runOptions && runOptions.length > 0 && (
            <select
              aria-label="Select leaderboard run"
              value={activeRunId}
              onChange={(e) => {
                if (onRunChange) {
                  onRunChange(e.target.value);
                  return;
                }
                setLocalRunId(e.target.value);
              }}
              className="text-[10px] font-mono bg-white/[0.04] text-white/60 rounded-lg border border-white/[0.08] px-2.5 py-1.5 outline-none focus:border-[rgb(var(--accent-rgb)/0.3)]"
            >
              {runOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          )}
        </div>

        <LeaderboardPodium rankings={podiumRankings} className="mb-5" />

        <LeaderboardRankings
          rankings={rankings}
          currentUserId={currentUserId}
          showPagination
          defaultPageSize={10}
        />
      </div>
    );
  }
);

LeaderboardCard.displayName = "LeaderboardCard";

export { LeaderboardCard };
export type { LeaderboardCardProps, LeaderboardRunOption };
