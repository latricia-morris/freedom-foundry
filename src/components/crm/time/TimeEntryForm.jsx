import React, { useState } from 'react';
import { ACTIVITIES, today } from '@/lib/crm';
import { E, useProjectOptions } from '@/components/crm/useCrm';
import { Field, Select } from '@/components/crm/CrmForm';

const blank = () => ({ project_id: '', date: today(), hours: '1', activity_type: 'design', description: '', billable: true });

export default function TimeEntryForm({ onSaved }) {
  const { data: projects = [] } = useProjectOptions();
  const [f, setF] = useState(blank);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const p = projects.find((x) => x.id === f.project_id);
    await E.TimeEntry.create({
      project_id: f.project_id || undefined, project_name: p?.name || 'General', agency_client_id: p?.client_id,
      date: f.date, duration_minutes: Math.round((Number(f.hours) || 0) * 60), activity_type: f.activity_type, description: f.description, billable: f.billable,
    });
    setF(blank());
    setSaving(false);
    onSaved();
  };

  return (
    <form onSubmit={submit} className="dashboard-card mb-6 grid gap-3 p-5 md:grid-cols-6">
      <Field label="Project" className="md:col-span-2"><Select value={f.project_id} onChange={(v) => set('project_id', v)} placeholder="General / internal" options={projects.map((p) => ({ value: p.id, label: p.name }))} /></Field>
      <Field label="Date"><input type="date" required className="admin-input" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
      <Field label="Hours"><input type="number" step="0.25" min="0.25" required className="admin-input" value={f.hours} onChange={(e) => set('hours', e.target.value)} /></Field>
      <Field label="Activity" className="md:col-span-2"><Select value={f.activity_type} onChange={(v) => set('activity_type', v)} options={ACTIVITIES} /></Field>
      <Field label="What was done" className="md:col-span-4"><input className="admin-input" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Logo exploration round two" /></Field>
      <label className="flex items-end gap-2 pb-3 text-sm text-muted-foreground"><input type="checkbox" checked={f.billable} onChange={(e) => set('billable', e.target.checked)} /> Billable</label>
      <div className="flex items-end"><button disabled={saving} className="btn-forge w-full rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">{saving ? 'Logging…' : 'Log time'}</button></div>
    </form>
  );
}