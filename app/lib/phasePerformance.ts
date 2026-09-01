import { type CyclePhase, estimateCyclePhase } from "./cycleAwareTrend";

export type PhaseStats = {
  phase: CyclePhase;
  label: string;
  workouts: number;
  avgVolume: number;
  avgDuration: number; // seconds
  avgSets: number;
  totalVolume: number;
  color: string;
};

export type PhasePerformanceResult = {
  phases: PhaseStats[];
  bestPhase: PhaseStats | null;
  worstPhase: PhaseStats | null;
  recommendation: string;
};

type SessionInput = {
  date: string;
  total_volume: number;
  total_sets: number;
  duration_seconds: number;
};

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

const PHASE_COLORS: Record<CyclePhase, string> = {
  menstrual: "#f87171",
  follicular: "#34d399",
  ovulation: "#fbbf24",
  luteal: "#a78bfa",
};

const PHASE_ORDER: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];

export function buildPhasePerformance(
  sessions: SessionInput[],
  lastPeriodStart: string,
  cycleLength: number = 28,
): PhasePerformanceResult | null {
  if (sessions.length < 4) return null;

  const buckets = new Map<CyclePhase, { volumes: number[]; durations: number[]; sets: number[] }>();
  for (const p of PHASE_ORDER) {
    buckets.set(p, { volumes: [], durations: [], sets: [] });
  }

  for (const s of sessions) {
    const { phase } = estimateCyclePhase(lastPeriodStart, cycleLength, s.date);
    const b = buckets.get(phase)!;
    b.volumes.push(Number(s.total_volume) || 0);
    b.durations.push(s.duration_seconds || 0);
    b.sets.push(Number(s.total_sets) || 0);
  }

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const phases: PhaseStats[] = PHASE_ORDER.map((p) => {
    const b = buckets.get(p)!;
    return {
      phase: p,
      label: PHASE_LABELS[p],
      workouts: b.volumes.length,
      avgVolume: Math.round(avg(b.volumes)),
      avgDuration: Math.round(avg(b.durations)),
      avgSets: Math.round(avg(b.sets) * 10) / 10,
      totalVolume: Math.round(sum(b.volumes)),
      color: PHASE_COLORS[p],
    };
  });

  const withData = phases.filter((p) => p.workouts >= 2);
  if (withData.length < 2) return null;

  const bestPhase = withData.reduce((a, b) => (b.avgVolume > a.avgVolume ? b : a));
  const worstPhase = withData.reduce((a, b) => (b.avgVolume < a.avgVolume ? b : a));

  let recommendation = "";
  if (bestPhase.phase === "follicular" || bestPhase.phase === "ovulation") {
    recommendation = `You perform best in your ${bestPhase.label.toLowerCase()} phase — this aligns with peak estrogen and testosterone. Schedule your hardest sessions here.`;
  } else if (bestPhase.phase === "luteal") {
    recommendation = `Interesting — your highest volume is in the luteal phase, when most people feel weaker. You may respond well to steady-state training. Keep pushing!`;
  } else {
    recommendation = `Your menstrual phase shows the highest volume — you're resilient through your period. Listen to your body on heavy days.`;
  }

  if (worstPhase.workouts > 0 && worstPhase.avgVolume < bestPhase.avgVolume * 0.7) {
    recommendation += ` Consider lighter, recovery-focused sessions during your ${worstPhase.label.toLowerCase()} phase.`;
  }

  return { phases, bestPhase, worstPhase, recommendation };
}
