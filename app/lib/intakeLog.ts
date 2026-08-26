import { supabase } from "./supabase";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_SLOTS: { value: MealSlot; label: string }[] = [
  { value: "breakfast", label: "BREAKFAST" },
  { value: "lunch", label: "LUNCH" },
  { value: "dinner", label: "DINNER" },
  { value: "snack", label: "SNACK" },
];

export type FoodEntry = {
  id: string;
  date: string;
  meal_slot: MealSlot;
  label: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
};

export type DailyIntakeSummary = {
  date: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  entry_count: number;
};

export async function rematerializeDailyIntake(userId: string, date: string, sex: string = "male"): Promise<void> {
  const { data: entries } = await supabase
    .from("food_entries")
    .select("kcal, protein_g, carbs_g, fat_g")
    .eq("user_id", userId)
    .eq("date", date)
    .eq("sex", sex);

  type DayTotals = { kcal: number; protein_g: number; carbs_g: number; fat_g: number; entry_count: number };
  const totals = (entries ?? []).reduce<DayTotals>(
    (acc, e: any) => ({
      kcal: acc.kcal + (Number(e.kcal) || 0),
      protein_g: acc.protein_g + (Number(e.protein_g) || 0),
      carbs_g: acc.carbs_g + (Number(e.carbs_g) || 0),
      fat_g: acc.fat_g + (Number(e.fat_g) || 0),
      entry_count: acc.entry_count + 1,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, entry_count: 0 }
  );

  if (totals.entry_count === 0) {
    await supabase.from("daily_intake").delete().eq("user_id", userId).eq("date", date).eq("sex", sex);
    return;
  }

  await supabase.from("daily_intake").upsert(
    { user_id: userId, date, sex, ...totals },
    { onConflict: "user_id,date,sex" }
  );
}

export function calcAdherence(
  dailyIntakes: { date: string }[],
  windowDays: number
): number {
  if (windowDays <= 0) return 0;
  const loggedDates = new Set(dailyIntakes.map((d) => d.date));
  const today = new Date();
  let count = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (loggedDates.has(dateStr)) count++;
  }
  return Math.round((count / windowDays) * 100);
}
