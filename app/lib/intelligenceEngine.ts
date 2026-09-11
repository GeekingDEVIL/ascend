import { SupabaseClient } from "@supabase/supabase-js";

// ── Types ──

export type FatigueAlert = {
  type: "weight_drop" | "rating_decline" | "volume_overreach";
  severity: "warning" | "critical";
  message: string;
  detail: string;
  exercises?: string[];
};

export type IntelligenceReport = {
  fatigue: FatigueAlert[];
  deloadSuggested: boolean;
  rpeAvg: number | null;
};

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

// ── Full Report ──

export async function generateIntelligenceReport(
  supabase: SupabaseClient,
  userId: string,
  userSex: string,
): Promise<IntelligenceReport> {
  const fatigue = await detectFatigue(supabase, userId, userSex);

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

  return { fatigue, deloadSuggested, rpeAvg };
}
