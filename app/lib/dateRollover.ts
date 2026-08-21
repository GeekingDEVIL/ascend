const ROLLOVER_HOUR = 4;

export function getEffectiveDate(timestamp?: Date): string {
  const d = timestamp ?? new Date();
  const shifted = new Date(d.getTime() - ROLLOVER_HOUR * 3600000);
  return shifted.toISOString().split("T")[0];
}

export function getEffectiveDateRange(date: string): { start: string; end: string } {
  return {
    start: `${date}T0${ROLLOVER_HOUR}:00:00`,
    end: nextDay(date) + `T0${ROLLOVER_HOUR}:00:00`,
  };
}

function nextDay(date: string): string {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
