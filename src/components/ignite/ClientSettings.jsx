import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { Field } from './Bits';
import { E } from './igniteApi';

export default function ClientSettings({ folder }) {
  const qc = useQueryClient();
  const { data: accounts = [] } = useQuery({ queryKey: ['ig-agency-clients'], queryFn: () => base44.entities.AgencyClient.list('company_name', 500) });
  const [name, setName] = useState(folder.name);
  const [account, setAccount] = useState(folder.agency_client_id || '');
  const save = async (e) => {
    e.preventDefault();
    await E.IgniteFolder.update(folder.id, { name: name.trim() || folder.name, agency_client_id: account });
    qc.invalidateQueries({ queryKey: ['ig-folders'] });
    toast({ title: 'Client settings saved' });
  };
  return (
    <form className="ig-card" onSubmit={save} style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 17 }}>Client settings</h2>
      <Field label="Client name"><input className="ig-input" style={{ width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Client portal account">
        <select className="ig-select" style={{ width: '100%' }} value={account} onChange={(e) => setAccount(e.target.value)}>
          <option value="">Not shared with a client account</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.company_name}</option>)}
        </select>
      </Field>
      <p className="ig-muted" style={{ margin: 0, fontSize: 13 }}>Members of the linked account see these projects and guidelines in their Brand Portal.</p>
      <div><button className="ig-btn ig-primary">Save</button></div>
    </form>
  );
}