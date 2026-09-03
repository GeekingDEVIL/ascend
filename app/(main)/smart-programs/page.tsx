"use client";

import { Brain } from "lucide-react";
import SwipeNav from "../../components/ui/swipe-nav";
import { getYouSections } from "../../lib/navPills";
import { useModules } from "../../lib/useModules";
import ComingSoon from "../../components/ui/coming-soon";

export default function SmartProgramsPage() {
  const { enabledKeys } = useModules();
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        <SwipeNav sections={getYouSections(enabledKeys)} />
        <ComingSoon
          icon={Brain}
          name="Smart Programs"
          description="AI-generated periodised training programs with auto-progression"
          colorRgb="20 184 166"
        />
      </div>
    </main>
  );
}
