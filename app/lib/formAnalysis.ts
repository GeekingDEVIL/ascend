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

export type FormAnalysisResult = {
    exerciseType: "squat" | "deadlift" | "bench" | "overhead_press" | "general";
    frameCount: number;
    duration: number;
    depth?: DepthCheck;
    symmetry?: SymmetryCheck;
    barPath?: BarPathPoint[];
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

    if (exerciseType === "squat") {
        depth = analyzeSquatDepth(frames);
        symmetry = analyzeSymmetry(frames);
        if (depth.passed) score += 25; else { score -= 10; tips.push("Try to hit at least parallel depth on squats."); }
        if (symmetry.passed) score += 20; else { score -= 5; tips.push("Work on evening out both sides — mobility drills can help."); }
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

    if (tips.length === 0) tips.push("Form looks solid. Keep it up!");

    return {
        exerciseType, frameCount: frames.length, duration: Math.round(duration),
        depth, symmetry, barPath,
        overallScore: Math.max(0, Math.min(100, score)), tips,
    };
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
