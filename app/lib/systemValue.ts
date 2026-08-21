export type ValueSource = "formula" | "user_override" | "adaptive" | "blended" | "default" | "seed" | "observed" | "modeled";

export type Explanation = {
  what: string;
  detail: string;
};

export type SystemValue<T> = {
  value: T;
  source: ValueSource;
  label: string;
  detail?: string;
  confidence?: [number, number];
  because: Explanation[];
};

export function sv<T>(value: T, source: ValueSource, label: string, detail?: string, confidence?: [number, number]): SystemValue<T> {
  return { value, source, label, detail, confidence, because: [] };
}

export function withBecause<T>(s: SystemValue<T>, ...reasons: Explanation[]): SystemValue<T> {
  return { ...s, because: [...s.because, ...reasons] };
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
  guardrailViolations: { rule: string; detail: string; action: string }[];
};

export function buildEnergyReceipt(params: {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macros: { protein: number; fat: number; carbs: number };
  observedTdee: number | null;
  observedConfidence: [number, number] | null;
  blendedTdee: number | null;
  adaptiveMode: boolean;
  hasOverride: boolean;
  goalType: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: string;
  activity: string;
  guardrailViolations?: { rule: string; detail: string; action: string }[];
}): EnergyReceipt {
  const adjustments: SystemValue<string>[] = [];

  const bmr = withBecause(
    sv(params.bmr, "formula", "Basal Metabolic Rate", `Mifflin-St Jeor: 10×${params.weightKg}kg + 6.25×${params.heightCm}cm - 5×${params.ageYears}y ${params.sex === "male" ? "+5" : "-161"}`),
    { what: "Formula", detail: "Mifflin-St Jeor equation — gold standard for resting metabolic rate estimation" }
  );

  let tdeeSource: ValueSource = "formula";
  let tdeeDetail = `BMR × ${params.activity} activity multiplier`;
  let tdeeConfidence: [number, number] | undefined;

  if (params.adaptiveMode && params.blendedTdee) {
    tdeeSource = "blended";
    tdeeDetail = `Weighted blend of calculated (${params.tdee}) and observed (${params.observedTdee}) TDEE`;
    tdeeConfidence = params.observedConfidence ?? undefined;
    adjustments.push(withBecause(
      sv("Adaptive blending active", "adaptive", "TDEE Adjustment", `Observed TDEE: ${params.observedTdee} kcal`),
      { what: "Adaptive mode", detail: "TDEE derived from your actual intake and weight trend, not just a formula" }
    ));
  }

  const tdeeValue = params.adaptiveMode && params.blendedTdee ? params.blendedTdee : params.tdee;
  const tdee = withBecause(
    sv(tdeeValue, tdeeSource, "Total Daily Energy Expenditure", tdeeDetail, tdeeConfidence),
    { what: "Activity factor", detail: `Your ${params.activity} activity level scales BMR to approximate total daily burn` }
  );

  const calorieTarget = withBecause(
    sv(
      params.calorieTarget,
      params.hasOverride ? "user_override" : "formula",
      "Calorie Target",
      params.hasOverride ? "Manually set by user" : `Derived from TDEE and ${params.goalType} goal`
    ),
    params.hasOverride
      ? { what: "Manual override", detail: "You set this target directly — it overrides the calculated value" }
      : { what: "Goal adjustment", detail: `Your ${params.goalType} goal applies a deficit or surplus to TDEE` }
  );

  const isDeficit = params.goalType === "lose_weight" || params.goalType === "body_recomp";
  const macros = {
    protein: withBecause(
      sv(params.macros.protein, "formula", "Protein", isDeficit ? `2.0–2.4 g/kg × ${params.weightKg}kg (deficit range)` : `Based on ${params.weightKg}kg body weight`),
      { what: "Protein target", detail: isDeficit ? "Higher protein in deficit preserves muscle mass during weight loss" : "Protein scaled to body weight for muscle maintenance and growth" }
    ),
    fat: withBecause(
      sv(params.macros.fat, "formula", "Fat", isDeficit ? `0.8–1.0 g/kg × ${params.weightKg}kg (deficit range)` : `${Math.round((params.macros.fat * 9 / params.calorieTarget) * 100)}% of calorie target`),
      { what: "Fat target", detail: isDeficit ? "Per-kg fat ensures hormonal function is maintained in a deficit" : "Percentage-based fat allocation for balanced nutrition" }
    ),
    carbs: withBecause(
      sv(params.macros.carbs, "formula", "Carbs", "Fills remaining calories after protein and fat"),
      { what: "Carb target", detail: "Carbs fill the remaining calorie budget — they fuel training performance" }
    ),
  };

  const floor = params.sex === "female" ? 1200 : 1500;
  if (params.calorieTarget <= floor) {
    adjustments.push(withBecause(
      sv(`Floor applied: ${floor} kcal minimum`, "formula", "Safety Guardrail"),
      { what: "Calorie floor", detail: `Target cannot go below ${floor} kcal (${params.sex === "female" ? "female" : "male"} minimum) regardless of deficit` }
    ));
  }

  return { bmr, tdee, calorieTarget, macros, adjustments, guardrailViolations: params.guardrailViolations ?? [] };
}
