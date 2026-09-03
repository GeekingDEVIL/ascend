"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, GripVertical, Pencil, Database, Settings2, Play, Moon, Flame, PersonStanding, ChevronDown, ChevronUp, X, Dumbbell, BarChart3, BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DndContext, closestCenter, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../../lib/supabase";
import { analyzeAdaptiveVolume, getVolumeStatus, getVolumeGuidelines, type AdaptiveVolumeData, type MuscleTrend } from "../../lib/volumeAnalysis";
import { analyzeRecovery, type MuscleRecoveryData } from "../../lib/muscleRecovery";
import type { Sex } from "../../lib/calorieEngine";
import { useSex } from "../../lib/useSex";
import { useUnits } from "../../lib/useUnits";
import { kgToUnit } from "../../lib/units";
import { QUICK_START_TEMPLATES, type QuickStartTemplate } from "../../lib/quickStartTemplates";
import { useAuth } from "../../lib/AuthProvider";
import AddExerciseModal from "../../components/AddExerciseModal";
import ExerciseDatabaseModal from "../../components/ExerciseDatabaseModal";
import MusclePickerModal from "../../components/MusclePickerModal";
import PlanBrowserModal from "../../components/PlanBrowserModal";
import type { WorkoutPlan } from "../../lib/planLibrary";

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
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mapExerciseRow(row: any): LocalExercise {
    const segment = row.exercises?.body_segment ?? "Other";
    return {
        id: row.id, isNew: false, exercise_id: row.exercise_id,
        name: row.exercises?.name ?? "Unknown", body_segment: segment,
        isCardio: segment === "Cardio",
        target_sets: row.target_sets ?? 1, target_reps: row.target_reps ?? "",
        target_weight: row.target_weight ?? null, rest_seconds: row.rest_seconds ?? null,
        notes: row.notes ?? "",
        target_duration_minutes: row.target_duration_minutes ?? null,
        target_incline: row.target_incline ?? null, target_speed: row.target_speed ?? null,
    };
}

function groupExercisesBySegment(list: LocalExercise[]) {
    const groups: { label: string; items: LocalExercise[] }[] = [];
    let currentLabel: string | null = null;
    for (const ex of list) {
        const label = ex.body_segment === "Cardio" ? "Finisher" : ex.body_segment || "Other";
        if (label !== currentLabel) { groups.push({ label, items: [] }); currentLabel = label; }
        groups[groups.length - 1].items.push(ex);
    }
    return groups;
}

function SetsStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1 rounded-md border border-[rgb(var(--accent-rgb)/0.2)] bg-white/[0.03] px-1 shrink-0">
            <button onClick={() => onChange(Math.max(1, value - 1))} className="w-6 h-7 flex items-center justify-center text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] rounded">−</button>
            <span className="w-5 text-center text-sm font-bold">{value}</span>
            <button onClick={() => onChange(value + 1)} className="w-6 h-7 flex items-center justify-center text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] rounded">+</button>
        </div>
    );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="text-center py-12">
            <div className="w-9 h-9 mx-auto mb-3 rotate-45 border-2 border-white/15 rounded-sm" />
            <p className="text-sm font-bold tracking-widest text-white/30">{title}</p>
            <p className="text-xs text-white/20 mt-1">{subtitle}</p>
        </div>
    );
}

function ReadOnlyRow({ ex, index }: { ex: LocalExercise; index: number }) {
    const wu = useUnits();
    return (
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <span className="text-[10px] font-mono text-white/25 w-5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
            <p className="text-[13px] font-medium text-white/85 flex-1 min-w-0 truncate">{ex.name}</p>
            {ex.isCardio ? (
                <div className="flex items-center gap-3 shrink-0">
                    {ex.target_duration_minutes != null && <div className="text-center"><p className="text-[8px] font-mono text-white/30 leading-none">MIN</p><p className="text-sm font-bold text-white/80">{ex.target_duration_minutes}</p></div>}
                    {ex.target_incline != null && <div className="text-center"><p className="text-[8px] font-mono text-white/30 leading-none">INCLINE</p><p className="text-sm font-bold text-white/80">{ex.target_incline}%</p></div>}
                    {ex.target_speed != null && <div className="text-center"><p className="text-[8px] font-mono text-white/30 leading-none">KM/H</p><p className="text-sm font-bold text-white/80">{ex.target_speed}</p></div>}
                </div>
            ) : (
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center"><p className="text-[8px] font-mono text-white/30 leading-none">SETS</p><p className="text-sm font-bold text-white/80">{ex.target_sets}</p></div>
                    <div className="text-center"><p className="text-[8px] font-mono text-white/30 leading-none">REPS</p><p className="text-sm font-bold text-white/80">{ex.target_reps}</p></div>
                    {ex.target_weight != null && <div className="text-center"><p className="text-[8px] font-mono text-white/30 leading-none">{wu.toUpperCase()}</p><p className="text-sm font-bold text-white/80">{Math.round(kgToUnit(ex.target_weight, wu))}</p></div>}
                </div>
            )}
        </div>
    );
}

function SortableRow({ ex, index, onUpdate, onRemove }: { ex: LocalExercise; index: number; onUpdate: (id: string, patch: Partial<LocalExercise>) => void; onRemove: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
    const [expanded, setExpanded] = useState(false);
    const swu = useUnits();
    return (
        <div ref={setNodeRef} style={style} className="rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 px-3 py-2.5">
                <button {...attributes} {...listeners} className="text-white/30 hover:text-[rgb(var(--accent-light-rgb))] cursor-grab active:cursor-grabbing shrink-0 touch-none"><GripVertical size={16} /></button>
                <span className="text-[10px] font-mono text-white/25 w-5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-[13px] font-medium text-white/85 flex-1 min-w-0 truncate">{ex.name}</p>
                {ex.isCardio ? (
                    <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="numeric" value={ex.target_duration_minutes ?? ""} onChange={(e) => onUpdate(ex.id, { target_duration_minutes: e.target.value ? Number(e.target.value) : null })} placeholder="MIN" className="w-14 shrink-0 rounded-md bg-white/[0.03] border border-[rgb(var(--accent-rgb)/0.2)] text-center text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                        <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="decimal" value={ex.target_incline ?? ""} onChange={(e) => onUpdate(ex.id, { target_incline: e.target.value ? Number(e.target.value) : null })} placeholder="%" className="w-12 shrink-0 rounded-md bg-white/[0.03] border border-[rgb(var(--accent-rgb)/0.2)] text-center text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                        <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="decimal" value={ex.target_speed ?? ""} onChange={(e) => onUpdate(ex.id, { target_speed: e.target.value ? Number(e.target.value) : null })} placeholder="KM/H" className="w-16 shrink-0 rounded-md bg-white/[0.03] border border-[rgb(var(--accent-rgb)/0.2)] text-center text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 shrink-0">
                        <SetsStepper value={ex.target_sets} onChange={(v) => onUpdate(ex.id, { target_sets: v })} />
                        <input type="text" value={ex.target_reps} onChange={(e) => onUpdate(ex.id, { target_reps: e.target.value })} className="w-14 shrink-0 rounded-md bg-white/[0.03] border border-[rgb(var(--accent-rgb)/0.2)] text-center text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                    </div>
                )}
                <button onClick={() => setExpanded((v) => !v)} className={`shrink-0 transition ${expanded ? "text-[rgb(var(--accent-light-rgb))]" : "text-white/30 hover:text-white/70"}`}><Settings2 size={15} /></button>
                <button onClick={() => onRemove(ex.id)} className="text-white/30 hover:text-red-400 transition shrink-0"><Trash2 size={16} /></button>
            </div>
            {expanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[9px] font-mono text-white/30">WEIGHT ({swu.toUpperCase()})</label>
                        <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="decimal" value={ex.target_weight ?? ""} onChange={(e) => onUpdate(ex.id, { target_weight: e.target.value ? Number(e.target.value) : null })} placeholder="—" className="w-full mt-1 rounded-md bg-white/[0.03] border border-white/10 text-center text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                    </div>
                    <div>
                        <label className="text-[9px] font-mono text-white/30">REST (SEC)</label>
                        <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} inputMode="numeric" value={ex.rest_seconds ?? ""} onChange={(e) => onUpdate(ex.id, { rest_seconds: e.target.value ? Number(e.target.value) : null })} placeholder="90" className="w-full mt-1 rounded-md bg-white/[0.03] border border-white/10 text-center text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[9px] font-mono text-white/30">NOTES</label>
                        <input type="text" value={ex.notes} onChange={(e) => onUpdate(ex.id, { notes: e.target.value })} placeholder="e.g. slow eccentric" className="w-full mt-1 rounded-md bg-white/[0.03] border border-white/10 px-2 text-sm py-1.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Day Editor Modal ────────────────────────────────────────────
function DayEditorModal({
    weekday, plan, onClose, onSaved,
    sensors, user, userSex,
}: {
    weekday: number;
    plan: RecurringPlan | undefined;
    onClose: () => void;
    onSaved: () => void;
    sensors: ReturnType<typeof useSensors>;
    user: any;
    userSex: string;
}) {
    const [title, setTitle] = useState(plan?.template_name || "");
    const [exercises, setExercises] = useState<LocalExercise[]>([]);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const [isRest, setIsRest] = useState(plan?.is_rest ?? false);
    const [templateId, setTemplateId] = useState<string | null>(plan?.template_id ?? null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editMode, setEditMode] = useState(!plan);
    const [addModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            if (plan?.template_id) {
                const { data: rows } = await supabase
                    .from("workout_template_exercises")
                    .select("id, order_index, target_sets, target_reps, target_weight, rest_seconds, notes, target_duration_minutes, target_incline, target_speed, exercise_id, exercises(name, body_segment)")
                    .eq("template_id", plan.template_id)
                    .order("order_index");
                setExercises((rows ?? []).map(mapExerciseRow));
            }
            setLoading(false);
        })();
    }, [plan]);

    function handleAdd(exercise: { id: string; name: string; body_segment?: string }) {
        const segment = exercise.body_segment || "Other";
        const cardio = segment === "Cardio";
        setExercises((prev) => {
            if (prev.some((e) => e.exercise_id === exercise.id)) return prev;
            return [...prev, {
                id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`, isNew: true, exercise_id: exercise.id, name: exercise.name,
                body_segment: segment, isCardio: cardio,
                target_sets: cardio ? 1 : 3, target_reps: cardio ? "" : "8-10", target_weight: null, rest_seconds: cardio ? null : 90, notes: "",
                target_duration_minutes: cardio ? 10 : null, target_incline: null, target_speed: null,
            }];
        });
    }

    function handleRemove(id: string) {
        const item = exercises.find((e) => e.id === id);
        if (item && !item.isNew) setDeletedIds((prev) => [...prev, id]);
        setExercises((prev) => prev.filter((e) => e.id !== id));
    }

    function handleUpdate(id: string, patch: Partial<LocalExercise>) {
        setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setExercises((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }

    async function handleSave() {
        if (!user) return;
        setSaving(true);

        if (isRest) {
            await supabase.from("recurring_plans").upsert(
                { user_id: user.id, weekday, template_id: null, is_rest: true, sex: userSex },
                { onConflict: "user_id,weekday,sex" }
            );
        } else {
            const finalTitle = title.trim() || `${WEEKDAY_FULL[weekday]} Plan`;
            let tid = templateId;
            if (!tid) {
                const { data: created } = await supabase.from("workout_templates").insert({ user_id: user.id, name: finalTitle }).select().single();
                tid = created?.id ?? null;
                setTemplateId(tid);
            } else {
                await supabase.from("workout_templates").update({ name: finalTitle }).eq("id", tid);
            }
            if (!tid) { setSaving(false); return; }

            if (deletedIds.length) await supabase.from("workout_template_exercises").delete().in("id", deletedIds);

            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                if (ex.isNew) {
                    await supabase.from("workout_template_exercises").insert({
                        template_id: tid, user_id: user.id, exercise_id: ex.exercise_id, order_index: i,
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
                { user_id: user.id, weekday, template_id: tid, is_rest: false, sex: userSex },
                { onConflict: "user_id,weekday,sex" }
            );
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => { onSaved(); onClose(); }, 400);
    }

    async function handleClear() {
        if (!user) return;
        if (!confirm(`Clear ${WEEKDAY_FULL[weekday]}'s plan?`)) return;
        await supabase.from("recurring_plans").delete().eq("user_id", user.id).eq("weekday", weekday).eq("sex", userSex);
        onSaved();
        onClose();
    }

    const hasContent = isRest || exercises.length > 0;
    const totalSets = exercises.reduce((sum, e) => sum + (e.target_sets || 0), 0);
    const existingIds = new Set(exercises.map((e) => e.exercise_id));

    const content = (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl max-h-[92vh] bg-[#0a0f1a] border border-[rgb(var(--accent-rgb)/0.15)] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white/90">{WEEKDAY_FULL[weekday]}</h2>
                        <p className="text-[10px] font-mono text-white/35 mt-0.5">
                            {isRest ? "Rest day" : plan ? `${exercises.length} exercises · ${totalSets} sets` : "No plan yet"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {plan && !editMode && (
                            <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 transition">
                                <Pencil size={11} /> EDIT
                            </button>
                        )}
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white/80 transition">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scroll px-5 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /></div>
                    ) : !editMode ? (
                        isRest ? (
                            <EmptyState title="REST DAY" subtitle="Recovery is part of the plan." />
                        ) : exercises.length === 0 ? (
                            <EmptyState title="NO EXERCISES" subtitle="Tap Edit to add exercises." />
                        ) : (
                            <div className="space-y-4">
                                {plan?.template_name && <p className="text-base font-bold text-white/90 mb-1">{plan.template_name}</p>}
                                {groupExercisesBySegment(exercises).map((group, gi) => (
                                    <div key={`${group.label}-${gi}`}>
                                        <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.6)] mb-2">{group.label.toUpperCase()}</p>
                                        <div className="space-y-1.5">
                                            {group.items.map((ex) => <ReadOnlyRow key={ex.id} ex={ex} index={exercises.indexOf(ex)} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <>
                            {/* Edit Mode Controls */}
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setIsRest((v) => !v)}
                                    className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-lg border transition ${isRest ? "border-orange-400/50 bg-orange-400/15 text-orange-200" : "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"}`}
                                >
                                    {isRest ? <><Flame size={12} /> MAKE TRAINING DAY</> : <><Moon size={12} /> MARK AS REST</>}
                                </button>
                                {plan && (
                                    <button onClick={handleClear} className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-red-400/20 text-red-400/60 hover:text-red-400 transition">
                                        <Trash2 size={11} /> CLEAR
                                    </button>
                                )}
                            </div>

                            {isRest ? (
                                <EmptyState title="REST DAY" subtitle="Every future occurrence stays a rest day." />
                            ) : (
                                <>
                                    <input
                                        type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                        placeholder={`${WEEKDAY_FULL[weekday]} Plan`}
                                        className="w-full bg-transparent text-base font-bold text-white/90 placeholder:text-white/25 focus:outline-none mb-4 border-b border-white/[0.06] pb-2 focus:border-[rgb(var(--accent-rgb)/0.4)]"
                                    />
                                    {exercises.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="glass-card p-2.5 text-center">
                                                <p className="text-[9px] font-mono text-white/30">EXERCISES</p>
                                                <p className="text-lg font-bold">{exercises.length}</p>
                                            </div>
                                            <div className="glass-card p-2.5 text-center">
                                                <p className="text-[9px] font-mono text-white/30">TOTAL SETS</p>
                                                <p className="text-lg font-bold">{totalSets}</p>
                                            </div>
                                        </div>
                                    )}
                                    {exercises.length === 0 ? (
                                        <EmptyState title="NO EXERCISES YET" subtitle="Add exercises to build this day." />
                                    ) : (
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2 mb-4">
                                                    {exercises.map((ex, i) => <SortableRow key={ex.id} ex={ex} index={i} onUpdate={handleUpdate} onRemove={handleRemove} />)}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                    <button
                                        onClick={() => setAddModalOpen(true)}
                                        className={`flex items-center gap-1.5 text-xs font-mono transition ${exercises.length === 0 ? "w-full justify-center px-4 py-2.5 rounded-lg bg-[rgb(var(--accent-rgb))] text-black font-bold hover:bg-[rgb(var(--accent-light-rgb))]" : "text-[rgb(var(--accent-light-rgb))] hover:text-[rgb(var(--accent-light-rgb))]"}`}
                                    >
                                        <Plus size={14} /> ADD EXERCISE
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer — Save button in edit mode */}
                {editMode && (
                    <div className="px-5 py-3 border-t border-white/[0.06] shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={!hasContent || saving}
                            className="w-full py-3 rounded-lg font-bold text-sm bg-[rgb(var(--accent-rgb))] text-black hover:bg-[rgb(var(--accent-light-rgb))] disabled:opacity-30 transition"
                            style={{ boxShadow: hasContent ? "0 0 20px -4px rgb(var(--accent-rgb) / 0.5)" : undefined }}
                        >
                            {saved ? "SAVED ✓" : saving ? "SAVING..." : "SAVE"}
                        </button>
                    </div>
                )}
            </div>

            {addModalOpen && <AddExerciseModal onAdd={handleAdd} onClose={() => setAddModalOpen(false)} existingIds={existingIds} />}
        </div>
    );

    return createPortal(content, document.body);
}

// ─── Main Page ───────────────────────────────────────────────────
export default function SchedulePage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"week" | "today">("today");
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
    const [showDatabase, setShowDatabase] = useState(false);
    const [showMusclePicker, setShowMusclePicker] = useState(false);

    const [recurringPlans, setRecurringPlans] = useState<Record<number, RecurringPlan>>({});
    const [recurringLoaded, setRecurringLoaded] = useState(false);

    const [editorWeekday, setEditorWeekday] = useState<number | null>(null);

    const [viewLoading, setViewLoading] = useState(true);
    const [viewExercises, setViewExercises] = useState<LocalExercise[]>([]);
    const [recoveryWarnings, setRecoveryWarnings] = useState<{ segment: string; pct: number; status: string; lastTrained: string }[]>([]);
    const [weeklyVolume, setWeeklyVolume] = useState<{ segment: string; sets: number; days: number }[]>([]);
    const [adaptiveData, setAdaptiveData] = useState<Record<string, AdaptiveVolumeData>>({});
    const [adaptiveLoaded, setAdaptiveLoaded] = useState(false);
    const [importingTemplate, setImportingTemplate] = useState<string | null>(null);
    const [planBrowserOpen, setPlanBrowserOpen] = useState(searchParams.get("browse") === "1");
    const [importingPlan, setImportingPlan] = useState(false);
    const [importConfirm, setImportConfirm] = useState<{ plan: WorkoutPlan; label: string } | null>(null);
    const [volumeExpanded, setVolumeExpanded] = useState(false);
    const [todayAddModal, setTodayAddModal] = useState(false);
    const { sex: userSex } = useSex();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const calendarRef = useRef<HTMLDivElement>(null);
    const weekDates = getWeekDates(weekOffset);
    const today = toDateString(new Date());

    // ── Load recurring plans ──
    const loadRecurring = useCallback(async () => {
        if (!user) return;
        const { data: plans } = await supabase
            .from("recurring_plans")
            .select("weekday, template_id, is_rest, workout_templates(name)")
            .eq("user_id", user.id)
            .eq("sex", userSex ?? "male");

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
                template_id: p.template_id, is_rest: p.is_rest,
                template_name: p.workout_templates?.name ?? "",
                exercise_count: p.template_id ? (countByTemplate[p.template_id] ?? 0) : 0,
                muscles: p.template_id && musclesByTemplate[p.template_id] ? Array.from(musclesByTemplate[p.template_id]) : [],
            };
        });
        setRecurringPlans(map);
        setRecurringLoaded(true);

        if (templateIds.length) {
            const { data: allExRows } = await supabase
                .from("workout_template_exercises")
                .select("template_id, target_sets, exercises(body_segment)")
                .in("template_id", templateIds);
            const templateToWeekdays: Record<string, number> = {};
            (plans ?? []).forEach((p: any) => { if (p.template_id && !p.is_rest) templateToWeekdays[p.template_id] = (templateToWeekdays[p.template_id] ?? 0) + 1; });
            const volMap: Record<string, { sets: number; daySet: Set<string> }> = {};
            (allExRows ?? []).forEach((r: any) => {
                const seg = r.exercises?.body_segment;
                if (!seg || seg === "Cardio") return;
                const timesPerWeek = templateToWeekdays[r.template_id] ?? 1;
                if (!volMap[seg]) volMap[seg] = { sets: 0, daySet: new Set() };
                volMap[seg].sets += (r.target_sets ?? 0) * timesPerWeek;
                volMap[seg].daySet.add(r.template_id);
            });
            setWeeklyVolume(Object.entries(volMap).map(([segment, v]) => ({ segment, sets: v.sets, days: v.daySet.size })).sort((a, b) => b.sets - a.sets));
        } else {
            setWeeklyVolume([]);
        }
    }, [user, userSex]);

    useEffect(() => { loadRecurring(); }, [loadRecurring]);

    // ── Quick Start import ──
    async function importQuickStartTemplate(tpl: QuickStartTemplate) {
        if (!user) return;
        setImportingTemplate(tpl.key);
        const allNames = Array.from(new Set(tpl.days.flatMap((d) => d.exerciseNames)));
        const { data: exRows } = await supabase.from("exercises").select("id, name").in("name", allNames);
        const idByName: Record<string, string> = {};
        (exRows ?? []).forEach((e: any) => { idByName[e.name] = e.id; });
        const templateIdBySignature: Record<string, string> = {};
        for (const day of tpl.days) {
            const signature = `${day.dayName}::${day.exerciseNames.join(",")}`;
            let templateId = templateIdBySignature[signature];
            if (!templateId) {
                const { data: template } = await supabase.from("workout_templates").insert({ user_id: user.id, name: day.dayName }).select("id").single();
                if (!template) continue;
                templateId = template.id;
                templateIdBySignature[signature] = templateId;
                const rows = day.exerciseNames.map((name, i) => ({ template_id: templateId, user_id: user.id, exercise_id: idByName[name], order_index: i, target_sets: 3, target_reps: "8-12" })).filter((r) => r.exercise_id);
                if (rows.length) await supabase.from("workout_template_exercises").insert(rows);
            }
            await supabase.from("recurring_plans").upsert({ user_id: user.id, weekday: day.weekday, template_id: templateId, is_rest: false, sex: userSex ?? "male" }, { onConflict: "user_id,weekday,sex" });
        }
        await loadRecurring();
        setImportingTemplate(null);
    }

    // ── Plan Library import ──
    const WEEKDAY_MAP: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    function parseSchedule(schedule: string): number[] {
        const rangeMatch = schedule.match(/^(\w{3})[–-](\w{3})$/);
        if (rangeMatch) {
            const start = WEEKDAY_MAP[rangeMatch[1]];
            const end = WEEKDAY_MAP[rangeMatch[2]];
            if (start !== undefined && end !== undefined) {
                const days: number[] = [];
                for (let i = start; i <= end; i++) days.push(i);
                return days;
            }
        }
        const parts = schedule.split(/[\/,&]+/).map((s) => s.trim());
        const weekdays: number[] = [];
        for (const part of parts) {
            for (const [abbr, wd] of Object.entries(WEEKDAY_MAP)) {
                if (part.startsWith(abbr)) { weekdays.push(wd); break; }
            }
        }
        return weekdays;
    }

    function importPlanFromLibrary(plan: WorkoutPlan) {
        if (!user) return;
        if (hasPlan) {
            const currentPlanNames = [...new Set(Object.values(recurringPlans).filter(p => !p.is_rest && p.template_name).map(p => p.template_name))];
            const currentLabel = currentPlanNames.length > 0 ? currentPlanNames.join(", ") : "your current plan";
            setImportConfirm({ plan, label: currentLabel });
            return;
        }
        executeImport(plan);
    }

    async function executeImport(plan: WorkoutPlan) {
        if (!user) return;
        setImportConfirm(null);
        setImportingPlan(true);
        try {
            const allNames = Array.from(new Set(plan.workouts.flatMap((d) => d.exercises.map((e) => e.name).filter(Boolean))));
            const { data: exRows } = await supabase.from("exercises").select("id, name").in("name", allNames);
            const idByName: Record<string, string> = {};
            (exRows ?? []).forEach((e: any) => { idByName[e.name] = e.id; });
            const unmatched = allNames.filter((n) => !idByName[n]);
            if (unmatched.length > 0) {
                const { data: allEx } = await supabase.from("exercises").select("id, name");
                if (allEx) {
                    const lowerMap: Record<string, { id: string; name: string }> = {};
                    allEx.forEach((e: any) => { lowerMap[e.name.toLowerCase()] = e; });
                    for (const name of unmatched) {
                        const found = lowerMap[name.toLowerCase()];
                        if (found) idByName[name] = found.id;
                    }
                }
            }
            function parseRest(rest: string): number | null { const m = rest.match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }
            const weekdays = parseSchedule(plan.schedule);
            for (const day of plan.workouts) {
                const wd = weekdays[day.dayNum - 1];
                if (wd === undefined) continue;
                const templateName = `${plan.name} — ${day.focus}`;
                const { data: template } = await supabase.from("workout_templates").insert({ user_id: user.id, name: templateName }).select("id").single();
                if (!template) continue;
                const rows = day.exercises.map((ex, i) => ({ template_id: template.id, user_id: user.id, exercise_id: idByName[ex.name], order_index: i, target_sets: ex.sets, target_reps: ex.reps, rest_seconds: parseRest(ex.rest) })).filter((r) => r.exercise_id);
                if (rows.length) await supabase.from("workout_template_exercises").insert(rows);
                await supabase.from("recurring_plans").upsert({ user_id: user.id, weekday: wd, template_id: template.id, is_rest: false, sex: userSex ?? "male" }, { onConflict: "user_id,weekday,sex" });
            }
            await loadRecurring();
            setPlanBrowserOpen(false);
        } catch (e) {
            console.error("Plan import failed:", e);
        } finally {
            setImportingPlan(false);
        }
    }

    useEffect(() => {
        if (!user) return;
        analyzeAdaptiveVolume(user.id, userSex ?? "male").then((data) => { setAdaptiveData(data); setAdaptiveLoaded(true); });
    }, [user, userSex]);

    useEffect(() => {
        setTimeout(() => {
            const container = calendarRef.current;
            if (!container) return;
            const todayCard = container.querySelector<HTMLElement>("[data-today='true']");
            if (todayCard) todayCard.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        }, 100);
    }, [weekOffset]);

    // ── Load selected day view ──
    const loadSelectedDayView = useCallback(async () => {
        if (!recurringLoaded) return;
        setViewLoading(true);
        const weekday = new Date(selectedDate + "T00:00:00").getDay();
        const plan = recurringPlans[weekday];
        if (!plan || plan.is_rest || !plan.template_id) { setViewExercises([]); setRecoveryWarnings([]); setViewLoading(false); return; }
        const { data: rows } = await supabase
            .from("workout_template_exercises")
            .select("id, order_index, target_sets, target_reps, target_weight, target_duration_minutes, target_incline, target_speed, exercise_id, exercises(name, body_segment)")
            .eq("template_id", plan.template_id)
            .order("order_index");
        setViewExercises((rows ?? []).map(mapExerciseRow));
        setViewLoading(false);

        if (user) {
            const todaysMuscles = new Set((rows ?? []).map((r: any) => r.exercises?.body_segment).filter(Boolean));
            if (todaysMuscles.size > 0) {
                const { data: recoveryMap } = await analyzeRecovery(user.id, userSex);
                const warnings: { segment: string; pct: number; status: string; lastTrained: string }[] = [];
                for (const seg of todaysMuscles) {
                    const rd = recoveryMap[seg];
                    if (rd && rd.recoveryPct < 85) {
                        warnings.push({
                            segment: seg,
                            pct: rd.recoveryPct,
                            status: rd.status,
                            lastTrained: rd.lastTrainedAt ? new Date(rd.lastTrainedAt).toLocaleDateString(undefined, { weekday: "short" }) : "—",
                        });
                    }
                }
                setRecoveryWarnings(warnings.sort((a, b) => a.pct - b.pct));
            } else { setRecoveryWarnings([]); }
        }
    }, [selectedDate, recurringPlans, recurringLoaded, user, userSex]);

    useEffect(() => { loadSelectedDayView(); }, [loadSelectedDayView]);

    async function handleAddExerciseToday(exercise: { id: string; name: string; body_segment?: string }) {
        if (!user || !selectedPlan?.template_id) return;
        const segment = exercise.body_segment || "Other";
        const cardio = segment === "Cardio";
        await supabase.from("workout_template_exercises").insert({
            template_id: selectedPlan.template_id, user_id: user.id, exercise_id: exercise.id,
            order_index: viewExercises.length,
            target_sets: cardio ? 1 : 3, target_reps: cardio ? "" : "8-10", target_weight: null,
            rest_seconds: cardio ? null : 90, notes: "",
            target_duration_minutes: cardio ? 10 : null, target_incline: null, target_speed: null,
        });
        loadSelectedDayView();
        loadRecurring();
    }

    const dayLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" });
    const selectedWeekday = new Date(selectedDate + "T00:00:00").getDay();
    const selectedPlan = recurringPlans[selectedWeekday];
    const viewTotalSets = viewExercises.reduce((sum, e) => sum + (e.target_sets || 0), 0);

    const hasPlan = recurringLoaded && Object.keys(recurringPlans).length > 0;
    const trainingDays = Object.values(recurringPlans).filter((p) => !p.is_rest).length;
    const restDays = Object.values(recurringPlans).filter((p) => p.is_rest).length;

    return (
        <main className="relative min-h-screen w-full max-w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
            <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-[rgb(var(--accent-rgb)/0.1)] rounded-full blur-[130px]" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.7)_100%)]" />

            <div className="relative z-10 w-full max-w-xl mx-auto space-y-5">
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold font-display tracking-wide text-[rgb(var(--accent-light-rgb))]">Schedule</h1>
                        <p className="text-white/35 text-xs mt-0.5 font-mono">
                            {hasPlan ? `${trainingDays} training · ${restDays} rest · ${7 - trainingDays - restDays} unset` : "Set your week once. It repeats."}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setShowMusclePicker(true)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/35 hover:text-white/70 hover:border-[rgb(var(--accent-rgb)/0.3)] transition" title="Muscle Map"><PersonStanding size={16} /></button>
                        <button onClick={() => setShowDatabase(true)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/35 hover:text-white/70 hover:border-[rgb(var(--accent-rgb)/0.3)] transition" title="Exercise Database"><Database size={16} /></button>
                        <button onClick={() => setPlanBrowserOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/35 hover:text-white/70 hover:border-[rgb(var(--accent-rgb)/0.3)] transition" title="Plan Library"><BookOpen size={16} /></button>
                    </div>
                </div>

                {/* ─── Tabs ─── */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <button
                        onClick={() => setActiveTab("today")}
                        className={`py-2 rounded-lg text-xs font-bold tracking-wide transition ${activeTab === "today" ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb))] border border-[rgb(var(--accent-rgb)/0.3)]" : "text-white/40 hover:text-white/60 border border-transparent"}`}
                    >
                        TODAY
                    </button>
                    <button
                        onClick={() => setActiveTab("week")}
                        className={`py-2 rounded-lg text-xs font-bold tracking-wide transition ${activeTab === "week" ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb))] border border-[rgb(var(--accent-rgb)/0.3)]" : "text-white/40 hover:text-white/60 border border-transparent"}`}
                    >
                        MY WEEK
                    </button>
                </div>

                {activeTab === "week" ? (
                    <>
                        {/* ─── Empty State: No Plan ─── */}
                        {recurringLoaded && !hasPlan && (
                            <div className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.2)] bg-gradient-to-b from-[rgb(var(--accent-rgb)/0.06)] to-transparent p-6 text-center">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl border border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] flex items-center justify-center">
                                    <Dumbbell size={24} className="text-[rgb(var(--accent-light-rgb))]" />
                                </div>
                                <h2 className="text-lg font-bold text-white/90 mb-1">No plan yet</h2>
                                <p className="text-xs text-white/35 mb-5 max-w-xs mx-auto">Import a proven program or build your own — tap any day below to start.</p>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {QUICK_START_TEMPLATES.slice(0, 4).map((tpl) => (
                                        <button
                                            key={tpl.key}
                                            onClick={() => importQuickStartTemplate(tpl)}
                                            disabled={importingTemplate !== null}
                                            className="text-left rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 hover:border-[rgb(var(--accent-rgb)/0.3)] disabled:opacity-40 transition"
                                        >
                                            <p className="text-[11px] font-bold text-white/80 truncate">{tpl.name}</p>
                                            <p className="text-[9px] font-mono text-white/30 mt-0.5">{tpl.daysPerWeek}D/WK · {tpl.muscleCoverage}</p>
                                            {importingTemplate === tpl.key && <p className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb))] mt-1">Importing...</p>}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPlanBrowserOpen(true)}
                                    className="w-full py-2.5 rounded-xl border border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.08)] text-xs font-bold text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.15)] transition"
                                >
                                    Browse 70+ Pro Plans →
                                </button>
                            </div>
                        )}

                        {/* ─── 7-Day Cards ─── */}
                        <div className="space-y-2">
                            {WEEKDAY_ORDER.map((wd) => {
                                const plan = recurringPlans[wd];
                                const todayWd = new Date().getDay();
                                const isToday = wd === todayWd;
                                return (
                                    <button
                                        key={wd}
                                        onClick={() => setEditorWeekday(wd)}
                                        className={`w-full text-left rounded-xl border p-3.5 transition active:scale-[0.98] group ${
                                            plan?.is_rest
                                                ? "border-emerald-400/15 bg-emerald-400/[0.03] hover:border-emerald-400/30"
                                                : plan
                                                    ? "border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.02] hover:border-[rgb(var(--accent-rgb)/0.35)]"
                                                    : "border-white/[0.06] bg-white/[0.01] hover:border-white/15"
                                        } ${isToday ? "ring-1 ring-[rgb(var(--accent-rgb)/0.3)]" : ""}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Day indicator */}
                                            <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                                                plan?.is_rest ? "bg-emerald-400/10" : plan ? "bg-[rgb(var(--accent-rgb)/0.1)]" : "bg-white/[0.03]"
                                            }`}>
                                                <span className={`text-[9px] font-mono leading-none ${plan?.is_rest ? "text-emerald-300/60" : plan ? "text-[rgb(var(--accent-light-rgb)/0.6)]" : "text-white/25"}`}>
                                                    {WEEKDAY_LABELS[wd].slice(0, 3)}
                                                </span>
                                                {isToday && <span className="w-1 h-1 rounded-full bg-[rgb(var(--accent-light-rgb))] mt-0.5" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {plan ? (
                                                    plan.is_rest ? (
                                                        <>
                                                            <p className="text-sm font-medium text-emerald-300/80">Rest Day</p>
                                                            <p className="text-[10px] font-mono text-emerald-300/30">Recovery</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-medium text-white/85 truncate">{plan.template_name || "Workout"}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-mono text-white/30">{plan.exercise_count} exercises</span>
                                                                {plan.muscles.length > 0 && (
                                                                    <span className="text-[10px] font-mono text-white/20 truncate">{plan.muscles.slice(0, 3).join(" · ")}</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    <>
                                                        <p className="text-sm text-white/25">No plan</p>
                                                        <p className="text-[10px] font-mono text-white/15">Tap to set up</p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Chevron */}
                                            <ChevronDown size={14} className="text-white/15 group-hover:text-white/30 transition shrink-0 -rotate-90" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ─── Weekly Volume (collapsible) ─── */}
                        {weeklyVolume.length > 0 && (
                            <div className="glass-card">
                                <button
                                    onClick={() => setVolumeExpanded((v) => !v)}
                                    className="w-full flex items-center justify-between px-4 py-3 transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <BarChart3 size={14} className="text-white/30" />
                                        <span className="text-[10px] font-mono tracking-widest text-white/40">WEEKLY VOLUME</span>
                                        {adaptiveLoaded && Object.values(adaptiveData).some((d) => d.hasEnoughData) && (
                                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-light-rgb)/0.6)]">PERSONALIZED</span>
                                        )}
                                    </div>
                                    {volumeExpanded ? <ChevronUp size={14} className="text-white/25" /> : <ChevronDown size={14} className="text-white/25" />}
                                </button>

                                {volumeExpanded && (
                                    <div className="px-4 pb-4 space-y-3">
                                        {weeklyVolume.map((v) => {
                                            const guide = getVolumeGuidelines(userSex)[v.segment] ?? { min: 8, max: 20, note: "" };
                                            const adaptive = adaptiveData[v.segment];
                                            const status = getVolumeStatus(v.segment, v.sets, adaptive, userSex);
                                            const usePersonal = adaptive?.hasEnoughData && adaptive.personalMin !== null && adaptive.personalMax !== null;
                                            const min = usePersonal ? adaptive!.personalMin! : guide.min;
                                            const max = usePersonal ? adaptive!.personalMax! : guide.max;
                                            const barMax = Math.max(max + 4, v.sets);
                                            const pct = Math.min(100, (v.sets / barMax) * 100);
                                            const optStartPct = (min / barMax) * 100;
                                            const optEndPct = (max / barMax) * 100;
                                            const trendIcon = status.trend === "improving" ? "↑" : status.trend === "maintaining" ? "→" : status.trend === "stalling" ? "↓" : status.trend === "declining" ? "↓↓" : null;
                                            const trendColor = status.trend === "improving" ? "text-emerald-300" : status.trend === "maintaining" ? "text-white/40" : status.trend === "stalling" ? "text-amber-300" : status.trend === "declining" ? "text-red-400" : "";
                                            return (
                                                <div key={v.segment}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-mono text-white/60">{v.segment}</p>
                                                            {trendIcon && <span className={`text-[9px] font-mono font-bold ${trendColor}`}>{trendIcon}</span>}
                                                            {adaptive?.performanceChangePct !== null && adaptive?.performanceChangePct !== undefined && adaptive.hasEnoughData && (
                                                                <span className={`text-[8px] font-mono ${adaptive.performanceChangePct >= 0 ? "text-emerald-300/60" : "text-red-400/60"}`}>{adaptive.performanceChangePct >= 0 ? "+" : ""}{adaptive.performanceChangePct.toFixed(1)}%</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] font-mono font-bold ${status.color}`}>{status.label}</span>
                                                            <span className="text-xs font-bold font-mono text-white/70">{v.sets}</span>
                                                            <span className="text-[8px] font-mono text-white/30">/ {min}–{max}</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                                                        <div className="absolute top-0 bottom-0 rounded-full bg-[rgb(var(--accent-rgb)/0.1)]" style={{ left: `${optStartPct}%`, width: `${optEndPct - optStartPct}%` }} />
                                                        <div
                                                            className={`absolute top-0 bottom-0 left-0 rounded-full transition-all ${status.label === "NONE" ? "bg-white/10" : status.label === "LOW" ? "bg-amber-400/70" : status.label === "OPTIMAL" ? "bg-[rgb(var(--accent-rgb)/0.7)]" : status.label === "HIGH" ? "bg-orange-400/70" : "bg-red-400/70"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    {status.tip && <p className={`text-[9px] font-mono mt-1 ${status.color} opacity-70`}>{status.tip}</p>}
                                                </div>
                                            );
                                        })}
                                        <p className="text-[8px] font-mono text-white/20 pt-1">
                                            {adaptiveLoaded && Object.values(adaptiveData).some((d) => d.hasEnoughData) ? "✦ = personalized from your training history." : "General guidelines — personalize after 4+ weeks of logging."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* ─── TODAY TAB ─── */
                    <>
                        {/* Calendar Strip */}
                        <div className="glass-card p-3">
                            <div className="flex items-center justify-between mb-2.5 gap-2">
                                <button onClick={() => setWeekOffset((w) => w - 1)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.06] text-white/35 hover:text-[rgb(var(--accent-light-rgb))] transition">←</button>
                                <div className="text-center min-w-0">
                                    <p className="text-[10px] font-mono text-white/40">
                                        {weekDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – {weekDates[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                    </p>
                                    {(weekOffset !== 0 || selectedDate !== today) && (
                                        <button onClick={() => { setWeekOffset(0); setSelectedDate(today); }} className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.6)] hover:text-[rgb(var(--accent-light-rgb))] transition">JUMP TO TODAY</button>
                                    )}
                                </div>
                                <button onClick={() => setWeekOffset((w) => w + 1)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.06] text-white/35 hover:text-[rgb(var(--accent-light-rgb))] transition">→</button>
                            </div>

                            <div ref={calendarRef} className="grid grid-cols-7 gap-1.5">
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
                                            className={`relative flex flex-col items-center rounded-xl border py-2.5 transition active:scale-[0.95] ${
                                                isSelected
                                                    ? "border-[rgb(var(--accent-rgb)/0.5)] bg-[rgb(var(--accent-rgb)/0.1)]"
                                                    : "border-white/[0.04] bg-white/[0.01] hover:border-white/10"
                                            }`}
                                        >
                                            <span className="text-[8px] font-mono text-white/30">{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2).toUpperCase()}</span>
                                            <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-white/70"}`}>{d.getDate()}</span>
                                            <span className={`w-1.5 h-1.5 rounded-full mt-1 ${plan ? (plan.is_rest ? "bg-emerald-400/50" : "bg-[rgb(var(--accent-rgb)/0.6)]") : "bg-white/10"}`} />
                                            {isToday && <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[rgb(var(--accent-light-rgb))]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Day Detail */}
                        <div className="rounded-xl border border-[rgb(var(--accent-rgb)/0.12)] bg-white/[0.02] p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div>
                                    <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.6)]">{dayLabel.toUpperCase()}</p>
                                    <p className="text-lg font-bold text-white/90 mt-0.5">
                                        {selectedPlan?.is_rest ? "Rest / Recovery" : selectedPlan?.template_name || "No Plan"}
                                    </p>
                                </div>
                                {selectedDate === today && selectedPlan && !selectedPlan.is_rest && viewExercises.length > 0 && (
                                    <button
                                        onClick={() => router.push("/workout")}
                                        className="flex items-center gap-1.5 text-[10px] font-mono px-4 py-2 rounded-xl bg-[rgb(var(--accent-rgb))] text-black font-bold hover:bg-[rgb(var(--accent-light-rgb))] transition"
                                        style={{ boxShadow: "0 0 20px -4px rgb(var(--accent-rgb) / 0.5)" }}
                                    >
                                        <Play size={11} fill="black" /> START WORKOUT
                                    </button>
                                )}
                            </div>

                            {viewLoading ? (
                                <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /></div>
                            ) : !selectedPlan ? (
                                <EmptyState title="NO PLAN" subtitle="Set a plan in My Week to fill this day." />
                            ) : selectedPlan.is_rest ? (
                                <EmptyState title="REST DAY" subtitle="Recovery is part of the plan too." />
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="glass-card p-2.5 text-center">
                                            <p className="text-[8px] font-mono text-white/30">EXERCISES</p>
                                            <p className="text-base font-bold">{viewExercises.length}</p>
                                        </div>
                                        <div className="glass-card p-2.5 text-center">
                                            <p className="text-[8px] font-mono text-white/30">SETS</p>
                                            <p className="text-base font-bold">{viewTotalSets}</p>
                                        </div>
                                        <div className="glass-card p-2.5 text-center">
                                            <p className="text-[8px] font-mono text-white/30">EST. TIME</p>
                                            <p className="text-base font-bold">{viewTotalSets * 3}m</p>
                                        </div>
                                    </div>

                                    {recoveryWarnings.length > 0 && (
                                        <div className="mb-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.03] p-3 space-y-2">
                                            <p className="text-[10px] font-mono tracking-widest text-amber-300/70">RECOVERY STATUS</p>
                                            {recoveryWarnings.map((w) => (
                                                <div key={w.segment} className="flex items-center gap-3">
                                                    <p className="text-[10px] font-mono text-white/50 w-20 shrink-0">{w.segment}</p>
                                                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div className={`h-full rounded-full ${w.pct < 25 ? "bg-red-400/70" : w.pct < 50 ? "bg-orange-400/70" : w.pct < 80 ? "bg-amber-300/70" : "bg-cyan-400/60"}`} style={{ width: `${w.pct}%` }} />
                                                    </div>
                                                    <p className={`text-[10px] font-mono font-bold w-10 text-right ${w.pct < 25 ? "text-red-400" : w.pct < 50 ? "text-orange-400" : w.pct < 80 ? "text-amber-300" : "text-cyan-300"}`}>{w.pct}%</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {groupExercisesBySegment(viewExercises).map((group, gi) => (
                                            <div key={`${group.label}-${gi}`}>
                                                <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.5)] mb-2">{group.label.toUpperCase()}</p>
                                                <div className="space-y-1.5">
                                                    {group.items.map((ex) => <ReadOnlyRow key={ex.id} ex={ex} index={viewExercises.indexOf(ex)} />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setTodayAddModal(true)}
                                        className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[rgb(var(--accent-rgb)/0.25)] py-3 text-xs font-mono text-[rgb(var(--accent-light-rgb)/0.6)] hover:border-[rgb(var(--accent-rgb)/0.5)] hover:text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.05)] transition"
                                    >
                                        <Plus size={14} /> Add Exercise
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ─── Modals ─── */}
            {editorWeekday !== null && (
                <DayEditorModal
                    weekday={editorWeekday}
                    plan={recurringPlans[editorWeekday]}
                    onClose={() => setEditorWeekday(null)}
                    onSaved={() => loadRecurring()}
                    sensors={sensors}
                    user={user}
                    userSex={userSex ?? "male"}
                />
            )}
            {todayAddModal && selectedPlan?.template_id && (
                <AddExerciseModal
                    onAdd={handleAddExerciseToday}
                    onClose={() => setTodayAddModal(false)}
                    existingIds={new Set(viewExercises.map(e => e.exercise_id))}
                />
            )}
            {showDatabase && <ExerciseDatabaseModal onClose={() => setShowDatabase(false)} />}
            {showMusclePicker && <MusclePickerModal onClose={() => setShowMusclePicker(false)} />}
            <PlanBrowserModal open={planBrowserOpen} onClose={() => setPlanBrowserOpen(false)} onImport={importPlanFromLibrary} importing={importingPlan} userSex={userSex} />

            {importConfirm && createPortal(
                <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#080d18] p-5">
                        <p className="text-sm font-semibold text-white/85 mb-2">Switch plan?</p>
                        <p className="text-[11px] text-white/35 mb-4">
                            Replace <span className="text-white/60">{importConfirm.label}</span> with <span className="text-white/60">{importConfirm.plan.name}</span>? This will update the days this plan uses.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setImportConfirm(null)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 transition">
                                Cancel
                            </button>
                            <button onClick={() => executeImport(importConfirm.plan)} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                                Switch
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </main>
    );
}
