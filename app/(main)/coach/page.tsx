"use client";

import { Sparkles } from "lucide-react";

export default function CoachPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-[rgb(var(--accent-rgb)/0.1)] rounded-full blur-[130px]" />

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white/90">AI Coach</h1>
          <p className="text-white/40 text-sm mt-0.5">Your personal training advisor.</p>
        </div>

        <div className="rounded-lg border border-[rgb(var(--accent-rgb)/0.15)] bg-white/[0.03] p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[rgb(var(--accent-rgb)/0.15)] border border-[rgb(var(--accent-light-rgb)/0.3)] flex items-center justify-center" style={{ boxShadow: "0 0 25px -4px rgb(var(--accent-rgb) / 0.5)" }}>
            <Sparkles size={26} className="text-[rgb(var(--accent-light-rgb))]" />
          </div>
          <p className="text-[10px] font-mono tracking-[0.3em] text-[rgb(var(--accent-light-rgb)/0.7)] mb-2">COMING SOON</p>
          <p className="text-lg font-bold text-white/90 mb-2">AI Coach is training up.</p>
          <p className="text-sm text-white/40 max-w-sm mx-auto">
            Personalized programming advice, form cues, and adaptive coaching based on your training history will land here in a future update.
          </p>
        </div>
      </div>
    </main>
  );
}
