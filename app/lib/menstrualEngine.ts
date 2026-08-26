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
  const hasPainSymptoms = symSet.has("cramps") || symSet.has("back pain") || symSet.has("headache") || symSet.has("joint pain");
  const hasNegativeMood = mood === "Stressed" || mood === "Anxious" || mood === "Irritable" || mood === "Emotional" || mood === "Low";

  // ── Cramps / pain cluster ──
  if (symSet.has("cramps") || symSet.has("back pain")) {
    all.push({
      category: "comfort", priority: 10, trigger: "cramps/pain",
      title: "Heat therapy",
      description: "Apply a heating pad or warm water bottle to your lower abdomen — heat is clinically as effective as ibuprofen for menstrual cramps.",
      source: "BMC Womens Health (2018): Heat wrap therapy comparable to analgesics",
    });
    all.push({
      category: "movement", priority: 8, trigger: "cramps/pain",
      title: "Gentle movement for cramp relief",
      description: "Light walking, yoga, or stretching releases endorphins that naturally reduce pain. Avoid high-impact if cramps are severe.",
      source: "ACOG recommends exercise as a first-line intervention for dysmenorrhea",
    });
    all.push({
      category: "nutrition", priority: 6, trigger: "cramps/pain",
      title: "Anti-inflammatory foods",
      description: "Omega-3 rich foods (salmon, walnuts, flaxseed) may reduce prostaglandin-driven cramping. Avoid excess caffeine and alcohol which can worsen cramps.",
      source: "PMC8296102: Omega-3 supplementation and dysmenorrhea",
    });
  }

  // ── Bloating ──
  if (symSet.has("bloating")) {
    all.push({
      category: "nutrition", priority: 9, trigger: "bloating",
      title: "Reduce bloating naturally",
      description: "Cut sodium, increase potassium-rich foods (bananas, sweet potatoes, spinach). Herbal teas like peppermint or ginger can ease GI discomfort.",
      source: "NIH: Potassium helps regulate fluid balance",
    });
    all.push({
      category: "hydration", priority: 5, trigger: "bloating",
      title: "Drink more water, not less",
      description: "Counterintuitively, staying well-hydrated helps your body release retained water. Aim for 2-3L throughout the day.",
    });
  }

  // ── Headache ──
  if (symSet.has("headache")) {
    all.push({
      category: "hydration", priority: 9, trigger: "headache",
      title: "Hydration and consistency",
      description: "Estrogen-withdrawal headaches worsen with dehydration. Keep caffeine intake consistent — both excess and withdrawal trigger headaches.",
      source: "Neurology (2004): Estrogen withdrawal is a known migraine trigger",
    });
    all.push({
      category: "comfort", priority: 7, trigger: "headache",
      title: "Dim lights and rest",
      description: "If headache is severe, reduce screen brightness, rest in a quiet room, and apply a cold compress to your forehead or temples.",
    });
  }

  // ── Fatigue / low energy ──
  if (symSet.has("fatigue") || (energy !== null && energy <= 2)) {
    all.push({
      category: "nutrition", priority: 9, trigger: "fatigue",
      title: "Iron and energy-supporting foods",
      description: "Fatigue during menstruation often links to iron loss. Eat iron-rich foods (spinach, lentils, red meat) paired with vitamin C for absorption.",
      source: "WHO 2011: Intermittent iron supplementation guidelines",
    });
    all.push({
      category: "sleep", priority: 7, trigger: "fatigue",
      title: "Prioritize rest",
      description: "Low energy is your body asking for recovery. Allow an extra 30-60 min of sleep. A 20-minute afternoon nap can restore alertness without disrupting nighttime sleep.",
    });
  }

  // ── Mood: stressed / anxious ──
  if (mood === "Stressed" || mood === "Anxious" || symSet.has("anxiety")) {
    all.push({
      category: "mindfulness", priority: 10, trigger: "stress/anxiety",
      title: "Breathing and grounding",
      description: "Try 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) for 3-4 cycles. Box breathing (4-4-4-4) also activates the parasympathetic nervous system.",
      source: "NIH: Slow breathing activates vagal tone, reducing cortisol",
    });
  }

  // ── Mood: irritable / emotional ──
  if (mood === "Irritable" || mood === "Emotional" || symSet.has("irritability")) {
    all.push({
      category: "nutrition", priority: 8, trigger: "mood",
      title: "Serotonin-supporting nutrition",
      description: "Tryptophan-rich foods (turkey, eggs, cheese, nuts) are precursors to serotonin. Complex carbs help tryptophan cross the blood-brain barrier.",
      source: "NIH: Tryptophan availability and serotonin synthesis",
    });
  }

  // ── Mood: low ──
  if (mood === "Low") {
    all.push({
      category: "mindfulness", priority: 10, trigger: "low mood",
      title: "Be gentle with yourself",
      description: "Low mood during your cycle is hormonally driven and temporary. Do something comforting — warm bath, favorite music, journaling, or connecting with someone you trust.",
    });
    all.push({
      category: "movement", priority: 6, trigger: "low mood",
      title: "Sunlight and fresh air",
      description: "Even 10 minutes outdoors boosts vitamin D and serotonin. Natural light exposure is one of the most effective mood regulators.",
    });
  }

  // ── Insomnia / poor sleep ──
  if (symSet.has("insomnia") || (sleep !== null && sleep <= 2)) {
    all.push({
      category: "sleep", priority: 9, trigger: "poor sleep",
      title: "Sleep hygiene for cycle disruption",
      description: "Progesterone metabolites affect sleep architecture. Keep your room cool (18-20°C), avoid screens 1hr before bed, and consider magnesium glycinate before sleep.",
      source: "PMC: Progesterone metabolite allopregnanolone affects GABA receptors",
    });
  }

  // ── Breast tenderness ──
  if (symSet.has("breast tenderness")) {
    all.push({
      category: "comfort", priority: 7, trigger: "breast tenderness",
      title: "Supportive measures",
      description: "Wear a well-fitting supportive bra, especially during exercise. Evening primrose oil and reducing caffeine may help — evidence is mixed but low-risk.",
      source: "ACOG: Caffeine reduction may alleviate breast tenderness",
    });
  }

  // ── Acne ──
  if (symSet.has("acne")) {
    all.push({
      category: "nutrition", priority: 6, trigger: "acne",
      title: "Anti-inflammatory skincare support",
      description: "Luteal-phase acne is driven by relative androgen dominance as estrogen drops. Zinc-rich foods (pumpkin seeds, chickpeas) support skin health. Avoid high-glycemic foods which worsen breakouts.",
      source: "JAAD (2010): High-glycemic diet associated with acne severity",
    });
  }

  // ── Cravings ──
  if (craving && craving !== "None") {
    all.push({
      category: "nutrition", priority: 5, trigger: "craving",
      title: `${craving} craving? Your body may need this`,
      description: craving === "Chocolate"
        ? "Chocolate cravings often signal low magnesium. Dark chocolate (70%+) is a legitimate source of magnesium — a small portion is fine."
        : craving === "Sweet"
        ? "Sweet cravings in the luteal phase come from your body's 100-300 kcal/day higher metabolic rate. Satisfy with fruit, yogurt, or a small treat — don't fight it."
        : craving === "Salty"
        ? "Salt cravings may reflect electrolyte shifts from progesterone. A pinch of salt in water, or electrolyte-rich foods like pickles and olives, can help."
        : craving === "Carbs"
        ? "Carb cravings support serotonin production — your brain needs glucose to make it. Complex carbs (oats, sweet potato, whole grain) satisfy without a spike-crash."
        : craving === "Spicy"
        ? "Spicy food triggers endorphin release — your body may be seeking natural pain relief. Capsaicin also has anti-inflammatory properties."
        : "Listen to your body — cravings often reflect genuine nutritional needs during hormonal shifts.",
      source: "NIH: Luteal phase metabolic rate increase and macronutrient preference shifts",
    });
  }

  // ── Brain fog ──
  if (symSet.has("brain fog")) {
    all.push({
      category: "hydration", priority: 8, trigger: "brain fog",
      title: "Hydrate and move",
      description: "Brain fog correlates with progesterone peaks and dehydration. Drink water consistently, take short movement breaks, and avoid skipping meals — glucose dips worsen cognitive fog.",
    });
  }

  // ── Nausea ──
  if (symSet.has("nausea")) {
    all.push({
      category: "nutrition", priority: 8, trigger: "nausea",
      title: "Ease nausea naturally",
      description: "Ginger tea or ginger chews are clinically supported for nausea relief. Eat small, frequent meals rather than large ones. Avoid greasy or heavily spiced food.",
      source: "Cochrane Review: Ginger for nausea — effective and safe",
    });
  }

  // ── Dizziness ──
  if (symSet.has("dizziness")) {
    all.push({
      category: "comfort", priority: 9, trigger: "dizziness",
      title: "Address dizziness",
      description: "Dizziness can stem from low iron, low blood sugar, or dehydration — all common during menstruation. Sit or lie down, sip water, and eat something with iron and sugar. If persistent, consult a healthcare provider.",
      source: "NIH: Iron-deficiency anemia and orthostatic symptoms",
    });
  }

  // ── Hot flashes ──
  if (symSet.has("hot flashes")) {
    all.push({
      category: "comfort", priority: 7, trigger: "hot flashes",
      title: "Cool down strategies",
      description: "Wear layered clothing, keep a cool cloth nearby, and stay in ventilated spaces. If hot flashes are frequent and you're under 40, mention it to your healthcare provider.",
    });
  }

  // ── Joint pain ──
  if (symSet.has("joint pain")) {
    all.push({
      category: "movement", priority: 7, trigger: "joint pain",
      title: "Gentle joint mobility",
      description: "Estrogen has anti-inflammatory effects on joints — when it drops, joint stiffness can increase. Gentle mobility work and omega-3 foods may help.",
      source: "PMC: Estrogen and joint inflammation — systematic review",
    });
  }

  // ── Phase-specific defaults (only when no symptom-specific suggestions matched) ──
  if (all.length === 0 && phase) {
    if (phase === "menstrual") {
      all.push({
        category: "comfort", priority: 4, trigger: "phase",
        title: "Take it easy today",
        description: "Your body is doing extra work. Honor that with gentle movement, warm foods, and adequate rest. This is not a deload — it's active recovery.",
      });
    } else if (phase === "follicular") {
      all.push({
        category: "movement", priority: 4, trigger: "phase",
        title: "Push your limits",
        description: "Rising estrogen means better recovery, higher pain tolerance, and peak insulin sensitivity. This is your best window for progressive overload.",
        source: "PMC4236309: Follicular phase strength training produces greater gains",
      });
    } else if (phase === "ovulation") {
      all.push({
        category: "movement", priority: 4, trigger: "phase",
        title: "Go for a PR",
        description: "Peak testosterone and estrogen give you your best strength, endurance, and reaction time. Attempt personal records in this 2-3 day window.",
        source: "PMC12195628: Strength peaks around ovulation",
      });
    } else if (phase === "luteal") {
      all.push({
        category: "mindfulness", priority: 4, trigger: "phase",
        title: "Steady and sustainable",
        description: "RPE is higher this phase — the same weight feels harder. Maintain volume but allow longer rest. Favor steady-state over HIIT. Extra warm-up time helps.",
        source: "PMC7916245: Core temperature rise increases perceived effort",
      });
    }
  }

  // ── Good mood reinforcement (only if no pain/negative symptoms) ──
  if ((mood === "Great" || mood === "Good") && !hasPainSymptoms && !hasNegativeMood && symSet.size === 0) {
    all.push({
      category: "movement", priority: 4, trigger: "good mood",
      title: "Ride the wave",
      description: "You're feeling good — capitalize on it. This is a great day for a challenging workout, a new recipe, or tackling something you've been putting off.",
    });
  }

  // ── Sort by priority (highest first), deduplicate by category (keep top per category, max 2 per category), cap at 5 ──
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
    if (result.length >= 5) break;
  }
  return result;
}

export const MEDICAL_DISCLAIMER = "For informational purposes only. Not medical advice. Consult a healthcare provider before starting any supplement or making significant changes to your diet or exercise routine." as const;
