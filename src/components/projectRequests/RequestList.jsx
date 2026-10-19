import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import requestQuery from '@/components/projectRequests/requestQuery';
import RequestDetail from '@/components/projectRequests/RequestDetail';
import RequestReview from '@/components/projectRequests/RequestReview';

export default function RequestList({ context, filters, admin = false, userNames = {} }) {
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const query = requestQuery(filters, admin ? null : context.user_id);
  const list = useInfiniteQuery({ queryKey: ['project-requests', admin, query], initialPageParam: null, queryFn: ({ pageParam }) => base44.entities.ServiceRequestSubmission.filter(query, { sort: '-created_date', limit: 20, ...(pageParam ? { cursor: pageParam } : {}) }), getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined });
  const setStatus = async (row, status) => {
    setSaving(row.id); setMessage('');
    try { await base44.entities.ServiceRequestSubmission.update(row.id, { status }); await queryClient.invalidateQueries({ queryKey: ['project-requests'] }); }
    catch { setMessage('The status could not be saved. Please try again.'); }
    finally { setSaving(''); }
  };
  if (list.isPending) return <p role="status" className="py-5 text-sm text-muted-foreground">Loading requests…</p>;
  if (list.error) return <p role="alert" className="text-sm">Requests could not be loaded. <button className="underline" onClick={() => list.refetch()}>Try again</button></p>;
  const rows = list.data.pages.flatMap((page) => page.items);
  return <div className="space-y-4" data-testid={admin ? 'admin-request-results' : 'my-request-results'}>
    {!rows.length && <p className="rounded-[7px] border border-border bg-card p-6 text-sm text-muted-foreground">{admin ? 'No requests match these filters.' : 'No project requests yet.'}</p>}
    {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
    {rows.map((row) => <details key={row.id} data-request-id={row.id} className="dashboard-card rounded-[7px] p-5" onToggle={(event) => { const open = event.currentTarget.open; setExpanded((current) => ({ ...current, [row.id]: open })); }}>
      <summary className="cursor-pointer break-words text-sm">
        <span className="font-semibold">{row.contact_name || userNames[row.user_id || row.created_by_id] || 'Member'}</span>
        <span className="ml-2 text-muted-foreground">{row.company_name || row.brand_name || 'Company not recorded'}</span>
        <span className="mt-2 block">{row.service_options?.join(' · ') || row.service_type}</span>
        <span className="mt-2 block text-muted-foreground">{row.timeline || 'Timing not recorded'} · {row.budget_original || 'Not provided'}{row.budget_original && (row.budget_basis === 'monthly' ? ' / month' : ' total')}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{new Date(row.created_date).toLocaleDateString()} · {context.statuses.find((item) => item.value === row.status)?.label || row.status}</span>
      </summary>
      {expanded[row.id] && <div className="mt-5 space-y-5 border-t border-border pt-5">
        <RequestDetail row={row} accountName={userNames[row.user_id || row.created_by_id]} />
        {admin && <><label className="block text-sm">Request status<select aria-label="Request status" className="admin-input mt-1" disabled={saving === row.id} value={row.status || 'submitted'} onChange={(e) => setStatus(row, e.target.value)}>{context.statuses.map(({ value,label }) => <option value={value} key={value}>{label}</option>)}</select></label><RequestReview requestId={row.id} /></>}
      </div>}
    </details>)}
    {list.hasNextPage && <button type="button" className="rounded-[7px] border border-border px-4 py-2 text-sm" disabled={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>{list.isFetchingNextPage ? 'Loading…' : 'Load more requests'}</button>}
  </div>;
}