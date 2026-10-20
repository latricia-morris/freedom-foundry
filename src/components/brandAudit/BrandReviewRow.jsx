import React, { useState } from 'react';
import { STATUS_LABEL, TIERS } from '@/lib/brandAudit';

const WORK = ['submitted', 'information_needed', 'queued', 'in_review', 'ready_for_call', 'unable_to_proceed'];

export default function BrandReviewRow({ r, act }) {
  const [call, setCall] = useState(r.call_scheduled_at ? r.call_scheduled_at.slice(0, 16) : '');
  const [notes, setNotes] = useState(r.admin_notes || '');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const run = (...a) => { setErr(''); act(...a).catch((e) => setErr(e.message)); };
  const d = r.details || {};
  return (
    <article className="dashboard-card space-y-4 rounded-[7px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-light">{r.brand_label}</h2>
          <p className="text-sm text-muted-foreground">{r.user_email} · {TIERS[r.tier]?.name || 'No selection'} · {STATUS_LABEL[r.status]} · Payment: {r.payment_status}{r.amount_cents ? ` ($${(r.amount_cents / 100).toFixed(2)})` : ''}</p>
        </div>
        {r.receipt_url && <a className="text-sm underline" href={r.receipt_url} target="_blank" rel="noopener noreferrer">Receipt</a>}
      </div>
      <div className="grid gap-4 text-sm md:grid-cols-2">
        <div>
          <p>Website: <span className="break-all text-foreground">{d.website || 'None'}</span></p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">{(d.links || []).map((l, i) => <li key={i} className="break-all">{l.label}: {l.url}</li>)}</ul>
          {d.needs_help && <p className="mt-1 text-primary">Needs help identifying public links</p>}
          <p className="mt-2 text-muted-foreground">{d.contact_name} · {d.contact_email} {d.contact_phone}</p>
          {d.context && <p className="mt-2 text-muted-foreground">“{d.context}”</p>}
        </div>
        <div className="space-y-2">
          <label className="block">Status<select className="admin-input mt-1" value={WORK.includes(r.status) ? r.status : ''} onChange={(e) => run('admin_update', r.id, { patch: { status: e.target.value } })}>
            <option value="" disabled>{STATUS_LABEL[r.status]}</option>{WORK.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
          <label className="block">Findings call<input type="datetime-local" className="admin-input mt-1" value={call} onChange={(e) => setCall(e.target.value)} onBlur={() => run('admin_update', r.id, { patch: { call_scheduled_at: call ? new Date(call).toISOString() : '' } })} /></label>
          <label className="block">Internal notes<textarea rows={2} className="admin-input mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => run('admin_update', r.id, { patch: { admin_notes: notes } })} /></label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        {!r.call_completed_at && <button className="request-choice px-4 py-2 text-sm" onClick={() => run('admin_call_completed', r.id)}>Mark findings call completed</button>}
        {r.call_completed_at && r.status !== 'released' && <button className="request-primary px-4 py-2 text-sm font-semibold" onClick={() => run('admin_release', r.id)}>Release report & included recommendations</button>}
        {r.tier === 'courtesy' && r.call_completed_at && (!r.strategy_status || r.strategy_status === 'hidden') && <button className="request-choice px-4 py-2 text-sm" onClick={() => run('admin_release_strategy', r.id)}>Make Action Strategy available · $97</button>}
        {r.strategy_status && r.strategy_status !== 'hidden' && <span className="self-center text-sm text-muted-foreground">Action Strategy: {r.strategy_status}</span>}
        {r.strategy_status === 'preparing' && <span className="flex gap-2"><input className="admin-input" placeholder="Strategy document link" value={url} onChange={(e) => setUrl(e.target.value)} /><button className="request-primary px-4 py-2 text-sm" disabled={!url} onClick={() => run('admin_deliver_strategy', r.id, { url })}>Publish strategy</button></span>}
      </div>
      {r.released_at && <p className="text-xs text-muted-foreground">Released {new Date(r.released_at).toLocaleString()} by {r.released_by}</p>}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    </article>
  );
}