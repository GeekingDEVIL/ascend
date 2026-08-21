export type CyclePhase = "follicular" | "ovulation" | "luteal" | "menstrual";

export type CycleEntry = {
  date: string;
  phase: CyclePhase;
};

export type CycleAwareComparison = {
  currentPhase: CyclePhase;
  currentWeightKg: number;
  samePhaseLastCycle: number | null;
  deltaKg: number | null;
  adjustedTrend: string;
};

const PHASE_WATER_RETENTION: Record<CyclePhase, string> = {
  follicular: "Low water retention expected. Weight readings are typically most accurate.",
  ovulation: "Slight increase in water retention possible. Trend line accounts for this.",
  luteal: "Elevated progesterone causes 1-2 kg water retention. This is normal and temporary.",
  menstrual: "Water retention releasing. Weight may drop suddenly — this is water, not fat loss.",
};

export function getCyclePhaseInfo(phase: CyclePhase): string {
  return PHASE_WATER_RETENTION[phase];
}

export function comparePhaseToPhase(params: {
  currentPhase: CyclePhase;
  currentWeightKg: number;
  weightHistory: { date: string; ema_kg: number; phase?: CyclePhase }[];
  cycleLength?: number;
}): CycleAwareComparison {
  const { currentPhase, currentWeightKg, weightHistory, cycleLength = 28 } = params;

  const samePhaseEntries = weightHistory
    .filter((w) => w.phase === currentPhase)
    .sort((a, b) => b.date.localeCompare(a.date));

  const previousCycleEntries = samePhaseEntries.filter((w) => {
    const daysBetween = Math.round(
      (new Date().getTime() - new Date(w.date).getTime()) / 86400000
    );
    return daysBetween >= cycleLength - 5 && daysBetween <= cycleLength + 5;
  });

  const samePhaseLastCycle = previousCycleEntries.length > 0
    ? previousCycleEntries[0].ema_kg
    : null;

  const deltaKg = samePhaseLastCycle !== null
    ? Math.round((currentWeightKg - samePhaseLastCycle) * 10) / 10
    : null;

  let adjustedTrend = "Not enough cycle data for phase comparison.";
  if (deltaKg !== null) {
    if (deltaKg < -0.3) {
      adjustedTrend = `Down ${Math.abs(deltaKg)} kg vs same phase last cycle — real progress.`;
    } else if (deltaKg > 0.3) {
      adjustedTrend = `Up ${deltaKg} kg vs same phase last cycle.`;
    } else {
      adjustedTrend = `Stable (±${Math.abs(deltaKg)} kg) vs same phase last cycle.`;
    }
  }

  return { currentPhase, currentWeightKg, samePhaseLastCycle, deltaKg, adjustedTrend };
}

export function estimateCyclePhase(periodStartDate: string, today?: string): CyclePhase {
  const start = new Date(periodStartDate + "T12:00:00");
  const now = today ? new Date(today + "T12:00:00") : new Date();
  const daysSincePeriod = Math.round((now.getTime() - start.getTime()) / 86400000) % 28;

  if (daysSincePeriod < 5) return "menstrual";
  if (daysSincePeriod < 13) return "follicular";
  if (daysSincePeriod < 16) return "ovulation";
  return "luteal";
}
