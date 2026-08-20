"use client";

import { useEffect, useState } from "react";
import { X, Save, FolderOpen, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthProvider";

type TemplateExerciseInput = {
  exercise_id: string;
  name: string;
  target_sets: number;
  target_reps: string;
  target_weight: number | null;
  rest_seconds: number | null;
  notes: string;
};

type TemplateSummary = { id: string; name: string; exercise_count: number };

export default function TemplateModal({
  mode,
  currentExercises,
  onClose,
  onLoad,
}: {
  mode: "save" | "load";
  currentExercises: TemplateExerciseInput[];
  onClose: () => void;
  onLoad: (exercises: TemplateExerciseInput[]) => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loadingList, setLoadingList] = useState(mode === "load");

  useEffect(() => {
    if (mode !== "load" || !user) return;
    (async () => {
      const { data: temps } = await supabase
        .from("workout_templates")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const ids = (temps ?? []).map((t: any) => t.id);
      let counts: Record<string, number> = {};
      if (ids.length) {
        const { data: rows } = await supabase
          .from("workout_template_exercises")
          .select("template_id")
          .in("template_id", ids);
        (rows ?? []).forEach((r: any) => { counts[r.template_id] = (counts[r.template_id] ?? 0) + 1; });
      }
      setTemplates((temps ?? []).map((t: any) => ({ id: t.id, name: t.name, exercise_count: counts[t.id] ?? 0 })));
      setLoadingList(false);
    })();
  }, [mode, user]);

  async function handleSave() {
    if (!user || !name.trim() || currentExercises.length === 0) return;
    setSaving(true);
    const { data: template, error } = await supabase
      .from("workout_templates")
      .insert({ user_id: user.id, name: name.trim() })
      .select()
      .single();
    if (error || !template) { setSaving(false); return; }

    const rows = currentExercises.map((ex, i) => ({
      template_id: template.id,
      user_id: user.id,
      exercise_id: ex.exercise_id,
      order_index: i,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      target_weight: ex.target_weight,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    }));
    await supabase.from("workout_template_exercises").insert(rows);
    setSaving(false);
    onClose();
  }

  async function handleLoad(templateId: string) {
    if (!user) return;
    const { data: rows } = await supabase
      .from("workout_template_exercises")
      .select("exercise_id, order_index, target_sets, target_reps, target_weight, rest_seconds, notes, exercises(name)")
      .eq("template_id", templateId)
      .order("order_index");

    const mapped: TemplateExerciseInput[] = (rows ?? []).map((r: any) => ({
      exercise_id: r.exercise_id,
      name: r.exercises?.name ?? "Unknown",
      target_sets: r.target_sets,
      target_reps: r.target_reps,
      target_weight: r.target_weight,
      rest_seconds: r.rest_seconds,
      notes: r.notes ?? "",
    }));
    onLoad(mapped);
    onClose();
  }

  async function handleDeleteTemplate(templateId: string) {
    await supabase.from("workout_templates").delete().eq("id", templateId);
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-md rounded-t-xl md:rounded-md border border-[rgb(var(--accent-rgb)/0.2)] bg-[#0a1524] p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold tracking-widest text-[rgb(var(--accent-light-rgb))]">
            {mode === "save" ? "SAVE AS TEMPLATE" : "LOAD TEMPLATE"}
          </p>
          <button onClick={onClose} className="text-white/40 hover:text-white/80"><X size={18} /></button>
        </div>

        {mode === "save" ? (
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Push Day"
              className="w-full rounded-md bg-white/[0.03] border border-[rgb(var(--accent-rgb)/0.2)] px-3 py-2.5 text-sm focus:outline-none focus:border-[rgb(var(--accent-rgb)/0.5)]"
              autoFocus
            />
            <p className="text-[11px] text-white/40">{currentExercises.length} exercises will be saved.</p>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving || currentExercises.length === 0}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-md bg-[rgb(var(--accent-rgb))] text-black hover:bg-[rgb(var(--accent-light-rgb))] transition disabled:opacity-40"
            >
              <Save size={15} /> {saving ? "SAVING..." : "SAVE TEMPLATE"}
            </button>
          </div>
        ) : loadingList ? (
          <p className="text-sm text-white/40 py-6 text-center">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-white/40 py-6 text-center">No templates saved yet.</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <button onClick={() => handleLoad(t.id)} className="flex-1 min-w-0 text-left flex items-center gap-2">
                  <FolderOpen size={15} className="text-[rgb(var(--accent-light-rgb))] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white/90 truncate">{t.name}</p>
                    <p className="text-[10px] font-mono text-white/40">{t.exercise_count} exercises</p>
                  </div>
                </button>
                <button onClick={() => handleDeleteTemplate(t.id)} className="text-white/30 hover:text-red-400 transition shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}