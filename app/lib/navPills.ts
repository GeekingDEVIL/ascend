import {
  Dumbbell, Calendar, TrendingUp, HeartPulse, Droplets,
  Trophy, Award, User, Sparkles, Bell,
} from "lucide-react";
import type { NavPill } from "../components/ui/sub-nav-pills";

export const trainPills: NavPill[] = [
  { key: "/workout", label: "WORKOUT", icon: Dumbbell },
  { key: "/schedule", label: "SCHEDULE", icon: Calendar },
];

export const trackPillsBase: NavPill[] = [
  { key: "/progress", label: "PROGRESS", icon: TrendingUp },
  { key: "/recovery", label: "RECOVERY", icon: HeartPulse },
];

export const cyclePill: NavPill = { key: "/cycle", label: "CYCLE", icon: Droplets };

export function getTrackPills(isFemale: boolean): NavPill[] {
  return isFemale ? [...trackPillsBase, cyclePill] : trackPillsBase;
}

export const socialPills: NavPill[] = [
  { key: "/rankings", label: "RANKINGS", icon: Trophy },
  { key: "/achievements", label: "ACHIEVEMENTS", icon: Award },
];

export const youPills: NavPill[] = [
  { key: "/profile", label: "PROFILE", icon: User },
  { key: "/coach", label: "AI COACH", icon: Sparkles },
  { key: "/notifications", label: "ALERTS", icon: Bell },
];
