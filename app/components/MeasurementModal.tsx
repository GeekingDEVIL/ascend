"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthProvider";

export type MeasurementType = "Biceps" | "Abs" | "Waist" | "Chest" | "Shoulders" | "Thigh" | "Calf";

const TICK_PX = 14; // spacing between whole-cm ticks
const MIN_CM = 20;
const MAX_CM = 200;

function RulerSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startValue = useRef(value);

    function clamp(v: number) { return Math.max(MIN_CM, Math.min(MAX_CM, v)); }

    function handlePointerDown(e: React.PointerEvent) {
        dragging.current = true;
        startX.current = e.clientX;
        startValue.current = value;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
    function handlePointerMove(e: React.PointerEvent) {
        if (!dragging.current) return;
        const dx = e.clientX - startX.current;
        const delta = -dx / TICK_PX; // drag left = increase (ruler moves left under fixed center marker)
        const next = Math.round(clamp(startValue.current + delta) * 2) / 2;
        onChange(next);
    }
    function handlePointerUp() { dragging.current = false; }

    const ticks = [];
    for (let cm = Math.floor(MIN_CM); cm <= MAX_CM; cm++) ticks.push(cm);
    const offset = -(value - MIN_CM) * TICK_PX;

    return (
        <div className="relative h-16 overflow-hidden select-none touch-none" ref={trackRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[rgb(var(--accent-rgb))] z-10" style={{ boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.8)" }} />
            <div className="absolute top-0 left-1/2 h-full flex items-end pb-2 transition-transform" style={{ transform: `translateX(calc(-50% + ${offset}px))` }}>
                {ticks.map((cm) => (
                    <div key={cm} className="flex flex-col items-center shrink-0" style={{ width: TICK_PX }}>
                        <div className={`w-px ${cm % 5 === 0 ? "h-4 bg-white/30" : "h-2.5 bg-white/15"}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MeasurementModal({
    type, lastValue, onClose, onSaved,
}: {
    type: MeasurementType;
    lastValue: number | null;
    onClose: () => void;
    onSaved: (type: MeasurementType, value: number) => void;
}) {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [value, setValue] = useState(lastValue ?? 40);
    const [saving, setSaving] = useState(false);

    useEffect(() => setMounted(true), []);

    async function save() {
        if (!user) return;
        setSaving(true);
        await supabase.from("body_measurements").insert({ user_id: user.id, type, value_cm: value });
        setSaving(false);
        onSaved(type, value);
        onClose();
    }

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-t-2xl border-t border-[rgb(var(--accent-rgb)/0.25)] bg-[#0a1120] pb-6" style={{ boxShadow: "0 -20px 60px -12px rgb(var(--accent-rgb) / 0.3)" }}>
                <div className="w-9 h-1 rounded-full bg-white/15 mx-auto mt-3 mb-2" />
                <div className="flex items-center justify-between px-5 mb-2">
                    <p className="text-xs font-mono tracking-[0.2em] text-white/50">{type.toUpperCase()}</p>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/80 transition"><X size={16} /></button>
                </div>

                <div className="text-center px-5">
                    <p className="text-[10px] font-mono text-white/30 mb-4">Last: {lastValue !== null ? `${lastValue} cm` : "— —"}</p>

                    <div className="flex items-center justify-center gap-5 mb-4">
                        <button onClick={() => setValue((v) => Math.max(MIN_CM, Math.round((v - 0.5) * 2) / 2))} className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 text-lg font-bold text-white/70 hover:text-white transition">−</button>
                        <div>
                            <span className="text-4xl font-bold font-mono text-white/95">{value.toFixed(1)}</span>
                            <span className="text-sm font-mono text-white/30 ml-1">cm</span>
                        </div>
                        <button onClick={() => setValue((v) => Math.min(MAX_CM, Math.round((v + 0.5) * 2) / 2))} className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 text-lg font-bold text-white/70 hover:text-white transition">+</button>
                    </div>

                    <RulerSlider value={value} onChange={setValue} />

                    <button onClick={save} disabled={saving} className="w-full text-sm font-bold py-3.5 rounded-lg bg-[rgb(var(--accent-rgb))] text-black hover:bg-[rgb(var(--accent-light-rgb))] disabled:opacity-50 transition mt-5" style={{ boxShadow: "0 0 20px -4px rgb(var(--accent-rgb) / 0.6)" }}>
                        {saving ? "SAVING..." : "SAVE MEASUREMENT"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
