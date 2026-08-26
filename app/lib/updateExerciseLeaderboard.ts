import { supabase } from "./supabase";

function estimateE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export async function updateExerciseLeaderboard(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, sex")
    .eq("id", userId)
    .maybeSingle();
  const username = profile?.username ?? "Unknown";
  const avatarUrl = profile?.avatar_url ?? null;
  const sex = profile?.sex ?? "male";

  const { data: sexSessions } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("sex", sex);
  const sessionIds = (sexSessions ?? []).map((s: any) => s.id);

  if (sessionIds.length === 0) {
    await supabase.from("exercise_leaderboard").delete().eq("user_id", userId).eq("sex", sex);
    return;
  }

  const { data: logs } = await supabase
    .from("exercise_set_logs")
    .select("exercise_id, weight, reps, completed_at, exercises(name)")
    .eq("user_id", userId)
    .in("workout_session_id", sessionIds)
    .gt("weight", 0);

  if (!logs || logs.length === 0) return;

  const bestByExercise: Record<string, { weight: number; reps: number; e1rm: number; achievedAt: string; name: string }> = {};
  logs.forEach((log: any) => {
    const eid = log.exercise_id;
    const w = Number(log.weight);
    const r = Number(log.reps);
    const e1rm = estimateE1RM(w, r);
    if (!bestByExercise[eid] || e1rm > bestByExercise[eid].e1rm) {
      bestByExercise[eid] = { weight: w, reps: r, e1rm, achievedAt: log.completed_at, name: log.exercises?.name ?? "Unknown" };
    }
  });

  const rows = Object.entries(bestByExercise).map(([exerciseId, b]) => ({
    user_id: userId,
    exercise_id: exerciseId,
    exercise_name: b.name,
    username,
    avatar_url: avatarUrl,
    sex,
    best_weight: b.weight,
    best_reps: b.reps,
    best_e1rm: b.e1rm,
    achieved_at: b.achievedAt,
    updated_at: new Date().toISOString(),
  }));

  await supabase.from("exercise_leaderboard").upsert(rows, { onConflict: "user_id,exercise_id,sex" });
}
