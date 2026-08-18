// XP required to go from level N to level N+1
// Base: 100 XP, grows 4% per level
// Level 1→2: 100 XP (first workout ~160 XP → instant Level 2)
// Level 10→11: 142 XP
// Level 50→51: 711 XP
// Level 100→101: 5,050 XP
// Max level: 150

const MAX_LEVEL = 150;
const BASE_XP = 100;
const GROWTH_RATE = 1.04;

export function xpForLevel(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.floor(BASE_XP * Math.pow(GROWTH_RATE, level - 1));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export type LevelInfo = {
  level: number;
  totalXp: number;
  xpIntoCurrentLevel: number;
  xpNeededForNext: number;
  progress: number; // 0-1
  isMaxLevel: boolean;
};

export function computeLevel(totalXp: number): LevelInfo {
  let level = 1;
  let accumulated = 0;

  while (level < MAX_LEVEL) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXp) {
      return {
        level,
        totalXp,
        xpIntoCurrentLevel: totalXp - accumulated,
        xpNeededForNext: needed,
        progress: (totalXp - accumulated) / needed,
        isMaxLevel: false,
      };
    }
    accumulated += needed;
    level++;
  }

  return {
    level: MAX_LEVEL,
    totalXp,
    xpIntoCurrentLevel: totalXp - accumulated,
    xpNeededForNext: 0,
    progress: 1,
    isMaxLevel: true,
  };
}

// Rank tiers based on level (original system, not copied from any game)
export type RankTier = {
  name: string;
  color: string;       // tailwind text color
  border: string;      // tailwind border color
  glow: string;        // rgba for box-shadow
  bgClass: string;     // tailwind bg for badges
  minLevel: number;
};

const RANK_TIERS: RankTier[] = [
  { name: "INITIATE",     color: "text-stone-400",   border: "border-stone-400/40",   glow: "rgba(168,162,158,0.4)", bgClass: "bg-stone-400/10",   minLevel: 1   },
  { name: "IRON",         color: "text-amber-600",   border: "border-amber-600/40",   glow: "rgba(217,119,6,0.4)",   bgClass: "bg-amber-600/10",   minLevel: 5   },
  { name: "BRONZE",       color: "text-amber-500",   border: "border-amber-500/40",   glow: "rgba(245,158,11,0.5)",  bgClass: "bg-amber-500/10",   minLevel: 10  },
  { name: "SILVER",       color: "text-slate-300",   border: "border-slate-300/40",   glow: "rgba(203,213,225,0.5)", bgClass: "bg-slate-300/10",   minLevel: 20  },
  { name: "GOLD",         color: "text-yellow-300",  border: "border-yellow-300/40",  glow: "rgba(253,224,71,0.5)",  bgClass: "bg-yellow-300/10",  minLevel: 35  },
  { name: "PLATINUM",     color: "text-cyan-200",    border: "border-cyan-200/40",    glow: "rgba(165,243,252,0.5)", bgClass: "bg-cyan-200/10",    minLevel: 50  },
  { name: "DIAMOND",      color: "text-blue-300",    border: "border-blue-300/40",    glow: "rgba(147,197,253,0.6)", bgClass: "bg-blue-300/10",    minLevel: 70  },
  { name: "MASTER",       color: "text-purple-300",  border: "border-purple-300/40",  glow: "rgba(216,180,254,0.6)", bgClass: "bg-purple-300/10",  minLevel: 90  },
  { name: "GRANDMASTER",  color: "text-pink-300",    border: "border-pink-300/40",    glow: "rgba(249,168,212,0.6)", bgClass: "bg-pink-300/10",    minLevel: 110 },
  { name: "LEGEND",       color: "text-red-400",     border: "border-red-400/40",     glow: "rgba(248,113,113,0.6)", bgClass: "bg-red-400/10",     minLevel: 130 },
  { name: "MYTHIC",       color: "text-orange-300",  border: "border-orange-300/50",  glow: "rgba(253,186,116,0.7)", bgClass: "bg-orange-300/10",  minLevel: 145 },
  { name: "TRANSCENDENT", color: "text-white",       border: "border-white/50",       glow: "rgba(255,255,255,0.6)", bgClass: "bg-white/10",       minLevel: 150 },
];

export function getRank(level: number): RankTier {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel) rank = tier;
  }
  return rank;
}

export function getNextRank(level: number): RankTier | null {
  const current = getRank(level);
  const idx = RANK_TIERS.indexOf(current);
  return idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
}

export { MAX_LEVEL, RANK_TIERS };