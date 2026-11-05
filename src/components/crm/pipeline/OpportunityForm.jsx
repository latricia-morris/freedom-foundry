import React, { useState } from 'react';
import { STAGES } from '@/lib/crm';
import { E, useClientOptions } from '@/components/crm/useCrm';
import { Field, Select, FormActions } from '@/components/crm/CrmForm';

export default function OpportunityForm({ opportunity, onDone }) {
  const { data: clients = [] } = useClientOptions();
  const [f, setF] = useState({ title: '', agency_client_id: '', value: 0, stage: 'lead', probability: 10, expected_close_date: '', description: '', ...opportunity });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const client = clients.find((c) => c.id === f.agency_client_id);
    const data = { title: f.title, agency_client_id: f.agency_client_id || undefined, client_name: client?.company_name || '', value: Number(f.value) || 0, stage: f.stage, probability: Number(f.probability) || 0, expected_close_date: f.expected_close_date || undefined, description: f.description };
    if (f.id) await E.CrmOpportunity.update(f.id, data); else await E.CrmOpportunity.create(data);
    setSaving(false);
    onDone();
  };
  const remove = async () => { if (window.confirm('Delete this deal?')) { await E.CrmOpportunity.delete(f.id); onDone(); } };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Deal name"><input required className="admin-input" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Rebrand and launch" /></Field>
      <Field label="Client"><Select value={f.agency_client_id} onChange={(v) => set('agency_client_id', v)} placeholder="Choose a client" options={clients.map((c) => ({ value: c.id, label: c.company_name }))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Value (USD)"><input type="number" min="0" className="admin-input" value={f.value} onChange={(e) => set('value', e.target.value)} /></Field>
        <Field label="Expected close"><input type="date" className="admin-input" value={f.expected_close_date || ''} onChange={(e) => set('expected_close_date', e.target.value)} /></Field>
        <Field label="Stage"><Select value={f.stage} onChange={(v) => { set('stage', v); set('probability', STAGES.find((s) => s.key === v).probability); }} options={STAGES.map((s) => ({ value: s.key, label: s.label }))} /></Field>
        <Field label="Probability %"><input type="number" min="0" max="100" className="admin-input" value={f.probability} onChange={(e) => set('probability', e.target.value)} /></Field>
      </div>
      <Field label="Notes"><textarea rows={3} className="admin-input" value={f.description || ''} onChange={(e) => set('description', e.target.value)} /></Field>
      <FormActions saving={saving} onDelete={f.id ? remove : null} />
    </form>
  );
}