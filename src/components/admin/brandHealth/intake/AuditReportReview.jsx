import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ACTION_PRIORITIES } from '@/lib/brandHealth';
import MatrixReviewFields from '@/components/admin/brandHealth/intake/MatrixReviewFields';

const L = 'mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground';
const ADD = 'mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground';
const TAKEAWAYS = [['prioritize', 'Prioritize'], ['maintain', 'Maintain'], ['test', 'Test']];

/** Step 2 for audit reports: every parsed field, editable before it is saved. */
export default function AuditReportReview({ type, draft, onChange }) {
  const set = (patch) => onChange({ ...draft, ...patch });
  const setRow = (key, i, patch) => set({ [key]: draft[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const dropRow = (key, i) => set({ [key]: draft[key].filter((_, j) => j !== i) });
  const remove = (key, i) => (
    <button type="button" aria-label="Remove" onClick={() => dropRow(key, i)} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
  );

  return (
    <div className="space-y-6">
      {type === 'marketing_matrix' ? <MatrixReviewFields draft={draft} onChange={onChange} /> : (
        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <div>
            <label className={L} htmlFor="rv-score">Overall score (0-100)</label>
            <input id="rv-score" type="number" min="0" max="100" className="admin-input" value={draft.score} onChange={(e) => set({ score: e.target.value })} />
          </div>
          <div>
            <p className={L}>Section scores</p>
            <div className="space-y-2">
              {draft.subscores.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input aria-label="Section name" className="admin-input flex-1" value={s.label} onChange={(e) => setRow('subscores', i, { label: e.target.value })} />
                  <input aria-label="Section score" type="number" min="0" max="100" className="admin-input w-24" value={s.score} onChange={(e) => setRow('subscores', i, { score: e.target.value })} />
                  {remove('subscores', i)}
                </div>
              ))}
            </div>
            <button type="button" className={ADD} onClick={() => set({ subscores: [...draft.subscores, { label: '', score: '' }] })}><Plus className="h-3.5 w-3.5" /> Add section</button>
          </div>
        </div>
      )}

      <div>
        <label className={L} htmlFor="rv-summary">Consultant summary</label>
        <textarea id="rv-summary" className="admin-input min-h-28" value={draft.summary} onChange={(e) => set({ summary: e.target.value })} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TAKEAWAYS.map(([key, label]) => (
          <div key={key}>
            <label className={L} htmlFor={`rv-${key}`}>{label}</label>
            <textarea id={`rv-${key}`} className="admin-input min-h-24" value={draft[key]} onChange={(e) => set({ [key]: e.target.value })} />
          </div>
        ))}
      </div>

      <div>
        <label className={L} htmlFor="rv-evidence">Evidence note</label>
        <textarea id="rv-evidence" className="admin-input min-h-20" value={draft.evidenceNote} onChange={(e) => set({ evidenceNote: e.target.value })} />
      </div>

      <div>
        <p className={L}>Action plan ({draft.actions.length})</p>
        <div className="space-y-2">
          {draft.actions.map((a, i) => (
            <div key={i} className="grid items-start gap-2 sm:grid-cols-[1.2fr_2fr_140px_auto]">
              <input aria-label="Action title" className="admin-input" placeholder="Title" value={a.title} onChange={(e) => setRow('actions', i, { title: e.target.value })} />
              <textarea aria-label="Action detail" className="admin-input min-h-11" placeholder="Detail" value={a.detail} onChange={(e) => setRow('actions', i, { detail: e.target.value })} />
              <select aria-label="Priority" className="admin-input capitalize" value={a.priority} onChange={(e) => setRow('actions', i, { priority: e.target.value })}>
                {ACTION_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {remove('actions', i)}
            </div>
          ))}
        </div>
        <button type="button" className={ADD} onClick={() => set({ actions: [...draft.actions, { title: '', detail: '', priority: 'medium' }] })}><Plus className="h-3.5 w-3.5" /> Add action</button>
      </div>
    </div>
  );
}