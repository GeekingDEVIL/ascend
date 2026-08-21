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
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-white/15 text-[7px] font-mono text-white/30 hover:text-white/50 hover:border-white/30 transition">?</button>
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 p-2.5 rounded-md bg-[#0d1320] border border-white/15 text-[9px] font-mono text-white/50 leading-relaxed shadow-lg" onClick={(e) => e.stopPropagation()}>
          <strong className="text-white/70">{term}</strong> — {text}
        </span>
      )}
    </span>
  );
}

function Card({ title, subtitle, children, accent }: { title: string; subtitle?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`rounded-lg border ${accent ? `border-${accent}/20 bg-${accent}/[0.03]` : "border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.02]"} p-4`} style={{ boxShadow: "inset 0 1px 0 rgb(var(--accent-rgb) / 0.06)" }}>
      <p className="text-[10px] font-mono tracking-widest text-white/25 mb-1">{title}</p>
      {subtitle && <p className="text-[8px] font-mono text-white/15 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-2" />}
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
    <Card title="EXPECTED VS ACTUAL" subtitle="How your real weight compares to what the math predicted">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="date" tick={{ fontSize: 7, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 7, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 10, fontFamily: "monospace" }} />
          <Line type="monotone" dataKey="predicted" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 2" dot={false} name="Expected" />
          <Line type="monotone" dataKey="actual" stroke="rgb(34,211,238)" dot={false} strokeWidth={2} name="Actual" connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <p className={`text-[9px] font-mono mt-2 ${dirColor}`}>{data.message}</p>
      <p className="text-[7px] font-mono text-white/15 mt-1">Average difference: {data.avgErrorKg > 0 ? "+" : ""}{data.avgErrorKg} kg</p>
    </Card>
  );
}

export function AnomalyCard({ data }: { data: AnomalyExplanation }) {
  if (!data.detected) return null;
  return (
    <Card title="WHY YOUR WEIGHT CHANGED" subtitle="Possible reasons for today's shift — not always fat gain or loss">
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
    <Card title="YOUR BODY IS ADJUSTING" subtitle="Your metabolism may have slowed down — this is normal during a diet">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${data.suggestDietBreak ? "bg-amber-400" : "bg-cyan-400"}`} />
        <p className="text-[9px] font-mono text-white/50">
          Burning ~{data.tdeeDrop} fewer calories/day over {data.overWeeks} weeks
          <InfoTip term="Why this happens" text="When you eat less for a while, your body adapts by burning slightly fewer calories. This is natural and temporary." />
        </p>
      </div>
      <p className="text-[8px] font-mono text-white/30">{data.message}</p>
    </Card>
  );
}

export function LeanMassCard({ data }: { data: LeanMassSignal }) {
  const colors = { favorable: "text-emerald-300", neutral: "text-white/40", concerning: "text-amber-300" };
  const icons = { favorable: "bg-emerald-400", neutral: "bg-white/20", concerning: "bg-amber-400" };
  const signals = { favorable: "LOOKING GOOD", neutral: "HOLDING STEADY", concerning: "KEEP AN EYE ON THIS" };
  return (
    <Card title="MUSCLE VS FAT CHECK" subtitle="Are you losing fat, gaining muscle, or both?">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">SCALE WEIGHT</p>
          <p className={`text-sm font-bold font-mono ${data.weightTrend === "falling" ? "text-emerald-300" : data.weightTrend === "rising" ? "text-amber-300" : "text-white/40"}`}>
            {data.weightTrend === "falling" ? "↓ Going down" : data.weightTrend === "rising" ? "↑ Going up" : "→ Steady"}
          </p>
        </div>
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">LIFT STRENGTH</p>
          <p className={`text-sm font-bold font-mono ${data.strengthTrend === "rising" ? "text-emerald-300" : data.strengthTrend === "falling" ? "text-red-300" : "text-white/40"}`}>
            {data.strengthTrend === "rising" ? "↑ Getting stronger" : data.strengthTrend === "falling" ? "↓ Dropping" : "→ Steady"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${icons[data.signal]}`} />
        <p className={`text-[9px] font-mono ${colors[data.signal]}`}>{signals[data.signal]}</p>
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
    <Card title="WEEKLY CALORIE BUDGET" subtitle="Your total calorie allowance for this week">
      <div className="text-center mb-3">
        <p className="text-2xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{data.remaining.toLocaleString()}</p>
        <p className="text-[9px] font-mono text-white/30">calories left this week</p>
      </div>
      <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all ${data.onTrack ? "bg-emerald-400/60" : "bg-amber-400/60"}`} style={{ width: `${pct}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-white/20" style={{ left: `${expectedPct}%` }} />
      </div>
      <div className="flex justify-between text-[7px] font-mono text-white/20">
        <span>{data.consumed.toLocaleString()} eaten so far</span>
        <span>{data.weeklyTarget.toLocaleString()} total budget</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">AVG PER DAY</p>
          <p className={`text-sm font-bold font-mono ${data.onTrack ? "text-emerald-300" : "text-amber-300"}`}>{data.dailyPace}</p>
          <p className="text-[7px] font-mono text-white/20">calories/day</p>
        </div>
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">{data.daysLeft > 0 ? "YOU CAN EAT" : "WEEK DONE"}</p>
          <p className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{data.dailyRemaining}</p>
          <p className="text-[7px] font-mono text-white/20">{data.daysLeft > 0 ? `per day for ${data.daysLeft} more days` : "great work"}</p>
        </div>
      </div>
      {ahead && <p className="text-[8px] font-mono text-amber-300/50 mt-2 text-center">You're eating a bit fast — try lighter meals the rest of the week to stay on track.</p>}
    </Card>
  );
}

export function RecoveryCard({ data }: { data: RecoveryAdjustment }) {
  if (data.severity === "none") return null;
  const colors = { mild: "text-cyan-300", moderate: "text-amber-300", aggressive: "text-red-300", none: "text-white/40" };
  const labels = { mild: "Small", moderate: "Moderate", aggressive: "Large", none: "" };
  return (
    <Card title="RECOVERY CHECK" subtitle="How your calorie deficit affects your gym performance">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${data.severity === "aggressive" ? "bg-red-400" : data.severity === "moderate" ? "bg-amber-400" : "bg-cyan-400"}`} />
        <p className={`text-[9px] font-mono ${colors[data.severity]}`}>
          {data.deficitPct}% calorie cut — {labels[data.severity].toLowerCase()} impact on recovery
          <InfoTip term="Why this matters" text="Eating fewer calories means your body has less energy to repair muscles after training. A bigger deficit = slower recovery." />
        </p>
      </div>
      <p className="text-[8px] font-mono text-white/25">{data.recommendation}</p>
      <p className="text-[7px] font-mono text-white/15 mt-1">Consider doing {Math.round(data.volumeMultiplier * 100)}% of your normal training volume</p>
    </Card>
  );
}

export function RecompCard({ data }: { data: RecompAssessment }) {
  return (
    <Card title="BODY RECOMPOSITION" subtitle="Building muscle while losing fat — tracked by weight + strength changes">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${data.successScore >= 70 ? "bg-emerald-400" : data.successScore >= 40 ? "bg-amber-400" : "bg-white/20"}`} />
          <p className="text-[9px] font-mono text-white/50">Progress: {data.successScore}/100</p>
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
  const phaseLabels: Record<CyclePhase, string> = {
    follicular: "Follicular (energy rising)",
    ovulation: "Ovulation (peak energy)",
    luteal: "Luteal (may feel heavier)",
    menstrual: "Period (water weight is normal)",
  };
  return (
    <Card title="CYCLE-AWARE TREND" subtitle="Weight naturally fluctuates with your cycle — this adjusts for that">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${data.currentPhase === "luteal" ? "bg-amber-400" : data.currentPhase === "menstrual" ? "bg-rose-400" : "bg-emerald-400"}`} />
        <p className={`text-[9px] font-mono ${phaseColors[data.currentPhase]}`}>{phaseLabels[data.currentPhase]}</p>
      </div>
      <p className="text-[8px] font-mono text-white/25 mb-2">{phaseInfo}</p>
      {data.samePhaseLastCycle !== null && (
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 mt-2">
          <p className="text-[8px] font-mono text-white/30">VS SAME POINT LAST CYCLE</p>
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
    <Card title="WORKOUT CALORIES BURNED" subtitle="Estimated energy used during this session">
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[8px] font-mono text-white/30">BURNED</p>
          <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{data.kcal}</p>
          <p className="text-[7px] font-mono text-white/20">calories</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-mono text-white/30">INTENSITY<InfoTip term="Intensity (MET)" text="How hard your body worked compared to rest. Higher = more intense. Walking is ~3, lifting weights is ~5." /></p>
          <p className="text-lg font-bold font-mono text-white/60">{data.met}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-mono text-white/30">TIME</p>
          <p className="text-lg font-bold font-mono text-white/60">{data.durationMinutes}</p>
          <p className="text-[7px] font-mono text-white/20">min</p>
        </div>
      </div>
      {adaptiveMode && (
        <p className="text-[7px] font-mono text-cyan-300/30 mt-2 text-center">For display only — your daily targets already account for exercise</p>
      )}
    </Card>
  );
}

export function PatternWarningsCard({ warnings }: { warnings: PatternWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <Card title="HEADS UP" subtitle="We noticed something in your recent data">
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
    <Card title="WHAT IF?" subtitle="Drag the slider to see how timeline changes affect your daily calories">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">DAILY TARGET</p>
          <p className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{scenario.dailyTarget}</p>
          <p className="text-[7px] font-mono text-white/20">calories</p>
        </div>
        <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2 text-center">
          <p className="text-[8px] font-mono text-white/30">GOAL DATE</p>
          <p className="text-sm font-bold font-mono text-white/60">{scenario.etaDays}d</p>
          <p className="text-[7px] font-mono text-white/20">{scenario.etaDate}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-[7px] font-mono text-white/25 mb-1">Adjust timeline</p>
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
    <Card title="TIME FOR A BREAK?" subtitle="Your body may benefit from eating at maintenance for a bit">
      <p className="text-[8px] font-mono text-white/30 mb-3">{suggestion}</p>
      <button
        onClick={onStart}
        className="w-full text-[9px] font-mono py-2 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb)/0.6)] hover:text-[rgb(var(--accent-light-rgb))] hover:border-[rgb(var(--accent-rgb)/0.5)] transition"
      >
        Start a diet break (7-14 days at normal eating)
      </button>
    </Card>
  );
}
