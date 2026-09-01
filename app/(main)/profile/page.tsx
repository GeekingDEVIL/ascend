"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { User, LogOut, Plus, Trash2, Check, Download, AlertTriangle, Eye, EyeOff, Target, Dumbbell, Shield, Heart, AtSign, Globe, Camera, Pencil, X, Flame, Phone, Mail, Trophy, Award, HeartPulse, Sparkles, Bell, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthProvider";
import CubeLoader from "../../components/ui/cube-loader";
import CustomSelect from "../../components/CustomSelect";
import { staggerContainer, staggerItem } from "../../lib/motion";
import { GOAL_OPTIONS } from "../../lib/goals";
import { updateUserStats } from "../../lib/updateUserStats";
import { ACCENT_PRESETS, DEFAULT_ACCENT, getAccentPreset, applyAccent, type AccentKey } from "../../lib/theme";
import { getFullCalorieSummary, ageFromDOB, type GoalType, type Sex, type ActivityLevel, type DietPreference, type CalorieSummary } from "../../lib/calorieEngine";
import { useSex, broadcastSexChange } from "../../lib/useSex";
import { broadcastUnitChange } from "../../lib/useUnits";
import { broadcastEquipmentChange } from "../../lib/useEquipment";
import { kgToUnit, weightInputToKg } from "../../lib/units";
import { rematerializeWeightTrend } from "../../lib/weightTrend";
import SubNavPills from "../../components/ui/sub-nav-pills";
import { youPills } from "../../lib/navPills";

type ProfileData = {
    goal: string;
    height_cm: number | null;
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
    sex: Sex | null;
    activity_level: ActivityLevel;
};

type UserGoals = {
    id: string | null;
    goal_type: GoalType;
    target_weight_kg: number | null;
    target_date: string | null;
    rate_per_week_kg: number | null;
    workouts_per_week: number;
    preferred_days: string[];
    diet_preference: DietPreference;
    calorie_target_override: number | null;
    protein_target_g: number | null;
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

const AVATAR_COLORS = ["rgb(var(--accent-rgb))", "#34d399", "#a78bfa", "#f97316", "#ef4444", "#f59e0b", "#ec4899", "#6366f1"];

const DEFAULT_PROFILE: ProfileData = {
    goal: "", height_cm: null, experience: "beginner",
    training_frequency: 5, date_of_birth: null, unit_preference: "metric",
    workout_time_pref: null, injury_notes: null, social_instagram: null,
    social_twitter: null, profile_visibility: "public", avatar_color: "rgb(var(--accent-rgb))",
    sex: null, activity_level: "moderate",
};

const DEFAULT_GOALS: UserGoals = {
    id: null, goal_type: "general_fitness", target_weight_kg: null,
    target_date: null, rate_per_week_kg: 0.5, workouts_per_week: 4,
    preferred_days: [], diet_preference: "balanced",
    calorie_target_override: null, protein_target_g: null,
};

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
    { value: "lose_weight", label: "Lose Weight" },
    { value: "gain_muscle", label: "Gain Muscle" },
    { value: "body_recomp", label: "Body Recomposition" },
    { value: "maintain", label: "Maintain Weight" },
    { value: "general_fitness", label: "General Fitness" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: "sedentary", label: "SEDENTARY", desc: "Desk job, little exercise" },
    { value: "light", label: "LIGHT", desc: "1-2 days/week" },
    { value: "moderate", label: "MODERATE", desc: "3-5 days/week" },
    { value: "active", label: "ACTIVE", desc: "6-7 days/week" },
    { value: "very_active", label: "VERY ACTIVE", desc: "Athlete / physical job" },
];

const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
    { value: "balanced", label: "Balanced" },
    { value: "high_protein", label: "High Protein" },
    { value: "low_carb", label: "Low Carb" },
    { value: "keto", label: "Keto" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EQUIPMENT_LIST = [
    "Barbell", "Dumbbell", "Kettlebell", "Cable", "Machine",
    "Resistance Band", "Pull-up Bar", "Bench", "Squat Rack",
    "Smith Machine", "Dip Station", "EZ Curl Bar", "Leg Press",
    "Lat Pulldown", "Cable Crossover",
];

export default function ProfilePage() {
    const { profile, user, refreshProfile } = useAuth();
    const router = useRouter();
    const { sex: hookSex } = useSex();
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameSaving, setUsernameSaving] = useState(false);

    const [data, setData] = useState<ProfileData>(DEFAULT_PROFILE);
    const [targetLifts, setTargetLifts] = useState<TargetLift[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [section, setSection] = useState<Section>("stats");
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialLoadRef = useRef(true);
    const [exercises, setExercises] = useState<{ id: string; name: string }[]>([]);
    const [newLiftExercise, setNewLiftExercise] = useState("");
    const [newLiftWeight, setNewLiftWeight] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [latestWeight, setLatestWeight] = useState<number | null>(null);
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalVolume, setTotalVolume] = useState(0);
    const [theme, setTheme] = useState<"navy" | "oled">("navy");
    const [accent, setAccent] = useState<AccentKey>(DEFAULT_ACCENT);
    const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
    const [calorieSummary, setCalorieSummary] = useState<CalorieSummary | null>(null);
    const [weightInput, setWeightInput] = useState("");
    const [weightSaving, setWeightSaving] = useState(false);
    const [equipmentAccess, setEquipmentAccess] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("ascend_theme");
        const initial = stored === "oled" ? "oled" : "navy";
        setTheme(initial);
        document.documentElement.style.setProperty("--bg-primary", initial === "oled" ? "#000000" : "#050914");

        const storedAccent = localStorage.getItem("ascend_accent") as AccentKey | null;
        setAccent(getAccentPreset(storedAccent).key);
    }, []);

    function applyTheme(value: "navy" | "oled") {
        setTheme(value);
        document.documentElement.style.setProperty("--bg-primary", value === "oled" ? "#000000" : "#050914");
        localStorage.setItem("ascend_theme", value);
    }

    function selectAccent(key: AccentKey) {
        setAccent(key);
        applyAccent(key);
        localStorage.setItem("ascend_accent", key);
    }

    const loadProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const currentSex = hookSex;
        const [{ data: p }, { data: bs }] = await Promise.all([
            supabase
                .from("profiles")
                .select("unit_preference, injury_notes, social_instagram, social_twitter, profile_visibility, avatar_color, equipment_access")
                .eq("id", user.id)
                .maybeSingle(),
            supabase
                .from("profile_body_stats")
                .select("height_cm, activity_level, goal, experience, training_frequency, workout_time_pref, date_of_birth")
                .eq("user_id", user.id)
                .eq("sex", currentSex)
                .maybeSingle(),
        ]);

        if (p) {
            setData({
                goal: bs?.goal ?? "",
                height_cm: bs?.height_cm ?? null,
                experience: bs?.experience ?? "beginner",
                training_frequency: bs?.training_frequency ?? 5,
                date_of_birth: bs?.date_of_birth ?? null,
                unit_preference: p.unit_preference ?? "metric",
                workout_time_pref: bs?.workout_time_pref ?? null,
                injury_notes: p.injury_notes,
                social_instagram: p.social_instagram,
                social_twitter: p.social_twitter,
                profile_visibility: p.profile_visibility ?? "public",
                avatar_color: p.avatar_color ?? "rgb(var(--accent-rgb))",
                sex: currentSex,
                activity_level: (bs?.activity_level as ActivityLevel) ?? "moderate",
            });
            setEquipmentAccess(p.equipment_access ?? []);
        }
        const { data: g } = await supabase
            .from("user_goals")
            .select("id, goal_type, target_weight_kg, target_date, rate_per_week_kg, workouts_per_week, preferred_days, diet_preference, calorie_target_override, protein_target_g")
            .eq("user_id", user.id)
            .eq("sex", currentSex)
            .eq("is_active", true)
            .limit(1);

        if (g?.[0]) {
            setGoals({
                id: g[0].id,
                goal_type: g[0].goal_type as GoalType,
                target_weight_kg: g[0].target_weight_kg,
                target_date: g[0].target_date,
                rate_per_week_kg: g[0].rate_per_week_kg,
                workouts_per_week: g[0].workouts_per_week ?? 4,
                preferred_days: g[0].preferred_days ?? [],
                diet_preference: (g[0].diet_preference as DietPreference) ?? "balanced",
                calorie_target_override: g[0].calorie_target_override,
                protein_target_g: g[0].protein_target_g,
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

        // Latest body weight — show the raw last entry so it matches what was just logged
        const unitPref = p?.unit_preference ?? "metric";
        const loadUnit: "kg" | "lbs" = unitPref === "imperial" ? "lbs" : "kg";
        const { data: bw } = await supabase.from("body_weight_logs").select("weight").eq("user_id", user.id).eq("sex", currentSex).order("logged_at", { ascending: false }).limit(1);
        setLatestWeight(bw?.[0]?.weight ?? null);
        if (bw?.[0]?.weight != null) setWeightInput(String(kgToUnit(bw[0].weight, loadUnit)));

        // Summary stats
        const { data: sessions } = await supabase.from("workout_sessions").select("total_volume").eq("user_id", user.id).eq("status", "completed").eq("sex", currentSex);
        setTotalSessions((sessions ?? []).length);
        setTotalVolume((sessions ?? []).reduce((s, r: any) => s + (Number(r.total_volume) || 0), 0));

        setLoading(false);
    }, [user, hookSex]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    useEffect(() => {
        if (!user) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        initialLoadRef.current = true;
        const currentSex = hookSex;
        Promise.all([
            supabase.from("workout_sessions").select("total_volume").eq("user_id", user.id).eq("status", "completed").eq("sex", currentSex),
            supabase.from("profile_body_stats").select("height_cm, activity_level, goal, experience, training_frequency, workout_time_pref, date_of_birth").eq("user_id", user.id).eq("sex", currentSex).maybeSingle(),
            supabase.from("user_goals").select("id, goal_type, target_weight_kg, target_date, rate_per_week_kg, workouts_per_week, preferred_days, diet_preference, calorie_target_override, protein_target_g").eq("user_id", user.id).eq("sex", currentSex).eq("is_active", true).limit(1),
            supabase.from("body_weight_logs").select("weight").eq("user_id", user.id).eq("sex", currentSex).order("logged_at", { ascending: false }).limit(1),
        ]).then(([{ data: sessions }, { data: bs }, { data: goalRows }, { data: bw }]) => {
            setTotalSessions((sessions ?? []).length);
            setTotalVolume((sessions ?? []).reduce((s, r: any) => s + (Number(r.total_volume) || 0), 0));
            if (bs) {
                setData((prev) => ({
                    ...prev,
                    goal: bs.goal ?? "",
                    height_cm: bs.height_cm ?? null,
                    experience: bs.experience ?? "beginner",
                    training_frequency: bs.training_frequency ?? 5,
                    workout_time_pref: bs.workout_time_pref ?? null,
                    activity_level: (bs.activity_level as ActivityLevel) ?? "moderate",
                    date_of_birth: bs.date_of_birth ?? null,
                    sex: currentSex,
                }));
            } else {
                setData((prev) => ({
                    ...prev,
                    goal: "",
                    height_cm: null,
                    experience: "beginner",
                    training_frequency: 5,
                    workout_time_pref: null,
                    activity_level: "moderate" as ActivityLevel,
                    date_of_birth: null,
                    sex: currentSex,
                }));
            }
            if (goalRows?.[0]) {
                setGoals({
                    id: goalRows[0].id,
                    goal_type: goalRows[0].goal_type as GoalType,
                    target_weight_kg: goalRows[0].target_weight_kg,
                    target_date: goalRows[0].target_date,
                    rate_per_week_kg: goalRows[0].rate_per_week_kg,
                    workouts_per_week: goalRows[0].workouts_per_week ?? 4,
                    preferred_days: goalRows[0].preferred_days ?? [],
                    diet_preference: (goalRows[0].diet_preference as DietPreference) ?? "balanced",
                    calorie_target_override: goalRows[0].calorie_target_override,
                    protein_target_g: goalRows[0].protein_target_g,
                });
            } else {
                setGoals(DEFAULT_GOALS);
            }
            setLatestWeight(bw?.[0]?.weight ?? null);
            if (bw?.[0]?.weight != null) setWeightInput(String(kgToUnit(bw[0].weight, wUnit))); else setWeightInput("");
        });
    }, [user, hookSex]);

    function updateField(field: keyof ProfileData, value: any) {
        setData((prev) => ({ ...prev, [field]: value }));
        if (field === "sex" && (value === "male" || value === "female")) {
            broadcastSexChange(value as Sex);
            if (user) supabase.from("profiles").update({ sex: value }).eq("id", user.id);
        }
        if (field === "unit_preference" && (value === "metric" || value === "imperial")) {
            broadcastUnitChange(value);
        }
    }

    const debouncedSave = useCallback(async () => {
        if (!user) return;
        setSaving(true);
        const currentSex = hookSex;

        await Promise.all([
            supabase.from("profiles").update({
                unit_preference: data.unit_preference,
                injury_notes: data.injury_notes || null,
                social_instagram: data.social_instagram || null,
                social_twitter: data.social_twitter || null,
                profile_visibility: data.profile_visibility,
                avatar_color: data.avatar_color,
            }).eq("id", user.id),
            supabase.from("profile_body_stats").upsert({
                user_id: user.id,
                sex: currentSex,
                height_cm: data.height_cm,
                activity_level: data.activity_level,
                goal: data.goal || null,
                experience: data.experience,
                training_frequency: data.training_frequency,
                workout_time_pref: data.workout_time_pref || null,
                date_of_birth: data.date_of_birth || null,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id,sex" }),
        ]);

        const goalPayload = {
            user_id: user.id,
            sex: currentSex,
            goal_type: goals.goal_type,
            target_weight_kg: goals.target_weight_kg,
            target_date: goals.target_date || null,
            rate_per_week_kg: goals.rate_per_week_kg,
            workouts_per_week: goals.workouts_per_week,
            preferred_days: goals.preferred_days,
            diet_preference: goals.diet_preference,
            calorie_target_override: goals.calorie_target_override,
            protein_target_g: goals.protein_target_g,
            is_active: true,
            updated_at: new Date().toISOString(),
        };
        if (goals.id) {
            await supabase.from("user_goals").update(goalPayload).eq("id", goals.id);
        } else {
            const { data: inserted } = await supabase.from("user_goals").insert(goalPayload).select("id").limit(1);
            if (inserted?.[0]) setGoals((prev) => ({ ...prev, id: inserted[0].id }));
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    }, [user, data, goals, hookSex]);

    useEffect(() => {
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
            return;
        }
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(debouncedSave, 1500);
        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [data, goals, debouncedSave]);

    async function logWeight() {
        if (!user || !weightInput) return;
        const raw = Number(weightInput);
        if (raw <= 0) return;
        const wKg = weightInputToKg(raw, wUnit);
        if (wKg === latestWeight) return;
        const currentSex = hookSex;
        setWeightSaving(true);
        await supabase.from("body_weight_logs").insert({ user_id: user.id, weight: wKg, context: "morning", date: new Date().toISOString().split("T")[0], sex: currentSex });
        await rematerializeWeightTrend(user.id, currentSex);
        setLatestWeight(wKg);
        setWeightSaving(false);
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
            .eq("sex", hookSex)
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
            .eq("sex", hookSex)
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
        const uid = user.id;
        await supabase.from("notifications").delete().eq("user_id", uid);
        await supabase.from("achievements").delete().eq("user_id", uid);
        await supabase.from("target_lifts").delete().eq("user_id", uid);
        await supabase.from("exercise_goals").delete().eq("user_id", uid);
        await supabase.from("exercise_leaderboard").delete().eq("user_id", uid);
        await supabase.from("favorite_exercises").delete().eq("user_id", uid);
        await supabase.from("body_measurements").delete().eq("user_id", uid);
        await supabase.from("food_entries").delete().eq("user_id", uid);
        await supabase.from("daily_intake").delete().eq("user_id", uid);
        await supabase.from("my_foods").delete().eq("user_id", uid);
        await supabase.from("tdee_estimates").delete().eq("user_id", uid);
        await supabase.from("weight_trend").delete().eq("user_id", uid);
        await supabase.from("user_stats").delete().eq("user_id", uid);
        await supabase.from("body_weight_logs").delete().eq("user_id", uid);
        await supabase.from("exercise_set_logs").delete().eq("user_id", uid);
        await supabase.from("workout_sessions").delete().eq("user_id", uid);
        await supabase.from("scheduled_exercises").delete().eq("user_id", uid);
        await supabase.from("scheduled_days").delete().eq("user_id", uid);
        await supabase.from("workout_template_exercises").delete().eq("user_id", uid);
        await supabase.from("workout_templates").delete().eq("user_id", uid);
        await supabase.from("recurring_plans").delete().eq("user_id", uid);
        await supabase.from("user_goals").delete().eq("user_id", uid);
        await supabase.from("profile_body_stats").delete().eq("user_id", uid);
        await supabase.from("profiles").delete().eq("id", uid);
        await supabase.auth.signOut();
        router.push("/login");
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !user) return;

        setAvatarError(null);
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setAvatarError("Use a PNG, JPEG, or WEBP image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError("Image must be under 5MB.");
            return;
        }

        setAvatarUploading(true);
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
        if (uploadError) {
            setAvatarError("Upload failed. Try again.");
            setAvatarUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        const bustedUrl = `${urlData.publicUrl}?v=${Date.now()}`;
        await supabase.from("profiles").update({ avatar_url: bustedUrl }).eq("id", user.id);
        await refreshProfile();
        await updateUserStats(user.id);
        setAvatarUploading(false);
    }

    function openProfileModal() {
        setUsernameInput(profile?.username ?? "");
        setUsernameError(null);
        setShowProfileModal(true);
    }

    async function saveUsername() {
        if (!user) return;
        const next = usernameInput.trim();
        if (!next) { setUsernameError("Username can't be empty."); return; }
        if (next === profile?.username) { return; }

        setUsernameSaving(true);
        setUsernameError(null);

        const { data: existing } = await supabase.from("profiles").select("id").eq("username", next).limit(1);
        if (existing?.length) {
            setUsernameError("username already exists");
            setUsernameSaving(false);
            return;
        }

        const { error } = await supabase.from("profiles").update({ username: next }).eq("id", user.id);
        if (error) {
            setUsernameError("Couldn't save. Try again.");
            setUsernameSaving(false);
            return;
        }

        await refreshProfile();
        await updateUserStats(user.id);
        setUsernameSaving(false);
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    function updateGoal(field: keyof UserGoals, value: any) {
        setGoals((prev) => ({ ...prev, [field]: value }));
    }

    async function toggleEquipment(item: string) {
        if (!user) return;
        const next = equipmentAccess.includes(item)
            ? equipmentAccess.filter((e) => e !== item)
            : [...equipmentAccess, item];
        setEquipmentAccess(next);
        broadcastEquipmentChange(next, null);
        await supabase.from("profiles").update({ equipment_access: next }).eq("id", user.id);
    }

    const isMetric = data.unit_preference === "metric";
    const weightUnit = isMetric ? "KG" : "LBS";
    const heightUnit = isMetric ? "CM" : "FT/IN";
    const wUnit: "kg" | "lbs" = isMetric ? "kg" : "lbs";
    const age = data.date_of_birth ? Math.floor((Date.now() - new Date(data.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const bmi = data.height_cm && latestWeight ? Number((latestWeight / ((data.height_cm / 100) ** 2)).toFixed(1)) : null;
    const displayWeight = latestWeight !== null ? Number(kgToUnit(latestWeight, wUnit).toFixed(1)) : null;
    const displayTargetWeight = goals.target_weight_kg ? Number(kgToUnit(goals.target_weight_kg, wUnit).toFixed(1)) : null;
    const weightToGoal = displayTargetWeight && displayWeight ? Number((displayWeight - displayTargetWeight).toFixed(1)) : null;

    useEffect(() => {
        if (!latestWeight || !data.height_cm || !data.date_of_birth || !data.sex) {
            setCalorieSummary(null);
            return;
        }
        const summary = getFullCalorieSummary({
            weightKg: latestWeight,
            heightCm: data.height_cm,
            ageYears: ageFromDOB(data.date_of_birth),
            sex: data.sex,
            activity: data.activity_level,
            goalType: goals.goal_type,
            ratePerWeekKg: goals.rate_per_week_kg ?? undefined,
            diet: goals.diet_preference,
            calorieOverride: goals.calorie_target_override ?? undefined,
        });
        setCalorieSummary(summary);
    }, [latestWeight, data.height_cm, data.date_of_birth, data.sex, data.activity_level, goals.goal_type, goals.rate_per_week_kg, goals.diet_preference, goals.calorie_target_override]);

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
                <CubeLoader message="Loading profile…" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050914] text-white pb-24 md:pb-10 relative">

            <motion.div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-5" variants={staggerContainer} initial="hidden" animate="visible">
                {/* Header — tap to edit profile */}
                <motion.button variants={staggerItem} onClick={openProfileModal} className="w-full flex items-center gap-4 text-left group">
                    <div
                        className="relative w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden"
                        style={{ borderColor: data.avatar_color + "60", backgroundColor: data.avatar_color + "15", color: data.avatar_color }}
                    >
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            (profile?.username?.[0] ?? "?").toUpperCase()
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                            <Pencil size={14} className="text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-bold text-white/90 truncate">{profile?.username ?? "Unknown"}</h1>
                            <Pencil size={10} className="shrink-0 text-white/15 group-hover:text-[rgb(var(--accent-light-rgb))] transition" />
                        </div>
                        <p className="text-xs font-mono text-white/40 truncate">{user?.email}</p>
                        <p className="text-[10px] font-mono text-white/25 mt-0.5">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}</p>
                    </div>
                    {(saving || saved) && (
                        <span className={`shrink-0 text-[9px] font-mono px-2 py-1 rounded-md border transition ${saved ? "border-emerald-400/30 text-emerald-300" : "border-white/10 text-white/30"}`}>
                            {saved ? "SAVED" : "SAVING..."}
                        </span>
                    )}
                </motion.button>

                <SubNavPills pills={youPills} activeKey="/profile" onSelect={(k) => router.push(k)} />

                {/* Quick Stats */}
                <motion.div variants={staggerItem} className="grid grid-cols-4 gap-2">
                    <div className="glass-card p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">SESSIONS</p>
                        <p className="text-base font-bold font-mono text-white/80">{totalSessions}</p>
                    </div>
                    <div className="glass-card p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">VOLUME</p>
                        <p className="text-base font-bold font-mono text-white/80">{(() => { const v = Math.round(kgToUnit(totalVolume, wUnit)); return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v; })()}</p>
                    </div>
                    <div className="glass-card p-2.5 text-center">
                        <p className="text-[8px] font-mono text-white/30">WEIGHT</p>
                        <p className="text-base font-bold font-mono text-white/80">{displayWeight ?? "—"}</p>
                    </div>
                    <div onClick={() => { if (!bmi && latestWeight) setSection("stats"); }} className={`glass-card p-2.5 text-center ${!bmi && latestWeight ? "cursor-pointer" : ""}`}>
                        <p className="text-[8px] font-mono text-white/30">BMI</p>
                        {bmi ? (
                            <p className="text-base font-bold font-mono text-white/80">{bmi}</p>
                        ) : latestWeight ? (
                            <p className="text-[9px] font-mono text-white/30 mt-0.5">Add height</p>
                        ) : (
                            <p className="text-base font-bold font-mono text-white/80">—</p>
                        )}
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div variants={staggerItem} className="space-y-1">
                    {[
                        { icon: Trophy, label: "Rankings", desc: "Leaderboard & rank", href: "/rankings" },
                        { icon: Award, label: "Achievements", desc: "Milestones & badges", href: "/achievements" },
                        { icon: HeartPulse, label: "Recovery", desc: "Recovery status", href: "/recovery" },
                        { icon: Sparkles, label: "AI Coach", desc: "Training advisor", href: "/coach" },
                        { icon: Bell, label: "Notifications", desc: "Alerts & updates", href: "/notifications" },
                    ].map((item) => (
                        <button key={item.label} onClick={() => router.push(item.href)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition text-left">
                            <item.icon size={16} className="text-white/30 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-mono text-white/70">{item.label}</p>
                            </div>
                            <ChevronRight size={14} className="text-white/15 shrink-0" />
                        </button>
                    ))}
                </motion.div>

                {/* Section Tabs */}
                <motion.div variants={staggerItem} className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            className={`flex items-center justify-center gap-1.5 text-[10px] font-mono px-2 py-2 rounded-lg border transition ${section === s.key ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"
                                }`}
                        >
                            <s.icon size={11} /> {s.label}
                        </button>
                    ))}
                </motion.div>

                {/* ══════════ STATS ══════════ */}
                {section === "stats" && (
                    <div className="space-y-4">
                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">BODY STATS</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">HEIGHT ({heightUnit})</label>
                                    <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={data.height_cm ?? ""} onChange={(e) => updateField("height_cm", e.target.value ? Number(e.target.value) : null)} placeholder="—"
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">SEX</label>
                                    <div className="h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center px-3">
                                        <span className="text-base font-bold font-mono text-white/70">{data.sex ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1) : "—"}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">DATE OF BIRTH</label>
                                    <input type="date" value={data.date_of_birth ?? ""} onChange={(e) => updateField("date_of_birth", e.target.value || null)}
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">AGE</label>
                                    <div className="h-11 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-base font-bold font-mono text-white/50">
                                        {age ?? "—"}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">LOG NEW WEIGHT ({weightUnit})</label>
                                <div className="flex gap-2">
                                    <input type="number" min="0" step="0.1" onWheel={(e) => (e.target as HTMLElement).blur()} value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="—"
                                        className="flex-1 h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                    <button onClick={logWeight} disabled={weightSaving || !weightInput || Number(weightInput) === latestWeight}
                                        className="shrink-0 h-11 px-4 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] text-[10px] font-mono hover:bg-[rgb(var(--accent-rgb)/0.1)] disabled:opacity-30 transition">
                                        {weightSaving ? "..." : "LOG"}
                                    </button>
                                </div>
                                {displayWeight && <p className="text-[8px] font-mono text-white/20 mt-1">Last logged: {displayWeight} {weightUnit.toLowerCase()}</p>}
                            </div>

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

                        <div className="glass-card p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">INJURY / LIMITATION NOTES</p>
                            <textarea
                                value={data.injury_notes ?? ""}
                                onChange={(e) => updateField("injury_notes", e.target.value)}
                                placeholder="e.g. Left shoulder impingement — avoid heavy overhead pressing"
                                rows={3}
                                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition resize-none"
                            />
                            <p className="text-[8px] font-mono text-white/20 mt-1.5">This is for your reference — the system will show warnings for exercises that affect noted areas.</p>
                        </div>
                    </div>
                )}

                {/* ══════════ GOALS ══════════ */}
                {section === "goals" && (
                    <div className="space-y-4">
                        {/* Goal Type */}
                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">PRIMARY GOAL</p>
                            <div className="grid grid-cols-2 gap-2">
                                {GOAL_TYPE_OPTIONS.map((opt) => (
                                    <button key={opt.value} onClick={() => updateGoal("goal_type", opt.value)}
                                        className={`text-[10px] font-mono py-2.5 px-2 rounded-lg border transition text-center ${goals.goal_type === opt.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weight Goal + Rate */}
                        {(goals.goal_type === "lose_weight" || goals.goal_type === "gain_muscle") && (
                            <div className="glass-card p-4 space-y-4">
                                <p className="text-[10px] font-mono tracking-widest text-white/25">WEIGHT TARGET</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-mono text-white/30 mb-1 block">TARGET ({weightUnit})</label>
                                        <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={goals.target_weight_kg ?? ""} onChange={(e) => updateGoal("target_weight_kg", e.target.value ? Number(e.target.value) : null)} placeholder="—"
                                            className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono text-white/30 mb-1 block">RATE ({weightUnit}/WK)</label>
                                        <input type="number" min="0.1" max="1.5" step="0.1" onWheel={(e) => (e.target as HTMLElement).blur()} value={goals.rate_per_week_kg ?? 0.5} onChange={(e) => updateGoal("rate_per_week_kg", Number(e.target.value))}
                                            className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">TARGET DATE (OPTIONAL)</label>
                                    <input type="date" value={goals.target_date ?? ""} onChange={(e) => updateGoal("target_date", e.target.value || null)}
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                </div>
                                {weightToGoal !== null && (
                                    <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb))]/[0.03] p-3 text-center">
                                        <p className="text-[9px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)]">DISTANCE TO TARGET</p>
                                        <p className={`text-xl font-bold font-mono ${weightToGoal > 0 ? "text-orange-300" : weightToGoal < 0 ? "text-emerald-300" : "text-[rgb(var(--accent-light-rgb))]"}`}>
                                            {weightToGoal > 0 ? `-${weightToGoal}` : weightToGoal < 0 ? `+${Math.abs(weightToGoal)}` : "AT GOAL"} {weightUnit}
                                        </p>
                                        <p className="text-[9px] font-mono text-white/25 mt-1">
                                            Current: {displayWeight} → Target: {displayTargetWeight}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Activity Level */}
                        <div className="glass-card p-4 space-y-3">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">ACTIVITY LEVEL</p>
                            <div className="space-y-1.5">
                                {ACTIVITY_OPTIONS.map((opt) => (
                                    <button key={opt.value} onClick={() => updateField("activity_level", opt.value)}
                                        className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg border transition ${data.activity_level === opt.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)]" : "border-white/[0.06] hover:border-white/15"}`}>
                                        <span className={`text-[10px] font-mono ${data.activity_level === opt.value ? "text-[rgb(var(--accent-light-rgb))]" : "text-white/50"}`}>{opt.label}</span>
                                        <span className="text-[9px] font-mono text-white/25">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Diet + Nutrition */}
                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">NUTRITION</p>
                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1.5 block">DIET PREFERENCE</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {DIET_OPTIONS.map((opt) => (
                                        <button key={opt.value} onClick={() => updateGoal("diet_preference", opt.value)}
                                            className={`text-[10px] font-mono py-2 rounded-lg border transition ${goals.diet_preference === opt.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">CALORIE OVERRIDE (OPTIONAL)</label>
                                <input type="number" min="800" max="8000" onWheel={(e) => (e.target as HTMLElement).blur()} value={goals.calorie_target_override ?? ""} onChange={(e) => updateGoal("calorie_target_override", e.target.value ? Number(e.target.value) : null)} placeholder="Auto-calculated"
                                    className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono placeholder:text-white/15 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                <p className="text-[8px] font-mono text-white/20 mt-1">Leave empty to auto-calculate from your stats and goal</p>
                            </div>
                        </div>

                        {/* Calorie Intelligence Card */}
                        {calorieSummary && (
                            <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb))]/[0.03] p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Flame size={14} className="text-[rgb(var(--accent-light-rgb))]" />
                                    <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb))]">CALORIE INTELLIGENCE</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
                                        <p className="text-[8px] font-mono text-white/30">BMR</p>
                                        <p className="text-base font-bold font-mono text-white/70">{calorieSummary.bmr}</p>
                                    </div>
                                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
                                        <p className="text-[8px] font-mono text-white/30">TDEE</p>
                                        <p className="text-base font-bold font-mono text-white/70">{calorieSummary.tdee}</p>
                                    </div>
                                    <div className="rounded-lg bg-[rgb(var(--accent-rgb)/0.08)] border border-[rgb(var(--accent-rgb)/0.2)] p-2.5 text-center">
                                        <p className="text-[8px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)]">TARGET</p>
                                        <p className="text-base font-bold font-mono text-[rgb(var(--accent-light-rgb))]">{calorieSummary.calorieTarget}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                                        <p className="text-[8px] font-mono text-white/30">PROTEIN</p>
                                        <p className="text-sm font-bold font-mono text-emerald-300">{calorieSummary.macros.protein}g</p>
                                    </div>
                                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                                        <p className="text-[8px] font-mono text-white/30">FAT</p>
                                        <p className="text-sm font-bold font-mono text-amber-300">{calorieSummary.macros.fat}g</p>
                                    </div>
                                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                                        <p className="text-[8px] font-mono text-white/30">CARBS</p>
                                        <p className="text-sm font-bold font-mono text-cyan-300">{calorieSummary.macros.carbs}g</p>
                                    </div>
                                </div>
                                <p className="text-[8px] font-mono text-white/20 text-center">Based on Mifflin-St Jeor equation · {data.sex === "male" ? "Male" : "Female"} · {age}y · {displayWeight}{wUnit} · {data.height_cm}cm</p>
                            </div>
                        )}
                        {!calorieSummary && (
                            <div className="glass-card p-4 text-center">
                                <Flame size={18} className="mx-auto text-white/15 mb-2" />
                                <p className="text-[10px] font-mono text-white/25">Add your height, DOB, and sex in Stats to unlock calorie intelligence</p>
                            </div>
                        )}

                        {/* Preferred Days */}
                        <div className="glass-card p-4 space-y-3">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">PREFERRED TRAINING DAYS</p>
                            <div className="flex gap-1.5">
                                {DAYS_OF_WEEK.map((day) => {
                                    const selected = goals.preferred_days.includes(day);
                                    return (
                                        <button key={day} onClick={() => updateGoal("preferred_days", selected ? goals.preferred_days.filter((d) => d !== day) : [...goals.preferred_days, day])}
                                            className={`flex-1 text-[10px] font-mono py-2.5 rounded-lg border transition ${selected ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/30 hover:text-white/60"}`}>
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[8px] font-mono text-white/20">{goals.preferred_days.length} days selected</p>
                        </div>

                        {/* Training Goal (legacy field) */}
                        <div className="glass-card p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">TRAINING STYLE</p>
                            <CustomSelect
                                options={GOAL_OPTIONS}
                                value={data.goal}
                                onChange={(v) => updateField("goal", v)}
                                placeholder="Select a style..."
                                searchable={false}
                            />
                        </div>

                        {/* Target Lifts */}
                        <div className="glass-card p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">TARGET LIFTS</p>
                            <p className="text-[9px] font-mono text-white/25 mb-3">Set weight goals for specific exercises. You'll get notified when you hit them.</p>

                            {targetLifts.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {targetLifts.map((lift) => (
                                        <div key={lift.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${lift.achieved ? "border-emerald-400/30 bg-emerald-400/[0.05]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold ${lift.achieved ? "text-emerald-300" : "text-white/80"}`}>{lift.exercise_name}</p>
                                                <p className="text-[10px] font-mono text-white/30">Target: {Math.round(kgToUnit(lift.target_weight, wUnit))} {weightUnit}</p>
                                            </div>
                                            {lift.achieved ? (
                                                <span className="text-[9px] font-mono text-emerald-300 px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20">ACHIEVED</span>
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
                                    className="w-20 shrink-0 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono py-2.5 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                <button onClick={addTargetLift} disabled={!newLiftExercise || !newLiftWeight}
                                    className="shrink-0 w-11 h-11 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] flex items-center justify-center hover:bg-[rgb(var(--accent-rgb)/0.1)] disabled:opacity-30 transition">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ TRAINING ══════════ */}
                {section === "training" && (
                    <div className="space-y-4">
                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">TRAINING PROFILE</p>

                            <div>
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">EXPERIENCE LEVEL</label>
                                <div className="flex gap-2">
                                    {["beginner", "intermediate", "advanced"].map((lvl) => (
                                        <button key={lvl} onClick={() => updateField("experience", lvl)}
                                            className={`flex-1 text-[10px] font-mono py-2.5 rounded-lg border transition ${data.experience === lvl ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"
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
                                <label className="text-[9px] font-mono text-white/30 mb-1 block">PREFERRED WORKOUT TIME</label>
                                <div className="flex gap-2">
                                    {[{ value: "morning", label: "MORNING", sub: "5-9 AM" }, { value: "afternoon", label: "AFTERNOON", sub: "12-5 PM" }, { value: "evening", label: "EVENING", sub: "5-10 PM" }].map((t) => (
                                        <button key={t.value} onClick={() => updateField("workout_time_pref", t.value)}
                                            className={`flex-1 text-center py-2.5 rounded-lg border transition ${data.workout_time_pref === t.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"
                                                }`}>
                                            <p className="text-[10px] font-mono">{t.label}</p>
                                            <p className="text-[8px] font-mono text-white/20">{t.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Equipment Access */}
                        <div className="glass-card p-4 space-y-3">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">EQUIPMENT ACCESS</p>
                            <p className="text-[9px] font-mono text-white/25">Select the equipment you have available. Exercise suggestions will be filtered accordingly.</p>
                            <div className="flex flex-wrap gap-2">
                                {EQUIPMENT_LIST.map((item) => {
                                    const selected = equipmentAccess.includes(item);
                                    return (
                                        <button key={item} onClick={() => toggleEquipment(item)}
                                            className={`text-[10px] font-mono px-3 py-2 rounded-lg border transition ${
                                                selected
                                                    ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]"
                                                    : "border-white/10 text-white/30 hover:text-white/60"
                                            }`}>
                                            {selected ? "✓ " : ""}{item}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[8px] font-mono text-white/20">{equipmentAccess.length} items selected</p>
                        </div>
                    </div>
                )}

                {/* ══════════ SOCIAL ══════════ */}
                {section === "social" && (
                    <div className="glass-card p-4 space-y-4">
                        <p className="text-[10px] font-mono tracking-widest text-white/25">SOCIAL LINKS</p>

                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><AtSign size={10} /> INSTAGRAM</label>
                            <input type="text" value={data.social_instagram ?? ""} onChange={(e) => updateField("social_instagram", e.target.value)} placeholder="@username"
                                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                        </div>
                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><Globe size={10} /> X (TWITTER)</label>
                            <input type="text" value={data.social_twitter ?? ""} onChange={(e) => updateField("social_twitter", e.target.value)} placeholder="@handle"
                                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                        </div>

                    </div>
                )}

                {/* ══════════ PREFERENCES ══════════ */}
                {section === "preferences" && (
                    <div className="space-y-4">
                        {/* ── PROFILE MODE ── */}
                        <div className="relative rounded-2xl border-2 overflow-hidden transition-all duration-500"
                            style={{
                                borderColor: data.sex === "female" ? "rgba(236,72,153,0.3)" : "rgba(59,130,246,0.3)",
                                boxShadow: data.sex === "female"
                                    ? "0 0 40px -8px rgba(236,72,153,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                                    : "0 0 40px -8px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                            }}>
                            <div className="absolute inset-0 transition-all duration-500"
                                style={{
                                    background: data.sex === "female"
                                        ? "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.05))"
                                        : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05))",
                                }} />
                            <div className="relative px-5 py-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-mono tracking-widest text-white/25 mb-1">PROFILE MODE</p>
                                        <p className="text-lg font-bold transition-colors duration-300"
                                            style={{ color: data.sex === "female" ? "rgb(236,72,153)" : "rgb(96,165,250)" }}>
                                            {data.sex === "female" ? "Female" : "Male"}
                                        </p>
                                    </div>
                                    <span className="text-3xl">{data.sex === "female" ? "♀" : "♂"}</span>
                                </div>

                                <p className="text-[10px] font-mono text-white/30 mb-4 leading-relaxed">
                                    {data.sex === "female"
                                        ? "Recovery, nutrition, volume, plans, leaderboards — all calibrated for female physiology."
                                        : "Recovery, nutrition, volume, plans, leaderboards — all calibrated for male physiology."}
                                </p>

                                {/* Toggle switch */}
                                <button
                                    onClick={() => updateField("sex", data.sex === "female" ? "male" : "female")}
                                    className="w-full relative h-14 rounded-xl border transition-all duration-300 overflow-hidden"
                                    style={{
                                        borderColor: data.sex === "female" ? "rgba(236,72,153,0.2)" : "rgba(59,130,246,0.2)",
                                        background: "rgba(255,255,255,0.02)",
                                    }}>
                                    {/* Sliding indicator */}
                                    <motion.div
                                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg"
                                        animate={{ x: data.sex === "female" ? "calc(100% + 4px)" : 4 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{
                                            background: data.sex === "female"
                                                ? "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.15))"
                                                : "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))",
                                            borderWidth: 1,
                                            borderStyle: "solid",
                                            borderColor: data.sex === "female" ? "rgba(236,72,153,0.3)" : "rgba(59,130,246,0.3)",
                                        }}
                                    />
                                    <div className="relative flex h-full">
                                        <div className={`flex-1 flex items-center justify-center gap-2 transition-colors duration-300 ${data.sex !== "female" ? "text-blue-400" : "text-white/25"}`}>
                                            <span className="text-lg">♂</span>
                                            <span className="text-[11px] font-mono font-bold">MALE</span>
                                        </div>
                                        <div className={`flex-1 flex items-center justify-center gap-2 transition-colors duration-300 ${data.sex === "female" ? "text-pink-400" : "text-white/25"}`}>
                                            <span className="text-lg">♀</span>
                                            <span className="text-[11px] font-mono font-bold">FEMALE</span>
                                        </div>
                                    </div>
                                </button>

                                <p className="text-[8px] font-mono text-white/15 mt-3 text-center">
                                    Switching mode recalibrates all engines, plans, and rankings. Your workout history and progress are always preserved.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">UNITS</p>
                            <div className="flex gap-2">
                                <button onClick={() => updateField("unit_preference", "metric")}
                                    className={`flex-1 text-center py-3 rounded-lg border transition ${data.unit_preference === "metric" ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40"}`}>
                                    <p className="text-sm font-mono font-bold">METRIC</p>
                                    <p className="text-[9px] font-mono text-white/30">KG · CM · KM</p>
                                </button>
                                <button onClick={() => updateField("unit_preference", "imperial")}
                                    className={`flex-1 text-center py-3 rounded-lg border transition ${data.unit_preference === "imperial" ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40"}`}>
                                    <p className="text-sm font-mono font-bold">IMPERIAL</p>
                                    <p className="text-[9px] font-mono text-white/30">LBS · FT/IN · MI</p>
                                </button>
                            </div>
                        </div>

                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">THEME</p>
                            <div className="flex gap-2">
                                <button onClick={() => applyTheme("navy")}
                                    className={`flex-1 text-center py-3 rounded-lg border transition ${theme === "navy" ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40"}`}>
                                    <p className="text-sm font-mono font-bold">NAVY DARK</p>
                                    <p className="text-[9px] font-mono text-white/30">#050914</p>
                                </button>
                                <button onClick={() => applyTheme("oled")}
                                    className={`flex-1 text-center py-3 rounded-lg border transition ${theme === "oled" ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40"}`}>
                                    <p className="text-sm font-mono font-bold">OLED BLACK</p>
                                    <p className="text-[9px] font-mono text-white/30">#000000</p>
                                </button>
                            </div>
                        </div>

                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">ACCENT COLOR</p>
                            <div className="grid grid-cols-4 gap-2">
                                {ACCENT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.key}
                                        onClick={() => selectAccent(preset.key)}
                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition ${accent === preset.key ? "border-white/40 bg-white/[0.06]" : "border-white/10 hover:border-white/20"}`}
                                    >
                                        <span
                                            className="w-6 h-6 rounded-full border border-white/20"
                                            style={{ backgroundColor: `rgb(${preset.rgb})` }}
                                        />
                                        <span className="text-[9px] font-mono text-white/50">{preset.label.toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-4 space-y-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25">PROFILE VISIBILITY</p>
                            <div className="flex gap-2">
                                {[
                                    { value: "public", label: "PUBLIC", desc: "Visible on leaderboard", icon: Eye },
                                    { value: "friends", label: "FRIENDS", desc: "Friends only (coming soon)", icon: User },
                                    { value: "private", label: "PRIVATE", desc: "Hidden from leaderboard", icon: EyeOff },
                                ].map((opt) => (
                                    <button key={opt.value} onClick={() => updateField("profile_visibility", opt.value)}
                                        className={`flex-1 text-center py-3 rounded-lg border transition ${data.profile_visibility === opt.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40"}`}>
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
                        <div className="glass-card p-4">
                            <p className="text-[10px] font-mono tracking-widest text-white/25 mb-3">EXPORT DATA</p>
                            <p className="text-[10px] font-mono text-white/30 mb-3">Download your complete workout history as a CSV file.</p>
                            <button onClick={exportData} className="flex items-center gap-2 text-sm font-mono px-4 py-2.5 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] transition">
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
            </motion.div>

            {/* ══════════ PROFILE EDIT MODAL ══════════ */}
            {showProfileModal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowProfileModal(false)}>
                    <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#080d18] p-5 space-y-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-white/80">Edit Profile</p>
                            <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center">
                            <label
                                className="relative w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold cursor-pointer overflow-hidden group"
                                style={{ borderColor: data.avatar_color + "60", backgroundColor: data.avatar_color + "15", color: data.avatar_color }}
                            >
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (profile?.username?.[0] ?? "?").toUpperCase()
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition">
                                    {avatarUploading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Camera size={22} className="text-white" />
                                    )}
                                </div>
                                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                            </label>
                        </div>
                        {avatarError && <p className="text-[10px] font-mono text-red-400 text-center">{avatarError}</p>}

                        {/* Username */}
                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><User size={10} /> USERNAME</label>
                            <div className="flex gap-2">
                                <input
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && saveUsername()}
                                    disabled={usernameSaving}
                                    className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-white/80 focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition"
                                />
                                <button onClick={saveUsername} disabled={usernameSaving || usernameInput.trim() === profile?.username}
                                    className="shrink-0 px-4 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-light-rgb))] text-[10px] font-mono hover:bg-[rgb(var(--accent-rgb)/0.1)] disabled:opacity-30 transition">
                                    {usernameSaving ? "..." : "UPDATE"}
                                </button>
                            </div>
                            {usernameError && <p className="text-[10px] font-mono text-red-400 mt-1">{usernameError}</p>}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><Mail size={10} /> EMAIL</label>
                            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-sm font-mono text-white/40">
                                {user?.email ?? "—"}
                            </div>
                        </div>

                        {/* Mobile (placeholder for future) */}
                        <div>
                            <label className="text-[9px] font-mono text-white/30 mb-1 flex items-center gap-1"><Phone size={10} /> MOBILE NUMBER</label>
                            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-sm font-mono text-white/20 italic">
                                Coming soon
                            </div>
                        </div>

                        {/* Avatar Color */}
                        <div>
                            <p className="text-[9px] font-mono text-white/30 mb-1.5">AVATAR COLOR</p>
                            <div className="flex gap-2 flex-wrap">
                                {AVATAR_COLORS.map((color) => (
                                    <button key={color} onClick={() => updateField("avatar_color", color)}
                                        className={`w-8 h-8 rounded-lg border-2 transition ${data.avatar_color === color ? "border-white/60 scale-110" : "border-transparent hover:border-white/20"}`}
                                        style={{ backgroundColor: color + "30", borderColor: data.avatar_color === color ? color : undefined }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </main>
    );
}