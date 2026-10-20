import React, { useState } from 'react';
import { auditCall, goToCheckout } from '@/lib/brandAudit';

/** Rendered only after an admin explicitly releases the Action Strategy. */
export default function AuditStrategyOffer({ request, brandKey }) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const s = request.strategy_status;
  if (s === 'preparing') return <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">Your written Action Strategy is paid and being prepared. We’ll let you know when it’s ready.</p>;
  if (s === 'delivered') return <div className="mt-6 border-t border-border pt-5"><a className="request-choice inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm font-semibold" href={request.strategy_url} target="_blank" rel="noopener noreferrer">View my Action Strategy</a></div>;
  const buy = () => {
    setBusy(true); setErr('');
    goToCheckout(() => auditCall('strategy_checkout', { brand_key: brandKey, terms_accepted: agreed })).catch((e) => setErr(e.message)).finally(() => setBusy(false));
  };
  return (
    <div className="mt-6 border-t border-border pt-5">
      <h3 className="font-heading text-2xl font-light">Put the priorities we discussed into a plan you can use.</h3>
      <p className="mt-2 max-w-2xl text-muted-foreground">Your written Action Strategy organizes the agreed goals, next steps, dependencies, and review points so you know what to tackle and in what order.</p>
      <label className="request-check-row mt-4 max-w-2xl text-sm"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /><span>I understand the purchased scope and non-refundable policy.</span></label>
      {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
      <button className="request-primary mt-4 min-h-[44px] px-5 py-2.5 text-sm font-semibold" disabled={!agreed || busy} onClick={buy}>{busy ? 'Opening checkout…' : 'Get my Action Strategy · $97'}</button>
    </div>
  );
}