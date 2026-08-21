import { daysUntil } from "./energyLedger";
import { calcBMR, calcBMI } from "./calorieEngine";

const KCAL_PER_KG = 7700;
const MAX_DEFICIT_PCT = 0.25;

export type Violation = {
  rule: string;
  detail: string;
  action: string;
};

export type GuardrailResult = {
  target: number;
  adjusted: boolean;
  violations: Violation[];
  revisedETA: string | null;
};

export type FeasibilityVerdict = {
  feasible: boolean;
  requiredRateKgWeek: number;
  safeRateKgWeek: number;
  estimatedDaysNeeded: number;
  suggestedDate: string | null;
  reason: string;
  violations: Violation[];
};

function absoluteFloor(sex: string): number {
  return sex === "female" ? 1200 : 1500;
}

function maxRatePctBwWeek(bmi: number): number {
  return bmi < 22 ? 0.0075 : 0.01;
}

export function applyGuardrails(params: {
  proposedTarget: number;
  tdee: number;
  bmr: number;
  sex: string;
  weightKg: number;
  heightCm: number;
  goalType: string;
  targetKg: number | null;
  targetDate: string | null;
}): GuardrailResult {
  const { tdee, bmr, sex, weightKg, heightCm, goalType, targetKg, targetDate } = params;
  let target = params.proposedTarget;
  const violations: Violation[] = [];
  let adjusted = false;

  const floor = Math.max(absoluteFloor(sex), Math.round(bmr));
  if (target < floor) {
    violations.push({ rule: "Absolute floor", detail: `Target ${target} is below ${floor} kcal (BMR / sex-based minimum)`, action: `Raised to ${floor} kcal` });
    target = floor;
    adjusted = true;
  }

  const maxDeficit = Math.round(tdee * MAX_DEFICIT_PCT);
  if (tdee - target > maxDeficit) {
    const clamped = tdee - maxDeficit;
    const safeTarget = Math.max(clamped, floor);
    violations.push({ rule: "Max deficit 25%", detail: `Deficit of ${tdee - target} exceeds 25% of TDEE (${maxDeficit})`, action: `Clamped to ${safeTarget} kcal` });
    target = safeTarget;
    adjusted = true;
  }

  const bmi = calcBMI(weightKg, heightCm);
  const maxRatePct = maxRatePctBwWeek(bmi);
  const maxRateKgWeek = Math.round(weightKg * maxRatePct * 100) / 100;

  if (goalType === "lose_weight" && targetKg !== null) {
    const dailyDeficit = tdee - target;
    const impliedRateKgWeek = (dailyDeficit * 7) / KCAL_PER_KG;
    if (impliedRateKgWeek > maxRateKgWeek) {
      const safeDailyDeficit = (maxRateKgWeek * KCAL_PER_KG) / 7;
      const safeTarget = Math.max(Math.round(tdee - safeDailyDeficit), floor);
      violations.push({ rule: "Max rate % BW/week", detail: `Implied rate ${impliedRateKgWeek.toFixed(2)} kg/week exceeds ${(maxRatePct * 100).toFixed(1)}% BW/week (${maxRateKgWeek} kg)`, action: `Clamped to ${safeTarget} kcal` });
      target = safeTarget;
      adjusted = true;
    }
  }

  const proteinFloorG = Math.round(weightKg * 2.0);
  if ((goalType === "lose_weight" || goalType === "body_recomp") && target > 0) {
    const proteinKcal = proteinFloorG * 4;
    const minFatKcal = Math.round(weightKg * 0.8) * 9;
    const minMacroKcal = proteinKcal + minFatKcal + 200;
    if (target < minMacroKcal) {
      violations.push({ rule: "Protein floor", detail: `Target ${target} kcal cannot support ${proteinFloorG}g protein (2.0 g/kg) with adequate fat and carbs`, action: "Target preserved but macro split may be compromised" });
    }
  }

  let revisedETA: string | null = null;
  if (adjusted && targetKg !== null && targetDate) {
    const delta = Math.abs(targetKg - weightKg);
    if (delta > 0.5) {
      const actualDailyDeficit = Math.abs(tdee - target);
      const actualRateKgWeek = (actualDailyDeficit * 7) / KCAL_PER_KG;
      if (actualRateKgWeek > 0) {
        const weeksNeeded = delta / actualRateKgWeek;
        const daysNeeded = Math.ceil(weeksNeeded * 7);
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + daysNeeded);
        revisedETA = newDate.toISOString().split("T")[0];
      }
    }
  }

  return { target, adjusted, violations, revisedETA };
}

export function checkFeasibility(params: {
  currentKg: number;
  targetKg: number;
  targetDate: string | null;
  tdee: number;
  bmr: number;
  sex: string;
  heightCm: number;
  goalType: string;
}): FeasibilityVerdict {
  const { currentKg, targetKg, targetDate, tdee, bmr, sex, heightCm, goalType } = params;
  const delta = targetKg - currentKg;
  const isLoss = delta < 0;
  const absDelta = Math.abs(delta);

  if (absDelta < 0.5) {
    return { feasible: true, requiredRateKgWeek: 0, safeRateKgWeek: 0, estimatedDaysNeeded: 0, suggestedDate: null, reason: "You're within 0.5 kg of your target.", violations: [] };
  }

  const bmi = calcBMI(currentKg, heightCm);
  const maxRatePct = maxRatePctBwWeek(bmi);
  const maxRateKgWeek = isLoss ? Math.round(currentKg * maxRatePct * 100) / 100 : 0.5;

  const floor = Math.max(absoluteFloor(sex), Math.round(bmr));
  const maxDailyDeficit = Math.min(tdee * MAX_DEFICIT_PCT, (maxRateKgWeek * KCAL_PER_KG) / 7);
  const effectiveTarget = Math.max(tdee - maxDailyDeficit, floor);
  const actualMaxDeficit = tdee - effectiveTarget;
  const actualMaxRateKgWeek = isLoss ? Math.round(((actualMaxDeficit * 7) / KCAL_PER_KG) * 100) / 100 : 0.5;

  const safeRate = actualMaxRateKgWeek;
  const safeWeeks = absDelta / safeRate;
  const safeDays = Math.ceil(safeWeeks * 7);
  const violations: Violation[] = [];

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
      violations,
    };
  }

  const daysLeft = daysUntil(targetDate);
  if (daysLeft <= 0) {
    violations.push({ rule: "Target date", detail: "Target date has passed", action: "Set a new target date" });
    return { feasible: false, requiredRateKgWeek: Infinity, safeRateKgWeek: safeRate, estimatedDaysNeeded: safeDays, suggestedDate: null, reason: "Target date has passed.", violations };
  }

  const weeksLeft = daysLeft / 7;
  const requiredRate = Math.round((absDelta / weeksLeft) * 100) / 100;

  if (isLoss && requiredRate > actualMaxRateKgWeek) {
    const suggested = new Date();
    suggested.setDate(suggested.getDate() + safeDays);
    violations.push({ rule: "Rate exceeds safe maximum", detail: `Required ${requiredRate} kg/week > safe max ${actualMaxRateKgWeek} kg/week`, action: `Date pushed to ${suggested.toISOString().split("T")[0]}` });
    if (bmi < 22) {
      violations.push({ rule: "Already lean", detail: `BMI ${bmi} < 22 — reduced to 0.75% BW/week max rate`, action: "Slower rate enforced" });
    }
    return {
      feasible: false,
      requiredRateKgWeek: requiredRate,
      safeRateKgWeek: actualMaxRateKgWeek,
      estimatedDaysNeeded: safeDays,
      suggestedDate: suggested.toISOString().split("T")[0],
      reason: `Requires ${requiredRate} kg/week loss, but safe maximum is ${actualMaxRateKgWeek} kg/week. Date moved.`,
      violations,
    };
  }

  if (!isLoss && requiredRate > 0.5) {
    const suggested = new Date();
    suggested.setDate(suggested.getDate() + safeDays);
    violations.push({ rule: "Gain rate too fast", detail: `Required ${requiredRate} kg/week > 0.5 kg/week max`, action: `Date pushed to ${suggested.toISOString().split("T")[0]}` });
    return {
      feasible: false,
      requiredRateKgWeek: requiredRate,
      safeRateKgWeek: 0.5,
      estimatedDaysNeeded: safeDays,
      suggestedDate: suggested.toISOString().split("T")[0],
      reason: `Requires ${requiredRate} kg/week gain, but safe maximum is 0.5 kg/week.`,
      violations,
    };
  }

  return {
    feasible: true,
    requiredRateKgWeek: requiredRate,
    safeRateKgWeek: safeRate,
    estimatedDaysNeeded: daysLeft,
    suggestedDate: null,
    reason: `On track: ${requiredRate} kg/week is within safe limits.`,
    violations,
  };
}
