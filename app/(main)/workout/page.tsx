"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Play, X, RefreshCw, Pause, SkipForward, ChevronDown, Moon, Flame, Dumbbell, Timer, TrendingUp, Award, Share2, Trash2, Ban } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import CubeLoader from "../../components/ui/cube-loader";
import { calculateSessionXP, type XPBreakdown } from "../../lib/xpEngine";
import { generateWarmupSets } from "../../lib/warmupSets";
import StretchingStickman from "../../components/ui/stretching-stickman";
import { computeLevel, getRank } from "../../lib/levelSystem";
import { checkAndAwardAchievements } from "../../lib/achievements";
import { updateUserStats } from "../../lib/updateUserStats";
import { updateExerciseLeaderboard } from "../../lib/updateExerciseLeaderboard";
import AddExerciseModal from "../../components/AddExerciseModal";
import { useSex } from "../../lib/useSex";
import { useUnits } from "../../lib/useUnits";
import SubNavPills from "../../components/ui/sub-nav-pills";
import { trainPills } from "../../lib/navPills";
import { kgToUnit, weightInputToKg } from "../../lib/units";
import { fetchCycleTrainingData, assessExerciseRisk, getCycleAdjustedWeight, type PhaseTrainingProfile, type EnergyForecast, type ExerciseRisk } from "../../lib/cycleTrainingEngine";

/* ─── TYPES ─── */
type WorkoutExercise = {
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

type SetEntry = {
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

type SessionStatus = "loading" | "not_started" | "active" | "completed" | "completed_today" | "rest_day" | "no_plan" | "freestyle";

type OverloadSuggestion = {
    type: "weight_up" | "reps_up" | "first_time" | "maintain";
    text: string;
    suggestedWeight: number | null;
};

/* ─── HELPERS ─── */
function toDateString(d: Date) { return d.toISOString().split("T")[0]; }

function formatClock(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function emptySet(i: number): SetEntry {
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

/* ─── CARD WRAPPER ─── */
function CardPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] ${className}`}>{children}</div>
    );
}

/* ─── STAT CELL ─── */
function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="glass-card px-3 py-2.5 text-center">
            <p className="text-[8px] font-mono tracking-widest text-white/25 mb-0.5">{label}</p>
            <p className={`text-lg font-bold font-mono ${accent ? "text-[rgb(var(--accent-rgb))]" : "text-white/90"}`}>{value}</p>
        </div>
    );
}

/* ─── SWIPE-TO-COMPLETE SET ─── */
const SWIPE_THRESHOLD = 80;

function SwipeSet({ completed, onComplete, children }: { completed: boolean; onComplete: () => void; children: React.ReactNode }) {
    const [dragX, setDragX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const pastThreshold = dragX >= SWIPE_THRESHOLD;

    const handlers = useSwipeable({
        onSwiping: (e) => {
            if (completed || e.dir !== "Right") return;
            setSwiping(true);
            setDragX(Math.max(0, Math.min(e.deltaX, SWIPE_THRESHOLD * 1.5)));
        },
        onSwiped: (e) => {
            if (!completed && e.dir === "Right" && e.deltaX >= SWIPE_THRESHOLD) {
                onComplete();
            }
            setDragX(0);
            setSwiping(false);
        },
        trackMouse: true,
    });

    if (completed) return <>{children}</>;

    return (
        <div className="relative overflow-hidden rounded-lg">
            <div
                className="absolute inset-0 flex items-center pl-4 bg-[rgb(var(--accent-rgb)/0.2)] rounded-lg pointer-events-none"
                style={{ opacity: dragX > 4 ? 1 : 0 }}
            >
                <span className={`text-[10px] font-mono font-bold flex items-center gap-1.5 transition-transform ${pastThreshold ? "text-[rgb(var(--accent-light-rgb))] scale-110" : "text-[rgb(var(--accent-light-rgb)/0.7)]"}`}>
                    <Check size={pastThreshold ? 16 : 12} />
                    {pastThreshold ? "RELEASE TO LOG" : "SWIPE TO LOG →"}
                </span>
            </div>
            <div {...handlers} style={{ transform: `translateX(${dragX}px)`, transition: swiping ? "none" : "transform 0.2s ease" }}>
                {children}
            </div>
        </div>
    );
}

/* ─── MAIN COMPONENT ─── */
export default function WorkoutPage() {
    const { user } = useAuth();
    const router = useRouter();

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
    const [swapTargetId, setSwapTargetId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [preWorkoutWeight, setPreWorkoutWeight] = useState("");
    const [weightLogged, setWeightLogged] = useState(false);
    const [confirmedExercises, setConfirmedExercises] = useState<Set<string>>(new Set());
    const [prCount, setPrCount] = useState(0);
    const [summary, setSummary] = useState<{ duration: number; sets: number; volume: number; xpBreakdown: XPBreakdown; level: number; rankName: string } | null>(null);
    const [todaySessions, setTodaySessions] = useState<{ id: string; duration: number; sets: number; volume: number; xp: number }[]>([]);
    const [sharing, setSharing] = useState(false);
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
    const { sex: userSex } = useSex();
    const weightUnit = useUnits();

    const today = toDateString(new Date());
    const loadInFlight = useRef(false);

    /* ─── LOAD ─── */
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

        // If nothing has been logged for today yet, (re)sync scheduled_exercises from the
        // current template so schedule edits made after materialization actually take effect.
        // Never touches a day with an active or completed session — that data stays put.
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

        // Cycle-aware training (female mode only)
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
            } catch { /* cycle data is optional — don't block workout load */ }
        } else {
            setCycleProfile(null);
            setEnergyForecast([]);
            setExerciseRisks({});
        }

        const exerciseIds = mapped.map((m) => m.exercise_id);
        const { data: priorLogs } = await supabase.from("exercise_set_logs").select("exercise_id, weight, reps, completed_at, workout_session_id, workout_sessions!inner(sex)").eq("user_id", user.id).eq("workout_sessions.sex", sex).in("exercise_id", exerciseIds).order("completed_at", { ascending: false }).limit(500);

        // Check for completed session first — if today's already done, block restart

        const { data: completedSessions } = await supabase
            .from("workout_sessions")
            .select("id, total_sets, total_volume, duration_seconds, xp_earned")
            .eq("user_id", user.id)
            .eq("date", today)
            .eq("sex", sex)
            .eq("status", "completed")
            .order("created_at", { ascending: true });
        if (completedSessions && completedSessions.length > 0) {
            setDayTitle(planTitle);
            const { data: statsRow } = await supabase.from("user_stats").select("total_xp").eq("user_id", user.id).eq("sex", sex).maybeSingle();
            const curLevel = computeLevel(statsRow?.total_xp ?? 0).level;
            const allSessions = completedSessions.map((s: any) => ({
                id: s.id,
                duration: s.duration_seconds || 0,
                sets: s.total_sets || 0,
                volume: Number(s.total_volume) || 0,
                xp: s.xp_earned || 0,
            }));
            setTodaySessions(allSessions);
            const latest = completedSessions[completedSessions.length - 1];
            const totalXp = allSessions.reduce((sum: number, s: any) => sum + s.xp, 0);
            setSummary({
                duration: latest.duration_seconds || 0,
                sets: latest.total_sets || 0,
                volume: Number(latest.total_volume) || 0,
                xpBreakdown: { total: latest.xp_earned || 0, base: 0, setCompletion: 0, completionBonus: 0, prBonus: 0, progressionBonus: 0, consistencyBonus: 0, details: [] } as XPBreakdown,
                level: curLevel,
                rankName: getRank(curLevel).name,
            });
            localStorage.removeItem("ascend_active_session");
            setStatus("completed_today");
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
            // Restore warmup state for exercises that had warmup sets
            const restoredWarmups = new Set<string>();
            for (const ex of mapped) {
                if (logMap[ex.id]?.some((s) => s.is_warmup)) restoredWarmups.add(ex.id);
            }
            if (restoredWarmups.size > 0) setWarmupExercises(restoredWarmups);
            localStorage.setItem("ascend_active_session", "true");
            setStatus("active");
            setExpandedId(mapped[0]?.id ?? null);
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

    useEffect(() => {
        if (status !== "active" || !startedAt) return;
        const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [status, startedAt]);

    useEffect(() => {
        if (restRemaining === null || restPaused) return;
        if (restRemaining <= 0) { setRestRemaining(null); return; }
        const id = setTimeout(() => setRestRemaining((r) => (r !== null ? r - 1 : null)), 1000);
        return () => clearTimeout(id);
    }, [restRemaining, restPaused]);

    /* ─── ACTIONS ─── */
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
            // Going freestyle replaces whatever was already planned for today (if anything).
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
            await supabase.from("notifications").insert({ user_id: user.id, type: "new_pr", title: "NEW PERSONAL RECORD", message: `${name}: ${kgToUnit(w, weightUnit)}${weightUnit} × ${r} — previous best was ${kgToUnit(prev, weightUnit)}${weightUnit}`, metadata: { exercise_name: name, weight: w, reps: r, previous_best: prev } });
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
        // Don't auto-start rest timer — user taps to start if they want
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

    const MAX_SESSIONS_PER_DAY = 3;

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
            // Remove warmup sets
            setWarmupExercises((prev) => { const next = new Set(prev); next.delete(ex.id); return next; });
            setLogs((p) => ({ ...p, [ex.id]: (p[ex.id] ?? []).filter((s) => !s.is_warmup).map((s, i) => ({ ...s, index: i })) }));
        } else {
            // Determine working weight in display unit, convert to kg for generation
            const currentSets = logs[ex.id] ?? [];
            const firstWorkingWeight = currentSets.find((s) => !s.is_warmup && s.weight)?.weight;
            const workingWeightDisplay = firstWorkingWeight ? Number(firstWorkingWeight) : (ex.target_weight ? kgToUnit(ex.target_weight, weightUnit) : 0);
            const workingWeightKg = weightInputToKg(workingWeightDisplay, weightUnit);
            if (workingWeightKg <= 20) return; // Too light for warmup
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
        const dur = Math.floor((Date.now() - startedAt) / 1000);
        const totalPlanned = exercisesList.reduce((sum, e) => sum + e.target_sets, 0);
        const setsData = workingSets.map((s) => { const ex = exercisesList.find((e) => logs[e.id]?.includes(s)); return { exercise_id: ex?.exercise_id ?? "", weight: Number(s.weight) || null, reps: Number(s.reps) || null }; });
        const xp = await calculateSessionXP(user.id, sessionId, setsData, totalPlanned, prCount, userSex);

        await supabase.from("workout_sessions").update({ status: "completed", completed_at: new Date().toISOString(), duration_seconds: dur, total_volume: totalVolume, total_sets: totalSets, xp_earned: xp.total, ...(cycleProfile ? { cycle_phase: cycleProfile.phase, cycle_day: cycleProfile.cycleDay } : {}) }).eq("id", sessionId);
        await supabase.from("notifications").insert({ user_id: user.id, type: "workout_complete", title: "WORKOUT COMPLETE", message: `${dayTitle} — ${totalSets} sets, ${Math.round(kgToUnit(totalVolume, weightUnit)).toLocaleString()}${weightUnit} volume, +${xp.total} XP`, metadata: { sets: totalSets, volume: totalVolume, xp: xp.total } });

        // Streak + Level checks
        const { data: sessions } = await supabase.from("workout_sessions").select("date").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex).order("date", { ascending: false }).limit(120);
        if (sessions) {
            const { data: plans } = await supabase.from("recurring_plans").select("weekday, is_rest").eq("user_id", user.id).eq("sex", userSex);
            const restDays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));
            const dates = new Set(sessions.map((s: any) => s.date));
            let streak = 0; const check = new Date(today + "T00:00:00");
            for (let i = 0; i < 120; i++) { const d = toDateString(check); const wd = check.getDay(); if (restDays.has(wd)) { check.setDate(check.getDate() - 1); continue; } if (dates.has(d)) { streak++; check.setDate(check.getDate() - 1); } else break; }
            if ([7, 14, 30, 60, 100].includes(streak)) await supabase.from("notifications").insert({ user_id: user.id, type: "streak_milestone", title: `${streak}-DAY STREAK`, message: `Consistent for ${streak} days!`, metadata: { streak } });
        }

        // Level up check
        const { data: xpRows } = await supabase.from("workout_sessions").select("xp_earned").eq("user_id", user.id).eq("status", "completed").eq("sex", userSex);
        const totalXp = (xpRows ?? []).reduce((s, r: any) => s + (r.xp_earned || 0), 0);
        const lvlBefore = computeLevel(totalXp - xp.total).level;
        const lvlAfter = computeLevel(totalXp).level;
        if (lvlAfter > lvlBefore) {
            await supabase.from("notifications").insert({
                user_id: user.id, type: "level_up", title: "LEVEL UP",
                message: `You've reached Level ${lvlAfter}!`,
                metadata: { level: lvlAfter, total_xp: totalXp },
            });
        }

        // Check achievements
        await checkAndAwardAchievements(user.id, userSex);

        // Update leaderboard stats
        await updateUserStats(user.id);
        await updateExerciseLeaderboard(user.id);

        // Freestyle → offer to make it a recurring plan if today has none
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

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, 1920);
        bg.addColorStop(0, "#0a1524");
        bg.addColorStop(1, "#050914");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1080, 1920);

        const glow = ctx.createRadialGradient(540, 300, 50, 540, 300, 700);
        glow.addColorStop(0, accentA(0.18));
        glow.addColorStop(1, accentA(0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1080, 1920);

        ctx.textAlign = "center";

        // Logo
        ctx.fillStyle = accent;
        ctx.font = "bold 64px ui-monospace, monospace";
        ctx.fillText("ASCEND", 540, 180);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "24px ui-monospace, monospace";
        ctx.fillText("YOUR TRAINING SYSTEM", 540, 220);

        // Title + date
        ctx.fillStyle = accentA(0.6);
        ctx.font = "28px ui-monospace, monospace";
        ctx.fillText("SESSION COMPLETE", 540, 420);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 72px ui-monospace, monospace";
        ctx.fillText(dayTitle, 540, 510);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "30px ui-monospace, monospace";
        ctx.fillText(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }), 540, 560);

        // Rank badge
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

        // Stats grid
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
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, cellW, cellH, 20);
            ctx.stroke();
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.font = "24px ui-monospace, monospace";
            ctx.fillText(label, x + cellW / 2, y + 70);
            ctx.fillStyle = i === 3 ? accent : "#ffffff";
            ctx.font = "bold 56px ui-monospace, monospace";
            ctx.fillText(value, x + cellW / 2, y + 150);
        });

        ctx.fillStyle = "rgba(255,255,255,0.2)";
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
                // user cancelled — no-op
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

    const totalPlanned = exercisesList.reduce((sum, e) => sum + e.target_sets, 0);
    const completedCount = Object.values(logs).flat().filter((s) => s.completed && !s.is_warmup).length;

    /* ═══════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════ */

    // ── LOADING ──
    if (status === "loading") return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center relative">
            <div className="relative z-10">
                <CubeLoader message="Loading workout…" />
            </div>
        </main>
    );

    // ── REST DAY ──
    if (status === "rest_day") return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-6 relative">
            <div className="relative z-10 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 flex items-center justify-center">
                    <Moon size={24} className="text-emerald-400" />
                </div>
                <p className="text-base font-semibold text-emerald-400">Rest Day</p>
                <p className="text-[11px] text-white/30 mt-1.5 max-w-xs mx-auto">Recovery is when your muscles grow. Nothing to log today.</p>
            </div>
        </main>
    );

    // ── NO PLAN ──
    if (status === "no_plan") return (
        <main className="min-h-screen bg-[#050914] text-white p-4 pb-24 relative">
            <div className="relative z-10 max-w-xl mx-auto pt-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center">
                        <Dumbbell size={24} className="text-[rgb(var(--accent-rgb))]" />
                    </div>
                    <p className="text-lg font-bold text-white/85">Get Started</p>
                    <p className="text-[11px] text-white/30 mt-1 max-w-xs mx-auto">Choose how you want to train</p>
                </div>

                <div className="space-y-3">
                    <div className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb)/0.03)] p-4">
                        <p className="text-sm font-semibold text-white/85 mb-1">Create personalized plan</p>
                        <p className="text-[11px] text-white/30 mb-3">Build your own weekly schedule with custom exercises, sets, and rest days.</p>
                        <button onClick={() => router.push("/schedule")} className="w-full text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                            Create My Plan
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-4">
                        <p className="text-sm font-semibold text-white/85 mb-1">Select from existing plans</p>
                        <p className="text-[11px] text-white/30 mb-3">Browse proven workout programs — PPL, Upper/Lower, Full Body, and more.</p>
                        <button onClick={() => router.push("/schedule?browse=1")} className="w-full text-sm font-semibold py-3 rounded-xl border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.05)] transition">
                            Browse Plan Library
                        </button>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <p className="text-sm font-semibold text-white/85 mb-1">Just train today</p>
                        <p className="text-[11px] text-white/30 mb-3">No plan needed — pick exercises and log as you go.</p>
                        <button onClick={() => setStatus("freestyle")} className="w-full text-sm font-medium py-3 rounded-xl border border-white/[0.1] text-white/60 hover:text-white/90 hover:bg-white/[0.05] transition">
                            Start Freestyle Session
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );

    // ── FREESTYLE (BUILD) ──
    if (status === "freestyle") return (
        <main className="min-h-screen bg-[#050914] text-white pb-24 relative">
            <div className="relative z-10 max-w-xl mx-auto px-4 pt-6">
                <button onClick={() => { setFreestyleExercises([]); setStatus(exercisesList.length > 0 ? "not_started" : "no_plan"); }} className="text-[10px] font-mono text-white/30 hover:text-white/60 transition mb-4">
                    ← Back
                </button>
                <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))] mb-1">Freestyle Session</h1>
                <p className="text-[11px] text-white/30 mb-5">Pick exercises and start training</p>

                <button onClick={() => setShowFreestyleAddModal(true)} className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.05)] text-[rgb(var(--accent-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] transition mb-4">
                    <Plus size={16} /> Add Exercise
                </button>

                {freestyleExercises.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[11px] text-white/25">No exercises added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-6">
                        {freestyleExercises.map((ex, i) => (
                            <div key={ex.id} className="flex items-center gap-3 glass-card px-4 py-3">
                                <span className="text-[10px] font-mono text-white/20 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-white/80 truncate">{ex.name}</p>
                                    <p className="text-[9px] font-mono text-white/25">{ex.body_segment}</p>
                                </div>
                                <button onClick={() => removeFreestyleExercise(ex.id)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 transition">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {freestyleExercises.length > 0 && (
                    <button
                        onClick={beginFreestyleSession}
                        disabled={startingFreestyle}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 disabled:opacity-50 transition"
                    >
                        <Play size={16} fill="black" /> {startingFreestyle ? "Starting..." : "Begin Session"}
                    </button>
                )}
            </div>

            {showFreestyleAddModal && <AddExerciseModal onAdd={addFreestyleExercise} onClose={() => setShowFreestyleAddModal(false)} existingIds={new Set(freestyleExercises.map((e) => e.exercise_id))} />}
        </main>
    );

    // ── COMPLETED ──
    if (status === "completed" && summary) return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-4 relative">
            <div className="relative z-10 w-full max-w-xl">
                <CardPanel className="p-5">
                    <div className="text-center mb-5">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center">
                            <Award size={22} className="text-[rgb(var(--accent-rgb))]" />
                        </div>
                        <p className="text-[9px] font-mono tracking-widest text-white/25 mb-1">SESSION COMPLETE</p>
                        <p className="text-lg font-bold text-white/90">{dayTitle}</p>
                    </div>

                    {cycleProfile && (
                        <div className={`rounded-lg px-3 py-2 mb-3 border ${
                            cycleProfile.banner.color === "rose" ? "border-rose-500/15 bg-rose-500/[0.04]" :
                            cycleProfile.banner.color === "emerald" ? "border-emerald-500/15 bg-emerald-500/[0.04]" :
                            cycleProfile.banner.color === "amber" ? "border-amber-500/15 bg-amber-500/[0.04]" :
                            "border-violet-500/15 bg-violet-500/[0.04]"
                        }`}>
                            <p className={`text-[9px] font-mono text-center ${
                                cycleProfile.banner.color === "rose" ? "text-rose-400/60" :
                                cycleProfile.banner.color === "emerald" ? "text-emerald-400/60" :
                                cycleProfile.banner.color === "amber" ? "text-amber-400/60" :
                                "text-violet-400/60"
                            }`}>
                                Trained in {cycleProfile.phase} phase · Day {cycleProfile.cycleDay} · {cycleProfile.styleName}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <StatCell label="DURATION" value={formatClock(summary.duration)} />
                        <StatCell label="SETS" value={String(summary.sets)} />
                        <StatCell label="VOLUME" value={`${Math.round(kgToUnit(summary.volume, weightUnit)).toLocaleString()} ${weightUnit}`} />
                        <StatCell label="XP EARNED" value={`+${summary.xpBreakdown.total}`} accent />
                    </div>

                    <div className="glass-card p-3 mb-5">
                        <p className="text-[8px] font-mono tracking-widest text-white/20 mb-2">XP BREAKDOWN</p>
                        {summary.xpBreakdown.details.map((d, i) => (
                            <p key={i} className="text-[10px] font-mono text-white/40 leading-relaxed">{d}</p>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => router.push("/")} className="flex-1 text-sm font-medium py-3 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition">
                            Dashboard
                        </button>
                        <button onClick={() => router.push("/progress")} className="flex-1 text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                            View Progress
                        </button>
                        <button onClick={handleShare} disabled={sharing} title="Share" className="shrink-0 w-11 flex items-center justify-center rounded-xl border border-white/[0.08] text-white/30 hover:text-white/60 disabled:opacity-40 transition">
                            {sharing ? <div className="w-4 h-4 border-2 border-white/20 border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /> : <Share2 size={14} />}
                        </button>
                    </div>
                    {todaySessions.length >= MAX_SESSIONS_PER_DAY ? (
                        <p className="w-full mt-2 text-[10px] font-mono py-2.5 text-center text-white/20">
                            Daily session limit reached ({MAX_SESSIONS_PER_DAY}/{MAX_SESSIONS_PER_DAY})
                        </p>
                    ) : (
                        <button
                            onClick={() => { setSummary(null); setSessionId(null); setStatus("not_started"); }}
                            className="w-full mt-2 text-[10px] font-mono py-2.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15 transition"
                        >
                            Start another workout ({todaySessions.length}/{MAX_SESSIONS_PER_DAY})
                        </button>
                    )}
                </CardPanel>
            </div>

            {showFreestylePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#080d18] p-5">
                        <p className="text-sm font-semibold text-white/85 mb-2">
                            Save as {new Date().toLocaleDateString(undefined, { weekday: "long" })} workout?
                        </p>
                        <p className="text-[11px] text-white/35 mb-4">
                            It&apos;ll repeat every {new Date().toLocaleDateString(undefined, { weekday: "long" })} automatically.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowFreestylePrompt(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 transition">
                                No Thanks
                            </button>
                            <button onClick={saveFreestyleAsRecurringPlan} disabled={savingFreestylePlan} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 disabled:opacity-50 transition">
                                {savingFreestylePlan ? "Saving..." : "Yes, Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );

    if (status === "completed_today") {
        return (
            <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-4 relative">
                <div className="relative z-10 w-full max-w-xl">
                    <CardPanel className="p-5">
                        <div className="text-center mb-5">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Check size={22} className="text-emerald-400" />
                            </div>
                            <p className="text-[9px] font-mono tracking-widest text-white/25 mb-1">COMPLETED TODAY</p>
                            <p className="text-lg font-bold text-white/90">{dayTitle}</p>
                        </div>

                        {todaySessions.length > 1 ? (
                            <div className="space-y-2 mb-4">
                                {todaySessions.map((s, i) => (
                                    <div key={s.id} className="glass-card p-3">
                                        <p className="text-[8px] font-mono tracking-widest text-white/25 mb-2">SESSION {i + 1}</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <StatCell label="TIME" value={formatClock(s.duration)} />
                                            <StatCell label="SETS" value={String(s.sets)} />
                                            <StatCell label="VOL" value={`${Math.round(s.volume).toLocaleString()}`} />
                                            <StatCell label="XP" value={`+${s.xp}`} accent />
                                        </div>
                                    </div>
                                ))}
                                <div className="rounded-xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb)/0.05)] p-3">
                                    <p className="text-[8px] font-mono tracking-widest text-[rgb(var(--accent-rgb)/0.5)] mb-2">TODAY&apos;S TOTAL</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <StatCell label="SESSIONS" value={String(todaySessions.length)} />
                                        <StatCell label="TOTAL SETS" value={String(todaySessions.reduce((a, s) => a + s.sets, 0))} />
                                        <StatCell label="TOTAL XP" value={`+${todaySessions.reduce((a, s) => a + s.xp, 0)}`} accent />
                                    </div>
                                </div>
                            </div>
                        ) : summary ? (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <StatCell label="DURATION" value={formatClock(summary.duration)} />
                                <StatCell label="SETS" value={String(summary.sets)} />
                                <StatCell label="VOLUME" value={`${Math.round(kgToUnit(summary.volume, weightUnit)).toLocaleString()} ${weightUnit}`} />
                                <StatCell label="XP EARNED" value={`+${summary.xpBreakdown.total}`} accent />
                            </div>
                        ) : null}

                        <p className="text-[10px] font-mono text-white/20 text-center mb-4">Nice work! You can start another session or come back tomorrow.</p>

                        <div className="flex gap-2">
                            <button onClick={() => router.push("/")} className="flex-1 text-sm font-medium py-3 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition">
                                Dashboard
                            </button>
                            <button onClick={() => router.push("/progress")} className="flex-1 text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                                View Progress
                            </button>
                        </div>
                        {todaySessions.length >= MAX_SESSIONS_PER_DAY ? (
                            <p className="w-full mt-2 text-[10px] font-mono py-2.5 text-center text-white/20">
                                Daily session limit reached ({MAX_SESSIONS_PER_DAY}/{MAX_SESSIONS_PER_DAY})
                            </p>
                        ) : (
                            <button
                                onClick={() => { setSummary(null); setSessionId(null); setStatus("not_started"); }}
                                className="w-full mt-2 text-[10px] font-mono py-2.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15 transition"
                            >
                                Start another workout ({todaySessions.length}/{MAX_SESSIONS_PER_DAY})
                            </button>
                        )}
                    </CardPanel>
                </div>
            </main>
        );
    }

    // ── NOT STARTED / ACTIVE ──
    return (
        <main className="min-h-screen bg-[#050914] text-white pb-36 md:pb-10 relative">

            <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-4">

                <SubNavPills pills={trainPills} activeKey="/workout" onSelect={(k) => router.push(k)} />

                {/* ── TOP BAR ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))]">{dayTitle}</h1>
                        <p className="text-[10px] font-mono text-white/25 mt-0.5">
                            {status === "active" ? "Active session" : "Ready to start"}
                        </p>
                    </div>
                    {status === "active" && (
                        <div className="text-right shrink-0 rounded-xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb)/0.05)] px-3 py-1.5">
                            <p className="text-[8px] font-mono text-white/25">ELAPSED</p>
                            <p className="text-lg font-bold font-mono text-[rgb(var(--accent-rgb))]">{formatClock(elapsed)}</p>
                        </div>
                    )}
                    {status === "not_started" && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowDeletePlanConfirm(true)}
                                className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-xl border border-red-500/10 text-red-400/40 hover:text-red-400/80 hover:bg-red-500/5 transition"
                            >
                                <Trash2 size={11} />
                            </button>

                            <button
                                onClick={() => router.push("/schedule")}
                                className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-xl border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition"
                            >
                                <RefreshCw size={11} /> Edit Schedule
                            </button>
                        </div>
                    )}
                </div>

                {/* ── PROGRESS BAR ── */}
                {status === "active" && (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full bg-[rgb(var(--accent-rgb))] rounded-full transition-all" style={{ width: `${totalPlanned ? Math.min(100, (completedCount / totalPlanned) * 100) : 0}%` }} />
                        </div>
                        <p className="text-[10px] font-mono text-white/25 shrink-0">{completedCount}/{totalPlanned}</p>
                    </div>
                )}

                {/* ── CYCLE TRAINING BANNER (female mode) ── */}
                {cycleProfile && (status === "not_started" || status === "active") && (
                    <div className={`rounded-2xl border p-4 ${
                        cycleProfile.banner.color === "rose" ? "border-rose-500/15 bg-rose-500/[0.04]" :
                        cycleProfile.banner.color === "emerald" ? "border-emerald-500/15 bg-emerald-500/[0.04]" :
                        cycleProfile.banner.color === "amber" ? "border-amber-500/15 bg-amber-500/[0.04]" :
                        "border-violet-500/15 bg-violet-500/[0.04]"
                    }`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${
                                        cycleProfile.banner.color === "rose" ? "text-rose-400/60" :
                                        cycleProfile.banner.color === "emerald" ? "text-emerald-400/60" :
                                        cycleProfile.banner.color === "amber" ? "text-amber-400/60" :
                                        "text-violet-400/60"
                                    }`}>
                                        {cycleProfile.phase} · Day {cycleProfile.cycleDay}
                                    </span>
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full ${
                                        cycleProfile.banner.color === "rose" ? "bg-rose-500/10 text-rose-400/50" :
                                        cycleProfile.banner.color === "emerald" ? "bg-emerald-500/10 text-emerald-400/50" :
                                        cycleProfile.banner.color === "amber" ? "bg-amber-500/10 text-amber-400/50" :
                                        "bg-violet-500/10 text-violet-400/50"
                                    }`}>
                                        {cycleProfile.styleName}
                                    </span>
                                </div>
                                <p className={`text-sm font-semibold ${
                                    cycleProfile.banner.color === "rose" ? "text-rose-300" :
                                    cycleProfile.banner.color === "emerald" ? "text-emerald-300" :
                                    cycleProfile.banner.color === "amber" ? "text-amber-300" :
                                    "text-violet-300"
                                }`}>{cycleProfile.banner.headline}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[8px] font-mono text-white/20">INTENSITY</p>
                                <p className={`text-lg font-bold font-mono ${
                                    cycleProfile.intensityModifier >= 1.0 ? "text-emerald-400" :
                                    cycleProfile.intensityModifier >= 0.85 ? "text-amber-400" :
                                    "text-rose-400"
                                }`}>{Math.round(cycleProfile.intensityModifier * 100)}%</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-white/35 leading-relaxed">{cycleProfile.banner.detail}</p>

                        {/* Energy Forecast */}
                        {status === "not_started" && energyForecast.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/[0.04]">
                                <p className="text-[8px] font-mono tracking-widest text-white/20 mb-2">7-DAY ENERGY FORECAST</p>
                                <div className="flex items-end gap-1">
                                    {energyForecast.map((f, i) => {
                                        const dayLabel = i === 0 ? "Today" : new Date(f.date).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
                                        const height = f.energyLevel * 20;
                                        const phaseColor = f.phase === "menstrual" ? "bg-rose-400" : f.phase === "follicular" ? "bg-emerald-400" : f.phase === "ovulation" ? "bg-amber-400" : "bg-violet-400";
                                        return (
                                            <div key={f.date} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-[7px] font-mono text-white/20">{f.label.slice(0, 3)}</span>
                                                <div className={`w-full rounded-sm ${phaseColor} transition-all`} style={{ height: `${height}%`, minHeight: 4, opacity: i === 0 ? 1 : 0.5 + (f.energyLevel / 10) }} />
                                                <span className={`text-[8px] font-mono ${i === 0 ? "text-white/50 font-bold" : "text-white/20"}`}>{dayLabel}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Warm-up & Nutrition tips */}
                        {status === "not_started" && (
                            <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-2 gap-2">
                                <div className="glass-card p-2.5">
                                    <p className="text-[7px] font-mono tracking-widest text-white/20 mb-1">WARM-UP · {cycleProfile.warmUpGuidance.minutes} MIN</p>
                                    <p className="text-[9px] text-white/35 leading-relaxed">{cycleProfile.warmUpGuidance.focus}</p>
                                </div>
                                <div className="glass-card p-2.5">
                                    <p className="text-[7px] font-mono tracking-widest text-white/20 mb-1">NUTRITION TIP</p>
                                    <p className="text-[9px] text-white/35 leading-relaxed">{cycleProfile.nutritionTip}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── PRE-SESSION PREVIEW ── */}
                {status === "not_started" && (
                    <CardPanel className="p-4">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <StatCell label="EXERCISES" value={String(exercisesList.length)} />
                            <StatCell label="SETS" value={String(totalPlanned)} />
                            <StatCell label="EST. TIME" value={`${totalPlanned * 3}m`} />
                        </div>

                        <div className="glass-card p-3 mb-4">
                            <p className="text-[8px] font-mono tracking-widest text-white/25 mb-2">PRE-WORKOUT BODY WEIGHT</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()}
                                    inputMode="decimal"
                                    value={preWorkoutWeight}
                                    onChange={(e) => setPreWorkoutWeight(e.target.value)}
                                    placeholder="—"
                                    className="flex-1 min-w-0 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center text-lg font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.3)] transition"
                                />
                                <span className="text-sm font-mono text-white/25 shrink-0">{weightUnit}</span>
                                {preWorkoutWeight && !weightLogged && (
                                    <button
                                        onClick={async () => {
                                            if (!user || !preWorkoutWeight) return;
                                            await supabase.from("body_weight_logs").insert({
                                                user_id: user.id,
                                                weight: weightInputToKg(Number(preWorkoutWeight), weightUnit),
                                                context: "pre_workout",
                                                sex: userSex,
                                            });
                                            setWeightLogged(true);
                                        }}
                                        className="shrink-0 text-[10px] font-mono px-3 py-2 rounded-xl border border-[rgb(var(--accent-rgb)/0.2)] text-[rgb(var(--accent-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] transition"
                                    >
                                        Log
                                    </button>
                                )}
                                {weightLogged && <Check size={16} className="shrink-0 text-[rgb(var(--accent-rgb))]" />}
                            </div>
                            <p className="text-[9px] font-mono text-white/15 mt-1.5">Optional — helps track body composition.</p>
                        </div>

                        <button onClick={startWorkout} className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                            <Play size={16} fill="black" /> Begin Session
                        </button>
                        <button onClick={() => setStatus("freestyle")} className="w-full text-center text-[11px] text-white/20 hover:text-white/50 transition py-2.5 mb-2">
                            Not feeling today&apos;s plan? Train freestyle instead
                        </button>

                        <div className="space-y-2 mb-4">
                            {exercisesList.map((ex, i) => {
                                const hint = overloadHints[ex.exercise_id];
                                return (
                                    <div key={ex.id} className="glass-card px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-white/15 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-white/80 truncate">{ex.name}</p>
                                                <p className="text-[9px] font-mono text-white/25">{ex.body_segment}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-center">
                                                    <p className="text-[7px] font-mono text-white/25">SETS</p>
                                                    <p className="text-xs font-bold text-white/70">{ex.target_sets}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[7px] font-mono text-white/25">REPS</p>
                                                    <p className="text-xs font-bold text-white/70">{ex.target_reps}</p>
                                                </div>
                                                {ex.target_weight && (
                                                    <div className="text-center">
                                                        <p className="text-[7px] font-mono text-white/25">{weightUnit.toUpperCase()}</p>
                                                        <p className="text-xs font-bold text-white/70">{Math.round(kgToUnit(ex.target_weight, weightUnit))}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {hint && hint.type !== "first_time" && (
                                            <p className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] mt-1.5 ml-8">
                                                <TrendingUp size={10} className="inline mr-1 -mt-0.5" />{hint.text}
                                            </p>
                                        )}
                                        {exerciseRisks[ex.id] && (
                                            <p className="text-[9px] font-mono text-amber-400/50 mt-1 ml-8">
                                                ⚠ {exerciseRisks[ex.id].reason}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardPanel>
                )}

                {/* ── ACTIVE EXERCISE LIST ── */}
                {status === "active" && (
                    <div className="space-y-3">
                        {exercisesList.map((ex, i) => {
                            const sets = logs[ex.id] ?? [];
                            const workingSetsOnly = sets.filter((s) => !s.is_warmup);
                            const warmupSetsOnly = sets.filter((s) => s.is_warmup);
                            const done = workingSetsOnly.filter((s) => s.completed).length;
                            const warmupDone = warmupSetsOnly.filter((s) => s.completed).length;
                            const isOpen = expandedId === ex.id;
                            const last = lastPerformance[ex.exercise_id];
                            const hint = overloadHints[ex.exercise_id];
                            const allDone = done === workingSetsOnly.length && workingSetsOnly.length > 0 && warmupDone === warmupSetsOnly.length;
                            const isSkipped = skippedExercises.has(ex.id);

                            return (
                                <div key={ex.id} className={`rounded-xl border overflow-hidden transition-all ${isSkipped ? "border-white/[0.04] bg-white/[0.01] opacity-50" : allDone ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.03)]" : "border-white/[0.06] bg-white/[0.03]"}`}>
                                    {/* Exercise header */}
                                    <button onClick={() => isSkipped ? unskipExercise(ex.id) : setExpandedId(isOpen ? null : ex.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${isSkipped ? "bg-white/[0.03] text-white/15 border border-white/[0.04]" : allDone ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-rgb))] border border-[rgb(var(--accent-rgb)/0.2)]" : "bg-white/[0.04] text-white/20 border border-white/[0.06]"}`}>
                                            {isSkipped ? <Ban size={12} /> : allDone ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[13px] font-medium truncate ${isSkipped ? "text-white/30 line-through" : "text-white/80"}`}>{ex.name}</p>
                                            <p className="text-[9px] font-mono text-white/25">
                                                {isSkipped ? "Skipped" : `${done}/${workingSetsOnly.length} sets${warmupSetsOnly.length > 0 ? ` + ${warmupDone}/${warmupSetsOnly.length} warm-up` : ""}${last ? ` · Last: ${last.weight != null ? kgToUnit(last.weight, weightUnit) : "—"}${ex.isCardio ? "" : ex.isBodyweight ? " BW" : weightUnit} × ${last.reps ?? "—"}` : ""}`}
                                            </p>
                                        </div>
                                        {isSkipped ? (
                                            <span className="text-[9px] font-mono text-white/20 shrink-0">tap to undo</span>
                                        ) : (
                                            <ChevronDown size={14} className={`text-white/15 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                        )}
                                    </button>

                                    {/* Expanded content */}
                                    {isOpen && !isSkipped && (
                                        <div className="border-t border-white/[0.04]">
                                            {/* Overload hint */}
                                            {hint && hint.type !== "first_time" && (
                                                <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[rgb(var(--accent-rgb)/0.05)] border border-[rgb(var(--accent-rgb)/0.1)] px-3 py-2">
                                                    <TrendingUp size={11} className="text-[rgb(var(--accent-rgb)/0.5)] shrink-0" />
                                                    <p className="text-[10px] font-mono text-[rgb(var(--accent-rgb)/0.6)]">{hint.text}</p>
                                                </div>
                                            )}

                                            {/* Injury risk indicator */}
                                            {exerciseRisks[ex.id] && (
                                                <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 px-3 py-2">
                                                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                                                    <div>
                                                        <p className="text-[10px] font-mono text-amber-400/70">{exerciseRisks[ex.id].reason}</p>
                                                        <p className="text-[9px] font-mono text-amber-400/40 mt-0.5">Alternative: {exerciseRisks[ex.id].alternative}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cycle-adjusted weight suggestion */}
                                            {cycleProfile && !ex.isCardio && !ex.isBodyweight && lastPerformance[ex.exercise_id]?.weight && (() => {
                                                const adj = getCycleAdjustedWeight(lastPerformance[ex.exercise_id].weight, cycleProfile.intensityModifier);
                                                return adj.label ? (
                                                    <div className={`mx-4 mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                                                        cycleProfile.intensityModifier >= 1.0 ? "bg-emerald-500/[0.05] border border-emerald-500/10" : "bg-violet-500/[0.05] border border-violet-500/10"
                                                    }`}>
                                                        <p className={`text-[9px] font-mono ${cycleProfile.intensityModifier >= 1.0 ? "text-emerald-400/60" : "text-violet-400/60"}`}>
                                                            {adj.label}
                                                        </p>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Swap / Skip / Remove / Warm-up */}
                                            <div className="px-4 pt-2.5 pb-1 flex items-center gap-4">
                                                <button onClick={() => setSwapTargetId(ex.id)} className="flex items-center gap-1.5 text-white/15 text-[10px] font-mono hover:text-white/40 transition">
                                                    <RefreshCw size={10} /> Swap
                                                </button>
                                                <button onClick={() => skipExercise(ex.id)} className="flex items-center gap-1.5 text-white/15 text-[10px] font-mono hover:text-amber-400/60 transition">
                                                    <SkipForward size={10} /> Skip
                                                </button>
                                                {done === 0 && (
                                                    <button onClick={() => removeExercise(ex.id)} className="flex items-center gap-1.5 text-white/15 text-[10px] font-mono hover:text-red-400/60 transition">
                                                        <X size={10} /> Remove
                                                    </button>
                                                )}
                                                {!ex.isCardio && !ex.isBodyweight && (
                                                    <button onClick={() => toggleWarmup(ex)} className={`flex items-center gap-1.5 text-[10px] font-mono transition ml-auto ${warmupExercises.has(ex.id) ? "text-amber-400/70 hover:text-amber-400" : "text-white/15 hover:text-amber-400/60"}`}>
                                                        {warmupExercises.has(ex.id) ? <StretchingStickman size={18} color="#fbbf24" /> : <Flame size={10} />}
                                                        {warmupExercises.has(ex.id) ? "Remove warm-up" : "Warm-up"}
                                                    </button>
                                                )}
                                            </div>

                                            {ex.isCardio ? (
                                                /* ── CARDIO: single entry, no sets ── */
                                                <div className="px-4 pb-4 pt-2 space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <p className="text-[8px] font-mono text-white/30 mb-1">DURATION (MIN)</p>
                                                            <input
                                                                type="number" min="0" inputMode="numeric"
                                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                value={sets[0]?.duration ?? ""}
                                                                onChange={(e) => updateSet(ex.id, 0, "duration", e.target.value)}
                                                                disabled={sets[0]?.completed}
                                                                placeholder="—"
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] disabled:opacity-40 transition"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-mono text-white/30 mb-1">DISTANCE (KM)</p>
                                                            <input
                                                                type="number" min="0" inputMode="decimal"
                                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                value={sets[0]?.distance ?? ""}
                                                                onChange={(e) => updateSet(ex.id, 0, "distance", e.target.value)}
                                                                disabled={sets[0]?.completed}
                                                                placeholder="—"
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] disabled:opacity-40 transition"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-mono text-white/30 mb-1">SPEED (KM/H)</p>
                                                            <input
                                                                type="number" min="0" inputMode="decimal"
                                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                value={sets[0]?.weight ?? ""}
                                                                onChange={(e) => updateSet(ex.id, 0, "weight", e.target.value)}
                                                                disabled={sets[0]?.completed}
                                                                placeholder="—"
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] disabled:opacity-40 transition"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-mono text-white/30 mb-1">INCLINE (%)</p>
                                                            <input
                                                                type="number" min="0" inputMode="decimal"
                                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                value={sets[0]?.reps ?? ""}
                                                                onChange={(e) => updateSet(ex.id, 0, "reps", e.target.value)}
                                                                disabled={sets[0]?.completed}
                                                                placeholder="—"
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] disabled:opacity-40 transition"
                                                            />
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={sets[0]?.note ?? ""}
                                                        onChange={(e) => updateSet(ex.id, 0, "note", e.target.value)}
                                                        disabled={sets[0]?.completed}
                                                        placeholder="Notes (optional)"
                                                        className="w-full text-[10px] font-mono rounded-lg bg-transparent border border-white/[0.06] px-3 py-2 text-white/40 placeholder:text-white/15 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.2)] disabled:opacity-40 transition"
                                                    />
                                                    {!sets[0]?.completed ? (
                                                        <button
                                                            onClick={() => completeSet(ex, 0)}
                                                            className="w-full text-[10px] font-mono font-bold py-3 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.15)] transition"
                                                        >
                                                            LOG CARDIO ✓
                                                        </button>
                                                    ) : (
                                                        <p className="text-[10px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] text-center py-2">✓ Logged</p>
                                                    )}
                                                </div>
                                            ) : (
                                                /* ── STRENGTH / BODYWEIGHT: set-based ── */
                                                <div className="px-4 pb-4 space-y-1.5 border-t border-white/[0.06] pt-3">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] font-mono text-white/25 tracking-wider">
                                                        <span className="w-5 sm:w-7" />
                                                        {ex.isBodyweight ? (
                                                            <span className="flex-1 text-center">REPS</span>
                                                        ) : (
                                                            <><span className="flex-1 text-center">{weightUnit.toUpperCase()}</span><span className="flex-1 text-center">REPS</span></>
                                                        )}
                                                        <span className="w-9 sm:w-11" />
                                                    </div>

                                                    {sets.map((s, si) => {
                                                        const isWarmup = !!s.is_warmup;
                                                        const warmupCount = sets.filter((x) => x.is_warmup).length;
                                                        const displayNum = isWarmup ? `W${si + 1}` : String(s.index - warmupCount + 1);
                                                        return (
                                                        <div key={s.index} className={isWarmup ? "rounded-lg bg-amber-400/[0.04] border border-amber-400/[0.08] px-1 py-0.5" : ""}>
                                                            <SwipeSet completed={s.completed} onComplete={() => completeSet(ex, s.index)}>
                                                                <div className={`flex items-center gap-1.5 sm:gap-2 ${isWarmup ? "bg-transparent" : "bg-[#0a1120]"}`}>
                                                                    <span className={`text-[10px] font-mono w-5 sm:w-7 text-center shrink-0 ${isWarmup ? "text-amber-400/50" : s.completed ? "text-[rgb(var(--accent-light-rgb)/0.5)]" : "text-white/25"}`}>
                                                                        {displayNum}
                                                                    </span>
                                                                    {isWarmup && s.warmup_label && (
                                                                        <span className="text-[8px] font-mono text-amber-400/50 w-8 shrink-0">{s.warmup_label}</span>
                                                                    )}
                                                                    {ex.isBodyweight ? (
                                                                        <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="—" value={s.reps} onChange={(e) => updateSet(ex.id, s.index, "reps", e.target.value)} disabled={s.completed}
                                                                            className={`flex-1 min-w-0 h-10 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold font-mono focus:outline-none disabled:opacity-40 transition ${isWarmup ? "bg-amber-400/[0.03] border-amber-400/[0.1] focus:border-amber-400/30" : "bg-white/[0.04] border-white/[0.08] focus:border-[rgb(var(--accent-rgb)/0.4)] focus:bg-[rgb(var(--accent-rgb))]/[0.03]"}`} />
                                                                    ) : (
                                                                        <>
                                                                            <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="—" value={s.weight} onChange={(e) => updateSet(ex.id, s.index, "weight", e.target.value)} disabled={s.completed}
                                                                                className={`flex-1 min-w-0 h-10 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold font-mono focus:outline-none disabled:opacity-40 transition ${isWarmup ? "bg-amber-400/[0.03] border-amber-400/[0.1] focus:border-amber-400/30" : "bg-white/[0.04] border-white/[0.08] focus:border-[rgb(var(--accent-rgb)/0.4)] focus:bg-[rgb(var(--accent-rgb))]/[0.03]"}`} />
                                                                            <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="—" value={s.reps} onChange={(e) => updateSet(ex.id, s.index, "reps", e.target.value)} disabled={s.completed}
                                                                                className={`flex-1 min-w-0 h-10 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold font-mono focus:outline-none disabled:opacity-40 transition ${isWarmup ? "bg-amber-400/[0.03] border-amber-400/[0.1] focus:border-amber-400/30" : "bg-white/[0.04] border-white/[0.08] focus:border-[rgb(var(--accent-rgb)/0.4)] focus:bg-[rgb(var(--accent-rgb))]/[0.03]"}`} />
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => !s.completed && completeSet(ex, s.index)}
                                                                        className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg border flex items-center justify-center transition ${s.completed
                                                                            ? isWarmup ? "border-amber-400/40 bg-amber-400/15 text-amber-400" : "border-[rgb(var(--accent-rgb)/0.5)] bg-[rgb(var(--accent-rgb)/0.2)] text-[rgb(var(--accent-light-rgb))]"
                                                                            : isWarmup ? "border-amber-400/15 text-amber-400/30 hover:border-amber-400/40 hover:text-amber-400/70 active:scale-95" : "border-white/10 text-white/20 hover:border-[rgb(var(--accent-rgb)/0.4)] hover:text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb))]/[0.05] active:scale-95"
                                                                            }`}
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                </div>
                                                            </SwipeSet>
                                                            {!s.completed && !isWarmup && (
                                                                <input type="text" value={s.note} onChange={(e) => updateSet(ex.id, s.index, "note", e.target.value)} placeholder="Note (optional)"
                                                                    className="mt-1 ml-5 sm:ml-7 text-[10px] font-mono rounded-md bg-transparent border border-white/[0.04] px-2 py-1 text-white/30 placeholder:text-white/15 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.2)] focus:text-white/50 transition" style={{ width: "calc(100% - 24px)" }} />
                                                            )}
                                                        </div>
                                                        );
                                                    })}

                                                    <button onClick={() => addSet(ex.id)} className="flex items-center gap-1.5 text-[rgb(var(--accent-light-rgb)/0.6)] text-[10px] font-mono hover:text-[rgb(var(--accent-light-rgb))] transition pt-1 ml-5 sm:ml-7">
                                                        <Plus size={12} /> Add set
                                                    </button>

                                                    {allDone && !confirmedExercises.has(ex.id) && (
                                                        <button
                                                            onClick={() => {
                                                                setConfirmedExercises((prev) => new Set([...prev, ex.id]));
                                                                const currentIdx = exercisesList.findIndex((e) => e.id === ex.id);
                                                                const next = exercisesList[currentIdx + 1];
                                                                if (next) setExpandedId(next.id);
                                                            }}
                                                            className="w-full mt-3 text-[10px] font-mono font-bold py-2.5 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.15)] transition"
                                                        >
                                                            CONFIRM & NEXT EXERCISE →
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-white/20 text-xs font-mono hover:text-white/50 transition py-2">
                            <Plus size={14} /> Add exercise
                        </button>
                    </div>
                )}
            </div>

            {/* ── REST TIMER (sticky bottom) ── */}
            {restRemaining !== null && status === "active" && (
                <div className="fixed bottom-16 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-xl z-30">
                    <div className="border-t md:border border-white/[0.08] bg-[#080d18]/95 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between md:rounded-xl">
                        <div>
                            <p className="text-[8px] font-mono tracking-widest text-white/25">REST TIMER</p>
                            <p className="text-2xl font-bold font-mono text-[rgb(var(--accent-rgb))]">{formatClock(restRemaining)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setRestRemaining((r) => (r !== null ? r + 15 : null))} className="text-[10px] font-mono px-2.5 py-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 active:scale-95 transition">+15s</button>
                            <button onClick={() => setRestPaused((p) => !p)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 active:scale-95 transition">
                                {restPaused ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <button onClick={() => { setRestRemaining(null); setRestPaused(false); }} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 active:scale-95 transition">
                                <SkipForward size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STICKY ACTION BAR ── */}
            {status === "active" && restRemaining === null && completedCount > 0 && (
                <div className="fixed bottom-16 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-xl z-20">
                    <div className="border-t md:border border-white/[0.06] bg-[#080d18]/95 backdrop-blur-xl px-5 py-3 md:rounded-xl flex items-center gap-2">
                        <button
                            onClick={() => { setRestRemaining(Math.round(90 * (cycleProfile?.restMultiplier ?? 1))); setRestPaused(false); }}
                            className="flex-1 text-[10px] font-mono font-medium py-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/70 transition"
                        >
                            Rest Timer
                        </button>
                        <button onClick={() => setShowEndConfirm(true)} className="flex-1 text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                            Complete · {completedCount} sets
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODALS ── */}
            {finishing && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <CubeLoader message="Saving your workout…" />
                </div>
            )}

            {showEndConfirm && !finishing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#080d18] p-5">
                        <p className="text-sm font-semibold text-white/85 mb-2">End workout?</p>
                        {completedCount < totalPlanned ? (
                            <p className="text-[11px] text-white/35 mb-4">
                                You&apos;ve completed {completedCount} of {totalPlanned} planned sets. Unfinished sets won&apos;t be logged.
                            </p>
                        ) : (
                            <p className="text-[11px] text-white/35 mb-4">
                                All {completedCount} sets completed. Nice work.
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => setShowEndConfirm(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 transition">
                                Keep Going
                            </button>
                            <button onClick={() => { setShowEndConfirm(false); finishWorkout(); }} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeletePlanConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-red-500/15 bg-[#080d18] p-5">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Trash2 size={18} className="text-red-400" />
                        </div>
                        <p className="text-sm font-semibold text-white/85 text-center mb-2">Delete entire workout plan?</p>
                        <p className="text-[11px] text-white/35 text-center mb-4">
                            This will permanently delete your weekly schedule for the current mode. All templates and scheduled exercises will be removed. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowDeletePlanConfirm(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/80 transition">
                                Cancel
                            </button>
                            <button onClick={deletePlan} disabled={deletingPlan} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition">
                                {deletingPlan ? "Deleting..." : "Delete Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {swapTargetId && <AddExerciseModal onAdd={(e) => { const old = exercisesList.find((x) => x.id === swapTargetId); if (old) handleSwap(old, e); }} onClose={() => setSwapTargetId(null)} defaultSegment={exercisesList.find((x) => x.id === swapTargetId)?.body_segment} />}
            {showAddModal && <AddExerciseModal onAdd={handleAddExercise} onClose={() => setShowAddModal(false)} existingIds={new Set(exercisesList.map((e) => e.exercise_id))} />}
        </main>
    );
}