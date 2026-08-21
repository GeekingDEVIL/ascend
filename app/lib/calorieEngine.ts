export type GoalType = "lose_weight" | "maintain" | "gain_muscle" | "body_recomp" | "general_fitness";
export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type DietPreference = "balanced" | "high_protein" | "low_carb" | "keto";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calcBMR(weightKg: number, heightCm: number, ageYears: number, sex: Sex): number {
  if (sex === "male") return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
}

export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calcCalorieTarget(tdee: number, goalType: GoalType, ratePerWeekKg?: number): number {
  switch (goalType) {
    case "lose_weight": {
      const weeklyDeficit = (ratePerWeekKg ?? 0.5) * 7700;
      const dailyDeficit = Math.min(weeklyDeficit / 7, tdee * 0.25);
      return Math.round(Math.max(tdee - dailyDeficit, 1200));
    }
    case "gain_muscle": {
      const surplus = (ratePerWeekKg ?? 0.25) * 7700 / 7;
      return Math.round(tdee + Math.min(surplus, 500));
    }
    case "body_recomp":
      return Math.round(tdee - 100);
    default:
      return tdee;
  }
}

export function calcMacros(
  calorieTarget: number,
  weightKg: number,
  goalType: GoalType,
  diet: DietPreference = "balanced"
): { protein: number; fat: number; carbs: number } {
  const isDeficit = goalType === "lose_weight" || goalType === "body_recomp";

  let proteinGkg: number;
  let fatGkg: number | null = null;
  let fatPct: number | null = null;

  switch (diet) {
    case "high_protein":
      proteinGkg = isDeficit ? 2.4 : 2.2;
      fatGkg = isDeficit ? 0.9 : null;
      fatPct = isDeficit ? null : 0.25;
      break;
    case "low_carb":
      proteinGkg = isDeficit ? 2.2 : 2.0;
      fatGkg = isDeficit ? 1.0 : null;
      fatPct = isDeficit ? null : 0.35;
      break;
    case "keto":
      proteinGkg = 1.8;
      fatPct = 0.65;
      break;
    default:
      proteinGkg = isDeficit ? 2.2 : goalType === "gain_muscle" ? 2.0 : 1.8;
      fatGkg = isDeficit ? 0.9 : null;
      fatPct = isDeficit ? null : 0.25;
  }

  const protein = Math.round(weightKg * proteinGkg);
  const fat = fatGkg !== null ? Math.round(weightKg * fatGkg) : Math.round((calorieTarget * (fatPct ?? 0.25)) / 9);
  const remainingCals = calorieTarget - protein * 4 - fat * 9;
  const carbs = Math.max(Math.round(remainingCals / 4), 50);

  return { protein, fat, carbs };
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function ageFromDOB(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export type CalorieSummary = {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macros: { protein: number; fat: number; carbs: number };
  bmi: number;
};

export function getFullCalorieSummary(params: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
  activity: ActivityLevel;
  goalType: GoalType;
  ratePerWeekKg?: number;
  diet?: DietPreference;
  calorieOverride?: number;
  blendedTdee?: number;
}): CalorieSummary {
  const bmr = calcBMR(params.weightKg, params.heightCm, params.ageYears, params.sex);
  const formulaTdee = calcTDEE(bmr, params.activity);
  const tdee = params.blendedTdee ?? formulaTdee;
  const calorieTarget = params.calorieOverride ?? calcCalorieTarget(tdee, params.goalType, params.ratePerWeekKg);
  const macros = calcMacros(calorieTarget, params.weightKg, params.goalType, params.diet);
  const bmi = calcBMI(params.weightKg, params.heightCm);
  return { bmr, tdee, calorieTarget, macros, bmi };
}
