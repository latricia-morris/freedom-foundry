import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PencilLine, Save, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ClientSalesTab from '@/components/admin/agency/clientDetail/ClientSalesTab';
import ClientProjectsTab from '@/components/admin/agency/clientDetail/ClientProjectsTab';
import ClientPortalAiTab from '@/components/admin/agency/clientDetail/ClientPortalAiTab';
import ClientAssetsTab from '@/components/admin/agency/clientDetail/ClientAssetsTab';

const STATUSES = ['prospect', 'active', 'inactive', 'archived'];
const PORTAL_STATUSES = ['none', 'invited', 'active', 'disabled'];
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
const TABS = [
  ['sales', 'Sales'],
  ['projects', 'Projects'],
  ['portal', 'Brand Portal'],
  ['assets', 'Assets'],
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

export default function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState('sales');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    base44.entities.AgencyClient.get(id)
      .then((c) => { setClient(c); setDraft(c); })
      .catch(() => setMissing(true));
  };
  useEffect(load, [id]);

  const log = (action) => base44.entities.AuditLog.create({
    actor_role: 'admin', entity_type: 'AgencyClient', entity_id: id, action, source: 'ui',
  }).catch(() => {});

  const updateStatus = async (patch, action) => {
    await base44.entities.AgencyClient.update(id, patch).catch((e) =>
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
    );
    await log(action);
    load();
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      const patch = { status: draft.status, client_portal_status: draft.client_portal_status, notes: draft.notes || '' };
      for (const [, key] of TEXT_FIELDS) patch[key] = draft[key] || '';
      await base44.entities.AgencyClient.update(id, patch);
      await log('client_updated');
      setEditing(false);
      toast({ title: 'Client profile saved' });
      load();
    } catch (e) {
      toast({ title: 'Could not save the client.', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${client.company_name}? This cannot be undone.`)) return;
    await base44.entities.AgencyClient.delete(id).catch(() => {});
    await log('client_deleted');
    toast({ title: 'Client deleted' });
    navigate('/admin/agency/clients');
  };

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl font-light text-foreground">Client not found</h1>
        <Link to="/admin/agency/clients" className="link-warm mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to clients
        </Link>
      </div>
    );
  }

  if (!client) {
    return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <Link to="/admin/agency/clients" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>

      <div className="dashboard-card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-4xl font-light text-foreground">{client.company_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {client.primary_contact_name || '—'} · {client.primary_contact_email || 'no email'}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {client.ghl_contact_id && <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">GHL {client.ghl_contact_id}</span>}
              {client.stripe_customer_id && <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">Stripe {client.stripe_customer_id}</span>}
              {client.quickbooks_customer_id && <span className="rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">QBO {client.quickbooks_customer_id}</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="admin-input w-auto py-1.5 text-xs" value={client.status} onChange={(e) => updateStatus({ status: e.target.value }, 'client_status_changed')}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="admin-input w-auto py-1.5 text-xs" value={client.client_portal_status} onChange={(e) => updateStatus({ client_portal_status: e.target.value }, 'client_portal_status_changed')}>
              {PORTAL_STATUSES.map((s) => <option key={s} value={s}>Portal: {s.replace(/_/g, ' ')}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <PencilLine className="h-4 w-4" /> Edit profile
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground/80 sm:grid-cols-4">
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Status</p><p className="mt-1"><span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[client.status] || 'border-border text-muted-foreground'}`}>{client.status}</span></p></div>
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Portal access</p><p className="mt-1 text-sm text-foreground">{(client.client_portal_status || 'none').replace(/_/g, ' ')}</p></div>
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Account manager</p><p className="mt-1 text-sm text-foreground">{client.assigned_account_manager || '—'}</p></div>
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Project manager</p><p className="mt-1 text-sm text-foreground">{client.assigned_project_manager || '—'}</p></div>
        </div>
      </div>

      {editing && (
        <div className="dashboard-card mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-2xl text-foreground">Edit client</h3>
            <button type="button" onClick={() => setEditing(false)} aria-label="Close editor" className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
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
                {PORTAL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Notes</span>
            <textarea className="admin-input min-h-20 text-sm" value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={saveEdit} disabled={busy} className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
              <Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={remove} className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-destructive transition-colors hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" /> Delete client
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`border-b-2 px-5 py-3 text-sm transition-colors ${
              tab === key ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sales' && <ClientSalesTab key={`sales-${client.id}`} client={client} />}
      {tab === 'projects' && <ClientProjectsTab key={`projects-${client.id}`} client={client} />}
      {tab === 'portal' && <ClientPortalAiTab key={`portal-${client.id}`} client={client} />}
      {tab === 'assets' && <ClientAssetsTab key={`assets-${client.id}`} client={client} />}
    </div>
  );
}