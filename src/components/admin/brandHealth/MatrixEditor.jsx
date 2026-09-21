import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

/** Consultant-built Marketing Matrix: channels, journey stages, strategy note. */
export default function MatrixEditor({ audit, onSave }) {
  const [channels, setChannels] = useState([]);
  const [stages, setStages] = useState([]);
  const [strategy, setStrategy] = useState('');
  useEffect(() => {
    setChannels(audit?.matrix_channels || []);
    setStages(audit?.matrix_stages || []);
    setStrategy(audit?.matrix_strategy_note || '');
  }, [audit?.id, audit?.updated_date]);

  const updateChannel = (i, patch) => setChannels(channels.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const updateStage = (i, patch) => setStages(stages.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Channel fit</p>
        <div className="space-y-2">
          {channels.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="admin-input max-w-56" placeholder="Channel (e.g. SEO & content)" value={row.channel || ''} onChange={(e) => updateChannel(i, { channel: e.target.value })} />
              <input className="admin-input" placeholder="Fit note — how well this channel fits the growth strategy" value={row.fit_note || ''} onChange={(e) => updateChannel(i, { fit_note: e.target.value })} />
              <button type="button" onClick={() => setChannels(channels.filter((_, j) => j !== i))} aria-label="Remove channel" className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setChannels([...channels, { channel: '', fit_note: '' }])} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <Plus className="h-3.5 w-3.5" /> Add channel
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Customer journey stages</p>
        <div className="space-y-2">
          {stages.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="admin-input max-w-56" placeholder="Stage (e.g. Discovery)" value={row.stage || ''} onChange={(e) => updateStage(i, { stage: e.target.value })} />
              <input className="admin-input" placeholder="What matters most at this stage" value={row.note || ''} onChange={(e) => updateStage(i, { note: e.target.value })} />
              <button type="button" onClick={() => setStages(stages.filter((_, j) => j !== i))} aria-label="Remove stage" className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setStages([...stages, { stage: '', note: '' }])} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <Plus className="h-3.5 w-3.5" /> Add stage
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Strategy note (client-facing)</p>
        <textarea className="admin-input" rows={4} value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="How the recommended channels and journey stages connect into one strategy" />
      </div>

      <button
        type="button"
        onClick={() => onSave({ matrix_channels: channels, matrix_stages: stages, matrix_strategy_note: strategy })}
        className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
      >
        <Save className="h-3.5 w-3.5" /> Save matrix
      </button>
    </div>
  );
}