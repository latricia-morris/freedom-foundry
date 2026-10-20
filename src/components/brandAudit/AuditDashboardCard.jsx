import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuditState from '@/components/brandAudit/useAuditState';
import AuditStrategyOffer from '@/components/brandAudit/AuditStrategyOffer';
import { ACTIVE, getStoredBrand, storeBrand } from '@/lib/brandAudit';
import '@/components/projectRequests/requests.css';

function cardCopy(state) {
  const r = state.request;
  const to = `/brand-review?brand=${encodeURIComponent(state.brand.key)}`;
  if (r?.status === 'released' || (!r && state.legacy_released)) {
    const paid = r && r.tier !== 'courtesy';
    return { eyebrow: 'BRAND HEALTH INDEX', title: 'Your report is ready to revisit.', body: paid ? 'Review the findings and next steps we discussed, with your report and recommendations together in your account.' : 'Revisit the findings we discussed and the gaps worth addressing.', cta: paid ? 'View my report & recommendations' : 'View my report', to: r?.report_path || '/brand-portal/brand-health' };
  }
  if (r && ACTIVE.includes(r.status)) {
    const when = r.call_scheduled_at ? `Your findings call: ${new Date(r.call_scheduled_at).toLocaleString([], { dateStyle: 'long', timeStyle: 'short', timeZoneName: 'short' })}` : 'We’ll contact you to arrange your findings call.';
    return { eyebrow: 'BRAND HEALTH INDEX', title: 'We’re preparing your audit.', body: 'We’re reviewing the information and touchpoints included in your assessment. We’ll walk through the findings and next steps together on your call.', note: r.status === 'information_needed' ? 'We need a little more information from you. Check your email for details.' : when, cta: 'View request status', to };
  }
  if (r?.status === 'awaiting_payment') return { eyebrow: 'BRAND HEALTH INDEX', title: 'Your audit selection is saved.', body: 'Your purchase hasn’t been completed yet. Pick up where you left off without entering everything again.', cta: 'Complete my audit purchase', to };
  if (r?.status === 'draft') return { eyebrow: 'BRAND HEALTH INDEX', title: 'Your Brand Health request is saved.', body: 'Pick up where you left off without entering everything again.', cta: 'Continue my request', to };
  return { eyebrow: 'BRAND HEALTH INDEX', title: 'Find the gaps. Turn them into goals.', body: 'Before you spend more fixing what might not be broken, find out what deserves attention. Your courtesy report examines how clearly your brand shows up, communicates its value, and earns trust.', cta: 'Let’s lock in the details', to, note: 'Your first Visibility & Credibility report is on us.' };
}

export default function AuditDashboardCard() {
  const [brandKey, setBrandKey] = useState(getStoredBrand());
  const { data, isPending, error, refetch } = useAuditState(brandKey);
  const shell = 'dashboard-card project-request rounded-[7px] p-6 sm:p-8';
  if (isPending) return <div className={`${shell} min-h-[220px] text-sm text-muted-foreground`} role="status">Checking your Brand Health Index…</div>;
  if (error) return <div className={shell} role="alert"><p className="text-sm">Your Brand Health status could not be loaded. <button className="underline" onClick={() => refetch()}>Try again</button></p></div>;
  const c = cardCopy(data);
  const pick = (k) => { storeBrand(k); setBrandKey(k); };
  return (
    <section className={`${shell} min-h-[220px]`} aria-labelledby="audit-card-title" data-testid="audit-invitation">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary">{c.eyebrow}</p>
        {data.brands.length > 1 ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">Brand
            <select className="admin-input !w-auto !py-1.5 text-sm" value={data.brand.key} onChange={(e) => pick(e.target.value)}>
              {data.brands.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          </label>
        ) : <span className="text-xs text-muted-foreground">{data.brand.label}</span>}
      </div>
      <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <h2 id="audit-card-title" className="font-heading text-3xl font-light leading-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-3 text-muted-foreground">{c.body}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <Link className="request-primary inline-flex min-h-[44px] items-center justify-center px-6 py-3 text-sm font-semibold" to={c.to}>{c.cta}</Link>
          {c.note && <p className="text-sm text-muted-foreground lg:text-right">{c.note}</p>}
        </div>
      </div>
      {data.request?.strategy_status && <AuditStrategyOffer request={data.request} brandKey={data.brand.key} />}
    </section>
  );
}