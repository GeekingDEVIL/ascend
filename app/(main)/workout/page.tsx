"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Play, X, RefreshCw, Pause, SkipForward, ChevronDown, Moon, Flame, Dumbbell, Timer, TrendingUp, Award } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { calculateSessionXP, type XPBreakdown } from "../../lib/xpEngine";
import { computeLevel } from "../../lib/levelSystem";
import { checkAndAwardAchievements } from "../../lib/achievements";
import { updateUserStats } from "../../lib/updateUserStats";
import AddExerciseModal from "../../components/AddExerciseModal";

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

function computeOverload(lastW: number | null, lastR: number | null, targetReps: string): OverloadSuggestion {
    if (lastW === null || lastR === null) return { type: "first_time", text: "First session — establish your baseline", suggestedWeight: null };
    const maxTarget = Number(targetReps.split("-").pop()) || 10;
    if (lastR >= maxTarget) {
        const next = lastW < 20 ? lastW + 1 : lastW < 50 ? lastW + 2.5 : lastW + 5;
        return { type: "weight_up", text: `Hit ${lastR} reps → increase to ${next}kg`, suggestedWeight: next };
    }
    return { type: "reps_up", text: `Got ${lastR} reps @ ${lastW}kg → aim for ${lastR + 1}+`, suggestedWeight: lastW };
}

/* ─── BEAM BORDER (reused from Dashboard) ─── */
function BeamBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="relative">
            <div className="relative p-[1.5px] rounded-lg overflow-hidden">
                <style>{`@keyframes beamSpin { to { transform: rotate(360deg); } }`}</style>
                <div
                    className="absolute inset-[-60%] animate-[beamSpin_8s_linear_infinite] opacity-50"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0%, transparent 10%, #22d3ee 20%, #a5f3fc 28%, #22d3ee 36%, transparent 46%, transparent 54%, #22d3ee 64%, #a5f3fc 72%, #22d3ee 80%, transparent 90%, transparent 100%)",
                        filter: "blur(3px)",
                    }}
                />
                <div className={`relative rounded-lg bg-[#0a1120]/95 ${className}`}>{children}</div>
            </div>
        </div>
    );
}

/* ─── GLASS STAT ─── */
function GlassStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 text-center">
            <p className="text-[8px] font-mono tracking-widest text-white/30 mb-0.5">{label}</p>
            <p className={`text-lg font-bold font-mono ${accent ? "text-cyan-300" : "text-white/90"}`}>{value}</p>
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
                className="absolute inset-0 flex items-center pl-4 bg-cyan-400/20 rounded-lg pointer-events-none"
                style={{ opacity: dragX > 4 ? 1 : 0 }}
            >
                <span className={`text-[10px] font-mono font-bold flex items-center gap-1.5 transition-transform ${pastThreshold ? "text-cyan-200 scale-110" : "text-cyan-300/70"}`}>
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
    const [summary, setSummary] = useState<{ duration: number; sets: number; volume: number; xpBreakdown: XPBreakdown } | null>(null);
    const [freestyleExercises, setFreestyleExercises] = useState<WorkoutExercise[]>([]);
    const [showFreestyleAddModal, setShowFreestyleAddModal] = useState(false);
    const [startingFreestyle, setStartingFreestyle] = useState(false);
    const [showFreestylePrompt, setShowFreestylePrompt] = useState(false);
    const [savingFreestylePlan, setSavingFreestylePlan] = useState(false);

    const today = toDateString(new Date());

    /* ─── LOAD ─── */
    const load = useCallback(async () => {
        if (!user) return;
        setStatus("loading");

        const weekday = new Date().getDay();
        const { data: plan } = await supabase
            .from("recurring_plans")
            .select("template_id, is_rest, workout_templates(name)")
            .eq("user_id", user.id)
            .eq("weekday", weekday)
            .maybeSingle();

        if (!plan) { setStatus("no_plan"); return; }
        if (plan.is_rest) { setStatus("rest_day"); return; }
        if (!plan.template_id) { setStatus("no_plan"); return; }

        const planTitle = (plan as any).workout_templates?.name || "Workout";
        setDayTitle(planTitle);

        let { data: day } = await supabase.from("scheduled_days").select("id").eq("user_id", user.id).eq("date", today).maybeSingle();
        if (!day) {
            const { data: created } = await supabase.from("scheduled_days").insert({ user_id: user.id, date: today, title: planTitle, is_rest: false }).select("id").single();
            day = created;
            if (day) {
                const { data: te } = await supabase.from("workout_template_exercises").select("exercise_id, order_index, target_sets, target_reps, target_weight, rest_seconds, notes").eq("template_id", plan.template_id).order("order_index");
                if (te?.length) {
                    await supabase.from("scheduled_exercises").insert(te.map((t: any) => ({ scheduled_day_id: day!.id, user_id: user.id, exercise_id: t.exercise_id, order_index: t.order_index, target_sets: t.target_sets, target_reps: t.target_reps, target_weight: t.target_weight, rest_seconds: t.rest_seconds, notes: t.notes })));
                }
            }
        }
        if (!day) { setStatus("no_plan"); return; }
        setScheduledDayId(day.id);

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

        const exerciseIds = mapped.map((m) => m.exercise_id);
        const { data: priorLogs } = await supabase.from("exercise_set_logs").select("exercise_id, weight, reps, completed_at, workout_session_id").eq("user_id", user.id).in("exercise_id", exerciseIds).order("completed_at", { ascending: false }).limit(500);

        // Check for completed session first — if today's already done, block restart

        const { data: completedSessions } = await supabase
            .from("workout_sessions")
            .select("id, total_sets, total_volume, duration_seconds, xp_earned")
            .eq("user_id", user.id)
            .eq("date", today)
            .eq("status", "completed")
            .limit(1);
        const completedSession = completedSessions?.[0] ?? null;
        if (completedSession) {
            setDayTitle(planTitle);
            setSummary({
                duration: completedSession.duration_seconds || 0,
                sets: completedSession.total_sets || 0,
                volume: Number(completedSession.total_volume) || 0,
                xpBreakdown: { total: completedSession.xp_earned || 0, base: 0, setCompletion: 0, completionBonus: 0, prBonus: 0, progressionBonus: 0, consistencyBonus: 0, details: [] } as XPBreakdown,
            });
            localStorage.removeItem("ascend_active_session");
            setStatus("completed_today");
            return;
        }

        const { data: existingSession } = await supabase.from("workout_sessions").select("*").eq("user_id", user.id).eq("date", today).eq("status", "active").maybeSingle();

        const lastMap: Record<string, { weight: number | null; reps: number | null }> = {};
        const hints: Record<string, OverloadSuggestion> = {};
        (priorLogs ?? []).forEach((row: any) => {
            if (existingSession && row.workout_session_id === existingSession.id) return;
            if (!lastMap[row.exercise_id]) lastMap[row.exercise_id] = { weight: row.weight, reps: row.reps };
        });
        mapped.forEach((ex) => {
            const last = lastMap[ex.exercise_id];
            hints[ex.exercise_id] = computeOverload(last?.weight ?? null, last?.reps ?? null, ex.target_reps);
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
                    arr.push(saved ? { index: i, weight: saved.weight != null ? String(saved.weight) : "", reps: saved.reps != null ? String(saved.reps) : "", duration: saved.duration_seconds != null ? String(saved.duration_seconds) : "", distance: saved.distance != null ? String(saved.distance) : "", note: "", completed: true, logId: saved.id } : emptySet(i));
                }
                logMap[ex.id] = arr;
            });
            setLogs(logMap);
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
    }, [user, today]);

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
        const { data } = await supabase.from("workout_sessions").insert({ user_id: user.id, scheduled_day_id: scheduledDayId, date: today, title: dayTitle, status: "active" }).select().single();
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
        setStartingFreestyle(true);

        let { data: day } = await supabase.from("scheduled_days").select("id").eq("user_id", user.id).eq("date", today).maybeSingle();
        if (!day) {
            const { data: created } = await supabase.from("scheduled_days").insert({ user_id: user.id, date: today, title: "Freestyle Session", is_rest: false }).select("id").single();
            day = created;
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

        const { data: session } = await supabase.from("workout_sessions").insert({ user_id: user.id, scheduled_day_id: day.id, date: today, title: "Freestyle Session", status: "active" }).select().single();
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
        const { data } = await supabase.from("exercise_set_logs").select("weight").eq("user_id", user.id).eq("exercise_id", exerciseId).gt("weight", 0).order("weight", { ascending: false }).limit(1);
        const prev = data?.[0]?.weight ?? 0;
        if (w > prev && prev > 0) {
            setPrCount((c) => c + 1);
            await supabase.from("notifications").insert({ user_id: user.id, type: "new_pr", title: "NEW PERSONAL RECORD", message: `${name}: ${w}kg × ${r} — previous best was ${prev}kg`, metadata: { exercise_name: name, weight: w, reps: r, previous_best: prev } });
        }
    }

    async function completeSet(ex: WorkoutExercise, idx: number) {
        if (!user || !sessionId) return;
        const set = logs[ex.id]?.find((s) => s.index === idx);
        if (!set) return;
        const payload: any = { workout_session_id: sessionId, user_id: user.id, exercise_id: ex.exercise_id, scheduled_exercise_id: ex.id, set_index: idx };
        if (ex.isCardio) { payload.duration_seconds = set.duration ? Number(set.duration) : null; payload.distance = set.distance ? Number(set.distance) : null; }
        else { payload.weight = ex.isBodyweight ? 0 : (set.weight ? Number(set.weight) : null); payload.reps = set.reps ? Number(set.reps) : null; }

        let logId = set.logId;
        if (logId) { await supabase.from("exercise_set_logs").update(payload).eq("id", logId); }
        else { const { data } = await supabase.from("exercise_set_logs").insert(payload).select().single(); logId = data?.id ?? null; }

        setLogs((p) => ({ ...p, [ex.id]: p[ex.id].map((s) => (s.index === idx ? { ...s, completed: true, logId } : s)) }));
        if (navigator.vibrate) navigator.vibrate(50);
        if (!ex.isCardio && !ex.isBodyweight && set.weight && set.reps) checkPR(ex.exercise_id, ex.name, Number(set.weight), Number(set.reps));
        // Don't auto-start rest timer — user taps to start if they want
    }

    async function propagateToTemplate(orderIdx: number, newExId: string) {
        if (!user) return;
        const wd = new Date(today + "T00:00:00").getDay();
        const { data: rp } = await supabase.from("recurring_plans").select("template_id").eq("user_id", user.id).eq("weekday", wd).maybeSingle();
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
        await propagateToTemplate(oldEx.order_index, newEx.id);
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
        const wd = new Date(today + "T00:00:00").getDay();
        const { data: rp } = await supabase.from("recurring_plans").select("template_id").eq("user_id", user.id).eq("weekday", wd).maybeSingle();
        if (rp?.template_id) await supabase.from("workout_template_exercises").insert({ template_id: rp.template_id, user_id: user.id, exercise_id: newEx.id, order_index: nextOrder, target_sets: 3, target_reps: "8-10" });
        setShowAddModal(false);
    }

    function addSet(exId: string) { setLogs((p) => ({ ...p, [exId]: [...p[exId], emptySet(p[exId].length)] })); }

    async function finishWorkout() {
        if (!user || !sessionId || !startedAt) return;
        const allSets = Object.values(logs).flat().filter((s) => s.completed);
        const totalSets = allSets.length;
        const totalVolume = allSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        const dur = Math.floor((Date.now() - startedAt) / 1000);
        const totalPlanned = exercisesList.reduce((sum, e) => sum + e.target_sets, 0);
        const setsData = allSets.map((s) => { const ex = exercisesList.find((e) => logs[e.id]?.includes(s)); return { exercise_id: ex?.exercise_id ?? "", weight: Number(s.weight) || null, reps: Number(s.reps) || null }; });
        const xp = await calculateSessionXP(user.id, sessionId, setsData, totalPlanned, prCount);

        await supabase.from("workout_sessions").update({ status: "completed", completed_at: new Date().toISOString(), duration_seconds: dur, total_volume: totalVolume, total_sets: totalSets, xp_earned: xp.total }).eq("id", sessionId);
        await supabase.from("notifications").insert({ user_id: user.id, type: "workout_complete", title: "WORKOUT COMPLETE", message: `${dayTitle} — ${totalSets} sets, ${Math.round(totalVolume).toLocaleString()}kg volume, +${xp.total} XP`, metadata: { sets: totalSets, volume: totalVolume, xp: xp.total } });

        // Streak + Level checks
        const { data: sessions } = await supabase.from("workout_sessions").select("date").eq("user_id", user.id).eq("status", "completed").order("date", { ascending: false }).limit(120);
        if (sessions) {
            const { data: plans } = await supabase.from("recurring_plans").select("weekday, is_rest").eq("user_id", user.id);
            const restDays = new Set((plans ?? []).filter((p: any) => p.is_rest).map((p: any) => p.weekday));
            const dates = new Set(sessions.map((s: any) => s.date));
            let streak = 0; const check = new Date(today + "T00:00:00");
            for (let i = 0; i < 120; i++) { const d = toDateString(check); const wd = check.getDay(); if (restDays.has(wd)) { check.setDate(check.getDate() - 1); continue; } if (dates.has(d)) { streak++; check.setDate(check.getDate() - 1); } else break; }
            if ([7, 14, 30, 60, 100].includes(streak)) await supabase.from("notifications").insert({ user_id: user.id, type: "streak_milestone", title: `${streak}-DAY STREAK`, message: `Consistent for ${streak} days!`, metadata: { streak } });
        }

        // Level up check
        const { data: xpRows } = await supabase.from("workout_sessions").select("xp_earned").eq("user_id", user.id).eq("status", "completed");
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
        await checkAndAwardAchievements(user.id);

        // Update leaderboard stats
        await updateUserStats(user.id);

        // Freestyle → offer to make it a recurring plan if today has none
        if (dayTitle === "Freestyle Session") {
            const weekday = new Date().getDay();
            const { data: existingPlan } = await supabase.from("recurring_plans").select("id").eq("user_id", user.id).eq("weekday", weekday).limit(1);
            if (!existingPlan?.length) setShowFreestylePrompt(true);
        }

        localStorage.removeItem("ascend_active_session");
        setSummary({ duration: dur, sets: totalSets, volume: totalVolume, xpBreakdown: xp });
        setStatus("completed");
        setRestRemaining(null);
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
            await supabase.from("recurring_plans").insert({ user_id: user.id, weekday, template_id: template.id, is_rest: false });
        }
        setSavingFreestylePlan(false);
        setShowFreestylePrompt(false);
    }

    const totalPlanned = exercisesList.reduce((sum, e) => sum + e.target_sets, 0);
    const completedCount = Object.values(logs).flat().filter((s) => s.completed).length;

    /* ═══════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════ */

    // ── LOADING ──
    if (status === "loading") return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono text-white/40">Initializing protocol...</p>
            </div>
        </main>
    );

    // ── REST DAY ──
    if (status === "rest_day") return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-6">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center" style={{ boxShadow: "0 0 30px -4px rgba(52,211,153,0.5)" }}>
                    <Moon size={28} className="text-emerald-300" />
                </div>
                <p className="text-lg font-bold tracking-widest text-emerald-300/90">REST DAY</p>
                <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto">Recovery is when your muscles grow. Nothing to log today.</p>
            </div>
        </main>
    );

    // ── NO PLAN ──
    if (status === "no_plan") return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-6">
            <div className="text-center w-full max-w-sm">
                <div className="w-14 h-14 mx-auto mb-5 rotate-45 border-2 border-cyan-400/30" />
                <p className="text-lg font-bold tracking-widest text-cyan-300/70">NO WORKOUT PLANNED</p>
                <p className="text-sm text-white/40 mt-2 mb-8 max-w-xs mx-auto">Nothing scheduled for today. Set up a recurring plan, or log a session on the fly.</p>

                <div className="space-y-3 text-left">
                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
                        <p className="text-sm font-bold text-white/90 mb-1">Create a weekly plan</p>
                        <p className="text-[11px] text-white/40 mb-3">Set your training days once — it repeats automatically every week.</p>
                        <button onClick={() => router.push("/schedule")} className="w-full text-sm font-bold py-3 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition" style={{ boxShadow: "0 0 20px -4px rgba(34,211,238,0.5)" }}>
                            CREATE WEEKLY PLAN
                        </button>
                    </div>

                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                        <p className="text-sm font-bold text-white/90 mb-1">Just train today</p>
                        <p className="text-[11px] text-white/40 mb-3">No plan needed — pick exercises and log as you go.</p>
                        <button onClick={() => setStatus("freestyle")} className="w-full text-sm font-mono font-bold py-3 rounded-lg border border-white/15 text-white/70 hover:border-cyan-400/40 hover:text-cyan-300 transition">
                            START FREESTYLE SESSION
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );

    // ── FREESTYLE (BUILD) ──
    if (status === "freestyle") return (
        <main className="min-h-screen bg-[#050914] text-white p-4 md:p-10 pb-24">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[130px]" />
            <div className="relative z-10 w-full max-w-lg mx-auto">
                <button onClick={() => { setFreestyleExercises([]); setStatus("no_plan"); }} className="text-[10px] font-mono text-white/30 hover:text-white/60 transition mb-4">
                    ← Back
                </button>
                <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-300/60 mb-0.5">FREESTYLE</p>
                <h1 className="text-xl md:text-2xl font-bold text-white/95 mb-5">Freestyle Session</h1>

                <button onClick={() => setShowFreestyleAddModal(true)} className="w-full flex items-center justify-center gap-2 text-sm font-mono font-bold py-3.5 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.05] text-cyan-300 hover:bg-cyan-400/10 transition mb-4">
                    <Plus size={16} /> ADD EXERCISE
                </button>

                {freestyleExercises.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-sm text-white/30">No exercises added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-6">
                        {freestyleExercises.map((ex, i) => (
                            <div key={ex.id} className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                                <span className="text-[10px] font-mono text-cyan-300/40 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white/90 truncate">{ex.name}</p>
                                    <p className="text-[10px] font-mono text-white/35">{ex.body_segment}</p>
                                </div>
                                <button onClick={() => removeFreestyleExercise(ex.id)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 transition">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {freestyleExercises.length > 0 && (
                    <button
                        onClick={beginFreestyleSession}
                        disabled={startingFreestyle}
                        className="w-full flex items-center justify-center gap-2.5 text-sm font-bold py-4 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-50 transition"
                        style={{ boxShadow: "0 0 25px -4px rgba(34,211,238,0.6)" }}
                    >
                        <Play size={18} fill="black" /> {startingFreestyle ? "STARTING..." : "BEGIN SESSION"}
                    </button>
                )}
            </div>

            {showFreestyleAddModal && <AddExerciseModal onAdd={addFreestyleExercise} onClose={() => setShowFreestyleAddModal(false)} existingIds={new Set(freestyleExercises.map((e) => e.exercise_id))} />}
        </main>
    );

    // ── COMPLETED ──
    if (status === "completed" && summary) return (
        <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-4">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px]" />
            <div className="relative z-10 w-full max-w-md">
                <BeamBorder className="p-6">
                    <div className="text-center mb-5">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center" style={{ boxShadow: "0 0 25px -4px rgba(34,211,238,0.5)" }}>
                            <Award size={26} className="text-cyan-300" />
                        </div>
                        <p className="text-[10px] font-mono tracking-[0.3em] text-cyan-300/70">SESSION COMPLETE</p>
                        <p className="text-xl font-bold text-white/95 mt-1">{dayTitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                        <GlassStat label="DURATION" value={formatClock(summary.duration)} />
                        <GlassStat label="SETS" value={String(summary.sets)} />
                        <GlassStat label="VOLUME" value={`${Math.round(summary.volume).toLocaleString()} KG`} />
                        <GlassStat label="XP EARNED" value={`+${summary.xpBreakdown.total}`} accent />
                    </div>

                    <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.03] p-3 mb-5">
                        <p className="text-[8px] font-mono tracking-widest text-cyan-300/50 mb-2">XP BREAKDOWN</p>
                        {summary.xpBreakdown.details.map((d, i) => (
                            <p key={i} className="text-[10px] font-mono text-white/50 leading-relaxed">{d}</p>
                        ))}
                    </div>

                    <button onClick={() => router.push("/")} className="w-full text-sm font-bold py-3.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition" style={{ boxShadow: "0 0 20px -4px rgba(34,211,238,0.6)" }}>
                        RETURN TO DASHBOARD
                    </button>
                </BeamBorder>
            </div>

            {showFreestylePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-lg border border-cyan-400/20 bg-[#0a1120] p-5">
                        <p className="text-sm font-bold text-white/90 mb-2">
                            Want to make this your regular {new Date().toLocaleDateString(undefined, { weekday: "long" })} workout?
                        </p>
                        <p className="text-[11px] text-white/50 mb-4">
                            It'll show up automatically every {new Date().toLocaleDateString(undefined, { weekday: "long" })} from now on.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowFreestylePrompt(false)} className="flex-1 text-sm font-mono py-2.5 rounded-lg border border-white/15 text-white/50 hover:text-white/80 transition">
                                NO THANKS
                            </button>
                            <button onClick={saveFreestyleAsRecurringPlan} disabled={savingFreestylePlan} className="flex-1 text-sm font-mono font-bold py-2.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-50 transition">
                                {savingFreestylePlan ? "SAVING..." : "YES, SAVE IT"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );

    if (status === "completed_today") {
        return (
            <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center p-4">
                <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px]" />
                <div className="relative z-10 w-full max-w-md">
                    <div className="rounded-xl border border-cyan-400/20 bg-[#0a1120]/95 p-6">
                        <div className="text-center mb-5">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center" style={{ boxShadow: "0 0 25px -4px rgba(34,211,238,0.5)" }}>
                                <Check size={26} className="text-cyan-300" />
                            </div>
                            <p className="text-[10px] font-mono tracking-[0.3em] text-cyan-300/70">TODAY'S SESSION</p>
                            <p className="text-xl font-bold text-white/95 mt-1">{dayTitle}</p>
                        </div>

                        {summary && (
                            <div className="grid grid-cols-2 gap-2.5 mb-5">
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                                    <p className="text-[8px] font-mono text-white/30">DURATION</p>
                                    <p className="text-lg font-bold font-mono text-white/90">{formatClock(summary.duration)}</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                                    <p className="text-[8px] font-mono text-white/30">SETS</p>
                                    <p className="text-lg font-bold font-mono text-white/90">{summary.sets}</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                                    <p className="text-[8px] font-mono text-white/30">VOLUME</p>
                                    <p className="text-lg font-bold font-mono text-white/90">{Math.round(summary.volume).toLocaleString()} KG</p>
                                </div>
                                <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] p-3 text-center">
                                    <p className="text-[8px] font-mono text-cyan-300/50">XP EARNED</p>
                                    <p className="text-lg font-bold font-mono text-cyan-300">+{summary.xpBreakdown.total}</p>
                                </div>
                            </div>
                        )}

                        <p className="text-[10px] font-mono text-white/25 text-center mb-5">Completed for today. Come back tomorrow.</p>

                        <div className="flex gap-2">
                            <button onClick={() => router.push("/")} className="flex-1 text-sm font-mono font-bold py-3 rounded-lg border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 transition">
                                DASHBOARD
                            </button>
                            <button onClick={() => router.push("/progress")} className="flex-1 text-sm font-mono font-bold py-3 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition">
                                VIEW PROGRESS
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ── NOT STARTED / ACTIVE ──
    return (
        <main className="relative min-h-screen w-full bg-[#050914] text-white pb-36 md:pb-10 overflow-x-hidden">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
            <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />

            <div className="relative z-10 w-full max-w-2xl mx-auto p-4 md:p-10 space-y-4">

                {/* ── TOP BAR ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-300/60 mb-0.5">
                            {status === "active" ? "ACTIVE SESSION" : "PROTOCOL READY"}
                        </p>
                        <h1 className="text-xl md:text-2xl font-bold text-white/95">{dayTitle}</h1>
                    </div>
                    {status === "active" && (
                        <div className="text-right shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] px-3 py-1.5">
                            <p className="text-[8px] font-mono text-cyan-300/50">ELAPSED</p>
                            <p className="text-lg font-bold font-mono text-cyan-300">{formatClock(elapsed)}</p>
                        </div>
                    )}
                </div>

                {/* ── PROGRESS BAR ── */}
                {status === "active" && (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all" style={{ width: `${totalPlanned ? Math.min(100, (completedCount / totalPlanned) * 100) : 0}%`, boxShadow: "0 0 8px rgba(34,211,238,0.4)" }} />
                        </div>
                        <p className="text-[10px] font-mono text-white/40 shrink-0">{completedCount}/{totalPlanned}</p>
                    </div>
                )}

                {/* ── PRE-SESSION PREVIEW ── */}
                {status === "not_started" && (
                    <BeamBorder className="p-5">
                        <div className="grid grid-cols-3 gap-2.5 mb-5">
                            <GlassStat label="EXERCISES" value={String(exercisesList.length)} />
                            <GlassStat label="SETS" value={String(totalPlanned)} />
                            <GlassStat label="EST. TIME" value={`${totalPlanned * 3}m`} />
                        </div>

                        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 mb-4">
                            <p className="text-[8px] font-mono tracking-widest text-white/30 mb-2">PRE-WORKOUT BODY WEIGHT</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()}
                                    inputMode="decimal"
                                    value={preWorkoutWeight}
                                    onChange={(e) => setPreWorkoutWeight(e.target.value)}
                                    placeholder="—"
                                    className="flex-1 h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-lg font-bold font-mono focus:outline-none focus:border-cyan-400/40 transition"
                                />
                                <span className="text-sm font-mono text-white/30">KG</span>
                                {preWorkoutWeight && !weightLogged && (
                                    <button
                                        onClick={async () => {
                                            if (!user || !preWorkoutWeight) return;
                                            await supabase.from("body_weight_logs").insert({
                                                user_id: user.id,
                                                weight: Number(preWorkoutWeight),
                                                context: "pre_workout",
                                            });
                                            setWeightLogged(true);
                                        }}
                                        className="text-[10px] font-mono px-3 py-2 rounded-lg border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 transition"
                                    >
                                        LOG
                                    </button>
                                )}
                                {weightLogged && <Check size={16} className="text-cyan-300" />}
                            </div>
                            <p className="text-[9px] font-mono text-white/20 mt-1.5">Optional — helps track body composition over time.</p>
                        </div>


                        <button onClick={startWorkout} className="w-full flex items-center justify-center gap-2.5 text-sm font-bold py-4 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition mb-5" style={{ boxShadow: "0 0 25px -4px rgba(34,211,238,0.6)" }}>
                            <Play size={18} fill="black" /> BEGIN SESSION
                        </button>

                        <div className="space-y-2 mb-5">
                            {exercisesList.map((ex, i) => {
                                const hint = overloadHints[ex.exercise_id];
                                return (
                                    <div key={ex.id} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono text-cyan-300/40 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white/90 truncate">{ex.name}</p>
                                                <p className="text-[10px] font-mono text-white/35">{ex.body_segment}</p>
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
                                                        <p className="text-[7px] font-mono text-white/25">KG</p>
                                                        <p className="text-xs font-bold text-white/70">{ex.target_weight}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {hint && hint.type !== "first_time" && (
                                            <p className="text-[9px] font-mono text-cyan-300/50 mt-1.5 ml-8">
                                                <TrendingUp size={10} className="inline mr-1 -mt-0.5" />{hint.text}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </BeamBorder>
                )}

                {/* ── ACTIVE EXERCISE LIST ── */}
                {status === "active" && (
                    <div className="space-y-3">
                        {exercisesList.map((ex, i) => {
                            const sets = logs[ex.id] ?? [];
                            const done = sets.filter((s) => s.completed).length;
                            const isOpen = expandedId === ex.id;
                            const last = lastPerformance[ex.exercise_id];
                            const hint = overloadHints[ex.exercise_id];
                            const allDone = done === sets.length && sets.length > 0;

                            return (
                                <div key={ex.id} className={`rounded-lg border overflow-hidden transition-all ${allDone ? "border-cyan-400/30 bg-cyan-400/[0.03]" : "border-white/[0.08] bg-white/[0.02]"}`}
                                    style={isOpen ? { boxShadow: "0 0 20px -8px rgba(34,211,238,0.25)" } : undefined}
                                >
                                    {/* Exercise header */}
                                    <button onClick={() => setExpandedId(isOpen ? null : ex.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${allDone ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30" : "bg-white/[0.05] text-white/30 border border-white/10"}`}>
                                            {allDone ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white/90 truncate">{ex.name}</p>
                                            <p className="text-[10px] font-mono text-white/35">
                                                {done}/{sets.length} sets
                                                {last ? ` · Last: ${last.weight ?? "—"}${ex.isCardio ? "" : ex.isBodyweight ? " BW" : "kg"} × ${last.reps ?? "—"}` : ""}
                                            </p>
                                        </div>
                                        <ChevronDown size={16} className={`text-white/25 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Expanded content */}
                                    {isOpen && (
                                        <div className="border-t border-white/[0.06]">
                                            {/* Overload hint */}
                                            {hint && hint.type !== "first_time" && (
                                                <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-cyan-400/[0.06] border border-cyan-400/15 px-3 py-2">
                                                    <TrendingUp size={12} className="text-cyan-300/60 shrink-0" />
                                                    <p className="text-[10px] font-mono text-cyan-300/70">{hint.text}</p>
                                                </div>
                                            )}

                                            {/* Swap button */}
                                            <div className="px-4 pt-2.5 pb-1">
                                                <button onClick={() => setSwapTargetId(ex.id)} className="flex items-center gap-1.5 text-white/25 text-[10px] font-mono hover:text-cyan-300/60 transition">
                                                    <RefreshCw size={10} /> Swap exercise
                                                </button>
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
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-cyan-400/40 disabled:opacity-40 transition"
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
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-cyan-400/40 disabled:opacity-40 transition"
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
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-cyan-400/40 disabled:opacity-40 transition"
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
                                                                className="w-full h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-cyan-400/40 disabled:opacity-40 transition"
                                                            />
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={sets[0]?.note ?? ""}
                                                        onChange={(e) => updateSet(ex.id, 0, "note", e.target.value)}
                                                        disabled={sets[0]?.completed}
                                                        placeholder="Notes (optional)"
                                                        className="w-full text-[10px] font-mono rounded-lg bg-transparent border border-white/[0.06] px-3 py-2 text-white/40 placeholder:text-white/15 focus:outline-none focus:border-cyan-400/20 disabled:opacity-40 transition"
                                                    />
                                                    {!sets[0]?.completed ? (
                                                        <button
                                                            onClick={() => completeSet(ex, 0)}
                                                            className="w-full text-[10px] font-mono font-bold py-3 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/15 transition"
                                                        >
                                                            LOG CARDIO ✓
                                                        </button>
                                                    ) : (
                                                        <p className="text-[10px] font-mono text-cyan-300/50 text-center py-2">✓ Logged</p>
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
                                                            <><span className="flex-1 text-center">KG</span><span className="flex-1 text-center">REPS</span></>
                                                        )}
                                                        <span className="w-9 sm:w-11" />
                                                    </div>

                                                    {sets.map((s) => (
                                                        <div key={s.index}>
                                                            <SwipeSet completed={s.completed} onComplete={() => completeSet(ex, s.index)}>
                                                                <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0a1120]">
                                                                    <span className={`text-[10px] font-mono w-5 sm:w-7 text-center shrink-0 ${s.completed ? "text-cyan-300/50" : "text-white/25"}`}>{s.index + 1}</span>
                                                                    {ex.isBodyweight ? (
                                                                        <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="—" value={s.reps} onChange={(e) => updateSet(ex.id, s.index, "reps", e.target.value)} disabled={s.completed}
                                                                            className="flex-1 min-w-0 h-10 sm:h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm sm:text-base font-bold font-mono focus:outline-none focus:border-cyan-400/40 focus:bg-cyan-400/[0.03] disabled:opacity-40 transition" />
                                                                    ) : (
                                                                        <>
                                                                            <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="—" value={s.weight} onChange={(e) => updateSet(ex.id, s.index, "weight", e.target.value)} disabled={s.completed}
                                                                                className="flex-1 min-w-0 h-10 sm:h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm sm:text-base font-bold font-mono focus:outline-none focus:border-cyan-400/40 focus:bg-cyan-400/[0.03] disabled:opacity-40 transition" />
                                                                            <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder="—" value={s.reps} onChange={(e) => updateSet(ex.id, s.index, "reps", e.target.value)} disabled={s.completed}
                                                                                className="flex-1 min-w-0 h-10 sm:h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm sm:text-base font-bold font-mono focus:outline-none focus:border-cyan-400/40 focus:bg-cyan-400/[0.03] disabled:opacity-40 transition" />
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => !s.completed && completeSet(ex, s.index)}
                                                                        className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg border flex items-center justify-center transition ${s.completed
                                                                            ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-300"
                                                                            : "border-white/10 text-white/20 hover:border-cyan-400/40 hover:text-cyan-300 hover:bg-cyan-400/[0.05] active:scale-95"
                                                                            }`}
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                </div>
                                                            </SwipeSet>
                                                            {!s.completed && (
                                                                <input type="text" value={s.note} onChange={(e) => updateSet(ex.id, s.index, "note", e.target.value)} placeholder="Note (optional)"
                                                                    className="mt-1 ml-5 sm:ml-7 text-[10px] font-mono rounded-md bg-transparent border border-white/[0.04] px-2 py-1 text-white/30 placeholder:text-white/15 focus:outline-none focus:border-cyan-400/20 focus:text-white/50 transition" style={{ width: "calc(100% - 24px)" }} />
                                                            )}
                                                        </div>
                                                    ))}

                                                    <button onClick={() => addSet(ex.id)} className="flex items-center gap-1.5 text-cyan-300/60 text-[10px] font-mono hover:text-cyan-300 transition pt-1 ml-5 sm:ml-7">
                                                        <Plus size={12} /> Add set
                                                    </button>

                                                    {done === sets.length && sets.length > 0 && !confirmedExercises.has(ex.id) && (
                                                        <button
                                                            onClick={() => {
                                                                setConfirmedExercises((prev) => new Set([...prev, ex.id]));
                                                                const currentIdx = exercisesList.findIndex((e) => e.id === ex.id);
                                                                const next = exercisesList[currentIdx + 1];
                                                                if (next) setExpandedId(next.id);
                                                            }}
                                                            className="w-full mt-3 text-[10px] font-mono font-bold py-2.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/15 transition"
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

                        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-cyan-300/60 text-xs font-mono hover:text-cyan-300 transition py-2">
                            <Plus size={14} /> Add exercise
                        </button>
                    </div>
                )}
            </div>

            {/* ── REST TIMER (sticky bottom) ── */}
            {restRemaining !== null && status === "active" && (
                <div className="fixed bottom-16 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-lg z-30">
                    <div className="border-t md:border border-cyan-400/30 bg-[#0a1120]/95 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between md:rounded-lg" style={{ boxShadow: "0 -4px 30px -8px rgba(34,211,238,0.4)" }}>
                        <div>
                            <p className="text-[8px] font-mono tracking-widest text-cyan-300/50">REST TIMER</p>
                            <p className="text-2xl font-bold font-mono text-cyan-300">{formatClock(restRemaining)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setRestRemaining((r) => (r !== null ? r + 15 : null))} className="text-[10px] font-mono px-2.5 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 active:scale-95 transition">+15s</button>
                            <button onClick={() => setRestPaused((p) => !p)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-cyan-300 active:scale-95 transition">
                                {restPaused ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <button onClick={() => { setRestRemaining(null); setRestPaused(false); }} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white/80 active:scale-95 transition">
                                <SkipForward size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STICKY ACTION BAR ── */}
            {status === "active" && restRemaining === null && completedCount > 0 && (
                <div className="fixed bottom-16 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-lg z-20">
                    <div className="border-t md:border border-cyan-400/15 bg-[#0a1120]/95 backdrop-blur-xl px-5 py-3 md:rounded-lg flex items-center gap-2">
                        <button
                            onClick={() => { setRestRemaining(90); setRestPaused(false); }}
                            className="flex-1 text-[10px] font-mono font-bold py-3 rounded-lg border border-white/15 text-white/50 hover:text-white/80 transition"
                        >
                            REST TIMER
                        </button>
                        <button onClick={() => setShowEndConfirm(true)} className="flex-1 text-sm font-bold py-3 rounded-lg border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 transition">
                            COMPLETE · {completedCount} SETS
                        </button>
                    </div>
                </div>

            )}

            {/* ── MODALS ── */}
            {showEndConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-lg border border-cyan-400/20 bg-[#0a1120] p-5">
                        <p className="text-sm font-bold text-white/90 mb-2">End workout?</p>
                        {completedCount < totalPlanned ? (
                            <p className="text-[11px] text-white/50 mb-4">
                                You've completed {completedCount} of {totalPlanned} planned sets. Unfinished sets won't be logged.
                            </p>
                        ) : (
                            <p className="text-[11px] text-white/50 mb-4">
                                All {completedCount} sets completed. Nice work.
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => setShowEndConfirm(false)} className="flex-1 text-sm font-mono py-2.5 rounded-lg border border-white/15 text-white/50 hover:text-white/80 transition">
                                KEEP GOING
                            </button>
                            <button onClick={() => { setShowEndConfirm(false); finishWorkout(); }} className="flex-1 text-sm font-mono font-bold py-2.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition">
                                FINISH
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