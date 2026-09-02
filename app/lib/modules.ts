import {
  Dumbbell, TrendingUp, Zap, UtensilsCrossed, Droplets,
  HeartPulse, Sparkles, Users, Swords, Wind, Activity,
  GlassWater, type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "gym" | "progress" | "xp"
  | "nutrition" | "cycle" | "recovery"
  | "ai_coach" | "social"
  | "running" | "martial_arts" | "yoga"
  | "wellness";

export type ModuleDef = {
  key: ModuleKey;
  name: string;
  description: string;
  icon: LucideIcon;
  colorRgb: string;
  domain: string;
  core: boolean;
  phase: number;
  sexGate?: "male" | "female";
};

export const MODULE_REGISTRY: Record<ModuleKey, ModuleDef> = {
  gym: {
    key: "gym",
    name: "Training",
    description: "Workout logging, schedule, exercise database, templates",
    icon: Dumbbell,
    colorRgb: "139 92 246",
    domain: "train",
    core: true,
    phase: 0,
  },
  progress: {
    key: "progress",
    name: "Progress",
    description: "Body weight trends, strength charts, measurements, PRs",
    icon: TrendingUp,
    colorRgb: "16 185 129",
    domain: "track",
    core: true,
    phase: 0,
  },
  xp: {
    key: "xp",
    name: "XP & Leveling",
    description: "Experience points, levels, ranks, achievements, streaks",
    icon: Zap,
    colorRgb: "34 211 238",
    domain: "social",
    core: true,
    phase: 0,
  },
  nutrition: {
    key: "nutrition",
    name: "Nutrition",
    description: "Calorie tracking, macros, TDEE, meal logging",
    icon: UtensilsCrossed,
    colorRgb: "245 158 11",
    domain: "track",
    core: false,
    phase: 0,
  },
  cycle: {
    key: "cycle",
    name: "Cycle Tracker",
    description: "Menstrual cycle logging, phase predictions, symptoms",
    icon: Droplets,
    colorRgb: "236 72 153",
    domain: "track",
    core: false,
    phase: 0,
    sexGate: "female",
  },
  recovery: {
    key: "recovery",
    name: "Recovery",
    description: "Muscle recovery tracking, training load, fatigue monitoring",
    icon: HeartPulse,
    colorRgb: "16 185 129",
    domain: "track",
    core: false,
    phase: 0,
  },
  ai_coach: {
    key: "ai_coach",
    name: "AI Coach",
    description: "AI-powered training guidance and recommendations",
    icon: Sparkles,
    colorRgb: "20 184 166",
    domain: "you",
    core: false,
    phase: 3,
  },
  social: {
    key: "social",
    name: "Social",
    description: "Friends, activity feed, challenges, workout sharing",
    icon: Users,
    colorRgb: "59 130 246",
    domain: "social",
    core: false,
    phase: 2,
  },
  running: {
    key: "running",
    name: "Running",
    description: "GPS run tracking, pace, splits, route history",
    icon: Activity,
    colorRgb: "249 115 22",
    domain: "train",
    core: false,
    phase: 4,
  },
  martial_arts: {
    key: "martial_arts",
    name: "Martial Arts",
    description: "Technique guides for Muay Thai, BJJ, Boxing, Shaolin, Kalaripayattu",
    icon: Swords,
    colorRgb: "239 68 68",
    domain: "train",
    core: false,
    phase: 3,
  },
  yoga: {
    key: "yoga",
    name: "Yoga & Mobility",
    description: "Pose library, flow sequences, flexibility tracking",
    icon: Wind,
    colorRgb: "236 72 153",
    domain: "train",
    core: false,
    phase: 4,
  },
  wellness: {
    key: "wellness",
    name: "Wellness",
    description: "Sleep, mood, habits, hydration, readiness score",
    icon: GlassWater,
    colorRgb: "16 185 129",
    domain: "track",
    core: false,
    phase: 1,
  },
};

export const ALL_MODULES = Object.values(MODULE_REGISTRY);
export const CORE_MODULES = ALL_MODULES.filter((m) => m.core);
export const OPTIONAL_MODULES = ALL_MODULES.filter((m) => !m.core);

export const DEFAULT_ENABLED: ModuleKey[] = [
  "gym", "progress", "xp", "nutrition", "recovery",
];
