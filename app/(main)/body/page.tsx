"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Ruler, Plus, X, TrendingUp, TrendingDown, Target, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import SwipeNav from "../../components/ui/swipe-nav";
import { getTrackSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";

const BODY_PARTS = [
  { id: "neck", label: "Neck", x: 50, y: 12 },
  { id: "shoulders", label: "Shoulders", x: 50, y: 17 },
  { id: "chest", label: "Chest", x: 50, y: 24 },
  { id: "left_bicep", label: "L Bicep", x: 22, y: 28 },
  { id: "right_bicep", label: "R Bicep", x: 78, y: 28 },
  { id: "left_forearm", label: "L Forearm", x: 16, y: 38 },
  { id: "right_forearm", label: "R Forearm", x: 84, y: 38 },
  { id: "waist", label: "Waist", x: 50, y: 36 },
  { id: "hips", label: "Hips", x: 50, y: 44 },
  { id: "left_thigh", label: "L Thigh", x: 38, y: 56 },
  { id: "right_thigh", label: "R Thigh", x: 62, y: 56 },
  { id: "left_calf", label: "L Calf", x: 38, y: 76 },
  { id: "right_calf", label: "R Calf", x: 62, y: 76 },
] as const;

type BodyPartId = (typeof BODY_PARTS)[number]["id"];

type Measurement = {
  id: string;
  body_part: string;
  value_cm: number;
  measured_at: string;
  note: string | null;
};

type LatestMap = Record<string, { current: number; previous: number | null; date: string }>;
type GoalMap = Record<string, number>;

function Sparkline({ values, goal }: { values: number[]; goal?: number }) {
  if (values.length < 2) return null;
  const all = goal ? [...values, goal] : values;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const pad = 2;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const goalY = goal ? h - pad - ((goal - min) / range) * (h - pad * 2) : null;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      {goalY !== null && (
        <line x1={pad} y1={goalY} x2={w - pad} y2={goalY} stroke="rgb(var(--accent-rgb))" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
      )}
      <polyline points={points.join(" ")} fill="none" stroke="rgb(16 185 129 / 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].split(",")[0]} cy={points[points.length - 1].split(",")[1]} r="2" fill="rgb(16 185 129)" />
    </svg>
  );
}

export default function BodyPage() {
  const { user } = useAuth();
  const { enabledKeys } = useModules();
  const sections = getTrackSections(enabledKeys);
  const [latest, setLatest] = useState<LatestMap>({});
  const [selected, setSelected] = useState<BodyPartId | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Measurement[]>([]);
  const [goals, setGoals] = useState<GoalMap>({});

  const loadData = useCallback(async () => {
    if (!user) return;
    const [{ data: mData }, { data: gData }] = await Promise.all([
      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .limit(200),
      supabase
        .from("measurement_goals")
        .select("body_part, target_cm")
        .eq("user_id", user.id),
    ]);

    if (mData) {
      const map: LatestMap = {};
      for (const m of mData as Measurement[]) {
        if (!map[m.body_part]) {
          map[m.body_part] = { current: m.value_cm, previous: null, date: m.measured_at };
        } else if (map[m.body_part].previous === null) {
          map[m.body_part].previous = m.value_cm;
        }
      }
      setLatest(map);
      setHistory(mData as Measurement[]);
    }

    if (gData) {
      const gm: GoalMap = {};
      for (const g of gData) gm[g.body_part] = Number(g.target_cm);
      setGoals(gm);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveMeasurement() {
    if (!user || !selected || !inputValue.trim()) return;
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    await supabase.from("body_measurements").insert({
      user_id: user.id,
      body_part: selected,
      value_cm: val,
    });
    setSaving(false);
    setInputValue("");
    setSelected(null);
    setShowGoalInput(false);
    loadData();
  }

  async function saveGoal() {
    if (!user || !selected || !goalInput.trim()) return;
    const val = parseFloat(goalInput);
    if (isNaN(val) || val <= 0) return;
    setSavingGoal(true);
    await supabase.from("measurement_goals").upsert({
      user_id: user.id,
      body_part: selected,
      target_cm: val,
    }, { onConflict: "user_id,body_part" });
    setSavingGoal(false);
    setGoalInput("");
    setShowGoalInput(false);
    loadData();
  }

  async function removeGoal() {
    if (!user || !selected) return;
    await supabase.from("measurement_goals").delete().eq("user_id", user.id).eq("body_part", selected);
    loadData();
  }

  const measuredCount = Object.keys(latest).length;
  const selectedPart = BODY_PARTS.find((p) => p.id === selected);
  const selectedHistory = useMemo(
    () => selected ? history.filter((m) => m.body_part === selected).slice(0, 10) : [],
    [selected, history],
  );

  const historyByPart = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const m of history) {
      if (!map[m.body_part]) map[m.body_part] = [];
      map[m.body_part].push(m.value_cm);
    }
    for (const k of Object.keys(map)) map[k] = map[k].reverse();
    return map;
  }, [history]);

  function getDelta(partId: string): { delta: number; trend: "up" | "down" | "same" } | null {
    const entry = latest[partId];
    if (!entry || entry.previous === null) return null;
    const delta = entry.current - entry.previous;
    return { delta, trend: delta > 0.1 ? "up" : delta < -0.1 ? "down" : "same" };
  }

  function getGoalProgress(partId: string): { pct: number; remaining: number; direction: "gain" | "lose" } | null {
    const entry = latest[partId];
    const goal = goals[partId];
    if (!entry || goal === undefined) return null;
    const first = historyByPart[partId]?.[0] ?? entry.current;
    const totalNeeded = goal - first;
    if (Math.abs(totalNeeded) < 0.1) return { pct: 100, remaining: 0, direction: "gain" };
    const achieved = entry.current - first;
    const pct = Math.min(100, Math.max(0, (achieved / totalNeeded) * 100));
    return { pct, remaining: Math.abs(goal - entry.current), direction: goal > first ? "gain" : "lose" };
  }

  return (
    <>
      <SwipeNav sections={sections} />
      <div className="px-4 pt-6 pb-32 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <Ruler size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white/90 font-display">Body Measurements</h1>
            <p className="text-[10px] font-mono text-white/30">{measuredCount}/{BODY_PARTS.length} tracked · {Object.keys(goals).length} goals</p>
          </div>
        </div>

        {/* Body Diagram */}
        <div className="glass-card p-4 mb-4">
          <p className="section-label mb-3">TAP A BODY PART TO LOG</p>
          <div className="relative w-full" style={{ aspectRatio: "1/1.6" }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="6" rx="5" ry="5.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <rect x="47.5" y="11" width="5" height="3" rx="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
              <path d="M35 14 Q35 14 30 16 L28 28 L32 44 L40 48 L50 50 L60 48 L68 44 L72 28 L70 16 Q65 14 65 14 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <path d="M30 16 L22 20 L18 30 L14 40 L12 46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <path d="M70 16 L78 20 L82 30 L86 40 L88 46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <path d="M40 48 L36 60 L34 72 L34 85 L33 95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <path d="M60 48 L64 60 L66 72 L66 85 L67 95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <path d="M32 36 Q50 38 68 36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeDasharray="1 1" />
              <path d="M34 44 Q50 46 66 44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeDasharray="1 1" />
            </svg>

            {BODY_PARTS.map((part) => {
              const entry = latest[part.id];
              const isSelected = selected === part.id;
              const deltaInfo = getDelta(part.id);
              const hasGoal = goals[part.id] !== undefined;
              return (
                <button
                  key={part.id}
                  onClick={() => { setSelected(isSelected ? null : part.id); setInputValue(entry ? String(entry.current) : ""); setShowGoalInput(false); setGoalInput(goals[part.id] ? String(goals[part.id]) : ""); }}
                  className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${part.x}%`, top: `${part.y}%` }}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-[rgb(var(--accent-rgb))] bg-[rgb(var(--accent-rgb)/0.3)] scale-125 shadow-[0_0_12px_rgb(var(--accent-rgb)/0.4)]"
                      : entry
                        ? hasGoal ? "border-emerald-400/60 bg-emerald-400/20 hover:scale-110 ring-1 ring-emerald-400/20 ring-offset-1 ring-offset-transparent" : "border-emerald-400/50 bg-emerald-400/15 hover:scale-110"
                        : "border-white/15 bg-white/5 hover:border-white/30 hover:scale-110"
                  }`}>
                    {entry && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />}
                  </div>
                  <div className={`mt-0.5 text-center transition-opacity ${isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                    <p className="text-[7px] font-mono text-white/40 whitespace-nowrap">{part.label}</p>
                    {entry && (
                      <div className="flex items-center gap-0.5 justify-center">
                        <p className="text-[8px] font-mono text-emerald-300/70 font-bold">{entry.current}cm</p>
                        {deltaInfo && deltaInfo.trend !== "same" && (
                          deltaInfo.trend === "up"
                            ? <TrendingUp size={7} className="text-red-400/60" />
                            : <TrendingDown size={7} className="text-emerald-400/60" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Measurement input panel */}
        {selected && selectedPart && (
          <div className="glass-card p-4 mb-4 border-[rgb(var(--accent-rgb)/0.2)]" style={{ boxShadow: "0 0 30px -8px rgb(var(--accent-rgb) / 0.15)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-white/90">{selectedPart.label}</p>
                {latest[selected] && (
                  <p className="text-[9px] font-mono text-white/30">
                    Last: {latest[selected].current}cm on {new Date(latest[selected].date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button onClick={() => { setSelected(null); setShowGoalInput(false); }} className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition">
                <X size={14} />
              </button>
            </div>

            {/* Input row */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0.0"
                  onKeyDown={(e) => e.key === "Enter" && saveMeasurement()}
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/25">cm</span>
              </div>
              <button
                onClick={saveMeasurement}
                disabled={saving || !inputValue.trim()}
                className="shrink-0 w-12 h-12 rounded-xl bg-[rgb(var(--accent-rgb))] text-black flex items-center justify-center hover:brightness-110 transition disabled:opacity-40"
                style={{ boxShadow: "0 0 16px -3px rgb(var(--accent-rgb) / 0.6)" }}
              >
                {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Plus size={20} />}
              </button>
            </div>

            {/* Goal section */}
            {goals[selected] && !showGoalInput ? (
              <div className="flex items-center gap-2 mb-3 rounded-lg bg-emerald-400/[0.05] border border-emerald-400/10 px-3 py-2">
                <Target size={12} className="text-emerald-400/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-mono text-emerald-300/60">Goal: {goals[selected]}cm</p>
                  {(() => {
                    const prog = getGoalProgress(selected);
                    if (!prog) return null;
                    return (
                      <div className="mt-1">
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-400/60 transition-all" style={{ width: `${prog.pct}%` }} />
                        </div>
                        <p className="text-[8px] font-mono text-white/25 mt-0.5">
                          {prog.pct >= 100 ? "Goal reached!" : `${prog.remaining.toFixed(1)}cm to ${prog.direction === "gain" ? "gain" : "lose"} · ${Math.round(prog.pct)}%`}
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <button onClick={() => { setShowGoalInput(true); setGoalInput(String(goals[selected])); }} className="text-[9px] font-mono text-white/25 hover:text-white/50 transition">Edit</button>
                <button onClick={removeGoal} className="text-[9px] font-mono text-red-400/30 hover:text-red-400/60 transition">
                  <X size={10} />
                </button>
              </div>
            ) : showGoalInput ? (
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Target size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/40" />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Target cm"
                    onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                    className="w-full h-10 rounded-lg bg-emerald-400/[0.04] border border-emerald-400/15 pl-8 pr-3 text-sm font-mono text-center focus:outline-none focus:border-emerald-400/30 transition"
                  />
                </div>
                <button
                  onClick={saveGoal}
                  disabled={savingGoal || !goalInput.trim()}
                  className="shrink-0 h-10 px-3 rounded-lg bg-emerald-400/15 border border-emerald-400/20 text-emerald-300 text-xs font-mono hover:bg-emerald-400/25 transition disabled:opacity-40"
                >
                  {savingGoal ? "..." : <Check size={14} />}
                </button>
                <button onClick={() => setShowGoalInput(false)} className="shrink-0 h-10 px-2 rounded-lg border border-white/10 text-white/30 hover:text-white/60 transition">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowGoalInput(true)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-white/20 hover:text-emerald-300/60 transition mb-3"
              >
                <Target size={10} /> Set goal
              </button>
            )}

            {/* Sparkline trend */}
            {selectedHistory.length >= 2 && (
              <div className="flex items-center gap-3 mb-3 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <Sparkline values={historyByPart[selected] ?? []} goal={goals[selected]} />
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-white/30">Trend ({selectedHistory.length} entries)</p>
                  {(() => {
                    const vals = historyByPart[selected];
                    if (!vals || vals.length < 2) return null;
                    const total = vals[vals.length - 1] - vals[0];
                    return (
                      <p className={`text-[10px] font-mono font-bold ${total > 0 ? "text-red-400/60" : total < 0 ? "text-emerald-400/60" : "text-white/30"}`}>
                        {total > 0 ? "+" : ""}{total.toFixed(1)}cm overall
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Mini history */}
            {selectedHistory.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono text-white/20">RECENT</p>
                {selectedHistory.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/30">{new Date(m.measured_at).toLocaleDateString()}</span>
                    <span className="text-white/60 font-bold">{m.value_cm} cm</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary cards */}
        {!loading && measuredCount > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {BODY_PARTS.filter((p) => latest[p.id]).map((part) => {
              const entry = latest[part.id];
              const deltaInfo = getDelta(part.id);
              const sparkVals = historyByPart[part.id];
              const goal = goals[part.id];
              const prog = getGoalProgress(part.id);
              return (
                <button
                  key={part.id}
                  onClick={() => { setSelected(part.id); setInputValue(String(entry.current)); setShowGoalInput(false); setGoalInput(goal ? String(goal) : ""); }}
                  className="glass-card glass-card-interactive p-3 text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-mono text-white/30">{part.label.toUpperCase()}</p>
                    {sparkVals && sparkVals.length >= 2 && <Sparkline values={sparkVals} goal={goal} />}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-lg font-bold font-display text-white/80">{entry.current}</p>
                    <p className="text-[10px] font-mono text-white/25">cm</p>
                    {deltaInfo && deltaInfo.trend !== "same" && (
                      <span className={`text-[9px] font-mono ml-auto ${deltaInfo.trend === "down" ? "text-emerald-400/60" : "text-red-400/50"}`}>
                        {deltaInfo.delta > 0 ? "+" : ""}{deltaInfo.delta.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {prog && (
                    <div className="mt-1.5">
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400/50 transition-all" style={{ width: `${prog.pct}%` }} />
                      </div>
                      <p className="text-[7px] font-mono text-white/20 mt-0.5">
                        {prog.pct >= 100 ? "Goal reached" : `${prog.remaining.toFixed(1)}cm to go`} · {goal}cm
                      </p>
                    </div>
                  )}
                  {!prog && <p className="text-[8px] font-mono text-white/15 mt-1">{new Date(entry.date).toLocaleDateString()}</p>}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && measuredCount === 0 && !selected && (
          <div className="glass-card p-6 text-center">
            <Ruler size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/40 mb-1">No measurements yet</p>
            <p className="text-[10px] font-mono text-white/20">Tap any point on the body diagram above to start tracking</p>
          </div>
        )}
      </div>
    </>
  );
}
