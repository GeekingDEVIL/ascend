import { supabase } from "./supabase";

export type MuscleTrend = "improving" | "maintaining" | "stalling" | "declining" | "insufficient";

export type AdaptiveVolumeData = {
  hasEnoughData: boolean;
  weeksOfData: number;
  trend: MuscleTrend;
  personalMin: number | null;
  personalMax: number | null;
  avgWeeklySets: number;
  performanceChangePct: number | null;
  suggestion: string | null;
  weeklyHistory: { weekLabel: string; sets: number; avgE1RM: number | null }[];
};

type WeekBucket = {
  weekStart: string;
  sets: number;
  e1rms: number[];
};

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

function estimateE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30); // Epley formula
}

function computeTrend(values: number[]): MuscleTrend {
  if (values.length < 3) return "insufficient";

  const recent = values.slice(-2);
  const earlier = values.slice(-4, -2);

  if (earlier.length === 0) return "insufficient";

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

  if (earlierAvg === 0) return "insufficient";

  const changePct = ((recentAvg - earlierAvg) / earlierAvg) * 100;

  if (changePct > 2) return "improving";
  if (changePct > -2) return "maintaining";
  if (changePct > -5) return "stalling";
  return "declining";
}

function computePerformanceChange(values: number[]): number | null {
  if (values.length < 2) return null;
  const recent = values[values.length - 1];
  const earliest = values[0];
  if (earliest === 0) return null;
  return ((recent - earliest) / earliest) * 100;
}

function findProductiveVolumeRange(
  weeklyData: { sets: number; avgE1RM: number | null }[]
): { min: number | null; max: number | null } {
  // Find weeks where performance improved vs declined
  // Compare each week's volume with the performance change that followed
  const validWeeks = weeklyData.filter((w) => w.avgE1RM !== null && w.avgE1RM > 0);
  if (validWeeks.length < 4) return { min: null, max: null };

  const improvingVolumes: number[] = [];
  const decliningVolumes: number[] = [];

  for (let i = 1; i < validWeeks.length; i++) {
    const prev = validWeeks[i - 1];
    const curr = validWeeks[i];
    if (!prev.avgE1RM || !curr.avgE1RM) continue;

    const change = ((curr.avgE1RM - prev.avgE1RM) / prev.avgE1RM) * 100;

    if (change > 1) {
      improvingVolumes.push(prev.sets);
    } else if (change < -2) {
      decliningVolumes.push(prev.sets);
    }
  }

  let personalMin: number | null = null;
  let personalMax: number | null = null;

  if (improvingVolumes.length >= 2) {
    // MEV estimate: minimum volume where improvement was observed
    personalMin = Math.min(...improvingVolumes);
  }

  if (decliningVolumes.length >= 2) {
    // MRV estimate: volume level where decline started
    personalMax = Math.min(...decliningVolumes);
  } else if (improvingVolumes.length >= 2) {
    // No decline observed yet — MRV is at least the highest productive volume + buffer
    personalMax = Math.max(...improvingVolumes) + 4;
  }

  return { min: personalMin, max: personalMax };
}

export async function analyzeAdaptiveVolume(
  userId: string
): Promise<Record<string, AdaptiveVolumeData>> {
  const result: Record<string, AdaptiveVolumeData> = {};

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const cutoff = eightWeeksAgo.toISOString().split("T")[0];

  // Fetch all completed set logs from the last 8 weeks
  const { data: logs } = await supabase
    .from("exercise_set_logs")
    .select("exercise_id, weight, reps, completed_at, workout_sessions!inner(date, status, user_id), exercises!inner(body_segment)")
    .eq("workout_sessions.user_id", userId)
    .eq("workout_sessions.status", "completed")
    .gte("workout_sessions.date", cutoff);

  if (!logs || logs.length === 0) return result;

  // Group by muscle → week
  const muscleWeeks: Record<string, Record<string, WeekBucket>> = {};

  logs.forEach((log: any) => {
    const segment = log.exercises?.body_segment;
    if (!segment || segment === "Cardio") return;

    const dateStr = log.workout_sessions?.date;
    if (!dateStr) return;

    const weekStart = getWeekStart(dateStr);

    if (!muscleWeeks[segment]) muscleWeeks[segment] = {};
    if (!muscleWeeks[segment][weekStart]) {
      muscleWeeks[segment][weekStart] = { weekStart, sets: 0, e1rms: [] };
    }

    muscleWeeks[segment][weekStart].sets += 1;

    const weight = Number(log.weight);
    const reps = Number(log.reps);
    if (weight > 0 && reps > 0) {
      muscleWeeks[segment][weekStart].e1rms.push(estimateE1RM(weight, reps));
    }
  });

  // Process each muscle group
  for (const [segment, weeks] of Object.entries(muscleWeeks)) {
    const sortedWeeks = Object.values(weeks).sort(
      (a, b) => a.weekStart.localeCompare(b.weekStart)
    );

    const weeklyHistory = sortedWeeks.map((w) => ({
      weekLabel: w.weekStart,
      sets: w.sets,
      avgE1RM: w.e1rms.length > 0
        ? w.e1rms.reduce((a, b) => a + b, 0) / w.e1rms.length
        : null,
    }));

    const e1rmValues = weeklyHistory
      .map((w) => w.avgE1RM)
      .filter((v): v is number => v !== null && v > 0);

    const weeksOfData = sortedWeeks.length;
    const hasEnoughData = weeksOfData >= 4;
    const trend = hasEnoughData ? computeTrend(e1rmValues) : "insufficient";
    const performanceChangePct = computePerformanceChange(e1rmValues);
    const avgWeeklySets = weeksOfData > 0
      ? Math.round(sortedWeeks.reduce((s, w) => s + w.sets, 0) / weeksOfData)
      : 0;

    const { min: personalMin, max: personalMax } = hasEnoughData
      ? findProductiveVolumeRange(weeklyHistory)
      : { min: null, max: null };

    let suggestion: string | null = null;
    if (hasEnoughData) {
      switch (trend) {
        case "improving":
          suggestion = "Performance is trending up — current volume is productive. Maintain or add 1–2 sets if recovery allows.";
          break;
        case "maintaining":
          suggestion = "Performance is stable. If the goal is growth, consider adding 1–2 sets/week and monitoring for 2–3 weeks.";
          break;
        case "stalling":
          suggestion = "Performance has plateaued. Consider a deload week, then resume at slightly lower volume before building back up.";
          break;
        case "declining":
          suggestion = "Performance is declining — likely exceeding recoverable volume. Reduce by 20–30% for 2 weeks, then rebuild gradually.";
          break;
      }
    }

    result[segment] = {
      hasEnoughData,
      weeksOfData,
      trend,
      personalMin,
      personalMax,
      avgWeeklySets,
      performanceChangePct,
      suggestion,
      weeklyHistory,
    };
  }

  return result;
}