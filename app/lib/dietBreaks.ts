import type { Sex } from "./calorieEngine";

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
  sex?: Sex | null;
}): DietBreakPlan {
  const { tdee, deficitWeeks, sex } = params;
  // Females benefit from slightly longer diet breaks (Trexler et al., 2014)
  const defaultDuration = sex === "female" ? 12 : 10;
  const durationDays = params.durationDays ?? defaultDuration;
  const start = params.startDate ?? (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`; })();
  const endDate = new Date(start + "T12:00:00");
  endDate.setDate(endDate.getDate() + durationDays - 1);

  let reason = "Scheduled maintenance period to restore metabolic rate.";
  if (sex === "female" && deficitWeeks >= 6) {
    reason = `${deficitWeeks} weeks of deficit. A diet break helps restore leptin, thyroid hormones, and menstrual regularity.`;
  } else if (deficitWeeks >= 12) {
    reason = `${deficitWeeks} weeks of deficit — a diet break is strongly recommended to prevent excessive metabolic adaptation.`;
  } else if (deficitWeeks >= 8) {
    reason = `You've been in a deficit for ${deficitWeeks} weeks. A diet break helps restore hormones and metabolism.`;
  }

  return {
    phase: "diet_break",
    startDate: start,
    endDate: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`,
    durationDays,
    maintenanceKcal: tdee,
    reason,
  };
}

export function shouldSuggestDietBreak(params: {
  deficitWeeks: number;
  tdeeDrop: number;
  adherencePct: number;
  sex?: Sex | null;
}): boolean {
  const { deficitWeeks, tdeeDrop, adherencePct, sex } = params;
  // Females: leptin drops faster, hormonal disruption happens sooner (Rosenbaum et al.)
  if (sex === "female") {
    if (deficitWeeks >= 8) return true;
    if (deficitWeeks >= 6 && tdeeDrop >= 100) return true;
    if (deficitWeeks >= 5 && adherencePct < 60) return true;
  }
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
  const _d = new Date();
  return `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}` <= breakEndDate;
}
