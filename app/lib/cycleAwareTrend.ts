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
  items: { q: string; a: string }[];
};

export const CYCLE_GUIDE: GuideSection[] = [
  {
    title: "Understanding Your Cycle",
    icon: "🔄",
    items: [
      {
        q: "What are the four phases?",
        a: "Your cycle has four phases:\n\n1. Menstrual (Days 1-5) — Your period. The uterine lining sheds. Energy and iron levels dip.\n\n2. Follicular (Days 6-13) — Estrogen rises, an egg matures. Energy and mood improve. Best time to start new things.\n\n3. Ovulation (Days 14-16) — The egg is released. Peak energy, strength, and confidence. Fertility is highest.\n\n4. Luteal (Days 17-28) — Progesterone rises. PMS symptoms may appear. Body temperature increases slightly.",
      },
      {
        q: "What is a normal cycle length?",
        a: "A normal cycle is 21-35 days, with 28 days being average. Cycles can vary by a few days each month — that's completely normal. Teens often have longer or more irregular cycles for the first few years.",
      },
      {
        q: "What counts as a normal period?",
        a: "A normal period lasts 2-7 days. Flow is heaviest in the first 2-3 days, then tapers off. You might use 3-6 pads or tampons per day on heavy days. Total blood loss is about 30-80 mL per cycle (roughly 2-5 tablespoons).",
      },
    ],
  },
  {
    title: "Fertility & Ovulation",
    icon: "🌱",
    items: [
      {
        q: "When am I most fertile?",
        a: "Your fertile window is about 6 days: the 5 days before ovulation and the day of ovulation itself. Sperm can survive up to 5 days inside the body, so pregnancy is possible from intercourse even days before the egg is released.",
      },
      {
        q: "How do I know when I'm ovulating?",
        a: "Signs of ovulation include:\n\n• Clear, stretchy cervical mucus (like egg whites)\n• A slight rise in basal body temperature (0.2-0.5°C)\n• Mild pelvic pain on one side (mittelschmerz)\n• Increased libido\n• Breast tenderness\n\nThis app estimates your ovulation day based on your cycle length, but these body signs are the most reliable indicators.",
      },
      {
        q: "Can I get pregnant on my period?",
        a: "It's unlikely but possible, especially if you have shorter cycles. If your cycle is 21 days, ovulation could happen as early as day 7 — and since sperm survive up to 5 days, intercourse during a period ending on day 5-6 could result in pregnancy.",
      },
    ],
  },
  {
    title: "What's Normal vs. Not",
    icon: "⚖️",
    items: [
      {
        q: "When is an irregular cycle a concern?",
        a: "See a doctor if:\n\n• Your cycle is consistently shorter than 21 days or longer than 35 days\n• You miss periods for 3+ months (and you're not pregnant)\n• Your cycle length changes by more than 7-9 days month to month\n• You bleed between periods\n• Your period suddenly becomes much heavier or lighter",
      },
      {
        q: "Is PMS normal?",
        a: "Mild PMS is very common — about 75% of people experience it. Symptoms like bloating, mood changes, cravings, and breast tenderness in the 1-2 weeks before your period are normal.\n\nHowever, if PMS severely disrupts your daily life, it could be PMDD (Premenstrual Dysphoric Disorder), which affects about 5% of people and is treatable. Talk to your doctor if symptoms feel unmanageable.",
      },
      {
        q: "Why do I gain weight during my period?",
        a: "Weight fluctuations of 1-3 kg around your period are completely normal. This is mostly water retention caused by hormonal changes, not fat gain. Weight typically peaks in the late luteal phase and early menstrual phase, then drops back during the follicular phase. This app compares your weight phase-to-phase rather than day-to-day for more accurate progress tracking.",
      },
      {
        q: "Are period cramps normal?",
        a: "Mild to moderate cramps during the first 1-2 days are normal — they're caused by prostaglandins helping the uterus contract. Relief tips: heat packs, gentle movement, ibuprofen, magnesium.\n\nSee a doctor if cramps are severe enough to miss work/school, don't respond to pain relief, or get worse over time — this could indicate endometriosis or other conditions.",
      },
    ],
  },
  {
    title: "Exercise & Your Cycle",
    icon: "💪",
    items: [
      {
        q: "Should I work out on my period?",
        a: "Yes — exercise can actually help reduce cramps and improve mood. But listen to your body. Lower intensity is fine during menstruation. You don't need to push hard every day.\n\n• Menstrual phase: Walking, yoga, light weights\n• Follicular phase: Great time to increase intensity\n• Ovulation: Peak strength — go for PRs\n• Luteal phase: Maintain effort, longer rest periods",
      },
      {
        q: "Why do I feel weaker some weeks?",
        a: "Hormonal fluctuations directly affect strength and endurance. During the luteal phase, rising progesterone increases your core temperature and perceived effort (RPE) — the same weight feels heavier. This is normal, not a sign of losing progress. Your strength typically peaks around ovulation when estrogen and testosterone are highest.",
      },
    ],
  },
  {
    title: "Nutrition & Your Cycle",
    icon: "🍎",
    items: [
      {
        q: "Why do I crave chocolate before my period?",
        a: "Cravings in the luteal phase are real and biological. Your metabolism increases by about 100-300 calories per day, and serotonin levels drop — your body is literally asking for more energy and mood-boosting foods. A small amount of dark chocolate is fine. The key is not restricting so hard that you binge.",
      },
      {
        q: "Should I eat differently in each phase?",
        a: "Small adjustments can help:\n\n• Menstrual: Iron-rich foods (spinach, lentils, red meat), anti-inflammatory omega-3s\n• Follicular: Balanced meals, lean protein for muscle building\n• Ovulation: Slightly more carbs to fuel peak performance\n• Luteal: Allow 100-200 extra calories, magnesium-rich foods, reduce caffeine if you feel anxious",
      },
    ],
  },
];
