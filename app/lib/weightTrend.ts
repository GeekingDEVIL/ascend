import { supabase } from "./supabase";

const EMA_ALPHA = 0.1;

export type WeightEntry = {
  date: string;
  raw_kg: number;
  ema_kg: number;
};

export type WeightContext = "morning" | "pre_workout" | "post_workout" | "manual" | "profile" | "onboarding";

export function computeEMA(
  sortedEntries: { date: string; weight: number }[],
  existingEma?: number
): WeightEntry[] {
  if (sortedEntries.length === 0) return [];

  const result: WeightEntry[] = [];
  let ema = existingEma ?? sortedEntries[0].weight;

  for (const entry of sortedEntries) {
    ema = EMA_ALPHA * entry.weight + (1 - EMA_ALPHA) * ema;
    result.push({
      date: entry.date,
      raw_kg: entry.weight,
      ema_kg: Math.round(ema * 100) / 100,
    });
  }

  return result;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 100) / 100;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 100) / 100;
}

export async function rematerializeWeightTrend(userId: string, sex: string = "male"): Promise<void> {
  const { data: morningLogs } = await supabase
    .from("body_weight_logs")
    .select("weight, logged_at, date")
    .eq("user_id", userId)
    .eq("context", "morning")
    .eq("sex", sex)
    .order("logged_at", { ascending: true });

  if (!morningLogs || morningLogs.length === 0) {
    await supabase.from("weight_trend").delete().eq("user_id", userId).eq("sex", sex);
    return;
  }

  const byDate: Record<string, number[]> = {};
  for (const log of morningLogs) {
    const d = log.date || (log.logged_at as string).split("T")[0];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(Number(log.weight));
  }

  const dailyAvg = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, weights]) => ({
      date,
      weight: weights.reduce((a, b) => a + b, 0) / weights.length,
    }));

  const emaEntries = computeEMA(dailyAvg);

  const rows = emaEntries.map((e) => ({
    user_id: userId,
    date: e.date,
    raw_kg: e.raw_kg,
    ema_kg: e.ema_kg,
    sex,
  }));

  await supabase.from("weight_trend").delete().eq("user_id", userId).eq("sex", sex);
  if (rows.length > 0) {
    await supabase.from("weight_trend").insert(rows);
  }
}
