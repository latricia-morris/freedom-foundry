import React from 'react';
import RequestPrivateFiles from '@/components/projectRequests/RequestPrivateFiles';

export default function RequestDetail({ row, accountName }) {
  const budget = row.budget_original || 'Not provided';
  const reference = row.details?.link;
  return <div className="space-y-4 break-words text-sm">
    <section><h3 className="font-heading text-xl">Project description</h3><p className="mt-1 whitespace-pre-wrap leading-relaxed">{row.notes || row.details?.message || 'No description recorded.'}</p></section>
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Services</dt><dd>{row.service_options?.join(', ') || row.service_type || 'Not recorded'}</dd></div>
      <div><dt className="text-muted-foreground">Requested timing</dt><dd>{row.timeline || 'Not recorded'}</dd></div>
      {row.deadline_date && <div><dt className="text-muted-foreground">Desired completion date</dt><dd>{row.deadline_date} · {row.deadline_firm ? 'Firm' : 'Not firm'}</dd></div>}
      {row.deadline_note && <div><dt className="text-muted-foreground">Deadline note</dt><dd className="whitespace-pre-wrap">{row.deadline_note}</dd></div>}
      <div><dt className="text-muted-foreground">Original budget</dt><dd className="whitespace-pre-wrap">{budget}{row.budget_original?.trim() && ` · ${row.budget_basis === 'monthly' ? 'Monthly budget' : 'Total project budget'}`}</dd>{row.budget_help_requested && <dd>Help determining the budget requested.</dd>}</div>
      <div><dt className="text-muted-foreground">Contact</dt><dd>{row.contact_name || accountName || 'Member'}</dd>{row.contact_email && <dd className="break-all">{row.contact_email}</dd>}</div>
      <div><dt className="text-muted-foreground">Company / brand</dt><dd>{row.brand_name || row.company_name || 'Associated account; no company recorded'}</dd></div>
      <div><dt className="text-muted-foreground">Associated account</dt><dd className="break-all">{row.user_id || row.created_by_id}</dd>{row.agency_client_id && <dd className="break-all">Brand: {row.agency_client_id}</dd>}</div>
    </dl>
    <p className="text-xs text-muted-foreground">Requested timing remains subject to scope and availability.</p>
    <RequestPrivateFiles row={row} />
    {reference && /^https?:\/\//i.test(reference) && <a className="link-warm block break-all" href={reference} target="_blank" rel="noopener noreferrer">Reference: {reference}</a>}
  </div>;
}