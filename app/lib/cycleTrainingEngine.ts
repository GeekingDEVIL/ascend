import type { CyclePhase } from "./cycleAwareTrend";
import {
  estimateCyclePhase,
  computeAdaptiveCycleLength,
  fetchCycleLogs,
  fetchCycleSymptoms,
} from "./cycleAwareTrend";
import { EXERCISE_EVIDENCE, NUTRITION_EVIDENCE } from "./menstrualEngine";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

export type TrainingStyle = "strength" | "power" | "hypertrophy" | "tempo" | "mobility" | "moderate";

export type PhaseTrainingProfile = {
  phase: CyclePhase;
  cycleDay: number;
  phaseDaysRemaining: number;
  subPhase: "early" | "mid" | "late";
  trainingStyle: TrainingStyle;
  styleName: string;
  intensityModifier: number; // 0.7 – 1.1 multiplier on prescribed weight
  volumeModifier: number;   // 0.7 – 1.1 multiplier on prescribed sets
  restMultiplier: number;   // 1.0 – 1.3 multiplier on rest periods
  banner: { headline: string; detail: string; color: string };
  warmUpGuidance: { minutes: number; focus: string };
  nutritionTip: string;
  isOnBC: boolean;
};

export type ExerciseRisk = {
  exerciseId: string;
  exerciseName: string;
  riskLevel: "none" | "elevated" | "high";
  reason: string;
  alternative: string;
};

export type EnergyForecast = {
  date: string;
  phase: CyclePhase;
  energyLevel: number; // 1-5
  label: string;
};

export type PhasePerformanceInsight = {
  phase: CyclePhase;
  avgVolume: number;
  avgSets: number;
  sessionCount: number;
  prCount: number;
};

export type DeloadRecommendation = {
  shouldDeload: boolean;
  reason: string;
  suggestedAction: string;
};

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */

const PHASE_STYLES: Record<CyclePhase, {
  early: { style: TrainingStyle; name: string };
  mid: { style: TrainingStyle; name: string };
  late: { style: TrainingStyle; name: string };
}> = {
  menstrual: {
    early: { style: "mobility", name: "Movement & Mobility" },
    mid: { style: "moderate", name: "Light Full Body" },
    late: { style: "moderate", name: "Moderate Intensity" },
  },
  follicular: {
    early: { style: "hypertrophy", name: "Hypertrophy Focus" },
    mid: { style: "strength", name: "Strength Building" },
    late: { style: "power", name: "Power & Progression" },
  },
  ovulation: {
    early: { style: "power", name: "Peak Performance" },
    mid: { style: "power", name: "PR Window" },
    late: { style: "strength", name: "Strength Transition" },
  },
  luteal: {
    early: { style: "hypertrophy", name: "Volume & Pump" },
    mid: { style: "tempo", name: "Tempo & Control" },
    late: { style: "mobility", name: "Deload & Recovery" },
  },
};

const PHASE_INTENSITY: Record<CyclePhase, { early: number; mid: number; late: number }> = {
  menstrual:  { early: 0.75, mid: 0.80, late: 0.85 },
  follicular: { early: 0.90, mid: 0.95, late: 1.00 },
  ovulation:  { early: 1.05, mid: 1.10, late: 1.00 },
  luteal:     { early: 0.95, mid: 0.90, late: 0.80 },
};

const PHASE_VOLUME: Record<CyclePhase, { early: number; mid: number; late: number }> = {
  menstrual:  { early: 0.70, mid: 0.75, late: 0.85 },
  follicular: { early: 0.90, mid: 1.00, late: 1.00 },
  ovulation:  { early: 1.00, mid: 1.00, late: 1.00 },
  luteal:     { early: 1.00, mid: 0.90, late: 0.75 },
};

const PHASE_REST: Record<CyclePhase, { early: number; mid: number; late: number }> = {
  menstrual:  { early: 1.25, mid: 1.20, late: 1.15 },
  follicular: { early: 1.05, mid: 1.00, late: 1.00 },
  ovulation:  { early: 1.00, mid: 1.00, late: 1.00 },
  luteal:     { early: 1.05, mid: 1.15, late: 1.25 },
};

const ENERGY_CURVE: Record<CyclePhase, { early: number; mid: number; late: number }> = {
  menstrual:  { early: 2, mid: 2, late: 3 },
  follicular: { early: 3, mid: 4, late: 4 },
  ovulation:  { early: 5, mid: 5, late: 4 },
  luteal:     { early: 4, mid: 3, late: 2 },
};

const ENERGY_LABELS = ["", "Drained", "Low", "Moderate", "Strong", "Peak"];

const PHASE_BANNERS: Record<CyclePhase, {
  early: { headline: string; detail: string };
  mid: { headline: string; detail: string };
  late: { headline: string; detail: string };
}> = {
  menstrual: {
    early: { headline: "Rest & Recover", detail: "Energy is at its lowest. Prioritize movement quality over intensity — gentle movement helps cramps via endorphin release." },
    mid: { headline: "Easing Back In", detail: "Energy slowly rising. Light weights, high reps, focus on mind-muscle connection." },
    late: { headline: "Building Momentum", detail: "Transitioning to follicular. Energy returning — start ramping up gradually." },
  },
  follicular: {
    early: { headline: "Rising Energy", detail: "Estrogen climbing — recovery is faster, pain tolerance higher. Great day to add weight or reps." },
    mid: { headline: "Strength Window Open", detail: "Peak recovery capacity. Progressive overload thrives here — push yourself." },
    late: { headline: "Approaching Peak", detail: "Nearing your strongest days. Excellent time for new exercises or technique work at heavier loads." },
  },
  ovulation: {
    early: { headline: "Peak Power", detail: "Testosterone and estrogen both at peak. Your strongest 2-3 day window — attempt PRs." },
    mid: { headline: "PR Window", detail: "Maximum neural drive and muscle recruitment. If there's a weight you've been eyeing, today's the day." },
    late: { headline: "Strength Transition", detail: "Still strong but transitioning. Solid day for heavy compounds." },
  },
  luteal: {
    early: { headline: "Volume Phase", detail: "Still strong but RPE rising. Same weight will feel harder — that's progesterone, not weakness. Focus on pump work." },
    mid: { headline: "Tempo & Control", detail: "Core temp elevated, perceived effort higher. Slower eccentrics, controlled reps, longer rest between sets." },
    late: { headline: "Smart Recovery", detail: "Energy dipping, PMS may arrive. Deload-style training or mobility. Gentle movement reduces symptoms." },
  },
};

const PHASE_COLORS: Record<CyclePhase, string> = {
  menstrual: "rose",
  follicular: "emerald",
  ovulation: "amber",
  luteal: "violet",
};

const WARMUP_GUIDANCE: Record<CyclePhase, {
  early: { minutes: number; focus: string };
  mid: { minutes: number; focus: string };
  late: { minutes: number; focus: string };
}> = {
  menstrual: {
    early: { minutes: 10, focus: "Extended dynamic stretch + joint circles. Body is cold and stiff — take extra time." },
    mid: { minutes: 8, focus: "Dynamic stretching with light activation sets. Ease into movement." },
    late: { minutes: 7, focus: "Standard dynamic warm-up with ramp-up sets." },
  },
  follicular: {
    early: { minutes: 5, focus: "Quick activation — band work, bodyweight movements. Joints are stable." },
    mid: { minutes: 5, focus: "Brief activation then ramp-up sets. You're ready to go." },
    late: { minutes: 5, focus: "Standard warm-up. Joints are at their most stable this phase." },
  },
  ovulation: {
    early: { minutes: 7, focus: "Thorough warm-up despite feeling strong — ACL injury risk slightly elevated. Extra glute/hamstring activation." },
    mid: { minutes: 7, focus: "Don't skip warm-up even at peak strength. Glute bridges, band walks, ramp-up sets." },
    late: { minutes: 6, focus: "Standard warm-up with attention to joint prep." },
  },
  luteal: {
    early: { minutes: 7, focus: "Extra warm-up time — core temp is elevated but muscles take longer to activate." },
    mid: { minutes: 8, focus: "Extended warm-up. Ligament laxity increasing — stabilization exercises first." },
    late: { minutes: 10, focus: "Full mobility routine. Progesterone peaks — joints are more lax. Prioritize stability." },
  },
};

const NUTRITION_TIPS: Record<CyclePhase, {
  early: string; mid: string; late: string;
}> = {
  menstrual: {
    early: "Iron-rich post-workout meal today — spinach, red meat, or lentils with vitamin C to boost absorption.",
    mid: "Anti-inflammatory foods help: salmon, turmeric, ginger tea. Magnesium-rich snack before bed for cramps.",
    late: "Energy returning — complex carbs pre-workout (oats, sweet potato) fuel the transition well.",
  },
  follicular: {
    early: "Lean protein post-workout maximizes estrogen's anabolic effect. Best insulin sensitivity of your cycle.",
    mid: "This is the best phase for a caloric deficit if cutting. Lower appetite + better carb tolerance.",
    late: "Fuel your strongest sessions: complex carbs 1-2hr pre-workout, protein within 30min post.",
  },
  ovulation: {
    early: "Antioxidant-rich foods (berries, dark greens) support recovery from intense sessions. Stay extra hydrated.",
    mid: "Slight caloric increase to fuel peak performance. Core temp rising — drink more water than usual.",
    late: "B vitamins support energy metabolism. Eggs, chicken, leafy greens before training.",
  },
  luteal: {
    early: "Your metabolism is 100-300 kcal/day higher now. Allow slightly more food — don't fight the hunger.",
    mid: "Carbs before training improve mood today — serotonin precursors. Magnesium + B6 may ease PMS.",
    late: "Tryptophan-rich foods (turkey, nuts, seeds) help mood. Reduce caffeine if anxiety is present.",
  },
};

// High-risk exercises during late luteal / ovulation (ACL / ligament laxity)
const HIGH_KNEE_STRESS_KEYWORDS = [
  "squat", "lunge", "jump", "plyo", "box jump", "step up", "leg press",
  "split squat", "bulgarian", "pistol", "clean", "snatch", "deadlift",
];

const EXERCISE_ALTERNATIVES: Record<string, string> = {
  "squat": "goblet squat or leg press (controlled tempo)",
  "back squat": "safety bar squat or smith machine squat",
  "front squat": "goblet squat with pause",
  "lunge": "reverse lunge (less knee shear) or step-up",
  "jump": "step-up or controlled box step-down",
  "box jump": "box step-up with controlled descent",
  "plyometric": "tempo bodyweight movements",
  "split squat": "supported split squat or leg press",
  "bulgarian": "rear-foot-elevated with support",
  "clean": "hang clean from blocks (reduced catch impact)",
  "snatch": "dumbbell snatch with lighter load",
  "deadlift": "trap bar deadlift (more upright torso)",
};

/* ═══════════════════════════════════════════════════════════════
   SUB-PHASE HELPER
═══════════════════════════════════════════════════════════════ */

function getSubPhase(phaseDaysRemaining: number, phase: CyclePhase, cycleDay: number): "early" | "mid" | "late" {
  const phaseLengths: Record<CyclePhase, number> = {
    menstrual: 5,
    follicular: 8,
    ovulation: 3,
    luteal: 12,
  };
  const total = phaseLengths[phase];
  const elapsed = total - phaseDaysRemaining;
  if (elapsed < total * 0.33) return "early";
  if (elapsed < total * 0.67) return "mid";
  return "late";
}

/* ═══════════════════════════════════════════════════════════════
   CORE: GET TRAINING PROFILE
═══════════════════════════════════════════════════════════════ */

export function getPhaseTrainingProfile(
  phase: CyclePhase,
  cycleDay: number,
  phaseDaysRemaining: number,
  isOnBC: boolean,
  todaySymptoms?: string[],
  energy?: number | null,
): PhaseTrainingProfile {
  const subPhase = getSubPhase(phaseDaysRemaining, phase, cycleDay);

  let intensity = PHASE_INTENSITY[phase][subPhase];
  let volume = PHASE_VOLUME[phase][subPhase];
  let rest = PHASE_REST[phase][subPhase];
  let style = PHASE_STYLES[phase][subPhase];
  let banner = PHASE_BANNERS[phase][subPhase];
  const warmUp = WARMUP_GUIDANCE[phase][subPhase];
  const nutrition = NUTRITION_TIPS[phase][subPhase];

  // Contraception mode: flatten phase modifiers toward neutral
  if (isOnBC) {
    intensity = 0.85 + (intensity - 0.85) * 0.3; // compress toward 0.85-1.0 range
    volume = 0.85 + (volume - 0.85) * 0.3;
    rest = 1.0 + (rest - 1.0) * 0.3;
    banner = {
      headline: banner.headline,
      detail: `${banner.detail} (On hormonal BC — natural fluctuations are blunted. Listen to your body over phase predictions.)`,
    };
  }

  // Symptom-reactive adjustments
  if (todaySymptoms?.length) {
    const syms = new Set(todaySymptoms.map(s => s.toLowerCase()));
    const hasCramps = syms.has("cramps") || syms.has("back pain");
    const hasFatigue = syms.has("fatigue");
    const hasHeadache = syms.has("headache") || syms.has("migraine");
    const hasBloating = syms.has("bloating") || syms.has("nausea");

    if (hasCramps && hasFatigue) {
      intensity = Math.min(intensity, 0.75);
      volume = Math.min(volume, 0.75);
      banner = { headline: "Take It Easy", detail: "You logged cramps + fatigue. Gentle movement will help — but don't push through pain." };
    } else if (hasCramps) {
      intensity = Math.min(intensity, 0.80);
      banner = { ...banner, detail: `${banner.detail} You logged cramps — movement helps, but reduce load if pain spikes.` };
    } else if (hasFatigue) {
      intensity = Math.min(intensity, 0.85);
      volume = Math.min(volume, 0.85);
      banner = { ...banner, detail: `${banner.detail} Fatigue logged — reduce volume and focus on quality.` };
    }
    if (hasHeadache) {
      rest = Math.max(rest, 1.2);
      banner = { ...banner, detail: `${banner.detail} Headache logged — avoid heavy overhead movements. Keep hydrated.` };
    }
    if (hasBloating) {
      banner = { ...banner, detail: `${banner.detail} Bloating logged — avoid tight belts, focus on breathing between sets.` };
    }
  }

  // Energy override
  if (energy !== null && energy !== undefined) {
    if (energy <= 1) {
      intensity = Math.min(intensity, 0.70);
      volume = Math.min(volume, 0.70);
    } else if (energy <= 2) {
      intensity = Math.min(intensity, 0.80);
      volume = Math.min(volume, 0.80);
    } else if (energy >= 5) {
      intensity = Math.max(intensity, 1.0);
    }
  }

  return {
    phase,
    cycleDay,
    phaseDaysRemaining,
    subPhase,
    trainingStyle: style.style,
    styleName: style.name,
    intensityModifier: Math.round(intensity * 100) / 100,
    volumeModifier: Math.round(volume * 100) / 100,
    restMultiplier: Math.round(rest * 100) / 100,
    banner: { ...banner, color: PHASE_COLORS[phase] },
    warmUpGuidance: warmUp,
    nutritionTip: nutrition,
    isOnBC,
  };
}

/* ═══════════════════════════════════════════════════════════════
   EXERCISE RISK ASSESSMENT
═══════════════════════════════════════════════════════════════ */

export function assessExerciseRisk(
  exerciseName: string,
  exerciseId: string,
  phase: CyclePhase,
  subPhase: "early" | "mid" | "late",
  bodySegment?: string,
): ExerciseRisk {
  const nameLower = exerciseName.toLowerCase();
  const isKneeStress = HIGH_KNEE_STRESS_KEYWORDS.some(kw => nameLower.includes(kw));
  const isLegExercise = bodySegment?.toLowerCase().includes("leg") || bodySegment?.toLowerCase().includes("lower");

  // Late luteal: highest ligament laxity (progesterone peak)
  if (phase === "luteal" && subPhase === "late" && (isKneeStress || isLegExercise)) {
    const matchedKw = Object.keys(EXERCISE_ALTERNATIVES).find(kw => nameLower.includes(kw));
    return {
      exerciseId,
      exerciseName,
      riskLevel: "elevated",
      reason: "Ligament laxity peaks in late luteal — higher ACL injury risk on knee-dominant exercises",
      alternative: matchedKw ? EXERCISE_ALTERNATIVES[matchedKw] : "Use controlled tempo, avoid explosive movements",
    };
  }

  // Ovulation: estrogen peak can also affect ligament laxity
  if (phase === "ovulation" && isKneeStress) {
    const matchedKw = Object.keys(EXERCISE_ALTERNATIVES).find(kw => nameLower.includes(kw));
    return {
      exerciseId,
      exerciseName,
      riskLevel: "elevated",
      reason: "Peak estrogen at ovulation can increase joint laxity — warm up extra before heavy knee work",
      alternative: matchedKw ? EXERCISE_ALTERNATIVES[matchedKw] : "Thorough glute/hamstring activation before starting",
    };
  }

  return { exerciseId, exerciseName, riskLevel: "none", reason: "", alternative: "" };
}

/* ═══════════════════════════════════════════════════════════════
   7-DAY ENERGY FORECAST
═══════════════════════════════════════════════════════════════ */

export function getEnergyForecast(
  lastPeriodStart: string,
  cycleLength: number,
  isOnBC: boolean,
): EnergyForecast[] {
  const forecast: EnergyForecast[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const { phase, cycleDay, phaseDaysRemaining } = estimateCyclePhase(lastPeriodStart, cycleLength, dateStr);
    const sub = getSubPhase(phaseDaysRemaining, phase, cycleDay);
    let energy = ENERGY_CURVE[phase][sub];

    if (isOnBC) {
      energy = Math.round(2.5 + (energy - 2.5) * 0.3); // flatten toward 3
      energy = Math.max(2, Math.min(4, energy));
    }

    forecast.push({
      date: dateStr,
      phase,
      energyLevel: energy,
      label: ENERGY_LABELS[energy],
    });
  }

  return forecast;
}

/* ═══════════════════════════════════════════════════════════════
   DELOAD RECOMMENDATION
═══════════════════════════════════════════════════════════════ */

export function getDeloadRecommendation(
  phase: CyclePhase,
  subPhase: "early" | "mid" | "late",
  weeksSinceLastDeload: number,
  isOnBC: boolean,
): DeloadRecommendation {
  if (isOnBC) {
    // Standard 4-week deload cycle without phase alignment
    if (weeksSinceLastDeload >= 4) {
      return {
        shouldDeload: true,
        reason: "4 weeks of training without a deload",
        suggestedAction: "Reduce volume and intensity by 40% this session",
      };
    }
    return { shouldDeload: false, reason: "", suggestedAction: "" };
  }

  // Cycle-synced deload: align with late luteal / menstrual
  if (weeksSinceLastDeload >= 3 && phase === "luteal" && subPhase === "late") {
    return {
      shouldDeload: true,
      reason: "3+ weeks of training and entering late luteal — natural deload window",
      suggestedAction: "Your body is already primed for recovery. Reduce volume 30-40%, focus on mobility and tempo work.",
    };
  }

  if (weeksSinceLastDeload >= 3 && phase === "menstrual" && subPhase === "early") {
    return {
      shouldDeload: true,
      reason: "3+ weeks of training and starting menstruation — ideal deload timing",
      suggestedAction: "Light movement, mobility, gentle full-body circuits. Your next follicular phase will be stronger for it.",
    };
  }

  // Override: never suggest deload during follicular/ovulation unless 5+ weeks
  if (weeksSinceLastDeload >= 5) {
    return {
      shouldDeload: true,
      reason: "5+ weeks without a deload — recovery needed regardless of cycle phase",
      suggestedAction: "Reduce volume and intensity by 40% for 1 session, then resume.",
    };
  }

  return { shouldDeload: false, reason: "", suggestedAction: "" };
}

/* ═══════════════════════════════════════════════════════════════
   WEIGHT SUGGESTION FOR EXERCISE
═══════════════════════════════════════════════════════════════ */

export function getCycleAdjustedWeight(
  lastWeight: number | null,
  intensityModifier: number,
): { suggested: number | null; label: string } {
  if (!lastWeight || lastWeight <= 0) return { suggested: null, label: "" };
  const adjusted = Math.round(lastWeight * intensityModifier * 2) / 2; // round to 0.5kg
  if (intensityModifier >= 1.05) {
    return { suggested: adjusted, label: `Phase says push: try ${adjusted}kg (+${Math.round((intensityModifier - 1) * 100)}%)` };
  }
  if (intensityModifier <= 0.85) {
    return { suggested: adjusted, label: `Phase suggests: ~${adjusted}kg (${Math.round((1 - intensityModifier) * 100)}% lighter today)` };
  }
  if (intensityModifier < 1.0) {
    return { suggested: adjusted, label: `Ease off slightly: ~${adjusted}kg` };
  }
  return { suggested: null, label: "" };
}

/* ═══════════════════════════════════════════════════════════════
   FETCH HELPER — gets everything needed for the workout page
═══════════════════════════════════════════════════════════════ */

export async function fetchCycleTrainingData(userId: string): Promise<{
  profile: PhaseTrainingProfile;
  forecast: EnergyForecast[];
  lastPeriodStart: string;
  cycleLength: number;
} | null> {
  const logs = await fetchCycleLogs(userId);
  if (!logs.length) return null;

  const periodStarts = logs.map(l => l.period_start).filter(Boolean);
  if (!periodStarts.length) return null;

  const cycleLength = computeAdaptiveCycleLength(periodStarts);
  const lastPeriodStart = periodStarts[0];
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;
  const { phase, cycleDay, phaseDaysRemaining } = estimateCyclePhase(lastPeriodStart, cycleLength, today);

  // Fetch today's symptoms
  const symptoms = await fetchCycleSymptoms(userId, 1);
  const todaySymptoms = symptoms.find(s => s.date === today);

  // Check BC status from profiles
  const { supabase } = await import("../lib/supabase");
  const { data: prof } = await supabase
    .from("profiles")
    .select("hormonal_bc")
    .eq("id", userId)
    .maybeSingle();
  const isOnBC = prof?.hormonal_bc === true;

  const profile = getPhaseTrainingProfile(
    phase,
    cycleDay,
    phaseDaysRemaining,
    isOnBC,
    todaySymptoms?.symptoms,
    todaySymptoms?.energy_level ?? null,
  );

  const forecast = getEnergyForecast(lastPeriodStart, cycleLength, isOnBC);

  return { profile, forecast, lastPeriodStart, cycleLength };
}
