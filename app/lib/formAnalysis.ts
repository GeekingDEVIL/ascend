import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// MediaPipe Pose landmark indices
const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
} as const;

export type FormFrame = {
    timestamp: number;
    landmarks: NormalizedLandmark[];
};

export type DepthCheck = {
    passed: boolean;
    minAngle: number;
    threshold: number;
    message: string;
};

export type SymmetryCheck = {
    passed: boolean;
    leftAngle: number;
    rightAngle: number;
    diff: number;
    message: string;
};

export type BarPathPoint = { x: number; y: number; t: number };

export type KneeCaveCheck = {
    detected: boolean;
    side: "left" | "right" | "both" | "none";
    worstSeverity: number;
    message: string;
};

export type FormAnalysisResult = {
    exerciseType: "squat" | "deadlift" | "bench" | "overhead_press" | "general";
    frameCount: number;
    duration: number;
    depth?: DepthCheck;
    symmetry?: SymmetryCheck;
    kneeCave?: KneeCaveCheck;
    barPath?: BarPathPoint[];
    reps?: RepResult[];
    overallScore: number;
    tips: string[];
};

function angle3(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark): number {
    const ba = { x: a.x - b.x, y: a.y - b.y };
    const bc = { x: c.x - b.x, y: c.y - b.y };
    const dot = ba.x * bc.x + ba.y * bc.y;
    const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
    const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
    if (magBA === 0 || magBC === 0) return 180;
    const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
    return (Math.acos(cos) * 180) / Math.PI;
}

function midpoint(a: NormalizedLandmark, b: NormalizedLandmark): NormalizedLandmark {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1) };
}

function detectExerciseType(frames: FormFrame[]): FormAnalysisResult["exerciseType"] {
    if (frames.length < 5) return "general";
    const sample = frames.filter((_, i) => i % 3 === 0).slice(0, 20);

    let hipBelowKneeCount = 0;
    let wristAboveShoulderCount = 0;
    let hipHingeCount = 0;

    for (const f of sample) {
        const lm = f.landmarks;
        const hipY = (lm[LM.LEFT_HIP].y + lm[LM.RIGHT_HIP].y) / 2;
        const kneeY = (lm[LM.LEFT_KNEE].y + lm[LM.RIGHT_KNEE].y) / 2;
        const shoulderY = (lm[LM.LEFT_SHOULDER].y + lm[LM.RIGHT_SHOULDER].y) / 2;
        const wristY = (lm[LM.LEFT_WRIST].y + lm[LM.RIGHT_WRIST].y) / 2;

        if (hipY > kneeY - 0.02) hipBelowKneeCount++;
        if (wristY < shoulderY - 0.05) wristAboveShoulderCount++;

        const hipAngle = angle3(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE]);
        if (hipAngle < 120) hipHingeCount++;
    }

    const total = sample.length;
    if (wristAboveShoulderCount / total > 0.4) return "overhead_press";
    if (hipBelowKneeCount / total > 0.15) return "squat";
    if (hipHingeCount / total > 0.2) return "deadlift";
    return "general";
}

function analyzeSquatDepth(frames: FormFrame[]): DepthCheck {
    const PARALLEL_THRESHOLD = 100;
    let minKneeAngle = 180;

    for (const f of frames) {
        const lm = f.landmarks;
        const leftKnee = angle3(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
        const rightKnee = angle3(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
        const avg = (leftKnee + rightKnee) / 2;
        if (avg < minKneeAngle) minKneeAngle = avg;
    }

    const passed = minKneeAngle <= PARALLEL_THRESHOLD;
    return {
        passed,
        minAngle: Math.round(minKneeAngle),
        threshold: PARALLEL_THRESHOLD,
        message: passed
            ? `Good depth — knee angle reached ${Math.round(minKneeAngle)}°`
            : `Didn't hit parallel — min knee angle was ${Math.round(minKneeAngle)}° (need ≤${PARALLEL_THRESHOLD}°)`,
    };
}

function analyzeSymmetry(frames: FormFrame[]): SymmetryCheck {
    let totalLeft = 0;
    let totalRight = 0;
    let count = 0;

    for (const f of frames) {
        const lm = f.landmarks;
        const leftKnee = angle3(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
        const rightKnee = angle3(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
        totalLeft += leftKnee;
        totalRight += rightKnee;
        count++;
    }

    if (count === 0) return { passed: true, leftAngle: 0, rightAngle: 0, diff: 0, message: "Not enough data" };

    const avgLeft = totalLeft / count;
    const avgRight = totalRight / count;
    const diff = Math.abs(avgLeft - avgRight);
    const passed = diff < 8;

    return {
        passed,
        leftAngle: Math.round(avgLeft),
        rightAngle: Math.round(avgRight),
        diff: Math.round(diff),
        message: passed
            ? `Symmetry looks good — ${Math.round(diff)}° difference`
            : `Asymmetry detected — ${Math.round(diff)}° difference between sides. ${avgLeft > avgRight ? "Left" : "Right"} side is tighter.`,
    };
}

function extractBarPath(frames: FormFrame[]): BarPathPoint[] {
    const points: BarPathPoint[] = [];
    const startTime = frames[0]?.timestamp ?? 0;

    for (let i = 0; i < frames.length; i += 2) {
        const lm = frames[i].landmarks;
        const mid = midpoint(lm[LM.LEFT_WRIST], lm[LM.RIGHT_WRIST]);
        points.push({ x: mid.x, y: mid.y, t: frames[i].timestamp - startTime });
    }

    return points;
}

function analyzeKneeCave(frames: FormFrame[]): KneeCaveCheck {
    let leftCaveCount = 0, rightCaveCount = 0, worstSeverity = 0;
    const sample = frames.filter((_, i) => i % 3 === 0);

    for (const f of sample) {
        const result = checkKneeCave(f.landmarks);
        if (result) {
            if (result.side === "left" || result.side === "both") leftCaveCount++;
            if (result.side === "right" || result.side === "both") rightCaveCount++;
            if (result.severity > worstSeverity) worstSeverity = result.severity;
        }
    }

    const total = sample.length;
    const leftRatio = leftCaveCount / total;
    const rightRatio = rightCaveCount / total;
    const detected = leftRatio > 0.2 || rightRatio > 0.2;
    const side = detected ? (leftRatio > 0.2 && rightRatio > 0.2 ? "both" : leftRatio > 0.2 ? "left" : "right") : "none";

    return {
        detected,
        side,
        worstSeverity: Math.round(worstSeverity * 1000) / 1000,
        message: detected
            ? `Knee valgus detected on ${side} side${side === "both" ? "s" : ""} — knees collapsing inward during the lift.`
            : "No knee cave detected — knees tracking well over toes.",
    };
}

function detectMovement(frames: FormFrame[]): number {
    if (frames.length < 10) return 0;
    const sample = frames.filter((_, i) => i % 5 === 0);
    let totalDelta = 0;
    const joints = [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE, LM.LEFT_WRIST, LM.RIGHT_WRIST];

    for (let i = 1; i < sample.length; i++) {
        for (const j of joints) {
            const prev = sample[i - 1].landmarks[j];
            const curr = sample[i].landmarks[j];
            if (prev && curr) {
                totalDelta += Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
            }
        }
    }

    return totalDelta / ((sample.length - 1) * joints.length);
}

export function analyzeForm(frames: FormFrame[]): FormAnalysisResult {
    if (frames.length < 5) {
        return {
            exerciseType: "general", frameCount: frames.length,
            duration: 0, overallScore: 0, tips: ["Not enough frames captured. Try holding the camera steady for at least 3 seconds."],
        };
    }

    const duration = (frames[frames.length - 1].timestamp - frames[0].timestamp) / 1000;

    if (duration < 3) {
        return {
            exerciseType: "general", frameCount: frames.length,
            duration: Math.round(duration), overallScore: 0,
            tips: ["Recording too short. Record for at least 3 seconds to get a meaningful analysis."],
        };
    }

    const movement = detectMovement(frames);
    if (movement < 0.003) {
        return {
            exerciseType: "general", frameCount: frames.length,
            duration: Math.round(duration), overallScore: 0,
            tips: ["No exercise movement detected. Make sure you're performing a full rep in view of the camera."],
        };
    }

    const exerciseType = detectExerciseType(frames);
    const barPath = extractBarPath(frames);
    const tips: string[] = [];
    let score = 50;

    let depth: DepthCheck | undefined;
    let symmetry: SymmetryCheck | undefined;

    let kneeCave: KneeCaveCheck | undefined;

    if (exerciseType === "squat") {
        depth = analyzeSquatDepth(frames);
        symmetry = analyzeSymmetry(frames);
        kneeCave = analyzeKneeCave(frames);
        if (depth.passed) score += 20; else { score -= 10; tips.push("Try to hit at least parallel depth on squats."); }
        if (symmetry.passed) score += 15; else { score -= 5; tips.push("Work on evening out both sides — mobility drills can help."); }
        if (kneeCave.detected) { score -= 10; tips.push(kneeCave.message); } else { score += 10; }
    } else if (exerciseType === "deadlift") {
        symmetry = analyzeSymmetry(frames);
        if (symmetry.passed) score += 20; else { score -= 5; tips.push("Keep the bar balanced — check your grip width."); }

        let roundCount = 0;
        for (const f of frames) {
            const shoulderY = (f.landmarks[LM.LEFT_SHOULDER].y + f.landmarks[LM.RIGHT_SHOULDER].y) / 2;
            const hipY = (f.landmarks[LM.LEFT_HIP].y + f.landmarks[LM.RIGHT_HIP].y) / 2;
            if (shoulderY > hipY + 0.03) roundCount++;
        }
        if (roundCount / frames.length > 0.3) {
            score -= 15;
            tips.push("Shoulders dropping below hips — keep your chest up throughout the lift.");
        } else {
            score += 20;
        }
    } else if (exerciseType === "overhead_press" || exerciseType === "bench") {
        symmetry = analyzeSymmetry(frames);
        if (symmetry.passed) score += 20;

        if (barPath.length > 4) {
            const xValues = barPath.map((p) => p.x);
            const xRange = Math.max(...xValues) - Math.min(...xValues);
            if (xRange > 0.12) {
                score -= 10;
                tips.push("Bar path is drifting sideways — try to press in a straighter line.");
            } else {
                score += 15;
            }
        }
    } else {
        symmetry = analyzeSymmetry(frames);
        if (symmetry.passed) score += 10;
        if (movement > 0.01) score += 5;
        tips.push("Exercise type not recognized — try squats, deadlifts, or presses for detailed analysis.");
    }

    if (duration >= 10) score += 5;

    // Post-recording rep detection
    const repDetector = new RepDetector();
    repDetector.setExerciseType(exerciseType);
    for (const f of frames) {
        repDetector.processFrame(f.landmarks, f.timestamp);
    }
    const reps = repDetector.getReps();

    // If reps detected, blend per-rep scores with form score
    if (reps.length > 0) {
        const avgRepScore = reps.reduce((sum, r) => sum + r.score, 0) / reps.length;
        score = Math.round(score * 0.4 + avgRepScore * 0.6);
        if (reps.length >= 5) score += 5;

        const worstRep = reps.reduce((worst, r) => r.score < worst.score ? r : worst, reps[0]);
        if (worstRep.score < 50 && reps.length > 2) {
            tips.push(`Rep ${worstRep.repNumber} had the weakest form (${worstRep.score}/100) — fatigue may be setting in.`);
        }
    }

    if (tips.length === 0) tips.push("Form looks solid. Keep it up!");

    return {
        exerciseType, frameCount: frames.length, duration: Math.round(duration),
        depth, symmetry, kneeCave, barPath,
        reps: reps.length > 0 ? reps : undefined,
        overallScore: Math.max(0, Math.min(100, score)), tips,
    };
}

// Real-time per-joint form status for live color feedback
export type JointStatus = "good" | "warn" | "bad";
export type RealtimeFormFeedback = {
    jointStatus: Map<number, JointStatus>;
    connectionStatus: Map<string, JointStatus>;
    kneeCave?: { side: "left" | "right" | "both"; severity: number };
};

const CONN_KEY = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;

function checkKneeCave(lm: NormalizedLandmark[]): RealtimeFormFeedback["kneeCave"] {
    const lKnee = lm[LM.LEFT_KNEE], lHip = lm[LM.LEFT_HIP], lAnkle = lm[LM.LEFT_ANKLE];
    const rKnee = lm[LM.RIGHT_KNEE], rHip = lm[LM.RIGHT_HIP], rAnkle = lm[LM.RIGHT_ANKLE];
    if (!lKnee || !rKnee || !lHip || !rHip || !lAnkle || !rAnkle) return undefined;

    // Knee cave = knee X drifts inward past the hip-ankle midline
    const lMidX = (lHip.x + lAnkle.x) / 2;
    const rMidX = (rHip.x + rAnkle.x) / 2;
    // In normalized coords, left knee caving inward means it moves toward center (higher x if left side)
    const lDrift = lKnee.x - lMidX; // positive = inward for left leg
    const rDrift = rMidX - rKnee.x; // positive = inward for right leg
    const threshold = 0.015;

    const leftCave = lDrift > threshold;
    const rightCave = rDrift > threshold;
    if (!leftCave && !rightCave) return undefined;

    const severity = Math.max(leftCave ? lDrift : 0, rightCave ? rDrift : 0);
    return {
        side: leftCave && rightCave ? "both" : leftCave ? "left" : "right",
        severity,
    };
}

export function checkFormRealtime(
    landmarks: NormalizedLandmark[],
    exerciseType: "squat" | "deadlift" | "bench" | "overhead_press" | "general",
): RealtimeFormFeedback {
    const jointStatus = new Map<number, JointStatus>();
    const connectionStatus = new Map<string, JointStatus>();
    let kneeCave: RealtimeFormFeedback["kneeCave"];

    const setJoint = (idx: number, s: JointStatus) => {
        const cur = jointStatus.get(idx);
        if (!cur || s === "bad" || (s === "warn" && cur === "good")) jointStatus.set(idx, s);
    };
    const setConn = (a: number, b: number, s: JointStatus) => {
        const key = CONN_KEY(a, b);
        const cur = connectionStatus.get(key);
        if (!cur || s === "bad" || (s === "warn" && cur === "good")) connectionStatus.set(key, s);
    };

    if (exerciseType === "squat" || exerciseType === "general") {
        // Knee angle check (depth indicator during movement)
        const lKneeAngle = angle3(landmarks[LM.LEFT_HIP], landmarks[LM.LEFT_KNEE], landmarks[LM.LEFT_ANKLE]);
        const rKneeAngle = angle3(landmarks[LM.RIGHT_HIP], landmarks[LM.RIGHT_KNEE], landmarks[LM.RIGHT_ANKLE]);
        for (const [kneeAngle, hip, knee, ankle] of [
            [lKneeAngle, LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
            [rKneeAngle, LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
        ] as [number, number, number, number][]) {
            if (kneeAngle < 100) {
                setJoint(knee, "good"); setConn(hip, knee, "good"); setConn(knee, ankle, "good");
            } else if (kneeAngle < 130) {
                setJoint(knee, "warn"); setConn(hip, knee, "warn"); setConn(knee, ankle, "warn");
            }
        }

        // Knee cave detection
        kneeCave = checkKneeCave(landmarks);
        if (kneeCave) {
            if (kneeCave.side === "left" || kneeCave.side === "both") {
                const s: JointStatus = kneeCave.severity > 0.03 ? "bad" : "warn";
                setJoint(LM.LEFT_KNEE, s); setConn(LM.LEFT_HIP, LM.LEFT_KNEE, s); setConn(LM.LEFT_KNEE, LM.LEFT_ANKLE, s);
            }
            if (kneeCave.side === "right" || kneeCave.side === "both") {
                const s: JointStatus = kneeCave.severity > 0.03 ? "bad" : "warn";
                setJoint(LM.RIGHT_KNEE, s); setConn(LM.RIGHT_HIP, LM.RIGHT_KNEE, s); setConn(LM.RIGHT_KNEE, LM.RIGHT_ANKLE, s);
            }
        }

        // Back rounding (shoulder dropping below hip)
        const shoulderY = (landmarks[LM.LEFT_SHOULDER].y + landmarks[LM.RIGHT_SHOULDER].y) / 2;
        const hipY = (landmarks[LM.LEFT_HIP].y + landmarks[LM.RIGHT_HIP].y) / 2;
        if (shoulderY > hipY + 0.04) {
            setJoint(LM.LEFT_SHOULDER, "bad"); setJoint(LM.RIGHT_SHOULDER, "bad");
            setConn(LM.LEFT_SHOULDER, LM.LEFT_HIP, "bad"); setConn(LM.RIGHT_SHOULDER, LM.RIGHT_HIP, "bad");
        } else if (shoulderY > hipY + 0.02) {
            setJoint(LM.LEFT_SHOULDER, "warn"); setJoint(LM.RIGHT_SHOULDER, "warn");
            setConn(LM.LEFT_SHOULDER, LM.LEFT_HIP, "warn"); setConn(LM.RIGHT_SHOULDER, LM.RIGHT_HIP, "warn");
        }
    }

    if (exerciseType === "deadlift") {
        // Back rounding check
        const shoulderY = (landmarks[LM.LEFT_SHOULDER].y + landmarks[LM.RIGHT_SHOULDER].y) / 2;
        const hipY = (landmarks[LM.LEFT_HIP].y + landmarks[LM.RIGHT_HIP].y) / 2;
        if (shoulderY > hipY + 0.03) {
            setJoint(LM.LEFT_SHOULDER, "bad"); setJoint(LM.RIGHT_SHOULDER, "bad");
            setConn(LM.LEFT_SHOULDER, LM.LEFT_HIP, "bad"); setConn(LM.RIGHT_SHOULDER, LM.RIGHT_HIP, "bad");
            setConn(LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, "bad");
        }

        // Symmetry — check if one side is significantly lower
        const lElbowAngle = angle3(landmarks[LM.LEFT_SHOULDER], landmarks[LM.LEFT_ELBOW], landmarks[LM.LEFT_WRIST]);
        const rElbowAngle = angle3(landmarks[LM.RIGHT_SHOULDER], landmarks[LM.RIGHT_ELBOW], landmarks[LM.RIGHT_WRIST]);
        if (Math.abs(lElbowAngle - rElbowAngle) > 15) {
            const worse = lElbowAngle > rElbowAngle ? "left" : "right";
            const [elbow, shoulder, wrist] = worse === "left"
                ? [LM.LEFT_ELBOW, LM.LEFT_SHOULDER, LM.LEFT_WRIST]
                : [LM.RIGHT_ELBOW, LM.RIGHT_SHOULDER, LM.RIGHT_WRIST];
            setJoint(elbow, "warn"); setConn(shoulder, elbow, "warn"); setConn(elbow, wrist, "warn");
        }
    }

    if (exerciseType === "overhead_press" || exerciseType === "bench") {
        // Elbow flare check
        const lElbowAngle = angle3(landmarks[LM.LEFT_SHOULDER], landmarks[LM.LEFT_ELBOW], landmarks[LM.LEFT_WRIST]);
        const rElbowAngle = angle3(landmarks[LM.RIGHT_SHOULDER], landmarks[LM.RIGHT_ELBOW], landmarks[LM.RIGHT_WRIST]);

        // Bar path lateral drift
        const lWristX = landmarks[LM.LEFT_WRIST].x;
        const rWristX = landmarks[LM.RIGHT_WRIST].x;
        const lShoulderX = landmarks[LM.LEFT_SHOULDER].x;
        const rShoulderX = landmarks[LM.RIGHT_SHOULDER].x;
        const lDrift = Math.abs(lWristX - lShoulderX);
        const rDrift = Math.abs(rWristX - rShoulderX);

        if (lDrift > 0.08) { setJoint(LM.LEFT_WRIST, "warn"); setConn(LM.LEFT_ELBOW, LM.LEFT_WRIST, "warn"); }
        if (rDrift > 0.08) { setJoint(LM.RIGHT_WRIST, "warn"); setConn(LM.RIGHT_ELBOW, LM.RIGHT_WRIST, "warn"); }
        if (lDrift > 0.14) { setJoint(LM.LEFT_WRIST, "bad"); setConn(LM.LEFT_ELBOW, LM.LEFT_WRIST, "bad"); }
        if (rDrift > 0.14) { setJoint(LM.RIGHT_WRIST, "bad"); setConn(LM.RIGHT_ELBOW, LM.RIGHT_WRIST, "bad"); }

        // Symmetry
        if (Math.abs(lElbowAngle - rElbowAngle) > 20) {
            setJoint(LM.LEFT_ELBOW, "warn"); setJoint(LM.RIGHT_ELBOW, "warn");
        }
    }

    return { jointStatus, connectionStatus, kneeCave };
}

// --- Rep Detection ---

export type RepResult = {
    repNumber: number;
    startTime: number;
    endTime: number;
    minAngle: number;
    symmetryDiff: number;
    score: number;
};

type RepPhase = "top" | "descending" | "bottom" | "ascending";

export class RepDetector {
    private phase: RepPhase = "top";
    private exerciseType: FormAnalysisResult["exerciseType"] = "general";
    private lastAngle = 180;
    private repStartTime = 0;
    private minAngleDuringRep = 180;
    private symmetryAccum: number[] = [];
    private reps: RepResult[] = [];
    private lastRepTime = 0;
    private readonly MIN_REP_DURATION_MS = 800;
    private readonly ANGLE_HYSTERESIS = 12;

    setExerciseType(type: FormAnalysisResult["exerciseType"]) {
        this.exerciseType = type;
    }

    private getTrackingAngle(lm: NormalizedLandmark[]): number {
        if (this.exerciseType === "overhead_press" || this.exerciseType === "bench") {
            const l = angle3(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]);
            const r = angle3(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_ELBOW], lm[LM.RIGHT_WRIST]);
            return (l + r) / 2;
        }
        const l = angle3(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
        const r = angle3(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
        return (l + r) / 2;
    }

    private getSymmetryDiff(lm: NormalizedLandmark[]): number {
        const l = angle3(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
        const r = angle3(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
        return Math.abs(l - r);
    }

    private scoreRep(): number {
        let s = 60;
        // Depth bonus for squat/deadlift
        if (this.exerciseType === "squat") {
            if (this.minAngleDuringRep <= 90) s += 25;
            else if (this.minAngleDuringRep <= 100) s += 15;
            else if (this.minAngleDuringRep <= 120) s += 5;
            else s -= 10;
        } else if (this.exerciseType === "overhead_press" || this.exerciseType === "bench") {
            if (this.minAngleDuringRep <= 90) s += 20;
            else if (this.minAngleDuringRep <= 110) s += 10;
        } else {
            s += 10;
        }
        // Symmetry
        const avgSym = this.symmetryAccum.length > 0
            ? this.symmetryAccum.reduce((a, b) => a + b, 0) / this.symmetryAccum.length : 0;
        if (avgSym < 5) s += 15;
        else if (avgSym < 10) s += 5;
        else s -= 10;
        return Math.max(0, Math.min(100, s));
    }

    processFrame(landmarks: NormalizedLandmark[], timestamp: number): RepResult | null {
        if (this.exerciseType === "general") return null;

        const angle = this.getTrackingAngle(landmarks);
        const diff = angle - this.lastAngle;
        this.lastAngle = angle;

        const symDiff = this.getSymmetryDiff(landmarks);
        let completedRep: RepResult | null = null;

        switch (this.phase) {
            case "top":
                if (angle < 160 - this.ANGLE_HYSTERESIS) {
                    this.phase = "descending";
                    this.repStartTime = timestamp;
                    this.minAngleDuringRep = angle;
                    this.symmetryAccum = [symDiff];
                }
                break;
            case "descending":
                if (angle < this.minAngleDuringRep) this.minAngleDuringRep = angle;
                this.symmetryAccum.push(symDiff);
                if (diff > 2) {
                    this.phase = "bottom";
                }
                break;
            case "bottom":
                if (angle < this.minAngleDuringRep) this.minAngleDuringRep = angle;
                this.symmetryAccum.push(symDiff);
                if (angle > this.minAngleDuringRep + this.ANGLE_HYSTERESIS) {
                    this.phase = "ascending";
                }
                break;
            case "ascending":
                this.symmetryAccum.push(symDiff);
                if (angle > 150) {
                    const elapsed = timestamp - this.repStartTime;
                    if (elapsed >= this.MIN_REP_DURATION_MS && timestamp - this.lastRepTime > this.MIN_REP_DURATION_MS) {
                        const score = this.scoreRep();
                        const avgSym = this.symmetryAccum.length > 0
                            ? this.symmetryAccum.reduce((a, b) => a + b, 0) / this.symmetryAccum.length : 0;
                        completedRep = {
                            repNumber: this.reps.length + 1,
                            startTime: this.repStartTime,
                            endTime: timestamp,
                            minAngle: Math.round(this.minAngleDuringRep),
                            symmetryDiff: Math.round(avgSym),
                            score,
                        };
                        this.reps.push(completedRep);
                        this.lastRepTime = timestamp;
                    }
                    this.phase = "top";
                    this.minAngleDuringRep = 180;
                    this.symmetryAccum = [];
                }
                break;
        }

        return completedRep;
    }

    getReps(): RepResult[] { return this.reps; }
    getRepCount(): number { return this.reps.length; }

    reset() {
        this.phase = "top";
        this.lastAngle = 180;
        this.repStartTime = 0;
        this.minAngleDuringRep = 180;
        this.symmetryAccum = [];
        this.reps = [];
        this.lastRepTime = 0;
    }
}

export function getScoreColor(score: number): string {
    if (score >= 80) return "rgb(var(--accent-rgb))";
    if (score >= 60) return "#facc15";
    return "#f87171";
}

export function getScoreLabel(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Work";
    return "Poor";
}
