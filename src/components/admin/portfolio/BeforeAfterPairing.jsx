import React, { useState } from 'react';
import { ArrowRight, Plus, X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { ASSET_TYPE_LABELS } from '@/lib/portfolioData';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

/** Intentional before-and-after pairing: pick the before, pick the after, caption it. */
export default function BeforeAfterPairing({ form, assets, onChange }) {
  const pairs = form.before_after_pairs || [];
  const [draft, setDraft] = useState({ before: '', after: '', caption: '' });

  const imageAssets = (assets || []).filter((a) => a.file_url && IMAGE_EXT.test(a.file_url));
  const byId = (id) => imageAssets.find((a) => a.id === id);

  const add = () => {
    if (!draft.before || !draft.after) return;
    onChange({
      before_after_pairs: [
        ...pairs,
        { before_asset_id: draft.before, after_asset_id: draft.after, caption: draft.caption },
      ],
    });
    setDraft({ before: '', after: '', caption: '' });
  };

  const remove = (index) => {
    onChange({ before_after_pairs: pairs.filter((_, i) => i !== index) });
  };

  return (
    <div className="dashboard-card space-y-5 p-6">
      <div>
        <h3 className="font-heading text-2xl text-foreground">Before &amp; After</h3>
        <p className="text-xs text-muted-foreground/70">
          Pair a before with an after on purpose. Pairs display side by side on the case study.
        </p>
      </div>

      {pairs.length > 0 && (
        <div className="space-y-3">
          {pairs.map((pair, index) => {
            const before = byId(pair.before_asset_id);
            const after = byId(pair.after_asset_id);
            return (
              <div key={index} className="flex flex-wrap items-center gap-4 rounded-md border border-border/70 bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-sm border border-border bg-background text-[10px] uppercase tracking-widest text-muted-foreground/70">
                    {before ? <Image src={before.file_url} alt={before.alt_text || before.title} fittingType="fill" className="h-14 w-14" /> : 'Missing'}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-sm border border-border bg-background text-[10px] uppercase tracking-widest text-muted-foreground/70">
                    {after ? <Image src={after.file_url} alt={after.alt_text || after.title} fittingType="fill" className="h-14 w-14" /> : 'Missing'}
                  </span>
                </div>
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">{pair.caption || `${before?.title || 'Before'} → ${after?.title || 'After'}`}</p>
                <button type="button" onClick={() => remove(index)} className="rounded-sm p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove pair">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {imageAssets.length >= 2 ? (
        <div className="grid gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Before</span>
            <select className="admin-input py-1.5 text-sm" value={draft.before} onChange={(e) => setDraft({ ...draft, before: e.target.value })}>
              <option value="">— Select —</option>
              {imageAssets.map((a) => <option key={a.id} value={a.id}>{a.title} · {ASSET_TYPE_LABELS[a.asset_type] || a.asset_type}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">After</span>
            <select className="admin-input py-1.5 text-sm" value={draft.after} onChange={(e) => setDraft({ ...draft, after: e.target.value })}>
              <option value="">— Select —</option>
              {imageAssets.map((a) => <option key={a.id} value={a.id}>{a.title} · {ASSET_TYPE_LABELS[a.asset_type] || a.asset_type}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Caption (optional)</span>
            <div className="flex gap-2">
              <input className="admin-input py-1.5 text-sm" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} placeholder="What changed and why it matters" />
              <button
                type="button"
                onClick={add}
                disabled={!draft.before || !draft.after}
                className="btn-forge shrink-0 rounded-md px-3 text-xs font-semibold uppercase tracking-widest disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </label>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/70">Upload at least two images to start pairing before-and-after moments.</p>
      )}
    </div>
  );
}