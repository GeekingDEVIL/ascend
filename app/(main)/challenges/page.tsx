"use client";

import { Swords } from "lucide-react";
import SwipeNav from "../../components/ui/swipe-nav";
import { getSocialSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import ComingSoon from "../../components/ui/coming-soon";

export default function ChallengesPage() {
  const { enabledKeys } = useModules();
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        <SwipeNav sections={getSocialSections(enabledKeys)} />
        <ComingSoon
          icon={Swords}
          name="Challenges"
          description="Weekly and monthly fitness challenges with friends"
          colorRgb="59 130 246"
        />
      </div>
    </main>
  );
}
