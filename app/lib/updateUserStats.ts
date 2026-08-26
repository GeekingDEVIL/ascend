import { supabase } from "./supabase";
import { computeLevel, getRank } from "./levelSystem";

export async function updateUserStats(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, sex")
    .eq("id", userId)
    .maybeSingle();
  const username = profile?.username ?? "Unknown";
  const avatarUrl = profile?.avatar_url ?? null;
  const sex = profile?.sex ?? "male";

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("xp_earned, total_volume, date")
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("sex", sex);

  const totalXp = (sessions ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0);
  const totalVolume = (sessions ?? []).reduce((s, r: any) => s + (Number(r.total_volume) || 0), 0);
  const totalWorkouts = (sessions ?? []).length;
  const levelInfo = computeLevel(totalXp);
  const rank = getRank(levelInfo.level);

  const { data: plans } = await supabase
    .from("recurring_plans")
    .select("weekday, is_rest")
    .eq("user_id", userId)
    .eq("sex", sex);
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

  const { count: achievementCount } = await supabase
    .from("achievements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: existing } = await supabase
    .from("user_stats")
    .select("best_streak")
    .eq("user_id", userId)
    .eq("sex", sex)
    .maybeSingle();
  const bestStreak = Math.max(streak, existing?.best_streak ?? 0);

  await supabase.from("user_stats").upsert({
    user_id: userId,
    username,
    avatar_url: avatarUrl,
    sex,
    level: levelInfo.level,
    total_xp: totalXp,
    rank_name: rank.name,
    total_workouts: totalWorkouts,
    current_streak: streak,
    total_volume: Math.round(totalVolume),
    achievement_count: achievementCount ?? 0,
    best_streak: bestStreak,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,sex" });
}
