"use client";

import { PersonStanding } from "lucide-react";
import MethodHeader from "../../components/ui/method-header";
import ComingSoon from "../../components/ui/coming-soon";

export default function CalisthenicsPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        <MethodHeader tabs={[]} />
        <ComingSoon
          icon={PersonStanding}
          name="Calisthenics"
          description="Bodyweight skill progressions, holds, and planche training"
          colorRgb="139 92 246"
        />
      </div>
    </main>
  );
}
