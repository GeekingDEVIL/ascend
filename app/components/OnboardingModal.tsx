"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { GOAL_OPTIONS } from "../lib/goals";
import CustomSelect from "./CustomSelect";

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export default function OnboardingModal({ userId, onClose }: { userId: string; onClose: () => void }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState("");
    const [experience, setExperience] = useState<string>("beginner");
    const [frequency, setFrequency] = useState(3);
    const [saving, setSaving] = useState(false);

    // Pre-fill from whatever the user has already set (e.g. via Profile) instead of re-asking
    useEffect(() => {
        async function loadExisting() {
            const { data } = await supabase.from("profiles").select("goal, experience, training_frequency").eq("id", userId).maybeSingle();
            if (!data) return;
            if (data.goal) setGoal(data.goal);
            if (data.experience) setExperience(data.experience);
            if (data.training_frequency) setFrequency(data.training_frequency);
        }
        loadExisting();
    }, [userId]);

    async function persist() {
        setSaving(true);
        await supabase.from("profiles").update({
            goal: goal || null,
            experience,
            training_frequency: frequency,
            onboarding_completed_at: new Date().toISOString(),
        }).eq("id", userId);
        setSaving(false);
    }

    async function handleNext() {
        if (step < 4) { setStep((s) => s + 1); return; }
    }

    async function handleGoToSchedule() {
        await persist();
        onClose();
        router.push("/schedule");
    }

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="pointer-events-none fixed top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[130px]" />
            <div className="relative w-full max-w-md rounded-xl border border-cyan-400/20 bg-[#0a1120] p-6" style={{ boxShadow: "0 0 60px -12px rgba(34,211,238,0.3)" }}>
                <div className="flex items-center gap-1.5 mb-5">
                    {[1, 2, 3, 4].map((s) => (
                        <span key={s} className={`h-1 flex-1 rounded-full transition ${s <= step ? "bg-cyan-400" : "bg-white/10"}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div>
                        <div className="w-12 h-12 rounded-lg bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center mb-4">
                            <Sparkles size={22} className="text-cyan-300" />
                        </div>
                        <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-300/60 mb-1">STEP 1 OF 4</p>
                        <h2 className="text-xl font-bold text-white/95 mb-1">Welcome to ASCEND</h2>
                        <p className="text-sm text-white/40 mb-5">What's your main training goal?</p>
                        <CustomSelect options={GOAL_OPTIONS} value={goal} onChange={setGoal} placeholder="Select a goal..." searchable={false} />
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-300/60 mb-1">STEP 2 OF 4</p>
                        <h2 className="text-xl font-bold text-white/95 mb-1">Experience level</h2>
                        <p className="text-sm text-white/40 mb-5">This shapes your training volume recommendations.</p>
                        <div className="flex gap-2">
                            {EXPERIENCE_LEVELS.map((lvl) => (
                                <button key={lvl} onClick={() => setExperience(lvl)}
                                    className={`flex-1 text-[10px] font-mono py-3 rounded-lg border transition ${experience === lvl ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                                    {lvl.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-300/60 mb-1">STEP 3 OF 4</p>
                        <h2 className="text-xl font-bold text-white/95 mb-1">Training frequency</h2>
                        <p className="text-sm text-white/40 mb-5">How many days a week do you want to train?</p>
                        <label className="text-[9px] font-mono text-white/30 mb-1 block">DAYS PER WEEK: {frequency}</label>
                        <input type="range" min="1" max="7" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full accent-cyan-400" />
                        <div className="flex justify-between text-[8px] font-mono text-white/20 mt-0.5">
                            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-300/60 mb-1">STEP 4 OF 4</p>
                        <h2 className="text-xl font-bold text-white/95 mb-1">Ready to create your first workout plan?</h2>
                        <p className="text-sm text-white/40 mb-5">Set your weekly schedule so ASCEND knows what's next each day.</p>
                        <button onClick={handleGoToSchedule} disabled={saving} className="w-full text-sm font-bold py-3.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-50 transition" style={{ boxShadow: "0 0 20px -4px rgba(34,211,238,0.6)" }}>
                            {saving ? "SAVING..." : "GO TO SCHEDULE"}
                        </button>
                    </div>
                )}

                {step < 4 && (
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => step > 1 && setStep((s) => s - 1)}
                            disabled={step === 1}
                            className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 disabled:opacity-0 transition"
                        >
                            <ChevronLeft size={14} /> BACK
                        </button>
                        <button onClick={handleNext} className="flex items-center gap-1.5 text-sm font-mono font-bold px-5 py-2.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition">
                            NEXT <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
