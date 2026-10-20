import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BrandReviewRow from '@/components/brandAudit/BrandReviewRow';
import { STATUS_LABEL, auditCall } from '@/lib/brandAudit';

export default function AdminBrandReviews() {
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const { data, isPending, error } = useQuery({ queryKey: ['admin-brand-reviews', status], queryFn: () => auditCall('admin_list', { status: status || undefined }) });
  const act = async (action, id, extra = {}) => { await auditCall(action, { id, ...extra }); qc.invalidateQueries({ queryKey: ['admin-brand-reviews'] }); };
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-4xl font-light">Brand <span className="molten-text italic">Reviews</span></h1>
        <select className="admin-input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All except drafts</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {isPending && <p className="text-sm text-muted-foreground">Loading requests…</p>}
      {error && <p role="alert" className="text-sm">{error.message}</p>}
      {data && !data.items.length && <p className="dashboard-card rounded-[7px] p-6 text-sm text-muted-foreground">No requests here yet.</p>}
      {data?.items.map((r) => <BrandReviewRow key={r.id} r={r} act={act} />)}
    </div>
  );
}