import React, { useState } from 'react';
import { CREDIT_NOTE, DELIVERY_TEXT, TERMS_TEXT, TIERS, WEBSITE_SCOPE, auditCall, goToCheckout } from '@/lib/brandAudit';

export default function PayStep({ tier, details, brandKey, onBack }) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const t = TIERS[tier];
  const pay = () => {
    setBusy(true); setErr('');
    goToCheckout(() => auditCall('checkout', { brand_key: brandKey, details, terms_accepted: agreed }))
      .then((d) => { if (!d.url && d.request) window.location.reload(); })
      .catch((e) => setErr(e.message)).finally(() => setBusy(false));
  };
  return (
    <div className="dashboard-card space-y-4 rounded-[7px] p-6 sm:p-8">
      <h2 className="font-heading text-3xl font-light">Review your order</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div><dt className="text-sm text-muted-foreground">Review</dt><dd className="text-foreground">{t.name}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Total</dt><dd className="text-foreground">{t.short} USD, one-time</dd></div>
        <div><dt className="text-sm text-muted-foreground">Brand</dt><dd className="text-foreground">{details?.brand_name}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Website</dt><dd className="break-all text-foreground">{details?.website}</dd></div>
      </dl>
      <p className="text-sm text-muted-foreground">{WEBSITE_SCOPE}</p>
      <p className="text-sm text-muted-foreground">{DELIVERY_TEXT}</p>
      <p className="text-sm text-muted-foreground">{TERMS_TEXT}</p>
      <p className="text-sm text-muted-foreground">{CREDIT_NOTE}</p>
      <label className="request-check-row text-sm"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /><span>I understand the purchased scope and non-refundable policy.</span></label>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="request-choice min-h-[44px] px-5 py-2.5 text-sm" onClick={onBack}>Back to my details</button>
        <button type="button" disabled={!agreed || busy} onClick={pay} className="request-primary min-h-[44px] px-5 py-2.5 text-sm font-semibold">{busy ? 'Opening secure checkout…' : `Continue to secure payment · ${t.short}`}</button>
      </div>
    </div>
  );
}