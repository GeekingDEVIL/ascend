"use client";

import { type EnergyReceipt, type SystemValue, type ValueSource } from "../lib/systemValue";

const SOURCE_LABELS: Record<ValueSource, { text: string; color: string }> = {
  formula: { text: "FORMULA", color: "text-cyan-300/60" },
  user_override: { text: "MANUAL", color: "text-amber-300/60" },
  adaptive: { text: "ADAPTIVE", color: "text-emerald-300/60" },
  blended: { text: "BLENDED", color: "text-violet-300/60" },
  default: { text: "DEFAULT", color: "text-white/30" },
};

function ReceiptRow({ sv, unit }: { sv: SystemValue<number | string>; unit?: string }) {
  const src = SOURCE_LABELS[sv.source];
  return (
    <div className="py-2 border-b border-dashed border-white/[0.06] last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/50">{sv.label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] ${src.color}`}>{src.text}</span>
          <span className="text-sm font-bold font-mono text-white/80">
            {typeof sv.value === "number" ? sv.value : sv.value}
            {unit && <span className="text-[9px] text-white/25 ml-0.5">{unit}</span>}
          </span>
        </div>
      </div>
      {sv.detail && <p className="text-[8px] font-mono text-white/20 mt-0.5">{sv.detail}</p>}
    </div>
  );
}

export default function EnergyReceiptPanel({ receipt, onClose }: { receipt: EnergyReceipt; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#0a0f1a] border-t border-[rgb(var(--accent-rgb)/0.2)] rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono tracking-widest text-[rgb(var(--accent-light-rgb)/0.4)]">ENERGY RECEIPT</p>
          <button onClick={onClose} className="text-[10px] font-mono text-white/30 hover:text-white/60 transition">CLOSE</button>
        </div>

        <div className="space-y-0">
          <ReceiptRow sv={receipt.bmr} unit="kcal" />
          <ReceiptRow sv={receipt.tdee} unit="kcal" />
          <ReceiptRow sv={receipt.calorieTarget} unit="kcal" />
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <p className="text-[9px] font-mono text-white/25 mb-2">MACROS</p>
          <div className="space-y-0">
            <ReceiptRow sv={receipt.macros.protein} unit="g" />
            <ReceiptRow sv={receipt.macros.fat} unit="g" />
            <ReceiptRow sv={receipt.macros.carbs} unit="g" />
          </div>
        </div>

        {receipt.adjustments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-[9px] font-mono text-white/25 mb-2">ADJUSTMENTS</p>
            {receipt.adjustments.map((adj, i) => (
              <ReceiptRow key={i} sv={adj} />
            ))}
          </div>
        )}

        <p className="text-[7px] font-mono text-white/10 mt-4 text-center">Every number has a source. No magic.</p>
      </div>
    </div>
  );
}
