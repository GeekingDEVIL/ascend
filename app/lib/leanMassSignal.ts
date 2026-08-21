export type LeanMassSignal = {
  signal: "favorable" | "neutral" | "concerning";
  weightTrend: "falling" | "stable" | "rising";
  strengthTrend: "falling" | "stable" | "rising";
  message: string;
};

export function assessLeanMassSignal(params: {
  weightTrend: { date: string; ema_kg: number }[];
  strengthData: { date: string; estimated1rm: number }[];
  windowDays?: number;
}): LeanMassSignal {
  const { weightTrend, strengthData, windowDays = 28 } = params;

  if (weightTrend.length < 7 || strengthData.length < 2) {
    return { signal: "neutral", weightTrend: "stable", strengthTrend: "stable", message: "Not enough data to assess body composition signal." };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const recentWeights = weightTrend.filter((w) => w.date >= cutoffStr);
  const recentStrength = strengthData.filter((s) => s.date >= cutoffStr);

  if (recentWeights.length < 3 || recentStrength.length < 2) {
    return { signal: "neutral", weightTrend: "stable", strengthTrend: "stable", message: "Not enough recent data." };
  }

  const wStart = recentWeights[0].ema_kg;
  const wEnd = recentWeights[recentWeights.length - 1].ema_kg;
  const wDelta = wEnd - wStart;
  const wPct = (wDelta / wStart) * 100;

  const sStart = recentStrength[0].estimated1rm;
  const sEnd = recentStrength[recentStrength.length - 1].estimated1rm;
  const sDelta = sEnd - sStart;
  const sPct = sStart > 0 ? (sDelta / sStart) * 100 : 0;

  const wTrend: "falling" | "stable" | "rising" = wPct < -0.5 ? "falling" : wPct > 0.5 ? "rising" : "stable";
  const sTrend: "falling" | "stable" | "rising" = sPct < -2 ? "falling" : sPct > 2 ? "rising" : "stable";

  let signal: "favorable" | "neutral" | "concerning" = "neutral";
  let message = "";

  if (wTrend === "falling" && (sTrend === "stable" || sTrend === "rising")) {
    signal = "favorable";
    message = `Weight down ${Math.abs(Math.round(wDelta * 10) / 10)} kg while strength is ${sTrend === "rising" ? "increasing" : "holding steady"}. Loss is likely disproportionately fat — excellent sign.`;
  } else if (wTrend === "falling" && sTrend === "falling") {
    signal = "concerning";
    message = `Both weight (${Math.round(wDelta * 10) / 10} kg) and strength (${Math.round(sPct)}%) are declining. Consider reducing deficit or increasing protein to preserve muscle.`;
  } else if (wTrend === "stable" && sTrend === "rising") {
    signal = "favorable";
    message = `Weight stable while strength is up ${Math.round(sPct)}%. Consistent with body recomposition — gaining muscle while losing fat.`;
  } else if (wTrend === "rising" && sTrend === "rising") {
    signal = "favorable";
    message = `Weight up ${Math.round(wDelta * 10) / 10} kg with strength up ${Math.round(sPct)}%. Likely productive muscle gain.`;
  } else {
    message = `Weight ${wTrend}, strength ${sTrend}. No strong body composition signal in either direction.`;
  }

  return { signal, weightTrend: wTrend, strengthTrend: sTrend, message };
}
