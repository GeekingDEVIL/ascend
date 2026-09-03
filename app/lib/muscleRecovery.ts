import { supabase } from "./supabase";
import type { Sex } from "./calorieEngine";

// Evidence-based muscle recovery model
// Sources: ACSM (2009), NSCA Essentials of Strength Training (Haff & Triplett),
// Schoenfeld et al. (2016) meta-analysis, Bishop et al. (2008) recovery review

export type RecoveryStatus = "recovered" | "ready" | "moderate" | "fatigued" | "overtrained";

export type MuscleRecoveryData = {
  segment: string;
  recoveryPct: number;
  status: RecoveryStatus;
  hoursElapsed: number | null;
  lastTrainedAt: string | null;
  setsInSession: number;
  intensityFactor: number;
  estimatedFullRecoveryHours: number;
  weeklyVolume: number;
  frequencyThisWeek: number;
  recommendation: string;
};

// ACSM/NSCA muscle group recovery windows (hours to full recovery)
// Larger muscles need longer; compound movements create more systemic fatigue
const BASE_RECOVERY_HOURS_MALE: Record<string, { min: number; max: number }> = {
  Legs:      { min: 48, max: 72 },
  Back:      { min: 48, max: 72 },
  Chest:     { min: 48, max: 72 },
  Glutes:    { min: 48, max: 72 },
  Shoulders: { min: 36, max: 60 },
  Traps:     { min: 36, max: 56 },
  Core:      { min: 24, max: 48 },
  Biceps:    { min: 36, max: 48 },
  Triceps:   { min: 36, max: 48 },
  Forearms:  { min: 24, max: 36 },
};

// Females recover ~10-15% faster between bouts (Judge & Burke, 2010; Häkkinen, 1993)
// due to lower absolute force production, less muscle damage per session,
// and faster phosphocreatine resynthesis
const BASE_RECOVERY_HOURS_FEMALE: Record<string, { min: number; max: number }> = {
  Legs:      { min: 40, max: 62 },
  Back:      { min: 40, max: 62 },
  Chest:     { min: 40, max: 60 },
  Glutes:    { min: 40, max: 60 },
  Shoulders: { min: 30, max: 50 },
  Traps:     { min: 30, max: 48 },
  Core:      { min: 20, max: 40 },
  Biceps:    { min: 30, max: 42 },
  Triceps:   { min: 30, max: 42 },
  Forearms:  { min: 20, max: 30 },
};

function getBaseRecoveryHours(sex?: Sex | null): Record<string, { min: number; max: number }> {
  return sex === "female" ? BASE_RECOVERY_HOURS_FEMALE : BASE_RECOVERY_HOURS_MALE;
}

// Volume-intensity scaling: more sets and heavier loads = longer recovery
// Based on Schoenfeld (2016): recovery time increases ~15% per additional 5 sets beyond 10
function volumeIntensityMultiplier(sets: number, avgRPE: number): number {
  let mult = 1.0;
  if (sets > 15) mult += 0.20;
  else if (sets > 10) mult += 0.10;
  else if (sets < 5) mult -= 0.15;

  // Higher intensity (heavier loads / lower reps) increases recovery demand
  // RPE 9-10 adds ~20% recovery time vs RPE 6-7 (Helms et al.)
  if (avgRPE >= 9) mult += 0.20;
  else if (avgRPE >= 8) mult += 0.10;
  else if (avgRPE <= 6) mult -= 0.10;

  return Math.max(0.7, Math.min(1.5, mult));
}

// Non-linear recovery curve (Bishop et al. 2008)
// Recovery is not linear — fast initial recovery (inflammatory response resolving),
// then slower structural repair, then supercompensation
function recoveryPercentage(hoursElapsed: number, fullRecoveryHours: number): number {
  if (hoursElapsed <= 0) return 0;
  if (hoursElapsed >= fullRecoveryHours) return 100;

  const t = hoursElapsed / fullRecoveryHours;

  // Piecewise model:
  // 0-30%: rapid initial recovery (inflammation resolving) — first 25% of time
  // 30-80%: steady structural repair — middle 50% of time
  // 80-100%: supercompensation approach — final 25% of time
  if (t <= 0.25) {
    return Math.round(t / 0.25 * 30);
  } else if (t <= 0.75) {
    return Math.round(30 + (t - 0.25) / 0.50 * 50);
  } else {
    return Math.round(80 + (t - 0.75) / 0.25 * 20);
  }
}

function getRecoveryStatus(pct: number): RecoveryStatus {
  if (pct >= 95) return "recovered";
  if (pct >= 80) return "ready";
  if (pct >= 50) return "moderate";
  if (pct >= 25) return "fatigued";
  return "overtrained";
}

function getRecommendation(status: RecoveryStatus, segment: string, weeklyVolume: number, freq: number): string {
  switch (status) {
    case "recovered":
      return `${segment} is fully recovered. Optimal window for training — prioritize progressive overload.`;
    case "ready":
      return `${segment} is ready for training. Good to go for a full session.`;
    case "moderate":
      if (freq >= 3) return `${segment} is still recovering. With ${freq}x/week frequency, consider a lighter session or deload sets.`;
      return `${segment} is partially recovered. A moderate session is fine — avoid max effort.`;
    case "fatigued":
      return `${segment} needs more rest. Training now risks accumulated fatigue and potential injury. Wait 12-24 more hours.`;
    case "overtrained":
      return `${segment} is significantly fatigued. Rest is essential — training now will impair recovery and risk overuse injury.`;
  }
}

// Estimate average RPE from logged data: heavier relative loads = higher RPE
function estimateRPE(sets: { weight: number; reps: number }[]): number {
  if (sets.length === 0) return 7;
  let totalEffort = 0;
  for (const s of sets) {
    // Low reps with high weight = higher RPE
    // Rough mapping: 1-3 reps → RPE 9-10, 4-6 → 8-9, 7-12 → 7-8, 13+ → 6-7
    if (s.reps <= 3) totalEffort += 9.5;
    else if (s.reps <= 6) totalEffort += 8.5;
    else if (s.reps <= 12) totalEffort += 7.5;
    else totalEffort += 6.5;
  }
  return totalEffort / sets.length;
}

export type RecoveryDiagnostics = {
  totalLogs: number;
  skippedNoSegment: number;
  skippedCardioFullBody: number;
};

export async function analyzeRecovery(userId: string, sex?: Sex | null): Promise<{ data: Record<string, MuscleRecoveryData>; diagnostics: RecoveryDiagnostics }> {
  const result: Record<string, MuscleRecoveryData> = {};
  const diagnostics: RecoveryDiagnostics = { totalLogs: 0, skippedNoSegment: 0, skippedCardioFullBody: 0 };

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const cutoff = twoWeeksAgo.toISOString().split("T")[0];

  const { data: logs } = await supabase
    .from("exercise_set_logs")
    .select("exercise_id, weight, reps, completed_at, workout_sessions!inner(date, status, user_id, sex), exercises!inner(body_segment)")
    .eq("workout_sessions.user_id", userId)
    .eq("workout_sessions.status", "completed")
    .eq("workout_sessions.sex", sex ?? "male")
    .gte("workout_sessions.date", cutoff);

  if (!logs || logs.length === 0) return { data: result, diagnostics };

  // Group by muscle segment
  const muscleData: Record<string, {
    sessions: { date: string; sets: { weight: number; reps: number }[] }[];
    lastTrainedAt: string;
  }> = {};

  diagnostics.totalLogs = logs.length;
  logs.forEach((log: any) => {
    const segment = log.exercises?.body_segment;
    if (!segment) { diagnostics.skippedNoSegment++; return; }
    if (segment === "Cardio" || segment === "Full Body") { diagnostics.skippedCardioFullBody++; return; }

    const dateStr = log.workout_sessions?.date;
    const completedAt = log.completed_at || dateStr;
    if (!dateStr) return;

    if (!muscleData[segment]) {
      muscleData[segment] = { sessions: [], lastTrainedAt: completedAt };
    }

    if (completedAt > muscleData[segment].lastTrainedAt) {
      muscleData[segment].lastTrainedAt = completedAt;
    }

    let session = muscleData[segment].sessions.find(s => s.date === dateStr);
    if (!session) {
      session = { date: dateStr, sets: [] };
      muscleData[segment].sessions.push(session);
    }

    const weight = Number(log.weight) || 0;
    const reps = Number(log.reps) || 0;
    if (reps > 0) {
      session.sets.push({ weight, reps });
    }
  });

  const now = Date.now();
  const weekStart = new Date();
  const dayOfWeek = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - ((dayOfWeek + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  for (const [segment, data] of Object.entries(muscleData)) {
    const recoveryTable = getBaseRecoveryHours(sex);
    const baseRecovery = recoveryTable[segment] ?? { min: 36, max: 60 };
    const hoursElapsed = (now - new Date(data.lastTrainedAt).getTime()) / (1000 * 60 * 60);

    // Find the most recent session's volume and intensity
    const sortedSessions = [...data.sessions].sort((a, b) => b.date.localeCompare(a.date));
    const lastSession = sortedSessions[0];
    const setsInSession = lastSession?.sets.length ?? 0;
    const avgRPE = lastSession ? estimateRPE(lastSession.sets) : 7;
    const intensityFactor = volumeIntensityMultiplier(setsInSession, avgRPE);

    // Full recovery time = base * intensity factor
    const baseHours = (baseRecovery.min + baseRecovery.max) / 2;
    const estimatedFullRecoveryHours = Math.round(baseHours * intensityFactor);

    const recoveryPct = recoveryPercentage(hoursElapsed, estimatedFullRecoveryHours);
    const status = getRecoveryStatus(recoveryPct);

    // Weekly stats
    const thisWeekSessions = data.sessions.filter(s => s.date >= weekStartStr);
    const weeklyVolume = thisWeekSessions.reduce((sum, s) => sum + s.sets.length, 0);
    const frequencyThisWeek = thisWeekSessions.length;

    const recommendation = getRecommendation(status, segment, weeklyVolume, frequencyThisWeek);

    result[segment] = {
      segment,
      recoveryPct,
      status,
      hoursElapsed: Math.round(hoursElapsed),
      lastTrainedAt: data.lastTrainedAt,
      setsInSession,
      intensityFactor: Math.round(intensityFactor * 100) / 100,
      estimatedFullRecoveryHours,
      weeklyVolume,
      frequencyThisWeek,
      recommendation,
    };
  }

  return { data: result, diagnostics };
}
