"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type CustomSelectOption = { value: string; label: string; sub?: string };

type CustomSelectProps = {
    options: CustomSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    label?: string;
};

export default function CustomSelect({ options, value, onChange, placeholder = "Select...", searchable = true, label }: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value) ?? null;
    const filtered = searchable && query.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()) || o.sub?.toLowerCase().includes(query.trim().toLowerCase()))
        : options;

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
        if (!open) setQuery("");
    }, [open]);

    function select(v: string) {
        onChange(v);
        setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            {label && <label className="text-[9px] font-mono text-white/30 mb-1 block">{label}</label>}

            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm font-mono text-left transition focus:outline-none focus:border-cyan-400/40"
            >
                <span className={`truncate ${selected ? "text-white/80" : "text-white/30"}`}>{selected ? selected.label : placeholder}</span>
                <ChevronDown size={14} className={`shrink-0 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <>
                    {/* Mobile: full bottom sheet */}
                    <div className="md:hidden fixed inset-0 z-[80] flex flex-col justify-end">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                        <div className="relative z-10 bg-[#0a1120] border-t border-cyan-400/20 rounded-t-2xl max-h-[75vh] flex flex-col">
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                <p className="text-xs font-mono tracking-widest text-white/40">{label ?? "SELECT"}</p>
                                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/70 transition">
                                    <X size={18} />
                                </button>
                            </div>
                            {searchable && (
                                <div className="px-5 pb-3">
                                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2.5">
                                        <Search size={14} className="text-white/30 shrink-0" />
                                        <input
                                            autoFocus
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search..."
                                            className="flex-1 min-w-0 bg-transparent text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="overflow-y-auto px-3 pb-6 space-y-1">
                                {filtered.length === 0 ? (
                                    <p className="text-xs font-mono text-white/30 text-center py-6">No results</p>
                                ) : (
                                    filtered.map((o) => (
                                        <button
                                            key={o.value}
                                            onClick={() => select(o.value)}
                                            className={`w-full flex items-center justify-between gap-2 px-3 py-3 rounded-lg text-left transition ${o.value === value ? "bg-cyan-400/10 text-cyan-300" : "text-white/70 hover:bg-white/[0.04]"}`}
                                        >
                                            <span className="min-w-0">
                                                <span className="block text-sm font-bold truncate">{o.label}</span>
                                                {o.sub && <span className="block text-[10px] font-mono text-white/30 truncate">{o.sub}</span>}
                                            </span>
                                            {o.value === value && <Check size={16} className="shrink-0 text-cyan-300" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop: inline dropdown */}
                    <div className="hidden md:block absolute z-[80] top-full left-0 right-0 mt-1.5 rounded-lg border border-cyan-400/20 bg-[#0a1120] shadow-xl overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-2">
                                    <Search size={13} className="text-white/30 shrink-0" />
                                    <input
                                        autoFocus
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="flex-1 min-w-0 bg-transparent text-xs font-mono text-white/80 placeholder:text-white/20 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                            {filtered.length === 0 ? (
                                <p className="text-xs font-mono text-white/30 text-center py-4">No results</p>
                            ) : (
                                filtered.map((o) => (
                                    <button
                                        key={o.value}
                                        onClick={() => select(o.value)}
                                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left text-xs font-mono transition ${o.value === value ? "bg-cyan-400/10 text-cyan-300" : "text-white/70 hover:bg-white/[0.05]"}`}
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate">{o.label}</span>
                                            {o.sub && <span className="block text-[9px] text-white/30 truncate">{o.sub}</span>}
                                        </span>
                                        {o.value === value && <Check size={13} className="shrink-0 text-cyan-300" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
