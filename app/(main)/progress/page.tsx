"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Dumbbell, Weight, Trophy, ChevronDown, ChevronRight, Lock, Flame, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { tabContent } from "../../lib/motion";
import AnimatedTabs from "../../components/ui/animated-tabs";
import SubNavPills from "../../components/ui/sub-nav-pills";
import { getTrackPills } from "../../lib/navPills";
import CubeLoader from "../../components/ui/cube-loader";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { useSex } from "../../lib/useSex";
import { useUnits } from "../../lib/useUnits";
import { kgToUnit, weightInputToKg } from "../../lib/units";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, ReferenceLine, LabelList } from "recharts";
import { ACHIEVEMENT_DEFS, RARITY_COLORS, type AchievementDef } from "../../lib/achievements";
import MeasurementModal, { type MeasurementType } from "../../components/MeasurementModal";
import { type WeightEntry, type WeightContext, rematerializeWeightTrend } from "../../lib/weightTrend";
import { type FoodEntry, type MealSlot, MEAL_SLOTS, rematerializeDailyIntake, calcAdherence } from "../../lib/intakeLog";
import { buildLedger, avgDailyNet, projectWeightChange, projectWeightAtDate, daysUntil, type DailyBalance } from "../../lib/energyLedger";
import { getFullCalorieSummary, ageFromDOB, type CalorieSummary, type GoalType, type ActivityLevel, type DietPreference, type Sex } from "../../lib/calorieEngine";
import { checkFeasibility, type FeasibilityVerdict } from "../../lib/energyGuardrails";
import { estimateObservedTdee, blendTdee, type TdeeEstimate } from "../../lib/energyEstimator";
import { buildEnergyReceipt, type EnergyReceipt } from "../../lib/systemValue";
import EnergyReceiptPanel from "../../components/EnergyReceipt";
import { PredictionVsRealityCard, AnomalyCard, AdaptationCard, LeanMassCard, WeeklyBudgetCard, RecoveryCard, RecompCard, PatternWarningsCard, ScenarioCard, DietBreakCard, CycleCard, ExerciseExpenditureCard } from "../../components/InsightsPanel";
import { buildPredictionVsReality, type PredictionAccuracy } from "../../lib/predictionReality";
import { explainWeightAnomaly, type AnomalyExplanation } from "../../lib/anomalyExplainer";
import { detectAdaptation, type AdaptationSignal } from "../../lib/metabolicAdaptation";
import { assessLeanMassSignal, type LeanMassSignal } from "../../lib/leanMassSignal";
import { calcWeeklyBudget, type WeeklyBudget } from "../../lib/weeklyBudget";
import { getRecoveryAdjustment, type RecoveryAdjustment } from "../../lib/recoveryEngine";
import { assessRecomp, type RecompAssessment } from "../../lib/recompMode";
import { detectPatterns, type PatternWarning } from "../../lib/energyGuardrails";
import { modelScenario, type ScenarioResult } from "../../lib/scenarioModeling";
import { shouldSuggestDietBreak, planDietBreak } from "../../lib/dietBreaks";
import { comparePhaseToPhase, estimateCyclePhase, getCyclePhaseInfo, computeAdaptiveCycleLength, fetchCycleLogs, type CycleAwareComparison } from "../../lib/cycleAwareTrend";
import { estimateSessionExpenditure, type SessionExpenditure } from "../../lib/exerciseExpenditure";
import { buildMonthlyInsights, type MonthlyComparison } from "../../lib/monthlyInsights";
import { buildStrengthBenchmark, type StrengthBenchmarkResult } from "../../lib/strengthBenchmark";
import { buildPhasePerformance, type PhasePerformanceResult } from "../../lib/phasePerformance";

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

type Tab = "history" | "strength" | "body" | "intake";
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
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("intake");
    const [loading, setLoading] = useState(true);
    const { sex: userSex } = useSex();
    const isFemale = userSex === "female";

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
    const weightUnit = useUnits();
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
    const [insightScenario, setInsightScenario] = useState<ScenarioResult | null>(null);
    const [insightDietBreak, setInsightDietBreak] = useState<string | null>(null);
    const [insightCycle, setInsightCycle] = useState<CycleAwareComparison | null>(null);
    const [insightCyclePhaseInfo, setInsightCyclePhaseInfo] = useState<string>("");
    const [insightExercise, setInsightExercise] = useState<SessionExpenditure | null>(null);
    const [scenarioParams, setScenarioParams] = useState<{ currentKg: number; targetKg: number; tdee: number; bmr: number; sex: string; heightCm: number; goalType: string } | null>(null);
    const [monthlyInsights, setMonthlyInsights] = useState<MonthlyComparison | null>(null);
    const [strengthBenchmark, setStrengthBenchmark] = useState<StrengthBenchmarkResult | null>(null);
    const [phasePerformance, setPhasePerformance] = useState<PhasePerformanceResult | null>(null);
    const [myFoods, setMyFoods] = useState<{ id: string; label: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; use_count: number }[]>([]);
    const [intakeLoading, setIntakeLoading] = useState(false);
    const intakeLoadedDateRef = React.useRef<string | null>(null);

    const loadHistory = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("workout_sessions")
            .select("id, date, title, duration_seconds, total_sets, total_volume, xp_earned")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .eq("sex", userSex)
            .order("date", { ascending: false })
            .limit(1000);
        setSessions(data ?? []);
    }, [user, userSex]);

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
            .eq("user_id", user.id)
            .eq("sex", userSex);
        if (!mine || mine.length === 0) { setLeaderboardCard(null); return; }

        const exerciseIds = mine.map((m: any) => m.exercise_id);
        const { data: all } = await supabase
            .from("exercise_leaderboard")
            .select("exercise_id, user_id, username, avatar_url, best_weight")
            .in("exercise_id", exerciseIds)
            .eq("sex", userSex);
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
    }, [user, userSex]);

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
            .select("exercise_id, weight, reps, completed_at, exercises!inner(name, body_segment), workout_sessions!inner(sex)")
            .eq("user_id", user.id)
            .eq("workout_sessions.sex", userSex)
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
    }, [user, userSex]);

    const loadBodyWeight = useCallback(async () => {
        if (!user) return;
        const [{ data: logs }, { data: trend }] = await Promise.all([
            supabase
                .from("body_weight_logs")
                .select("weight, logged_at, context, date")
                .eq("user_id", user.id)
                .eq("sex", userSex)
                .order("logged_at", { ascending: true })
                .limit(180),
            supabase
                .from("weight_trend")
                .select("date, raw_kg, ema_kg")
                .eq("user_id", user.id)
                .eq("sex", userSex)
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
    }, [user, userSex]);

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
            .eq("sex", userSex)
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
    }, [user, userSex]);

    const loadIntake = useCallback(async (date: string, force = false) => {
        if (!user) return;
        if (!force && intakeLoadedDateRef.current === date) return;
        setIntakeLoading(true);
        const [{ data: entries }, { data: dailyRows }, { data: allIntake }, { data: goalRows }, { data: prof }, { data: bodyStats }, { data: trendRows }, { data: savedFoods }] = await Promise.all([
            supabase
                .from("food_entries")
                .select("id, date, meal_slot, label, kcal, protein_g, carbs_g, fat_g, logged_at")
                .eq("user_id", user.id)
                .eq("sex", userSex)
                .eq("date", date)
                .order("logged_at", { ascending: true }),
            supabase
                .from("daily_intake")
                .select("date")
                .eq("user_id", user.id)
                .eq("sex", userSex)
                .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
            supabase
                .from("daily_intake")
                .select("date, kcal")
                .eq("user_id", user.id)
                .eq("sex", userSex)
                .order("date", { ascending: true }),
            supabase
                .from("user_goals")
                .select("*")
                .eq("user_id", user.id)
                .eq("sex", userSex)
                .eq("is_active", true)
                .limit(1),
            supabase
                .from("profiles")
                .select("date_of_birth")
                .eq("id", user.id)
                .maybeSingle(),
            supabase
                .from("profile_body_stats")
                .select("height_cm, activity_level")
                .eq("user_id", user.id)
                .eq("sex", userSex)
                .maybeSingle(),
            supabase
                .from("weight_trend")
                .select("date, ema_kg")
                .eq("user_id", user.id)
                .eq("sex", userSex)
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
        if (bodyStats?.height_cm && prof?.date_of_birth && bwLatest) {
            const isAdaptive = !!g?.adaptive_mode;
            const baseSummary = getFullCalorieSummary({
                weightKg: bwLatest,
                heightCm: bodyStats.height_cm,
                ageYears: ageFromDOB(prof.date_of_birth),
                sex: userSex as Sex,
                activity: (bodyStats.activity_level as ActivityLevel) ?? "moderate",
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
                    heightCm: bodyStats.height_cm,
                    ageYears: ageFromDOB(prof.date_of_birth),
                    sex: userSex as Sex,
                    activity: (bodyStats.activity_level as ActivityLevel) ?? "moderate",
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
                    sex: userSex,
                    heightCm: bodyStats.height_cm,
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
                heightCm: bodyStats.height_cm,
                ageYears: ageFromDOB(prof.date_of_birth),
                sex: userSex,
                activity: bodyStats.activity_level ?? "moderate",
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
                    setInsightAdaptation(detectAdaptation({ tdeeEstimates: [], sex: userSex as Sex }));
                } catch { setInsightAdaptation(null); }
            }

            const { data: strengthRows } = await supabase
                .from("exercise_set_logs")
                .select("created_at, weight, reps, workout_sessions!inner(sex)")
                .eq("user_id", user!.id)
                .eq("workout_sessions.sex", userSex)
                .gt("weight", 0)
                .order("created_at", { ascending: true })
                .limit(200);
            const strengthData = (strengthRows ?? []).map((r: any) => ({
                date: (r.created_at as string).split("T")[0],
                estimated1rm: Number(r.weight) * (1 + Number(r.reps) / 30),
            }));

            if (trendWeights.length >= 7 && strengthData.length >= 3) {
                try { setInsightLeanMass(assessLeanMassSignal({ weightTrend: trendWeights, strengthData, sex: userSex as Sex })); } catch { setInsightLeanMass(null); }
                if (g?.goal_type === "recomp" || g?.goal_type === "maintain") {
                    try { setInsightRecomp(assessRecomp({ weightTrend: trendWeights, strengthData, sex: userSex as Sex })); } catch { setInsightRecomp(null); }
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
                setInsightRecovery(getRecoveryAdjustment({ tdee: summary.tdee, calorieTarget: summary.calorieTarget, sex: userSex as Sex }));
            } catch { setInsightRecovery(null); }

            try {
                setInsightPatterns(detectPatterns({
                    currentKg: bwLatest,
                    heightCm: bodyStats.height_cm,
                    targetKg: g?.target_weight_kg ? Number(g.target_weight_kg) : null,
                    weightTrend: trendWeights.slice(-14),
                    loggingAdherence: intakeAdherence ?? undefined,
                }));
            } catch { setInsightPatterns([]); }

            // Scenario modeling
            if (g?.target_weight_kg && bwLatest) {
                const sp = { currentKg: bwLatest, targetKg: Number(g.target_weight_kg), tdee: summary.tdee, bmr: summary.bmr, sex: userSex, heightCm: bodyStats.height_cm, goalType: g.goal_type ?? "general_fitness" };
                setScenarioParams(sp);
                try { setInsightScenario(modelScenario(sp)); } catch { setInsightScenario(null); }
            } else {
                setScenarioParams(null);
                setInsightScenario(null);
            }

            // Diet break suggestion
            const deficitWeeks = dailyIntakes.length > 0 ? Math.floor(dailyIntakes.length / 7) : 0;
            const tdeeDrop = insightAdaptation?.detected ? insightAdaptation.tdeeDrop : 0;
            if (shouldSuggestDietBreak({ deficitWeeks, tdeeDrop, adherencePct: intakeAdherence ?? 100, sex: userSex as Sex })) {
                const plan = planDietBreak({ tdee: summary.tdee, currentPhase: (g?.phase as any) ?? "active", deficitWeeks, sex: userSex as Sex });
                setInsightDietBreak(plan.reason);
            } else {
                setInsightDietBreak(null);
            }

            if (userSex === "female" && g?.cycle_tracking_enabled && trendWeights.length >= 7) {
                try {
                    const logs = await fetchCycleLogs(user!.id);
                    const periodStarts = logs.map(l => l.period_start);
                    const cycleLen = computeAdaptiveCycleLength(periodStarts);
                    const lastStart = periodStarts[0] ?? g.cycle_start_date ?? trendWeights[0].date;
                    const { phase } = estimateCyclePhase(lastStart, cycleLen, today);
                    const comparison = comparePhaseToPhase({
                        currentPhase: phase,
                        currentWeightKg: bwLatest,
                        weightHistory: trendWeights.map(w => ({ date: w.date, ema_kg: w.ema_kg })),
                        cycleLength: cycleLen,
                    });
                    setInsightCycle(comparison);
                    setInsightCyclePhaseInfo(getCyclePhaseInfo(phase));
                } catch { setInsightCycle(null); }
            } else {
                setInsightCycle(null);
            }

            // Exercise expenditure (latest session)
            const { data: latestSession } = await supabase
                .from("workout_sessions")
                .select("duration_seconds, total_sets")
                .eq("user_id", user!.id)
                .eq("status", "completed")
                .eq("sex", userSex)
                .order("date", { ascending: false })
                .limit(1);
            if (latestSession?.[0] && bwLatest) {
                try {
                    setInsightExercise(estimateSessionExpenditure({
                        bodyWeightKg: bwLatest,
                        durationSeconds: latestSession[0].duration_seconds,
                        totalSets: latestSession[0].total_sets,
                    }));
                } catch { setInsightExercise(null); }
            } else {
                setInsightExercise(null);
            }
        }
        intakeLoadedDateRef.current = date;
        setIntakeLoading(false);
    }, [user, bodyWeightData, userSex]);

    // Sex is now provided by the shared useSex() hook above.

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            await Promise.all([loadHistory(), loadAchievements(), loadLeaderboardCard(), loadGoals(), loadPRs(), loadBodyWeight(), loadMeasurements(), loadWeeklyVolume()]);
            if (cancelled) return;
            setLoading(false);
        }
        load();
        return () => { cancelled = true; };
    }, [loadHistory, loadAchievements, loadLeaderboardCard, loadGoals, loadPRs, loadBodyWeight, loadMeasurements, loadWeeklyVolume]);

    useEffect(() => {
        if (sessions.length === 0) { setMonthlyInsights(null); return; }
        try {
            setMonthlyInsights(buildMonthlyInsights(sessions.map(s => ({
                date: s.date,
                total_volume: Number(s.total_volume) || 0,
                total_sets: Number(s.total_sets) || 0,
                duration_seconds: s.duration_seconds || 0,
                xp_earned: s.xp_earned || 0,
            }))));
        } catch { setMonthlyInsights(null); }
    }, [sessions]);

    const benchmarkLoadedRef = useRef(false);
    useEffect(() => {
        if (!user || sessions.length === 0) return;
        if (tab !== "history" && tab !== "strength") return;
        if (benchmarkLoadedRef.current) return;
        benchmarkLoadedRef.current = true;
        let cancelled = false;
        async function loadBenchmarkAndPhase() {
            const { data: logs } = await supabase
                .from("exercise_set_logs")
                .select("exercise_id, weight, reps, completed_at, exercises!inner(name, body_segment), workout_sessions!inner(sex)")
                .eq("user_id", user!.id)
                .eq("workout_sessions.sex", userSex)
                .gt("weight", 0)
                .order("completed_at", { ascending: true })
                .limit(2000);
            if (cancelled) return;
            if (logs && logs.length > 0) {
                try {
                    setStrengthBenchmark(buildStrengthBenchmark(logs.map((l: any) => ({
                        exercise_id: l.exercise_id,
                        exercise_name: l.exercises?.name ?? "Unknown",
                        body_segment: l.exercises?.body_segment ?? "Other",
                        weight: Number(l.weight),
                        reps: Number(l.reps),
                        completed_at: l.completed_at,
                    }))));
                } catch { setStrengthBenchmark(null); }
            } else { setStrengthBenchmark(null); }

            if (isFemale && sessions.length >= 4) {
                try {
                    const cycleLogs = await fetchCycleLogs(user!.id);
                    const periodStarts = cycleLogs.map(l => l.period_start);
                    if (periodStarts.length > 0) {
                        const cycleLen = computeAdaptiveCycleLength(periodStarts);
                        const lastStart = periodStarts[0];
                        setPhasePerformance(buildPhasePerformance(
                            sessions.map(s => ({ date: s.date, total_volume: Number(s.total_volume) || 0, total_sets: Number(s.total_sets) || 0, duration_seconds: s.duration_seconds || 0 })),
                            lastStart, cycleLen,
                        ));
                    } else { setPhasePerformance(null); }
                } catch { setPhasePerformance(null); }
            } else { setPhasePerformance(null); }
        }
        loadBenchmarkAndPhase();
        return () => { cancelled = true; };
    }, [user, userSex, isFemale, sessions, tab]);

    useEffect(() => {
        if (tab === "intake") {
            let cancelled = false;
            const force = intakeLoadedDateRef.current !== null && intakeLoadedDateRef.current !== intakeDate;
            loadIntake(intakeDate, force);
            return () => { cancelled = true; };
        }
    }, [tab, intakeDate, loadIntake]);

    async function loadStrengthHistory(exerciseId: string) {
        if (!user) return;
        setStrengthLoading(true);
        setSelectedExercise(exerciseId);
        setEditingGoal(false);
        setGoalInput("");

        const { data } = await supabase
            .from("exercise_set_logs")
            .select("weight, reps, completed_at, workout_sessions!inner(sex)")
            .eq("user_id", user.id)
            .eq("exercise_id", exerciseId)
            .eq("workout_sessions.sex", userSex)
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
        const storedKg = weightInputToKg(rawValue, weightUnit);
        const today = new Date().toISOString().split("T")[0];

        await supabase.from("body_weight_logs").insert({
            user_id: user.id,
            weight: storedKg,
            context: weightContext,
            entered_unit: weightUnit,
            date: today,
            sex: userSex,
        });

        if (weightContext === "morning") {
            await rematerializeWeightTrend(user.id, userSex);
        }

        setNewWeight("");
        await loadBodyWeight();
    }

    function handleScenarioDateChange(days: number) {
        if (!scenarioParams) return;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        try {
            setInsightScenario(modelScenario({ ...scenarioParams, targetDate: targetDate.toISOString().split("T")[0] }));
        } catch { /* ignore */ }
    }

    function handleScenarioTargetChange(kcal: number) {
        if (!scenarioParams) return;
        try {
            setInsightScenario(modelScenario({ ...scenarioParams, dailyTarget: kcal }));
        } catch { /* ignore */ }
    }

    async function handleStartDietBreak() {
        if (!user || !ledgerCalorieSummary) return;
        const plan = planDietBreak({ tdee: ledgerCalorieSummary.tdee, currentPhase: "active", deficitWeeks: 8, sex: (scenarioParams?.sex as Sex) ?? undefined });
        await supabase.from("user_goals").update({ phase: "diet_break" }).eq("user_id", user.id).eq("sex", userSex).eq("is_active", true);
        setInsightDietBreak(null);
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

    // Convert body weight chart data from kg to user's preferred unit
    const displayBodyWeightData = React.useMemo(() =>
        bodyWeightData.map((d) => ({
            ...d,
            weight: Math.round(kgToUnit(d.weight, weightUnit) * 10) / 10,
            ema: d.ema != null ? Math.round(kgToUnit(d.ema, weightUnit) * 10) / 10 : undefined,
        })),
        [bodyWeightData, weightUnit],
    );

    // Convert strength chart data from kg to user's preferred unit
    const displayStrengthHistory = React.useMemo(() =>
        strengthHistory.map((d) => ({
            ...d,
            weight: Math.round(kgToUnit(d.weight, weightUnit) * 10) / 10,
            e1rm: Math.round(kgToUnit(d.e1rm, weightUnit) * 10) / 10,
        })),
        [strengthHistory, weightUnit],
    );

    const TABS: { key: Tab; label: string; icon: any }[] = [
        { key: "intake", label: "INTAKE", icon: Flame },
        { key: "history", label: "HISTORY", icon: Calendar },
        { key: "strength", label: "STRENGTH", icon: Dumbbell },
        { key: "body", label: "BODY", icon: Weight },
    ];

    return (
        <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">

            <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5">
                <SubNavPills pills={getTrackPills(isFemale)} activeKey="/progress" onSelect={(k) => router.push(k)} />

                <div>
                    <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))]">Progress</h1>
                    <p className="text-[11px] text-white/30 mt-0.5">Track your training journey</p>
                </div>

                {/* Tabs */}
                <AnimatedTabs
                    tabs={TABS}
                    activeTab={tab}
                    onTabChange={(k) => setTab(k as Tab)}
                />

                {loading ? (
                    <CubeLoader message="Loading progress…" />
                ) : (
                    <AnimatePresence mode="wait">
                        {/* ══════════ HISTORY ══════════ */}
                        {tab === "history" && (
                            <motion.div key="history" className="space-y-5" variants={tabContent} initial="hidden" animate="visible" exit="exit">
                                {sessions.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                            <Calendar size={28} className="text-white/15" />
                                        </div>
                                        <p className="text-sm font-semibold text-white/25">NO WORKOUTS YET</p>
                                        <p className="text-xs text-white/20 mt-1">Complete your first workout to see history here.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Hero Stats */}
                                        <div
                                            className="relative overflow-hidden rounded-2xl border border-[rgb(var(--accent-rgb)/0.2)] p-5"
                                            style={{ background: "linear-gradient(135deg, rgb(var(--accent-rgb) / 0.12) 0%, rgb(var(--accent-rgb) / 0.03) 60%, transparent 100%)" }}
                                        >
                                            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] blur-[60px]" />
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-[9px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.5)]">TRAINING OVERVIEW</p>
                                                    <div className="flex gap-1">
                                                        {ACTIVITY_RANGES.map((r) => (
                                                            <button
                                                                key={r}
                                                                onClick={() => setActivityRange(r)}
                                                                className={`text-[9px] font-mono px-2 py-1 rounded-md transition ${activityRange === r ? "bg-[rgb(var(--accent-rgb)/0.25)] text-[rgb(var(--accent-light-rgb))]" : "text-white/25 hover:text-white/50"}`}
                                                            >
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-3xl font-bold font-mono text-white/95 leading-none">{rangeWorkoutCount}</p>
                                                        <p className="text-[9px] font-mono text-white/30 mt-1.5">Workouts</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-3xl font-bold font-mono text-white/95 leading-none">{rangeHours.toFixed(1)}</p>
                                                        <p className="text-[9px] font-mono text-white/30 mt-1.5">Hours</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-3xl font-bold font-mono text-[rgb(var(--accent-light-rgb))] leading-none">{(() => { const v = kgToUnit(rangeVolume, weightUnit); return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v); })()}</p>
                                                        <p className="text-[9px] font-mono text-white/30 mt-1.5">Volume ({weightUnit})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Calendar */}
                                        <div className="glass-card rounded-2xl p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <button onClick={() => setCalendarMonthOffset((o) => o - 1)} className="w-7 h-7 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/[0.12] transition">
                                                    <ChevronRight size={14} className="rotate-180" />
                                                </button>
                                                <p className="text-sm font-bold text-white/85 tracking-wide">{calendarBase.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
                                                <button onClick={() => setCalendarMonthOffset((o) => o + 1)} disabled={calendarMonthOffset >= 0} className="w-7 h-7 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/[0.12] disabled:opacity-20 transition">
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                                    <p key={i} className="text-[9px] font-mono text-white/20 py-1">{d}</p>
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
                                                            <span
                                                                className={`w-full h-full flex items-center justify-center rounded-lg text-[11px] font-mono transition-all ${
                                                                    hasWorkout
                                                                        ? "bg-[rgb(var(--accent-rgb)/0.25)] text-[rgb(var(--accent-light-rgb))] font-bold border border-[rgb(var(--accent-rgb)/0.3)]"
                                                                        : "text-white/25"
                                                                } ${isToday ? "ring-1 ring-white/30" : ""}`}
                                                                style={hasWorkout ? { boxShadow: "0 0 8px -2px rgb(var(--accent-rgb) / 0.4)" } : undefined}
                                                            >
                                                                {day}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {(() => {
                                                const monthSessions = sessions.filter(s => {
                                                    const d = new Date(s.date + "T00:00:00");
                                                    return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth;
                                                });
                                                return (
                                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-white/30">
                                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[rgb(var(--accent-rgb)/0.3)] border border-[rgb(var(--accent-rgb)/0.4)]" /> {monthSessions.length} sessions</span>
                                                        <span>{monthSessions.length > 0 ? `${Math.round(kgToUnit(monthSessions.reduce((s, r) => s + (Number(r.total_volume) || 0), 0), weightUnit)).toLocaleString()} ${weightUnit} total` : "No workouts"}</span>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Weekly Volume */}
                                        {weeklyVolumeData.length > 0 && (() => {
                                            const latest = weeklyVolumeData[weeklyVolumeData.length - 1];
                                            const maxVol = Math.max(...weeklyVolumeData.map(w => w.volume));
                                            const prev = weeklyVolumeData.length >= 2 ? weeklyVolumeData[weeklyVolumeData.length - 2] : null;
                                            const volChange = prev && prev.volume > 0 ? Math.round(((latest.volume - prev.volume) / prev.volume) * 100) : 0;
                                            return (
                                                <div className="glass-card rounded-2xl p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[9px] font-mono tracking-[0.2em] text-white/20">WEEKLY VOLUME</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{Math.round(kgToUnit(latest.volume, weightUnit)).toLocaleString()}<span className="text-[9px] text-white/25 ml-0.5">{weightUnit}</span></span>
                                                            {volChange !== 0 && (
                                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${volChange > 0 ? "text-emerald-300 bg-emerald-400/10" : "text-orange-300 bg-orange-400/10"}`}>
                                                                    {volChange > 0 ? "+" : ""}{volChange}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-end gap-[3px] h-20">
                                                        {weeklyVolumeData.slice(-8).map((w, i, arr) => {
                                                            const pct = maxVol > 0 ? Math.max(6, (w.volume / maxVol) * 100) : 6;
                                                            const isCurrent = i === arr.length - 1;
                                                            return (
                                                                <div key={i} className="flex-1 flex flex-col items-center">
                                                                    <div
                                                                        className={`w-full rounded-md transition-all ${isCurrent ? "bg-gradient-to-t from-[rgb(var(--accent-rgb))] to-[rgb(var(--accent-light-rgb))]" : "bg-white/[0.06]"}`}
                                                                        style={{ height: `${pct}%`, ...(isCurrent ? { boxShadow: "0 0 12px -3px rgb(var(--accent-rgb) / 0.5)" } : {}) }}
                                                                    />
                                                                    <p className={`text-[7px] font-mono mt-1.5 ${isCurrent ? "text-[rgb(var(--accent-light-rgb)/0.6)]" : "text-white/15"}`}>
                                                                        {w.week.slice(5)}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Monthly Insights */}
                                        {monthlyInsights && (
                                            <div className="glass-card rounded-2xl p-4">
                                                <p className="text-[9px] font-mono tracking-[0.2em] text-white/20 mb-3">MONTHLY INSIGHTS</p>
                                                <div className="grid grid-cols-3 gap-3 mb-4">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold font-mono text-white/90">{monthlyInsights.current.workouts}</p>
                                                        <p className="text-[9px] font-mono text-white/30">Workouts</p>
                                                        {monthlyInsights.frequencyChange !== null && (
                                                            <p className={`text-[9px] font-mono mt-0.5 ${monthlyInsights.frequencyChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                                {monthlyInsights.frequencyChange >= 0 ? "+" : ""}{monthlyInsights.frequencyChange}%
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{(() => { const v = kgToUnit(monthlyInsights.current.totalVolume, weightUnit); return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v); })()}</p>
                                                        <p className="text-[9px] font-mono text-white/30">Volume ({weightUnit})</p>
                                                        {monthlyInsights.volumeChange !== null && (
                                                            <p className={`text-[9px] font-mono mt-0.5 ${monthlyInsights.volumeChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                                {monthlyInsights.volumeChange >= 0 ? "+" : ""}{monthlyInsights.volumeChange}%
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold font-mono text-white/90">{monthlyInsights.current.prsHit}</p>
                                                        <p className="text-[9px] font-mono text-white/30">PRs Hit</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-[9px] font-mono text-white/25 border-t border-white/[0.04] pt-3">
                                                    <span className="flex items-center gap-1"><Flame size={10} className="text-orange-400" /> {monthlyInsights.streak} month streak</span>
                                                    {monthlyInsights.current.uniqueExercises > 0 && (
                                                        <span>{monthlyInsights.current.uniqueExercises} exercises</span>
                                                    )}
                                                    {monthlyInsights.durationChange !== null && (
                                                        <span>Avg {Math.round(monthlyInsights.current.avgDuration / 60)}min</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Phase Performance (female only) */}
                                        {isFemale && phasePerformance && (
                                            <div className="glass-card rounded-2xl p-4">
                                                <p className="text-[9px] font-mono tracking-[0.2em] text-pink-300/50 mb-3">CYCLE PHASE PERFORMANCE</p>
                                                <div className="grid grid-cols-4 gap-2 mb-3">
                                                    {phasePerformance.phases.map((p) => (
                                                        <div key={p.phase} className="text-center">
                                                            <div className="w-full h-16 rounded-lg relative overflow-hidden mb-1" style={{ background: `${p.color}15`, border: `1px solid ${p.color}30` }}>
                                                                <div className="absolute bottom-0 w-full transition-all" style={{
                                                                    height: `${phasePerformance.bestPhase ? Math.round((p.avgVolume / phasePerformance.bestPhase.avgVolume) * 100) : 100}%`,
                                                                    background: `${p.color}30`,
                                                                }} />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <p className="text-xs font-bold font-mono" style={{ color: p.color }}>{p.workouts}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-[8px] font-mono text-white/30">{p.label.slice(0, 3).toUpperCase()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {phasePerformance.recommendation && (
                                                    <p className="text-[10px] text-white/40 leading-relaxed">{phasePerformance.recommendation}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Session List — grouped by date */}
                                        <div>
                                            <p className="text-[9px] font-mono tracking-[0.2em] text-white/20 mb-3">WORKOUT LOG</p>
                                            {(() => {
                                                const now = new Date();
                                                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);
                                                const monthAgo = new Date(todayStart.getTime() - 30 * 86400000);

                                                const groups: { label: string; items: SessionRecord[] }[] = [];
                                                const today: SessionRecord[] = [];
                                                const thisWeek: SessionRecord[] = [];
                                                const thisMonth: SessionRecord[] = [];
                                                const earlier: SessionRecord[] = [];

                                                sessions.forEach((s) => {
                                                    const d = new Date(s.date + "T00:00:00");
                                                    if (d >= todayStart) today.push(s);
                                                    else if (d >= weekAgo) thisWeek.push(s);
                                                    else if (d >= monthAgo) thisMonth.push(s);
                                                    else earlier.push(s);
                                                });

                                                if (today.length) groups.push({ label: "Today", items: today });
                                                if (thisWeek.length) groups.push({ label: "This Week", items: thisWeek });
                                                if (thisMonth.length) groups.push({ label: "This Month", items: thisMonth });
                                                if (earlier.length) groups.push({ label: "Earlier", items: earlier.slice(0, 20) });

                                                return (
                                                    <div className="space-y-4">
                                                        {groups.map((group) => (
                                                            <div key={group.label}>
                                                                <p className="text-[8px] font-mono tracking-widest text-white/15 mb-2">{group.label.toUpperCase()}</p>
                                                                <div className="space-y-1.5">
                                                                    {group.items.map((s) => (
                                                                        <div key={s.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] px-3.5 py-3 transition-all">
                                                                            <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.15)] flex items-center justify-center shrink-0" style={{ boxShadow: "0 0 10px -4px rgb(var(--accent-rgb) / 0.3)" }}>
                                                                                <Dumbbell size={15} className="text-[rgb(var(--accent-light-rgb))]" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[13px] font-bold text-white/90 truncate">{s.title || "Workout"}</p>
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <span className="text-[10px] font-mono text-white/25">{formatDate(s.date)}</span>
                                                                                    <span className="w-0.5 h-0.5 rounded-full bg-white/15" />
                                                                                    <span className="text-[10px] font-mono text-white/25">{formatDuration(s.duration_seconds || 0)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2.5 shrink-0">
                                                                                <div className="text-right">
                                                                                    <p className="text-[11px] font-mono text-white/60">{s.total_sets} sets</p>
                                                                                    <p className="text-[10px] font-mono text-white/25">{Math.round(kgToUnit(Number(s.total_volume) || 0, weightUnit)).toLocaleString()} {weightUnit}</p>
                                                                                </div>
                                                                                <div className="px-2 py-1 rounded-lg bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.15)]">
                                                                                    <p className="text-[10px] font-mono font-bold text-[rgb(var(--accent-light-rgb))]">+{s.xp_earned}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* ══════════ STRENGTH ══════════ */}
                        {tab === "strength" && (
                            <motion.div key="strength" className="space-y-4" variants={tabContent} initial="hidden" animate="visible" exit="exit">
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
                                                                    <p className="text-sm font-bold font-mono text-white/90">{Math.round(kgToUnit(pr.best_weight, weightUnit) * 10) / 10}<span className="text-[10px] text-white/40">{weightUnit}</span> × {pr.best_reps_at_weight}</p>
                                                                    <p className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.6)]">e1RM: {Math.round(kgToUnit(pr.estimated_1rm, weightUnit) * 10) / 10}{weightUnit}</p>
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
                                                                                <span className="text-sm font-bold font-mono text-white/80">{goals[pr.exercise_id] ? `${Math.round(kgToUnit(goals[pr.exercise_id], weightUnit) * 10) / 10}${weightUnit}` : "— —"}</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[8px] font-mono text-white/30 mb-0.5">CURRENT MAX</p>
                                                                        <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{Math.round(kgToUnit(pr.best_weight, weightUnit) * 10) / 10}<span className="text-xs text-white/40">{weightUnit}</span></p>
                                                                    </div>
                                                                </div>
                                                                {strengthLoading ? (
                                                                    <p className="text-xs text-white/40 text-center py-4">Loading chart...</p>
                                                                ) : strengthHistory.length < 2 ? (
                                                                    <p className="text-xs text-white/30 text-center py-4">Need at least 2 sessions to show a trend.</p>
                                                                ) : (
                                                                    <div className="h-48">
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                            <LineChart data={displayStrengthHistory}>
                                                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                                                <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} domain={["auto", "auto"]} />
                                                                                <Tooltip content={<CustomTooltip />} />
                                                                                <Line
                                                                                    type="monotone" dataKey="weight" stroke="rgb(var(--accent-rgb))" strokeWidth={2} name={`Weight (${weightUnit})`}
                                                                                    dot={(dotProps: any) => {
                                                                                        const { cx, cy, payload, index } = dotProps;
                                                                                        const maxWeight = Math.max(...displayStrengthHistory.map((p) => p.weight));
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

                                {/* Strength Benchmark */}
                                {strengthBenchmark && (
                                    <div className="glass-card rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[9px] font-mono tracking-[0.2em] text-white/20">STRENGTH BENCHMARK</p>
                                            <p className="text-[9px] font-mono text-white/20">{strengthBenchmark.period}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <span className="text-emerald-400">{strengthBenchmark.totalUp} up</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                                <span className="w-2 h-2 rounded-full bg-white/20" />
                                                <span className="text-white/30">{strengthBenchmark.totalStable} stable</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                                <span className="text-red-400">{strengthBenchmark.totalDown} down</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            {strengthBenchmark.exercises.slice(0, 8).map((ex) => (
                                                <div key={ex.exerciseId} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2">
                                                    <div className={`w-1.5 h-8 rounded-full ${ex.trend === "up" ? "bg-emerald-400" : ex.trend === "down" ? "bg-red-400" : "bg-white/15"}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-white/80 truncate">{ex.exerciseName}</p>
                                                        <p className="text-[9px] font-mono text-white/25">{ex.bodySegment}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[11px] font-bold font-mono text-white/80">{Math.round(kgToUnit(ex.currentE1rm, weightUnit))}<span className="text-[9px] text-white/30">{weightUnit}</span></p>
                                                        <p className={`text-[9px] font-mono ${ex.changePercent > 0 ? "text-emerald-400" : ex.changePercent < 0 ? "text-red-400" : "text-white/25"}`}>
                                                            {ex.changePercent > 0 ? "+" : ""}{ex.changePercent}%
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {strengthBenchmark.strongestGain && (
                                            <p className="text-[10px] text-white/30 mt-3 border-t border-white/[0.04] pt-3">
                                                Biggest gain: <span className="text-emerald-400 font-bold">{strengthBenchmark.strongestGain.exerciseName}</span> +{strengthBenchmark.strongestGain.changePercent}%
                                            </p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ══════════ BODY ══════════ */}
                        {tab === "body" && (
                            <motion.div key="body" className="space-y-4" variants={tabContent} initial="hidden" animate="visible" exit="exit">
                                {/* Measurements */}
                                <div className="glass-card p-4">
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
                                        <span className="shrink-0 text-[10px] font-mono px-3 py-3 text-white/40">{weightUnit.toUpperCase()}</span>
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
                                                <LineChart data={displayBodyWeightData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} domain={["auto", "auto"]} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line type="monotone" dataKey="weight" stroke="rgba(255,255,255,0.2)" strokeWidth={1} dot={{ r: 2.5, fill: "rgba(255,255,255,0.15)", strokeWidth: 0 }} name={`Raw (${weightUnit})`} activeDot={{ r: 4, fill: "rgba(255,255,255,0.4)" }} />
                                                    {bodyWeightData.some((d) => d.ema) && (
                                                        <Line type="monotone" dataKey="ema" stroke="#22d3ee" strokeWidth={2.5} dot={false} name={`Trend (${weightUnit})`} connectNulls />
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
                                {displayBodyWeightData.length > 0 && (() => {
                                    const latest = displayBodyWeightData[displayBodyWeightData.length - 1];
                                    const trendEntries = displayBodyWeightData.filter((d) => d.ema !== undefined);
                                    const trendStart = trendEntries.length >= 2 ? trendEntries[0].ema! : null;
                                    const trendEnd = trendEntries.length >= 2 ? trendEntries[trendEntries.length - 1].ema! : null;
                                    const trendChange = trendStart !== null && trendEnd !== null ? Math.round((trendEnd - trendStart) * 10) / 10 : null;
                                    const weeklyRate = trendEntries.length >= 7 && trendStart !== null && trendEnd !== null
                                        ? Math.round(((trendEnd - trendStart) / (trendEntries.length / 7)) * 10) / 10
                                        : null;
                                    const unitLabel = weightUnit.toUpperCase();

                                    return (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="glass-card p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">CURRENT</p>
                                                <p className="text-lg font-bold font-mono text-white/90">{latest.weight} <span className="text-xs text-white/30">{unitLabel}</span></p>
                                            </div>
                                            <div className="glass-card p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">{trendEnd !== null ? "TREND" : "LOWEST"}</p>
                                                {trendEnd !== null ? (
                                                    <p className="text-lg font-bold font-mono text-cyan-300">{trendEnd} <span className="text-xs text-white/30">{unitLabel}</span></p>
                                                ) : (
                                                    <p className="text-lg font-bold font-mono text-emerald-300">{Math.min(...displayBodyWeightData.map((d) => d.weight))} <span className="text-xs text-white/30">{unitLabel}</span></p>
                                                )}
                                            </div>
                                            <div className="glass-card p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">{weeklyRate !== null ? "/WEEK" : "CHANGE"}</p>
                                                {weeklyRate !== null ? (
                                                    <p className={`text-lg font-bold font-mono ${weeklyRate > 0 ? "text-orange-300" : weeklyRate < 0 ? "text-emerald-300" : "text-white/50"}`}>{weeklyRate > 0 ? "+" : ""}{weeklyRate} <span className="text-xs text-white/30">{unitLabel}</span></p>
                                                ) : displayBodyWeightData.length >= 2 ? (() => {
                                                    const change = Math.round((latest.weight - displayBodyWeightData[0].weight) * 10) / 10;
                                                    return <p className={`text-lg font-bold font-mono ${change > 0 ? "text-orange-300" : change < 0 ? "text-emerald-300" : "text-white/50"}`}>{change > 0 ? "+" : ""}{change} <span className="text-xs text-white/30">{unitLabel}</span></p>;
                                                })() : <p className="text-lg font-bold font-mono text-white/30">—</p>}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}

                        {/* ══════════ INTAKE ══════════ */}
                        {tab === "intake" && (
                            <motion.div key="intake" className="space-y-4" variants={tabContent} initial="hidden" animate="visible" exit="exit">
                                {/* Date selector — always visible */}
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

                                {intakeLoading && (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="glass-card p-4 space-y-3">
                                            <div className="h-3 w-28 rounded bg-white/[0.06]" />
                                            <div className="h-8 w-24 mx-auto rounded bg-white/[0.06]" />
                                            <div className="h-3 rounded-full bg-white/[0.04]" />
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="h-10 rounded-md bg-white/[0.04]" />
                                                <div className="h-10 rounded-md bg-white/[0.04]" />
                                                <div className="h-10 rounded-md bg-white/[0.04]" />
                                            </div>
                                        </div>
                                        <div className="glass-card p-4 space-y-3">
                                            <div className="h-3 w-20 rounded bg-white/[0.06]" />
                                            <div className="h-24 rounded-md bg-white/[0.04]" />
                                        </div>
                                    </div>
                                )}

                                {!intakeLoading && (<>
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
                                        contextParts.push(`on pace to ${weightDelta < 0 ? "lose" : "gain"} ~${avgPerWeek} ${weightUnit}/week`);
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
                                                        ~{avgPerWeek} {weightUnit}/{weightDelta < 0 ? "lost" : "gained"}
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
                                                <div className="mb-3 rounded-md bg-white/[0.02] border border-white/[0.04] p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-[8px] font-mono text-white/25">DAILY NET (last {sparkData.length}d)</p>
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="flex items-center gap-1 text-[7px] font-mono text-white/25">
                                                                <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: "rgb(110, 231, 183)" }} /> Under
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[7px] font-mono text-white/25">
                                                                <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: "rgb(252, 211, 77)" }} /> Over
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ResponsiveContainer width="100%" height={110}>
                                                        <BarChart data={sparkData} margin={{ top: 16, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
                                                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                                            <Bar dataKey="net" radius={[3, 3, 3, 3]} isAnimationActive={false} maxBarSize={22}>
                                                                {sparkData.map((d, i) => (
                                                                    <Cell key={i} fill={d.net <= 0 ? "rgb(110, 231, 183)" : "rgb(252, 211, 77)"} fillOpacity={0.7} />
                                                                ))}
                                                                <LabelList
                                                                    dataKey="net"
                                                                    content={(props: any) => {
                                                                        const { x, y, width, height, value } = props;
                                                                        const label = Math.abs(value) >= 1000 ? `${value > 0 ? "+" : ""}${(value / 1000).toFixed(1)}k` : `${value > 0 ? "+" : ""}${value}`;
                                                                        const ty = value <= 0 ? y + height + 10 : y - 4;
                                                                        return (
                                                                            <text x={x + width / 2} y={ty} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="rgba(255,255,255,0.45)">
                                                                                {label}
                                                                            </text>
                                                                        );
                                                                    }}
                                                                />
                                                            </Bar>
                                                            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} interval={sparkData.length > 10 ? 1 : 0} />
                                                            <Tooltip
                                                                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                                                contentStyle={{ background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 10, fontFamily: "monospace", padding: "6px 10px" }}
                                                                labelStyle={{ color: "rgba(255,255,255,0.4)", marginBottom: 2 }}
                                                                itemStyle={{ padding: 0 }}
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
                                                            <p className="text-lg font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{Math.round(kgToUnit(projectedKg, weightUnit) * 10) / 10} <span className="text-xs text-white/30">{weightUnit}</span></p>
                                                            <p className="text-[8px] font-mono text-white/20">target: {Math.round(kgToUnit(Number(ledgerGoal!.targetWeightKg!), weightUnit) * 10) / 10} {weightUnit}</p>
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
                                                <p className="text-[8px] font-mono text-white/20 mt-0.5">at {Math.round(kgToUnit(feasibility.safeRateKgWeek, weightUnit) * 100) / 100} {weightUnit}/week safe rate</p>
                                            </div>
                                        )}
                                        {feasibility.feasible && feasibility.requiredRateKgWeek > 0 && (
                                            <p className="text-[8px] font-mono text-white/20">Required rate: {Math.round(kgToUnit(feasibility.requiredRateKgWeek, weightUnit) * 100) / 100} {weightUnit}/week · Safe max: {Math.round(kgToUnit(feasibility.safeRateKgWeek, weightUnit) * 100) / 100} {weightUnit}/week</p>
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
                                    <div className="glass-card p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-mono tracking-widest text-white/25">ADAPTIVE MODE</p>
                                            <button
                                                onClick={async () => {
                                                    if (!user) return;
                                                    const next = !adaptiveMode;
                                                    setAdaptiveMode(next);
                                                    await supabase.from("user_goals").update({ adaptive_mode: next, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("sex", userSex).eq("is_active", true);
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
                                <div className="glass-card p-4 space-y-3">
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
                                                sex: userSex,
                                            });
                                            await rematerializeDailyIntake(user.id, intakeDate, userSex);
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
                                            await loadIntake(intakeDate, true);
                                        }}
                                        disabled={!intakeKcal}
                                        className="w-full text-[10px] font-mono py-3 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        LOG ENTRY
                                    </button>
                                </div>

                                {/* My Foods — quick relog */}
                                {myFoods.length > 0 && (
                                    <div className="glass-card p-4">
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
                                                            sex: userSex,
                                                        });
                                                        await rematerializeDailyIntake(user.id, intakeDate, userSex);
                                                        await supabase.from("my_foods").update({ use_count: food.use_count + 1, last_used_at: new Date().toISOString() }).eq("id", food.id);
                                                        await loadIntake(intakeDate, true);
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
                                    <div className="glass-card p-4 space-y-2">
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
                                                        await rematerializeDailyIntake(user.id, intakeDate, userSex);
                                                        await loadIntake(intakeDate, true);
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
                                {(insightBudget || insightPrediction || insightAnomaly || insightAdaptation || insightLeanMass || insightRecovery || insightRecomp || insightPatterns.length > 0 || insightScenario || insightDietBreak || insightCycle || insightExercise) && (
                                    <div className="space-y-3 mt-4">
                                        <p className="text-[10px] font-mono tracking-widest text-white/25">INSIGHTS</p>
                                        {insightPatterns.length > 0 && <PatternWarningsCard warnings={insightPatterns} />}
                                        {insightDietBreak && <DietBreakCard onStart={handleStartDietBreak} suggestion={insightDietBreak} />}
                                        {insightBudget && <WeeklyBudgetCard data={insightBudget} />}
                                        {insightExercise && <ExerciseExpenditureCard data={insightExercise} adaptiveMode={adaptiveMode} />}
                                        {insightRecovery && <RecoveryCard data={insightRecovery} />}
                                        {insightAnomaly && <AnomalyCard data={insightAnomaly} />}
                                        {insightPrediction && <PredictionVsRealityCard data={insightPrediction} />}
                                        {insightAdaptation && <AdaptationCard data={insightAdaptation} />}
                                        {insightLeanMass && <LeanMassCard data={insightLeanMass} />}
                                        {insightRecomp && <RecompCard data={insightRecomp} />}
                                        {insightCycle && <CycleCard data={insightCycle} phaseInfo={insightCyclePhaseInfo} />}
                                        {insightScenario && <ScenarioCard scenario={insightScenario} onDateChange={handleScenarioDateChange} onTargetChange={handleScenarioTargetChange} />}
                                    </div>
                                )}
                                </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
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