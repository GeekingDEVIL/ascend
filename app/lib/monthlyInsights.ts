export type MonthBucket = {
  month: string; // "2026-08"
  label: string; // "Aug 2026"
  workouts: number;
  totalVolume: number;
  totalSets: number;
  totalDuration: number; // seconds
  avgDuration: number;
  prsHit: number;
  uniqueExercises: number;
};

export type MonthlyComparison = {
  current: MonthBucket;
  previous: MonthBucket | null;
  volumeChange: number | null; // percent
  frequencyChange: number | null;
  durationChange: number | null;
  streak: number; // consecutive months with 1+ workout
  bestMonth: MonthBucket | null;
  months: MonthBucket[];
};

type SessionInput = {
  date: string;
  total_volume: number;
  total_sets: number;
  duration_seconds: number;
  xp_earned: number;
};

type SetLogInput = {
  exercise_id: string;
  weight: number;
  reps: number;
  completed_at: string;
};

export function buildMonthlyInsights(
  sessions: SessionInput[],
  setLogs?: SetLogInput[],
): MonthlyComparison | null {
  if (sessions.length === 0) return null;

  const buckets = new Map<string, {
    workouts: number;
    totalVolume: number;
    totalSets: number;
    totalDuration: number;
    exerciseIds: Set<string>;
    prCount: number;
  }>();

  for (const s of sessions) {
    const key = s.date.slice(0, 7);
    let b = buckets.get(key);
    if (!b) {
      b = { workouts: 0, totalVolume: 0, totalSets: 0, totalDuration: 0, exerciseIds: new Set(), prCount: 0 };
      buckets.set(key, b);
    }
    b.workouts++;
    b.totalVolume += Number(s.total_volume) || 0;
    b.totalSets += Number(s.total_sets) || 0;
    b.totalDuration += s.duration_seconds || 0;
  }

  if (setLogs && setLogs.length > 0) {
    const bestByExercise = new Map<string, { e1rm: number; month: string }>();
    for (const log of setLogs) {
      const w = Number(log.weight);
      const r = Number(log.reps);
      if (w <= 0 || r <= 0) continue;
      const e1rm = w * (1 + r / 30);
      const month = (log.completed_at || "").slice(0, 7);
      const eid = log.exercise_id;
      const bucket = buckets.get(month);
      if (bucket) bucket.exerciseIds.add(eid);

      const prev = bestByExercise.get(eid);
      if (!prev || e1rm > prev.e1rm) {
        if (prev && prev.month !== month) {
          const b = buckets.get(month);
          if (b) b.prCount++;
        }
        bestByExercise.set(eid, { e1rm, month });
      }
    }
  }

  const sortedKeys = [...buckets.keys()].sort();
  const months: MonthBucket[] = sortedKeys.map((key) => {
    const b = buckets.get(key)!;
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return {
      month: key,
      label: d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      workouts: b.workouts,
      totalVolume: b.totalVolume,
      totalSets: b.totalSets,
      totalDuration: b.totalDuration,
      avgDuration: b.workouts > 0 ? Math.round(b.totalDuration / b.workouts) : 0,
      prsHit: b.prCount,
      uniqueExercises: b.exerciseIds.size,
    };
  });

  if (months.length === 0) return null;

  const current = months[months.length - 1];
  const previous = months.length >= 2 ? months[months.length - 2] : null;

  const pctChange = (a: number, b: number) => b > 0 ? Math.round(((a - b) / b) * 100) : null;

  let streak = 0;
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  for (let i = months.length - 1; i >= 0; i--) {
    const expected = new Date(now);
    expected.setMonth(expected.getMonth() - (months.length - 1 - i));
    const expectedKey = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}`;
    if (months[i].month === expectedKey && months[i].workouts > 0) streak++;
    else break;
  }

  const bestMonth = months.reduce((best, m) => (m.totalVolume > (best?.totalVolume ?? 0) ? m : best), months[0]);

  return {
    current,
    previous,
    volumeChange: previous ? pctChange(current.totalVolume, previous.totalVolume) : null,
    frequencyChange: previous ? pctChange(current.workouts, previous.workouts) : null,
    durationChange: previous ? pctChange(current.avgDuration, previous.avgDuration) : null,
    streak,
    bestMonth: bestMonth.totalVolume > current.totalVolume ? bestMonth : null,
    months: months.slice(-6),
  };
}
