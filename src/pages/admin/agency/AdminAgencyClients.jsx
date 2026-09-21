import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUSES = ['prospect', 'active', 'inactive', 'archived'];
const EMPTY = { company_name: '', primary_contact_name: '', primary_contact_email: '', primary_contact_phone: '', billing_contact_name: '', billing_contact_email: '', status: 'prospect', ghl_contact_id: '', ghl_opportunity_id: '' };

export default function AdminAgencyClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    base44.entities.AgencyClient.filter({}, '-created_date', 300)
      .then((rows) => { setClients(rows || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async () => {
    if (!draft.company_name.trim() || !draft.primary_contact_email.trim()) {
      setError('Company name and contact email are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await base44.entities.AgencyClient.create({ ...draft });
      await base44.entities.AuditLog.create({
        actor_role: 'admin', entity_type: 'AgencyClient', entity_id: draft.primary_contact_email,
        action: 'client_created', source: 'ui',
      });
      setDraft(EMPTY);
      load();
    } catch (e) {
      setError(e.message || 'Could not save the client.');
    } finally {
      setBusy(false);
    }
  };

  const field = (label, key, placeholder, type = 'text') => (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        className="admin-input py-2 text-sm"
        type={type}
        placeholder={placeholder}
        value={draft[key] || ''}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <h1 className="mb-8 font-heading text-4xl font-light text-foreground">Agency <span className="molten-text italic">Clients</span></h1>

      <div className="dashboard-card mb-8 p-6">
        <h3 className="mb-4 font-heading text-2xl text-foreground">Add a client</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {field('Company name', 'company_name', 'Ridgeline Coffee Co.')}
          {field('Primary contact', 'primary_contact_name', 'Jordan Ellis')}
          {field('Contact email', 'primary_contact_email', 'jordan@ridgeline.com', 'email')}
          {field('Contact phone', 'primary_contact_phone', '(555) 010-2030')}
          {field('Billing contact', 'billing_contact_name', 'Accounts payable')}
          {field('Billing email', 'billing_contact_email', 'ap@ridgeline.com', 'email')}
          {field('GHL contact ID', 'ghl_contact_id', 'Optional')}
          {field('GHL opportunity ID', 'ghl_opportunity_id', 'Optional')}
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Status</span>
            <select className="admin-input py-2 text-sm" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button type="button" onClick={create} disabled={busy} className="btn-forge mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          <Plus className="h-4 w-4" /> {busy ? 'Saving…' : 'Save client'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : clients.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No clients yet.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Company', 'Primary contact', 'Status', 'GHL IDs', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-border/30 hover:bg-accent/40">
                  <td className="px-5 py-3 text-sm text-foreground">{c.company_name}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-foreground">{c.primary_contact_name || '—'}</p>
                    <p className="text-xs text-muted-foreground/70">{c.primary_contact_email}</p>
                  </td>
                  <td className="px-5 py-3"><span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{c.status}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{c.ghl_contact_id || c.ghl_opportunity_id ? 'Linked' : '—'}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{new Date(c.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}