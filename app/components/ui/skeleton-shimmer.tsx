"use client";

export function SkeletonCard() {
  return (
    <div className="glass-card p-4 flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-white/[0.06] shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-24 rounded bg-white/[0.06] shimmer" />
        <div className="h-2.5 w-40 rounded bg-white/[0.04] shimmer" style={{ animationDelay: "0.1s" }} />
      </div>
    </div>
  );
}

export function SkeletonHub() {
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10">
      <div className="relative z-10 w-full max-w-xl mx-auto space-y-4">
        {/* Title */}
        <div className="h-6 w-20 rounded bg-white/[0.06] shimmer" />

        {/* SwipeNav placeholder */}
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-md bg-white/[0.06] shimmer" />
          <div className="h-7 w-24 rounded-md bg-white/[0.04] shimmer" style={{ animationDelay: "0.1s" }} />
          <div className="h-7 w-20 rounded-md bg-white/[0.04] shimmer" style={{ animationDelay: "0.15s" }} />
        </div>

        {/* Hero card */}
        <div className="glass-card p-5 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] shimmer" />
          <div className="h-5 w-36 rounded bg-white/[0.06] shimmer" />
          <div className="h-3 w-48 rounded bg-white/[0.04] shimmer" style={{ animationDelay: "0.1s" }} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-card p-4 space-y-2">
            <div className="h-2.5 w-14 rounded bg-white/[0.04] shimmer" />
            <div className="h-6 w-16 rounded bg-white/[0.06] shimmer" style={{ animationDelay: "0.05s" }} />
          </div>
          <div className="glass-card p-4 space-y-2">
            <div className="h-2.5 w-10 rounded bg-white/[0.04] shimmer" style={{ animationDelay: "0.1s" }} />
            <div className="h-6 w-12 rounded bg-white/[0.06] shimmer" style={{ animationDelay: "0.15s" }} />
          </div>
        </div>

        {/* Full-width card */}
        <div className="glass-card p-4 space-y-2">
          <div className="h-2.5 w-20 rounded bg-white/[0.04] shimmer" />
          <div className="h-6 w-24 rounded bg-white/[0.06] shimmer" style={{ animationDelay: "0.05s" }} />
          <div className="h-2.5 w-40 rounded bg-white/[0.04] shimmer" style={{ animationDelay: "0.1s" }} />
        </div>
      </div>
    </main>
  );
}
