import { calcAdherence } from "./intakeLog";

const KCAL_PER_KG = 7700;
const MIN_DAYS_FOR_OBSERVED = 14;
const IDEAL_DAYS = 28;
const MIN_ADHERENCE_PCT = 80;
const DAMPING_FACTOR = 0.5;
const MAX_ADJUSTMENT_PCT = 0.10;

export type TdeeEstimate = {
  value: number;
  method: "seed" | "observed";
  confidence: [number, number];
  adherencePct: number;
  windowDays: number;
  inputs: { avgIntake: number; trendDeltaKg: number };
  periodStart: string;
  periodEnd: string;
};

export function estimateObservedTdee(params: {
  dailyIntakes: { date: string; kcal: number }[];
  trendWeights: { date: string; ema_kg: number }[];
  seedTdee: number;
  previousEstimate: number | null;
  phase?: string;
}): TdeeEstimate {
  const { dailyIntakes, trendWeights, seedTdee, previousEstimate, phase } = params;

  const baseTdee = previousEstimate ?? seedTdee;

  if (phase === "maintenance" || phase === "diet_break") {
    return makeSeedResult(baseTdee, "Phase hold — estimate frozen during " + (phase ?? "maintenance"));
  }

  if (trendWeights.length < 2) {
    return makeSeedResult(baseTdee, "Need ≥2 trend weight entries");
  }

  const sortedIntake = [...dailyIntakes].sort((a, b) => a.date.localeCompare(b.date));
  const sortedTrend = [...trendWeights].sort((a, b) => a.date.localeCompare(b.date));

  const periodStart = sortedTrend[0].date > sortedIntake[0]?.date ? sortedTrend[0].date : sortedIntake[0]?.date;
  const periodEnd = sortedTrend[sortedTrend.length - 1].date < sortedIntake[sortedIntake.length - 1]?.date
    ? sortedTrend[sortedTrend.length - 1].date
    : sortedIntake[sortedIntake.length - 1]?.date;

  if (!periodStart || !periodEnd) return makeSeedResult(baseTdee, "No overlapping data");

  const relevantIntake = sortedIntake.filter((d) => d.date >= periodStart && d.date <= periodEnd);

  if (relevantIntake.length < MIN_DAYS_FOR_OBSERVED) {
    return makeSeedResult(baseTdee, `Need ≥${MIN_DAYS_FOR_OBSERVED} days of intake data (have ${relevantIntake.length})`);
  }

  const adherencePct = calcLoggingAdherence(relevantIntake, periodStart, periodEnd);
  if (adherencePct < MIN_ADHERENCE_PCT) {
    return makeSeedResult(baseTdee, `Adherence ${adherencePct}% < ${MIN_ADHERENCE_PCT}% minimum`);
  }

  const startWeight = sortedTrend.find((t) => t.date >= periodStart)?.ema_kg ?? sortedTrend[0].ema_kg;
  const endWeight = sortedTrend.findLast((t) => t.date <= periodEnd)?.ema_kg ?? sortedTrend[sortedTrend.length - 1].ema_kg;

  const days = relevantIntake.length;
  const totalIntake = relevantIntake.reduce((s, d) => s + d.kcal, 0);
  const avgIntake = Math.round(totalIntake / days);
  const trendDeltaKg = Math.round((endWeight - startWeight) * 100) / 100;

  const energyFromWeight = (trendDeltaKg * KCAL_PER_KG) / days;
  let rawObserved = Math.round(avgIntake - energyFromWeight);
  rawObserved = Math.max(rawObserved, 800);

  let finalValue: number;
  if (previousEstimate !== null) {
    const diff = rawObserved - previousEstimate;
    const maxChange = previousEstimate * MAX_ADJUSTMENT_PCT;
    const clampedDiff = Math.max(-maxChange, Math.min(maxChange, diff * DAMPING_FACTOR));
    finalValue = Math.round(previousEstimate + clampedDiff);
  } else {
    const diff = rawObserved - seedTdee;
    const maxChange = seedTdee * MAX_ADJUSTMENT_PCT;
    const clampedDiff = Math.max(-maxChange, Math.min(maxChange, diff * DAMPING_FACTOR));
    finalValue = Math.round(seedTdee + clampedDiff);
  }

  const se = calcStandardError(relevantIntake, avgIntake, trendDeltaKg, days);
  const confidence: [number, number] = [
    Math.round(finalValue - 1.96 * se),
    Math.round(finalValue + 1.96 * se),
  ];

  return {
    value: finalValue,
    method: "observed",
    confidence,
    adherencePct,
    windowDays: days,
    inputs: { avgIntake, trendDeltaKg },
    periodStart,
    periodEnd,
  };
}

function makeSeedResult(seedTdee: number, _reason: string): TdeeEstimate {
  return {
    value: seedTdee,
    method: "seed",
    confidence: [Math.round(seedTdee * 0.9), Math.round(seedTdee * 1.1)],
    adherencePct: 0,
    windowDays: 0,
    inputs: { avgIntake: 0, trendDeltaKg: 0 },
    periodStart: "",
    periodEnd: "",
  };
}

function calcLoggingAdherence(intakes: { date: string }[], start: string, end: string): number {
  const loggedDates = new Set(intakes.map((d) => d.date));
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  if (totalDays <= 0) return 0;
  let count = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (loggedDates.has(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)) count++;
  }
  return Math.round((count / totalDays) * 100);
}

function calcStandardError(
  intakes: { kcal: number }[],
  mean: number,
  _trendDelta: number,
  days: number
): number {
  if (days < 3) return mean * 0.1;
  const variance = intakes.reduce((s, d) => s + (d.kcal - mean) ** 2, 0) / (days - 1);
  const sd = Math.sqrt(variance);
  return sd / Math.sqrt(days);
}

export function blendTdee(calculatedTdee: number, estimate: TdeeEstimate): number {
  if (estimate.method === "seed") return calculatedTdee;
  const maxConfidence = 0.7;
  const rampDays = IDEAL_DAYS;
  const observedWeight = Math.min(estimate.windowDays / rampDays, 1) * maxConfidence;
  const blended = calculatedTdee * (1 - observedWeight) + estimate.value * observedWeight;
  return Math.round(blended);
}

export function buildTdeeAuditRow(estimate: TdeeEstimate, userId: string) {
  return {
    user_id: userId,
    period_start: estimate.periodStart,
    period_end: estimate.periodEnd,
    days: estimate.windowDays,
    avg_daily_intake: estimate.inputs.avgIntake,
    weight_change_kg: estimate.inputs.trendDeltaKg,
    observed_tdee: estimate.value,
    confidence_low: estimate.confidence[0],
    confidence_high: estimate.confidence[1],
    adherence_pct: estimate.adherencePct,
    method: estimate.method,
    window_days: estimate.windowDays,
  };
}
