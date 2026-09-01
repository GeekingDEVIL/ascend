export type ExerciseBenchmark = {
  exerciseId: string;
  exerciseName: string;
  bodySegment: string;
  currentE1rm: number;
  previousE1rm: number;
  changePercent: number;
  currentBestWeight: number;
  previousBestWeight: number;
  currentSessions: number;
  previousSessions: number;
  trend: "up" | "down" | "stable";
};

export type StrengthBenchmarkResult = {
  period: string;
  exercises: ExerciseBenchmark[];
  totalUp: number;
  totalDown: number;
  totalStable: number;
  strongestGain: ExerciseBenchmark | null;
  biggestDrop: ExerciseBenchmark | null;
};

type SetLogInput = {
  exercise_id: string;
  exercise_name: string;
  body_segment: string;
  weight: number;
  reps: number;
  completed_at: string;
};

function e1rm(w: number, r: number): number {
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return w * (1 + r / 30);
}

export function buildStrengthBenchmark(
  setLogs: SetLogInput[],
  daysBack: number = 30,
): StrengthBenchmarkResult | null {
  if (setLogs.length === 0) return null;

  const now = new Date();
  const currentStart = new Date(now.getTime() - daysBack * 86400000);
  const previousStart = new Date(currentStart.getTime() - daysBack * 86400000);

  const currentLogs = setLogs.filter((l) => {
    const d = new Date(l.completed_at);
    return d >= currentStart && d <= now;
  });

  const previousLogs = setLogs.filter((l) => {
    const d = new Date(l.completed_at);
    return d >= previousStart && d < currentStart;
  });

  if (currentLogs.length === 0 || previousLogs.length === 0) return null;

  type Best = { e1rm: number; bestWeight: number; sessions: Set<string>; name: string; segment: string };
  const aggregate = (logs: SetLogInput[]) => {
    const map = new Map<string, Best>();
    for (const l of logs) {
      const val = e1rm(Number(l.weight), Number(l.reps));
      if (val <= 0) continue;
      let b = map.get(l.exercise_id);
      if (!b) {
        b = { e1rm: 0, bestWeight: 0, sessions: new Set(), name: l.exercise_name, segment: l.body_segment };
        map.set(l.exercise_id, b);
      }
      if (val > b.e1rm) b.e1rm = val;
      if (Number(l.weight) > b.bestWeight) b.bestWeight = Number(l.weight);
      b.sessions.add(l.completed_at.slice(0, 10));
    }
    return map;
  };

  const currentBest = aggregate(currentLogs);
  const previousBest = aggregate(previousLogs);

  const exercises: ExerciseBenchmark[] = [];
  for (const [eid, cur] of currentBest) {
    const prev = previousBest.get(eid);
    if (!prev) continue;
    const changePct = prev.e1rm > 0 ? Math.round(((cur.e1rm - prev.e1rm) / prev.e1rm) * 1000) / 10 : 0;
    const trend: "up" | "down" | "stable" = changePct > 2 ? "up" : changePct < -2 ? "down" : "stable";
    exercises.push({
      exerciseId: eid,
      exerciseName: cur.name,
      bodySegment: cur.segment,
      currentE1rm: Math.round(cur.e1rm * 10) / 10,
      previousE1rm: Math.round(prev.e1rm * 10) / 10,
      changePercent: changePct,
      currentBestWeight: cur.bestWeight,
      previousBestWeight: prev.bestWeight,
      currentSessions: cur.sessions.size,
      previousSessions: prev.sessions.size,
      trend,
    });
  }

  exercises.sort((a, b) => b.changePercent - a.changePercent);

  const totalUp = exercises.filter((e) => e.trend === "up").length;
  const totalDown = exercises.filter((e) => e.trend === "down").length;
  const totalStable = exercises.filter((e) => e.trend === "stable").length;
  const strongestGain = exercises.length > 0 && exercises[0].trend === "up" ? exercises[0] : null;
  const biggestDrop = exercises.length > 0 && exercises[exercises.length - 1].trend === "down" ? exercises[exercises.length - 1] : null;

  const label = daysBack === 30 ? "This month vs last month" : daysBack === 90 ? "This quarter vs last" : `Last ${daysBack}d vs prior ${daysBack}d`;

  return {
    period: label,
    exercises,
    totalUp,
    totalDown,
    totalStable,
    strongestGain,
    biggestDrop,
  };
}
