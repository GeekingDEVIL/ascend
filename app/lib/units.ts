const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * LBS_TO_KG * 10) / 10;
}

export function formatWeight(kg: number, unit: "kg" | "lbs", decimals = 1): string {
  const val = unit === "lbs" ? kgToLbs(kg) : kg;
  return decimals === 0 ? Math.round(val).toLocaleString() : Number(val.toFixed(decimals)).toLocaleString();
}

export function formatWeightUnit(unit: "kg" | "lbs"): string {
  return unit;
}

export function weightInputToKg(value: number, unit: "kg" | "lbs"): number {
  return unit === "lbs" ? lbsToKg(value) : value;
}

export function kgToUnit(kg: number, unit: "kg" | "lbs"): number {
  return unit === "lbs" ? kgToLbs(kg) : kg;
}

export function rateLabel(unit: "kg" | "lbs"): string {
  return `${unit}/week`;
}
