"use client";

import { Wind } from "lucide-react";
import MethodHeader from "../../components/ui/method-header";
import ComingSoon from "../../components/ui/coming-soon";

export default function YogaPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#050914] text-white p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-4">
        <MethodHeader tabs={[]} />
        <ComingSoon
          icon={Wind}
          name="Yoga & Mobility"
          description="Pose library, flow sequences, flexibility tracking"
          colorRgb="236 72 153"
        />
      </div>
    </main>
  );
}
