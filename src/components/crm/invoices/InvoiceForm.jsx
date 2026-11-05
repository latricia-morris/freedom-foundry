import React, { useState } from 'react';
import { INVOICE_STATUSES, invoiceTotals, today } from '@/lib/crm';
import { E, useClientOptions, useProjectOptions } from '@/components/crm/useCrm';
import { Field, Select, FormActions } from '@/components/crm/CrmForm';
import { money } from '@/components/crm/CrmUi';
import LineItems from './LineItems';

export default function InvoiceForm({ invoice, onDone }) {
  const { data: clients = [] } = useClientOptions();
  const { data: projects = [] } = useProjectOptions();
  const [f, setF] = useState({ agency_client_id: '', project_id: '', issue_date: today(), due_date: '', status: 'draft', tax_rate: 0, payment_terms: 'Due within 14 days', notes: '', client_visible: false, items: [{ description: '', quantity: 1, unit_price: 0 }], ...invoice });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const totals = invoiceTotals(f.items, f.tax_rate);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const client = clients.find((c) => c.id === f.agency_client_id);
    const items = f.items.map((i) => ({ description: i.description, quantity: Number(i.quantity) || 0, unit_price: Number(i.unit_price) || 0 }));
    const data = {
      agency_client_id: f.agency_client_id, client_name: client?.company_name || '', project_id: f.project_id || undefined,
      issue_date: f.issue_date, due_date: f.due_date || undefined, status: f.status, items, tax_rate: Number(f.tax_rate) || 0, ...totals,
      payment_terms: f.payment_terms, notes: f.notes, client_visible: f.client_visible, paid_date: f.status === 'paid' ? (f.paid_date || today()) : undefined,
    };
    if (f.id) await E.CrmInvoice.update(f.id, data);
    else await E.CrmInvoice.create({ ...data, invoice_number: `INV-${1001 + (Number(await E.CrmInvoice.count()) || 0)}` });
    setSaving(false);
    onDone();
  };
  const remove = async () => { if (window.confirm('Delete this invoice?')) { await E.CrmInvoice.delete(f.id); onDone(); } };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Client"><Select value={f.agency_client_id} onChange={(v) => set('agency_client_id', v)} placeholder="Choose a client" options={clients.map((c) => ({ value: c.id, label: c.company_name }))} /></Field>
        <Field label="Project"><Select value={f.project_id} onChange={(v) => set('project_id', v)} placeholder="None" options={projects.filter((p) => !f.agency_client_id || p.client_id === f.agency_client_id).map((p) => ({ value: p.id, label: p.name }))} /></Field>
        <Field label="Issue date"><input type="date" required className="admin-input" value={f.issue_date} onChange={(e) => set('issue_date', e.target.value)} /></Field>
        <Field label="Due date"><input type="date" className="admin-input" value={f.due_date || ''} onChange={(e) => set('due_date', e.target.value)} /></Field>
        <Field label="Status"><Select value={f.status} onChange={(v) => set('status', v)} options={INVOICE_STATUSES} /></Field>
        <Field label="Tax %"><input type="number" min="0" step="0.1" className="admin-input" value={f.tax_rate} onChange={(e) => set('tax_rate', e.target.value)} /></Field>
      </div>
      <LineItems items={f.items} onChange={(v) => set('items', v)} />
      <div className="forged-well flex justify-between p-3 text-sm"><span className="text-muted-foreground">Subtotal {money(totals.subtotal)} · Tax {money(totals.tax_amount)}</span><span className="text-foreground">Total {money(totals.total)}</span></div>
      <Field label="Payment terms"><input className="admin-input" value={f.payment_terms || ''} onChange={(e) => set('payment_terms', e.target.value)} /></Field>
      <Field label="Notes for client"><textarea rows={2} className="admin-input" value={f.notes || ''} onChange={(e) => set('notes', e.target.value)} /></Field>
      <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={f.client_visible} onChange={(e) => set('client_visible', e.target.checked)} /> Share with client in their portal (drafts stay hidden)</label>
      <FormActions saving={saving} onDelete={f.id ? remove : null} />
    </form>
  );
}