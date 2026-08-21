"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Calendar, Dumbbell, TrendingUp, Weight, Trophy, ChevronDown, ChevronRight, Lock, Flame, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, ReferenceLine } from "recharts";
import { ACHIEVEMENT_DEFS, RARITY_COLORS, type AchievementDef } from "../../lib/achievements";
import MeasurementModal, { type MeasurementType } from "../../components/MeasurementModal";
import { type WeightEntry, type WeightContext, lbsToKg, kgToLbs, rematerializeWeightTrend } from "../../lib/weightTrend";
import { type FoodEntry, type MealSlot, MEAL_SLOTS, rematerializeDailyIntake, calcAdherence } from "../../lib/intakeLog";
import { buildLedger, avgDailyNet, projectWeightChange, projectWeightAtDate, daysUntil, type DailyBalance } from "../../lib/energyLedger";
import { getFullCalorieSummary, ageFromDOB, type CalorieSummary, type GoalType, type ActivityLevel, type DietPreference, type Sex } from "../../lib/calorieEngine";
import { checkFeasibility, type FeasibilityVerdict } from "../../lib/energyGuardrails";
import { estimateObservedTdee, blendTdee, type TdeeEstimate } from "../../lib/energyEstimator";
import { buildEnergyReceipt, type EnergyReceipt } from "../../lib/systemValue";
import EnergyReceiptPanel from "../../components/EnergyReceipt";
import { PredictionVsRealityCard, AnomalyCard, AdaptationCard, LeanMassCard, WeeklyBudgetCard, RecoveryCard, RecompCard, PatternWarningsCard } from "../../components/InsightsPanel";
import { buildPredictionVsReality, type PredictionAccuracy } from "../../lib/predictionReality";
import { explainWeightAnomaly, type AnomalyExplanation } from "../../lib/anomalyExplainer";
import { detectAdaptation, type AdaptationSignal } from "../../lib/metabolicAdaptation";
import { assessLeanMassSignal, type LeanMassSignal } from "../../lib/leanMassSignal";
import { calcWeeklyBudget, type WeeklyBudget } from "../../lib/weeklyBudget";
import { getRecoveryAdjustment, type RecoveryAdjustment } from "../../lib/recoveryEngine";
import { assessRecomp, type RecompAssessment } from "../../lib/recompMode";
import { detectPatterns, type PatternWarning } from "../../lib/energyGuardrails";

const MEASUREMENT_TYPES: { type: MeasurementType; color: string; bar: string }[] = [
    { type: "Biceps", color: "text-pink-300", bar: "bg-pink-400" },
    { type: "Abs", color: "text-emerald-300", bar: "bg-emerald-400" },
    { type: "Waist", color: "text-orange-300", bar: "bg-orange-400" },
    { type: "Chest", color: "text-blue-300", bar: "bg-blue-400" },
    { type: "Shoulders", color: "text-violet-300", bar: "bg-violet-400" },
    { type: "Thigh", color: "text-teal-300", bar: "bg-teal-400" },
    { type: "Calf", color: "text-yellow-300", bar: "bg-yellow-400" },
];

const ACRONYM_EXPLAINERS: Record<string, string> = {
    TDEE: "Total Daily Energy Expenditure — how many calories your body burns in a day, including activity. Calculated as BMR × activity multiplier.",
    BMR: "Basal Metabolic Rate — calories your body needs at complete rest just to stay alive. Calculated using the Mifflin-St Jeor equation from your weight, height, age, and sex.",
    EMA: "Exponential Moving Average — a smoothed trend line that filters out daily weight fluctuations from water, food timing, etc. Shows your true weight direction.",
    BMI: "Body Mass Index — your weight relative to height. Used to adjust safe weight-loss rates (slower if already lean).",
};

function InfoTip({ term }: { term: string }) {
    const [open, setOpen] = useState(false);
    const text = ACRONYM_EXPLAINERS[term];
    if (!text) return null;
    return (
        <span className="relative inline-block ml-1">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-white/15 text-[6px] font-mono text-white/25 hover:text-white/50 hover:border-white/30 transition"
            >i</button>
            {open && (
                <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 p-2 rounded-md bg-[#0d1320] border border-white/15 text-[8px] font-mono text-white/50 leading-relaxed shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <strong className="text-white/70">{term}</strong> — {text}
                </span>
            )}
        </span>
    );
}

type Tab = "history" | "strength" | "body" | "volume" | "intake";
type ActivityRange = "7D" | "30D" | "6M" | "12M" | "All";

const ACTIVITY_RANGES: ActivityRange[] = ["7D", "30D", "6M", "12M", "All"];

function rangeStartDate(range: ActivityRange): Date | null {
    const now = new Date();
    switch (range) {
        case "7D": return new Date(now.getTime() - 7 * 86400000);
        case "30D": return new Date(now.getTime() - 30 * 86400000);
        case "6M": { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
        case "12M": { const d = new Date(now); d.setMonth(d.getMonth() - 12); return d; }
        case "All": return null;
    }
}

type SessionRecord = {
    id: string;
    date: string;
    title: string;
    duration_seconds: number;
    total_sets: number;
    total_volume: number;
    xp_earned: number;
};

type ExercisePR = {
    exercise_id: string;
    exercise_name: string;
    body_segment: string;
    best_weight: number;
    best_reps_at_weight: number;
    estimated_1rm: number;
    date: string;
};

type StrengthDataPoint = {
    date: string;
    weight: number;
    reps: number;
    e1rm: number;
};

type BodyWeightEntry = {
    weight: number;
    date: string;
    ema?: number;
};

const WEIGHT_CONTEXTS: { value: WeightContext; label: string }[] = [
    { value: "morning", label: "MORNING" },
    { value: "pre_workout", label: "PRE-WORKOUT" },
    { value: "post_workout", label: "POST-WORKOUT" },
    { value: "manual", label: "GENERAL" },
];

type WeeklyVolume = {
    week: string;
    volume: number;
    sets: number;
};

type LeaderboardRow = { user_id: string; username: string; avatar_url: string | null; best_weight: number };
type LeaderboardCard = { exerciseName: string; top: LeaderboardRow[]; myRank: number; total: number; myWeight: number };

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateFull(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function getWeekStart(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    return monday.toISOString().split("T")[0];
}

function estimateE1RM(weight: number, reps: number): number {
    if (reps <= 0 || weight <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/[0.08] bg-[#080d18]/95 px-3 py-2 text-[10px] font-mono">
            <p className="text-white/50 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                </p>
            ))}
        </div>
    );
};

export default function ProgressPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>("history");
    const [loading, setLoading] = useState(true);

    // History
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());
    const [earnedDates, setEarnedDates] = useState<Record<string, string>>({});
    const [leaderboardCard, setLeaderboardCard] = useState<LeaderboardCard | null>(null);
    const [activityRange, setActivityRange] = useState<ActivityRange>("7D");
    const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

    // Strength
    const [prs, setPrs] = useState<ExercisePR[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [strengthHistory, setStrengthHistory] = useState<StrengthDataPoint[]>([]);
    const [strengthLoading, setStrengthLoading] = useState(false);
    const [goals, setGoals] = useState<Record<string, number>>({});
    const [goalInput, setGoalInput] = useState("");
    const [editingGoal, setEditingGoal] = useState(false);

    // Body
    const [bodyWeightData, setBodyWeightData] = useState<BodyWeightEntry[]>([]);
    const [newWeight, setNewWeight] = useState("");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [weightContext, setWeightContext] = useState<WeightContext>("morning");
    const [measurements, setMeasurements] = useState<Record<string, number | null>>({});
    const [activeMeasurement, setActiveMeasurement] = useState<MeasurementType | null>(null);

    // Volume
    const [weeklyVolumeData, setWeeklyVolumeData] = useState<WeeklyVolume[]>([]);

    // Intake
    const [intakeDate, setIntakeDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [intakeEntries, setIntakeEntries] = useState<FoodEntry[]>([]);
    const [intakeMealSlot, setIntakeMealSlot] = useState<MealSlot>("breakfast");
    const [intakeLabel, setIntakeLabel] = useState("");
    const [intakeKcal, setIntakeKcal] = useState("");
    const [intakeProtein, setIntakeProtein] = useState("");
    const [intakeCarbs, setIntakeCarbs] = useState("");
    const [intakeFat, setIntakeFat] = useState("");
    const [intakeAdherence, setIntakeAdherence] = useState<number | null>(null);
    const [ledger, setLedger] = useState<DailyBalance[]>([]);
    const [ledgerGoal, setLedgerGoal] = useState<{ targetWeightKg: number | null; targetDate: string | null; goalType: string } | null>(null);
    const [ledgerCalorieSummary, setLedgerCalorieSummary] = useState<CalorieSummary | null>(null);
    const [feasibility, setFeasibility] = useState<FeasibilityVerdict | null>(null);
    const [tdeeEstimate, setTdeeEstimate] = useState<TdeeEstimate | null>(null);
    const [adaptiveMode, setAdaptiveMode] = useState(false);
    const [energyReceipt, setEnergyReceipt] = useState<EnergyReceipt | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [insightPrediction, setInsightPrediction] = useState<PredictionAccuracy | null>(null);
    const [insightAnomaly, setInsightAnomaly] = useState<AnomalyExplanation | null>(null);
    const [insightAdaptation, setInsightAdaptation] = useState<AdaptationSignal | null>(null);
    const [insightLeanMass, setInsightLeanMass] = useState<LeanMassSignal | null>(null);
    const [insightBudget, setInsightBudget] = useState<WeeklyBudget | null>(null);
    const [insightRecovery, setInsightRecovery] = useState<RecoveryAdjustment | null>(null);
    const [insightRecomp, setInsightRecomp] = useState<RecompAssessment | null>(null);
    const [insightPatterns, setInsightPatterns] = useState<PatternWarning[]>([]);
    const [myFoods, setMyFoods] = useState<{ id: string; label: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; use_count: number }[]>([]);

    const loadHistory = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("workout_sessions")
            .select("id, date, title, duration_seconds, total_sets, total_volume, xp_earned")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("date", { ascending: false })
            .limit(1000);
        setSessions(data ?? []);
    }, [user]);

    const loadAchievements = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase.from("achievements").select("achievement_key, earned_at").eq("user_id", user.id);
        setEarnedKeys(new Set((data ?? []).map((a: any) => a.achievement_key)));
        const dates: Record<string, string> = {};
        (data ?? []).forEach((a: any) => { dates[a.achievement_key] = a.earned_at; });
        setEarnedDates(dates);
    }, [user]);

    const loadLeaderboardCard = useCallback(async () => {
        if (!user) return;
        const { data: mine } = await supabase
            .from("exercise_leaderboard")
            .select("exercise_id, exercise_name, best_weight")
            .eq("user_id", user.id);
        if (!mine || mine.length === 0) { setLeaderboardCard(null); return; }

        const exerciseIds = mine.map((m: any) => m.exercise_id);
        const { data: all } = await supabase
            .from("exercise_leaderboard")
            .select("exercise_id, user_id, username, avatar_url, best_weight")
            .in("exercise_id", exerciseIds);
        if (!all) { setLeaderboardCard(null); return; }

        const byExercise: Record<string, LeaderboardRow[]> = {};
        all.forEach((r: any) => { (byExercise[r.exercise_id] ??= []).push(r); });

        let best: { exerciseId: string; exerciseName: string; myWeight: number; percentile: number } | null = null;
        for (const m of mine as any[]) {
            const rows = byExercise[m.exercise_id] || [];
            const total = rows.length;
            const below = rows.filter((r) => r.best_weight < m.best_weight).length;
            const percentile = total > 1 ? below / (total - 1) : 1;
            if (!best || percentile > best.percentile) {
                best = { exerciseId: m.exercise_id, exerciseName: m.exercise_name, myWeight: m.best_weight, percentile };
            }
        }
        if (!best) { setLeaderboardCard(null); return; }

        const rows = (byExercise[best.exerciseId] || []).slice().sort((a, b) => b.best_weight - a.best_weight);
        const myRank = rows.findIndex((r) => r.user_id === user.id) + 1;
        setLeaderboardCard({ exerciseName: best.exerciseName, top: rows.slice(0, 3), myRank, total: rows.length, myWeight: best.myWeight });
    }, [user]);

    const loadGoals = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase.from("exercise_goals").select("exercise_id, goal_weight").eq("user_id", user.id);
        const map: Record<string, number> = {};
        (data ?? []).forEach((g: any) => { map[g.exercise_id] = Number(g.goal_weight); });
        setGoals(map);
    }, [user]);

    async function saveGoal(exerciseId: string) {
        if (!user || !goalInput) return;
        const value = Number(goalInput);
        if (!value || value <= 0) return;
        await supabase.from("exercise_goals").upsert({ user_id: user.id, exercise_id: exerciseId, goal_weight: value, updated_at: new Date().toISOString() }, { onConflict: "user_id,exercise_id" });
        setGoals((prev) => ({ ...prev, [exerciseId]: value }));
        setGoalInput("");
        setEditingGoal(false);
    }

    const loadPRs = useCallback(async () => {
        if (!user) return;
        const { data: logs } = await supabase
            .from("exercise_set_logs")
            .select("exercise_id, weight, reps, completed_at, exercises!inner(name, body_segment)")
            .eq("user_id", user.id)
            .gt("weight", 0)
            .order("weight", { ascending: false });

        if (!logs) { setPrs([]); return; }

        const bestByExercise: Record<string, ExercisePR> = {};
        logs.forEach((log: any) => {
            const eid = log.exercise_id;
            const w = Number(log.weight);
            const r = Number(log.reps);
            const e1rm = estimateE1RM(w, r);
            const dateStr = log.completed_at ? log.completed_at.split("T")[0] : "";

            if (!bestByExercise[eid] || e1rm > bestByExercise[eid].estimated_1rm) {
                bestByExercise[eid] = {
                    exercise_id: eid,
                    exercise_name: log.exercises?.name ?? "Unknown",
                    body_segment: log.exercises?.body_segment ?? "Other",
                    best_weight: w,
                    best_reps_at_weight: r,
                    estimated_1rm: e1rm,
                    date: dateStr,
                };
            }
        });

        const sorted = Object.values(bestByExercise).sort((a, b) => b.estimated_1rm - a.estimated_1rm);
        setPrs(sorted);
    }, [user]);

    const loadBodyWeight = useCallback(async () => {
        if (!user) return;
        const [{ data: logs }, { data: trend }] = await Promise.all([
            supabase
                .from("body_weight_logs")
                .select("weight, logged_at, context, date")
                .eq("user_id", user.id)
                .order("logged_at", { ascending: true })
                .limit(180),
            supabase
                .from("weight_trend")
                .select("date, raw_kg, ema_kg")
                .eq("user_id", user.id)
                .order("date", { ascending: true }),
        ]);

        const emaByDate: Record<string, number> = {};
        (trend ?? []).forEach((t: any) => { emaByDate[t.date] = Number(t.ema_kg); });

        const byDate: Record<string, { weights: number[]; ema?: number }> = {};
        (logs ?? []).forEach((d: any) => {
            const dateKey = d.date || (d.logged_at as string).split("T")[0];
            if (!byDate[dateKey]) byDate[dateKey] = { weights: [] };
            byDate[dateKey].weights.push(Number(d.weight));
        });

        const entries: BodyWeightEntry[] = Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, val]) => {
                const avg = val.weights.reduce((a, b) => a + b, 0) / val.weights.length;
                return {
                    weight: Math.round(avg * 10) / 10,
                    date: new Date(dateKey + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                    ema: emaByDate[dateKey] ? Math.round(emaByDate[dateKey] * 10) / 10 : undefined,
                };
            });

        setBodyWeightData(entries);
    }, [user]);

    const loadMeasurements = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("body_measurements")
            .select("type, value_cm, logged_at")
            .eq("user_id", user.id)
            .order("logged_at", { ascending: false });
        const latest: Record<string, number | null> = {};
        (data ?? []).forEach((m: any) => { if (latest[m.type] === undefined) latest[m.type] = Number(m.value_cm); });
        setMeasurements(latest);
    }, [user]);

    const loadWeeklyVolume = useCallback(async () => {
        if (!user) return;
        const { data: allSessions } = await supabase
            .from("workout_sessions")
            .select("date, total_volume, total_sets")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("date", { ascending: true });

        if (!allSessions) { setWeeklyVolumeData([]); return; }

        const weekMap: Record<string, { volume: number; sets: number }> = {};
        allSessions.forEach((s: any) => {
            const week = getWeekStart(s.date);
            if (!weekMap[week]) weekMap[week] = { volume: 0, sets: 0 };
            weekMap[week].volume += Number(s.total_volume) || 0;
            weekMap[week].sets += s.total_sets || 0;
        });

        const sorted = Object.entries(weekMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([week, data]) => ({
                week: formatDate(week),
                volume: Math.round(data.volume),
                sets: data.sets,
            }));
        setWeeklyVolumeData(sorted);
    }, [user]);

    const loadIntake = useCallback(async (date: string) => {
        if (!user) return;
        const [{ data: entries }, { data: dailyRows }, { data: allIntake }, { data: goalRows }, { data: prof }, { data: trendRows }, { data: savedFoods }] = await Promise.all([
            supabase
                .from("food_entries")
                .select("id, date, meal_slot, label, kcal, protein_g, carbs_g, fat_g, logged_at")
                .eq("user_id", user.id)
                .eq("date", date)
                .order("logged_at", { ascending: true }),
            supabase
                .from("daily_intake")
                .select("date")
                .eq("user_id", user.id)
                .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
            supabase
                .from("daily_intake")
                .select("date, kcal")
                .eq("user_id", user.id)
                .order("date", { ascending: true }),
            supabase
                .from("user_goals")
                .select("goal_type, rate_per_week_kg, diet_preference, calorie_target_override, target_weight_kg, target_date, adaptive_mode")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .limit(1),
            supabase
                .from("profiles")
                .select("height_cm, date_of_birth, sex, activity_level")
                .eq("id", user.id)
                .maybeSingle(),
            supabase
                .from("weight_trend")
                .select("date, ema_kg")
                .eq("user_id", user.id)
                .order("date", { ascending: true }),
            supabase
                .from("my_foods")
                .select("id, label, kcal, protein_g, carbs_g, fat_g, use_count")
                .eq("user_id", user.id)
                .order("use_count", { ascending: false })
                .limit(20),
        ]);
        setIntakeEntries((entries ?? []) as FoodEntry[]);
        setIntakeAdherence(calcAdherence(dailyRows ?? [], 30));
        setMyFoods((savedFoods ?? []).map((f: any) => ({ ...f, protein_g: Number(f.protein_g), carbs_g: Number(f.carbs_g), fat_g: Number(f.fat_g) })));

        const g = goalRows?.[0] as any;
        if (g) {
            setLedgerGoal({ targetWeightKg: g.target_weight_kg ? Number(g.target_weight_kg) : null, targetDate: g.target_date ?? null, goalType: g.goal_type ?? "general_fitness" });
            setAdaptiveMode(!!g.adaptive_mode);
        }

        const bwLatestRaw = bodyWeightData.length > 0 ? bodyWeightData[bodyWeightData.length - 1].weight : null;
        const bwLatest = (trendRows && trendRows.length > 0)
            ? Number(trendRows[trendRows.length - 1].ema_kg)
            : bwLatestRaw;
        if (prof?.height_cm && prof?.date_of_birth && prof?.sex && bwLatest) {
            const isAdaptive = !!g?.adaptive_mode;
            const baseSummary = getFullCalorieSummary({
                weightKg: bwLatest,
                heightCm: prof.height_cm,
                ageYears: ageFromDOB(prof.date_of_birth),
                sex: prof.sex as Sex,
                activity: (prof.activity_level as ActivityLevel) ?? "moderate",
                goalType: (g?.goal_type as GoalType) ?? "general_fitness",
                ratePerWeekKg: g?.rate_per_week_kg ?? undefined,
                diet: (g?.diet_preference as DietPreference) ?? "balanced",
                calorieOverride: g?.calorie_target_override ?? undefined,
            });

            let estimate: TdeeEstimate | null = null;
            if (allIntake && trendRows && trendRows.length >= 2) {
                estimate = estimateObservedTdee({
                    dailyIntakes: allIntake.map((r: any) => ({ date: r.date, kcal: Number(r.kcal) })),
                    trendWeights: trendRows.map((r: any) => ({ date: r.date, ema_kg: Number(r.ema_kg) })),
                    seedTdee: baseSummary.tdee,
                    previousEstimate: null,
                });
                setTdeeEstimate(estimate);
            }

            let blendedTdee: number | null = null;
            if (isAdaptive && estimate && estimate.method === "observed") {
                blendedTdee = blendTdee(baseSummary.tdee, estimate);
            }

            const summary = blendedTdee
                ? getFullCalorieSummary({
                    weightKg: bwLatest,
                    heightCm: prof.height_cm,
                    ageYears: ageFromDOB(prof.date_of_birth),
                    sex: prof.sex as Sex,
                    activity: (prof.activity_level as ActivityLevel) ?? "moderate",
                    goalType: (g?.goal_type as GoalType) ?? "general_fitness",
                    ratePerWeekKg: g?.rate_per_week_kg ?? undefined,
                    diet: (g?.diet_preference as DietPreference) ?? "balanced",
                    calorieOverride: g?.calorie_target_override ?? undefined,
                    blendedTdee,
                })
                : baseSummary;

            setLedgerCalorieSummary(summary);
            if (allIntake && allIntake.length > 0) {
                const today = new Date().toISOString().split("T")[0];
                const completedDays = allIntake.filter((r: any) => r.date < today);
                setLedger(buildLedger(completedDays.map((r: any) => ({ date: r.date, kcal: Number(r.kcal) })), summary.calorieTarget));
            }

            if (g?.target_weight_kg && bwLatest) {
                setFeasibility(checkFeasibility({
                    currentKg: bwLatest,
                    targetKg: Number(g.target_weight_kg),
                    targetDate: g.target_date ?? null,
                    tdee: summary.tdee,
                    bmr: summary.bmr,
                    sex: prof.sex,
                    heightCm: prof.height_cm,
                    goalType: g.goal_type,
                }));
            }

            setEnergyReceipt(buildEnergyReceipt({
                bmr: baseSummary.bmr,
                tdee: baseSummary.tdee,
                calorieTarget: summary.calorieTarget,
                macros: summary.macros,
                observedTdee: estimate?.method === "observed" ? estimate.value : null,
                observedConfidence: estimate?.method === "observed" ? estimate.confidence : null,
                blendedTdee: blendedTdee,
                adaptiveMode: isAdaptive,
                hasOverride: !!g?.calorie_target_override,
                goalType: g?.goal_type ?? "general_fitness",
                weightKg: bwLatest,
                heightCm: prof.height_cm,
                ageYears: ageFromDOB(prof.date_of_birth),
                sex: prof.sex,
                activity: prof.activity_level ?? "moderate",
            }));

            const trendWeights = (trendRows ?? []).map((r: any) => ({ date: r.date, ema_kg: Number(r.ema_kg) }));
            const dailyIntakes = (allIntake ?? []).map((r: any) => ({ date: r.date, kcal: Number(r.kcal) }));

            if (trendWeights.length >= 7 && dailyIntakes.length >= 7) {
                try {
                    setInsightPrediction(buildPredictionVsReality({
                        startDate: trendWeights[0].date,
                        startWeightKg: trendWeights[0].ema_kg,
                        dailyTarget: summary.calorieTarget,
                        tdee: summary.tdee,
                        actualWeights: trendWeights,
                        intakes: dailyIntakes,
                    }));
                } catch { setInsightPrediction(null); }

                try {
                    const latestWeight = trendWeights[trendWeights.length - 1];
                    const prevWeight = trendWeights.length >= 3 ? trendWeights[trendWeights.length - 3] : null;
                    setInsightAnomaly(explainWeightAnomaly({
                        todayKg: latestWeight.ema_kg,
                        yesterdayKg: trendWeights.length >= 2 ? trendWeights[trendWeights.length - 2].ema_kg : null,
                        trendKg: latestWeight.ema_kg,
                        previousTrendKg: prevWeight?.ema_kg ?? null,
                        recentCarbsG: null,
                        hadLegDay: false,
                        loggingAdherence: intakeAdherence ?? 0,
                    }));
                } catch { setInsightAnomaly(null); }

                try {
                    setInsightAdaptation(detectAdaptation({ tdeeEstimates: [] }));
                } catch { setInsightAdaptation(null); }
            }

            const { data: strengthRows } = await supabase
                .from("exercise_set_logs")
                .select("created_at, weight, reps")
                .eq("user_id", user!.id)
                .gt("weight", 0)
                .order("created_at", { ascending: true })
                .limit(200);
            const strengthData = (strengthRows ?? []).map((r: any) => ({
                date: (r.created_at as string).split("T")[0],
                estimated1rm: Number(r.weight) * (1 + Number(r.reps) / 30),
            }));

            if (trendWeights.length >= 7 && strengthData.length >= 3) {
                try { setInsightLeanMass(assessLeanMassSignal({ weightTrend: trendWeights, strengthData })); } catch { setInsightLeanMass(null); }
                if (g?.goal_type === "recomp" || g?.goal_type === "maintain") {
                    try { setInsightRecomp(assessRecomp({ weightTrend: trendWeights, strengthData })); } catch { setInsightRecomp(null); }
                } else { setInsightRecomp(null); }
            }

            const today = new Date().toISOString().split("T")[0];
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
            const weekDays = dailyIntakes.filter(d => d.date >= weekStart.toISOString().split("T")[0] && d.date <= today);
            try {
                setInsightBudget(calcWeeklyBudget({
                    dailyTarget: summary.calorieTarget,
                    intakes: dailyIntakes,
                    today,
                }));
            } catch { setInsightBudget(null); }

            try {
                setInsightRecovery(getRecoveryAdjustment({ tdee: summary.tdee, calorieTarget: summary.calorieTarget }));
            } catch { setInsightRecovery(null); }

            try {
                setInsightPatterns(detectPatterns({
                    currentKg: bwLatest,
                    heightCm: prof.height_cm,
                    targetKg: g?.target_weight_kg ? Number(g.target_weight_kg) : null,
                    weightTrend: trendWeights.slice(-14),
                    loggingAdherence: intakeAdherence ?? undefined,
                }));
            } catch { setInsightPatterns([]); }
        }
    }, [user, bodyWeightData]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            await Promise.all([loadHistory(), loadAchievements(), loadLeaderboardCard(), loadGoals(), loadPRs(), loadBodyWeight(), loadMeasurements(), loadWeeklyVolume()]);
            setLoading(false);
        }
        load();
    }, [loadHistory, loadAchievements, loadLeaderboardCard, loadGoals, loadPRs, loadBodyWeight, loadMeasurements, loadWeeklyVolume]);

    useEffect(() => {
        if (tab === "intake") loadIntake(intakeDate);
    }, [tab, intakeDate, loadIntake]);

    async function loadStrengthHistory(exerciseId: string) {
        if (!user) return;
        setStrengthLoading(true);
        setSelectedExercise(exerciseId);
        setEditingGoal(false);
        setGoalInput("");

        const { data } = await supabase
            .from("exercise_set_logs")
            .select("weight, reps, completed_at")
            .eq("user_id", user.id)
            .eq("exercise_id", exerciseId)
            .gt("weight", 0)
            .order("completed_at", { ascending: true });

        // Group by date, take best e1RM per day
        const byDate: Record<string, StrengthDataPoint> = {};
        (data ?? []).forEach((log: any) => {
            const dateStr = log.completed_at ? log.completed_at.split("T")[0] : "";
            const w = Number(log.weight);
            const r = Number(log.reps);
            const e1rm = estimateE1RM(w, r);
            if (!byDate[dateStr] || e1rm > byDate[dateStr].e1rm) {
                byDate[dateStr] = { date: formatDate(dateStr), weight: w, reps: r, e1rm };
            }
        });

        setStrengthHistory(Object.values(byDate));
        setStrengthLoading(false);
    }

    async function logBodyWeight() {
        if (!user || !newWeight) return;
        const rawValue = Number(newWeight);
        if (rawValue <= 0) return;
        const storedKg = weightUnit === "lbs" ? lbsToKg(rawValue) : rawValue;
        const today = new Date().toISOString().split("T")[0];

        await supabase.from("body_weight_logs").insert({
            user_id: user.id,
            weight: storedKg,
            context: weightContext,
            entered_unit: weightUnit,
            date: today,
        });

        if (weightContext === "morning") {
            await rematerializeWeightTrend(user.id);
        }

        setNewWeight("");
        await loadBodyWeight();
    }

    const rangeStart = rangeStartDate(activityRange);
    const rangeSessions = rangeStart ? sessions.filter((s) => new Date(s.date + "T00:00:00") >= rangeStart) : sessions;
    const rangeWorkoutCount = rangeSessions.length;
    const rangeHours = rangeSessions.reduce((s, r) => s + (r.duration_seconds || 0), 0) / 3600;
    const rangeVolume = rangeSessions.reduce((s, r) => s + (Number(r.total_volume) || 0), 0);

    const sessionDates = new Set(sessions.map((s) => s.date));
    const calendarBase = new Date();
    calendarBase.setDate(1);
    calendarBase.setMonth(calendarBase.getMonth() + calendarMonthOffset);
    const calendarYear = calendarBase.getFullYear();
    const calendarMonth = calendarBase.getMonth();
    const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const todayStr = toDateString(new Date());
    const calendarCells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const earnedSorted = ACHIEVEMENT_DEFS
        .filter((a) => earnedKeys.has(a.key))
        .sort((a, b) => new Date(earnedDates[b.key]).getTime() - new Date(earnedDates[a.key]).getTime());
    const lockedInOrder = ACHIEVEMENT_DEFS.filter((a) => !earnedKeys.has(a.key));
    const achievementStrip: AchievementDef[] = [...earnedSorted, ...lockedInOrder].slice(0, 10);

    const TABS: { key: Tab; label: string; icon: any }[] = [
        { key: "history", label: "HISTORY", icon: Calendar },
        { key: "strength", label: "STRENGTH", icon: Dumbbell },
        { key: "body", label: "BODY", icon: Weight },
        { key: "volume", label: "VOLUME", icon: TrendingUp },
        { key: "intake", label: "INTAKE", icon: Flame },
    ];

    return (
        <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">
            <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgb(var(--accent-rgb)/0.06)] rounded-full blur-[120px]" />

            <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
                <div>
                    <h1 className="text-xl font-bold text-[rgb(var(--accent-light-rgb))]">Progress</h1>
                    <p className="text-[11px] text-white/30 mt-0.5">Track your training journey</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-5 gap-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center justify-center gap-1.5 text-[10px] font-mono px-2 py-2 rounded-xl border transition ${tab === t.key ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"
                                }`}
                        >
                            <t.icon size={12} /> {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ══════════ HISTORY ══════════ */}
                        {tab === "history" && (
                            <div className="space-y-4">
                                {/* Total Activity */}
                                <div>
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-2.5">TOTAL ACTIVITY</p>
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {ACTIVITY_RANGES.map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setActivityRange(r)}
                                                    className={`text-[10px] font-mono px-3 py-1.5 rounded-full border transition ${activityRange === r ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.08)] text-[rgb(var(--accent-rgb))]" : "border-white/[0.06] text-white/30 hover:text-white/60"}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-xl font-bold font-mono text-white/90">{rangeWorkoutCount}</p>
                                                <p className="text-[9px] font-mono text-white/30 mt-1 leading-tight">Number of<br />Workouts</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold font-mono text-white/90">{rangeHours.toFixed(1)}</p>
                                                <p className="text-[9px] font-mono text-white/30 mt-1 leading-tight">Hours at<br />the Gym</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{Math.round(rangeVolume).toLocaleString()}</p>
                                                <p className="text-[9px] font-mono text-white/30 mt-1 leading-tight">Total Weight<br />Lifted (kg)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Workouts calendar */}
                                <div>
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-2.5">YOUR WORKOUTS</p>
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <button onClick={() => setCalendarMonthOffset((o) => o - 1)} className="text-white/30 hover:text-white/70 transition px-1">‹</button>
                                            <p className="text-sm font-bold text-white/85">{calendarBase.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
                                            <button onClick={() => setCalendarMonthOffset((o) => o + 1)} disabled={calendarMonthOffset >= 0} className="text-white/30 hover:text-white/70 disabled:opacity-20 disabled:hover:text-white/30 transition px-1">›</button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                                            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                                                <p key={d} className="text-[8px] font-mono text-white/25">{d}</p>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {calendarCells.map((day, i) => {
                                                if (day === null) return <div key={`empty-${i}`} />;
                                                const cellDate = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                                const hasWorkout = sessionDates.has(cellDate);
                                                const isToday = cellDate === todayStr;
                                                return (
                                                    <div key={cellDate} className="aspect-square flex items-center justify-center">
                                                        <span className={`w-full h-full flex items-center justify-center rounded-md text-[11px] font-mono ${hasWorkout ? "bg-[rgb(var(--accent-rgb)/0.2)] text-[rgb(var(--accent-light-rgb))] font-bold" : "text-white/30"} ${isToday ? "ring-1 ring-[rgb(var(--accent-rgb)/0.6)]" : ""}`}>
                                                            {day}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Leaderboard */}
                                {leaderboardCard && (
                                    <div>
                                        <Link href="/rankings" className="flex items-center justify-between mb-2.5 group">
                                            <p className="text-[10px] font-mono tracking-widest text-white/25">LEADERBOARDS</p>
                                            <span className="flex items-center gap-0.5 text-[10px] font-mono text-white/30 group-hover:text-[rgb(var(--accent-light-rgb))] transition">
                                                SEE ALL <ChevronRight size={12} />
                                            </span>
                                        </Link>
                                        <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.2)] bg-white/[0.03] p-4">
                                            <p className="text-base font-bold text-white/95">{leaderboardCard.exerciseName}</p>
                                            <p className="text-[10px] font-mono text-[rgb(var(--accent-light-rgb)/0.6)] mt-0.5">Max Weight Lifted</p>
                                            <p className="text-[10px] font-mono text-white/30">Global, All-Time</p>
                                            <div className="space-y-1.5 mt-3">
                                                {leaderboardCard.top.map((row, i) => (
                                                    <div key={row.user_id} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${row.user_id === user?.id ? "bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)]" : "bg-white/[0.02]"}`}>
                                                        <span className="text-xs font-mono text-white/40 w-4 shrink-0">{i + 1}</span>
                                                        <span className="text-sm font-bold text-white/85 flex-1 min-w-0 truncate">{row.username}</span>
                                                        <span className="text-sm font-mono text-white/70 shrink-0">{row.best_weight}kg</span>
                                                    </div>
                                                ))}
                                                {leaderboardCard.myRank > 3 && (
                                                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-rgb)/0.3)]">
                                                        <span className="text-xs font-mono text-white/40 w-4 shrink-0">#{leaderboardCard.myRank}</span>
                                                        <span className="text-sm font-bold text-white/85 flex-1 min-w-0 truncate">You</span>
                                                        <span className="text-sm font-mono text-white/70 shrink-0">{leaderboardCard.myWeight}kg</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-mono text-white/25 mt-2.5">Ranked #{leaderboardCard.myRank} of {leaderboardCard.total}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Latest Achievements */}
                                <div>
                                    <Link href="/achievements" className="flex items-center justify-between mb-2.5 group">
                                        <p className="text-[10px] font-mono tracking-widest text-white/25">LATEST ACHIEVEMENTS</p>
                                        <span className="flex items-center gap-0.5 text-[10px] font-mono text-white/30 group-hover:text-[rgb(var(--accent-light-rgb))] transition">
                                            SEE ALL <ChevronRight size={12} />
                                        </span>
                                    </Link>
                                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                        {achievementStrip.map((a) => {
                                            const isEarned = earnedKeys.has(a.key);
                                            const colors = RARITY_COLORS[a.rarity];
                                            return (
                                                <div
                                                    key={a.key}
                                                    className={`shrink-0 w-20 flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center ${isEarned ? `${colors.border} ${colors.bg}` : "border-white/[0.06] bg-white/[0.02]"}`}
                                                >
                                                    <div className={`text-2xl ${isEarned ? "" : "grayscale opacity-25"}`}>{a.icon}</div>
                                                    <p className={`text-[9px] font-mono leading-tight ${isEarned ? colors.text : "text-white/25"}`}>{a.name}</p>
                                                    {!isEarned && <Lock size={9} className="text-white/15" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Session list */}
                                {sessions.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Calendar size={32} className="mx-auto mb-3 text-white/15" />
                                        <p className="text-sm font-semibold text-white/25">NO WORKOUTS YET</p>
                                        <p className="text-xs text-white/20 mt-1">Complete your first workout to see history here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {sessions.map((s) => (
                                            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                                                <div className="w-10 h-10 rounded-lg bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center shrink-0">
                                                    <Dumbbell size={16} className="text-[rgb(var(--accent-light-rgb))]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white/90 truncate">{s.title || "Workout"}</p>
                                                    <p className="text-[10px] font-mono text-white/35">{formatDateFull(s.date)}</p>
                                                </div>
                                                <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                                                    <div className="hidden sm:block">
                                                        <p className="text-[8px] font-mono text-white/25">DURATION</p>
                                                        <p className="text-xs font-mono text-white/70">{formatDuration(s.duration_seconds || 0)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-mono text-white/25">SETS</p>
                                                        <p className="text-xs font-mono text-white/70">{s.total_sets}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-mono text-white/25">VOL</p>
                                                        <p className="text-xs font-mono text-white/70">{Math.round(Number(s.total_volume) || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)]">XP</p>
                                                        <p className="text-xs font-mono text-[rgb(var(--accent-light-rgb))]">+{s.xp_earned}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ STRENGTH ══════════ */}
                        {tab === "strength" && (
                            <div className="space-y-4">
                                {/* PR Board */}
                                <div>
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">PERSONAL RECORDS</p>
                                    {prs.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Trophy size={32} className="mx-auto mb-3 text-white/15" />
                                            <p className="text-sm font-semibold text-white/25">NO PRs YET</p>
                                            <p className="text-xs text-white/20 mt-1">Log workouts with weight to see PRs here.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {prs.slice(0, 15).map((pr) => {
                                                const isSelected = selectedExercise === pr.exercise_id;
                                                return (
                                                    <div key={pr.exercise_id}>
                                                        <button
                                                            onClick={() => isSelected ? setSelectedExercise(null) : loadStrengthHistory(pr.exercise_id)}
                                                            className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${isSelected ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb))]/[0.05]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                                                                }`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-white/90 truncate">{pr.exercise_name}</p>
                                                                <p className="text-[10px] font-mono text-white/30">{pr.body_segment} · {formatDate(pr.date)}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-bold font-mono text-white/90">{pr.best_weight}<span className="text-[10px] text-white/40">kg</span> × {pr.best_reps_at_weight}</p>
                                                                    <p className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.6)]">e1RM: {pr.estimated_1rm}kg</p>
                                                                </div>
                                                                {isSelected ? <ChevronDown size={14} className="text-[rgb(var(--accent-light-rgb))]" /> : <ChevronRight size={14} className="text-white/25" />}
                                                            </div>
                                                        </button>

                                                        {isSelected && (
                                                            <div className="rounded-b-lg border border-t-0 border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb))]/[0.02] p-4">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div>
                                                                        <p className="text-[8px] font-mono text-white/30 mb-0.5">GOAL</p>
                                                                        {editingGoal ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <input
                                                                                    type="number" min="0" autoFocus onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                                    value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
                                                                                    onKeyDown={(e) => e.key === "Enter" && saveGoal(pr.exercise_id)}
                                                                                    className="w-16 h-7 rounded bg-white/[0.06] border border-white/10 text-center text-xs font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)]"
                                                                                />
                                                                                <button onClick={() => saveGoal(pr.exercise_id)} className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb))] px-1.5">SET</button>
                                                                            </div>
                                                                        ) : (
                                                                            <button onClick={() => { setEditingGoal(true); setGoalInput(goals[pr.exercise_id] ? String(goals[pr.exercise_id]) : ""); }} className="flex items-center gap-1.5">
                                                                                <Trophy size={12} className="text-white/25" />
                                                                                <span className="text-sm font-bold font-mono text-white/80">{goals[pr.exercise_id] ? `${goals[pr.exercise_id]}kg` : "— —"}</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[8px] font-mono text-white/30 mb-0.5">CURRENT MAX</p>
                                                                        <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{pr.best_weight}<span className="text-xs text-white/40">kg</span></p>
                                                                    </div>
                                                                </div>
                                                                {strengthLoading ? (
                                                                    <p className="text-xs text-white/40 text-center py-4">Loading chart...</p>
                                                                ) : strengthHistory.length < 2 ? (
                                                                    <p className="text-xs text-white/30 text-center py-4">Need at least 2 sessions to show a trend.</p>
                                                                ) : (
                                                                    <div className="h-48">
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                            <LineChart data={strengthHistory}>
                                                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                                                <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} domain={["auto", "auto"]} />
                                                                                <Tooltip content={<CustomTooltip />} />
                                                                                <Line
                                                                                    type="monotone" dataKey="weight" stroke="rgb(var(--accent-rgb))" strokeWidth={2} name="Weight (kg)"
                                                                                    dot={(dotProps: any) => {
                                                                                        const { cx, cy, payload, index } = dotProps;
                                                                                        const maxWeight = Math.max(...strengthHistory.map((p) => p.weight));
                                                                                        const isPR = payload.weight === maxWeight;
                                                                                        return (
                                                                                            <g key={`dot-${index}`}>
                                                                                                <circle cx={cx} cy={cy} r={isPR ? 5 : 3} fill={isPR ? "rgb(var(--accent-light-rgb))" : "rgb(var(--accent-rgb))"} stroke={isPR ? "#050914" : "none"} strokeWidth={isPR ? 1.5 : 0} />
                                                                                                {isPR && <text x={cx} y={cy - 12} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="rgb(var(--accent-light-rgb))" fontWeight="bold">PR</text>}
                                                                                            </g>
                                                                                        );
                                                                                    }}
                                                                                />
                                                                                <Line type="monotone" dataKey="e1rm" stroke="rgb(var(--accent-light-rgb))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Est. 1RM" />
                                                                            </LineChart>
                                                                        </ResponsiveContainer>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══════════ BODY ══════════ */}
                        {tab === "body" && (
                            <div className="space-y-4">
                                {/* Measurements */}
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-4">MEASUREMENTS</p>
                                    <div className="flex items-end justify-between gap-2 h-28 mb-3">
                                        {MEASUREMENT_TYPES.map((m) => {
                                            const val = measurements[m.type];
                                            const maxVal = Math.max(30, ...MEASUREMENT_TYPES.map((t) => measurements[t.type] ?? 0));
                                            const heightPct = val ? Math.max(12, (val / maxVal) * 100) : 8;
                                            return (
                                                <div key={m.type} className="flex-1 flex flex-col items-center justify-end h-full">
                                                    <div className={`w-full max-w-8 rounded-t ${val ? m.bar : "bg-white/[0.06]"}`} style={{ height: `${heightPct}%` }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        {MEASUREMENT_TYPES.map((m) => (
                                            <div key={m.type} className="flex-1 flex flex-col items-center gap-1">
                                                <button
                                                    onClick={() => setActiveMeasurement(m.type)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold ${m.bar} text-black`}
                                                >
                                                    +
                                                </button>
                                                <p className={`text-[8px] font-mono ${m.color} text-center leading-tight`}>{m.type.toUpperCase()}</p>
                                                {measurements[m.type] != null && <p className="text-[8px] font-mono text-white/30">{measurements[m.type]}cm</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Log weight */}
                                <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.02] p-4" style={{ boxShadow: "inset 0 1px 0 rgb(var(--accent-rgb) / 0.06)" }}>
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">LOG BODY WEIGHT</p>

                                    {/* Context selector */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {WEIGHT_CONTEXTS.map((ctx) => (
                                            <button
                                                key={ctx.value}
                                                onClick={() => setWeightContext(ctx.value)}
                                                className={`text-[9px] font-mono px-2.5 py-1.5 rounded-md border transition ${weightContext === ctx.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.08] text-white/30 hover:text-white/50"}`}
                                            >
                                                {ctx.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            inputMode="decimal"
                                            onWheel={(e) => (e.target as HTMLElement).blur()}
                                            value={newWeight}
                                            onChange={(e) => setNewWeight(e.target.value)}
                                            placeholder="—"
                                            className="flex-1 min-w-0 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition"
                                        />
                                        {/* Unit toggle */}
                                        <button
                                            onClick={() => setWeightUnit((u) => u === "kg" ? "lbs" : "kg")}
                                            className="shrink-0 text-[10px] font-mono px-3 py-3 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 transition"
                                        >
                                            {weightUnit.toUpperCase()}
                                        </button>
                                        <button
                                            onClick={logBodyWeight}
                                            disabled={!newWeight}
                                            className="shrink-0 text-[10px] font-mono px-4 py-3 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        >
                                            LOG
                                        </button>
                                    </div>
                                    {weightContext === "morning" && (
                                        <p className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] mt-2">Morning weigh-ins feed the trend line. Other entries are logged but don't affect your trend.</p>
                                    )}
                                </div>

                                {/* Weight trend chart */}
                                <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.02] p-4" style={{ boxShadow: "inset 0 1px 0 rgb(var(--accent-rgb) / 0.06)" }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-mono tracking-widest text-white/25">WEIGHT TREND</p>
                                        {bodyWeightData.some((d) => d.ema) && (
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1.5 text-[8px] font-mono text-white/25">
                                                    <span className="w-3 h-0.5 rounded-full bg-white/20 inline-block" /> RAW
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[8px] font-mono text-cyan-300/60">
                                                    <span className="w-3 h-0.5 rounded-full bg-cyan-400 inline-block" /> TREND
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {bodyWeightData.length < 2 ? (
                                        <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                                            <p className="text-xs font-mono text-white/30 text-center px-4">
                                                {bodyWeightData.length === 0 ? "No weight logs yet. Log your morning weight to start tracking." : "Need at least 2 entries to show a trend."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={bodyWeightData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} domain={["auto", "auto"]} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line type="monotone" dataKey="weight" stroke="rgba(255,255,255,0.2)" strokeWidth={1} dot={{ r: 2.5, fill: "rgba(255,255,255,0.15)", strokeWidth: 0 }} name="Raw (kg)" activeDot={{ r: 4, fill: "rgba(255,255,255,0.4)" }} />
                                                    {bodyWeightData.some((d) => d.ema) && (
                                                        <Line type="monotone" dataKey="ema" stroke="#22d3ee" strokeWidth={2.5} dot={false} name="Trend (kg)" connectNulls />
                                                    )}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                    {bodyWeightData.length >= 2 && !bodyWeightData.some((d) => d.ema) && (
                                        <p className="text-[9px] font-mono text-white/20 mt-2 text-center">Log morning weigh-ins to see the EMA<InfoTip term="EMA" /> trend line</p>
                                    )}
                                </div>

                                {/* Explainer — only shown once there's some data */}
                                {bodyWeightData.length > 0 && bodyWeightData.length <= 7 && (
                                    <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3">
                                        <p className="text-[9px] font-mono text-amber-200/60 leading-relaxed">Initial weight changes are mostly glycogen and water (~3g water per 1g glycogen stored), not fat. Give the trend line 2-3 weeks before reading real direction.</p>
                                    </div>
                                )}

                                {/* Latest stats */}
                                {bodyWeightData.length > 0 && (() => {
                                    const latest = bodyWeightData[bodyWeightData.length - 1];
                                    const trendEntries = bodyWeightData.filter((d) => d.ema !== undefined);
                                    const trendStart = trendEntries.length >= 2 ? trendEntries[0].ema! : null;
                                    const trendEnd = trendEntries.length >= 2 ? trendEntries[trendEntries.length - 1].ema! : null;
                                    const trendChange = trendStart !== null && trendEnd !== null ? Math.round((trendEnd - trendStart) * 10) / 10 : null;
                                    const weeklyRate = trendEntries.length >= 7 && trendStart !== null && trendEnd !== null
                                        ? Math.round(((trendEnd - trendStart) / (trendEntries.length / 7)) * 10) / 10
                                        : null;

                                    return (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">CURRENT</p>
                                                <p className="text-lg font-bold font-mono text-white/90">{latest.weight} <span className="text-xs text-white/30">KG</span></p>
                                            </div>
                                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">{trendEnd !== null ? "TREND" : "LOWEST"}</p>
                                                {trendEnd !== null ? (
                                                    <p className="text-lg font-bold font-mono text-cyan-300">{trendEnd} <span className="text-xs text-white/30">KG</span></p>
                                                ) : (
                                                    <p className="text-lg font-bold font-mono text-emerald-300">{Math.min(...bodyWeightData.map((d) => d.weight))} <span className="text-xs text-white/30">KG</span></p>
                                                )}
                                            </div>
                                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">{weeklyRate !== null ? "/WEEK" : "CHANGE"}</p>
                                                {weeklyRate !== null ? (
                                                    <p className={`text-lg font-bold font-mono ${weeklyRate > 0 ? "text-orange-300" : weeklyRate < 0 ? "text-emerald-300" : "text-white/50"}`}>{weeklyRate > 0 ? "+" : ""}{weeklyRate} <span className="text-xs text-white/30">KG</span></p>
                                                ) : bodyWeightData.length >= 2 ? (() => {
                                                    const change = Math.round((latest.weight - bodyWeightData[0].weight) * 10) / 10;
                                                    return <p className={`text-lg font-bold font-mono ${change > 0 ? "text-orange-300" : change < 0 ? "text-emerald-300" : "text-white/50"}`}>{change > 0 ? "+" : ""}{change} <span className="text-xs text-white/30">KG</span></p>;
                                                })() : <p className="text-lg font-bold font-mono text-white/30">—</p>}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* ══════════ VOLUME ══════════ */}
                        {tab === "volume" && (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">WEEKLY VOLUME (KG)</p>
                                    {weeklyVolumeData.length === 0 ? (
                                        <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                                            <p className="text-xs font-mono text-white/30 text-center px-4">No data yet.</p>
                                        </div>
                                    ) : (
                                        <div className="h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={weeklyVolumeData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis dataKey="week" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="volume" fill="rgb(var(--accent-rgb) / 0.6)" radius={[4, 4, 0, 0]} name="Volume (kg)" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">WEEKLY SETS</p>
                                    {weeklyVolumeData.length === 0 ? (
                                        <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                                            <p className="text-xs font-mono text-white/30 text-center px-4">No data yet.</p>
                                        </div>
                                    ) : (
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={weeklyVolumeData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis dataKey="week" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="sets" fill="rgba(52,211,153,0.5)" radius={[4, 4, 0, 0]} name="Sets" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {weeklyVolumeData.length >= 2 && (() => {
                                    const latest = weeklyVolumeData[weeklyVolumeData.length - 1];
                                    const prev = weeklyVolumeData[weeklyVolumeData.length - 2];
                                    const volChange = latest.volume - prev.volume;
                                    const setChange = latest.sets - prev.sets;
                                    return (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">VOL VS LAST WEEK</p>
                                                <p className={`text-lg font-bold font-mono ${volChange > 0 ? "text-[rgb(var(--accent-light-rgb))]" : volChange < 0 ? "text-orange-300" : "text-white/50"}`}>
                                                    {volChange > 0 ? "+" : ""}{volChange.toLocaleString()} <span className="text-xs text-white/30">KG</span>
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">SETS VS LAST WEEK</p>
                                                <p className={`text-lg font-bold font-mono ${setChange > 0 ? "text-[rgb(var(--accent-light-rgb))]" : setChange < 0 ? "text-orange-300" : "text-white/50"}`}>
                                                    {setChange > 0 ? "+" : ""}{setChange} <span className="text-xs text-white/30">SETS</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        {/* ══════════ INTAKE ══════════ */}
                        {tab === "intake" && (
                            <div className="space-y-4">
                                {/* Date selector */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => { const d = new Date(intakeDate); d.setDate(d.getDate() - 1); setIntakeDate(d.toISOString().split("T")[0]); }}
                                        className="text-[10px] font-mono px-3 py-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 transition"
                                    >‹</button>
                                    <div className="text-center">
                                        <p className="text-sm font-bold font-mono text-white/80">
                                            {new Date(intakeDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                        </p>
                                        {intakeDate !== new Date().toISOString().split("T")[0] && (
                                            <button onClick={() => setIntakeDate(new Date().toISOString().split("T")[0])} className="text-[8px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] hover:text-[rgb(var(--accent-light-rgb))] transition">TODAY</button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { const d = new Date(intakeDate); d.setDate(d.getDate() + 1); setIntakeDate(d.toISOString().split("T")[0]); }}
                                        disabled={intakeDate >= new Date().toISOString().split("T")[0]}
                                        className="text-[10px] font-mono px-3 py-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 disabled:opacity-20 transition"
                                    >›</button>
                                </div>

                                {/* Card 1: Today's Progress */}
                                {(() => {
                                    const totals = intakeEntries.reduce((acc, e) => ({
                                        kcal: acc.kcal + e.kcal,
                                        protein: acc.protein + Number(e.protein_g),
                                        carbs: acc.carbs + Number(e.carbs_g),
                                        fat: acc.fat + Number(e.fat_g),
                                    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

                                    const target = ledgerCalorieSummary?.calorieTarget ?? 0;
                                    const remaining = Math.max(0, target - totals.kcal);
                                    const pct = target > 0 ? Math.min((totals.kcal / target) * 100, 100) : 0;
                                    const overTarget = totals.kcal > target;
                                    const overBy = totals.kcal - target;
                                    const isToday = intakeDate === new Date().toISOString().split("T")[0];

                                    const mealColors: Record<string, string> = { breakfast: "rgb(251,191,36)", lunch: "rgb(52,211,153)", dinner: "rgb(129,140,248)", snack: "rgb(244,114,182)" };
                                    const mealTotals = (["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => ({
                                        slot,
                                        kcal: intakeEntries.filter((e) => e.meal_slot === slot).reduce((s, e) => s + e.kcal, 0),
                                    })).filter((m) => m.kcal > 0);

                                    const macroTargets = ledgerCalorieSummary?.macros;

                                    return (
                                        <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.02] p-4" style={{ boxShadow: "inset 0 1px 0 rgb(var(--accent-rgb) / 0.06)" }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] font-mono tracking-widest text-white/25">{isToday ? "TODAY'S PROGRESS" : "DAILY TOTALS"}</p>
                                                {intakeAdherence !== null && (
                                                    <p className="text-[9px] font-mono text-white/30">30D ADHERENCE: <span className={intakeAdherence >= 80 ? "text-emerald-300" : intakeAdherence >= 50 ? "text-amber-300" : "text-red-300"}>{intakeAdherence}%</span></p>
                                                )}
                                            </div>

                                            {/* Remaining / Over display */}
                                            {target > 0 && (
                                                <div className="text-center mb-3">
                                                    {overTarget ? (
                                                        <>
                                                            <p className="text-2xl font-bold font-mono text-red-400">{overBy}</p>
                                                            <p className="text-[9px] font-mono text-red-300/60">kcal over target</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-2xl font-bold font-mono text-emerald-300">{remaining}</p>
                                                            <p className="text-[9px] font-mono text-emerald-300/60">{isToday ? "kcal remaining" : "kcal under target"}</p>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Progress bar with meal segments */}
                                            {target > 0 && (
                                                <div className="mb-3">
                                                    <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden flex">
                                                        {mealTotals.map((m) => (
                                                            <div
                                                                key={m.slot}
                                                                style={{ width: `${Math.min((m.kcal / target) * 100, 100)}%`, backgroundColor: mealColors[m.slot] }}
                                                                className="h-full opacity-70 first:rounded-l-full last:rounded-r-full"
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <div className="flex gap-2">
                                                            {mealTotals.map((m) => (
                                                                <div key={m.slot} className="flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mealColors[m.slot], opacity: 0.7 }} />
                                                                    <span className="text-[7px] font-mono text-white/25 capitalize">{m.slot} {m.kcal}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-[7px] font-mono text-white/20">{totals.kcal} / {target}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Macro mini bars */}
                                            {macroTargets && (
                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                    {([
                                                        { label: "Protein", current: totals.protein, target: macroTargets.protein, color: "rgb(251,113,133)" },
                                                        { label: "Carbs", current: totals.carbs, target: macroTargets.carbs, color: "rgb(251,191,36)" },
                                                        { label: "Fat", current: totals.fat, target: macroTargets.fat, color: "rgb(96,165,250)" },
                                                    ] as const).map((m) => {
                                                        const mpct = m.target > 0 ? Math.min((m.current / m.target) * 100, 100) : 0;
                                                        return (
                                                            <div key={m.label} className="text-center">
                                                                <p className="text-[7px] font-mono text-white/30 mb-0.5">{m.label}</p>
                                                                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${mpct}%`, backgroundColor: m.color, opacity: 0.6 }} />
                                                                </div>
                                                                <p className="text-[8px] font-mono mt-0.5" style={{ color: m.color }}>{Math.round(m.current)}<span className="text-white/20">/{m.target}g</span></p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* No target fallback */}
                                            {!target && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-mono text-white/30">KCAL</p>
                                                        <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{totals.kcal}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-mono text-white/30">PROTEIN</p>
                                                        <p className="text-lg font-bold font-mono text-rose-300">{Math.round(totals.protein)}g</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-mono text-white/30">CARBS</p>
                                                        <p className="text-lg font-bold font-mono text-amber-300">{Math.round(totals.carbs)}g</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-mono text-white/30">FAT</p>
                                                        <p className="text-lg font-bold font-mono text-blue-300">{Math.round(totals.fat)}g</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Card 2: Weekly Trend */}
                                {ledger.length > 0 && ledgerCalorieSummary && (() => {
                                    const avg = avgDailyNet(ledger);
                                    const cumul = ledger[ledger.length - 1].cumulative;
                                    const weightDelta = projectWeightChange(cumul);
                                    const bwLatest = bodyWeightData.length > 0 ? bodyWeightData[bodyWeightData.length - 1] : null;
                                    const trendEntry = bodyWeightData.filter((d) => d.ema !== undefined);
                                    const currentKg = trendEntry.length > 0 ? trendEntry[trendEntry.length - 1].ema! : bwLatest?.weight ?? null;
                                    const hasTarget = ledgerGoal?.targetDate && ledgerGoal?.targetWeightKg;
                                    const daysLeft = hasTarget ? daysUntil(ledgerGoal!.targetDate!) : 0;
                                    const projectedKg = hasTarget && currentKg ? projectWeightAtDate(currentKg, avg, daysLeft) : null;

                                    const goalType = ledgerGoal?.goalType ?? "general_fitness";
                                    const wantsDeficit = goalType === "lose_weight" || goalType === "body_recomp";
                                    const absAvg = Math.abs(avg);
                                    const avgGood = wantsDeficit ? avg <= 0 : avg >= 0;
                                    const absWeightDelta = Math.abs(weightDelta);
                                    const weightGood = wantsDeficit ? weightDelta <= 0 : weightDelta >= 0;

                                    const sparkData = ledger.slice(-14).map((d) => ({ date: d.date.slice(5), net: d.net }));

                                    const weekCount = Math.max(1, Math.ceil(ledger.length / 7));
                                    const avgPerWeek = Math.abs(Math.round(weightDelta / weekCount * 100) / 100);

                                    // Streak: consecutive days where intake was within ±10% of target
                                    const target = ledgerCalorieSummary.calorieTarget;
                                    const margin = target * 0.10;
                                    const streakDots = ledger.slice(-7).map((d) => {
                                        const diff = Math.abs(d.intake - target);
                                        return { date: d.date, hit: diff <= margin };
                                    });
                                    const currentStreak = [...streakDots].reverse().reduce((s, d) => d.hit ? s + 1 : s, 0);

                                    const contextParts: string[] = [];
                                    contextParts.push(`Avg ${absAvg} kcal ${avg < 0 ? "under" : "over"} target across ${ledger.length} day${ledger.length !== 1 ? "s" : ""}`);
                                    if (absWeightDelta >= 0.1) {
                                        contextParts.push(`on pace to ${weightDelta < 0 ? "lose" : "gain"} ~${avgPerWeek} kg/week`);
                                    }

                                    return (
                                        <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.02] p-4" style={{ boxShadow: "inset 0 1px 0 rgb(var(--accent-rgb) / 0.06)" }}>
                                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">WEEKLY TREND</p>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2.5 text-center">
                                                    <p className="text-[8px] font-mono text-white/30 mb-1">AVG VS TARGET</p>
                                                    <p className={`text-sm font-bold font-mono ${avgGood ? "text-emerald-300" : "text-amber-300"}`}>
                                                        {avg === 0 ? "On target" : `${absAvg} ${avg < 0 ? "under" : "over"}`}
                                                    </p>
                                                    <p className="text-[7px] font-mono text-white/20">kcal/day</p>
                                                </div>
                                                <div className="rounded-md bg-white/[0.03] border border-white/[0.04] p-2.5 text-center">
                                                    <p className="text-[8px] font-mono text-white/30 mb-1">WEEKLY PACE</p>
                                                    <p className={`text-sm font-bold font-mono ${weightGood ? "text-emerald-300" : "text-amber-300"}`}>
                                                        ~{avgPerWeek} kg/{weightDelta < 0 ? "lost" : "gained"}
                                                    </p>
                                                    <p className="text-[7px] font-mono text-white/20">per week</p>
                                                </div>
                                            </div>

                                            {/* Streak dots */}
                                            {streakDots.length > 0 && (
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-[8px] font-mono text-white/30 mr-1">STREAK</p>
                                                        {streakDots.map((d, i) => (
                                                            <div key={i} className={`w-2 h-2 rounded-full ${d.hit ? "bg-emerald-400/70" : "bg-white/10"}`} title={d.date} />
                                                        ))}
                                                    </div>
                                                    {currentStreak > 0 && (
                                                        <p className="text-[8px] font-mono text-emerald-300/50">{currentStreak} day{currentStreak !== 1 ? "s" : ""} on target</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Sparkline */}
                                            {sparkData.length >= 3 && (
                                                <div className="mb-3 rounded-md bg-white/[0.02] border border-white/[0.04] p-2">
                                                    <p className="text-[8px] font-mono text-white/25 mb-1">DAILY NET (last {sparkData.length}d)</p>
                                                    <ResponsiveContainer width="100%" height={60}>
                                                        <BarChart data={sparkData} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                                                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                                                            <Bar dataKey="net" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                                                                {sparkData.map((d, i) => (
                                                                    <Cell key={i} fill={d.net <= 0 ? "rgb(110, 231, 183)" : "rgb(252, 211, 77)"} fillOpacity={0.5} />
                                                                ))}
                                                            </Bar>
                                                            <XAxis dataKey="date" tick={{ fontSize: 7, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
                                                            <Tooltip
                                                                contentStyle={{ background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 10, fontFamily: "monospace" }}
                                                                labelStyle={{ color: "rgba(255,255,255,0.4)" }}
                                                                formatter={(v: any) => [`${v > 0 ? "+" : ""}${v} kcal`, v <= 0 ? "Under target" : "Over target"]}
                                                            />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}

                                            {hasTarget && projectedKg !== null && (
                                                <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3 mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[8px] font-mono text-white/30">PROJECTED AT TARGET DATE</p>
                                                            <p className="text-[8px] font-mono text-white/20 mt-0.5">
                                                                {new Date(ledgerGoal!.targetDate! + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ({daysLeft}d left)
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{projectedKg} <span className="text-xs text-white/30">kg</span></p>
                                                            <p className="text-[8px] font-mono text-white/20">target: {Number(ledgerGoal!.targetWeightKg!)} kg</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-[8px] font-mono text-white/20 mt-3 text-center leading-relaxed">{contextParts.join(" — ")}.</p>
                                        </div>
                                    );
                                })()}

                                {/* Feasibility verdict */}
                                {feasibility && (
                                    <div className={`rounded-lg border p-4 ${feasibility.feasible ? "border-emerald-400/20 bg-emerald-400/[0.03]" : "border-amber-400/20 bg-amber-400/[0.03]"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-2 h-2 rounded-full ${feasibility.feasible ? "bg-emerald-400" : "bg-amber-400"}`} />
                                            <p className="text-[10px] font-mono tracking-widest text-white/30">{feasibility.feasible ? "ON TRACK" : "ADJUST NEEDED"}</p>
                                        </div>
                                        <p className="text-xs font-mono text-white/60 mb-2">{feasibility.reason}</p>
                                        {!feasibility.feasible && feasibility.suggestedDate && (
                                            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] p-2 mt-1">
                                                <p className="text-[8px] font-mono text-white/30">SUGGESTED TARGET DATE</p>
                                                <p className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">
                                                    {new Date(feasibility.suggestedDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                                <p className="text-[8px] font-mono text-white/20 mt-0.5">at {feasibility.safeRateKgWeek} kg/week safe rate</p>
                                            </div>
                                        )}
                                        {feasibility.feasible && feasibility.requiredRateKgWeek > 0 && (
                                            <p className="text-[8px] font-mono text-white/20">Required rate: {feasibility.requiredRateKgWeek} kg/week · Safe max: {feasibility.safeRateKgWeek} kg/week</p>
                                        )}
                                        {feasibility.violations.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {feasibility.violations.map((v, i) => (
                                                    <div key={i} className="text-[8px] font-mono text-white/25 flex gap-2">
                                                        <span className="text-amber-300/50 shrink-0">⚠</span>
                                                        <span><span className="text-white/40">{v.rule}:</span> {v.detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Adaptive TDEE */}
                                {ledgerCalorieSummary && (
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-mono tracking-widest text-white/25">ADAPTIVE MODE</p>
                                            <button
                                                onClick={async () => {
                                                    if (!user) return;
                                                    const next = !adaptiveMode;
                                                    setAdaptiveMode(next);
                                                    await supabase.from("user_goals").update({ adaptive_mode: next, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("is_active", true);
                                                }}
                                                className={`relative w-10 h-5 rounded-full transition-colors ${adaptiveMode ? "bg-[rgb(var(--accent-rgb))]" : "bg-white/10"}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${adaptiveMode ? "translate-x-5" : "translate-x-0.5"}`} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">CALCULATED TDEE<InfoTip term="TDEE" /></p>
                                                <p className="text-lg font-bold font-mono text-white/60">{ledgerCalorieSummary.tdee}</p>
                                                <p className="text-[7px] font-mono text-white/15">from profile</p>
                                            </div>
                                            <div className={`rounded-md border p-3 text-center ${tdeeEstimate ? "bg-[rgb(var(--accent-rgb)/0.05)] border-[rgb(var(--accent-rgb)/0.2)]" : "bg-white/[0.03] border-white/[0.06]"}`}>
                                                <p className="text-[8px] font-mono text-white/30">OBSERVED TDEE<InfoTip term="TDEE" /></p>
                                                {tdeeEstimate ? (
                                                    <>
                                                        <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{tdeeEstimate.value}</p>
                                                        <p className="text-[7px] font-mono text-white/15">{tdeeEstimate.windowDays}d data · {tdeeEstimate.method}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-lg font-bold font-mono text-white/20">—</p>
                                                        <p className="text-[7px] font-mono text-white/15">need 14+ days</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {adaptiveMode && tdeeEstimate && (
                                            <div className="mt-3 rounded-md bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                                                <p className="text-[8px] font-mono text-white/30">BLENDED TDEE<InfoTip term="TDEE" /></p>
                                                <p className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">
                                                    {blendTdee(ledgerCalorieSummary.tdee, tdeeEstimate)} <span className="text-xs text-white/20">kcal</span>
                                                </p>
                                                <p className="text-[7px] font-mono text-white/15">weighted blend · observed confidence ramps over 28 days</p>
                                            </div>
                                        )}
                                        {adaptiveMode && !tdeeEstimate && (
                                            <p className="text-[8px] font-mono text-white/20 mt-2 text-center">Log intake and morning weights for 14+ days to enable adaptive estimation.</p>
                                        )}
                                        {energyReceipt && (
                                            <button
                                                onClick={() => setShowReceipt(true)}
                                                className="w-full mt-3 text-[9px] font-mono py-2 rounded-lg border border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/[0.15] transition"
                                            >
                                                Show the receipt
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Add entry form */}
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                                    <p className="text-[10px] font-mono tracking-widest text-white/25">LOG FOOD</p>

                                    {/* Meal slot */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {MEAL_SLOTS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => setIntakeMealSlot(s.value)}
                                                className={`text-[9px] font-mono px-2.5 py-1.5 rounded-md border transition ${intakeMealSlot === s.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/[0.08] text-white/30 hover:text-white/50"}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Label */}
                                    <input
                                        type="text"
                                        value={intakeLabel}
                                        onChange={(e) => setIntakeLabel(e.target.value)}
                                        placeholder="What did you eat? (optional)"
                                        className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/20"
                                    />

                                    {/* Macros grid */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="text-[8px] font-mono text-white/30 block mb-1">KCAL *</label>
                                            <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} value={intakeKcal} onChange={(e) => setIntakeKcal(e.target.value)} placeholder="—" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-mono text-rose-300/50 block mb-1">PROT (g)</label>
                                            <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} value={intakeProtein} onChange={(e) => setIntakeProtein(e.target.value)} placeholder="—" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-mono text-amber-300/50 block mb-1">CARBS (g)</label>
                                            <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} value={intakeCarbs} onChange={(e) => setIntakeCarbs(e.target.value)} placeholder="—" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-mono text-blue-300/50 block mb-1">FAT (g)</label>
                                            <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} value={intakeFat} onChange={(e) => setIntakeFat(e.target.value)} placeholder="—" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition placeholder:text-white/15" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            if (!user || !intakeKcal) return;
                                            await supabase.from("food_entries").insert({
                                                user_id: user.id,
                                                date: intakeDate,
                                                meal_slot: intakeMealSlot,
                                                label: intakeLabel.trim() || null,
                                                kcal: Number(intakeKcal),
                                                protein_g: Number(intakeProtein) || 0,
                                                carbs_g: Number(intakeCarbs) || 0,
                                                fat_g: Number(intakeFat) || 0,
                                            });
                                            await rematerializeDailyIntake(user.id, intakeDate);
                                            const trimmedLabel = intakeLabel.trim();
                                            if (trimmedLabel) {
                                                const existing = myFoods.find((f) => f.label.toLowerCase() === trimmedLabel.toLowerCase());
                                                if (existing) {
                                                    await supabase.from("my_foods").update({
                                                        kcal: Number(intakeKcal),
                                                        protein_g: Number(intakeProtein) || 0,
                                                        carbs_g: Number(intakeCarbs) || 0,
                                                        fat_g: Number(intakeFat) || 0,
                                                        use_count: existing.use_count + 1,
                                                        last_used_at: new Date().toISOString(),
                                                    }).eq("id", existing.id);
                                                } else {
                                                    await supabase.from("my_foods").insert({
                                                        user_id: user.id,
                                                        label: trimmedLabel,
                                                        kcal: Number(intakeKcal),
                                                        protein_g: Number(intakeProtein) || 0,
                                                        carbs_g: Number(intakeCarbs) || 0,
                                                        fat_g: Number(intakeFat) || 0,
                                                    });
                                                }
                                            }
                                            setIntakeLabel("");
                                            setIntakeKcal("");
                                            setIntakeProtein("");
                                            setIntakeCarbs("");
                                            setIntakeFat("");
                                            await loadIntake(intakeDate);
                                        }}
                                        disabled={!intakeKcal}
                                        className="w-full text-[10px] font-mono py-3 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        LOG ENTRY
                                    </button>
                                </div>

                                {/* My Foods — quick relog */}
                                {myFoods.length > 0 && (
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                        <p className="text-[10px] font-mono tracking-widest text-white/25 mb-2">MY FOODS</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {myFoods.map((food) => (
                                                <button
                                                    key={food.id}
                                                    onClick={async () => {
                                                        if (!user) return;
                                                        await supabase.from("food_entries").insert({
                                                            user_id: user.id,
                                                            date: intakeDate,
                                                            meal_slot: intakeMealSlot,
                                                            label: food.label,
                                                            kcal: food.kcal,
                                                            protein_g: food.protein_g,
                                                            carbs_g: food.carbs_g,
                                                            fat_g: food.fat_g,
                                                        });
                                                        await rematerializeDailyIntake(user.id, intakeDate);
                                                        await supabase.from("my_foods").update({ use_count: food.use_count + 1, last_used_at: new Date().toISOString() }).eq("id", food.id);
                                                        await loadIntake(intakeDate);
                                                    }}
                                                    className="text-[9px] font-mono px-2.5 py-1.5 rounded-md border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-[rgb(var(--accent-rgb)/0.3)] hover:bg-[rgb(var(--accent-rgb)/0.05)] transition"
                                                >
                                                    {food.label} <span className="text-white/20 ml-1">{food.kcal}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Entries list */}
                                {intakeEntries.length > 0 && (
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
                                        <p className="text-[10px] font-mono tracking-widest text-white/25 mb-2">ENTRIES</p>
                                        {intakeEntries.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-white/30 uppercase">{entry.meal_slot}</span>
                                                        {entry.label && <span className="text-xs font-mono text-white/60 truncate">{entry.label}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{entry.kcal} kcal</span>
                                                        <span className="text-[9px] font-mono text-rose-300/60">P{Math.round(Number(entry.protein_g))}</span>
                                                        <span className="text-[9px] font-mono text-amber-300/60">C{Math.round(Number(entry.carbs_g))}</span>
                                                        <span className="text-[9px] font-mono text-blue-300/60">F{Math.round(Number(entry.fat_g))}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!user) return;
                                                        await supabase.from("food_entries").delete().eq("id", entry.id);
                                                        await rematerializeDailyIntake(user.id, intakeDate);
                                                        await loadIntake(intakeDate);
                                                    }}
                                                    className="shrink-0 p-2 text-white/20 hover:text-red-400 transition"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {intakeEntries.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
                                        <Flame size={20} className="mx-auto text-white/15 mb-2" />
                                        <p className="text-xs font-mono text-white/30">No entries for this day.</p>
                                        <p className="text-[9px] font-mono text-white/15 mt-1">Log your meals to track daily intake and build adherence.</p>
                                    </div>
                                )}

                                {/* ── INSIGHTS ── */}
                                {(insightBudget || insightPrediction || insightAnomaly || insightAdaptation || insightLeanMass || insightRecovery || insightRecomp || insightPatterns.length > 0) && (
                                    <div className="space-y-3 mt-4">
                                        <p className="text-[10px] font-mono tracking-widest text-white/25">INSIGHTS</p>
                                        {insightPatterns.length > 0 && <PatternWarningsCard warnings={insightPatterns} />}
                                        {insightBudget && <WeeklyBudgetCard data={insightBudget} />}
                                        {insightRecovery && <RecoveryCard data={insightRecovery} />}
                                        {insightAnomaly && <AnomalyCard data={insightAnomaly} />}
                                        {insightPrediction && <PredictionVsRealityCard data={insightPrediction} />}
                                        {insightAdaptation && <AdaptationCard data={insightAdaptation} />}
                                        {insightLeanMass && <LeanMassCard data={insightLeanMass} />}
                                        {insightRecomp && <RecompCard data={insightRecomp} />}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {activeMeasurement && (
                <MeasurementModal
                    type={activeMeasurement}
                    lastValue={measurements[activeMeasurement] ?? null}
                    onClose={() => setActiveMeasurement(null)}
                    onSaved={(type, value) => setMeasurements((prev) => ({ ...prev, [type]: value }))}
                />
            )}

            {showReceipt && energyReceipt && (
                <EnergyReceiptPanel receipt={energyReceipt} onClose={() => setShowReceipt(false)} />
            )}
        </main>
    );
}