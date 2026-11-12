import React from 'react';
import { FileUp, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { REPORT_TYPES } from '@/lib/reportIntake';

const L = 'mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground';

/** Step 1: choose the client and report type, then paste or upload the report text. */
export default function ReportSourceStep({ clients, value, onChange, onParse, parsing }) {
  const { toast } = useToast();
  const set = (patch) => onChange({ ...value, ...patch });

  const readFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    if (file.size > 2_000_000 || text.includes('\u0000')) {
      toast({ title: 'That is not a text file', description: 'Upload markdown, HTML, XML, TXT or another plain-text file.', variant: 'destructive' });
      return;
    }
    set({ text, fileName: file.name });
  };

  const ready = value.clientId && value.text.trim();

  return (
    <div className="dashboard-card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={L} htmlFor="intake-client">Client</label>
          <select id="intake-client" className="admin-input" value={value.clientId} onChange={(e) => set({ clientId: e.target.value })}>
            <option value="">Choose a client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className={L} htmlFor="intake-type">Report type</label>
          <select id="intake-type" className="admin-input" value={value.type} onChange={(e) => set({ type: e.target.value })}>
            {REPORT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className={`${L} mb-0`} htmlFor="intake-text">Report text</label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <FileUp className="h-3.5 w-3.5" /> {value.fileName || 'Upload a text file'}
            <input type="file" className="hidden" onChange={readFile} />
          </label>
        </div>
        <textarea
          id="intake-text"
          className="admin-input min-h-72 font-mono text-xs"
          placeholder="Paste the report here as markdown, HTML, XML or plain text, or upload a file above."
          value={value.text}
          onChange={(e) => set({ text: e.target.value, fileName: '' })}
        />
      </div>

      <button type="button" onClick={onParse} disabled={!ready || parsing} className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
        {parsing ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing report…</> : <><Sparkles className="h-4 w-4" /> Parse report</>}
      </button>
    </div>
  );
}