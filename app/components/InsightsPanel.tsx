"use client";

import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import { type PredictionAccuracy } from "../lib/predictionReality";
import { type AnomalyExplanation } from "../lib/anomalyExplainer";
import { type AdaptationSignal } from "../lib/metabolicAdaptation";
import { type LeanMassSignal } from "../lib/leanMassSignal";
import { type WeeklyBudget } from "../lib/weeklyBudget";
import { type RecoveryAdjustment } from "../lib/recoveryEngine";
import { type RecompAssessment } from "../lib/recompMode";
import { type ScenarioResult } from "../lib/scenarioModeling";
import { type CycleAwareComparison, type CyclePhase, getCyclePhaseInfo } from "../lib/cycleAwareTrend";
import { type SessionExpenditure } from "../lib/exerciseExpenditure";
import { type PatternWarning } from "../lib/energyGuardrails";

function InfoTip({ term, text }: { term: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-white/15 text-[6px] font-mono text-white/25 hover:text-white/50 hover:border-white/30 transition">i</button>
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 p-2 rounded-md bg-[#0d1320] border border-white/15 text-[8px] font-mono text-white/50 leading-relaxed shadow-lg" onClick={(e) => e.stopPropagation()}>
          <strong className="text-white/70">{term}</strong> — {text}
        </span>
      )}
    </span>
  );
}

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`rounded-lg border ${accent ? `border-${accent}/20 bg-${accent}/[0.03]` : "border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.02]"} p-4`} style={{ boxShadow: "inset 0 1px 0 rgb(var(--accent-rgb) / 0.06)" }}>
      <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">{title}</p>
      {children}
    </div>
  );
}

export function PredictionVsRealityCard({ data }: { data: PredictionAccuracy }) {
  if (data.points.length < 7) return null;
  const chartData = data.points.filter((_, i) => i % Math.max(1, Math.floor(data.points.length / 30)) === 0).map((p) => ({
    date: p.date.slice(5),
    predicted: p.predicted,
    actual: p.actual,
  }));

  const dirColor = data.direction === "accurate" ? "text-emerald-300" : data.direction === "overshoot" ? "text-cyan-300" : "text-amber-300";

  return (
    <Card title="PREDICTION VS REALITY">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="date" tick={{ fontSize: 7, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 7, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 10, fontFamily: "monospace" }} />
          <Line type="monotone" dataKey="predicted" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 2" dot={false} name="Predicted" />
          <Line type="monotone" dataKey="actual" stroke="rgb(34,211,238)" dot={false} strokeWidth={2} name="Actual" connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <p className={`text-[9px] font-mono mt-2 ${dirColor}`}>{data.message}</p>
      <p className="text-[7px] font-mono text-white/15 mt-1">Avg error: {data.avgErrorKg > 0 ? "+" : ""}{data.avgErrorKg} kg</p>
    </Card>
  );
}

export function AnomalyCard({ data }: { data: AnomalyExplanation }) {
  if (!data.detected) return null;
  return (
    <Card title="WEIGHT CHANGE EXPLAINED">
      <p className="text-sm font-bold font-mono text-amber-300 mb-2">{data.summary}</p>
      <div className="space-y-2">
        {data.explanations.map((e, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${e.likelihood === "high" ? "bg-emerald-400" : e.likelihood === "medium" ? "bg-amber-400" : "bg-white/20"}`} />
            <div>
              <p className="text-[9px] font-mono text-white/50">{e.factor}</p>
              <p className="text-[8px] font-mono text-white/25">{e.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdaptationCard({ data }: { data: AdaptationSignal }) {
  if (!data.detected) return null;
  return (
    <Card title="METABOLIC ADAPTATION">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${data.suggestDietBreak ? "bg-amber-400" : "bg-cyan-400"}`} />
        <p className="text-[9px] font-mono text-white/50">
          TDEE down {data.tdeeDrop} kcal over {data.overWeeks} weeks
          <InfoTip term="TDEE" text="Total Daily Energy Expenditure — how many calories your body burns in a day" />
        </p>
      </div>
      <p className="text-[8px] font-mono text-white/30">{data.message}</p>
    </Card>
  );
}

export function LeanMassCard({ data }: { data: LeanMassSignal }) {
  const colors = { favorable: "text-emerald-300", neutral: "text-white/40", concerning: "text-amber-300" };
  const icons = { favorable: "bg-emerald-400", neutral: "bg-white/20", concerning: "bg-amber-400" };
  return (
    <Card title="BODY COMPOSITION SIGNAL">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">WEIGHT</p>
          <p className={`text-sm font-bold font-mono ${data.weightTrend === "falling" ? "text-emerald-300" : data.weightTrend === "rising" ? "text-amber-300" : "text-white/40"}`}>
            {data.weightTrend === "falling" ? "↓ Falling" : data.weightTrend === "rising" ? "↑ Rising" : "→ Stable"}
          </p>
        </div>
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">STRENGTH</p>
          <p className={`text-sm font-bold font-mono ${data.strengthTrend === "rising" ? "text-emerald-300" : data.strengthTrend === "falling" ? "text-red-300" : "text-white/40"}`}>
            {data.strengthTrend === "rising" ? "↑ Rising" : data.strengthTrend === "falling" ? "↓ Falling" : "→ Stable"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${icons[data.signal]}`} />
        <p className={`text-[9px] font-mono ${colors[data.signal]}`}>
          {data.signal === "favorable" ? "FAVORABLE" : data.signal === "concerning" ? "NEEDS ATTENTION" : "NEUTRAL"}
        </p>
      </div>
      <p className="text-[8px] font-mono text-white/25">{data.message}</p>
    </Card>
  );
}

export function WeeklyBudgetCard({ data }: { data: WeeklyBudget }) {
  const pct = data.weeklyTarget > 0 ? Math.min((data.consumed / data.weeklyTarget) * 100, 100) : 0;
  const expectedPct = (data.daysPassed / 7) * 100;
  const ahead = pct > expectedPct + 5;

  return (
    <Card title="WEEKLY BUDGET">
      <div className="text-center mb-3">
        <p className="text-2xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{data.remaining.toLocaleString()}</p>
        <p className="text-[9px] font-mono text-white/30">kcal remaining this week</p>
      </div>
      <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${data.onTrack ? "bg-emerald-400/60" : "bg-amber-400/60"}`} style={{ width: `${pct}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-white/20" style={{ left: `${expectedPct}%` }} />
      </div>
      <div className="flex justify-between text-[7px] font-mono text-white/20">
        <span>{data.consumed.toLocaleString()} consumed</span>
        <span>{data.weeklyTarget.toLocaleString()} target</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">DAILY PACE</p>
          <p className={`text-sm font-bold font-mono ${data.onTrack ? "text-emerald-300" : "text-amber-300"}`}>{data.dailyPace}</p>
          <p className="text-[7px] font-mono text-white/20">kcal/day avg</p>
        </div>
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">{data.daysLeft > 0 ? "DAILY BUDGET LEFT" : "WEEK COMPLETE"}</p>
          <p className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{data.dailyRemaining}</p>
          <p className="text-[7px] font-mono text-white/20">{data.daysLeft}d remaining</p>
        </div>
      </div>
      {ahead && <p className="text-[8px] font-mono text-amber-300/50 mt-2 text-center">Slightly ahead of pace — consider lighter meals for the rest of the week.</p>}
    </Card>
  );
}

export function RecoveryCard({ data }: { data: RecoveryAdjustment }) {
  if (data.severity === "none") return null;
  const colors = { mild: "text-cyan-300", moderate: "text-amber-300", aggressive: "text-red-300", none: "text-white/40" };
  return (
    <Card title="RECOVERY ADJUSTMENT">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${data.severity === "aggressive" ? "bg-red-400" : data.severity === "moderate" ? "bg-amber-400" : "bg-cyan-400"}`} />
        <p className={`text-[9px] font-mono ${colors[data.severity]}`}>{data.deficitPct}% deficit — {data.severity} impact on recovery</p>
      </div>
      <p className="text-[8px] font-mono text-white/25">{data.recommendation}</p>
      <p className="text-[7px] font-mono text-white/15 mt-1">Suggested volume multiplier: {data.volumeMultiplier}×</p>
    </Card>
  );
}

export function RecompCard({ data }: { data: RecompAssessment }) {
  return (
    <Card title="RECOMP PROGRESS">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${data.successScore >= 70 ? "bg-emerald-400" : data.successScore >= 40 ? "bg-amber-400" : "bg-white/20"}`} />
          <p className="text-[9px] font-mono text-white/50">Score: {data.successScore}/100</p>
        </div>
        <p className="text-[8px] font-mono text-white/20">{data.weeksTracked} weeks tracked</p>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <div className={`h-full rounded-full ${data.successScore >= 70 ? "bg-emerald-400/60" : data.successScore >= 40 ? "bg-amber-400/60" : "bg-white/10"}`} style={{ width: `${data.successScore}%` }} />
      </div>
      <p className="text-[8px] font-mono text-white/30">{data.message}</p>
    </Card>
  );
}

export function CycleCard({ data, phaseInfo }: { data: CycleAwareComparison; phaseInfo: string }) {
  const phaseColors: Record<CyclePhase, string> = {
    follicular: "text-emerald-300",
    ovulation: "text-cyan-300",
    luteal: "text-amber-300",
    menstrual: "text-rose-300",
  };
  return (
    <Card title="CYCLE-AWARE TREND">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${data.currentPhase === "luteal" ? "bg-amber-400" : data.currentPhase === "menstrual" ? "bg-rose-400" : "bg-emerald-400"}`} />
        <p className={`text-[9px] font-mono ${phaseColors[data.currentPhase]} capitalize`}>{data.currentPhase} phase</p>
      </div>
      <p className="text-[8px] font-mono text-white/25 mb-2">{phaseInfo}</p>
      {data.samePhaseLastCycle !== null && (
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 mt-2">
          <p className="text-[8px] font-mono text-white/30">VS SAME PHASE LAST CYCLE</p>
          <p className={`text-sm font-bold font-mono ${data.deltaKg !== null && data.deltaKg < 0 ? "text-emerald-300" : "text-white/50"}`}>
            {data.deltaKg !== null ? `${data.deltaKg > 0 ? "+" : ""}${data.deltaKg} kg` : "—"}
          </p>
          <p className="text-[7px] font-mono text-white/20">{data.adjustedTrend}</p>
        </div>
      )}
    </Card>
  );
}

export function ExerciseExpenditureCard({ data, adaptiveMode }: { data: SessionExpenditure; adaptiveMode: boolean }) {
  return (
    <Card title="SESSION EXPENDITURE">
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[8px] font-mono text-white/30">CALORIES</p>
          <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{data.kcal}</p>
          <p className="text-[7px] font-mono text-white/20">kcal</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-mono text-white/30">MET<InfoTip term="MET" text="Metabolic Equivalent of Task — measures exercise intensity. 1 MET = resting. 3.5-6.0 for resistance training." /></p>
          <p className="text-lg font-bold font-mono text-white/60">{data.met}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-mono text-white/30">DURATION</p>
          <p className="text-lg font-bold font-mono text-white/60">{data.durationMinutes}</p>
          <p className="text-[7px] font-mono text-white/20">min</p>
        </div>
      </div>
      {adaptiveMode && (
        <p className="text-[7px] font-mono text-cyan-300/30 mt-2 text-center">Display only — adaptive mode already includes exercise in TDEE</p>
      )}
    </Card>
  );
}

export function PatternWarningsCard({ warnings }: { warnings: PatternWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <Card title="PATTERN DETECTED">
      <div className="space-y-2">
        {warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-[9px] mt-0.5 shrink-0 ${w.severity === "concern" ? "text-red-400" : w.severity === "warning" ? "text-amber-400" : "text-cyan-400"}`}>
              {w.severity === "concern" ? "⚠" : w.severity === "warning" ? "◆" : "ⓘ"}
            </span>
            <div>
              <p className="text-[9px] font-mono text-white/50">{w.pattern}</p>
              <p className="text-[8px] font-mono text-white/25">{w.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ScenarioCard({ scenario, onDateChange, onTargetChange }: {
  scenario: ScenarioResult;
  onDateChange: (days: number) => void;
  onTargetChange: (kcal: number) => void;
}) {
  return (
    <Card title="SCENARIO MODELING">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">DAILY TARGET</p>
          <p className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{scenario.dailyTarget}</p>
          <p className="text-[7px] font-mono text-white/20">kcal</p>
        </div>
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">ETA</p>
          <p className="text-sm font-bold font-mono text-white/60">{scenario.etaDays}d</p>
          <p className="text-[7px] font-mono text-white/20">{scenario.etaDate}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-[7px] font-mono text-white/25 mb-1">Adjust timeline (days)</p>
          <input
            type="range"
            min={30}
            max={365}
            value={scenario.etaDays}
            onChange={(e) => onDateChange(Number(e.target.value))}
            className="w-full h-1 accent-[rgb(var(--accent-rgb))] bg-white/10 rounded-full appearance-none"
          />
          <div className="flex justify-between text-[7px] font-mono text-white/15">
            <span>1 month</span>
            <span>1 year</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${scenario.feasibility.feasible ? "bg-emerald-400" : "bg-amber-400"}`} />
        <p className="text-[8px] font-mono text-white/30">{scenario.feasibility.reason}</p>
      </div>
      <p className="text-[7px] font-mono text-white/15 mt-1">Rate: {scenario.rateKgPerWeek} kg/week</p>
    </Card>
  );
}

export function DietBreakCard({ onStart, suggestion }: { onStart: () => void; suggestion: string }) {
  return (
    <Card title="DIET BREAK SUGGESTED">
      <p className="text-[8px] font-mono text-white/30 mb-3">{suggestion}</p>
      <button
        onClick={onStart}
        className="w-full text-[9px] font-mono py-2 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb)/0.6)] hover:text-[rgb(var(--accent-light-rgb))] hover:border-[rgb(var(--accent-rgb)/0.5)] transition"
      >
        Start diet break (7-14 days at maintenance)
      </button>
    </Card>
  );
}
