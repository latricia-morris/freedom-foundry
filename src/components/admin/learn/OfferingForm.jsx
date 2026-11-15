import React, { useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Field, GHOST, StatusSelect } from '@/components/admin/learn/fields';
import { ImageField, MediaField, mediaPatch, mediaValue } from '@/components/admin/learn/MediaFields';
import ResourcesEditor from '@/components/admin/learn/ResourcesEditor';

/** Course or book details, status and pricing. Saving also updates the product in Stripe. */
export default function OfferingForm({ offering, saving, onSave, onRemove }) {
  const [d, setD] = useState(offering);
  const [price, setPrice] = useState(offering.price_cents ? (offering.price_cents / 100).toFixed(2) : '');
  const set = (patch) => setD((prev) => ({ ...prev, ...patch }));
  const cents = Math.round(Number(price) * 100);
  const priceInvalid = !d.is_free && !(cents >= 50);

  const submit = () => onSave({
    title: d.title.trim(), subtitle: d.subtitle || '', author: d.author || '', description: d.description || '',
    thumbnail_url: d.thumbnail_url || '', embed_code: d.embed_code || '', resources: d.resources || [],
    status: d.status, is_free: !!d.is_free, price_cents: d.is_free ? 0 : cents, ...mediaPatch('video', mediaValue(d, 'video')),
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title"><input className="admin-input" value={d.title || ''} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Author"><input className="admin-input" value={d.author || ''} onChange={(e) => set({ author: e.target.value })} /></Field>
      </div>
      <Field label="Subtitle"><input className="admin-input" value={d.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
      <Field label="Description"><textarea className="admin-input min-h-28" value={d.description || ''} onChange={(e) => set({ description: e.target.value })} /></Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status"><StatusSelect value={d.status} onChange={(status) => set({ status })} /></Field>
        <Field label="Access">
          <select className="admin-input" value={d.is_free ? 'free' : 'paid'} onChange={(e) => set({ is_free: e.target.value === 'free' })}>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
        {!d.is_free && (
          <Field label="Price (USD)" hint={priceInvalid ? 'Enter at least 0.50.' : offering.stripe_price_id ? 'Linked to Stripe.' : 'Created in Stripe when you save.'}>
            <input className="admin-input" type="number" min="0.5" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
        )}
      </div>

      <ImageField value={d.thumbnail_url} onChange={(thumbnail_url) => set({ thumbnail_url })} />
      <MediaField label="Intro video" accept="video/*" placeholder="YouTube, Vimeo or video file link" value={mediaValue(d, 'video')} onChange={(v) => set(mediaPatch('video', v))} />
      <ResourcesEditor items={d.resources} onChange={(resources) => set({ resources })} />
      <Field label="Embed code" hint="Paste an embed snippet or an https link. It shows to members who have access.">
        <textarea className="admin-input min-h-20 font-mono text-xs" value={d.embed_code || ''} onChange={(e) => set({ embed_code: e.target.value })} />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button type="button" onClick={submit} disabled={saving || !d.title?.trim() || priceInvalid} className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details
        </button>
        <button type="button" onClick={onRemove} className={GHOST}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
      </div>
    </div>
  );
}