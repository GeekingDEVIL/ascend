export type WarmupSet = {
  weight: number; // in kg (DB unit)
  reps: number;
  label: string; // e.g. "Bar", "50%", "70%", "85%"
};

/** Round to nearest 2.5 kg */
function round2_5(v: number): number {
  return Math.round(v / 2.5) * 2.5;
}

/**
 * Generate warm-up sets leading into a working weight.
 * All weights are in kg (the DB unit).
 *
 * @param workingWeight  Target working weight in kg
 * @param isBarbell      True for barbell exercises (bar-only first set)
 */
export function generateWarmupSets(
  workingWeight: number,
  isBarbell: boolean,
): WarmupSet[] {
  if (workingWeight <= 20) return [];

  const raw: WarmupSet[] = [];

  if (isBarbell) {
    raw.push({ weight: 20, reps: 10, label: "Bar" });
    raw.push({ weight: round2_5(workingWeight * 0.5), reps: 8, label: "50%" });
    raw.push({ weight: round2_5(workingWeight * 0.7), reps: 5, label: "70%" });
    raw.push({ weight: round2_5(workingWeight * 0.85), reps: 3, label: "85%" });
  } else {
    raw.push({ weight: round2_5(workingWeight * 0.4), reps: 10, label: "Light" });
    raw.push({ weight: round2_5(workingWeight * 0.65), reps: 6, label: "Medium" });
    raw.push({ weight: round2_5(workingWeight * 0.8), reps: 3, label: "Heavy" });
  }

  // Deduplicate: skip sets whose weight equals the previous set's weight
  const deduped: WarmupSet[] = [];
  for (const s of raw) {
    if (deduped.length === 0 || s.weight !== deduped[deduped.length - 1].weight) {
      deduped.push(s);
    }
  }

  // Also skip any warmup set whose weight equals the working weight
  return deduped.filter((s) => s.weight < workingWeight);
}
