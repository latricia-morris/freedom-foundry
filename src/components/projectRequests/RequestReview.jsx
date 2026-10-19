import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function RequestReview({ requestId }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(null);
  const [decision, setDecision] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const { data, isPending, error } = useQuery({ queryKey: ['request-review', requestId], queryFn: async () => (await base44.entities.ProjectRequestReview.filter({ request_id: requestId }, { sort: '-updated_date', limit: 1 })).items[0] || null });
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const fields = { request_id: requestId, internal_notes: notes ?? data?.internal_notes ?? '', decision: decision ?? data?.decision ?? 'not_decided' };
      const saved = data ? await base44.entities.ProjectRequestReview.update(data.id, fields) : await base44.entities.ProjectRequestReview.create(fields);
      queryClient.setQueryData(['request-review', requestId], saved); setMessage('Private review saved.');
    } catch { setMessage('Review could not be saved. Your edits are still here.'); }
    finally { setBusy(false); }
  };
  if (isPending) return <p className="text-sm">Loading private review…</p>;
  if (error) return <p role="alert" className="text-sm text-destructive">Private review could not be loaded.</p>;
  return <div className="space-y-3 rounded-[7px] border border-border bg-muted/30 p-4">
    <h3 className="font-heading text-xl">Private agency review</h3>
    <p className="text-sm text-muted-foreground">Admin only. These notes and decisions do not change the original submission or start a project.</p>
    <label className="block text-sm">Decision<select aria-label="Private decision" className="admin-input mt-1" value={decision ?? data?.decision ?? 'not_decided'} onChange={(e) => setDecision(e.target.value)}>{[['not_decided','Not decided'],['follow_up','Follow up'],['accepted','Accepted'],['declined','Declined']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="block text-sm">Private admin notes<textarea aria-label="Private admin notes" className="admin-input mt-1" rows={3} value={notes ?? data?.internal_notes ?? ''} onChange={(e) => setNotes(e.target.value)} /></label>
    <button type="button" onClick={save} disabled={busy} className="request-primary px-4 py-2 text-sm">{busy ? 'Saving…' : 'Save private review'}</button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
}