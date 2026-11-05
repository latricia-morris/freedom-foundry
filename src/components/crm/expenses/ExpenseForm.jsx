import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { EXPENSE_CATEGORIES, today } from '@/lib/crm';
import { E, useProjectOptions } from '@/components/crm/useCrm';
import { Field, Select, FormActions } from '@/components/crm/CrmForm';

export default function ExpenseForm({ expense, onDone }) {
  const { data: projects = [] } = useProjectOptions();
  const [f, setF] = useState({ name: '', category: 'software', amount: '', date: today(), vendor: '', project_id: '', billable: false, invoiced: false, notes: '', ...expense });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const receipt = file ? (await base44.integrations.Core.UploadPrivateFile({ file })).file_uri : f.receipt_file_uri;
    const p = projects.find((x) => x.id === f.project_id);
    const data = { name: f.name, category: f.category, amount: Number(f.amount) || 0, date: f.date, vendor: f.vendor, project_id: f.project_id || undefined, project_name: p?.name || '', billable: f.billable, invoiced: f.invoiced, notes: f.notes, receipt_file_uri: receipt };
    if (f.id) await E.Expense.update(f.id, data); else await E.Expense.create(data);
    setSaving(false);
    onDone();
  };
  const remove = async () => { if (window.confirm('Delete this expense?')) { await E.Expense.delete(f.id); onDone(); } };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Expense"><input required className="admin-input" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Adobe Creative Cloud" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (USD)"><input type="number" step="0.01" min="0" required className="admin-input" value={f.amount} onChange={(e) => set('amount', e.target.value)} /></Field>
        <Field label="Date"><input type="date" required className="admin-input" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Category"><Select value={f.category} onChange={(v) => set('category', v)} options={EXPENSE_CATEGORIES} /></Field>
        <Field label="Vendor"><input className="admin-input" value={f.vendor || ''} onChange={(e) => set('vendor', e.target.value)} /></Field>
      </div>
      <Field label="Project"><Select value={f.project_id} onChange={(v) => set('project_id', v)} placeholder="Overhead (no project)" options={projects.map((p) => ({ value: p.id, label: p.name }))} /></Field>
      <Field label={f.receipt_file_uri ? 'Replace receipt' : 'Receipt'}><input type="file" accept="image/*,application/pdf" className="admin-input" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.billable} onChange={(e) => set('billable', e.target.checked)} /> Billable to client</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.invoiced} onChange={(e) => set('invoiced', e.target.checked)} /> Already invoiced</label>
      </div>
      <FormActions saving={saving} onDelete={f.id ? remove : null} />
    </form>
  );
}