import { supabase } from "./supabase";
import { computeLevel, getRank } from "./levelSystem";

export async function updateUserStats(userId: string) {
  // 1. Username + avatar
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  const username = profile?.username ?? "Unknown";
  const avatarUrl = profile?.avatar_url ?? null;

  // 2. Total XP + Level + Rank
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("xp_earned, total_volume, date")
    .eq("user_id", userId)
    .eq("status", "completed");

  const totalXp = (sessions ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0);
  const totalVolume = (sessions ?? []).reduce((s, r: any) => s + (Number(r.total_volume) || 0), 0);
  const totalWorkouts = (sessions ?? []).length;
  const levelInfo = computeLevel(totalXp);
  const rank = getRank(levelInfo.level);

  // 3. Current streak
  const { data: plans } = await supabase
    .from("recurring_plans")
    .select("weekday, is_rest")
    .eq("user_id", userId);
  const restDays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));
  const completedDates = new Set((sessions ?? []).map((s: any) => s.date));

  let streak = 0;
  const check = new Date();
  for (let i = 0; i < 120; i++) {
    const d = check.toISOString().split("T")[0];
    const wd = check.getDay();
    if (restDays.has(wd)) { check.setDate(check.getDate() - 1); continue; }
    if (completedDates.has(d)) { streak++; check.setDate(check.getDate() - 1); } else break;
  }

  // 4. Achievement count
  const { count: achievementCount } = await supabase
    .from("achievements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  // 5. Best streak (keep the highest ever)
  const { data: existing } = await supabase
    .from("user_stats")
    .select("best_streak")
    .eq("user_id", userId)
    .maybeSingle();
  const bestStreak = Math.max(streak, existing?.best_streak ?? 0);

  // 6. Upsert
  await supabase.from("user_stats").upsert({
    user_id: userId,
    username,
    avatar_url: avatarUrl,
    level: levelInfo.level,
    total_xp: totalXp,
    rank_name: rank.name,
    total_workouts: totalWorkouts,
    current_streak: streak,
    total_volume: Math.round(totalVolume),
    achievement_count: achievementCount ?? 0,
    best_streak: bestStreak,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}