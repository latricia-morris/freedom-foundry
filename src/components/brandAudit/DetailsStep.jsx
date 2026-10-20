import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TIERS, normalizeUrl } from '@/lib/brandAudit';

export default function DetailsStep({ tier, details, setDetails, onChange, onDone }) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const d = details || {};
  const set = (k, v) => setDetails({ ...d, [k]: v });
  const links = d.links || [];
  const setLink = (i, k, v) => set('links', links.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const paid = tier !== 'courtesy';

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!d.brand_name?.trim()) return setErr('Add your brand or professional name.');
    const site = d.website?.trim() ? normalizeUrl(d.website) : '';
    if (site === null) return setErr('Check the website address.');
    if (paid && !site) return setErr('A website address is required for this review.');
    const bad = links.find((l) => l.url?.trim() && normalizeUrl(l.url) === null);
    if (bad) return setErr(`Check the link for ${bad.label || 'your profile'}.`);
    const clean = { ...d, website: site, links: links.filter((l) => l.url?.trim()).map((l) => ({ ...l, url: normalizeUrl(l.url) })) };
    if (!clean.website && !clean.links.length && !clean.needs_help) return setErr('Add at least one public link, or tell us you need help finding one.');
    setBusy(true);
    try { await onDone(clean); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="dashboard-card space-y-5 rounded-[7px] p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-3xl font-light">Where should we look?</h2>
        <p className="mt-2 text-muted-foreground">We’ve pulled in your saved details. Check the links, add anything missing, and confirm what you want reviewed.</p>
        <p className="mt-3 text-sm">Selected: <span className="text-foreground">{TIERS[tier]?.name}</span> · <button type="button" className="underline" onClick={onChange}>Change my selection</button></p>
      </div>
      <label className="block text-sm">Brand or professional name<input className="admin-input mt-1" value={d.brand_name || ''} onChange={(e) => set('brand_name', e.target.value)} /></label>
      <label className="block text-sm">Main website {paid ? '' : <span className="text-muted-foreground">(optional)</span>}<input className="admin-input mt-1" value={d.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="yourbrand.com" /></label>
      <fieldset>
        <legend className="text-sm">Public profiles and links</legend>
        <p className="mt-1 text-sm text-muted-foreground">Include the website and public profiles you want reviewed. You don’t need an account on every platform, and we don’t need individual website page links.</p>
        <div className="mt-3 space-y-2">
          {links.map((l, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2">
              <input aria-label="Link label" className="admin-input" value={l.label || ''} onChange={(e) => setLink(i, 'label', e.target.value)} placeholder="Instagram" />
              <input aria-label="Link address" className="admin-input" value={l.url || ''} onChange={(e) => setLink(i, 'url', e.target.value)} placeholder="https://" />
              <button type="button" aria-label="Remove link" className="request-choice px-3" onClick={() => set('links', links.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" className="request-choice mt-3 inline-flex min-h-[40px] items-center gap-2 px-4 py-2 text-sm" onClick={() => set('links', [...links, { label: '', url: '' }])}><Plus className="h-4 w-4" /> Add a link</button>
        <label className="request-check-row mt-3 text-sm"><input type="checkbox" checked={!!d.needs_help} onChange={(e) => set('needs_help', e.target.checked)} /><span>I don’t have public links yet and need help figuring out what to include.</span></label>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">Contact name<input className="admin-input mt-1" value={d.contact_name || ''} onChange={(e) => set('contact_name', e.target.value)} /></label>
        <label className="block text-sm">Contact email<input type="email" className="admin-input mt-1" value={d.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} /></label>
        <label className="block text-sm">Phone <span className="text-muted-foreground">(optional)</span><input className="admin-input mt-1" value={d.contact_phone || ''} onChange={(e) => set('contact_phone', e.target.value)} /></label>
      </div>
      <p className="text-xs text-muted-foreground">These details are saved with this request only. They don’t change your login or your brand profile.</p>
      <label className="block text-sm">What feels stuck, unclear, or overdue in your branding or marketing? <span className="text-muted-foreground">(optional)</span><textarea rows={4} className="admin-input mt-1" value={d.context || ''} onChange={(e) => set('context', e.target.value)} /></label>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <button type="submit" disabled={busy} className="request-primary min-h-[44px] px-5 py-2.5 text-sm font-semibold">{busy ? 'Saving…' : paid ? 'Confirm details & continue to payment' : 'Confirm & request my courtesy report'}</button>
    </form>
  );
}