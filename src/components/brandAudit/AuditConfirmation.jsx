import React from 'react';
import { Link } from 'react-router-dom';
import { STATUS_LABEL, TIERS } from '@/lib/brandAudit';

export default function AuditConfirmation({ request: r }) {
  if (!r || r.status === 'released') return (
    <div className="dashboard-card rounded-[7px] p-6 sm:p-8">
      <h2 className="font-heading text-3xl font-light">Your report is ready to revisit.</h2>
      <Link className="request-primary mt-5 inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm font-semibold" to={r?.report_path || '/brand-portal/brand-health'}>{r && r.tier !== 'courtesy' ? 'View my report & recommendations' : 'View my report'}</Link>
    </div>
  );
  const paid = r.tier !== 'courtesy';
  return (
    <div className="dashboard-card space-y-4 rounded-[7px] p-6 sm:p-8">
      <h2 className="font-heading text-3xl font-light">{paid ? 'Your audit is confirmed. Here’s what happens next.' : 'Your courtesy audit is requested.'}</h2>
      <p className="text-muted-foreground">{paid
        ? `Your payment for ${TIERS[r.tier].name} is received. We’ll arrange your findings call with time to complete the expert assessment beforehand. You’ll receive your report and included recommendations in your dashboard after we discuss them together.`
        : 'We’ve received your details and links. We’ll arrange your findings call with time to prepare the assessment beforehand. If we need anything else, we’ll contact you.'}</p>
      <p className="text-sm text-muted-foreground">{r.call_scheduled_at ? `Your findings call: ${new Date(r.call_scheduled_at).toLocaleString([], { dateStyle: 'long', timeStyle: 'short', timeZoneName: 'short' })}` : 'We’ll contact you to arrange your findings call.'}</p>
      <p className="text-sm">Status: <span className="text-foreground">{STATUS_LABEL[r.status]}</span></p>
      <div className="flex flex-wrap gap-3">
        <Link className="request-primary inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm font-semibold" to="/dashboard">Back to dashboard</Link>
        {r.receipt_url && <a className="request-choice inline-flex min-h-[44px] items-center px-5 py-2.5 text-sm" href={r.receipt_url} target="_blank" rel="noopener noreferrer">View receipt</a>}
      </div>
    </div>
  );
}