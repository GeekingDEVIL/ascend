"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSwipeable } from "react-swipeable";
import { X, Star, ChevronLeft, RotateCcw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthProvider";

type Exercise = {
    id: string;
    name: string;
    primary_muscle: string;
    secondary_muscles: string[];
    equipment: string;
    category: string;
    difficulty: string;
    instructions: string | null;
    image_url: string | null;
};

type Region = { muscle: string; label: string; path: string };

const FRONT_REGIONS: Region[] = [
    { muscle: "Shoulders", label: "Shoulders", path: "M 66 100 Q 44 108 38 145 L 52 145 L 64 140 Z" },
    { muscle: "Shoulders", label: "Shoulders", path: "M 174 100 Q 196 108 202 145 L 188 145 L 176 140 Z" },
    { muscle: "Chest", label: "Chest", path: "M 78 70 Q 70 72 66 100 L 64 140 L 176 140 L 174 100 Q 170 72 162 70 Q 140 82 120 82 Q 100 82 78 70 Z" },
    { muscle: "Biceps", label: "Biceps", path: "M 38 145 L 32 195 L 46 195 L 52 145 Z" },
    { muscle: "Biceps", label: "Biceps", path: "M 202 145 L 208 195 L 194 195 L 188 145 Z" },
    { muscle: "Forearms", label: "Forearms", path: "M 32 195 L 30 220 Q 28 234 34 244 L 44 240 Q 40 230 42 218 L 46 195 Z" },
    { muscle: "Forearms", label: "Forearms", path: "M 208 195 L 210 220 Q 212 234 206 244 L 196 240 Q 200 230 198 218 L 194 195 Z" },
    { muscle: "Abs", label: "Abs", path: "M 96 140 L 144 140 L 152 250 L 88 250 Z" },
    { muscle: "Obliques", label: "Obliques", path: "M 64 140 L 96 140 L 88 250 L 78 250 L 66 226 Q 58 210 60 190 Z" },
    { muscle: "Obliques", label: "Obliques", path: "M 176 140 L 144 140 L 152 250 L 162 250 L 174 226 Q 182 210 180 190 Z" },
    { muscle: "Quads", label: "Quads", path: "M 78 250 L 74 340 Q 72 400 76 460 L 74 500 Q 74 512 86 512 Q 96 512 96 500 L 98 462 Q 102 400 106 340 L 108 250 Z" },
    { muscle: "Quads", label: "Quads", path: "M 162 250 L 166 340 Q 168 400 164 460 L 166 500 Q 166 512 154 512 Q 144 512 144 500 L 142 462 Q 138 400 134 340 L 132 250 Z" },
    { muscle: "Adductors", label: "Adductors", path: "M 96 250 L 144 250 L 140 300 Q 120 322 100 300 Z" },
];

const BACK_REGIONS: Region[] = [
    { muscle: "Traps", label: "Traps & Neck", path: "M 78 70 Q 70 72 66 100 L 50 122 L 190 122 L 174 100 Q 170 72 162 70 Q 140 82 120 82 Q 100 82 78 70 Z" },
    { muscle: "Triceps", label: "Triceps", path: "M 66 100 Q 58 112 36 150 L 30 220 Q 28 234 34 244 L 44 240 Q 40 230 42 218 L 50 156 Q 56 122 74 108 Z" },
    { muscle: "Triceps", label: "Triceps", path: "M 174 100 Q 182 112 204 150 L 210 220 Q 212 234 206 244 L 196 240 Q 200 230 198 218 L 190 156 Q 184 122 166 108 Z" },
    { muscle: "Lats", label: "Lats", path: "M 66 115 L 100 115 L 94 210 L 66 226 Q 58 210 60 190 Z" },
    { muscle: "Lats", label: "Lats", path: "M 174 115 L 140 115 L 146 210 L 174 226 Q 182 210 180 190 Z" },
    { muscle: "Lower Back", label: "Lower Back", path: "M 100 115 L 140 115 L 146 210 L 152 250 L 88 250 L 94 210 Z" },
    { muscle: "Hamstrings", label: "Hamstrings", path: "M 78 250 L 74 340 Q 73 370 74 400 L 106 400 Q 104 370 106 340 L 108 250 Z" },
    { muscle: "Hamstrings", label: "Hamstrings", path: "M 162 250 L 166 340 Q 167 370 166 400 L 134 400 Q 136 370 134 340 L 132 250 Z" },
    { muscle: "Calves", label: "Calves", path: "M 74 400 Q 72 430 76 460 L 74 500 Q 74 512 86 512 Q 96 512 96 500 L 98 462 Q 102 430 106 400 Z" },
    { muscle: "Calves", label: "Calves", path: "M 166 400 Q 168 430 164 460 L 166 500 Q 166 512 154 512 Q 144 512 144 500 L 142 462 Q 138 430 134 400 Z" },
    { muscle: "Glutes", label: "Glutes", path: "M 96 226 Q 120 246 144 226 L 148 260 Q 120 282 92 260 Z" },
    { muscle: "Abductors", label: "Abductors", path: "M 66 226 Q 60 245 66 262 L 78 258 Q 74 240 78 226 Z" },
    { muscle: "Abductors", label: "Abductors", path: "M 174 226 Q 180 245 174 262 L 162 258 Q 166 240 162 226 Z" },
];

function MuscleRegion({
    region, active, onEnter, onLeave, onSelect,
}: {
    region: Region; active: boolean;
    onEnter: () => void; onLeave: () => void; onSelect: () => void;
}) {
    return (
        <path
            d={region.path}
            className="transition-[fill,opacity] duration-150 cursor-pointer"
            fill={active ? "rgb(var(--accent-rgb) / 0.65)" : "rgb(var(--accent-rgb) / 0.08)"}
            stroke={active ? "rgb(var(--accent-light-rgb))" : "rgb(var(--accent-rgb) / 0.4)"}
            strokeWidth={active ? 1.75 : 1}
            style={active ? { filter: "drop-shadow(0 0 8px rgb(var(--accent-rgb) / 0.8))" } : undefined}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={onSelect}
            onTouchStart={onEnter}
        />
    );
}

export default function MusclePickerModal({ onClose }: { onClose: () => void }) {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [view, setView] = useState<"front" | "back">("front");
    const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!user) return;
        supabase.from("favorite_exercises").select("exercise_id").eq("user_id", user.id).then(({ data }) => {
            if (data) setFavorites(new Set(data.map((f) => f.exercise_id)));
        });
    }, [user]);

    useEffect(() => {
        if (!selectedMuscle) return;
        setLoadingResults(true);
        setExpandedId(null);
        supabase.from("exercises").select("*").eq("primary_muscle", selectedMuscle).order("name").then(({ data }) => {
            setExercises((data as Exercise[]) ?? []);
            setLoadingResults(false);
        });
    }, [selectedMuscle]);

    async function toggleFavorite(exerciseId: string) {
        if (!user) return;
        const isFav = favorites.has(exerciseId);
        setFavorites((prev) => {
            const next = new Set(prev);
            if (isFav) next.delete(exerciseId);
            else next.add(exerciseId);
            return next;
        });
        if (isFav) {
            await supabase.from("favorite_exercises").delete().eq("user_id", user.id).eq("exercise_id", exerciseId);
        } else {
            await supabase.from("favorite_exercises").insert({ user_id: user.id, exercise_id: exerciseId });
        }
    }

    function selectMuscle(muscle: string) {
        setHoveredMuscle(muscle);
        setTimeout(() => setSelectedMuscle(muscle), 180);
    }

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setView("back"),
        onSwipedRight: () => setView("front"),
        trackMouse: false,
        preventScrollOnSwipe: true,
    });

    const regions = view === "front" ? FRONT_REGIONS : BACK_REGIONS;

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-6">
            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgb(var(--accent-rgb) / 0.25); border-radius: 999px; }
      `}</style>
            <div
                className="relative w-full h-full md:h-[85vh] md:max-w-2xl md:rounded-md border border-[rgb(var(--accent-rgb)/0.25)] bg-[#0a1120] md:bg-[#0a1120]/95 backdrop-blur-2xl flex flex-col overflow-hidden"
                style={{ boxShadow: "0 0 70px -12px rgb(var(--accent-rgb) / 0.3)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--accent-rgb)/0.1)] shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        {selectedMuscle && (
                            <button onClick={() => { setSelectedMuscle(null); setHoveredMuscle(null); }} className="shrink-0 text-white/50 hover:text-white/80 transition">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div className="min-w-0">
                            <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.6)]">MUSCLE MAP</p>
                            <h2 className="text-lg font-bold text-white/95 truncate">{selectedMuscle || hoveredMuscle || "Tap a muscle group"}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-white/40 hover:text-white/80 hover:border-white/20 transition">
                        <X size={16} />
                    </button>
                </div>

                {/* DIAGRAM VIEW */}
                {!selectedMuscle && (
                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center py-4">
                        <div {...swipeHandlers} className="relative w-full max-w-xs select-none">
                            <svg viewBox="-10 0 260 530" className="w-full h-auto">
                                <ellipse cx="120" cy="34" rx="22" ry="26" fill="rgb(var(--accent-rgb)/0.08)" stroke="rgb(var(--accent-rgb)/0.4)" strokeWidth="1" />
                                <rect x="110" y="56" width="20" height="14" fill="rgb(var(--accent-rgb)/0.08)" stroke="rgb(var(--accent-rgb)/0.4)" strokeWidth="1" />
                                {regions.map((r, i) => (
                                    <MuscleRegion
                                        key={`${r.muscle}-${i}`}
                                        region={r}
                                        active={hoveredMuscle === r.muscle}
                                        onEnter={() => setHoveredMuscle(r.muscle)}
                                        onLeave={() => setHoveredMuscle((h) => (h === r.muscle ? null : h))}
                                        onSelect={() => selectMuscle(r.muscle)}
                                    />
                                ))}
                            </svg>
                        </div>
                        <button
                            onClick={() => { setView((v) => (v === "front" ? "back" : "front")); setHoveredMuscle(null); }}
                            className="flex items-center gap-2 text-xs font-mono px-4 py-2.5 rounded-md border border-[rgb(var(--accent-rgb)/0.25)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] transition mt-2"
                        >
                            <RotateCcw size={13} /> {view === "front" ? "SHOW BACK" : "SHOW FRONT"}
                        </button>
                        <p className="text-[10px] font-mono text-white/25 mt-2">Swipe or tap to flip · Tap a muscle group to browse exercises</p>
                    </div>
                )}

                {/* RESULTS VIEW */}
                {selectedMuscle && (
                    <div className="flex-1 overflow-y-auto custom-scroll p-4 pb-24">
                        {loadingResults && <p className="text-center text-white/40 text-sm py-10">Loading...</p>}
                        {!loadingResults && exercises.length === 0 && <p className="text-center text-white/40 text-sm py-10">No exercises found for this muscle yet.</p>}
                        <div className="grid grid-cols-2 gap-3">
                            {exercises.map((ex) => {
                                const isFav = favorites.has(ex.id);
                                const isExpanded = expandedId === ex.id;
                                return (
                                    <div key={ex.id} className={`rounded-md border overflow-hidden transition ${isExpanded ? "col-span-2 border-[rgb(var(--accent-rgb)/0.4)]" : "border-[rgb(var(--accent-rgb)/0.15)]"} bg-white/[0.03]`}>
                                        <div role="button" tabIndex={0} onClick={() => setExpandedId(isExpanded ? null : ex.id)} className="w-full text-left cursor-pointer">
                                            <div className="relative aspect-square bg-white/5">
                                                {ex.image_url ? (
                                                    <img src={ex.image_url} alt={ex.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-mono">NO IMAGE</div>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.id); }}
                                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
                                                >
                                                    <Star size={14} className={isFav ? "fill-yellow-400 text-yellow-400" : "text-white/70"} />
                                                </button>
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-xs font-bold text-white/90 leading-tight">{ex.name}</p>
                                                <p className="text-[9px] font-mono text-white/40 mt-1">{ex.equipment} · {ex.difficulty}</p>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
                                                {ex.secondary_muscles?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {ex.secondary_muscles.map((m) => (
                                                            <span key={m} className="text-[9px] font-mono px-2 py-0.5 rounded border bg-white/5 text-white/50 border-white/10">{m}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {ex.instructions ? (
                                                    <p className="text-[11px] text-white/60 whitespace-pre-line leading-relaxed">{ex.instructions}</p>
                                                ) : (
                                                    <p className="text-[10px] font-mono text-white/20 italic">No instructions available.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
