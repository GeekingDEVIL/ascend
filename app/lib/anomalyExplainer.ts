export type AnomalyExplanation = {
  detected: boolean;
  deltaKg: number;
  trendDeltaKg: number;
  explanations: { factor: string; detail: string; likelihood: "high" | "medium" | "low" }[];
  summary: string;
};

export function explainWeightAnomaly(params: {
  todayKg: number;
  yesterdayKg: number | null;
  trendKg: number;
  previousTrendKg: number | null;
  recentCarbsG: number | null;
  recentSodiumMg?: number | null;
  hadLegDay: boolean;
  loggingAdherence: number;
}): AnomalyExplanation {
  const { todayKg, yesterdayKg, trendKg, previousTrendKg, recentCarbsG, hadLegDay, loggingAdherence } = params;

  const deltaKg = yesterdayKg !== null ? Math.round((todayKg - yesterdayKg) * 10) / 10 : 0;
  const trendDeltaKg = previousTrendKg !== null ? Math.round((trendKg - previousTrendKg) * 10) / 10 : 0;
  const spikeThreshold = 0.8;

  if (Math.abs(deltaKg) < spikeThreshold) {
    return { detected: false, deltaKg, trendDeltaKg, explanations: [], summary: "Weight is within normal daily variation." };
  }

  const explanations: { factor: string; detail: string; likelihood: "high" | "medium" | "low" }[] = [];
  const isSpike = deltaKg > 0;

  if (isSpike) {
    if (recentCarbsG !== null && recentCarbsG > 300) {
      explanations.push({
        factor: "High carb intake",
        detail: `Yesterday's carbs (${Math.round(recentCarbsG)}g) were elevated. Each gram of glycogen stored retains ~3g of water.`,
        likelihood: "high",
      });
    }

    if (hadLegDay) {
      explanations.push({
        factor: "Post-leg-day inflammation",
        detail: "Heavy leg sessions cause muscle inflammation and water retention for 24-72 hours. This is normal recovery.",
        likelihood: "high",
      });
    }

    if (recentCarbsG === null && loggingAdherence < 50) {
      explanations.push({
        factor: "Unlogged meals",
        detail: `Logging adherence is ${loggingAdherence}%. Untracked meals make it hard to explain weight changes.`,
        likelihood: "medium",
      });
    }

    if (explanations.length === 0) {
      explanations.push({
        factor: "Normal fluctuation",
        detail: "Daily weight can vary ±1-2 kg from water, digestion, and sodium. The trend line filters this out.",
        likelihood: "high",
      });
    }
  } else {
    explanations.push({
      factor: "Normal fluctuation",
      detail: "A sudden drop is often water loss (dehydration, low carb day, or a rest day). Check if trend confirms real change.",
      likelihood: "high",
    });
  }

  const trendUnchanged = Math.abs(trendDeltaKg) < 0.15;
  const summary = isSpike
    ? `+${deltaKg} kg · 24h — ${trendUnchanged ? "LIKELY WATER · TREND UNCHANGED" : `Trend also shifted ${trendDeltaKg > 0 ? "+" : ""}${trendDeltaKg} kg`}`
    : `${deltaKg} kg · 24h — ${trendUnchanged ? "Likely water loss · Trend unchanged" : `Trend shifted ${trendDeltaKg > 0 ? "+" : ""}${trendDeltaKg} kg`}`;

  return { detected: true, deltaKg, trendDeltaKg, explanations, summary };
}
