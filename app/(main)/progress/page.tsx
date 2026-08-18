"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Dumbbell, TrendingUp, Weight, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

type Tab = "history" | "strength" | "body" | "volume";

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
};

type WeeklyVolume = {
    week: string;
    volume: number;
    sets: number;
};

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
        <div className="rounded-lg border border-cyan-400/20 bg-[#0a1120]/95 backdrop-blur-xl px-3 py-2 text-[10px] font-mono">
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

    // Strength
    const [prs, setPrs] = useState<ExercisePR[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [strengthHistory, setStrengthHistory] = useState<StrengthDataPoint[]>([]);
    const [strengthLoading, setStrengthLoading] = useState(false);

    // Body
    const [bodyWeightData, setBodyWeightData] = useState<BodyWeightEntry[]>([]);
    const [newWeight, setNewWeight] = useState("");

    // Volume
    const [weeklyVolumeData, setWeeklyVolumeData] = useState<WeeklyVolume[]>([]);

    const loadHistory = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("workout_sessions")
            .select("id, date, title, duration_seconds, total_sets, total_volume, xp_earned")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("date", { ascending: false })
            .limit(50);
        setSessions(data ?? []);
    }, [user]);

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
        const { data } = await supabase
            .from("body_weight_logs")
            .select("weight, logged_at")
            .eq("user_id", user.id)
            .order("logged_at", { ascending: true })
            .limit(90);
        setBodyWeightData((data ?? []).map((d: any, i: number) => ({
            weight: Number(d.weight),
            date: new Date(d.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        })));
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

    useEffect(() => {
        async function load() {
            setLoading(true);
            await Promise.all([loadHistory(), loadPRs(), loadBodyWeight(), loadWeeklyVolume()]);
            setLoading(false);
        }
        load();
    }, [loadHistory, loadPRs, loadBodyWeight, loadWeeklyVolume]);

    async function loadStrengthHistory(exerciseId: string) {
        if (!user) return;
        setStrengthLoading(true);
        setSelectedExercise(exerciseId);

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
        await supabase.from("body_weight_logs").insert({
            user_id: user.id,
            weight: Number(newWeight),
            context: "manual",
        });
        setNewWeight("");
        await loadBodyWeight();
    }

    const totalVolume = sessions.reduce((s, r) => s + (Number(r.total_volume) || 0), 0);
    const totalSets = sessions.reduce((s, r) => s + (r.total_sets || 0), 0);

    const TABS: { key: Tab; label: string; icon: any }[] = [
        { key: "history", label: "HISTORY", icon: Calendar },
        { key: "strength", label: "STRENGTH", icon: Dumbbell },
        { key: "body", label: "BODY", icon: Weight },
        { key: "volume", label: "VOLUME", icon: TrendingUp },
    ];

    return (
        <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
            <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />

            <div className="relative z-10 w-full max-w-3xl mx-auto space-y-5">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white/90">Progress</h1>
                    <p className="text-white/40 text-sm mt-0.5">Track your training journey.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 text-[10px] font-mono px-3 sm:px-4 py-2 rounded-lg border shrink-0 transition ${tab === t.key ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"
                                }`}
                        >
                            <t.icon size={12} /> {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ══════════ HISTORY ══════════ */}
                        {tab === "history" && (
                            <div className="space-y-4">
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                        <p className="text-[8px] font-mono text-white/30">SESSIONS</p>
                                        <p className="text-xl font-bold font-mono text-white/90">{sessions.length}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                        <p className="text-[8px] font-mono text-white/30">TOTAL SETS</p>
                                        <p className="text-xl font-bold font-mono text-white/90">{totalSets.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                        <p className="text-[8px] font-mono text-white/30">TOTAL VOLUME</p>
                                        <p className="text-xl font-bold font-mono text-cyan-300">{Math.round(totalVolume).toLocaleString()} <span className="text-xs text-white/30">KG</span></p>
                                    </div>
                                </div>

                                {/* Session list */}
                                {sessions.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Calendar size={32} className="mx-auto mb-3 text-white/15" />
                                        <p className="text-sm font-bold tracking-widest text-white/30">NO WORKOUTS YET</p>
                                        <p className="text-xs text-white/20 mt-1">Complete your first workout to see history here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {sessions.map((s) => (
                                            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                                                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                                                    <Dumbbell size={16} className="text-cyan-300" />
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
                                                        <p className="text-[8px] font-mono text-cyan-300/50">XP</p>
                                                        <p className="text-xs font-mono text-cyan-300">+{s.xp_earned}</p>
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
                                    <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">PERSONAL RECORDS</p>
                                    {prs.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Trophy size={32} className="mx-auto mb-3 text-white/15" />
                                            <p className="text-sm font-bold tracking-widest text-white/30">NO PRs YET</p>
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
                                                            className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${isSelected ? "border-cyan-400/30 bg-cyan-400/[0.05]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                                                                }`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-white/90 truncate">{pr.exercise_name}</p>
                                                                <p className="text-[10px] font-mono text-white/30">{pr.body_segment} · {formatDate(pr.date)}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-bold font-mono text-white/90">{pr.best_weight}<span className="text-[10px] text-white/40">kg</span> × {pr.best_reps_at_weight}</p>
                                                                    <p className="text-[9px] font-mono text-cyan-300/60">e1RM: {pr.estimated_1rm}kg</p>
                                                                </div>
                                                                {isSelected ? <ChevronDown size={14} className="text-cyan-300" /> : <ChevronRight size={14} className="text-white/25" />}
                                                            </div>
                                                        </button>

                                                        {isSelected && (
                                                            <div className="rounded-b-lg border border-t-0 border-cyan-400/20 bg-cyan-400/[0.02] p-4">
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
                                                                                <Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} name="Weight (kg)" />
                                                                                <Line type="monotone" dataKey="e1rm" stroke="#a5f3fc" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Est. 1RM" />
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
                                {/* Log weight */}
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">LOG BODY WEIGHT</p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            inputMode="decimal"
                                            onWheel={(e) => (e.target as HTMLElement).blur()}
                                            value={newWeight}
                                            onChange={(e) => setNewWeight(e.target.value)}
                                            placeholder="—"
                                            className="flex-1 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-xl font-bold font-mono focus:outline-none focus:border-cyan-400/40 transition"
                                        />
                                        <span className="text-sm font-mono text-white/30">KG</span>
                                        <button
                                            onClick={logBodyWeight}
                                            disabled={!newWeight}
                                            className="text-[10px] font-mono px-4 py-3 rounded-lg border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        >
                                            LOG
                                        </button>
                                    </div>
                                </div>

                                {/* Weight chart */}
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">WEIGHT TREND</p>
                                    {bodyWeightData.length < 2 ? (
                                        <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                                            <p className="text-xs font-mono text-white/30 text-center px-4">
                                                {bodyWeightData.length === 0 ? "No weight logs yet." : "Need at least 2 entries to show a trend."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="h-52">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={bodyWeightData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} />
                                                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} domain={["auto", "auto"]} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} name="Weight (kg)" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Latest stats */}
                                {bodyWeightData.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                            <p className="text-[8px] font-mono text-white/30">CURRENT</p>
                                            <p className="text-lg font-bold font-mono text-white/90">{bodyWeightData[bodyWeightData.length - 1].weight} <span className="text-xs text-white/30">KG</span></p>
                                        </div>
                                        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                            <p className="text-[8px] font-mono text-white/30">LOWEST</p>
                                            <p className="text-lg font-bold font-mono text-emerald-300">{Math.min(...bodyWeightData.map((d) => d.weight))} <span className="text-xs text-white/30">KG</span></p>
                                        </div>
                                        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                            <p className="text-[8px] font-mono text-white/30">CHANGE</p>
                                            {bodyWeightData.length >= 2 ? (() => {
                                                const change = Number((bodyWeightData[bodyWeightData.length - 1].weight - bodyWeightData[0].weight).toFixed(1));
                                                return <p className={`text-lg font-bold font-mono ${change > 0 ? "text-orange-300" : change < 0 ? "text-emerald-300" : "text-white/50"}`}>{change > 0 ? "+" : ""}{change} <span className="text-xs text-white/30">KG</span></p>;
                                            })() : <p className="text-lg font-bold font-mono text-white/30">—</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ VOLUME ══════════ */}
                        {tab === "volume" && (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">WEEKLY VOLUME (KG)</p>
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
                                                    <Bar dataKey="volume" fill="rgba(34,211,238,0.6)" radius={[4, 4, 0, 0]} name="Volume (kg)" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                                    <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">WEEKLY SETS</p>
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
                                                <p className={`text-lg font-bold font-mono ${volChange > 0 ? "text-cyan-300" : volChange < 0 ? "text-orange-300" : "text-white/50"}`}>
                                                    {volChange > 0 ? "+" : ""}{volChange.toLocaleString()} <span className="text-xs text-white/30">KG</span>
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
                                                <p className="text-[8px] font-mono text-white/30">SETS VS LAST WEEK</p>
                                                <p className={`text-lg font-bold font-mono ${setChange > 0 ? "text-cyan-300" : setChange < 0 ? "text-orange-300" : "text-white/50"}`}>
                                                    {setChange > 0 ? "+" : ""}{setChange} <span className="text-xs text-white/30">SETS</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}