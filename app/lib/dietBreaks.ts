export type Phase = "active" | "maintenance" | "diet_break" | "surplus";

export type DietBreakPlan = {
  phase: Phase;
  startDate: string;
  endDate: string;
  durationDays: number;
  maintenanceKcal: number;
  reason: string;
};

export function planDietBreak(params: {
  tdee: number;
  currentPhase: Phase;
  deficitWeeks: number;
  startDate?: string;
  durationDays?: number;
}): DietBreakPlan {
  const { tdee, deficitWeeks, durationDays = 10 } = params;
  const start = params.startDate ?? new Date().toISOString().split("T")[0];
  const endDate = new Date(start + "T12:00:00");
  endDate.setDate(endDate.getDate() + durationDays - 1);

  let reason = "Scheduled maintenance period to restore metabolic rate.";
  if (deficitWeeks >= 8) {
    reason = `You've been in a deficit for ${deficitWeeks} weeks. A diet break helps restore hormones and metabolism.`;
  } else if (deficitWeeks >= 12) {
    reason = `${deficitWeeks} weeks of deficit — a diet break is strongly recommended to prevent excessive metabolic adaptation.`;
  }

  return {
    phase: "diet_break",
    startDate: start,
    endDate: endDate.toISOString().split("T")[0],
    durationDays,
    maintenanceKcal: tdee,
    reason,
  };
}

export function shouldSuggestDietBreak(params: {
  deficitWeeks: number;
  tdeeDrop: number;
  adherencePct: number;
}): boolean {
  const { deficitWeeks, tdeeDrop, adherencePct } = params;
  if (deficitWeeks >= 12) return true;
  if (deficitWeeks >= 8 && tdeeDrop >= 150) return true;
  if (deficitWeeks >= 6 && adherencePct < 60) return true;
  return false;
}

export function getDietBreakTarget(tdee: number): number {
  return tdee;
}

export function isInDietBreak(phase: Phase, breakEndDate?: string): boolean {
  if (phase !== "diet_break") return false;
  if (!breakEndDate) return true;
  return new Date().toISOString().split("T")[0] <= breakEndDate;
}
