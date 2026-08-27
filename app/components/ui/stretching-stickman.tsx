"use client";

import { useEffect, useState } from "react";

type Pose = {
  head: { cx: number; cy: number };
  body: { x1: number; y1: number; x2: number; y2: number };
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
};

const POSES: Pose[] = [
  // Standing neutral
  {
    head: { cx: 20, cy: 8 },
    body: { x1: 20, y1: 12, x2: 20, y2: 28 },
    leftArm: "M20,16 L12,24",
    rightArm: "M20,16 L28,24",
    leftLeg: "M20,28 L14,38",
    rightLeg: "M20,28 L26,38",
  },
  // Arms up stretch
  {
    head: { cx: 20, cy: 8 },
    body: { x1: 20, y1: 12, x2: 20, y2: 28 },
    leftArm: "M20,16 L10,8",
    rightArm: "M20,16 L30,8",
    leftLeg: "M20,28 L14,38",
    rightLeg: "M20,28 L26,38",
  },
  // Side stretch left
  {
    head: { cx: 18, cy: 7 },
    body: { x1: 20, y1: 12, x2: 20, y2: 28 },
    leftArm: "M20,16 L10,20",
    rightArm: "M20,16 L12,4",
    leftLeg: "M20,28 L14,38",
    rightLeg: "M20,28 L26,38",
  },
  // Lunge stretch
  {
    head: { cx: 20, cy: 8 },
    body: { x1: 20, y1: 12, x2: 20, y2: 28 },
    leftArm: "M20,16 L12,22",
    rightArm: "M20,16 L28,22",
    leftLeg: "M20,28 L10,36",
    rightLeg: "M20,28 L30,34",
  },
  // Side stretch right
  {
    head: { cx: 22, cy: 7 },
    body: { x1: 20, y1: 12, x2: 20, y2: 28 },
    leftArm: "M20,16 L28,4",
    rightArm: "M20,16 L30,20",
    leftLeg: "M20,28 L14,38",
    rightLeg: "M20,28 L26,38",
  },
  // Quad stretch
  {
    head: { cx: 20, cy: 8 },
    body: { x1: 20, y1: 12, x2: 20, y2: 28 },
    leftArm: "M20,16 L12,20",
    rightArm: "M20,16 L28,20",
    leftLeg: "M20,28 L14,38",
    rightLeg: "M20,28 L26,34 L22,28",
  },
];

export default function StretchingStickman({ size = 40, className = "", color = "rgb(var(--accent-light-rgb))" }: { size?: number; className?: string; color?: string }) {
  const [poseIndex, setPoseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoseIndex((i) => (i + 1) % POSES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const pose = POSES[poseIndex];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 42"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle
        cx={pose.head.cx}
        cy={pose.head.cy}
        r="4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      >
        <animate attributeName="cx" values={POSES.map((p) => p.head.cx).join(";")} dur={`${POSES.length * 1.2}s`} repeatCount="indefinite" />
        <animate attributeName="cy" values={POSES.map((p) => p.head.cy).join(";")} dur={`${POSES.length * 1.2}s`} repeatCount="indefinite" />
      </circle>

      {/* Body */}
      <line
        x1={pose.body.x1}
        y1={pose.body.y1}
        x2={pose.body.x2}
        y2={pose.body.y2}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Left arm */}
      <path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate attributeName="d" values={POSES.map((p) => p.leftArm).join(";")} dur={`${POSES.length * 1.2}s`} repeatCount="indefinite" />
      </path>

      {/* Right arm */}
      <path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate attributeName="d" values={POSES.map((p) => p.rightArm).join(";")} dur={`${POSES.length * 1.2}s`} repeatCount="indefinite" />
      </path>

      {/* Left leg */}
      <path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate attributeName="d" values={POSES.map((p) => p.leftLeg).join(";")} dur={`${POSES.length * 1.2}s`} repeatCount="indefinite" />
      </path>

      {/* Right leg */}
      <path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate attributeName="d" values={POSES.map((p) => p.rightLeg).join(";")} dur={`${POSES.length * 1.2}s`} repeatCount="indefinite" />
      </path>
    </svg>
  );
}
