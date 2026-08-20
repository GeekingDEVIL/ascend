"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown } from "lucide-react";
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
    instructions: string | null;
    tracking_method: string | null;
};

export default function ExerciseDatabaseModal({ onClose }: { onClose: () => void }) {
    const [mounted, setMounted] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
    const [openExercise, setOpenExercise] = useState<string | null>(null);

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
        if (!query.trim()) return exercises;
        const q = query.toLowerCase();
        return exercises.filter((ex) => ex.name.toLowerCase().includes(q) || ex.primary_muscle.toLowerCase().includes(q) || ex.equipment.toLowerCase().includes(q));
    }, [exercises, query]);

    const grouped = useMemo(() => {
        const map: Record<string, Exercise[]> = {};
        filtered.forEach((ex) => {
            const key = ex.body_segment || "Other";
            if (!map[key]) map[key] = [];
            map[key].push(ex);
        });
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    }, [filtered]);

    function toggleGroup(name: string) {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-6">
            <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgb(var(--accent-rgb) / 0.25); border-radius: 999px; }
      `}</style>
            <div
                className="relative w-full h-full md:h-[85vh] md:max-w-2xl md:rounded-md border border-[rgb(var(--accent-rgb)/0.25)] bg-[#0a1120] md:bg-[#0a1120]/95 backdrop-blur-2xl flex flex-col overflow-hidden"
                style={{ boxShadow: "0 0 70px -12px rgb(var(--accent-rgb) / 0.3)" }}
            >
                <div className="px-6 pt-6 pb-4 border-b border-[rgb(var(--accent-rgb)/0.1)] shrink-0">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.6)]">SYSTEM / EXERCISE DATABASE</p>
                        <button onClick={onClose} className="text-white/40 hover:text-white/80">
                            <X size={18} />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold mt-1">
                        EXERCISE <span className="text-[rgb(var(--accent-light-rgb))]">DATABASE</span>
                    </h2>
                    <p className="text-xs text-white/40 mt-1">Browse the full library. This view doesn't add anything to your schedule.</p>
                </div>

                <div className="p-4 border-b border-[rgb(var(--accent-rgb)/0.1)] shrink-0">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--accent-light-rgb)/0.5)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search the database..."
                            className="w-full rounded-md bg-white/[0.04] border border-[rgb(var(--accent-rgb)/0.2)] pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]"
                        />
                    </div>
                    <p className="text-[10px] font-mono text-white/30 mt-2">{filtered.length} exercises</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll px-4 py-3 pb-24">
                    {loading && <p className="text-center text-white/40 text-sm py-10">Loading...</p>}
                    {grouped.map(([groupName, items]) => {
                        const isOpen = openGroups.has(groupName);
                        return (
                            <div key={groupName} className="mb-2 rounded-md border border-[rgb(var(--accent-rgb)/0.1)] overflow-hidden">
                                <button
                                    onClick={() => toggleGroup(groupName)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition"
                                >
                                    <span className="text-xs font-bold tracking-widest text-[rgb(var(--accent-light-rgb))]">{groupName.toUpperCase()}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-white/30">{items.length}</span>
                                        <ChevronDown size={14} className={`text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="divide-y divide-white/5">
                                        {items.map((ex) => {
                                            const isExpanded = openExercise === ex.id;
                                            return (
                                                <div key={ex.id}>
                                                    <button
                                                        onClick={() => setOpenExercise(isExpanded ? null : ex.id)}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.02] transition"
                                                    >
                                                        <p className="text-sm font-bold text-white/90">{ex.name}</p>
                                                        <p className="text-[10px] font-mono text-white/40 mt-0.5">
                                                            {ex.primary_muscle} · {ex.equipment} · {ex.difficulty}
                                                        </p>
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="px-4 pb-3.5 pt-1 border-t border-white/5 space-y-3">
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">MOVEMENT</p>
                                                                    <p className="text-[11px] font-mono text-white/70">{ex.movement_pattern || "—"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">DIFFICULTY</p>
                                                                    <p className="text-[11px] font-mono text-white/70">{ex.difficulty || "—"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">EQUIPMENT TYPE</p>
                                                                    <p className="text-[11px] font-mono text-white/70">{ex.equipment_type || "—"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">TRACKING</p>
                                                                    <p className="text-[11px] font-mono text-white/70">{ex.tracking_method || "Weight × Reps"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">CATEGORY</p>
                                                                    <p className="text-[11px] font-mono text-white/70">{ex.category || "—"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">UNILATERAL</p>
                                                                    <p className="text-[11px] font-mono text-white/70">{ex.is_unilateral ? "Yes" : "No"}</p>
                                                                </div>
                                                            </div>
                                                            {ex.secondary_muscles?.length > 0 && (
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">SECONDARY MUSCLES</p>
                                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                                        {ex.secondary_muscles.map((m) => (
                                                                            <span key={m} className="text-[10px] font-mono px-2 py-0.5 rounded border bg-white/5 text-white/50 border-white/10">{m}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {ex.instructions ? (
                                                                <div>
                                                                    <p className="text-[9px] font-mono text-white/30">INSTRUCTIONS</p>
                                                                    <p className="text-[11px] text-white/60 mt-1 whitespace-pre-line leading-relaxed">{ex.instructions}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[9px] font-mono text-white/20 italic">No instructions added yet.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>,
        document.body
    );
}