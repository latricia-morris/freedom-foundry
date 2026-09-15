import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Layers3, Plus, Shield, Sparkles, X } from 'lucide-react';
import apiClient from '@/api/client';

const STATUS_LABELS = {
  draft: 'Draft',
  ready_to_invite: 'Ready to invite',
  invited: 'Invited',
  claimed: 'Claimed',
};

const STATUS_STYLES = {
  draft: 'border-border bg-muted/60 text-muted-foreground',
  ready_to_invite: 'border-primary/30 bg-primary/10 text-foreground',
  invited: 'border-border bg-secondary text-secondary-foreground',
  claimed: 'border-primary/40 bg-primary/15 text-foreground',
};

export default function ClientMigrations() {
  const navigate = useNavigate();
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', business_name: '', notes: '' });

  useEffect(() => {
    apiClient.auth.me().then(async (me) => {
      if (me.role !== 'admin') { setDenied(true); setLoading(false); return; }
      try {
        setSetups(await apiClient.admin.listClientSetups());
      } catch (requestError) {
        setError(requestError.message || 'Client setups could not be loaded.');
      }
      setLoading(false);
    }).catch(() => { setDenied(true); setLoading(false); });
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const createSetup = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const created = await apiClient.admin.createClientSetup(form);
      navigate(`/admin/client-setups/${created.id}`);
    } catch (requestError) {
      setError(requestError.message || 'The client setup could not be created.');
    }
    setCreating(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  if (denied) return <div className="py-20 text-center"><Shield className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h1 className="font-heading text-xl text-foreground">Admin Access Required</h1></div>;

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-primary">Client operations</p>
          <h1 className="font-heading text-3xl font-light text-foreground">Prepare client portals <span className="molten-text italic">in minutes</span></h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Stage brand kits, assets, and starter content before a client ever signs in. Drafts stay private until you activate them.</p>
        </div>
        <button onClick={() => setNewOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground">
          <Plus className="h-4 w-4" /> New client setup
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ['No AI required', 'Use your existing notes, links, and brand files.'],
          ['Private by default', 'Nothing is visible to the client until it is claimed.'],
          ['Reusable foundations', 'Apply agency templates instead of recreating starter work.'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
            <Sparkles className="mb-2 h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</p>}

      {newOpen && (
        <form onSubmit={createSetup} className="mb-6 rounded-xl border border-primary/25 bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div><h2 className="font-heading text-lg text-foreground">Start a private client setup</h2><p className="mt-1 text-sm text-muted-foreground">You can load the brand kit now and invite the client only when the portal is ready.</p></div>
            <button type="button" onClick={() => setNewOpen(false)} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={form.first_name} onChange={(event) => update('first_name', event.target.value)} placeholder="First name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
            <input value={form.last_name} onChange={(event) => update('last_name', event.target.value)} placeholder="Last name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
            <input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="Client email address" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary sm:col-span-2" />
            <input value={form.business_name} onChange={(event) => update('business_name', event.target.value)} placeholder="Business name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary sm:col-span-2" />
            <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Internal setup notes (never shown to the client)" rows={2} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary sm:col-span-2" />
          </div>
          <button disabled={creating} className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground disabled:opacity-50">{creating ? 'Creating…' : 'Create private setup'}</button>
        </form>
      )}

      {setups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center"><Layers3 className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><h2 className="font-heading text-xl text-foreground">Your migration workspace is ready</h2><p className="mt-2 text-sm text-muted-foreground">Create the first client setup to start building a private portal from their existing brand materials.</p></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {setups.map((setup) => (
            <Link key={setup.id} to={`/admin/client-setups/${setup.id}`} className="flex items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-0 hover:bg-card/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-primary">{(setup.business_name || setup.first_name || setup.email)[0].toUpperCase()}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{setup.business_name || `${setup.first_name || ''} ${setup.last_name || ''}`.trim() || setup.email}</p><p className="truncate text-xs text-muted-foreground">{setup.email} · {setup.summary.completed_sections}/5 brand sections · {setup.summary.assets} assets</p></div>
              <span className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider sm:inline-flex ${STATUS_STYLES[setup.status] || STATUS_STYLES.draft}`}>{STATUS_LABELS[setup.status] || 'Draft'}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}