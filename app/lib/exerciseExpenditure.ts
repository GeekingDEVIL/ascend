const MET_MIN = 3.5;
const MET_MAX = 6.0;

export type SessionExpenditure = {
  kcal: number;
  met: number;
  durationMinutes: number;
  restDensity: number;
};

export function estimateSessionExpenditure(params: {
  bodyWeightKg: number;
  durationSeconds: number;
  totalSets: number;
  setTimestamps?: string[];
}): SessionExpenditure {
  const { bodyWeightKg, durationSeconds, totalSets } = params;
  const durationHours = durationSeconds / 3600;
  const durationMinutes = Math.round(durationSeconds / 60);

  const restDensity = estimateRestDensity(durationSeconds, totalSets, params.setTimestamps);
  const met = MET_MIN + (1 - restDensity) * (MET_MAX - MET_MIN);
  const kcal = Math.round(met * bodyWeightKg * durationHours);

  return { kcal, met: Math.round(met * 10) / 10, durationMinutes, restDensity };
}

function estimateRestDensity(
  totalDuration: number,
  totalSets: number,
  setTimestamps?: string[]
): number {
  if (setTimestamps && setTimestamps.length >= 2) {
    const sorted = setTimestamps.map((t) => new Date(t).getTime()).sort((a, b) => a - b);
    let workingTime = 0;
    const avgSetDuration = 30;
    workingTime = totalSets * avgSetDuration;
    const restTime = totalDuration - workingTime;
    return Math.max(0, Math.min(1, restTime / totalDuration));
  }

  if (totalSets <= 0 || totalDuration <= 0) return 0.7;
  const avgSetDuration = 30;
  const workingTime = totalSets * avgSetDuration;
  const restTime = Math.max(0, totalDuration - workingTime);
  return Math.max(0, Math.min(1, restTime / totalDuration));
}
