"use client";

import { Palette } from "lucide-react";
import SwipeNav from "../../components/ui/swipe-nav";
import { getSocialSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import ComingSoon from "../../components/ui/coming-soon";

export default function CosmeticsPage() {
  const { enabledKeys } = useModules();
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        <SwipeNav sections={getSocialSections(enabledKeys)} />
        <ComingSoon
          icon={Palette}
          name="Cosmetics"
          description="Earned avatars, frames, and profile flair from achievements"
          colorRgb="249 115 22"
        />
      </div>
    </main>
  );
}
