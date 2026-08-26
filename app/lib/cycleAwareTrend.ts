import { supabase } from "./supabase";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export type CycleLog = {
  id: string;
  period_start: string;
  period_end: string | null;
  flow_level: string;
  notes: string | null;
};

export type CycleSymptomLog = {
  id: string;
  date: string;
  symptoms: string[];
  energy_level: number | null;
  mood: string | null;
  sleep_quality: number | null;
  craving: string | null;
  notes: string | null;
};

export type CycleAwareComparison = {
  currentPhase: CyclePhase;
  currentWeightKg: number;
  samePhaseLastCycle: number | null;
  deltaKg: number | null;
  adjustedTrend: string;
};

export type FertilityLevel = "none" | "low" | "high" | "peak";

export type CycleInsight = {
  currentPhase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  phaseInfo: string;
  trainingRec: string;
  nutritionRec: string;
  nextPeriodEstimate: string | null;
  nextPeriodRange: [string, string] | null;
  phaseDaysRemaining: number;
  fertility: FertilityLevel;
  fertileWindowStart: number;
  fertileWindowEnd: number;
  ovulationDay: number;
};

export type CycleIrregularity = {
  type: "short" | "long" | "irregular" | "long_period" | "normal";
  message: string;
  severity: "info" | "warning" | "alert";
};

const PHASE_INFO: Record<CyclePhase, string> = {
  menstrual: "Energy and iron levels dip. Focus on recovery and listen to your body.",
  follicular: "Rising estrogen boosts energy, strength, and pain tolerance. Great time to push intensity.",
  ovulation: "Peak estrogen and testosterone — strongest window. Hit PRs, max effort, power work.",
  luteal: "Progesterone rises, body temp increases. Higher RPE at same load. Favor steady-state and volume.",
};

const TRAINING_RECS: Record<CyclePhase, string> = {
  menstrual: "Light to moderate intensity. Yoga, walking, or deload sets. Reduce volume 20-30% if fatigued.",
  follicular: "Progressive overload. Increase weight or reps. Introduce new exercises. High-intensity intervals.",
  ovulation: "Peak performance window (2-3 days). Attempt PRs, heavy compounds, plyometrics, HIIT.",
  luteal: "Moderate intensity, maintain volume. Longer rest periods. Steady-state cardio over HIIT. Extra warm-up.",
};

const NUTRITION_RECS: Record<CyclePhase, string> = {
  menstrual: "Iron-rich foods (spinach, red meat, lentils). Anti-inflammatory omega-3s. Magnesium for cramps. Hydrate extra.",
  follicular: "Balanced macros support rising energy. Lean protein for muscle synthesis. Complex carbs pre-workout.",
  ovulation: "Slightly higher carbs to fuel peak performance. Antioxidant-rich foods. Stay hydrated — slight temp increase.",
  luteal: "Metabolism rises ~100-300 kcal/day. Increase intake slightly. Magnesium, B6 for PMS. Healthy fats. Reduce caffeine if anxious.",
};

export function getCyclePhaseInfo(phase: CyclePhase): string {
  return PHASE_INFO[phase];
}

export function getTrainingRec(phase: CyclePhase): string {
  return TRAINING_RECS[phase];
}

export function getNutritionRec(phase: CyclePhase): string {
  return NUTRITION_RECS[phase];
}

export function computeCycleGaps(periodStarts: string[]): number[] {
  if (periodStarts.length < 2) return [];
  const sorted = [...periodStarts].sort();
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i] + "T12:00:00").getTime() - new Date(sorted[i - 1] + "T12:00:00").getTime()) / 86400000
    );
    if (diff >= 18 && diff <= 45) gaps.push(diff);
  }
  return gaps;
}

export function computeAdaptiveCycleLength(periodStarts: string[]): number {
  const gaps = computeCycleGaps(periodStarts);
  if (gaps.length === 0) return 28;
  if (gaps.length <= 2) return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const recent = gaps.slice(-3);
  return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
}

export function computeCycleVariance(periodStarts: string[]): number {
  const gaps = computeCycleGaps(periodStarts);
  if (gaps.length < 2) return 0;
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gaps.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

export function getPredictionRange(lastPeriodStart: string, cycleLength: number, periodStarts: string[]): [string, string] {
  const stdDev = computeCycleVariance(periodStarts);
  const margin = Math.max(1, Math.round(stdDev));
  const base = new Date(lastPeriodStart + "T12:00:00");
  const early = new Date(base);
  early.setDate(early.getDate() + cycleLength - margin);
  const late = new Date(base);
  late.setDate(late.getDate() + cycleLength + margin);
  return [early.toISOString().split("T")[0], late.toISOString().split("T")[0]];
}

export function detectIrregularities(periodStarts: string[], logs: CycleLog[]): CycleIrregularity[] {
  const results: CycleIrregularity[] = [];
  const gaps = computeCycleGaps(periodStarts);

  if (gaps.length === 0) return [{ type: "normal", message: "Log at least 2 periods to see cycle insights.", severity: "info" }];

  const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const lastGap = gaps[gaps.length - 1];
  const stdDev = computeCycleVariance(periodStarts);

  if (avg < 21) {
    results.push({ type: "short", message: `Your average cycle is ${avg} days. Cycles under 21 days are considered short — consider mentioning this to your doctor.`, severity: "warning" });
  } else if (avg > 35) {
    results.push({ type: "long", message: `Your average cycle is ${avg} days. Cycles over 35 days are considered long — this can be normal but worth discussing with your doctor.`, severity: "warning" });
  }

  if (stdDev > 7 && gaps.length >= 3) {
    results.push({ type: "irregular", message: `Your cycle length varies by about ${stdDev} days. Variation over 7 days is considered irregular.`, severity: "warning" });
  }

  if (lastGap && gaps.length >= 2) {
    const diff = lastGap - avg;
    if (Math.abs(diff) >= 5) {
      const dir = diff > 0 ? "longer" : "shorter";
      results.push({ type: "irregular", message: `Your last cycle was ${Math.abs(diff)} days ${dir} than your average (${lastGap} vs ${avg} days).`, severity: "info" });
    }
  }

  const completedLogs = logs.filter((l) => l.period_start && l.period_end);
  if (completedLogs.length > 0) {
    const lastDuration = Math.round(
      (new Date(completedLogs[0].period_end! + "T12:00:00").getTime() - new Date(completedLogs[0].period_start + "T12:00:00").getTime()) / 86400000
    ) + 1;
    if (lastDuration > 7) {
      results.push({ type: "long_period", message: `Your last period lasted ${lastDuration} days. Periods over 7 days are worth mentioning to your doctor.`, severity: "warning" });
    }
  }

  if (results.length === 0) {
    results.push({ type: "normal", message: `Your cycle is regular at ${avg} days with ${stdDev} days variation. This is within normal range.`, severity: "info" });
  }

  return results;
}

export function getFertilityLevel(cycleDay: number, cycleLength: number): { level: FertilityLevel; ovulationDay: number; fertileStart: number; fertileEnd: number } {
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;

  let level: FertilityLevel = "none";
  if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
    if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay) {
      level = "peak";
    } else {
      level = "high";
    }
  } else if (cycleDay >= fertileStart - 2 && cycleDay < fertileStart) {
    level = "low";
  }

  return { level, ovulationDay, fertileStart, fertileEnd };
}

export function estimateCyclePhase(
  lastPeriodStart: string,
  cycleLength: number = 28,
  today?: string
): { phase: CyclePhase; cycleDay: number; phaseDaysRemaining: number } {
  const start = new Date(lastPeriodStart + "T12:00:00");
  const now = today ? new Date(today + "T12:00:00") : new Date();
  const daysSincePeriod = Math.round((now.getTime() - start.getTime()) / 86400000) % cycleLength;
  const cycleDay = daysSincePeriod + 1;

  const menstrualEnd = 5;
  const follicularEnd = Math.round(cycleLength * 0.46);
  const ovulationEnd = follicularEnd + 3;

  let phase: CyclePhase;
  let phaseDaysRemaining: number;

  if (daysSincePeriod < menstrualEnd) {
    phase = "menstrual";
    phaseDaysRemaining = menstrualEnd - daysSincePeriod;
  } else if (daysSincePeriod < follicularEnd) {
    phase = "follicular";
    phaseDaysRemaining = follicularEnd - daysSincePeriod;
  } else if (daysSincePeriod < ovulationEnd) {
    phase = "ovulation";
    phaseDaysRemaining = ovulationEnd - daysSincePeriod;
  } else {
    phase = "luteal";
    phaseDaysRemaining = cycleLength - daysSincePeriod;
  }

  return { phase, cycleDay, phaseDaysRemaining };
}

export function estimateNextPeriod(lastPeriodStart: string, cycleLength: number): string {
  const d = new Date(lastPeriodStart + "T12:00:00");
  d.setDate(d.getDate() + cycleLength);
  return d.toISOString().split("T")[0];
}

export function getCycleInsight(
  lastPeriodStart: string,
  cycleLength: number,
  today?: string,
  periodStarts?: string[]
): CycleInsight {
  const { phase, cycleDay, phaseDaysRemaining } = estimateCyclePhase(lastPeriodStart, cycleLength, today);
  const { level, ovulationDay, fertileStart, fertileEnd } = getFertilityLevel(cycleDay, cycleLength);
  const range = periodStarts && periodStarts.length >= 2
    ? getPredictionRange(lastPeriodStart, cycleLength, periodStarts)
    : null;
  return {
    currentPhase: phase,
    cycleDay,
    cycleLength,
    phaseInfo: PHASE_INFO[phase],
    trainingRec: TRAINING_RECS[phase],
    nutritionRec: NUTRITION_RECS[phase],
    nextPeriodEstimate: estimateNextPeriod(lastPeriodStart, cycleLength),
    nextPeriodRange: range,
    phaseDaysRemaining,
    fertility: level,
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
    ovulationDay,
  };
}

export function comparePhaseToPhase(params: {
  currentPhase: CyclePhase;
  currentWeightKg: number;
  weightHistory: { date: string; ema_kg: number; phase?: CyclePhase }[];
  cycleLength?: number;
}): CycleAwareComparison {
  const { currentPhase, currentWeightKg, weightHistory, cycleLength = 28 } = params;

  const samePhaseEntries = weightHistory
    .filter((w) => w.phase === currentPhase)
    .sort((a, b) => b.date.localeCompare(a.date));

  const previousCycleEntries = samePhaseEntries.filter((w) => {
    const daysBetween = Math.round(
      (new Date().getTime() - new Date(w.date).getTime()) / 86400000
    );
    return daysBetween >= cycleLength - 5 && daysBetween <= cycleLength + 5;
  });

  const samePhaseLastCycle = previousCycleEntries.length > 0
    ? previousCycleEntries[0].ema_kg
    : null;

  const deltaKg = samePhaseLastCycle !== null
    ? Math.round((currentWeightKg - samePhaseLastCycle) * 10) / 10
    : null;

  let adjustedTrend = "Not enough cycle data for phase comparison.";
  if (deltaKg !== null) {
    if (deltaKg < -0.3) {
      adjustedTrend = `Down ${Math.abs(deltaKg)} kg vs same phase last cycle — real progress.`;
    } else if (deltaKg > 0.3) {
      adjustedTrend = `Up ${deltaKg} kg vs same phase last cycle.`;
    } else {
      adjustedTrend = `Stable (±${Math.abs(deltaKg)} kg) vs same phase last cycle.`;
    }
  }

  return { currentPhase, currentWeightKg, samePhaseLastCycle, deltaKg, adjustedTrend };
}

export async function fetchCycleLogs(userId: string): Promise<CycleLog[]> {
  const { data } = await supabase
    .from("cycle_logs")
    .select("*")
    .eq("user_id", userId)
    .order("period_start", { ascending: false })
    .limit(12);
  return (data ?? []) as CycleLog[];
}

export async function fetchCycleSymptoms(userId: string, days: number = 30): Promise<CycleSymptomLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from("cycle_symptoms")
    .select("*")
    .eq("user_id", userId)
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: false });
  return (data ?? []) as CycleSymptomLog[];
}

export async function logPeriod(userId: string, periodStart: string, flowLevel: string = "medium", notes?: string): Promise<void> {
  await supabase.from("cycle_logs").upsert({
    user_id: userId,
    period_start: periodStart,
    flow_level: flowLevel,
    notes: notes || null,
  }, { onConflict: "user_id,period_start" });
}

export async function endPeriod(userId: string, periodStart: string, periodEnd: string): Promise<void> {
  await supabase.from("cycle_logs")
    .update({ period_end: periodEnd })
    .eq("user_id", userId)
    .eq("period_start", periodStart);
}

export async function logSymptoms(userId: string, date: string, data: {
  symptoms?: string[];
  energy_level?: number;
  mood?: string;
  sleep_quality?: number;
  craving?: string;
  notes?: string;
}): Promise<void> {
  await supabase.from("cycle_symptoms").upsert({
    user_id: userId,
    date,
    symptoms: data.symptoms ?? [],
    energy_level: data.energy_level ?? null,
    mood: data.mood ?? null,
    sleep_quality: data.sleep_quality ?? null,
    craving: data.craving ?? null,
    notes: data.notes ?? null,
  }, { onConflict: "user_id,date" });
}

export const SYMPTOM_OPTIONS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Back pain",
  "Breast tenderness", "Acne", "Nausea", "Insomnia", "Irritability",
  "Anxiety", "Brain fog", "Joint pain", "Hot flashes", "Dizziness",
] as const;

export const MOOD_OPTIONS = [
  "Great", "Good", "Okay", "Low", "Stressed", "Anxious", "Irritable", "Emotional",
] as const;

export const FLOW_LEVELS = [
  { value: "spotting", label: "Spotting", dots: 1 },
  { value: "light", label: "Light", dots: 2 },
  { value: "medium", label: "Medium", dots: 3 },
  { value: "heavy", label: "Heavy", dots: 4 },
  { value: "very_heavy", label: "Very Heavy", dots: 5 },
] as const;

export const CRAVING_OPTIONS = [
  "Chocolate", "Sweet", "Salty", "Carbs", "Spicy", "None",
] as const;

export type GuideSection = {
  title: string;
  icon: string;
  items: { q: string; a: string; sources?: string[] }[];
};

export const CYCLE_GUIDE: GuideSection[] = [
  {
    title: "Understanding Your Cycle",
    icon: "🔄",
    items: [
      {
        q: "What are the four phases?",
        a: "Your menstrual cycle consists of four hormonally distinct phases:\n\n1. Menstrual (Days 1–5) — Estrogen and progesterone reach their lowest levels, triggering the shedding of the endometrial lining. Prostaglandin release causes uterine contractions (cramps). Iron stores are depleted through blood loss (average 30–80 mL per cycle).\n\n2. Follicular (Days 6–13) — FSH stimulates 15–20 ovarian follicles. Rising estradiol rebuilds the endometrium and increases serotonin and dopamine, improving mood and cognitive function. Insulin sensitivity peaks, and muscle protein synthesis is optimized.\n\n3. Ovulation (Days 14–16) — A surge in LH (luteinizing hormone) triggers the release of the dominant follicle's egg. Testosterone and estrogen both peak, producing the cycle's highest strength, reaction time, and verbal fluency. The egg is viable for 12–24 hours.\n\n4. Luteal (Days 17–28) — The corpus luteum produces progesterone, raising basal body temperature by 0.3–0.5°C. Metabolic rate increases 100–300 kcal/day. Progesterone metabolites (allopregnanolone) modulate GABA receptors, affecting sleep architecture and anxiety. If no implantation occurs, the corpus luteum degenerates, hormone levels drop, and the cycle resets.",
        sources: [
          "ACOG Practice Bulletin No. 128: Diagnosis of Abnormal Uterine Bleeding (2012)",
          "FIGO Systems 1 & 2 for AUB Classification (Munro et al., 2018 revision)",
          "Reed BG, Carr BR. The Normal Menstrual Cycle and the Control of Ovulation. Endotext, NIH (2018)",
        ],
      },
      {
        q: "What is a normal cycle length?",
        a: "According to FIGO (International Federation of Gynecology and Obstetrics), a normal menstrual cycle ranges from 24 to 38 days. The commonly cited \"28-day cycle\" is actually just the median — only about 13% of cycles are exactly 28 days.\n\nCycle-to-cycle variation of up to 7 days is considered regular. Variation greater than 7–9 days across cycles is classified as irregular by FIGO standards.\n\nAdolescents (within 2–3 years of menarche) may have longer cycles of 21–45 days, which is expected as the hypothalamic-pituitary-ovarian axis matures. This typically stabilizes by age 19–20.\n\nCycle length naturally shortens with age: women in their 20s average 30–31 day cycles, while women in their 40s average 26–27 days, primarily due to a shorter follicular phase.",
        sources: [
          "FIGO Committee on Menstrual Disorders: Normal menstrual parameters (Fraser et al., Int J Gynecol Obstet, 2011)",
          "Treloar AE et al. Variation of the human menstrual cycle through reproductive life. Int J Fertil (1967)",
          "Fehring RJ et al. Variability in the phases of the menstrual cycle. JOGNN (2006)",
        ],
      },
      {
        q: "What counts as a normal period?",
        a: "FIGO defines normal menstrual bleeding as:\n\n• Duration: 2–7 days (median 5 days)\n• Volume: 5–80 mL per cycle. Heavy menstrual bleeding (menorrhagia) is defined as >80 mL or bleeding that interferes with daily life\n• Pattern: Heaviest flow on days 1–2, then gradually tapering\n\nTo estimate volume: a regular pad holds ~5 mL when fully soaked, a super pad ~10 mL, a regular tampon ~5 mL, a menstrual cup has volume markings. Soaking through a pad or tampon every hour for several consecutive hours is considered heavy and warrants medical evaluation.\n\nClots smaller than a 10-cent coin are normal. Larger clots or clots that persist throughout the period may indicate hormonal imbalance or structural issues (fibroids, polyps).",
        sources: [
          "FIGO PALM-COEIN Classification System for AUB (Munro et al., 2011; revised 2018)",
          "NICE Guideline NG88: Heavy Menstrual Bleeding — Assessment & Management (2018, updated 2021)",
          "WHO. Managing complications in pregnancy and childbirth — menstrual blood loss assessment (2017)",
        ],
      },
      {
        q: "How do hormones change throughout the cycle?",
        a: "Four key hormones drive your cycle:\n\n• FSH (Follicle-Stimulating Hormone) — Rises in early follicular phase to stimulate follicle growth. Drops once a dominant follicle is selected.\n\n• Estradiol (E2) — Rises steadily through the follicular phase, peaks 24–36 hours before ovulation (triggering the LH surge), dips briefly, then rises again in the mid-luteal phase. Primary effects: endometrial thickening, cervical mucus changes, bone density maintenance, serotonin/dopamine modulation.\n\n• LH (Luteinizing Hormone) — Surges 24–36 hours before ovulation, triggering egg release. This surge is what ovulation predictor kits (OPKs) detect in urine.\n\n• Progesterone — Low during the follicular phase, rises sharply after ovulation (produced by the corpus luteum), peaks at ~day 21 (mid-luteal), then falls if no pregnancy occurs. Effects: basal temperature rise, endometrial secretory transformation, breast tenderness, increased appetite, altered sleep via allopregnanolone (a GABA-A receptor modulator).",
        sources: [
          "Stricker R et al. Establishment of detailed reference values for luteinizing hormone, follicle stimulating hormone, estradiol, and progesterone during different phases of the menstrual cycle on the Abbott ARCHITECT analyzer. Clin Chem Lab Med (2006)",
          "Prior JC. Progesterone as a bone-trophic hormone. Endocrine Reviews (1990)",
          "Bäckström T et al. Allopregnanolone and mood disorders. Prog Neurobiol (2014)",
        ],
      },
    ],
  },
  {
    title: "Fertility & Ovulation",
    icon: "🌱",
    items: [
      {
        q: "When am I most fertile?",
        a: "Your fertile window spans approximately 6 days: the 5 days before ovulation plus the day of ovulation itself. This is because:\n\n• Sperm can survive in the female reproductive tract for up to 5 days (in fertile-quality cervical mucus)\n• The released egg is viable for only 12–24 hours\n\nThe highest probability of conception occurs with intercourse 1–2 days before ovulation (approximately 25–30% chance per cycle at peak).\n\nImportant: ovulation doesn't always occur on day 14. In a study of 696 cycles, ovulation day ranged from day 8 to day 60, with only 30% ovulating between days 13–15. This is why calendar-based methods alone are unreliable for both contraception and conception planning.",
        sources: [
          "Wilcox AJ et al. Timing of sexual intercourse in relation to ovulation. NEJM (1995)",
          "Dunson DB et al. Day-specific probabilities of clinical pregnancy. Fertility & Sterility (1999)",
          "Fehring RJ et al. Variability in the phases of the menstrual cycle. JOGNN (2006)",
        ],
      },
      {
        q: "How do I know when I'm ovulating?",
        a: "Evidence-based ovulation indicators, ranked by reliability:\n\n1. Urinary LH surge detection (OPK) — Detects the LH surge 24–36 hours before ovulation. Sensitivity: 97–99%. Most reliable non-invasive method.\n\n2. Basal body temperature (BBT) — Progesterone raises temperature 0.2–0.5°C after ovulation. Confirms ovulation retroactively (only tells you it already happened). Measure at the same time daily before getting out of bed.\n\n3. Cervical mucus changes — Estrogen increases mucus production: dry → sticky → creamy → clear, stretchy, and slippery (like egg whites) at peak fertility. Studies show mucus observation alone identifies the fertile window with ~76% accuracy.\n\n4. Mittelschmerz — Mid-cycle ovulatory pain (one-sided, lower abdomen) occurs in ~40% of cycles. Not consistently reliable as a timing indicator.\n\nThis app estimates ovulation based on your cycle history, but combining tracking methods improves accuracy.",
        sources: [
          "NICE Guideline CG156: Fertility problems — assessment and treatment (2013, updated 2017)",
          "Stanford JB et al. Timing intercourse to achieve pregnancy. Obstet Gynecol (2002)",
          "Bigelow JL et al. Mucus observations in the fertile window. Human Reproduction (2004)",
        ],
      },
      {
        q: "Can I get pregnant on my period?",
        a: "Yes, though the probability is low. Conception during menstruation is possible because:\n\n• In short cycles (21–24 days), ovulation can occur as early as day 7–10\n• Sperm deposited during late menstrual bleeding (days 5–7) could survive until ovulation\n• Breakthrough bleeding can be mistaken for a period when ovulation is actually imminent\n\nIn a large study by Wilcox et al. (2000) tracking 221 women, 2% were in their fertile window by day 4, and 17% by day 7 of their cycle. Even in \"regular\" 28-day cycles, there was meaningful variation in ovulation timing.\n\nNo day of the cycle can be considered with certainty \"safe\" from pregnancy without additional fertility awareness data (BBT, mucus, LH testing).",
        sources: [
          "Wilcox AJ et al. The timing of the 'fertile window' in the menstrual cycle. BMJ (2000)",
          "Soumpasis I et al. Real-life insights on menstrual cycles and fertility. NPJ Digital Medicine (2020)",
        ],
      },
    ],
  },
  {
    title: "What's Normal vs. Not",
    icon: "⚖️",
    items: [
      {
        q: "When is an irregular cycle a concern?",
        a: "FIGO and ACOG define cycle irregularity that warrants medical evaluation:\n\n• Oligomenorrhea — Cycles consistently >38 days apart\n• Polymenorrhea — Cycles consistently <24 days apart\n• Amenorrhea — Absence of menstruation for ≥3 months in someone who previously had periods (secondary amenorrhea), or no menarche by age 15 (primary)\n• Cycle variation >7–9 days between shortest and longest cycle over 6 months\n• Intermenstrual bleeding — Any bleeding between periods\n• Postcoital bleeding — Bleeding after intercourse\n\nCommon causes include: PCOS (6–15% prevalence), thyroid disorders (hypo/hyperthyroidism), hyperprolactinemia, premature ovarian insufficiency, excessive exercise or undereating (functional hypothalamic amenorrhea), and structural issues (fibroids, polyps, endometriosis).\n\nImportant: hormonal contraception can mask underlying irregularities. If cycles were irregular before starting contraception, evaluation is still recommended.",
        sources: [
          "FIGO Committee Opinion: Normal parameters for menstrual cycles (2011)",
          "ACOG Committee Opinion No. 651: Menstruation in Girls and Adolescents (2015)",
          "ACOG Practice Bulletin No. 128: Diagnosis of Abnormal Uterine Bleeding (2012)",
        ],
      },
      {
        q: "What is PCOS and should I be screened?",
        a: "Polycystic Ovary Syndrome (PCOS) is the most common endocrine disorder in reproductive-age women, affecting 6–15% globally. Diagnosis requires 2 of 3 Rotterdam criteria:\n\n1. Oligo-anovulation — Irregular or absent periods (cycles >35 days, or <8 cycles per year)\n2. Clinical or biochemical hyperandrogenism — Acne, excess facial/body hair (hirsutism), elevated testosterone/DHEA-S levels\n3. Polycystic ovarian morphology on ultrasound — ≥12 follicles per ovary or ovarian volume >10 mL\n\nConsider screening if you have: irregular periods plus acne or unusual hair growth, difficulty losing weight with insulin resistance signs, persistent acne after adolescence, family history of PCOS or Type 2 diabetes.\n\nPCOS is treatable. Management includes lifestyle modifications (exercise, nutrition), hormonal contraceptives, metformin for insulin resistance, and spironolactone for hyperandrogenism. Early diagnosis reduces long-term cardiovascular and metabolic risk.",
        sources: [
          "Rotterdam ESHRE/ASRM PCOS Consensus Workshop Group (2003, revised 2012)",
          "ACOG Committee Opinion No. 789: Screening and Management of PCOS (2019)",
          "Teede HJ et al. International evidence-based guideline for PCOS. Monash University / NHMRC (2018, updated 2023)",
        ],
      },
      {
        q: "Is PMS normal? When does it become PMDD?",
        a: "Premenstrual Syndrome (PMS) affects 75–80% of menstruating women. Common symptoms include bloating, breast tenderness, mood changes, irritability, fatigue, and food cravings in the 1–2 weeks before menstruation.\n\nPMDD (Premenstrual Dysphoric Disorder) is a severe form affecting 3–8% of women. The DSM-5 diagnostic criteria require:\n\n• ≥5 symptoms in the luteal phase (must include ≥1 mood symptom: marked irritability, depression, anxiety, or emotional lability)\n• Symptoms significantly interfere with work, relationships, or daily functioning\n• Symptoms remit within a few days of menstruation onset\n• Symptoms present in ≥2 consecutive symptomatic cycles\n• Not explained by another disorder\n\nPMDD responds well to treatment: SSRIs (can be taken luteal-phase only), combined oral contraceptives, CBT, and calcium supplementation (1200 mg/day). If your symptoms are severe enough to disrupt your life, this is a recognized medical condition with effective treatments — talk to your provider.",
        sources: [
          "ACOG Practice Bulletin No. 15: Premenstrual Syndrome (2000, reaffirmed 2018)",
          "Yonkers KA et al. Premenstrual Dysphoric Disorder. Lancet (2008)",
          "Thys-Jacobs S et al. Calcium carbonate and the premenstrual syndrome. Am J Obstet Gynecol (1998)",
          "DSM-5: Premenstrual Dysphoric Disorder diagnostic criteria (APA, 2013)",
        ],
      },
      {
        q: "Why do I gain weight during my period?",
        a: "Cyclical weight fluctuations of 0.5–2.5 kg are physiologically normal and are not fat gain. The mechanisms:\n\n• Water retention — Progesterone activates the renin-angiotensin-aldosterone system, causing sodium and water retention. This peaks in the late luteal/early menstrual phase.\n• GI changes — Progesterone slows gut motility, causing bloating and constipation that add to scale weight.\n• Glycogen flux — Higher carbohydrate intake in the luteal phase (driven by the 100–300 kcal/day metabolic increase) stores more glycogen, each gram of which binds 3–4g of water.\n\nWeight is most comparable when measured at the same phase each cycle (ideally mid-follicular, days 6–10, when hormonal influence on water balance is lowest). This app accounts for cycle phase in weight trend analysis.",
        sources: [
          "White CP et al. Fluid retention over the menstrual cycle. Obstet Gynecol (2011)",
          "Webb P. 24-hour energy expenditure and the menstrual cycle. Am J Clin Nutr (1986)",
          "Bisdee JT et al. Changes in energy expenditure during the menstrual cycle. Br J Nutr (1989)",
        ],
      },
      {
        q: "Are period cramps normal?",
        a: "Primary dysmenorrhea (cramps without underlying pathology) affects 50–90% of menstruating women and is the leading cause of recurrent short-term school and work absence in young women.\n\nMechanism: The endometrium produces prostaglandins (PGF2α and PGE2) that cause myometrial contractions and ischemia. Higher prostaglandin levels correlate with more severe pain.\n\nEvidence-based relief:\n• NSAIDs (ibuprofen 400mg q6h) — First-line treatment; most effective when started 1–2 days before expected period (Cochrane review: significantly superior to placebo)\n• Heat therapy — Equal to ibuprofen in randomized trials (continuous low-level topical heat, 40°C)\n• Exercise — Regular physical activity reduces severity (meta-analysis of 11 RCTs)\n• Magnesium — 200–360 mg/day may reduce prostaglandin production\n\nSeek evaluation if: cramps are worsening over time, don't respond to NSAIDs, are accompanied by heavy bleeding (>80 mL/cycle), or cause persistent pelvic pain outside menstruation. These may indicate endometriosis (affects ~10% of reproductive-age women), adenomyosis, or fibroids.",
        sources: [
          "Marjoribanks J et al. NSAIDs for dysmenorrhoea. Cochrane Database Syst Rev (2015)",
          "Akin M et al. Continuous low-level topical heat vs. ibuprofen. Obstet Gynecol (2001)",
          "Armour M et al. Exercise for dysmenorrhoea. Cochrane Database Syst Rev (2019)",
          "ACOG Committee Opinion No. 760: Dysmenorrhea and Endometriosis in the Adolescent (2018)",
        ],
      },
    ],
  },
  {
    title: "Exercise & Your Cycle",
    icon: "💪",
    items: [
      {
        q: "Should I work out on my period?",
        a: "Yes — exercise during menstruation is safe and often beneficial. A 2019 Cochrane review of 12 RCTs found that exercise reduces menstrual pain severity. However, intensity should be adapted:\n\n• Menstrual phase (Days 1–5): Low-to-moderate intensity. Walking, yoga, light resistance training. Prostaglandin-driven inflammation may increase injury risk with maximal loads. Avoid inverting (e.g., headstands) if uncomfortable.\n\n• Follicular phase (Days 6–13): Ramp up intensity. Estrogen improves neuromuscular coordination, tendon stiffness, and power output. This is your best adaptation window — progressive overload here yields the greatest strength gains (confirmed in a 2014 RCT of follicular vs. luteal phase–based training).\n\n• Ovulation (Days 14–16): Peak performance window. Testosterone and estrogen both peak. Attempt PRs, HIIT, or competition-level efforts. One caution: elevated relaxin and estrogen increase ligament laxity, raising ACL injury risk 2–6× during ovulation in some studies. Warm up thoroughly before plyometrics or cutting movements.\n\n• Luteal phase (Days 17–28): Maintain but adjust expectations. Core temperature rises 0.3–0.5°C, increasing RPE by ~10%. Time to exhaustion decreases. Use longer rest periods, favor steady-state over intervals, and allow 100–200 extra calories to fuel the higher metabolic rate.",
        sources: [
          "Armour M et al. Exercise for dysmenorrhoea. Cochrane Database Syst Rev (2019)",
          "Wikström-Frisén L et al. Effects on power, strength, and lean body mass of menstrual-cycle-based resistance training. J Strength Cond Res (2017)",
          "Hewett TE et al. Biomechanical measures of neuromuscular control and ACL injury risk. Am J Sports Med (2005)",
          "Pivarnik JM et al. Menstrual cycle phase affects temperature regulation during endurance exercise. J Appl Physiol (1992)",
        ],
      },
      {
        q: "Why do I feel weaker some weeks?",
        a: "Perceived weakness during the luteal phase (days 17–28) is physiological, not psychological. Multiple mechanisms contribute:\n\n1. Thermoregulatory stress — Progesterone raises core temperature by 0.3–0.5°C. The body must work harder to cool itself during exercise, increasing cardiac output and perceived exertion for the same workload.\n\n2. Substrate utilization shift — The luteal phase favors fat oxidation over glycogen use. High-intensity, glycolytic efforts (sprinting, heavy lifting, HIIT) feel harder because glycogen access is relatively impaired.\n\n3. Neuromuscular changes — Maximal voluntary contraction and rate of force development may decrease slightly in the luteal phase, though study results are mixed.\n\n4. Sleep disruption — Progesterone metabolites alter sleep architecture (reduced REM, more awakenings), and poor sleep independently impairs performance.\n\nWhat helps: Lower your training expectations by ~10% in the luteal phase. Use RPE-based rather than percentage-based programming. Allow longer rest between sets. This is not detraining — it's periodization aligned with your physiology.\n\nNote: strength typically peaks around ovulation (mid-cycle), when testosterone and estrogen are both elevated.",
        sources: [
          "McNulty KL et al. The effects of menstrual cycle phase on exercise performance in eumenorrheic women: a systematic review and meta-analysis. Sports Med (2020)",
          "Janse de Jonge XA. Effects of the menstrual cycle on exercise performance. Sports Med (2003)",
          "Sung E et al. Effects of follicular vs. luteal phase–based strength training in young women. Springerplus (2014)",
        ],
      },
      {
        q: "Does my cycle affect injury risk?",
        a: "Emerging evidence suggests ACL (anterior cruciate ligament) injury risk may be elevated during the ovulatory phase. The proposed mechanism involves estrogen's effect on collagen metabolism and ligament laxity:\n\n• Estrogen receptors exist on ACL fibroblasts\n• Peak estrogen during ovulation reduces tendon stiffness and increases joint laxity\n• Several studies show 2–6× higher ACL injury rates in the pre-ovulatory/ovulatory phase vs. luteal phase\n• The relationship is not yet strong enough for clinical guidelines, but is being actively researched\n\nPractical takeaway: During the ovulatory phase (around days 12–16), prioritize thorough warm-ups before plyometrics, cutting/pivoting drills, or explosive movements. Neuromuscular training programs (like FIFA 11+) reduce ACL injury risk regardless of cycle phase.\n\nGeneral injury risk: A 2021 meta-analysis found insufficient evidence to recommend menstrual phase-specific training modifications for injury prevention beyond ACL considerations. Listen to your body — fatigue is the strongest modifiable injury risk factor.",
        sources: [
          "Herzberg SD et al. The effect of menstrual cycle and contraceptives on ACL injuries and laxity: a systematic review and meta-analysis. Orthop J Sports Med (2017)",
          "Hewett TE et al. Anterior cruciate ligament injuries in female athletes. Am J Sports Med (2006)",
          "Balachandar V et al. Effects of the menstrual cycle on lower-limb biomechanics, neuromuscular control, and anterior cruciate ligament injury risk. Muscles Ligaments Tendons J (2017)",
        ],
      },
    ],
  },
  {
    title: "Nutrition & Your Cycle",
    icon: "🍎",
    items: [
      {
        q: "Why do I crave specific foods before my period?",
        a: "Luteal phase food cravings have a documented physiological basis:\n\n• Metabolic rate increases 100–300 kcal/day in the luteal phase (measured via indirect calorimetry in multiple studies). Your body genuinely needs more energy.\n\n• Serotonin levels decline as estrogen drops — carbohydrate consumption facilitates tryptophan transport across the blood-brain barrier, boosting serotonin production. This drives carb and sweet cravings.\n\n• Magnesium requirements may increase — chocolate cravings may partly reflect this, as dark chocolate is a magnesium source (64 mg per 28g serving).\n\n• Progesterone's effect on the endocannabinoid system increases appetite and shifts food preference toward calorie-dense foods.\n\nEvidence-based approach: Don't fight cravings — restriction increases cortisol, which worsens PMS. Instead, choose whole-food versions: dark chocolate (70%+) instead of candy, oatmeal instead of pastry, trail mix instead of chips. The luteal metabolic increase means these extra calories are physiologically appropriate, not a lack of willpower.",
        sources: [
          "Webb P. 24-hour energy expenditure and the menstrual cycle. Am J Clin Nutr (1986)",
          "Dye L, Blundell JE. Menstrual cycle and appetite control. Human Reproduction (1997)",
          "Wurtman JJ et al. Effect of nutrient intake on premenstrual depression. Am J Obstet Gynecol (1989)",
          "Hill AJ et al. Food craving, dietary restraint and mood. Appetite (1991)",
        ],
      },
      {
        q: "Should I eat differently in each phase?",
        a: "Phase-based nutrition can optimize how you feel and perform. Evidence supports these adjustments:\n\n• Menstrual (Days 1–5): Prioritize iron replacement. Iron-rich foods (red meat: 2.7mg/100g, spinach: 2.7mg/100g, lentils: 3.3mg/100g) with vitamin C (bell pepper, citrus) to enhance non-heme iron absorption by 2–3×. Avoid tea/coffee at meals — tannins reduce iron absorption by up to 60%. Anti-inflammatory foods (omega-3 fatty acids: salmon, walnuts, flaxseed) may reduce prostaglandin-driven cramping.\n\n• Follicular (Days 6–13): Higher insulin sensitivity makes this the ideal phase for carbohydrate-inclusive meals. Lean protein (1.6–2.2g/kg) supports the anabolic window for strength training. Phytoestrogens (soy, flaxseed) may modestly support rising estrogen.\n\n• Ovulation (Days 14–16): Peak metabolic efficiency. Support high-output training with adequate carbohydrates (5–7g/kg for moderate activity). Hydrate well — estrogen affects fluid regulation.\n\n• Luteal (Days 17–28): Allow 100–200 additional calories (your metabolism demands it). Increase complex carbohydrates to support serotonin. Magnesium (200–400mg/day from food or supplements: pumpkin seeds, dark chocolate, almonds) may reduce PMS severity by ~34% per a systematic review. Consider calcium (1200mg/day) — a landmark RCT showed 48% reduction in PMS symptom scores. Reduce caffeine if anxiety increases — caffeine sensitivity rises as progesterone modulates GABA.",
        sources: [
          "WHO. Guideline: Intermittent iron supplementation in menstruating women (2011)",
          "Hallberg L et al. Effect of ascorbic acid on iron absorption. Hum Nutr Appl Nutr (1987)",
          "Thys-Jacobs S et al. Calcium carbonate and the premenstrual syndrome. Am J Obstet Gynecol (1998)",
          "Quaranta S et al. Pilot study of magnesium for premenstrual syndrome. Gynecol Endocrinol (2007)",
          "Thomas DT et al. Position of the Academy of Nutrition and Dietetics: Nutrition and Athletic Performance. JAND (2016)",
        ],
      },
      {
        q: "Does iron deficiency affect my cycle?",
        a: "Iron deficiency is the most common nutritional deficiency worldwide and disproportionately affects menstruating women. Key facts:\n\n• Women of reproductive age need 18 mg/day of iron (vs. 8 mg for men) — a 2.25× higher requirement\n• Heavy menstrual bleeding (>80 mL/cycle) is the #1 cause of iron-deficiency anemia in premenopausal women\n• Iron deficiency without anemia (low ferritin, normal hemoglobin) still causes fatigue, brain fog, poor exercise tolerance, and cold intolerance\n• Ferritin <30 µg/L indicates depleted iron stores, even if hemoglobin is normal\n\nSymptoms of iron deficiency: unexplained fatigue, dizziness, shortness of breath during exercise, pale skin, restless legs, pica (craving ice or non-food items), frequent infections.\n\nWhen to test: Ask your provider for a ferritin level (not just CBC/hemoglobin) if you have heavy periods, are vegetarian/vegan, feel persistently fatigued, or exercise intensely. Treatment with oral iron (ferrous sulfate 325mg on alternate days with vitamin C) repletes stores in 3–6 months.",
        sources: [
          "WHO. Iron deficiency anaemia: assessment, prevention and control — a guide for programme managers (2001)",
          "Camaschella C. Iron-deficiency anemia. NEJM (2015)",
          "ACOG Practice Bulletin No. 95: Anemia in Pregnancy (2008, applies to iron kinetics)",
          "Stoffel NU et al. Iron absorption from oral iron supplements on consecutive vs. alternate days. Lancet Haematol (2017)",
        ],
      },
    ],
  },
  {
    title: "Mental Health & Hormones",
    icon: "🧠",
    items: [
      {
        q: "Why does my mood change throughout my cycle?",
        a: "Mood fluctuations across the menstrual cycle have a well-established neurobiological basis:\n\n• Estrogen modulates serotonin, dopamine, and norepinephrine — the three neurotransmitters most implicated in mood disorders. When estrogen rises (follicular phase), serotonin synthesis and receptor density increase, improving mood. When it falls (late luteal/early menstrual), serotonin drops.\n\n• Progesterone's metabolite allopregnanolone is a potent positive modulator of GABA-A receptors (the same system benzodiazepines act on). Rapidly fluctuating allopregnanolone levels — not the absolute level — appear to trigger anxiety and irritability in susceptible individuals.\n\n• The follicular phase (days 6–13) is generally associated with the most positive mood, highest cognitive flexibility, and best verbal memory.\n\n• The late luteal phase (days 24–28) is when mood symptoms most commonly peak, correlating with the rapid decline in both estrogen and progesterone.\n\nIf mood changes are predictable and manageable, they are a normal part of hormonal cycling. If they are severe enough to impair functioning, this may indicate PMDD — a treatable condition (see PMDD section).",
        sources: [
          "Bäckström T et al. Allopregnanolone and mood disorders. Progress in Neurobiology (2014)",
          "Sundström Poromaa I, Gingnell M. Menstrual cycle influence on cognitive function and emotion processing. Mol Psychiatry (2014)",
          "Romans SE et al. Mood and the menstrual cycle: a review of prospective data studies. Gender Medicine (2012)",
        ],
      },
      {
        q: "Can my cycle affect my sleep?",
        a: "Yes — sleep disturbance is one of the most common and least discussed menstrual cycle effects. Research shows:\n\n• Luteal phase: Progesterone raises core body temperature by 0.3–0.5°C. Since sleep onset requires a core temperature drop, falling asleep becomes harder. Sleep architecture also changes: less REM sleep, more NREM stage 2, more nighttime awakenings.\n\n• Premenstrual (days 25–28): Sleep quality reaches its nadir. A National Sleep Foundation poll found 33% of menstruating women report disrupted sleep in the week before their period.\n\n• Menstrual phase: Pain, discomfort, and fear of leaking contribute to poor sleep. Temperature normalizes, but physical symptoms may still disrupt rest.\n\nEvidence-based sleep optimization:\n• Keep bedroom temperature 17–18°C in the luteal phase (cooler than usual to offset progesterone-driven temperature rise)\n• Tart cherry juice (240mL twice daily) — a natural melatonin source that improved sleep duration by 84 minutes in a crossover trial\n• Magnesium glycinate (200–400mg before bed) — may improve sleep quality via GABA modulation\n• Consistent sleep/wake times even during menstruation\n• Avoid alcohol in the luteal phase — it worsens already-disrupted sleep architecture",
        sources: [
          "Baker FC, Driver HS. Circadian rhythms, sleep, and the menstrual cycle. Sleep Med (2007)",
          "National Sleep Foundation. Women and Sleep poll (2007)",
          "Howatson G et al. Effect of tart cherry juice on melatonin levels and enhanced sleep quality. Eur J Nutr (2012)",
          "Abbasi B et al. The effect of magnesium supplementation on primary insomnia. J Res Med Sci (2012)",
        ],
      },
    ],
  },
  {
    title: "Contraception & Cycle Effects",
    icon: "💊",
    items: [
      {
        q: "How does hormonal contraception affect my cycle?",
        a: "Hormonal contraceptives work by suppressing the hypothalamic-pituitary-ovarian axis, preventing the natural hormonal fluctuations described elsewhere in this guide:\n\n• Combined oral contraceptives (COCs): Suppress ovulation via synthetic estrogen + progestin. The \"period\" during the placebo week is a withdrawal bleed, not a true menstrual period — the endometrium is thinner and the bleed is typically lighter. Cycle-related symptoms (PMS, cramps) are often reduced.\n\n• Progestin-only methods (mini-pill, hormonal IUD, implant, injection): May or may not suppress ovulation depending on the method and individual. Can cause irregular bleeding patterns or amenorrhea. Hormonal IUDs act primarily locally (thinning the endometrium).\n\n• Post-discontinuation: Cycles typically resume within 1–3 months after stopping most methods. Depo-Provera (injection) may delay return to fertility by 6–12 months. There is no evidence that hormonal contraception causes long-term fertility impairment.\n\nImportant for this app: If you're on hormonal contraception, the cycle phase predictions, fertile window estimates, and phase-based training recommendations in this app may not accurately reflect your hormonal state, since these methods alter or suppress the natural cycle.",
        sources: [
          "ACOG Practice Bulletin No. 110: Noncontraceptive Uses of Hormonal Contraceptives (2010, reaffirmed 2021)",
          "FSRH Clinical Guideline: Combined Hormonal Contraception (2019, amended 2023)",
          "Barnhart KT et al. Return to fertility after cessation of a continuous oral contraceptive. Fertility & Sterility (2009)",
        ],
      },
    ],
  },
];
