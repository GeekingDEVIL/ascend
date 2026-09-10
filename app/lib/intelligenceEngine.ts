import { SupabaseClient } from "@supabase/supabase-js";

// ── Types ──

export type FatigueAlert = {
  type: "weight_drop" | "rating_decline" | "volume_overreach";
  severity: "warning" | "critical";
  message: string;
  detail: string;
  exercises?: string[];
};

export type MuscleVolume = {
  muscle: string;
  sets: number;
  volume: number;
  pct: number;
};

export type VolumeBalance = {
  thisWeek: MuscleVolume[];
  lastWeek: MuscleVolume[];
  imbalances: { muscle: string; status: "high" | "low" | "none"; detail: string }[];
  totalSets: number;
  totalVolume: number;
  weekOverWeekChange: number | null;
};

export type IntelligenceReport = {
  fatigue: FatigueAlert[];
  volume: VolumeBalance | null;
  deloadSuggested: boolean;
  rpeAvg: number | null;
};

// ── Helpers ──

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return toDateString(monday);
}

// ── Fatigue Detection ──

export async function detectFatigue(
  supabase: SupabaseClient,
  userId: string,
  userSex: string,
): Promise<FatigueAlert[]> {
  const alerts: FatigueAlert[] = [];

  // Get last 6 completed sessions with ratings
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, date, rating, total_volume, total_sets, title")
    .eq("user_id", userId)
    .eq("sex", userSex)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(6);

  if (!sessions || sessions.length < 3) return alerts;

  // 1. Session rating decline: 3+ consecutive sessions trending down
  const rated = sessions.filter((s: any) => s.rating != null);
  if (rated.length >= 3) {
    const recent3 = rated.slice(0, 3);
    const allDecline = recent3.every((s: any, i: number) =>
      i === 0 || s.rating <= rated[i - 1].rating
    );
    const avgRating = recent3.reduce((sum: number, s: any) => sum + s.rating, 0) / 3;
    if (allDecline && avgRating <= 2.5) {
      alerts.push({
        type: "rating_decline",
        severity: avgRating <= 2 ? "critical" : "warning",
        message: "Session quality declining",
        detail: `Your last 3 sessions averaged ${avgRating.toFixed(1)}/5. Consider a deload week.`,
      });
    }
  }

  // 2. Weight drops: compare per-exercise avg weight vs last 3 sessions
  const sessionIds = sessions.slice(0, 3).map((s: any) => s.id);
  const olderIds = sessions.slice(3).map((s: any) => s.id);

  if (olderIds.length > 0) {
    const [{ data: recentLogs }, { data: olderLogs }] = await Promise.all([
      supabase
        .from("exercise_set_logs")
        .select("exercise_id, weight, reps, exercises(name)")
        .in("workout_session_id", sessionIds)
        .eq("is_warmup", false),
      supabase
        .from("exercise_set_logs")
        .select("exercise_id, weight, reps, exercises(name)")
        .in("workout_session_id", olderIds)
        .eq("is_warmup", false),
    ]);

    if (recentLogs && olderLogs) {
      const recentAvg = avgWeightByExercise(recentLogs);
      const olderAvg = avgWeightByExercise(olderLogs);
      const droppedExercises: string[] = [];

      for (const [exId, recent] of Object.entries(recentAvg)) {
        const older = olderAvg[exId];
        if (older && older.avgWeight > 0) {
          const dropPct = ((older.avgWeight - recent.avgWeight) / older.avgWeight) * 100;
          if (dropPct >= 10) {
            droppedExercises.push(recent.name);
          }
        }
      }

      if (droppedExercises.length >= 2) {
        alerts.push({
          type: "weight_drop",
          severity: droppedExercises.length >= 3 ? "critical" : "warning",
          message: "Weight dropping on multiple lifts",
          detail: `${droppedExercises.join(", ")} down 10%+ from your recent average.`,
          exercises: droppedExercises,
        });
      }
    }
  }

  // 3. RPE overreach: average RPE > 8.5 across recent sessions
  if (sessionIds.length > 0) {
    const { data: rpeLogs } = await supabase
      .from("exercise_set_logs")
      .select("rpe")
      .in("workout_session_id", sessionIds)
      .not("rpe", "is", null);

    if (rpeLogs && rpeLogs.length >= 5) {
      const avgRpe = rpeLogs.reduce((s: number, l: any) => s + l.rpe, 0) / rpeLogs.length;
      if (avgRpe >= 8.5) {
        alerts.push({
          type: "volume_overreach",
          severity: avgRpe >= 9.2 ? "critical" : "warning",
          message: "Training intensity very high",
          detail: `Average RPE ${avgRpe.toFixed(1)} across last ${rpeLogs.length} sets. Risk of overtraining.`,
        });
      }
    }
  }

  return alerts;
}

function avgWeightByExercise(logs: any[]): Record<string, { avgWeight: number; name: string }> {
  const groups: Record<string, { total: number; count: number; name: string }> = {};
  for (const l of logs) {
    const id = l.exercise_id;
    const w = Number(l.weight) || 0;
    if (w === 0) continue;
    if (!groups[id]) groups[id] = { total: 0, count: 0, name: (l.exercises as any)?.name || id };
    groups[id].total += w;
    groups[id].count += 1;
  }
  const result: Record<string, { avgWeight: number; name: string }> = {};
  for (const [id, g] of Object.entries(groups)) {
    result[id] = { avgWeight: g.total / g.count, name: g.name };
  }
  return result;
}

// ── Volume Periodization ──

export async function analyzeVolume(
  supabase: SupabaseClient,
  userId: string,
  userSex: string,
): Promise<VolumeBalance | null> {
  const now = new Date();
  const thisWeekStart = weekStart(now);
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekStart = weekStart(lastWeekDate);

  // Get sessions from this week and last week
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, date")
    .eq("user_id", userId)
    .eq("sex", userSex)
    .eq("status", "completed")
    .gte("date", lastWeekStart)
    .order("date", { ascending: false });

  if (!sessions || sessions.length === 0) return null;

  const thisWeekIds = sessions.filter((s: any) => s.date >= thisWeekStart).map((s: any) => s.id);
  const lastWeekIds = sessions.filter((s: any) => s.date >= lastWeekStart && s.date < thisWeekStart).map((s: any) => s.id);

  const allIds = [...thisWeekIds, ...lastWeekIds];
  if (allIds.length === 0) return null;

  // Get set logs with exercise muscle info
  const { data: logs } = await supabase
    .from("exercise_set_logs")
    .select("workout_session_id, exercise_id, weight, reps, is_warmup, exercises(primary_muscle, body_segment)")
    .in("workout_session_id", allIds)
    .eq("is_warmup", false);

  if (!logs || logs.length === 0) return null;

  const thisWeekIdSet = new Set(thisWeekIds);
  const lastWeekIdSet = new Set(lastWeekIds);

  const thisWeekMuscles = aggregateMuscleVolume(logs.filter((l: any) => thisWeekIdSet.has(l.workout_session_id)));
  const lastWeekMuscles = aggregateMuscleVolume(logs.filter((l: any) => lastWeekIdSet.has(l.workout_session_id)));

  // Detect imbalances (this week)
  const imbalances = detectImbalances(thisWeekMuscles);

  const thisTotalVol = thisWeekMuscles.reduce((s, m) => s + m.volume, 0);
  const lastTotalVol = lastWeekMuscles.reduce((s, m) => s + m.volume, 0);

  return {
    thisWeek: thisWeekMuscles,
    lastWeek: lastWeekMuscles,
    imbalances,
    totalSets: thisWeekMuscles.reduce((s, m) => s + m.sets, 0),
    totalVolume: thisTotalVol,
    weekOverWeekChange: lastTotalVol > 0 ? Math.round(((thisTotalVol - lastTotalVol) / lastTotalVol) * 100) : null,
  };
}

function aggregateMuscleVolume(logs: any[]): MuscleVolume[] {
  const groups: Record<string, { sets: number; volume: number }> = {};
  for (const l of logs) {
    const muscle = (l.exercises as any)?.body_segment || (l.exercises as any)?.primary_muscle || "Other";
    const vol = (Number(l.weight) || 0) * (Number(l.reps) || 0);
    if (!groups[muscle]) groups[muscle] = { sets: 0, volume: 0 };
    groups[muscle].sets += 1;
    groups[muscle].volume += vol;
  }
  const totalSets = Object.values(groups).reduce((s, g) => s + g.sets, 0);
  return Object.entries(groups)
    .map(([muscle, g]) => ({
      muscle,
      sets: g.sets,
      volume: g.volume,
      pct: totalSets > 0 ? Math.round((g.sets / totalSets) * 100) : 0,
    }))
    .sort((a, b) => b.sets - a.sets);
}

const PUSH_PULL_BALANCE: Record<string, "push" | "pull" | "legs" | "core"> = {
  Chest: "push",
  Shoulders: "push",
  Triceps: "push",
  Back: "pull",
  Biceps: "pull",
  Forearms: "pull",
  Quadriceps: "legs",
  Hamstrings: "legs",
  Glutes: "legs",
  Calves: "legs",
  Abs: "core",
  Core: "core",
};

function detectImbalances(muscles: MuscleVolume[]): VolumeBalance["imbalances"] {
  const imbalances: VolumeBalance["imbalances"] = [];
  if (muscles.length === 0) return imbalances;

  const totalSets = muscles.reduce((s, m) => s + m.sets, 0);
  if (totalSets < 6) return imbalances;

  // Check push/pull ratio
  let pushSets = 0, pullSets = 0;
  for (const m of muscles) {
    const cat = PUSH_PULL_BALANCE[m.muscle];
    if (cat === "push") pushSets += m.sets;
    else if (cat === "pull") pullSets += m.sets;
  }

  if (pushSets > 0 && pullSets > 0) {
    const ratio = pushSets / pullSets;
    if (ratio > 1.8) {
      imbalances.push({ muscle: "Pull", status: "low", detail: `Push:Pull ratio ${ratio.toFixed(1)}:1 — add more pulling work` });
    } else if (ratio < 0.5) {
      imbalances.push({ muscle: "Push", status: "low", detail: `Push:Pull ratio ${ratio.toFixed(1)}:1 — add more pressing work` });
    }
  }

  // Check individual muscles for over/under representation
  for (const m of muscles) {
    const pct = (m.sets / totalSets) * 100;
    if (pct > 40) {
      imbalances.push({ muscle: m.muscle, status: "high", detail: `${m.muscle} is ${m.sets} sets (${Math.round(pct)}% of total) — consider more variety` });
    }
  }

  // Check for missing leg work when upper body is trained
  const hasUpperBody = muscles.some(m => ["Chest", "Back", "Shoulders"].includes(m.muscle));
  const legSets = muscles.filter(m => PUSH_PULL_BALANCE[m.muscle] === "legs").reduce((s, m) => s + m.sets, 0);
  if (hasUpperBody && legSets === 0 && totalSets >= 10) {
    imbalances.push({ muscle: "Legs", status: "low", detail: "No leg work this week — don't skip leg day" });
  }

  return imbalances;
}

// ── Full Report ──

export async function generateIntelligenceReport(
  supabase: SupabaseClient,
  userId: string,
  userSex: string,
): Promise<IntelligenceReport> {
  const [fatigue, volume] = await Promise.all([
    detectFatigue(supabase, userId, userSex),
    analyzeVolume(supabase, userId, userSex),
  ]);

  // Calculate recent average RPE
  let rpeAvg: number | null = null;
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("sex", userSex)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(3);

  if (recentSessions && recentSessions.length > 0) {
    const { data: rpeLogs } = await supabase
      .from("exercise_set_logs")
      .select("rpe")
      .in("workout_session_id", recentSessions.map((s: any) => s.id))
      .not("rpe", "is", null);

    if (rpeLogs && rpeLogs.length >= 3) {
      rpeAvg = rpeLogs.reduce((s: number, l: any) => s + l.rpe, 0) / rpeLogs.length;
    }
  }

  const deloadSuggested = fatigue.some(a => a.severity === "critical") || fatigue.length >= 2;

  return { fatigue, volume, deloadSuggested, rpeAvg };
}
