"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Save, Plus, Trash2, Check, Download, AlertTriangle, Eye, EyeOff, Target, Dumbbell, Scale, Ruler, Calendar, Clock, Shield, Heart, AtSign, Globe } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import CustomSelect from "../../components/CustomSelect";
import { GOAL_OPTIONS } from "../../lib/goals";

type ProfileData = {
    goal: string;
    height_cm: number | null;
    target_weight: number | null;
    experience: string;
    training_frequency: number;
    date_of_birth: string | null;
    unit_preference: string;
    workout_time_pref: string | null;
    injury_notes: string | null;
    social_instagram: string | null;
    social_twitter: string | null;
    profile_visibility: string;
    avatar_color: string;
};

type TargetLift = {
    id: string;
    exercise_id: string;
    exercise_name: string;
    target_weight: number;
    achieved: boolean;
    achieved_at: string | null;
};

type Section = "stats" | "goals" | "training" | "social" | "preferences" | "data";

const AVATAR_COLORS = ["#22d3ee", "#34d399", "#a78bfa", "#f97316", "#ef4444", "#f59e0b", "#ec4899", "#6366f1"];

const DEFAULT_PROFILE: ProfileData = {
    goal: "", height_cm: null, target_weight: null, experience: "beginner",
    training_frequency: 5, date_of_birth: null, unit_preference: "metric",
    workout_time_pref: null, injury_notes: null, social_instagram: null,
    social_twitter: null, profile_visibility: "public", avatar_color: "#22d3ee",
};

export default function ProfilePage() {
    const { profile, user } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<ProfileData>(DEFAULT_PROFILE);
    const [targetLifts, setTargetLifts] = useState<TargetLift[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [section, setSection] = useState<Section>("stats");
    const [exercises, setExercises] = useState<{ id: string; name: string }[]>([]);
    const [newLiftExercise, setNewLiftExercise] = useState("");
    const [newLiftWeight, setNewLiftWeight] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [latestWeight, setLatestWeight] = useState<number | null>(null);
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);

    const loadProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data: p } = await supabase
            .from("profiles")
            .select("goal, height_cm, target_weight, experience, training_frequency, date_of_birth, unit_preference, workout_time_pref, injury_notes, social_instagram, social_twitter, profile_visibility, avatar_color")
            .eq("id", user.id)
            .maybeSingle();

        if (p) {
            setData({
                goal: p.goal ?? "",
                height_cm: p.height_cm,
                target_weight: p.target_weight,
                experience: p.experience ?? "beginner",
                training_frequency: p.training_frequency ?? 5,
                date_of_birth: p.date_of_birth,
                unit_preference: p.unit_preference ?? "metric",
                workout_time_pref: p.workout_time_pref,
                injury_notes: p.injury_notes,
                social_instagram: p.social_instagram,
                social_twitter: p.social_twitter,
                profile_visibility: p.profile_visibility ?? "public",
                avatar_color: p.avatar_color ?? "#22d3ee",
            });
        }

        // Target lifts
        const { data: lifts } = await supabase
            .from("target_lifts")
            .select("id, exercise_id, target_weight, achieved, achieved_at, exercises(name)")
            .eq("user_id", user.id)
            .order("created_at");
        setTargetLifts((lifts ?? []).map((l: any) => ({
            id: l.id, exercise_id: l.exercise_id, target_weight: l.target_weight,
            achieved: l.achieved, achieved_at: l.achieved_at,
            exercise_name: l.exercises?.name ?? "Unknown",
        })));

        // Exercises for dropdown
        const { data: exList } = await supabase.from("exercises").select("id, name").order("name").limit(500);
        setExercises(exList ?? []);

        // Latest body weight
        const { data: bw } = await supabase.from("body_weight_logs").select("weight").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(1);
        setLatestWeight(bw?.[0]?.weight ?? null);

        // Summary stats
        const { data: sessions } = await supabase.from("workout_sessions").select("total_volume").eq("user_id", user.id).eq("status", "completed");
        setTotalSessions((sessions ?? []).length);
        setTotalVolume((sessions ?? []).reduce((s, r: any) => s + (Number(r.total_volume) || 0), 0));

        setLoading(false);
    }, [user]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    function updateField(field: keyof ProfileData, value: any) {
        setData((prev) => ({ ...prev, [field]: value }));
    }

    async function saveProfile() {
        if (!user) return;
        setSaving(true);
        await supabase.from("profiles").update({
            goal: data.goal || null,
            height_cm: data.height_cm,
            target_weight: data.target_weight,
            experience: data.experience,
            training_frequency: data.training_frequency,
            date_of_birth: data.date_of_birth || null,
            unit_preference: data.unit_preference,
            workout_time_pref: data.workout_time_pref || null,
            injury_notes: data.injury_notes || null,
            social_instagram: data.social_instagram || null,
            social_twitter: data.social_twitter || null,
            profile_visibility: data.profile_visibility,
            avatar_color: data.avatar_color,
        }).eq("id", user.id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    }

    async function addTargetLift() {
        if (!user || !newLiftExercise || !newLiftWeight) return;
        await supabase.from("target_lifts").insert({
            user_id: user.id,
            exercise_id: newLiftExercise,
            target_weight: Number(newLiftWeight),
        });
        setNewLiftExercise("");
        setNewLiftWeight("");
        await loadProfile();
    }

    async function deleteTargetLift(id: string) {
        await supabase.from("target_lifts").delete().eq("id", id);
        setTargetLifts((prev) => prev.filter((l) => l.id !== id));
    }

    function csvField(v: any): string {
        const s = v === null || v === undefined ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`;
    }

    async function exportData() {
        if (!user) return;

        const { data: sessions } = await supabase
            .from("workout_sessions")
            .select("id, date, title, duration_seconds, total_sets, total_volume, xp_earned, started_at, completed_at")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("date");

        if (!sessions?.length) { alert("No data to export."); return; }

        const sessionIds = sessions.map((s: any) => s.id);
        const { data: setLogs } = await supabase
            .from("exercise_set_logs")
            .select("workout_session_id, weight, reps, duration_seconds, distance, set_index, completed_at, exercises(name, body_segment)")
            .in("workout_session_id", sessionIds)
            .order("completed_at");

        const { data: weightLogs } = await supabase
            .from("body_weight_logs")
            .select("weight, logged_at, context")
            .eq("user_id", user.id)
            .order("logged_at");

        const sessionsSection = [
            "=== WORKOUT SESSIONS ===",
            "Date,Day,Title,Duration (min),Sets,Volume (kg),XP,Start Time,End Time",
            ...sessions.map((s: any) => {
                const day = new Date(s.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" });
                const start = s.started_at ? new Date(s.started_at).toLocaleTimeString() : "";
                const end = s.completed_at ? new Date(s.completed_at).toLocaleTimeString() : "";
                return [s.date, day, csvField(s.title || "Workout"), Math.round((s.duration_seconds || 0) / 60), s.total_sets, Math.round(Number(s.total_volume) || 0), s.xp_earned, start, end].join(",");
            }),
        ];

        const sessionDateById: Record<string, string> = {};
        sessions.forEach((s: any) => { sessionDateById[s.id] = s.date; });

        const setSection = [
            "=== SET-BY-SET LOG ===",
            "Date,Exercise,Muscle Group,Set #,Weight (kg),Reps,Duration (sec),Distance (km)",
            ...(setLogs ?? []).map((l: any) =>
                [sessionDateById[l.workout_session_id] ?? "", csvField(l.exercises?.name ?? "Unknown"), csvField(l.exercises?.body_segment ?? ""), l.set_index + 1, l.weight ?? "", l.reps ?? "", l.duration_seconds ?? "", l.distance ?? ""].join(",")
            ),
        ];

        const weightSection = [
            "=== BODY WEIGHT LOG ===",
            "Date,Time,Weight (kg),Context",
            ...(weightLogs ?? []).map((w: any) => {
                const d = new Date(w.logged_at);
                return [d.toLocaleDateString(), d.toLocaleTimeString(), w.weight, csvField(w.context ?? "")].join(",");
            }),
        ];

        const csv = [...sessionsSection, "", ...setSection, "", ...weightSection].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ascend-full-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function deleteAccount() {
        if (!user) return;
        // Delete all user data
        await supabase.from("notifications").delete().eq("user_id", user.id);
        await supabase.from("achievements").delete().eq("user_id", user.id);
        await supabase.from("target_lifts").delete().eq("user_id", user.id);
        await supabase.from("user_stats").delete().eq("user_id", user.id);
        await supabase.from("body_weight_logs").delete().eq("user_id", user.id);
        await supabase.from("exercise_set_logs").delete().eq("user_id", user.id);
        await supabase.from("workout_sessions").delete().eq("user_id", user.id);
        await supabase.from("scheduled_exercises").delete().eq("user_id", user.id);
        await supabase.from("scheduled_days").delete().eq("user_id", user.id);
        await supabase.from("workout_template_exercises").delete().eq("user_id", user.id);
        await supabase.from("workout_templates").delete().eq("user_id", user.id);
        await supabase.from("recurring_plans").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
        await supabase.auth.signOut();
        router.push("/login");
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    const isMetric = data.unit_preference === "metric";
    const weightUnit = isMetric ? "KG" : "LBS";
    const heightUnit = isMetric ? "CM" : "FT/IN";
    const age = data.date_of_birth ? Math.floor((Date.now() - new Date(data.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const bmi = data.height_cm && latestWeight ? Number((latestWeight / ((data.height_cm / 100) ** 2)).toFixed(1)) : null;
    const weightToGoal = data.target_weight && latestWeight ? Number((latestWeight - data.target_weight).toFixed(1)) : null;

    const SECTIONS: { key: Section; label: string; icon: any }[] = [
        { key: "stats", label: "STATS", icon: User },
        { key: "goals", label: "GOALS", icon: Target },
        { key: "training", label: "TRAINING", icon: Dumbbell },
        { key: "social", label: "SOCIAL", icon: Heart },
        { key: "preferences", label: "SETTINGS", icon: Shield },
        { key: "data", label: "DATA", icon: Download },
    ];

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-300 rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
            <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />

            <div className="relative z-10 w-full max-w-2xl mx-auto space-y-5">
                {/* Header + Avatar */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold shrink-0"
                        style={{ borderColor: data.avatar_color + "60", backgroundColor: data.avatar_color + "15", color: data.avatar_color }}
                    >
                        {(profile?.username?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white/90 truncate">{profile?.username ?? "Unknown"}</h1>
                        <p className="text-xs font-mono text-white/40">{user?.email}</p>
                        <p className="text-[10px] font-mono text-white/25 mt-0.5">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}</p>
                    </div>
                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className={`shrink-0 flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-lg border transition ${saved ? "border-emerald-400/40 text-emerald-300" : "border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10"
                            }`}
                    >
                        {saved ? <Check size={12} /> : <Save size={12} />}
                        {saved ? "SAVED" : saving ? "..." : "SAVE"}
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">SESSIONS</p>
                        <p className="text-base font-bold font-mono text-white/80">{totalSessions}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">VOLUME</p>
                        <p className="text-base font-bold font-mono text-white/80">{totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(0)}K` : Math.round(totalVolume)}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">WEIGHT</p>
                        <p className="text-base font-bold font-mono text-white/80">{latestWeight ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">BMI</p>
                        <p className="text-base font-bold font-mono text-white/80">{bmi ?? "—"}</p>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-lg border shrink-0 transition ${section === s.key ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"
                                }`}
                        >
                            <s.icon size={11} /> {s.label}
                        </button>
                    ))}
                </div>

                {/* ══════════ STATS ══════════ */}
                {section === "stats" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40">BODY STATS</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">HEIGHT ({heightUnit})</label>
                                    <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={data.height_cm ?? ""} onChange={(e) => updateField("height_cm", e.target.value ? Number(e.target.value) : null)} placeholder="—"
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-cyan-400/40 transition" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">TARGET WEIGHT ({weightUnit})</label>
                                    <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={data.target_weight ?? ""} onChange={(e) => updateField("target_weight", e.target.value ? Number(e.target.value) : null)} placeholder="—"
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-cyan-400/40 transition" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">DATE OF BIRTH</label>
                                    <input type="date" value={data.date_of_birth ?? ""} onChange={(e) => updateField("date_of_birth", e.target.value || null)}
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-cyan-400/40 transition" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">AGE</label>
                                    <div className="h-11 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-base font-bold font-mono text-white/50">
                                        {age ?? "—"}
                                    </div>
                                </div>
                            </div>

                            {weightToGoal !== null && (
                                <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.03] p-3 text-center">
                                    <p className="text-[9px] font-mono text-cyan-300/50">DISTANCE TO TARGET</p>
                                    <p className={`text-xl font-bold font-mono ${weightToGoal > 0 ? "text-orange-300" : weightToGoal < 0 ? "text-emerald-300" : "text-cyan-300"}`}>
                                        {weightToGoal > 0 ? `-${weightToGoal}` : weightToGoal < 0 ? `+${Math.abs(weightToGoal)}` : "✓ AT GOAL"} {weightUnit}
                                    </p>
                                    <p className="text-[9px] font-mono text-white/25 mt-1">
                                        Current: {latestWeight} → Target: {data.target_weight}
                                    </p>
                                </div>
                            )}

                            {bmi !== null && (
                                <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
                                    <span>BMI: <span className="text-white/70 font-bold">{bmi}</span></span>
                                    <span>—</span>
                                    <span className={bmi < 18.5 ? "text-amber-300" : bmi < 25 ? "text-emerald-300" : bmi < 30 ? "text-orange-300" : "text-red-400"}>
                                        {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">INJURY / LIMITATION NOTES</p>
                            <textarea
                                value={data.injury_notes ?? ""}
                                onChange={(e) => updateField("injury_notes", e.target.value)}
                                placeholder="e.g. Left shoulder impingement — avoid heavy overhead pressing"
                                rows={3}
                                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-400/40 transition resize-none"
                            />
                            <p className="text-[8px] font-mono text-white/20 mt-1.5">This is for your reference — the system will show warnings for exercises that affect noted areas.</p>
                        </div>
                    </div>
                )}

                {/* ══════════ GOALS ══════════ */}
                {section === "goals" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">TRAINING GOAL</p>
                            <CustomSelect
                                options={GOAL_OPTIONS}
                                value={data.goal}
                                onChange={(v) => updateField("goal", v)}
                                placeholder="Select a goal..."
                                searchable={false}
                            />
                        </div>

                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">TARGET LIFTS</p>
                            <p className="text-[9px] font-mono text-white/25 mb-3">Set weight goals for specific exercises. You'll get notified when you hit them.</p>

                            {targetLifts.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {targetLifts.map((lift) => (
                                        <div key={lift.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${lift.achieved ? "border-emerald-400/30 bg-emerald-400/[0.05]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold ${lift.achieved ? "text-emerald-300" : "text-white/80"}`}>{lift.exercise_name}</p>
                                                <p className="text-[10px] font-mono text-white/30">Target: {lift.target_weight} {weightUnit}</p>
                                            </div>
                                            {lift.achieved ? (
                                                <span className="text-[9px] font-mono text-emerald-300 px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20">ACHIEVED ✓</span>
                                            ) : (
                                                <button onClick={() => deleteTargetLift(lift.id)} className="text-white/20 hover:text-red-400 transition"><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <CustomSelect
                                        options={exercises.map((ex) => ({ value: ex.id, label: ex.name }))}
                                        value={newLiftExercise}
                                        onChange={setNewLiftExercise}
                                        placeholder="Select exercise..."
                                    />
                                </div>
                                <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={newLiftWeight} onChange={(e) => setNewLiftWeight(e.target.value)} placeholder={weightUnit}
                                    className="w-20 shrink-0 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono py-2.5 focus:outline-none focus:border-cyan-400/40 transition" />
                                <button onClick={addTargetLift} disabled={!newLiftExercise || !newLiftWeight}
                                    className="shrink-0 w-11 h-11 rounded-lg border border-cyan-400/30 text-cyan-300 flex items-center justify-center hover:bg-cyan-400/10 disabled:opacity-30 transition">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ TRAINING ══════════ */}
                {section === "training" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40">TRAINING PROFILE</p>

                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">EXPERIENCE LEVEL</label>
                                <div className="flex gap-2">
                                    {["beginner", "intermediate", "advanced"].map((lvl) => (
                                        <button key={lvl} onClick={() => updateField("experience", lvl)}
                                            className={`flex-1 text-[10px] font-mono py-2.5 rounded-lg border transition ${data.experience === lvl ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"
                                                }`}>
                                            {lvl.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[8px] font-mono text-white/20 mt-1">
                                    {data.experience === "beginner" ? "< 1 year of consistent training. Volume recommendations will be conservative." :
                                        data.experience === "intermediate" ? "1-3 years. Standard volume ranges apply." :
                                            "3+ years. Higher volume tolerance, more aggressive progression."}
                                </p>
                            </div>

                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">TRAINING DAYS PER WEEK: {data.training_frequency}</label>
                                <input type="range" min="1" max="7" value={data.training_frequency} onChange={(e) => updateField("training_frequency", Number(e.target.value))}
                                    className="w-full accent-cyan-400" />
                                <div className="flex justify-between text-[8px] font-mono text-white/20 mt-0.5">
                                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">PREFERRED WORKOUT TIME</label>
                                <div className="flex gap-2">
                                    {[{ value: "morning", label: "MORNING", sub: "5-9 AM" }, { value: "afternoon", label: "AFTERNOON", sub: "12-5 PM" }, { value: "evening", label: "EVENING", sub: "5-10 PM" }].map((t) => (
                                        <button key={t.value} onClick={() => updateField("workout_time_pref", t.value)}
                                            className={`flex-1 text-center py-2.5 rounded-lg border transition ${data.workout_time_pref === t.value ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"
                                                }`}>
                                            <p className="text-[10px] font-mono">{t.label}</p>
                                            <p className="text-[8px] font-mono text-white/20">{t.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ SOCIAL ══════════ */}
                {section === "social" && (
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                        <p className="text-[10px] font-mono tracking-widest text-white/40">SOCIAL LINKS</p>

                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><AtSign size={10} /> INSTAGRAM</label>
                            <input type="text" value={data.social_instagram ?? ""} onChange={(e) => updateField("social_instagram", e.target.value)} placeholder="@username"
                                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-400/40 transition" />
                        </div>
                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><Globe size={10} /> X (TWITTER)</label>
                            <input type="text" value={data.social_twitter ?? ""} onChange={(e) => updateField("social_twitter", e.target.value)} placeholder="@handle"
                                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-cyan-400/40 transition" />
                        </div>

                        <div>
                            <p className="text-[10px] font-mono tracking-widest text-white/40 mt-4 mb-2">AVATAR COLOR</p>
                            <div className="flex gap-2 flex-wrap">
                                {AVATAR_COLORS.map((color) => (
                                    <button key={color} onClick={() => updateField("avatar_color", color)}
                                        className={`w-9 h-9 rounded-lg border-2 transition ${data.avatar_color === color ? "border-white/60 scale-110" : "border-transparent hover:border-white/20"}`}
                                        style={{ backgroundColor: color + "30", borderColor: data.avatar_color === color ? color : undefined }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ PREFERENCES ══════════ */}
                {section === "preferences" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40">UNITS</p>
                            <div className="flex gap-2">
                                <button onClick={() => updateField("unit_preference", "metric")}
                                    className={`flex-1 text-center py-3 rounded-lg border transition ${data.unit_preference === "metric" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40"}`}>
                                    <p className="text-sm font-mono font-bold">METRIC</p>
                                    <p className="text-[9px] font-mono text-white/30">KG · CM · KM</p>
                                </button>
                                <button onClick={() => updateField("unit_preference", "imperial")}
                                    className={`flex-1 text-center py-3 rounded-lg border transition ${data.unit_preference === "imperial" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40"}`}>
                                    <p className="text-sm font-mono font-bold">IMPERIAL</p>
                                    <p className="text-[9px] font-mono text-white/30">LBS · FT/IN · MI</p>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40">PROFILE VISIBILITY</p>
                            <div className="flex gap-2">
                                {[
                                    { value: "public", label: "PUBLIC", desc: "Visible on leaderboard", icon: Eye },
                                    { value: "friends", label: "FRIENDS", desc: "Friends only (coming soon)", icon: User },
                                    { value: "private", label: "PRIVATE", desc: "Hidden from leaderboard", icon: EyeOff },
                                ].map((opt) => (
                                    <button key={opt.value} onClick={() => updateField("profile_visibility", opt.value)}
                                        className={`flex-1 text-center py-3 rounded-lg border transition ${data.profile_visibility === opt.value ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40"}`}>
                                        <opt.icon size={16} className="mx-auto mb-1" />
                                        <p className="text-[10px] font-mono font-bold">{opt.label}</p>
                                        <p className="text-[8px] font-mono text-white/20">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ DATA ══════════ */}
                {section === "data" && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/40 mb-3">EXPORT DATA</p>
                            <p className="text-[10px] font-mono text-white/30 mb-3">Download your complete workout history as a CSV file.</p>
                            <button onClick={exportData} className="flex items-center gap-2 text-sm font-mono px-4 py-2.5 rounded-lg border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 transition">
                                <Download size={14} /> EXPORT WORKOUT HISTORY
                            </button>
                        </div>

                        <div className="rounded-lg border border-red-400/20 bg-red-400/[0.03] p-4">
                            <p className="text-[10px] font-mono tracking-widest text-red-400/70 mb-2">DANGER ZONE</p>
                            <p className="text-[10px] font-mono text-white/30 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
                            {!showDeleteConfirm ? (
                                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 text-sm font-mono px-4 py-2.5 rounded-lg border border-red-400/30 text-red-400/70 hover:text-red-400 hover:border-red-400/50 transition">
                                    <AlertTriangle size={14} /> DELETE ACCOUNT
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs font-mono text-red-400">Are you absolutely sure? All data will be permanently destroyed.</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 text-sm font-mono py-2.5 rounded-lg border border-white/15 text-white/50 hover:text-white/80 transition">
                                            CANCEL
                                        </button>
                                        <button onClick={deleteAccount} className="flex-1 text-sm font-mono py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition">
                                            YES, DELETE EVERYTHING
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px" />

                        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-sm font-mono px-4 py-3 rounded-lg border border-white/15 text-white/50 hover:text-white/80 transition">
                            <LogOut size={14} /> SIGN OUT
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}