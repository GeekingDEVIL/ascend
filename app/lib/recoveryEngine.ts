export type RecoveryAdjustment = {
  deficitPct: number;
  volumeMultiplier: number;
  recommendation: string;
  severity: "none" | "mild" | "moderate" | "aggressive";
};

export function getRecoveryAdjustment(params: {
  tdee: number;
  calorieTarget: number;
  sleepHours?: number;
  trainingDaysPerWeek?: number;
}): RecoveryAdjustment {
  const { tdee, calorieTarget, sleepHours, trainingDaysPerWeek } = params;
  const deficitPct = Math.round(((tdee - calorieTarget) / tdee) * 100);

  if (deficitPct <= 5) {
    return { deficitPct, volumeMultiplier: 1.0, recommendation: "Energy balance is near maintenance. No volume adjustment needed.", severity: "none" };
  }

  let volumeMultiplier = 1.0;
  let severity: "mild" | "moderate" | "aggressive" = "mild";
  const adjustments: string[] = [];

  if (deficitPct > 20) {
    volumeMultiplier = 0.7;
    severity = "aggressive";
    adjustments.push(`${deficitPct}% deficit is aggressive — reduce training volume by 30%`);
  } else if (deficitPct > 15) {
    volumeMultiplier = 0.85;
    severity = "moderate";
    adjustments.push(`${deficitPct}% deficit — consider reducing volume by 15%`);
  } else if (deficitPct > 10) {
    volumeMultiplier = 0.9;
    severity = "mild";
    adjustments.push(`${deficitPct}% deficit — slight volume reduction (10%) may help recovery`);
  }

  if (sleepHours !== undefined && sleepHours < 7) {
    volumeMultiplier *= 0.9;
    adjustments.push(`Sleep under 7 hours impairs recovery — additional 10% volume reduction`);
  }

  if (trainingDaysPerWeek !== undefined && trainingDaysPerWeek >= 6 && deficitPct > 10) {
    adjustments.push(`${trainingDaysPerWeek} training days/week in a ${deficitPct}% deficit is demanding — consider dropping to 4-5 days`);
  }

  return {
    deficitPct,
    volumeMultiplier: Math.round(volumeMultiplier * 100) / 100,
    recommendation: adjustments.join(". ") + ".",
    severity,
  };
}
