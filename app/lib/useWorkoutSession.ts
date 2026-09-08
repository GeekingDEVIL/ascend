"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./AuthProvider";
import { calculateSessionXP, type XPBreakdown } from "./xpEngine";
import { generateWarmupSets } from "./warmupSets";
import { computeLevel, getRank } from "./levelSystem";
import { checkAndAwardAchievements } from "./achievements";
import { updateUserStats } from "./updateUserStats";
import { updateExerciseLeaderboard } from "./updateExerciseLeaderboard";
import { useSex } from "./useSex";
import { useUnits } from "./useUnits";
import { kgToUnit, weightInputToKg } from "./units";
import { fetchCycleTrainingData, assessExerciseRisk, getCycleAdjustedWeight, type PhaseTrainingProfile, type EnergyForecast, type ExerciseRisk } from "./cycleTrainingEngine";
import { findSubstitutions, type Substitution } from "./substitutionEngine";
import { useEquipment } from "./useEquipment";
import { autoCompleteHabits } from "./habitAutoComplete";

/* ─── TYPES ─── */
export type WorkoutExercise = {
    id: string;
    exercise_id: string;
    order_index: number;
    target_sets: number;
    target_reps: string;
    target_weight: number | null;
    rest_seconds: number | null;
    name: string;
    category: string;
    equipment: string;
    body_segment: string;
    isCardio: boolean;
    isBodyweight: boolean;
};

export type SetEntry = {
    index: number;
    weight: string;
    reps: string;
    duration: string;
    distance: string;
    note: string;
    completed: boolean;
    logId: string | null;
    is_warmup?: boolean;
    warmup_label?: string;
};

export type SessionStatus = "loading" | "not_started" | "active" | "completed" | "rest_day" | "no_plan" | "freestyle";

export type OverloadSuggestion = {
    type: "weight_up" | "reps_up" | "first_time" | "maintain";
    text: string;
    suggestedWeight: number | null;
};

export type SessionSummary = {
    duration: number;
    sets: number;
    volume: number;
    xpBreakdown: XPBreakdown;
    level: number;
    rankName: string;
};

export type TodaySession = {
    id: string;
    duration: number;
    sets: number;
    volume: number;
    xp: number;
};

export type RecentSession = {
    id: string;
    date: string;
    title: string;
    sets: number;
    volume: number;
    xp: number;
};

/* ─── HELPERS ─── */
export function toDateString(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatClock(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function emptySet(i: number): SetEntry {
    return { index: i, weight: "", reps: "", duration: "", distance: "", note: "", completed: false, logId: null };
}

function computeOverload(lastW: number | null, lastR: number | null, targetReps: string, unit: "kg" | "lbs" = "kg"): OverloadSuggestion {
    if (lastW === null || lastR === null) return { type: "first_time", text: "First session — establish your baseline", suggestedWeight: null };
    const maxTarget = Number(targetReps.split("-").pop()) || 10;
    if (lastR >= maxTarget) {
        const next = lastW < 20 ? lastW + 1 : lastW < 50 ? lastW + 2.5 : lastW + 5;
        return { type: "weight_up", text: `Hit ${lastR} reps → increase to ${kgToUnit(next, unit)}${unit}`, suggestedWeight: next };
    }
    return { type: "reps_up", text: `Got ${lastR} reps @ ${kgToUnit(lastW, unit)}${unit} → aim for ${lastR + 1}+`, suggestedWeight: lastW };
}

const MAX_SESSIONS_PER_DAY = 3;

/* ─── HOOK ─── */
export function useWorkoutSession() {
    const { user } = useAuth();
    const { sex: userSex } = useSex();
    const { equipmentAccess } = useEquipment();
    const weightUnit = useUnits();

    const today = toDateString(new Date());
    const loadInFlight = useRef(false);

    /* ── STATE ── */
    const [status, setStatus] = useState<SessionStatus>("loading");
    const [dayTitle, setDayTitle] = useState("");
    const [scheduledDayId, setScheduledDayId] = useState<string | null>(null);
    const [exercisesList, setExercisesList] = useState<WorkoutExercise[]>([]);
    const [logs, setLogs] = useState<Record<string, SetEntry[]>>({});
    const [lastPerformance, setLastPerformance] = useState<Record<string, { weight: number | null; reps: number | null }>>({});
    const [overloadHints, setOverloadHints] = useState<Record<string, OverloadSuggestion>>({});
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [restRemaining, setRestRemaining] = useState<number | null>(null);
    const [restPaused, setRestPaused] = useState(false);
    const [sessionPaused, setSessionPaused] = useState(false);
    const [pausedElapsed, setPausedElapsed] = useState(0);
    const [swapTargetId, setSwapTargetId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [preWorkoutWeight, setPreWorkoutWeight] = useState("");
    const [weightLogged, setWeightLogged] = useState(false);
    const [confirmedExercises, setConfirmedExercises] = useState<Set<string>>(new Set());
    const [prCount, setPrCount] = useState(0);
    const [summary, setSummary] = useState<SessionSummary | null>(null);
    const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
    const [sharing, setSharing] = useState(false);
    const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
    const [weekDays, setWeekDays] = useState<boolean[]>(new Array(7).fill(false));
    const [weeklyVolumes, setWeeklyVolumes] = useState<number[]>([]);
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [freestyleExercises, setFreestyleExercises] = useState<WorkoutExercise[]>([]);
    const [showFreestyleAddModal, setShowFreestyleAddModal] = useState(false);
    const [startingFreestyle, setStartingFreestyle] = useState(false);
    const [showFreestylePrompt, setShowFreestylePrompt] = useState(false);
    const [savingFreestylePlan, setSavingFreestylePlan] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);
    const [deletingPlan, setDeletingPlan] = useState(false);
    const [skippedExercises, setSkippedExercises] = useState<Set<string>>(new Set());
    const [warmupExercises, setWarmupExercises] = useState<Set<string>>(new Set());
    const [cycleProfile, setCycleProfile] = useState<PhaseTrainingProfile | null>(null);
    const [energyForecast, setEnergyForecast] = useState<EnergyForecast[]>([]);
    const [exerciseRisks, setExerciseRisks] = useState<Record<string, ExerciseRisk>>({});
    const [substitutions, setSubstitutions] = useState<Record<string, Substitution[]>>({});

    /* ── DERIVED ── */
    const totalPlanned = exercisesList.reduce((sum, e) => sum + e.target_sets, 0);
    const completedCount = Object.values(logs).flat().filter((s) => s.completed && !s.is_warmup).length;

    /* ── LOAD ── */
    const load = useCallback(async () => {
        if (!user || loadInFlight.current) return;
        loadInFlight.current = true;
        try {
            setStatus("loading");

            const sex = userSex;

            const weekday = new Date().getDay();
            const { data: plan } = await supabase
                .from("recurring_plans")
                .select("template_id, is_rest, workout_templates(name)")
                .eq("user_id", user.id)
                .eq("weekday", weekday)
                .eq("sex", sex)
                .maybeSingle();

            if (!plan) { setStatus("no_plan"); return; }
            if (plan.is_rest) { setStatus("rest_day"); return; }
            if (!plan.template_id) { setStatus("no_plan"); return; }

            const planTitle = (plan as any).workout_templates?.name || "Workout";
            setDayTitle(planTitle);

            let { data: day } = await supabase.from("scheduled_days").select("id").eq("user_id", user.id).eq("date", today).maybeSingle();
            const dayExisted = !!day;
            if (!day) {
                const { data: created } = await supabase.from("scheduled_days").insert({ user_id: user.id, date: today, title: planTitle, is_rest: false }).select("id").single();
                day = created;
            }
            if (!day) { setStatus("no_plan"); return; }
            setScheduledDayId(day.id);

            const { data: sessionCheck } = await supabase.from("workout_sessions").select("id, status").eq("user_id", user.id).eq("date", today).eq("sex", sex).in("status", ["active", "completed"]).limit(1);
            const hasSessionToday = !!sessionCheck?.length;
            if (!hasSessionToday) {
                if (dayExisted) await supabase.from("scheduled_exercises").delete().eq("scheduled_day_id", day.id);
                const { data: te } = await supabase.from("workout_template_exercises").select("exercise_id, order_index, target_sets, target_reps, target_weight, rest_seconds, notes").eq("template_id", plan.template_id).order("order_index");
                if (te?.length) {
                    await supabase.from("scheduled_exercises").insert(te.map((t: any) => ({ scheduled_day_id: day!.id, user_id: user.id, exercise_id: t.exercise_id, order_index: t.order_index, target_sets: t.target_sets, target_reps: t.target_reps, target_weight: t.target_weight, rest_seconds: t.rest_seconds, notes: t.notes })));
                }
            }

            const { data: exRows } = await supabase
                .from("scheduled_exercises")
                .select("id, order_index, target_sets, target_reps, target_weight, rest_seconds, exercise_id, exercises(name, category, equipment, body_segment)")
                .eq("scheduled_day_id", day.id)
                .order("order_index");

            const mapped: WorkoutExercise[] = (exRows ?? []).map((r: any) => {
                const seg = r.exercises?.body_segment ?? "";
                const equip = r.exercises?.equipment ?? "";
                return { id: r.id, exercise_id: r.exercise_id, order_index: r.order_index, target_sets: r.target_sets, target_reps: r.target_reps, target_weight: r.target_weight, rest_seconds: r.rest_seconds, name: r.exercises?.name ?? "Unknown", category: r.exercises?.category ?? "", equipment: equip, body_segment: seg, isCardio: seg === "Cardio", isBodyweight: equip.toLowerCase() === "bodyweight" && seg !== "Cardio" };
            });
            setExercisesList(mapped);
            if (mapped.length === 0) { setStatus("no_plan"); return; }

            if (sex === "female") {
                try {
                    const cycleData = await fetchCycleTrainingData(user.id);
                    if (cycleData) {
                        setCycleProfile(cycleData.profile);
                        setEnergyForecast(cycleData.forecast);
                        const risks: Record<string, ExerciseRisk> = {};
                        mapped.forEach(ex => {
                            const risk = assessExerciseRisk(ex.name, ex.exercise_id, cycleData.profile.phase, cycleData.profile.subPhase, ex.body_segment);
                            if (risk.riskLevel !== "none") risks[ex.id] = risk;
                        });
                        setExerciseRisks(risks);
                    }
                } catch { /* cycle data is optional */ }
            } else {
                setCycleProfile(null);
                setEnergyForecast([]);
                setExerciseRisks({});
            }

            const exerciseIds = mapped.map((m) => m.exercise_id);
            const { data: priorLogs } = await supabase.from("exercise_set_logs").select("exercise_id, weight, reps, completed_at, workout_session_id, workout_sessions!inner(sex)").eq("user_id", user.id).eq("workout_sessions.sex", sex).in("exercise_id", exerciseIds).order("completed_at", { ascending: false }).limit(500);

            const { data: completedSessions } = await supabase
                .from("workout_sessions")
                .select("id, total_sets, total_volume, duration_seconds, xp_earned")
                .eq("user_id", user.id)
                .eq("date", today)
                .eq("sex", sex)
                .eq("status", "completed")
                .order("created_at", { ascending: true });
            if (completedSessions && completedSessions.length > 0 && completedSessions.length >= MAX_SESSIONS_PER_DAY) {
                localStorage.removeItem("ascend_active_session");
                const lastDone = completedSessions[completedSessions.length - 1];
                setTodaySessions(completedSessions.map((s: any) => ({ id: s.id, sets: s.total_sets ?? 0, volume: Number(s.total_volume) || 0, duration: s.duration_seconds ?? 0, xp: s.xp_earned ?? 0 })));
                setSummary({ sets: lastDone.total_sets ?? 0, volume: Number(lastDone.total_volume) || 0, duration: lastDone.duration_seconds ?? 0, xpBreakdown: { base: 0, setCompletion: 0, completionBonus: 0, prBonus: 0, progressionBonus: 0, consistencyBonus: 0, total: lastDone.xp_earned ?? 0, details: [] }, level: 0, rankName: "" });
                setStatus("completed");
                return;
            }

            const { data: existingSession } = await supabase.from("workout_sessions").select("*").eq("user_id", user.id).eq("date", today).eq("sex", sex).eq("status", "active").maybeSingle();

            const lastMap: Record<string, { weight: number | null; reps: number | null }> = {};
            const hints: Record<string, OverloadSuggestion> = {};
            (priorLogs ?? []).forEach((row: any) => {
                if (existingSession && row.workout_session_id === existingSession.id) return;
                if (!lastMap[row.exercise_id]) lastMap[row.exercise_id] = { weight: row.weight, reps: row.reps };
            });
            mapped.forEach((ex) => {
                const last = lastMap[ex.exercise_id];
                hints[ex.exercise_id] = computeOverload(last?.weight ?? null, last?.reps ?? null, ex.target_reps, weightUnit);
            });
            setLastPerformance(lastMap);
            setOverloadHints(hints);

            if (existingSession) {
                setSessionId(existingSession.id);
                setStartedAt(new Date(existingSession.started_at).getTime());
                const { data: existingLogs } = await supabase.from("exercise_set_logs").select("*").eq("workout_session_id", existingSession.id);
                const logMap: Record<string, SetEntry[]> = {};
                mapped.forEach((ex) => {
                    const rows = (existingLogs ?? []).filter((l: any) => l.scheduled_exercise_id === ex.id).sort((a: any, b: any) => a.set_index - b.set_index);
                    const count = Math.max(ex.target_sets, rows.length);
                    const arr: SetEntry[] = [];
                    for (let i = 0; i < count; i++) {
                        const saved = rows.find((r: any) => r.set_index === i);
                        arr.push(saved ? { index: i, weight: saved.weight != null ? String(saved.weight) : "", reps: saved.reps != null ? String(saved.reps) : "", duration: saved.duration_seconds != null ? String(saved.duration_seconds) : "", distance: saved.distance != null ? String(saved.distance) : "", note: "", completed: true, logId: saved.id, is_warmup: saved.is_warmup ?? false } : emptySet(i));
                    }
                    logMap[ex.id] = arr;
                });
                setLogs(logMap);
                const restoredWarmups = new Set<string>();
                for (const ex of mapped) {
                    if (logMap[ex.id]?.some((s) => s.is_warmup)) restoredWarmups.add(ex.id);
                }
                if (restoredWarmups.size > 0) setWarmupExercises(restoredWarmups);
                localStorage.setItem("ascend_active_session", "true");
                setStatus("active");
                setExpandedId(mapped[0]?.id ?? null);
            } else if (completedSessions && completedSessions.length > 0) {
                const lastDone = completedSessions[completedSessions.length - 1];
                setTodaySessions(completedSessions.map((s: any) => ({ id: s.id, sets: s.total_sets ?? 0, volume: Number(s.total_volume) || 0, duration: s.duration_seconds ?? 0, xp: s.xp_earned ?? 0 })));
                setSummary({ sets: lastDone.total_sets ?? 0, volume: Number(lastDone.total_volume) || 0, duration: lastDone.duration_seconds ?? 0, xpBreakdown: { base: 0, setCompletion: 0, completionBonus: 0, prBonus: 0, progressionBonus: 0, consistencyBonus: 0, total: lastDone.xp_earned ?? 0, details: [] }, level: 0, rankName: "" });
                setStatus("completed");
            } else {
                const initLogs: Record<string, SetEntry[]> = {};
                mapped.forEach((ex) => {
                    const hint = hints[ex.exercise_id];
                    const last = lastMap[ex.exercise_id];
                    const prefill = hint?.suggestedWeight ?? last?.weight ?? ex.target_weight;
                    const setCount = ex.isCardio ? 1 : ex.target_sets;
                    initLogs[ex.id] = Array.from({ length: setCount }, (_, i) => ({ ...emptySet(i), weight: !ex.isCardio && !ex.isBodyweight && prefill ? String(prefill) : "" }));
                });
                setLogs(initLogs);
                setStatus("not_started");
            }
        } finally {
            loadInFlight.current = false;
        }
    }, [user, today, userSex, weightUnit]);

    useEffect(() => { load(); }, [load]);

    /* ── LOAD STATS ── */
    useEffect(() => {
        if (!user || (status !== "not_started" && status !== "completed")) return;
        let cancelled = false;
        async function loadStats() {
            const sex = userSex;
            const dateStr = toDateString(new Date());
            const now = new Date(dateStr + "T00:00:00");
            const dayOfWeek = now.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(now);
            monday.setDate(now.getDate() + mondayOffset);
            const mondayStr = toDateString(monday);

            const weeksBack = 6;
            const sixWeeksAgo = new Date(monday);
            sixWeeksAgo.setDate(sixWeeksAgo.getDate() - (weeksBack - 1) * 7);
            const sixWeeksAgoStr = toDateString(sixWeeksAgo);

            const [{ data: recent }, { data: weekSessions }, { data: volSessions }] = await Promise.all([
                supabase.from("workout_sessions").select("id, date, title, total_sets, total_volume, xp_earned").eq("user_id", user!.id).eq("status", "completed").eq("sex", sex).order("date", { ascending: false }).limit(5),
                supabase.from("workout_sessions").select("date").eq("user_id", user!.id).eq("status", "completed").eq("sex", sex).gte("date", mondayStr),
                supabase.from("workout_sessions").select("id, date, total_volume").eq("user_id", user!.id).eq("status", "completed").eq("sex", sex).gte("date", sixWeeksAgoStr),
            ]);
            if (cancelled) return;

            setRecentSessions((recent ?? []).map((s: any) => ({ id: s.id, date: s.date, title: s.title ?? "Workout", sets: s.total_sets ?? 0, volume: Number(s.total_volume) || 0, xp: s.xp_earned ?? 0 })));

            const completedDates = new Set((weekSessions ?? []).map((s: any) => s.date));
            const days: boolean[] = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                days.push(completedDates.has(toDateString(d)));
            }
            setWeekDays(days);

            const volumes: number[] = [];
            for (let w = 0; w < weeksBack; w++) {
                const wStart = new Date(monday);
                wStart.setDate(monday.getDate() - (weeksBack - 1 - w) * 7);
                const wEnd = new Date(wStart);
                wEnd.setDate(wStart.getDate() + 7);
                const wStartStr = toDateString(wStart);
                const wEndStr = toDateString(wEnd);
                const vol = (volSessions ?? []).filter((s: any) => s.date >= wStartStr && s.date < wEndStr).reduce((sum: number, s: any) => sum + (Number(s.total_volume) || 0), 0);
                volumes.push(Math.round(vol));
            }
            setWeeklyVolumes(volumes);
            setStatsLoaded(true);
        }
        loadStats();
        return () => { cancelled = true; };
    }, [user, status, userSex]);

    /* ── PAUSE TRACKING ── */
    const pauseStartRef = useRef<number | null>(null);
    const pausedElapsedRef = useRef(0);
    useEffect(() => {
        if (sessionPaused) { pauseStartRef.current = Date.now(); }
        else if (pauseStartRef.current) {
            const added = Math.floor((Date.now() - pauseStartRef.current) / 1000);
            pausedElapsedRef.current += added;
            setPausedElapsed(pausedElapsedRef.current);
            pauseStartRef.current = null;
        }
    }, [sessionPaused]);

    /* ── ELAPSED TIMER ── */
    useEffect(() => {
        if (status !== "active" || !startedAt || sessionPaused) return;
        const tick = () => {
            const raw = Math.floor((Date.now() - startedAt) / 1000) - pausedElapsedRef.current;
            setElapsed(Math.max(0, raw));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [status, startedAt, sessionPaused, pausedElapsed]);

    /* ── REST TIMER ── */
    useEffect(() => {
        if (restRemaining === null || restPaused) return;
        if (restRemaining <= 0) { setRestRemaining(null); return; }
        const id = setTimeout(() => setRestRemaining((r) => (r !== null ? r - 1 : null)), 1000);
        return () => clearTimeout(id);
    }, [restRemaining, restPaused]);

    /* ── EQUIPMENT SUBSTITUTIONS ── */
    useEffect(() => {
        if (equipmentAccess.length === 0 || exercisesList.length === 0) return;
        const ownedSet = new Set([...equipmentAccess, "Bodyweight"]);
        const unavailable = exercisesList.filter((ex) => !ownedSet.has(ex.equipment));
        if (unavailable.length === 0) { setSubstitutions({}); return; }
        const existingIds = new Set(exercisesList.map((e) => e.exercise_id));
        Promise.all(
            unavailable.map(async (ex) => {
                const subs = await findSubstitutions(ex.exercise_id, equipmentAccess, { limit: 3, excludeIds: existingIds });
                return [ex.id, subs] as const;
            }),
        ).then((results) => {
            const map: Record<string, Substitution[]> = {};
            for (const [id, subs] of results) if (subs.length > 0) map[id] = subs;
            setSubstitutions(map);
        });
    }, [exercisesList, equipmentAccess]);

    /* ── ACTIONS ── */
    async function startWorkout() {
        if (!user || !scheduledDayId) return;
        if (todaySessions.length >= MAX_SESSIONS_PER_DAY) return;
        const { data } = await supabase.from("workout_sessions").insert({ user_id: user.id, scheduled_day_id: scheduledDayId, date: today, title: dayTitle, status: "active", sex: userSex }).select().single();
        if (!data) return;
        setSessionId(data.id);
        setStartedAt(new Date(data.started_at).getTime());
        localStorage.setItem("ascend_active_session", "true");
        setStatus("active");
        setExpandedId(exercisesList[0]?.id ?? null);
    }

    function addFreestyleExercise(ex: { id: string; name: string; category?: string; equipment?: string; body_segment?: string }) {
        const seg = ex.body_segment ?? "";
        const equip = ex.equipment ?? "";
        const localEx: WorkoutExercise = {
            id: `freestyle-${ex.id}-${Date.now()}`,
            exercise_id: ex.id,
            order_index: freestyleExercises.length,
            target_sets: 3,
            target_reps: "8-10",
            target_weight: null,
            rest_seconds: 90,
            name: ex.name,
            category: ex.category ?? "",
            equipment: equip,
            body_segment: seg,
            isCardio: seg === "Cardio",
            isBodyweight: equip.toLowerCase() === "bodyweight" && seg !== "Cardio",
        };
        setFreestyleExercises((p) => [...p, localEx]);
        setShowFreestyleAddModal(false);
    }

    function removeFreestyleExercise(id: string) {
        setFreestyleExercises((p) => p.filter((e) => e.id !== id));
    }

    async function beginFreestyleSession() {
        if (!user || freestyleExercises.length === 0) return;
        if (todaySessions.length >= MAX_SESSIONS_PER_DAY) return;
        setStartingFreestyle(true);

        let { data: day } = await supabase.from("scheduled_days").select("id").eq("user_id", user.id).eq("date", today).maybeSingle();
        if (!day) {
            const { data: created } = await supabase.from("scheduled_days").insert({ user_id: user.id, date: today, title: "Freestyle Session", is_rest: false }).select("id").single();
            day = created;
        } else {
            await supabase.from("scheduled_exercises").delete().eq("scheduled_day_id", day.id);
            await supabase.from("scheduled_days").update({ title: "Freestyle Session", is_rest: false }).eq("id", day.id);
        }
        if (!day) { setStartingFreestyle(false); return; }

        await supabase.from("scheduled_exercises").insert(freestyleExercises.map((ex, i) => ({
            scheduled_day_id: day.id, user_id: user.id, exercise_id: ex.exercise_id, order_index: i,
            target_sets: ex.target_sets, target_reps: ex.target_reps, target_weight: ex.target_weight, rest_seconds: ex.rest_seconds,
        })));

        const { data: exRows } = await supabase
            .from("scheduled_exercises")
            .select("id, order_index, target_sets, target_reps, target_weight, rest_seconds, exercise_id, exercises(name, category, equipment, body_segment)")
            .eq("scheduled_day_id", day.id)
            .order("order_index");

        const mapped: WorkoutExercise[] = (exRows ?? []).map((r: any) => {
            const seg = r.exercises?.body_segment ?? ""; const equip = r.exercises?.equipment ?? "";
            return { id: r.id, exercise_id: r.exercise_id, order_index: r.order_index, target_sets: r.target_sets, target_reps: r.target_reps, target_weight: r.target_weight, rest_seconds: r.rest_seconds, name: r.exercises?.name ?? "Unknown", category: r.exercises?.category ?? "", equipment: equip, body_segment: seg, isCardio: seg === "Cardio", isBodyweight: equip.toLowerCase() === "bodyweight" && seg !== "Cardio" };
        });

        const { data: session } = await supabase.from("workout_sessions").insert({ user_id: user.id, scheduled_day_id: day.id, date: today, title: "Freestyle Session", status: "active", sex: userSex }).select().single();
        if (!session) { setStartingFreestyle(false); return; }

        const initLogs: Record<string, SetEntry[]> = {};
        mapped.forEach((ex) => {
            const setCount = ex.isCardio ? 1 : ex.target_sets;
            initLogs[ex.id] = Array.from({ length: setCount }, (_, i) => emptySet(i));
        });

        setScheduledDayId(day.id);
        setDayTitle("Freestyle Session");
        setExercisesList(mapped);
        setLogs(initLogs);
        setSessionId(session.id);
        setStartedAt(new Date(session.started_at).getTime());
        setExpandedId(mapped[0]?.id ?? null);
        setFreestyleExercises([]);
        setStartingFreestyle(false);
        localStorage.setItem("ascend_active_session", "true");
        setStatus("active");
    }

    function updateSet(exId: string, idx: number, field: keyof SetEntry, val: string) {
        setLogs((p) => ({ ...p, [exId]: p[exId].map((s) => (s.index === idx ? { ...s, [field]: val } : s)) }));
    }

    async function checkPR(exerciseId: string, name: string, w: number, r: number) {
        if (!user || w <= 0) return;
        const { data } = await supabase.from("exercise_set_logs").select("weight, workout_sessions!inner(sex)").eq("user_id", user.id).eq("exercise_id", exerciseId).eq("workout_sessions.sex", userSex).gt("weight", 0).order("weight", { ascending: false }).limit(1);
        const prev = data?.[0]?.weight ?? 0;
        if (w > prev && prev > 0) {
            setPrCount((c) => c + 1);
            await supabase.from("notifications").insert({ user_id: user.id, type: "new_pr", title: "NEW PERSONAL RECORD", message: `${name}: ${kgToUnit(w, weightUnit)}${weightUnit} × ${r} — previous best was ${kgToUnit(prev, weightUnit)}${weightUnit}`, metadata: { exercise_name: name, weight: w, reps: r, previous_best: prev }, sex: userSex });
        }
    }

    async function completeSet(ex: WorkoutExercise, idx: number) {
        if (!user || !sessionId) return;
        const set = logs[ex.id]?.find((s) => s.index === idx);
        if (!set) return;
        if (ex.isCardio) {
            if (!set.duration && !set.distance) return;
        } else if (!ex.isBodyweight) {
            if (!set.reps) return;
        } else {
            if (!set.reps) return;
        }
        const payload: any = { workout_session_id: sessionId, user_id: user.id, exercise_id: ex.exercise_id, scheduled_exercise_id: ex.id, set_index: idx, is_warmup: set.is_warmup ?? false };
        if (ex.isCardio) { payload.duration_seconds = set.duration ? Number(set.duration) : null; payload.distance = set.distance ? Number(set.distance) : null; }
        else { payload.weight = ex.isBodyweight ? 0 : (set.weight ? Number(set.weight) : null); payload.reps = set.reps ? Number(set.reps) : null; }

        setLogs((p) => ({ ...p, [ex.id]: p[ex.id].map((s) => (s.index === idx ? { ...s, completed: true } : s)) }));
        if (navigator.vibrate) navigator.vibrate(50);
        if (!ex.isCardio && !ex.isBodyweight && set.weight && set.reps && !set.is_warmup) checkPR(ex.exercise_id, ex.name, Number(set.weight), Number(set.reps));

        let logId = set.logId;
        if (logId) { await supabase.from("exercise_set_logs").update(payload).eq("id", logId); }
        else { const { data } = await supabase.from("exercise_set_logs").insert(payload).select().single(); logId = data?.id ?? null; }
        setLogs((p) => ({ ...p, [ex.id]: p[ex.id].map((s) => (s.index === idx ? { ...s, logId } : s)) }));

        const restSec = ex.rest_seconds ?? 90;
        const adjustedRest = Math.round(restSec * (cycleProfile?.restMultiplier ?? 1));
        if (adjustedRest > 0) { setRestRemaining(adjustedRest); setRestPaused(false); }
    }

    async function propagateToTemplate(orderIdx: number, newExId: string) {
        if (!user) return;
        const wd = new Date(today + "T00:00:00").getDay();
        const { data: rp } = await supabase.from("recurring_plans").select("template_id").eq("user_id", user.id).eq("weekday", wd).eq("sex", userSex).maybeSingle();
        if (!rp?.template_id) return;
        const { data: rows } = await supabase.from("workout_template_exercises").select("id, order_index").eq("template_id", rp.template_id).order("order_index");
        const match = (rows ?? []).find((r: any) => r.order_index === orderIdx);
        if (match) await supabase.from("workout_template_exercises").update({ exercise_id: newExId }).eq("id", match.id);
    }

    async function handleSwap(oldEx: WorkoutExercise, newEx: { id: string; name: string }) {
        if (!user) return;
        const { data } = await supabase.from("exercises").select("category, equipment, body_segment").eq("id", newEx.id).maybeSingle();
        const seg = data?.body_segment ?? ""; const equip = data?.equipment ?? "";
        await supabase.from("scheduled_exercises").update({ exercise_id: newEx.id }).eq("id", oldEx.id);
        setExercisesList((p) => p.map((e) => (e.id === oldEx.id ? { ...e, exercise_id: newEx.id, name: newEx.name, body_segment: seg, equipment: equip, isCardio: seg === "Cardio", isBodyweight: equip.toLowerCase() === "bodyweight" && seg !== "Cardio" } : e)));
        setLogs((p) => ({ ...p, [oldEx.id]: Array.from({ length: oldEx.target_sets }, (_, i) => emptySet(i)) }));
        setSwapTargetId(null);
    }

    async function handleAddExercise(newEx: { id: string; name: string }) {
        if (!user || !sessionId) return;
        const { data: exData } = await supabase.from("exercises").select("category, equipment, body_segment").eq("id", newEx.id).maybeSingle();
        const seg = exData?.body_segment ?? ""; const equip = exData?.equipment ?? ""; const nextOrder = exercisesList.length;
        const { data: created } = await supabase.from("scheduled_exercises").insert({ scheduled_day_id: scheduledDayId, user_id: user.id, exercise_id: newEx.id, order_index: nextOrder, target_sets: 3, target_reps: "8-10" }).select().single();
        if (!created) return;
        const ex: WorkoutExercise = { id: created.id, exercise_id: newEx.id, order_index: nextOrder, target_sets: 3, target_reps: "8-10", target_weight: null, rest_seconds: 90, name: newEx.name, category: exData?.category ?? "", equipment: equip, body_segment: seg, isCardio: seg === "Cardio", isBodyweight: equip.toLowerCase() === "bodyweight" && seg !== "Cardio" };
        setExercisesList((p) => [...p, ex]);
        setLogs((p) => ({ ...p, [ex.id]: Array.from({ length: 3 }, (_, i) => emptySet(i)) }));
        setExpandedId(ex.id);
        setShowAddModal(false);
    }

    function addSet(exId: string) { setLogs((p) => ({ ...p, [exId]: [...p[exId], emptySet(p[exId].length)] })); }

    async function deletePlan() {
        if (!user) return;
        setDeletingPlan(true);
        const sex = userSex;
        const { data: plans } = await supabase.from("recurring_plans").select("id, template_id").eq("user_id", user.id).eq("sex", sex);
        if (plans?.length) {
            const templateIds = plans.map((p: any) => p.template_id).filter(Boolean);
            if (templateIds.length) {
                await supabase.from("workout_template_exercises").delete().in("template_id", templateIds);
                await supabase.from("workout_templates").delete().in("id", templateIds);
            }
            await supabase.from("recurring_plans").delete().eq("user_id", user.id).eq("sex", sex);
        }
        if (scheduledDayId) {
            await supabase.from("scheduled_exercises").delete().eq("scheduled_day_id", scheduledDayId);
            await supabase.from("scheduled_days").delete().eq("id", scheduledDayId);
        }
        setDeletingPlan(false);
        setShowDeletePlanConfirm(false);
        setScheduledDayId(null);
        setExercisesList([]);
        setStatus("no_plan");
    }

    async function removeExercise(exId: string) {
        await supabase.from("scheduled_exercises").delete().eq("id", exId);
        setExercisesList((p) => p.filter((e) => e.id !== exId));
        setLogs((p) => { const next = { ...p }; delete next[exId]; return next; });
        if (expandedId === exId) setExpandedId(null);
    }

    function skipExercise(exId: string) {
        setSkippedExercises((prev) => new Set([...prev, exId]));
        const currentIdx = exercisesList.findIndex((e) => e.id === exId);
        const nextUnskipped = exercisesList.slice(currentIdx + 1).find((e) => !skippedExercises.has(e.id));
        if (nextUnskipped) setExpandedId(nextUnskipped.id);
        else setExpandedId(null);
    }

    function unskipExercise(exId: string) {
        setSkippedExercises((prev) => { const next = new Set(prev); next.delete(exId); return next; });
    }

    function toggleWarmup(ex: WorkoutExercise) {
        const hasWarmup = warmupExercises.has(ex.id);
        if (hasWarmup) {
            setWarmupExercises((prev) => { const next = new Set(prev); next.delete(ex.id); return next; });
            setLogs((p) => ({ ...p, [ex.id]: (p[ex.id] ?? []).filter((s) => !s.is_warmup).map((s, i) => ({ ...s, index: i })) }));
        } else {
            const currentSets = logs[ex.id] ?? [];
            const firstWorkingWeight = currentSets.find((s) => !s.is_warmup && s.weight)?.weight;
            const workingWeightDisplay = firstWorkingWeight ? Number(firstWorkingWeight) : (ex.target_weight ? kgToUnit(ex.target_weight, weightUnit) : 0);
            const workingWeightKg = weightInputToKg(workingWeightDisplay, weightUnit);
            if (workingWeightKg <= 20) return;
            const isBarbell = ex.equipment.toLowerCase().includes("barbell");
            const warmups = generateWarmupSets(workingWeightKg, isBarbell);
            if (warmups.length === 0) return;
            const warmupEntries: SetEntry[] = warmups.map((w, i) => ({
                index: i,
                weight: String(kgToUnit(w.weight, weightUnit)),
                reps: String(w.reps),
                duration: "", distance: "", note: "",
                completed: false, logId: null,
                is_warmup: true,
                warmup_label: w.label,
            }));
            const reindexed = [...warmupEntries, ...currentSets.map((s, i) => ({ ...s, index: warmupEntries.length + i }))];
            setLogs((p) => ({ ...p, [ex.id]: reindexed }));
            setWarmupExercises((prev) => new Set([...prev, ex.id]));
        }
    }

    async function finishWorkout() {
        if (!user || !sessionId || !startedAt || finishing) return;
        setFinishing(true);
        const allSets = Object.values(logs).flat().filter((s) => s.completed);
        const workingSets = allSets.filter((s) => !s.is_warmup);
        const totalSets = workingSets.length;
        const totalVolume = workingSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        const dur = Math.floor((Date.now() - startedAt) / 1000) - pausedElapsed;
        const totalPlannedSets = exercisesList.reduce((sum, e) => sum + e.target_sets, 0);
        const setsData = workingSets.map((s) => { const ex = exercisesList.find((e) => logs[e.id]?.includes(s)); return { exercise_id: ex?.exercise_id ?? "", weight: Number(s.weight) || null, reps: Number(s.reps) || null }; });
        const xp = await calculateSessionXP(user.id, sessionId, setsData, totalPlannedSets, prCount, userSex);

        await supabase.from("workout_sessions").update({ status: "completed", completed_at: new Date().toISOString(), duration_seconds: dur, total_volume: totalVolume, total_sets: totalSets, xp_earned: xp.total, ...(cycleProfile ? { cycle_phase: cycleProfile.phase, cycle_day: cycleProfile.cycleDay } : {}) }).eq("id", sessionId);
        await supabase.from("notifications").insert({ user_id: user.id, type: "workout_complete", title: "WORKOUT COMPLETE", message: `${dayTitle} — ${totalSets} sets, ${Math.round(kgToUnit(totalVolume, weightUnit)).toLocaleString()}${weightUnit} volume, +${xp.total} XP`, metadata: { sets: totalSets, volume: totalVolume, xp: xp.total }, sex: userSex });

        const { data: sessions } = await supabase.from("workout_sessions").select("date").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).order("date", { ascending: false }).limit(120);
        if (sessions) {
            const { data: plans } = await supabase.from("recurring_plans").select("weekday, is_rest").eq("user_id", user.id).eq("sex", userSex);
            const restDays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));
            const dates = new Set(sessions.map((s: any) => s.date));
            let streak = 0; const check = new Date(today + "T00:00:00");
            for (let i = 0; i < 120; i++) { const d = toDateString(check); const wd = check.getDay(); if (restDays.has(wd)) { check.setDate(check.getDate() - 1); continue; } if (dates.has(d)) { streak++; check.setDate(check.getDate() - 1); } else break; }
            if ([7, 14, 30, 60, 100].includes(streak)) await supabase.from("notifications").insert({ user_id: user.id, type: "streak_milestone", title: `${streak}-DAY STREAK`, message: `Consistent for ${streak} days!`, metadata: { streak }, sex: userSex });
        }

        const { data: xpRows } = await supabase.from("workout_sessions").select("xp_earned").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex);
        const totalXp = (xpRows ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0);
        const lvlBefore = computeLevel(totalXp - xp.total).level;
        const lvlAfter = computeLevel(totalXp).level;
        if (lvlAfter > lvlBefore) {
            await supabase.from("notifications").insert({
                user_id: user.id, type: "level_up", title: "LEVEL UP",
                message: `You've reached Level ${lvlAfter}!`,
                metadata: { level: lvlAfter, total_xp: totalXp },
                sex: userSex,
            });
        }

        await checkAndAwardAchievements(user.id, userSex);
        await updateUserStats(user.id);
        await updateExerciseLeaderboard(user.id);
        await autoCompleteHabits(user.id, "workout_complete").catch(() => {});

        if (dayTitle === "Freestyle Session") {
            const weekday = new Date().getDay();
            const { data: existingPlan } = await supabase.from("recurring_plans").select("id").eq("user_id", user.id).eq("weekday", weekday).eq("sex", userSex).limit(1);
            if (!existingPlan?.length) setShowFreestylePrompt(true);
        }

        localStorage.removeItem("ascend_active_session");
        setTodaySessions(prev => [...prev, { id: sessionId!, duration: dur, sets: totalSets, volume: totalVolume, xp: xp.total }]);
        setSummary({ duration: dur, sets: totalSets, volume: totalVolume, xpBreakdown: xp, level: lvlAfter, rankName: getRank(lvlAfter).name });
        setStatus("completed");
        setRestRemaining(null);
    }

    async function generateShareImage(): Promise<Blob | null> {
        if (!summary) return null;
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim();
        const accent = raw ? `rgb(${raw})` : "#22d3ee";
        const accentA = (a: number) => raw ? `rgba(${raw},${a})` : `rgba(34,211,238,${a})`;

        const bg = ctx.createLinearGradient(0, 0, 0, 1920);
        bg.addColorStop(0, "#0a1524");
        bg.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || "#050914");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1080, 1920);

        const glow = ctx.createRadialGradient(540, 300, 50, 540, 300, 700);
        glow.addColorStop(0, accentA(0.18));
        glow.addColorStop(1, accentA(0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1080, 1920);

        ctx.textAlign = "center";

        ctx.fillStyle = accent;
        ctx.font = "bold 64px ui-monospace, monospace";
        ctx.fillText("ASCEND", 540, 180);
        ctx.fillStyle = "var(--fg-30)";
        ctx.font = "24px ui-monospace, monospace";
        ctx.fillText("YOUR TRAINING SYSTEM", 540, 220);

        ctx.fillStyle = accentA(0.6);
        ctx.font = "28px ui-monospace, monospace";
        ctx.fillText("SESSION COMPLETE", 540, 420);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 72px ui-monospace, monospace";
        ctx.fillText(dayTitle, 540, 510);
        ctx.fillStyle = "var(--fg-40)";
        ctx.font = "30px ui-monospace, monospace";
        ctx.fillText(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }), 540, 560);

        const badgeText = `LVL ${summary.level} · ${summary.rankName}`;
        ctx.font = "bold 34px ui-monospace, monospace";
        const badgeW = Math.max(300, ctx.measureText(badgeText).width + 100);
        ctx.strokeStyle = accentA(0.5);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(540 - badgeW / 2, 650, badgeW, 90, 45);
        ctx.stroke();
        ctx.fillStyle = accent;
        ctx.fillText(badgeText, 540, 707);

        const stats: [string, string][] = [
            ["DURATION", formatClock(summary.duration)],
            ["SETS", String(summary.sets)],
            ["VOLUME", `${Math.round(kgToUnit(summary.volume, weightUnit)).toLocaleString()} ${weightUnit.toUpperCase()}`],
            ["XP EARNED", `+${summary.xpBreakdown.total}`],
        ];
        const cellW = 460, cellH = 220, gap = 40;
        const startX = 540 - cellW - gap / 2;
        const startY = 850;
        stats.forEach(([label, value], i) => {
            const col = i % 2, row = Math.floor(i / 2);
            const x = startX + col * (cellW + gap);
            const y = startY + row * (cellH + gap);
            ctx.strokeStyle = "var(--fg-10)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, cellW, cellH, 20);
            ctx.stroke();
            ctx.fillStyle = "var(--fg-35)";
            ctx.font = "24px ui-monospace, monospace";
            ctx.fillText(label, x + cellW / 2, y + 70);
            ctx.fillStyle = i === 3 ? accent : "#ffffff";
            ctx.font = "bold 56px ui-monospace, monospace";
            ctx.fillText(value, x + cellW / 2, y + 150);
        });

        ctx.fillStyle = "var(--fg-20)";
        ctx.font = "24px ui-monospace, monospace";
        ctx.fillText("ascend.app", 540, 1850);

        return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
    }

    async function handleShare() {
        setSharing(true);
        const blob = await generateShareImage();
        if (!blob) { setSharing(false); return; }

        const file = new File([blob], `ascend-${today}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: "ASCEND Workout Summary" });
            } catch {
                // user cancelled
            }
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ascend-${today}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }
        setSharing(false);
    }

    async function saveFreestyleAsRecurringPlan() {
        if (!user) return;
        setSavingFreestylePlan(true);
        const weekday = new Date().getDay();
        const weekdayName = new Date().toLocaleDateString(undefined, { weekday: "long" });

        const { data: template } = await supabase.from("workout_templates").insert({ user_id: user.id, name: `${weekdayName} Workout` }).select("id").single();
        if (template) {
            await supabase.from("workout_template_exercises").insert(exercisesList.map((ex, i) => ({
                template_id: template.id, user_id: user.id, exercise_id: ex.exercise_id, order_index: i,
                target_sets: ex.target_sets, target_reps: ex.target_reps, target_weight: ex.target_weight, rest_seconds: ex.rest_seconds,
            })));
            await supabase.from("recurring_plans").insert({ user_id: user.id, weekday, template_id: template.id, is_rest: false, sex: userSex });
        }
        setSavingFreestylePlan(false);
        setShowFreestylePrompt(false);
    }

    /* ── EXTRACTED INLINE ACTIONS ── */
    async function logBodyWeight() {
        if (!user || !preWorkoutWeight) return;
        await supabase.from("body_weight_logs").insert({ user_id: user.id, weight: weightInputToKg(Number(preWorkoutWeight), weightUnit), context: "pre_workout", sex: userSex });
        setWeightLogged(true);
    }

    function confirmExercise(exId: string) {
        setConfirmedExercises((prev) => new Set([...prev, exId]));
        const currentIdx = exercisesList.findIndex((e) => e.id === exId);
        const next = exercisesList[currentIdx + 1];
        if (next) setExpandedId(next.id);
    }

    function startAnotherWorkout() {
        setSummary(null);
        setSessionId(null);
        setStartedAt(null);
        setElapsed(0);
        setPausedElapsed(0);
        pausedElapsedRef.current = 0;
        setSessionPaused(false);
        setStatus("not_started");
    }

    function startManualRestTimer() {
        const curEx = exercisesList.find((e) => e.id === expandedId);
        const sec = curEx?.rest_seconds ?? 90;
        setRestRemaining(Math.round(sec * (cycleProfile?.restMultiplier ?? 1)));
        setRestPaused(false);
    }

    function addRestTime(seconds: number) {
        setRestRemaining((r) => (r !== null ? r + seconds : null));
    }

    function dismissRestTimer() {
        setRestRemaining(null);
        setRestPaused(false);
    }

    function goBackFromFreestyle() {
        setFreestyleExercises([]);
        setStatus(exercisesList.length > 0 ? "not_started" : "no_plan");
    }

    return {
        // Core state
        status, dayTitle, scheduledDayId, exercisesList, logs, sessionId, startedAt, elapsed,

        // UI state
        expandedId, restRemaining, restPaused, sessionPaused, pausedElapsed,
        swapTargetId, showAddModal, showEndConfirm, showFreestyleAddModal,
        showDeletePlanConfirm, showFreestylePrompt, finishing, sharing,

        // Data
        lastPerformance, overloadHints, summary, todaySessions,
        recentSessions, weekDays, weeklyVolumes, statsLoaded,
        cycleProfile, energyForecast, exerciseRisks, substitutions,
        freestyleExercises, skippedExercises, warmupExercises,
        confirmedExercises, prCount, preWorkoutWeight, weightLogged,
        startingFreestyle, savingFreestylePlan, deletingPlan,

        // Derived
        totalPlanned, completedCount, today, weightUnit, userSex, equipmentAccess,

        // Constants
        MAX_SESSIONS_PER_DAY,

        // Setters (used directly in JSX for simple state toggles)
        setExpandedId, setSwapTargetId, setShowAddModal, setShowEndConfirm,
        setShowFreestyleAddModal, setShowDeletePlanConfirm, setStatus,
        setRestRemaining, setRestPaused, setSessionPaused, setPreWorkoutWeight,
        setSummary, setSessionId, setShowFreestylePrompt,
        setFreestyleExercises,

        // Actions
        startWorkout, beginFreestyleSession, addFreestyleExercise, removeFreestyleExercise,
        updateSet, completeSet, handleSwap, handleAddExercise, addSet,
        deletePlan, removeExercise, skipExercise, unskipExercise, toggleWarmup,
        finishWorkout, handleShare, saveFreestyleAsRecurringPlan,
        logBodyWeight, confirmExercise, startAnotherWorkout, startManualRestTimer,
        addRestTime, dismissRestTimer, goBackFromFreestyle,
    };
}

// Re-export types used by cycleTrainingEngine for JSX access
export { getCycleAdjustedWeight } from "./cycleTrainingEngine";
export type { PhaseTrainingProfile, EnergyForecast, ExerciseRisk } from "./cycleTrainingEngine";
export type { Substitution } from "./substitutionEngine";
export { kgToUnit } from "./units";
