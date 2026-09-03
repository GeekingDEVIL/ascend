"use client";

import { useCallback, useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, animate } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

export type SwipeSection = {
  key: string;
  label: string;
  colorRgb: string;
};

type SwipeNavProps = {
  sections: SwipeSection[];
};

const SWIPE_THRESHOLD = 50;

export default function SwipeNav({ sections, sectionId }: SwipeNavProps & { sectionId?: string }) {
  const layoutGroup = sectionId ?? sections[0]?.key ?? "swipe";
  const router = useRouter();
  const pathname = usePathname();
  const currentIndex = sections.findIndex((s) => s.key === pathname);
  const idx = currentIndex === -1 ? 0 : currentIndex;
  const x = useMotionValue(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [idx]);

  const goTo = useCallback(
    (targetIdx: number) => {
      if (targetIdx >= 0 && targetIdx < sections.length && targetIdx !== idx) {
        router.push(sections[targetIdx].key);
      }
    },
    [idx, sections, router],
  );

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const swipe = info.offset.x;
      const velocity = info.velocity.x;
      if (swipe < -SWIPE_THRESHOLD || velocity < -500) {
        goTo(idx + 1);
      } else if (swipe > SWIPE_THRESHOLD || velocity > 500) {
        goTo(idx - 1);
      }
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    },
    [idx, goTo, x],
  );

  if (sections.length <= 1) return null;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      style={{ x }}
      className="touch-pan-y cursor-grab active:cursor-grabbing select-none"
    >
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {sections.map((s, i) => {
          const isActive = i === idx;
          return (
            <button
              key={s.key}
              ref={isActive ? activeRef : undefined}
              onClick={() => goTo(i)}
              className="relative px-2.5 py-1.5 rounded-md transition-all duration-200 shrink-0"
              style={{
                backgroundColor: isActive ? `rgb(${s.colorRgb} / 0.12)` : "transparent",
              }}
            >
              <span
                className="text-[10px] font-mono tracking-[0.12em] uppercase whitespace-nowrap transition-colors duration-200"
                style={{
                  color: isActive ? `rgb(${s.colorRgb})` : "rgb(255 255 255 / 0.25)",
                }}
              >
                {s.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId={`swipe-indicator-${layoutGroup}`}
                  className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full"
                  style={{ backgroundColor: `rgb(${s.colorRgb})` }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
