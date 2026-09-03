import { supabase } from "./supabase";

export type HabitAutoSource = "workout_complete" | "water_goal" | "weight_logged";

export async function autoCompleteHabits(userId: string, source: HabitAutoSource) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data: habits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", userId)
    .eq("auto_source", source)
    .eq("archived", false);

  if (!habits?.length) return;

  for (const habit of habits) {
    const { data: existing } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("habit_id", habit.id)
      .eq("completed_date", today)
      .maybeSingle();

    if (!existing) {
      await supabase.from("habit_completions").insert({
        habit_id: habit.id,
        user_id: userId,
        completed_date: today,
      });
    }
  }
}
