"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Clock, BarChart3, Calendar, Info, Search, SlidersHorizontal, Dumbbell, Target, Zap, Flame, Heart, Trophy } from "lucide-react";
import { PLAN_LIBRARY, PLAN_GOALS, PLAN_ENVIRONMENTS, PLAN_LEVELS, type WorkoutPlan } from "../lib/planLibrary";
import type { Sex } from "../lib/calorieEngine";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (plan: WorkoutPlan) => void;
  importing: boolean;
  userSex?: Sex | null;
};

const DAY_COUNTS = [2, 3, 4, 5, 6];
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_MAP: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

const GOAL_META: Record<string, { icon: any; color: string; accent: string; description: string }> = {
  "Build muscles": { icon: Dumbbell, color: "text-purple-300", accent: "border-purple-400/20 bg-purple-400/[0.06]", description: "Hypertrophy-focused programs" },
  "Build strength": { icon: Trophy, color: "text-yellow-300", accent: "border-yellow-400/20 bg-yellow-400/[0.06]", description: "Strength & powerlifting programs" },
  "Get in shape": { icon: Zap, color: "text-[rgb(var(--accent-light-rgb))]", accent: "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.06)]", description: "General fitness for beginners" },
  "Get lean": { icon: Target, color: "text-emerald-300", accent: "border-emerald-400/20 bg-emerald-400/[0.06]", description: "Cut body fat, keep muscle" },
  "Lose weight": { icon: Flame, color: "text-orange-300", accent: "border-orange-400/20 bg-orange-400/[0.06]", description: "High-calorie-burn programs" },
  "Overall fitness": { icon: Heart, color: "text-pink-300", accent: "border-pink-400/20 bg-pink-400/[0.06]", description: "Balanced full-body programs" },
};

function parseSchedule(schedule: string): number[] {
  const rangeMatch = schedule.match(/^(\w{3})–(\w{3})$/);
  if (rangeMatch) {
    const start = WEEKDAY_MAP[rangeMatch[1]];
    const end = WEEKDAY_MAP[rangeMatch[2]];
    if (start !== undefined && end !== undefined) {
      const days: number[] = [];
      for (let i = start; i <= end; i++) days.push(i);
      return days;
    }
  }
  const parts = schedule.split(/[\/,&]+/).map((s) => s.trim());
  const weekdays: number[] = [];
  for (const part of parts) {
    for (const [abbr, wd] of Object.entries(WEEKDAY_MAP)) {
      if (part.startsWith(abbr)) { weekdays.push(wd); break; }
    }
  }
  return weekdays;
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
        active
          ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.12)] text-[rgb(var(--accent-light-rgb))]"
          : "border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/15"
      }`}
    >
      {children}
    </button>
  );
}

type ViewMode = "browse" | "search";

export default function PlanBrowserModal({ open, onClose, onImport, importing, userSex }: Props) {
  const [envFilter, setEnvFilter] = useState<string>("All");
  const [daysFilter, setDaysFilter] = useState<number | null>(null);
  const [goalFilter, setGoalFilter] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("browse");

  const hasActiveFilters = envFilter !== "All" || daysFilter !== null || goalFilter !== "All" || levelFilter !== "All";
  const isSearching = searchQuery.trim().length > 0;

  const LEVEL_ORDER: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

  const sexFilter = userSex ?? "male";

  const filtered = useMemo(() => {
    return PLAN_LIBRARY.filter((p) => {
      if (p.sex && p.sex !== sexFilter) return false;
      if (!p.sex && sexFilter === "female") return false;
      if (envFilter !== "All" && p.env !== envFilter) return false;
      if (daysFilter !== null && p.days !== daysFilter) return false;
      if (goalFilter !== "All" && p.goal !== goalFilter) return false;
      if (levelFilter !== "All" && p.level !== levelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.split.toLowerCase().includes(q) && !p.sequence.toLowerCase().includes(q) && !p.goal.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.days - b.days || (LEVEL_ORDER[a.level] ?? 1) - (LEVEL_ORDER[b.level] ?? 1));
  }, [envFilter, daysFilter, goalFilter, levelFilter, searchQuery, sexFilter]);

  const groupedByDays = useMemo(() => {
    const groups: { days: number; plans: WorkoutPlan[] }[] = [];
    for (const dayCount of DAY_COUNTS) {
      const plans = filtered
        .filter((p) => p.days === dayCount)
        .sort((a, b) => (LEVEL_ORDER[a.level] ?? 1) - (LEVEL_ORDER[b.level] ?? 1) || a.goal.localeCompare(b.goal));
      if (plans.length > 0) groups.push({ days: dayCount, plans });
    }
    return groups;
  }, [filtered]);

  if (!open) return null;

  function clearFilters() {
    setEnvFilter("All");
    setDaysFilter(null);
    setGoalFilter("All");
    setLevelFilter("All");
  }

  const detail = selectedPlan;

  const content = (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[94vh] bg-[#080d18] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">

        {!detail ? (
          <>
            {/* Header */}
            <div className="px-5 pt-5 pb-3 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white/90">Plan Library</h2>
                  <p className="text-[10px] font-mono text-white/30 mt-0.5">{filtered.length} programs available</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/[0.08] text-white/35 hover:text-white/70 transition">
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.trim()) setViewMode("search"); else setViewMode("browse"); }}
                  placeholder="Search plans..."
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] pl-9 pr-10 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.3)]"
                />
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg transition ${filtersOpen || hasActiveFilters ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb))]" : "text-white/30 hover:text-white/60"}`}
                >
                  <SlidersHorizontal size={14} />
                </button>
              </div>

              {/* Filters (collapsible) */}
              {filtersOpen && (
                <div className="mt-3 space-y-2.5 pb-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-mono tracking-widest text-white/25">FILTERS</p>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] hover:text-[rgb(var(--accent-light-rgb))]">Clear all</button>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-white/25 mb-1.5">ENVIRONMENT</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={envFilter === "All"} onClick={() => setEnvFilter("All")}>All</Chip>
                      {PLAN_ENVIRONMENTS.map((e) => <Chip key={e} active={envFilter === e} onClick={() => setEnvFilter(e)}>{e}</Chip>)}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[9px] font-mono text-white/25 mb-1.5">DAYS / WEEK</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Chip active={daysFilter === null} onClick={() => setDaysFilter(null)}>All</Chip>
                        {DAY_COUNTS.map((d) => <Chip key={d} active={daysFilter === d} onClick={() => setDaysFilter(d)}>{d}D</Chip>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-white/25 mb-1.5">LEVEL</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Chip active={levelFilter === "All"} onClick={() => setLevelFilter("All")}>All</Chip>
                        {PLAN_LEVELS.map((l) => <Chip key={l} active={levelFilter === l} onClick={() => setLevelFilter(l)}>{l}</Chip>)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-white/25 mb-1.5">GOAL</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={goalFilter === "All"} onClick={() => setGoalFilter("All")}>All</Chip>
                      {PLAN_GOALS.map((g) => <Chip key={g} active={goalFilter === g} onClick={() => setGoalFilter(g)}>{g}</Chip>)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.04]" />

            {/* Plan List */}
            <div className="flex-1 overflow-y-auto custom-scroll px-4 py-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-9 h-9 mx-auto mb-3 rotate-45 border-2 border-white/15 rounded-sm" />
                  <p className="text-sm font-bold tracking-widest text-white/30">NO PLANS MATCH</p>
                  <p className="text-xs text-white/20 mt-1">Try adjusting your filters.</p>
                </div>
              ) : (isSearching || hasActiveFilters) ? (
                /* Flat list when searching or filtering */
                <div className="space-y-1.5">
                  {filtered.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} onClick={() => setSelectedPlan(plan)} />
                  ))}
                </div>
              ) : (
                /* Grouped by days/week when browsing */
                <div className="space-y-2">
                  {groupedByDays.map(({ days, plans }) => {
                    const isExpanded = expandedDays === days;
                    const displayPlans = isExpanded ? plans : plans.slice(0, 3);
                    const descriptions: Record<number, string> = {
                      2: "Light commitment, full coverage",
                      3: "Most popular — great balance",
                      4: "Serious training split",
                      5: "High frequency, dedicated lifters",
                      6: "Advanced high-volume programs",
                    };

                    return (
                      <div key={days} className="rounded-2xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
                        {/* Days Header */}
                        <button
                          onClick={() => setExpandedDays(isExpanded ? null : days)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition text-left"
                        >
                          <div className="w-9 h-9 rounded-xl border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.06)] flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{days}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-white/85">{days} Days / Week</p>
                            <p className="text-[10px] font-mono text-white/30">{plans.length} plans · {descriptions[days] || ""}</p>
                          </div>
                          <ChevronRight size={14} className={`text-white/20 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>

                        {/* Plan Cards */}
                        <div className="px-3 pb-3 space-y-1.5">
                          {displayPlans.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} compact showGoal onClick={() => setSelectedPlan(plan)} />
                          ))}
                          {!isExpanded && plans.length > 3 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedDays(days); }}
                              className="w-full py-2 text-[10px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] hover:text-[rgb(var(--accent-light-rgb))] transition rounded-lg hover:bg-white/[0.02]"
                            >
                              Show {plans.length - 3} more plans
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ─── Plan Detail ─── */
          <>
            {/* Detail Header */}
            <div className="px-5 pt-5 pb-4 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition mb-2">
                    <ChevronLeft size={12} /> ALL PLANS
                  </button>
                  <h2 className="text-lg font-bold text-white/90 leading-tight">{detail.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {(() => {
                      const meta = GOAL_META[detail.goal] || GOAL_META["Overall fitness"];
                      const GoalIcon = meta.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md border ${meta.accent} ${meta.color}`}>
                          <GoalIcon size={10} /> {detail.goal}
                        </span>
                      );
                    })()}
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[rgb(var(--accent-rgb)/0.08)] border border-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb)/0.6)]">{detail.env}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/30">{detail.level}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/30">{detail.split}</span>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/[0.08] text-white/35 hover:text-white/70 transition shrink-0">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-white/[0.04]" />

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto custom-scroll px-5 py-4 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <Calendar size={13} className="mx-auto mb-1.5 text-white/25" />
                  <p className="text-xs font-bold text-white/70">{detail.schedule}</p>
                  <p className="text-[8px] font-mono text-white/25 mt-0.5">SCHEDULE</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <Clock size={13} className="mx-auto mb-1.5 text-white/25" />
                  <p className="text-xs font-bold text-white/70">{detail.duration}</p>
                  <p className="text-[8px] font-mono text-white/25 mt-0.5">DURATION</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <BarChart3 size={13} className="mx-auto mb-1.5 text-white/25" />
                  <p className="text-[10px] font-bold text-white/70 leading-tight">{detail.volume}</p>
                  <p className="text-[8px] font-mono text-white/25 mt-0.5">VOLUME</p>
                </div>
              </div>

              {/* Note */}
              {detail.note && (
                <div className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <Info size={13} className="shrink-0 text-white/25 mt-0.5" />
                  <p className="text-[10px] text-white/40 leading-relaxed">{detail.note}</p>
                </div>
              )}

              {/* Workout days */}
              {detail.workouts.map((day) => {
                const weekdays = parseSchedule(detail.schedule);
                const dayLabel = weekdays[day.dayNum - 1] !== undefined
                  ? WEEKDAY_NAMES[weekdays[day.dayNum - 1]]
                  : `Day ${day.dayNum}`;
                return (
                  <div key={day.dayNum} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-white/25 w-8">{dayLabel}</span>
                        <span className="text-xs font-semibold text-white/80">{day.focus}</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/20">{day.exercises.length} ex</span>
                    </div>
                    <div className="px-3.5 py-1">
                      {day.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.03] last:border-b-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] font-mono text-white/15 w-4 shrink-0 text-right">{i + 1}</span>
                            <span className="text-[11px] text-white/65 truncate">{ex.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-white/30 shrink-0">{ex.sets}×{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Import Footer */}
            <div className="px-5 py-3.5 border-t border-white/[0.06] shrink-0">
              <button
                onClick={() => onImport(detail)}
                disabled={importing}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[rgb(var(--accent-rgb))] text-black hover:bg-[rgb(var(--accent-light-rgb))] disabled:opacity-30 transition"
                style={{ boxShadow: "0 0 24px -4px rgb(var(--accent-rgb) / 0.5)" }}
              >
                {importing ? "IMPORTING..." : "IMPORT THIS PLAN"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function PlanCard({ plan, compact, showGoal, onClick }: { plan: WorkoutPlan; compact?: boolean; showGoal?: boolean; onClick: () => void }) {
  const meta = GOAL_META[plan.goal] || GOAL_META["Overall fitness"];
  const GoalIcon = meta.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-white/[0.05] bg-white/[0.015] hover:border-[rgb(var(--accent-rgb)/0.2)] hover:bg-white/[0.03] transition group ${compact ? "p-3" : "p-3.5"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className={`${compact ? "text-[12px]" : "text-[13px]"} font-semibold text-white/85 leading-tight`}>{plan.name}</p>
        <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {showGoal ? (
          <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md border ${meta.accent} ${meta.color}`}>
            <GoalIcon size={9} /> {plan.goal}
          </span>
        ) : (
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[rgb(var(--accent-rgb)/0.08)] border border-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb)/0.6)]">{plan.days}D/WK</span>
        )}
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/30">{plan.level}</span>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/30">{plan.env}</span>
        <span className="text-[9px] font-mono text-white/20 ml-auto">{plan.duration}</span>
      </div>
    </button>
  );
}
