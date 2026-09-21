import React, { useState } from 'react';
import { Pencil, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { fmtDate, money } from '@/lib/brandHealth';

const CREDIT_STATUSES = ['available', 'applied', 'expired', 'void', 'completed'];
const dollars = (cents) => ((cents || 0) / 100).toFixed(2);
const cents = (value) => Math.round((parseFloat(value) || 0) * 100);

/** Internal audit-credit tracking. Only consultant/admin can edit these records. */
export default function CreditPanel({ audit, credit, reload }) {
  const { toast } = useToast();
  const [form, setForm] = useState(null);

  const openForm = () =>
    setForm({
      amount_dollars: credit ? dollars(credit.amount_cents) : '',
      credit_eligible: credit ? !!credit.credit_eligible : false,
      expiration_date: credit?.expiration_date || '',
      qualifying_package: credit?.qualifying_package || '',
      package_duration_months: credit?.package_duration_months || '',
      total_credit_dollars: credit ? dollars(credit.total_credit_cents) : '',
      applied_dollars: credit ? dollars(credit.applied_cents) : '',
      status: credit?.status || 'available',
    });

  const save = async () => {
    const duration = Number(form.package_duration_months) || 0;
    const total = cents(form.total_credit_dollars);
    const payload = {
      audit_id: audit.id,
      agency_client_id: audit.agency_client_id,
      amount_cents: cents(form.amount_dollars),
      credit_eligible: !!form.credit_eligible,
      expiration_date: form.expiration_date || null,
      qualifying_package: form.qualifying_package || null,
      package_duration_months: duration || null,
      total_credit_cents: total,
      monthly_credit_cents: duration > 0 ? Math.round(total / duration) : 0,
      applied_cents: cents(form.applied_dollars),
      status: form.status,
    };
    try {
      if (credit) await base44.entities.AuditCredit.update(credit.id, payload);
      else await base44.entities.AuditCredit.create(payload);
      toast({ title: 'Audit credit saved' });
      setForm(null);
      reload();
    } catch (err) {
      toast({ title: 'Could not save credit', description: err.message, variant: 'destructive' });
    }
  };

  if (form) {
    const remaining = cents(form.total_credit_dollars) - cents(form.applied_dollars);
    const monthly = Number(form.package_duration_months) > 0 ? Math.round(cents(form.total_credit_dollars) / Number(form.package_duration_months)) : 0;
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Audit amount ($)
          <input className="admin-input" type="number" step="0.01" value={form.amount_dollars} onChange={(e) => setForm({ ...form, amount_dollars: e.target.value })} />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-muted-foreground">
          <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={form.credit_eligible} onChange={(e) => setForm({ ...form, credit_eligible: e.target.checked })} />
          Credit eligible toward a package
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Qualifying package
          <input className="admin-input" placeholder="e.g. Brand Revival implementation" value={form.qualifying_package} onChange={(e) => setForm({ ...form, qualifying_package: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Package duration (months)
          <input className="admin-input" type="number" min="0" value={form.package_duration_months} onChange={(e) => setForm({ ...form, package_duration_months: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Total credit ($)
          <input className="admin-input" type="number" step="0.01" value={form.total_credit_dollars} onChange={(e) => setForm({ ...form, total_credit_dollars: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Credit applied ($)
          <input className="admin-input" type="number" step="0.01" value={form.applied_dollars} onChange={(e) => setForm({ ...form, applied_dollars: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Credit expiration
          <input className="admin-input" type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Status
          <select className="admin-input capitalize" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {CREDIT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <p className="text-sm text-muted-foreground sm:col-span-2">
          Monthly credit: <span className="text-foreground">{money(monthly)}</span> · Remaining: <span className="text-foreground">{money(remaining)}</span>
        </p>
        <div className="flex gap-2 sm:col-span-2">
          <button type="button" onClick={() => setForm(null)} className="rounded-md border border-border px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
          <button type="button" onClick={save} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <Save className="h-3.5 w-3.5" /> Save credit
          </button>
        </div>
      </div>
    );
  }

  if (!credit) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground/70">No audit credit set up for this audit yet.</p>
        <button type="button" onClick={openForm} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
          <Pencil className="h-3.5 w-3.5" /> Set up audit credit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Audit amount</p><p className="text-sm text-foreground">{money(credit.amount_cents)}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Credit eligible</p><p className="text-sm text-foreground">{credit.credit_eligible ? 'Yes' : 'No'}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Status</p><p className="text-sm capitalize text-foreground">{credit.status}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Qualifying package</p><p className="text-sm text-foreground">{credit.qualifying_package || '—'}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Package duration</p><p className="text-sm text-foreground">{credit.package_duration_months ? `${credit.package_duration_months} months` : '—'}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Expiration</p><p className="text-sm text-foreground">{credit.expiration_date ? fmtDate(credit.expiration_date) : '—'}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Total credit</p><p className="text-sm text-foreground">{money(credit.total_credit_cents)}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Monthly credit</p><p className="text-sm text-foreground">{money(credit.monthly_credit_cents)}</p></div>
        <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Remaining credit</p><p className="text-sm text-primary">{money(credit.total_credit_cents - credit.applied_cents)}</p></div>
      </div>
      <button type="button" onClick={openForm} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
        <Pencil className="h-3.5 w-3.5" /> Edit credit
      </button>
    </div>
  );
}