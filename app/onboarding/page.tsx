"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight, ChevronLeft, Sparkles, Building2, Home, PersonStanding, Dumbbell,
    Target, BarChart3, Boxes, Weight, CircleDot, Cable, Waves, Shapes,
    Compass, ArrowUp, ArrowDown, Grid2x2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthProvider";
import { GOAL_OPTIONS } from "../lib/goals";
import CustomSelect from "../components/CustomSelect";

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const CHALLENGE_OPTIONS = [
    { value: "consistency", label: "Staying motivated and consistent" },
    { value: "guidance", label: "Not getting enough guidance" },
    { value: "variety", label: "Keeping my workouts interesting" },
    { value: "time", label: "Finding time to train" },
];

const CHALLENGE_MICROCOPY: Record<string, string> = {
    consistency: "Having a plan for every workout makes it easier to stay consistent.",
    guidance: "ASCEND gives you a structured plan and set targets for every exercise.",
    variety: "Templates and freestyle sessions keep your training varied.",
    time: "Your plan adapts to the session length you tell us works for you.",
};

const FOCUS_OPTIONS = [
    { value: "full_body_balance", label: "Full Body Balance", desc: "Recommended for optimal results", icon: Compass, recommended: true },
    { value: "upper_body_focus", label: "Upper Body Focus", desc: "More exercises and sets for upper body", icon: ArrowUp },
    { value: "lower_body_focus", label: "Lower Body Focus", desc: "More exercises and sets for lower body", icon: ArrowDown },
    { value: "core_focus", label: "Core Focus", desc: "More core exercises and sets", icon: Grid2x2 },
];

const GYM_TYPES = [
    { value: "commercial_gym", label: "Commercial Gym", desc: "Full equipment — machines, free weights, cables", icon: Building2 },
    { value: "small_gym", label: "Small Gym", desc: "Limited equipment, mostly free weights", icon: Dumbbell },
    { value: "home_gym", label: "Home Gym", desc: "Your own equipment at home", icon: Home },
    { value: "bodyweight_only", label: "Bodyweight Only", desc: "No equipment — just you", icon: PersonStanding },
];

const EQUIPMENT_GROUPS = [
    { label: "FREE WEIGHTS", items: [
        { value: "Barbell", icon: Dumbbell },
        { value: "Dumbbell", icon: Weight },
        { value: "Kettlebell", icon: CircleDot },
    ] },
    { label: "MACHINES & CABLES", items: [
        { value: "Cable", icon: Cable },
        { value: "Machine", icon: Boxes },
    ] },
    { label: "BODYWEIGHT & ACCESSORIES", items: [
        { value: "Bodyweight", icon: PersonStanding },
        { value: "Resistance Band", icon: Waves },
        { value: "Other", icon: Shapes },
    ] },
];
const ALL_EQUIPMENT = EQUIPMENT_GROUPS.flatMap((g) => g.items.map((i) => i.value));

const DURATION_OPTIONS = ["15-30", "30-45", "45-60", "60-90", "90+"];

const TOTAL_STEPS = 12;

type OnboardingProfilePatch = {
    goal?: string;
    experience?: string;
    gender?: string;
    training_challenge?: string;
    date_of_birth?: string | null;
    height_cm?: number | null;
    training_focus?: string;
    gym_type?: string;
    equipment_access?: string[];
    training_frequency?: number;
    session_duration_pref?: string;
    onboarding_step?: number;
    onboarding_completed_at?: string;
};

function Toggle({ active }: { active: boolean }) {
    return (
        <span className={`relative shrink-0 w-9 h-5 rounded-full transition ${active ? "bg-[rgb(var(--accent-rgb))]" : "bg-white/10"}`}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all" style={{ left: active ? "18px" : "2px" }} />
        </span>
    );
}

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loaded, setLoaded] = useState(false);

    const [goal, setGoal] = useState("");
    const [experience, setExperience] = useState<string>("beginner");
    const [gender, setGender] = useState("");
    const [challenge, setChallenge] = useState("");
    const [dob, setDob] = useState("");
    const [heightCm, setHeightCm] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [focus, setFocus] = useState("");
    const [gymType, setGymType] = useState("");
    const [equipment, setEquipment] = useState<string[]>([]);
    const [frequency, setFrequency] = useState(3);
    const [duration, setDuration] = useState("");
    const [saving, setSaving] = useState(false);

    const weightLoggedRef = useRef(false);

    useEffect(() => {
        if (!user) return;
        async function loadExisting() {
            const { data } = await supabase
                .from("profiles")
                .select("goal, experience, gender, training_challenge, date_of_birth, height_cm, training_focus, gym_type, equipment_access, training_frequency, session_duration_pref, onboarding_step, onboarding_completed_at")
                .eq("id", user!.id)
                .maybeSingle();
            if (data?.onboarding_completed_at) {
                router.push("/");
                return;
            }
            if (data) {
                if (data.goal) setGoal(data.goal);
                if (data.experience) setExperience(data.experience);
                if (data.gender) setGender(data.gender);
                if (data.training_challenge) setChallenge(data.training_challenge);
                if (data.date_of_birth) setDob(data.date_of_birth);
                if (data.height_cm != null) setHeightCm(String(data.height_cm));
                if (data.training_focus) setFocus(data.training_focus);
                if (data.gym_type) setGymType(data.gym_type);
                if (data.equipment_access) setEquipment(data.equipment_access);
                if (data.training_frequency) setFrequency(data.training_frequency);
                if (data.session_duration_pref) setDuration(data.session_duration_pref);
                if (data.onboarding_step && data.onboarding_step >= 1 && data.onboarding_step <= TOTAL_STEPS) {
                    setStep(data.onboarding_step);
                }
            }
            setLoaded(true);
        }
        loadExisting();
    }, [user, router]);

    async function persist(patch: OnboardingProfilePatch) {
        if (!user) return;
        await supabase.from("profiles").update(patch).eq("id", user.id);
    }

    function currentPatch(): OnboardingProfilePatch {
        return {
            goal: goal || undefined,
            experience,
            gender: gender || undefined,
            training_challenge: challenge || undefined,
            date_of_birth: dob || undefined,
            height_cm: heightCm ? Number(heightCm) : undefined,
            training_focus: focus || undefined,
            gym_type: gymType || undefined,
            equipment_access: equipment,
            training_frequency: frequency,
            session_duration_pref: duration || undefined,
        };
    }

    async function logWeightIfNeeded() {
        if (weightLoggedRef.current || !weightKg || !user) return;
        weightLoggedRef.current = true;
        await supabase.from("body_weight_logs").insert({ user_id: user.id, weight: Number(weightKg), context: "onboarding" });
    }

    async function handleNext() {
        if (step === 5) await logWeightIfNeeded();
        if (step >= TOTAL_STEPS) return;
        setSaving(true);
        await persist({ ...currentPatch(), onboarding_step: step + 1 });
        setSaving(false);
        setStep((s) => s + 1);
    }

    async function handleBack() {
        if (step <= 1) return;
        await persist({ onboarding_step: step - 1 });
        setStep((s) => s - 1);
    }

    function toggleEquipment(item: string) {
        setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
    }

    async function handleGoToSchedule() {
        setSaving(true);
        await logWeightIfNeeded();
        await persist({ ...currentPatch(), onboarding_step: TOTAL_STEPS, onboarding_completed_at: new Date().toISOString() });
        setSaving(false);
        router.push("/schedule");
    }

    if (!loaded) {
        return (
            <div className="min-h-screen bg-[#050914] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[rgb(var(--accent-rgb)/0.4)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" />
            </div>
        );
    }

    function StepHeader({ n, skippable }: { n: number; skippable?: boolean }) {
        return (
            <div className="flex items-start justify-between mb-1">
                <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)]">STEP {n} OF {TOTAL_STEPS}</p>
                {skippable && (
                    <button onClick={handleNext} disabled={saving} className="text-[10px] font-mono text-white/30 hover:text-white/60 transition">
                        SKIP
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050914] text-white flex flex-col">
            <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[rgb(var(--accent-rgb)/0.08)] rounded-full blur-[150px]" />

            <div className="relative w-full max-w-md mx-auto px-6 pt-8 pb-8 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-6 shrink-0">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                        <span key={s} className={`h-1 flex-1 rounded-full transition ${s <= step ? "bg-[rgb(var(--accent-rgb))]" : "bg-white/10"}`} />
                    ))}
                </div>

                <div className="flex-1">
                    {step === 1 && (
                        <div>
                            <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-light-rgb)/0.3)] flex items-center justify-center mb-4">
                                <Sparkles size={22} className="text-[rgb(var(--accent-light-rgb))]" />
                            </div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 1 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Welcome to ASCEND</h2>
                            <p className="text-sm text-white/40 mb-6">What's your main training goal?</p>
                            <CustomSelect options={GOAL_OPTIONS} value={goal} onChange={setGoal} placeholder="Select a goal..." searchable={false} />
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 2 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Experience level</h2>
                            <p className="text-sm text-white/40 mb-6">This shapes your training volume recommendations.</p>
                            <div className="flex gap-2">
                                {EXPERIENCE_LEVELS.map((lvl) => (
                                    <button key={lvl} onClick={() => setExperience(lvl)}
                                        className={`flex-1 text-[10px] font-mono py-3 rounded-lg border transition ${experience === lvl ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                                        {lvl.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <StepHeader n={3} skippable />
                            <h2 className="text-2xl font-bold text-white/95 mb-1">What's your gender?</h2>
                            <p className="text-sm text-white/40 mb-6">Helps calibrate stats and benchmarks.</p>
                            <div className="grid grid-cols-2 gap-2">
                                {GENDER_OPTIONS.map((g) => (
                                    <button key={g} onClick={() => setGender(g)}
                                        className={`text-sm font-mono py-3 rounded-lg border transition ${gender === g ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <StepHeader n={4} skippable />
                            <h2 className="text-2xl font-bold text-white/95 mb-1">What's your major challenge at the gym?</h2>
                            <p className="text-sm text-white/40 mb-6">Helps us know what to help you with most.</p>
                            <div className="space-y-2">
                                {CHALLENGE_OPTIONS.map((c) => (
                                    <button key={c.value} onClick={() => setChallenge(c.value)}
                                        className={`w-full text-left text-sm font-mono py-3 px-3.5 rounded-lg border transition ${challenge === c.value ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/70 hover:text-white/90 hover:border-white/20"}`}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                            {challenge && (
                                <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.06)] px-3.5 py-3">
                                    <span className="text-base leading-none">💪</span>
                                    <p className="text-xs text-white/60">{CHALLENGE_MICROCOPY[challenge]}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 5 && (
                        <div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 5 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Body stats</h2>
                            <p className="text-sm text-white/40 mb-6">Used for BMI, volume calibration, and progress tracking.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">DATE OF BIRTH</label>
                                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-sm font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">HEIGHT (CM)</label>
                                    <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="—"
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-mono text-white/30 mb-1 block">CURRENT WEIGHT (KG)</label>
                                    <input type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="—"
                                        className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-base font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] transition" />
                                </div>
                            </div>
                            <p className="text-[10px] text-white/25 mt-2">You can fine-tune units and target weight later in Profile.</p>
                        </div>
                    )}

                    {step === 6 && (
                        <div>
                            <StepHeader n={6} skippable />
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Choose a balanced or focused plan</h2>
                            <p className="text-sm text-white/40 mb-6">This shapes exercise selection in your templates.</p>
                            <div className="space-y-2">
                                {FOCUS_OPTIONS.map((f) => {
                                    const Icon = f.icon;
                                    const active = focus === f.value;
                                    return (
                                        <button key={f.value} onClick={() => setFocus(f.value)}
                                            className={`w-full flex items-center gap-3 text-left px-3.5 py-3 rounded-lg border transition ${active ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)]" : "border-white/10 hover:border-white/20"}`}>
                                            <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${active ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb))]" : "bg-white/5 text-white/40"}`}>
                                                <Icon size={17} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className={`block text-sm font-bold ${active ? "text-white/95" : "text-white/80"}`}>{f.label}</span>
                                                <span className={`block text-[11px] truncate ${f.recommended ? "text-[rgb(var(--accent-light-rgb)/0.7)]" : "text-white/40"}`}>{f.desc}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 7 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Where do you train?</h2>
                            <p className="text-sm text-white/40 mb-6">This tailors which equipment we'll suggest.</p>
                            <div className="space-y-2">
                                {GYM_TYPES.map((g) => {
                                    const Icon = g.icon;
                                    const active = gymType === g.value;
                                    return (
                                        <button key={g.value} onClick={() => setGymType(g.value)}
                                            className={`w-full flex items-center gap-3 text-left px-3.5 py-3 rounded-lg border transition ${active ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)]" : "border-white/10 hover:border-white/20"}`}>
                                            <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${active ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb))]" : "bg-white/5 text-white/40"}`}>
                                                <Icon size={17} />
                                            </span>
                                            <span className="min-w-0">
                                                <span className={`block text-sm font-bold ${active ? "text-white/95" : "text-white/80"}`}>{g.label}</span>
                                                <span className="block text-[11px] text-white/40 truncate">{g.desc}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 8 && (
                        <div>
                            <StepHeader n={8} skippable />
                            <h2 className="text-2xl font-bold text-white/95 mb-1">What equipment do you have access to?</h2>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-white/40">Toggle what you have. Editable later in Settings.</p>
                                <button
                                    onClick={() => setEquipment((prev) => (prev.length === ALL_EQUIPMENT.length ? [] : ALL_EQUIPMENT))}
                                    className="shrink-0 text-[10px] font-mono text-[rgb(var(--accent-light-rgb)/0.7)] hover:text-[rgb(var(--accent-light-rgb))] transition ml-3">
                                    {equipment.length === ALL_EQUIPMENT.length ? "DESELECT ALL" : "SELECT ALL"}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {EQUIPMENT_GROUPS.map((group) => (
                                    <div key={group.label}>
                                        <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.5)] mb-1.5">{group.label}</p>
                                        <div className="space-y-1.5">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const active = equipment.includes(item.value);
                                                return (
                                                    <button key={item.value} onClick={() => toggleEquipment(item.value)}
                                                        className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition ${active ? "border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.06)]" : "border-white/10 bg-white/[0.02]"}`}>
                                                        <span className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center ${active ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-light-rgb))]" : "bg-white/5 text-white/40"}`}>
                                                            <Icon size={15} />
                                                        </span>
                                                        <span className={`flex-1 text-sm font-mono ${active ? "text-white/90" : "text-white/60"}`}>{item.value}</span>
                                                        <Toggle active={active} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 9 && (
                        <div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 9 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Training frequency</h2>
                            <p className="text-sm text-white/40 mb-6">How many days a week do you want to train?</p>
                            <label className="text-[9px] font-mono text-white/30 mb-1 block">DAYS PER WEEK: {frequency}</label>
                            <input type="range" min="1" max="7" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full accent-[rgb(var(--accent-rgb))]" />
                            <div className="flex justify-between text-[8px] font-mono text-white/20 mt-0.5">
                                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                            </div>
                        </div>
                    )}

                    {step === 10 && (
                        <div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 10 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Session length</h2>
                            <p className="text-sm text-white/40 mb-6">How long do you usually train for?</p>
                            <div className="grid grid-cols-2 gap-2">
                                {DURATION_OPTIONS.map((d) => (
                                    <button key={d} onClick={() => setDuration(d)}
                                        className={`text-sm font-mono py-3 rounded-lg border transition ${duration === d ? "border-[rgb(var(--accent-rgb)/0.4)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))]" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                                        {d} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 11 && (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 mx-auto rounded-lg bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-light-rgb)/0.3)] flex items-center justify-center mb-5">
                                <BarChart3 size={26} className="text-[rgb(var(--accent-light-rgb))]" />
                            </div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP 11 OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-2">Your training adapts as you go</h2>
                            <p className="text-sm text-white/40 max-w-xs mx-auto">ASCEND tracks your volume, recovery, and PRs after every session, and adjusts recommendations automatically — no manual reprogramming needed.</p>
                        </div>
                    )}

                    {step === 12 && (
                        <div>
                            <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-light-rgb)/0.3)] flex items-center justify-center mb-4">
                                <Sparkles size={22} className="text-[rgb(var(--accent-light-rgb))]" />
                            </div>
                            <p className="text-[10px] font-mono tracking-[0.2em] text-[rgb(var(--accent-light-rgb)/0.6)] mb-1">STEP {TOTAL_STEPS} OF {TOTAL_STEPS}</p>
                            <h2 className="text-2xl font-bold text-white/95 mb-1">Your Personalized Plan</h2>
                            <p className="text-sm text-white/40 mb-6">Ready to set your weekly schedule.</p>

                            <div className="grid grid-cols-2 gap-2.5 mb-2">
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-white/30 mb-1"><Target size={11} /> GOAL</span>
                                    <p className="text-sm font-bold text-white/90 truncate">{goal || "—"}</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-white/30 mb-1"><BarChart3 size={11} /> LEVEL</span>
                                    <p className="text-sm font-bold text-white/90 capitalize truncate">{experience}</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-white/30 mb-1"><Boxes size={11} /> EQUIPMENT</span>
                                    <p className="text-sm font-bold text-white/90 truncate">{equipment.length > 0 ? `${equipment.length} selected` : "None"}</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-white/30 mb-1"><Dumbbell size={11} /> FREQUENCY</span>
                                    <p className="text-sm font-bold text-white/90 truncate">{frequency}x / week</p>
                                </div>
                            </div>

                            <button onClick={handleGoToSchedule} disabled={saving} className="w-full text-sm font-bold py-3.5 rounded-lg bg-[rgb(var(--accent-rgb))] text-black hover:bg-[rgb(var(--accent-light-rgb))] disabled:opacity-50 transition mt-3" style={{ boxShadow: "0 0 20px -4px rgb(var(--accent-rgb) / 0.6)" }}>
                                {saving ? "SAVING..." : "GO TO SCHEDULE"}
                            </button>
                        </div>
                    )}
                </div>

                {step < TOTAL_STEPS && (
                    <div className="flex items-center justify-between pt-8 shrink-0">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 disabled:opacity-0 transition"
                        >
                            <ChevronLeft size={14} /> BACK
                        </button>
                        <button onClick={handleNext} disabled={saving} className="flex items-center gap-1.5 text-sm font-mono font-bold px-6 py-3 rounded-lg bg-[rgb(var(--accent-rgb))] text-black hover:bg-[rgb(var(--accent-light-rgb))] disabled:opacity-50 transition">
                            {saving ? "..." : "NEXT"} {!saving && <ChevronRight size={14} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
