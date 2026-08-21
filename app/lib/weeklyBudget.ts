export type WeeklyBudget = {
  weekStart: string;
  weekEnd: string;
  weeklyTarget: number;
  consumed: number;
  remaining: number;
  daysPassed: number;
  daysLeft: number;
  dailyPace: number;
  dailyRemaining: number;
  onTrack: boolean;
};

export function calcWeeklyBudget(params: {
  dailyTarget: number;
  intakes: { date: string; kcal: number }[];
  today?: string;
}): WeeklyBudget {
  const todayStr = params.today ?? new Date().toISOString().split("T")[0];
  const todayDate = new Date(todayStr + "T12:00:00");
  const dayOfWeek = todayDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(todayDate);
  monday.setDate(monday.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];
  const weeklyTarget = params.dailyTarget * 7;

  const weekIntakes = params.intakes.filter((d) => d.date >= weekStart && d.date <= weekEnd);
  const consumed = weekIntakes.reduce((s, d) => s + d.kcal, 0);
  const remaining = Math.max(0, weeklyTarget - consumed);

  const daysPassed = Math.min(7, Math.round((todayDate.getTime() - monday.getTime()) / 86400000) + 1);
  const daysLeft = 7 - daysPassed;
  const dailyPace = daysPassed > 0 ? Math.round(consumed / daysPassed) : 0;
  const dailyRemaining = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;

  const expectedByNow = params.dailyTarget * daysPassed;
  const onTrack = consumed <= expectedByNow * 1.1;

  return { weekStart, weekEnd, weeklyTarget, consumed, remaining, daysPassed, daysLeft, dailyPace, dailyRemaining, onTrack };
}
