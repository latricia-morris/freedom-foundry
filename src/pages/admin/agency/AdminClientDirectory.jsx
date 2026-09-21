import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QbSyncButton from '@/components/admin/agency/QbSyncButton';
import { formatUsd } from '@/lib/agency';

const STATUSES = ['prospect', 'active', 'inactive', 'archived'];
const EMPTY = {
  company_name: '', primary_contact_name: '', primary_contact_email: '', primary_contact_phone: '',
  billing_contact_name: '', billing_contact_email: '', status: 'prospect',
  ghl_contact_id: '', ghl_opportunity_id: '', stripe_customer_id: '', quickbooks_customer_id: '',
  assigned_account_manager: '', assigned_project_manager: '', client_portal_status: 'none', notes: '',
};
const TEXT_FIELDS = [
  ['Company name', 'company_name'],
  ['Primary contact', 'primary_contact_name'],
  ['Contact email', 'primary_contact_email'],
  ['Contact phone', 'primary_contact_phone'],
  ['Billing contact', 'billing_contact_name'],
  ['Billing email', 'billing_contact_email'],
  ['GHL contact ID', 'ghl_contact_id'],
  ['GHL opportunity ID', 'ghl_opportunity_id'],
  ['Stripe customer ID', 'stripe_customer_id'],
  ['QuickBooks customer ID', 'quickbooks_customer_id'],
  ['Account manager', 'assigned_account_manager'],
  ['Project manager', 'assigned_project_manager'],
];
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Company name' },
  { value: 'status', label: 'Status' },
  { value: 'collected', label: 'Collected (high to low)' },
];

const STATUS_STYLES = {
  active: 'border-emerald-500/40 text-emerald-400',
  prospect: 'border-primary/40 text-primary',
  inactive: 'border-border text-muted-foreground',
  archived: 'border-border text-muted-foreground/60',
};

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input className="admin-input py-2 text-sm" type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function AdminClientDirectory() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const load = () => {
    base44.entities.AgencyClient.filter({}, '-created_date', 500)
      .then((rows) => { setClients(rows || []); setLoading(false); })
      .catch(() => setLoading(false));
    base44.entities.ClientBillingRecord.filter({}, '-txn_date', 1000)
      .then((rows) => setBilling(rows || []))
      .catch(() => setBilling([]));
  };
  useEffect(load, []);

  const log = (action, id) => base44.entities.AuditLog.create({
    actor_role: 'admin', entity_type: 'AgencyClient', entity_id: id, action, source: 'ui',
  }).catch(() => {});

  // Payments received only. Invoices are never part of a collected total.
  const money = useMemo(() => {
    const collected = new Map();
    const outstanding = new Map();
    for (const r of billing) {
      if (r.record_type === 'payment') collected.set(r.agency_client_id, (collected.get(r.agency_client_id) || 0) + (r.amount_cents || 0));
      if (r.record_type === 'invoice') outstanding.set(r.agency_client_id, (outstanding.get(r.agency_client_id) || 0) + (r.balance_cents || 0));
    }
    return { collected, outstanding };
  }, [billing]);

  const totals = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    money.collected.forEach((v) => { collected += v; });
    money.outstanding.forEach((v) => { outstanding += v; });
    return { collected, outstanding };
  }, [money]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = clients.filter((c) => {
      const matchesSearch = !q
        || c.company_name?.toLowerCase().includes(q)
        || c.primary_contact_name?.toLowerCase().includes(q)
        || c.primary_contact_email?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    if (sortBy === 'name') list = [...list].sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
    if (sortBy === 'status') list = [...list].sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    if (sortBy === 'collected') list = [...list].sort((a, b) => (money.collected.get(b.id) || 0) - (money.collected.get(a.id) || 0));
    return list;
  }, [clients, search, statusFilter, sortBy, money]);

  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    prospects: clients.filter((c) => c.status === 'prospect').length,
  }), [clients]);

  const create = async () => {
    if (!draft.company_name.trim() || !draft.primary_contact_email.trim()) {
      setError('Company name and contact email are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const created = await base44.entities.AgencyClient.create({ ...draft });
      await log('client_created', created.id);
      setDraft(EMPTY);
      setToast('Client added');
      load();
    } catch (e) {
      setError(e.message || 'Could not save the client.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (client) => {
    if (!window.confirm(`Delete ${client.company_name}? This cannot be undone.`)) return;
    await base44.entities.AgencyClient.delete(client.id).catch(() => {});
    await log('client_deleted', client.id);
    setToast('Client deleted');
    load();
  };

  const accountBadges = (c) => (
    <span className="flex flex-wrap gap-1">
      {c.ghl_contact_id && <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">GHL</span>}
      {c.stripe_customer_id && <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">Stripe</span>}
      {c.quickbooks_customer_id && <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">QBO</span>}
      {!c.ghl_contact_id && !c.stripe_customer_id && !c.quickbooks_customer_id && <span className="text-xs text-muted-foreground/70">—</span>}
    </span>
  );

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-light text-foreground">Client <span className="molten-text italic">Directory</span></h1>
        <QbSyncButton
          onSynced={(result) => {
            setToast(`QuickBooks synced — ${result.created || 0} new, ${result.linked || 0} linked, ${result.billing_records || 0} billing records`);
            load();
          }}
        />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="dashboard-card p-5">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Total clients</p>
          <p className="font-heading text-3xl font-light text-foreground">{stats.total}</p>
        </div>
        <div className="dashboard-card p-5">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Active</p>
          <p className="font-heading text-3xl font-light text-foreground">{stats.active}</p>
        </div>
        <div className="dashboard-card p-5">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Collected to date</p>
          <p className="font-heading text-3xl font-light text-primary">{formatUsd(totals.collected)}</p>
          <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">Payments received</p>
        </div>
        <div className="dashboard-card p-5">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Outstanding</p>
          <p className="font-heading text-3xl font-light text-foreground">{formatUsd(totals.outstanding)}</p>
          <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">Open invoice balances</p>
        </div>
      </div>

      <div className="dashboard-card mb-8 p-6">
        <h3 className="mb-4 font-heading text-2xl text-foreground">Add a client</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEXT_FIELDS.map(([label, key]) => (
            <Field key={key} label={label} value={draft[key]} onChange={(v) => setDraft({ ...draft, [key]: v })} />
          ))}
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Status</span>
            <select className="admin-input py-2 text-sm" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Portal access</span>
            <select className="admin-input py-2 text-sm" value={draft.client_portal_status} onChange={(e) => setDraft({ ...draft, client_portal_status: e.target.value })}>
              {['none', 'invited', 'active', 'disabled'].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Notes</span>
          <textarea className="admin-input min-h-20 text-sm" value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button type="button" onClick={create} disabled={busy} className="btn-forge mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          <Plus className="h-4 w-4" /> {busy ? 'Saving…' : 'Save client'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="admin-input max-w-xs py-2 text-sm"
          type="search"
          placeholder="Search company or contact"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input max-w-40 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="admin-input max-w-52 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort clients">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground/70">{filtered.length} of {clients.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No clients match your filters.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Company', 'Primary contact', 'Status', 'Collected', 'Outstanding', 'Portal', 'Accounts', 'Created', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/agency/clients/${c.id}`)}
                  className="cursor-pointer border-t border-border/30 hover:bg-accent/40"
                >
                  <td className="px-5 py-3 text-sm text-foreground">{c.company_name}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-foreground">{c.primary_contact_name || '—'}</p>
                    <p className="text-xs text-muted-foreground/70">{c.primary_contact_email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[c.status] || 'border-border text-muted-foreground'}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{formatUsd(money.collected.get(c.id) || 0)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{formatUsd(money.outstanding.get(c.id) || 0)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{(c.client_portal_status || 'none').replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">{accountBadges(c)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{new Date(c.created_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); remove(c); }}
                      aria-label={`Delete ${c.company_name}`}
                      className="rounded-sm p-1 text-muted-foreground/60 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-border bg-card px-4 py-2 text-sm text-foreground shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}