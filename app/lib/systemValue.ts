export type ValueSource = "formula" | "user_override" | "adaptive" | "blended" | "default";

export type SystemValue<T> = {
  value: T;
  source: ValueSource;
  label: string;
  detail?: string;
};

export function sv<T>(value: T, source: ValueSource, label: string, detail?: string): SystemValue<T> {
  return { value, source, label, detail };
}

export type EnergyReceipt = {
  bmr: SystemValue<number>;
  tdee: SystemValue<number>;
  calorieTarget: SystemValue<number>;
  macros: {
    protein: SystemValue<number>;
    fat: SystemValue<number>;
    carbs: SystemValue<number>;
  };
  adjustments: SystemValue<string>[];
};

export function buildEnergyReceipt(params: {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macros: { protein: number; fat: number; carbs: number };
  observedTdee: number | null;
  blendedTdee: number | null;
  adaptiveMode: boolean;
  hasOverride: boolean;
  goalType: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: string;
  activity: string;
}): EnergyReceipt {
  const adjustments: SystemValue<string>[] = [];

  const bmr = sv(params.bmr, "formula", "Basal Metabolic Rate", `Mifflin-St Jeor: 10×${params.weightKg}kg + 6.25×${params.heightCm}cm - 5×${params.ageYears}y ${params.sex === "male" ? "+5" : "-161"}`);

  let tdeeSource: ValueSource = "formula";
  let tdeeDetail = `BMR × ${params.activity} activity multiplier`;
  if (params.adaptiveMode && params.blendedTdee) {
    tdeeSource = "blended";
    tdeeDetail = `Weighted blend of calculated (${params.tdee}) and observed (${params.observedTdee}) TDEE`;
    adjustments.push(sv("Adaptive blending active", "adaptive", "TDEE Adjustment", `Observed TDEE: ${params.observedTdee} kcal`));
  }
  const tdee = sv(params.adaptiveMode && params.blendedTdee ? params.blendedTdee : params.tdee, tdeeSource, "Total Daily Energy Expenditure", tdeeDetail);

  const calorieTarget = sv(
    params.calorieTarget,
    params.hasOverride ? "user_override" : "formula",
    "Calorie Target",
    params.hasOverride ? "Manually set by user" : `Derived from TDEE and ${params.goalType} goal`
  );

  const macros = {
    protein: sv(params.macros.protein, "formula", "Protein", `Based on ${params.weightKg}kg body weight`),
    fat: sv(params.macros.fat, "formula", "Fat", `${Math.round((params.macros.fat * 9 / params.calorieTarget) * 100)}% of calorie target`),
    carbs: sv(params.macros.carbs, "formula", "Carbs", "Fills remaining calories after protein and fat"),
  };

  if (params.calorieTarget <= 1200) {
    adjustments.push(sv("Floor applied: 1200 kcal minimum", "formula", "Safety Guardrail", "Target cannot go below 1200 kcal regardless of deficit"));
  }

  return { bmr, tdee, calorieTarget, macros, adjustments };
}
