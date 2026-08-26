/**
 * Intelligent Menstrual Engine
 *
 * Evidence-based cycle intelligence built from medical literature:
 * - WHO: Intermittent iron supplementation guidelines (2011)
 * - ACOG: Abnormal uterine bleeding & hyperandrogenic screening (2019)
 * - FIGO: PALM-COEIN classification, AUB Systems 1 & 2 (2018 revision)
 * - NIH/PubMed: Phase-specific symptom prevalence, exercise physiology,
 *   nutritional variations, PCOS screening criteria
 *
 * This engine does NOT diagnose. It flags patterns for user awareness
 * and recommends consulting a healthcare provider when thresholds
 * from the above sources are met.
 */

import type { CycleLog, CycleSymptomLog, CyclePhase } from "./cycleAwareTrend";
import { computeCycleGaps, computeAdaptiveCycleLength, estimateCyclePhase, getFertilityLevel } from "./cycleAwareTrend";

// ─── Medical Reference Constants ───────────────────────────────────────────

/** FIGO System 1 / ACOG normal ranges */
export const CLINICAL_RANGES = {
  cycleLength: { min: 24, max: 38, label: "FIGO 2018" },
  periodDuration: { min: 2, max: 7, label: "ACOG" },
  flowVolume: { normalMax: 80, label: "FIGO (mL)" },
  cycleLengthVariation: { normalMax: 7, label: "FIGO regularity" },
  adolescentCycleLength: { min: 21, max: 45, label: "ACOG adolescent" },
  menarche: { normalAge: { min: 9, max: 16 }, label: "WHO" },
} as const;

/** PCOS screening criteria (Rotterdam, endorsed by ACOG) */
export const PCOS_INDICATORS = {
  requiredCriteria: 2,
  criteria: [
    { key: "oligo_anovulation", label: "Irregular or absent periods" },
    { key: "hyperandrogenism", label: "Signs of excess androgens (acne, excess hair)" },
    { key: "polycystic_morphology", label: "Polycystic ovaries on ultrasound" },
  ],
  prevalence: "6-15% of reproductive-age women",
  source: "ACOG Committee Opinion 789 / Rotterdam 2003",
} as const;

/** Symptom prevalence by phase — from NIH menstrual tracking study (n>600k cycles) */
export const PHASE_SYMPTOM_PREVALENCE: Record<CyclePhase, {
  common: { symptom: string; prevalence: string }[];
  hormoneProfile: string;
  metabolicNote: string;
}> = {
  menstrual: {
    common: [
      { symptom: "Cramps", prevalence: "~90% experience menstrual pain (ACOG)" },
      { symptom: "Fatigue", prevalence: "Common — iron levels dip from blood loss" },
      { symptom: "Headache", prevalence: "Affects ~25% due to estrogen drop" },
      { symptom: "Back pain", prevalence: "Reported by ~40-50% of menstruating people" },
      { symptom: "Bloating", prevalence: "Prostaglandins cause GI smooth muscle contraction" },
    ],
    hormoneProfile: "Estrogen and progesterone at lowest. FSH begins rising to recruit new follicles. Prostaglandins trigger uterine contractions.",
    metabolicNote: "Iron losses average 1mg/day during menstruation. Serum phosphorus is highest in this phase. Energy expenditure returns to baseline.",
  },
  follicular: {
    common: [
      { symptom: "Improved mood", prevalence: "Rising estrogen boosts serotonin synthesis" },
      { symptom: "Higher energy", prevalence: "Peak insulin sensitivity improves glucose utilization" },
      { symptom: "Cervical mucus changes", prevalence: "Estrogen thins mucus approaching ovulation" },
    ],
    hormoneProfile: "Estrogen rises steadily. FSH drives follicle maturation. Testosterone begins climbing. Peak insulin sensitivity.",
    metabolicNote: "Serum magnesium is lowest — consider supplementation. Higher carb tolerance due to insulin sensitivity. Best phase for caloric deficit if in a cut.",
  },
  ovulation: {
    common: [
      { symptom: "Mittelschmerz", prevalence: "~20% feel one-sided pelvic pain at ovulation" },
      { symptom: "Breast tenderness", prevalence: "Begins as estrogen peaks" },
      { symptom: "High sex drive", prevalence: "45% of peak libido instances occur in this window (NIH)" },
      { symptom: "Egg-white discharge", prevalence: "63% of all logged instances occur in the fertile window (NIH)" },
    ],
    hormoneProfile: "Estrogen peaks → LH surge → egg release. Testosterone peaks. Brief progesterone dip then rise.",
    metabolicNote: "Peak testosterone supports strength performance. Core body temp begins rising ~0.2-0.5°C post-ovulation. Basal metabolic rate starts increasing.",
  },
  luteal: {
    common: [
      { symptom: "Bloating", prevalence: "Most common PMS symptom — progesterone causes water retention" },
      { symptom: "Mood changes", prevalence: "~75% experience some PMS (ACOG); 3-8% meet PMDD criteria (NIH)" },
      { symptom: "Cravings", prevalence: "Metabolic rate increases 100-300 kcal/day — body demands more fuel" },
      { symptom: "Breast tenderness", prevalence: "Progesterone-driven, peaks mid-luteal" },
      { symptom: "Insomnia", prevalence: "Progesterone metabolite allopregnanolone affects sleep architecture" },
      { symptom: "Acne", prevalence: "Relative androgen dominance as estrogen drops" },
    ],
    hormoneProfile: "Progesterone dominates (catabolic). Estrogen has a secondary rise then falls. If no implantation, both crash → period.",
    metabolicNote: "Resting metabolic rate increases ~100-300 kcal/day. Fat oxidation increases, carb oxidation decreases. Protein, carb, fat intakes naturally rise in mid-luteal (NIH). Magnesium and B6 may help PMS symptoms.",
  },
};

/** Exercise performance evidence — from systematic reviews on PubMed */
export const EXERCISE_EVIDENCE: Record<CyclePhase, {
  strength: string;
  endurance: string;
  recommendation: string;
  evidence: string;
}> = {
  menstrual: {
    strength: "May be reduced — low estrogen decreases anabolic signaling",
    endurance: "Normal to slightly reduced",
    recommendation: "Light to moderate intensity. Gentle movement can reduce cramps via endorphin release. Deload if fatigued.",
    evidence: "Declines in strength noted during early follicular/menstrual phase (PMC11897035). No contraindication to exercise.",
  },
  follicular: {
    strength: "Increasing — estrogen has anabolic effects on muscle",
    endurance: "Improving — higher carb utilization efficiency",
    recommendation: "Best window for progressive overload and introducing new exercises. Higher pain tolerance supports intensity.",
    evidence: "Strength training during late follicular phase produces greater muscle strength increases (PMC4236309). Estrogen is anabolic.",
  },
  ovulation: {
    strength: "Peak — testosterone and estrogen both at highest",
    endurance: "Peak aerobic capacity",
    recommendation: "Attempt PRs, heavy compounds, plyometrics, high-intensity intervals. 2-3 day window.",
    evidence: "Strength peaks at ovulation (PMC12195628). Higher injury risk for ACL — warm up thoroughly (conflicting evidence).",
  },
  luteal: {
    strength: "Maintained but RPE increases — same weight feels harder",
    endurance: "Slightly reduced — higher core temp, lower plasma volume",
    recommendation: "Maintain volume, allow longer rest. Favor steady-state over HIIT. Extra warm-up time.",
    evidence: "Progesterone is catabolic. Core temp rise of 0.2-0.5°C increases perceived effort (PMC7916245). Fat oxidation is higher.",
  },
};

/** Nutritional guidance per phase — from WHO, NIH nutrition studies */
export const NUTRITION_EVIDENCE: Record<CyclePhase, {
  keyNutrients: { nutrient: string; reason: string; source: string }[];
  caloricNote: string;
  hydration: string;
}> = {
  menstrual: {
    keyNutrients: [
      { nutrient: "Iron", reason: "Compensate for menstrual blood loss (~1mg/day lost)", source: "WHO 2011 guidelines" },
      { nutrient: "Omega-3", reason: "Anti-inflammatory — may reduce prostaglandin-driven cramps", source: "PMC8296102" },
      { nutrient: "Magnesium", reason: "Muscle relaxant, may ease cramps and improve sleep", source: "NIH" },
      { nutrient: "Vitamin C", reason: "Enhances non-heme iron absorption", source: "WHO" },
    ],
    caloricNote: "Metabolic rate returns to baseline. No additional caloric needs.",
    hydration: "Maintain normal hydration. Some experience slight dehydration from fluid shifts.",
  },
  follicular: {
    keyNutrients: [
      { nutrient: "Lean protein", reason: "Support rising estrogen's anabolic effects on muscle", source: "PMC10979803" },
      { nutrient: "Complex carbs", reason: "Peak insulin sensitivity — best carb tolerance of the cycle", source: "NIH" },
      { nutrient: "Zinc", reason: "Supports follicle development and immune function", source: "NIH" },
    ],
    caloricNote: "Normal caloric needs. Best phase for caloric deficit if cutting — lower appetite, better insulin sensitivity.",
    hydration: "Normal hydration needs.",
  },
  ovulation: {
    keyNutrients: [
      { nutrient: "Antioxidants", reason: "Support egg quality and reduce oxidative stress from intense training", source: "NIH" },
      { nutrient: "B vitamins", reason: "Support energy metabolism during peak performance window", source: "PMC8296102" },
      { nutrient: "Calcium", reason: "Serum calcium is highest in follicular, begins dropping — maintain intake", source: "PubMed 19562050" },
    ],
    caloricNote: "Slight increase to fuel peak performance. Core temp beginning to rise increases BMR slightly.",
    hydration: "Increase slightly — body temperature rising post-ovulation.",
  },
  luteal: {
    keyNutrients: [
      { nutrient: "Magnesium", reason: "Evidence supports PMS symptom reduction (cramps, mood, water retention)", source: "NIH" },
      { nutrient: "Vitamin B6", reason: "May reduce PMS mood symptoms and breast tenderness", source: "ACOG" },
      { nutrient: "Calcium", reason: "1200mg/day shown to reduce PMS severity by ~50% in RCTs", source: "NIH" },
      { nutrient: "Tryptophan-rich foods", reason: "Serotonin precursor — counteracts luteal serotonin dip", source: "NIH" },
    ],
    caloricNote: "Metabolic rate is 100-300 kcal/day higher. Allow slightly more food — restricting too hard worsens PMS and increases binge risk.",
    hydration: "Progesterone is mildly diuretic but also causes water retention. Maintain consistent hydration to reduce bloating.",
  },
};

// ─── Intelligence Functions ────────────────────────────────────────────────

export type HealthFlag = {
  id: string;
  title: string;
  description: string;
  severity: "info" | "heads-up" | "see-doctor";
  source: string;
  actionable: string;
};

export type CycleScore = {
  score: number;
  label: string;
  factors: { factor: string; status: "good" | "watch" | "concern" }[];
};

export type PhaseIntelligence = {
  phase: CyclePhase;
  cycleDay: number;
  symptoms: typeof PHASE_SYMPTOM_PREVALENCE[CyclePhase];
  exercise: typeof EXERCISE_EVIDENCE[CyclePhase];
  nutrition: typeof NUTRITION_EVIDENCE[CyclePhase];
  fertilityLevel: string;
  healthFlags: HealthFlag[];
  cycleScore: CycleScore | null;
  predictions: SymptomPrediction[];
};

export type SymptomPrediction = {
  symptom: string;
  likelihood: "likely" | "possible" | "unlikely";
  reason: string;
  tip: string;
};

/**
 * Analyze cycle logs against FIGO/ACOG clinical thresholds and return health flags.
 */
export function analyzeHealthFlags(
  logs: CycleLog[],
  symptomLogs: CycleSymptomLog[],
  userAge?: number
): HealthFlag[] {
  const flags: HealthFlag[] = [];
  const periodStarts = logs.map((l) => l.period_start);
  const gaps = computeCycleGaps(periodStarts);

  if (gaps.length < 2) {
    flags.push({
      id: "insufficient_data",
      title: "Keep logging",
      description: "Log at least 3 periods to unlock full cycle health analysis.",
      severity: "info",
      source: "",
      actionable: "Log your next period start date when it arrives.",
    });
    return flags;
  }

  const avgLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const isAdolescent = userAge !== undefined && userAge < 19;
  const range = isAdolescent ? CLINICAL_RANGES.adolescentCycleLength : CLINICAL_RANGES.cycleLength;

  // Cycle length check (FIGO System 1)
  if (avgLength < range.min) {
    flags.push({
      id: "short_cycle",
      title: "Short cycles detected",
      description: `Your average cycle is ${avgLength} days. ${isAdolescent ? "For adolescents, cycles" : "Cycles"} under ${range.min} days are classified as frequent by FIGO and may indicate anovulation or luteal phase deficiency.`,
      severity: "see-doctor",
      source: `FIGO AUB System 1 (2018): Normal frequency ${range.min}-${range.max} days`,
      actionable: "Mention this pattern at your next gynecologist visit. It may be entirely normal for you, but worth evaluating.",
    });
  } else if (avgLength > range.max) {
    flags.push({
      id: "long_cycle",
      title: "Long cycles detected",
      description: `Your average cycle is ${avgLength} days. Cycles over ${range.max} days are classified as infrequent by FIGO. This can be normal but is also associated with PCOS, thyroid disorders, or stress.`,
      severity: avgLength > 45 ? "see-doctor" : "heads-up",
      source: `FIGO AUB System 1 (2018): Normal frequency ${range.min}-${range.max} days`,
      actionable: avgLength > 45
        ? "Cycles this long warrant a medical evaluation to rule out PCOS or hormonal imbalance."
        : "Track for 3-6 more cycles. If consistently long, consider discussing with your doctor.",
    });
  }

  // Cycle regularity check (FIGO)
  if (gaps.length >= 3) {
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const stdDev = Math.sqrt(gaps.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gaps.length);
    if (stdDev > CLINICAL_RANGES.cycleLengthVariation.normalMax) {
      flags.push({
        id: "irregular_variation",
        title: "Irregular cycle length",
        description: `Your cycle length varies by ~${Math.round(stdDev)} days. FIGO considers variation over ${CLINICAL_RANGES.cycleLengthVariation.normalMax} days as irregular. Common causes include stress, PCOS, thyroid issues, or perimenopause.`,
        severity: stdDev > 12 ? "see-doctor" : "heads-up",
        source: "FIGO AUB System 1 (2018): Regularity defined as cycle-to-cycle variation ≤7-9 days",
        actionable: "Track consistently for 6 cycles. If pattern persists, bring your logged data to your doctor — it's very helpful for diagnosis.",
      });
    }
  }

  // Period duration check (ACOG)
  const completedLogs = logs.filter((l) => l.period_start && l.period_end);
  if (completedLogs.length > 0) {
    const durations = completedLogs.map((l) =>
      Math.round((new Date(l.period_end! + "T12:00:00").getTime() - new Date(l.period_start + "T12:00:00").getTime()) / 86400000) + 1
    );
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    if (avgDuration > CLINICAL_RANGES.periodDuration.max) {
      flags.push({
        id: "long_period",
        title: "Long period duration",
        description: `Your periods average ${avgDuration} days. Periods over ${CLINICAL_RANGES.periodDuration.max} days are classified as prolonged by ACOG and may increase iron deficiency risk.`,
        severity: avgDuration > 10 ? "see-doctor" : "heads-up",
        source: "ACOG / FIGO: Normal period duration 2-7 days",
        actionable: "Consider an iron panel blood test. Prolonged periods can cause iron deficiency anemia over time.",
      });
    }
  }

  // Heavy flow pattern check
  const heavyFlowCount = logs.filter((l) => l.flow_level === "very_heavy" || l.flow_level === "heavy").length;
  if (heavyFlowCount >= 3 && logs.length >= 3) {
    const heavyPct = Math.round((heavyFlowCount / logs.length) * 100);
    if (heavyPct >= 60) {
      flags.push({
        id: "heavy_flow",
        title: "Frequently heavy flow",
        description: `${heavyPct}% of your logged periods have heavy or very heavy flow. Heavy menstrual bleeding (HMB) affects ~30% of women and can lead to iron deficiency.`,
        severity: "heads-up",
        source: "FIGO AUB System 1: HMB defined as excessive blood loss interfering with quality of life",
        actionable: "If you're soaking through a pad/tampon every 1-2 hours, or passing clots larger than a coin, discuss with your doctor.",
      });
    }
  }

  // PCOS risk pattern (Rotterdam criteria screening)
  if (avgLength > 35 && gaps.length >= 3) {
    const variation = Math.sqrt(gaps.reduce((sum, g) => sum + (g - avgLength) ** 2, 0) / gaps.length);
    if (variation > 5) {
      const acneCount = symptomLogs.filter((s) => s.symptoms.includes("Acne")).length;
      const hasFrequentAcne = acneCount >= 3;
      flags.push({
        id: "pcos_screen",
        title: "Pattern worth screening for PCOS",
        description: `You have irregular, long cycles (avg ${avgLength}d, ±${Math.round(variation)}d variation)${hasFrequentAcne ? " with frequent acne" : ""}. This pattern meets preliminary screening criteria. PCOS affects 6-15% of reproductive-age women and is very treatable.`,
        severity: "heads-up",
        source: "Rotterdam Criteria (endorsed by ACOG): 2 of 3 — oligo-anovulation, hyperandrogenism, polycystic morphology",
        actionable: "This is NOT a diagnosis. Consider asking your doctor for a simple hormone panel (testosterone, DHEA-S, LH/FSH ratio) at your next visit.",
      });
    }
  }

  // PMS/PMDD pattern detection
  const lutealSymptomDays = symptomLogs.filter((s) => {
    const hasMoodSymptom = s.symptoms.some((sym) =>
      ["Irritability", "Anxiety", "Insomnia", "Brain fog"].includes(sym)
    ) || s.mood === "Stressed" || s.mood === "Anxious" || s.mood === "Irritable" || s.mood === "Emotional";
    return hasMoodSymptom;
  }).length;

  if (lutealSymptomDays >= 5 && symptomLogs.length >= 10) {
    const moodPct = Math.round((lutealSymptomDays / symptomLogs.length) * 100);
    if (moodPct >= 40) {
      flags.push({
        id: "pms_pattern",
        title: "Significant premenstrual symptoms",
        description: `${moodPct}% of your check-ins include mood-related symptoms. While ~75% of women experience some PMS (ACOG), 3-8% have PMDD, a severe form that is treatable.`,
        severity: moodPct >= 60 ? "heads-up" : "info",
        source: "ACOG: PMS prevalence ~75%; NIH: PMDD prevalence 3-8%",
        actionable: "If mood symptoms severely disrupt daily life in the 1-2 weeks before your period, discuss PMDD screening with your doctor. Effective treatments exist.",
      });
    }
  }

  // All clear
  if (flags.length === 0) {
    flags.push({
      id: "healthy_cycle",
      title: "Cycle looks healthy",
      description: `Your average cycle is ${avgLength} days with regular variation. This falls within FIGO/ACOG normal ranges.`,
      severity: "info",
      source: "FIGO AUB System 1 (2018) / ACOG",
      actionable: "Keep logging to maintain your cycle health history. This data is valuable for your healthcare provider.",
    });
  }

  return flags;
}

/**
 * Generate a cycle health score (0-100) based on clinical parameters.
 */
export function computeCycleScore(logs: CycleLog[]): CycleScore | null {
  const periodStarts = logs.map((l) => l.period_start);
  const gaps = computeCycleGaps(periodStarts);
  if (gaps.length < 2) return null;

  const factors: CycleScore["factors"] = [];
  let score = 100;

  // Cycle length (30 points)
  const avgLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  if (avgLength >= 24 && avgLength <= 38) {
    factors.push({ factor: `Cycle length: ${avgLength}d (normal range)`, status: "good" });
  } else if (avgLength >= 21 && avgLength <= 42) {
    factors.push({ factor: `Cycle length: ${avgLength}d (borderline)`, status: "watch" });
    score -= 15;
  } else {
    factors.push({ factor: `Cycle length: ${avgLength}d (outside normal)`, status: "concern" });
    score -= 30;
  }

  // Regularity (30 points)
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const stdDev = Math.round(Math.sqrt(gaps.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gaps.length) * 10) / 10;
  if (stdDev <= 4) {
    factors.push({ factor: `Regularity: ±${stdDev}d variation (very regular)`, status: "good" });
  } else if (stdDev <= 7) {
    factors.push({ factor: `Regularity: ±${stdDev}d variation (normal)`, status: "good" });
    score -= 5;
  } else if (stdDev <= 12) {
    factors.push({ factor: `Regularity: ±${stdDev}d variation (irregular)`, status: "watch" });
    score -= 20;
  } else {
    factors.push({ factor: `Regularity: ±${stdDev}d variation (very irregular)`, status: "concern" });
    score -= 30;
  }

  // Period duration (20 points)
  const completedLogs = logs.filter((l) => l.period_start && l.period_end);
  if (completedLogs.length > 0) {
    const durations = completedLogs.map((l) =>
      Math.round((new Date(l.period_end! + "T12:00:00").getTime() - new Date(l.period_start + "T12:00:00").getTime()) / 86400000) + 1
    );
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    if (avgDuration >= 2 && avgDuration <= 7) {
      factors.push({ factor: `Period duration: ${avgDuration}d (normal)`, status: "good" });
    } else {
      factors.push({ factor: `Period duration: ${avgDuration}d (outside normal)`, status: "watch" });
      score -= 15;
    }
  } else {
    factors.push({ factor: "Period duration: log end dates for this metric", status: "watch" });
    score -= 5;
  }

  // Data sufficiency (20 points)
  if (gaps.length >= 6) {
    factors.push({ factor: `Data: ${gaps.length} cycles tracked (strong history)`, status: "good" });
  } else if (gaps.length >= 3) {
    factors.push({ factor: `Data: ${gaps.length} cycles tracked (building history)`, status: "good" });
    score -= 5;
  } else {
    factors.push({ factor: `Data: ${gaps.length} cycles tracked (need more)`, status: "watch" });
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  let label: string;
  if (score >= 85) label = "Healthy";
  else if (score >= 70) label = "Good";
  else if (score >= 50) label = "Monitor";
  else label = "See a doctor";

  return { score, label, factors };
}

/**
 * Predict likely symptoms for the current phase based on medical prevalence data
 * combined with the user's own symptom history.
 */
export function predictSymptoms(
  phase: CyclePhase,
  cycleDay: number,
  symptomHistory: CycleSymptomLog[]
): SymptomPrediction[] {
  const predictions: SymptomPrediction[] = [];
  const phaseData = PHASE_SYMPTOM_PREVALENCE[phase];

  // Count user's historical symptoms
  const symptomCounts: Record<string, number> = {};
  symptomHistory.forEach((s) => {
    s.symptoms.forEach((sym) => {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    });
  });
  const totalLogs = symptomHistory.length || 1;

  if (phase === "menstrual") {
    predictions.push({
      symptom: "Cramps",
      likelihood: "likely",
      reason: "~90% of menstruating people experience cramps (ACOG). Prostaglandins cause uterine contractions.",
      tip: "Heat packs, gentle movement, or ibuprofen (blocks prostaglandin production) can help.",
    });
    if (symptomCounts["Fatigue"] && symptomCounts["Fatigue"] / totalLogs > 0.3) {
      predictions.push({
        symptom: "Fatigue",
        likelihood: "likely",
        reason: "You've logged fatigue frequently, and iron levels dip during menstruation from blood loss.",
        tip: "Iron-rich foods (spinach, lentils, red meat) with vitamin C to boost absorption.",
      });
    } else {
      predictions.push({
        symptom: "Fatigue",
        likelihood: "possible",
        reason: "Iron dips from blood loss can cause tiredness, especially with heavy flow.",
        tip: "Prioritize iron-rich foods and adequate sleep.",
      });
    }
    predictions.push({
      symptom: "Headache",
      likelihood: "possible",
      reason: "Estrogen withdrawal triggers headaches in ~25% of people.",
      tip: "Stay hydrated and maintain consistent caffeine intake (withdrawal worsens headaches).",
    });
  }

  if (phase === "follicular") {
    predictions.push({
      symptom: "Increased energy",
      likelihood: "likely",
      reason: "Rising estrogen boosts serotonin production and improves insulin sensitivity.",
      tip: "Great time to increase training intensity and try challenging workouts.",
    });
  }

  if (phase === "ovulation") {
    predictions.push({
      symptom: "Pelvic twinge",
      likelihood: "possible",
      reason: "Mittelschmerz (ovulation pain) affects ~20% of people — a brief, one-sided lower abdominal pain.",
      tip: "Mild and brief. If severe or lasting, it may indicate something else — see your doctor.",
    });
    predictions.push({
      symptom: "Higher libido",
      likelihood: "likely",
      reason: "Peak testosterone and estrogen levels naturally increase sex drive around ovulation.",
      tip: "This is your peak fertility window — be aware if contraception is relevant.",
    });
  }

  if (phase === "luteal") {
    const userHasBloating = (symptomCounts["Bloating"] || 0) / totalLogs > 0.2;
    predictions.push({
      symptom: "Bloating & water retention",
      likelihood: userHasBloating ? "likely" : "possible",
      reason: "Progesterone causes water retention. Weight can increase 1-3kg — this is NOT fat gain.",
      tip: "Reduce sodium, increase potassium (bananas, potatoes). Don't restrict calories to compensate — this is temporary.",
    });

    const userMoodIssues = (symptomCounts["Irritability"] || 0) + (symptomCounts["Anxiety"] || 0);
    predictions.push({
      symptom: "Mood changes",
      likelihood: userMoodIssues / totalLogs > 0.3 ? "likely" : "possible",
      reason: "75% experience some PMS (ACOG). Serotonin drops as estrogen falls in late luteal phase.",
      tip: "Magnesium (400mg), B6 (50-100mg), and calcium (1200mg) have evidence for reducing PMS severity.",
    });

    predictions.push({
      symptom: "Cravings",
      likelihood: "likely",
      reason: "Your metabolic rate is 100-300 kcal/day higher. The body is genuinely asking for more fuel.",
      tip: "Don't fight it with restriction (increases binge risk). Add a healthy snack — your body actually needs the extra energy.",
    });

    if (cycleDay >= 24) {
      predictions.push({
        symptom: "Pre-period symptoms intensify",
        likelihood: "likely",
        reason: "You're in the late luteal phase. Progesterone and estrogen are both crashing toward menstruation.",
        tip: "Period likely arriving in 1-4 days. Stock up on comfort items and plan lighter workouts.",
      });
    }
  }

  return predictions;
}

/**
 * Get complete phase intelligence combining medical data with user history.
 */
export function getPhaseIntelligence(
  logs: CycleLog[],
  symptomLogs: CycleSymptomLog[],
  userAge?: number
): PhaseIntelligence | null {
  const periodStarts = logs.map((l) => l.period_start);
  if (periodStarts.length === 0) return null;

  const cycleLen = computeAdaptiveCycleLength(periodStarts);
  const today = new Date().toISOString().split("T")[0];
  const lastStart = periodStarts[0] ?? today;
  const { phase, cycleDay } = estimateCyclePhase(lastStart, cycleLen, today);
  const { level } = getFertilityLevel(cycleDay, cycleLen);

  return {
    phase,
    cycleDay,
    symptoms: PHASE_SYMPTOM_PREVALENCE[phase],
    exercise: EXERCISE_EVIDENCE[phase],
    nutrition: NUTRITION_EVIDENCE[phase],
    fertilityLevel: level,
    healthFlags: analyzeHealthFlags(logs, symptomLogs, userAge),
    cycleScore: computeCycleScore(logs),
    predictions: predictSymptoms(phase, cycleDay, symptomLogs),
  };
}

// ─── Wellness Suggestions ─────────────────────────────────────────────────

export type WellnessSuggestion = {
  category: "movement" | "nutrition" | "mindfulness" | "sleep" | "hydration" | "comfort";
  title: string;
  description: string;
  source?: string;
  priority: number;
  trigger: string;
};

const ENERGY_LABELS = ["Drained", "Low", "Neutral", "Strong", "Peak"] as const;
const SLEEP_LABELS = ["Awful", "Poor", "Fair", "Good", "Great"] as const;

export { ENERGY_LABELS, SLEEP_LABELS };

export function getWellnessSuggestions(
  symptoms: string[],
  mood: string | null,
  energy: number | null,
  sleep: number | null,
  craving: string | null,
  phase: CyclePhase | null,
): WellnessSuggestion[] {
  const all: WellnessSuggestion[] = [];
  const symSet = new Set(symptoms.map(s => s.toLowerCase()));
  const hasPain = symSet.has("cramps") || symSet.has("back pain") || symSet.has("headache") || symSet.has("joint pain");
  const hasGI = symSet.has("bloating") || symSet.has("nausea");
  const hasFatigue = symSet.has("fatigue") || (energy !== null && energy <= 2);
  const hasSleepIssue = symSet.has("insomnia") || (sleep !== null && sleep <= 2);
  const hasMoodIssue = mood === "Stressed" || mood === "Anxious" || mood === "Irritable" || mood === "Emotional" || mood === "Low";
  const hasAnxiety = mood === "Stressed" || mood === "Anxious" || symSet.has("anxiety");
  const isLowEnergy = energy !== null && energy <= 2;
  const isHighEnergy = energy !== null && energy >= 4;
  const isSleepDeprived = sleep !== null && sleep <= 2;
  const isWellRested = sleep !== null && sleep >= 4;

  // ═══════════════════════════════════════════════════════════════════
  // LAYER 1: COMPOUND PATTERNS (multi-signal, highest priority)
  // These catch specific combos that need tailored advice different
  // from any single-symptom response.
  // ═══════════════════════════════════════════════════════════════════

  // Pain + fatigue + poor sleep = body is in distress
  if (hasPain && hasFatigue && hasSleepIssue) {
    all.push({
      category: "comfort", priority: 12, trigger: "pain + fatigue + poor sleep",
      title: "Full recovery mode",
      description: "Your body is sending strong recovery signals — pain, fatigue, and poor sleep compound each other. Cancel non-essential plans. Apply heat to pain areas, take magnesium glycinate (200-400mg) before bed, and eat iron-rich foods with vitamin C. This combination resolves faster with deliberate rest than by pushing through.",
      source: "ACOG: Multimodal symptom management for severe dysmenorrhea",
    });
  }

  // Pain + mood issue = pain is affecting mental state
  if (hasPain && hasMoodIssue && !hasFatigue) {
    all.push({
      category: "mindfulness", priority: 11, trigger: "pain + mood disturbance",
      title: "Pain-mood cycle intervention",
      description: "Chronic pain elevates cortisol, which worsens both mood and pain sensitivity — a feedback loop. Break it with 10 minutes of slow diaphragmatic breathing (4s in, 6s out), then apply warmth to pain areas. The breathing resets your nervous system before addressing the physical symptom.",
      source: "NIH: Pain-cortisol-mood feedback loop in menstrual disorders",
    });
  }

  // GI + fatigue = nutrient absorption compromised
  if (hasGI && hasFatigue) {
    all.push({
      category: "nutrition", priority: 11, trigger: "GI symptoms + fatigue",
      title: "Nutrient absorption support",
      description: "When nausea or bloating meets fatigue, your gut may not be absorbing nutrients efficiently. Switch to easily digestible foods: bone broth, mashed sweet potato, bananas, and plain rice. Sip ginger tea between meals. Avoid raw vegetables and high-fiber foods until GI symptoms ease — cooked and soft foods are gentler.",
      source: "Gastroenterology (2016): Gut motility changes across menstrual phases",
    });
  }

  // Poor sleep + anxiety = cortisol spiral
  if (hasSleepIssue && hasAnxiety) {
    all.push({
      category: "sleep", priority: 11, trigger: "sleep disruption + anxiety",
      title: "Break the anxiety-insomnia cycle",
      description: "Anxiety prevents sleep, and sleep loss amplifies anxiety — hormonal changes make both worse. Tonight: no screens 90 minutes before bed, write 3 worries on paper (externalizing calms the amygdala), drink tart cherry juice (natural melatonin), and keep your room at 18°C. If you wake at 3-4 AM, don't check the time — practice body scanning from toes upward.",
      source: "Sleep Medicine Reviews (2019): CBT-i principles for hormonally-disrupted sleep",
    });
  }

  // Bloating + craving = metabolic signal
  if (symSet.has("bloating") && craving && craving !== "None") {
    all.push({
      category: "nutrition", priority: 10, trigger: "bloating + " + craving.toLowerCase() + " craving",
      title: "Smart craving satisfaction",
      description: craving === "Salty"
        ? "Salt craving with bloating seems contradictory but isn't — progesterone shifts aldosterone, making your body seek sodium while retaining water. Use mineral-rich salt (Himalayan/sea salt) in food rather than salty snacks. Pair with potassium: a banana with a pinch of salt satisfies the craving and counteracts bloating."
        : craving === "Sweet" || craving === "Chocolate"
        ? "Sweet cravings with bloating often signal your body wants magnesium and quick energy, not necessarily sugar. Try: 2 squares of dark chocolate (70%+) with a handful of almonds — magnesium from both sources, plus the chocolate satisfies the craving without spiking blood sugar that worsens bloating."
        : craving === "Carbs"
        ? "Carb cravings with bloating means your serotonin is low (carbs help produce it) but your gut is stressed. Choose low-FODMAP carbs: plain rice, oatmeal, or sourdough toast. These satisfy the craving without the gas and water retention that come from high-fiber or wheat-heavy options."
        : "Eat small portions of what you're craving alongside anti-bloating foods. Peppermint tea before or after helps. Don't restrict — restriction increases cortisol, which worsens both bloating and cravings.",
      source: "NIH: Aldosterone-progesterone axis and fluid retention",
    });
  }

  // Fatigue + brain fog = cognitive impairment
  if (hasFatigue && symSet.has("brain fog")) {
    all.push({
      category: "nutrition", priority: 10, trigger: "fatigue + brain fog",
      title: "Fuel your brain",
      description: "Fatigue and brain fog together often mean your brain isn't getting enough glucose or iron. Eat something now: eggs, avocado on toast, or a handful of nuts with fruit. Drink 500ml of water — even mild dehydration (1-2%) impairs cognitive function by up to 25%. A 10-minute walk outside combines movement, light exposure, and increased cerebral blood flow.",
      source: "Journal of Nutrition (2012): Mild dehydration impairs cognitive performance in women",
    });
  }

  // Low energy + good sleep = hormonal, not behavioral
  if (isLowEnergy && isWellRested) {
    all.push({
      category: "movement", priority: 9, trigger: "low energy despite good sleep",
      title: "Hormonal fatigue, not sleep debt",
      description: "Well-rested but still drained? This is estrogen or progesterone doing its thing, not a lifestyle problem. Don't force a hard workout — your body won't adapt well today. Instead: a 20-30 min walk at conversational pace, or yoga. Your energy will return; fighting it delays recovery.",
      source: "PMC: Progesterone-mediated fatigue independent of sleep quality",
    });
  }

  // High energy + no symptoms = green light
  if (isHighEnergy && !hasPain && !hasMoodIssue && symSet.size === 0) {
    const phaseBoost = phase === "ovulation"
      ? "You're near ovulation — testosterone and estrogen are peaking. This is your strongest window of the entire cycle. Attempt a PR, try a new challenging workout, or increase volume."
      : phase === "follicular"
      ? "Follicular phase + high energy = your best training window. Progressive overload will stick better now than any other time in your cycle. Add weight, add reps, or try something new."
      : "Your body is primed for output. Push the intensity — interval training, heavy lifts, or a long run. You'll recover faster from today's effort than on lower-energy days.";
    all.push({
      category: "movement", priority: 9, trigger: "high energy + no symptoms",
      title: "Green light day",
      description: phaseBoost,
      source: "PMC4236309: Hormonal optimization windows for training",
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // LAYER 2: SINGLE SYMPTOM RESPONSES (phase-modified)
  // ═══════════════════════════════════════════════════════════════════

  // ── Cramps ──
  if (symSet.has("cramps")) {
    if (phase === "menstrual") {
      all.push({
        category: "comfort", priority: 10, trigger: "menstrual cramps",
        title: "Heat therapy + positioning",
        description: "Apply a heating pad to your lower abdomen for 20 minutes on, 10 off. Lying in fetal position on your left side reduces uterine pressure. Heat is clinically equal to ibuprofen for menstrual cramps — if using both, heat first to see if medication is even needed.",
        source: "BMC Womens Health (2018): Heat wrap therapy comparable to analgesics",
      });
    } else if (phase === "luteal") {
      all.push({
        category: "comfort", priority: 10, trigger: "pre-menstrual cramps",
        title: "Pre-menstrual cramp prevention",
        description: "Cramps before your period starts? This is prostaglandin buildup. Start magnesium (200-400mg/day) and omega-3s now — they take 24-48 hours to reduce prostaglandin production. Gentle hip-opening stretches and a warm bath tonight can prevent cramps from worsening when your period arrives.",
        source: "ACOG: Prostaglandin-mediated dysmenorrhea pathophysiology",
      });
    } else {
      all.push({
        category: "comfort", priority: 9, trigger: "mid-cycle cramps",
        title: "Mid-cycle cramping",
        description: "Cramps outside your period can be ovulation pain (mittelschmerz) — a sharp, one-sided lower-abdominal ache lasting hours to 2 days. Heat and gentle movement help. If pain is severe, persistent, or accompanied by heavy bleeding, consult a healthcare provider.",
        source: "ACOG: Ovulatory pain is normal but should be distinguished from pathology",
      });
    }
  }

  // ── Back pain ──
  if (symSet.has("back pain") && !symSet.has("cramps")) {
    all.push({
      category: "movement", priority: 8, trigger: "back pain",
      title: "Back pain relief",
      description: "Cycle-related back pain is referred pain from uterine contractions. Cat-cow stretches, child's pose, and pelvic tilts target the exact muscles involved. A tennis ball against the wall on your lower back provides targeted pressure. Avoid prolonged sitting — set a timer to move every 30 minutes.",
      source: "Physical Therapy (2017): Targeted stretching for menstrual-related back pain",
    });
  }

  // ── Headache (phase-specific) ──
  if (symSet.has("headache")) {
    if (phase === "menstrual" || phase === "luteal") {
      all.push({
        category: "hydration", priority: 9, trigger: "hormonal headache",
        title: "Estrogen-withdrawal headache",
        description: "This headache is triggered by falling estrogen levels. Drink 500ml of water now — dehydration amplifies it. Keep caffeine intake stable (don't add or cut). Magnesium (400mg) and riboflavin (vitamin B2, 400mg) taken daily can reduce frequency by up to 50% over time. Cold compress on the forehead, dim lights.",
        source: "Neurology (2004): Estrogen withdrawal as migraine trigger; Cephalalgia (2016): Magnesium prophylaxis",
      });
    } else {
      all.push({
        category: "hydration", priority: 8, trigger: "headache",
        title: "Hydration and trigger check",
        description: "Mid-cycle headaches may relate to dehydration, skipped meals, or tension. Drink water, eat something with protein, and check your posture. If headaches consistently appear around day 14, they may be ovulation-triggered — tracking this pattern helps your provider if you seek care.",
      });
    }
  }

  // ── Bloating (phase-specific) ──
  if (symSet.has("bloating") && !(craving && craving !== "None")) {
    if (phase === "luteal") {
      all.push({
        category: "nutrition", priority: 9, trigger: "luteal bloating",
        title: "Luteal phase bloating",
        description: "Progesterone slows gut motility and promotes water retention — bloating is the #1 luteal complaint. Reduce sodium, eat potassium-rich foods (banana, sweet potato, avocado), and drink peppermint or fennel tea. Gentle movement (walking, not crunches) helps move gas. This will resolve when your period starts.",
        source: "Gastroenterology (2016): Progesterone-mediated GI transit delay",
      });
    } else {
      all.push({
        category: "nutrition", priority: 8, trigger: "bloating",
        title: "Reduce bloating naturally",
        description: "Cut sodium today, increase potassium-rich foods (bananas, sweet potatoes, spinach). Peppermint or ginger tea eases GI discomfort. Avoid carbonated drinks, chewing gum, and eating too fast — these introduce air. A 15-minute walk after meals speeds gastric emptying.",
        source: "NIH: Potassium helps regulate fluid balance",
      });
    }
  }

  // ── Fatigue (standalone, not already caught by compound) ──
  if (hasFatigue && !symSet.has("brain fog") && !(hasPain && hasSleepIssue)) {
    if (phase === "menstrual") {
      all.push({
        category: "nutrition", priority: 9, trigger: "menstrual fatigue",
        title: "Replenish iron stores",
        description: "You're losing iron through menstruation — fatigue is often the first sign. Eat iron-rich foods (red meat, spinach, lentils, fortified cereals) with vitamin C (citrus, bell peppers) for absorption. Avoid tea/coffee with meals — tannins block iron uptake. If fatigue persists every cycle, ask your provider about ferritin levels.",
        source: "WHO 2011: Intermittent iron supplementation; Lancet (2012): Ferritin-guided iron replacement",
      });
    } else {
      all.push({
        category: "sleep", priority: 8, trigger: "fatigue",
        title: "Strategic rest",
        description: "Low energy mid-cycle is your body prioritizing hormonal production over available energy. A 20-minute nap (set an alarm — longer disrupts nighttime sleep) is the most efficient reset. If napping isn't possible, 10 minutes of legs-up-the-wall pose improves circulation and restores alertness.",
      });
    }
  }

  // ── Anxiety / Stress (expanded) ──
  if (hasAnxiety && !(hasSleepIssue)) {
    if (phase === "luteal") {
      all.push({
        category: "mindfulness", priority: 10, trigger: "luteal anxiety",
        title: "Luteal phase anxiety management",
        description: "Progesterone metabolizes into allopregnanolone, which normally calms you — but when levels fluctuate rapidly in the late luteal phase, it can trigger anxiety instead. 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) directly activates vagal tone. Also: reduce caffeine by half today — your sensitivity to it increases in this phase.",
        source: "Psychoneuroendocrinology (2018): ALLO fluctuations and premenstrual anxiety",
      });
    } else {
      all.push({
        category: "mindfulness", priority: 9, trigger: "stress/anxiety",
        title: "Breathing and grounding",
        description: "Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4-6 cycles. This directly activates the parasympathetic nervous system and lowers cortisol within minutes. Follow with 5-4-3-2-1 grounding: name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.",
        source: "NIH: Slow breathing activates vagal tone, reducing cortisol",
      });
    }
  }

  // ── Irritable / Emotional ──
  if ((mood === "Irritable" || mood === "Emotional") && !hasPain) {
    all.push({
      category: "nutrition", priority: 8, trigger: mood === "Irritable" ? "irritability" : "emotional sensitivity",
      title: mood === "Irritable" ? "Calm the irritability" : "Support emotional balance",
      description: mood === "Irritable"
        ? "Irritability often signals low serotonin — your brain's feel-good neurotransmitter drops in the luteal phase. Eat tryptophan-rich foods (turkey, eggs, cheese, nuts) with complex carbs (oats, sweet potato) — carbs help tryptophan cross the blood-brain barrier. A brisk 20-minute walk also boosts serotonin immediately."
        : "Emotional sensitivity is driven by rapid estrogen/progesterone shifts — your feelings are real, but their intensity is amplified. Don't make major decisions today. Express rather than suppress: journaling for 10 minutes reduces emotional intensity. Warm drinks (herbal tea, warm milk) have genuine calming effects through vagal activation.",
      source: "NIH: Tryptophan availability and serotonin synthesis; JAMA Psychiatry: Expressive writing and emotional regulation",
    });
  }

  // ── Low mood ──
  if (mood === "Low" && !(hasPain && hasMoodIssue)) {
    all.push({
      category: "mindfulness", priority: 10, trigger: "low mood",
      title: "Be gentle with yourself",
      description: "Low mood during your cycle is hormonally driven and temporary — estrogen's drop directly reduces serotonin and dopamine. Do one comforting thing: a warm bath, favorite music, or connecting with someone you trust. Avoid isolation — even a brief text exchange helps. If low mood persists beyond your period or includes hopelessness, speak with a healthcare provider.",
    });
    all.push({
      category: "movement", priority: 7, trigger: "low mood",
      title: "Sunlight and movement",
      description: "Even 10 minutes of walking outside combines the three most evidence-backed mood interventions: physical movement (endorphins), sunlight exposure (serotonin), and nature (cortisol reduction). You don't need to exercise hard — just move your body in daylight.",
      source: "Lancet Psychiatry (2018): Physical activity and mental health — largest study to date",
    });
  }

  // ── Insomnia / poor sleep (standalone) ──
  if (hasSleepIssue && !hasAnxiety) {
    all.push({
      category: "sleep", priority: 9, trigger: "poor sleep",
      title: "Cycle-specific sleep optimization",
      description: phase === "luteal"
        ? "Progesterone raises core body temperature by 0.3-0.5°C in the luteal phase, disrupting sleep onset. Set your room to 17-18°C (cooler than usual), take a warm shower 90 minutes before bed (the subsequent cool-down triggers melatonin), and try magnesium glycinate (200-400mg). Avoid alcohol — it worsens luteal sleep quality."
        : "Menstrual-phase sleep disruption often comes from pain or iron-related restlessness. A heating pad on your abdomen can help you fall asleep. Tart cherry juice contains natural melatonin. Avoid screens for an hour before bed and keep your room dark — even small light sources suppress melatonin production.",
      source: "Sleep Medicine Reviews (2019): Menstrual cycle and sleep architecture; PMC: Allopregnanolone and GABA receptors",
    });
  }

  // ── Breast tenderness ──
  if (symSet.has("breast tenderness")) {
    all.push({
      category: "comfort", priority: 7, trigger: "breast tenderness",
      title: "Ease breast tenderness",
      description: "Wear a supportive bra — especially during any physical activity. Apply a cold compress for sharp pain or warm compress for dull aching. Cut caffeine (it dilates breast tissue ducts and worsens tenderness). Evening primrose oil (1000-3000mg/day) shows modest benefit in some studies. If tenderness is always one-sided or includes lumps, mention it to your provider.",
      source: "ACOG: Cyclic mastalgia management; BMJ (2002): Evening primrose oil for breast pain",
    });
  }

  // ── Acne (phase-specific) ──
  if (symSet.has("acne")) {
    all.push({
      category: "nutrition", priority: 6, trigger: phase === "luteal" ? "luteal acne" : "hormonal acne",
      title: phase === "luteal" ? "Pre-period breakout management" : "Hormonal acne support",
      description: phase === "luteal"
        ? "Luteal-phase breakouts happen because relative androgen dominance increases sebum production as estrogen drops. Start now: zinc-rich foods (pumpkin seeds, chickpeas, oysters) support skin repair. Avoid high-glycemic foods (white bread, sweets) — they spike insulin, which amplifies androgen effects on sebaceous glands. Don't pick — inflammation peaks now and scars more easily."
        : "Hormonal acne outside the luteal phase may signal persistent androgen sensitivity. Support skin with zinc-rich foods, low-glycemic eating, and adequate water. If acne is consistent, cystic, or along the jawline, consider discussing androgen testing with your provider.",
      source: "JAAD (2010): High-glycemic diet and acne; ACOG: Hyperandrogenic screening",
    });
  }

  // ── Nausea ──
  if (symSet.has("nausea") && !hasGI) {
    all.push({
      category: "nutrition", priority: 8, trigger: "nausea",
      title: "Ease nausea naturally",
      description: "Ginger is clinically proven for nausea: fresh ginger tea (1-2 cm grated in hot water), ginger chews, or capsules (250mg 4x/day). Eat small, frequent meals — an empty stomach worsens nausea. Cold foods (smoothies, yogurt) are often better tolerated than hot. Avoid greasy or heavily spiced food. Acupressure on the P6 point (inner wrist, 2 fingers below crease) can also help.",
      source: "Cochrane Review: Ginger for nausea; BJOG: P6 acupressure and menstrual nausea",
    });
  }

  // ── Brain fog (standalone) ──
  if (symSet.has("brain fog") && !hasFatigue) {
    all.push({
      category: "hydration", priority: 8, trigger: "brain fog",
      title: "Clear the fog",
      description: "Brain fog during your cycle correlates with progesterone peaks affecting GABA receptors — the same system benzodiazepines target. Hydrate aggressively (500ml now), eat protein + complex carbs (eggs + toast, yogurt + granola). A 10-minute brisk walk increases cerebral blood flow. Avoid multitasking — your working memory is temporarily reduced, so single-task and write things down.",
      source: "Psychoneuroendocrinology (2015): Progesterone metabolites and cognitive function",
    });
  }

  // ── Dizziness ──
  if (symSet.has("dizziness")) {
    all.push({
      category: "comfort", priority: 9, trigger: "dizziness",
      title: "Address dizziness safely",
      description: "Sit or lie down immediately if feeling faint. Dizziness during menstruation commonly stems from: (1) low iron — eat iron + vitamin C together, (2) low blood sugar — eat something now, (3) dehydration — drink 500ml water with a pinch of salt. Rise slowly from sitting/lying positions. If dizziness includes heart palpitations, heavy bleeding (soaking a pad/hour), or fainting, seek medical care today.",
      source: "NIH: Iron-deficiency anemia and orthostatic symptoms",
    });
  }

  // ── Hot flashes ──
  if (symSet.has("hot flashes")) {
    all.push({
      category: "comfort", priority: 7, trigger: "hot flashes",
      title: "Cool down strategies",
      description: "Layer your clothing for easy removal. Keep a cool damp cloth and cold water nearby. Avoid triggers: spicy food, alcohol, hot drinks, and warm rooms. Deep slow breathing (6 breaths/minute) during a hot flash can reduce its severity by 50%. If hot flashes are frequent and you're under 40, mention it to your healthcare provider — it can indicate premature ovarian changes.",
      source: "Menopause (2012): Paced breathing for vasomotor symptoms",
    });
  }

  // ── Joint pain (standalone) ──
  if (symSet.has("joint pain") && !symSet.has("cramps")) {
    all.push({
      category: "movement", priority: 7, trigger: "joint pain",
      title: "Hormone-related joint relief",
      description: "Estrogen is anti-inflammatory — when it drops (late luteal, early menstrual), joint pain and stiffness increase. Gentle mobility work (circles, stretches) for 10 minutes helps more than rest. Omega-3 rich foods (salmon, walnuts, chia) reduce inflammatory markers over time. Epsom salt baths (magnesium sulfate) provide both heat and magnesium absorption through skin.",
      source: "PMC: Estrogen, inflammation, and joint health — systematic review",
    });
  }

  // ── Irritability symptom (without mood flag) ──
  if (symSet.has("irritability") && mood !== "Irritable") {
    all.push({
      category: "mindfulness", priority: 7, trigger: "irritability",
      title: "Reset your nervous system",
      description: "Physical irritability (feeling agitated, skin-crawly, easily startled) without a mental mood shift often comes from progesterone's effect on your nervous system. Cold water on your wrists and face activates the dive reflex — an instant calm. Follow with 5 minutes of slow breathing. Magnesium-rich foods (dark chocolate, almonds, spinach) support GABA production.",
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // LAYER 3: CRAVINGS (always included as secondary advice)
  // ═══════════════════════════════════════════════════════════════════

  if (craving && craving !== "None" && !(symSet.has("bloating") && craving)) {
    const desc: Record<string, string> = {
      Chocolate: "Chocolate cravings signal low magnesium — legitimate during hormonal shifts. Dark chocolate (70%+) provides magnesium, iron, and mood-boosting theobromine. 1-2 squares is a real intervention, not a guilty pleasure. Pair with almonds for sustained energy.",
      Sweet: "Luteal-phase sweet cravings come from your 100-300 kcal/day higher metabolic rate — your body genuinely needs more fuel. Satisfy with: dates + nut butter, Greek yogurt + honey, or a banana smoothie. These provide the sugar your brain wants plus protein/fat for sustained energy. Don't restrict — it backfires.",
      Salty: "Salt cravings reflect progesterone-driven aldosterone changes. Satisfy with mineral-rich options: olives, pickles, miso soup, or salted nuts. A pinch of quality salt in water with lemon is a cheap electrolyte drink. Avoid ultra-processed salty snacks — they spike sodium without the minerals your body actually wants.",
      Carbs: "Carb cravings serve a real purpose: your brain needs carbs to transport tryptophan across the blood-brain barrier for serotonin production. Choose: oatmeal, sweet potato, whole-grain toast, or rice with butter. These satisfy without a blood sugar spike-crash that triggers more cravings.",
      Spicy: "Spicy food triggers endorphin release — your body may be seeking natural pain relief. Capsaicin also has anti-inflammatory properties. Go for it — a curry, hot sauce on eggs, or kimchi. Avoid spicy food only if you also have nausea or bloating.",
    };
    all.push({
      category: "nutrition", priority: 5, trigger: craving.toLowerCase() + " craving",
      title: `Why you're craving ${craving.toLowerCase()}`,
      description: desc[craving] ?? "Listen to your body — cravings during hormonal shifts often reflect genuine nutritional needs. Satisfy them with whole-food versions rather than ultra-processed options.",
      source: "NIH: Luteal phase metabolic rate increase and macronutrient preference shifts",
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // LAYER 4: PHASE DEFAULTS (when few or no symptom-specific triggers)
  // ═══════════════════════════════════════════════════════════════════

  if (all.length <= 1 && phase) {
    const phaseDefaults: Record<CyclePhase, WellnessSuggestion[]> = {
      menstrual: [
        {
          category: "comfort", priority: 4, trigger: "menstrual phase",
          title: "Active recovery day",
          description: "Your body is shedding the uterine lining — this is metabolically demanding work. Honor it: warm foods (soups, stews), iron-rich meals, gentle movement like walking or yin yoga. This isn't weakness — it's your body's strongest regeneration window. Avoid ice-cold drinks and intense workouts for the first 2-3 days.",
        },
        {
          category: "nutrition", priority: 3, trigger: "menstrual phase",
          title: "Iron-rich eating",
          description: "You're losing 30-80ml of blood over these days. Prioritize iron: red meat, dark leafy greens, lentils, fortified cereals. Always pair with vitamin C (squeeze lemon on spinach, eat bell peppers with lentils). Avoid calcium-rich foods at the same meal — calcium competes with iron absorption.",
          source: "WHO 2011: Iron supplementation during menstruation",
        },
      ],
      follicular: [
        {
          category: "movement", priority: 4, trigger: "follicular phase",
          title: "Your training superpower phase",
          description: "Rising estrogen means faster recovery, higher pain tolerance, better insulin sensitivity, and greater muscle protein synthesis. This is the best 7-10 day window in your entire cycle for progressive overload. Add weight to your lifts, try new exercises, push for more reps. Your body is primed to adapt.",
          source: "PMC4236309: Follicular phase strength training produces greater gains",
        },
      ],
      ovulation: [
        {
          category: "movement", priority: 4, trigger: "ovulation phase",
          title: "Peak performance window",
          description: "Testosterone and estrogen both peak now — giving you the best strength, reaction time, and endurance of your entire cycle. This 2-3 day window is ideal for personal records, competitions, or trying something physically ambitious. One caution: ligament laxity also peaks due to relaxin, so warm up thoroughly before explosive movements.",
          source: "PMC12195628: Strength peaks around ovulation; AJSM: ACL injury risk and ovulation",
        },
      ],
      luteal: [
        {
          category: "mindfulness", priority: 4, trigger: "luteal phase",
          title: "Recalibrate expectations",
          description: "The same weight feels 10-15% harder this phase because core temperature rises 0.3-0.5°C, increasing perceived exertion. This is not regression — it's physiology. Maintain training volume but allow longer rest periods. Favor steady-state cardio over HIIT. Extra warm-up time compensates for reduced flexibility.",
          source: "PMC7916245: Core temperature rise increases perceived effort in luteal phase",
        },
        {
          category: "nutrition", priority: 3, trigger: "luteal phase",
          title: "Extra fuel, not extra guilt",
          description: "Your metabolism is 100-300 kcal/day higher this phase. If you're hungry, eat — this is a real metabolic increase, not a willpower failure. Focus on protein + complex carbs (chicken + sweet potato, eggs + oatmeal). Supplementing with magnesium and B6 may reduce PMS symptoms by 30-40%.",
          source: "AJCN (2011): Luteal metabolic rate increase; BMJ (1999): B6 and PMS",
        },
      ],
    };

    for (const s of phaseDefaults[phase] ?? []) {
      all.push(s);
    }
  }

  // ── Good feeling reinforcement (only when truly asymptomatic) ──
  if ((mood === "Great" || mood === "Good") && !hasPain && !hasMoodIssue && symSet.size === 0 && all.length === 0) {
    all.push({
      category: "movement", priority: 4, trigger: "feeling good",
      title: "Capitalize on today",
      description: "No symptoms, good mood — this is a green light day. Challenge yourself physically: a hard workout, a long hike, trying a new sport. Your body has bandwidth right now that it won't always have. Even non-exercise goals (a big project, a difficult conversation, meal prepping for the week) are easier to tackle today.",
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // POST-PROCESSING: Sort, deduplicate, cap
  // ═══════════════════════════════════════════════════════════════════

  all.sort((a, b) => b.priority - a.priority);
  const catCount: Record<string, number> = {};
  const seen = new Set<string>();
  const result: WellnessSuggestion[] = [];
  for (const s of all) {
    const key = `${s.category}:${s.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const cc = catCount[s.category] ?? 0;
    if (cc >= 2) continue;
    catCount[s.category] = cc + 1;
    result.push(s);
    if (result.length >= 6) break;
  }
  return result;
}

export const MEDICAL_DISCLAIMER = "For informational purposes only. Not medical advice. Consult a healthcare provider before starting any supplement or making significant changes to your diet or exercise routine." as const;
