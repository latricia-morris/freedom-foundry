import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Panel, Spinner } from '@/components/crm/CrmUi';
import BrandMemberRow from '@/components/brandTeam/BrandMemberRow';

/** Add, re-role and remove people for one brand. Brand roles never change account roles. */
export default function BrandAccessManager({ brandId }) {
  const qc = useQueryClient();
  const key = ['brand-team', brandId];
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('team_member');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: async () => (await base44.functions.invoke('brandTeam', { action: 'list', agency_client_id: brandId })).data });

  const run = async (payload) => {
    setBusy(true); setError('');
    try {
      const res = await base44.functions.invoke('brandTeam', { agency_client_id: brandId, ...payload });
      qc.setQueryData(key, res.data);
      return true;
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      return false;
    } finally { setBusy(false); }
  };

  const add = async (e) => {
    e.preventDefault();
    if (await run({ action: 'add', email, role })) setEmail('');
  };

  if (isLoading || !data) return <Spinner />;
  return (
    <Panel title={`Team access · ${data.brand.name}`}>
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 border-b border-border/50 p-5">
        <label className="min-w-[14rem] flex-1">
          <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Email</span>
          <input type="email" required className="admin-input text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
        </label>
        <select className="admin-input w-auto py-2.5 text-sm" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="team_member">Team Member</option>
          <option value="brand_admin">Brand Admin</option>
        </select>
        <button type="submit" disabled={busy} className="btn-forge inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          <UserPlus className="h-4 w-4" /> Add
        </button>
        <p className="w-full text-xs text-muted-foreground">Brand Admins get the full portal for this brand. Team Members see Client Workspace, Ignite OS, brand profiles, Media Kit, Guidelines and Assets only. New people receive an invite.</p>
        {error && <p className="w-full text-sm text-destructive">{error}</p>}
      </form>
      <ul className="divide-y divide-border/40">
        {data.owners.map((o) => <BrandMemberRow key={o} email={o} role="owner" />)}
        {data.members.map((m) => (
          <BrandMemberRow key={m.id} email={m.email} role={m.role} busy={busy}
            onRole={(r) => run({ action: 'update', membership_id: m.id, role: r })}
            onRemove={() => run({ action: 'remove', membership_id: m.id })} />
        ))}
      </ul>
    </Panel>
  );
}