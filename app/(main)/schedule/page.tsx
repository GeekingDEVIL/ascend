"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, GripVertical, Pencil, Database, Settings2, Play, Moon, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../../lib/supabase";
import { analyzeAdaptiveVolume, getVolumeStatus, VOLUME_GUIDELINES, type AdaptiveVolumeData, type MuscleTrend } from "../../lib/volumeAnalysis";
import { useAuth } from "../../lib/AuthProvider";
import AddExerciseModal from "../../components/AddExerciseModal";
import ExerciseDatabaseModal from "../../components/ExerciseDatabaseModal";

type LocalExercise = {
    id: string;
    isNew: boolean;
    exercise_id: string;
    name: string;
    body_segment: string;
    isCardio: boolean;
    target_sets: number;
    target_reps: string;
    target_weight: number | null;
    rest_seconds: number | null;
    notes: string;
    target_duration_minutes: number | null;
    target_incline: number | null;
    target_speed: number | null;
};

type RecurringPlan = { template_id: string | null; is_rest: boolean; template_name: string; exercise_count: number; muscles: string[] };

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEKDAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun for display

function getWeekDates(offset: number) {
    const today = new Date();
    const current = new Date(today);
    current.setDate(today.getDate() + offset * 7);
    const day = current.getDay();
    const monday = new Date(current);
    monday.setDate(current.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function toDateString(d: Date) {
    return d.toISOString().split("T")[0];
}

function mapExerciseRow(row: any): LocalExercise {
    const segment = row.exercises?.body_segment ?? "Other";
    return {
        id: row.id,
        isNew: false,
        exercise_id: row.exercise_id,
        name: row.exercises?.name ?? "Unknown",
        body_segment: segment,
        isCardio: segment === "Cardio",
        target_sets: row.target_sets ?? 1,
        target_reps: row.target_reps ?? "",
        target_weight: row.target_weight ?? null,
        rest_seconds: row.rest_seconds ?? null,
        notes: row.notes ?? "",
        target_duration_minutes: row.target_duration_minutes ?? null,
        target_incline: row.target_incline ?? null,
        target_speed: row.target_speed ?? null,
    };
}

function groupExercisesBySegment(list: LocalExercise[]) {
    const groups: { label: string; items: LocalExercise[] }[] = [];
    let currentLabel: string | null = null;
    for (const ex of list) {
        const label = ex.body_segment === "Cardio" ? "Finisher" : ex.body_segment || "Other";
        if (label !== currentLabel) {
            groups.push({ label, items: [] });
            currentLabel = label;
        }
        groups[groups.length - 1].items.push(ex);
    }
    return groups;
}

function SetsStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1 rounded-md border border-cyan-400/20 bg-white/[0.03] px-1 shrink-0">
            <button onClick={() => onChange(Math.max(1, value - 1))} className="w-6 h-7 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/10 rounded">−</button>
            <span className="w-5 text-center text-sm font-bold">{value}</span>
            <button onClick={() => onChange(value + 1)} className="w-6 h-7 flex items-center justify-center text-cyan-300 hover:bg-cyan-400/10 rounded">+</button>
        </div>
    );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="text-center py-12">
            <div className="w-9 h-9 mx-auto mb-3 rotate-45 border-2 border-cyan-400/30" />
            <p className="text-sm font-bold tracking-widest text-cyan-300/70">{title}</p>
            <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        </div>
    );
}

function ReadOnlyRow({ ex, index }: { ex: LocalExercise; index: number }) {
    return (
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="text-[10px] font-mono text-white/30 w-5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
            <p className="text-sm font-bold text-white/90 flex-1 min-w-0 truncate">{ex.name}</p>

            {ex.isCardio ? (
                <div className="flex items-center gap-3 shrink-0">
                    {ex.target_duration_minutes != null && (
                        <div className="text-center">
                            <p className="text-[8px] font-mono text-white/30 leading-none">MIN</p>
                            <p className="text-sm font-bold text-white/80">{ex.target_duration_minutes}</p>
                        </div>
                    )}
                    {ex.target_incline != null && (
                        <div className="text-center">
                            <p className="text-[8px] font-mono text-white/30 leading-none">INCLINE</p>
                            <p className="text-sm font-bold text-white/80">{ex.target_incline}%</p>
                        </div>
                    )}
                    {ex.target_speed != null && (
                        <div className="text-center">
                            <p className="text-[8px] font-mono text-white/30 leading-none">KM/H</p>
                            <p className="text-sm font-bold text-white/80">{ex.target_speed}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                        <p className="text-[8px] font-mono text-white/30 leading-none">SETS</p>
                        <p className="text-sm font-bold text-white/80">{ex.target_sets}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-mono text-white/30 leading-none">REPS</p>
                        <p className="text-sm font-bold text-white/80">{ex.target_reps}</p>
                    </div>
                    {ex.target_weight != null && (
                        <div className="text-center">
                            <p className="text-[8px] font-mono text-white/30 leading-none">KG</p>
                            <p className="text-sm font-bold text-white/80">{ex.target_weight}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SortableRow({
    ex, index, onUpdate, onRemove,
}: {
    ex: LocalExercise; index: number;
    onUpdate: (id: string, patch: Partial<LocalExercise>) => void;
    onRemove: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
    const [expanded, setExpanded] = useState(false);

    return (
        <div ref={setNodeRef} style={style} className="rounded-md border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2 px-3 py-2.5">
                <button {...attributes} {...listeners} className="text-white/30 hover:text-cyan-300 cursor-grab active:cursor-grabbing shrink-0 touch-none">
                    <GripVertical size={16} />
                </button>
                <span className="text-[10px] font-mono text-white/30 w-5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-sm font-bold text-white/90 flex-1 min-w-0 truncate">{ex.name}</p>

                {ex.isCardio ? (
                    <div className="flex items-center gap-2 shrink-0">
                        <input
                            type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="numeric"
                            value={ex.target_duration_minutes ?? ""}
                            onChange={(e) => onUpdate(ex.id, { target_duration_minutes: e.target.value ? Number(e.target.value) : null })}
                            placeholder="MIN"
                            className="w-14 shrink-0 rounded-md bg-white/[0.03] border border-cyan-400/20 text-center text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                        <input
                            type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="decimal"
                            value={ex.target_incline ?? ""}
                            onChange={(e) => onUpdate(ex.id, { target_incline: e.target.value ? Number(e.target.value) : null })}
                            placeholder="%"
                            className="w-12 shrink-0 rounded-md bg-white/[0.03] border border-cyan-400/20 text-center text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                        <input
                            type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="decimal"
                            value={ex.target_speed ?? ""}
                            onChange={(e) => onUpdate(ex.id, { target_speed: e.target.value ? Number(e.target.value) : null })}
                            placeholder="KM/H"
                            className="w-16 shrink-0 rounded-md bg-white/[0.03] border border-cyan-400/20 text-center text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 shrink-0">
                        <SetsStepper value={ex.target_sets} onChange={(v) => onUpdate(ex.id, { target_sets: v })} />
                        <input
                            type="text"
                            value={ex.target_reps}
                            onChange={(e) => onUpdate(ex.id, { target_reps: e.target.value })}
                            className="w-14 shrink-0 rounded-md bg-white/[0.03] border border-cyan-400/20 text-center text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                )}

                <button onClick={() => setExpanded((v) => !v)} className={`shrink-0 transition ${expanded ? "text-cyan-300" : "text-white/30 hover:text-white/70"}`}>
                    <Settings2 size={15} />
                </button>
                <button onClick={() => onRemove(ex.id)} className="text-white/30 hover:text-red-400 transition shrink-0">
                    <Trash2 size={16} />
                </button>
            </div>

            {expanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[9px] font-mono text-white/30">WEIGHT (KG)</label>
                        <input
                            type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="decimal"
                            value={ex.target_weight ?? ""}
                            onChange={(e) => onUpdate(ex.id, { target_weight: e.target.value ? Number(e.target.value) : null })}
                            placeholder="—"
                            className="w-full mt-1 rounded-md bg-white/[0.03] border border-white/10 text-center text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-mono text-white/30">REST (SEC)</label>
                        <input
                            type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="numeric"
                            value={ex.rest_seconds ?? ""}
                            onChange={(e) => onUpdate(ex.id, { rest_seconds: e.target.value ? Number(e.target.value) : null })}
                            placeholder="90"
                            className="w-full mt-1 rounded-md bg-white/[0.03] border border-white/10 text-center text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[9px] font-mono text-white/30">NOTES</label>
                        <input
                            type="text"
                            value={ex.notes}
                            onChange={(e) => onUpdate(ex.id, { notes: e.target.value })}
                            placeholder="e.g. slow eccentric"
                            className="w-full mt-1 rounded-md bg-white/[0.03] border border-white/10 px-2 text-sm py-1.5 focus:outline-none focus:border-cyan-400/50"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SchedulePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
    const [showDatabase, setShowDatabase] = useState(false);

    const [recurringPlans, setRecurringPlans] = useState<Record<number, RecurringPlan>>({});
    const [recurringLoaded, setRecurringLoaded] = useState(false);

    const [weeklyTab, setWeeklyTab] = useState<number | null>(null);
    const [weeklyTitle, setWeeklyTitle] = useState("");
    const [weeklyExercises, setWeeklyExercises] = useState<LocalExercise[]>([]);
    const [weeklyDeletedIds, setWeeklyDeletedIds] = useState<string[]>([]);
    const [weeklyIsRest, setWeeklyIsRest] = useState(false);
    const [weeklyTemplateId, setWeeklyTemplateId] = useState<string | null>(null);
    const [weeklyLoading, setWeeklyLoading] = useState(false);
    const [weeklySaved, setWeeklySaved] = useState(false);
    const [weeklyEditMode, setWeeklyEditMode] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Selected-day detail: purely derived from recurringPlans + templates. Never reads scheduled_days.
    const [viewLoading, setViewLoading] = useState(true);
    const [viewExercises, setViewExercises] = useState<LocalExercise[]>([]);
    const [recoveryWarnings, setRecoveryWarnings] = useState<{ segment: string; pct: number; lastTrained: string }[]>([]);
    const [weeklyVolume, setWeeklyVolume] = useState<{ segment: string; sets: number; days: number }[]>([]);
    const [adaptiveData, setAdaptiveData] = useState<Record<string, AdaptiveVolumeData>>({});
    const [adaptiveLoaded, setAdaptiveLoaded] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const calendarRef = useRef<HTMLDivElement>(null);
    const weekDates = getWeekDates(weekOffset);
    const today = toDateString(new Date());

    // ---------- LOAD: recurring plans (single source of truth for ALL display) ----------
    const loadRecurring = useCallback(async () => {
        if (!user) return;
        const { data: plans } = await supabase
            .from("recurring_plans")
            .select("weekday, template_id, is_rest, workout_templates(name)")
            .eq("user_id", user.id);

        const templateIds = (plans ?? []).map((p: any) => p.template_id).filter(Boolean);
        let countByTemplate: Record<string, number> = {};
        let musclesByTemplate: Record<string, Set<string>> = {};
        if (templateIds.length) {
            const { data: rows } = await supabase
                .from("workout_template_exercises")
                .select("template_id, exercises(body_segment)")
                .in("template_id", templateIds);
            (rows ?? []).forEach((r: any) => {
                countByTemplate[r.template_id] = (countByTemplate[r.template_id] ?? 0) + 1;
                const seg = r.exercises?.body_segment;
                if (seg && seg !== "Cardio") {
                    if (!musclesByTemplate[r.template_id]) musclesByTemplate[r.template_id] = new Set();
                    musclesByTemplate[r.template_id].add(seg);
                }
            });
        }

        const map: Record<number, RecurringPlan> = {};
        (plans ?? []).forEach((p: any) => {
            map[p.weekday] = {
                template_id: p.template_id,
                is_rest: p.is_rest,
                template_name: p.workout_templates?.name ?? "",
                exercise_count: p.template_id ? (countByTemplate[p.template_id] ?? 0) : 0,
                muscles: p.template_id && musclesByTemplate[p.template_id] ? Array.from(musclesByTemplate[p.template_id]) : [],
            };
        });
        setRecurringPlans(map);
        setRecurringLoaded(true);

        // Compute weekly volume across all training days
        if (templateIds.length) {
            const { data: allExRows } = await supabase
                .from("workout_template_exercises")
                .select("template_id, target_sets, exercises(body_segment)")
                .in("template_id", templateIds);

            const templateToWeekdays: Record<string, number> = {};
            (plans ?? []).forEach((p: any) => {
                if (p.template_id && !p.is_rest) templateToWeekdays[p.template_id] = (templateToWeekdays[p.template_id] ?? 0) + 1;
            });

            const volMap: Record<string, { sets: number; daySet: Set<string> }> = {};
            (allExRows ?? []).forEach((r: any) => {
                const seg = r.exercises?.body_segment;
                if (!seg || seg === "Cardio") return;
                const timesPerWeek = templateToWeekdays[r.template_id] ?? 1;
                if (!volMap[seg]) volMap[seg] = { sets: 0, daySet: new Set() };
                volMap[seg].sets += (r.target_sets ?? 0) * timesPerWeek;
                volMap[seg].daySet.add(r.template_id);
            });

            const volArr = Object.entries(volMap)
                .map(([segment, v]) => ({ segment, sets: v.sets, days: v.daySet.size }))
                .sort((a, b) => b.sets - a.sets);
            setWeeklyVolume(volArr);
        } else {
            setWeeklyVolume([]);
        }
    }, [user]);

    useEffect(() => { loadRecurring(); }, [loadRecurring]);

    useEffect(() => {
        if (!user) return;
        analyzeAdaptiveVolume(user.id).then((data) => {
            setAdaptiveData(data);
            setAdaptiveLoaded(true);
        });
    }, [user]);

    useEffect(() => {
        setTimeout(() => {
            const container = calendarRef.current;
            if (!container) return;
            const todayCard = container.querySelector<HTMLElement>("[data-today='true']");
            if (todayCard) {
                todayCard.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            }
        }, 100);
    }, [weekOffset]);

    // ---------- LOAD: selected day detail (derived only) ----------
    const loadSelectedDayView = useCallback(async () => {
        if (!recurringLoaded) return;
        setViewLoading(true);
        const weekday = new Date(selectedDate + "T00:00:00").getDay();
        const plan = recurringPlans[weekday];

        if (!plan || plan.is_rest || !plan.template_id) {
            setViewExercises([]);
            setRecoveryWarnings([]);
            setViewLoading(false);
            return;
        }

        const { data: rows } = await supabase
            .from("workout_template_exercises")
            .select("id, order_index, target_sets, target_reps, target_weight, target_duration_minutes, target_incline, target_speed, exercise_id, exercises(name, body_segment)")
            .eq("template_id", plan.template_id)
            .order("order_index");
        setViewExercises((rows ?? []).map(mapExerciseRow));
        setViewLoading(false);

        // Compute recovery warnings for today's muscles
        if (user) {
            const todaysMuscles = new Set((rows ?? []).map((r: any) => r.exercises?.body_segment).filter(Boolean));
            if (todaysMuscles.size > 0) {
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                const { data: recentLogs } = await supabase
                    .from("exercise_set_logs")
                    .select("exercise_id, completed_at, exercises!inner(body_segment), workout_sessions!inner(status, user_id)")
                    .eq("workout_sessions.user_id", user.id)
                    .eq("workout_sessions.status", "completed")
                    .gte("completed_at", threeDaysAgo.toISOString());

                const lastTrainedMap: Record<string, Date> = {};
                (recentLogs ?? []).forEach((log: any) => {
                    const seg = log.exercises?.body_segment;
                    if (!seg || !todaysMuscles.has(seg)) return;
                    const d = new Date(log.completed_at);
                    if (!lastTrainedMap[seg] || d > lastTrainedMap[seg]) lastTrainedMap[seg] = d;
                });

                const warnings: { segment: string; pct: number; lastTrained: string }[] = [];
                for (const [seg, lastDate] of Object.entries(lastTrainedMap)) {
                    const hoursAgo = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
                    const recoveryHours = 48; // baseline 48h recovery
                    const pct = Math.min(100, Math.round((hoursAgo / recoveryHours) * 100));
                    if (pct < 85) {
                        const dayLabel = lastDate.toLocaleDateString(undefined, { weekday: "short" });
                        warnings.push({ segment: seg, pct, lastTrained: dayLabel });
                    }
                }
                setRecoveryWarnings(warnings.sort((a, b) => a.pct - b.pct));
            } else {
                setRecoveryWarnings([]);
            }
        }
    }, [selectedDate, recurringPlans, recurringLoaded, user]);

    useEffect(() => { loadSelectedDayView(); }, [loadSelectedDayView]);

    // ---------- WEEKLY PLAN EDITOR ----------
    async function loadWeekdayPlan(wd: number) {
        setWeeklyLoading(true);
        setWeeklyDeletedIds([]);
        const plan = recurringPlans[wd];
        setWeeklyIsRest(plan?.is_rest ?? false);
        setWeeklyTemplateId(plan?.template_id ?? null);
        setWeeklyTitle(plan?.template_name || "");

        if (plan?.template_id) {
            const { data: rows } = await supabase
                .from("workout_template_exercises")
                .select("id, order_index, target_sets, target_reps, target_weight, rest_seconds, notes, target_duration_minutes, target_incline, target_speed, exercise_id, exercises(name, body_segment)")
                .eq("template_id", plan.template_id)
                .order("order_index");
            setWeeklyExercises((rows ?? []).map(mapExerciseRow));
        } else {
            setWeeklyExercises([]);
        }
        setWeeklyEditMode(!plan);
        setWeeklyLoading(false);
    }

    async function openWeekdayEditor(wd: number) {
        if (weeklyTab === wd) { setWeeklyTab(null); return; }
        setWeeklyTab(wd);
        await loadWeekdayPlan(wd);
    }

    async function handleCancelWeeklyEdit() {
        if (weeklyTab === null) return;
        await loadWeekdayPlan(weeklyTab);
    }

    function handleAddExerciseToWeekly(exercise: { id: string; name: string; body_segment?: string }) {
        const segment = exercise.body_segment || "Other";
        const cardio = segment === "Cardio";
        setWeeklyExercises((prev) => {
            if (prev.some((e) => e.exercise_id === exercise.id)) return prev;
            return [...prev, {
                id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`, isNew: true, exercise_id: exercise.id, name: exercise.name,
                body_segment: segment, isCardio: cardio,
                target_sets: cardio ? 1 : 3, target_reps: cardio ? "" : "8-10", target_weight: null, rest_seconds: cardio ? null : 90, notes: "",
                target_duration_minutes: cardio ? 10 : null, target_incline: null, target_speed: null,
            }];
        });
    }

    function handleRemoveWeeklyExercise(id: string) {
        const item = weeklyExercises.find((e) => e.id === id);
        if (item && !item.isNew) setWeeklyDeletedIds((prev) => [...prev, id]);
        setWeeklyExercises((prev) => prev.filter((e) => e.id !== id));
    }

    function handleUpdateWeeklyExercise(id: string, patch: Partial<LocalExercise>) {
        setWeeklyExercises((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    }

    function handleWeeklyDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setWeeklyExercises((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }

    function handleToggleWeeklyRest() {
        setWeeklyIsRest((v) => !v);
    }

    async function handleSaveWeekday() {
        if (weeklyTab === null || !user) return;

        if (weeklyIsRest) {
            await supabase.from("recurring_plans").upsert(
                { user_id: user.id, weekday: weeklyTab, template_id: null, is_rest: true },
                { onConflict: "user_id,weekday" }
            );
            setWeeklySaved(true);
            setTimeout(() => setWeeklySaved(false), 1200);
            setWeeklyEditMode(false);
            await loadRecurring();
            return;
        }

        const finalTitle = weeklyTitle.trim() || `${WEEKDAY_FULL[weeklyTab]} Plan`;
        let templateId = weeklyTemplateId;
        if (!templateId) {
            const { data: created } = await supabase
                .from("workout_templates")
                .insert({ user_id: user.id, name: finalTitle })
                .select()
                .single();
            templateId = created?.id ?? null;
            setWeeklyTemplateId(templateId);
        } else {
            await supabase.from("workout_templates").update({ name: finalTitle }).eq("id", templateId);
        }
        if (!templateId) return;

        if (weeklyDeletedIds.length) {
            await supabase.from("workout_template_exercises").delete().in("id", weeklyDeletedIds);
        }

        for (let i = 0; i < weeklyExercises.length; i++) {
            const ex = weeklyExercises[i];
            if (ex.isNew) {
                await supabase.from("workout_template_exercises").insert({
                    template_id: templateId, user_id: user.id, exercise_id: ex.exercise_id, order_index: i,
                    target_sets: ex.target_sets, target_reps: ex.target_reps, target_weight: ex.target_weight,
                    rest_seconds: ex.rest_seconds, notes: ex.notes,
                    target_duration_minutes: ex.target_duration_minutes, target_incline: ex.target_incline, target_speed: ex.target_speed,
                });
            } else {
                await supabase.from("workout_template_exercises").update({
                    order_index: i, target_sets: ex.target_sets, target_reps: ex.target_reps,
                    target_weight: ex.target_weight, rest_seconds: ex.rest_seconds, notes: ex.notes,
                    target_duration_minutes: ex.target_duration_minutes, target_incline: ex.target_incline, target_speed: ex.target_speed,
                }).eq("id", ex.id);
            }
        }

        await supabase.from("recurring_plans").upsert(
            { user_id: user.id, weekday: weeklyTab, template_id: templateId, is_rest: false },
            { onConflict: "user_id,weekday" }
        );

        setWeeklyDeletedIds([]);
        setWeeklySaved(true);
        setTimeout(() => setWeeklySaved(false), 1200);
        setWeeklyEditMode(false);
        await loadRecurring();
    }

    async function handleClearWeekday() {
        if (weeklyTab === null || !user) return;
        if (!confirm(`Clear ${WEEKDAY_FULL[weeklyTab]}'s plan? Future weeks will stop auto-filling this day.`)) return;
        await supabase.from("recurring_plans").delete().eq("user_id", user.id).eq("weekday", weeklyTab);
        setWeeklyTab(null);
        await loadRecurring();
    }

    const dayLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" });
    const selectedWeekday = new Date(selectedDate + "T00:00:00").getDay();
    const selectedPlan = recurringPlans[selectedWeekday];
    const weeklyExistingIds = new Set(weeklyExercises.map((e) => e.exercise_id));
    const weeklyTotalSets = weeklyExercises.reduce((sum, e) => sum + (e.target_sets || 0), 0);
    const weeklyHasContent = weeklyIsRest || weeklyExercises.length > 0;
    const viewTotalSets = viewExercises.reduce((sum, e) => sum + (e.target_sets || 0), 0);

    return (
        <main className="relative min-h-screen w-full max-w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
            <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)]" />

            <div className="relative z-10 w-full max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white/90">Schedule</h1>
                        <p className="text-white/40 text-sm mt-0.5">Set your week once. It repeats.</p>
                    </div>
                    <button
                        onClick={() => setShowDatabase(true)}
                        className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-md border border-cyan-400/20 text-cyan-300/80 hover:bg-cyan-400/10 transition shrink-0"
                    >
                        <Database size={14} /> View Database
                    </button>
                </div>

                {/* WEEKLY PLAN — the only editor */}
                <div className="rounded-md border border-cyan-400/15 bg-white/[0.03] p-3">
                    <p className="text-[10px] font-mono tracking-widest text-white/40 mb-2.5">YOUR WEEKLY PLAN</p>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                        {WEEKDAY_ORDER.map((wd) => {
                            const plan = recurringPlans[wd];
                            const isOpen = weeklyTab === wd;
                            return (
                                <button
                                    key={wd}
                                    onClick={() => openWeekdayEditor(wd)}
                                    className={`flex flex-col items-center gap-1 rounded-md border px-2 sm:px-3 py-2 min-w-[48px] sm:min-w-[68px] shrink-0 transition ${plan?.is_rest ? "border-emerald-400/25 bg-emerald-400/5" : plan ? "border-orange-400/25 bg-orange-400/5" : "border-white/10 bg-white/[0.02]"
                                        } ${isOpen ? "border-cyan-400/60" : ""}`}
                                >
                                    <span className="text-[9px] font-mono text-white/40">{WEEKDAY_LABELS[wd]}</span>
                                    <span className={`text-[10px] font-bold text-center leading-tight truncate max-w-[60px] ${plan?.is_rest ? "text-emerald-300" : plan ? "text-orange-300" : "text-white/50"}`}>
                                        {plan ? (plan.is_rest ? "Rest" : "Set") : "—"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {weeklyTab !== null && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <p className="text-sm font-bold text-white/90">{WEEKDAY_FULL[weeklyTab]}</p>

                                {weeklyEditMode ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={handleToggleWeeklyRest}
                                            className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded border transition ${weeklyIsRest ? "border-orange-400/50 bg-orange-400/15 text-orange-200" : "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                                                }`}
                                            style={{ boxShadow: weeklyIsRest ? "0 0 14px -3px rgba(251,146,60,0.6)" : "0 0 14px -3px rgba(52,211,153,0.6)" }}
                                        >
                                            {weeklyIsRest ? <Flame size={12} /> : <Moon size={12} />}
                                            {weeklyIsRest ? "MAKE TRAINING DAY" : "MARK AS REST"}
                                        </button>
                                        <button
                                            onClick={handleSaveWeekday}
                                            disabled={!weeklyHasContent}
                                            className={`text-[10px] font-mono px-3 py-1.5 rounded border transition ${weeklyHasContent ? "border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10" : "border-white/10 text-white/20 cursor-not-allowed"
                                                }`}
                                        >
                                            {weeklySaved ? "SAVED ✓" : "SAVE"}
                                        </button>
                                        {recurringPlans[weeklyTab] && (
                                            <button onClick={handleCancelWeeklyEdit} className="text-[10px] font-mono px-3 py-1.5 rounded border border-white/15 text-white/40 hover:text-white/70 transition">
                                                CANCEL
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded border ${weeklyIsRest ? "border-emerald-400/40 text-emerald-300 bg-emerald-400/10" : "border-orange-400/40 text-orange-300 bg-orange-400/10"
                                                }`}
                                        >
                                            {weeklyIsRest ? <Moon size={12} /> : <Flame size={12} />}
                                            {weeklyIsRest ? "REST DAY" : "TRAINING DAY"}
                                        </span>
                                        <button onClick={() => setWeeklyEditMode(true)} className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded border border-white/15 text-white/50 hover:text-white/80 hover:border-cyan-400/30 transition">
                                            <Pencil size={11} /> EDIT
                                        </button>
                                        <button onClick={handleClearWeekday} className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded border border-red-400/20 text-red-400/70 hover:text-red-400 hover:border-red-400/40 transition">
                                            <Trash2 size={11} /> CLEAR
                                        </button>
                                    </div>
                                )}
                            </div>

                            {weeklyLoading ? (
                                <p className="text-sm text-white/40 py-6 text-center">Loading...</p>
                            ) : !weeklyEditMode ? (
                                weeklyIsRest ? (
                                    <EmptyState title="REST DAY" subtitle="Every future occurrence of this weekday stays a rest day." />
                                ) : (
                                    <>
                                        <p className="text-base font-bold text-white/90 mb-3">{recurringPlans[weeklyTab]?.template_name || WEEKDAY_FULL[weeklyTab]}</p>
                                        <div className="space-y-4">
                                            {groupExercisesBySegment(weeklyExercises).map((group, gi) => (
                                                <div key={`${group.label}-${gi}`}>
                                                    <p className="text-[10px] font-mono tracking-widest text-cyan-300/70 mb-2">{group.label.toUpperCase()}</p>
                                                    <div className="space-y-2">
                                                        {group.items.map((ex) => (
                                                            <ReadOnlyRow key={ex.id} ex={ex} index={weeklyExercises.indexOf(ex)} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )
                            ) : weeklyIsRest ? (
                                <EmptyState title="REST DAY" subtitle="Every future occurrence of this weekday stays a rest day." />
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={weeklyTitle}
                                        onChange={(e) => setWeeklyTitle(e.target.value)}
                                        placeholder={`${WEEKDAY_FULL[weeklyTab]} Plan`}
                                        className="w-full bg-transparent text-base font-bold text-white/90 placeholder:text-white/30 focus:outline-none mb-3 border-b border-white/10 pb-2 focus:border-cyan-400/40"
                                    />

                                    {weeklyExercises.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div><p className="text-[9px] font-mono text-white/30">EXERCISES</p><p className="text-lg font-bold">{weeklyExercises.length}</p></div>
                                            <div><p className="text-[9px] font-mono text-white/30">SETS</p><p className="text-lg font-bold">{weeklyTotalSets}</p></div>
                                        </div>
                                    )}

                                    {weeklyExercises.length === 0 ? (
                                        <EmptyState title="NO EXERCISES YET" subtitle="Add exercises to build this weekday's plan." />
                                    ) : (
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleWeeklyDragEnd}>
                                            <SortableContext items={weeklyExercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2 mb-3">
                                                    {weeklyExercises.map((ex, i) => (
                                                        <SortableRow key={ex.id} ex={ex} index={i} onUpdate={handleUpdateWeeklyExercise} onRemove={handleRemoveWeeklyExercise} />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}

                                    <button
                                        onClick={() => setAddModalOpen(true)}
                                        className={`flex items-center gap-1.5 text-xs font-mono transition ${weeklyExercises.length === 0 ? "px-3 py-2 rounded-md bg-cyan-400 text-black font-bold hover:bg-cyan-300" : "text-cyan-300 hover:text-cyan-200"
                                            }`}
                                    >
                                        <Plus size={14} /> ADD EXERCISE
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-[9px] text-white/25 mt-2">Every future Monday, Tuesday, etc. auto-fills from what you set here.</p>
                </div>

                {/* WEEKLY VOLUME */}
                {weeklyVolume.length > 0 && (
                    <div className="rounded-md border border-cyan-400/15 bg-white/[0.03] p-3">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-mono tracking-widest text-white/40">WEEKLY MUSCLE VOLUME</p>
                            {adaptiveLoaded && Object.values(adaptiveData).some((d) => d.hasEnoughData) && (
                                <span className="text-[8px] font-mono px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                                    PERSONALIZED
                                </span>
                            )}
                        </div>
                        <div className="space-y-3">
                            {weeklyVolume.map((v) => {
                                const guide = VOLUME_GUIDELINES[v.segment] ?? { min: 8, max: 20, note: "" };
                                const adaptive = adaptiveData[v.segment];
                                const status = getVolumeStatus(v.segment, v.sets, adaptive);

                                const usePersonal = adaptive?.hasEnoughData && adaptive.personalMin !== null && adaptive.personalMax !== null;
                                const min = usePersonal ? adaptive!.personalMin! : guide.min;
                                const max = usePersonal ? adaptive!.personalMax! : guide.max;
                                const barMax = Math.max(max + 4, v.sets);
                                const pct = Math.min(100, (v.sets / barMax) * 100);
                                const optStartPct = (min / barMax) * 100;
                                const optEndPct = (max / barMax) * 100;

                                const trendIcon = status.trend === "improving" ? "↑"
                                    : status.trend === "maintaining" ? "→"
                                        : status.trend === "stalling" ? "↓"
                                            : status.trend === "declining" ? "↓↓"
                                                : null;

                                const trendColor = status.trend === "improving" ? "text-emerald-300"
                                    : status.trend === "maintaining" ? "text-white/40"
                                        : status.trend === "stalling" ? "text-amber-300"
                                            : status.trend === "declining" ? "text-red-400"
                                                : "";

                                return (
                                    <div key={v.segment}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-mono text-white/60">{v.segment}</p>
                                                {trendIcon && (
                                                    <span className={`text-[9px] font-mono font-bold ${trendColor}`} title={`Performance: ${status.trend}`}>
                                                        {trendIcon}
                                                    </span>
                                                )}
                                                {adaptive?.performanceChangePct !== null && adaptive?.performanceChangePct !== undefined && adaptive.hasEnoughData && (
                                                    <span className={`text-[8px] font-mono ${adaptive.performanceChangePct >= 0 ? "text-emerald-300/60" : "text-red-400/60"}`}>
                                                        {adaptive.performanceChangePct >= 0 ? "+" : ""}{adaptive.performanceChangePct.toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-mono font-bold ${status.color}`}>{status.label}</span>
                                                <span className="text-xs font-bold font-mono text-white/70">{v.sets}</span>
                                                <span className="text-[8px] font-mono text-white/30">/ {min}–{max}</span>
                                                {usePersonal && (
                                                    <span className="text-[7px] font-mono text-cyan-400/50" title="Range learned from your training data">✦</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="absolute top-0 bottom-0 rounded-full bg-cyan-400/10"
                                                style={{ left: `${optStartPct}%`, width: `${optEndPct - optStartPct}%` }}
                                            />
                                            <div
                                                className={`absolute top-0 bottom-0 left-0 rounded-full transition-all ${status.label === "NONE" ? "bg-white/10" :
                                                    status.label === "LOW" ? "bg-amber-400/70" :
                                                        status.label === "OPTIMAL" ? "bg-cyan-400/70" :
                                                            status.label === "HIGH" ? "bg-orange-400/70" :
                                                                "bg-red-400/70"
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        {status.tip && (
                                            <p className={`text-[9px] font-mono mt-1 ${status.color} opacity-70`}>{status.tip}</p>
                                        )}
                                        {adaptive?.hasEnoughData && adaptive.suggestion && status.label === "OPTIMAL" && (
                                            <p className="text-[9px] font-mono mt-1 text-cyan-300/50">{adaptive.suggestion}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/5">
                            {adaptiveLoaded && Object.values(adaptiveData).some((d) => d.hasEnoughData) ? (
                                <p className="text-[8px] font-mono text-white/25">
                                    ✦ = personalized range learned from your training history. Other ranges are general guidelines. Performance trends update as you log workouts.
                                </p>
                            ) : adaptiveLoaded && Object.values(adaptiveData).some((d) => d.weeksOfData > 0) ? (
                                <p className="text-[8px] font-mono text-white/25">
                                    Gathering data — ranges will personalize after 4+ weeks of logged workouts. Currently using general guidelines.
                                </p>
                            ) : (
                                <p className="text-[8px] font-mono text-white/25">
                                    Ranges based on hypertrophy research. Start logging workouts to unlock personalized recommendations.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {/* CALENDAR — 7-column grid, view only, always derived from Weekly Plan */}
                <div className="rounded-md border border-cyan-400/15 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between mb-2.5 gap-2">
                        <button onClick={() => setWeekOffset((w) => w - 1)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-white/40 hover:text-cyan-300 hover:border-cyan-400/30 active:scale-95 transition" aria-label="Previous week">←</button>
                        <div className="text-center min-w-0">
                            <p className="text-[10px] font-mono text-white/40">
                                {weekDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {weekDates[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </p>
                            {(weekOffset !== 0 || selectedDate !== today) && (
                                <button onClick={() => { setWeekOffset(0); setSelectedDate(today); }} className="text-[9px] font-mono text-cyan-300/70 hover:text-cyan-300 transition">
                                    JUMP TO TODAY
                                </button>
                            )}
                        </div>
                        <button onClick={() => setWeekOffset((w) => w + 1)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-white/10 text-white/40 hover:text-cyan-300 hover:border-cyan-400/30 active:scale-95 transition" aria-label="Next week">→</button>
                    </div>

                    <div ref={calendarRef} className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 sm:grid sm:grid-cols-7 sm:gap-1.5 sm:overflow-visible">
                        {weekDates.map((d) => {
                            const dateStr = toDateString(d);
                            const isSelected = dateStr === selectedDate;
                            const isToday = dateStr === today;
                            const weekday = d.getDay();
                            const plan = recurringPlans[weekday];

                            return (
                                <button
                                    key={dateStr}
                                    data-today={isToday ? "true" : undefined}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`relative flex flex-col items-start rounded-md border p-2.5 transition active:scale-[0.97] min-w-[120px] w-[120px] sm:w-auto sm:min-w-0 shrink-0 snap-start min-h-[110px] sm:min-h-[100px] ${isSelected ? "border-cyan-400/70 bg-cyan-400/10" : "border-white/10 bg-white/[0.02] hover:border-cyan-400/25"
                                        }`}
                                    style={isSelected ? { boxShadow: "0 0 16px -6px rgba(34,211,238,0.5)" } : undefined}
                                >
                                    {isToday && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-300" />}
                                    <span className="text-[8px] sm:text-[9px] font-mono text-white/40 tracking-tight">
                                        {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3).toUpperCase()}
                                    </span>
                                    <span className="text-base sm:text-xl font-bold text-white/90 leading-tight">{d.getDate()}</span>
                                    <div className="mt-auto w-full">
                                        {plan ? (
                                            plan.is_rest ? (
                                                <span className="block text-[8px] sm:text-[9px] font-mono text-emerald-300 truncate">Rest</span>
                                            ) : (
                                                <>
                                                    <span className="block text-[8px] sm:text-[9px] font-bold text-white/70 truncate leading-tight">{plan.template_name || "Workout"}</span>
                                                    <span className="block text-[7px] sm:text-[8px] font-mono text-orange-300/70">{plan.exercise_count} EX</span>
                                                    {plan.muscles.length > 0 && (
                                                        <span className="block text-[7px] font-mono text-white/30 truncate leading-tight mt-0.5">
                                                            {plan.muscles.slice(0, 3).join(" · ")}
                                                        </span>
                                                    )}
                                                </>
                                            )
                                        ) : (
                                            <span className="block text-[8px] sm:text-[9px] font-mono text-white/20">—</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SELECTED DAY — view only, derived */}
                <div className="rounded-md border border-cyan-400/15 bg-white/[0.05] backdrop-blur-2xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <p className="text-xs tracking-widest text-cyan-300">{dayLabel.toUpperCase()}</p>
                        {selectedDate === today && selectedPlan && !selectedPlan.is_rest && viewExercises.length > 0 && (
                            <button
                                onClick={() => router.push("/workout")}
                                className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition"
                            >
                                <Play size={11} fill="black" /> START WORKOUT
                            </button>
                        )}
                    </div>

                    <p className="text-lg md:text-xl font-bold text-white/90 truncate">
                        {selectedPlan?.is_rest ? "Rest / Recovery" : selectedPlan?.template_name || "Untitled"}
                    </p>

                    {viewLoading ? (
                        <p className="text-sm text-white/40 py-6 text-center">Loading...</p>
                    ) : !selectedPlan ? (
                        <EmptyState title="NO PLAN" subtitle="Set a weekly plan above, or this day stays empty." />
                    ) : selectedPlan.is_rest ? (
                        <EmptyState title="REST DAY" subtitle="Recovery is part of the plan too." />
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-3 mt-4 pb-4 border-b border-white/10">
                                <div><p className="text-[9px] font-mono text-white/30">EXERCISES</p><p className="text-lg font-bold">{viewExercises.length}</p></div>
                                <div><p className="text-[9px] font-mono text-white/30">SETS</p><p className="text-lg font-bold">{viewTotalSets}</p></div>
                                <div><p className="text-[9px] font-mono text-white/30">EST. TIME</p><p className="text-lg font-bold">{viewTotalSets * 3} MIN</p></div>
                            </div>

                            {recoveryWarnings.length > 0 && (
                                <div className="mt-3 rounded-md border border-amber-400/20 bg-amber-400/5 p-3 space-y-2">
                                    <p className="text-[10px] font-mono tracking-widest text-amber-300/80">⚠ RECOVERY WARNING</p>
                                    {recoveryWarnings.map((w) => (
                                        <div key={w.segment} className="flex items-center gap-3">
                                            <p className="text-[10px] font-mono text-white/60 w-20 shrink-0">{w.segment}</p>
                                            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${w.pct < 50 ? "bg-red-400/70" : w.pct < 70 ? "bg-amber-400/70" : "bg-yellow-300/60"}`}
                                                    style={{ width: `${w.pct}%` }}
                                                />
                                            </div>
                                            <p className={`text-[10px] font-mono font-bold w-10 text-right ${w.pct < 50 ? "text-red-400" : w.pct < 70 ? "text-amber-300" : "text-yellow-200"}`}>
                                                {w.pct}%
                                            </p>
                                            <p className="text-[8px] font-mono text-white/30 w-12 shrink-0">({w.lastTrained})</p>
                                        </div>
                                    ))}
                                    <p className="text-[8px] font-mono text-amber-300/40">
                                        Muscles trained in the last 48 hours may not be fully recovered. Consider your intensity.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 mt-4">
                                {groupExercisesBySegment(viewExercises).map((group, gi) => (
                                    <div key={`${group.label}-${gi}`}>
                                        <p className="text-[10px] font-mono tracking-widest text-cyan-300/70 mb-2">{group.label.toUpperCase()}</p>
                                        <div className="space-y-2">
                                            {group.items.map((ex) => (
                                                <ReadOnlyRow key={ex.id} ex={ex} index={viewExercises.indexOf(ex)} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] font-mono text-white/25 mt-3 text-center">
                                From your weekly plan — edit above to change it. Swap/add exercises inside a live Workout session for one-off changes.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {addModalOpen && (
                <AddExerciseModal onAdd={handleAddExerciseToWeekly} onClose={() => setAddModalOpen(false)} existingIds={weeklyExistingIds} />
            )}
            {showDatabase && <ExerciseDatabaseModal onClose={() => setShowDatabase(false)} />}
        </main>
    );
}