"use client";

import { Activity } from "lucide-react";
import MethodHeader from "../../components/ui/method-header";
import ComingSoon from "../../components/ui/coming-soon";

export default function RunningPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        <MethodHeader tabs={[]} />
        <ComingSoon
          icon={Activity}
          name="Running"
          description="GPS run tracking, pace, splits, route history"
          colorRgb="249 115 22"
        />
      </div>
    </main>
  );
}
