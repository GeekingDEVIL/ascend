import { supabase } from "./supabase";

export type XPBreakdown = {
  base: number;
  setCompletion: number;
  completionBonus: number;
  prBonus: number;
  progressionBonus: number;
  consistencyBonus: number;
  total: number;
  details: string[];
};

const XP_CONFIG = {
  BASE_SESSION: 50,           // Just for showing up and finishing
  PER_SET: 4,                 // Per completed set
  FULL_COMPLETION_BONUS: 30,  // Completed 100% of planned sets
  HIGH_COMPLETION_BONUS: 15,  // Completed 80%+ of planned sets
  PR_BONUS: 25,               // Per new PR in the session
  PROGRESSION_BONUS: 20,      // Used more weight/reps than last session on any exercise
  STREAK_BONUS_7: 10,         // Active streak of 7+
  STREAK_BONUS_14: 20,        // Active streak of 14+
  STREAK_BONUS_30: 35,        // Active streak of 30+
  MAX_PER_SESSION: 300,       // Hard cap — prevents farming
  MAX_SETS_COUNTED: 40,       // Sets beyond this don't earn XP — prevents padding
};

export async function calculateSessionXP(
  userId: string,
  sessionId: string,
  completedSets: { exercise_id: string; weight: number | null; reps: number | null }[],
  totalPlannedSets: number,
  newPRCount: number,
  sex: string = "male",
): Promise<XPBreakdown> {
  const details: string[] = [];

  // 1. Base XP
  const base = XP_CONFIG.BASE_SESSION;
  details.push(`Session completed: +${base} XP`);

  // 2. Per-set XP (capped)
  const setsToCount = Math.min(completedSets.length, XP_CONFIG.MAX_SETS_COUNTED);
  const setCompletion = setsToCount * XP_CONFIG.PER_SET;
  details.push(`${setsToCount} sets logged: +${setCompletion} XP`);

  // 3. Completion bonus
  let completionBonus = 0;
  if (totalPlannedSets > 0) {
    const completionRate = completedSets.length / totalPlannedSets;
    if (completionRate >= 1.0) {
      completionBonus = XP_CONFIG.FULL_COMPLETION_BONUS;
      details.push(`100% completion: +${completionBonus} XP`);
    } else if (completionRate >= 0.8) {
      completionBonus = XP_CONFIG.HIGH_COMPLETION_BONUS;
      details.push(`${Math.round(completionRate * 100)}% completion: +${completionBonus} XP`);
    }
  }

  // 4. PR bonus
  const prBonus = Math.min(newPRCount, 5) * XP_CONFIG.PR_BONUS; // Cap at 5 PRs per session
  if (prBonus > 0) {
    details.push(`${Math.min(newPRCount, 5)} new PR${newPRCount > 1 ? "s" : ""}: +${prBonus} XP`);
  }

  // 5. Progression bonus — did you lift more than last session for any exercise?
  let progressionBonus = 0;
  const exerciseIds = [...new Set(completedSets.map((s) => s.exercise_id))];
  if (exerciseIds.length > 0) {
    const { data: prevLogs } = await supabase
      .from("exercise_set_logs")
      .select("exercise_id, weight, reps, workout_session_id, workout_sessions!inner(sex)")
      .eq("user_id", userId)
      .eq("workout_sessions.sex", sex)
      .in("exercise_id", exerciseIds)
      .neq("workout_session_id", sessionId)
      .order("completed_at", { ascending: false })
      .limit(500);

    if (prevLogs && prevLogs.length > 0) {
      // Get best previous weight per exercise
      const prevBest: Record<string, number> = {};
      prevLogs.forEach((log: any) => {
        const w = Number(log.weight) || 0;
        if (w > 0 && (!prevBest[log.exercise_id] || w > prevBest[log.exercise_id])) {
          prevBest[log.exercise_id] = w;
        }
      });

      // Check if any current exercise beat its previous best weight
      let progressed = false;
      for (const set of completedSets) {
        const w = Number(set.weight) || 0;
        if (w > 0 && prevBest[set.exercise_id] && w > prevBest[set.exercise_id]) {
          progressed = true;
          break;
        }
      }

      if (progressed) {
        progressionBonus = XP_CONFIG.PROGRESSION_BONUS;
        details.push(`Weight progression detected: +${progressionBonus} XP`);
      }
    }
  }

  // 6. Consistency (streak) bonus
  let consistencyBonus = 0;
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("date")
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("sex", sex)
    .order("date", { ascending: false })
    .limit(60);

  if (recentSessions && recentSessions.length > 0) {
    const { data: plans } = await supabase
      .from("recurring_plans")
      .select("weekday, is_rest")
      .eq("user_id", userId)
      .eq("sex", sex);
    const restWeekdays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));
    const completedDates = new Set(recentSessions.map((s: any) => s.date));

    let streak = 0;
    const check = new Date();
    for (let i = 0; i < 60; i++) {
      const d = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, "0")}-${String(check.getDate()).padStart(2, "0")}`;
      const wd = check.getDay();
      if (restWeekdays.has(wd)) {
        check.setDate(check.getDate() - 1);
        continue;
      }
      if (completedDates.has(d)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    if (streak >= 30) {
      consistencyBonus = XP_CONFIG.STREAK_BONUS_30;
      details.push(`30+ day streak: +${consistencyBonus} XP`);
    } else if (streak >= 14) {
      consistencyBonus = XP_CONFIG.STREAK_BONUS_14;
      details.push(`14+ day streak: +${consistencyBonus} XP`);
    } else if (streak >= 7) {
      consistencyBonus = XP_CONFIG.STREAK_BONUS_7;
      details.push(`7+ day streak: +${consistencyBonus} XP`);
    }
  }

  // Total with hard cap
  const rawTotal = base + setCompletion + completionBonus + prBonus + progressionBonus + consistencyBonus;
  const total = Math.min(rawTotal, XP_CONFIG.MAX_PER_SESSION);

  if (rawTotal > XP_CONFIG.MAX_PER_SESSION) {
    details.push(`Session cap applied: ${rawTotal} → ${total} XP`);
  }

  return {
    base,
    setCompletion,
    completionBonus,
    prBonus,
    progressionBonus,
    consistencyBonus,
    total,
    details,
  };
}