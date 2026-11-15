import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field, GHOST, LABEL } from '@/components/admin/learn/fields';

/** The worksheet attached to a lesson: questions for the learner and the prompt their answers are placed into. */
export default function WorksheetEditor({ value, onChange }) {
  const w = value || {};
  const questions = w.questions || [];
  const set = (patch) => onChange({ ...w, ...patch });
  const setQ = (i, label) => set({ questions: questions.map((q, j) => (j === i ? { ...q, label } : q)) });

  return (
    <div className="space-y-4 border border-border p-4">
      <div>
        <p className="font-heading text-xl text-foreground">Worksheet</p>
        <p className="text-xs text-muted-foreground">Optional. It appears on the lesson once it has at least one question.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Worksheet title"><input className="admin-input" value={w.title || ''} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Instructions"><input className="admin-input" value={w.intro || ''} onChange={(e) => set({ intro: e.target.value })} /></Field>
      </div>
      <div>
        <span className={LABEL}>Questions</span>
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-center gap-2">
              <span className="w-6 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <input aria-label={`Question ${i + 1}`} className="admin-input flex-1" value={q.label} onChange={(e) => setQ(i, e.target.value)} />
              <button type="button" aria-label="Remove question" onClick={() => set({ questions: questions.filter((_, j) => j !== i) })} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" className={`${GHOST} mt-2`} onClick={() => set({ questions: [...questions, { id: `q${Date.now().toString(36)}`, label: '' }] })}>
          <Plus className="h-3.5 w-3.5" /> Add question
        </button>
      </div>
      <Field label="AI prompt" hint="The learner's answers are added after this prompt. To place them somewhere specific, type {{answers}} where they should go.">
        <textarea className="admin-input min-h-32" value={w.prompt_template || ''} onChange={(e) => set({ prompt_template: e.target.value })} />
      </Field>
    </div>
  );
}