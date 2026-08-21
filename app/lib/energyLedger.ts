const KCAL_PER_KG = 7700;

export type DailyBalance = {
  date: string;
  intake: number;
  target: number;
  net: number;
  cumulative: number;
};

export function buildLedger(
  dailyIntakes: { date: string; kcal: number }[],
  targetKcal: number
): DailyBalance[] {
  const sorted = [...dailyIntakes].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  return sorted.map((d) => {
    const net = d.kcal - targetKcal;
    cumulative += net;
    return { date: d.date, intake: d.kcal, target: targetKcal, net, cumulative };
  });
}

export function projectWeightChange(cumulativeKcal: number): number {
  return Math.round((cumulativeKcal / KCAL_PER_KG) * 100) / 100;
}

export function projectWeightAtDate(
  currentKg: number,
  avgDailyNet: number,
  daysRemaining: number
): number {
  const totalNet = avgDailyNet * daysRemaining;
  return Math.round((currentKg + totalNet / KCAL_PER_KG) * 10) / 10;
}

export function daysUntil(targetDate: string): number {
  const target = new Date(targetDate + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export function avgDailyNet(ledger: DailyBalance[]): number {
  if (ledger.length === 0) return 0;
  return Math.round(ledger.reduce((s, d) => s + d.net, 0) / ledger.length);
}
