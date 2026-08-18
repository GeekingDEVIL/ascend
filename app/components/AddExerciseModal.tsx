"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabase";

type Exercise = {
  id: string;
  name: string;
  body_segment: string;
  primary_muscle: string;
  secondary_muscles: string[];
  movement_pattern: string;
  equipment: string;
  equipment_type: string;
  category: string;
  difficulty: string;
  is_unilateral: boolean;
};

const BODY_SEGMENTS = ["All", "Chest", "Back", "Shoulders", "Traps", "Biceps", "Triceps", "Forearms", "Core", "Legs", "Glutes", "Full Body", "Cardio"];
const EQUIPMENT = ["All", "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Kettlebell", "Resistance Band", "Other"];
const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-mono transition ${
        active ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-200" : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar" style={{ maskImage: "linear-gradient(to right, black 92%, transparent 100%)" }}>
      {children}
    </div>
  );
}

function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "muted" }) {
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${variant === "default" ? "bg-cyan-400/10 text-cyan-300 border-cyan-400/20" : "bg-white/5 text-white/40 border-white/10"}`}>
      {children}
    </span>
  );
}

function scoreMatch(ex: Exercise, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  const name = ex.name.toLowerCase();
  const haystack = [ex.name, ex.primary_muscle, ex.body_segment, ex.equipment, ex.movement_pattern, ...(ex.secondary_muscles || [])].join(" ").toLowerCase();
  let score = 0;
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 60;
  else if (name.includes(q)) score += 30;
  for (const w of words) {
    if (name.includes(w)) score += 10;
    else if (haystack.includes(w)) score += 4;
  }
  return score;
}

export default function AddExerciseModal({
  onAdd,
  onClose,
  existingIds,
}: {
  onAdd: (exercise: Exercise) => void;
  onClose: () => void;
  existingIds?: Set<string>;
}) {
  const [mounted, setMounted] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [bodySegment, setBodySegment] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [bodySegment, equipment, difficulty].filter((f) => f !== "All").length;

  useEffect(() => {
    setMounted(true);
    async function load() {
      const { data } = await supabase.from("exercises").select("*").order("name");
      setExercises((data as Exercise[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const base = exercises.filter((ex) => {
      const matchesSegment = bodySegment === "All" || ex.body_segment === bodySegment;
      const matchesEquipment = equipment === "All" || ex.equipment === equipment;
      const matchesDifficulty = difficulty === "All" || ex.difficulty === difficulty;
      return matchesSegment && matchesEquipment && matchesDifficulty;
    });
    if (!query.trim()) return base;
    return base.map((ex) => ({ ex, score: scoreMatch(ex, query) })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.ex);
  }, [exercises, query, bodySegment, equipment, difficulty]);

  function handleAdd(ex: Exercise) {
    onAdd(ex);
    setJustAdded(ex.id);
    setTimeout(() => setJustAdded(null), 1200);
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-6">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.25); border-radius: 999px; }
      `}</style>
      <div className="pointer-events-none fixed top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[130px]" />

      <div
        className="relative w-full md:max-w-xl h-[90vh] md:h-[85vh] rounded-t-2xl md:rounded-md border border-cyan-400/25 bg-[#0a1120]/95 backdrop-blur-2xl flex flex-col overflow-hidden"
        style={{ boxShadow: "0 0 60px -12px rgba(34,211,238,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-400/10 shrink-0">
          <div>
            <p className="font-bold text-white/90">Add Exercise</p>
            <p className="text-[10px] font-mono text-white/30 mt-0.5">{filtered.length} results</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-white/40 hover:text-white/80 hover:border-white/20 transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 shrink-0 border-b border-cyan-400/10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full rounded-md bg-white/[0.04] border border-cyan-400/20 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 transition"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`shrink-0 flex items-center gap-1.5 rounded-md border px-3 text-xs font-mono transition ${
                activeFilterCount > 0 || showFilters ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              <SlidersHorizontal size={14} />
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
              )}
              <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showFilters && (
            <div className="space-y-2.5 pt-1">
              <div>
                <p className="text-[9px] font-mono tracking-widest text-cyan-300/60 mb-1.5">BODY SEGMENT</p>
                <ChipRow>{BODY_SEGMENTS.map((s) => <Chip key={s} active={bodySegment === s} onClick={() => setBodySegment(s)}>{s}</Chip>)}</ChipRow>
              </div>
              <div>
                <p className="text-[9px] font-mono tracking-widest text-cyan-300/60 mb-1.5">EQUIPMENT</p>
                <ChipRow>{EQUIPMENT.map((eq) => <Chip key={eq} active={equipment === eq} onClick={() => setEquipment(eq)}>{eq}</Chip>)}</ChipRow>
              </div>
              <div>
                <p className="text-[9px] font-mono tracking-widest text-cyan-300/60 mb-1.5">DIFFICULTY</p>
                <ChipRow>{DIFFICULTIES.map((d) => <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>{d}</Chip>)}</ChipRow>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-5 py-4 pb-24 space-y-2.5">
          {loading && <p className="text-center text-white/40 text-sm py-10">Loading...</p>}
          {!loading && filtered.length === 0 && <p className="text-center text-white/40 text-sm py-10">No exercises match your search.</p>}
          {filtered.map((ex) => {
            const alreadyInDay = existingIds?.has(ex.id);
            return (
              <div key={ex.id} className="flex items-center justify-between gap-3 rounded-md border border-cyan-400/15 bg-white/[0.03] px-4 py-3.5 hover:border-cyan-400/35 hover:bg-white/[0.05] transition">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white/90 mb-1.5">{ex.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Tag>{ex.primary_muscle}</Tag>
                    <Tag variant="muted">{ex.equipment}</Tag>
                    <Tag variant="muted">{ex.category}</Tag>
                  </div>
                </div>
                <button
                  onClick={() => !alreadyInDay && handleAdd(ex)}
                  disabled={alreadyInDay}
                  className={`shrink-0 rounded-md text-xs font-bold px-4 py-2.5 transition ${
                    alreadyInDay ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed" : "bg-cyan-400 text-black hover:bg-cyan-300"
                  }`}
                  style={!alreadyInDay ? { boxShadow: "0 0 16px -3px rgba(34,211,238,0.6)" } : undefined}
                >
                  {alreadyInDay ? "Added" : justAdded === ex.id ? "Added ✓" : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}