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

export type CycleInsight = {
  currentPhase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  phaseInfo: string;
  trainingRec: string;
  nutritionRec: string;
  nextPeriodEstimate: string | null;
  phaseDaysRemaining: number;
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

export function computeAdaptiveCycleLength(periodStarts: string[]): number {
  if (periodStarts.length < 2) return 28;
  const sorted = [...periodStarts].sort();
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i] + "T12:00:00").getTime() - new Date(sorted[i - 1] + "T12:00:00").getTime()) / 86400000
    );
    if (diff >= 18 && diff <= 45) gaps.push(diff);
  }
  if (gaps.length === 0) return 28;
  if (gaps.length <= 2) return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const recent = gaps.slice(-3);
  return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
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
  today?: string
): CycleInsight {
  const { phase, cycleDay, phaseDaysRemaining } = estimateCyclePhase(lastPeriodStart, cycleLength, today);
  return {
    currentPhase: phase,
    cycleDay,
    cycleLength,
    phaseInfo: PHASE_INFO[phase],
    trainingRec: TRAINING_RECS[phase],
    nutritionRec: NUTRITION_RECS[phase],
    nextPeriodEstimate: estimateNextPeriod(lastPeriodStart, cycleLength),
    phaseDaysRemaining,
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
