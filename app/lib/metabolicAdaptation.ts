export type AdaptationSignal = {
  detected: boolean;
  tdeeDrop: number;
  overWeeks: number;
  message: string;
  suggestDietBreak: boolean;
};

export function detectAdaptation(params: {
  tdeeEstimates: { computed_at: string; observed_tdee: number }[];
  minWeeks?: number;
  significantDropKcal?: number;
}): AdaptationSignal {
  const { tdeeEstimates, minWeeks = 4, significantDropKcal = 100 } = params;

  if (tdeeEstimates.length < 2) {
    return { detected: false, tdeeDrop: 0, overWeeks: 0, message: "Not enough estimates to detect adaptation.", suggestDietBreak: false };
  }

  const sorted = [...tdeeEstimates].sort((a, b) => a.computed_at.localeCompare(b.computed_at));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const weeksBetween = Math.round(
    (new Date(last.computed_at).getTime() - new Date(first.computed_at).getTime()) / (7 * 86400000)
  );

  if (weeksBetween < minWeeks) {
    return { detected: false, tdeeDrop: 0, overWeeks: weeksBetween, message: `Only ${weeksBetween} weeks of data — need ${minWeeks}+ to detect adaptation.`, suggestDietBreak: false };
  }

  const tdeeDrop = first.observed_tdee - last.observed_tdee;

  if (tdeeDrop < significantDropKcal) {
    return { detected: false, tdeeDrop, overWeeks: weeksBetween, message: "No significant metabolic adaptation detected.", suggestDietBreak: false };
  }

  const suggestDietBreak = tdeeDrop >= 150 && weeksBetween >= 6;

  return {
    detected: true,
    tdeeDrop,
    overWeeks: weeksBetween,
    message: `Observed TDEE has dropped ${tdeeDrop} kcal over ${weeksBetween} weeks. ${suggestDietBreak ? "A 7-14 day diet break at maintenance may help restore metabolic rate." : "Monitor closely."}`,
    suggestDietBreak,
  };
}
