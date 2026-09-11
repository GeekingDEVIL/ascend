"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, Square, RotateCcw, ChevronRight, Circle } from "lucide-react";
import { analyzeForm, getScoreColor, getScoreLabel, type FormFrame, type FormAnalysisResult, type BarPathPoint } from "../lib/formAnalysis";
import { LandmarkSmoother } from "../lib/oneEuroFilter";

type PoseLandmarker = any;

const MAX_DURATION_MS = 60_000;
const COUNTDOWN_SECONDS = 3;

const SKELETON_COLOR = "#00ffaa";
const SKELETON_GLOW = "rgba(0, 255, 170, 0.5)";
const SKELETON_DOT = "#66ffc8";

const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
    [25, 27], [26, 28],
];

type Phase = "loading" | "ready" | "countdown" | "recording" | "analyzing" | "results";

export default function FormCheckCamera({ exerciseName, onClose }: { exerciseName: string; onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const landmarkerRef = useRef<PoseLandmarker | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const framesRef = useRef<FormFrame[]>([]);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef(0);
    const smootherRef = useRef(new LandmarkSmoother());

    const [phase, setPhase] = useState<Phase>("loading");
    const [elapsed, setElapsed] = useState(0);
    const [countdownNum, setCountdownNum] = useState(3);
    const [result, setResult] = useState<FormAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

    const cleanup = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        landmarkerRef.current?.close?.();
        streamRef.current = null;
        landmarkerRef.current = null;
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
                    audio: false,
                });
                if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                const vision = await import("@mediapipe/tasks-vision");
                if (cancelled) return;

                const { PoseLandmarker, FilesetResolver } = vision;
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                if (cancelled) return;

                const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numPoses: 1,
                });
                if (cancelled) { poseLandmarker.close(); return; }

                landmarkerRef.current = poseLandmarker;
                setPhase("ready");
            } catch (err: any) {
                if (!cancelled) setError(err.message || "Failed to initialize camera");
            }
        }

        init();
        return () => { cancelled = true; };
    }, [facingMode]);

    const drawSkeleton = useCallback((landmarks: any[]) => {
        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!landmarks || landmarks.length === 0) return;

        const smoothed = smootherRef.current.smooth(landmarks);
        const w = canvas.width;
        const h = canvas.height;

        // Pass 1: outer glow
        ctx.save();
        ctx.shadowColor = SKELETON_GLOW;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = SKELETON_COLOR;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        for (const [a, b] of POSE_CONNECTIONS) {
            if (smoothed[a] && smoothed[b] && (smoothed[a].visibility ?? 0) > 0.5 && (smoothed[b].visibility ?? 0) > 0.5) {
                ctx.beginPath();
                ctx.moveTo(smoothed[a].x * w, smoothed[a].y * h);
                ctx.lineTo(smoothed[b].x * w, smoothed[b].y * h);
                ctx.stroke();
            }
        }
        ctx.restore();

        // Pass 2: crisp inner line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (const [a, b] of POSE_CONNECTIONS) {
            if (smoothed[a] && smoothed[b] && (smoothed[a].visibility ?? 0) > 0.5 && (smoothed[b].visibility ?? 0) > 0.5) {
                ctx.beginPath();
                ctx.moveTo(smoothed[a].x * w, smoothed[a].y * h);
                ctx.lineTo(smoothed[b].x * w, smoothed[b].y * h);
                ctx.stroke();
            }
        }

        // Joint dots with glow
        ctx.save();
        ctx.shadowColor = SKELETON_GLOW;
        ctx.shadowBlur = 12;
        for (const p of smoothed) {
            const vis = p.visibility ?? 0;
            if (vis > 0.3) {
                const alpha = vis > 0.8 ? 1 : vis > 0.5 ? 0.7 : 0.35;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = SKELETON_DOT;
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
                ctx.fill();
                // Outer ring
                ctx.globalAlpha = alpha * 0.3;
                ctx.strokeStyle = SKELETON_DOT;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }, []);

    const processFrame = useCallback(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(processFrame);
            return;
        }

        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);

        if (result?.landmarks?.[0]) {
            drawSkeleton(result.landmarks[0]);
            if (phase === "recording") {
                framesRef.current.push({ timestamp: now, landmarks: result.landmarks[0] });
            }
        }

        if (startTimeRef.current > 0) {
            const el = now - startTimeRef.current;
            setElapsed(Math.round(el / 1000));
            if (el >= MAX_DURATION_MS) {
                stopRecording();
                return;
            }
        }

        rafRef.current = requestAnimationFrame(processFrame);
    }, [phase, drawSkeleton]);

    useEffect(() => {
        if (phase === "ready" || phase === "countdown" || phase === "recording") {
            rafRef.current = requestAnimationFrame(processFrame);
        }
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [phase, processFrame]);

    // Countdown timer
    useEffect(() => {
        if (phase !== "countdown") return;
        setCountdownNum(COUNTDOWN_SECONDS);

        let count = COUNTDOWN_SECONDS;
        const interval = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(interval);
                beginRecording();
            } else {
                setCountdownNum(count);
                try { navigator.vibrate?.(50); } catch {}
            }
        }, 800);

        try { navigator.vibrate?.(50); } catch {}

        return () => clearInterval(interval);
    }, [phase]);

    function startCountdown() {
        setPhase("countdown");
    }

    function beginRecording() {
        framesRef.current = [];
        startTimeRef.current = performance.now();
        setElapsed(0);
        setPhase("recording");
        try { navigator.vibrate?.(80); } catch {}
    }

    function stopRecording() {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setPhase("analyzing");
        startTimeRef.current = 0;

        setTimeout(() => {
            const analysis = analyzeForm(framesRef.current);
            setResult(analysis);
            setPhase("results");
        }, 300);
    }

    function handleRetry() {
        setResult(null);
        framesRef.current = [];
        setElapsed(0);
        smootherRef.current.reset();
        setPhase("ready");
        rafRef.current = requestAnimationFrame(processFrame);
    }

    function flipCamera() {
        cleanup();
        smootherRef.current.reset();
        setPhase("loading");
        setFacingMode((m) => (m === "user" ? "environment" : "user"));
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6">
                <Camera size={48} className="text-red-400 mb-4" />
                <p className="text-sm text-white/60 text-center mb-2">Camera access failed</p>
                <p className="text-xs text-white/30 text-center mb-6">{error}</p>
                <button onClick={onClose} className="px-6 py-2 rounded-lg bg-white/10 text-white/60 text-sm">Close</button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-3 bg-gradient-to-b from-black/90 to-black/0 z-10">
                <button onClick={() => { cleanup(); onClose(); }} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition">
                    <X size={18} />
                </button>
                <div className="text-center">
                    <p className="text-[10px] font-mono tracking-[0.2em] text-emerald-400/80">FORM CHECK</p>
                    <p className="text-xs font-medium text-white/70 max-w-[200px] truncate">{exerciseName}</p>
                </div>
                <button onClick={flipCamera} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition">
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Camera feed */}
            {phase !== "results" && (
                <div className="flex-1 relative overflow-hidden bg-black">
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        muted
                        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                    />
                    <canvas
                        ref={overlayCanvasRef}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Corner frame guides */}
                    {phase === "ready" && (
                        <>
                            <div className="absolute top-8 left-6 w-10 h-10 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
                            <div className="absolute top-8 right-6 w-10 h-10 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
                            <div className="absolute bottom-28 left-6 w-10 h-10 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
                            <div className="absolute bottom-28 right-6 w-10 h-10 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
                        </>
                    )}

                    {/* Loading overlay */}
                    {phase === "loading" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <div className="w-12 h-12 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
                            <p className="text-sm font-medium text-white/60">Loading pose model...</p>
                            <p className="text-[11px] text-white/30 mt-1">First load downloads ~5MB</p>
                        </div>
                    )}

                    {/* Countdown overlay */}
                    {phase === "countdown" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span
                                key={countdownNum}
                                className="text-[120px] font-bold text-white tabular-nums select-none animate-[countPulse_0.8s_ease-out]"
                                style={{ textShadow: "0 0 40px rgba(0,255,170,0.4), 0 0 80px rgba(0,255,170,0.15)" }}
                            >
                                {countdownNum}
                            </span>
                            <style>{`
                                @keyframes countPulse {
                                    0% { transform: scale(1.4); opacity: 0.3; }
                                    30% { opacity: 1; }
                                    100% { transform: scale(1); opacity: 1; }
                                }
                            `}</style>
                        </div>
                    )}

                    {/* Analyzing overlay */}
                    {phase === "analyzing" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <div className="w-12 h-12 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
                            <p className="text-sm font-medium text-white/60">Analyzing form...</p>
                        </div>
                    )}

                    {/* Recording indicator */}
                    {phase === "recording" && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg shadow-red-500/20">
                            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                            <span className="text-sm font-mono font-medium text-white tracking-wide">{elapsed}s / 60s</span>
                        </div>
                    )}

                    {/* Ready state guide */}
                    {phase === "ready" && (
                        <div className="absolute bottom-24 left-4 right-4 text-center space-y-2">
                            <p className="text-sm text-white/50 font-medium">Position your full body in frame</p>
                            <p className="text-[11px] text-white/25 bg-black/30 rounded-xl px-4 py-2 backdrop-blur-sm inline-block">
                                All processing happens on your device
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Results view */}
            {phase === "results" && result && <ResultsView result={result} onRetry={handleRetry} onClose={() => { cleanup(); onClose(); }} />}

            {/* Controls */}
            {phase !== "results" && (
                <div className="px-4 pt-4 pb-[max(env(safe-area-inset-bottom,20px),20px)] bg-gradient-to-t from-black via-black/90 to-black/0 flex justify-center">
                    {phase === "ready" && (
                        <button onClick={startCountdown} className="w-[72px] h-[72px] rounded-full bg-red-500 flex items-center justify-center ring-4 ring-red-500/30 ring-offset-2 ring-offset-black active:scale-90 transition-transform">
                            <Circle size={28} className="text-white" fill="white" />
                        </button>
                    )}
                    {phase === "countdown" && (
                        <button onClick={() => setPhase("ready")} className="w-[72px] h-[72px] rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center active:scale-90 transition-transform">
                            <X size={24} className="text-white/60" />
                        </button>
                    )}
                    {phase === "recording" && (
                        <button onClick={stopRecording} className="w-[72px] h-[72px] rounded-full bg-red-500 flex items-center justify-center ring-4 ring-red-500/30 ring-offset-2 ring-offset-black animate-pulse active:scale-90 transition-transform">
                            <Square size={24} className="text-white" fill="white" />
                        </button>
                    )}
                    {(phase === "loading" || phase === "analyzing") && (
                        <div className="w-[72px] h-[72px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Camera size={24} className="text-white/20" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function BarPathViz({ points }: { points: BarPathPoint[] }) {
    if (points.length < 3) return null;

    const padding = 16;
    const w = 80;
    const h = 120;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs); const maxX = Math.max(...xs);
    const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 0.01;
    const rangeY = maxY - minY || 0.01;

    const step = Math.max(1, Math.floor(points.length / 30));
    const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

    const scaled = sampled.map((p) => ({
        x: padding + ((p.x - minX) / rangeX) * (w - padding * 2),
        y: padding + ((p.y - minY) / rangeY) * (h - padding * 2),
    }));

    const pathD = scaled.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
            <defs>
                <linearGradient id="barPathGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffaa" />
                    <stop offset="100%" stopColor="#00cc88" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width={w} height={h} rx="8" fill="rgba(255,255,255,0.03)" />
            <path d={pathD} fill="none" stroke="url(#barPathGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            <circle cx={scaled[0].x} cy={scaled[0].y} r="3" fill="#00ffaa" />
            <circle cx={scaled[scaled.length - 1].x} cy={scaled[scaled.length - 1].y} r="3" fill="#66ffc8" />
        </svg>
    );
}

function ResultsView({ result, onRetry, onClose }: { result: FormAnalysisResult; onRetry: () => void; onClose: () => void }) {
    const scoreColor = getScoreColor(result.overallScore);
    const scoreLabel = getScoreLabel(result.overallScore);
    const exerciseLabel = result.exerciseType !== "general" ? result.exerciseType.replace("_", " ") : "exercise";
    const hasBarPath = result.barPath && result.barPath.length > 3;

    return (
        <div className="flex-1 overflow-y-auto bg-black px-5 pt-2">
            {/* Score hero */}
            <div className="flex items-center gap-5 mb-5">
                <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="7" strokeLinecap="round"
                            strokeDasharray={`${(result.overallScore / 100) * 264} 264`}
                            style={{ filter: `drop-shadow(0 0 6px ${scoreColor}40)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{result.overallScore}</span>
                        <span className="text-[10px] font-semibold tracking-wide" style={{ color: scoreColor }}>{scoreLabel}</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-mono tracking-[0.15em] text-white/30 uppercase mb-1">Analysis</p>
                    <p className="text-sm font-semibold text-white/80 capitalize mb-1">{exerciseLabel}</p>
                    <p className="text-[11px] text-white/30 font-mono">{result.duration}s · {result.frameCount} frames</p>
                </div>
            </div>

            {/* Metric cards row */}
            <div className="flex gap-2.5 mb-4">
                {result.depth && (
                    <div className={`flex-1 rounded-xl p-3 ${result.depth.passed ? "bg-emerald-500/10 border border-emerald-500/15" : "bg-amber-500/10 border border-amber-500/15"}`}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-semibold tracking-wide uppercase ${result.depth.passed ? "text-emerald-400" : "text-amber-400"}`}>Depth</span>
                            <span className={`text-[10px] ${result.depth.passed ? "text-emerald-400" : "text-amber-400"}`}>{result.depth.passed ? "✓" : "!"}</span>
                        </div>
                        <p className="text-lg font-bold text-white/90 leading-none mb-0.5">{result.depth.minAngle}°</p>
                        <p className="text-[9px] text-white/30">threshold {result.depth.threshold}°</p>
                    </div>
                )}

                {result.symmetry && (
                    <div className={`flex-1 rounded-xl p-3 ${result.symmetry.passed ? "bg-emerald-500/10 border border-emerald-500/15" : "bg-amber-500/10 border border-amber-500/15"}`}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-semibold tracking-wide uppercase ${result.symmetry.passed ? "text-emerald-400" : "text-amber-400"}`}>Symmetry</span>
                            <span className={`text-[10px] ${result.symmetry.passed ? "text-emerald-400" : "text-amber-400"}`}>{result.symmetry.passed ? "✓" : "!"}</span>
                        </div>
                        <p className="text-lg font-bold text-white/90 leading-none mb-0.5">{result.symmetry.diff}°</p>
                        <p className="text-[9px] text-white/30">L{result.symmetry.leftAngle}° R{result.symmetry.rightAngle}°</p>
                    </div>
                )}

                {hasBarPath && (
                    <div className="flex-1 rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center">
                        <span className="text-[10px] font-semibold tracking-wide uppercase text-white/40 mb-1">Bar Path</span>
                        <BarPathViz points={result.barPath!} />
                    </div>
                )}
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 mb-5">
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-white/30 uppercase mb-2.5">Tips</p>
                    <div className="space-y-2">
                        {result.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                <p className="text-[12px] leading-relaxed text-white/50">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pb-[max(env(safe-area-inset-bottom,20px),20px)]">
                <button onClick={onRetry} className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-semibold text-white/50 active:scale-[0.97] transition">
                    Try Again
                </button>
                <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-black text-sm font-bold active:scale-[0.97] transition" style={{ boxShadow: "0 4px 16px rgba(0,255,170,0.2)" }}>
                    Done
                </button>
            </div>
        </div>
    );
}
