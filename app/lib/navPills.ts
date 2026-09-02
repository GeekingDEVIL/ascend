import {
  Dumbbell, Calendar, TrendingUp, HeartPulse, Droplets,
  Trophy, Award, User, Sparkles, Bell, Compass,
  UtensilsCrossed, GlassWater,
  Activity, Swords, Wind,
} from "lucide-react";
import type { NavPill } from "../components/ui/sub-nav-pills";
import type { SwipeSection } from "../components/ui/swipe-nav";
import type { ModuleKey } from "./modules";

type ConditionalPill = NavPill & { module?: ModuleKey; colorRgb?: string };

const trainPillsDef: ConditionalPill[] = [
  { key: "/workout", label: "WORKOUT", icon: Dumbbell, colorRgb: "139 92 246" },
  { key: "/schedule", label: "SCHEDULE", icon: Calendar, colorRgb: "139 92 246" },
  { key: "/running", label: "RUNNING", icon: Activity, module: "running", colorRgb: "249 115 22" },
  { key: "/martial-arts", label: "MARTIAL ARTS", icon: Swords, module: "martial_arts", colorRgb: "239 68 68" },
  { key: "/yoga", label: "YOGA", icon: Wind, module: "yoga", colorRgb: "236 72 153" },
];

const trackPillsDef: ConditionalPill[] = [
  { key: "/progress", label: "PROGRESS", icon: TrendingUp, colorRgb: "16 185 129" },
  { key: "/recovery", label: "RECOVERY", icon: HeartPulse, module: "recovery", colorRgb: "16 185 129" },
  { key: "/nutrition", label: "NUTRITION", icon: UtensilsCrossed, module: "nutrition", colorRgb: "245 158 11" },
  { key: "/cycle", label: "CYCLE", icon: Droplets, module: "cycle", colorRgb: "236 72 153" },
  { key: "/wellness", label: "WELLNESS", icon: GlassWater, module: "wellness", colorRgb: "16 185 129" },
];

const socialPillsDef: ConditionalPill[] = [
  { key: "/rankings", label: "RANKINGS", icon: Trophy, colorRgb: "59 130 246" },
  { key: "/achievements", label: "ACHIEVEMENTS", icon: Award, colorRgb: "59 130 246" },
];

const youPillsDef: ConditionalPill[] = [
  { key: "/profile", label: "PROFILE", icon: User, colorRgb: "34 211 238" },
  { key: "/coach", label: "AI COACH", icon: Sparkles, module: "ai_coach", colorRgb: "20 184 166" },
  { key: "/notifications", label: "ALERTS", icon: Bell, colorRgb: "34 211 238" },
  { key: "/discover", label: "DISCOVER", icon: Compass, colorRgb: "34 211 238" },
];

function filterPills(
  pills: ConditionalPill[],
  enabledKeys: ModuleKey[],
): NavPill[] {
  return pills
    .filter((p) => !p.module || enabledKeys.includes(p.module))
    .map(({ module: _, ...pill }) => pill);
}

export function getTrainPills(enabledKeys: ModuleKey[]): NavPill[] {
  return filterPills(trainPillsDef, enabledKeys);
}

export function getTrackPills(enabledKeys: ModuleKey[]): NavPill[] {
  return filterPills(trackPillsDef, enabledKeys);
}

export function getSocialPills(enabledKeys: ModuleKey[]): NavPill[] {
  return filterPills(socialPillsDef, enabledKeys);
}

export function getYouPills(enabledKeys: ModuleKey[]): NavPill[] {
  return filterPills(youPillsDef, enabledKeys);
}

export function getAllRoutes(enabledKeys: ModuleKey[]): Record<string, string[]> {
  return {
    train: getTrainPills(enabledKeys).map((p) => p.key),
    track: getTrackPills(enabledKeys).map((p) => p.key),
    social: getSocialPills(enabledKeys).map((p) => p.key),
    you: getYouPills(enabledKeys).map((p) => p.key),
  };
}

function toSwipeSections(
  pills: ConditionalPill[],
  enabledKeys: ModuleKey[],
  fallbackColor: string,
): SwipeSection[] {
  return pills
    .filter((p) => !p.module || enabledKeys.includes(p.module))
    .map((p) => ({
      key: p.key,
      label: p.label,
      colorRgb: p.colorRgb ?? fallbackColor,
    }));
}

export function getTrainSections(enabledKeys: ModuleKey[]): SwipeSection[] {
  return toSwipeSections(trainPillsDef, enabledKeys, "139 92 246");
}

export function getTrackSections(enabledKeys: ModuleKey[]): SwipeSection[] {
  return toSwipeSections(trackPillsDef, enabledKeys, "16 185 129");
}

export function getSocialSections(enabledKeys: ModuleKey[]): SwipeSection[] {
  return toSwipeSections(socialPillsDef, enabledKeys, "59 130 246");
}

export function getYouSections(enabledKeys: ModuleKey[]): SwipeSection[] {
  return toSwipeSections(youPillsDef, enabledKeys, "34 211 238");
}
