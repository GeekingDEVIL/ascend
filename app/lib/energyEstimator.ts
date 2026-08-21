const KCAL_PER_KG = 7700;
const MIN_DAYS_FOR_ESTIMATE = 14;

export type TdeeEstimate = {
  periodStart: string;
  periodEnd: string;
  days: number;
  avgDailyIntake: number;
  weightChangeKg: number;
  observedTdee: number;
};

export function estimateObservedTdee(params: {
  dailyIntakes: { date: string; kcal: number }[];
  trendWeights: { date: string; ema_kg: number }[];
}): TdeeEstimate | null {
  const { dailyIntakes, trendWeights } = params;

  if (dailyIntakes.length < MIN_DAYS_FOR_ESTIMATE || trendWeights.length < 2) return null;

  const sortedIntake = [...dailyIntakes].sort((a, b) => a.date.localeCompare(b.date));
  const sortedTrend = [...trendWeights].sort((a, b) => a.date.localeCompare(b.date));

  const firstTrend = sortedTrend[0];
  const lastTrend = sortedTrend[sortedTrend.length - 1];

  const periodStart = firstTrend.date > sortedIntake[0].date ? firstTrend.date : sortedIntake[0].date;
  const periodEnd = lastTrend.date < sortedIntake[sortedIntake.length - 1].date ? lastTrend.date : sortedIntake[sortedIntake.length - 1].date;

  const relevantIntake = sortedIntake.filter((d) => d.date >= periodStart && d.date <= periodEnd);
  if (relevantIntake.length < MIN_DAYS_FOR_ESTIMATE) return null;

  const startWeight = sortedTrend.find((t) => t.date >= periodStart)?.ema_kg ?? firstTrend.ema_kg;
  const endWeight = sortedTrend.findLast((t) => t.date <= periodEnd)?.ema_kg ?? lastTrend.ema_kg;

  const days = relevantIntake.length;
  const totalIntake = relevantIntake.reduce((s, d) => s + d.kcal, 0);
  const avgDailyIntake = Math.round(totalIntake / days);
  const weightChangeKg = Math.round((endWeight - startWeight) * 100) / 100;

  const energyFromWeight = (weightChangeKg * KCAL_PER_KG) / days;
  const observedTdee = Math.round(avgDailyIntake - energyFromWeight);

  return {
    periodStart,
    periodEnd,
    days,
    avgDailyIntake,
    weightChangeKg,
    observedTdee: Math.max(observedTdee, 800),
  };
}

export function blendTdee(calculatedTdee: number, observedTdee: number, confidenceDays: number): number {
  const maxConfidence = 0.7;
  const rampDays = 28;
  const observedWeight = Math.min(confidenceDays / rampDays, 1) * maxConfidence;
  const blended = calculatedTdee * (1 - observedWeight) + observedTdee * observedWeight;
  return Math.round(blended);
}
