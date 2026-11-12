import React from 'react';
import { Trash2 } from 'lucide-react';
import { CHANNEL_CATEGORIES, CONSULTANT_PRIORITIES, MATRIX_SCORECARDS } from '@/lib/matrix';

const L = 'mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground';

/** Marketing Matrix review: the five scorecards and the channels found in the report. */
export default function MatrixReviewFields({ draft, onChange }) {
  const setCard = (key, patch) => onChange({ ...draft, scorecards: { ...draft.scorecards, [key]: { ...draft.scorecards[key], ...patch } } });
  const setChannel = (i, patch) => onChange({ ...draft, channels: draft.channels.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  return (
    <>
      <div>
        <p className={L}>Scorecards (0-100, blank stays unscored)</p>
        <div className="grid gap-3 lg:grid-cols-2">
          {MATRIX_SCORECARDS.map(({ key, label }) => (
            <div key={key} className="rounded-md border border-border/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm text-foreground">{label}</span>
                <input type="number" min="0" max="100" aria-label={`${label} score`} className="admin-input w-24" value={draft.scorecards[key].score} onChange={(e) => setCard(key, { score: e.target.value })} />
              </div>
              <textarea aria-label={`${label} summary`} className="admin-input min-h-20" placeholder="Summary" value={draft.scorecards[key].summary} onChange={(e) => setCard(key, { summary: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className={L}>Channels ({draft.channels.length})</p>
        <div className="space-y-2">
          {draft.channels.map((c, i) => (
            <div key={i} className="grid items-center gap-2 sm:grid-cols-[1.2fr_1fr_1fr_2fr_auto]">
              <input aria-label="Channel name" className="admin-input" value={c.channel_name} onChange={(e) => setChannel(i, { channel_name: e.target.value })} />
              <select aria-label="Category" className="admin-input" value={c.category || ''} onChange={(e) => setChannel(i, { category: e.target.value })}>
                <option value="">Category</option>
                {CHANNEL_CATEGORIES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <select aria-label="Priority" className="admin-input" value={c.consultant_priority || ''} onChange={(e) => setChannel(i, { consultant_priority: e.target.value })}>
                <option value="">Priority</option>
                {CONSULTANT_PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
              <input aria-label="Next action" className="admin-input" placeholder="Next action" value={c.next_action || ''} onChange={(e) => setChannel(i, { next_action: e.target.value })} />
              <button type="button" aria-label="Remove channel" onClick={() => onChange({ ...draft, channels: draft.channels.filter((_, j) => j !== i) })} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!draft.channels.length && <p className="text-sm text-muted-foreground">No channels were found in this report.</p>}
        </div>
      </div>
    </>
  );
}