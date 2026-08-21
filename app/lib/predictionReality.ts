const KCAL_PER_KG = 7700;

export type PredictionPoint = {
  date: string;
  predicted: number;
  actual: number | null;
};

export type PredictionAccuracy = {
  points: PredictionPoint[];
  avgErrorKg: number;
  direction: "overshoot" | "undershoot" | "accurate";
  message: string;
};

export function buildPredictionVsReality(params: {
  startDate: string;
  startWeightKg: number;
  dailyTarget: number;
  tdee: number;
  actualWeights: { date: string; ema_kg: number }[];
  intakes: { date: string; kcal: number }[];
}): PredictionAccuracy {
  const { startDate, startWeightKg, dailyTarget, tdee, actualWeights, intakes } = params;

  const weightMap = new Map(actualWeights.map((w) => [w.date, w.ema_kg]));
  const intakeMap = new Map(intakes.map((i) => [i.date, i.kcal]));

  const points: PredictionPoint[] = [];
  let cumulativeDeficit = 0;

  const sortedDates = [...new Set([...actualWeights.map((w) => w.date), ...intakes.map((i) => i.date)])]
    .filter((d) => d >= startDate)
    .sort();

  for (const date of sortedDates) {
    const dayIntake = intakeMap.get(date) ?? dailyTarget;
    const dailyNet = dayIntake - tdee;
    cumulativeDeficit += dailyNet;

    const predicted = Math.round((startWeightKg + cumulativeDeficit / KCAL_PER_KG) * 10) / 10;
    const actual = weightMap.get(date) ?? null;

    points.push({ date, predicted, actual });
  }

  const withActual = points.filter((p) => p.actual !== null);
  if (withActual.length === 0) {
    return { points, avgErrorKg: 0, direction: "accurate", message: "Not enough data to compare predictions." };
  }

  const errors = withActual.map((p) => p.predicted - p.actual!);
  const avgError = Math.round(errors.reduce((s, e) => s + e, 0) / errors.length * 10) / 10;
  const absAvgError = Math.abs(avgError);

  let direction: "overshoot" | "undershoot" | "accurate" = "accurate";
  let message = "Model predictions are tracking reality closely.";

  if (avgError > 0.3) {
    direction = "overshoot";
    message = `Model consistently overshoots by ~${absAvgError} kg — you may be losing slightly faster than predicted.`;
  } else if (avgError < -0.3) {
    direction = "undershoot";
    message = `Model consistently undershoots by ~${absAvgError} kg — actual loss is slower than predicted. TDEE may be lower than estimated.`;
  }

  return { points, avgErrorKg: avgError, direction, message };
}
