"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Play, X, RefreshCw, Pause, SkipForward, ChevronDown, Moon, Flame, Dumbbell, Timer, TrendingUp, Share2, Trash2, Ban, Calendar, Pencil, Undo2, Minus } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import CubeLoader from "../../components/ui/cube-loader";
import AddExerciseModal from "../../components/AddExerciseModal";
import SwipeNav from "../../components/ui/swipe-nav";
import { useModules } from "../../lib/useModules";
import { getTrainSections } from "../../lib/navPills";
import {
    useWorkoutSession,
    formatClock,
    kgToUnit,
    isDualWeight,
    getCycleAdjustedWeight,
    type WorkoutExercise,
    type SetEntry,
} from "../../lib/useWorkoutSession";

/* ─── CARD WRAPPER ─── */
function CardPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-[var(--fg-06)] bg-[var(--fg-03)] ${className}`}>{children}</div>
    );
}

/* ─── STAT CELL ─── */
function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="glass-card px-3 py-2.5 text-center">
            <p className="text-[8px] font-mono tracking-widest text-[var(--fg-25)] mb-0.5">{label}</p>
            <p className={`text-lg font-bold font-mono ${accent ? "text-[rgb(var(--accent-rgb))]" : "text-[var(--fg-90)]"}`}>{value}</p>
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

/* ─── SPLIT-FLAP DIGIT ─── */
function FlapDigit({ digit, delay = 0 }: { digit: string; delay?: number }) {
    const isNum = /\d/.test(digit);
    const [current, setCurrent] = useState(digit);
    const [prev, setPrev] = useState(digit);
    const [flipping, setFlipping] = useState(false);
    const [highlight, setHighlight] = useState(false);
    const prevRef = useRef(digit);

    useEffect(() => {
        if (digit === prevRef.current) return;
        const old = prevRef.current;
        prevRef.current = digit;
        if (!isNum) { setCurrent(digit); setPrev(digit); return; }
        const t0 = setTimeout(() => {
            setPrev(old);
            setFlipping(true);
            setHighlight(true);
            const t1 = setTimeout(() => { setCurrent(digit); }, 150);
            const t2 = setTimeout(() => { setFlipping(false); setPrev(digit); }, 300);
            const t3 = setTimeout(() => { setHighlight(false); }, 600);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }, delay);
        return () => clearTimeout(t0);
    }, [digit, delay, isNum]);

    if (!isNum) return <span className="inline-flex items-center justify-center w-[0.3em] text-[var(--fg-15)]">{digit}</span>;

    return (
        <span className="flap-slot inline-flex relative" style={{ width: "0.65em", height: "1.3em" }}>
            {/* Embossed track */}
            <span className="absolute inset-0 rounded-[3px] flap-track" />
            {/* Bottom half (new digit, revealed by flip) */}
            <span className="absolute inset-0 flex items-center justify-center flap-digit-text" style={{ clipPath: "inset(50% 0 0 0)" }}>
                {current}
            </span>
            {/* Top half (always current) */}
            <span className={`absolute inset-0 flex items-center justify-center flap-digit-text ${highlight ? "flap-highlight" : ""}`} style={{ clipPath: "inset(0 0 50% 0)" }}>
                {current}
            </span>
            {/* Flipping flap (top half of old digit, flips down) */}
            {flipping && (
                <span className="absolute inset-0 flex items-center justify-center flap-digit-text flap-flip" style={{ clipPath: "inset(0 0 50% 0)", transformOrigin: "bottom center" }}>
                    {prev}
                </span>
            )}
            {/* Center hairline */}
            <span className="absolute left-[1px] right-[1px] top-1/2 h-px bg-[var(--fg-06)]" />
        </span>
    );
}

function FlapNumber({ value, suffix = "", accent = false }: { value: string; suffix?: string; accent?: boolean }) {
    const chars = value.split("");
    const len = chars.length;
    return (
        <span className={`inline-flex items-center font-mono font-bold tabular-nums gap-px ${accent ? "flap-accent" : ""}`}>
            {chars.map((ch, i) => <FlapDigit key={`${len}-${i}`} digit={ch} delay={(len - 1 - i) * 60} />)}
            {suffix && <span className="text-[0.4em] font-medium text-[var(--fg-25)] self-end mb-[0.15em] ml-1">{suffix}</span>}
        </span>
    );
}

function DeltaToast({ value }: { value: number }) {
    const [show, setShow] = useState(true);
    useEffect(() => { const t = setTimeout(() => setShow(false), 1500); return () => clearTimeout(t); }, []);
    if (!show || value <= 0) return null;
    return (
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold text-emerald-400 animate-delta-fly pointer-events-none whitespace-nowrap">
            +{Math.round(value).toLocaleString()}
        </span>
    );
}

/* ─── MINI RUNE CIRCLE PROGRESS ─── */
const RUNE_PATHS = [
    "M8 16V4M8 4L3 0M8 4L13 0",      // Algiz
    "M8 16V0M8 0L3 5M8 0L13 5",      // Tiwaz
    "M3 0L13 8L3 16",                  // Kenaz
    "M8 0L16 8L8 16L0 8Z",            // Ingwaz
    "M0 0H16L0 16H16M0 0V16M16 0V16", // Dagaz
    "M4 16V6L8 0L12 6V16M4 6H12",    // Othala
    "M3 0L13 6L3 10L13 16",           // Sowilo
    "M0 16V0L8 10L16 0V16",           // Ehwaz
    "M3 16V0M3 0L13 4M3 7L13 11",    // Fehu
    "M4 16V0M4 0H12L12 8H4",         // Wunjo
    "M4 16V0H11L11 7H4M8 7L13 16",   // Raido
    "M0 0L16 16M16 0L0 16",           // Gebo
    "M3 0V16M13 0V16M3 8H13",        // Hagalaz
    "M8 0V16M4 0H12M4 16H12",        // Isa
    "M8 0V16M3 5L13 11",             // Nauthiz
    "M4 16V0M4 4L12 8M4 8L12 12",   // Ansuz
];

function MiniRuneCircle({ completed, total, circleSize = 64 }: { completed: number; total: number; circleSize?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef({
        prevCompleted: completed,
        flashRunes: new Map<number, number>(),
        shimmerAngle: 0,
        revealProgress: new Map<number, number>(),
        globalRotation: 0,
    });
    const frameRef = useRef(0);
    const accentRef = useRef("45, 212, 191");

    const cTotal = Math.max(total, 1);
    const cCompleted = Math.min(completed, cTotal);
    const SIZE = circleSize;
    const RADIUS = SIZE * 0.36;
    const GLYPH_SIZE = Math.max(5, SIZE * 0.09);

    const parsedPaths = useMemo(() => RUNE_PATHS.map((d) => {
        const cmds: Array<{ type: string; args: number[] }> = [];
        const re = /([MLHVZ])([^MLHVZ]*)/gi;
        let m;
        while ((m = re.exec(d)) !== null) {
            const type = m[1].toUpperCase();
            const args = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
            cmds.push({ type, args });
        }
        return cmds;
    }), []);

    function drawRune(ctx: CanvasRenderingContext2D, cmds: typeof parsedPaths[0], cx: number, cy: number, glyphSize: number, drawFraction = 1) {
        const scale = glyphSize / 16;
        const ox = cx - glyphSize / 2;
        const oy = cy - glyphSize / 2;
        let curX = 0, curY = 0;
        const segments: Array<[number, number, number, number]> = [];
        for (const { type, args } of cmds) {
            switch (type) {
                case "M": curX = args[0]; curY = args[1]; break;
                case "L": segments.push([curX, curY, args[0], args[1]]); curX = args[0]; curY = args[1]; break;
                case "H": segments.push([curX, curY, args[0], curY]); curX = args[0]; break;
                case "V": segments.push([curX, curY, curX, args[0]]); curY = args[0]; break;
                case "Z": break;
            }
        }
        const totalSegs = segments.length;
        const segsToShow = Math.ceil(totalSegs * drawFraction);
        ctx.beginPath();
        for (let si = 0; si < segsToShow; si++) {
            const [x1, y1, x2, y2] = segments[si];
            const sx1 = ox + x1 * scale, sy1 = oy + y1 * scale;
            const sx2 = ox + x2 * scale, sy2 = oy + y2 * scale;
            if (si === segsToShow - 1 && drawFraction < 1) {
                const segFrac = (drawFraction * totalSegs) - si;
                ctx.moveTo(sx1, sy1);
                ctx.lineTo(sx1 + (sx2 - sx1) * segFrac, sy1 + (sy2 - sy1) * segFrac);
            } else {
                ctx.moveTo(sx1, sy1);
                ctx.lineTo(sx2, sy2);
            }
        }
        ctx.stroke();
    }

    const getAngle = useCallback((i: number, rot: number) => (i / cTotal) * Math.PI * 2 - Math.PI / 2 + rot, [cTotal]);

    useEffect(() => {
        const st = stateRef.current;
        if (completed > st.prevCompleted) {
            const prev = st.prevCompleted;
            for (let i = prev; i < completed; i++) {
                st.flashRunes.set(i, 0);
                st.revealProgress.set(i, 0);
            }
            st.prevCompleted = completed;
        } else {
            st.prevCompleted = completed;
        }
    }, [completed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        accentRef.current = (getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim() || "45 212 191").replace(/\s+/g, ", ");

        let lastTime = 0;
        const loop = (time: number) => {
            const dt = Math.min((time - lastTime) / 1000, 0.05);
            lastTime = time;
            const st = stateRef.current;
            const accent = accentRef.current;

            const dpr = window.devicePixelRatio || 2;
            canvas.width = SIZE * dpr;
            canvas.height = SIZE * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, SIZE, SIZE);

            const mx = SIZE / 2;
            const my = SIZE / 2;

            // #7: Slow continuous rotation (~1 deg/sec)
            st.globalRotation += dt * 0.017;
            const rot = st.globalRotation;

            // Shimmer rotates around the circle (faster than base rotation)
            st.shimmerAngle = (st.shimmerAngle + dt * 1.2) % (Math.PI * 2);

            // Update flash timers (white → accent fade)
            for (const [idx, prog] of st.flashRunes) {
                const np = prog + dt * 2;
                if (np >= 1) st.flashRunes.delete(idx);
                else st.flashRunes.set(idx, np);
            }

            // Update reveal
            for (const [idx, prog] of st.revealProgress) {
                const np = prog + dt * 2.5;
                if (np >= 1) { st.revealProgress.set(idx, 1); setTimeout(() => st.revealProgress.delete(idx), 100); }
                else st.revealProgress.set(idx, np);
            }

            // --- DRAW ---
            const pulsePhase = (time / 1000) % 2.5 / 2.5;
            const pulseVal = 0.5 + Math.sin(pulsePhase * Math.PI * 2) * 0.5;

            // Ambient center glow
            if (cCompleted > 0) {
                const fraction = cCompleted / cTotal;
                const cGrad = ctx.createRadialGradient(mx, my, 0, mx, my, RADIUS * 0.55);
                cGrad.addColorStop(0, `rgba(${accent}, ${0.04 + fraction * 0.06})`);
                cGrad.addColorStop(1, `rgba(${accent}, 0)`);
                ctx.fillStyle = cGrad;
                ctx.beginPath();
                ctx.arc(mx, my, RADIUS * 0.55, 0, Math.PI * 2);
                ctx.fill();
            }

            // Background dashed circle track (no progress arc — #1)
            ctx.setLineDash([2, 6]);
            ctx.strokeStyle = `rgba(${accent}, 0.06)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(mx, my, RADIUS, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Glyphs on circle
            for (let i = 0; i < cTotal; i++) {
                const a = getAngle(i, rot);
                const gx = mx + Math.cos(a) * RADIUS;
                const gy = my + Math.sin(a) * RADIUS;
                const isActive = i < cCompleted;
                const isLatest = i === cCompleted - 1;
                const runeIdx = i % parsedPaths.length;
                const isRevealing = st.revealProgress.has(i);
                const isFlashing = st.flashRunes.has(i);

                ctx.save();
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                // #6: Dormant = faint rune outline instead of dot
                if (!isActive) {
                    ctx.strokeStyle = `rgba(${accent}, 0.07)`;
                    ctx.lineWidth = 0.8;
                    drawRune(ctx, parsedPaths[runeIdx], gx, gy, GLYPH_SIZE);
                    ctx.restore();
                    continue;
                }

                // Glyph shimmer — angular distance from shimmer position
                let angleDist = Math.abs(a - (st.shimmerAngle - Math.PI / 2 + rot));
                if (angleDist > Math.PI) angleDist = Math.PI * 2 - angleDist;
                const shimmerBoost = angleDist < 0.6 ? (1 - angleDist / 0.6) * 0.4 : 0;
                const intensity = isLatest ? 1 : Math.min(1, (0.25 + (i / Math.max(cCompleted - 1, 1)) * 0.55) + shimmerBoost);

                // Underglow pool
                const uR = isLatest ? GLYPH_SIZE * 1.8 : GLYPH_SIZE * 1.0;
                const uAlpha = isLatest ? 0.15 : 0.03 + (i / Math.max(cCompleted, 1)) * 0.06;
                const uGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, uR);
                uGrad.addColorStop(0, `rgba(${accent}, ${uAlpha})`);
                uGrad.addColorStop(1, `rgba(${accent}, 0)`);
                ctx.fillStyle = uGrad;
                ctx.beginPath();
                ctx.arc(gx, gy, uR, 0, Math.PI * 2);
                ctx.fill();

                // #5: Flash-on-reveal — starts white, fades to accent
                if (isFlashing) {
                    const fp = st.flashRunes.get(i)!;
                    const flashR = GLYPH_SIZE * (0.8 + fp * 1.2);
                    const flashAlpha = (1 - fp) * 0.5;
                    const whiteAmount = Math.max(0, 1 - fp * 2);
                    ctx.shadowColor = `rgba(255, 255, 255, ${flashAlpha * whiteAmount})`;
                    ctx.shadowBlur = 16;
                    const fg = ctx.createRadialGradient(gx, gy, 0, gx, gy, flashR);
                    fg.addColorStop(0, `rgba(${whiteAmount > 0.5 ? "255, 255, 255" : accent}, ${flashAlpha})`);
                    fg.addColorStop(1, `rgba(${accent}, 0)`);
                    ctx.fillStyle = fg;
                    ctx.beginPath();
                    ctx.arc(gx, gy, flashR, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Breathing halo on latest
                if (isLatest && !isFlashing) {
                    const haloR = GLYPH_SIZE * (0.9 + pulseVal * 0.5);
                    const haloAlpha = 0.06 + pulseVal * 0.1;
                    const hg = ctx.createRadialGradient(gx, gy, 0, gx, gy, haloR);
                    hg.addColorStop(0, `rgba(${accent}, ${haloAlpha})`);
                    hg.addColorStop(1, `rgba(${accent}, 0)`);
                    ctx.fillStyle = hg;
                    ctx.beginPath();
                    ctx.arc(gx, gy, haloR, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw the rune glyph
                const drawFrac = isRevealing ? st.revealProgress.get(i)! : 1;
                // #5: Flashing runes start white then transition to accent
                const flashProg = isFlashing ? st.flashRunes.get(i)! : 0;
                const strokeColor = isFlashing
                    ? (flashProg < 0.4
                        ? `rgba(255, 255, 255, ${1 - flashProg})`
                        : `rgba(${accent}, ${0.5 + (flashProg - 0.4) * 0.83})`)
                    : isLatest
                        ? `rgba(${accent}, ${0.7 + pulseVal * 0.3})`
                        : `rgba(${accent}, ${intensity})`;

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = isLatest ? 1.8 : 1.2;

                if (isLatest || isFlashing) {
                    ctx.shadowColor = isFlashing ? `rgba(255, 255, 255, ${0.6 * (1 - flashProg)})` : `rgba(${accent}, ${0.3 + pulseVal * 0.4})`;
                    ctx.shadowBlur = isFlashing ? 12 : 6 + pulseVal * 6;
                }

                drawRune(ctx, parsedPaths[runeIdx], gx, gy, GLYPH_SIZE, drawFrac);

                // Extra glow pass on latest
                if (isLatest && !isFlashing) {
                    ctx.strokeStyle = `rgba(${accent}, ${0.12 + pulseVal * 0.18})`;
                    ctx.lineWidth = 2.5;
                    ctx.shadowBlur = 10 + pulseVal * 8;
                    drawRune(ctx, parsedPaths[runeIdx], gx, gy, GLYPH_SIZE, drawFrac);
                }

                ctx.restore();
            }

            // #4: Percentage text in center
            const pct = cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0;
            const fontSize = Math.max(9, SIZE * 0.15);
            ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(${accent}, ${0.5 + pulseVal * 0.2})`;
            ctx.shadowColor = `rgba(${accent}, 0.3)`;
            ctx.shadowBlur = 4;
            ctx.fillText(`${pct}%`, mx, my);
            ctx.shadowBlur = 0;

            frameRef.current = requestAnimationFrame(loop);
        };
        frameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameRef.current);
    }, [cCompleted, cTotal, parsedPaths, getAngle, SIZE, RADIUS, GLYPH_SIZE]);

    return (
        <div className="flex justify-center">
            <canvas ref={canvasRef} style={{ width: `${SIZE}px`, height: `${SIZE}px` }} />
        </div>
    );
}

type ExVolumeEntry = { name: string; volume: number; color?: string };

function SessionCounterPanel({ sets, totalSets, volume, elapsed, weightUnit, lastDelta, lastSessionVolume, exerciseVolumes }: {
    sets: number; totalSets: number; volume: number; elapsed: number; weightUnit: string; lastDelta: number;
    lastSessionVolume: number; exerciseVolumes: ExVolumeEntry[];
}) {
    const volStr = Math.round(volume).toLocaleString();
    const min = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const sec = String(elapsed % 60).padStart(2, "0");
    const [deltaKey, setDeltaKey] = useState(0);
    const prevDelta = useRef(lastDelta);
    const [expanded, setExpanded] = useState(false);
    const [showCalInfo, setShowCalInfo] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lastDelta !== prevDelta.current && lastDelta > 0) {
            prevDelta.current = lastDelta;
            setDeltaKey((k) => k + 1);
        }
    }, [lastDelta]);

    useEffect(() => {
        if (!expanded) return;
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [expanded]);

    const volDiff = lastSessionVolume > 0 ? volume - lastSessionVolume : 0;
    const kcalEstimate = Math.round(volume * 0.05);
    const evs = exerciseVolumes ?? [];
    const maxExVol = Math.max(...evs.map((e) => e.volume), 1);

    return (
        <div ref={panelRef} className="rounded-2xl border border-[var(--fg-06)] overflow-hidden flap-panel">
            {/* Main counters */}
            <div className="flex items-stretch cursor-pointer" onClick={() => setExpanded((e) => !e)}>
                {/* SETS */}
                <div className="flex-1 py-3 px-2 text-center border-r border-[var(--fg-04)]">
                    <p className="text-[7px] font-mono tracking-[0.2em] text-[var(--fg-20)] mb-1.5">SETS</p>
                    <div className="text-xl leading-none">
                        <FlapNumber value={String(sets)} />
                        <span className="text-[var(--fg-12)] text-[0.5em] mx-0.5 font-mono">/</span>
                        <span className="text-[0.5em] text-[var(--fg-20)] font-mono">{totalSets}</span>
                    </div>
                </div>
                {/* VOLUME */}
                <div className="flex-[2] py-3 px-2 text-center relative">
                    <p className="text-[7px] font-mono tracking-[0.2em] text-[var(--fg-20)] mb-1.5">VOLUME</p>
                    <div className="text-2xl leading-none">
                        <FlapNumber value={volStr} suffix={weightUnit} accent />
                    </div>
                    {deltaKey > 0 && <DeltaToast key={deltaKey} value={lastDelta} />}
                    {lastSessionVolume > 0 && (
                        <p className={`text-[8px] font-mono mt-1.5 ${volDiff >= 0 ? "text-emerald-400/60" : "text-red-400/50"}`}>
                            {volDiff >= 0 ? "↑" : "↓"} {Math.abs(Math.round(volDiff)).toLocaleString()}{weightUnit} vs last
                        </p>
                    )}
                </div>
                {/* ELAPSED */}
                <div className="flex-1 py-3 px-2 text-center border-l border-[var(--fg-04)]">
                    <p className="text-[7px] font-mono tracking-[0.2em] text-[var(--fg-20)] mb-1.5">ELAPSED</p>
                    <div className="text-xl leading-none">
                        <FlapNumber value={min} />
                        <span className="text-[var(--fg-15)] mx-px animate-pulse font-mono">:</span>
                        <FlapNumber value={sec} />
                    </div>
                </div>
            </div>
            {/* Mini rune circle — tap to expand/collapse */}
            <div className="cursor-pointer border-t border-[var(--fg-04)]" onClick={() => setExpanded((e) => !e)}>
                {/* Collapsed: small circle + hint */}
                {!expanded && (
                    <div className="py-2">
                        <MiniRuneCircle completed={sets} total={totalSets} circleSize={64} />
                        <p className="text-[7px] font-mono text-[var(--fg-15)] text-center mt-0.5 tracking-wider">tap for details</p>
                    </div>
                )}
                {/* Expanded: bigger circle + merged details */}
                {expanded && (
                    <div className="py-3 space-y-3">
                        <MiniRuneCircle completed={sets} total={totalSets} circleSize={120} />
                        <div className="px-4 space-y-3">
                            {/* Calorie estimate */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-mono text-[var(--fg-25)]">EST. CALORIES</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowCalInfo((v) => !v); }}
                                        className="w-3.5 h-3.5 rounded-full border border-[var(--fg-15)] flex items-center justify-center text-[8px] font-mono text-[var(--fg-30)] hover:text-[var(--fg-60)] hover:border-[var(--fg-30)] transition"
                                    >i</button>
                                </div>
                                <span className="text-sm font-mono font-bold text-amber-400/70">{kcalEstimate} kcal</span>
                            </div>
                            {showCalInfo && (
                                <div className="text-[8px] font-mono text-[var(--fg-30)] bg-[var(--fg-03)] rounded-lg px-3 py-2 leading-relaxed">
                                    Estimated as total volume × 0.05 kcal/kg. Rough approximation based on mechanical work. Actual burn varies by exercise type, rest, body composition, and intensity.
                                </div>
                            )}
                            {/* Per-exercise volume bars */}
                            {evs.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[8px] font-mono tracking-widest text-[var(--fg-20)]">VOLUME BY EXERCISE</p>
                                    {evs.map((ev) => (
                                        <div key={ev.name} className="flex items-center gap-2">
                                            <span className="text-[9px] font-mono text-[var(--fg-40)] w-24 truncate shrink-0">{ev.name}</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-[var(--fg-06)] overflow-hidden">
                                                <div className="h-full rounded-full bg-[rgb(var(--accent-rgb))] transition-all duration-500" style={{ width: `${(ev.volume / maxExVol) * 100}%` }} />
                                            </div>
                                            <span className="text-[8px] font-mono text-[var(--fg-25)] w-12 text-right shrink-0">{Math.round(ev.volume).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── MAIN COMPONENT ─── */
export default function WorkoutPage() {
    const router = useRouter();
    const { enabledKeys } = useModules();
    const w = useWorkoutSession();
    const [editingExId, setEditingExId] = useState<string | null>(null);
    const prevVolRef = useRef(0);
    const [lastDelta, setLastDelta] = useState(0);

    useEffect(() => {
        const vol = w.sessionVolume ?? 0;
        if (vol > prevVolRef.current && prevVolRef.current > 0) {
            setLastDelta(vol - prevVolRef.current);
        }
        prevVolRef.current = vol;
    }, [w.sessionVolume]);

    /* ═══════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════ */

    // ── LOADING ──
    if (w.status === "loading") return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center relative">
            <div className="relative z-10">
                <CubeLoader message="Loading workout…" />
            </div>
        </main>
    );

    // ── REST DAY ──
    if (w.status === "rest_day") return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 relative">
            <div className="relative z-10 max-w-xl mx-auto pt-2">
                <SwipeNav sections={getTrainSections(enabledKeys)} />
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 flex items-center justify-center">
                        <Moon size={24} className="text-emerald-400" />
                    </div>
                    <p className="text-base font-semibold text-emerald-400">Rest Day</p>
                    <p className="text-[11px] text-[var(--fg-30)] mt-1.5 max-w-xs mx-auto text-center">Recovery is when your muscles grow. Nothing to log today.</p>
                </div>
            </div>
        </main>
    );

    // ── NO PLAN ──
    if (w.status === "no_plan") return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 relative">
            <div className="relative z-10 max-w-xl mx-auto pt-2">
                <SwipeNav sections={getTrainSections(enabledKeys)} />
                <div className="text-center mb-8 mt-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgb(var(--accent-rgb)/0.1)] border border-[rgb(var(--accent-rgb)/0.2)] flex items-center justify-center">
                        <Dumbbell size={24} className="text-[rgb(var(--accent-rgb))]" />
                    </div>
                    <p className="text-lg font-bold text-[var(--fg-85)]">Get Started</p>
                    <p className="text-[11px] text-[var(--fg-30)] mt-1 max-w-xs mx-auto">Choose how you want to train</p>
                </div>

                <div className="space-y-3">
                    <div className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb)/0.03)] p-4">
                        <p className="text-sm font-semibold text-[var(--fg-85)] mb-1">Create personalized plan</p>
                        <p className="text-[11px] text-[var(--fg-30)] mb-3">Build your own weekly schedule with custom exercises, sets, and rest days.</p>
                        <button onClick={() => router.push("/schedule")} className="w-full text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                            Create My Plan
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[var(--fg-03)] p-4">
                        <p className="text-sm font-semibold text-[var(--fg-85)] mb-1">Select from existing plans</p>
                        <p className="text-[11px] text-[var(--fg-30)] mb-3">Browse proven workout programs — PPL, Upper/Lower, Full Body, and more.</p>
                        <button onClick={() => router.push("/schedule?browse=1")} className="w-full text-sm font-semibold py-3 rounded-xl border border-[rgb(var(--accent-rgb)/0.3)] text-[rgb(var(--accent-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.05)] transition">
                            Browse Plan Library
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[var(--fg-06)] bg-[var(--fg-03)] p-4">
                        <p className="text-sm font-semibold text-[var(--fg-85)] mb-1">Just train today</p>
                        <p className="text-[11px] text-[var(--fg-30)] mb-3">No plan needed — pick exercises and log as you go.</p>
                        <button onClick={() => w.setStatus("freestyle")} className="w-full text-sm font-medium py-3 rounded-xl border border-[var(--fg-10)] text-[var(--fg-60)] hover:text-[var(--fg-90)] hover:bg-[var(--fg-05)] transition">
                            Start Freestyle Session
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );

    // ── FREESTYLE (BUILD) ──
    if (w.status === "freestyle") return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24 relative">
            <div className="relative z-10 max-w-xl mx-auto px-4 pt-6">
                <button onClick={w.goBackFromFreestyle} className="text-[10px] font-mono text-[var(--fg-30)] hover:text-[var(--fg-60)] transition mb-4">
                    ← Back
                </button>
                <h1 className="text-xl font-bold font-display text-[rgb(var(--accent-light-rgb))] mb-1">Freestyle Session</h1>
                <p className="text-[11px] text-[var(--fg-30)] mb-5">Pick exercises and start training</p>

                <button onClick={() => w.setShowFreestyleAddModal(true)} className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl border border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.05)] text-[rgb(var(--accent-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] transition mb-4">
                    <Plus size={16} /> Add Exercise
                </button>

                {w.freestyleExercises.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[11px] text-[var(--fg-25)]">No exercises added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-6">
                        {w.freestyleExercises.map((ex, i) => (
                            <div key={ex.id} className="flex items-center gap-3 glass-card px-4 py-3">
                                <span className="text-[10px] font-mono text-[var(--fg-20)] w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-[var(--fg-80)] truncate">{ex.name}</p>
                                    <p className="text-[9px] font-mono text-[var(--fg-25)]">{ex.body_segment}</p>
                                </div>
                                <button onClick={() => w.removeFreestyleExercise(ex.id)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--fg-20)] hover:text-red-400 transition">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {w.freestyleExercises.length > 0 && (
                    <button
                        onClick={w.beginFreestyleSession}
                        disabled={w.startingFreestyle}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 disabled:opacity-50 transition"
                    >
                        <Play size={16} fill="black" /> {w.startingFreestyle ? "Starting..." : "Begin Session"}
                    </button>
                )}
            </div>

            {w.showFreestyleAddModal && <AddExerciseModal onAdd={w.addFreestyleExercise} onClose={() => w.setShowFreestyleAddModal(false)} existingIds={new Set(w.freestyleExercises.map((e) => e.exercise_id))} />}
        </main>
    );

    // ── COMPLETED ──
    if (w.status === "completed" && w.summary) {
        const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        const todayDayIdx = (new Date().getDay() + 6) % 7;
        const doneCount = w.weekDays.filter(Boolean).length;
        const weekPct = Math.round((doneCount / 7) * 100);
        const r = 28;
        const circ = 2 * Math.PI * r;
        const offset = circ - (weekPct / 100) * circ;

        return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 relative">
            <div className="relative z-10 w-full max-w-xl mx-auto pt-2 space-y-3">
                <SwipeNav sections={getTrainSections(enabledKeys)} />

                {/* Session Complete Hero */}
                <CardPanel className="p-5">
                    <div className="text-center mb-5">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Check size={22} className="text-emerald-400" />
                        </div>
                        <p className="text-[9px] font-mono tracking-widest text-[var(--fg-25)] mb-1">COMPLETED TODAY</p>
                        <p className="text-lg font-bold text-[var(--fg-90)]">{w.dayTitle}</p>
                    </div>

                    {w.cycleProfile && (
                        <div className={`rounded-lg px-3 py-2 mb-3 border ${
                            w.cycleProfile.banner.color === "rose" ? "border-rose-500/15 bg-rose-500/[0.04]" :
                            w.cycleProfile.banner.color === "emerald" ? "border-emerald-500/15 bg-emerald-500/[0.04]" :
                            w.cycleProfile.banner.color === "amber" ? "border-amber-500/15 bg-amber-500/[0.04]" :
                            "border-violet-500/15 bg-violet-500/[0.04]"
                        }`}>
                            <p className={`text-[9px] font-mono text-center ${
                                w.cycleProfile.banner.color === "rose" ? "text-rose-400/60" :
                                w.cycleProfile.banner.color === "emerald" ? "text-emerald-400/60" :
                                w.cycleProfile.banner.color === "amber" ? "text-amber-400/60" :
                                "text-violet-400/60"
                            }`}>
                                Trained in {w.cycleProfile.phase} phase · Day {w.cycleProfile.cycleDay} · {w.cycleProfile.styleName}
                            </p>
                        </div>
                    )}

                    {/* Per-session cards when multiple sessions today */}
                    {w.todaySessions.length > 1 ? (
                        <div className="space-y-2 mb-4">
                            {w.todaySessions.map((s, i) => (
                                <div key={s.id} className="glass-card p-3">
                                    <p className="text-[8px] font-mono tracking-widest text-[var(--fg-25)] mb-2">SESSION {i + 1}</p>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div><p className="text-[8px] font-mono text-[var(--fg-25)]">TIME</p><p className="text-sm font-bold font-mono text-[var(--fg-80)]">{formatClock(s.duration)}</p></div>
                                        <div><p className="text-[8px] font-mono text-[var(--fg-25)]">SETS</p><p className="text-sm font-bold font-mono text-[var(--fg-80)]">{s.sets}</p></div>
                                        <div><p className="text-[8px] font-mono text-[var(--fg-25)]">VOL</p><p className="text-sm font-bold font-mono text-[var(--fg-80)]">{Math.round(kgToUnit(s.volume, w.weightUnit)).toLocaleString()}</p></div>
                                        <div><p className="text-[8px] font-mono text-[rgb(var(--accent-rgb)/0.5)]">XP</p><p className="text-sm font-bold font-mono text-[rgb(var(--accent-rgb))]">+{s.xp}</p></div>
                                    </div>
                                </div>
                            ))}
                            <div className="rounded-xl border border-[rgb(var(--accent-rgb)/0.15)] bg-[rgb(var(--accent-rgb)/0.05)] p-3">
                                <p className="text-[8px] font-mono tracking-widest text-[rgb(var(--accent-rgb)/0.5)] mb-2">TODAY&apos;S TOTAL</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div><p className="text-[8px] font-mono text-[var(--fg-25)]">SESSIONS</p><p className="text-sm font-bold font-mono text-[var(--fg-80)]">{w.todaySessions.length}</p></div>
                                    <div><p className="text-[8px] font-mono text-[var(--fg-25)]">TOTAL SETS</p><p className="text-sm font-bold font-mono text-[var(--fg-80)]">{w.todaySessions.reduce((a, s) => a + s.sets, 0)}</p></div>
                                    <div><p className="text-[8px] font-mono text-[rgb(var(--accent-rgb)/0.5)]">TOTAL XP</p><p className="text-sm font-bold font-mono text-[rgb(var(--accent-rgb))]">+{w.todaySessions.reduce((a, s) => a + s.xp, 0)}</p></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <StatCell label="DURATION" value={formatClock(w.summary.duration)} />
                            <StatCell label="SETS" value={String(w.summary.sets)} />
                            <StatCell label="VOLUME" value={`${Math.round(kgToUnit(w.summary.volume, w.weightUnit)).toLocaleString()} ${w.weightUnit}`} />
                            <StatCell label="XP EARNED" value={`+${w.summary.xpBreakdown.total}`} accent />
                        </div>
                    )}

                    <p className="text-[10px] font-mono text-[var(--fg-20)] text-center mb-4">Nice work! You can start another session or come back tomorrow.</p>

                    <div className="flex gap-2">
                        <button onClick={() => router.push("/schedule")} className="flex-1 text-sm font-medium py-3 rounded-xl border border-[var(--fg-08)] text-[var(--fg-50)] hover:text-[var(--fg-80)] hover:bg-[var(--fg-05)] transition">
                            <Calendar size={14} className="inline -mt-0.5 mr-1.5" />Schedule
                        </button>
                        <button onClick={() => router.push("/progress")} className="flex-1 text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                            View Progress
                        </button>
                        <button onClick={w.handleShare} disabled={w.sharing} title="Share" className="shrink-0 w-11 flex items-center justify-center rounded-xl border border-[var(--fg-08)] text-[var(--fg-30)] hover:text-[var(--fg-60)] disabled:opacity-40 transition">
                            {w.sharing ? <div className="w-4 h-4 border-2 border-[var(--fg-20)] border-t-[rgb(var(--accent-rgb))] rounded-full animate-spin" /> : <Share2 size={14} />}
                        </button>
                    </div>
                    {w.todaySessions.length >= w.MAX_SESSIONS_PER_DAY ? (
                        <p className="w-full mt-2 text-[10px] font-mono py-2.5 text-center text-[var(--fg-20)]">
                            Daily session limit reached ({w.MAX_SESSIONS_PER_DAY}/{w.MAX_SESSIONS_PER_DAY})
                        </p>
                    ) : (
                        <button
                            onClick={w.startAnotherWorkout}
                            className="w-full mt-2 text-[10px] font-mono py-2.5 rounded-xl border border-[var(--fg-06)] text-[var(--fg-30)] hover:text-[var(--fg-60)] hover:border-[var(--fg-15)] transition"
                        >
                            Start another workout ({w.todaySessions.length}/{w.MAX_SESSIONS_PER_DAY})
                        </button>
                    )}
                </CardPanel>

                {/* Recent Sessions */}
                {w.statsLoaded && w.recentSessions.length > 0 && (
                    <CardPanel className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)]">RECENT SESSIONS</p>
                            <button onClick={() => router.push("/progress")} className="text-[9px] font-mono text-[rgb(var(--accent-rgb)/0.5)] hover:text-[rgb(var(--accent-rgb))] transition">View All</button>
                        </div>
                        <div className="space-y-0.5">
                            {w.recentSessions.map((s) => {
                                const d = new Date(s.date + "T12:00:00");
                                const now = new Date();
                                const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
                                const label = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                return (
                                    <div key={s.id} className="flex items-center justify-between py-2 px-1">
                                        <span className="text-sm text-[var(--fg-70)] truncate flex-1 min-w-0">{s.title}</span>
                                        <span className="text-xs font-mono text-[var(--fg-25)] shrink-0 ml-2">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardPanel>
                )}

                {/* This Week Ring */}
                {w.statsLoaded && (
                    <CardPanel className="p-4">
                        <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-3">THIS WEEK</p>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative w-16 h-16 shrink-0">
                                <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r={r} fill="none" stroke="var(--fg-04)" strokeWidth="4" />
                                    <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[var(--fg-80)]">{doneCount}/7</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[var(--fg-70)]">{doneCount === 0 ? "No sessions yet" : `${doneCount} session${doneCount !== 1 ? "s" : ""} done`}</p>
                                <p className="text-[10px] font-mono text-[var(--fg-25)] mt-0.5">{7 - doneCount} day{7 - doneCount !== 1 ? "s" : ""} remaining</p>
                            </div>
                        </div>
                        <div className="flex justify-between gap-1">
                            {DAY_LABELS.map((day, i) => {
                                const isToday = i === todayDayIdx;
                                const done = w.weekDays[i];
                                return (
                                    <div key={day} className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-mono font-semibold transition-colors ${
                                        done ? "bg-[rgb(var(--accent-rgb))] text-black"
                                            : isToday ? "border border-[rgb(var(--accent-rgb)/0.4)] text-[rgb(var(--accent-rgb))] border-dashed"
                                            : "bg-[var(--fg-04)] text-[var(--fg-20)]"
                                    }`}>{day}</div>
                                );
                            })}
                        </div>
                    </CardPanel>
                )}

                {/* Volume Trend */}
                {w.statsLoaded && w.weeklyVolumes.some(v => v > 0) && (
                    <CardPanel className="p-4">
                        <p className="text-[9px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)] mb-3">VOLUME TREND</p>
                        <div className="flex items-end gap-1.5 h-20">
                            {(() => {
                                const maxVol = Math.max(...w.weeklyVolumes, 1);
                                return w.weeklyVolumes.map((vol, i) => {
                                    const h = Math.max((vol / maxVol) * 100, 4);
                                    const isLatest = i === w.weeklyVolumes.length - 1;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full relative flex-1 flex items-end">
                                                <div className={`w-full rounded-t-md transition-all ${isLatest ? "bg-[rgb(var(--accent-rgb))]" : "bg-[var(--fg-08)]"}`} style={{ height: `${h}%` }} />
                                            </div>
                                            <span className="text-[7px] font-mono text-[var(--fg-20)]">{isLatest ? "NOW" : `W${i + 1}`}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-[9px] font-mono text-[var(--fg-20)]">6 weeks</span>
                            <span className="text-[9px] font-mono text-[var(--fg-30)]">{w.weeklyVolumes[w.weeklyVolumes.length - 1] > 0 ? `${(w.weeklyVolumes[w.weeklyVolumes.length - 1] / 1000).toFixed(1)}k ${w.weightUnit}` : "—"}</span>
                        </div>
                    </CardPanel>
                )}
            </div>

            {w.showFreestylePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-[var(--fg-08)] bg-[var(--bg-card)] p-5">
                        <p className="text-sm font-semibold text-[var(--fg-85)] mb-2">
                            Save as {new Date().toLocaleDateString(undefined, { weekday: "long" })} workout?
                        </p>
                        <p className="text-[11px] text-[var(--fg-35)] mb-4">
                            It&apos;ll repeat every {new Date().toLocaleDateString(undefined, { weekday: "long" })} automatically.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => w.setShowFreestylePrompt(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-[var(--fg-08)] text-[var(--fg-50)] hover:text-[var(--fg-80)] transition">
                                No Thanks
                            </button>
                            <button onClick={w.saveFreestyleAsRecurringPlan} disabled={w.savingFreestylePlan} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 disabled:opacity-50 transition">
                                {w.savingFreestylePlan ? "Saving..." : "Yes, Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
    }

    // ── NOT STARTED / ACTIVE ──
    return (
        <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-36 md:pb-10 relative">

            <div className="relative z-10 max-w-xl mx-auto px-4 pt-6 space-y-4">

                <SwipeNav sections={getTrainSections(enabledKeys)} />

                {/* ── TOP BAR ── */}
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-mono tracking-widest text-[var(--fg-20)] uppercase">
                                    {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                                </span>
                                {w.status === "active" && (
                                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15">LIVE</span>
                                )}
                            </div>
                            <h1 className="text-lg font-bold text-[var(--fg-90)] leading-tight">{w.dayTitle}</h1>
                        </div>
                        {w.status === "not_started" && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => w.setShowDeletePlanConfirm(true)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--fg-06)] text-[var(--fg-20)] hover:text-red-400/80 hover:border-red-500/20 transition">
                                    <Trash2 size={13} />
                                </button>
                                <button onClick={() => router.push("/schedule")} className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-xl border border-[var(--fg-06)] text-[var(--fg-30)] hover:text-[var(--fg-60)] hover:bg-[var(--fg-03)] transition">
                                    <Calendar size={11} /> Schedule
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SESSION COUNTER PANEL ── */}
                {w.status === "active" && (() => {
                    const exVols: ExVolumeEntry[] = w.exercisesList.map((ex) => {
                        const sets = (w.logs[ex.id] ?? []).filter((s) => s.completed && !s.is_warmup);
                        const mult = isDualWeight(ex) ? 2 : 1;
                        const vol = sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0) * mult, 0);
                        return { name: ex.name, volume: Math.round(kgToUnit(vol, w.weightUnit)) };
                    }).filter((e) => e.volume > 0);
                    const lastVol = w.recentSessions.length > 0 ? Math.round(kgToUnit(w.recentSessions[0].volume, w.weightUnit)) : 0;
                    return (
                        <SessionCounterPanel
                            sets={w.completedCount}
                            totalSets={w.totalPlanned}
                            volume={Math.round(kgToUnit(w.sessionVolume, w.weightUnit))}
                            elapsed={w.elapsed}
                            weightUnit={w.weightUnit}
                            lastDelta={Math.round(kgToUnit(lastDelta, w.weightUnit))}
                            lastSessionVolume={lastVol}
                            exerciseVolumes={exVols}
                        />
                    );
                })()}

                {/* ── CYCLE TRAINING BANNER (female mode) ── */}
                {w.cycleProfile && (w.status === "not_started" || w.status === "active") && (
                    <div className={`rounded-2xl border p-4 ${
                        w.cycleProfile.banner.color === "rose" ? "border-rose-500/15 bg-rose-500/[0.04]" :
                        w.cycleProfile.banner.color === "emerald" ? "border-emerald-500/15 bg-emerald-500/[0.04]" :
                        w.cycleProfile.banner.color === "amber" ? "border-amber-500/15 bg-amber-500/[0.04]" :
                        "border-violet-500/15 bg-violet-500/[0.04]"
                    }`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] font-mono tracking-widest uppercase ${
                                        w.cycleProfile.banner.color === "rose" ? "text-rose-400/60" :
                                        w.cycleProfile.banner.color === "emerald" ? "text-emerald-400/60" :
                                        w.cycleProfile.banner.color === "amber" ? "text-amber-400/60" :
                                        "text-violet-400/60"
                                    }`}>
                                        {w.cycleProfile.phase} · Day {w.cycleProfile.cycleDay}
                                    </span>
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full ${
                                        w.cycleProfile.banner.color === "rose" ? "bg-rose-500/10 text-rose-400/50" :
                                        w.cycleProfile.banner.color === "emerald" ? "bg-emerald-500/10 text-emerald-400/50" :
                                        w.cycleProfile.banner.color === "amber" ? "bg-amber-500/10 text-amber-400/50" :
                                        "bg-violet-500/10 text-violet-400/50"
                                    }`}>
                                        {w.cycleProfile.styleName}
                                    </span>
                                </div>
                                <p className={`text-sm font-semibold ${
                                    w.cycleProfile.banner.color === "rose" ? "text-rose-300" :
                                    w.cycleProfile.banner.color === "emerald" ? "text-emerald-300" :
                                    w.cycleProfile.banner.color === "amber" ? "text-amber-300" :
                                    "text-violet-300"
                                }`}>{w.cycleProfile.banner.headline}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[8px] font-mono text-[var(--fg-20)]">INTENSITY</p>
                                <p className={`text-lg font-bold font-mono ${
                                    w.cycleProfile.intensityModifier >= 1.0 ? "text-emerald-400" :
                                    w.cycleProfile.intensityModifier >= 0.85 ? "text-amber-400" :
                                    "text-rose-400"
                                }`}>{Math.round(w.cycleProfile.intensityModifier * 100)}%</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-[var(--fg-35)] leading-relaxed">{w.cycleProfile.banner.detail}</p>

                        {/* Energy Forecast */}
                        {w.status === "not_started" && w.energyForecast.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[var(--fg-04)]">
                                <p className="text-[8px] font-mono tracking-widest text-[var(--fg-20)] mb-2">7-DAY ENERGY FORECAST</p>
                                <div className="flex items-end gap-1">
                                    {w.energyForecast.map((f, i) => {
                                        const dayLabel = i === 0 ? "Today" : new Date(f.date).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
                                        const height = f.energyLevel * 20;
                                        const phaseColor = f.phase === "menstrual" ? "bg-rose-400" : f.phase === "follicular" ? "bg-emerald-400" : f.phase === "ovulation" ? "bg-amber-400" : "bg-violet-400";
                                        return (
                                            <div key={f.date} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-[7px] font-mono text-[var(--fg-20)]">{f.label.slice(0, 3)}</span>
                                                <div className={`w-full rounded-sm ${phaseColor} transition-all`} style={{ height: `${height}%`, minHeight: 4, opacity: i === 0 ? 1 : 0.5 + (f.energyLevel / 10) }} />
                                                <span className={`text-[8px] font-mono ${i === 0 ? "text-[var(--fg-50)] font-bold" : "text-[var(--fg-20)]"}`}>{dayLabel}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Warm-up & Nutrition tips */}
                        {w.status === "not_started" && (
                            <div className="mt-3 pt-3 border-t border-[var(--fg-04)] grid grid-cols-2 gap-2">
                                <div className="glass-card p-2.5">
                                    <p className="text-[7px] font-mono tracking-widest text-[var(--fg-20)] mb-1">WARM-UP · {w.cycleProfile.warmUpGuidance.minutes} MIN</p>
                                    <p className="text-[9px] text-[var(--fg-35)] leading-relaxed">{w.cycleProfile.warmUpGuidance.focus}</p>
                                </div>
                                <div className="glass-card p-2.5">
                                    <p className="text-[7px] font-mono tracking-widest text-[var(--fg-20)] mb-1">NUTRITION TIP</p>
                                    <p className="text-[9px] text-[var(--fg-35)] leading-relaxed">{w.cycleProfile.nutritionTip}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── START WORKOUT HERO ── */}
                {w.status === "not_started" && (
                    <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--accent-rgb)/0.15)] bg-gradient-to-br from-[rgb(var(--accent-rgb)/0.08)] to-transparent">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(var(--accent-rgb)/0.06),transparent_70%)]" />
                        <div className="relative p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--fg-30)]">
                                    <Dumbbell size={14} className="text-[rgb(var(--accent-rgb)/0.5)]" />
                                    <span>{w.exercisesList.length} exercises</span>
                                    <span className="text-[var(--fg-10)]">·</span>
                                    <span>{w.totalPlanned} sets</span>
                                    <span className="text-[var(--fg-10)]">·</span>
                                    <span>~{w.totalPlanned * 3}m</span>
                                </div>
                            </div>

                            <button onClick={w.startWorkout} className="w-full flex items-center justify-center gap-2.5 text-[15px] font-bold py-4 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_rgb(var(--accent-rgb)/0.2)]">
                                <Play size={18} fill="black" /> Begin Session
                            </button>

                            <div className="flex items-center justify-between mt-3">
                                <button onClick={() => w.setStatus("freestyle")} className="text-[10px] font-mono text-[var(--fg-20)] hover:text-[var(--fg-50)] transition">
                                    Train freestyle instead
                                </button>
                                <button onClick={() => router.push("/schedule")} className="text-[10px] font-mono text-[rgb(var(--accent-rgb)/0.4)] hover:text-[rgb(var(--accent-rgb)/0.8)] transition">
                                    View exercises →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── BODY WEIGHT (compact, not_started only) ── */}
                {w.status === "not_started" && (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--fg-05)] bg-[var(--fg-02)] px-4 py-2.5">
                        <p className="text-[9px] font-mono text-[var(--fg-25)] shrink-0">BODY WEIGHT</p>
                        <input
                            type="number" min="0" onWheel={(e) => (e.target as HTMLElement).blur()}
                            inputMode="decimal"
                            value={w.preWorkoutWeight}
                            onChange={(e) => w.setPreWorkoutWeight(e.target.value)}
                            placeholder="—"
                            className="flex-1 min-w-0 h-8 rounded-lg bg-[var(--fg-04)] border border-[var(--fg-06)] text-center text-sm font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.3)] transition"
                        />
                        <span className="text-[10px] font-mono text-[var(--fg-20)] shrink-0">{w.weightUnit}</span>
                        {w.preWorkoutWeight && !w.weightLogged && (
                            <button
                                onClick={w.logBodyWeight}
                                className="shrink-0 text-[9px] font-mono px-2.5 py-1.5 rounded-lg border border-[rgb(var(--accent-rgb)/0.2)] text-[rgb(var(--accent-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.1)] transition"
                            >Log</button>
                        )}
                        {w.weightLogged && <Check size={14} className="shrink-0 text-[rgb(var(--accent-rgb))]" />}
                    </div>
                )}

                {/* ── STATS DASHBOARD (not_started) ── */}
                {w.status === "not_started" && w.statsLoaded && (w.recentSessions.length > 0 || w.weeklyVolumes.some(v => v > 0)) && (
                    <div className="space-y-3 mt-2">
                        <p className="text-[9px] font-mono tracking-widest text-[var(--fg-15)] px-1">YOUR TRAINING</p>

                        {/* This Week + Volume side-by-side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-[var(--fg-06)] bg-[var(--fg-03)] p-3.5">
                                <p className="text-[8px] font-mono tracking-widest text-[var(--fg-20)] mb-2">THIS WEEK</p>
                                <p className="text-3xl font-black text-[rgb(var(--accent-light-rgb))] leading-none">{w.weekDays.filter(Boolean).length}</p>
                                <p className="text-[9px] font-mono text-[var(--fg-20)] mt-1">of 7 days</p>
                                <div className="flex gap-1 mt-3">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                                            w.weekDays[i] ? "bg-[rgb(var(--accent-rgb))]" : "bg-[var(--fg-06)]"
                                        }`} />
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[var(--fg-06)] bg-[var(--fg-03)] p-3.5">
                                <p className="text-[8px] font-mono tracking-widest text-[var(--fg-20)] mb-2">VOLUME</p>
                                <p className="text-3xl font-black text-[var(--fg-80)] leading-none">
                                    {w.weeklyVolumes[w.weeklyVolumes.length - 1] > 0 ? `${(w.weeklyVolumes[w.weeklyVolumes.length - 1] / 1000).toFixed(1)}` : "—"}
                                </p>
                                <p className="text-[9px] font-mono text-[var(--fg-20)] mt-1">{w.weeklyVolumes[w.weeklyVolumes.length - 1] > 0 ? `k ${w.weightUnit} this week` : "no data yet"}</p>
                                {w.weeklyVolumes.some(v => v > 0) && (
                                    <div className="flex items-end gap-0.5 mt-3 h-4">
                                        {(() => {
                                            const maxVol = Math.max(...w.weeklyVolumes, 1);
                                            return w.weeklyVolumes.map((vol, i) => {
                                                const h = Math.max((vol / maxVol) * 100, 8);
                                                const isLatest = i === w.weeklyVolumes.length - 1;
                                                return <div key={i} className={`flex-1 rounded-sm transition-all ${isLatest ? "bg-[rgb(var(--accent-rgb))]" : "bg-[var(--fg-10)]"}`} style={{ height: `${h}%` }} />;
                                            });
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Sessions */}
                        {w.recentSessions.length > 0 && (
                            <div className="rounded-2xl border border-[var(--fg-06)] bg-[var(--fg-03)] p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[8px] font-mono tracking-widest text-[var(--fg-20)]">RECENT</p>
                                    <button onClick={() => router.push("/progress")} className="text-[9px] font-mono text-[rgb(var(--accent-rgb)/0.4)] hover:text-[rgb(var(--accent-rgb))] transition">All →</button>
                                </div>
                                <div className="space-y-1">
                                    {w.recentSessions.slice(0, 3).map((s) => {
                                        const d = new Date(s.date + "T12:00:00");
                                        const now = new Date();
                                        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
                                        const label = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : d.toLocaleDateString("en-US", { weekday: "short" });
                                        return (
                                            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[var(--fg-03)] last:border-0">
                                                <div className="w-7 h-7 rounded-lg bg-[rgb(var(--accent-rgb)/0.08)] flex items-center justify-center shrink-0">
                                                    <Dumbbell size={11} className="text-[rgb(var(--accent-rgb)/0.5)]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium text-[var(--fg-60)] truncate">{s.title}</p>
                                                    <p className="text-[9px] font-mono text-[var(--fg-20)]">{label} · {s.sets} sets</p>
                                                </div>
                                                <span className="text-[10px] font-bold font-mono text-[rgb(var(--accent-light-rgb)/0.6)] shrink-0">+{s.xp} xp</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ACTIVE EXERCISE LIST ── */}
                {w.status === "active" && (
                    <div className="space-y-3">
                        {w.exercisesList.map((ex, i) => {
                            const sets = w.logs[ex.id] ?? [];
                            const workingSetsOnly = sets.filter((s) => !s.is_warmup);
                            const warmupSetsOnly = sets.filter((s) => s.is_warmup);
                            const done = workingSetsOnly.filter((s) => s.completed).length;
                            const warmupDone = warmupSetsOnly.filter((s) => s.completed).length;
                            const isOpen = w.expandedId === ex.id;
                            const last = w.lastPerformance[ex.exercise_id];
                            const hint = w.overloadHints[ex.exercise_id];
                            const allDone = done === workingSetsOnly.length && workingSetsOnly.length > 0 && warmupDone === warmupSetsOnly.length;
                            const isSkipped = w.skippedExercises.has(ex.id);

                            return (
                                <div key={ex.id} className={`rounded-xl border overflow-hidden transition-all ${isSkipped ? "border-[var(--fg-04)] bg-[var(--fg-01)] opacity-50" : allDone ? "border-[rgb(var(--accent-rgb)/0.2)] bg-[rgb(var(--accent-rgb)/0.03)]" : "border-[var(--fg-06)] bg-[var(--fg-03)]"}`}>
                                    {/* Exercise header */}
                                    <button onClick={() => isSkipped ? w.unskipExercise(ex.id) : w.setExpandedId(isOpen ? null : ex.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${isSkipped ? "bg-[var(--fg-03)] text-[var(--fg-15)] border border-[var(--fg-04)]" : allDone ? "bg-[rgb(var(--accent-rgb)/0.15)] text-[rgb(var(--accent-rgb))] border border-[rgb(var(--accent-rgb)/0.2)]" : "bg-[var(--fg-04)] text-[var(--fg-20)] border border-[var(--fg-06)]"}`}>
                                            {isSkipped ? <Ban size={12} /> : allDone ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={`text-[13px] font-medium truncate ${isSkipped ? "text-[var(--fg-30)] line-through" : "text-[var(--fg-80)]"}`}>{ex.name}</p>
                                                {w.substitutions[ex.id] && !isSkipped && (
                                                    <span className="shrink-0 text-[8px] font-mono px-1.5 py-0.5 rounded bg-orange-400/10 text-orange-300/60 border border-orange-400/15">NO GEAR</span>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-mono text-[var(--fg-25)]">
                                                {isSkipped ? "Skipped" : `${done}/${workingSetsOnly.length} sets${warmupSetsOnly.length > 0 ? ` + ${warmupDone}/${warmupSetsOnly.length} warm-up` : ""}${last ? ` · Last: ${last.weight != null ? kgToUnit(last.weight, w.weightUnit) : "—"}${ex.isCardio ? "" : ex.isBodyweight ? " BW" : w.weightUnit} × ${last.reps ?? "—"}` : ""}`}
                                            </p>
                                        </div>
                                        {isSkipped ? (
                                            <span className="text-[9px] font-mono text-[var(--fg-20)] shrink-0">tap to undo</span>
                                        ) : (
                                            <ChevronDown size={14} className={`text-[var(--fg-15)] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                        )}
                                    </button>

                                    {/* Expanded content */}
                                    {isOpen && !isSkipped && (
                                        <div className="border-t border-[var(--fg-04)]">
                                            {/* Overload hint */}
                                            {hint && hint.type !== "first_time" && (
                                                <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[rgb(var(--accent-rgb)/0.05)] border border-[rgb(var(--accent-rgb)/0.1)] px-3 py-2">
                                                    <TrendingUp size={11} className="text-[rgb(var(--accent-rgb)/0.5)] shrink-0" />
                                                    <p className="text-[10px] font-mono text-[rgb(var(--accent-rgb)/0.6)]">{hint.text}</p>
                                                </div>
                                            )}

                                            {/* Injury risk indicator */}
                                            {w.exerciseRisks[ex.id] && (
                                                <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 px-3 py-2">
                                                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                                                    <div>
                                                        <p className="text-[10px] font-mono text-amber-400/70">{w.exerciseRisks[ex.id].reason}</p>
                                                        <p className="text-[9px] font-mono text-amber-400/40 mt-0.5">Alternative: {w.exerciseRisks[ex.id].alternative}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cycle-adjusted weight suggestion */}
                                            {w.cycleProfile && !ex.isCardio && !ex.isBodyweight && w.lastPerformance[ex.exercise_id]?.weight && (() => {
                                                const adj = getCycleAdjustedWeight(w.lastPerformance[ex.exercise_id].weight, w.cycleProfile!.intensityModifier);
                                                return adj.label ? (
                                                    <div className={`mx-4 mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                                                        w.cycleProfile!.intensityModifier >= 1.0 ? "bg-emerald-500/[0.05] border border-emerald-500/10" : "bg-violet-500/[0.05] border border-violet-500/10"
                                                    }`}>
                                                        <p className={`text-[9px] font-mono ${w.cycleProfile!.intensityModifier >= 1.0 ? "text-emerald-400/60" : "text-violet-400/60"}`}>
                                                            {adj.label}
                                                        </p>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Smart substitution suggestions */}
                                            {w.substitutions[ex.id] && (
                                                <div className="mx-4 mt-2 rounded-lg bg-orange-400/[0.04] border border-orange-400/10 p-3">
                                                    <p className="text-[9px] font-mono text-orange-300/60 mb-2">
                                                        <Dumbbell size={9} className="inline mr-1" />
                                                        {ex.equipment} not in your gear — try:
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {w.substitutions[ex.id].map((sub) => (
                                                            <button
                                                                key={sub.exercise.id}
                                                                onClick={() => w.handleSwap(ex, { id: sub.exercise.id, name: sub.exercise.name })}
                                                                className="w-full flex items-center justify-between gap-2 rounded-md bg-[var(--fg-03)] border border-[var(--fg-06)] px-3 py-2 hover:border-emerald-400/20 hover:bg-emerald-400/[0.04] transition group"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-[var(--fg-80)] font-medium truncate">{sub.exercise.name}</p>
                                                                    <p className="text-[9px] font-mono text-[var(--fg-30)]">{sub.reason} · {sub.exercise.equipment}</p>
                                                                </div>
                                                                <span className="text-[9px] font-mono text-emerald-400/50 group-hover:text-emerald-400/80 shrink-0">Swap →</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Swap / Skip / Remove / Warm-up */}
                                            <div className="px-4 pt-2.5 pb-1 flex items-center gap-3">
                                                <button onClick={() => w.setSwapTargetId(ex.id)} className="flex items-center gap-1.5 text-[var(--fg-40)] text-[10px] font-mono hover:text-emerald-400 active:scale-95 transition px-2 py-1.5 rounded-md hover:bg-emerald-400/10">
                                                    <RefreshCw size={11} /> Swap
                                                </button>
                                                <button onClick={() => w.skipExercise(ex.id)} className="flex items-center gap-1.5 text-[var(--fg-40)] text-[10px] font-mono hover:text-amber-400 active:scale-95 transition px-2 py-1.5 rounded-md hover:bg-amber-400/10">
                                                    <SkipForward size={11} /> Skip
                                                </button>
                                                {done === 0 && (
                                                    <button onClick={() => w.removeExercise(ex.id)} className="flex items-center gap-1.5 text-[var(--fg-40)] text-[10px] font-mono hover:text-red-400 active:scale-95 transition px-2 py-1.5 rounded-md hover:bg-red-400/10">
                                                        <X size={11} /> Remove
                                                    </button>
                                                )}
                                                {!ex.isCardio && !ex.isBodyweight && (
                                                    <button onClick={() => w.toggleWarmup(ex)} className={`flex items-center gap-1.5 text-[10px] font-mono transition ml-auto px-2 py-1.5 rounded-md active:scale-95 ${w.warmupExercises.has(ex.id) ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/15" : "text-[var(--fg-40)] hover:text-amber-400 hover:bg-amber-400/10"}`}>
                                                        <Flame size={11} />
                                                        {w.warmupExercises.has(ex.id) ? "Remove Warm-up" : "Add Warm-up"}
                                                    </button>
                                                )}
                                            </div>

                                            {ex.isCardio ? (
                                                /* ── CARDIO: single entry, no sets ── */
                                                <div className="px-4 pb-4 pt-2 space-y-3">
                                                    {(() => {
                                                        const cs = sets[0];
                                                        const dur = Number(cs?.duration) || 0;
                                                        const spd = Number(cs?.weight) || 0;
                                                        const dist = Number(cs?.distance) || 0;
                                                        const incl = Number(cs?.reps) || 0;
                                                        const inputCls = "w-full h-12 rounded-lg bg-[var(--fg-04)] border border-[var(--fg-08)] text-center text-xl font-bold font-mono focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.4)] disabled:opacity-40 transition";
                                                        const autoCalcDistance = (newDur: number, newSpd: number) => {
                                                            if (newDur > 0 && newSpd > 0) w.updateSet(ex.id, 0, "distance", String(Math.round(newSpd * (newDur / 60) * 100) / 100));
                                                        };
                                                        const equivDist = dist > 0 && incl > 0 ? Math.round(dist * (1 + incl * 0.03) * 100) / 100 : 0;
                                                        return (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <p className="text-[8px] font-mono text-[var(--fg-30)] mb-1">DURATION (MIN)</p>
                                                                        <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                            value={cs?.duration ?? ""}
                                                                            onChange={(e) => { w.updateSet(ex.id, 0, "duration", e.target.value); autoCalcDistance(Number(e.target.value) || 0, spd); }}
                                                                            disabled={cs?.completed} placeholder="—" className={inputCls} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[8px] font-mono text-[var(--fg-30)] mb-1">DISTANCE (KM)</p>
                                                                        <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                            value={cs?.distance ?? ""}
                                                                            onChange={(e) => {
                                                                                w.updateSet(ex.id, 0, "distance", e.target.value);
                                                                                const newDist = Number(e.target.value) || 0;
                                                                                if (dur > 0 && newDist > 0) w.updateSet(ex.id, 0, "weight", String(Math.round(newDist / (dur / 60) * 10) / 10));
                                                                            }}
                                                                            disabled={cs?.completed} placeholder="auto" className={inputCls} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[8px] font-mono text-[var(--fg-30)] mb-1">SPEED (KM/H)</p>
                                                                        <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                            value={cs?.weight ?? ""}
                                                                            onChange={(e) => { w.updateSet(ex.id, 0, "weight", e.target.value); autoCalcDistance(dur, Number(e.target.value) || 0); }}
                                                                            disabled={cs?.completed} placeholder="—" className={inputCls} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[8px] font-mono text-[var(--fg-30)] mb-1">INCLINE (%)</p>
                                                                        <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()}
                                                                            value={cs?.reps ?? ""}
                                                                            onChange={(e) => w.updateSet(ex.id, 0, "reps", e.target.value)}
                                                                            disabled={cs?.completed} placeholder="—" className={inputCls} />
                                                                    </div>
                                                                </div>
                                                                {equivDist > 0 && (
                                                                    <p className="text-[8px] font-mono text-[var(--fg-25)] text-center">
                                                                        ≈ {equivDist} km equivalent flat distance ({incl}% grade)
                                                                    </p>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                    <input
                                                        type="text"
                                                        value={sets[0]?.note ?? ""}
                                                        onChange={(e) => w.updateSet(ex.id, 0, "note", e.target.value)}
                                                        disabled={sets[0]?.completed}
                                                        placeholder="Notes (optional)"
                                                        className="w-full text-[10px] font-mono rounded-lg bg-transparent border border-[var(--fg-06)] px-3 py-2 text-[var(--fg-40)] placeholder:text-[var(--fg-15)] focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.2)] disabled:opacity-40 transition"
                                                    />
                                                    {!sets[0]?.completed ? (
                                                        <button
                                                            onClick={() => w.completeSet(ex, 0)}
                                                            className="w-full text-[10px] font-mono font-bold py-3 rounded-lg border border-[rgb(var(--accent-rgb)/0.3)] bg-[rgb(var(--accent-rgb)/0.1)] text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb)/0.15)] transition"
                                                        >
                                                            LOG CARDIO ✓
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => w.editSet(ex.id, 0)}
                                                            className="w-full flex items-center justify-center gap-2 text-[10px] font-mono text-[rgb(var(--accent-light-rgb)/0.5)] hover:text-[rgb(var(--accent-light-rgb)/0.8)] py-2 transition"
                                                        >
                                                            <Pencil size={10} /> ✓ Logged — tap to edit
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                /* ── STRENGTH / BODYWEIGHT: set-based ── */
                                                <div className="px-4 pb-4 space-y-1 border-t border-[var(--fg-06)] pt-3">
                                                    {/* Column headers */}
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] font-mono text-[var(--fg-25)] tracking-wider mb-0.5">
                                                        {editingExId === ex.id ? <span className="w-6" /> : null}
                                                        <span className="w-6 sm:w-7" />
                                                        {ex.isBodyweight ? (
                                                            <span className="flex-1 text-center">REPS</span>
                                                        ) : (
                                                            <>
                                                                <span className="flex-1 text-center">
                                                                    {w.weightUnit.toUpperCase()}
                                                                    {isDualWeight(ex) && <span className="text-[rgb(var(--accent-rgb))] font-bold ml-1">/ SIDE</span>}
                                                                </span>
                                                                <span className="flex-1 text-center">REPS</span>
                                                            </>
                                                        )}
                                                        <span className="w-9 sm:w-11" />
                                                    </div>

                                                    {sets.map((s, si) => {
                                                        const isWarmup = !!s.is_warmup;
                                                        const warmupCount = sets.filter((x) => x.is_warmup).length;
                                                        const workingIdx = isWarmup ? -1 : s.index - warmupCount;
                                                        const displayNum = isWarmup ? `W${si + 1}` : String(workingIdx + 1);
                                                        const prevSets = w.lastSets[ex.exercise_id] ?? [];
                                                        const prevSet = !isWarmup ? prevSets[workingIdx] : undefined;
                                                        const prevW = prevSet?.weight != null ? String(kgToUnit(prevSet.weight, w.weightUnit)) : "";
                                                        const prevR = prevSet?.reps != null ? String(prevSet.reps) : "";
                                                        const completedWorking = sets.filter((x) => !x.is_warmup && x.completed);
                                                        const lastCompleted = completedWorking.length > 0 ? completedWorking[completedWorking.length - 1] : null;
                                                        const hasPrev = !!(prevW && prevR);
                                                        const userTyped = !!(s.weight || s.reps);
                                                        const showQuickLog = !s.completed && !isWarmup && !ex.isCardio;
                                                        const dualWt = isDualWeight(ex);
                                                        const setVol = s.completed && s.weight && s.reps ? Number(s.weight) * Number(s.reps) * (dualWt ? 2 : 1) : 0;
                                                        const weightIncrement = w.weightUnit === "kg" ? 2.5 : 5;
                                                        const isDeleting = editingExId === ex.id;
                                                        const inputCls = (warm: boolean) => `flex-1 min-w-0 h-10 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold font-mono focus:outline-none disabled:opacity-40 transition ${warm ? "bg-amber-400/[0.03] border-amber-400/[0.1] focus:border-amber-400/30" : "bg-[var(--fg-04)] border-[var(--fg-08)] focus:border-[rgb(var(--accent-rgb)/0.4)] focus:bg-[rgb(var(--accent-rgb))]/[0.03]"}`;
                                                        const chipCls = "h-9 sm:h-10 rounded-full text-center text-sm sm:text-base font-bold font-mono";
                                                        return (
                                                        <div key={s.index} className={isWarmup ? "rounded-lg bg-amber-400/[0.04] border border-amber-400/[0.08] px-1 py-0.5" : ""}>
                                                            {/* Set row: optional delete × + set content */}
                                                            <div className="flex items-center gap-1">
                                                                {/* Delete button (edit mode) */}
                                                                {isDeleting && (
                                                                    <button
                                                                        onClick={() => w.removeSet(ex.id, s.index)}
                                                                        className="w-6 h-6 shrink-0 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/25 active:scale-90 transition"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                {/* ── COMPLETED WORKING SET — chip/tag style ── */}
                                                                {s.completed && !isWarmup ? (
                                                                    <button
                                                                        onClick={() => !isDeleting && w.editSet(ex.id, s.index)}
                                                                        className="w-full flex items-center gap-1.5 sm:gap-2 group rounded-lg py-1.5 px-1 relative overflow-hidden hover:brightness-110 active:scale-[0.99] transition"
                                                                    >
                                                                        <div className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full" style={{ background: "rgb(var(--accent-rgb) / 0.5)" }} />
                                                                        {/* Set number in accent circle */}
                                                                        <div className="w-6 sm:w-7 h-6 sm:h-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-mono font-bold" style={{ background: "rgb(var(--accent-rgb) / 0.15)", color: "rgb(var(--accent-light-rgb))" }}>
                                                                            {displayNum}
                                                                        </div>
                                                                        {/* Weight chip */}
                                                                        {!ex.isBodyweight && (
                                                                            <div className={`flex-1 ${chipCls} flex items-center justify-center gap-1 rounded-lg`} style={{ background: "rgb(var(--accent-rgb) / 0.06)", border: "1px solid rgb(var(--accent-rgb) / 0.12)" }}>
                                                                                <span className="text-[var(--fg-80)]">{s.weight}</span>
                                                                                {dualWt && (
                                                                                    <span className="text-[8px] font-bold px-1 py-px rounded" style={{ background: "rgb(var(--accent-rgb) / 0.2)", color: "rgb(var(--accent-light-rgb))" }}>×2</span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {/* Reps chip */}
                                                                        <div className={`flex-1 ${chipCls} flex items-center justify-center rounded-lg`} style={{ background: "rgb(var(--accent-rgb) / 0.06)", border: "1px solid rgb(var(--accent-rgb) / 0.12)" }}>
                                                                            <span className="text-[var(--fg-80)]">{s.reps}</span>
                                                                            {ex.isBodyweight && <span className="text-[10px] font-mono text-[var(--fg-30)] ml-1">reps</span>}
                                                                        </div>
                                                                        {/* Volume + pencil */}
                                                                        <div className="flex flex-col items-center shrink-0 w-9 sm:w-11">
                                                                            <Pencil size={12} className="text-[var(--fg-15)] group-hover:text-[rgb(var(--accent-light-rgb))] transition" />
                                                                            {setVol > 0 && (
                                                                                <span className="text-[7px] font-mono text-[var(--fg-15)] mt-0.5">{Math.round(setVol)}</span>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ) : s.completed && isWarmup ? (
                                                                    /* ── COMPLETED WARMUP ── */
                                                                    <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
                                                                        <span className="text-[10px] font-mono w-6 sm:w-7 text-center shrink-0 text-amber-400/50">{displayNum}</span>
                                                                        {s.warmup_label && <span className="text-[8px] font-mono text-amber-400/50 w-8 shrink-0">{s.warmup_label}</span>}
                                                                        <span className="flex-1 text-center text-xs font-mono text-amber-400/40">{s.weight} × {s.reps}</span>
                                                                        <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400"><Check size={14} /></div>
                                                                    </div>
                                                                ) : (
                                                                /* ── INCOMPLETE SET — input mode ── */
                                                                <SwipeSet completed={false} onComplete={() => w.completeSet(ex, s.index)}>
                                                                    <div className={`flex items-center gap-1.5 sm:gap-2 ${isWarmup ? "bg-transparent" : "bg-[var(--bg-elevated)]"}`}>
                                                                        <span className={`text-[10px] font-mono w-6 sm:w-7 text-center shrink-0 ${isWarmup ? "text-amber-400/50" : "text-[var(--fg-25)]"}`}>
                                                                            {displayNum}
                                                                        </span>
                                                                        {isWarmup && s.warmup_label && (
                                                                            <span className="text-[8px] font-mono text-amber-400/50 w-8 shrink-0">{s.warmup_label}</span>
                                                                        )}
                                                                        {ex.isBodyweight ? (
                                                                            <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder={prevR || "—"} value={s.reps} onChange={(e) => w.updateSet(ex.id, s.index, "reps", e.target.value)}
                                                                                className={inputCls(isWarmup)} />
                                                                        ) : (
                                                                            <>
                                                                                <div className="flex-1 min-w-0 relative">
                                                                                    <input type="number" min="0" inputMode="decimal" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder={prevW || "—"} value={s.weight} onChange={(e) => w.updateSet(ex.id, s.index, "weight", e.target.value)}
                                                                                        className={`w-full h-10 sm:h-11 rounded-lg border text-center text-sm sm:text-base font-bold font-mono focus:outline-none disabled:opacity-40 transition ${isWarmup ? "bg-amber-400/[0.03] border-amber-400/[0.1] focus:border-amber-400/30" : "bg-[var(--fg-04)] border-[var(--fg-08)] focus:border-[rgb(var(--accent-rgb)/0.4)] focus:bg-[rgb(var(--accent-rgb))]/[0.03]"}`} />
                                                                                    {dualWt && (
                                                                                        <span className="absolute right-1 top-0.5 text-[7px] font-mono font-bold px-1 rounded" style={{ background: "rgb(var(--accent-rgb) / 0.12)", color: "rgb(var(--accent-light-rgb) / 0.7)" }}>/ side</span>
                                                                                    )}
                                                                                </div>
                                                                                <input type="number" min="0" inputMode="numeric" onWheel={(e) => (e.target as HTMLElement).blur()} placeholder={prevR || "—"} value={s.reps} onChange={(e) => w.updateSet(ex.id, s.index, "reps", e.target.value)}
                                                                                    className={inputCls(isWarmup)} />
                                                                            </>
                                                                        )}
                                                                        <button
                                                                            onClick={() => w.completeSet(ex, s.index)}
                                                                            className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg border flex items-center justify-center transition ${
                                                                                isWarmup ? "border-amber-400/15 text-amber-400/30 hover:border-amber-400/40 hover:text-amber-400/70 active:scale-95" : "border-[var(--fg-10)] text-[var(--fg-20)] hover:border-[rgb(var(--accent-rgb)/0.4)] hover:text-[rgb(var(--accent-light-rgb))] hover:bg-[rgb(var(--accent-rgb))]/[0.05] active:scale-95"
                                                                            }`}
                                                                        >
                                                                            <Check size={16} />
                                                                        </button>
                                                                    </div>
                                                                </SwipeSet>
                                                                )}
                                                                </div>
                                                            </div>
                                                            {/* ── Quick-log area (below the set row) ── */}
                                                            {showQuickLog && !isDeleting && (
                                                                <div className="mt-1.5 ml-7 sm:ml-8 space-y-1.5" style={{ width: "calc(100% - 32px)" }}>
                                                                    {/* Auto-fill hint when prior data exists */}
                                                                    {hasPrev && !userTyped && (
                                                                        <span className="block text-[8px] font-mono text-[var(--fg-20)] -mt-0.5 mb-1">
                                                                            tap ✓ to log {prevW}{w.weightUnit} × {prevR} from last session
                                                                        </span>
                                                                    )}
                                                                    {/* Repeat last completed set (for sets 2+) */}
                                                                    {lastCompleted && workingIdx > 0 && !userTyped && (
                                                                        <button
                                                                            onClick={() => w.completeSet(ex, s.index, { weight: lastCompleted.weight, reps: lastCompleted.reps })}
                                                                            className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-[var(--fg-08)] bg-[var(--fg-03)] text-[var(--fg-50)] hover:text-[var(--fg-80)] hover:bg-[var(--fg-06)] active:scale-[0.98] transition"
                                                                        >
                                                                            <span className="text-[11px] font-mono font-medium flex items-center gap-1.5">
                                                                                <RefreshCw size={10} className="opacity-40" />
                                                                                Repeat — {!ex.isBodyweight ? `${lastCompleted.weight}${w.weightUnit} × ` : ""}{lastCompleted.reps}
                                                                            </span>
                                                                            <Check size={12} className="opacity-30" />
                                                                        </button>
                                                                    )}
                                                                    {/* Progressive overload chips — show computed value */}
                                                                    {hasPrev && !userTyped && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            {!ex.isBodyweight && (
                                                                                <button onClick={() => w.completeSet(ex, s.index, { weight: String(Number(prevW) + weightIncrement), reps: prevR })} className="flex-1 text-[10px] font-mono font-medium py-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] text-emerald-400/80 hover:bg-emerald-500/[0.1] active:scale-[0.98] transition">
                                                                                    +{weightIncrement}{w.weightUnit} → {Number(prevW) + weightIncrement}
                                                                                </button>
                                                                            )}
                                                                            <button onClick={() => w.completeSet(ex, s.index, { weight: prevW, reps: String(Number(prevR) + 1) })} className="flex-1 text-[10px] font-mono font-medium py-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] text-emerald-400/80 hover:bg-emerald-500/[0.1] active:scale-[0.98] transition">
                                                                                +1 rep → {Number(prevR) + 1}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    <input type="text" value={s.note} onChange={(e) => w.updateSet(ex.id, s.index, "note", e.target.value)} placeholder="Note (optional)"
                                                                        className="w-full text-[10px] font-mono rounded-md bg-transparent border border-[var(--fg-04)] px-2 py-1 text-[var(--fg-30)] placeholder:text-[var(--fg-15)] focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.2)] focus:text-[var(--fg-50)] transition" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        );
                                                    })}

                                                    {/* Add / Remove set controls */}
                                                    <div className="flex items-center gap-3 pt-1 ml-5 sm:ml-7">
                                                        <button onClick={() => w.addSet(ex.id)} className="flex items-center gap-1.5 text-[rgb(var(--accent-light-rgb)/0.6)] text-[10px] font-mono hover:text-[rgb(var(--accent-light-rgb))] transition">
                                                            <Plus size={12} /> Add set
                                                        </button>
                                                        {sets.length > 1 && (
                                                            <button
                                                                onClick={() => setEditingExId(editingExId === ex.id ? null : ex.id)}
                                                                className={`flex items-center gap-1 text-[10px] font-mono transition ${editingExId === ex.id ? "text-red-400" : "text-[var(--fg-25)] hover:text-[var(--fg-50)]"}`}
                                                            >
                                                                {editingExId === ex.id ? (
                                                                    <><Check size={12} /> Done</>
                                                                ) : (
                                                                    <><Minus size={12} /> Remove set</>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {allDone && !w.confirmedExercises.has(ex.id) && (
                                                        <button
                                                            onClick={() => w.confirmExercise(ex.id)}
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

                        <button onClick={() => w.setShowAddModal(true)} className="flex items-center gap-2 text-[var(--fg-20)] text-xs font-mono hover:text-[var(--fg-50)] transition py-2">
                            <Plus size={14} /> Add exercise
                        </button>
                    </div>
                )}
            </div>

            {/* ── UNDO TOAST ── */}
            {w.lastAction && w.status === "active" && (
                <div className="fixed bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-40 animate-[fadeInUp_0.2s_ease] max-w-[90vw]">
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--fg-08)] px-4 py-2.5 shadow-lg backdrop-blur-xl" style={{ background: "var(--bg-card)" }}>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[10px] font-mono text-[rgb(var(--accent-light-rgb))] truncate">
                                {w.lastAction.exName}
                            </span>
                            <span className="text-[9px] font-mono text-[var(--fg-30)]">
                                {w.lastAction.weight ? `${w.lastAction.weight} × ` : ""}{w.lastAction.reps} reps logged
                            </span>
                        </div>
                        <button onClick={w.undoLastSet} className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border border-[var(--fg-10)] text-[var(--fg-50)] hover:text-[var(--fg-80)] hover:bg-[var(--fg-05)] active:scale-95 transition shrink-0">
                            <Undo2 size={12} />
                            Undo
                        </button>
                    </div>
                </div>
            )}

            {/* ── REST TIMER (sticky bottom) ── */}
            {w.restRemaining !== null && w.status === "active" && (
                <div className="fixed bottom-16 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-xl z-30">
                    <div className="border-t md:border border-[var(--fg-08)] bg-[var(--bg-card)] backdrop-blur-xl px-5 py-3.5 flex items-center justify-between md:rounded-xl">
                        <div>
                            <p className="text-[8px] font-mono tracking-widest text-[var(--fg-25)]">REST TIMER</p>
                            <p className="text-2xl font-bold font-mono text-[rgb(var(--accent-rgb))]">{formatClock(w.restRemaining)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => w.addRestTime(15)} className="text-[10px] font-mono px-2.5 py-2 rounded-lg border border-[var(--fg-08)] text-[var(--fg-40)] hover:text-[var(--fg-70)] active:scale-95 transition">+15s</button>
                            <button onClick={() => w.setRestPaused((p) => !p)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--fg-08)] text-[var(--fg-40)] hover:text-[var(--fg-70)] active:scale-95 transition">
                                {w.restPaused ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <button onClick={w.dismissRestTimer} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--fg-08)] text-[var(--fg-40)] hover:text-[var(--fg-70)] active:scale-95 transition">
                                <SkipForward size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STICKY ACTION BAR ── */}
            {w.status === "active" && w.restRemaining === null && (
                <div className="fixed bottom-16 md:bottom-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-xl z-20">
                    <div className="border-t md:border border-[var(--fg-06)] bg-[var(--bg-card)] backdrop-blur-xl px-5 py-3 md:rounded-xl flex items-center gap-2">
                        {!w.sessionPaused ? (
                            <>
                                <button
                                    onClick={w.startManualRestTimer}
                                    className="text-[10px] font-mono font-medium py-3 px-3 rounded-xl border border-[var(--fg-08)] text-[var(--fg-40)] hover:text-[var(--fg-70)] transition"
                                >
                                    <Timer size={12} className="inline mr-1" />Rest
                                </button>
                                <button
                                    onClick={() => w.setSessionPaused(true)}
                                    className="text-[10px] font-mono font-medium py-3 px-3 rounded-xl border border-[var(--fg-08)] text-[var(--fg-40)] hover:text-[var(--fg-70)] transition"
                                >
                                    <Pause size={12} className="inline mr-1" />Pause
                                </button>
                                <button onClick={() => w.setShowEndConfirm(true)} className="flex-1 text-sm font-semibold py-3 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                                    {w.completedCount > 0 ? `Complete · ${w.completedCount} sets` : "End Session"}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => w.setSessionPaused(false)}
                                className="flex-1 text-sm font-semibold py-3 rounded-xl bg-amber-500 text-black hover:brightness-110 transition flex items-center justify-center gap-2"
                            >
                                <Play size={14} /> Resume Session
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── MODALS ── */}
            {w.finishing && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <CubeLoader message="Saving your workout…" />
                </div>
            )}

            {w.showEndConfirm && !w.finishing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-[var(--fg-08)] bg-[var(--bg-card)] p-5">
                        <p className="text-sm font-semibold text-[var(--fg-85)] mb-2">End workout?</p>
                        {w.completedCount === 0 ? (
                            <p className="text-[11px] text-[var(--fg-35)] mb-4">
                                No sets completed. This session will be saved as ended early.
                            </p>
                        ) : w.completedCount < w.totalPlanned ? (
                            <p className="text-[11px] text-[var(--fg-35)] mb-4">
                                You&apos;ve completed {w.completedCount} of {w.totalPlanned} planned sets. Unfinished sets won&apos;t be logged.
                            </p>
                        ) : (
                            <p className="text-[11px] text-[var(--fg-35)] mb-4">
                                All {w.completedCount} sets completed. Nice work.
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => w.setShowEndConfirm(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-[var(--fg-08)] text-[var(--fg-50)] hover:text-[var(--fg-80)] transition">
                                Keep Going
                            </button>
                            <button onClick={() => { w.setShowEndConfirm(false); w.finishWorkout(); }} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-[rgb(var(--accent-rgb))] text-black hover:brightness-110 transition">
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {w.showDeletePlanConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-red-500/15 bg-[var(--bg-card)] p-5">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Trash2 size={18} className="text-red-400" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--fg-85)] text-center mb-2">Delete entire workout plan?</p>
                        <p className="text-[11px] text-[var(--fg-35)] text-center mb-4">
                            This will permanently delete your weekly schedule for the current mode. All templates and scheduled exercises will be removed. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => w.setShowDeletePlanConfirm(false)} className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-[var(--fg-08)] text-[var(--fg-50)] hover:text-[var(--fg-80)] transition">
                                Cancel
                            </button>
                            <button onClick={w.deletePlan} disabled={w.deletingPlan} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-red-500 text-[var(--text-primary)] hover:bg-red-600 disabled:opacity-50 transition">
                                {w.deletingPlan ? "Deleting..." : "Delete Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {w.swapTargetId && <AddExerciseModal onAdd={(e) => { const old = w.exercisesList.find((x) => x.id === w.swapTargetId); if (old) w.handleSwap(old, e); }} onClose={() => w.setSwapTargetId(null)} defaultSegment={w.exercisesList.find((x) => x.id === w.swapTargetId)?.body_segment} />}
            {w.showAddModal && <AddExerciseModal onAdd={w.handleAddExercise} onClose={() => w.setShowAddModal(false)} existingIds={new Set(w.exercisesList.map((e) => e.exercise_id))} />}
        </main>
    );
}
