import { type LeanMassSignal, assessLeanMassSignal } from "./leanMassSignal";
import type { Sex } from "./calorieEngine";

export type RecompAssessment = {
  weightStable: boolean;
  strengthUp: boolean;
  weeksTracked: number;
  successScore: number;
  leanMassSignal: LeanMassSignal;
  message: string;
};

export function assessRecomp(params: {
  weightTrend: { date: string; ema_kg: number }[];
  strengthData: { date: string; estimated1rm: number }[];
  windowDays?: number;
  sex?: Sex | null;
}): RecompAssessment {
  const windowDays = params.windowDays ?? 28;
  const leanMassSignal = assessLeanMassSignal({ ...params, windowDays, sex: params.sex });

  const weeksTracked = Math.round(windowDays / 7);
  const weightStable = leanMassSignal.weightTrend === "stable";
  const strengthUp = leanMassSignal.strengthTrend === "rising";

  let successScore = 0;
  if (weightStable) successScore += 40;
  if (leanMassSignal.weightTrend === "falling") successScore += 20;
  if (strengthUp) successScore += 50;
  if (leanMassSignal.strengthTrend === "stable") successScore += 25;
  successScore = Math.min(100, successScore);

  let message: string;
  if (weightStable && strengthUp) {
    message = "Textbook recomposition — weight stable, strength increasing. You're building muscle and losing fat simultaneously.";
  } else if (weightStable && leanMassSignal.strengthTrend === "stable") {
    message = "Weight and strength both stable. Consider progressive overload in training or a slight calorie increase to drive adaptation.";
  } else if (leanMassSignal.weightTrend === "falling" && strengthUp) {
    message = "Even better than recomp — you're losing weight while getting stronger. Loss is likely fat-dominant.";
  } else if (leanMassSignal.weightTrend === "rising" && strengthUp) {
    message = "Weight rising with strength — you may be in a slight surplus. This builds muscle but isn't recomp. Adjust intake if staying lean is the goal.";
  } else {
    message = leanMassSignal.message;
  }

  return { weightStable, strengthUp, weeksTracked, successScore, leanMassSignal, message };
}
