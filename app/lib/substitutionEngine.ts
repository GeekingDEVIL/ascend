import { supabase } from "./supabase";

type Exercise = {
  id: string;
  name: string;
  body_segment: string;
  primary_muscle: string;
  secondary_muscles: string[];
  movement_pattern: string;
  equipment: string;
  category: string;
  difficulty: string;
};

export type Substitution = {
  exercise: Exercise;
  score: number;
  reason: string;
};

const MOVEMENT_PATTERN_GROUPS: Record<string, string[]> = {
  "Horizontal Push": ["Horizontal Push", "Vertical Push"],
  "Vertical Push": ["Vertical Push", "Horizontal Push"],
  "Horizontal Pull": ["Horizontal Pull", "Vertical Pull"],
  "Vertical Pull": ["Vertical Pull", "Horizontal Pull"],
  "Hip Hinge": ["Hip Hinge", "Squat"],
  Squat: ["Squat", "Hip Hinge"],
  "Knee Flexion": ["Knee Flexion", "Squat"],
  "Knee Extension": ["Knee Extension", "Squat"],
  Isolation: ["Isolation"],
  Compound: ["Compound"],
};

const EQUIPMENT_SIMILARITY: Record<string, string[]> = {
  Barbell: ["Dumbbell", "Kettlebell", "Cable", "Machine"],
  Dumbbell: ["Barbell", "Kettlebell", "Cable", "Machine"],
  Cable: ["Machine", "Resistance Band", "Dumbbell"],
  Machine: ["Cable", "Dumbbell", "Barbell"],
  Kettlebell: ["Dumbbell", "Barbell"],
  "Resistance Band": ["Cable", "Bodyweight"],
};

function scoreSubstitution(original: Exercise, candidate: Exercise): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (candidate.primary_muscle === original.primary_muscle) {
    score += 40;
    reasons.push("same muscle");
  } else if (original.secondary_muscles?.includes(candidate.primary_muscle)) {
    score += 15;
  }

  if (candidate.body_segment === original.body_segment) {
    score += 15;
  }

  if (candidate.movement_pattern === original.movement_pattern) {
    score += 25;
    reasons.push("same movement");
  } else {
    const related = MOVEMENT_PATTERN_GROUPS[original.movement_pattern] ?? [];
    if (related.includes(candidate.movement_pattern)) {
      score += 10;
    }
  }

  if (candidate.category === original.category) {
    score += 10;
    reasons.push(original.category === "Compound" ? "compound" : "isolation");
  }

  if (candidate.difficulty === original.difficulty) {
    score += 5;
  }

  const equipSimilar = EQUIPMENT_SIMILARITY[original.equipment] ?? [];
  const eqIdx = equipSimilar.indexOf(candidate.equipment);
  if (eqIdx !== -1) {
    score += Math.max(1, 5 - eqIdx);
    reasons.push(`uses ${candidate.equipment.toLowerCase()}`);
  } else if (candidate.equipment === "Bodyweight") {
    score += 3;
    reasons.push("bodyweight");
  }

  const reason = reasons.length > 0 ? reasons.slice(0, 2).join(", ") : "similar exercise";
  return { score, reason };
}

let exerciseCache: Exercise[] | null = null;

async function getAllExercises(): Promise<Exercise[]> {
  if (exerciseCache) return exerciseCache;
  const { data } = await supabase.from("exercises").select("id, name, body_segment, primary_muscle, secondary_muscles, movement_pattern, equipment, category, difficulty");
  exerciseCache = (data as Exercise[]) ?? [];
  return exerciseCache;
}

export function clearExerciseCache() {
  exerciseCache = null;
}

export async function findSubstitutions(
  exerciseId: string,
  equipmentAccess: string[],
  opts?: { limit?: number; excludeIds?: Set<string> },
): Promise<Substitution[]> {
  const limit = opts?.limit ?? 5;
  const excludeIds = opts?.excludeIds ?? new Set();

  const all = await getAllExercises();
  const original = all.find((e) => e.id === exerciseId);
  if (!original) return [];

  const ownedSet = new Set([...equipmentAccess, "Bodyweight"]);

  const candidates = all.filter((e) => {
    if (e.id === exerciseId) return false;
    if (excludeIds.has(e.id)) return false;
    if (!ownedSet.has(e.equipment)) return false;
    if (e.primary_muscle !== original.primary_muscle && e.body_segment !== original.body_segment) return false;
    return true;
  });

  const scored: Substitution[] = candidates.map((c) => {
    const { score, reason } = scoreSubstitution(original, c);
    return { exercise: c, score, reason };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
