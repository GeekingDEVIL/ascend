"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type Tab = {
  key: string;
  label: string;
  href: string;
};

type MethodHeaderProps = {
  tabs: Tab[];
  backHref?: string;
  backLabel?: string;
};

export default function MethodHeader({ tabs, backHref = "/train", backLabel = "Train" }: MethodHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3 mb-1">
      <button
        onClick={() => router.push(backHref)}
        className="flex items-center gap-0.5 text-[10px] font-mono text-white/30 hover:text-white/60 transition shrink-0 -ml-1"
      >
        <ChevronLeft size={14} />
        {backLabel}
      </button>
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.href)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold tracking-wide transition ${
                active
                  ? "bg-[rgb(var(--accent-rgb)/0.12)] text-[rgb(var(--accent-rgb))] border border-[rgb(var(--accent-rgb)/0.2)]"
                  : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
