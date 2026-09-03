import { checkFeasibility, type FeasibilityVerdict } from "./energyGuardrails";

const KCAL_PER_KG = 7700;

export type ScenarioResult = {
  dailyTarget: number;
  weeklyDeficit: number;
  rateKgPerWeek: number;
  etaDays: number;
  etaDate: string;
  feasibility: FeasibilityVerdict;
};

export function modelScenario(params: {
  currentKg: number;
  targetKg: number;
  tdee: number;
  bmr: number;
  sex: string;
  heightCm: number;
  goalType: string;
  targetDate?: string | null;
  dailyTarget?: number | null;
}): ScenarioResult {
  const { currentKg, targetKg, tdee, bmr, sex, heightCm, goalType } = params;
  const delta = Math.abs(targetKg - currentKg);
  const isLoss = targetKg < currentKg;

  let dailyTarget: number;
  let etaDays: number;

  if (params.dailyTarget) {
    dailyTarget = params.dailyTarget;
    const dailyNet = Math.abs(tdee - dailyTarget);
    const rateKgWeek = (dailyNet * 7) / KCAL_PER_KG;
    etaDays = rateKgWeek > 0 ? Math.ceil((delta / rateKgWeek) * 7) : 365;
  } else if (params.targetDate) {
    const daysLeft = Math.max(1, Math.round((new Date(params.targetDate).getTime() - new Date().getTime()) / 86400000));
    etaDays = daysLeft;
    const requiredDailyNet = (delta * KCAL_PER_KG) / daysLeft;
    dailyTarget = isLoss ? Math.round(tdee - requiredDailyNet) : Math.round(tdee + requiredDailyNet);
  } else {
    const defaultRate = isLoss ? 0.5 : 0.25;
    const dailyNet = (defaultRate * KCAL_PER_KG) / 7;
    dailyTarget = isLoss ? Math.round(tdee - dailyNet) : Math.round(tdee + dailyNet);
    etaDays = Math.ceil((delta / defaultRate) * 7);
  }

  const weeklyDeficit = Math.abs(tdee - dailyTarget) * 7;
  const rateKgPerWeek = Math.round((weeklyDeficit / KCAL_PER_KG) * 100) / 100;
  const etaDate = new Date();
  etaDate.setDate(etaDate.getDate() + etaDays);

  const feasibility = checkFeasibility({
    currentKg,
    targetKg,
    targetDate: `${etaDate.getFullYear()}-${String(etaDate.getMonth() + 1).padStart(2, "0")}-${String(etaDate.getDate()).padStart(2, "0")}`,
    tdee,
    bmr,
    sex,
    heightCm,
    goalType,
  });

  return {
    dailyTarget,
    weeklyDeficit,
    rateKgPerWeek,
    etaDays,
    etaDate: `${etaDate.getFullYear()}-${String(etaDate.getMonth() + 1).padStart(2, "0")}-${String(etaDate.getDate()).padStart(2, "0")}`,
    feasibility,
  };
}
