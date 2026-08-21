import { daysUntil } from "./energyLedger";

const KCAL_PER_KG = 7700;
const MIN_CALORIES = 1200;
const MAX_DEFICIT_PCT = 0.25;
const MAX_SAFE_RATE_KG_WEEK = 1.0;
const MIN_SAFE_RATE_KG_WEEK = 0.25;
const MAX_SURPLUS_KCAL = 500;

export type FeasibilityVerdict = {
  feasible: boolean;
  requiredRateKgWeek: number;
  safeRateKgWeek: number;
  estimatedDaysNeeded: number;
  suggestedDate: string | null;
  reason: string;
};

export function checkFeasibility(params: {
  currentKg: number;
  targetKg: number;
  targetDate: string | null;
  tdee: number;
  goalType: string;
}): FeasibilityVerdict {
  const { currentKg, targetKg, targetDate, tdee, goalType } = params;
  const delta = targetKg - currentKg;
  const isLoss = delta < 0;
  const absDelta = Math.abs(delta);

  if (absDelta < 0.5) {
    return { feasible: true, requiredRateKgWeek: 0, safeRateKgWeek: 0, estimatedDaysNeeded: 0, suggestedDate: null, reason: "You're within 0.5 kg of your target." };
  }

  const safeRate = isLoss ? MAX_SAFE_RATE_KG_WEEK : 0.5;
  const safeWeeks = absDelta / safeRate;
  const safeDays = Math.ceil(safeWeeks * 7);

  if (!targetDate) {
    const suggested = new Date();
    suggested.setDate(suggested.getDate() + safeDays);
    return {
      feasible: true,
      requiredRateKgWeek: safeRate,
      safeRateKgWeek: safeRate,
      estimatedDaysNeeded: safeDays,
      suggestedDate: suggested.toISOString().split("T")[0],
      reason: `At a safe rate of ${safeRate} kg/week, this would take ~${Math.ceil(safeWeeks)} weeks.`,
    };
  }

  const daysLeft = daysUntil(targetDate);
  if (daysLeft <= 0) {
    return { feasible: false, requiredRateKgWeek: Infinity, safeRateKgWeek: safeRate, estimatedDaysNeeded: safeDays, suggestedDate: null, reason: "Target date has passed." };
  }

  const weeksLeft = daysLeft / 7;
  const requiredRate = absDelta / weeksLeft;

  if (isLoss) {
    const maxDailyDeficit = Math.min(tdee * MAX_DEFICIT_PCT, MAX_SAFE_RATE_KG_WEEK * KCAL_PER_KG / 7);
    const effectiveTarget = Math.max(tdee - maxDailyDeficit, MIN_CALORIES);
    const actualMaxDeficit = tdee - effectiveTarget;
    const actualMaxRateKgWeek = (actualMaxDeficit * 7) / KCAL_PER_KG;

    if (requiredRate > actualMaxRateKgWeek) {
      const suggested = new Date();
      suggested.setDate(suggested.getDate() + safeDays);
      return {
        feasible: false,
        requiredRateKgWeek: Math.round(requiredRate * 100) / 100,
        safeRateKgWeek: Math.round(actualMaxRateKgWeek * 100) / 100,
        estimatedDaysNeeded: safeDays,
        suggestedDate: suggested.toISOString().split("T")[0],
        reason: `Requires ${requiredRate.toFixed(2)} kg/week loss, but safe maximum is ${actualMaxRateKgWeek.toFixed(2)} kg/week.`,
      };
    }
  } else {
    if (requiredRate > 0.5) {
      const suggested = new Date();
      suggested.setDate(suggested.getDate() + safeDays);
      return {
        feasible: false,
        requiredRateKgWeek: Math.round(requiredRate * 100) / 100,
        safeRateKgWeek: 0.5,
        estimatedDaysNeeded: safeDays,
        suggestedDate: suggested.toISOString().split("T")[0],
        reason: `Requires ${requiredRate.toFixed(2)} kg/week gain, but safe maximum is 0.5 kg/week.`,
      };
    }
  }

  return {
    feasible: true,
    requiredRateKgWeek: Math.round(requiredRate * 100) / 100,
    safeRateKgWeek: Math.round(safeRate * 100) / 100,
    estimatedDaysNeeded: daysLeft,
    suggestedDate: null,
    reason: `On track: ${requiredRate.toFixed(2)} kg/week is within safe limits.`,
  };
}

export function enforceFloor(calorieTarget: number): number {
  return Math.max(calorieTarget, MIN_CALORIES);
}

export function maxDeficit(tdee: number): number {
  return Math.round(tdee * MAX_DEFICIT_PCT);
}
